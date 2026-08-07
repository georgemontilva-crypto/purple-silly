import { describe, expect, it } from "vitest";
import {
  ALL_PRODUCTS,
  categoryFromRoute,
  clearFilters,
  isFiltered,
  selectCategory,
  shopView,
  toListInput,
  type ShopCategory,
} from "./shopFilters";

const CATEGORIES: ShopCategory[] = [
  { id: 1, name: "Gummies", slug: "gummies" },
  { id: 2, name: "Drinks", slug: "drinks" },
  { id: 3, name: "Vapes", slug: "vapes" },
  { id: 4, name: "Merch", slug: "merch" },
];

type P = { id: number; categorySlug: string | null };

const CATALOG: P[] = [
  ...Array.from({ length: 8 }, (_, i) => ({
    id: 100 + i,
    categorySlug: "gummies",
  })),
  ...Array.from({ length: 2 }, (_, i) => ({
    id: 200 + i,
    categorySlug: "drinks",
  })),
  ...Array.from({ length: 6 }, (_, i) => ({
    id: 300 + i,
    categorySlug: "vapes",
  })),
  { id: 400, categorySlug: "merch" },
];

/** Stands in for `catalog.list`: applies exactly the filter it is given. */
function fetchList(input: ReturnType<typeof toListInput>): P[] {
  const rows = input.categorySlug
    ? CATALOG.filter(p => p.categorySlug === input.categorySlug)
    : CATALOG;
  return rows.slice(0, input.limit);
}

const EXPECTED: Record<string, number> = {
  [ALL_PRODUCTS]: 17,
  gummies: 8,
  drinks: 2,
  vapes: 6,
  merch: 1,
};

describe("categoryFromRoute", () => {
  it("treats a missing param and /collections/all as the full catalog", () => {
    expect(categoryFromRoute(undefined)).toBe(ALL_PRODUCTS);
    expect(categoryFromRoute("all")).toBe(ALL_PRODUCTS);
  });

  it("uses a real slug as the active filter", () => {
    expect(categoryFromRoute("gummies")).toBe("gummies");
  });
});

describe("toListInput", () => {
  it("omits the category entirely for the full catalog", () => {
    // `undefined`, not "" — an empty slug would look up a nonexistent
    // category on the server and legitimately match nothing.
    expect(toListInput(ALL_PRODUCTS).categorySlug).toBeUndefined();
  });

  it("passes a selected category through", () => {
    expect(toListInput("vapes").categorySlug).toBe("vapes");
  });
});

describe("switching filters repeatedly", () => {
  // The regression this file exists for: the shop went blank after enough
  // filter changes. Any accumulation of state across selections would show up
  // here as a count that drifts away from the category's real size.
  const sequence = [
    "gummies",
    "drinks",
    "vapes",
    "merch",
    ALL_PRODUCTS,
    "vapes",
    "gummies",
    "merch",
    "drinks",
    ALL_PRODUCTS,
    "gummies",
    "drinks",
    "drinks",
    "merch",
    ALL_PRODUCTS,
    ALL_PRODUCTS,
    "vapes",
  ];

  it("returns each category's full set no matter how many changes precede it", () => {
    let active = ALL_PRODUCTS;
    expect(fetchList(toListInput(active))).toHaveLength(EXPECTED[ALL_PRODUCTS]);

    for (const [i, next] of sequence.entries()) {
      active =
        next === ALL_PRODUCTS ? clearFilters() : selectCategory(active, next);
      expect(active, `step ${i}: active filter`).toBe(next);

      const products = fetchList(toListInput(active));
      expect(products, `step ${i}: selected ${next || "all"}`).toHaveLength(
        EXPECTED[next]
      );

      const view = shopView({
        products,
        isLoading: false,
        isError: false,
        active,
        categories: CATEGORIES,
      });
      expect(view.kind, `step ${i}: view for ${next || "all"}`).toBe("grid");
    }
  });

  it("always lands back on the complete catalog when cleared", () => {
    let active = ALL_PRODUCTS;
    for (const next of sequence) {
      active = selectCategory(active, next);
      active = clearFilters();
      expect(active).toBe(ALL_PRODUCTS);
      expect(isFiltered(active)).toBe(false);
      expect(fetchList(toListInput(active))).toHaveLength(
        EXPECTED[ALL_PRODUCTS]
      );
    }
  });

  it("never narrows one selection by the previous one", () => {
    // Selecting replaces; two different categories in a row can't intersect
    // into nothing the way an accumulating filter set would.
    let active = selectCategory(ALL_PRODUCTS, "gummies");
    active = selectCategory(active, "drinks");
    expect(active).toBe("drinks");
    expect(fetchList(toListInput(active))).toHaveLength(2);
  });
});

describe("shopView", () => {
  const base = { isLoading: false, isError: false, categories: CATEGORIES };

  it("reports loading only while there is genuinely no list yet", () => {
    expect(
      shopView({
        ...base,
        products: undefined,
        isLoading: true,
        active: ALL_PRODUCTS,
      }).kind
    ).toBe("loading");
    expect(
      shopView({
        ...base,
        products: undefined,
        isLoading: false,
        active: ALL_PRODUCTS,
      }).kind
    ).toBe("loading");
  });

  it("keeps showing the grid while a new filter is being fetched", () => {
    // keepPreviousData hands over the old list, so the grid must survive the
    // swap rather than collapsing to a spinner or an empty state.
    const view = shopView({
      ...base,
      products: fetchList(toListInput("gummies")),
      isLoading: false,
      active: "drinks",
    });
    expect(view.kind).toBe("grid");
  });

  it("distinguishes an empty catalog from a filter with no matches", () => {
    expect(shopView({ ...base, products: [], active: ALL_PRODUCTS }).kind).toBe(
      "empty-catalog"
    );

    const filtered = shopView({ ...base, products: [], active: "merch" });
    expect(filtered.kind).toBe("no-match");
    if (filtered.kind === "no-match") {
      expect(filtered.categoryName).toBe("Merch");
    }
  });

  it("falls back to the slug when the category has no name to show", () => {
    const view = shopView({
      ...base,
      products: [],
      active: "mystery",
      categories: [],
    });
    expect(view.kind).toBe("no-match");
    if (view.kind === "no-match") expect(view.categoryName).toBe("mystery");
  });

  it("surfaces a failed load as an error, not as an empty catalog", () => {
    const view = shopView({
      ...base,
      products: undefined,
      isError: true,
      active: ALL_PRODUCTS,
    });
    expect(view.kind).toBe("error");
  });
});
