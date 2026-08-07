import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import PromoPopupCard from "./PromoPopupCard";
import "./PromoPopup.css";

/**
 * sessionStorage, not localStorage: "don't show it again" is meant to
 * last for this browser session only, so the popup gets another chance on
 * the visitor's next visit. Keyed by popup id so that swapping which
 * popup is active in the admin shows the new one even to someone who
 * already dismissed the old one in the same session.
 */
const dismissKey = (id: number) => `purple:promo-popup-dismissed:${id}`;

function wasDismissed(id: number): boolean {
  try {
    return sessionStorage.getItem(dismissKey(id)) === "1";
  } catch {
    // Safari in private mode throws on storage access. Failing "not
    // dismissed" is the safe default — worst case the popup reappears.
    return false;
  }
}

function markDismissed(id: number): void {
  try {
    sessionStorage.setItem(dismissKey(id), "1");
  } catch {
    /* storage unavailable — nothing to persist to, carry on */
  }
}

/**
 * The storefront discount popup. Renders whatever popup the admin has
 * marked active, after its configured delay, once per browser session.
 *
 * Two shapes depending on session, per spec:
 * - anonymous  -> email field; submitting records a lead, then reveals
 *                 the code
 * - signed in  -> no email asked (we already have theirs); the code is
 *                 shown straight away
 */
export default function PromoPopup() {
  const { data: popup } = trpc.promoPopups.active.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });
  const { isAuthenticated, loading: authLoading } = useAuth();
  const createLead = trpc.leads.create.useMutation();

  /**
   * MotionConfig reducedMotion="user" (App.tsx) is not enough on its own
   * here: it drops transform and layout animations but deliberately KEEPS
   * opacity ones, on the reasoning that a cross-fade isn't vestibular.
   * Measured, the dialog still faded in from opacity 0 under
   * prefers-reduced-motion. The spec for this popup is "no animation", so
   * the fade is cut explicitly too — initial={false} tells framer-motion
   * to mount straight at the animate values with no enter transition.
   */
  const reduceMotion = useReducedMotion() ?? false;

  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  // Open on the timer. Waits for the auth check so the popup doesn't
  // flash the email field at someone who's actually signed in.
  useEffect(() => {
    if (!popup || authLoading) return;
    if (wasDismissed(popup.id)) return;
    const timer = window.setTimeout(
      () => setOpen(true),
      Math.max(0, popup.showDelaySeconds) * 1000
    );
    return () => window.clearTimeout(timer);
  }, [popup, authLoading]);

  const close = () => {
    if (popup) markDismissed(popup.id);
    setOpen(false);
  };

  // Escape to close, and hold focus inside the dialog while it's open.
  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        close();
        return;
      }
      if (e.key !== "Tab") return;
      const focusables = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusables || focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    // overflowY specifically, never the `overflow` shorthand: body carries
    // an overflow-x: hidden that the shorthand would wipe out (see the
    // note on body in index.css).
    const previousOverflowY = document.body.style.overflowY;
    document.body.style.overflowY = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflowY = previousOverflowY;
      previouslyFocused.current?.focus?.();
    };
    // `close` is stable enough here — it only reads popup, which can't
    // change while the dialog is open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Focus the dialog itself, not a control inside it. Focusing the email
  // input would pop the keyboard open on mobile the instant the popup
  // appears; focusing the close button leaves a focus ring sitting on the
  // X. The container gives screen readers the dialog context either way,
  // and Tab moves from here into the content.
  useEffect(() => {
    if (!open) return;
    dialogRef.current?.focus();
  }, [open]);

  if (!popup) return null;

  const showCode = isAuthenticated || submitted;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const trimmed = email.trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(trimmed)) {
      setError("Please enter a valid email address.");
      return;
    }
    try {
      // Reuses the existing leads endpoint and table, tagged with its own
      // source so popup signups are distinguishable in /admin -> Leads.
      await createLead.mutateAsync({ email: trimmed, source: "popup" });
      setSubmitted(true);
      if (popup) markDismissed(popup.id);
    } catch {
      setError("We couldn't save your email. Please try again.");
    }
  }

  async function handleCopy() {
    if (!popup?.discountCode) return;
    try {
      await navigator.clipboard.writeText(popup.discountCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Couldn't copy. Please select the code manually.");
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="promo-overlay"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.22, ease: "easeOut" }}
          // Click outside closes. Checking the target IS the overlay (not
          // a descendant) means a click that started inside the dialog
          // and drifted out doesn't count.
          onMouseDown={e => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <motion.div
            ref={dialogRef}
            className={
              "promo-dialog" +
              (popup.imageUrl ? "" : " promo-dialog--no-image") +
              (popup.ribbonText?.trim() ? " promo-dialog--ribbon" : "")
            }
            role="dialog"
            aria-modal="true"
            aria-labelledby="promo-popup-title"
            tabIndex={-1}
            initial={reduceMotion ? false : { opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.96 }}
            transition={
              reduceMotion ? { duration: 0 } : { duration: 0.26, ease: [0.23, 1, 0.32, 1] }
            }
          >
            <PromoPopupCard
              title={popup.title}
              subtitle={popup.subtitle}
              bodyText={popup.bodyText}
              discountCode={popup.discountCode}
              buttonText={popup.buttonText}
              ribbonText={popup.ribbonText}
              imageUrl={popup.imageUrl}
              mode={showCode ? "code" : "form"}
              onClose={close}
              email={email}
              onEmailChange={setEmail}
              onSubmit={handleSubmit}
              submitting={createLead.isPending}
              onCopy={handleCopy}
              copied={copied}
              thanks={submitted}
              error={error}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
