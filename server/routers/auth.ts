import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createSessionToken, hashPassword, verifyPassword } from "../_core/auth";
import { getSessionCookieOptions } from "../_core/cookies";
import { publicProcedure, router } from "../_core/trpc";
import { sendVerificationEmail } from "../_core/email";
import { createEmailVerificationToken, consumeEmailVerificationToken } from "../_core/emailVerification";
import { enforceRateLimit, getClientIp } from "../_core/rateLimit";
import * as db from "../db";

export const authRouter = router({
  me: publicProcedure.query(opts => opts.ctx.user),

  login: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      enforceRateLimit(`login:${getClientIp(ctx.req)}`, 10, 15 * 60 * 1000);

      const user = await db.getUserByEmail(input.email.toLowerCase());
      const valid = user ? await verifyPassword(input.password, user.passwordHash) : false;

      if (!user || !valid) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password" });
      }

      await db.touchLastSignedIn(user.id);

      const token = await createSessionToken(user.id, ONE_YEAR_MS);
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      return { success: true } as const;
    }),

  // Public signup — role is never accepted as input, so there is no code
  // path where a caller can register themselves as admin.
  signup: publicProcedure
    .input(
      z.object({
        name: z.string().min(1).max(256),
        email: z.string().email(),
        password: z.string().min(8).max(200),
      })
    )
    .mutation(async ({ input, ctx }) => {
      enforceRateLimit(`signup:${getClientIp(ctx.req)}`, 5, 60 * 60 * 1000);

      const email = input.email.toLowerCase();
      const existing = await db.getUserByEmail(email);
      if (existing) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "An account with this email already exists." });
      }

      const passwordHash = await hashPassword(input.password);
      const user = await db.createUser({
        email,
        passwordHash,
        name: input.name,
        role: "user",
      });
      if (!user) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Could not create account" });
      }

      const token = await createEmailVerificationToken(user.id);
      const origin = `${ctx.req.protocol}://${ctx.req.get("host")}`;
      await sendVerificationEmail(user.email, `${origin}/verify-email?token=${token}`);

      // Verification is a reminder, not a gate — log the new account in
      // immediately (see Fase 3 decision: no Resend yet, so blocking login
      // on verification would lock every public signup out).
      await db.touchLastSignedIn(user.id);
      const sessionToken = await createSessionToken(user.id, ONE_YEAR_MS);
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      return { success: true } as const;
    }),

  verifyEmail: publicProcedure
    .input(z.object({ token: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const result = await consumeEmailVerificationToken(input.token);
      if (!result.ok) {
        throw new TRPCError({ code: "BAD_REQUEST", message: result.error });
      }
      return { success: true } as const;
    }),

  logout: publicProcedure.mutation(({ ctx }) => {
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    return {
      success: true,
    } as const;
  }),
});
