/**
 * Shared black/purple palette for /admin — deliberately distinct from the
 * storefront's dark-purple-tinted theme (see index.css's --color-* tokens).
 * Plain hex on purpose: use alpha() for translucent variants instead of
 * string-concatenating a hex suffix onto these values directly. The old
 * per-page palettes stored oklch() strings and did `${C.x}30`-style
 * concatenation, which produces invalid CSS like `oklch(0.18 0.06 295)30`
 * — the browser silently drops the whole declaration, so a lot of borders
 * and subtle background tints across /admin simply weren't rendering.
 */
export const ADMIN_COLORS = {
  bg: "#000000",
  panel: "#0a0a0a",
  panelAlt: "#111111",
  border: "#a855f7",
  vivid: "#a855f7",
  bright: "#c084fc",
  pink: "#ec4899",
  green: "#22c55e",
  text: "#ffffff",
  muted: "#c7c2d6",
} as const;

/** Appends a 2-digit hex alpha to a plain 6-digit hex color, e.g. alpha("#a855f7", 35) -> "#a855f759". */
export function alpha(hex: string, percent: number): string {
  const clamped = Math.max(0, Math.min(100, percent));
  const a = Math.round((clamped / 100) * 255)
    .toString(16)
    .padStart(2, "0");
  return `${hex}${a}`;
}
