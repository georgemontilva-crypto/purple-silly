export default function AnnouncementBar() {
  const text = "✦ FREE SHIPPING ON ALL ORDERS  ✦  25% OFF ALL SUBSCRIPTIONS  ✦  NEW FLAVORS AVAILABLE NOW  ✦  FREE SHIPPING ON ALL ORDERS  ✦  25% OFF ALL SUBSCRIPTIONS  ✦  NEW FLAVORS AVAILABLE NOW  ";
  return (
    <div className="overflow-hidden py-2.5 text-xs font-bold tracking-widest uppercase select-none"
      style={{ background: "oklch(0.52 0.28 295)", color: "white" }}>
      <div className="flex whitespace-nowrap animate-marquee">
        <span className="pr-8">{text}</span>
        <span className="pr-8">{text}</span>
      </div>
    </div>
  );
}

