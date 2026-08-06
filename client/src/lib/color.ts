/**
 * Adds an alpha channel to an oklch() color string via the standard
 * `oklch(L C H / A%)` syntax — e.g. oklchAlpha("oklch(0.52 0.28 295)", 15)
 * -> "oklch(0.52 0.28 295 / 15%)".
 *
 * Several components used to build translucent colors by string-concatenating
 * a hex alpha suffix onto an oklch() value (`${color}30`), which only works
 * when `color` is a plain hex string — on oklch() it produces invalid CSS
 * like "oklch(0.52 0.28 295)30" that the browser silently drops, so the
 * background/border/shadow just doesn't render.
 */
export function oklchAlpha(oklch: string, percent: number): string {
  return oklch.replace(/\)\s*$/, ` / ${percent}%)`);
}
