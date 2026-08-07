import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import AuthShell, {
  AuthError,
  AuthField,
  AuthSubmit,
} from "@/components/auth/AuthShell";

export default function Login() {
  const [location, setLocation] = useLocation();
  const utils = trpc.useUtils();
  const { data: user, isLoading } = trpc.auth.me.useQuery();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = trpc.auth.login.useMutation({
    onSuccess: async () => {
      await utils.auth.me.invalidate();
      const me = await utils.auth.me.fetch();
      setLocation(me?.role === "admin" ? "/admin" : "/");
    },
  });

  // Already signed in — no need to show the form.
  useEffect(() => {
    if (!isLoading && user && location === "/login") {
      setLocation(user.role === "admin" ? "/admin" : "/");
    }
  }, [isLoading, user, location, setLocation]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate({ email, password });
  };

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Sign in"
      subtitle="Pick up where you left off — orders, offers and your account."
      footer={
        <>
          New here? <Link href="/signup">Create an account</Link>
        </>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <AuthField
          id="login-email"
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
          id="login-password"
          label="Password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          required
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        {/* One message for both "no such account" and "wrong password" —
            the server answers the same way for the same reason: telling
            them apart turns the form into an account-existence oracle. */}
        {login.isError && <AuthError>Invalid email or password.</AuthError>}

        <AuthSubmit disabled={login.isPending}>
          {login.isPending ? "Signing in…" : "Sign in"}
        </AuthSubmit>
      </form>
    </AuthShell>
  );
}
