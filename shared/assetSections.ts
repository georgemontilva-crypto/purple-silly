/**
 * Fixed registry of storefront sections that can have an image managed from
 * /admin → Assets. This is the single source of truth for section keys —
 * neither the admin upload form nor the API accept a free-text section.
 */
export const ASSET_SECTION_KEYS = [
  "logo-navbar",
  "logo-footer",
  "hero-background",
  "choose-your-ride",
  "navbar-dropdown",
  "meet-the-lineup",
  "what-is-silly",
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
  "choose-your-ride": {
    label: "Choose Your Ride",
    width: 800,
    height: 600,
    maxImages: 3,
    description: "Tarjetas de línea de producto en \"Choose Your Ride\", en el home.",
  },
  "navbar-dropdown": {
    label: "Navbar — Dropdown SHOP",
    width: 400,
    height: 400,
    maxImages: 3,
    description: "Miniaturas de producto en el mega-menú SHOP del navbar.",
  },
  "meet-the-lineup": {
    label: "Meet the Lineup",
    width: 600,
    height: 600,
    maxImages: 6,
    description: "Tarjetas de producto en \"Meet the Lineup\", en el home.",
  },
  "what-is-silly": {
    label: "What is Silly?",
    width: 1200,
    height: 800,
    maxImages: 1,
    description: "Imagen destacada en la página \"What is Silly?\".",
  },
};

export function isAssetSectionKey(value: string): value is AssetSectionKey {
  return (ASSET_SECTION_KEYS as readonly string[]).includes(value);
}
