import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";

export default function Signup() {
  const [location, setLocation] = useLocation();
  const utils = trpc.useUtils();
  const { data: user, isLoading } = trpc.auth.me.useQuery();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const signup = trpc.auth.signup.useMutation({
    onSuccess: async () => {
      await utils.auth.me.invalidate();
      setLocation("/");
    },
  });

  // Already signed in — no need to show the form.
  useEffect(() => {
    if (!isLoading && user && location === "/signup") {
      setLocation(user.role === "admin" ? "/admin" : "/");
    }
  }, [isLoading, user, location, setLocation]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    signup.mutate({ name, email, password });
  };

  return (
    <div className="admin-shell flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
          <p className="text-sm text-muted-foreground">Join Purple Organics.</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="name" className="text-sm font-medium">
              Name
            </label>
            <Input
              id="name"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">At least 8 characters.</p>
          </div>
        </div>

        {signup.isError && <p className="text-sm text-destructive">{signup.error.message}</p>}

        <Button type="submit" className="w-full" disabled={signup.isPending}>
          {signup.isPending ? "Creating account..." : "Create account"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-foreground underline underline-offset-4">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
