import { useRef, useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";

const C = {
  deep: "oklch(0.09 0.04 295)",
  pink: "oklch(0.72 0.22 320)",
};

// Cycled by card position — categories themselves are dynamic (Part 4),
// so there's no fixed name -> color mapping.
const ACCENTS = ["#7C3AED", "#ec4899", "#10b981", "#f59e0b", "#0ea5e9", "#ef4444"];

export default function ChooseYourRide() {
  const { data: categories } = trpc.catalog.categories.useQuery();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeDot, setActiveDot] = useState(0);

  // A category only earns a card here once it has both a card image AND
  // (already enforced by the catalog.categories query) at least one active
  // product — an empty/imageless category shouldn't produce a dead tile.
  const cards = (categories ?? []).filter(c => c.cardImageUrl);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const containerCenter = el.scrollLeft + el.clientWidth / 2;
    let closest = 0;
    let closestDist = Infinity;
    Array.from(el.children).forEach((child, i) => {
      const c = child as HTMLElement;
      const childCenter = c.offsetLeft + c.offsetWidth / 2;
      const dist = Math.abs(childCenter - containerCenter);
      if (dist < closestDist) {
        closestDist = dist;
        closest = i;
      }
    });
    setActiveDot(closest);
  };

  const scrollToCard = (i: number) => {
    const el = scrollRef.current;
    const child = el?.children[i] as HTMLElement | undefined;
    child?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  };

  if (cards.length === 0) return null;

  return (
    <section className="py-24 px-4" style={{ background: C.deep }}>
      <div className="max-w-[1280px] mx-auto">
        <div className="text-center mb-10">
          <p className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: C.pink }}>Our Products</p>
          <h2 className="text-5xl sm:text-6xl font-extrabold font-condensed text-white leading-tight">
            Choose Your Ride
          </h2>
          <p className="mt-4 text-lg max-w-xl mx-auto" style={{ color: "oklch(0.68 0.07 295)" }}>
            Whether you're looking for a higher-energy, more immersive experience or a balanced, feel-good boost — Purple Organics has a ride for you.
          </p>
        </div>

        {/* Desktop: grid, no cap at 3 — extra cards just wrap to another row */}
        <div className="hidden md:grid md:grid-cols-3 gap-6">
          {cards.map((cat, i) => (
            <RideCard key={cat.id} category={cat} accent={ACCENTS[i % ACCENTS.length]} />
          ))}
        </div>

        {/* Mobile: horizontal snap scroll + dot indicators */}
        <div className="md:hidden">
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex overflow-x-auto snap-x snap-mandatory gap-4 -mx-4 px-4 pb-2"
            style={{ scrollbarWidth: "none" }}
          >
            {cards.map((cat, i) => (
              <div key={cat.id} className="snap-center shrink-0 w-[78%]">
                <RideCard category={cat} accent={ACCENTS[i % ACCENTS.length]} />
              </div>
            ))}
          </div>
          {cards.length > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {cards.map((cat, i) => (
                <button
                  key={cat.id}
                  onClick={() => scrollToCard(i)}
                  aria-label={`Go to ${cat.name}`}
                  className="h-2 rounded-full transition-all duration-300"
                  style={{
                    width: i === activeDot ? 24 : 8,
                    background: i === activeDot ? "white" : "rgba(255,255,255,0.3)",
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function RideCard({
  category,
  accent,
}: {
  category: { id: number; name: string; slug: string; cardImageUrl: string | null };
  accent: string;
}) {
  return (
    <Link
      href={`/collections/${category.slug}`}
      className="group relative block rounded-3xl overflow-hidden aspect-[3/4]"
    >
      <img
        src={category.cardImageUrl ?? undefined}
        alt={category.name}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <h3 className="text-2xl font-extrabold font-condensed text-white mb-1">{category.name}</h3>
        <span className="font-bold text-sm transition-all group-hover:gap-3 inline-flex items-center gap-2" style={{ color: accent }}>
          Shop Now →
        </span>
      </div>
    </Link>
  );
}
