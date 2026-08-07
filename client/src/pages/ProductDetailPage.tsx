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
import { useCart } from "@/contexts/CartContext";
import NewsletterSection from "@/components/NewsletterSection";
import { Reveal, RevealItem, RevealStagger } from "@/components/motion/Reveal";

const C = {
  vivid: "oklch(0.52 0.28 295)",
  pink: "oklch(0.72 0.22 320)",
};

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

const TRUST_BADGES = [
  { icon: Leaf, label: "100% Natural" },
  { icon: FlaskConical, label: "Lab Tested" },
  { icon: MapPin, label: "Made in USA" },
  { icon: RotateCcw, label: "60-Day Returns" },
];

function Accordion({
  title,
  content,
  defaultOpen = false,
}: {
  title: string;
  content: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div
      className="border border-border rounded-2xl overflow-hidden"
      style={{ background: "oklch(0.15 0.06 295)" }}
    >
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-4 p-4 text-left"
      >
        <span className="font-bold text-sm text-foreground">{title}</span>
        {open ? (
          <ChevronUp
            size={16}
            className="text-[oklch(0.72_0.22_320)] flex-shrink-0"
          />
        ) : (
          <ChevronDown
            size={16}
            className="text-muted-foreground flex-shrink-0"
          />
        )}
      </button>
      {open && (
        <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
          {content}
        </div>
      )}
    </div>
  );
}

export default function ProductDetailPage() {
  const { addItem } = useCart();
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading } = trpc.catalog.product.useQuery(
    { slug: slug ?? "" },
    { enabled: Boolean(slug) }
  );

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(
    null
  );
  const [selectedBundleId, setSelectedBundleId] = useState<number | null>(null);
  const [qty, setQty] = useState(1);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center gap-2 text-muted-foreground">
        <Loader2 size={22} className="animate-spin" /> Loading product...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-center px-4">
        <Package
          size={40}
          className="text-muted-foreground"
          strokeWidth={1.5}
        />
        <p className="text-muted-foreground">Product not found.</p>
        <Link
          href="/collections/all"
          className="text-sm font-bold text-[oklch(0.72_0.22_320)]"
        >
          ← Back to Shop
        </Link>
      </div>
    );
  }

  const selectedVariant =
    product.variants.find(v => v.id === selectedVariantId) ??
    product.variants[0] ??
    null;
  const selectedBundle =
    product.bundles.find(b => b.id === selectedBundleId) ??
    product.bundles[0] ??
    null;

  const hasBundles = product.bundles.length > 0;
  const priceCents = hasBundles
    ? (selectedBundle?.priceCents ?? 0)
    : (selectedVariant?.priceCents ?? 0);
  const compareAtCents = hasBundles
    ? selectedBundle?.compareAtCents
    : selectedVariant?.compareAtCents;
  const savingsPct =
    compareAtCents && compareAtCents > priceCents
      ? Math.round((1 - priceCents / compareAtCents) * 100)
      : null;

  const inStock = hasBundles
    ? true
    : Boolean(selectedVariant && selectedVariant.stock > 0);
  const images = product.images;
  const activeImage = images[selectedImage] ?? images[0];

  const accordions = [
    { title: "Ingredients", content: product.ingredients },
    { title: "How to Take", content: product.howToTake },
    { title: "Disclaimer", content: product.disclaimer },
  ].filter((a): a is { title: string; content: string } => Boolean(a.content));

  // Entirely admin-managed, per product — nothing hardcoded. No title, no section.
  const secretCards = (
    (product.secretCards as { title: string; description: string }[] | null) ??
    []
  ).filter(c => c.title?.trim());

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-4">
          <Link
            href="/collections/all"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
          >
            <ArrowLeft size={14} /> Back to Shop
          </Link>
        </div>

        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
            {/* Gallery — thumbnails on the left, main image on the right (mobile:
                main image on top, thumbnail strip scrolls horizontally below it) */}
            <Reveal className="flex flex-col-reverse sm:flex-row gap-3">
              {images.length > 1 && (
                <div className="flex sm:flex-col gap-2 overflow-x-auto sm:overflow-visible sm:w-20 shrink-0">
                  {images.map((img, i) => (
                    <button
                      key={img.id}
                      onClick={() => setSelectedImage(i)}
                      className={`aspect-square w-16 sm:w-full shrink-0 rounded-xl overflow-hidden border-2 transition-colors ${i === selectedImage ? "border-[oklch(0.72_0.22_320)]" : "border-transparent"}`}
                    >
                      <img
                        src={img.url}
                        alt={img.alt ?? ""}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
              <div
                className="flex-1 aspect-square rounded-3xl overflow-hidden min-w-0"
                style={{ background: "oklch(0.20 0.08 295)" }}
              >
                {activeImage ? (
                  <img
                    src={activeImage.url}
                    alt={activeImage.alt ?? product.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                    <Package size={40} strokeWidth={1.5} />
                  </div>
                )}
              </div>
              {/* Dots — mobile only, mirror the thumbnail strip when there's more than one image */}
              {images.length > 1 && (
                <div className="flex sm:hidden justify-center gap-1.5">
                  {images.map((img, i) => (
                    <button
                      key={img.id}
                      onClick={() => setSelectedImage(i)}
                      aria-label={`Image ${i + 1}`}
                      className="h-1.5 rounded-full transition-all"
                      style={{
                        width: i === selectedImage ? 18 : 6,
                        background:
                          i === selectedImage
                            ? C.pink
                            : "rgba(255,255,255,0.2)",
                      }}
                    />
                  ))}
                </div>
              )}
            </Reveal>

            {/* Info */}
            <Reveal className="space-y-7">
              <div className="space-y-2">
                {product.category && (
                  <p className="text-xs font-bold uppercase tracking-widest text-[oklch(0.72_0.22_320)]">
                    {product.category.name}
                  </p>
                )}
                <h1 className="font-condensed font-black text-3xl md:text-4xl text-white tracking-tight leading-tight">
                  {product.title}
                </h1>
                {product.description && (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {product.description}
                  </p>
                )}
              </div>

              {/* Benefit icons — 2x2 on mobile, single row from sm: up */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {TRUST_BADGES.map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="flex items-center gap-2.5 sm:flex-col sm:text-center sm:gap-1.5"
                  >
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                      style={{
                        background: "oklch(0.52 0.28 295 / 20%)",
                        color: C.pink,
                      }}
                    >
                      <Icon size={16} />
                    </div>
                    <span className="text-xs font-semibold text-white/80 leading-tight">
                      {label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Bundle selector + price are one visually connected unit —
                  a shared card, not two separate floating blocks. */}
              {hasBundles ? (
                <div
                  className="rounded-2xl border border-white/10 p-4 space-y-4"
                  style={{ background: "oklch(0.20 0.08 295)" }}
                >
                  <div>
                    <p className="text-sm font-bold text-foreground mb-2.5">
                      Choose quantity
                    </p>
                    <div className="flex gap-2">
                      {product.bundles.map(b => {
                        const isActive =
                          (selectedBundle?.id ?? product.bundles[0]?.id) ===
                          b.id;
                        return (
                          <button
                            key={b.id}
                            onClick={() => setSelectedBundleId(b.id)}
                            className={`relative flex-1 px-3 py-2.5 rounded-xl border-2 font-bold text-sm transition-all flex flex-col items-center ${isActive ? "border-black bg-black text-white" : "border-white/15 text-white hover:border-white/40"}`}
                          >
                            {b.badge && (
                              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[oklch(0.72_0.22_320)] text-white text-[0.6rem] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                                {b.badge}
                              </span>
                            )}
                            <span>{b.label}</span>
                            <span
                              className={`text-xs font-semibold mt-0.5 ${isActive ? "text-white/70" : "text-white/55"}`}
                            >
                              {formatCents(b.priceCents)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap pt-3 border-t border-white/10">
                    <span className="font-extrabold text-3xl text-white">
                      {formatCents(priceCents)}
                    </span>
                    {compareAtCents ? (
                      <span className="text-lg text-white/35 line-through">
                        {formatCents(compareAtCents)}
                      </span>
                    ) : null}
                    {savingsPct ? (
                      <span className="bg-[oklch(0.72_0.22_320)] text-white text-xs font-bold px-2.5 py-1 rounded-full">
                        Save {savingsPct}%
                      </span>
                    ) : null}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-extrabold text-3xl text-white">
                    {formatCents(priceCents)}
                  </span>
                  {compareAtCents ? (
                    <span className="text-lg text-white/35 line-through">
                      {formatCents(compareAtCents)}
                    </span>
                  ) : null}
                  {savingsPct ? (
                    <span className="bg-[oklch(0.72_0.22_320)] text-white text-xs font-bold px-2.5 py-1 rounded-full">
                      Save {savingsPct}%
                    </span>
                  ) : null}
                </div>
              )}

              {/* Qty + Add to cart — always one row, button fills the rest */}
              <div className="flex gap-3">
                <div
                  className="flex items-center gap-1 rounded-xl p-1 shrink-0"
                  style={{ background: "oklch(0.20 0.08 295)" }}
                >
                  <button
                    onClick={() => setQty(q => Math.max(1, q - 1))}
                    className="w-11 h-11 rounded-lg text-white flex items-center justify-center transition-colors"
                    style={{ background: "oklch(0.26 0.10 295)" }}
                    onMouseEnter={e =>
                      (e.currentTarget.style.background =
                        "oklch(0.32 0.12 295)")
                    }
                    onMouseLeave={e =>
                      (e.currentTarget.style.background =
                        "oklch(0.26 0.10 295)")
                    }
                    aria-label="Decrease quantity"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-9 text-center font-bold text-base text-white">
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty(q => q + 1)}
                    className="w-11 h-11 rounded-lg text-white flex items-center justify-center transition-colors"
                    style={{ background: "oklch(0.26 0.10 295)" }}
                    onMouseEnter={e =>
                      (e.currentTarget.style.background =
                        "oklch(0.32 0.12 295)")
                    }
                    onMouseLeave={e =>
                      (e.currentTarget.style.background =
                        "oklch(0.26 0.10 295)")
                    }
                    aria-label="Increase quantity"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <button
                  onClick={() =>
                    addItem({
                      productId: product.id,
                      // Only send the ids the product actually offers, so a
                      // product without variants doesn't get a phantom
                      // variantId baked into its cart line's identity.
                      variantId: product.variants.length
                        ? selectedVariant?.id
                        : null,
                      bundleId: hasBundles ? selectedBundle?.id : null,
                      title: product.title,
                      variantTitle: product.variants.length
                        ? (selectedVariant?.title ?? null)
                        : null,
                      bundleLabel: hasBundles
                        ? (selectedBundle?.label ?? null)
                        : null,
                      // priceCents already resolves bundle-vs-variant above,
                      // so the cart stores what the page is showing.
                      unitPriceCents: priceCents,
                      slug: product.slug,
                      imageUrl: activeImage?.url ?? null,
                      quantity: qty,
                    })
                  }
                  disabled={!inStock}
                  className="flex-1 font-extrabold text-base py-3 rounded-xl flex items-center justify-center gap-2 border transition-all disabled:cursor-not-allowed"
                  style={
                    inStock
                      ? {
                          background:
                            "linear-gradient(135deg, oklch(0.62 0.28 295), oklch(0.72 0.22 320))",
                          borderColor: "transparent",
                          color: "#fff",
                        }
                      : {
                          background: "oklch(0.18 0.07 295)",
                          borderColor: "oklch(0.26 0.10 295)",
                          color: "rgba(255,255,255,0.45)",
                        }
                  }
                >
                  <ShoppingCart size={18} />
                  {inStock ? "Add to Cart" : "Sold out"}
                </button>
              </div>
              {!inStock && !hasBundles && (
                <p className="text-sm font-semibold text-red-400">
                  This flavor is currently sold out.
                </p>
              )}

              {/* Variant / flavor selector — circular swatch, name below each */}
              {product.variants.length > 1 && (
                <div>
                  <p className="text-sm font-bold text-foreground mb-2.5">
                    Flavor
                  </p>
                  <div className="flex flex-wrap gap-4">
                    {product.variants.map(v => (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariantId(v.id)}
                        title={v.title}
                        className={`flex flex-col items-center gap-1.5 ${v.stock <= 0 ? "opacity-40" : ""}`}
                      >
                        <span
                          className={`w-12 h-12 rounded-full overflow-hidden border-2 transition-all flex items-center justify-center text-xs font-bold uppercase text-white ${selectedVariant?.id === v.id ? "border-[oklch(0.72_0.22_320)] scale-105" : "border-white/20"}`}
                        >
                          {v.imageUrl ? (
                            <img
                              src={v.imageUrl}
                              alt={v.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span
                              className="w-full h-full flex items-center justify-center"
                              style={{ background: "oklch(0.24 0.09 295)" }}
                            >
                              {v.title.slice(0, 2)}
                            </span>
                          )}
                        </span>
                        <span
                          className={`text-xs font-semibold ${selectedVariant?.id === v.id ? "text-white" : "text-muted-foreground"}`}
                        >
                          {v.title}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <Link
                href="/lab-reports"
                className="inline-block text-sm font-bold text-[oklch(0.72_0.22_320)] hover:underline"
              >
                View lab reports for this product →
              </Link>

              {accordions.length > 0 && (
                <RevealStagger className="space-y-3">
                  {accordions.map(a => (
                    <RevealItem key={a.title}>
                      <Accordion title={a.title} content={a.content} />
                    </RevealItem>
                  ))}
                </RevealStagger>
              )}
            </Reveal>
          </div>

          {/* Secret Trick — fully admin-managed per product; renders nothing
              if the admin hasn't set a title for this product. */}
          {product.secretTitle && (
            <Reveal className="mt-10 sm:mt-14">
              <section
                className="rounded-3xl overflow-hidden border border-border"
                style={{ background: "oklch(0.13 0.05 295)" }}
              >
                {product.secretImageUrl && (
                  <div className="aspect-[21/9] overflow-hidden">
                    <img
                      src={product.secretImageUrl}
                      alt={product.secretTitle}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-6 sm:p-10">
                  <h2 className="font-condensed font-black text-2xl sm:text-3xl text-white mb-2">
                    {product.secretTitle}
                  </h2>
                  {product.secretSubtitle && (
                    <p className="text-sm text-muted-foreground mb-6 max-w-2xl">
                      {product.secretSubtitle}
                    </p>
                  )}
                  {secretCards.length > 0 && (
                    <RevealStagger className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                      {secretCards.map((card, i) => (
                        <RevealItem key={i}>
                          <div
                            className="rounded-2xl p-4 h-full border"
                            style={{
                              background: "oklch(0.20 0.08 295)",
                              borderColor: "oklch(0.52 0.28 295 / 25%)",
                            }}
                          >
                            <h3 className="font-bold text-sm text-white mb-1.5">
                              {card.title}
                            </h3>
                            {card.description && (
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                {card.description}
                              </p>
                            )}
                          </div>
                        </RevealItem>
                      ))}
                    </RevealStagger>
                  )}
                </div>
              </section>
            </Reveal>
          )}
        </div>
      </main>
      <Reveal>
        <NewsletterSection />
      </Reveal>
    </div>
  );
}
