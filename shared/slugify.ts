/** Turns a title into a URL-safe slug: lowercase, ASCII, hyphen-separated. */
export function slugify(input: string): string {
  const COMBINING_DIACRITICS = new RegExp("[\\u0300-\\u036f]", "g");
  return input
    .normalize("NFKD")
    .replace(COMBINING_DIACRITICS, "") // strip accents (e.g. "e" + acute -> "e")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 200);
}
