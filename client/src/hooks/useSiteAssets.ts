import { trpc } from "@/lib/trpc";
import type { AssetSectionKey } from "@shared/assetSections";

export function useSiteAssets(section: AssetSectionKey) {
  const { data, isLoading } = trpc.admin.assets.listPublic.useQuery({ section });
  return { assets: data ?? [], isLoading };
}

/** Convenience for single-image sections (maxImages: 1). */
export function useSiteAsset(section: AssetSectionKey) {
  const { assets, isLoading } = useSiteAssets(section);
  return { asset: assets[0], isLoading };
}
