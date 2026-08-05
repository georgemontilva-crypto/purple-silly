const ITEMS = [
  "FREE SHIPPING ON ALL ORDERS",
  "25% OFF ALL SUBSCRIPTIONS",
  "NEW FLAVORS AVAILABLE NOW",
  "SILLY DOTS — MEGA, HERO & SUPER DOSE",
  "FUNCTIONAL MUSHROOMS + NOOTROPICS",
];

const marqueeText = ITEMS.map((t) => `✦  ${t}  `).join("          ");

export default function AnnouncementBar() {
  return (
    <div
      className="overflow-hidden select-none"
      style={{ background: "oklch(0.52 0.28 295)", color: "white", padding: "0.55rem 0" }}
    >
      <div
        style={{
          display: "flex",
          whiteSpace: "nowrap",
          animation: "marquee 35s linear infinite",
          fontFamily: "'Barlow', sans-serif",
          fontWeight: 700,
          fontSize: "0.875rem",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
        }}
      >
        <span style={{ paddingRight: "4rem" }}>{marqueeText}</span>
        <span style={{ paddingRight: "4rem" }}>{marqueeText}</span>
        <span style={{ paddingRight: "4rem" }}>{marqueeText}</span>
      </div>
      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-33.333%); }
        }
      `}</style>
    </div>
  );
}
