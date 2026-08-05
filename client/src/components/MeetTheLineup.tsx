import { useState } from "react";
import { Link } from "wouter";
import { Star, ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react";
import { formatPrice } from "@/lib/shopify";
import { trpc } from "@/lib/trpc";
import { useCart } from "@/contexts/CartContext";

// Server-side product type (from Admin API via tRPC)
type ServerProduct = {
  id: string;
  handle: string;
  title: string;
  description: string;
  priceRange: {
    minVariantPrice: { amount: string; currencyCode: string };
    maxVariantPrice: { amount: string; currencyCode: string };
  };
  images: { edges: Array<{ node: { url: string; altText: string | null } }> };
  variants: {
    edges: Array<{
      node: {
        id: string;
        title: string;
        price: { amount: string; currencyCode: string };
        compareAtPrice?: { amount: string; currencyCode: string } | null;
        availableForSale: boolean;
        selectedOptions: Array<{ name: string; value: string }>;
      };
    }>;
  };
  tags: string[];
  availableForSale: boolean;
};

// Placeholder product data shown when Shopify app is not yet installed on the store
const PLACEHOLDER_TABLETS: ServerProduct[] = [
  { id: "ph-1", handle: "blue-razz-kanna-tablets", title: "Party Tablets — Blue Razz", tags: ["tablets"], availableForSale: true, description: "High-energy euphoria for late-night socializing.", images: { edges: [] }, priceRange: { minVariantPrice: { amount: "24.99", currencyCode: "USD" }, maxVariantPrice: { amount: "24.99", currencyCode: "USD" } }, variants: { edges: [{ node: { id: "v1", title: "Default", price: { amount: "24.99", currencyCode: "USD" }, compareAtPrice: null, availableForSale: true, selectedOptions: [] } }] } },
  { id: "ph-2", handle: "pink-stardust-kanna-tablets", title: "Party Tablets — Pink Stardust", tags: ["tablets"], availableForSale: true, description: "High-energy euphoria for late-night socializing.", images: { edges: [] }, priceRange: { minVariantPrice: { amount: "24.99", currencyCode: "USD" }, maxVariantPrice: { amount: "24.99", currencyCode: "USD" } }, variants: { edges: [{ node: { id: "v2", title: "Default", price: { amount: "24.99", currencyCode: "USD" }, compareAtPrice: null, availableForSale: true, selectedOptions: [] } }] } },
  { id: "ph-3", handle: "juicy-apple-kanna-tablets", title: "Party Tablets — Juicy Apple", tags: ["tablets"], availableForSale: true, description: "High-energy euphoria for late-night socializing.", images: { edges: [] }, priceRange: { minVariantPrice: { amount: "24.99", currencyCode: "USD" }, maxVariantPrice: { amount: "24.99", currencyCode: "USD" } }, variants: { edges: [{ node: { id: "v3", title: "Default", price: { amount: "24.99", currencyCode: "USD" }, compareAtPrice: null, availableForSale: true, selectedOptions: [] } }] } },
  { id: "ph-4", handle: "citrus-twist-kanna-tablets", title: "Party Tablets — Citrus Twist", tags: ["tablets"], availableForSale: true, description: "High-energy euphoria for late-night socializing.", images: { edges: [] }, priceRange: { minVariantPrice: { amount: "24.99", currencyCode: "USD" }, maxVariantPrice: { amount: "24.99", currencyCode: "USD" } }, variants: { edges: [{ node: { id: "v4", title: "Default", price: { amount: "24.99", currencyCode: "USD" }, compareAtPrice: null, availableForSale: true, selectedOptions: [] } }] } },
];
const PLACEHOLDER_GUMMIES: ServerProduct[] = [
  { id: "ph-5", handle: "blue-razz-gummies", title: "Daily Mood Gummies — Blue Razz", tags: ["gummies"], availableForSale: true, description: "Daily mood support, social ease, and focus.", images: { edges: [] }, priceRange: { minVariantPrice: { amount: "29.99", currencyCode: "USD" }, maxVariantPrice: { amount: "29.99", currencyCode: "USD" } }, variants: { edges: [{ node: { id: "v5", title: "Default", price: { amount: "29.99", currencyCode: "USD" }, compareAtPrice: null, availableForSale: true, selectedOptions: [] } }] } },
  { id: "ph-6", handle: "sour-cherry-gummies", title: "Daily Mood Gummies — Sour Cherry", tags: ["gummies"], availableForSale: true, description: "Daily mood support, social ease, and focus.", images: { edges: [] }, priceRange: { minVariantPrice: { amount: "29.99", currencyCode: "USD" }, maxVariantPrice: { amount: "29.99", currencyCode: "USD" } }, variants: { edges: [{ node: { id: "v6", title: "Default", price: { amount: "29.99", currencyCode: "USD" }, compareAtPrice: null, availableForSale: true, selectedOptions: [] } }] } },
];

function StarRating({ rating = 4.5 }: { rating?: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={12}
          className={i <= Math.round(rating)
            ? "fill-[oklch(0.92_0.18_95)] text-[oklch(0.92_0.18_95)]"
            : "fill-gray-200 text-gray-200"} />
      ))}
    </div>
  );
}

function ProductCard({ product, isPlaceholder }: { product: ServerProduct; isPlaceholder: boolean }) {
  const { addItem, isLoading } = useCart();
  const firstVariant = product.variants.edges[0]?.node;
  const price = product.priceRange.minVariantPrice;
  const compareAt = firstVariant?.compareAtPrice;
  const discount = compareAt
    ? Math.round((1 - parseFloat(price.amount) / parseFloat(compareAt.amount)) * 100)
    : null;
  const featuredImage = product.images.edges[0]?.node ?? null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (firstVariant) addItem(firstVariant.id);
  };

  return (
    <div className="product-card group flex-shrink-0 w-64 md:w-72">
      <Link href={`/products/${product.handle}`}>
        {/* Image area */}
        <div className="relative overflow-hidden rounded-2xl bg-gray-100 mb-4" style={{ aspectRatio: "1 / 1" }}>
          {discount && (
            <span className="absolute top-3 left-3 z-10 bg-[oklch(0.62_0.25_340)] text-white text-xs font-bold px-2.5 py-1 rounded-full">
              -{discount}%
            </span>
          )}
          {featuredImage ? (
            <img src={featuredImage.url} alt={featuredImage.altText ?? product.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-2">
              <div className="w-24 h-24 bg-gray-200 rounded-2xl" />
              <span className="text-xs font-medium">600×600px</span>
            </div>
          )}
        </div>
        {/* Info */}
        <div className="px-1">
          <div className="flex items-center gap-2 mb-1">
            <StarRating rating={4.5} />
            {isPlaceholder && <span className="text-xs text-gray-400 font-medium">— reviews</span>}
          </div>
          <h3 className="font-bold text-sm text-[oklch(0.22_0.08_265)] leading-snug mb-1 line-clamp-2">
            {product.title}
          </h3>
          <div className="flex items-center gap-2 mb-3">
            <span className="font-extrabold text-base text-[oklch(0.22_0.08_265)]">
              {formatPrice(price)}
            </span>
            {compareAt && (
              <span className="text-sm text-gray-400 line-through">{formatPrice(compareAt)}</span>
            )}
          </div>
        </div>
      </Link>
      <button
        onClick={handleAddToCart}
        disabled={isLoading || !firstVariant?.availableForSale}
        className="w-full bg-[oklch(0.22_0.08_265)] text-white font-bold text-sm py-3 rounded-xl hover:bg-[oklch(0.62_0.25_340)] transition-colors active:scale-[0.97] disabled:opacity-50 flex items-center justify-center gap-2">
        <ShoppingCart size={14} />
        Shop Now
      </button>
    </div>
  );
}

type Tab = "tablets" | "gummies";

export default function MeetTheLineup() {
  const [activeTab, setActiveTab] = useState<Tab>("tablets");
  const [scrollIndex, setScrollIndex] = useState(0);

  // Fetch products server-side via tRPC (Client Credentials Grant — no frontend secrets)
  const { data: tabletsData, isLoading: tabletsLoading } = trpc.shopify.products.useQuery(
    { first: 10, collection: "kanna-tablets" },
    { retry: 1, staleTime: 5 * 60 * 1000 }
  );
  const { data: gummiesData, isLoading: gummiesLoading } = trpc.shopify.products.useQuery(
    { first: 10, collection: "kanna-gummies" },
    { retry: 1, staleTime: 5 * 60 * 1000 }
  );

  const isLoading = tabletsLoading || gummiesLoading;

  // Fall back to placeholders if no live data yet
  const tabletsProducts: ServerProduct[] = (tabletsData && tabletsData.length > 0)
    ? (tabletsData as unknown as ServerProduct[])
    : PLACEHOLDER_TABLETS;
  const gummiesProducts: ServerProduct[] = (gummiesData && gummiesData.length > 0)
    ? (gummiesData as unknown as ServerProduct[])
    : PLACEHOLDER_GUMMIES;
  const isPlaceholder = !tabletsData || tabletsData.length === 0;

  const products = activeTab === "tablets" ? tabletsProducts : gummiesProducts;
  const visibleCount = 4;
  const maxIndex = Math.max(0, products.length - visibleCount);

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setScrollIndex(0);
  };

  return (
    <section className="py-16 md:py-24 bg-[oklch(0.97_0.005_265)]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <h2 className="font-condensed font-black text-4xl md:text-5xl text-[oklch(0.22_0.08_265)] tracking-tight">
            Meet the lineup
          </h2>
          {/* Tabs */}
          <div className="flex bg-white rounded-2xl p-1 gap-1 shadow-sm border border-gray-100 self-start">
            {([["tablets", "Party Tablets"], ["gummies", "Daily Mood Gummies"]] as [Tab, string][]).map(([tab, label]) => (
              <button key={tab} onClick={() => handleTabChange(tab)}
                className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 ${
                  activeTab === tab
                    ? "bg-[oklch(0.22_0.08_265)] text-white shadow-sm"
                    : "text-gray-500 hover:text-[oklch(0.22_0.08_265)]"
                }`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {isPlaceholder && !isLoading && (
          <div className="mb-6 bg-[oklch(0.92_0.18_95)]/20 border border-[oklch(0.92_0.18_95)] rounded-2xl px-5 py-3 text-sm text-[oklch(0.22_0.08_265)] font-medium">
            ⚡ Install your Shopify app on the store to display real products. Showing placeholder data.
          </div>
        )}

        {isLoading ? (
          <div className="flex gap-5 overflow-hidden">
            {[1,2,3,4].map(i => (
              <div key={i} className="flex-shrink-0 w-64 md:w-72 space-y-3">
                <div className="aspect-square bg-gray-200 rounded-2xl animate-pulse" />
                <div className="h-4 bg-gray-200 rounded-lg animate-pulse w-3/4" />
                <div className="h-4 bg-gray-200 rounded-lg animate-pulse w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="relative">
            <div className="flex gap-5 overflow-hidden"
              style={{ transform: `translateX(calc(-${scrollIndex} * (${288 + 20}px)))`, transition: "transform 300ms cubic-bezier(0.23,1,0.32,1)" }}>
              {products.map((product) => (
                <ProductCard key={product.id} product={product} isPlaceholder={isPlaceholder} />
              ))}
            </div>
            {/* Navigation */}
            {maxIndex > 0 && (
              <div className="flex items-center gap-3 mt-8">
                <button onClick={() => setScrollIndex(Math.max(0, scrollIndex - 1))}
                  disabled={scrollIndex === 0}
                  className="w-10 h-10 rounded-full border-2 border-[oklch(0.22_0.08_265)] flex items-center justify-center hover:bg-[oklch(0.22_0.08_265)] hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                  <ChevronLeft size={18} />
                </button>
                <div className="flex gap-2">
                  {Array.from({ length: maxIndex + 1 }).map((_, i) => (
                    <button key={i} onClick={() => setScrollIndex(i)}
                      className={`w-2 h-2 rounded-full transition-all ${i === scrollIndex ? "bg-[oklch(0.22_0.08_265)] w-6" : "bg-gray-300 hover:bg-gray-400"}`} />
                  ))}
                </div>
                <button onClick={() => setScrollIndex(Math.min(maxIndex, scrollIndex + 1))}
                  disabled={scrollIndex >= maxIndex}
                  className="w-10 h-10 rounded-full border-2 border-[oklch(0.22_0.08_265)] flex items-center justify-center hover:bg-[oklch(0.22_0.08_265)] hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
