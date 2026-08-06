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
          animation: "announcementMarquee 35s linear infinite",
          fontFamily: "'Barlow', sans-serif",
          fontWeight: 700,
          // clamp() keeps this small enough on narrow screens that a single
          // item always fits within the viewport on its own — even in a
          // worst-case frozen frame, no word gets cut off mid-scroll.
          fontSize: "clamp(0.7rem, 2.8vw, 0.875rem)",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        <span style={{ paddingRight: "4rem" }}>{marqueeText}</span>
        <span style={{ paddingRight: "4rem" }}>{marqueeText}</span>
        <span style={{ paddingRight: "4rem" }}>{marqueeText}</span>
      </div>
      {/* Named uniquely — index.css previously had its own dead, unused
          `@keyframes marquee` (from `.animate-marquee`, never referenced by
          any className) with different values. Same-named @keyframes in the
          global stylesheet cascade are a real footgun, so this stays unique. */}
      <style>{`
        @keyframes announcementMarquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-33.333%); }
        }
      `}</style>
    </div>
  );
}
