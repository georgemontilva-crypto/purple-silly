import { Smile, Users, Brain, Sunset } from "lucide-react";
import { oklchAlpha } from "@/lib/color";
const C = {
  deep: "oklch(0.09 0.04 295)",
  dark: "oklch(0.13 0.05 295)",
  mid: "oklch(0.20 0.08 295)",
  vivid: "oklch(0.52 0.28 295)",
  pink: "oklch(0.72 0.22 320)",
};

const benefits = [
  {
    icon: Smile,
    title: "Elevated Mood",
    desc: "Functional mushrooms and mood-supporting nootropics work together to naturally lift your mood and bring genuine happiness.",
    accent: C.vivid,
  },
  {
    icon: Users,
    title: "Social Ease",
    desc: "Feel more open, confident, and connected. Perfect for social settings, events, and meeting new people.",
    accent: C.pink,
  },
  {
    icon: Brain,
    title: "Sharp Focus",
    desc: "Enhanced mental clarity and concentration without the jitters or crash of stimulants.",
    accent: "oklch(0.60 0.25 185)",
  },
  {
    icon: Sunset,
    title: "Happy Landings",
    desc: "A smooth, gentle comedown that leaves you feeling refreshed — not depleted. Wake up feeling great.",
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
