import { useEffect, useRef } from "react";
import { Link } from "wouter";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Minus, Package, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { formatCents, useCart } from "@/contexts/CartContext";
import "./CartDrawer.css";

/**
 * The cart, as a right-hand slide-over.
 *
 * Everything in here is real except the last step: quantities, removal and
 * the running subtotal all work against the persisted cart. Checkout is
 * deliberately inert until payments exist — and it says so on the button
 * rather than looking clickable and doing nothing.
 */
export default function CartDrawer() {
  const {
    lines,
    isOpen,
    closeCart,
    updateQuantity,
    removeItem,
    subtotalCents,
    totalQuantity,
  } = useCart();
  const reduceMotion = useReducedMotion() ?? false;
  const panelRef = useRef<HTMLDivElement>(null);

  // Escape closes, focus stays inside, and the page behind doesn't scroll.
  useEffect(() => {
    if (!isOpen) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        closeCart();
        return;
      }
      if (e.key !== "Tab") return;
      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
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
    // an overflow-x: hidden that the shorthand would wipe out (see the note
    // on body in index.css).
    const previousOverflowY = document.body.style.overflowY;
    document.body.style.overflowY = "hidden";
    panelRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflowY = previousOverflowY;
      previouslyFocused?.focus?.();
    };
  }, [isOpen, closeCart]);

  const ease = [0.22, 1, 0.36, 1] as const;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="cart-overlay"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.25, ease: "easeOut" }}
          // Checking the target IS the overlay means a drag that started
          // inside the panel and ended outside doesn't count as "click out".
          onMouseDown={e => {
            if (e.target === e.currentTarget) closeCart();
          }}
        >
          <motion.aside
            ref={panelRef}
            className="cart-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Shopping cart"
            tabIndex={-1}
            initial={reduceMotion ? false : { x: "100%" }}
            animate={{ x: 0 }}
            exit={reduceMotion ? { x: 0 } : { x: "100%" }}
            transition={
              reduceMotion ? { duration: 0 } : { duration: 0.34, ease }
            }
          >
            <header className="cart-head">
              <h2 className="cart-head__title">
                <ShoppingBag size={18} aria-hidden="true" />
                Your cart
                {totalQuantity > 0 && (
                  <span className="cart-head__count">{totalQuantity}</span>
                )}
              </h2>
              <button
                type="button"
                className="cart-close"
                onClick={closeCart}
                aria-label="Close cart"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </header>

            {lines.length === 0 ? (
              <div className="cart-empty">
                <span className="cart-empty__icon">
                  <Package size={30} aria-hidden="true" />
                </span>
                <p className="cart-empty__title">Your cart is empty</p>
                <p className="cart-empty__text">
                  Nothing in here yet — go find something good.
                </p>
                <Link
                  href="/collections/all"
                  className="cart-empty__cta"
                  onClick={closeCart}
                >
                  Shop products
                </Link>
              </div>
            ) : (
              <>
                <ul className="cart-lines">
                  {lines.map(line => (
                    <li key={line.id} className="cart-line">
                      <div className="cart-line__media">
                        {line.imageUrl ? (
                          <img src={line.imageUrl} alt="" aria-hidden="true" />
                        ) : (
                          <Package size={20} aria-hidden="true" />
                        )}
                      </div>

                      <div className="cart-line__body">
                        <Link
                          href={`/products/${line.slug}`}
                          className="cart-line__title"
                          onClick={closeCart}
                        >
                          {line.title}
                        </Link>

                        {(line.variantTitle || line.bundleLabel) && (
                          <p className="cart-line__meta">
                            {[line.variantTitle, line.bundleLabel]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                        )}

                        <p className="cart-line__price">
                          {formatCents(line.unitPriceCents)}
                          <span> each</span>
                        </p>

                        <div className="cart-line__actions">
                          <div className="cart-stepper">
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(line.id, line.quantity - 1)
                              }
                              aria-label={`Decrease quantity of ${line.title}`}
                            >
                              <Minus size={14} aria-hidden="true" />
                            </button>
                            <span aria-live="polite">{line.quantity}</span>
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(line.id, line.quantity + 1)
                              }
                              aria-label={`Increase quantity of ${line.title}`}
                            >
                              <Plus size={14} aria-hidden="true" />
                            </button>
                          </div>

                          <button
                            type="button"
                            className="cart-line__remove"
                            onClick={() => removeItem(line.id)}
                            aria-label={`Remove ${line.title} from cart`}
                          >
                            <Trash2 size={15} aria-hidden="true" />
                          </button>
                        </div>
                      </div>

                      <p className="cart-line__total">
                        {formatCents(line.unitPriceCents * line.quantity)}
                      </p>
                    </li>
                  ))}
                </ul>

                <footer className="cart-foot">
                  <div className="cart-total">
                    <span>Subtotal</span>
                    <strong>{formatCents(subtotalCents)}</strong>
                  </div>
                  <p className="cart-foot__note">
                    Shipping and taxes calculated at checkout.
                  </p>
                  {/*
                    Disabled on purpose, and labelled as such. Payments
                    don't exist yet; a live-looking button that silently
                    does nothing is worse than one that says why.
                  */}
                  <button
                    type="button"
                    className="cart-checkout"
                    disabled
                    title="Checkout coming soon"
                  >
                    Checkout coming soon
                  </button>
                </footer>
              </>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
