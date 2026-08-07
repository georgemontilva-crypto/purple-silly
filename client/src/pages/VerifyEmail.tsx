import { useEffect, useRef } from "react";
import { Link } from "wouter";
import { BadgeCheck, CircleAlert, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import AuthShell from "@/components/auth/AuthShell";

/**
 * Where the link in the verification email lands. Same frame as /login and
 * /signup — this is the last step of that flow, and arriving from an email
 * onto an unbranded page reads as a phishing page rather than the store.
 */
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

  let eyebrow = "Email verification";
  let title = "Verifying…";
  let message = "One moment.";
  let icon = <Loader2 size={28} aria-hidden="true" />;

  if (!token) {
    title = "Invalid link";
    message = "This verification link is missing its token.";
    icon = <CircleAlert size={28} aria-hidden="true" />;
  } else if (verify.isSuccess) {
    eyebrow = "All set";
    title = "Email verified";
    message = "Thanks — your address is confirmed.";
    icon = <BadgeCheck size={28} aria-hidden="true" />;
  } else if (verify.isError) {
    title = "Verification failed";
    message = verify.error.message;
    icon = <CircleAlert size={28} aria-hidden="true" />;
  }

  return (
    <AuthShell
      eyebrow={eyebrow}
      title={title}
      footer={
        <>
          Need a hand? <Link href="/pages/contact">Contact us</Link>
        </>
      }
    >
      <div className="auth-sent">
        <span className="auth-sent__icon">{icon}</span>
        <p className="auth-subtitle" style={{ margin: 0 }} role="status">
          {message}
        </p>
        <Link
          href="/"
          className="auth-submit"
          style={{
            display: "grid",
            placeItems: "center",
            textDecoration: "none",
          }}
        >
          Return to the store
        </Link>
      </div>
    </AuthShell>
  );
}
