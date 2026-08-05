const rows = [
  { feature: "PLANT POWERED", fw: true, alcohol: false, tonic: false, green: false, blk: false },
  { feature: "WAKE UP CLEAR", fw: true, alcohol: false, tonic: true, green: false, blk: false },
  { feature: "LIGHTS YOU UP", fw: true, alcohol: true, tonic: true, green: true, blk: true },
  { feature: "NON-HABIT FORMING", fw: true, alcohol: false, tonic: true, green: false, blk: false },
];

const cols = [
  { key: "fw", label: "FERRIS WHEEL", highlight: true },
  { key: "alcohol", label: "🍸 ALCOHOL", highlight: false },
  { key: "tonic", label: "🍹 SOCIAL TONIC", highlight: false },
  { key: "green", label: "💨 THE GREEN", highlight: false },
  { key: "blk", label: "🚫 BLK MRKT", highlight: false },
];

export default function ComparisonSection() {
  return (
    <section className="py-16 md:py-24 bg-[oklch(0.13_0.04_265)]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <h2 className="font-condensed font-black text-4xl md:text-5xl text-white tracking-tight mb-3">
            Not All Rides Are Created Equal
          </h2>
          <p className="text-white/60 text-base max-w-xl mx-auto">
            See how Ferris Wheel stacks up against the alternatives.
          </p>
        </div>
        <div className="overflow-x-auto rounded-3xl">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr>
                <th className="py-4 px-4 text-left text-white/40 text-xs font-bold tracking-widest uppercase w-48" />
                {cols.map(({ key, label, highlight }) => (
                  <th key={key}
                    className={`py-4 px-4 text-center text-xs font-extrabold tracking-wide ${highlight ? "text-[oklch(0.92_0.18_95)]" : "text-white/50"}`}>
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(({ feature, ...vals }, i) => (
                <tr key={feature}
                  className={`border-t border-white/10 ${i % 2 === 0 ? "bg-white/5" : ""}`}>
                  <td className="py-4 px-4 text-white font-bold text-sm">{feature}</td>
                  {cols.map(({ key, highlight }) => {
                    const val = vals[key as keyof typeof vals] as boolean;
                    return (
                      <td key={key} className="py-4 px-4 text-center">
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-black ${val
                          ? highlight ? "bg-[oklch(0.92_0.18_95)] text-[oklch(0.13_0.04_265)]" : "bg-white/20 text-white"
                          : "bg-white/5 text-white/20"}`}>
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
      </div>
    </section>
  );
}

