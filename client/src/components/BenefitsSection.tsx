import { Smile, Users, Brain, Sunset } from "lucide-react";

const benefits = [
  {
    icon: Smile,
    label: "Elevated Mood",
    desc: "Feel genuinely uplifted and positive throughout your day.",
    color: "oklch(0.92_0.18_95)",
  },
  {
    icon: Users,
    label: "Social Ease",
    desc: "Connect more naturally and comfortably with those around you.",
    color: "oklch(0.62_0.25_340)",
  },
  {
    icon: Brain,
    label: "Sharp Focus",
    desc: "Stay clear-headed and mentally sharp when it matters most.",
    color: "oklch(0.65_0.18_185)",
  },
  {
    icon: Sunset,
    label: "Happy Landings",
    desc: "A smooth, gentle come-down with no crash or jitters.",
    color: "oklch(0.72_0.18_55)",
  },
];

export default function BenefitsSection() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <p className="text-sm font-bold tracking-widest uppercase text-[oklch(0.62_0.25_340)] mb-3">
            ✨ Ride the Feeling of kanna ✨
          </p>
          <h2 className="font-condensed font-black text-4xl md:text-5xl text-[oklch(0.22_0.08_265)] tracking-tight mb-4">
            What to Expect
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
            At the heart of every Ferris Wheel product is KANNA — an incredible plant that delivers
            a natural, feel-good experience unlike anything else.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-6">
          {benefits.map(({ icon: Icon, label, desc, color }) => (
            <div key={label}
              className="flex flex-col items-center text-center p-6 rounded-3xl bg-[oklch(0.97_0.005_265)] hover:shadow-lg transition-shadow duration-200 group">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-200 group-hover:scale-110"
                style={{ backgroundColor: `${color.replace('oklch(', 'oklch(').replace(')', '/15)')}`, color: `oklch(${color.slice(6, -1)})` }}>
                <Icon size={28} strokeWidth={2} />
              </div>
              <h3 className="font-extrabold text-base text-[oklch(0.22_0.08_265)] mb-2">{label}</h3>
              <p className="text-sm text-gray-500 leading-snug">{desc}</p>
            </div>
          ))}
        </div>
        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-6 mt-12 pt-10 border-t border-gray-100">
          {[
            { icon: "🌿", label: "100% Natural Ingredients" },
            { icon: "🇺🇸", label: "Federally Legal in the US" },
            { icon: "🔬", label: "Third-Party Lab Tested" },
          ].map(({ icon, label }) => (
            <div key={label} className="flex items-center gap-2.5 text-sm font-semibold text-[oklch(0.22_0.08_265)]">
              <span className="text-xl">{icon}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

