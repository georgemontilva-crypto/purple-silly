import { useEffect, useState } from "react";

/**
 * True only on devices whose PRIMARY pointer is a real mouse or trackpad.
 *
 * `(hover: hover) and (pointer: fine)` rather than a width breakpoint: what
 * matters isn't screen size but whether there is a pointer to decorate. A
 * touchscreen laptop with a mouse plugged in reports a fine primary pointer
 * and counts as desktop; a large tablet does not, no matter how wide it is.
 *
 * Starts false so touch devices never get a frame of the desktop-only
 * treatment during hydration — the effect flips it on where it belongs.
 */
const QUERY = "(hover: hover) and (pointer: fine)";

export function usePointerFine(): boolean {
  const [fine, setFine] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(QUERY);
    const onChange = () => setFine(mql.matches);
    onChange();
    // Re-evaluated on change, not just on mount: plugging in or unplugging a
    // mouse switches the primary pointer without a reload.
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return fine;
}
