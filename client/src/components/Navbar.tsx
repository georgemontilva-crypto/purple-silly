import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { ShoppingCart, ChevronDown, Grid2x2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useSiteAsset } from "@/hooks/useSiteAssets";
import { useIsMobile } from "@/hooks/useMobile";
import { AssetPlaceholder } from "@/components/AssetPlaceholder";
import type { AssetSectionKey } from "@shared/assetSections";
import MobileMenu from "@/components/MobileMenu";
import AccountMenu from "@/components/AccountMenu";
import { NavbarGlow } from "@/components/motion/NavbarGlow";

const PRODUCTS: {
  key: string;
  label: string;
  subtitle: string;
  color: string;
  border: string;
  href: string;
  assetKey: AssetSectionKey;
}[] = [
  {
    key: "silly-dots",
    label: "Silly Dots",
    subtitle: "Hero, Super & Mega Dose mushroom tabs",
    color: "#7C3AED",
    border: "#a855f7",
    href: "/collections/silly-dots",
    assetKey: "navbar-dropdown-dots",
  },
  {
    key: "silly-euphoria",
    label: "Silly Euphoria",
    subtitle: "Premium enhanced gummies for elevated vibes",
    color: "#9D174D",
    border: "#ec4899",
    href: "/collections/silly-euphoria",
    assetKey: "navbar-dropdown-euphoria",
  },
  {
    key: "silly-bites",
    label: "Silly Bites Gummies",
    subtitle: "Cannadelic microdose gummies, 10ct pouches",
    color: "#065F46",
    border: "#10b981",
    href: "/collections/silly-bites",
    assetKey: "navbar-dropdown-bites",
  },
];

function DropdownThumb({
  assetKey,
  label,
}: {
  assetKey: AssetSectionKey;
  label: string;
}) {
  const { asset } = useSiteAsset(assetKey);
  if (!asset)
    return <AssetPlaceholder width={400} height={400} variant="dark" />;
  return (
    <img
      src={asset.url}
      alt={label}
      style={{ width: "100%", height: "100%", objectFit: "cover" }}
    />
  );
}

export default function Navbar() {
  const [shopOpen, setShopOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { totalQuantity } = useCart();
  const [location] = useLocation();
  const { asset: logo } = useSiteAsset("logo-navbar");
  const isMobile = useIsMobile();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
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
      {/* Desktop-only glow + particles integrated into the bar itself —
          not rendered at all under md (gated by useIsMobile below), and
          sits behind the nav content (nav gets its own stacking context). */}
      {!isMobile && <NavbarGlow />}

      <nav
        style={{
          position: "relative",
          zIndex: 1,
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
          {logo ? (
            <img
              src={logo.url}
              alt="Purple Organics"
              style={{
                height: 36,
                width: "auto",
                objectFit: "contain",
                cursor: "pointer",
              }}
            />
          ) : (
            <span
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 900,
                fontSize: "1.3rem",
                letterSpacing: "0.02em",
                color: "white",
                cursor: "pointer",
              }}
            >
              PURPLE <span style={{ color: "#a855f7" }}>ORGANICS</span>
            </span>
          )}
        </Link>

        {/* Desktop Nav — visibility controlled ONLY via Tailwind's `hidden md:flex`;
            no `display` in inline style here, or it would win over the class
            and the links would show at every breakpoint. */}
        <div className="hidden md:flex items-center justify-center flex-1 gap-1">
          {/* SHOP dropdown */}
          <div ref={dropdownRef} style={{ position: "relative" }}>
            <button
              onClick={() => setShopOpen(v => !v)}
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
              onMouseEnter={e =>
                (e.currentTarget.style.background = "oklch(0.18 0.07 295)")
              }
              onMouseLeave={e => (e.currentTarget.style.background = "none")}
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
                  <p
                    style={{
                      color: "oklch(0.65 0.12 295)",
                      fontSize: "0.82rem",
                      margin: "0.2rem 0 0",
                    }}
                  >
                    Premium mushroom supplements for every vibe
                  </p>
                  <Link
                    href="/collections/all"
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
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: "0.75rem",
                  }}
                >
                  {PRODUCTS.map(p => (
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
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLDivElement).style.background =
                            `${p.color}44`;
                          (e.currentTarget as HTMLDivElement).style.transform =
                            "translateY(-2px)";
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLDivElement).style.background =
                            `${p.color}22`;
                          (e.currentTarget as HTMLDivElement).style.transform =
                            "translateY(0)";
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
                          <DropdownThumb
                            assetKey={p.assetKey}
                            label={p.label}
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
                        <p
                          style={{
                            color: "oklch(0.65 0.10 295)",
                            fontSize: "0.72rem",
                            margin: 0,
                            lineHeight: 1.4,
                          }}
                        >
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
            { label: "WHAT IS SILLY?", href: "/what-is-silly" },
            { label: "FAQ", href: "/pages/faq" },
            { label: "LAB REPORTS", href: "/lab-reports" },
          ].map(item => (
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
              onMouseEnter={e =>
                ((e.target as HTMLElement).style.background =
                  "oklch(0.18 0.07 295)")
              }
              onMouseLeave={e =>
                ((e.target as HTMLElement).style.background = "none")
              }
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Right side: account + cart. The glow/particle effect is rendered
            as its own layer behind the whole bar (see NavbarGlow above),
            not here. */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
          {/* Same control at both sizes — an account icon that only exists
              on desktop is exactly the one a phone user needs. */}
          <AccountMenu compact={isMobile} />

          <Link
            href="/cart"
            style={{
              position: "relative",
              color: "white",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 44,
              height: 44,
            }}
          >
            <ShoppingCart size={22} />
            {totalQuantity > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: 2,
                  right: 2,
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

          {/* Mobile menu trigger — circular grid icon. Visibility via
              `flex md:hidden` only; no `display` in inline style. */}
          <button
            className="flex md:hidden items-center justify-center"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            style={{
              width: 44,
              height: 44,
              borderRadius: "999px",
              background: "oklch(0.18 0.07 295)",
              border: "1px solid oklch(0.28 0.09 295)",
              color: "white",
              cursor: "pointer",
            }}
          >
            <Grid2x2 size={20} />
          </button>
        </div>
      </nav>

      <MobileMenu
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        links={[
          { label: "Shop All", href: "/collections/all" },
          ...PRODUCTS.map(p => ({ label: p.label, href: p.href })),
          { label: "What is Silly?", href: "/what-is-silly" },
          { label: "FAQ", href: "/pages/faq" },
          { label: "Lab Reports", href: "/lab-reports" },
        ]}
      />

      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateX(-50%) translateY(-8px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </header>
  );
}
