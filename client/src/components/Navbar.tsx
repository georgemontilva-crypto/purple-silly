import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { ShoppingCart, User, ChevronDown, X, Plus, Minus, Trash2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { formatPrice } from "@/lib/shopify";

function ShopDropdown({ onClose }: { onClose: () => void }) {
  return (
    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[420px] bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 z-50">
      <div className="flex gap-4 mb-4">
        <div className="flex-1">
          <p className="text-xl font-extrabold text-[oklch(0.22_0.08_265)] leading-tight">Ride The Feeling</p>
          <p className="text-sm text-gray-500 mt-1">Kanna supplements for every mood</p>
          <Link href="/collections/all" onClick={onClose}
            className="inline-block mt-3 text-sm font-semibold text-[oklch(0.22_0.08_265)] hover:text-[oklch(0.62_0.25_340)] transition-colors">
            Shop All →
          </Link>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Link href="/collections/kanna-tablets" onClick={onClose}
          className="group border-2 border-[oklch(0.65_0.18_185)] rounded-xl p-4 hover:bg-[oklch(0.65_0.18_185)]/5 transition-all">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[oklch(0.65_0.18_185)]" />
            <span className="font-bold text-sm text-[oklch(0.22_0.08_265)]">Party Tablets</span>
          </div>
          <p className="text-xs text-gray-500 leading-snug">High-energy euphoria for late-night socializing</p>
        </Link>
        <Link href="/collections/kanna-gummies" onClick={onClose}
          className="group border-2 border-[oklch(0.62_0.25_340)] rounded-xl p-4 hover:bg-[oklch(0.62_0.25_340)]/5 transition-all">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[oklch(0.62_0.25_340)]" />
            <span className="font-bold text-sm text-[oklch(0.22_0.08_265)]">Daily Mood Gummies</span>
          </div>
          <p className="text-xs text-gray-500 leading-snug">Daily mood support, social ease, and focus</p>
        </Link>
      </div>
    </div>
  );
}

function CartDrawer() {
  const { isOpen, closeCart, lines, totalQuantity, subtotal, updateItem, removeItem, goToCheckout, isLoading } = useCart();

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={closeCart} />
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-xl font-extrabold text-[oklch(0.22_0.08_265)]">
            Your Cart {totalQuantity > 0 && <span className="text-[oklch(0.62_0.25_340)]">({totalQuantity})</span>}
          </h2>
          <button onClick={closeCart} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {lines.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4">
              <ShoppingCart size={48} className="text-gray-300" />
              <p className="text-gray-500 font-medium">Your cart is empty</p>
              <button onClick={closeCart}
                className="bg-[oklch(0.22_0.08_265)] text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-[oklch(0.62_0.25_340)] transition-colors">
                Continue Shopping
              </button>
            </div>
          ) : (
            lines.map((line) => (
              <div key={line.id} className="flex gap-4 p-3 bg-gray-50 rounded-2xl">
                <div className="w-20 h-20 bg-gray-200 rounded-xl overflow-hidden flex-shrink-0">
                  {line.image && (
                    <img src={line.image.url}
                      alt={line.image.altText ?? line.title}
                      className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-[oklch(0.22_0.08_265)] truncate">
                    {line.title}
                  </p>
                  <p className="text-xs text-gray-500">{line.variantTitle !== "Default" ? line.variantTitle : ""}</p>
                  <p className="text-sm font-bold text-[oklch(0.62_0.25_340)] mt-1">
                    {formatPrice({ amount: String(parseFloat(line.price.amount) * line.quantity), currencyCode: line.price.currencyCode })}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <button onClick={() => updateItem(line.id, line.quantity - 1)}
                      disabled={isLoading || line.quantity <= 1}
                      className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:border-[oklch(0.62_0.25_340)] transition-colors disabled:opacity-40">
                      <Minus size={12} />
                    </button>
                    <span className="text-sm font-bold w-6 text-center">{line.quantity}</span>
                    <button onClick={() => updateItem(line.id, line.quantity + 1)}
                      disabled={isLoading}
                      className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:border-[oklch(0.62_0.25_340)] transition-colors disabled:opacity-40">
                      <Plus size={12} />
                    </button>
                    <button onClick={() => removeItem(line.id)} disabled={isLoading}
                      className="ml-auto p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {lines.length > 0 && (
          <div className="p-5 border-t border-gray-100 space-y-3">
            <div className="flex justify-between text-sm font-medium text-gray-600">
              <span>Subtotal</span>
              <span className="font-bold text-[oklch(0.22_0.08_265)]">
                {formatPrice({ amount: subtotal.toFixed(2), currencyCode: lines[0]?.price.currencyCode ?? "USD" })}
              </span>
            </div>
            <button onClick={goToCheckout}
              className="w-full bg-[oklch(0.62_0.25_340)] text-white py-4 rounded-full font-extrabold text-base hover:bg-[oklch(0.55_0.25_340)] transition-colors active:scale-[0.97]">
              Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default function Navbar() {
  const [shopOpen, setShopOpen] = useState(false);
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
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShopOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => { setShopOpen(false); }, [location]);

  return (
    <>
      <header className={`sticky top-0 z-30 transition-all duration-200 ${scrolled ? "bg-white/95 backdrop-blur-md shadow-sm" : "bg-white"}`}>
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <div className="flex items-center gap-1">
              <div className="bg-[oklch(0.22_0.08_265)] text-white px-3 py-1.5 rounded-xl font-condensed font-black text-xl tracking-tight leading-none">
                FERRIS<br />WHEEL
              </div>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {/* Shop Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShopOpen((v) => !v)}
                className={`flex items-center gap-1 px-4 py-2 rounded-xl font-bold text-sm tracking-wide transition-colors ${shopOpen ? "text-[oklch(0.62_0.25_340)]" : "text-[oklch(0.22_0.08_265)] hover:text-[oklch(0.62_0.25_340)]"}`}>
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
                className="px-4 py-2 rounded-xl font-bold text-sm tracking-wide text-[oklch(0.22_0.08_265)] hover:text-[oklch(0.62_0.25_340)] transition-colors">
                {label}
              </Link>
            ))}
          </nav>

          {/* Right Icons */}
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-xl hover:bg-gray-100 transition-colors hidden md:flex items-center gap-1 text-sm font-medium text-gray-600">
              <User size={20} />
            </button>
            <button onClick={openCart}
              className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors flex items-center gap-1">
              <ShoppingCart size={20} className="text-[oklch(0.22_0.08_265)]" />
              {totalQuantity > 0 && (
                <span className="absolute -top-1 -right-1 bg-[oklch(0.62_0.25_340)] text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center leading-none">
                  {totalQuantity > 9 ? "9+" : totalQuantity}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>
      <CartDrawer />
    </>
  );
}
