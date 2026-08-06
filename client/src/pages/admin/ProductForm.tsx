import { useEffect, useRef, useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  ArrowLeft,
  GripVertical,
  ImagePlus,
  Loader2,
  Package,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
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

function centsToDecimal(cents: number | null | undefined): string {
  if (cents === null || cents === undefined) return "";
  return (cents / 100).toFixed(2);
}

function decimalToCents(value: string): number {
  const n = parseFloat(value.replace(",", "."));
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
}

const fieldStyle: React.CSSProperties = {
  width: "100%", background: C.panel, border: `1px solid ${alpha(C.border, 35)}`,
  borderRadius: "0.5rem", padding: "0.5rem 0.75rem", color: C.text, fontSize: "0.9rem",
  outline: "none", boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  color: C.muted, fontSize: "0.72rem", fontWeight: 700, display: "block",
  marginBottom: "0.35rem", textTransform: "uppercase", letterSpacing: "0.05em",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: C.panel, border: `1px solid ${alpha(C.border, 35)}`, borderRadius: "1rem", padding: "1.25rem" }}>
      <h3 style={{ color: C.text, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "1.05rem", margin: "0 0 1rem" }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

function PrimaryButton({ children, onClick, disabled, type = "button" }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean; type?: "button" | "submit" }) {
  const [hover, setHover] = useState(false);
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem",
        padding: "0.5rem 1rem", borderRadius: "0.5rem",
        background: `linear-gradient(135deg, ${C.bright}, ${C.pink})`,
        border: "none", color: "white", fontWeight: 700, fontSize: "0.82rem",
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.6 : hover ? 0.85 : 1, transition: "opacity 0.15s",
      }}>
      {children}
    </button>
  );
}

function GhostButton({ children, onClick, tone = "muted" }: { children: React.ReactNode; onClick?: () => void; tone?: "muted" | "pink" }) {
  const [hover, setHover] = useState(false);
  const color = tone === "pink" ? C.pink : C.muted;
  return (
    <button type="button" onClick={onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        display: "flex", alignItems: "center", gap: "0.3rem",
        padding: "0.3rem 0.65rem", borderRadius: "0.4rem", fontSize: "0.75rem", fontWeight: 600,
        border: `1px solid ${hover ? color : alpha(color, 40)}`,
        background: hover ? alpha(color, 15) : "transparent",
        color, cursor: "pointer", transition: "background 0.15s, border-color 0.15s",
      }}>
      {children}
    </button>
  );
}

// ─── Tags (chip input) ──────────────────────────────────────────────
function TagInput({ tags, onChange }: { tags: string[]; onChange: (tags: string[]) => void }) {
  const [value, setValue] = useState("");
  const add = () => {
    const t = value.trim();
    if (t && !tags.includes(t)) onChange([...tags, t]);
    setValue("");
  };
  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: tags.length ? "0.5rem" : 0 }}>
        {tags.map(tag => (
          <span key={tag} style={{
            display: "inline-flex", alignItems: "center", gap: "0.3rem",
            padding: "0.2rem 0.6rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 600,
            background: alpha(C.vivid, 18), border: `1px solid ${alpha(C.vivid, 40)}`, color: C.bright,
          }}>
            {tag}
            <button type="button" onClick={() => onChange(tags.filter(t => t !== tag))}
              style={{ display: "flex", background: "none", border: "none", color: C.bright, cursor: "pointer", padding: 0 }}>
              <X size={11} />
            </button>
          </span>
        ))}
      </div>
      <input
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(); } }}
        onBlur={add}
        placeholder="Escribe y presiona Enter"
        style={fieldStyle}
      />
    </div>
  );
}

// ─── Images gallery (upload + drag & drop reorder) ──────────────────
function ImagesGallery({ productId }: { productId: number }) {
  const utils = trpc.useUtils();
  const { data: images } = trpc.adminCatalog.products.get.useQuery({ id: productId });
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);

  const upload = trpc.adminCatalog.images.upload.useMutation({
    onSuccess: () => utils.adminCatalog.products.get.invalidate({ id: productId }),
    onError: e => toast.error(e.message),
  });
  const del = trpc.adminCatalog.images.delete.useMutation({
    onSuccess: () => utils.adminCatalog.products.get.invalidate({ id: productId }),
  });
  const reorder = trpc.adminCatalog.images.reorder.useMutation({
    onSuccess: () => utils.adminCatalog.products.get.invalidate({ id: productId }),
  });

  const list = images?.images ?? [];

  async function handleFiles(files: FileList | null) {
    if (!files) return;
    for (const file of Array.from(files)) {
      if (!(ALLOWED_MIME_TYPES as readonly string[]).includes(file.type)) {
        toast.error(`${file.name}: only JPG, PNG or WebP allowed`);
        continue;
      }
      const fileBase64 = await fileToBase64(file);
      upload.mutate({ productId, fileBase64, fileName: file.name, contentType: file.type as (typeof ALLOWED_MIME_TYPES)[number] });
    }
  }

  function handleDrop(targetIndex: number) {
    if (dragIndex === null || dragIndex === targetIndex) return;
    const reordered = [...list];
    const [moved] = reordered.splice(dragIndex, 1);
    reordered.splice(targetIndex, 0, moved);
    reorder.mutate({ productId, orderedIds: reordered.map(img => img.id) });
    setDragIndex(null);
  }

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: "0.75rem", marginBottom: "0.75rem" }}>
        {list.map((img, i) => (
          <div
            key={img.id}
            draggable
            onDragStart={() => setDragIndex(i)}
            onDragOver={e => e.preventDefault()}
            onDrop={() => handleDrop(i)}
            style={{
              position: "relative", aspectRatio: "1/1", borderRadius: "0.6rem", overflow: "hidden",
              border: `1px solid ${alpha(C.border, 35)}`, background: C.panelAlt, cursor: "grab",
            }}
          >
            <img src={img.url} alt={img.alt ?? ""} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", top: 4, left: 4, background: "rgba(0,0,0,0.55)", borderRadius: "0.3rem", padding: "0.15rem" }}>
              <GripVertical size={13} color="white" />
            </div>
            <button
              type="button"
              onClick={() => del.mutate({ id: img.id })}
              style={{
                position: "absolute", top: 4, right: 4, display: "flex", alignItems: "center", justifyContent: "center",
                width: 22, height: 22, borderRadius: "0.3rem", background: "rgba(0,0,0,0.55)", border: "none",
                color: C.pink, cursor: "pointer",
              }}
            >
              <Trash2 size={12} />
            </button>
            {i === 0 && (
              <span style={{ position: "absolute", bottom: 4, left: 4, background: alpha(C.vivid, 85), color: "white", fontSize: "0.6rem", fontWeight: 700, padding: "0.1rem 0.4rem", borderRadius: "999px" }}>
                Principal
              </span>
            )}
          </div>
        ))}
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
          style={{
            aspectRatio: "1/1", borderRadius: "0.6rem", cursor: "pointer",
            border: `2px dashed ${dragging ? C.vivid : alpha(C.border, 40)}`,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.25rem",
            color: C.muted, background: dragging ? alpha(C.vivid, 8) : "transparent",
          }}
        >
          {upload.isPending ? <Loader2 size={20} className="animate-spin" /> : <ImagePlus size={20} />}
          <span style={{ fontSize: "0.65rem", textAlign: "center", padding: "0 0.5rem" }}>Agregar imagen</span>
        </div>
        <input ref={inputRef} type="file" accept={ALLOWED_MIME_TYPES.join(",")} multiple style={{ display: "none" }}
          onChange={e => { handleFiles(e.target.files); e.target.value = ""; }} />
      </div>
      <p style={{ color: C.muted, fontSize: "0.75rem", margin: 0 }}>Arrastra para reordenar. La primera es la imagen principal.</p>
    </div>
  );
}

// ─── Variants editor ──────────────────────────────────────────────
interface VariantFormState {
  id?: number;
  title: string;
  sku: string;
  price: string;
  compareAt: string;
  stock: string;
  file: File | null;
  preview: string | null;
}

const emptyVariant: VariantFormState = { title: "", sku: "", price: "", compareAt: "", stock: "0", file: null, preview: null };

function VariantsEditor({ productId }: { productId: number }) {
  const utils = trpc.useUtils();
  const { data } = trpc.adminCatalog.products.get.useQuery({ id: productId });
  const [editing, setEditing] = useState<VariantFormState | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const invalidate = () => utils.adminCatalog.products.get.invalidate({ id: productId });
  const create = trpc.adminCatalog.variants.create.useMutation({ onSuccess: () => { invalidate(); setEditing(null); }, onError: e => toast.error(e.message) });
  const update = trpc.adminCatalog.variants.update.useMutation({ onSuccess: () => { invalidate(); setEditing(null); }, onError: e => toast.error(e.message) });
  const del = trpc.adminCatalog.variants.delete.useMutation({ onSuccess: invalidate });

  const variants = data?.variants ?? [];

  async function handleSave() {
    if (!editing) return;
    if (!editing.title.trim()) return toast.error("Variant title is required");
    let imageFields = {};
    if (editing.file) {
      imageFields = { imageBase64: await fileToBase64(editing.file), imageFileName: editing.file.name, imageContentType: editing.file.type };
    }
    const payload = {
      title: editing.title,
      sku: editing.sku || undefined,
      priceCents: decimalToCents(editing.price),
      compareAtCents: editing.compareAt ? decimalToCents(editing.compareAt) : null,
      stock: parseInt(editing.stock, 10) || 0,
      ...imageFields,
    };
    if (editing.id) update.mutate({ id: editing.id, ...payload });
    else create.mutate({ productId, position: variants.length, ...payload });
  }

  return (
    <div>
      {variants.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "0.75rem" }}>
          {variants.map(v => (
            <div key={v.id} style={{
              display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.6rem 0.75rem",
              background: C.panelAlt, border: `1px solid ${alpha(C.border, 30)}`, borderRadius: "0.6rem", flexWrap: "wrap",
            }}>
              <div style={{ width: 36, height: 36, borderRadius: "0.4rem", overflow: "hidden", background: C.panel, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {v.imageUrl ? <img src={v.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Package size={14} style={{ color: C.muted }} />}
              </div>
              <div style={{ flex: 1, minWidth: 120 }}>
                <div style={{ color: C.text, fontWeight: 700, fontSize: "0.88rem" }}>{v.title}</div>
                <div style={{ color: C.muted, fontSize: "0.75rem" }}>
                  {v.sku ? `${v.sku} · ` : ""}${(v.priceCents / 100).toFixed(2)}
                  {v.compareAtCents ? <span style={{ textDecoration: "line-through", marginLeft: "0.3rem" }}>${(v.compareAtCents / 100).toFixed(2)}</span> : null}
                  {" · stock "}{v.stock}
                </div>
              </div>
              <GhostButton onClick={() => setEditing({ id: v.id, title: v.title, sku: v.sku ?? "", price: centsToDecimal(v.priceCents), compareAt: centsToDecimal(v.compareAtCents), stock: String(v.stock), file: null, preview: v.imageUrl })}>
                <Pencil size={12} /> Edit
              </GhostButton>
              <GhostButton tone="pink" onClick={() => { if (confirm(`Delete variant "${v.title}"?`)) del.mutate({ id: v.id }); }}>
                <Trash2 size={12} />
              </GhostButton>
            </div>
          ))}
        </div>
      )}

      {editing ? (
        <div style={{ border: `1px solid ${alpha(C.vivid, 40)}`, borderRadius: "0.6rem", padding: "0.9rem", background: alpha(C.vivid, 6) }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "0.6rem", marginBottom: "0.6rem" }}>
            <div>
              <label style={labelStyle}>Title *</label>
              <input value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} placeholder="Blue Razz" style={fieldStyle} />
            </div>
            <div>
              <label style={labelStyle}>SKU</label>
              <input value={editing.sku} onChange={e => setEditing({ ...editing, sku: e.target.value })} style={fieldStyle} />
            </div>
            <div>
              <label style={labelStyle}>Price ($)</label>
              <input type="number" step="0.01" min="0" value={editing.price} onChange={e => setEditing({ ...editing, price: e.target.value })} style={fieldStyle} />
            </div>
            <div>
              <label style={labelStyle}>Compare at ($)</label>
              <input type="number" step="0.01" min="0" value={editing.compareAt} onChange={e => setEditing({ ...editing, compareAt: e.target.value })} style={fieldStyle} />
            </div>
            <div>
              <label style={labelStyle}>Stock</label>
              <input type="number" min="0" value={editing.stock} onChange={e => setEditing({ ...editing, stock: e.target.value })} style={fieldStyle} />
            </div>
            <div>
              <label style={labelStyle}>Thumbnail</label>
              <div onClick={() => fileRef.current?.click()} style={{ ...fieldStyle, cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                {editing.preview ? <img src={editing.preview} alt="" style={{ width: 20, height: 20, objectFit: "cover", borderRadius: "0.25rem" }} /> : <ImagePlus size={14} />}
                <span style={{ fontSize: "0.78rem", color: C.muted }}>{editing.file ? editing.file.name : "Elegir imagen"}</span>
              </div>
              <input ref={fileRef} type="file" accept={ALLOWED_MIME_TYPES.join(",")} style={{ display: "none" }}
                onChange={e => { const f = e.target.files?.[0]; if (f) setEditing({ ...editing, file: f, preview: URL.createObjectURL(f) }); }} />
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <GhostButton onClick={() => setEditing(null)}>Cancel</GhostButton>
            <PrimaryButton onClick={handleSave} disabled={create.isPending || update.isPending}>
              {create.isPending || update.isPending ? <Loader2 size={13} className="animate-spin" /> : null} Save variant
            </PrimaryButton>
          </div>
        </div>
      ) : (
        <GhostButton onClick={() => setEditing(emptyVariant)}>
          <Plus size={13} /> Add variant
        </GhostButton>
      )}
    </div>
  );
}

// ─── Bundles editor ──────────────────────────────────────────────
interface BundleFormState {
  id?: number;
  label: string;
  quantity: string;
  price: string;
  compareAt: string;
  badge: string;
}
const emptyBundle: BundleFormState = { label: "", quantity: "1", price: "", compareAt: "", badge: "" };

function BundlesEditor({ productId }: { productId: number }) {
  const utils = trpc.useUtils();
  const { data } = trpc.adminCatalog.products.get.useQuery({ id: productId });
  const [editing, setEditing] = useState<BundleFormState | null>(null);

  const invalidate = () => utils.adminCatalog.products.get.invalidate({ id: productId });
  const create = trpc.adminCatalog.bundles.create.useMutation({ onSuccess: () => { invalidate(); setEditing(null); }, onError: e => toast.error(e.message) });
  const update = trpc.adminCatalog.bundles.update.useMutation({ onSuccess: () => { invalidate(); setEditing(null); }, onError: e => toast.error(e.message) });
  const del = trpc.adminCatalog.bundles.delete.useMutation({ onSuccess: invalidate });

  const bundles = data?.bundles ?? [];

  function handleSave() {
    if (!editing) return;
    if (!editing.label.trim()) return toast.error("Bundle label is required");
    const payload = {
      label: editing.label,
      quantity: parseInt(editing.quantity, 10) || 1,
      priceCents: decimalToCents(editing.price),
      compareAtCents: editing.compareAt ? decimalToCents(editing.compareAt) : null,
      badge: editing.badge || undefined,
    };
    if (editing.id) update.mutate({ id: editing.id, ...payload });
    else create.mutate({ productId, position: bundles.length, ...payload });
  }

  return (
    <div>
      {bundles.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "0.75rem" }}>
          {bundles.map(b => (
            <div key={b.id} style={{
              display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.6rem 0.75rem",
              background: C.panelAlt, border: `1px solid ${alpha(C.border, 30)}`, borderRadius: "0.6rem", flexWrap: "wrap",
            }}>
              <div style={{ flex: 1, minWidth: 120 }}>
                <div style={{ color: C.text, fontWeight: 700, fontSize: "0.88rem" }}>
                  {b.label} {b.badge && <span style={{ marginLeft: "0.4rem", fontSize: "0.65rem", fontWeight: 700, padding: "0.1rem 0.45rem", borderRadius: "999px", background: alpha(C.pink, 20), color: C.pink }}>{b.badge}</span>}
                </div>
                <div style={{ color: C.muted, fontSize: "0.75rem" }}>
                  qty {b.quantity} · ${(b.priceCents / 100).toFixed(2)}
                  {b.compareAtCents ? <span style={{ textDecoration: "line-through", marginLeft: "0.3rem" }}>${(b.compareAtCents / 100).toFixed(2)}</span> : null}
                </div>
              </div>
              <GhostButton onClick={() => setEditing({ id: b.id, label: b.label, quantity: String(b.quantity), price: centsToDecimal(b.priceCents), compareAt: centsToDecimal(b.compareAtCents), badge: b.badge ?? "" })}>
                <Pencil size={12} /> Edit
              </GhostButton>
              <GhostButton tone="pink" onClick={() => { if (confirm(`Delete bundle "${b.label}"?`)) del.mutate({ id: b.id }); }}>
                <Trash2 size={12} />
              </GhostButton>
            </div>
          ))}
        </div>
      )}

      {editing ? (
        <div style={{ border: `1px solid ${alpha(C.vivid, 40)}`, borderRadius: "0.6rem", padding: "0.9rem", background: alpha(C.vivid, 6) }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: "0.6rem", marginBottom: "0.6rem" }}>
            <div>
              <label style={labelStyle}>Label *</label>
              <input value={editing.label} onChange={e => setEditing({ ...editing, label: e.target.value })} placeholder="3pk" style={fieldStyle} />
            </div>
            <div>
              <label style={labelStyle}>Quantity</label>
              <input type="number" min="1" value={editing.quantity} onChange={e => setEditing({ ...editing, quantity: e.target.value })} style={fieldStyle} />
            </div>
            <div>
              <label style={labelStyle}>Price ($)</label>
              <input type="number" step="0.01" min="0" value={editing.price} onChange={e => setEditing({ ...editing, price: e.target.value })} style={fieldStyle} />
            </div>
            <div>
              <label style={labelStyle}>Compare at ($)</label>
              <input type="number" step="0.01" min="0" value={editing.compareAt} onChange={e => setEditing({ ...editing, compareAt: e.target.value })} style={fieldStyle} />
            </div>
            <div>
              <label style={labelStyle}>Badge</label>
              <input value={editing.badge} onChange={e => setEditing({ ...editing, badge: e.target.value })} placeholder="Best Value" style={fieldStyle} />
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <GhostButton onClick={() => setEditing(null)}>Cancel</GhostButton>
            <PrimaryButton onClick={handleSave} disabled={create.isPending || update.isPending}>
              {create.isPending || update.isPending ? <Loader2 size={13} className="animate-spin" /> : null} Save bundle
            </PrimaryButton>
          </div>
        </div>
      ) : (
        <GhostButton onClick={() => setEditing(emptyBundle)}>
          <Plus size={13} /> Add bundle
        </GhostButton>
      )}
    </div>
  );
}

// ─── Secret Trick editor ────────────────────────────────────────────
// Entirely optional per product — the storefront renders nothing for this
// section unless secretTitle is set (see ProductDetailPage.tsx). Cards are
// always exactly 4 fixed slots here for simplicity; blank slots (empty
// title) are just filtered out on the public side.
const CARD_SLOTS = 4;
type SecretCard = { title: string; description: string };
const emptyCards: SecretCard[] = Array.from({ length: CARD_SLOTS }, () => ({ title: "", description: "" }));

function SecretTrickEditor({ productId }: { productId: number }) {
  const utils = trpc.useUtils();
  const { data } = trpc.adminCatalog.products.get.useQuery({ id: productId });
  const fileRef = useRef<HTMLInputElement>(null);

  const [secretTitle, setSecretTitle] = useState("");
  const [secretSubtitle, setSecretSubtitle] = useState("");
  const [cards, setCards] = useState<SecretCard[]>(emptyCards);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!data) return;
    setSecretTitle(data.secretTitle ?? "");
    setSecretSubtitle(data.secretSubtitle ?? "");
    const existingCards = (data.secretCards as SecretCard[] | null) ?? [];
    setCards(Array.from({ length: CARD_SLOTS }, (_, i) => existingCards[i] ?? { title: "", description: "" }));
    setPreview(data.secretImageUrl ?? null);
  }, [data]);

  const save = trpc.adminCatalog.products.update.useMutation({
    onSuccess: () => { utils.adminCatalog.products.get.invalidate({ id: productId }); toast.success("Secret Trick guardado"); },
    onError: e => toast.error(e.message),
  });

  const updateCard = (i: number, patch: Partial<SecretCard>) => {
    setCards(cs => cs.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));
  };

  async function handleSave() {
    let imageFields = {};
    if (file) {
      imageFields = { secretImageBase64: await fileToBase64(file), secretImageFileName: file.name, secretImageContentType: file.type };
    }
    save.mutate({
      id: productId,
      secretTitle: secretTitle || undefined,
      secretSubtitle: secretSubtitle || undefined,
      secretCards: cards,
      ...imageFields,
    });
  }

  return (
    <div>
      <p style={{ color: C.muted, fontSize: "0.8rem", margin: "0 0 1rem" }}>
        Sección opcional al final de la página del producto. Si "Title" queda vacío, no se muestra en la tienda.
      </p>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1rem" }}>
        <div style={{ flex: "1 1 200px" }}>
          <label style={labelStyle}>Title</label>
          <input value={secretTitle} onChange={e => setSecretTitle(e.target.value)} placeholder="The Secret Trick" style={fieldStyle} />
        </div>
        <div style={{ flex: "2 1 260px" }}>
          <label style={labelStyle}>Subtitle</label>
          <input value={secretSubtitle} onChange={e => setSecretSubtitle(e.target.value)} placeholder="Optional" style={fieldStyle} />
        </div>
        <div>
          <label style={labelStyle}>Image</label>
          <div onClick={() => fileRef.current?.click()} style={{
            width: 72, height: 72, borderRadius: "0.6rem", cursor: "pointer", overflow: "hidden",
            border: `1.5px dashed ${alpha(C.border, 45)}`, background: C.panelAlt,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {preview ? <img src={preview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <ImagePlus size={18} style={{ color: C.muted }} />}
          </div>
          <input ref={fileRef} type="file" accept={ALLOWED_MIME_TYPES.join(",")} style={{ display: "none" }}
            onChange={e => { const f = e.target.files?.[0]; if (f) { setFile(f); setPreview(URL.createObjectURL(f)); } }} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.75rem", marginBottom: "1rem" }}>
        {cards.map((card, i) => (
          <div key={i} style={{ border: `1px solid ${alpha(C.border, 30)}`, borderRadius: "0.6rem", padding: "0.75rem", background: C.panelAlt }}>
            <label style={labelStyle}>Card {i + 1} title</label>
            <input value={card.title} onChange={e => updateCard(i, { title: e.target.value })} style={{ ...fieldStyle, marginBottom: "0.5rem" }} />
            <label style={labelStyle}>Card {i + 1} text</label>
            <textarea value={card.description} onChange={e => updateCard(i, { description: e.target.value })} rows={2} style={{ ...fieldStyle, resize: "vertical", fontFamily: "inherit" }} />
          </div>
        ))}
      </div>

      <PrimaryButton onClick={handleSave} disabled={save.isPending}>
        {save.isPending ? <Loader2 size={13} className="animate-spin" /> : null} Save Secret Trick
      </PrimaryButton>
    </div>
  );
}

// ─── Main form ──────────────────────────────────────────────────────
interface ProductFormState {
  title: string;
  slug: string;
  description: string;
  status: "draft" | "active" | "archived";
  featured: boolean;
  categoryId: number | null;
  tags: string[];
  seoTitle: string;
  seoDescription: string;
  ingredients: string;
  howToTake: string;
  disclaimer: string;
}

const emptyProduct: ProductFormState = {
  title: "", slug: "", description: "", status: "draft", featured: false, categoryId: null,
  tags: [], seoTitle: "", seoDescription: "", ingredients: "", howToTake: "", disclaimer: "",
};

export default function ProductForm({ productId, onDone }: { productId?: number; onDone: () => void }) {
  const utils = trpc.useUtils();
  const [id, setId] = useState<number | undefined>(productId);
  const { data: existing, isLoading } = trpc.adminCatalog.products.get.useQuery({ id: id as number }, { enabled: id !== undefined });
  const { data: categories } = trpc.adminCatalog.categories.list.useQuery();

  const [form, setForm] = useState<ProductFormState>(emptyProduct);
  const [slugTouched, setSlugTouched] = useState(false);

  useEffect(() => {
    if (existing) {
      setForm({
        title: existing.title,
        slug: existing.slug,
        description: existing.description ?? "",
        status: existing.status,
        featured: existing.featured,
        categoryId: existing.categoryId,
        tags: (existing.tags as string[]) ?? [],
        seoTitle: existing.seoTitle ?? "",
        seoDescription: existing.seoDescription ?? "",
        ingredients: existing.ingredients ?? "",
        howToTake: existing.howToTake ?? "",
        disclaimer: existing.disclaimer ?? "",
      });
      setSlugTouched(true);
    }
  }, [existing]);

  const create = trpc.adminCatalog.products.create.useMutation({
    onSuccess: res => {
      toast.success("Product created — now add images and variants");
      setId(res.id);
      utils.adminCatalog.products.list.invalidate();
    },
    onError: e => toast.error(e.message),
  });
  const update = trpc.adminCatalog.products.update.useMutation({
    onSuccess: () => {
      toast.success("Product saved");
      utils.adminCatalog.products.list.invalidate();
      utils.adminCatalog.products.get.invalidate({ id: id as number });
    },
    onError: e => toast.error(e.message),
  });

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return toast.error("Title is required");
    const payload = {
      title: form.title,
      slug: slugTouched ? form.slug || undefined : undefined,
      description: form.description || undefined,
      status: form.status,
      featured: form.featured,
      categoryId: form.categoryId,
      tags: form.tags,
      seoTitle: form.seoTitle || undefined,
      seoDescription: form.seoDescription || undefined,
      ingredients: form.ingredients || undefined,
      howToTake: form.howToTake || undefined,
      disclaimer: form.disclaimer || undefined,
    };
    if (id) update.mutate({ id, ...payload });
    else create.mutate(payload);
  }

  const saving = create.isPending || update.isPending;

  if (id && isLoading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", color: C.muted, padding: "4rem" }}>
        <Loader2 size={18} className="animate-spin" /> Cargando producto...
      </div>
    );
  }

  return (
    <form onSubmit={handleSave}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
        <GhostButton onClick={onDone}><ArrowLeft size={14} /> Back</GhostButton>
        <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "1.5rem", color: C.text, margin: 0 }}>
          {id ? "Edit Product" : "New Product"}
        </h2>
        <div style={{ marginLeft: "auto" }}>
          <PrimaryButton type="submit" disabled={saving}>
            {saving ? <Loader2 size={14} className="animate-spin" /> : null} {id ? "Save changes" : "Create product"}
          </PrimaryButton>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)", gap: "1.25rem" }} className="admin-product-form-grid">
        {/* Main column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", minWidth: 0 }}>
          <Section title="Title & description">
            <div style={{ marginBottom: "0.75rem" }}>
              <label style={labelStyle}>Title *</label>
              <input
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Super Silly Dots — Blue Razz"
                style={fieldStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Description</label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={5}
                style={{ ...fieldStyle, resize: "vertical", fontFamily: "inherit" }}
              />
            </div>
          </Section>

          <Section title="Images">
            {id ? <ImagesGallery productId={id} /> : (
              <p style={{ color: C.muted, fontSize: "0.85rem", margin: 0 }}>
                Guarda el producto primero para poder subir imágenes.
              </p>
            )}
          </Section>

          <Section title="Variants">
            {id ? <VariantsEditor productId={id} /> : (
              <p style={{ color: C.muted, fontSize: "0.85rem", margin: 0 }}>
                Guarda el producto primero para poder agregar variantes.
              </p>
            )}
          </Section>

          <Section title="Bundles">
            {id ? <BundlesEditor productId={id} /> : (
              <p style={{ color: C.muted, fontSize: "0.85rem", margin: 0 }}>
                Guarda el producto primero para poder agregar bundles.
              </p>
            )}
          </Section>

          <Section title="Secret Trick">
            {id ? <SecretTrickEditor productId={id} /> : (
              <p style={{ color: C.muted, fontSize: "0.85rem", margin: 0 }}>
                Guarda el producto primero para poder configurar esta sección.
              </p>
            )}
          </Section>
        </div>

        {/* Side column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", minWidth: 0 }}>
          <Section title="Status">
            <select
              value={form.status}
              onChange={e => setForm(f => ({ ...f, status: e.target.value as ProductFormState["status"] }))}
              style={fieldStyle}
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.9rem", cursor: "pointer" }}>
              <input type="checkbox" checked={form.featured} onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))} />
              <span style={{ color: C.text, fontSize: "0.85rem", fontWeight: 600 }}>Featured (Meet the Lineup)</span>
            </label>
          </Section>

          <Section title="Organization">
            <div style={{ marginBottom: "0.75rem" }}>
              <label style={labelStyle}>Category</label>
              <select
                value={form.categoryId ?? ""}
                onChange={e => setForm(f => ({ ...f, categoryId: e.target.value ? Number(e.target.value) : null }))}
                style={fieldStyle}
              >
                <option value="">No category</option>
                {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Tags</label>
              <TagInput tags={form.tags} onChange={tags => setForm(f => ({ ...f, tags }))} />
            </div>
          </Section>

          <Section title="URL">
            <label style={labelStyle}>Slug</label>
            <input
              value={form.slug}
              onChange={e => { setForm(f => ({ ...f, slug: e.target.value })); setSlugTouched(true); }}
              placeholder={form.title ? undefined : "auto-generado del título"}
              style={fieldStyle}
            />
            <p style={{ color: C.muted, fontSize: "0.75rem", margin: "0.4rem 0 0" }}>/products/{form.slug || "..."}</p>
          </Section>

          <Section title="SEO">
            <div style={{ marginBottom: "0.75rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <label style={labelStyle}>SEO Title</label>
                <span style={{ color: form.seoTitle.length > 60 ? C.pink : C.muted, fontSize: "0.7rem" }}>{form.seoTitle.length}/60</span>
              </div>
              <input value={form.seoTitle} onChange={e => setForm(f => ({ ...f, seoTitle: e.target.value }))} style={fieldStyle} />
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <label style={labelStyle}>SEO Description</label>
                <span style={{ color: form.seoDescription.length > 160 ? C.pink : C.muted, fontSize: "0.7rem" }}>{form.seoDescription.length}/160</span>
              </div>
              <textarea value={form.seoDescription} onChange={e => setForm(f => ({ ...f, seoDescription: e.target.value }))} rows={3} style={{ ...fieldStyle, resize: "vertical", fontFamily: "inherit" }} />
            </div>
          </Section>

          <Section title="Product page content">
            <div style={{ marginBottom: "0.75rem" }}>
              <label style={labelStyle}>Ingredients</label>
              <textarea value={form.ingredients} onChange={e => setForm(f => ({ ...f, ingredients: e.target.value }))} rows={3} style={{ ...fieldStyle, resize: "vertical", fontFamily: "inherit" }} />
            </div>
            <div style={{ marginBottom: "0.75rem" }}>
              <label style={labelStyle}>How to Take</label>
              <textarea value={form.howToTake} onChange={e => setForm(f => ({ ...f, howToTake: e.target.value }))} rows={3} style={{ ...fieldStyle, resize: "vertical", fontFamily: "inherit" }} />
            </div>
            <div>
              <label style={labelStyle}>Disclaimer</label>
              <textarea value={form.disclaimer} onChange={e => setForm(f => ({ ...f, disclaimer: e.target.value }))} rows={3} style={{ ...fieldStyle, resize: "vertical", fontFamily: "inherit" }} />
            </div>
          </Section>
        </div>
      </div>
      <style>{`
        @media (max-width: 900px) {
          .admin-product-form-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </form>
  );
}
