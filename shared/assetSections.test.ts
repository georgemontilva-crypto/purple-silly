import { describe, expect, it } from "vitest";
import {
  ASSET_SECTIONS,
  ASSET_SECTION_KEYS,
  isAssetSectionKey,
  type AssetSectionKey,
} from "./assetSections";

/**
 * The registry is what /admin → Assets renders from: it maps over
 * ASSET_SECTION_KEYS and looks each one up in ASSET_SECTIONS. A key
 * without metadata is therefore a runtime crash on that page, and a
 * section missing from the key list simply never gets an upload box —
 * neither is caught by tsc, since Record<AssetSectionKey, …> is satisfied
 * either way once the union changes. Hence these.
 */
describe("asset section registry", () => {
  it("gives every key metadata, so the admin can render an upload box for it", () => {
    for (const key of ASSET_SECTION_KEYS) {
      const meta = ASSET_SECTIONS[key];
      expect(meta, `no metadata for "${key}"`).toBeDefined();
      expect(meta.label.length).toBeGreaterThan(0);
      expect(meta.description.length).toBeGreaterThan(0);
      expect(meta.width).toBeGreaterThan(0);
      expect(meta.height).toBeGreaterThan(0);
      expect(meta.maxImages).toBeGreaterThanOrEqual(1);
    }
  });

  it("has no metadata entry that isn't also an uploadable key", () => {
    expect(Object.keys(ASSET_SECTIONS).sort()).toEqual([...ASSET_SECTION_KEYS].sort());
  });

  it("has no duplicate keys", () => {
    expect(new Set(ASSET_SECTION_KEYS).size).toBe(ASSET_SECTION_KEYS.length);
  });

  it("exposes the hero logo as its own uploadable single-image section", () => {
    expect(ASSET_SECTION_KEYS).toContain("hero-logo");
    expect(ASSET_SECTIONS["hero-logo"].maxImages).toBe(1);
    expect(isAssetSectionKey("hero-logo")).toBe(true);
  });

  it("exposes the hero carousel as a multi-image 3:4 section", () => {
    expect(ASSET_SECTION_KEYS).toContain("hero-carousel");
    const meta = ASSET_SECTIONS["hero-carousel"];
    expect(meta.maxImages).toBeGreaterThan(1);
    expect(meta.width).toBe(1080);
    expect(meta.height).toBe(1440);
    expect(meta.height / meta.width).toBeCloseTo(4 / 3, 5);
  });

  it("marks exactly the multi-image sections as reorderable", () => {
    // The admin gates its drag & drop affordances on maxImages > 1.
    const ordered = ASSET_SECTION_KEYS.filter(k => ASSET_SECTIONS[k].maxImages > 1);
    expect(ordered).toEqual(["hero-carousel"]);
  });

  it("rejects free-text sections", () => {
    expect(isAssetSectionKey("hero-logo-2")).toBe(false);
    expect(isAssetSectionKey("")).toBe(false);
    expect(isAssetSectionKey("__proto__")).toBe(false);
  });

  it("keeps every key usable as an R2 object key path segment", () => {
    // upload() interpolates the section straight into the R2 key.
    for (const key of ASSET_SECTION_KEYS as readonly AssetSectionKey[]) {
      expect(key).toMatch(/^[a-z0-9-]+$/);
    }
  });
});
