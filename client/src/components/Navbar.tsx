import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { ShoppingCart, ChevronDown, Menu, X } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

const LOGO_URL = "/manus-storage/Purple_Logo_Variations_white_997d1ec1.webp";

const PRODUCTS = [
  {
    key: "silly-dots",
    label: "Silly Dots",
    subtitle: "Hero, Super & Mega Dose mushroom tabs",
    color: "#7C3AED",
    border: "#a855f7",
    href: "/collections/silly-dots",
    img: "/manus-storage/SuperSillyDotsnatural_45aeba50.webp",
  },
  {
    key: "silly-euphoria",
    label: "Silly Euphoria",
    subtitle: "Premium enhanced gummies for elevated vibes",
    color: "#9D174D",
    border: "#ec4899",
    href: "/collections/silly-euphoria",
    img: "/manus-storage/SuperSillyDotsCherryBerry_497a91bf.webp",
  },
  {
    key: "silly-bites",
    label: "Silly Bites Gummies",
    subtitle: "Cannadelic microdose gummies, 10ct pouches",
    color: "#065F46",
    border: "#10b981",
    href: "/collections/silly-bites",
    img: "/manus-storage/SuperSillyDotsbluerazz_58830613.webp",
  },
];

export default function Navbar() {
  const [shopOpen, setShopOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { totalQuantity } = useCart();
  const [location] = useLocation();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShopOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Close on route change
  useEffect(() => {
    setShopOpen(false);
    setMobileOpen(false);
  }, [location]);

  return (
    <header
      style={{
        background: "oklch(0.10 0.04 295)",
        borderBottom: "1px solid oklch(0.22 0.08 295)",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <nav
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "0 1.5rem",
          height: 68,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
        }}
      >
        {/* Logo */}
        <Link href="/">
          <img
            src={LOGO_URL}
            alt="Purple Organics"
            style={{ height: 36, width: "auto", objectFit: "contain", cursor: "pointer" }}
          />
        </Link>

        {/* Desktop Nav */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.25rem",
            flex: 1,
            justifyContent: "center",
          }}
          className="hidden md:flex"
        >
          {/* SHOP dropdown */}
          <div ref={dropdownRef} style={{ position: "relative" }}>
            <button
              onClick={() => setShopOpen((v) => !v)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.3rem",
                padding: "0.5rem 1rem",
                background: "none",
                border: "none",
                color: "white",
                fontFamily: "'Barlow', sans-serif",
                fontWeight: 700,
                fontSize: "0.9rem",
                letterSpacing: "0.08em",
                cursor: "pointer",
                borderRadius: "0.5rem",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "oklch(0.18 0.07 295)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
            >
              SHOP
              <ChevronDown
                size={15}
                style={{
                  transform: shopOpen ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.2s",
                }}
              />
            </button>

            {/* Mega Dropdown */}
            {shopOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "oklch(0.12 0.05 295)",
                  border: "1px solid oklch(0.25 0.10 295)",
                  borderRadius: "1rem",
                  padding: "1.5rem",
                  width: 620,
                  boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
                  zIndex: 200,
                  animation: "fadeInDown 0.18s ease-out",
                }}
              >
                {/* Header row */}
                <div style={{ marginBottom: "1.25rem" }}>
                  <p
                    style={{
                      color: "white",
                      fontWeight: 800,
                      fontSize: "1.15rem",
                      fontFamily: "'Barlow', sans-serif",
                      margin: 0,
                    }}
                  >
                    Get Groovy
                  </p>
                  <p style={{ color: "oklch(0.65 0.12 295)", fontSize: "0.82rem", margin: "0.2rem 0 0" }}>
                    Premium mushroom supplements for every vibe
                  </p>
                  <Link
                    href="/shop"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.3rem",
                      color: "#a855f7",
                      fontSize: "0.82rem",
                      fontWeight: 600,
                      textDecoration: "none",
                      marginTop: "0.4rem",
                    }}
                  >
                    Shop All →
                  </Link>
                </div>

                {/* Product cards */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem" }}>
                  {PRODUCTS.map((p) => (
                    <Link
                      key={p.key}
                      href={p.href}
                      style={{ textDecoration: "none" }}
                    >
                      <div
                        style={{
                          border: `1.5px solid ${p.border}`,
                          borderRadius: "0.875rem",
                          padding: "0.875rem",
                          background: `${p.color}22`,
                          cursor: "pointer",
                          transition: "background 0.15s, transform 0.15s",
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLDivElement).style.background = `${p.color}44`;
                          (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLDivElement).style.background = `${p.color}22`;
                          (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                        }}
                      >
                        {/* Product image */}
                        <div
                          style={{
                            width: "100%",
                            aspectRatio: "1/1",
                            borderRadius: "0.625rem",
                            overflow: "hidden",
                            marginBottom: "0.625rem",
                            background: "oklch(0.18 0.06 295)",
                          }}
                        >
                          <img
                            src={p.img}
                            alt={p.label}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        </div>
                        <p
                          style={{
                            color: "white",
                            fontWeight: 700,
                            fontSize: "0.82rem",
                            margin: "0 0 0.2rem",
                            fontFamily: "'Barlow', sans-serif",
                          }}
                        >
                          {p.label}
                        </p>
                        <p style={{ color: "oklch(0.65 0.10 295)", fontSize: "0.72rem", margin: 0, lineHeight: 1.4 }}>
                          {p.subtitle}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {[
            { label: "WHAT IS KANNA?", href: "/what-is-kanna" },
            { label: "BLOG", href: "/blogs/news" },
            { label: "FAQ", href: "/faq" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                padding: "0.5rem 1rem",
                color: "white",
                fontFamily: "'Barlow', sans-serif",
                fontWeight: 700,
                fontSize: "0.9rem",
                letterSpacing: "0.08em",
                textDecoration: "none",
                borderRadius: "0.5rem",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => ((e.target as HTMLElement).style.background = "oklch(0.18 0.07 295)")}
              onMouseLeave={(e) => ((e.target as HTMLElement).style.background = "none")}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Right side: Cart */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <Link href="/cart" style={{ position: "relative", color: "white", textDecoration: "none" }}>
            <ShoppingCart size={22} />
            {totalQuantity > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: -7,
                  right: -7,
                  background: "#a855f7",
                  color: "white",
                  borderRadius: "999px",
                  width: 18,
                  height: 18,
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {totalQuantity}
              </span>
            )}
          </Link>

          {/* Mobile hamburger */}
          <button
            className="md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            style={{ background: "none", border: "none", color: "white", cursor: "pointer", padding: "0.25rem" }}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className="md:hidden"
          style={{
            background: "oklch(0.10 0.04 295)",
            borderTop: "1px solid oklch(0.22 0.08 295)",
            padding: "1rem 1.5rem 1.5rem",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            <p style={{ color: "oklch(0.55 0.10 295)", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.1em", margin: "0 0 0.5rem" }}>
              SHOP
            </p>
            {PRODUCTS.map((p) => (
              <Link
                key={p.key}
                href={p.href}
                style={{
                  color: "white",
                  textDecoration: "none",
                  padding: "0.6rem 0.75rem",
                  borderRadius: "0.5rem",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  background: "oklch(0.15 0.06 295)",
                  marginBottom: "0.25rem",
                }}
              >
                {p.label}
              </Link>
            ))}
            <Link href="/shop" style={{ color: "#a855f7", textDecoration: "none", padding: "0.5rem 0.75rem", fontWeight: 600 }}>
              Shop All →
            </Link>
            <hr style={{ border: "none", borderTop: "1px solid oklch(0.22 0.08 295)", margin: "0.75rem 0" }} />
            {[
              { label: "What is Kanna?", href: "/what-is-kanna" },
              { label: "Blog", href: "/blogs/news" },
              { label: "FAQ", href: "/faq" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  color: "white",
                  textDecoration: "none",
                  padding: "0.6rem 0.75rem",
                  borderRadius: "0.5rem",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                }}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateX(-50%) translateY(-8px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @media (min-width: 768px) { .hidden { display: none !important; } }
        .hidden.md\\:flex { display: flex !important; }
        .md\\:hidden { display: none !important; }
        @media (max-width: 767px) {
          .hidden { display: none !important; }
          .md\\:hidden { display: block !important; }
        }
      `}</style>
    </header>
  );
}
