import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { FolderTree, Loader2 } from "lucide-react";

const C = {
  border: "oklch(0.18 0.06 295)",
  vivid:  "oklch(0.52 0.28 295)",
  pink:   "oklch(0.72 0.22 320)",
  text:   "oklch(0.92 0.02 295)",
  muted:  "oklch(0.55 0.07 295)",
};

export default function AdminCategories() {
  const { data: cats, isLoading, refetch } = trpc.admin.categories.list.useQuery();
  const createCat = trpc.admin.categories.create.useMutation({
    onSuccess: () => { refetch(); toast.success("Category created"); setForm({ name: "", slug: "", description: "" }); },
    onError: (e) => toast.error(e.message),
  });
  const deleteCat = trpc.admin.categories.delete.useMutation({
    onSuccess: () => { refetch(); toast.success("Category deleted"); },
    onError: (e) => toast.error(e.message),
  });

  const [form, setForm] = useState({ name: "", slug: "", description: "" });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.slug) return toast.error("Name and slug are required");
    createCat.mutate({ name: form.name, slug: form.slug, description: form.description });
  };

  return (
    <div>
      <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "1.6rem", color: C.text, margin: "0 0 1.5rem" }}>
        Lab Report Categories
      </h2>

      {/* Create form */}
      <form onSubmit={handleCreate} style={{
        background: `${C.vivid}08`, border: `1px solid ${C.border}`,
        borderRadius: "1rem", padding: "1.5rem", marginBottom: "2rem",
        display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "flex-end",
      }}>
        <div style={{ flex: "1 1 180px" }}>
          <label style={{ color: C.muted, fontSize: "0.75rem", fontWeight: 700, display: "block", marginBottom: "0.4rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Name</label>
          <input value={form.name} onChange={e => {
            const name = e.target.value;
            setForm(f => ({ ...f, name, slug: name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") }));
          }}
          placeholder="Silly Dots"
          style={{ width: "100%", background: `${C.vivid}10`, border: `1px solid ${C.border}`, borderRadius: "0.5rem", padding: "0.5rem 0.75rem", color: C.text, fontSize: "0.9rem", outline: "none", boxSizing: "border-box" }} />
        </div>
        <div style={{ flex: "1 1 180px" }}>
          <label style={{ color: C.muted, fontSize: "0.75rem", fontWeight: 700, display: "block", marginBottom: "0.4rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Slug</label>
          <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
          placeholder="silly-dots"
          style={{ width: "100%", background: `${C.vivid}10`, border: `1px solid ${C.border}`, borderRadius: "0.5rem", padding: "0.5rem 0.75rem", color: C.text, fontSize: "0.9rem", outline: "none", boxSizing: "border-box" }} />
        </div>
        <div style={{ flex: "2 1 240px" }}>
          <label style={{ color: C.muted, fontSize: "0.75rem", fontWeight: 700, display: "block", marginBottom: "0.4rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Description</label>
          <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          placeholder="Optional description"
          style={{ width: "100%", background: `${C.vivid}10`, border: `1px solid ${C.border}`, borderRadius: "0.5rem", padding: "0.5rem 0.75rem", color: C.text, fontSize: "0.9rem", outline: "none", boxSizing: "border-box" }} />
        </div>
        <button type="submit" disabled={createCat.isPending} style={{
          padding: "0.55rem 1.5rem", borderRadius: "0.5rem",
          background: `linear-gradient(135deg, ${C.vivid}, ${C.pink})`,
          border: "none", color: "white", fontWeight: 700, fontSize: "0.9rem",
          cursor: "pointer", whiteSpace: "nowrap",
        }}>
          + Add Category
        </button>
      </form>

      {/* List */}
      {isLoading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", color: C.muted, padding: "3rem", fontSize: "0.9rem" }}>
          <Loader2 size={18} className="animate-spin" /> Cargando categorías...
        </div>
      ) : !cats || cats.length === 0 ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", color: C.muted, padding: "3rem", textAlign: "center", border: `1px dashed ${C.border}`, borderRadius: "1rem" }}>
          <FolderTree size={28} style={{ opacity: 0.5 }} />
          <span style={{ fontSize: "0.9rem" }}>No categories yet. Add one above.</span>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {cats.map(cat => (
            <div key={cat.id} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "1rem 1.25rem",
              background: `${C.vivid}08`, border: `1px solid ${C.border}`,
              borderRadius: "0.75rem", flexWrap: "wrap", gap: "0.5rem",
            }}>
              <div>
                <div style={{ color: C.text, fontWeight: 700, fontSize: "1rem" }}>{cat.name}</div>
                <div style={{ color: C.muted, fontSize: "0.8rem" }}>/{cat.slug} {cat.description ? `· ${cat.description}` : ""}</div>
              </div>
              <button
                onClick={() => { if (confirm(`Delete "${cat.name}"?`)) deleteCat.mutate({ id: cat.id }); }}
                disabled={deleteCat.isPending}
                style={{
                  padding: "0.3rem 0.75rem", borderRadius: "0.4rem", fontSize: "0.75rem",
                  border: `1px solid ${C.pink}40`, background: "transparent",
                  color: C.pink, cursor: "pointer", fontWeight: 600,
                }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
