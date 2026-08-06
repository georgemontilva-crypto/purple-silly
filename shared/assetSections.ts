/**
 * Fixed registry of storefront sections that can have an image managed from
 * /admin → Assets. This is the single source of truth for section keys —
 * neither the admin upload form nor the API accept a free-text section.
 *
 * A key maps 1:1 to a single named visual slot (e.g. one specific product
 * card) whenever that slot has its own identity — otherwise it's ambiguous
 * which uploaded image is meant to go where. The one exception is
 * "meet-the-lineup", which is a flexible pool of featured-product photos
 * with no fixed identity per slot, so it stays a single multi-image gallery.
 */
export const ASSET_SECTION_KEYS = [
  "logo-navbar",
  "logo-footer",
  "hero-background",
  "choose-your-ride-dots-1",
  "choose-your-ride-dots-2",
  "choose-your-ride-dots-3",
  "choose-your-ride-euphoria-1",
  "choose-your-ride-euphoria-2",
  "choose-your-ride-euphoria-3",
  "choose-your-ride-bites-1",
  "choose-your-ride-bites-2",
  "choose-your-ride-bites-3",
  "navbar-dropdown-dots",
  "navbar-dropdown-euphoria",
  "navbar-dropdown-bites",
  "meet-the-lineup",
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
  "choose-your-ride-dots-1": {
    label: "Choose Your Ride — Silly Dots — Mega Dose",
    width: 800,
    height: 600,
    maxImages: 1,
    description: "Tab \"Silly Dots\" en \"Choose Your Ride\" (home), tarjeta 1 de 3: Mega Dose.",
  },
  "choose-your-ride-dots-2": {
    label: "Choose Your Ride — Silly Dots — Hero Dose",
    width: 800,
    height: 600,
    maxImages: 1,
    description: "Tab \"Silly Dots\" en \"Choose Your Ride\" (home), tarjeta 2 de 3: Hero Dose.",
  },
  "choose-your-ride-dots-3": {
    label: "Choose Your Ride — Silly Dots — Super Dose",
    width: 800,
    height: 600,
    maxImages: 1,
    description: "Tab \"Silly Dots\" en \"Choose Your Ride\" (home), tarjeta 3 de 3: Super Dose.",
  },
  "choose-your-ride-euphoria-1": {
    label: "Choose Your Ride — Silly Euphoria — Original",
    width: 800,
    height: 600,
    maxImages: 1,
    description: "Tab \"Silly Euphoria\" en \"Choose Your Ride\" (home), tarjeta 1 de 3: Original.",
  },
  "choose-your-ride-euphoria-2": {
    label: "Choose Your Ride — Silly Euphoria — Tropical",
    width: 800,
    height: 600,
    maxImages: 1,
    description: "Tab \"Silly Euphoria\" en \"Choose Your Ride\" (home), tarjeta 2 de 3: Tropical (coming soon).",
  },
  "choose-your-ride-euphoria-3": {
    label: "Choose Your Ride — Silly Euphoria — Berry",
    width: 800,
    height: 600,
    maxImages: 1,
    description: "Tab \"Silly Euphoria\" en \"Choose Your Ride\" (home), tarjeta 3 de 3: Berry (coming soon).",
  },
  "choose-your-ride-bites-1": {
    label: "Choose Your Ride — Silly Bites — Original",
    width: 800,
    height: 600,
    maxImages: 1,
    description: "Tab \"Silly Bites Gummies\" en \"Choose Your Ride\" (home), tarjeta 1 de 3: Original.",
  },
  "choose-your-ride-bites-2": {
    label: "Choose Your Ride — Silly Bites — Watermelon",
    width: 800,
    height: 600,
    maxImages: 1,
    description: "Tab \"Silly Bites Gummies\" en \"Choose Your Ride\" (home), tarjeta 2 de 3: Watermelon (coming soon).",
  },
  "choose-your-ride-bites-3": {
    label: "Choose Your Ride — Silly Bites — Mango",
    width: 800,
    height: 600,
    maxImages: 1,
    description: "Tab \"Silly Bites Gummies\" en \"Choose Your Ride\" (home), tarjeta 3 de 3: Mango (coming soon).",
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
  "meet-the-lineup": {
    label: "Meet the Lineup",
    width: 600,
    height: 600,
    maxImages: 6,
    description: "Fotos de producto destacadas en \"Meet the Lineup\" (home) — pool flexible, no atado a un producto fijo.",
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
