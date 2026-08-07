import { useEffect, useState } from "react";
import { pickSlideAspect, SLIDE_ASPECT } from "@/lib/heroCarousel";

/**
 * Measures the hero slides and returns the aspect the cards should use.
 *
 * The card used to be hard-coded to 3:4 because the asset spec said
 * 1080×1440. Real uploads aren't that shape, and a card at the wrong ratio
 * either crops the art (cover) or mats it with bars (contain). Rather than
 * guess a new constant that would go stale the next time the photography
 * changes, this reads the dimensions off the images themselves.
 *
 * Measured with `new Image()` rather than by waiting for the rendered
 * <img> elements: naturalWidth is available as soon as the header is
 * decoded, the browser serves both from the same cache so nothing is
 * fetched twice, and it means the answer doesn't depend on which cards
 * happen to be mounted or lazy-loaded at the time.
 *
 * Returns SLIDE_ASPECT until something has actually loaded, so the first
 * paint has a sane card rather than a collapsed one.
 */
export function useSlideAspect(urls: readonly string[]): number {
  const [aspect, setAspect] = useState(SLIDE_ASPECT);
  // Join rather than the array itself: a new array of identical strings on
  // every render would restart the effect forever.
  const key = urls.join("|");

  useEffect(() => {
    if (urls.length === 0) {
      setAspect(SLIDE_ASPECT);
      return;
    }

    let cancelled = false;
    const measured: number[] = [];
    let settled = 0;

    const done = () => {
      if (cancelled) return;
      settled++;
      // Update as results arrive, not only at the end: one slow image
      // shouldn't hold the correct shape back once the rest agree.
      if (measured.length > 0) setAspect(pickSlideAspect(measured));
    };

    for (const url of urls) {
      const img = new Image();
      img.onload = () => {
        if (img.naturalWidth > 0) {
          measured.push(img.naturalHeight / img.naturalWidth);
        }
        done();
      };
      // A failed image simply doesn't vote; the others still decide.
      img.onerror = done;
      img.src = url;
    }

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return aspect;
}
