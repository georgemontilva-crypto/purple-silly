import { useEffect, useState } from "react";
import { Link, useParams } from "wouter";
import { Loader2, Package, ShoppingCart, Star } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useCart } from "@/contexts/CartContext";
import NewsletterSection from "@/components/NewsletterSection";
import { Reveal, RevealItem, RevealStagger } from "@/components/motion/Reveal";

function formatPrice(cents: number | null): string {
  if (cents === null) return "—";
  return `$${(cents / 100).toFixed(2)}`;
}

type CatalogProduct = {
  id: number;
  title: string;
  slug: string;
  priceCents: number | null;
  compareAtCents: number | null;
  imageUrl: string | null;
  imageAlt: string;
  inStock: boolean;
  categorySlug: string | null;
};

function ProductCard({ product }: { product: CatalogProduct }) {
  const { addItem, isLoading } = useCart();
  return (
    <div className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 flex flex-col">
      <Link href={`/products/${product.slug}`}>
        <div className="aspect-square bg-gray-100 overflow-hidden relative">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.imageAlt}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-2">
              <Package size={32} strokeWidth={1.5} />
            </div>
          )}
          {!product.inStock && (
            <span className="absolute top-3 left-3 bg-gray-900 text-white text-[0.65rem] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full">
              Sold Out
            </span>
          )}
        </div>
        <div className="p-4 flex-1">
          <div className="flex gap-0.5 mb-2">
            {[1, 2, 3, 4, 5].map(i => (
              <Star
                key={i}
                size={12}
                className="fill-[oklch(0.92_0.18_95)] text-[oklch(0.92_0.18_95)]"
              />
            ))}
          </div>
          <h3 className="font-bold text-sm text-[oklch(0.22_0.08_265)] mb-1 line-clamp-2">
            {product.title}
          </h3>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xs text-gray-400">From</span>
            <p className="font-extrabold text-base text-[oklch(0.22_0.08_265)]">
              {formatPrice(product.priceCents)}
            </p>
            {product.compareAtCents &&
            product.priceCents &&
            product.compareAtCents > product.priceCents ? (
              <span className="text-xs text-gray-400 line-through">
                {formatPrice(product.compareAtCents)}
              </span>
            ) : null}
          </div>
        </div>
      </Link>
      <div className="px-4 pb-4">
        <button
          onClick={() =>
            product.inStock &&
            addItem(String(product.id), 1, {
              title: product.title,
              variantTitle: "Default",
              price: {
                amount: product.priceCents
                  ? (product.priceCents / 100).toFixed(2)
                  : "0",
                currencyCode: "USD",
              },
              image: product.imageUrl
                ? { url: product.imageUrl, altText: product.imageAlt }
                : null,
            })
          }
          disabled={isLoading || !product.inStock}
          className="w-full bg-[oklch(0.22_0.08_265)] text-white font-bold text-sm py-3 rounded-xl hover:bg-[oklch(0.62_0.25_340)] transition-colors active:scale-[0.97] disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <ShoppingCart size={14} /> {product.inStock ? "Shop Now" : "Sold Out"}
        </button>
      </div>
    </div>
  );
}

export default function ShopPage() {
  const params = useParams<{ categorySlug?: string }>();
  const routeCategory =
    params.categorySlug && params.categorySlug !== "all"
      ? params.categorySlug
      : "";
  const [categorySlug, setCategorySlug] = useState(routeCategory);

  // Keep local filter state in sync when navigating here via a category link
  // (e.g. /collections/silly-dots) rather than clicking a filter pill in place.
  useEffect(() => setCategorySlug(routeCategory), [routeCategory]);

  const { data: categories } = trpc.catalog.categories.useQuery();
  const { data: products, isLoading } = trpc.catalog.list.useQuery({
    categorySlug: categorySlug || undefined,
    limit: 100,
  });

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 py-12">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
          <Reveal className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <h1 className="font-condensed font-black text-4xl md:text-5xl text-white tracking-tight">
              Shop All
            </h1>
            {categories && categories.length > 0 && (
              <div className="flex bg-white rounded-2xl p-1 gap-1 shadow-sm border border-gray-100 self-start flex-wrap">
                <button
                  onClick={() => setCategorySlug("")}
                  className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${categorySlug === "" ? "bg-[oklch(0.22_0.08_265)] text-white" : "text-gray-500 hover:text-[oklch(0.22_0.08_265)]"}`}
                >
                  All Products
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setCategorySlug(cat.slug)}
                    className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${categorySlug === cat.slug ? "bg-[oklch(0.22_0.08_265)] text-white" : "text-gray-500 hover:text-[oklch(0.22_0.08_265)]"}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}
          </Reveal>

          {isLoading ? (
            <div className="flex items-center justify-center gap-2 text-gray-400 py-24">
              <Loader2 size={20} className="animate-spin" /> Loading products...
            </div>
          ) : !products || products.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-24 text-center text-gray-400">
              <Package size={40} strokeWidth={1.5} />
              <p className="text-base">
                No products here yet — check back soon.
              </p>
            </div>
          ) : (
            <RevealStagger className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {products.map(p => (
                <RevealItem key={p.id}>
                  <ProductCard product={p} />
                </RevealItem>
              ))}
            </RevealStagger>
          )}
        </div>
      </main>
      <Reveal>
        <NewsletterSection />
      </Reveal>
    </div>
  );
}
