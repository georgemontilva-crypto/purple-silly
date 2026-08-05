// Shopify Storefront API Client
// Credentials are injected via environment variables — never hardcoded.

const SHOPIFY_DOMAIN = import.meta.env.VITE_SHOPIFY_STORE_DOMAIN as string;
const STOREFRONT_TOKEN = import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN as string;

export function isShopifyConfigured(): boolean {
  return Boolean(SHOPIFY_DOMAIN && STOREFRONT_TOKEN);
}

async function shopifyFetch<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  if (!SHOPIFY_DOMAIN || !STOREFRONT_TOKEN) {
    throw new Error("Shopify is not configured. Set VITE_SHOPIFY_STORE_DOMAIN and VITE_SHOPIFY_STOREFRONT_TOKEN.");
  }
  const endpoint = `https://${SHOPIFY_DOMAIN}/api/2024-01/graphql.json`;
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": STOREFRONT_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`Shopify API error: ${res.status}`);
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0]?.message ?? "Shopify GraphQL error");
  return json.data as T;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ShopifyImage {
  url: string;
  altText: string | null;
  width: number;
  height: number;
}

export interface ShopifyPrice {
  amount: string;
  currencyCode: string;
}

export interface ShopifyVariant {
  id: string;
  title: string;
  price: ShopifyPrice;
  compareAtPrice: ShopifyPrice | null;
  availableForSale: boolean;
  selectedOptions: { name: string; value: string }[];
}

export interface ShopifyProduct {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml: string;
  featuredImage: ShopifyImage | null;
  images: { nodes: ShopifyImage[] };
  variants: { nodes: ShopifyVariant[] };
  priceRange: {
    minVariantPrice: ShopifyPrice;
    maxVariantPrice: ShopifyPrice;
  };
  tags: string[];
  vendor: string;
  productType: string;
  metafields?: { key: string; value: string }[];
}

export interface ShopifyCollection {
  id: string;
  handle: string;
  title: string;
  description: string;
  image: ShopifyImage | null;
  products: { nodes: ShopifyProduct[] };
}

export interface ShopifyCartLine {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    title: string;
    price: ShopifyPrice;
    product: { title: string; handle: string; featuredImage: ShopifyImage | null };
    selectedOptions: { name: string; value: string }[];
  };
  cost: { totalAmount: ShopifyPrice };
}

export interface ShopifyCart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  lines: { nodes: ShopifyCartLine[] };
  cost: {
    totalAmount: ShopifyPrice;
    subtotalAmount: ShopifyPrice;
  };
}

// ─── Fragments ────────────────────────────────────────────────────────────────

const PRODUCT_FRAGMENT = `
  fragment ProductFields on Product {
    id handle title description descriptionHtml
    tags vendor productType
    featuredImage { url altText width height }
    images(first: 5) { nodes { url altText width height } }
    priceRange {
      minVariantPrice { amount currencyCode }
      maxVariantPrice { amount currencyCode }
    }
    variants(first: 10) {
      nodes {
        id title availableForSale
        price { amount currencyCode }
        compareAtPrice { amount currencyCode }
        selectedOptions { name value }
      }
    }
  }
`;

const CART_FRAGMENT = `
  fragment CartFields on Cart {
    id checkoutUrl totalQuantity
    cost {
      totalAmount { amount currencyCode }
      subtotalAmount { amount currencyCode }
    }
    lines(first: 50) {
      nodes {
        id quantity
        cost { totalAmount { amount currencyCode } }
        merchandise {
          ... on ProductVariant {
            id title
            price { amount currencyCode }
            selectedOptions { name value }
            product { title handle featuredImage { url altText width height } }
          }
        }
      }
    }
  }
`;

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function getProducts(first = 20): Promise<ShopifyProduct[]> {
  const data = await shopifyFetch<{ products: { nodes: ShopifyProduct[] } }>(`
    ${PRODUCT_FRAGMENT}
    query GetProducts($first: Int!) {
      products(first: $first) { nodes { ...ProductFields } }
    }
  `, { first });
  return data.products.nodes;
}

export async function getProductByHandle(handle: string): Promise<ShopifyProduct | null> {
  const data = await shopifyFetch<{ productByHandle: ShopifyProduct | null }>(`
    ${PRODUCT_FRAGMENT}
    query GetProduct($handle: String!) {
      productByHandle(handle: $handle) { ...ProductFields }
    }
  `, { handle });
  return data.productByHandle;
}

export async function getCollectionByHandle(handle: string, first = 20): Promise<ShopifyCollection | null> {
  const data = await shopifyFetch<{ collectionByHandle: ShopifyCollection | null }>(`
    ${PRODUCT_FRAGMENT}
    query GetCollection($handle: String!, $first: Int!) {
      collectionByHandle(handle: $handle) {
        id handle title description
        image { url altText width height }
        products(first: $first) { nodes { ...ProductFields } }
      }
    }
  `, { handle, first });
  return data.collectionByHandle;
}

// ─── Cart Mutations ───────────────────────────────────────────────────────────

export async function createCart(): Promise<ShopifyCart> {
  const data = await shopifyFetch<{ cartCreate: { cart: ShopifyCart } }>(`
    ${CART_FRAGMENT}
    mutation CartCreate {
      cartCreate { cart { ...CartFields } }
    }
  `);
  return data.cartCreate.cart;
}

export async function addToCart(cartId: string, lines: { merchandiseId: string; quantity: number }[]): Promise<ShopifyCart> {
  const data = await shopifyFetch<{ cartLinesAdd: { cart: ShopifyCart } }>(`
    ${CART_FRAGMENT}
    mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) { cart { ...CartFields } }
    }
  `, { cartId, lines });
  return data.cartLinesAdd.cart;
}

export async function updateCartLine(cartId: string, lineId: string, quantity: number): Promise<ShopifyCart> {
  const data = await shopifyFetch<{ cartLinesUpdate: { cart: ShopifyCart } }>(`
    ${CART_FRAGMENT}
    mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
      cartLinesUpdate(cartId: $cartId, lines: $lines) { cart { ...CartFields } }
    }
  `, { cartId, lines: [{ id: lineId, quantity }] });
  return data.cartLinesUpdate.cart;
}

export async function removeCartLine(cartId: string, lineId: string): Promise<ShopifyCart> {
  const data = await shopifyFetch<{ cartLinesRemove: { cart: ShopifyCart } }>(`
    ${CART_FRAGMENT}
    mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
      cartLinesRemove(cartId: $cartId, lineIds: $lineIds) { cart { ...CartFields } }
    }
  `, { cartId, lineIds: [lineId] });
  return data.cartLinesRemove.cart;
}

export async function getCart(cartId: string): Promise<ShopifyCart | null> {
  const data = await shopifyFetch<{ cart: ShopifyCart | null }>(`
    ${CART_FRAGMENT}
    query GetCart($cartId: ID!) {
      cart(id: $cartId) { ...CartFields }
    }
  `, { cartId });
  return data.cart;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function formatPrice(price: ShopifyPrice): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: price.currencyCode,
  }).format(parseFloat(price.amount));
}

