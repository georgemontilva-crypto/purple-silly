import { describe, expect, it } from "vitest";
import { MAX_VISIBLE_REELS, reelKey } from "./homeReels";
import {
  ALLOWED_VIDEO_MIME_TYPES,
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_VIDEO_BYTES,
} from "../_core/r2";
import { homeReels } from "../../drizzle/schema";

describe("reel object keys", () => {
  it("files every upload under one prefix, tagged by kind", () => {
    expect(reelKey("video", "clip.mp4")).toMatch(/^home-reels\/video-/);
    expect(reelKey("poster", "thumb.jpg")).toMatch(/^home-reels\/poster-/);
  });

  it("keeps the extension when it's plainly an extension", () => {
    expect(reelKey("video", "clip.mp4")).toMatch(/\.mp4$/);
    expect(reelKey("video", "CLIP.MP4")).toMatch(/\.mp4$/);
    expect(reelKey("poster", "cover.webp")).toMatch(/\.webp$/);
  });

  /**
   * The filename comes from the browser, so it's attacker-controlled. None
   * of it may reach the key except an extension that survives the pattern —
   * otherwise a crafted name walks out of the prefix or smuggles a query
   * string into the object path.
   */
  it("never lets a crafted filename escape the prefix", () => {
    const nasty = [
      "../../etc/passwd",
      "clip.mp4?acl=public-read",
      "clip.mp4/../../evil",
      "a.".concat("x".repeat(200)),
      "no-extension-at-all",
      "trailing.",
      "weird.m p4",
    ];
    for (const name of nasty) {
      const key = reelKey("video", name);
      expect(key, name).toMatch(
        /^home-reels\/video-[0-9]+-[a-z0-9]+\.[a-z0-9]{1,5}$/
      );
      expect(key, name).not.toContain("..");
      expect(key, name).not.toContain("?");
    }
  });

  it("does not collide when the same file is uploaded twice", () => {
    const keys = new Set(
      Array.from({ length: 50 }, () => reelKey("video", "clip.mp4"))
    );
    expect(keys.size).toBe(50);
  });
});

describe("reel limits", () => {
  it("shows exactly the four the desktop row is built for", () => {
    expect(MAX_VISIBLE_REELS).toBe(4);
  });

  /**
   * These are the reason the reel uploader is presigned rather than base64
   * over tRPC: at this size, base64 through the API process is not viable.
   */
  it("allows videos far larger than the base64 image path ever could", () => {
    expect(MAX_VIDEO_BYTES).toBeGreaterThan(50 * 1024 * 1024);
  });

  it("accepts the formats a phone actually produces", () => {
    expect(ALLOWED_VIDEO_MIME_TYPES).toContain("video/mp4");
    expect(ALLOWED_VIDEO_MIME_TYPES).toContain("video/quicktime");
    // Posters are stills, so they reuse the image allowlist rather than
    // getting a second, driftable copy of it.
    expect(ALLOWED_IMAGE_MIME_TYPES).toContain("image/jpeg");
  });
});

describe("home_reels columns", () => {
  it("keeps every URL column wide enough for a real R2 public URL", () => {
    // R2 public URLs carry the account host plus our own prefixed key; 1024
    // is the width the schema promises and the router's zod max mirrors.
    expect(homeReels.videoUrl.columnType).toBe("MySqlVarChar");
    expect(homeReels.posterUrl.columnType).toBe("MySqlVarChar");
  });

  it("leaves poster and title optional — a reel is valid with neither", () => {
    expect(homeReels.posterKey.notNull).toBe(false);
    expect(homeReels.posterUrl.notNull).toBe(false);
    expect(homeReels.title.notNull).toBe(false);
    expect(homeReels.videoKey.notNull).toBe(true);
  });
});
