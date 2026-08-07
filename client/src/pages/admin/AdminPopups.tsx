import { useEffect, useRef, useState } from "react";
import { trpc } from "@/lib/trpc";
import { ADMIN_COLORS as C, alpha } from "@/lib/adminTheme";
import PromoPopupCard, {
  type PromoPopupMode,
} from "@/components/PromoPopupCard";
import PromoRibbon from "@/components/PromoRibbon";
import "@/components/PromoPopup.css";
import type { PromoPopup } from "../../../../drizzle/schema";
import {
  Check,
  ImageOff,
  ImagePlus,
  Loader2,
  Plus,
  Power,
  Trash2,
  UploadCloud,
} from "lucide-react";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
const MAX_FILE_BYTES = 5 * 1024 * 1024;

/** Mirrors the bounds in server/routers/promoPopups.ts. */
const LIMITS = {
  title: 256,
  subtitle: 512,
  bodyText: 2000,
  discountCode: 64,
  buttonText: 128,
  ribbonText: 48,
  delayMin: 0,
  delayMax: 120,
} as const;

interface Draft {
  title: string;
  subtitle: string;
  bodyText: string;
  discountCode: string;
  buttonText: string;
  ribbonText: string;
  showDelaySeconds: number;
  active: boolean;
}

const EMPTY_DRAFT: Draft = {
  title: "",
  subtitle: "",
  bodyText: "",
  discountCode: "",
  buttonText: "Quiero mi código",
  ribbonText: "",
  showDelaySeconds: 3,
  active: false,
};

function toDraft(p: PromoPopup): Draft {
  return {
    title: p.title,
    subtitle: p.subtitle ?? "",
    bodyText: p.bodyText ?? "",
    discountCode: p.discountCode,
    buttonText: p.buttonText,
    ribbonText: p.ribbonText ?? "",
    showDelaySeconds: p.showDelaySeconds,
    active: p.active,
  };
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const labelStyle: React.CSSProperties = {
  display: "block",
  color: C.muted,
  fontSize: "0.75rem",
  fontWeight: 700,
  marginBottom: "0.3rem",
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
};

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: "0.85rem" }}>
      <label style={labelStyle}>
        {label}
        {hint && (
          <span style={{ color: alpha(C.muted, 70), fontWeight: 500 }}>
            {" "}
            · {hint}
          </span>
        )}
      </label>
      {children}
    </div>
  );
}

export default function AdminPopups() {
  const utils = trpc.useUtils();
  const { data: popups, isLoading } = trpc.promoPopups.list.useQuery();

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [isNew, setIsNew] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<PromoPopupMode>("form");
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = popups?.find(p => p.id === selectedId) ?? null;

  // Pull server values into the draft whenever a different popup is
  // opened — but NOT on every refetch, which would stomp on edits in
  // progress the moment any mutation invalidated the list.
  useEffect(() => {
    if (selected && !isNew) setDraft(toDraft(selected));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  const invalidate = () => utils.promoPopups.list.invalidate();

  const create = trpc.promoPopups.create.useMutation({
    onSuccess: async ({ id }) => {
      await invalidate();
      setIsNew(false);
      setSelectedId(id);
    },
    onError: e => setError(e.message),
  });
  const update = trpc.promoPopups.update.useMutation({
    onSuccess: () => invalidate(),
    onError: e => setError(e.message),
  });
  const setActive = trpc.promoPopups.setActive.useMutation({
    onSuccess: () => invalidate(),
    onError: e => setError(e.message),
  });
  const remove = trpc.promoPopups.delete.useMutation({
    onSuccess: async () => {
      await invalidate();
      setSelectedId(null);
      setIsNew(false);
    },
    onError: e => setError(e.message),
  });
  const uploadImage = trpc.promoPopups.uploadImage.useMutation({
    onSuccess: () => invalidate(),
    onError: e => setError(e.message),
  });
  const removeImage = trpc.promoPopups.removeImage.useMutation({
    onSuccess: () => invalidate(),
    onError: e => setError(e.message),
  });

  const saving = create.isPending || update.isPending;

  function startNew() {
    setIsNew(true);
    setSelectedId(null);
    setDraft(EMPTY_DRAFT);
    setError(null);
  }

  function openPopup(p: PromoPopup) {
    setIsNew(false);
    setSelectedId(p.id);
    setDraft(toDraft(p));
    setError(null);
  }

  function save() {
    setError(null);
    if (
      !draft.title.trim() ||
      !draft.discountCode.trim() ||
      !draft.buttonText.trim()
    ) {
      setError(
        "Título, código de descuento y texto del botón son obligatorios."
      );
      return;
    }
    const payload = {
      ...draft,
      title: draft.title.trim(),
      subtitle: draft.subtitle.trim() || undefined,
      bodyText: draft.bodyText.trim() || undefined,
      discountCode: draft.discountCode.trim(),
      buttonText: draft.buttonText.trim(),
      ribbonText: draft.ribbonText.trim() || undefined,
    };
    if (isNew) create.mutate(payload);
    else if (selectedId !== null) update.mutate({ id: selectedId, ...payload });
  }

  async function handleFile(file: File) {
    setError(null);
    if (!(ALLOWED_MIME_TYPES as readonly string[]).includes(file.type)) {
      setError("Solo se permiten imágenes JPG, PNG o WebP.");
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setError("La imagen supera los 5 MB.");
      return;
    }
    if (selectedId === null) return;
    uploadImage.mutate({
      id: selectedId,
      fileBase64: await fileToBase64(file),
      fileName: file.name,
      contentType: file.type as (typeof ALLOWED_MIME_TYPES)[number],
    });
  }

  const editing = isNew || selected !== null;

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
            Popups de descuento
          </h2>
          <p style={{ color: C.muted, fontSize: "0.9rem", margin: 0 }}>
            Solo un popup puede estar activo a la vez. Al activar uno, los demás
            se desactivan automáticamente.
          </p>
        </div>
        <button
          onClick={startNew}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            padding: "0.55rem 1rem",
            background: `linear-gradient(135deg, ${C.bright}, ${C.pink})`,
            border: "none",
            borderRadius: "0.5rem",
            color: "white",
            fontWeight: 700,
            fontSize: "0.85rem",
            cursor: "pointer",
          }}
        >
          <Plus size={15} /> Nuevo popup
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(240px, 320px) minmax(0, 1fr)",
          gap: "1rem",
          alignItems: "start",
        }}
      >
        {/* ── List ── */}
        <div
          style={{
            background: C.panel,
            border: `1px solid ${alpha(C.border, 35)}`,
            borderRadius: "1rem",
            padding: "0.85rem",
          }}
        >
          {isLoading ? (
            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                color: C.muted,
                fontSize: "0.85rem",
                padding: "0.5rem",
              }}
            >
              <Loader2 size={16} className="animate-spin" /> Cargando...
            </div>
          ) : (popups?.length ?? 0) === 0 ? (
            <div
              style={{
                color: C.muted,
                fontSize: "0.85rem",
                padding: "0.75rem",
              }}
            >
              Aún no hay popups. Crea el primero.
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              {popups!.map(p => (
                <div
                  key={p.id}
                  onClick={() => openPopup(p)}
                  style={{
                    padding: "0.7rem",
                    borderRadius: "0.6rem",
                    cursor: "pointer",
                    background:
                      selectedId === p.id ? alpha(C.vivid, 18) : C.panelAlt,
                    border: `1px solid ${selectedId === p.id ? C.vivid : alpha(C.border, 30)}`,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem",
                      marginBottom: "0.3rem",
                    }}
                  >
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        flexShrink: 0,
                        background: p.active ? C.green : alpha(C.muted, 45),
                      }}
                    />
                    <span
                      style={{
                        color: C.text,
                        fontWeight: 700,
                        fontSize: "0.85rem",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {p.title || "(sin título)"}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "0.5rem",
                    }}
                  >
                    <span
                      style={{
                        color: p.active ? C.green : C.muted,
                        fontSize: "0.72rem",
                        fontWeight: 700,
                      }}
                    >
                      {p.active ? "ACTIVO" : "inactivo"} · {p.showDelaySeconds}s
                    </span>
                    {!p.active && (
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setActive.mutate({ id: p.id, active: true });
                        }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.25rem",
                          padding: "0.2rem 0.5rem",
                          background: alpha(C.green, 15),
                          border: `1px solid ${alpha(C.green, 45)}`,
                          borderRadius: "0.35rem",
                          color: C.green,
                          fontSize: "0.68rem",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        <Power size={11} /> Activar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Editor + preview ── */}
        {!editing ? (
          <div
            style={{
              background: C.panel,
              border: `1px solid ${alpha(C.border, 35)}`,
              borderRadius: "1rem",
              padding: "2.5rem 1.25rem",
              textAlign: "center",
              color: C.muted,
              fontSize: "0.9rem",
            }}
          >
            Selecciona un popup de la lista o crea uno nuevo.
          </div>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <div
              style={{
                background: C.panel,
                border: `1px solid ${alpha(C.border, 35)}`,
                borderRadius: "1rem",
                padding: "1.25rem",
              }}
            >
              <div
                style={{ color: C.text, fontWeight: 700, marginBottom: "1rem" }}
              >
                {isNew ? "Nuevo popup" : `Editar popup #${selectedId}`}
              </div>

              <Field label="Título" hint={`máx. ${LIMITS.title}`}>
                <input
                  value={draft.title}
                  maxLength={LIMITS.title}
                  onChange={e =>
                    setDraft(d => ({ ...d, title: e.target.value }))
                  }
                  placeholder="20% OFF tu primera orden"
                  style={fieldStyle}
                />
              </Field>

              <Field label="Subtítulo" hint="opcional">
                <input
                  value={draft.subtitle}
                  maxLength={LIMITS.subtitle}
                  onChange={e =>
                    setDraft(d => ({ ...d, subtitle: e.target.value }))
                  }
                  placeholder="Bienvenido a Purple Organics"
                  style={fieldStyle}
                />
              </Field>

              <Field label="Texto" hint="opcional">
                <textarea
                  value={draft.bodyText}
                  maxLength={LIMITS.bodyText}
                  onChange={e =>
                    setDraft(d => ({ ...d, bodyText: e.target.value }))
                  }
                  rows={3}
                  placeholder="Déjanos tu correo y te damos un descuento..."
                  style={{
                    ...fieldStyle,
                    resize: "vertical",
                    fontFamily: "inherit",
                  }}
                />
              </Field>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "0.75rem",
                }}
              >
                <Field label="Código de descuento">
                  <input
                    value={draft.discountCode}
                    maxLength={LIMITS.discountCode}
                    onChange={e =>
                      setDraft(d => ({ ...d, discountCode: e.target.value }))
                    }
                    placeholder="PURPLE20"
                    style={{
                      ...fieldStyle,
                      fontFamily: "ui-monospace, monospace",
                      letterSpacing: "0.05em",
                    }}
                  />
                </Field>
                <Field label="Texto del botón">
                  <input
                    value={draft.buttonText}
                    maxLength={LIMITS.buttonText}
                    onChange={e =>
                      setDraft(d => ({ ...d, buttonText: e.target.value }))
                    }
                    style={fieldStyle}
                  />
                </Field>
              </div>

              <Field
                label="Cinta de esquina"
                hint={`botón fijo que reabre el popup · vacío = sin cinta · máx. ${LIMITS.ribbonText}`}
              >
                <input
                  value={draft.ribbonText}
                  maxLength={LIMITS.ribbonText}
                  onChange={e =>
                    setDraft(d => ({ ...d, ribbonText: e.target.value }))
                  }
                  placeholder="GET 20% OFF"
                  style={{ ...fieldStyle, textTransform: "uppercase" }}
                />
              </Field>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "0.75rem",
                  alignItems: "start",
                }}
              >
                <Field
                  label="Retraso"
                  hint={`${LIMITS.delayMin}–${LIMITS.delayMax} s`}
                >
                  <input
                    type="number"
                    min={LIMITS.delayMin}
                    max={LIMITS.delayMax}
                    value={draft.showDelaySeconds}
                    onChange={e =>
                      setDraft(d => ({
                        ...d,
                        showDelaySeconds: Math.max(
                          LIMITS.delayMin,
                          Math.min(
                            LIMITS.delayMax,
                            Math.round(Number(e.target.value) || 0)
                          )
                        ),
                      }))
                    }
                    style={fieldStyle}
                  />
                </Field>
                <Field label="Estado">
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.55rem 0.7rem",
                      background: C.panelAlt,
                      border: `1px solid ${alpha(draft.active ? C.green : C.border, 35)}`,
                      borderRadius: "0.45rem",
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
                    <span
                      style={{
                        color: draft.active ? C.green : C.muted,
                        fontSize: "0.82rem",
                        fontWeight: 700,
                      }}
                    >
                      {draft.active ? "Activo en el sitio" : "Inactivo"}
                    </span>
                  </label>
                </Field>
              </div>

              {/* Image — needs a saved popup, so the R2 object always has a
                  row that owns it (see uploadImage in the router). */}
              <Field label="Imagen lateral" hint="JPG, PNG o WebP · máx. 5 MB">
                {isNew ? (
                  <div
                    style={{
                      border: `1px dashed ${alpha(C.border, 35)}`,
                      borderRadius: "0.5rem",
                      padding: "0.7rem",
                      color: C.muted,
                      fontSize: "0.78rem",
                    }}
                  >
                    Guarda el popup primero para poder subir la imagen.
                  </div>
                ) : selected?.imageUrl ? (
                  <div
                    style={{
                      display: "flex",
                      gap: "0.6rem",
                      alignItems: "center",
                    }}
                  >
                    <img
                      src={selected.imageUrl}
                      alt=""
                      style={{
                        width: 64,
                        height: 80,
                        objectFit: "cover",
                        borderRadius: "0.4rem",
                        border: `1px solid ${alpha(C.border, 35)}`,
                      }}
                    />
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.35rem",
                      }}
                    >
                      <button
                        onClick={() => inputRef.current?.click()}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.3rem",
                          padding: "0.35rem 0.6rem",
                          background: alpha(C.vivid, 15),
                          border: `1px solid ${alpha(C.vivid, 40)}`,
                          borderRadius: "0.4rem",
                          color: C.bright,
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        <UploadCloud size={12} /> Reemplazar
                      </button>
                      <button
                        onClick={() =>
                          selectedId !== null &&
                          removeImage.mutate({ id: selectedId })
                        }
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.3rem",
                          padding: "0.35rem 0.6rem",
                          background: alpha(C.pink, 12),
                          border: `1px solid ${alpha(C.pink, 40)}`,
                          borderRadius: "0.4rem",
                          color: C.pink,
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        <ImageOff size={12} /> Quitar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => inputRef.current?.click()}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => {
                      e.preventDefault();
                      const f = e.dataTransfer.files[0];
                      if (f) handleFile(f);
                    }}
                    style={{
                      border: `2px dashed ${alpha(C.border, 35)}`,
                      borderRadius: "0.5rem",
                      padding: "0.9rem",
                      textAlign: "center",
                      cursor: "pointer",
                      color: C.muted,
                      fontSize: "0.8rem",
                    }}
                  >
                    {uploadImage.isPending ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />{" "}
                        Subiendo...
                      </>
                    ) : (
                      <>
                        <ImagePlus
                          size={18}
                          style={{ marginBottom: "0.25rem" }}
                        />
                        <div>
                          Arrastra una imagen o{" "}
                          <span style={{ color: C.bright, fontWeight: 700 }}>
                            haz clic
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                )}
                <input
                  ref={inputRef}
                  type="file"
                  accept={ALLOWED_MIME_TYPES.join(",")}
                  style={{ display: "none" }}
                  onChange={e => {
                    const f = e.target.files?.[0];
                    if (f) handleFile(f);
                    e.target.value = "";
                  }}
                />
              </Field>

              {error && (
                <div
                  style={{
                    color: C.pink,
                    fontSize: "0.8rem",
                    marginBottom: "0.75rem",
                  }}
                >
                  {error}
                </div>
              )}

              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                <button
                  onClick={save}
                  disabled={saving}
                  style={{
                    flex: 1,
                    minWidth: 140,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.4rem",
                    padding: "0.6rem",
                    background: `linear-gradient(135deg, ${C.bright}, ${C.pink})`,
                    border: "none",
                    borderRadius: "0.5rem",
                    color: "white",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    cursor: saving ? "default" : "pointer",
                    opacity: saving ? 0.7 : 1,
                  }}
                >
                  {saving ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Check size={14} />
                  )}
                  {isNew ? "Crear popup" : "Guardar cambios"}
                </button>
                {!isNew && selectedId !== null && (
                  <button
                    onClick={() => {
                      if (
                        confirm(
                          "¿Eliminar este popup? También se borrará su imagen."
                        )
                      ) {
                        remove.mutate({ id: selectedId });
                      }
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.35rem",
                      padding: "0.6rem 0.9rem",
                      background: alpha(C.pink, 12),
                      border: `1px solid ${alpha(C.pink, 40)}`,
                      borderRadius: "0.5rem",
                      color: C.pink,
                      fontWeight: 700,
                      fontSize: "0.85rem",
                      cursor: "pointer",
                    }}
                  >
                    <Trash2 size={14} /> Eliminar
                  </button>
                )}
              </div>
            </div>

            {/* ── Preview ── */}
            <div
              style={{
                background: C.panel,
                border: `1px solid ${alpha(C.border, 35)}`,
                borderRadius: "1rem",
                padding: "1.25rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "1rem",
                  flexWrap: "wrap",
                  marginBottom: "0.9rem",
                }}
              >
                <div>
                  <div style={{ color: C.text, fontWeight: 700 }}>
                    Vista previa
                  </div>
                  <div style={{ color: C.muted, fontSize: "0.75rem" }}>
                    Refleja los cambios sin guardar. Es el mismo componente que
                    el sitio.
                  </div>
                </div>
                <div style={{ display: "flex", gap: "0.35rem" }}>
                  {(["form", "code"] as const).map(mode => (
                    <button
                      key={mode}
                      onClick={() => setPreviewMode(mode)}
                      style={{
                        padding: "0.35rem 0.7rem",
                        background:
                          previewMode === mode
                            ? alpha(C.vivid, 22)
                            : "transparent",
                        border: `1px solid ${previewMode === mode ? C.vivid : alpha(C.border, 35)}`,
                        borderRadius: "0.4rem",
                        color: previewMode === mode ? C.bright : C.muted,
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      {mode === "form"
                        ? "Visitante sin sesión"
                        : "Usuario con sesión"}
                    </button>
                  ))}
                </div>
              </div>

              {/* The card is built for a full-width overlay; scaling it down
                  keeps it readable inside the admin panel without touching
                  the shared stylesheet.

                  `position: relative` is load-bearing: it's what the ribbon
                  anchors to in preview mode, standing in for the window
                  corner it pins to on the storefront. */}
              <div
                style={{
                  position: "relative",
                  background: "rgba(8,3,20,0.72)",
                  borderRadius: "0.6rem",
                  padding: "1rem",
                  display: "flex",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    transform: "scale(0.78)",
                    transformOrigin: "top center",
                    width: "100%",
                  }}
                >
                  <div
                    className={
                      "promo-dialog" +
                      (selected?.imageUrl ? "" : " promo-dialog--no-image")
                    }
                    style={{ margin: "0 auto" }}
                  >
                    <PromoPopupCard
                      title={draft.title || "Título del popup"}
                      subtitle={draft.subtitle}
                      bodyText={draft.bodyText}
                      discountCode={draft.discountCode || "TU-CODIGO"}
                      buttonText={draft.buttonText || "Botón"}
                      imageUrl={selected?.imageUrl}
                      mode={previewMode}
                      preview
                    />
                  </div>
                </div>

                {/* Outside the scaled wrapper and outside the dialog: on the
                    storefront the ribbon is pinned to the window, not to the
                    popup, so the preview shows it in the frame's corner. */}
                <PromoRibbon text={draft.ribbonText} preview />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
