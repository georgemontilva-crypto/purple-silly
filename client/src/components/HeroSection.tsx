import { useMemo, useRef } from "react";
import { useInView } from "framer-motion";
import { useSiteAsset, useSiteAssets } from "@/hooks/useSiteAssets";
import { useHeroLayout } from "@/hooks/useHeroLayout";
import { cardHeight } from "@/lib/heroCarousel";
import { LightParticles } from "./motion/LightParticles";
import HeroCarousel, { type HeroSlide } from "./HeroCarousel";
import "./HeroCarousel.css";

/**
 * The hero: a full-bleed 3D filmstrip carousel with a shaft of light
 * falling through the middle of it.
 *
 * Edge to edge — no inset, no rounded corners, no frame. It used to be a
 * 95%-wide panel ringed by a spinning rainbow edge light; that ring is
 * gone with the panel, since it only ever showed as spill past the
 * rounded corners.
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

  const shellRef = useRef<HTMLDivElement>(null);
  // Everything ambient — the spinning glow, the beam, the particles, the
  // ring's own animation frame — idles once the hero scrolls away. The
  // margin starts it again slightly before it's back on screen.
  const inView = useInView(shellRef, { margin: "200px" });

  const slides: HeroSlide[] = useMemo(
    () => carouselAssets.map(a => ({ id: a.id, url: a.url, label: a.label })),
    [carouselAssets]
  );

  return (
    <section className="hero-section">
      <div ref={shellRef} className="hero-shell" data-hc-visible={inView}>
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
          <LightParticles
            className="hero-particles"
            count={layout.particleCount}
            fallDistance={Math.round(cardHeight(layout.cardW) * 1.15)}
          />

          <header className="hero-panel__top">
            <span className="hero-badge">
              ✦ Premium Mushroom Supplements · 21+
            </span>
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
