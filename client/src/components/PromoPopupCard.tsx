import { Check, Copy, X } from "lucide-react";

export type PromoPopupMode = "form" | "code";

export interface PromoPopupCardProps {
  title: string;
  subtitle?: string | null;
  bodyText?: string | null;
  discountCode: string;
  buttonText: string;
  imageUrl?: string | null;
  /** "form" asks for an email; "code" reveals the discount code. */
  mode: PromoPopupMode;
  onClose?: () => void;

  // form mode
  email?: string;
  onEmailChange?: (value: string) => void;
  onSubmit?: (e: React.FormEvent) => void;
  submitting?: boolean;

  // code mode
  onCopy?: () => void;
  copied?: boolean;
  /** Adds the "thanks for subscribing" line after a successful signup. */
  thanks?: boolean;

  error?: string | null;
  /**
   * Renders the card as a non-interactive mock. Used by the admin
   * preview, where submitting the form or copying a code makes no sense.
   */
  preview?: boolean;
}

/**
 * The popup's visual body — everything inside the dialog, and nothing
 * about when or whether it's shown.
 *
 * Split out so /admin's "preview before saving" renders the SAME markup
 * and stylesheet as the live popup instead of a lookalike. A separate
 * preview implementation drifts the moment either side is touched, and a
 * preview that lies is worse than no preview.
 */
export default function PromoPopupCard({
  title,
  subtitle,
  bodyText,
  discountCode,
  buttonText,
  imageUrl,
  mode,
  onClose,
  email = "",
  onEmailChange,
  onSubmit,
  submitting = false,
  onCopy,
  copied = false,
  thanks = false,
  error = null,
  preview = false,
}: PromoPopupCardProps) {
  return (
    <>
      <button
        type="button"
        className="promo-close"
        onClick={onClose}
        aria-label="Cerrar"
        tabIndex={preview ? -1 : undefined}
      >
        <X size={20} aria-hidden="true" />
      </button>

      <div className="promo-dialog__content">
        <span className="promo-eyebrow">Oferta exclusiva</span>
        <h2 className="promo-title" id="promo-popup-title">
          {title}
        </h2>
        {subtitle && <p className="promo-subtitle">{subtitle}</p>}
        {bodyText && <p className="promo-body">{bodyText}</p>}

        {mode === "code" ? (
          <>
            <div className="promo-code">
              <span className="promo-code__value">{discountCode}</span>
              <button
                type="button"
                className={`promo-code__copy${copied ? " promo-code__copy--done" : ""}`}
                onClick={onCopy}
                tabIndex={preview ? -1 : undefined}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? "Copiado" : "Copiar"}
              </button>
            </div>
            <p className="promo-fineprint">
              Usa este código al pagar.{thanks ? " ¡Gracias por suscribirte!" : ""}
            </p>
            {error && <p className="promo-error">{error}</p>}
          </>
        ) : (
          <form
            className="promo-form"
            onSubmit={preview ? e => e.preventDefault() : onSubmit}
            noValidate
          >
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
              onChange={e => onEmailChange?.(e.target.value)}
              aria-invalid={error ? true : undefined}
              readOnly={preview}
              tabIndex={preview ? -1 : undefined}
            />
            {error && <p className="promo-error">{error}</p>}
            <button
              type="submit"
              className="promo-button"
              disabled={submitting}
              tabIndex={preview ? -1 : undefined}
            >
              {submitting ? "Enviando..." : buttonText}
            </button>
            <p className="promo-fineprint">
              Te enviaremos ofertas ocasionales. Puedes darte de baja cuando quieras.
            </p>
          </form>
        )}
      </div>

      {imageUrl && (
        <div className="promo-dialog__media">
          <img src={imageUrl} alt="" aria-hidden="true" />
        </div>
      )}
    </>
  );
}
