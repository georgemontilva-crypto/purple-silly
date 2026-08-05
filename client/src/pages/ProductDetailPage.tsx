import { useState } from "react";
import { Link } from "wouter";
import { Star, ChevronDown, ChevronUp, ShoppingCart, ArrowLeft } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import AnnouncementBar from "@/components/AnnouncementBar";
import NewsletterSection from "@/components/NewsletterSection";

// TODO: reemplazar por catálogo propio (tablas locales) cuando esté listo.
interface CatalogVariant {
  id: string;
  title: string;
  price: { amount: string; currencyCode: string };
  compareAtPrice: { amount: string; currencyCode: string } | null;
  availableForSale: boolean;
  selectedOptions: { name: string; value: string }[];
}

interface CatalogProduct {
  id: string;
  handle: string;
  title: string;
  description: string;
  images: { nodes: Array<{ url: string; altText: string | null }> };
  priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
  variants: { nodes: CatalogVariant[] };
}

function formatPrice(price: { amount: string; currencyCode: string }): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: price.currencyCode,
  }).format(parseFloat(price.amount));
}

const PLACEHOLDER: CatalogProduct = {
  id: "p1", handle: "party-tablets-blue-razz",
  title: "Party Tablets - Blue Razz",
  description: "High-energy euphoria for late-night socializing. A clean, plant-powered boost for your best nights out.",
  images: { nodes: [] },
  priceRange: { minVariantPrice: { amount: "24.99", currencyCode: "USD" } },
  variants: { nodes: [
    { id: "v1", title: "1 Pack", price: { amount: "24.99", currencyCode: "USD" }, compareAtPrice: null, availableForSale: true, selectedOptions: [{ name: "Size", value: "1 Pack" }] },
    { id: "v2", title: "3 Pack", price: { amount: "64.99", currencyCode: "USD" }, compareAtPrice: { amount: "74.97", currencyCode: "USD" }, availableForSale: true, selectedOptions: [{ name: "Size", value: "3 Pack" }] },
    { id: "v3", title: "6 Pack", price: { amount: "119.99", currencyCode: "USD" }, compareAtPrice: { amount: "149.94", currencyCode: "USD" }, availableForSale: true, selectedOptions: [{ name: "Size", value: "6 Pack" }] },
  ]},
};

const expectations = [
  { emoji: "🎭", title: "Epic mood elevation", desc: "Feel genuinely uplifted and positive from the first wave." },
  { emoji: "⚡", title: "Smooth, steady energy", desc: "Clean energy without the jitters or crash." },
  { emoji: "🌙", title: "Gentle landing with no crash", desc: "A smooth, comfortable come-down every time." },
  { emoji: "☀️", title: "A brighter & more positive mindset", desc: "See the world through a more optimistic lens." },
  { emoji: "🤝", title: "Increased social ease & openness", desc: "Connect more naturally with everyone around you." },
  { emoji: "✨", title: "Clean & balanced, start to finish", desc: "No harsh peaks, no rough edges." },
];

export default function ProductDetailPage() {
  // TODO: reemplazar por catálogo propio (tablas locales) cuando esté listo,
  // buscando el producto real por :handle en vez de mostrar siempre el mismo.
  const product = PLACEHOLDER;
  const [selectedVariant, setSelectedVariant] = useState<CatalogVariant | null>(PLACEHOLDER.variants.nodes[0] ?? null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const { addItem, isLoading: cartLoading } = useCart();

  const handleAddToCart = async () => {
    if (!selectedVariant) return;
    for (let i = 0; i < qty; i++) await addItem(selectedVariant.id);
  };

  const images = product.images.nodes.length > 0 ? product.images.nodes : null;
  const price = selectedVariant?.price ?? product.priceRange.minVariantPrice;
  const compareAt = selectedVariant?.compareAtPrice;
  const discount = compareAt ? Math.round((1 - parseFloat(price.amount) / parseFloat(compareAt.amount)) * 100) : null;

  const productFaqs = [
    { q: "What's in it?", a: "Purple Organics products contain premium Kanna extract (Sceletium tortuosum), caffeine, and L-Theanine — all natural, third-party lab tested ingredients." },
    { q: "How do I take it?", a: "Take the suggested serving size listed on the label. For tablets, allow them to dissolve under your tongue for best results. For gummies, chew thoroughly." },
    { q: "Is it safe to mix with alcohol?", a: "We recommend avoiding mixing Purple Organics products with alcohol or other substances. Always use responsibly." },
    { q: "Will it show up on a drug test?", a: "Kanna (Sceletium tortuosum) is not a controlled substance and is not tested for in standard drug screenings. However, we always recommend consulting your employer or testing provider." },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <AnnouncementBar />
      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-4">
          <Link href="/collections/all" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[oklch(0.22_0.08_265)] transition-colors font-medium">
            <ArrowLeft size={14} /> Back to Shop
          </Link>
        </div>

        {/* Product section */}
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
            {/* Images */}
            <div className="space-y-3">
              <div className="aspect-square bg-gray-100 rounded-3xl overflow-hidden">
                {images ? (
                  <img src={images[selectedImage]?.url} alt={images[selectedImage]?.altText ?? product.title}
                    className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                    <div className="w-32 h-32 bg-gray-200 rounded-3xl" />
                    <span className="text-sm font-medium">800×800px product image</span>
                  </div>
                )}
              </div>
              {images && images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {images.map((img, i) => (
                    <button key={i} onClick={() => setSelectedImage(i)}
                      className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors ${i === selectedImage ? "border-[oklch(0.62_0.25_340)]" : "border-transparent"}`}>
                      <img src={img.url} alt={img.altText ?? ""} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="space-y-5">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(i => <Star key={i} size={14} className="fill-[oklch(0.92_0.18_95)] text-[oklch(0.92_0.18_95)]" />)}
                  </div>
                  <span className="text-sm text-gray-500 font-medium">4.7 (120+ reviews)</span>
                </div>
                <h1 className="font-condensed font-black text-3xl md:text-4xl text-[oklch(0.22_0.08_265)] tracking-tight leading-tight">
                  {product.title}
                </h1>
              </div>

              {/* Price */}
              <div className="flex items-center gap-3">
                <span className="font-extrabold text-2xl text-[oklch(0.22_0.08_265)]">{formatPrice(price)}</span>
                {compareAt && <span className="text-lg text-gray-400 line-through">{formatPrice(compareAt)}</span>}
                {discount && <span className="bg-[oklch(0.62_0.25_340)] text-white text-xs font-bold px-2.5 py-1 rounded-full">-{discount}%</span>}
              </div>

              {/* Variants */}
              {product.variants.nodes.length > 1 && (
                <div>
                  <p className="text-sm font-bold text-[oklch(0.22_0.08_265)] mb-2">Size</p>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.nodes.map(v => (
                      <button key={v.id} onClick={() => setSelectedVariant(v)}
                        className={`px-4 py-2 rounded-xl border-2 font-bold text-sm transition-all ${selectedVariant?.id === v.id ? "border-[oklch(0.22_0.08_265)] bg-[oklch(0.22_0.08_265)] text-white" : "border-gray-200 text-gray-700 hover:border-[oklch(0.22_0.08_265)]"}`}>
                        {v.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Qty + Add to cart */}
              <div className="flex gap-3">
                <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-7 h-7 rounded-lg bg-white flex items-center justify-center font-bold text-lg hover:bg-gray-50 transition-colors">-</button>
                  <span className="w-8 text-center font-bold text-base">{qty}</span>
                  <button onClick={() => setQty(qty + 1)} className="w-7 h-7 rounded-lg bg-white flex items-center justify-center font-bold text-lg hover:bg-gray-50 transition-colors">+</button>
                </div>
                <button onClick={handleAddToCart} disabled={cartLoading || !selectedVariant?.availableForSale}
                  className="flex-1 bg-[oklch(0.62_0.25_340)] text-white font-extrabold text-base py-3 rounded-xl hover:bg-[oklch(0.55_0.25_340)] transition-colors active:scale-[0.97] disabled:opacity-50 flex items-center justify-center gap-2">
                  <ShoppingCart size={18} />
                  {cartLoading ? "Adding..." : "Add to Cart"}
                </button>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap gap-4 py-4 border-t border-gray-100">
                {["🌿 100% Natural", "🔬 Lab Tested", "🇺🇸 Made in USA", "✓ 60-Day Returns"].map(b => (
                  <span key={b} className="text-xs font-semibold text-gray-600">{b}</span>
                ))}
              </div>

              {/* Description */}
              <div className="prose prose-sm max-w-none text-gray-600">
                <p>{product.description}</p>
              </div>
            </div>
          </div>

          {/* What to Expect */}
          <div className="mt-16">
            <h2 className="font-condensed font-black text-3xl md:text-4xl text-[oklch(0.22_0.08_265)] tracking-tight mb-8 text-center">
              ✨ What to Expect ✨
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {expectations.map(({ emoji, title, desc }) => (
                <div key={title} className="bg-[oklch(0.97_0.005_265)] rounded-2xl p-5 flex gap-4">
                  <span className="text-2xl flex-shrink-0">{emoji}</span>
                  <div>
                    <p className="font-bold text-sm text-[oklch(0.22_0.08_265)] mb-1">{title}</p>
                    <p className="text-xs text-gray-500 leading-snug">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Product FAQ */}
          <div className="mt-16 max-w-2xl mx-auto">
            <h2 className="font-condensed font-black text-3xl text-[oklch(0.22_0.08_265)] tracking-tight mb-6 text-center">
              You've Got Questions? We've Got Answers
            </h2>
            <div className="space-y-3">
              {productFaqs.map(({ q, a }, i) => (
                <div key={q} className="border border-gray-200 rounded-2xl overflow-hidden">
                  <button onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                    className="w-full flex items-center justify-between gap-4 p-4 text-left">
                    <span className="font-bold text-sm text-[oklch(0.22_0.08_265)]">{q}</span>
                    {faqOpen === i ? <ChevronUp size={16} className="text-[oklch(0.62_0.25_340)] flex-shrink-0" /> : <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />}
                  </button>
                  {faqOpen === i && <div className="px-4 pb-4 text-sm text-gray-600 leading-relaxed">{a}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <NewsletterSection />
    </div>
  );
}

