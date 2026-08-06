/**
 * Fixed registry of storefront sections that can have an image managed from
 * /admin → Assets. This is the single source of truth for section keys —
 * neither the admin upload form nor the API accept a free-text section.
 *
 * A key maps 1:1 to a single named visual slot (e.g. one specific product
 * card) whenever that slot has its own identity — otherwise it's ambiguous
 * which uploaded image is meant to go where.
 *
 * choose-your-ride-* and meet-the-lineup used to live here, but both
 * sections now pull real products from the catalog (Fase 3, Parte 4)
 * instead of static assets — removed rather than left dangling.
 */
export const ASSET_SECTION_KEYS = [
  "logo-navbar",
  "logo-footer",
  "hero-background",
  "navbar-dropdown-dots",
  "navbar-dropdown-euphoria",
  "navbar-dropdown-bites",
  "what-is-silly-intro",
  "what-is-silly-dots",
  "what-is-silly-euphoria",
  "what-is-silly-bites",
] as const;

export type AssetSectionKey = (typeof ASSET_SECTION_KEYS)[number];

export interface AssetSectionMeta {
  label: string;
  width: number;
  height: number;
  maxImages: number;
  description: string;
}

export const ASSET_SECTIONS: Record<AssetSectionKey, AssetSectionMeta> = {
  "logo-navbar": {
    label: "Logo — Navbar",
    width: 400,
    height: 120,
    maxImages: 1,
    description: "Logo en el header, en todas las páginas.",
  },
  "logo-footer": {
    label: "Logo — Footer",
    width: 400,
    height: 120,
    maxImages: 1,
    description: "Logo en el pie de página, en todas las páginas.",
  },
  "hero-background": {
    label: "Hero — Fondo",
    width: 1920,
    height: 1080,
    maxImages: 1,
    description: "Imagen de fondo de la sección Hero, en el home.",
  },
  "navbar-dropdown-dots": {
    label: "Navbar Dropdown — Silly Dots",
    width: 400,
    height: 400,
    maxImages: 1,
    description: "Miniatura de \"Silly Dots\" en el mega-menú SHOP del navbar.",
  },
  "navbar-dropdown-euphoria": {
    label: "Navbar Dropdown — Silly Euphoria",
    width: 400,
    height: 400,
    maxImages: 1,
    description: "Miniatura de \"Silly Euphoria\" en el mega-menú SHOP del navbar.",
  },
  "navbar-dropdown-bites": {
    label: "Navbar Dropdown — Silly Bites",
    width: 400,
    height: 400,
    maxImages: 1,
    description: "Miniatura de \"Silly Bites Gummies\" en el mega-menú SHOP del navbar.",
  },
  "what-is-silly-intro": {
    label: "What is Silly? — Intro",
    width: 1200,
    height: 800,
    maxImages: 1,
    description: "Página \"What is Silly?\", sección Intro (la primera, arriba de todo).",
  },
  "what-is-silly-dots": {
    label: "What is Silly? — Silly Dots",
    width: 1200,
    height: 800,
    maxImages: 1,
    description: "Página \"What is Silly?\", sección Silly Dots.",
  },
  "what-is-silly-euphoria": {
    label: "What is Silly? — Silly Euphoria",
    width: 1200,
    height: 800,
    maxImages: 1,
    description: "Página \"What is Silly?\", sección Silly Euphoria.",
  },
  "what-is-silly-bites": {
    label: "What is Silly? — Silly Bites",
    width: 1200,
    height: 800,
    maxImages: 1,
    description: "Página \"What is Silly?\", sección Silly Bites Gummies.",
  },
};

export function isAssetSectionKey(value: string): value is AssetSectionKey {
  return (ASSET_SECTION_KEYS as readonly string[]).includes(value);
}
