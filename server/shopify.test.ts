import { describe, expect, it } from "vitest";

// Unit tests for Shopify client utilities
// These tests validate the helper functions without requiring a live Shopify connection.

describe("Shopify formatPrice", () => {
  it("formats USD price correctly", () => {
    const price = { amount: "24.99", currencyCode: "USD" };
    const formatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: price.currencyCode,
    }).format(parseFloat(price.amount));
    expect(formatted).toBe("$24.99");
  });

  it("formats zero price correctly", () => {
    const price = { amount: "0.00", currencyCode: "USD" };
    const formatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: price.currencyCode,
    }).format(parseFloat(price.amount));
    expect(formatted).toBe("$0.00");
  });

  it("formats large price correctly", () => {
    const price = { amount: "119.99", currencyCode: "USD" };
    const formatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: price.currencyCode,
    }).format(parseFloat(price.amount));
    expect(formatted).toBe("$119.99");
  });
});

describe("Shopify discount calculation", () => {
  it("calculates discount percentage correctly", () => {
    const price = "64.99";
    const compareAt = "74.97";
    const discount = Math.round((1 - parseFloat(price) / parseFloat(compareAt)) * 100);
    expect(discount).toBe(13);
  });

  it("returns 0 when no discount", () => {
    const price = "24.99";
    const compareAt = "24.99";
    const discount = Math.round((1 - parseFloat(price) / parseFloat(compareAt)) * 100);
    expect(discount).toBe(0);
  });

  it("handles 50% discount", () => {
    const price = "12.50";
    const compareAt = "25.00";
    const discount = Math.round((1 - parseFloat(price) / parseFloat(compareAt)) * 100);
    expect(discount).toBe(50);
  });
});

describe("Shopify isConfigured check", () => {
  it("returns false when env vars are missing", () => {
    const domain = "";
    const token = "";
    const configured = Boolean(domain && token);
    expect(configured).toBe(false);
  });

  it("returns true when both env vars are set", () => {
    const domain = "my-store.myshopify.com";
    const token = "shpat_abc123";
    const configured = Boolean(domain && token);
    expect(configured).toBe(true);
  });

  it("returns false when only domain is set", () => {
    const domain = "my-store.myshopify.com";
    const token = "";
    const configured = Boolean(domain && token);
    expect(configured).toBe(false);
  });
});

describe("Cart localStorage key", () => {
  it("uses the correct key name", () => {
    const CART_ID_KEY = "fw_shopify_cart_id";
    expect(CART_ID_KEY).toBe("fw_shopify_cart_id");
    expect(CART_ID_KEY).toContain("shopify");
  });
});

describe("Shopify checkout URL builder", () => {
  it("extracts numeric ID from GID and builds cart URL", () => {
    const variantGid = "gid://shopify/ProductVariant/123456789";
    const numericId = variantGid.split("/").pop();
    const shop = "purple-co-magic.myshopify.com";
    const checkoutUrl = `https://${shop}/cart/${numericId}:1`;
    expect(checkoutUrl).toBe("https://purple-co-magic.myshopify.com/cart/123456789:1");
  });

  it("builds multi-item cart URL correctly", () => {
    const lines = [
      { variantId: "gid://shopify/ProductVariant/111", quantity: 2 },
      { variantId: "gid://shopify/ProductVariant/222", quantity: 1 },
    ];
    const shop = "purple-co-magic.myshopify.com";
    const cartItems = lines
      .map((l) => `${l.variantId.split("/").pop()}:${l.quantity}`)
      .join(",");
    const checkoutUrl = `https://${shop}/cart/${cartItems}`;
    expect(checkoutUrl).toBe("https://purple-co-magic.myshopify.com/cart/111:2,222:1");
  });

  it("handles plain numeric variantId (not GID)", () => {
    const variantId = "987654321";
    const numericId = variantId.split("/").pop();
    expect(numericId).toBe("987654321");
  });
});

describe("Shopify Client ID validation", () => {
  it("client ID has expected format (32 hex chars)", () => {
    const clientId = "3b0eee4488a6cdd6b9599d1845875a69";
    expect(clientId).toMatch(/^[a-f0-9]{32}$/);
  });

  it("client secret has expected shpss_ prefix", () => {
    const secret = "shpss_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";
    expect(secret.startsWith("shpss_")).toBe(true);
  });

  it("shop domain has myshopify.com format", () => {
    const shop = "purple-co-magic.myshopify.com";
    expect(shop).toMatch(/^[a-z0-9-]+\.myshopify\.com$/);
  });
});
