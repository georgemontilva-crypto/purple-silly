import { trpc } from "@/lib/trpc";

const C = {
  border: "oklch(0.18 0.06 295)",
  vivid:  "oklch(0.52 0.28 295)",
  pink:   "oklch(0.72 0.22 320)",
  text:   "oklch(0.92 0.02 295)",
  muted:  "oklch(0.55 0.07 295)",
};

export default function AdminProducts() {
  const { data: products, isLoading } = trpc.shopify.products.useQuery({ first: 50 });
  const { data: collections } = trpc.shopify.collections.useQuery({ first: 20 });

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "1.6rem", color: C.text, margin: 0 }}>
          Shopify Products ({products?.length ?? 0})
        </h2>
        <a
          href="https://purple-co-magic.myshopify.com/admin/products"
          target="_blank" rel="noopener noreferrer"
          style={{
            padding: "0.5rem 1.25rem", borderRadius: "0.5rem",
            background: `${C.vivid}20`, border: `1px solid ${C.vivid}40`,
            color: C.vivid, fontWeight: 700, fontSize: "0.85rem",
            textDecoration: "none",
          }}
        >
          Manage in Shopify Admin ↗
        </a>
      </div>

      {/* Collections */}
      {collections && collections.length > 0 && (
        <div style={{ marginBottom: "1.5rem" }}>
          <div style={{ color: C.muted, fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>Collections</div>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {collections.map(col => (
              <span key={col.id} style={{
                padding: "0.3rem 0.75rem", borderRadius: "999px",
                background: `${C.pink}15`, border: `1px solid ${C.pink}30`,
                color: C.text, fontSize: "0.8rem", fontWeight: 600,
              }}>
                {col.title}
              </span>
            ))}
          </div>
        </div>
      )}

      {isLoading ? (
        <div style={{ color: C.muted, padding: "2rem", textAlign: "center" }}>Loading products from Shopify...</div>
      ) : !products || products.length === 0 ? (
        <div style={{
          background: `${C.vivid}08`, border: `1px solid ${C.border}`,
          borderRadius: "1rem", padding: "3rem", textAlign: "center",
        }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>🛍️</div>
          <div style={{ color: C.text, fontWeight: 700, marginBottom: "0.5rem" }}>No products found</div>
          <div style={{ color: C.muted, fontSize: "0.9rem", marginBottom: "1.5rem" }}>Connect your Shopify store to see products here.</div>
          <a href="https://purple-co-magic.myshopify.com/admin/products" target="_blank" rel="noopener noreferrer"
            style={{ color: C.vivid, fontWeight: 700, textDecoration: "none" }}>
            Open Shopify Admin →
          </a>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
          {products.map(p => (
            <div key={p.id} style={{
              background: `${C.vivid}08`, border: `1px solid ${C.border}`,
              borderRadius: "1rem", overflow: "hidden",
              transition: "border-color 0.15s",
            }}>
              {p.images?.edges?.[0]?.node?.url ? (
                <img src={p.images.edges[0].node.url} alt={p.title} style={{ width: "100%", height: 180, objectFit: "cover" }} />
              ) : (
                <div style={{ width: "100%", height: 180, background: `${C.vivid}15`, display: "flex", alignItems: "center", justifyContent: "center", color: C.muted, fontSize: "0.8rem" }}>
                  No image
                </div>
              )}
              <div style={{ padding: "1rem" }}>
                <div style={{ color: C.text, fontWeight: 700, fontSize: "0.95rem", marginBottom: "0.25rem" }}>{p.title}</div>
                <div style={{ color: C.vivid, fontWeight: 800, fontSize: "1rem" }}>
                  {p.priceRange?.minVariantPrice?.amount ? `$${p.priceRange.minVariantPrice.amount}` : "—"}
                </div>
                <div style={{ color: C.muted, fontSize: "0.75rem", marginTop: "0.25rem" }}>
                  {p.variants?.edges?.length ?? 0} variant{(p.variants?.edges?.length ?? 0) !== 1 ? "s" : ""}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
