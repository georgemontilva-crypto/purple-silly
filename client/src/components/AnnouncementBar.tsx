export default function AnnouncementBar() {
  const text = "✓ 25% OFF ALL SUBSCRIPTIONS + FREE SHIPPING";
  const items = Array(8).fill(text);

  return (
    <div className="bg-[oklch(0.92_0.18_95)] text-[oklch(0.13_0.02_265)] overflow-hidden py-2.5 select-none">
      <div className="flex w-max animate-marquee whitespace-nowrap">
        {items.map((item, i) => (
          <span key={i} className="text-sm font-semibold tracking-wide mx-8">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

