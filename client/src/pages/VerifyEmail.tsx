import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useEffect, useRef } from "react";
import { Link } from "wouter";

export default function VerifyEmail() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token") ?? "";
  const requested = useRef(false);

  const verify = trpc.auth.verifyEmail.useMutation();

  useEffect(() => {
    if (requested.current || !token) return;
    requested.current = true;
    verify.mutate({ token });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  let heading = "Verifying your email...";
  let message = "One moment.";
  if (!token) {
    heading = "Invalid link";
    message = "This verification link is missing a token.";
  } else if (verify.isSuccess) {
    heading = "Email verified";
    message = "Thanks — your email address has been confirmed.";
  } else if (verify.isError) {
    heading = "Verification failed";
    message = verify.error.message;
  }

  return (
    <div className="admin-shell flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
      <div className="w-full max-w-sm space-y-6 text-center">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">{heading}</h1>
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
        <Button asChild className="w-full">
          <Link href="/">Return home</Link>
        </Button>
      </div>
    </div>
  );
}
