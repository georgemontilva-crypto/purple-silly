import { Link } from "wouter";

// Placeholder dimensions: 800×600px each column image
const COL_W = 800;
const COL_H = 600;

function RideCard({
  href,
  label,
  emoji,
  accentColor,
}: {
  href: string;
  label: string;
  emoji: string;
  accentColor: string;
}) {
  return (
    <Link href={href}
      className="group relative overflow-hidden rounded-3xl block"
      style={{ minHeight: "400px" }}>
      {/* Gray placeholder */}
      <div
        className="absolute inset-0 bg-gray-300 flex items-center justify-center text-gray-500 text-sm font-medium"
        title={`Collection image placeholder — ${COL_W}×${COL_H}px`}>
        <span className="bg-white/60 px-3 py-1.5 rounded-xl text-xs font-semibold">
          {COL_W}×{COL_H}px
        </span>
      </div>
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      {/* Label */}
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <p className="font-condensed font-black text-3xl md:text-4xl text-white uppercase tracking-tight">
          {label} {emoji}
        </p>
        <div className="mt-3 inline-flex items-center gap-2 text-white font-bold text-sm opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-200">
          <span>Shop Now</span>
          <span>→</span>
        </div>
      </div>
      {/* Accent border on hover */}
      <div className={`absolute inset-0 rounded-3xl border-4 border-transparent group-hover:border-[${accentColor}] transition-all duration-200`} />
    </Link>
  );
}

export default function ChooseYourRide() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <h2 className="font-condensed font-black text-4xl md:text-5xl text-[oklch(0.22_0.08_265)] tracking-tight">
            Choose Your Ride
          </h2>
          <p className="text-gray-500 mt-3 max-w-xl mx-auto text-base md:text-lg leading-relaxed">
            Whether you're looking for a higher-energy, more immersive experience or a balanced,
            feel-good boost for your day, Ferris Wheel has a ride for you.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <RideCard
            href="/collections/kanna-gummies"
            label="Daily Mood Gummies"
            emoji="😎"
            accentColor="oklch(0.65_0.18_185)"
          />
          <RideCard
            href="/collections/kanna-tablets"
            label="Party Tablets"
            emoji="🎉"
            accentColor="oklch(0.62_0.25_340)"
          />
        </div>
      </div>
    </section>
  );
}

