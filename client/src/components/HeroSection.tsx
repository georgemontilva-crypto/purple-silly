import { useMemo, useRef } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import { useSiteAsset, useSiteAssets } from "@/hooks/useSiteAssets";
import { useHeroLayout } from "@/hooks/useHeroLayout";
import { cardHeight } from "@/lib/heroCarousel";
import HeroCarousel, { type HeroSlide } from "./HeroCarousel";
import "./HeroCarousel.css";

/**
 * The hero: a 3D filmstrip carousel inside an inset panel ringed by a
 * slow rainbow edge light, with a shaft of light falling through the
 * middle of it.
 *
 * The panel is a three-row grid — logo above, cards in the middle,
 * controls below — rather than a stack of overlays. That's what keeps the
 * safe zones honest: the cards physically cannot reach the logo or the
 * controls at any viewport size, because they're in a different row (see
 * .hero-stage's min-height in HeroCarousel.css).
 *
 * Images come from /admin → Assets → "Hero — Carrusel". With none
 * uploaded the ring renders labelled 1080 × 1440 placeholder frames
 * instead of collapsing.
 */
export default function HeroSection() {
  const { assets: carouselAssets } = useSiteAssets("hero-carousel");
  const { asset: logo } = useSiteAsset("hero-logo");
  const { asset: background } = useSiteAsset("hero-background");

  const layout = useHeroLayout();
  const reduceMotion = useReducedMotion() ?? false;

  const shellRef = useRef<HTMLDivElement>(null);
  // Everything ambient — the spinning glow, the beam, the particles, the
  // ring's own animation frame — idles once the hero scrolls away. The
  // margin starts it again slightly before it's back on screen.
  const inView = useInView(shellRef, { margin: "200px" });

  const slides: HeroSlide[] = useMemo(
    () => carouselAssets.map(a => ({ id: a.id, url: a.url, label: a.label })),
    [carouselAssets]
  );

  // Deterministic rather than random: re-rendering must not reshuffle the
  // particle field, and the same input gives the same layout every time.
  const particles = useMemo(() => {
    if (reduceMotion) return [];
    return Array.from({ length: layout.particleCount }, (_, i) => {
      const duration = 4 + ((i * 1.7) % 5);
      return {
        left: 8 + ((i * 37) % 84),
        size: 2 + ((i * 0.9) % 2.4),
        duration,
        delay: -((i * 0.63) % duration),
      };
    });
  }, [layout.particleCount, reduceMotion]);

  return (
    <section className="hero-section">
      <div ref={shellRef} className="hero-shell" data-hc-visible={inView}>
        {/* Two counter-rotating conic layers behind the panel. Both sit
            outside it so only their blurred spill past the rounded edge
            shows — the panel itself is opaque. */}
        <div className="hero-glow hero-glow--outer" aria-hidden="true" />
        <div className="hero-glow hero-glow--inner" aria-hidden="true" />

        <div className="hero-panel">
          {background && (
            <div
              className="hero-panel__bg"
              style={{ backgroundImage: `url(${background.url})` }}
              aria-hidden="true"
            />
          )}

          <div className="hero-beam" aria-hidden="true" />
          <div className="hero-beam__pool" aria-hidden="true" />
          <div
            className="hero-particles"
            style={
              {
                "--hc-fall-distance": `${Math.round(cardHeight(layout.cardW) * 1.15)}px`,
              } as React.CSSProperties
            }
            aria-hidden="true"
          >
            {particles.map((p, i) => (
              <span
                key={i}
                className="hero-particle"
                style={{
                  left: `${p.left}%`,
                  width: `${p.size}px`,
                  height: `${p.size}px`,
                  animationDuration: `${p.duration}s`,
                  animationDelay: `${p.delay}s`,
                }}
              />
            ))}
          </div>

          <header className="hero-panel__top">
            <span className="hero-badge">✦ Premium Mushroom Supplements · 21+</span>
            {/* One h1 either way: the uploaded logo goes inside it rather
                than replacing it, so the page never loses its heading. */}
            <h1 className="hero-wordmark">
              {logo ? (
                <img className="hero-logo" src={logo.url} alt="Silly Dots" />
              ) : (
                <>
                  Get Groovy,
                  <br />
                  <span>Stay Purple</span>
                </>
              )}
            </h1>
          </header>

          <HeroCarousel slides={slides} active={inView} />
        </div>
      </div>
    </section>
  );
}
