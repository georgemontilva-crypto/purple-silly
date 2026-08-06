import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { Star, ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useSiteAssets } from "@/hooks/useSiteAssets";
import { AssetPlaceholder } from "@/components/AssetPlaceholder";

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
  { id: "1", title: "Super Silly Dots — Natural", handle: "super-silly-dots-natural", price: { amount: "14.99", currencyCode: "USD" }, image: null as string | null, rating: 4.9, reviews: 128 },
  { id: "2", title: "Super Silly Dots — Blue Razz", handle: "super-silly-dots-blue-razz", price: { amount: "14.99", currencyCode: "USD" }, image: null as string | null, rating: 4.8, reviews: 94 },
  { id: "3", title: "Super Silly Dots — Cherry Berry", handle: "super-silly-dots-cherry-berry", price: { amount: "14.99", currencyCode: "USD" }, image: null as string | null, rating: 4.7, reviews: 76 },
];

type FallbackProduct = typeof FALLBACK[0];

/* ─── Animated purple smoke canvas ─── */
function SmokeCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let w = canvas.offsetWidth;
    let h = canvas.offsetHeight;
    canvas.width = w;
    canvas.height = h;

    const resize = () => {
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width = w;
      canvas.height = h;
    };
    window.addEventListener("resize", resize);

    type Blob = { x: number; y: number; vx: number; vy: number; r: number; opacity: number; hue: number; phase: number };
    const blobs: Blob[] = Array.from({ length: 18 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.3,
      r: 80 + Math.random() * 200,
      opacity: 0.04 + Math.random() * 0.10,
      hue: 270 + Math.random() * 60,
      phase: Math.random() * Math.PI * 2,
    }));

    let t = 0;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      t += 0.008;

      blobs.forEach(b => {
        b.x += b.vx + Math.sin(t + b.phase) * 0.3;
        b.y += b.vy + Math.cos(t * 0.7 + b.phase) * 0.2;
        if (b.x < -b.r) b.x = w + b.r;
        if (b.x > w + b.r) b.x = -b.r;
        if (b.y < -b.r) b.y = h + b.r;
        if (b.y > h + b.r) b.y = -b.r;

        const pulse = 1 + 0.15 * Math.sin(t * 1.5 + b.phase);
        const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r * pulse);
        grad.addColorStop(0, `hsla(${b.hue}, 80%, 55%, ${b.opacity * 1.4})`);
        grad.addColorStop(0.5, `hsla(${b.hue + 20}, 70%, 45%, ${b.opacity * 0.6})`);
        grad.addColorStop(1, `hsla(${b.hue}, 60%, 30%, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r * pulse, 0, Math.PI * 2);
        ctx.fill();
      });

      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}

/* ─── Star rating ─── */
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

/* ─── Product card with glassmorphism ─── */
function ProductCard({ product }: { product: FallbackProduct }) {
  const { addItem } = useCart();
  const [adding, setAdding] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    setAdding(true);
    addItem(
      product.id,
      1,
      { title: product.title, variantTitle: "Default", price: product.price, image: product.image ? { url: product.image, altText: product.title } : null }
    );
    setTimeout(() => setAdding(false), 900);
  };

  return (
    <div
      className="group rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-2 flex flex-col"
      style={{
        background: "rgba(255,255,255,0.04)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        border: "1px solid rgba(168,85,247,0.25)",
        boxShadow: "0 8px 32px rgba(124,58,237,0.15), inset 0 1px 0 rgba(255,255,255,0.06)",
      }}
    >
      <Link href={`/products/${product.handle}`}>
        <div
          className="aspect-square overflow-hidden flex items-center justify-center p-6 cursor-pointer"
          style={{ background: "rgba(124,58,237,0.08)" }}
        >
          {product.image ? (
            <img
              src={product.image}
              alt={product.title}
              className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
              style={{ filter: "drop-shadow(0 12px 32px rgba(124,58,237,0.5))" }}
            />
          ) : (
            <AssetPlaceholder width={600} height={600} variant="dark" />
          )}
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
          <button
            onClick={handleAdd}
            disabled={adding}
            className="flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm text-white transition-all active:scale-95 disabled:opacity-70"
            style={{ background: adding ? C.vivid : `linear-gradient(135deg, ${C.bright}, ${C.pink})` }}
          >
            <ShoppingCart size={13} />
            {adding ? "Added!" : "Shop Now"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main section ─── */
export default function MeetTheLineup() {
  // TODO: reemplazar por catálogo propio (tablas locales) cuando esté listo.
  const { assets } = useSiteAssets("meet-the-lineup");
  const products: FallbackProduct[] = FALLBACK.map((p, i) => ({ ...p, image: assets[i]?.url ?? null }));

  return (
    <section
      className="py-24 px-4 relative overflow-hidden"
      style={{ background: "oklch(0.08 0.05 295)" }}
    >
      {/* Animated smoke background */}
      <SmokeCanvas />

      {/* Dark overlay for readability */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(180deg, rgba(9,4,30,0.55) 0%, rgba(9,4,30,0.40) 50%, rgba(9,4,30,0.65) 100%)",
          zIndex: 1,
        }}
      />

      <div className="max-w-[1280px] mx-auto relative" style={{ zIndex: 2 }}>
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: C.pink }}>The Collection</p>
          <h2 className="text-5xl sm:text-6xl font-extrabold font-condensed text-white">Meet the Lineup</h2>
          <p className="mt-4 text-lg max-w-lg mx-auto" style={{ color: "oklch(0.68 0.07 295)" }}>
            Every product crafted with premium functional mushrooms and nootropics for real, feel-good results.
          </p>
        </div>

        {/* Products grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/collections/all"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-extrabold text-base text-white border-2 transition-all hover:bg-white/10"
            style={{ borderColor: C.bright }}
          >
            View All Products →
          </Link>
        </div>
      </div>
    </section>
  );
}
