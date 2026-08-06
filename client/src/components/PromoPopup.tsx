import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, X } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
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
      setError("Escribe un correo válido.");
      return;
    }
    try {
      // Reuses the existing leads endpoint and table, tagged with its own
      // source so popup signups are distinguishable in /admin -> Leads.
      await createLead.mutateAsync({ email: trimmed, source: "popup" });
      setSubmitted(true);
      if (popup) markDismissed(popup.id);
    } catch {
      setError("No pudimos guardar tu correo. Inténtalo de nuevo.");
    }
  }

  async function handleCopy() {
    if (!popup?.discountCode) return;
    try {
      await navigator.clipboard.writeText(popup.discountCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("No se pudo copiar. Selecciona el código manualmente.");
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="promo-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          // Click outside closes. Checking the target IS the overlay (not
          // a descendant) means a click that started inside the dialog
          // and drifted out doesn't count.
          onMouseDown={e => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <motion.div
            ref={dialogRef}
            className={`promo-dialog${popup.imageUrl ? "" : " promo-dialog--no-image"}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="promo-popup-title"
            tabIndex={-1}
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.26, ease: [0.23, 1, 0.32, 1] }}
          >
            <button
              type="button"
              className="promo-close"
              onClick={close}
              aria-label="Cerrar"
            >
              <X size={20} aria-hidden="true" />
            </button>

            <div className="promo-dialog__content">
              <span className="promo-eyebrow">Oferta exclusiva</span>
              <h2 className="promo-title" id="promo-popup-title">
                {popup.title}
              </h2>
              {popup.subtitle && <p className="promo-subtitle">{popup.subtitle}</p>}
              {popup.bodyText && <p className="promo-body">{popup.bodyText}</p>}

              {showCode ? (
                <>
                  <div className="promo-code">
                    <span className="promo-code__value">{popup.discountCode}</span>
                    <button
                      type="button"
                      className={`promo-code__copy${copied ? " promo-code__copy--done" : ""}`}
                      onClick={handleCopy}
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                      {copied ? "Copiado" : "Copiar"}
                    </button>
                  </div>
                  <p className="promo-fineprint">
                    Usa este código al pagar. {submitted && "¡Gracias por suscribirte!"}
                  </p>
                  {error && <p className="promo-error">{error}</p>}
                </>
              ) : (
                <form className="promo-form" onSubmit={handleSubmit} noValidate>
                  <label className="sr-only" htmlFor="promo-popup-email">
                    Correo electrónico
                  </label>
                  <input
                    id="promo-popup-email"
                    className="promo-input"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="tu@correo.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    aria-invalid={error ? true : undefined}
                  />
                  {error && <p className="promo-error">{error}</p>}
                  <button
                    type="submit"
                    className="promo-button"
                    disabled={createLead.isPending}
                  >
                    {createLead.isPending ? "Enviando..." : popup.buttonText}
                  </button>
                  <p className="promo-fineprint">
                    Te enviaremos ofertas ocasionales. Puedes darte de baja cuando
                    quieras.
                  </p>
                </form>
              )}
            </div>

            {popup.imageUrl && (
              <div className="promo-dialog__media">
                <img src={popup.imageUrl} alt="" aria-hidden="true" />
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
