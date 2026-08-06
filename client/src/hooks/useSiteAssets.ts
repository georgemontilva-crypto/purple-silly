import { trpc } from "@/lib/trpc";
import type { AssetSectionKey } from "@shared/assetSections";
import type { SiteAsset } from "../../../drizzle/schema";

/**
 * Shared so the pre-load return value keeps a STABLE identity. A fresh
 * `[]` per render makes every downstream useMemo keyed on `assets`
 * recompute on every render — which for the hero carousel meant
 * rebuilding the ring, and remounting all its cards, continuously.
 */
const NO_ASSETS: SiteAsset[] = [];

export function useSiteAssets(section: AssetSectionKey) {
  const { data, isLoading } = trpc.admin.assets.listPublic.useQuery({ section });
  return { assets: data ?? NO_ASSETS, isLoading };
}

/** Convenience for single-image sections (maxImages: 1). */
export function useSiteAsset(section: AssetSectionKey) {
  const { assets, isLoading } = useSiteAssets(section);
  return { asset: assets[0], isLoading };
}
