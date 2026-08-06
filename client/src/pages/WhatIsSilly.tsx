import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { useSiteAsset } from "@/hooks/useSiteAssets";
import type { AssetSectionKey } from "@shared/assetSections";

const C = {
  deep:   "oklch(0.07 0.04 295)",
  dark:   "oklch(0.11 0.05 295)",
  mid:    "oklch(0.20 0.08 295)",
  vivid:  "oklch(0.52 0.28 295)",
  bright: "oklch(0.62 0.28 295)",
  pink:   "oklch(0.72 0.22 320)",
  green:  "oklch(0.55 0.18 160)",
};

const SECTIONS = [
  {
    id: "intro",
    tag: "THE SILLY UNIVERSE",
    title: "What is Silly?",
    body: `Silly is Purple Co's flagship line of functional mushroom products — designed for people who want to feel good, think clearly, and live fully. Every Silly product is crafted with premium botanical ingredients: no psilocybin, no synthetic stimulants, just nature's most powerful mushrooms and nootropics working together.\n\nThe Silly universe spans three distinct product lines, each engineered for a different kind of experience — from focused energy to social ease to daily balance.`,
    cta: { label: "Shop All Silly →", href: "/shop" },
    accent: C.vivid,
    imgSide: "left",
    imgLabel: "SILLY UNIVERSE · PURPLE CO",
    imgGradient: `linear-gradient(135deg, oklch(0.15 0.12 295) 0%, oklch(0.25 0.18 295) 100%)`,
    assetKey: "what-is-silly-intro" as AssetSectionKey,
  },
  {
    id: "silly-dots",
    tag: "SILLY DOTS",
    title: "Functional Mushroom Tabs",
    body: `Silly Dots are premium mushroom + nootropic tablets packed with Lion's Mane, Reishi, Chaga, Cordyceps, L-Theanine, Bacopa, and Rhodiola. Available in three potency levels:\n\n• Mega Dose (1200mg) — Perfect entry point for daily wellness and gentle focus enhancement.\n• Hero Dose (1800mg) — The balanced sweet spot: elevated mood, sharper clarity, and social ease.\n• Super Dose (2400mg) — Maximum potency for those seeking a deeper, more immersive experience.\n\nAvailable in Natural, Blue Razz, and Cherry Berry. Vegan · Gluten-Free · Lab Tested.`,
    cta: { label: "Shop Silly Dots →", href: "/collections/silly-dots" },
    accent: C.vivid,
    imgSide: "right",
    imgLabel: "SILLY DOTS · FROM $15.95",
    imgGradient: `linear-gradient(135deg, oklch(0.12 0.15 295) 0%, oklch(0.22 0.22 295) 100%)`,
    assetKey: "what-is-silly-dots" as AssetSectionKey,
  },
  {
    id: "silly-euphoria",
    tag: "SILLY EUPHORIA",
    title: "Premium Enhanced Gummies",
    body: `Silly Euphoria gummies are crafted for elevated vibes, social ease, and pure good energy. Each pouch is formulated with Purple Co's proprietary mushroom-enhanced blend — delivering a smooth, mood-lifting experience that's perfect for any occasion.\n\nAvailable in multiple flavors including Blue Razz, Pineapple, Raspberry, Strawberry, Watermelon, and White Gummy. Discreet, portable, and easy to dose.\n\nVegan · Gluten-Free · No Psilocybin · Lab Tested.`,
    cta: { label: "Shop Silly Euphoria →", href: "/collections/silly-euphoria" },
    accent: C.pink,
    imgSide: "left",
    imgLabel: "SILLY EUPHORIA · FROM $7.95",
    imgGradient: `linear-gradient(135deg, oklch(0.12 0.15 320) 0%, oklch(0.22 0.20 320) 100%)`,
    assetKey: "what-is-silly-euphoria" as AssetSectionKey,
  },
  {
    id: "silly-bites",
    tag: "SILLY BITES GUMMIES",
    title: "Cannadelic Microdose",
    body: `Silly Bites are cannadelic microdose gummies designed for daily wellness and balanced mood. Each 10-count pouch delivers consistent, gentle support — making them ideal for those who want a subtle, manageable experience they can incorporate into their everyday routine.\n\nAvailable in Blue Razz, Pineapple, Raspberry, Strawberry, Watermelon, and White Gummy. Each gummy is precisely dosed for predictable, reliable results.\n\nVegan · Gluten-Free · Microdosed · Lab Tested.`,
    cta: { label: "Shop Silly Bites →", href: "/collections/silly-bites" },
    accent: C.green,
    imgSide: "right",
    imgLabel: "SILLY BITES · $17.95",
    imgGradient: `linear-gradient(135deg, oklch(0.12 0.12 160) 0%, oklch(0.20 0.18 160) 100%)`,
    assetKey: "what-is-silly-bites" as AssetSectionKey,
  },
];

function useInView(threshold = 0.25) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

function SectionBlock({ section, index }: { section: typeof SECTIONS[0]; index: number }) {
  const { ref, visible } = useInView(0.15);
  const isLeft = section.imgSide === "left";
  const { asset } = useSiteAsset(section.assetKey);

  return (
    <div
      ref={ref}
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "0",
        minHeight: "90vh",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(40px)",
        transition: "opacity 0.7s ease-out, transform 0.7s ease-out",
        transitionDelay: "0.1s",
      }}
      className="section-block"
    >
      {/* Image side */}
      <div
        style={{
          order: isLeft ? 0 : 1,
          position: "relative",
          overflow: "hidden",
          background: asset ? undefined : section.imgGradient,
          minHeight: 480,
        }}
      >
        {asset && (
          <img
            src={asset.url}
            alt={section.title}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
        )}
        {!asset && (
          <>
            {/* Decorative circles */}
            <div style={{
              position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
              pointerEvents: "none",
            }}>
              <div style={{
                width: "70%", aspectRatio: "1/1", borderRadius: "50%",
                border: `1px solid ${section.accent}30`,
                position: "absolute",
              }} />
              <div style={{
                width: "45%", aspectRatio: "1/1", borderRadius: "50%",
                border: `1px solid ${section.accent}50`,
                position: "absolute",
              }} />
              <div style={{
                width: "25%", aspectRatio: "1/1", borderRadius: "50%",
                background: `${section.accent}18`,
                border: `1px solid ${section.accent}70`,
                position: "absolute",
              }} />
            </div>
            {/* Placeholder label */}
            <div style={{
              position: "absolute", inset: 0, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: "0.75rem",
            }}>
              <div style={{
                width: "55%", aspectRatio: "4/3", borderRadius: "1.5rem",
                background: `${section.accent}15`,
                border: `1.5px dashed ${section.accent}40`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{
                  color: `${section.accent}80`, fontSize: "0.7rem", fontWeight: 700,
                  letterSpacing: "0.12em", textTransform: "uppercase", textAlign: "center",
                  fontFamily: "'Barlow Condensed', sans-serif",
                }}>
                  {section.imgLabel}
                </span>
              </div>
            </div>
          </>
        )}
        {/* Index number */}
        <div style={{
          position: "absolute", bottom: "2rem", left: isLeft ? "2rem" : "auto", right: isLeft ? "auto" : "2rem",
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 900, fontSize: "6rem", lineHeight: 1,
          color: `${section.accent}12`, userSelect: "none",
        }}>
          0{index + 1}
        </div>
      </div>

      {/* Text side */}
      <div
        style={{
          order: isLeft ? 1 : 0,
          display: "flex", flexDirection: "column", justifyContent: "center",
          padding: "5rem 4rem",
          background: index % 2 === 0 ? C.deep : C.dark,
        }}
      >
        <span style={{
          display: "inline-block",
          color: section.accent,
          fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.18em",
          textTransform: "uppercase", marginBottom: "1rem",
          fontFamily: "'Barlow', sans-serif",
        }}>
          {section.tag}
        </span>
        <h2 style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 900, fontSize: "clamp(2.5rem, 4.5vw, 4rem)",
          color: "white", lineHeight: 1.0, margin: "0 0 1.5rem",
        }}>
          {section.title}
        </h2>
        <div style={{ color: "oklch(0.72 0.07 295)", lineHeight: 1.75, fontSize: "1rem", marginBottom: "2rem" }}>
          {section.body.split("\n").map((line, i) => (
            line === "" ? <br key={i} /> :
            <p key={i} style={{ margin: "0 0 0.5rem" }}>{line}</p>
          ))}
        </div>
        <Link
          href={section.cta.href}
          style={{
            display: "inline-flex", alignItems: "center", gap: "0.5rem",
            padding: "0.875rem 2rem", borderRadius: "999px",
            background: `${section.accent}20`,
            border: `1.5px solid ${section.accent}60`,
            color: "white", fontWeight: 700, fontSize: "0.9rem",
            textDecoration: "none", fontFamily: "'Barlow', sans-serif",
            transition: "all 0.2s",
            alignSelf: "flex-start",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = `${section.accent}35`;
            (e.currentTarget as HTMLElement).style.transform = "translateX(4px)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = `${section.accent}20`;
            (e.currentTarget as HTMLElement).style.transform = "translateX(0)";
          }}
        >
          {section.cta.label}
        </Link>
      </div>
    </div>
  );
}

export default function WhatIsSilly() {
  return (
    <div style={{ background: C.deep, minHeight: "100vh" }}>
      {/* Hero banner */}
      <div style={{
        background: `linear-gradient(135deg, ${C.deep} 0%, oklch(0.14 0.12 295) 100%)`,
        padding: "6rem 2rem 4rem",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
        borderBottom: `1px solid oklch(0.22 0.08 295)`,
      }}>
        {/* Background glow */}
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: 600, height: 300,
          background: `radial-gradient(ellipse, ${C.vivid}20 0%, transparent 70%)`,
          pointerEvents: "none",
        }} />
        <span style={{
          display: "inline-block",
          color: C.pink, fontSize: "0.75rem", fontWeight: 700,
          letterSpacing: "0.2em", textTransform: "uppercase",
          marginBottom: "1rem", fontFamily: "'Barlow', sans-serif",
        }}>
          Purple Co · The Silly Universe
        </span>
        <h1 style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 900, fontSize: "clamp(3rem, 8vw, 6rem)",
          color: "white", lineHeight: 1, margin: "0 0 1.5rem",
        }}>
          What is <span style={{ color: C.pink }}>Silly?</span>
        </h1>
        <p style={{
          color: "oklch(0.72 0.07 295)", fontSize: "1.1rem",
          maxWidth: 560, margin: "0 auto 2.5rem",
          lineHeight: 1.7,
        }}>
          Three product lines. One mission: feel-good supplements that actually work.
          No psilocybin. No synthetics. Just premium mushrooms and botanicals.
        </p>
        {/* Nav dots */}
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
          {SECTIONS.slice(1).map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              style={{
                padding: "0.5rem 1.25rem", borderRadius: "999px",
                border: `1.5px solid ${s.accent}50`,
                color: "white", fontSize: "0.82rem", fontWeight: 700,
                textDecoration: "none", fontFamily: "'Barlow', sans-serif",
                background: `${s.accent}15`,
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = `${s.accent}30`)}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = `${s.accent}15`)}
            >
              {s.tag}
            </a>
          ))}
        </div>
      </div>

      {/* Sections */}
      {SECTIONS.map((section, i) => (
        <div key={section.id} id={section.id}>
          <SectionBlock section={section} index={i} />
        </div>
      ))}

      {/* Bottom CTA */}
      <div style={{
        padding: "6rem 2rem",
        textAlign: "center",
        background: C.dark,
        borderTop: `1px solid oklch(0.22 0.08 295)`,
      }}>
        <h2 style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 900, fontSize: "clamp(2rem, 5vw, 3.5rem)",
          color: "white", margin: "0 0 1rem",
        }}>
          Ready to Get <span style={{ color: C.pink }}>Groovy?</span>
        </h2>
        <p style={{ color: "oklch(0.65 0.08 295)", marginBottom: "2rem", fontSize: "1rem" }}>
          Explore the full Silly lineup — lab tested, vegan, and crafted for real results.
        </p>
        <Link
          href="/shop"
          style={{
            display: "inline-flex", alignItems: "center", gap: "0.5rem",
            padding: "1rem 2.5rem", borderRadius: "999px",
            background: `linear-gradient(135deg, ${C.bright}, ${C.pink})`,
            color: "white", fontWeight: 800, fontSize: "1rem",
            textDecoration: "none", fontFamily: "'Barlow', sans-serif",
            boxShadow: `0 8px 32px ${C.vivid}40`,
            transition: "transform 0.2s",
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.transform = "scale(1.04)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.transform = "scale(1)")}
        >
          Shop All Silly Products →
        </Link>
      </div>

      <style>{`
        @media (max-width: 767px) {
          .section-block {
            grid-template-columns: 1fr !important;
          }
          .section-block > div {
            order: unset !important;
            min-height: 300px !important;
            padding: 3rem 1.5rem !important;
          }
        }
      `}</style>
    </div>
  );
}
