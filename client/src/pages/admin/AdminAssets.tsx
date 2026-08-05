import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";

const C = {
  bg:     "oklch(0.07 0.04 295)",
  dark:   "oklch(0.10 0.05 295)",
  mid:    "oklch(0.18 0.06 295)",
  border: "oklch(0.18 0.06 295)",
  vivid:  "oklch(0.52 0.28 295)",
  bright: "oklch(0.62 0.28 295)",
  pink:   "oklch(0.72 0.22 320)",
  green:  "oklch(0.60 0.25 160)",
  text:   "oklch(0.92 0.02 295)",
  muted:  "oklch(0.55 0.07 295)",
};

// Sections of the site that need images
const SITE_SECTIONS = [
  { id: "hero",                   label: "Hero Banner",                  desc: "Imagen de fondo principal (1920×1080px recomendado)" },
  { id: "choose-your-ride-dots",  label: "Choose Your Ride — Silly Dots", desc: "3 imágenes de producto (800×600px)" },
  { id: "choose-your-ride-euphoria", label: "Choose Your Ride — Silly Euphoria", desc: "3 imágenes de producto (800×600px)" },
  { id: "choose-your-ride-bites", label: "Choose Your Ride — Silly Bites", desc: "3 imágenes de producto (800×600px)" },
  { id: "what-is-silly",          label: "What is Silly? — Secciones",   desc: "4 imágenes para la página informativa (1200×800px)" },
  { id: "about-us",               label: "About Us",                     desc: "Imágenes para la página About (equipo, lifestyle)" },
  { id: "navbar-logo",            label: "Navbar / Logo",                desc: "Logo alternativo o variaciones" },
  { id: "general",                label: "General / Otros",              desc: "Recursos gráficos sin categoría específica" },
];

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface UploadModalProps {
  section: typeof SITE_SECTIONS[0];
  onClose: () => void;
  onSuccess: () => void;
}

function UploadModal({ section, onClose, onSuccess }: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [label, setLabel] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const utils = trpc.useUtils();

  const upload = trpc.admin.assets.upload.useMutation({
    onSuccess: () => {
      utils.admin.assets.list.invalidate();
      onSuccess();
      onClose();
    },
  });

  function handleFile(f: File) {
    setFile(f);
    if (!label) setLabel(f.name.replace(/\.[^.]+$/, ""));
    const url = URL.createObjectURL(f);
    setPreview(url);
  }

  async function handleSubmit() {
    if (!file || !label.trim()) return;
    const base64 = await fileToBase64(file);
    upload.mutate({
      section: section.id,
      label: label.trim(),
      fileBase64: base64,
      fileName: file.name,
      contentType: file.type || "application/octet-stream",
    });
  }

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(0,0,0,0.75)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "1rem",
    }} onClick={onClose}>
      <div style={{
        background: C.dark, border: `1px solid ${C.border}`,
        borderRadius: "1.25rem", padding: "2rem",
        width: "100%", maxWidth: "480px",
        maxHeight: "90vh", overflowY: "auto",
      }} onClick={e => e.stopPropagation()}>
        <h3 style={{ color: C.text, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "1.4rem", margin: "0 0 0.25rem" }}>
          Subir imagen
        </h3>
        <p style={{ color: C.muted, fontSize: "0.85rem", margin: "0 0 1.5rem" }}>
          Sección: <strong style={{ color: C.vivid }}>{section.label}</strong>
        </p>

        {/* Drop zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
          onClick={() => inputRef.current?.click()}
          style={{
            border: `2px dashed ${dragging ? C.vivid : C.border}`,
            borderRadius: "0.75rem",
            padding: "1.5rem",
            textAlign: "center",
            cursor: "pointer",
            marginBottom: "1rem",
            transition: "border-color 0.2s",
            background: dragging ? `${C.vivid}08` : "transparent",
          }}
        >
          {preview ? (
            <img src={preview} alt="preview" style={{ maxHeight: "160px", maxWidth: "100%", borderRadius: "0.5rem", objectFit: "contain" }} />
          ) : (
            <>
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📁</div>
              <div style={{ color: C.muted, fontSize: "0.85rem" }}>
                Arrastra una imagen aquí o <span style={{ color: C.vivid, fontWeight: 700 }}>haz clic para seleccionar</span>
              </div>
              <div style={{ color: C.muted, fontSize: "0.75rem", marginTop: "0.25rem" }}>
                PNG, JPG, WebP, SVG, GIF
              </div>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          />
        </div>

        {file && (
          <div style={{ color: C.muted, fontSize: "0.8rem", marginBottom: "1rem" }}>
            {file.name} · {formatBytes(file.size)}
          </div>
        )}

        {/* Label input */}
        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{ color: C.muted, fontSize: "0.8rem", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", display: "block", marginBottom: "0.4rem" }}>
            Nombre / Etiqueta
          </label>
          <input
            type="text"
            value={label}
            onChange={e => setLabel(e.target.value)}
            placeholder="ej. Hero Background, Silly Dots Mega Dose..."
            style={{
              width: "100%", padding: "0.65rem 0.9rem",
              background: C.mid, border: `1px solid ${C.border}`,
              borderRadius: "0.5rem", color: C.text, fontSize: "0.9rem",
              outline: "none", boxSizing: "border-box",
            }}
          />
        </div>

        {/* R2 warning if not configured */}
        <div style={{
          background: `${C.pink}10`, border: `1px solid ${C.pink}30`,
          borderRadius: "0.5rem", padding: "0.75rem 1rem",
          marginBottom: "1.5rem", fontSize: "0.8rem", color: C.muted,
        }}>
          ⚠️ Requiere <strong style={{ color: C.pink }}>Cloudflare R2</strong> configurado. Agrega las variables <code style={{ color: C.vivid }}>R2_*</code> en Railway antes de subir.
        </div>

        {upload.error && (
          <div style={{ background: `${C.pink}15`, border: `1px solid ${C.pink}40`, borderRadius: "0.5rem", padding: "0.75rem", marginBottom: "1rem", color: C.pink, fontSize: "0.85rem" }}>
            {upload.error.message}
          </div>
        )}

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: "0.75rem",
              background: C.mid, border: `1px solid ${C.border}`,
              borderRadius: "0.6rem", color: C.muted,
              cursor: "pointer", fontWeight: 600, fontSize: "0.9rem",
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={!file || !label.trim() || upload.isPending}
            style={{
              flex: 2, padding: "0.75rem",
              background: !file || !label.trim() ? C.mid : `linear-gradient(135deg, ${C.bright}, ${C.pink})`,
              border: "none", borderRadius: "0.6rem",
              color: !file || !label.trim() ? C.muted : "white",
              cursor: !file || !label.trim() ? "not-allowed" : "pointer",
              fontWeight: 700, fontSize: "0.9rem",
            }}
          >
            {upload.isPending ? "Subiendo..." : "Subir imagen"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminAssets() {
  const [activeSection, setActiveSection] = useState(SITE_SECTIONS[0].id);
  const [uploadModal, setUploadModal] = useState<typeof SITE_SECTIONS[0] | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<number | null>(null);
  const utils = trpc.useUtils();

  const { data: assets, isLoading } = trpc.admin.assets.list.useQuery({ section: activeSection });
  const deleteAsset = trpc.admin.assets.delete.useMutation({
    onSuccess: () => utils.admin.assets.list.invalidate(),
  });

  const section = SITE_SECTIONS.find(s => s.id === activeSection)!;

  function copyUrl(id: number, url: string) {
    navigator.clipboard.writeText(url);
    setCopiedUrl(id);
    setTimeout(() => setCopiedUrl(null), 2000);
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "2rem", color: C.text, margin: "0 0 0.25rem" }}>
            Assets Manager
          </h2>
          <p style={{ color: C.muted, fontSize: "0.9rem", margin: 0 }}>
            Gestiona los recursos gráficos de cada sección del sitio. Almacenados en Cloudflare R2.
          </p>
        </div>
        <button
          onClick={() => setUploadModal(section)}
          style={{
            padding: "0.65rem 1.25rem",
            background: `linear-gradient(135deg, ${C.bright}, ${C.pink})`,
            border: "none", borderRadius: "0.6rem",
            color: "white", fontWeight: 700, fontSize: "0.9rem",
            cursor: "pointer", whiteSpace: "nowrap",
          }}
        >
          + Subir imagen
        </button>
      </div>

      {/* Section tabs */}
      <div style={{
        display: "flex", gap: "0.5rem", flexWrap: "wrap",
        marginBottom: "1.5rem",
        padding: "0.75rem",
        background: C.dark, border: `1px solid ${C.border}`,
        borderRadius: "0.75rem",
      }}>
        {SITE_SECTIONS.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            style={{
              padding: "0.45rem 0.9rem",
              borderRadius: "0.5rem",
              border: "none",
              background: activeSection === s.id ? `${C.vivid}25` : "transparent",
              color: activeSection === s.id ? C.vivid : C.muted,
              fontWeight: activeSection === s.id ? 700 : 500,
              fontSize: "0.82rem",
              cursor: "pointer",
              transition: "all 0.15s",
              whiteSpace: "nowrap",
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Section info */}
      <div style={{
        background: `${C.vivid}08`, border: `1px solid ${C.vivid}20`,
        borderRadius: "0.75rem", padding: "1rem 1.25rem",
        marginBottom: "1.5rem",
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap",
      }}>
        <div>
          <div style={{ color: C.text, fontWeight: 700, fontSize: "0.95rem" }}>{section.label}</div>
          <div style={{ color: C.muted, fontSize: "0.82rem", marginTop: "0.2rem" }}>{section.desc}</div>
        </div>
        <div style={{ color: C.muted, fontSize: "0.8rem" }}>
          Sección ID: <code style={{ color: C.vivid, background: `${C.vivid}15`, padding: "0.1rem 0.4rem", borderRadius: "0.3rem" }}>{section.id}</code>
        </div>
      </div>

      {/* Assets grid */}
      {isLoading ? (
        <div style={{ color: C.muted, textAlign: "center", padding: "3rem" }}>Cargando...</div>
      ) : !assets || assets.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "4rem 2rem",
          background: C.dark, border: `1px dashed ${C.border}`,
          borderRadius: "1rem",
        }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🖼️</div>
          <div style={{ color: C.text, fontWeight: 700, fontSize: "1.1rem", marginBottom: "0.5rem" }}>
            No hay imágenes en esta sección
          </div>
          <div style={{ color: C.muted, fontSize: "0.9rem", marginBottom: "1.5rem" }}>
            Sube la primera imagen para <strong>{section.label}</strong>
          </div>
          <button
            onClick={() => setUploadModal(section)}
            style={{
              padding: "0.65rem 1.5rem",
              background: `linear-gradient(135deg, ${C.bright}, ${C.pink})`,
              border: "none", borderRadius: "0.6rem",
              color: "white", fontWeight: 700, fontSize: "0.9rem",
              cursor: "pointer",
            }}
          >
            + Subir imagen
          </button>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: "1rem",
        }}>
          {assets.map(asset => (
            <div key={asset.id} style={{
              background: C.dark, border: `1px solid ${C.border}`,
              borderRadius: "0.75rem", overflow: "hidden",
            }}>
              {/* Image preview */}
              <div style={{
                aspectRatio: "16/9",
                background: C.mid,
                overflow: "hidden",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <img
                  src={asset.url}
                  alt={asset.label}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              </div>
              {/* Info */}
              <div style={{ padding: "0.75rem" }}>
                <div style={{ color: C.text, fontWeight: 600, fontSize: "0.85rem", marginBottom: "0.25rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {asset.label}
                </div>
                {asset.sizeBytes && (
                  <div style={{ color: C.muted, fontSize: "0.75rem", marginBottom: "0.5rem" }}>
                    {formatBytes(asset.sizeBytes)}{asset.width ? ` · ${asset.width}×${asset.height}px` : ""}
                  </div>
                )}
                {/* Actions */}
                <div style={{ display: "flex", gap: "0.4rem" }}>
                  <button
                    onClick={() => copyUrl(asset.id, asset.url)}
                    style={{
                      flex: 1, padding: "0.4rem 0.5rem",
                      background: copiedUrl === asset.id ? `${C.green}20` : `${C.vivid}15`,
                      border: `1px solid ${copiedUrl === asset.id ? C.green : C.vivid}30`,
                      borderRadius: "0.4rem",
                      color: copiedUrl === asset.id ? C.green : C.vivid,
                      fontSize: "0.75rem", fontWeight: 600, cursor: "pointer",
                    }}
                  >
                    {copiedUrl === asset.id ? "✓ Copiado" : "Copiar URL"}
                  </button>
                  <a
                    href={asset.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      padding: "0.4rem 0.6rem",
                      background: `${C.mid}`,
                      border: `1px solid ${C.border}`,
                      borderRadius: "0.4rem",
                      color: C.muted, fontSize: "0.75rem",
                      textDecoration: "none",
                    }}
                  >
                    ↗
                  </a>
                  <button
                    onClick={() => { if (confirm(`¿Eliminar "${asset.label}"?`)) deleteAsset.mutate({ id: asset.id }); }}
                    style={{
                      padding: "0.4rem 0.6rem",
                      background: `${C.pink}10`,
                      border: `1px solid ${C.pink}25`,
                      borderRadius: "0.4rem",
                      color: C.pink, fontSize: "0.75rem", cursor: "pointer",
                    }}
                  >
                    🗑
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload modal */}
      {uploadModal && (
        <UploadModal
          section={uploadModal}
          onClose={() => setUploadModal(null)}
          onSuccess={() => {}}
        />
      )}
    </div>
  );
}
