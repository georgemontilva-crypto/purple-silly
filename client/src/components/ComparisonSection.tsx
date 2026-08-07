import { AmbientGlow } from "@/components/motion/AmbientGlow";

const rows = [
  {
    feature: "PLANT POWERED",
    silly: true,
    alcohol: false,
    tonic: false,
    green: false,
    blk: false,
  },
  {
    feature: "WAKE UP CLEAR",
    silly: true,
    alcohol: false,
    tonic: true,
    green: false,
    blk: false,
  },
  {
    feature: "LIGHTS YOU UP",
    silly: true,
    alcohol: true,
    tonic: true,
    green: true,
    blk: true,
  },
  {
    feature: "NON-HABIT FORMING",
    silly: true,
    alcohol: false,
    tonic: true,
    green: false,
    blk: false,
  },
];

const cols = [
  { key: "silly", label: "🍄 SILLY DOTS", highlight: true },
  { key: "alcohol", label: "🍸 ALCOHOL", highlight: false },
  { key: "tonic", label: "🍹 SOCIAL TONIC", highlight: false },
  { key: "green", label: "💨 THE GREEN", highlight: false },
  { key: "blk", label: "🚫 BLK MRKT", highlight: false },
];

export default function ComparisonSection() {
  return (
    <section className="ambient-glow-host section-y bg-[oklch(0.13_0.04_265)]">
      <AmbientGlow variant="b" />
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <h2 className="font-condensed font-black text-4xl md:text-5xl text-white tracking-tight mb-3">
            Not All Rides Are Created Equal
          </h2>
          <p className="text-white/60 text-base max-w-xl mx-auto">
            See how Purple Organics stacks up against the alternatives.
          </p>
        </div>

        {/* Desktop: table */}
        <div className="hidden md:block overflow-x-auto rounded-3xl">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr>
                <th className="py-4 px-4 text-left text-white/40 text-xs font-bold tracking-widest uppercase w-48" />
                {cols.map(({ key, label, highlight }) => (
                  <th
                    key={key}
                    className={`py-4 px-4 text-center text-xs font-extrabold tracking-wide ${highlight ? "text-[oklch(0.92_0.18_95)]" : "text-white/50"}`}
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(({ feature, ...vals }, i) => (
                <tr
                  key={feature}
                  className="border-t border-white/10"
                  style={{
                    background:
                      i % 2 === 0
                        ? "oklch(0.17 0.05 265)"
                        : "oklch(0.13 0.04 265)",
                  }}
                >
                  <td className="py-4 px-4 text-white font-bold text-sm">
                    {feature}
                  </td>
                  {cols.map(({ key, highlight }) => {
                    const val = vals[key as keyof typeof vals] as boolean;
                    return (
                      <td key={key} className="py-4 px-4 text-center">
                        <span
                          className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-black ${
                            val
                              ? highlight
                                ? "bg-[oklch(0.92_0.18_95)] text-[oklch(0.13_0.04_265)]"
                                : "bg-white/20 text-white"
                              : "bg-white/5 text-white/20"
                          }`}
                        >
                          {val ? "✓" : "✗"}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile: one card per competitor on a horizontal swipe track that
            snaps card to card, scrollbar hidden. Stacked vertically, the
            three cards were a long scroll of near-identical lists with no
            way to compare them side by side — which is the entire point of
            a comparison. */}
        <div className="md:hidden flex gap-4 overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-2">
          {cols.map(({ key, label, highlight }) => (
            <div
              key={key}
              className={`snap-start shrink-0 w-[82%] max-w-[320px] rounded-2xl p-5 border ${highlight ? "border-[oklch(0.92_0.18_95)]" : "border-white/10"}`}
              style={{ background: "oklch(0.17 0.05 265)" }}
            >
              <div
                className={`text-sm font-extrabold tracking-wide mb-4 ${
                  highlight ? "text-[oklch(0.92_0.18_95)]" : "text-white/60"
                }`}
              >
                {label}
              </div>
              <ul className="space-y-3">
                {rows.map(({ feature, ...vals }) => {
                  const val = vals[key as keyof typeof vals] as boolean;
                  return (
                    <li
                      key={feature}
                      className="flex items-center justify-between gap-3"
                    >
                      <span className="text-white text-sm font-semibold">
                        {feature}
                      </span>
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-black shrink-0 ${
                          val
                            ? highlight
                              ? "bg-[oklch(0.92_0.18_95)] text-[oklch(0.13_0.04_265)]"
                              : "bg-white/20 text-white"
                            : "bg-white/5 text-white/20"
                        }`}
                      >
                        {val ? "✓" : "✗"}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
