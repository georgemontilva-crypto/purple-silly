import { Link } from "wouter";

const BLUE_RAZZ = "/manus-storage/SuperSillyDotsbluerazz_582d558a.webp";
const CHERRY    = "/manus-storage/SuperSillyDotsCherryBerry_44c53bd2.webp";
const NATURAL   = "/manus-storage/SuperSillyDotsnatural_d5a216cf.webp";

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
    <section className="relative min-h-[88vh] flex items-center overflow-hidden"
      style={{ background: `radial-gradient(ellipse 90% 70% at 70% 40%, oklch(0.22 0.14 295), ${C.deep})` }}>

      {/* Decorative blobs */}
      <div className="absolute top-[-15%] right-[-8%] w-[700px] h-[700px] rounded-full opacity-25 blur-3xl pointer-events-none"
        style={{ background: C.vivid }} />
      <div className="absolute bottom-[-15%] left-[-8%] w-[500px] h-[500px] rounded-full opacity-15 blur-3xl pointer-events-none"
        style={{ background: C.pink }} />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 w-full grid md:grid-cols-2 gap-12 items-center py-20 relative z-10">
        {/* Left — Copy */}
        <div className="space-y-7">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest"
            style={{ background: `${C.vivid}25`, color: C.pink, border: `1px solid ${C.pink}40` }}>
            ✦ Premium Kanna Supplements · 21+
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold font-condensed text-white leading-[0.92] tracking-tight">
            Feel the<br />
            <span style={{ color: C.pink }}>Silly Side</span><br />
            of Life
          </h1>

          <p className="text-lg leading-relaxed max-w-md" style={{ color: "oklch(0.78 0.07 295)" }}>
            Super Silly Dots — chewable Kanna tablets crafted for elevated mood, social ease, and pure good vibes. 2400mg per tab, 6 servings per pack.
          </p>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-4 h-4" fill={C.yellow} viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
              ))}
            </div>
            <span className="text-sm font-semibold" style={{ color: "oklch(0.78 0.07 295)" }}>4.8/5 · Lab Tested · 3 Flavors</span>
          </div>

          <div className="flex gap-3 flex-wrap">
            <Link href="/collections/all"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-extrabold text-base text-white transition-all hover:scale-105 active:scale-95 shadow-xl"
              style={{ background: `linear-gradient(135deg, ${C.bright}, ${C.pink})`, boxShadow: `0 8px 40px ${C.vivid}55` }}>
              SHOP NOW →
            </Link>
            <Link href="/pages/what-is-kanna"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-base text-white transition-all hover:bg-white/10 border"
              style={{ borderColor: "oklch(0.35 0.12 295)" }}>
              What is Kanna?
            </Link>
          </div>
        </div>

        {/* Right — Product showcase */}
        <div className="relative flex items-center justify-center">
          <div className="relative w-full max-w-[460px] aspect-square">
            {/* Main product — center */}
            <div className="absolute inset-0 flex items-center justify-center">
              <img src={NATURAL} alt="Super Silly Dots Natural"
                className="w-[72%] h-[72%] object-contain transition-transform duration-700 hover:scale-105"
                style={{ filter: `drop-shadow(0 24px 64px ${C.vivid}60)` }} />
            </div>
            {/* Top-right: Blue Razz */}
            <div className="absolute top-2 right-0 w-[38%] aspect-square">
              <img src={BLUE_RAZZ} alt="Blue Razz"
                className="w-full h-full object-contain transition-transform duration-500 hover:scale-110 rounded-2xl"
                style={{ filter: `drop-shadow(0 8px 24px oklch(0.45 0.25 240 / 0.5))` }} />
            </div>
            {/* Bottom-left: Cherry Berry */}
            <div className="absolute bottom-2 left-0 w-[34%] aspect-square">
              <img src={CHERRY} alt="Cherry Berry"
                className="w-full h-full object-contain transition-transform duration-500 hover:scale-110 rounded-2xl"
                style={{ filter: `drop-shadow(0 8px 24px oklch(0.55 0.25 15 / 0.5))` }} />
            </div>
            {/* Flavor badge */}
            <div className="absolute top-0 left-6 px-3 py-1.5 rounded-full text-xs font-extrabold text-white shadow-lg"
              style={{ background: C.pink }}>
              3 FLAVORS
            </div>
            {/* Glow ring */}
            <div className="absolute inset-[15%] rounded-full opacity-20 blur-2xl pointer-events-none"
              style={{ background: C.vivid }} />
          </div>
        </div>
      </div>
    </section>
  );
}

