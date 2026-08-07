import { useEffect, useState } from "react";
import { Link } from "wouter";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { Variants } from "framer-motion";
import { X } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { ParticleBurst } from "@/components/motion/ParticleBurst";

interface MobileMenuLink {
  label: string;
  href: string;
}

/**
 * Soft decelerate. The long tail is the whole point: the panel arrives
 * quickly and then eases to a stop instead of snapping into place, which is
 * what makes the open read as smooth rather than abrupt.
 */
const EASE_OUT_SOFT = [0.22, 1, 0.36, 1] as const;

// Full-screen mobile nav overlay. Deliberately no social links here — per
// spec this menu is just navigation + the coupon capture field below.
export default function MobileMenu({
  open,
  onClose,
  links,
}: {
  open: boolean;
  onClose: () => void;
  links: MobileMenuLink[];
}) {
  const [email, setEmail] = useState("");
  const createLead = trpc.leads.create.useMutation();

  /**
   * MotionConfig reducedMotion="user" (App.tsx) drops transforms but keeps
   * opacity animations. For a full-screen takeover that's still a lot of
   * movement of light, so this cuts the whole sequence to zero instead —
   * the menu simply appears.
   */
  const reduceMotion = useReducedMotion() ?? false;

  // Lock body scroll while the overlay is open.
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  /**
   * The backdrop fades, and everything on top of it rises into place on a
   * stagger just behind it (`delayChildren`), so the panel reads as one
   * movement settling rather than a stack of elements arriving at once.
   * Exit is deliberately quicker than entry — a slow dismissal feels
   * unresponsive, a slow arrival feels considered.
   */
  const overlayVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: reduceMotion ? 0 : 0.42,
        ease: EASE_OUT_SOFT,
        delayChildren: reduceMotion ? 0 : 0.1,
        staggerChildren: reduceMotion ? 0 : 0.055,
      },
    },
    exit: {
      opacity: 0,
      transition: { duration: reduceMotion ? 0 : 0.26, ease: "easeIn" },
    },
  };

  const itemVariants: Variants = {
    hidden: reduceMotion ? { opacity: 1 } : { opacity: 0, y: 18 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: reduceMotion ? 0 : 0.5, ease: EASE_OUT_SOFT },
    },
    exit: reduceMotion
      ? { opacity: 1 }
      : { opacity: 0, y: 6, transition: { duration: 0.16, ease: "easeIn" } },
  };

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    createLead.mutate(
      { email: email.trim(), source: "mobile-menu-coupon" },
      {
        onSuccess: () => {
          toast.success("Thanks! We'll email your coupon shortly.");
          setEmail("");
        },
        onError: () => {
          toast.error("Something went wrong. Please try again.");
        },
      }
    );
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="flex md:hidden flex-col"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 300,
            background: "oklch(0.07 0.04 295)",
            // Inert while fading out: AnimatePresence keeps the overlay mounted
            // through its exit, and a full-screen layer that still swallows taps
            // for a quarter second after "close" feels broken.
            pointerEvents: open ? "auto" : "none",
          }}
        >
          {/* One-shot spark burst near the close button's corner — the overlay's
          subtree only exists while `open` is true, so AnimatePresence gives
          this a fresh mount every time the menu opens. */}
          <ParticleBurst originX="88%" originY="7%" />

          {/* Header: close button */}
          <motion.div
            variants={itemVariants}
            style={{
              display: "flex",
              justifyContent: "flex-end",
              padding: "1.25rem",
            }}
          >
            <button
              onClick={onClose}
              aria-label="Close menu"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 44,
                height: 44,
                borderRadius: "999px",
                background: "oklch(0.16 0.06 295)",
                border: "1px solid oklch(0.28 0.09 295)",
                color: "white",
                cursor: "pointer",
              }}
            >
              <X size={20} />
            </button>
          </motion.div>

          {/* Links. Each row is its own variant child, so they arrive one after
          the other on the parent's stagger instead of all together. */}
          <nav
            style={{ flex: 1, overflowY: "auto", padding: "0.5rem 1.75rem" }}
          >
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {links.map((link, i) => (
                <motion.li
                  key={link.href}
                  variants={itemVariants}
                  style={{
                    borderBottom:
                      i < links.length - 1
                        ? "1px solid oklch(0.20 0.06 295 / 0.6)"
                        : "none",
                  }}
                >
                  <Link
                    href={link.href}
                    onClick={onClose}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      minHeight: 60,
                      color: "white",
                      textDecoration: "none",
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontWeight: 800,
                      fontSize: "2rem",
                      letterSpacing: "0.01em",
                    }}
                  >
                    {link.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </nav>

          {/* Coupon email capture — visual only for now */}
          <motion.form
            variants={itemVariants}
            onSubmit={handleSubmit}
            style={{
              padding: "1.5rem 1.75rem 2rem",
              borderTop: "1px solid oklch(0.20 0.06 295 / 0.6)",
            }}
          >
            <p
              style={{
                color: "oklch(0.65 0.10 295)",
                fontSize: "0.8rem",
                fontWeight: 600,
                margin: "0 0 0.75rem",
              }}
            >
              Get a discount coupon
            </p>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@email.com"
                style={{
                  flex: 1,
                  minHeight: 48,
                  padding: "0 1rem",
                  borderRadius: "999px",
                  background: "oklch(0.14 0.05 295)",
                  border: "1px solid oklch(0.28 0.09 295)",
                  color: "white",
                  fontSize: "0.95rem",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
              <button
                type="submit"
                style={{
                  minHeight: 48,
                  padding: "0 1.5rem",
                  borderRadius: "999px",
                  background:
                    "linear-gradient(135deg, oklch(0.62 0.28 295), oklch(0.72 0.22 320))",
                  border: "none",
                  color: "white",
                  fontWeight: 800,
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                Submit
              </button>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
