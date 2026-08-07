import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { MailCheck } from "lucide-react";
import { trpc } from "@/lib/trpc";
import AuthShell, {
  AuthError,
  AuthField,
  AuthSubmit,
} from "@/components/auth/AuthShell";

export default function Signup() {
  const [location, setLocation] = useLocation();
  const utils = trpc.useUtils();
  const { data: user, isLoading } = trpc.auth.me.useQuery();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [fieldError, setFieldError] = useState<{
    password?: string;
    confirm?: string;
  }>({});
  const [done, setDone] = useState(false);

  const signup = trpc.auth.signup.useMutation({
    onSuccess: async () => {
      // The account is created AND signed in server-side, so the session is
      // already live — refresh it, then hold on the "check your inbox"
      // panel instead of bouncing straight to the store. The verification
      // mail the server just sent is the whole reason to pause here; a
      // redirect would bury it.
      await utils.auth.me.invalidate();
      setDone(true);
    },
  });

  // Already signed in — no need to show the form. Skipped once the signup
  // succeeds, since by then `me` IS this new user and the redirect would
  // yank the confirmation panel out from under them.
  useEffect(() => {
    if (!done && !isLoading && user && location === "/signup") {
      setLocation(user.role === "admin" ? "/admin" : "/");
    }
  }, [done, isLoading, user, location, setLocation]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Checked here rather than only on the server: the server has no idea
    // what the visitor typed twice, and password length is worth catching
    // before a round trip.
    const errors: { password?: string; confirm?: string } = {};
    if (password.length < 8) errors.password = "Use at least 8 characters.";
    if (password !== confirm) errors.confirm = "Passwords don't match.";
    setFieldError(errors);
    if (Object.keys(errors).length > 0) return;

    signup.mutate({ name: name.trim(), email: email.trim(), password });
  };

  if (done) {
    return (
      <AuthShell
        eyebrow="You're in"
        title="Check your inbox"
        footer={
          <>
            Didn't get it? Check your spam folder, or{" "}
            <Link href="/">head back to the store</Link> — you're already signed
            in.
          </>
        }
      >
        <div className="auth-sent">
          <span className="auth-sent__icon">
            <MailCheck size={28} aria-hidden="true" />
          </span>
          <p className="auth-subtitle" style={{ margin: 0 }}>
            We sent a verification link to
            <br />
            <span className="auth-sent__mail">{email.trim()}</span>
          </p>
          <p className="auth-hint">
            Verifying confirms the address is yours. Your account is active
            either way — you can keep shopping now.
          </p>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      eyebrow="Join the club"
      title="Create account"
      subtitle="Track your orders, save your details and get member-only offers."
      footer={
        <>
          Already have an account? <Link href="/login">Sign in</Link>
        </>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <AuthField
          id="signup-name"
          label="Name"
          type="text"
          autoComplete="name"
          placeholder="Your name"
          required
          maxLength={256}
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <AuthField
          id="signup-email"
          label="Email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@email.com"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <AuthField
          id="signup-password"
          label="Password"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          required
          minLength={8}
          hint="At least 8 characters."
          error={fieldError.password}
          value={password}
          onChange={e => {
            setPassword(e.target.value);
            if (fieldError.password)
              setFieldError(f => ({ ...f, password: undefined }));
          }}
        />
        <AuthField
          id="signup-confirm"
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          required
          error={fieldError.confirm}
          value={confirm}
          onChange={e => {
            setConfirm(e.target.value);
            if (fieldError.confirm)
              setFieldError(f => ({ ...f, confirm: undefined }));
          }}
        />

        {signup.isError && <AuthError>{signup.error.message}</AuthError>}

        <AuthSubmit disabled={signup.isPending}>
          {signup.isPending ? "Creating account…" : "Create account"}
        </AuthSubmit>
      </form>
    </AuthShell>
  );
}
