import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { ShoppingCart, ChevronDown, X, Plus, Minus, Trash2, Menu } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

const LOGO_URL = "/manus-storage/Purple_Logo_Variations_white_997d1ec1.webp";
const C = {
  deep:   "oklch(0.09 0.04 295)",
  dark:   "oklch(0.13 0.05 295)",
  mid:    "oklch(0.20 0.08 295)",
  vivid:  "oklch(0.52 0.28 295)",
  bright: "oklch(0.62 0.28 295)",
  light:  "oklch(0.75 0.18 295)",
  pink:   "oklch(0.72 0.22 320)",
  yellow: "oklch(0.88 0.20 95)",
};

function formatPrice(p: { amount: string; currencyCode: string }) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: p.currencyCode }).format(parseFloat(p.amount));
}

function ShopDropdown({ onClose }: { onClose: () => void }) {
  return (
    <div className="absolute top-full left-0 mt-2 w-56 rounded-2xl shadow-2xl border py-2 z-50"
      style={{ background: C.dark, borderColor: C.mid }}>
      {[
        { label: "Party Tablets", href: "/collections/kanna-tablets" },
        { label: "Daily Mood Gummies", href: "/collections/kanna-gummies" },
        { label: "Shop All", href: "/collections/all" },
      ].map(item => (
        <Link key={item.href} href={item.href} onClick={onClose}
          className="block px-5 py-3 text-sm font-semibold text-white/80 hover:text-white hover:bg-white/10 transition-all">
          {item.label}
        </Link>
      ))}
    </div>
  );
}

function CartDrawer() {
  const { isOpen, closeCart, lines, totalQuantity, subtotal, updateItem, removeItem, goToCheckout, isLoading } = useCart() as {
    isOpen: boolean; closeCart: () => void;
    lines: Array<{ id: string; title: string; variantTitle: string; quantity: number; price: { amount: string; currencyCode: string }; image?: { url: string; altText?: string | null } | null }>;
    totalQuantity: number; subtotal: number;
    updateItem: (id: string, qty: number) => void;
    removeItem: (id: string) => void;
    goToCheckout: () => void;
    isLoading: boolean;
  };
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" onClick={closeCart} />
      <div className="fixed right-0 top-0 h-full w-full max-w-md z-50 shadow-2xl flex flex-col"
        style={{ background: C.dark }}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: C.mid }}>
          <h2 className="text-xl font-extrabold text-white font-condensed">
            Your Cart {totalQuantity > 0 && <span style={{ color: C.pink }}>({totalQuantity})</span>}
          </h2>
          <button onClick={closeCart} className="p-2 rounded-xl transition-colors hover:bg-white/10">
            <X size={20} className="text-white" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {lines.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4 py-16">
              <ShoppingCart size={48} style={{ color: C.vivid }} />
              <p className="font-medium" style={{ color: C.light }}>Your cart is empty</p>
              <button onClick={closeCart}
                className="px-6 py-3 rounded-full font-bold text-sm text-white transition-colors"
                style={{ background: C.bright }}>
                Continue Shopping
              </button>
            </div>
          ) : (
            lines.map((line) => (
              <div key={line.id} className="flex gap-4 p-3 rounded-2xl" style={{ background: C.mid }}>
                <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0" style={{ background: C.vivid + "30" }}>
                  {line.image && (
                    <img src={line.image.url} alt={line.image.altText ?? line.title}
                      className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-white truncate">{line.title}</p>
                  {line.variantTitle !== "Default" && (
                    <p className="text-xs mt-0.5" style={{ color: C.light }}>{line.variantTitle}</p>
                  )}
                  <p className="text-sm font-bold mt-1" style={{ color: C.pink }}>
                    {formatPrice({ amount: String(parseFloat(line.price.amount) * line.quantity), currencyCode: line.price.currencyCode })}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <button onClick={() => updateItem(line.id, line.quantity - 1)}
                      disabled={isLoading || line.quantity <= 1}
                      className="w-7 h-7 rounded-full flex items-center justify-center transition-colors disabled:opacity-40 text-white"
                      style={{ background: C.vivid }}>
                      <Minus size={12} />
                    </button>
                    <span className="text-sm font-bold w-6 text-center text-white">{line.quantity}</span>
                    <button onClick={() => updateItem(line.id, line.quantity + 1)}
                      disabled={isLoading}
                      className="w-7 h-7 rounded-full flex items-center justify-center transition-colors text-white"
                      style={{ background: C.vivid }}>
                      <Plus size={12} />
                    </button>
                    <button onClick={() => removeItem(line.id)} disabled={isLoading}
                      className="ml-auto p-1.5 rounded-lg transition-colors text-red-400 hover:text-red-300 hover:bg-red-500/10">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {lines.length > 0 && (
          <div className="p-5 border-t space-y-3" style={{ borderColor: C.mid }}>
            <div className="flex justify-between text-sm font-medium" style={{ color: C.light }}>
              <span>Subtotal</span>
              <span className="font-bold text-white">
                {formatPrice({ amount: subtotal.toFixed(2), currencyCode: lines[0]?.price.currencyCode ?? "USD" })}
              </span>
            </div>
            <button onClick={goToCheckout} disabled={isLoading}
              className="w-full py-4 rounded-full font-extrabold text-base text-white transition-all active:scale-[0.97] disabled:opacity-60"
              style={{ background: `linear-gradient(135deg, ${C.bright}, ${C.pink})` }}>
              {isLoading ? "Processing..." : "Checkout →"}
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default function Navbar() {
  const [shopOpen, setShopOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { totalQuantity, openCart } = useCart();
  const [location] = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setShopOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => { setShopOpen(false); setMobileOpen(false); }, [location]);

  return (
    <>
      <header className="sticky top-0 z-30 transition-all duration-200"
        style={{ background: scrolled ? `${C.deep}f5` : C.deep, backdropFilter: scrolled ? "blur(12px)" : "none", borderBottom: `1px solid ${C.mid}` }}>
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <img src={LOGO_URL} alt="Purple Organics" className="h-9 w-auto object-contain" />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            <div className="relative" ref={dropdownRef}>
              <button onClick={() => setShopOpen((v) => !v)}
                className="flex items-center gap-1 px-4 py-2 rounded-xl font-bold text-sm tracking-wide transition-colors"
                style={{ color: shopOpen ? C.pink : "white" }}>
                SHOP
                <ChevronDown size={14} className={`transition-transform duration-200 ${shopOpen ? "rotate-180" : ""}`} />
              </button>
              {shopOpen && <ShopDropdown onClose={() => setShopOpen(false)} />}
            </div>
            {[
              { href: "/pages/what-is-kanna", label: "WHAT IS KANNA?" },
              { href: "/blogs/news", label: "BLOG" },
              { href: "/pages/faq", label: "FAQ" },
            ].map(({ href, label }) => (
              <Link key={href} href={href}
                className="px-4 py-2 rounded-xl font-bold text-sm tracking-wide transition-colors text-white/80 hover:text-white">
                {label}
              </Link>
            ))}
          </nav>

          {/* Right Icons */}
          <div className="flex items-center gap-2">
            {/* Mobile menu */}
            <button className="md:hidden p-2 rounded-xl text-white hover:bg-white/10 transition-colors"
              onClick={() => setMobileOpen(v => !v)}>
              <Menu size={22} />
            </button>
            {/* Cart */}
            <button onClick={openCart}
              className="relative p-2 rounded-xl hover:bg-white/10 transition-colors flex items-center">
              <ShoppingCart size={22} className="text-white" />
              {totalQuantity > 0 && (
                <span className="absolute -top-1 -right-1 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center leading-none"
                  style={{ background: C.pink }}>
                  {totalQuantity > 9 ? "9+" : totalQuantity}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden border-t px-4 py-4 space-y-2" style={{ background: C.dark, borderColor: C.mid }}>
            {[
              { href: "/collections/all", label: "SHOP ALL" },
              { href: "/collections/kanna-tablets", label: "Party Tablets" },
              { href: "/collections/kanna-gummies", label: "Daily Mood Gummies" },
              { href: "/pages/what-is-kanna", label: "WHAT IS KANNA?" },
              { href: "/blogs/news", label: "BLOG" },
              { href: "/pages/faq", label: "FAQ" },
            ].map(({ href, label }) => (
              <Link key={href} href={href}
                className="block px-4 py-3 rounded-xl font-bold text-sm text-white hover:bg-white/10 transition-colors">
                {label}
              </Link>
            ))}
          </div>
        )}
      </header>
      <CartDrawer />
    </>
  );
}
