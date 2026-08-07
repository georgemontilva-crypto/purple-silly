import { useState } from "react";
import { toast } from "sonner";

const C = {
  dark: "oklch(0.13 0.05 295)",
  mid: "oklch(0.20 0.08 295)",
  vivid: "oklch(0.52 0.28 295)",
  bright: "oklch(0.62 0.28 295)",
  pink: "oklch(0.72 0.22 320)",
};

/**
 * Palette for the light-lilac panel variant.
 *
 * #ECB3FF is a light surface, so every piece of type on it is a deep
 * violet rather than the white used on the dark full-width version.
 * Measured in the browser against this exact background: heading 9.04:1,
 * body 6.5:1, fine print 5.33:1 — all past WCAG AA, which the white from
 * the dark variant (1.7:1) is nowhere near.
 */
const PANEL = {
  bg: "#ECB3FF",
  ink: "#2E1065",
  body: "#4C1D95",
  fine: "#5B21B6",
};

export type NewsletterVariant = "section" | "panel";

export default function NewsletterSection({
  variant = "section",
}: {
  /**
   * "section" is the standalone full-bleed band used at the bottom of
   * /collections, /products/* and /pages/faq. "panel" is the boxed lilac
   * card that sits beside the FAQ on the home page.
   */
  variant?: NewsletterVariant;
}) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const isPanel = variant === "panel";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setEmail("");
      toast.success("You're on the list! 🎉", {
        description: "Check your inbox for a welcome gift.",
      });
    }, 800);
  };

  const body = (
    <>
      <p
        className="text-sm font-bold uppercase tracking-widest mb-3"
        style={{ color: isPanel ? PANEL.body : C.pink }}
      >
        Stay in the Loop
      </p>
      <h2
        className={`font-extrabold font-condensed mb-4 ${
          isPanel ? "text-3xl sm:text-4xl" : "text-4xl sm:text-5xl text-white"
        }`}
        style={isPanel ? { color: PANEL.ink } : undefined}
      >
        Join the Purple Family
      </h2>
      <p
        className="text-base leading-relaxed mb-8"
        style={{ color: isPanel ? PANEL.body : "oklch(0.68 0.07 295)" }}
      >
        Get exclusive deals, new flavor drops, and Silly Dots education straight
        to your inbox. Plus 20% off your first order.
      </p>

      {/* Stacked in the panel: beside the FAQ the column is far too narrow
          for a side-by-side field and button without one of them clipping. */}
      <form
        onSubmit={handleSubmit}
        className={
          isPanel ? "flex flex-col gap-2.5" : "flex gap-2 max-w-md mx-auto"
        }
      >
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Enter your email"
          aria-label="Email address"
          className={`px-5 py-3.5 rounded-full text-sm font-medium outline-none transition-all ${
            isPanel ? "w-full" : "flex-1 text-white placeholder-white/40"
          }`}
          style={
            isPanel
              ? {
                  background: "#fff",
                  border: "1px solid rgba(46,16,101,0.25)",
                  color: PANEL.ink,
                }
              : { background: C.mid, border: "1px solid oklch(0.30 0.10 295)" }
          }
        />
        <button
          type="submit"
          disabled={loading}
          className={`px-6 py-3.5 rounded-full font-extrabold text-sm text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-60 whitespace-nowrap ${
            isPanel ? "w-full" : ""
          }`}
          style={{
            background: `linear-gradient(135deg, ${C.bright}, ${C.pink})`,
          }}
        >
          {loading ? "..." : "Subscribe"}
        </button>
      </form>

      <p
        className="mt-6 text-xs"
        style={{ color: isPanel ? PANEL.fine : "oklch(0.50 0.06 295)" }}
      >
        By subscribing you agree to our Privacy Policy. Unsubscribe at any time.
      </p>
    </>
  );

  // No h-full on the panel: stretched to match the FAQ column, it left a
  // few hundred pixels of empty lilac under the form. It hugs its content
  // and sits at the top of the column instead (the grid is items-start).
  if (isPanel) {
    return (
      <div className="rounded-3xl p-7 sm:p-9" style={{ background: PANEL.bg }}>
        {body}
      </div>
    );
  }

  return (
    <section className="py-24 px-4" style={{ background: C.dark }}>
      <div className="max-w-[680px] mx-auto text-center">{body}</div>
    </section>
  );
}
