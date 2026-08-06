import { describe, expect, it } from "vitest";
import { popupInputSchema } from "./promoPopups";
import { promoPopups } from "../../drizzle/schema";

const valid = {
  title: "20% off your first order",
  subtitle: "Welcome to Purple",
  bodyText: "Drop your email and we'll send the good stuff.",
  discountCode: "PURPLE20",
  buttonText: "Get my code",
  showDelaySeconds: 3,
  active: true,
};

describe("promo popup input schema", () => {
  it("accepts a fully populated popup", () => {
    expect(popupInputSchema.parse(valid)).toMatchObject(valid);
  });

  it("treats subtitle and bodyText as the only optional copy", () => {
    const { subtitle, bodyText, ...required } = valid;
    expect(() => popupInputSchema.parse(required)).not.toThrow();
    for (const key of ["title", "discountCode", "buttonText", "showDelaySeconds", "active"] as const) {
      const { [key]: _dropped, ...missing } = valid;
      expect(() => popupInputSchema.parse(missing), `"${key}" should be required`).toThrow();
    }
  });

  it("rejects empty strings where the popup would render a blank", () => {
    for (const key of ["title", "discountCode", "buttonText"] as const) {
      expect(() => popupInputSchema.parse({ ...valid, [key]: "" }), key).toThrow();
    }
  });

  it("bounds the delay to something a real visit can reach", () => {
    expect(() => popupInputSchema.parse({ ...valid, showDelaySeconds: 0 })).not.toThrow();
    expect(() => popupInputSchema.parse({ ...valid, showDelaySeconds: 120 })).not.toThrow();
    expect(() => popupInputSchema.parse({ ...valid, showDelaySeconds: -1 })).toThrow();
    expect(() => popupInputSchema.parse({ ...valid, showDelaySeconds: 121 })).toThrow();
    expect(() => popupInputSchema.parse({ ...valid, showDelaySeconds: 2.5 })).toThrow();
  });

  /**
   * The form validates, then the value hits a fixed-width column. If a
   * bound here were looser than its column, the insert would fail at the
   * database with an opaque error instead of a field-level message.
   */
  it("keeps every text bound within its column width", () => {
    // Mirrors the varchar lengths declared in drizzle/schema.ts.
    const columns = { title: 256, subtitle: 512, discountCode: 64, buttonText: 128 };
    expect(() => popupInputSchema.parse({ ...valid, title: "a".repeat(columns.title) })).not.toThrow();
    expect(() => popupInputSchema.parse({ ...valid, title: "a".repeat(columns.title + 1) })).toThrow();
    expect(() => popupInputSchema.parse({ ...valid, subtitle: "a".repeat(columns.subtitle) })).not.toThrow();
    expect(() => popupInputSchema.parse({ ...valid, subtitle: "a".repeat(columns.subtitle + 1) })).toThrow();
    expect(() => popupInputSchema.parse({ ...valid, discountCode: "a".repeat(columns.discountCode) })).not.toThrow();
    expect(() => popupInputSchema.parse({ ...valid, discountCode: "a".repeat(columns.discountCode + 1) })).toThrow();
    expect(() => popupInputSchema.parse({ ...valid, buttonText: "a".repeat(columns.buttonText) })).not.toThrow();
    expect(() => popupInputSchema.parse({ ...valid, buttonText: "a".repeat(columns.buttonText + 1) })).toThrow();
  });

  it("bounds bodyText, which is TEXT and would otherwise be unbounded input", () => {
    expect(() => popupInputSchema.parse({ ...valid, bodyText: "a".repeat(2000) })).not.toThrow();
    expect(() => popupInputSchema.parse({ ...valid, bodyText: "a".repeat(2001) })).toThrow();
  });

  it("requires active to be a real boolean, not a truthy string", () => {
    expect(() => popupInputSchema.parse({ ...valid, active: "true" })).toThrow();
    expect(() => popupInputSchema.parse({ ...valid, active: 1 })).toThrow();
  });
});

describe("promo_popups table shape", () => {
  it("defaults a new popup to inactive, so creating one can't hijack the live slot", () => {
    expect(promoPopups.active.default).toBe(false);
    expect(promoPopups.active.notNull).toBe(true);
  });

  it("defaults the delay to 3 seconds", () => {
    expect(promoPopups.showDelaySeconds.default).toBe(3);
    expect(promoPopups.showDelaySeconds.notNull).toBe(true);
  });

  it("allows a popup with no image, so the layout must cope without one", () => {
    expect(promoPopups.imageKey.notNull).toBe(false);
    expect(promoPopups.imageUrl.notNull).toBe(false);
  });

  it("requires the fields the popup cannot render without", () => {
    expect(promoPopups.title.notNull).toBe(true);
    expect(promoPopups.discountCode.notNull).toBe(true);
    expect(promoPopups.buttonText.notNull).toBe(true);
  });
});
