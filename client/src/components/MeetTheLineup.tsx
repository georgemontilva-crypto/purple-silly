import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Star, ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react";
import { getCollectionByHandle, ShopifyProduct, formatPrice, isShopifyConfigured } from "@/lib/shopify";
import { useCart } from "@/contexts/CartContext";

// Placeholder product data shown when Shopify is not yet configured
const PLACEHOLDER_PRODUCTS: ShopifyProduct[] = [
  {
    id: "placeholder-1", handle: "blue-razz-kanna-tablets", title: "Party Tablets - Blue Razz",
    description: "High-energy euphoria for late-night socializing.", descriptionHtml: "",
    featuredImage: null, images: { nodes: [] },
    priceRange: { minVariantPrice: { amount: "24.99", currencyCode: "USD" }, maxVariantPrice: { amount: "24.99", currencyCode: "USD" } },
    variants: { nodes: [{ id: "var-1", title: "Default", price: { amount: "24.99", currencyCode: "USD" }, compareAtPrice: null, availableForSale: true, selectedOptions: [] }] },
    tags: [], vendor: "Ferris Wheel", productType: "Tablets",
  },
  {
    id: "placeholder-2", handle: "pink-stardust-kanna-tablets", title: "Party Tablets - Pink Stardust",
    description: "High-energy euphoria for late-night socializing.", descriptionHtml: "",
    featuredImage: null, images: { nodes: [] },
    priceRange: { minVariantPrice: { amount: "24.99", currencyCode: "USD" }, maxVariantPrice: { amount: "24.99", currencyCode: "USD" } },
    variants: { nodes: [{ id: "var-2", title: "Default", price: { amount: "24.99", currencyCode: "USD" }, compareAtPrice: null, availableForSale: true, selectedOptions: [] }] },
    tags: [], vendor: "Ferris Wheel", productType: "Tablets",
  },
  {
    id: "placeholder-3", handle: "juicy-apple-kanna-tablets", title: "Party Tablets - Juicy Apple",
    description: "High-energy euphoria for late-night socializing.", descriptionHtml: "",
    featuredImage: null, images: { nodes: [] },
    priceRange: { minVariantPrice: { amount: "24.99", currencyCode: "USD" }, maxVariantPrice: { amount: "24.99", currencyCode: "USD" } },
    variants: { nodes: [{ id: "var-3", title: "Default", price: { amount: "24.99", currencyCode: "USD" }, compareAtPrice: null, availableForSale: true, selectedOptions: [] }] },
    tags: [], vendor: "Ferris Wheel", productType: "Tablets",
  },
  {
    id: "placeholder-4", handle: "citrus-twist-kanna-tablets", title: "Party Tablets - Citrus Twist",
    description: "High-energy euphoria for late-night socializing.", descriptionHtml: "",
    featuredImage: null, images: { nodes: [] },
    priceRange: { minVariantPrice: { amount: "24.99", currencyCode: "USD" }, maxVariantPrice: { amount: "24.99", currencyCode: "USD" } },
    variants: { nodes: [{ id: "var-4", title: "Default", price: { amount: "24.99", currencyCode: "USD" }, compareAtPrice: null, availableForSale: true, selectedOptions: [] }] },
    tags: [], vendor: "Ferris Wheel", productType: "Tablets",
  },
  {
    id: "placeholder-5", handle: "blue-razz-gummies", title: "Daily Mood Gummies - Blue Razz",
    description: "Daily mood support, social ease, and focus.", descriptionHtml: "",
    featuredImage: null, images: { nodes: [] },
    priceRange: { minVariantPrice: { amount: "29.99", currencyCode: "USD" }, maxVariantPrice: { amount: "29.99", currencyCode: "USD" } },
    variants: { nodes: [{ id: "var-5", title: "Default", price: { amount: "29.99", currencyCode: "USD" }, compareAtPrice: null, availableForSale: true, selectedOptions: [] }] },
    tags: [], vendor: "Ferris Wheel", productType: "Gummies",
  },
  {
    id: "placeholder-6", handle: "sour-cherry-gummies", title: "Daily Mood Gummies - Sour Cherry",
    description: "Daily mood support, social ease, and focus.", descriptionHtml: "",
    featuredImage: null, images: { nodes: [] },
    priceRange: { minVariantPrice: { amount: "29.99", currencyCode: "USD" }, maxVariantPrice: { amount: "29.99", currencyCode: "USD" } },
    variants: { nodes: [{ id: "var-6", title: "Default", price: { amount: "29.99", currencyCode: "USD" }, compareAtPrice: null, availableForSale: true, selectedOptions: [] }] },
    tags: [], vendor: "Ferris Wheel", productType: "Gummies",
  },
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

function ProductCard({ product, isPlaceholder }: { product: ShopifyProduct; isPlaceholder: boolean }) {
  const { addItem, isLoading } = useCart();
  const firstVariant = product.variants.nodes[0];
  const price = product.priceRange.minVariantPrice;
  const compareAt = firstVariant?.compareAtPrice;
  const discount = compareAt
    ? Math.round((1 - parseFloat(price.amount) / parseFloat(compareAt.amount)) * 100)
    : null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (firstVariant) addItem(firstVariant.id);
  };

  return (
    <div className="product-card group flex-shrink-0 w-64 md:w-72">
      <Link href={`/products/${product.handle}`}>
        {/* Image area */}
        <div className="relative overflow-hidden rounded-2xl bg-gray-100 mb-4"
          style={{ aspectRatio: "1 / 1" }}>
          {discount && (
            <span className="absolute top-3 left-3 z-10 bg-[oklch(0.62_0.25_340)] text-white text-xs font-bold px-2.5 py-1 rounded-full">
              -{discount}%
            </span>
          )}
          {product.featuredImage ? (
            <img src={product.featuredImage.url}
              alt={product.featuredImage.altText ?? product.title}
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
            {isPlaceholder && (
              <span className="text-xs text-gray-400 font-medium">— reviews</span>
            )}
          </div>
          <h3 className="font-bold text-sm text-[oklch(0.22_0.08_265)] leading-snug mb-1 line-clamp-2">
            {product.title}
          </h3>
          <div className="flex items-center gap-2 mb-3">
            <span className="font-extrabold text-base text-[oklch(0.22_0.08_265)]">
              {formatPrice(price)}
            </span>
            {compareAt && (
              <span className="text-sm text-gray-400 line-through">
                {formatPrice(compareAt)}
              </span>
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
  const [tabletsProducts, setTabletsProducts] = useState<ShopifyProduct[]>([]);
  const [gummiesProducts, setGummiesProducts] = useState<ShopifyProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [scrollIndex, setScrollIndex] = useState(0);
  const configured = isShopifyConfigured();

  useEffect(() => {
    if (!configured) {
      // Use placeholder split: first 4 are tablets, last 2 are gummies
      setTabletsProducts(PLACEHOLDER_PRODUCTS.filter(p => p.productType === "Tablets"));
      setGummiesProducts(PLACEHOLDER_PRODUCTS.filter(p => p.productType === "Gummies"));
      return;
    }
    setIsLoading(true);
    Promise.all([
      getCollectionByHandle("kanna-tablets", 10),
      getCollectionByHandle("kanna-gummies", 10),
    ]).then(([tablets, gummies]) => {
      setTabletsProducts(tablets?.products.nodes ?? []);
      setGummiesProducts(gummies?.products.nodes ?? []);
    }).catch(console.error)
      .finally(() => setIsLoading(false));
  }, [configured]);

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

        {!configured && (
          <div className="mb-6 bg-[oklch(0.92_0.18_95)]/20 border border-[oklch(0.92_0.18_95)] rounded-2xl px-5 py-3 text-sm text-[oklch(0.22_0.08_265)] font-medium">
            ⚡ Connect your Shopify store to display real products. Showing placeholder data.
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
                <ProductCard key={product.id} product={product} isPlaceholder={!configured} />
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

