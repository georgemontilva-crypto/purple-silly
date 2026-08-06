import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { FolderTree, Loader2 } from "lucide-react";
import { ADMIN_COLORS as C, alpha } from "@/lib/adminTheme";

function inputStyle(focused: boolean): React.CSSProperties {
  return {
    width: "100%",
    background: C.panel,
    border: `1px solid ${focused ? C.vivid : alpha(C.border, 35)}`,
    borderRadius: "0.5rem",
    padding: "0.5rem 0.75rem",
    color: C.text,
    fontSize: "0.9rem",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.15s",
  };
}

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
  const [focused, setFocused] = useState<"name" | "slug" | "description" | null>(null);
  const [submitHover, setSubmitHover] = useState(false);
  const [hoveredDelete, setHoveredDelete] = useState<number | null>(null);

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
        background: C.panel, border: `1px solid ${alpha(C.border, 35)}`,
        borderRadius: "1rem", padding: "1.5rem", marginBottom: "2rem",
        display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "flex-end",
      }}>
        <div style={{ flex: "1 1 180px" }}>
          <label style={{ color: C.muted, fontSize: "0.75rem", fontWeight: 700, display: "block", marginBottom: "0.4rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Name</label>
          <input value={form.name} onChange={e => {
            const name = e.target.value;
            setForm(f => ({ ...f, name, slug: name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") }));
          }}
          onFocus={() => setFocused("name")} onBlur={() => setFocused(null)}
          placeholder="Silly Dots"
          style={inputStyle(focused === "name")} />
        </div>
        <div style={{ flex: "1 1 180px" }}>
          <label style={{ color: C.muted, fontSize: "0.75rem", fontWeight: 700, display: "block", marginBottom: "0.4rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Slug</label>
          <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
          onFocus={() => setFocused("slug")} onBlur={() => setFocused(null)}
          placeholder="silly-dots"
          style={inputStyle(focused === "slug")} />
        </div>
        <div style={{ flex: "2 1 240px" }}>
          <label style={{ color: C.muted, fontSize: "0.75rem", fontWeight: 700, display: "block", marginBottom: "0.4rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Description</label>
          <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          onFocus={() => setFocused("description")} onBlur={() => setFocused(null)}
          placeholder="Optional description"
          style={inputStyle(focused === "description")} />
        </div>
        <button type="submit" disabled={createCat.isPending}
          onMouseEnter={() => setSubmitHover(true)} onMouseLeave={() => setSubmitHover(false)}
          style={{
            padding: "0.55rem 1.5rem", borderRadius: "0.5rem",
            background: `linear-gradient(135deg, ${C.vivid}, ${C.pink})`,
            border: "none", color: "white", fontWeight: 700, fontSize: "0.9rem",
            cursor: "pointer", whiteSpace: "nowrap",
            opacity: createCat.isPending ? 0.6 : submitHover ? 0.85 : 1,
            transition: "opacity 0.15s",
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
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", color: C.muted, padding: "3rem", textAlign: "center", border: `1px dashed ${alpha(C.border, 35)}`, borderRadius: "1rem" }}>
          <FolderTree size={28} style={{ opacity: 0.5 }} />
          <span style={{ fontSize: "0.9rem" }}>No categories yet. Add one above.</span>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {cats.map(cat => (
            <div key={cat.id} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "1rem 1.25rem",
              background: C.panel, border: `1px solid ${alpha(C.border, 35)}`,
              borderRadius: "0.75rem", flexWrap: "wrap", gap: "0.5rem",
            }}>
              <div>
                <div style={{ color: C.text, fontWeight: 700, fontSize: "1rem" }}>{cat.name}</div>
                <div style={{ color: C.muted, fontSize: "0.8rem" }}>/{cat.slug} {cat.description ? `· ${cat.description}` : ""}</div>
              </div>
              <button
                onClick={() => { if (confirm(`Delete "${cat.name}"?`)) deleteCat.mutate({ id: cat.id }); }}
                onMouseEnter={() => setHoveredDelete(cat.id)} onMouseLeave={() => setHoveredDelete(null)}
                disabled={deleteCat.isPending}
                style={{
                  padding: "0.3rem 0.75rem", borderRadius: "0.4rem", fontSize: "0.75rem",
                  border: `1px solid ${hoveredDelete === cat.id ? C.pink : alpha(C.pink, 45)}`,
                  background: hoveredDelete === cat.id ? alpha(C.pink, 15) : "transparent",
                  color: C.pink, cursor: "pointer", fontWeight: 600,
                  transition: "background 0.15s, border-color 0.15s",
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
