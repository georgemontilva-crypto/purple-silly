import { useRef, useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { FolderTree, ImagePlus, Loader2, Trash2 } from "lucide-react";
import { ADMIN_COLORS as C, alpha } from "@/lib/adminTheme";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const fieldStyle: React.CSSProperties = {
  width: "100%", background: C.panel, border: `1px solid ${alpha(C.border, 35)}`,
  borderRadius: "0.5rem", padding: "0.5rem 0.75rem", color: C.text, fontSize: "0.9rem",
  outline: "none", boxSizing: "border-box",
};

export default function AdminProductCategories() {
  const utils = trpc.useUtils();
  const { data: cats, isLoading } = trpc.adminCatalog.categories.list.useQuery();
  const createCat = trpc.adminCatalog.categories.create.useMutation({
    onSuccess: () => { utils.adminCatalog.categories.list.invalidate(); toast.success("Category created"); resetForm(); },
    onError: e => toast.error(e.message),
  });
  const deleteCat = trpc.adminCatalog.categories.delete.useMutation({
    onSuccess: () => { utils.adminCatalog.categories.list.invalidate(); toast.success("Category deleted"); },
    onError: e => toast.error(e.message),
  });

  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({ name: "", description: "", sortOrder: 0 });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [submitHover, setSubmitHover] = useState(false);
  const [hoveredDelete, setHoveredDelete] = useState<number | null>(null);

  const resetForm = () => {
    setForm({ name: "", description: "", sortOrder: 0 });
    setFile(null);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleFile = (f: File) => {
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Name is required");
    let imageFields = {};
    if (file) {
      imageFields = {
        imageBase64: await fileToBase64(file),
        imageFileName: file.name,
        imageContentType: file.type,
      };
    }
    createCat.mutate({ name: form.name, description: form.description || undefined, sortOrder: form.sortOrder, ...imageFields });
  };

  return (
    <div>
      <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "1.6rem", color: C.text, margin: "0 0 1.5rem" }}>
        Product Categories
      </h2>
      <p style={{ color: C.muted, fontSize: "0.85rem", margin: "-1rem 0 1.5rem" }}>
        Separadas de las categorías de Lab Reports. Estas alimentan la tienda (Shop, Choose Your Ride).
      </p>

      {/* Create form */}
      <form onSubmit={handleCreate} style={{
        background: C.panel, border: `1px solid ${alpha(C.border, 35)}`,
        borderRadius: "1rem", padding: "1.5rem", marginBottom: "2rem",
        display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "flex-start",
      }}>
        <div
          onClick={() => fileRef.current?.click()}
          style={{
            width: 96, height: 96, flexShrink: 0, borderRadius: "0.75rem",
            border: `1.5px dashed ${alpha(C.border, 45)}`, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            overflow: "hidden", background: C.panelAlt,
          }}
        >
          {preview ? (
            <img src={preview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <ImagePlus size={22} style={{ color: C.muted }} />
          )}
          <input ref={fileRef} type="file" accept={ALLOWED_MIME_TYPES.join(",")} style={{ display: "none" }}
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
        </div>
        <div style={{ flex: "1 1 200px" }}>
          <label style={{ color: C.muted, fontSize: "0.75rem", fontWeight: 700, display: "block", marginBottom: "0.4rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Name</label>
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Silly Dots" style={fieldStyle} />
        </div>
        <div style={{ flex: "2 1 240px" }}>
          <label style={{ color: C.muted, fontSize: "0.75rem", fontWeight: 700, display: "block", marginBottom: "0.4rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Description</label>
          <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional" style={fieldStyle} />
        </div>
        <div style={{ width: 110 }}>
          <label style={{ color: C.muted, fontSize: "0.75rem", fontWeight: 700, display: "block", marginBottom: "0.4rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Order</label>
          <input type="number" value={form.sortOrder} onChange={e => setForm(f => ({ ...f, sortOrder: Number(e.target.value) }))} style={fieldStyle} />
        </div>
        <button type="submit" disabled={createCat.isPending}
          onMouseEnter={() => setSubmitHover(true)} onMouseLeave={() => setSubmitHover(false)}
          style={{
            padding: "0.55rem 1.5rem", borderRadius: "0.5rem", alignSelf: "flex-end",
            background: `linear-gradient(135deg, ${C.bright}, ${C.pink})`,
            border: "none", color: "white", fontWeight: 700, fontSize: "0.9rem",
            cursor: "pointer", whiteSpace: "nowrap",
            opacity: createCat.isPending ? 0.6 : submitHover ? 0.85 : 1,
            transition: "opacity 0.15s",
          }}>
          + Add Category
        </button>
      </form>

      {isLoading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", color: C.muted, padding: "3rem", fontSize: "0.9rem" }}>
          <Loader2 size={18} className="animate-spin" /> Cargando categorías...
        </div>
      ) : !cats || cats.length === 0 ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", color: C.muted, padding: "3rem", textAlign: "center", border: `1px dashed ${alpha(C.border, 35)}`, borderRadius: "1rem" }}>
          <FolderTree size={28} style={{ opacity: 0.5 }} />
          <span style={{ fontSize: "0.9rem" }}>No product categories yet. Add one above.</span>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {cats.map(cat => (
            <div key={cat.id} style={{
              display: "flex", alignItems: "center", gap: "1rem",
              padding: "0.75rem 1.25rem",
              background: C.panel, border: `1px solid ${alpha(C.border, 35)}`,
              borderRadius: "0.75rem", flexWrap: "wrap",
            }}>
              <div style={{ width: 44, height: 44, borderRadius: "0.5rem", overflow: "hidden", background: C.panelAlt, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {cat.imageUrl ? <img src={cat.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <FolderTree size={18} style={{ color: C.muted }} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: C.text, fontWeight: 700, fontSize: "1rem" }}>{cat.name}</div>
                <div style={{ color: C.muted, fontSize: "0.8rem" }}>/{cat.slug} {cat.description ? `· ${cat.description}` : ""} · orden {cat.sortOrder}</div>
              </div>
              <button
                onClick={() => { if (confirm(`Delete "${cat.name}"?`)) deleteCat.mutate({ id: cat.id }); }}
                onMouseEnter={() => setHoveredDelete(cat.id)} onMouseLeave={() => setHoveredDelete(null)}
                disabled={deleteCat.isPending}
                style={{
                  display: "flex", alignItems: "center", gap: "0.3rem",
                  padding: "0.3rem 0.75rem", borderRadius: "0.4rem", fontSize: "0.75rem",
                  border: `1px solid ${hoveredDelete === cat.id ? C.pink : alpha(C.pink, 45)}`,
                  background: hoveredDelete === cat.id ? alpha(C.pink, 15) : "transparent",
                  color: C.pink, cursor: "pointer", fontWeight: 600,
                  transition: "background 0.15s, border-color 0.15s",
                }}
              >
                <Trash2 size={13} /> Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
