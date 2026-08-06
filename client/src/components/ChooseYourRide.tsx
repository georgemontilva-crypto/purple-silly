import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Package } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { oklchAlpha } from "@/lib/color";

const C = {
  deep:   "oklch(0.09 0.04 295)",
  dark:   "oklch(0.13 0.05 295)",
  mid:    "oklch(0.20 0.08 295)",
  vivid:  "oklch(0.52 0.28 295)",
  bright: "oklch(0.62 0.28 295)",
  pink:   "oklch(0.72 0.22 320)",
};

// Cycled by category position — categories themselves are dynamic (Part 4),
// so there's no fixed name -> color mapping anymore.
const ACCENTS = ["#7C3AED", "#ec4899", "#10b981", "#f59e0b", "#0ea5e9", "#ef4444"];

function formatPrice(cents: number | null): string {
  if (cents === null) return "";
  return `$${(cents / 100).toFixed(2)}`;
}

export default function ChooseYourRide() {
  const { data: categories } = trpc.catalog.categories.useQuery();
  const [activeSlug, setActiveSlug] = useState<string | null>(null);

  useEffect(() => {
    if (categories && categories.length > 0 && (!activeSlug || !categories.some(c => c.slug === activeSlug))) {
      setActiveSlug(categories[0].slug);
    }
  }, [categories, activeSlug]);

  const activeIndex = categories?.findIndex(c => c.slug === activeSlug) ?? -1;
  const activeCategory = activeIndex >= 0 ? categories?.[activeIndex] : undefined;
  const accentHex = ACCENTS[Math.max(activeIndex, 0) % ACCENTS.length];

  const { data: products } = trpc.catalog.list.useQuery(
    { categorySlug: activeCategory?.slug, limit: 3 },
    { enabled: Boolean(activeCategory) }
  );

  // No categories with published products yet -> render nothing, not a broken empty block.
  if (!categories || categories.length === 0 || !activeCategory) return null;

  const showTabs = categories.length > 1;

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

        {showTabs && (
          <div className="flex justify-center mb-10">
            <div className="flex gap-1 p-1 rounded-full flex-wrap justify-center" style={{ background: C.mid }}>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveSlug(cat.slug)}
                  className="px-5 py-2.5 rounded-full font-bold text-sm transition-all duration-200"
                  style={cat.slug === activeCategory.slug
                    ? { background: `linear-gradient(135deg, ${C.bright}, ${C.pink})`, color: "white", boxShadow: `0 4px 20px ${oklchAlpha(C.vivid, 50)}` }
                    : { color: "oklch(0.65 0.07 295)", background: "transparent" }
                  }
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div
          key={activeCategory.slug}
          className="grid sm:grid-cols-2 md:grid-cols-3 gap-6"
          style={{ animation: "fadeInUp 0.25s ease-out" }}
        >
          {(products ?? []).map(p => (
            <Link
              key={p.id}
              href={`/products/${p.slug}`}
              className="group relative rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-2 block"
              style={{ background: C.dark, border: `1px solid ${C.mid}` }}
            >
              <div
                className="w-full overflow-hidden flex items-center justify-center"
                style={{
                  aspectRatio: "4/3",
                  background: `linear-gradient(135deg, ${accentHex}18, ${accentHex}08)`,
                }}
              >
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt={p.imageAlt} className="w-full h-full object-cover" />
                ) : (
                  <Package size={36} style={{ color: `${accentHex}80` }} strokeWidth={1.5} />
                )}
              </div>
              <div className="p-6">
                {!p.inStock && <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: C.pink }}>Sold out</p>}
                <h3 className="text-xl font-extrabold font-condensed text-white mb-3">{p.title}</h3>
                <div className="flex items-center justify-between font-bold text-sm text-white transition-all group-hover:gap-3">
                  <span>{formatPrice(p.priceCents) ? `From ${formatPrice(p.priceCents)}` : "Shop Now"}</span>
                  <span style={{ color: accentHex }}>→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href={`/collections/${activeCategory.slug}`}
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full font-bold text-sm text-white border transition-all hover:bg-white/10"
            style={{ borderColor: accentHex, color: accentHex }}
          >
            View All {activeCategory.name} →
          </Link>
        </div>
      </div>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}
