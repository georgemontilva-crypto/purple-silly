import { useState } from "react";
import { Link } from "wouter";
import { Star, ShoppingCart } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useCart } from "@/contexts/CartContext";

const BLUE_RAZZ = "/manus-storage/SuperSillyDotsbluerazz_582d558a.webp";
const CHERRY    = "/manus-storage/SuperSillyDotsCherryBerry_44c53bd2.webp";
const NATURAL   = "/manus-storage/SuperSillyDotsnatural_d5a216cf.webp";

const C = {
  deep:   "oklch(0.09 0.04 295)",
  dark:   "oklch(0.13 0.05 295)",
  mid:    "oklch(0.20 0.08 295)",
  vivid:  "oklch(0.52 0.28 295)",
  bright: "oklch(0.62 0.28 295)",
  pink:   "oklch(0.72 0.22 320)",
  yellow: "oklch(0.88 0.20 95)",
};

const FALLBACK = [
  { id: "1", title: "Super Silly Dots — Natural", handle: "super-silly-dots-natural", price: { amount: "14.99", currencyCode: "USD" }, image: NATURAL, rating: 4.9, reviews: 128 },
  { id: "2", title: "Super Silly Dots — Blue Razz", handle: "super-silly-dots-blue-razz", price: { amount: "14.99", currencyCode: "USD" }, image: BLUE_RAZZ, rating: 4.8, reviews: 94 },
  { id: "3", title: "Super Silly Dots — Cherry Berry", handle: "super-silly-dots-cherry-berry", price: { amount: "14.99", currencyCode: "USD" }, image: CHERRY, rating: 4.7, reviews: 76 },
];

const TABS = [
  { id: "tablets", label: "Party Tablets", collection: "kanna-tablets" },
  { id: "gummies", label: "Daily Mood Gummies", collection: "kanna-gummies" },
];

type FallbackProduct = typeof FALLBACK[0];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={11}
          fill={i <= Math.round(rating) ? C.yellow : "transparent"}
          stroke={i <= Math.round(rating) ? C.yellow : "oklch(0.40 0.06 295)"} />
      ))}
    </div>
  );
}

function ProductCard({ product }: { product: FallbackProduct }) {
  const { addItem } = useCart();
  const [adding, setAdding] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    setAdding(true);
    addItem(
      `gid://shopify/ProductVariant/${product.id}`,
      1,
      { title: product.title, variantTitle: "Default", price: product.price, image: { url: product.image, altText: product.title } }
    );
    setTimeout(() => setAdding(false), 900);
  };

  return (
    <div className="group rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-2 flex flex-col"
      style={{ background: C.dark, border: `1px solid ${C.mid}` }}>
      <Link href={`/products/${product.handle}`}>
        <div className="aspect-square overflow-hidden flex items-center justify-center p-6 cursor-pointer"
          style={{ background: `radial-gradient(circle at center, ${C.vivid}18, ${C.dark})` }}>
          <img src={product.image} alt={product.title}
            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
            style={{ filter: `drop-shadow(0 12px 32px ${C.vivid}50)` }} />
        </div>
      </Link>
      <div className="p-5 flex flex-col flex-1">
        <Link href={`/products/${product.handle}`}>
          <h3 className="font-extrabold font-condensed text-white text-lg leading-tight mb-1 hover:opacity-80 transition-opacity cursor-pointer">
            {product.title}
          </h3>
        </Link>
        <div className="flex items-center gap-2 mb-3">
          <StarRating rating={product.rating} />
          <span className="text-xs" style={{ color: "oklch(0.55 0.06 295)" }}>({product.reviews})</span>
        </div>
        <div className="flex items-center justify-between mt-auto">
          <span className="text-xl font-extrabold" style={{ color: C.pink }}>
            ${parseFloat(product.price.amount).toFixed(2)}
          </span>
          <button onClick={handleAdd} disabled={adding}
            className="flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm text-white transition-all active:scale-95 disabled:opacity-70"
            style={{ background: adding ? C.vivid : `linear-gradient(135deg, ${C.bright}, ${C.pink})` }}>
            <ShoppingCart size={13} />
            {adding ? "Added!" : "Shop Now"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MeetTheLineup() {
  const [activeTab, setActiveTab] = useState("tablets");
  const activeCollection = TABS.find(t => t.id === activeTab)?.collection ?? "kanna-tablets";

  const { data: shopifyProducts, isLoading } = trpc.shopify.products.useQuery(
    { first: 6, collection: activeCollection },
    { retry: 1, staleTime: 5 * 60 * 1000 }
  );

  const products: FallbackProduct[] = (shopifyProducts && shopifyProducts.length > 0)
    ? (shopifyProducts as unknown as Array<{ id: string; title: string; handle: string; priceRange: { minVariantPrice: { amount: string; currencyCode: string } }; featuredImage?: { url: string } | null }>).map((p) => ({
        id: p.id,
        title: p.title,
        handle: p.handle,
        price: p.priceRange.minVariantPrice,
        image: p.featuredImage?.url ?? NATURAL,
        rating: 4.8,
        reviews: 100,
      }))
    : FALLBACK;

  return (
    <section className="py-24 px-4" style={{ background: `linear-gradient(180deg, oklch(0.11 0.05 295), ${C.deep})` }}>
      <div className="max-w-[1280px] mx-auto">
        <div className="text-center mb-12">
          <p className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: C.pink }}>The Collection</p>
          <h2 className="text-5xl sm:text-6xl font-extrabold font-condensed text-white">Meet the Lineup</h2>
          <p className="mt-4 text-lg max-w-lg mx-auto" style={{ color: "oklch(0.68 0.07 295)" }}>
            Every product crafted with premium Kanna extract for real, feel-good results.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-10">
          <div className="flex gap-1 p-1 rounded-full" style={{ background: C.mid }}>
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className="px-6 py-2.5 rounded-full font-bold text-sm transition-all duration-200"
                style={activeTab === tab.id
                  ? { background: `linear-gradient(135deg, ${C.bright}, ${C.pink})`, color: "white" }
                  : { color: "oklch(0.65 0.07 295)" }}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3].map(i => (
              <div key={i} className="rounded-3xl aspect-[3/4] animate-pulse" style={{ background: C.dark }} />
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}

        <div className="text-center mt-12">
          <Link href="/collections/all"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-extrabold text-base text-white border-2 transition-all hover:bg-white/10"
            style={{ borderColor: C.bright }}>
            View All Products →
          </Link>
        </div>
      </div>
    </section>
  );
}
