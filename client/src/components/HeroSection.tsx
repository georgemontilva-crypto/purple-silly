import { Link } from "wouter";
import { Star } from "lucide-react";

// Placeholder dimensions: 2000x800px hero background
const HERO_BG_W = 2000;
const HERO_BG_H = 800;

export default function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden bg-[oklch(0.22_0.08_265)]"
      style={{ minHeight: "520px" }}>
      {/* Background image placeholder */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-[oklch(0.22_0.08_265)] via-[oklch(0.28_0.1_270)] to-[oklch(0.18_0.06_260)]"
        aria-label={`Hero background image placeholder (${HERO_BG_W}×${HERO_BG_H}px)`}
      >
        {/* Gray placeholder with aspect ratio hint */}
        <div className="absolute inset-0 flex items-center justify-end pr-8 opacity-20">
          <div className="bg-gray-400 rounded-3xl"
            style={{ width: "520px", height: "420px" }}
            title={`Product image placeholder — 520×420px`} />
        </div>
      </div>

      {/* Decorative badge */}
      <div className="absolute top-8 right-[38%] z-10 hidden md:flex">
        <div className="bg-[oklch(0.92_0.18_95)] text-[oklch(0.13_0.02_265)] rounded-full w-20 h-20 flex flex-col items-center justify-center shadow-lg border-4 border-white/30">
          <span className="font-condensed font-black text-3xl leading-none">6</span>
          <span className="text-[10px] font-bold tracking-wide leading-none mt-0.5">flavors</span>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-[1280px] mx-auto px-4 sm:px-6 py-20 md:py-28 flex flex-col justify-center"
        style={{ minHeight: "520px" }}>
        <div className="max-w-lg">
          <h1 className="font-condensed font-black text-5xl md:text-7xl text-white leading-none tracking-tight mb-4">
            New Daily<br />
            <span className="text-[oklch(0.92_0.18_95)]">Mood Gummies</span>
          </h1>
          <p className="text-white/80 text-lg md:text-xl font-medium mb-8 leading-snug">
            Feel happier. Stay focused. Be more social.
          </p>
          <Link href="/collections/kanna-gummies"
            className="inline-block bg-[oklch(0.62_0.25_340)] text-white font-extrabold text-base px-8 py-4 rounded-full hover:bg-[oklch(0.55_0.25_340)] transition-all active:scale-[0.97] shadow-lg shadow-[oklch(0.62_0.25_340)]/30 tracking-wide uppercase">
            Shop Gummies
          </Link>
          {/* Social proof */}
          <div className="flex items-center gap-3 mt-6">
            <div className="flex">
              {[1,2,3,4,5].map(i => (
                <Star key={i} size={16} className="fill-[oklch(0.92_0.18_95)] text-[oklch(0.92_0.18_95)]" />
              ))}
            </div>
            <span className="text-white/80 text-sm font-semibold">4.7/5 Customer Rated</span>
            <span className="text-white/40">•</span>
            <span className="text-white/80 text-sm font-semibold">✓ Lab Tested</span>
          </div>
        </div>
      </div>
    </section>
  );
}

