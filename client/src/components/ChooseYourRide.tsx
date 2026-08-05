import { Link } from "wouter";

const BLUE_RAZZ = "/manus-storage/SuperSillyDotsbluerazz_582d558a.webp";
const CHERRY    = "/manus-storage/SuperSillyDotsCherryBerry_44c53bd2.webp";
const NATURAL   = "/manus-storage/SuperSillyDotsnatural_d5a216cf.webp";

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
    name: "Super Silly Dots",
    sub: "Party Tablets",
    desc: "High-energy Kanna tablets for late-night socializing and elevated euphoria. 2400mg per chewable tab.",
    image: NATURAL,
    href: "/collections/kanna-tablets",
    accent: C.vivid,
    badge: "BEST SELLER",
  },
  {
    name: "Blue Razz Dots",
    sub: "Daily Mood Gummies",
    desc: "Smooth daily Kanna for balanced mood, social ease, and sharp focus throughout the day.",
    image: BLUE_RAZZ,
    href: "/collections/kanna-gummies",
    accent: C.pink,
    badge: "NEW",
  },
  {
    name: "Cherry Berry Dots",
    sub: "Party Tablets",
    desc: "Bold cherry-berry flavor with the same powerful Kanna formula. Perfect for social adventures.",
    image: CHERRY,
    href: "/collections/kanna-tablets",
    accent: "oklch(0.60 0.25 15)",
    badge: "FAN FAVORITE",
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
              {/* Image */}
              <div className="aspect-square overflow-hidden flex items-center justify-center p-8"
                style={{ background: `radial-gradient(circle at center, ${r.accent}20, ${C.dark})` }}>
                <img src={r.image} alt={r.name}
                  className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
                  style={{ filter: `drop-shadow(0 16px 40px ${r.accent}60)` }} />
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

