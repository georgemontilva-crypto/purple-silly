import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2, Package, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { ADMIN_COLORS as C, alpha } from "@/lib/adminTheme";
import ProductForm from "./ProductForm";

const fieldStyle: React.CSSProperties = {
  background: C.panel, border: `1px solid ${alpha(C.border, 35)}`,
  borderRadius: "0.5rem", padding: "0.5rem 0.75rem", color: C.text, fontSize: "0.85rem",
  outline: "none", boxSizing: "border-box",
};

const STATUS_STYLE: Record<string, { bg: string; fg: string }> = {
  draft: { bg: alpha(C.muted, 20), fg: C.muted },
  active: { bg: alpha(C.green, 22), fg: C.green },
  archived: { bg: alpha(C.pink, 18), fg: C.pink },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLE[status] ?? STATUS_STYLE.draft;
  return (
    <span style={{ padding: "0.15rem 0.6rem", borderRadius: "999px", fontSize: "0.68rem", fontWeight: 700, textTransform: "capitalize", background: s.bg, color: s.fg }}>
      {status}
    </span>
  );
}

function DeleteButton({ onConfirm }: { onConfirm: () => void }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onConfirm}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        width: 30, height: 30, borderRadius: "0.4rem",
        border: `1px solid ${hover ? C.pink : alpha(C.pink, 40)}`,
        background: hover ? alpha(C.pink, 15) : "transparent",
        color: C.pink, cursor: "pointer", transition: "background 0.15s, border-color 0.15s",
      }}
    >
      <Trash2 size={13} />
    </button>
  );
}

function ProductsList({ onEdit, onCreate }: { onEdit: (id: number) => void; onCreate: () => void }) {
  const utils = trpc.useUtils();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");

  const { data: categories } = trpc.adminCatalog.categories.list.useQuery();
  const { data: list, isLoading } = trpc.adminCatalog.products.list.useQuery({
    search: search || undefined,
    status: (status || undefined) as "draft" | "active" | "archived" | undefined,
    categoryId: categoryId ? Number(categoryId) : undefined,
  });
  const del = trpc.adminCatalog.products.delete.useMutation({
    onSuccess: () => { utils.adminCatalog.products.list.invalidate(); toast.success("Product deleted"); },
    onError: e => toast.error(e.message),
  });

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap", marginBottom: "1.25rem" }}>
        <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "1.6rem", color: C.text, margin: 0 }}>
          Products
        </h2>
        <button
          onClick={onCreate}
          style={{
            display: "flex", alignItems: "center", gap: "0.4rem",
            padding: "0.55rem 1.25rem", borderRadius: "0.5rem",
            background: `linear-gradient(135deg, ${C.bright}, ${C.pink})`,
            border: "none", color: "white", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer",
          }}
        >
          <Plus size={15} /> New Product
        </button>
      </div>

      <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", marginBottom: "1.25rem" }}>
        <div style={{ position: "relative", flex: "1 1 220px" }}>
          <Search size={14} style={{ position: "absolute", left: "0.65rem", top: "50%", transform: "translateY(-50%)", color: C.muted }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products..."
            style={{ ...fieldStyle, width: "100%", paddingLeft: "2rem" }}
          />
        </div>
        <select value={status} onChange={e => setStatus(e.target.value)} style={fieldStyle}>
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
        </select>
        <select value={categoryId} onChange={e => setCategoryId(e.target.value)} style={fieldStyle}>
          <option value="">All categories</option>
          {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {isLoading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", color: C.muted, padding: "3rem", fontSize: "0.9rem" }}>
          <Loader2 size={18} className="animate-spin" /> Cargando productos...
        </div>
      ) : !list || list.length === 0 ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", color: C.muted, padding: "3rem", textAlign: "center", border: `1px dashed ${alpha(C.border, 35)}`, borderRadius: "1rem" }}>
          <Package size={28} style={{ opacity: 0.5 }} />
          <span style={{ fontSize: "0.9rem" }}>No products found.</span>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${alpha(C.border, 35)}` }}>
                {["", "Title", "Category", "Stock", "Status", ""].map(h => (
                  <th key={h} style={{ color: C.muted, fontWeight: 700, textAlign: "left", padding: "0.6rem 0.6rem", whiteSpace: "nowrap", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {list.map(p => (
                <tr key={p.id} style={{ borderBottom: `1px solid ${alpha(C.border, 18)}` }}>
                  <td style={{ padding: "0.5rem 0.6rem" }}>
                    <div style={{ width: 36, height: 36, borderRadius: "0.4rem", overflow: "hidden", background: C.panelAlt, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {p.imageUrl ? <img src={p.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Package size={14} style={{ color: C.muted }} />}
                    </div>
                  </td>
                  <td style={{ padding: "0.5rem 0.6rem", color: C.text, fontWeight: 600, cursor: "pointer" }} onClick={() => onEdit(p.id)}>
                    {p.title}
                    {p.featured && <span style={{ marginLeft: "0.4rem", fontSize: "0.65rem", fontWeight: 700, padding: "0.1rem 0.4rem", borderRadius: "999px", background: alpha(C.vivid, 20), color: C.bright }}>Featured</span>}
                  </td>
                  <td style={{ padding: "0.5rem 0.6rem", color: C.muted }}>{p.categoryName ?? "—"}</td>
                  <td style={{ padding: "0.5rem 0.6rem", color: p.totalStock > 0 ? C.text : C.pink }}>{p.totalStock}</td>
                  <td style={{ padding: "0.5rem 0.6rem" }}><StatusBadge status={p.status} /></td>
                  <td style={{ padding: "0.5rem 0.6rem" }}>
                    <div style={{ display: "flex", gap: "0.4rem", justifyContent: "flex-end" }}>
                      <button
                        onClick={() => onEdit(p.id)}
                        style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 30, height: 30, borderRadius: "0.4rem", border: `1px solid ${alpha(C.border, 40)}`, background: "transparent", color: C.muted, cursor: "pointer" }}
                      >
                        <Pencil size={13} />
                      </button>
                      <DeleteButton onConfirm={() => { if (confirm(`Delete "${p.title}"? This also removes its images, variants and bundles.`)) del.mutate({ id: p.id }); }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function AdminProducts() {
  const [view, setView] = useState<{ mode: "list" } | { mode: "edit"; id: number } | { mode: "create" }>({ mode: "list" });

  if (view.mode === "list") {
    return <ProductsList onEdit={id => setView({ mode: "edit", id })} onCreate={() => setView({ mode: "create" })} />;
  }

  return (
    <ProductForm
      productId={view.mode === "edit" ? view.id : undefined}
      onDone={() => setView({ mode: "list" })}
    />
  );
}
