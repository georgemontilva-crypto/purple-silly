import { useRef, useState } from "react";
import { trpc } from "@/lib/trpc";
import {
  ASSET_SECTION_KEYS,
  ASSET_SECTIONS,
  type AssetSectionKey,
} from "@shared/assetSections";
import type { SiteAsset } from "../../../../drizzle/schema";
import {
  Check,
  Copy,
  ExternalLink,
  ImageOff,
  ImagePlus,
  Loader2,
  Trash2,
  UploadCloud,
} from "lucide-react";

const C = {
  dark: "oklch(0.10 0.05 295)",
  mid: "oklch(0.18 0.06 295)",
  border: "oklch(0.18 0.06 295)",
  vivid: "oklch(0.52 0.28 295)",
  bright: "oklch(0.62 0.28 295)",
  pink: "oklch(0.72 0.22 320)",
  green: "oklch(0.60 0.25 160)",
  text: "oklch(0.92 0.02 295)",
  muted: "oklch(0.55 0.07 295)",
};

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5MB

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function readImageDimensions(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = reject;
    img.src = url;
  });
}

function validateFile(file: File): string | null {
  if (!(ALLOWED_MIME_TYPES as readonly string[]).includes(file.type)) {
    return "Only JPG, PNG or WebP images are allowed.";
  }
  if (file.size > MAX_FILE_BYTES) {
    return `File is too large (${formatBytes(file.size)}). Max ${formatBytes(MAX_FILE_BYTES)}.`;
  }
  return null;
}

interface PendingUpload {
  file: File;
  previewUrl: string;
  label: string;
  width?: number;
  height?: number;
}

function SectionCard({
  sectionKey,
  assets,
  isLoading,
}: {
  sectionKey: AssetSectionKey;
  assets: SiteAsset[];
  isLoading: boolean;
}) {
  const meta = ASSET_SECTIONS[sectionKey];
  const utils = trpc.useUtils();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [pending, setPending] = useState<PendingUpload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const upload = trpc.admin.assets.upload.useMutation({
    onSuccess: () => {
      utils.admin.assets.list.invalidate();
      setPending(null);
    },
    onError: e => setError(e.message),
  });
  const deleteAsset = trpc.admin.assets.delete.useMutation({
    onSuccess: () => utils.admin.assets.list.invalidate(),
  });

  const atLimit = assets.length >= meta.maxImages;

  async function handleFile(file: File) {
    setError(null);
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    const previewUrl = URL.createObjectURL(file);
    let dims: { width: number; height: number } | undefined;
    try {
      dims = await readImageDimensions(previewUrl);
    } catch {
      dims = undefined;
    }
    setPending({
      file,
      previewUrl,
      label: file.name.replace(/\.[^.]+$/, ""),
      width: dims?.width,
      height: dims?.height,
    });
  }

  async function confirmUpload() {
    if (!pending) return;
    const base64 = await fileToBase64(pending.file);
    upload.mutate({
      section: sectionKey,
      label: pending.label.trim() || pending.file.name,
      fileBase64: base64,
      fileName: pending.file.name,
      contentType: pending.file.type as (typeof ALLOWED_MIME_TYPES)[number],
      width: pending.width,
      height: pending.height,
    });
  }

  function cancelPending() {
    if (pending) URL.revokeObjectURL(pending.previewUrl);
    setPending(null);
    setError(null);
  }

  function copyUrl(id: number, url: string) {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  }

  return (
    <div
      style={{
        background: C.dark,
        border: `1px solid ${C.border}`,
        borderRadius: "1rem",
        padding: "1.25rem",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "1rem",
          marginBottom: "1rem",
          flexWrap: "wrap",
        }}
      >
        <div>
          <div style={{ color: C.text, fontWeight: 700, fontSize: "1rem" }}>{meta.label}</div>
          <div style={{ color: C.muted, fontSize: "0.8rem", marginTop: "0.2rem", maxWidth: 460 }}>
            {meta.description}
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ color: C.vivid, fontWeight: 700, fontSize: "0.8rem" }}>
            {meta.width}×{meta.height}px recomendado
          </div>
          <div style={{ color: C.muted, fontSize: "0.75rem", marginTop: "0.15rem" }}>
            {assets.length} / {meta.maxImages} imagen{meta.maxImages === 1 ? "" : "es"}
          </div>
        </div>
      </div>

      {/* Existing assets */}
      {isLoading ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            color: C.muted,
            fontSize: "0.85rem",
            padding: "1rem 0",
          }}
        >
          <Loader2 size={16} className="animate-spin" /> Cargando...
        </div>
      ) : assets.length > 0 ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            gap: "0.75rem",
            marginBottom: "1rem",
          }}
        >
          {assets.map(asset => (
            <div
              key={asset.id}
              style={{
                background: C.mid,
                border: `1px solid ${C.border}`,
                borderRadius: "0.6rem",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  aspectRatio: "1/1",
                  background: `${C.vivid}10`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                <img
                  src={asset.url}
                  alt={asset.label}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={e => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
              <div style={{ padding: "0.6rem" }}>
                <div
                  style={{
                    color: C.text,
                    fontWeight: 600,
                    fontSize: "0.78rem",
                    marginBottom: "0.2rem",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  title={asset.label}
                >
                  {asset.label}
                </div>
                {asset.sizeBytes ? (
                  <div style={{ color: C.muted, fontSize: "0.7rem", marginBottom: "0.5rem" }}>
                    {formatBytes(asset.sizeBytes)}
                    {asset.width ? ` · ${asset.width}×${asset.height}px` : ""}
                  </div>
                ) : null}
                <div style={{ display: "flex", gap: "0.3rem" }}>
                  <button
                    onClick={() => copyUrl(asset.id, asset.url)}
                    title="Copiar URL"
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "0.35rem",
                      background: copiedId === asset.id ? `${C.green}20` : `${C.vivid}15`,
                      border: `1px solid ${copiedId === asset.id ? C.green : C.vivid}30`,
                      borderRadius: "0.4rem",
                      color: copiedId === asset.id ? C.green : C.vivid,
                      cursor: "pointer",
                    }}
                  >
                    {copiedId === asset.id ? <Check size={13} /> : <Copy size={13} />}
                  </button>
                  <a
                    href={asset.url}
                    target="_blank"
                    rel="noreferrer"
                    title="Abrir"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "0.35rem 0.5rem",
                      background: C.dark,
                      border: `1px solid ${C.border}`,
                      borderRadius: "0.4rem",
                      color: C.muted,
                    }}
                  >
                    <ExternalLink size={13} />
                  </a>
                  <button
                    onClick={() => {
                      if (confirm(`¿Eliminar "${asset.label}"?`)) deleteAsset.mutate({ id: asset.id });
                    }}
                    title="Eliminar"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "0.35rem 0.5rem",
                      background: `${C.pink}10`,
                      border: `1px solid ${C.pink}25`,
                      borderRadius: "0.4rem",
                      color: C.pink,
                      cursor: "pointer",
                    }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            color: C.muted,
            fontSize: "0.82rem",
            padding: "0.75rem 0",
          }}
        >
          <ImageOff size={16} /> Sin imágenes todavía.
        </div>
      )}

      {/* Upload area */}
      {atLimit && !pending ? (
        <div
          style={{
            border: `1px dashed ${C.border}`,
            borderRadius: "0.6rem",
            padding: "0.75rem 1rem",
            color: C.muted,
            fontSize: "0.8rem",
            textAlign: "center",
          }}
        >
          Sección completa ({meta.maxImages}/{meta.maxImages}). Elimina una imagen para subir otra.
        </div>
      ) : pending ? (
        <div
          style={{
            border: `1px solid ${C.vivid}40`,
            borderRadius: "0.6rem",
            padding: "0.9rem",
            background: `${C.vivid}08`,
          }}
        >
          <div style={{ display: "flex", gap: "0.75rem", marginBottom: "0.75rem" }}>
            <img
              src={pending.previewUrl}
              alt="preview"
              style={{
                width: 72,
                height: 72,
                objectFit: "cover",
                borderRadius: "0.5rem",
                border: `1px solid ${C.border}`,
                flexShrink: 0,
              }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <input
                value={pending.label}
                onChange={e => setPending({ ...pending, label: e.target.value })}
                placeholder="Nombre / etiqueta"
                style={{
                  width: "100%",
                  padding: "0.45rem 0.65rem",
                  background: C.mid,
                  border: `1px solid ${C.border}`,
                  borderRadius: "0.4rem",
                  color: C.text,
                  fontSize: "0.85rem",
                  outline: "none",
                  boxSizing: "border-box",
                  marginBottom: "0.4rem",
                }}
              />
              <div style={{ color: C.muted, fontSize: "0.75rem" }}>
                {formatBytes(pending.file.size)}
                {pending.width ? ` · ${pending.width}×${pending.height}px` : ""}
                {pending.width && (pending.width !== meta.width || pending.height !== meta.height) ? (
                  <span style={{ color: C.pink }}> (recomendado: {meta.width}×{meta.height}px)</span>
                ) : null}
              </div>
            </div>
          </div>
          {error && (
            <div style={{ color: C.pink, fontSize: "0.78rem", marginBottom: "0.6rem" }}>{error}</div>
          )}
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              onClick={cancelPending}
              disabled={upload.isPending}
              style={{
                flex: 1,
                padding: "0.5rem",
                background: C.mid,
                border: `1px solid ${C.border}`,
                borderRadius: "0.5rem",
                color: C.muted,
                fontWeight: 600,
                fontSize: "0.82rem",
                cursor: "pointer",
              }}
            >
              Cancelar
            </button>
            <button
              onClick={confirmUpload}
              disabled={upload.isPending}
              style={{
                flex: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.4rem",
                padding: "0.5rem",
                background: `linear-gradient(135deg, ${C.bright}, ${C.pink})`,
                border: "none",
                borderRadius: "0.5rem",
                color: "white",
                fontWeight: 700,
                fontSize: "0.82rem",
                cursor: upload.isPending ? "default" : "pointer",
                opacity: upload.isPending ? 0.7 : 1,
              }}
            >
              {upload.isPending ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />}
              {upload.isPending ? "Subiendo..." : "Subir imagen"}
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={e => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => {
            e.preventDefault();
            setDragging(false);
            const f = e.dataTransfer.files[0];
            if (f) handleFile(f);
          }}
          onClick={() => inputRef.current?.click()}
          style={{
            border: `2px dashed ${dragging ? C.vivid : C.border}`,
            borderRadius: "0.6rem",
            padding: "1rem",
            textAlign: "center",
            cursor: "pointer",
            background: dragging ? `${C.vivid}08` : "transparent",
            transition: "border-color 0.15s, background 0.15s",
          }}
        >
          <ImagePlus size={20} style={{ color: C.muted, marginBottom: "0.35rem" }} />
          <div style={{ color: C.muted, fontSize: "0.82rem" }}>
            Arrastra una imagen o <span style={{ color: C.vivid, fontWeight: 700 }}>haz clic para elegir</span>
          </div>
          <div style={{ color: C.muted, fontSize: "0.72rem", marginTop: "0.2rem" }}>
            JPG, PNG o WebP · máx. {formatBytes(MAX_FILE_BYTES)}
          </div>
          {error && (
            <div style={{ color: C.pink, fontSize: "0.78rem", marginTop: "0.5rem" }}>{error}</div>
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
        </div>
      )}
    </div>
  );
}

export default function AdminAssets() {
  const { data: allAssets, isLoading } = trpc.admin.assets.list.useQuery({});

  const bySection: Record<AssetSectionKey, SiteAsset[]> = ASSET_SECTION_KEYS.reduce(
    (acc, key) => ({ ...acc, [key]: [] }),
    {} as Record<AssetSectionKey, SiteAsset[]>
  );
  for (const asset of allAssets ?? []) {
    if (asset.section in bySection) {
      bySection[asset.section as AssetSectionKey].push(asset);
    }
  }

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h2
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 900,
            fontSize: "2rem",
            color: C.text,
            margin: "0 0 0.25rem",
          }}
        >
          Assets Manager
        </h2>
        <p style={{ color: C.muted, fontSize: "0.9rem", margin: 0 }}>
          Imágenes del storefront, agrupadas por sección. Se guardan en Cloudflare R2.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {ASSET_SECTION_KEYS.map(key => (
          <SectionCard key={key} sectionKey={key} assets={bySection[key]} isLoading={isLoading} />
        ))}
      </div>
    </div>
  );
}
