import { useState } from "react";
import { Link, useParams } from "wouter";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  FlaskConical,
  Leaf,
  Loader2,
  Minus,
  MapPin,
  Package,
  Plus,
  RotateCcw,
  ShoppingCart,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import AnnouncementBar from "@/components/AnnouncementBar";
import NewsletterSection from "@/components/NewsletterSection";

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

const TRUST_BADGES = [
  { icon: Leaf, label: "100% Natural" },
  { icon: FlaskConical, label: "Lab Tested" },
  { icon: MapPin, label: "Made in USA" },
  { icon: RotateCcw, label: "60-Day Returns" },
];

function Accordion({ title, content, defaultOpen = false }: { title: string; content: string; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between gap-4 p-4 text-left">
        <span className="font-bold text-sm text-[oklch(0.22_0.08_265)]">{title}</span>
        {open ? <ChevronUp size={16} className="text-[oklch(0.62_0.25_340)] flex-shrink-0" /> : <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />}
      </button>
      {open && <div className="px-4 pb-4 text-sm text-gray-600 leading-relaxed whitespace-pre-line">{content}</div>}
    </div>
  );
}

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading } = trpc.catalog.product.useQuery({ slug: slug ?? "" }, { enabled: Boolean(slug) });

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
  const [selectedBundleId, setSelectedBundleId] = useState<number | null>(null);
  const [qty, setQty] = useState(1);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center gap-2 text-gray-400">
        <Loader2 size={22} className="animate-spin" /> Loading product...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-center px-4">
        <Package size={40} className="text-gray-300" strokeWidth={1.5} />
        <p className="text-gray-500">Product not found.</p>
        <Link href="/collections/all" className="text-sm font-bold text-[oklch(0.62_0.25_340)]">← Back to Shop</Link>
      </div>
    );
  }

  const selectedVariant = product.variants.find(v => v.id === selectedVariantId) ?? product.variants[0] ?? null;
  const selectedBundle = product.bundles.find(b => b.id === selectedBundleId) ?? product.bundles[0] ?? null;

  const hasBundles = product.bundles.length > 0;
  const priceCents = hasBundles ? (selectedBundle?.priceCents ?? 0) : (selectedVariant?.priceCents ?? 0);
  const compareAtCents = hasBundles ? selectedBundle?.compareAtCents : selectedVariant?.compareAtCents;
  const savingsPct = compareAtCents && compareAtCents > priceCents
    ? Math.round((1 - priceCents / compareAtCents) * 100)
    : null;

  const inStock = hasBundles ? true : Boolean(selectedVariant && selectedVariant.stock > 0);
  const images = product.images;
  const activeImage = images[selectedImage] ?? images[0];

  const accordions = [
    { title: "Ingredients", content: product.ingredients },
    { title: "How to Take", content: product.howToTake },
    { title: "Disclaimer", content: product.disclaimer },
  ].filter((a): a is { title: string; content: string } => Boolean(a.content));

  return (
    <div className="min-h-screen flex flex-col">
      <AnnouncementBar />
      <main className="flex-1">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-4">
          <Link href="/collections/all" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[oklch(0.22_0.08_265)] transition-colors font-medium">
            <ArrowLeft size={14} /> Back to Shop
          </Link>
        </div>

        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
            {/* Gallery — thumbnails on the left, main image on the right */}
            <div className="flex gap-3">
              {images.length > 1 && (
                <div className="flex flex-col gap-2 w-16 sm:w-20 shrink-0">
                  {images.map((img, i) => (
                    <button key={img.id} onClick={() => setSelectedImage(i)}
                      className={`aspect-square rounded-xl overflow-hidden border-2 transition-colors ${i === selectedImage ? "border-[oklch(0.62_0.25_340)]" : "border-transparent"}`}>
                      <img src={img.url} alt={img.alt ?? ""} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
              <div className="flex-1 aspect-square bg-gray-100 rounded-3xl overflow-hidden min-w-0">
                {activeImage ? (
                  <img src={activeImage.url} alt={activeImage.alt ?? product.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                    <Package size={40} strokeWidth={1.5} />
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="space-y-5">
              <div>
                {product.category && (
                  <p className="text-xs font-bold uppercase tracking-widest text-[oklch(0.62_0.25_340)] mb-2">{product.category.name}</p>
                )}
                <h1 className="font-condensed font-black text-3xl md:text-4xl text-[oklch(0.22_0.08_265)] tracking-tight leading-tight">
                  {product.title}
                </h1>
              </div>

              {/* Benefit icons */}
              <div className="flex flex-wrap gap-4">
                {TRUST_BADGES.map(({ icon: Icon, label }) => (
                  <span key={label} className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600">
                    <Icon size={14} className="text-[oklch(0.62_0.25_340)]" /> {label}
                  </span>
                ))}
              </div>

              {/* Bundle selector */}
              {hasBundles && (
                <div>
                  <p className="text-sm font-bold text-[oklch(0.22_0.08_265)] mb-2">Choose a package</p>
                  <div className="flex flex-wrap gap-2">
                    {product.bundles.map(b => (
                      <button key={b.id} onClick={() => setSelectedBundleId(b.id)}
                        className={`relative px-4 py-2.5 rounded-xl border-2 font-bold text-sm transition-all ${(selectedBundle?.id ?? product.bundles[0]?.id) === b.id ? "border-[oklch(0.22_0.08_265)] bg-[oklch(0.22_0.08_265)] text-white" : "border-gray-200 text-gray-700 hover:border-[oklch(0.22_0.08_265)]"}`}>
                        {b.badge && (
                          <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[oklch(0.62_0.25_340)] text-white text-[0.6rem] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                            {b.badge}
                          </span>
                        )}
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Price */}
              <div className="flex items-center gap-3">
                <span className="font-extrabold text-2xl text-[oklch(0.22_0.08_265)]">{formatCents(priceCents)}</span>
                {compareAtCents ? <span className="text-lg text-gray-400 line-through">{formatCents(compareAtCents)}</span> : null}
                {savingsPct ? <span className="bg-[oklch(0.62_0.25_340)] text-white text-xs font-bold px-2.5 py-1 rounded-full">Save {savingsPct}%</span> : null}
              </div>

              {/* Variant / flavor selector */}
              {product.variants.length > 1 && (
                <div>
                  <p className="text-sm font-bold text-[oklch(0.22_0.08_265)] mb-2">Flavor: <span className="font-normal text-gray-500">{selectedVariant?.title}</span></p>
                  <div className="flex flex-wrap gap-3">
                    {product.variants.map(v => (
                      <button key={v.id} onClick={() => setSelectedVariantId(v.id)} title={v.title}
                        className={`w-12 h-12 rounded-full overflow-hidden border-2 transition-all flex items-center justify-center text-xs font-bold uppercase ${selectedVariant?.id === v.id ? "border-[oklch(0.62_0.25_340)] scale-105" : "border-gray-200"} ${v.stock <= 0 ? "opacity-40" : ""}`}>
                        {v.imageUrl ? (
                          <img src={v.imageUrl} alt={v.title} className="w-full h-full object-cover" />
                        ) : (
                          <span className="bg-gray-100 w-full h-full flex items-center justify-center text-gray-500">{v.title.slice(0, 2)}</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Qty + Add to cart */}
              <div className="flex gap-3">
                <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-7 h-7 rounded-lg bg-white flex items-center justify-center hover:bg-gray-50 transition-colors" aria-label="Decrease quantity">
                    <Minus size={14} />
                  </button>
                  <span className="w-8 text-center font-bold text-base">{qty}</span>
                  <button onClick={() => setQty(q => q + 1)} className="w-7 h-7 rounded-lg bg-white flex items-center justify-center hover:bg-gray-50 transition-colors" aria-label="Increase quantity">
                    <Plus size={14} />
                  </button>
                </div>
                <button disabled title="Checkout is coming soon"
                  className="flex-1 bg-gray-300 text-white font-extrabold text-base py-3 rounded-xl cursor-not-allowed flex items-center justify-center gap-2">
                  <ShoppingCart size={18} />
                  Coming soon
                </button>
              </div>
              {!inStock && !hasBundles && (
                <p className="text-sm font-semibold text-red-500">This flavor is currently sold out.</p>
              )}

              <Link href="/lab-reports" className="inline-block text-sm font-bold text-[oklch(0.62_0.25_340)] hover:underline">
                View lab reports for this product →
              </Link>

              {product.description && (
                <div className="prose prose-sm max-w-none text-gray-600 pt-4 border-t border-gray-100">
                  <p className="whitespace-pre-line">{product.description}</p>
                </div>
              )}

              {accordions.length > 0 && (
                <div className="space-y-3 pt-2">
                  {accordions.map(a => <Accordion key={a.title} title={a.title} content={a.content} />)}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <NewsletterSection />
    </div>
  );
}
