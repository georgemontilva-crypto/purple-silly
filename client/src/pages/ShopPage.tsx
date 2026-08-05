import { useState } from "react";
import { Link } from "wouter";
import { Star, ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import AnnouncementBar from "@/components/AnnouncementBar";
import NewsletterSection from "@/components/NewsletterSection";

// TODO: reemplazar por catálogo propio (tablas locales) cuando esté listo.
interface CatalogProduct {
  id: string;
  handle: string;
  title: string;
  description: string;
  featuredImage: { url: string; altText: string | null } | null;
  priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
  variants: { nodes: Array<{ id: string; availableForSale: boolean }> };
  productType: string;
}

function formatPrice(price: { amount: string; currencyCode: string }): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: price.currencyCode,
  }).format(parseFloat(price.amount));
}

const PLACEHOLDER_PRODUCTS: CatalogProduct[] = [
  { id: "p1", handle: "party-tablets-blue-razz", title: "Party Tablets - Blue Razz", description: "High-energy euphoria for late-night socializing.", featuredImage: null, priceRange: { minVariantPrice: { amount: "24.99", currencyCode: "USD" } }, variants: { nodes: [{ id: "v1", availableForSale: true }] }, productType: "Tablets" },
  { id: "p2", handle: "party-tablets-pink-stardust", title: "Party Tablets - Pink Stardust", description: "High-energy euphoria for late-night socializing.", featuredImage: null, priceRange: { minVariantPrice: { amount: "24.99", currencyCode: "USD" } }, variants: { nodes: [{ id: "v2", availableForSale: true }] }, productType: "Tablets" },
  { id: "p3", handle: "party-tablets-citrus-twist", title: "Party Tablets - Citrus Twist", description: "High-energy euphoria for late-night socializing.", featuredImage: null, priceRange: { minVariantPrice: { amount: "24.99", currencyCode: "USD" } }, variants: { nodes: [{ id: "v3", availableForSale: true }] }, productType: "Tablets" },
  { id: "p4", handle: "daily-mood-gummies-blue-razz", title: "Daily Mood Gummies - Blue Razz", description: "Daily mood support, social ease, and focus.", featuredImage: null, priceRange: { minVariantPrice: { amount: "29.99", currencyCode: "USD" } }, variants: { nodes: [{ id: "v4", availableForSale: true }] }, productType: "Gummies" },
  { id: "p5", handle: "daily-mood-gummies-sour-cherry", title: "Daily Mood Gummies - Sour Cherry", description: "Daily mood support, social ease, and focus.", featuredImage: null, priceRange: { minVariantPrice: { amount: "29.99", currencyCode: "USD" } }, variants: { nodes: [{ id: "v5", availableForSale: true }] }, productType: "Gummies" },
  { id: "p6", handle: "daily-mood-gummies-watermelon", title: "Daily Mood Gummies - Watermelon", description: "Daily mood support, social ease, and focus.", featuredImage: null, priceRange: { minVariantPrice: { amount: "29.99", currencyCode: "USD" } }, variants: { nodes: [{ id: "v6", availableForSale: true }] }, productType: "Gummies" },
];

function ProductCard({ product }: { product: CatalogProduct }) {
  const { addItem, isLoading } = useCart();
  const firstVariant = product.variants.nodes[0];
  const price = product.priceRange.minVariantPrice;
  return (
    <div className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 flex flex-col">
      <Link href={`/products/${product.handle}`}>
        <div className="aspect-square bg-gray-100 overflow-hidden relative">
          {product.featuredImage ? (
            <img src={product.featuredImage.url} alt={product.featuredImage.altText ?? product.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-2">
              <div className="w-20 h-20 bg-gray-200 rounded-2xl" />
              <span className="text-xs font-medium">600×600px</span>
            </div>
          )}
        </div>
        <div className="p-4 flex-1">
          <div className="flex gap-0.5 mb-2">
            {[1,2,3,4,5].map(i => <Star key={i} size={12} className="fill-[oklch(0.92_0.18_95)] text-[oklch(0.92_0.18_95)]" />)}
          </div>
          <h3 className="font-bold text-sm text-[oklch(0.22_0.08_265)] mb-1 line-clamp-2">{product.title}</h3>
          <p className="text-xs text-gray-500 mb-3 line-clamp-2">{product.description}</p>
          <p className="font-extrabold text-base text-[oklch(0.22_0.08_265)]">{formatPrice(price)}</p>
        </div>
      </Link>
      <div className="px-4 pb-4">
        <button onClick={() => firstVariant && addItem(firstVariant.id)} disabled={isLoading || !firstVariant?.availableForSale}
          className="w-full bg-[oklch(0.22_0.08_265)] text-white font-bold text-sm py-3 rounded-xl hover:bg-[oklch(0.62_0.25_340)] transition-colors active:scale-[0.97] disabled:opacity-50 flex items-center justify-center gap-2">
          <ShoppingCart size={14} /> Shop Now
        </button>
      </div>
    </div>
  );
}

export default function ShopPage() {
  // TODO: reemplazar por catálogo propio (tablas locales) cuando esté listo.
  const [filter, setFilter] = useState<"all" | "tablets" | "gummies">("all");

  const filtered = filter === "all" ? PLACEHOLDER_PRODUCTS
    : PLACEHOLDER_PRODUCTS.filter(p => filter === "tablets" ? p.productType === "Tablets" : p.productType === "Gummies");

  return (
    <div className="min-h-screen flex flex-col">
      <AnnouncementBar />
      <main className="flex-1 py-12">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <h1 className="font-condensed font-black text-4xl md:text-5xl text-[oklch(0.22_0.08_265)] tracking-tight">Shop All</h1>
            <div className="flex bg-white rounded-2xl p-1 gap-1 shadow-sm border border-gray-100 self-start">
              {([["all","All Products"],["tablets","Party Tablets"],["gummies","Daily Mood Gummies"]] as [typeof filter, string][]).map(([f, label]) => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${filter === f ? "bg-[oklch(0.22_0.08_265)] text-white" : "text-gray-500 hover:text-[oklch(0.22_0.08_265)]"}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filtered.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </main>
      <NewsletterSection />
    </div>
  );
}

