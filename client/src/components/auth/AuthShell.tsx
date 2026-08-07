import { Link } from "wouter";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import "./auth.css";

/**
 * The shared frame for every signed-out page (/login, /signup,
 * /verify-email) and for /account.
 *
 * These pages sit outside StorefrontLayout — no Navbar, no Footer — so
 * without a frame of their own they render as a bare form on the default
 * background, which is what they used to be. This gives them the
 * storefront's own language instead: the deep purple field, the magenta
 * glow, Barlow Condensed for the headline.
 */
export default function AuthShell({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const reduceMotion = useReducedMotion() ?? false;

  return (
    <div className="auth-page">
      {/* Background glow. Two blurred blooms behind the card, drifting
          slowly — the same trick the storefront's ambient orbs use. Under
          prefers-reduced-motion they're still there, just still. */}
      <div className="auth-page__glows" aria-hidden="true">
        <motion.span
          className="auth-glow auth-glow--one"
          animate={reduceMotion ? undefined : { x: [0, 28, 0], y: [0, -20, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.span
          className="auth-glow auth-glow--two"
          animate={reduceMotion ? undefined : { x: [0, -24, 0], y: [0, 26, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <motion.main
        className="auth-card"
        initial={reduceMotion ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : { duration: 0.45, ease: [0.22, 1, 0.36, 1] }
        }
      >
        <Link href="/" className="auth-back">
          <ArrowLeft size={15} aria-hidden="true" />
          Back to store
        </Link>

        <Link href="/" className="auth-wordmark">
          PURPLE <span>ORGANICS</span>
        </Link>

        <header className="auth-head">
          {eyebrow && <p className="auth-eyebrow">{eyebrow}</p>}
          <h1 className="auth-title">{title}</h1>
          {subtitle && <p className="auth-subtitle">{subtitle}</p>}
        </header>

        {children}

        {footer && <div className="auth-foot">{footer}</div>}
      </motion.main>
    </div>
  );
}

/** A labelled input. `hint` sits under the field; `error` replaces it. */
export function AuthField({
  id,
  label,
  hint,
  error,
  ...inputProps
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string | null;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="auth-field">
      <label className="auth-label" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className={"auth-input" + (error ? " auth-input--invalid" : "")}
        aria-invalid={error ? true : undefined}
        aria-describedby={
          error ? `${id}-error` : hint ? `${id}-hint` : undefined
        }
        {...inputProps}
      />
      {error ? (
        <p className="auth-field-error" id={`${id}-error`}>
          {error}
        </p>
      ) : (
        hint && (
          <p className="auth-hint" id={`${id}-hint`}>
            {hint}
          </p>
        )
      )}
    </div>
  );
}

export function AuthSubmit({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="submit" className="auth-submit" {...props}>
      {children}
    </button>
  );
}

/**
 * Form-level error. `role="alert"` so it's announced — a failed sign-in
 * that only changes colour is invisible to a screen reader.
 */
export function AuthError({ children }: { children: React.ReactNode }) {
  return (
    <p className="auth-error" role="alert">
      {children}
    </p>
  );
}
