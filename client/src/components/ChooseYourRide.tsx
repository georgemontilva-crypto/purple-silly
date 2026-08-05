import { Link } from "wouter";

const C = {
  deep:   "oklch(0.09 0.04 295)",
  dark:   "oklch(0.13 0.05 295)",
  mid:    "oklch(0.20 0.08 295)",
  vivid:  "oklch(0.52 0.28 295)",
  bright: "oklch(0.62 0.28 295)",
  pink:   "oklch(0.72 0.22 320)",
};

const rides = [
  {
    name: "Silly Dots",
    sub: "Hero, Super & Mega Dose",
    desc: "Functional mushroom + nootropic tabs with Lion's Mane, Reishi, Chaga, Cordyceps, L-Theanine, Bacopa & Rhodiola. Available in Mega (1200mg), Hero (1800mg), and Super Dose (2400mg).",
    href: "/collections/dots",
    accent: C.vivid,
    badge: "BEST SELLER",
    imgBg: "linear-gradient(135deg, #374151 0%, #4b5563 100%)",
  },
  {
    name: "Silly Euphoria",
    sub: "Premium Enhanced Gummies",
    desc: "Mood-enhancing euphoria blend crafted for elevated vibes, social ease, and pure good energy. Perfect for any occasion.",
    href: "/collections/all",
    accent: C.pink,
    badge: "NEW",
    imgBg: "linear-gradient(135deg, #4c1d4b 0%, #6b2d6b 100%)",
  },
  {
    name: "Silly Bites Gummies",
    sub: "Cannadelic Microdose",
    desc: "Cannadelic microdose gummies for daily wellness and balanced mood. 10-count pouches for consistent, gentle support.",
    href: "/collections/enhanced-gm",
    accent: "oklch(0.60 0.25 160)",
    badge: "FAN FAVORITE",
    imgBg: "linear-gradient(135deg, #064e3b 0%, #065f46 100%)",
  },
];

export default function ChooseYourRide() {
  return (
    <section className="py-24 px-4" style={{ background: C.deep }}>
      <div className="max-w-[1280px] mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: C.pink }}>Our Products</p>
          <h2 className="text-5xl sm:text-6xl font-extrabold font-condensed text-white leading-tight">
            Choose Your Ride
          </h2>
          <p className="mt-4 text-lg max-w-xl mx-auto" style={{ color: "oklch(0.68 0.07 295)" }}>
            Whether you're looking for a higher-energy, more immersive experience or a balanced, feel-good boost — Purple Organics has a ride for you.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {rides.map((r) => (
            <Link key={r.name} href={r.href}
              className="group relative rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-2 block"
              style={{ background: C.dark, border: `1px solid ${C.mid}` }}>
              {/* Badge */}
              <div className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full text-xs font-extrabold text-white"
                style={{ background: r.accent }}>
                {r.badge}
              </div>
              {/* Gray image placeholder 800×600 (4:3 ratio) */}
              <div
                className="w-full overflow-hidden flex items-center justify-center"
                style={{ aspectRatio: "4/3", background: r.imgBg }}
              >
                <span style={{
                  color: "rgba(255,255,255,0.22)",
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 700,
                  fontSize: "0.8rem",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                }}>
                  800 × 600 px
                </span>
              </div>
              {/* Content */}
              <div className="p-6">
                <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: r.accent }}>{r.sub}</p>
                <h3 className="text-2xl font-extrabold font-condensed text-white mb-2">{r.name}</h3>
                <p className="text-sm leading-relaxed mb-4" style={{ color: "oklch(0.65 0.07 295)" }}>{r.desc}</p>
                <div className="flex items-center gap-2 font-bold text-sm text-white transition-all group-hover:gap-3">
                  <span>Shop Now</span>
                  <span style={{ color: r.accent }}>→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
