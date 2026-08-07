export interface PromoRibbonProps {
  /** Caption. Blank or absent renders nothing at all. */
  text?: string | null;
  onClick?: () => void;
  /**
   * Renders the band anchored to its containing box instead of the
   * viewport, as a plain non-interactive element. Used by the admin
   * preview, where a fixed corner tab over the whole admin page — and one
   * that opens nothing — would make no sense.
   */
  preview?: boolean;
}

/**
 * The diagonal corner tab that opens the discount popup.
 *
 * It lives OUTSIDE the popup, pinned to the bottom-left corner of the
 * window: it stays put when the popup is closed, so the offer is always one
 * click away instead of being gone for the session after a single dismissal.
 */
export default function PromoRibbon({
  text,
  onClick,
  preview = false,
}: PromoRibbonProps) {
  const caption = text?.trim();
  if (!caption) return null;

  return (
    <div className={"promo-ribbon" + (preview ? " promo-ribbon--preview" : "")}>
      {preview ? (
        <span className="promo-ribbon__band">{caption}</span>
      ) : (
        <button
          type="button"
          className="promo-ribbon__band"
          onClick={onClick}
          aria-haspopup="dialog"
        >
          {caption}
        </button>
      )}
    </div>
  );
}
