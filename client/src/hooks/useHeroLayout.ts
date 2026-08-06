import { useEffect, useState } from "react";
import { pickLayout, type HeroLayout } from "@/lib/heroCarousel";

/**
 * Hero carousel layout for the current viewport width — card size, ring
 * radius, blur ceiling, particle count.
 *
 * Shared by HeroSection and HeroCarousel so the panel's decorations are
 * sized off the same breakpoint the cards use, rather than each guessing
 * from its own media queries.
 *
 * No debounce on resize by design: pickLayout returns one of a fixed set
 * of frozen objects, so any resize that doesn't cross a breakpoint hands
 * setState the identical reference and React bails out of the re-render
 * on its own.
 */
export function useHeroLayout(): HeroLayout {
  const [layout, setLayout] = useState<HeroLayout>(() =>
    pickLayout(typeof window === "undefined" ? 1440 : window.innerWidth)
  );

  useEffect(() => {
    const onResize = () => setLayout(pickLayout(window.innerWidth));
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return layout;
}
