import { Link } from "wouter";

const C = {
  deep:   "oklch(0.09 0.04 295)",
  mid:    "oklch(0.20 0.08 295)",
  vivid:  "oklch(0.52 0.28 295)",
  bright: "oklch(0.62 0.28 295)",
  pink:   "oklch(0.72 0.22 320)",
  yellow: "oklch(0.88 0.20 95)",
};

export default function HeroSection() {
  return (
    <section className="relative min-h-[88vh] flex items-center overflow-hidden" style={{ background: C.deep }}>
      {/* Full-width background placeholder (replace with real image) */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(135deg, #374151 0%, #4b5563 50%, #6b7280 100%)" }}
      />
      {/* Placeholder label */}
      <div className="absolute inset-0 flex items-center justify-end pr-16 pointer-events-none" style={{ opacity: 0.12 }}>
        <span style={{ color: "white", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "clamp(0.75rem, 2.5vw, 1.5rem)", letterSpacing: "0.15em", textTransform: "uppercase" }}>
          Hero Background Image · 1920 × 1080 px
        </span>
      </div>
      {/* Purple gradient overlay — left side for text legibility */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: `linear-gradient(90deg, ${C.deep}f2 0%, ${C.deep}cc 50%, ${C.deep}44 100%)` }} />

      {/* Content */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 w-full py-24 relative z-10">
        <div className="max-w-[600px] space-y-7">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest"
            style={{ background: `${C.vivid}25`, color: C.pink, border: `1px solid ${C.pink}40` }}>
            ✦ Premium Mushroom Supplements · 21+
          </div>
          {/* Headline */}
          <h1 className="font-extrabold font-condensed text-white leading-[0.92] tracking-tight"
            style={{ fontSize: "clamp(3rem, 7vw, 5.5rem)" }}>
            Get Groovy,<br />
            <span style={{ color: C.pink }}>Stay Purple</span>
          </h1>
          {/* Body */}
          <p className="text-lg leading-relaxed" style={{ color: "oklch(0.78 0.07 295)" }}>
            Super Silly Dots — functional mushroom + nootropic tabs for elevated mood, focus, and sensory awareness.
            Available in <strong style={{ color: "white" }}>Mega (1200mg)</strong>,{" "}
            <strong style={{ color: "white" }}>Hero (1800mg)</strong>, and{" "}
            <strong style={{ color: "white" }}>Super Dose (2400mg)</strong>.
            Lion's Mane · Reishi · Chaga · Cordyceps + L-Theanine · Bacopa · Rhodiola.
          </p>
          {/* Stars */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-4 h-4" fill={C.yellow} viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-sm font-semibold" style={{ color: "oklch(0.78 0.07 295)" }}>
              4.8/5 · Lab Tested · 3 Flavors · $15.95–$28.95
            </span>
          </div>
          {/* CTAs */}
          <div className="flex gap-3 flex-wrap">
            <Link href="/collections/silly-dots"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-extrabold text-base text-white transition-all hover:scale-105 active:scale-95 shadow-xl"
              style={{ background: `linear-gradient(135deg, ${C.bright}, ${C.pink})`, boxShadow: `0 8px 40px ${C.vivid}55` }}>
              SHOP SILLY DOTS →
            </Link>
            <Link href="/shop"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-base text-white transition-all hover:bg-white/10 border"
              style={{ borderColor: "oklch(0.35 0.12 295)" }}>
              Shop All Products
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
