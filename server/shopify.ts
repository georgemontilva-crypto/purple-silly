/**
 * Shopify Admin API integration using Client Credentials Grant (Dev Dashboard apps).
 * Tokens are requested server-side and cached for 23 hours (expire at 24h).
 * Never exposes credentials to the frontend.
 */

const SHOP = process.env.SHOPIFY_SHOP ?? "";
const CLIENT_ID = process.env.SHOPIFY_CLIENT_ID ?? "";
const CLIENT_SECRET = process.env.SHOPIFY_CLIENT_SECRET ?? "";
const API_VERSION = "2025-01";

let cachedToken: string | null = null;
let tokenExpiresAt = 0;

export async function getShopifyToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiresAt - 60_000) {
    return cachedToken;
  }

  if (!SHOP || !CLIENT_ID || !CLIENT_SECRET) {
    throw new Error("Shopify credentials not configured. Set SHOPIFY_SHOP, SHOPIFY_CLIENT_ID, and SHOPIFY_CLIENT_SECRET.");
  }

  const response = await fetch(
    `https://${SHOP}/admin/oauth/access_token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      }),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Shopify token request failed (${response.status}): ${text}`);
  }

  const { access_token, expires_in } = await response.json() as { access_token: string; expires_in: number };
  cachedToken = access_token;
  tokenExpiresAt = Date.now() + expires_in * 1000;
  return access_token;
}

export async function shopifyGraphQL<T = unknown>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const token = await getShopifyToken();

  const response = await fetch(
    `https://${SHOP}/admin/api/${API_VERSION}/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": token,
      },
      body: JSON.stringify({ query, variables }),
    }
  );

  if (!response.ok) {
    throw new Error(`Shopify GraphQL request failed: ${response.status}`);
  }

  const result = await response.json() as { data?: T; errors?: Array<{ message: string }> };
  if (result.errors?.length) {
    throw new Error(`Shopify GraphQL errors: ${result.errors.map(e => e.message).join(", ")}`);
  }

  return result.data as T;
}

// ─── Product Queries ──────────────────────────────────────────────────────────

export async function getProducts(first = 20, collectionHandle?: string) {
  if (collectionHandle) {
    const data = await shopifyGraphQL<{ collectionByHandle: { products: { edges: Array<{ node: ShopifyProduct }> } } | null }>(
      `query GetCollectionProducts($handle: String!, $first: Int!) {
        collectionByHandle(handle: $handle) {
          products(first: $first) {
            edges {
              node {
                id
                title
                handle
                description
                priceRange {
                  minVariantPrice { amount currencyCode }
                  maxVariantPrice { amount currencyCode }
                }
                images(first: 3) {
                  edges { node { url altText width height } }
                }
                variants(first: 10) {
                  edges {
                    node {
                      id title price { amount currencyCode }
                      selectedOptions { name value }
                      availableForSale
                    }
                  }
                }
                metafields(identifiers: [{ namespace: "reviews", key: "rating" }, { namespace: "reviews", key: "rating_count" }]) {
                  key value
                }
                tags
                availableForSale
              }
            }
          }
        }
      }`,
      { handle: collectionHandle, first }
    );
    return data.collectionByHandle?.products.edges.map(e => e.node) ?? [];
  }

  const data = await shopifyGraphQL<{ products: { edges: Array<{ node: ShopifyProduct }> } }>(
    `query GetProducts($first: Int!) {
      products(first: $first) {
        edges {
          node {
            id
            title
            handle
            description
            priceRange {
              minVariantPrice { amount currencyCode }
              maxVariantPrice { amount currencyCode }
            }
            images(first: 3) {
              edges { node { url altText width height } }
            }
            variants(first: 10) {
              edges {
                node {
                  id title price { amount currencyCode }
                  selectedOptions { name value }
                  availableForSale
                }
              }
            }
            tags
            availableForSale
          }
        }
      }
    }`,
    { first }
  );
  return data.products.edges.map(e => e.node);
}

export async function getProductByHandle(handle: string) {
  const data = await shopifyGraphQL<{ productByHandle: ShopifyProduct | null }>(
    `query GetProduct($handle: String!) {
      productByHandle(handle: $handle) {
        id title handle description descriptionHtml
        priceRange {
          minVariantPrice { amount currencyCode }
          maxVariantPrice { amount currencyCode }
        }
        images(first: 10) {
          edges { node { url altText width height } }
        }
        variants(first: 20) {
          edges {
            node {
              id title price { amount currencyCode }
              compareAtPrice { amount currencyCode }
              selectedOptions { name value }
              availableForSale
            }
          }
        }
        options { id name values }
        tags
        availableForSale
        seo { title description }
      }
    }`,
    { handle }
  );
  return data.productByHandle;
}

export async function getCollections(first = 10) {
  const data = await shopifyGraphQL<{ collections: { edges: Array<{ node: ShopifyCollection }> } }>(
    `query GetCollections($first: Int!) {
      collections(first: $first) {
        edges {
          node {
            id title handle description
            image { url altText }
            products(first: 1) { edges { node { id } } }
          }
        }
      }
    }`,
    { first }
  );
  return data.collections.edges.map(e => e.node);
}

// ─── Cart Mutations ───────────────────────────────────────────────────────────
// Note: Cart API uses Storefront API (unauthenticated), not Admin API.
// We proxy it server-side to avoid CORS issues and keep credentials centralized.

export async function createCart(lines: Array<{ merchandiseId: string; quantity: number }>) {
  // Cart operations use Storefront API with public token — we use the shop domain only
  const response = await fetch(
    `https://${SHOP}/api/${API_VERSION}/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Storefront API public access (unauthenticated)
        "X-Shopify-Storefront-Access-Token": process.env.SHOPIFY_STOREFRONT_TOKEN ?? "",
      },
      body: JSON.stringify({
        query: `mutation cartCreate($lines: [CartLineInput!]) {
          cartCreate(input: { lines: $lines }) {
            cart { id checkoutUrl
              lines(first: 20) {
                edges { node {
                  id quantity
                  merchandise { ... on ProductVariant { id title price { amount currencyCode }
                    product { title images(first: 1) { edges { node { url altText } } } }
                  }}
                }}
              }
              cost { totalAmount { amount currencyCode } }
            }
            userErrors { field message }
          }
        }`,
        variables: { lines },
      }),
    }
  );
  const result = await response.json() as { data: { cartCreate: { cart: ShopifyCart; userErrors: Array<{ message: string }> } } };
  return result.data.cartCreate;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ShopifyProduct {
  id: string;
  title: string;
  handle: string;
  description: string;
  descriptionHtml?: string;
  priceRange: {
    minVariantPrice: { amount: string; currencyCode: string };
    maxVariantPrice: { amount: string; currencyCode: string };
  };
  images: { edges: Array<{ node: { url: string; altText: string | null; width: number; height: number } }> };
  variants: {
    edges: Array<{
      node: {
        id: string;
        title: string;
        price: { amount: string; currencyCode: string };
        compareAtPrice?: { amount: string; currencyCode: string } | null;
        selectedOptions: Array<{ name: string; value: string }>;
        availableForSale: boolean;
      };
    }>;
  };
  options?: Array<{ id: string; name: string; values: string[] }>;
  tags: string[];
  availableForSale: boolean;
  metafields?: Array<{ key: string; value: string } | null>;
  seo?: { title: string; description: string };
}

export interface ShopifyCollection {
  id: string;
  title: string;
  handle: string;
  description: string;
  image?: { url: string; altText: string | null } | null;
  products: { edges: Array<{ node: { id: string } }> };
}

export interface ShopifyCart {
  id: string;
  checkoutUrl: string;
  lines: {
    edges: Array<{
      node: {
        id: string;
        quantity: number;
        merchandise: {
          id: string;
          title: string;
          price: { amount: string; currencyCode: string };
          product: {
            title: string;
            images: { edges: Array<{ node: { url: string; altText: string | null } }> };
          };
        };
      };
    }>;
  };
  cost: { totalAmount: { amount: string; currencyCode: string } };
}
