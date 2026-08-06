import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { FlaskConical, Loader2 } from "lucide-react";

const C = {
  border: "oklch(0.18 0.06 295)",
  vivid:  "oklch(0.52 0.28 295)",
  bright: "oklch(0.62 0.28 295)",
  pink:   "oklch(0.72 0.22 320)",
  text:   "oklch(0.92 0.02 295)",
  muted:  "oklch(0.55 0.07 295)",
};

export default function AdminLabReports() {
  const { data: reports, isLoading, refetch } = trpc.admin.labReports.listAdmin.useQuery();
  const { data: categories } = trpc.admin.categories.list.useQuery();
  const createReport = trpc.admin.labReports.create.useMutation({
    onSuccess: () => { refetch(); toast.success("Lab report uploaded!"); resetForm(); },
    onError: (e) => toast.error(e.message),
  });
  const deleteReport = trpc.admin.labReports.delete.useMutation({
    onSuccess: () => { refetch(); toast.success("Report deleted"); },
    onError: (e) => toast.error(e.message),
  });
  const togglePublish = trpc.admin.labReports.update.useMutation({
    onSuccess: () => { refetch(); toast.success("Updated"); },
    onError: (e) => toast.error(e.message),
  });

  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({ categoryId: 0, title: "", productName: "", batchNumber: "", testDate: "", isPublished: 1 });
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [filterCat, setFilterCat] = useState(0);

  const resetForm = () => {
    setForm({ categoryId: 0, title: "", productName: "", batchNumber: "", testDate: "", isPublished: 1 });
    setFile(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return toast.error("Please select a PDF file");
    if (!form.categoryId) return toast.error("Please select a category");
    if (!form.title) return toast.error("Please enter a title");

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(",")[1];
        createReport.mutate({
          ...form,
          fileBase64: base64,
          fileName: file.name,
          contentType: file.type || "application/pdf",
        });
      };
      reader.readAsDataURL(file);
    } finally {
      setUploading(false);
    }
  };

  const filtered = reports?.filter(r => filterCat === 0 || r.categoryId === filterCat) ?? [];

  const getCatName = (id: number) => categories?.find(c => c.id === id)?.name ?? "Unknown";

  return (
    <div>
      <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "1.6rem", color: C.text, margin: "0 0 1.5rem" }}>
        Lab Reports
      </h2>

      {/* Upload form */}
      <form onSubmit={handleUpload} style={{
        background: `${C.vivid}08`, border: `1px solid ${C.border}`,
        borderRadius: "1rem", padding: "1.5rem", marginBottom: "2rem",
      }}>
        <h3 style={{ color: C.text, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "1.1rem", margin: "0 0 1rem" }}>
          Upload New Report
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.75rem", marginBottom: "0.75rem" }}>
          <div>
            <label style={{ color: C.muted, fontSize: "0.75rem", fontWeight: 700, display: "block", marginBottom: "0.35rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Category *</label>
            <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: Number(e.target.value) }))}
              style={{ width: "100%", background: "oklch(0.11 0.05 295)", border: `1px solid ${C.border}`, borderRadius: "0.5rem", padding: "0.5rem 0.75rem", color: C.text, fontSize: "0.9rem", outline: "none" }}>
              <option value={0}>Select category...</option>
              {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ color: C.muted, fontSize: "0.75rem", fontWeight: 700, display: "block", marginBottom: "0.35rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Title *</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Silly Dots Super Dose — Batch A"
              style={{ width: "100%", background: "oklch(0.11 0.05 295)", border: `1px solid ${C.border}`, borderRadius: "0.5rem", padding: "0.5rem 0.75rem", color: C.text, fontSize: "0.9rem", outline: "none", boxSizing: "border-box" }} />
          </div>
          <div>
            <label style={{ color: C.muted, fontSize: "0.75rem", fontWeight: 700, display: "block", marginBottom: "0.35rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Product Name</label>
            <input value={form.productName} onChange={e => setForm(f => ({ ...f, productName: e.target.value }))}
              placeholder="Silly Dots Super Dose"
              style={{ width: "100%", background: "oklch(0.11 0.05 295)", border: `1px solid ${C.border}`, borderRadius: "0.5rem", padding: "0.5rem 0.75rem", color: C.text, fontSize: "0.9rem", outline: "none", boxSizing: "border-box" }} />
          </div>
          <div>
            <label style={{ color: C.muted, fontSize: "0.75rem", fontWeight: 700, display: "block", marginBottom: "0.35rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Batch #</label>
            <input value={form.batchNumber} onChange={e => setForm(f => ({ ...f, batchNumber: e.target.value }))}
              placeholder="SD-2024-001"
              style={{ width: "100%", background: "oklch(0.11 0.05 295)", border: `1px solid ${C.border}`, borderRadius: "0.5rem", padding: "0.5rem 0.75rem", color: C.text, fontSize: "0.9rem", outline: "none", boxSizing: "border-box" }} />
          </div>
          <div>
            <label style={{ color: C.muted, fontSize: "0.75rem", fontWeight: 700, display: "block", marginBottom: "0.35rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Test Date</label>
            <input type="date" value={form.testDate} onChange={e => setForm(f => ({ ...f, testDate: e.target.value }))}
              style={{ width: "100%", background: "oklch(0.11 0.05 295)", border: `1px solid ${C.border}`, borderRadius: "0.5rem", padding: "0.5rem 0.75rem", color: C.text, fontSize: "0.9rem", outline: "none", colorScheme: "dark" }} />
          </div>
          <div>
            <label style={{ color: C.muted, fontSize: "0.75rem", fontWeight: 700, display: "block", marginBottom: "0.35rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Status</label>
            <select value={form.isPublished} onChange={e => setForm(f => ({ ...f, isPublished: Number(e.target.value) }))}
              style={{ width: "100%", background: "oklch(0.11 0.05 295)", border: `1px solid ${C.border}`, borderRadius: "0.5rem", padding: "0.5rem 0.75rem", color: C.text, fontSize: "0.9rem", outline: "none" }}>
              <option value={1}>Published</option>
              <option value={0}>Draft</option>
            </select>
          </div>
        </div>

        {/* File input */}
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ color: C.muted, fontSize: "0.75rem", fontWeight: 700, display: "block", marginBottom: "0.35rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>PDF File *</label>
          <div
            onClick={() => fileRef.current?.click()}
            style={{
              border: `2px dashed ${file ? C.vivid : C.border}`,
              borderRadius: "0.75rem",
              padding: "1.5rem",
              textAlign: "center",
              cursor: "pointer",
              background: file ? `${C.vivid}10` : "transparent",
              transition: "border-color 0.15s, background 0.15s",
            }}
          >
            <input ref={fileRef} type="file" accept=".pdf,application/pdf" style={{ display: "none" }}
              onChange={e => setFile(e.target.files?.[0] ?? null)} />
            {file ? (
              <div style={{ color: C.vivid, fontWeight: 700 }}>📄 {file.name} ({(file.size / 1024).toFixed(0)} KB)</div>
            ) : (
              <div style={{ color: C.muted }}>Click to select a PDF file</div>
            )}
          </div>
        </div>

        <button type="submit" disabled={uploading || createReport.isPending} style={{
          padding: "0.65rem 2rem", borderRadius: "0.5rem",
          background: `linear-gradient(135deg, ${C.bright}, ${C.pink})`,
          border: "none", color: "white", fontWeight: 700, fontSize: "0.9rem",
          cursor: "pointer",
          opacity: (uploading || createReport.isPending) ? 0.6 : 1,
        }}>
          {uploading || createReport.isPending ? "Uploading..." : "Upload Report"}
        </button>
      </form>

      {/* Filter by category */}
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1.25rem" }}>
        <button onClick={() => setFilterCat(0)} style={{
          padding: "0.35rem 0.9rem", borderRadius: "999px", fontSize: "0.8rem", fontWeight: 700,
          border: `1px solid ${filterCat === 0 ? C.vivid : C.border}`,
          background: filterCat === 0 ? `${C.vivid}25` : "transparent",
          color: filterCat === 0 ? C.vivid : C.muted, cursor: "pointer",
        }}>All</button>
        {categories?.map(c => (
          <button key={c.id} onClick={() => setFilterCat(c.id)} style={{
            padding: "0.35rem 0.9rem", borderRadius: "999px", fontSize: "0.8rem", fontWeight: 700,
            border: `1px solid ${filterCat === c.id ? C.vivid : C.border}`,
            background: filterCat === c.id ? `${C.vivid}25` : "transparent",
            color: filterCat === c.id ? C.vivid : C.muted, cursor: "pointer",
          }}>{c.name}</button>
        ))}
      </div>

      {/* Reports list */}
      {isLoading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", color: C.muted, padding: "3rem", fontSize: "0.9rem" }}>
          <Loader2 size={18} className="animate-spin" /> Cargando reportes...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", color: C.muted, padding: "3rem", textAlign: "center", border: `1px dashed ${C.border}`, borderRadius: "1rem" }}>
          <FlaskConical size={28} style={{ opacity: 0.5 }} />
          <span style={{ fontSize: "0.9rem" }}>No lab reports yet. Upload your first report above.</span>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {filtered.map(r => (
            <div key={r.id} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "1rem 1.25rem",
              background: `${C.vivid}06`, border: `1px solid ${C.border}`,
              borderRadius: "0.75rem", flexWrap: "wrap", gap: "0.75rem",
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: C.text, fontWeight: 700, fontSize: "0.95rem", marginBottom: "0.2rem" }}>{r.title}</div>
                <div style={{ color: C.muted, fontSize: "0.78rem" }}>
                  {getCatName(r.categoryId)} · {r.productName} · Batch: {r.batchNumber ?? "—"} · {r.testDate ?? "—"}
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexShrink: 0 }}>
                <span style={{
                  padding: "0.2rem 0.6rem", borderRadius: "999px", fontSize: "0.7rem", fontWeight: 700,
                  background: r.isPublished ? `${C.vivid}25` : `${C.pink}25`,
                  color: r.isPublished ? C.vivid : C.pink,
                }}>
                  {r.isPublished ? "Published" : "Draft"}
                </span>
                <a href={r.fileUrl} target="_blank" rel="noopener noreferrer" style={{
                  padding: "0.3rem 0.75rem", borderRadius: "0.4rem", fontSize: "0.75rem",
                  border: `1px solid ${C.vivid}40`, background: "transparent",
                  color: C.vivid, cursor: "pointer", fontWeight: 600, textDecoration: "none",
                }}>
                  View PDF
                </a>
                <button onClick={() => togglePublish.mutate({ id: r.id, isPublished: r.isPublished ? 0 : 1 })} style={{
                  padding: "0.3rem 0.75rem", borderRadius: "0.4rem", fontSize: "0.75rem",
                  border: `1px solid ${C.border}`, background: "transparent",
                  color: C.muted, cursor: "pointer", fontWeight: 600,
                }}>
                  {r.isPublished ? "Unpublish" : "Publish"}
                </button>
                <button onClick={() => { if (confirm("Delete this report?")) deleteReport.mutate({ id: r.id }); }} style={{
                  padding: "0.3rem 0.75rem", borderRadius: "0.4rem", fontSize: "0.75rem",
                  border: `1px solid ${C.pink}40`, background: "transparent",
                  color: C.pink, cursor: "pointer", fontWeight: 600,
                }}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

