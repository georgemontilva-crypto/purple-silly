import { useRef, useState } from "react";
import { trpc } from "@/lib/trpc";
import { ADMIN_COLORS as C, alpha } from "@/lib/adminTheme";
import {
  ArrowDown,
  ArrowUp,
  BadgeCheck,
  Eye,
  EyeOff,
  ImageOff,
  ImagePlus,
  Loader2,
  MessageSquareQuote,
  Plus,
  Star,
  Trash2,
} from "lucide-react";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

/** Mirrors the bounds in server/routers/reviews.ts. */
const LIMITS = {
  authorName: 128,
  title: 256,
  body: 4000,
  productName: 256,
} as const;

interface Draft {
  authorName: string;
  rating: number;
  title: string;
  body: string;
  productName: string;
  verified: boolean;
  active: boolean;
}

const EMPTY_DRAFT: Draft = {
  authorName: "",
  rating: 5,
  title: "",
  body: "",
  productName: "",
  verified: true,
  active: true,
};

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/** Clickable 1-5 star rating. */
function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div style={{ display: "flex", gap: "0.2rem" }}>
      {[1, 2, 3, 4, 5].map(i => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          aria-label={`${i} star${i > 1 ? "s" : ""}`}
          aria-pressed={value === i}
          style={{
            background: "none",
            border: "none",
            padding: "0.15rem",
            cursor: "pointer",
            lineHeight: 0,
          }}
        >
          <Star
            size={20}
            style={
              i <= value
                ? { fill: "#facc15", color: "#facc15" }
                : { fill: "transparent", color: alpha(C.muted, 60) }
            }
          />
        </button>
      ))}
    </div>
  );
}

export default function AdminReviews() {
  const utils = trpc.useUtils();
  const { data: reviews, isLoading } = trpc.reviews.list.useQuery();

  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [isNew, setIsNew] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingFor, setUploadingFor] = useState<number | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const invalidate = () => utils.reviews.invalidate();
  const onError = (e: { message: string }) => setError(e.message);

  const create = trpc.reviews.create.useMutation({
    onSuccess: async () => {
      await invalidate();
      setIsNew(false);
      setDraft(EMPTY_DRAFT);
    },
    onError,
  });
  const update = trpc.reviews.update.useMutation({
    onSuccess: async () => {
      await invalidate();
      setEditingId(null);
    },
    onError,
  });
  const reorder = trpc.reviews.reorder.useMutation({
    onSuccess: invalidate,
    onError,
  });
  const remove = trpc.reviews.delete.useMutation({
    onSuccess: invalidate,
    onError,
  });
  const uploadImage = trpc.reviews.uploadImage.useMutation({
    onSuccess: invalidate,
    onError,
  });
  const removeImage = trpc.reviews.removeImage.useMutation({
    onSuccess: invalidate,
    onError,
  });

  const saving = create.isPending || update.isPending;
  const editing = isNew || editingId !== null;

  function startNew() {
    setIsNew(true);
    setEditingId(null);
    setDraft(EMPTY_DRAFT);
    setError(null);
  }

  function startEdit(r: NonNullable<typeof reviews>[number]) {
    setIsNew(false);
    setEditingId(r.id);
    setDraft({
      authorName: r.authorName,
      rating: r.rating,
      title: r.title,
      body: r.body,
      productName: r.productName ?? "",
      verified: r.verified,
      active: r.active,
    });
    setError(null);
  }

  function save() {
    setError(null);
    if (!draft.authorName.trim() || !draft.title.trim() || !draft.body.trim()) {
      setError("Nombre, título y texto son obligatorios.");
      return;
    }
    const payload = {
      ...draft,
      authorName: draft.authorName.trim(),
      title: draft.title.trim(),
      body: draft.body.trim(),
      productName: draft.productName.trim() || undefined,
    };
    if (isNew) create.mutate(payload);
    else if (editingId !== null) update.mutate({ id: editingId, ...payload });
  }

  async function handleFile(reviewId: number, file: File) {
    setError(null);
    if (!(ALLOWED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
      setError("Solo se permiten imágenes JPG, PNG o WebP.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError("La imagen supera los 5 MB.");
      return;
    }
    setUploadingFor(reviewId);
    try {
      await uploadImage.mutateAsync({
        id: reviewId,
        fileBase64: await fileToBase64(file),
        fileName: file.name,
        contentType: file.type as (typeof ALLOWED_IMAGE_TYPES)[number],
      });
    } finally {
      setUploadingFor(null);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  function move(index: number, direction: -1 | 1) {
    if (!reviews) return;
    const next = [...reviews];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    reorder.mutate({ ids: next.map(r => r.id) });
  }

  const panelStyle: React.CSSProperties = {
    background: C.panel,
    border: `1px solid ${alpha(C.border, 25)}`,
    borderRadius: "0.75rem",
    padding: "1.25rem",
  };

  const fieldStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.55rem 0.7rem",
    background: C.panelAlt,
    border: `1px solid ${alpha(C.border, 35)}`,
    borderRadius: "0.45rem",
    color: C.text,
    fontSize: "0.85rem",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    color: C.muted,
    fontSize: "0.75rem",
    fontWeight: 700,
    marginBottom: "0.3rem",
  };

  const iconButton = (danger = false): React.CSSProperties => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 34,
    height: 34,
    borderRadius: "0.45rem",
    background: "transparent",
    border: `1px solid ${alpha(danger ? C.pink : C.border, 35)}`,
    color: danger ? C.pink : C.muted,
    cursor: "pointer",
  });

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <div>
          <h2
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 900,
              fontSize: "2rem",
              color: C.text,
              margin: "0 0 0.25rem",
            }}
          >
            Reseñas
          </h2>
          <p style={{ color: C.muted, fontSize: "0.9rem", margin: 0 }}>
            Se muestran en el home en este orden. Las inactivas no salen. El
            rating global del encabezado es texto fijo, no el promedio de estas.
          </p>
        </div>
        <button
          onClick={startNew}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            padding: "0.55rem 1rem",
            borderRadius: "0.5rem",
            border: "none",
            background: C.vivid,
            color: "#fff",
            fontWeight: 700,
            fontSize: "0.85rem",
            cursor: "pointer",
          }}
        >
          <Plus size={16} /> Nueva reseña
        </button>
      </div>

      {error && (
        <div
          style={{
            ...panelStyle,
            marginBottom: "1rem",
            borderColor: alpha(C.pink, 55),
            color: C.pink,
            fontSize: "0.85rem",
            fontWeight: 600,
          }}
        >
          {error}
        </div>
      )}

      {/* ─── Editor ─────────────────────────────────────────────── */}
      {editing && (
        <div style={{ ...panelStyle, marginBottom: "1.5rem" }}>
          <h3
            style={{
              margin: "0 0 1rem",
              color: C.text,
              fontSize: "1rem",
              fontWeight: 700,
            }}
          >
            {isNew ? "Nueva reseña" : "Editar reseña"}
          </h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "0.85rem",
            }}
          >
            <div>
              <label style={labelStyle}>Nombre</label>
              <input
                value={draft.authorName}
                maxLength={LIMITS.authorName}
                onChange={e =>
                  setDraft(d => ({ ...d, authorName: e.target.value }))
                }
                placeholder="Michael W."
                style={fieldStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Producto · opcional</label>
              <input
                value={draft.productName}
                maxLength={LIMITS.productName}
                onChange={e =>
                  setDraft(d => ({ ...d, productName: e.target.value }))
                }
                placeholder="Silly Dots Mega Dose 1200mg"
                style={fieldStyle}
              />
            </div>
          </div>

          <div style={{ marginTop: "0.85rem" }}>
            <label style={labelStyle}>Título</label>
            <input
              value={draft.title}
              maxLength={LIMITS.title}
              onChange={e => setDraft(d => ({ ...d, title: e.target.value }))}
              style={fieldStyle}
            />
          </div>

          <div style={{ marginTop: "0.85rem" }}>
            <label style={labelStyle}>Texto</label>
            <textarea
              value={draft.body}
              maxLength={LIMITS.body}
              rows={4}
              onChange={e => setDraft(d => ({ ...d, body: e.target.value }))}
              style={{ ...fieldStyle, resize: "vertical" }}
            />
          </div>

          <div
            style={{
              display: "flex",
              gap: "1.5rem",
              alignItems: "center",
              flexWrap: "wrap",
              marginTop: "1rem",
            }}
          >
            <div>
              <label style={labelStyle}>Estrellas</label>
              <StarPicker
                value={draft.rating}
                onChange={rating => setDraft(d => ({ ...d, rating }))}
              />
            </div>
            <label
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.45rem",
                color: C.text,
                fontSize: "0.85rem",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={draft.verified}
                onChange={e =>
                  setDraft(d => ({ ...d, verified: e.target.checked }))
                }
              />
              Comprador verificado
            </label>
            <label
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.45rem",
                color: C.text,
                fontSize: "0.85rem",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={draft.active}
                onChange={e =>
                  setDraft(d => ({ ...d, active: e.target.checked }))
                }
              />
              Visible en el home
            </label>
          </div>

          <div style={{ display: "flex", gap: "0.5rem", marginTop: "1.25rem" }}>
            <button
              onClick={save}
              disabled={saving}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                padding: "0.6rem 1.1rem",
                borderRadius: "0.5rem",
                border: "none",
                background: saving ? alpha(C.vivid, 45) : C.vivid,
                color: "#fff",
                fontWeight: 700,
                fontSize: "0.85rem",
                cursor: saving ? "default" : "pointer",
              }}
            >
              {saving && <Loader2 size={15} className="animate-spin" />}
              {saving ? "Guardando…" : "Guardar"}
            </button>
            <button
              onClick={() => {
                setIsNew(false);
                setEditingId(null);
                setError(null);
              }}
              style={{
                padding: "0.6rem 1.1rem",
                borderRadius: "0.5rem",
                background: "transparent",
                border: `1px solid ${alpha(C.border, 35)}`,
                color: C.muted,
                fontWeight: 700,
                fontSize: "0.85rem",
                cursor: "pointer",
              }}
            >
              Cancelar
            </button>
          </div>

          {isNew && (
            <p
              style={{
                color: C.muted,
                fontSize: "0.78rem",
                marginTop: "0.75rem",
              }}
            >
              La imagen se sube después de guardar, desde la tarjeta de la
              reseña — necesita el id para saber a cuál pertenece.
            </p>
          )}
        </div>
      )}

      {/* ─── List ───────────────────────────────────────────────── */}
      {isLoading ? (
        <p style={{ color: C.muted }}>Cargando…</p>
      ) : !reviews || reviews.length === 0 ? (
        <div style={{ ...panelStyle, textAlign: "center", color: C.muted }}>
          <MessageSquareQuote
            size={28}
            style={{ margin: "0 auto 0.5rem", display: "block" }}
          />
          Todavía no hay reseñas.
        </div>
      ) : (
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
        >
          {reviews.map((r, index) => (
            <div
              key={r.id}
              style={{
                ...panelStyle,
                opacity: r.active ? 1 : 0.55,
                display: "flex",
                gap: "1rem",
                alignItems: "flex-start",
                flexWrap: "wrap",
              }}
            >
              {r.imageUrl && (
                <img
                  src={r.imageUrl}
                  alt=""
                  style={{
                    width: 84,
                    height: 84,
                    objectFit: "cover",
                    borderRadius: "0.5rem",
                    flexShrink: 0,
                  }}
                />
              )}

              <div style={{ flex: 1, minWidth: 220 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    flexWrap: "wrap",
                    marginBottom: "0.3rem",
                  }}
                >
                  <span style={{ display: "flex", gap: "0.1rem" }}>
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star
                        key={i}
                        size={13}
                        style={
                          i <= r.rating
                            ? { fill: "#facc15", color: "#facc15" }
                            : { fill: "transparent", color: alpha(C.muted, 50) }
                        }
                      />
                    ))}
                  </span>
                  <strong style={{ color: C.text, fontSize: "0.9rem" }}>
                    {r.title}
                  </strong>
                  {r.verified && (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.2rem",
                        padding: "0.1rem 0.45rem",
                        borderRadius: 999,
                        background: alpha(C.green, 20),
                        border: `1px solid ${alpha(C.green, 45)}`,
                        color: C.green,
                        fontSize: "0.65rem",
                        fontWeight: 800,
                      }}
                    >
                      <BadgeCheck size={11} /> Verificado
                    </span>
                  )}
                </div>
                <p
                  style={{
                    color: C.muted,
                    fontSize: "0.82rem",
                    margin: "0 0 0.35rem",
                  }}
                >
                  {r.body}
                </p>
                <p
                  style={{
                    color: alpha(C.muted, 75),
                    fontSize: "0.75rem",
                    margin: 0,
                  }}
                >
                  {r.authorName}
                  {r.productName ? ` · ${r.productName}` : ""}
                </p>
              </div>

              <div
                style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}
              >
                <button
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  aria-label="Subir"
                  style={{ ...iconButton(), opacity: index === 0 ? 0.4 : 1 }}
                >
                  <ArrowUp size={15} />
                </button>
                <button
                  onClick={() => move(index, 1)}
                  disabled={index === reviews.length - 1}
                  aria-label="Bajar"
                  style={{
                    ...iconButton(),
                    opacity: index === reviews.length - 1 ? 0.4 : 1,
                  }}
                >
                  <ArrowDown size={15} />
                </button>
                <button
                  onClick={() =>
                    update.mutate({
                      id: r.id,
                      authorName: r.authorName,
                      rating: r.rating,
                      title: r.title,
                      body: r.body,
                      productName: r.productName ?? undefined,
                      verified: r.verified,
                      active: !r.active,
                    })
                  }
                  aria-label={r.active ? "Ocultar" : "Mostrar"}
                  style={iconButton()}
                >
                  {r.active ? <Eye size={15} /> : <EyeOff size={15} />}
                </button>

                <label
                  style={{ ...iconButton(), cursor: "pointer" }}
                  aria-label="Subir imagen"
                  title="Subir imagen"
                >
                  {uploadingFor === r.id ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <ImagePlus size={15} />
                  )}
                  <input
                    ref={fileInput}
                    type="file"
                    accept={ALLOWED_IMAGE_TYPES.join(",")}
                    style={{ display: "none" }}
                    onChange={e => {
                      const f = e.target.files?.[0];
                      if (f) handleFile(r.id, f);
                    }}
                  />
                </label>
                {r.imageUrl && (
                  <button
                    onClick={() => removeImage.mutate({ id: r.id })}
                    aria-label="Quitar imagen"
                    title="Quitar imagen"
                    style={iconButton()}
                  >
                    <ImageOff size={15} />
                  </button>
                )}

                <button
                  onClick={() => startEdit(r)}
                  style={{
                    padding: "0 0.7rem",
                    height: 34,
                    borderRadius: "0.45rem",
                    background: "transparent",
                    border: `1px solid ${alpha(C.border, 35)}`,
                    color: C.bright,
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Editar
                </button>
                <button
                  onClick={() => {
                    // Deleting also drops the photo from R2, so it can't be
                    // undone by re-adding the row.
                    if (confirm(`¿Borrar la reseña de ${r.authorName}?`)) {
                      remove.mutate({ id: r.id });
                    }
                  }}
                  aria-label="Borrar"
                  style={iconButton(true)}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
