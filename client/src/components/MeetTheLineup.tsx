import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { Package, ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { trpc } from "@/lib/trpc";

const C = {
  deep: "oklch(0.09 0.04 295)",
  dark: "oklch(0.13 0.05 295)",
  mid: "oklch(0.20 0.08 295)",
  vivid: "oklch(0.52 0.28 295)",
  bright: "oklch(0.62 0.28 295)",
  pink: "oklch(0.72 0.22 320)",
  yellow: "oklch(0.88 0.20 95)",
};

type FeaturedProduct = {
  id: number;
  title: string;
  slug: string;
  priceCents: number | null;
  imageUrl: string | null;
  imageAlt: string;
  inStock: boolean;
};

function formatPrice(cents: number | null): string {
  if (cents === null) return "";
  return `$${(cents / 100).toFixed(2)}`;
}

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

    type Blob = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      r: number;
      opacity: number;
      hue: number;
      phase: number;
    };
    const blobs: Blob[] = Array.from({ length: 18 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.3,
      r: 80 + Math.random() * 200,
      opacity: 0.04 + Math.random() * 0.1,
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
        const grad = ctx.createRadialGradient(
          b.x,
          b.y,
          0,
          b.x,
          b.y,
          b.r * pulse
        );
        grad.addColorStop(0, `hsla(${b.hue}, 80%, 55%, ${b.opacity * 1.4})`);
        grad.addColorStop(
          0.5,
          `hsla(${b.hue + 20}, 70%, 45%, ${b.opacity * 0.6})`
        );
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

/* ─── Product card with glassmorphism ─── */
function ProductCard({ product }: { product: FeaturedProduct }) {
  const { addItem } = useCart();
  const [adding, setAdding] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!product.inStock) return;
    setAdding(true);
    // No variant or bundle from a card — the listing doesn't offer that
    // choice, so this adds the product's base line. Picking a flavour or a
    // pack happens on the product page.
    addItem({
      productId: product.id,
      title: product.title,
      unitPriceCents: product.priceCents ?? 0,
      slug: product.slug,
      imageUrl: product.imageUrl,
      quantity: 1,
    });
    setTimeout(() => setAdding(false), 900);
  };

  return (
    <div
      className="group rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-2 flex flex-col"
      style={{
        // Solid, not translucent — a glassmorphism card here let the
        // ambient background glow bleed through inconsistently depending
        // on where the card happened to land on the page.
        background: C.mid,
        border: "1px solid rgba(168,85,247,0.25)",
        boxShadow:
          "0 8px 32px rgba(124,58,237,0.15), inset 0 1px 0 rgba(255,255,255,0.06)",
      }}
    >
      <Link href={`/products/${product.slug}`}>
        {/*
          The image fills this box edge to edge — no padding, no centering.
          It used to sit inside p-6 with object-contain, which left every
          product floating in a padded well at a different apparent size
          depending on its own aspect ratio, so no two cards in the row
          matched. aspect-square + object-cover gives every card the same
          image area and the same crop behaviour.

          overflow-hidden is what keeps the cover crop (and the hover zoom)
          inside the card's rounded top corners.
        */}
        <div
          className="aspect-square overflow-hidden cursor-pointer"
          style={{ background: "rgba(124,58,237,0.08)" }}
        >
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.imageAlt}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            // Only the placeholder is centred; it's an icon, not a fill.
            <div className="w-full h-full flex items-center justify-center">
              <Package
                size={48}
                strokeWidth={1.5}
                style={{ color: "oklch(0.55 0.10 295)" }}
              />
            </div>
          )}
        </div>
      </Link>
      <div className="p-5 flex flex-col flex-1">
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-extrabold font-condensed text-white text-lg leading-tight mb-3 hover:opacity-80 transition-opacity cursor-pointer">
            {product.title}
          </h3>
        </Link>
        <div className="flex items-center justify-between mt-auto">
          <span className="text-xl font-extrabold" style={{ color: C.pink }}>
            {product.inStock ? formatPrice(product.priceCents) : "Sold out"}
          </span>
          <button
            onClick={handleAdd}
            disabled={adding || !product.inStock}
            className="flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm text-white transition-all active:scale-95 disabled:opacity-70"
            style={{
              background: adding
                ? C.vivid
                : `linear-gradient(135deg, ${C.bright}, ${C.pink})`,
            }}
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
  const { data: products } = trpc.catalog.list.useQuery({
    featured: true,
    limit: 9,
  });

  // No featured products published yet -> render nothing, not a broken empty section.
  if (!products || products.length === 0) return null;

  return (
    <section
      className="section-y px-4 relative overflow-hidden"
      style={{ background: "oklch(0.08 0.05 295)" }}
    >
      {/* Animated smoke background */}
      <SmokeCanvas />

      {/* Dark overlay for readability */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, rgba(9,4,30,0.55) 0%, rgba(9,4,30,0.40) 50%, rgba(9,4,30,0.65) 100%)",
          zIndex: 1,
        }}
      />

      <div className="max-w-[1280px] mx-auto relative" style={{ zIndex: 2 }}>
        {/* Header */}
        <div className="text-center mb-12">
          <p
            className="text-sm font-bold uppercase tracking-widest mb-3"
            style={{ color: C.pink }}
          >
            The Collection
          </p>
          <h2 className="text-5xl sm:text-6xl font-extrabold font-condensed text-white">
            Meet the Lineup
          </h2>
          <p
            className="mt-4 text-lg max-w-lg mx-auto"
            style={{ color: "oklch(0.68 0.07 295)" }}
          >
            Every product crafted with premium functional mushrooms and
            nootropics for real, feel-good results.
          </p>
        </div>

        {/* Products grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
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
