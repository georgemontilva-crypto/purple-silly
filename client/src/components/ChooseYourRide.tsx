import { useState } from "react";
import { Link } from "wouter";
import { useSiteAsset } from "@/hooks/useSiteAssets";
import { AssetPlaceholder } from "@/components/AssetPlaceholder";
import type { AssetSectionKey } from "@shared/assetSections";

const C = {
  deep:   "oklch(0.09 0.04 295)",
  dark:   "oklch(0.13 0.05 295)",
  mid:    "oklch(0.20 0.08 295)",
  vivid:  "oklch(0.52 0.28 295)",
  bright: "oklch(0.62 0.28 295)",
  pink:   "oklch(0.72 0.22 320)",
};

const CATEGORIES = [
  {
    id: "dots",
    label: "Silly Dots",
    accent: C.vivid,
    accentHex: "#7C3AED",
    collection: "silly-dots",
    products: [
      { name: "Silly Dots — Mega Dose",  sub: "1200mg",  href: "/products/silly-dots-mega-dose",  assetKey: "choose-your-ride-dots-1" as AssetSectionKey },
      { name: "Silly Dots — Hero Dose",  sub: "1800mg",  href: "/products/silly-dots-hero-dose",  assetKey: "choose-your-ride-dots-2" as AssetSectionKey },
      { name: "Silly Dots — Super Dose", sub: "2400mg",  href: "/products/silly-dots-super-dose", assetKey: "choose-your-ride-dots-3" as AssetSectionKey },
    ],
  },
  {
    id: "euphoria",
    label: "Silly Euphoria",
    accent: C.pink,
    accentHex: "#ec4899",
    collection: "silly-euphoria",
    products: [
      { name: "Silly Euphoria — Original", sub: "Premium blend", href: "/collections/silly-euphoria", assetKey: "choose-your-ride-euphoria-1" as AssetSectionKey },
      { name: "Silly Euphoria — Tropical", sub: "Coming soon",   href: "/collections/silly-euphoria", assetKey: "choose-your-ride-euphoria-2" as AssetSectionKey },
      { name: "Silly Euphoria — Berry",    sub: "Coming soon",   href: "/collections/silly-euphoria", assetKey: "choose-your-ride-euphoria-3" as AssetSectionKey },
    ],
  },
  {
    id: "bites",
    label: "Silly Bites Gummies",
    accent: "oklch(0.60 0.25 160)",
    accentHex: "#10b981",
    collection: "silly-bites",
    products: [
      { name: "Silly Bites — Original",   sub: "10ct pouch",  href: "/collections/silly-bites", assetKey: "choose-your-ride-bites-1" as AssetSectionKey },
      { name: "Silly Bites — Watermelon", sub: "Coming soon", href: "/collections/silly-bites", assetKey: "choose-your-ride-bites-2" as AssetSectionKey },
      { name: "Silly Bites — Mango",      sub: "Coming soon", href: "/collections/silly-bites", assetKey: "choose-your-ride-bites-3" as AssetSectionKey },
    ],
  },
];

function ProductImage({ assetKey }: { assetKey: AssetSectionKey }) {
  const { asset } = useSiteAsset(assetKey);
  if (!asset) return <AssetPlaceholder width={800} height={600} variant="dark" />;
  return <img src={asset.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />;
}

export default function ChooseYourRide() {
  const [activeTab, setActiveTab] = useState("dots");
  const category = CATEGORIES.find(c => c.id === activeTab)!;

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

        <div className="flex justify-center mb-10">
          <div className="flex gap-1 p-1 rounded-full" style={{ background: C.mid }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className="px-5 py-2.5 rounded-full font-bold text-sm transition-all duration-200"
                style={activeTab === cat.id
                  ? { background: `linear-gradient(135deg, ${C.bright}, ${C.pink})`, color: "white", boxShadow: `0 4px 20px ${C.vivid}50` }
                  : { color: "oklch(0.65 0.07 295)", background: "transparent" }
                }
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div
          key={activeTab}
          className="grid md:grid-cols-3 gap-6"
          style={{ animation: "fadeInUp 0.25s ease-out" }}
        >
          {category.products.map((p) => (
            <Link
              key={p.name}
              href={p.href}
              className="group relative rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-2 block"
              style={{ background: C.dark, border: `1px solid ${C.mid}` }}
            >
              <div
                className="w-full overflow-hidden flex items-center justify-center"
                style={{
                  aspectRatio: "4/3",
                  background: `linear-gradient(135deg, ${category.accentHex}18, ${category.accentHex}08)`,
                }}
              >
                <ProductImage assetKey={p.assetKey} />
              </div>
              <div className="p-6">
                <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: category.accent }}>{p.sub}</p>
                <h3 className="text-xl font-extrabold font-condensed text-white mb-3">{p.name}</h3>
                <div className="flex items-center gap-2 font-bold text-sm text-white transition-all group-hover:gap-3">
                  <span>Shop Now</span>
                  <span style={{ color: category.accent }}>→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href={`/collections/${category.collection}`}
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full font-bold text-sm text-white border transition-all hover:bg-white/10"
            style={{ borderColor: category.accent, color: category.accent }}
          >
            View All {category.label} →
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
