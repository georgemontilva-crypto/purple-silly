import { useEffect } from "react";
import { useLocation } from "wouter";

/**
 * Sends the window to the top whenever the route changes.
 *
 * A single-page router doesn't reload the document, so the scroll offset
 * simply survives the navigation: clicking a footer link from the bottom
 * of a long home page opened the next page already scrolled halfway down
 * it, which reads as a broken page rather than as a preserved position.
 *
 * `behavior: "auto"`, never "smooth". A smooth scroll here would animate
 * the OLD page's remaining content past the reader before showing the new
 * one — and index.css sets `scroll-behavior: smooth` globally, so that is
 * what would happen by default. This overrides it for navigation only;
 * in-page anchor links keep their smooth scroll.
 *
 * Keyed on the pathname alone: a query-string change (a filter, a
 * pagination param) is not a new page and should not throw the reader
 * back to the top.
 */
export function useScrollToTop(): void {
  const [pathname] = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);
}
