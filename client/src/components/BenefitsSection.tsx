import { Smile, Users, Brain, Sunset } from "lucide-react";
import { oklchAlpha } from "@/lib/color";
const C = {
  deep: "oklch(0.09 0.04 295)",
  dark: "oklch(0.13 0.05 295)",
  mid: "oklch(0.20 0.08 295)",
  vivid: "oklch(0.52 0.28 295)",
  pink: "oklch(0.72 0.22 320)",
};

/*
 * Copy only. Order, icons and accents are unchanged — the cards read
 * left to right in this array, and each one's accent is what tints both
 * its icon and the icon's tile, so reordering or reassigning here would
 * move colour around the row.
 */
const benefits = [
  {
    icon: Smile,
    title: "Brighter Vibes",
    desc: "A feel-good experience designed for laid-back moments, good energy, and enjoying the moment.",
    accent: C.vivid,
  },
  {
    icon: Users,
    title: "Easygoing Energy",
    desc: "Made for good times and good company. A relaxed experience that fits naturally into social occasions.",
    accent: C.pink,
  },
  {
    icon: Brain,
    title: "Clear & Present",
    desc: "Stay in the moment with a balanced experience that feels clean, composed, and easygoing.",
    accent: "oklch(0.60 0.25 185)",
  },
  {
    icon: Sunset,
    title: "Smooth Finish",
    desc: "A balanced experience from start to finish, designed to wind down smoothly without feeling overdone.",
    accent: "oklch(0.75 0.20 55)",
  },
];

export default function BenefitsSection() {
  return (
    <section className="py-24 px-4" style={{ background: C.dark }}>
      <div className="max-w-[1280px] mx-auto">
        <div className="text-center mb-16">
          <p
            className="text-sm font-bold uppercase tracking-widest mb-3"
            style={{ color: C.pink }}
          >
            Why Silly Dots
          </p>
          <h2 className="text-5xl sm:text-6xl font-extrabold font-condensed text-white">
            Feel the Difference
          </h2>
          <p
            className="mt-4 text-lg max-w-xl mx-auto"
            style={{ color: "oklch(0.68 0.07 295)" }}
          >
            Silly Dots blend premium functional mushrooms with nootropics — a
            stack built to lift your mood and sharpen your mind, naturally.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map(({ icon: Icon, title, desc, accent }) => (
            <div
              key={title}
              className="rounded-3xl p-8 flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-1"
              style={{ background: C.deep, border: `1px solid ${C.mid}` }}
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
                style={{ background: oklchAlpha(accent, 20), color: accent }}
              >
                <Icon size={28} strokeWidth={1.8} />
              </div>
              <h3 className="font-extrabold font-condensed text-xl text-white mb-3">
                {title}
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "oklch(0.65 0.07 295)" }}
              >
                {desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
