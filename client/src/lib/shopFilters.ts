/**
 * Shop filter state, kept as pure functions so the rules below are testable
 * without a DOM.
 *
 * The one invariant everything here exists to protect: the shop has exactly
 * ONE active filter, and selecting a category REPLACES it. Filters are never
 * accumulated, intersected, or carried over from a previous selection, so no
 * sequence of clicks — however long — can narrow the query into an empty
 * result that the catalog doesn't actually justify.
 */

/** The active-filter value meaning "no category filter — the whole catalog". */
export const ALL_PRODUCTS = "";

export type ShopCategory = { id: number; name: string; slug: string };

/**
 * `/collections/:categorySlug` -> active filter.
 * `/collections/all` (and a missing param) are both the unfiltered catalog.
 */
export function categoryFromRoute(param: string | undefined): string {
  return param && param !== "all" ? param : ALL_PRODUCTS;
}

/**
 * Active filter -> `catalog.list` input. `undefined` (not `""`) is what tells
 * the router to skip the category condition entirely; sending an empty string
 * would look up a category with slug "" and match nothing.
 */
export function toListInput(active: string, limit = 100) {
  return {
    categorySlug: active === ALL_PRODUCTS ? undefined : active,
    limit,
  };
}

/** Selecting a filter. Separate from `useState` so the replace-don't-merge
 * rule is stated once and covered by tests, rather than implied by a setter. */
export function selectCategory(_current: string, next: string): string {
  return next;
}

/** Clearing back to the full catalog — always reachable, from any state. */
export function clearFilters(): string {
  return ALL_PRODUCTS;
}

export function isFiltered(active: string): boolean {
  return active !== ALL_PRODUCTS;
}

/** Human label for the active filter, for empty-state copy. */
export function activeCategoryName(
  active: string,
  categories: ShopCategory[] | undefined
): string {
  return categories?.find(c => c.slug === active)?.name ?? active;
}

export type ShopView<P> =
  | { kind: "loading" }
  | { kind: "error" }
  | { kind: "grid"; products: P[] }
  | { kind: "empty-catalog" }
  | { kind: "no-match"; categoryName: string };

/**
 * What the page should render. The two empty outcomes are deliberately
 * distinct: an unfiltered empty result means the catalog itself is empty
 * ("nothing published yet"), while a filtered empty result means this
 * category has no matches and the user needs a way back to everything.
 * Collapsing them — as `!products || products.length === 0` did — is what
 * turns any failure into the same silent blank grid.
 */
export function shopView<P>(args: {
  products: P[] | undefined;
  isLoading: boolean;
  isError: boolean;
  active: string;
  categories: ShopCategory[] | undefined;
}): ShopView<P> {
  const { products, isLoading, isError, active, categories } = args;

  if (isError) return { kind: "error" };
  // Only a genuinely absent result is "loading". Once a list has arrived,
  // re-fetching for a new filter keeps showing the grid rather than tearing
  // it down — the swap stays a swap instead of an unmount/remount cycle.
  if (isLoading || products === undefined) return { kind: "loading" };
  if (products.length > 0) return { kind: "grid", products };

  return isFiltered(active)
    ? { kind: "no-match", categoryName: activeCategoryName(active, categories) }
    : { kind: "empty-catalog" };
}
