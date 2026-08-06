import { useState } from "react";
import { toast } from "sonner";

const C = {
  dark:   "oklch(0.13 0.05 295)",
  mid:    "oklch(0.20 0.08 295)",
  vivid:  "oklch(0.52 0.28 295)",
  bright: "oklch(0.62 0.28 295)",
  pink:   "oklch(0.72 0.22 320)",
};

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setEmail("");
      toast.success("You're on the list! 🎉", { description: "Check your inbox for a welcome gift." });
    }, 800);
  };

  return (
    <section className="py-24 px-4" style={{ background: C.dark }}>
      <div className="max-w-[680px] mx-auto text-center">
        <p className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: C.pink }}>Stay in the Loop</p>
        <h2 className="text-4xl sm:text-5xl font-extrabold font-condensed text-white mb-4">Join the Purple Family</h2>
        <p className="text-base leading-relaxed mb-10" style={{ color: "oklch(0.68 0.07 295)" }}>
          Get exclusive deals, new flavor drops, and Kanna education straight to your inbox. Plus 10% off your first order.
        </p>
        <form onSubmit={handleSubmit} className="flex gap-2 max-w-md mx-auto">
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="flex-1 px-5 py-3.5 rounded-full text-sm font-medium text-white placeholder-white/40 outline-none transition-all"
            style={{ background: C.mid, border: `1px solid oklch(0.30 0.10 295)` }} />
          <button type="submit" disabled={loading}
            className="px-6 py-3.5 rounded-full font-extrabold text-sm text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-60 whitespace-nowrap"
            style={{ background: `linear-gradient(135deg, ${C.bright}, ${C.pink})` }}>
            {loading ? "..." : "Subscribe"}
          </button>
        </form>
        <p className="mt-6 text-xs" style={{ color: "oklch(0.50 0.06 295)" }}>
          By subscribing you agree to our Privacy Policy. Unsubscribe at any time.
        </p>
      </div>
    </section>
  );
}
