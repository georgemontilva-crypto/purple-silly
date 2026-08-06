import { useMemo, useRef, useState } from "react";
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
  GripVertical,
  ImageOff,
  ImagePlus,
  Loader2,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { ADMIN_COLORS as C, alpha } from "@/lib/adminTheme";

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

function IconButton({
  children,
  onClick,
  href,
  tone = "muted",
  active = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  tone?: "muted" | "vivid" | "pink" | "green";
  active?: boolean;
}) {
  const [hover, setHover] = useState(false);
  const color = tone === "vivid" ? C.vivid : tone === "pink" ? C.pink : tone === "green" ? C.green : C.muted;
  const style: React.CSSProperties = {
    flex: tone === "muted" && !href ? undefined : 1,
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: href ? "0.35rem 0.5rem" : "0.35rem",
    background: active ? alpha(C.green, 20) : hover ? alpha(color, 20) : alpha(color, 10),
    border: `1px solid ${active ? C.green : hover ? color : alpha(color, 35)}`,
    borderRadius: "0.4rem",
    color: active ? C.green : color,
    cursor: "pointer",
    transition: "background 0.15s, border-color 0.15s, color 0.15s",
    textDecoration: "none",
  };
  const props = {
    style,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
  };
  if (href) {
    return (
      <a href={href} target="_blank" rel="noreferrer" {...props}>
        {children}
      </a>
    );
  }
  return (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  );
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
  const [dropHover, setDropHover] = useState(false);
  const [pending, setPending] = useState<PendingUpload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [cancelHover, setCancelHover] = useState(false);
  const [confirmHover, setConfirmHover] = useState(false);

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

  /**
   * Sections that hold several images (hero-carousel) are ORDERED, and the
   * order is meaningful — it's the sequence the storefront renders them
   * in. Single-image sections have nothing to sort, so they don't get the
   * drag affordances.
   */
  const isOrdered = meta.maxImages > 1;

  // Applied while the reorder request is in flight, so the thumbnails stay
  // where they were dropped instead of snapping back to the server's old
  // order for the length of the round trip.
  const [localOrder, setLocalOrder] = useState<number[] | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const reorder = trpc.admin.assets.reorder.useMutation({
    onSuccess: async () => {
      await utils.admin.assets.list.invalidate();
      setLocalOrder(null);
    },
    onError: e => {
      setError(e.message);
      setLocalOrder(null);
    },
  });

  const orderedAssets = useMemo(() => {
    if (!localOrder) return assets;
    const byId = new Map(assets.map(a => [a.id, a]));
    const next = localOrder.map(id => byId.get(id)).filter((a): a is SiteAsset => !!a);
    // Fall back to the server's order if the two have diverged (e.g. a
    // delete landed while a drag was pending) rather than dropping a row.
    return next.length === assets.length ? next : assets;
  }, [assets, localOrder]);

  function handleReorderDrop(targetIndex: number) {
    setDragOverIndex(null);
    if (dragIndex === null || dragIndex === targetIndex) {
      setDragIndex(null);
      return;
    }
    const next = [...orderedAssets];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(targetIndex, 0, moved);
    setDragIndex(null);
    setError(null);
    setLocalOrder(next.map(a => a.id));
    reorder.mutate({ section: sectionKey, orderedIds: next.map(a => a.id) });
  }

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
        background: C.panel,
        border: `1px solid ${alpha(C.border, 35)}`,
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
          <div style={{ color: C.bright, fontWeight: 700, fontSize: "0.8rem" }}>
            {meta.width}×{meta.height}px recomendado
          </div>
          <div style={{ color: C.muted, fontSize: "0.75rem", marginTop: "0.15rem" }}>
            {assets.length} / {meta.maxImages} imagen{meta.maxImages === 1 ? "" : "es"}
          </div>
          {isOrdered && assets.length > 1 && (
            <div
              style={{
                color: reorder.isPending ? C.bright : C.muted,
                fontSize: "0.72rem",
                marginTop: "0.15rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: "0.25rem",
              }}
            >
              {reorder.isPending ? (
                <>
                  <Loader2 size={11} className="animate-spin" /> Guardando orden...
                </>
              ) : (
                <>
                  <GripVertical size={11} /> Arrastra para reordenar
                </>
              )}
            </div>
          )}
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
          {orderedAssets.map((asset, index) => (
            <div
              key={asset.id}
              draggable={isOrdered}
              onDragStart={isOrdered ? () => setDragIndex(index) : undefined}
              onDragOver={
                isOrdered
                  ? e => {
                      e.preventDefault();
                      setDragOverIndex(index);
                    }
                  : undefined
              }
              onDragLeave={isOrdered ? () => setDragOverIndex(null) : undefined}
              onDrop={isOrdered ? () => handleReorderDrop(index) : undefined}
              onDragEnd={
                isOrdered
                  ? () => {
                      setDragIndex(null);
                      setDragOverIndex(null);
                    }
                  : undefined
              }
              style={{
                background: C.panelAlt,
                border: `1px solid ${
                  isOrdered && dragOverIndex === index ? C.vivid : alpha(C.border, 35)
                }`,
                borderRadius: "0.6rem",
                overflow: "hidden",
                opacity: isOrdered && dragIndex === index ? 0.45 : 1,
                transition: "border-color 0.15s, opacity 0.15s",
              }}
            >
              <div
                style={{
                  position: "relative",
                  // Preview at the section's own aspect ratio, so a 3:4
                  // carousel slide isn't square-cropped into something that
                  // looks nothing like what the storefront will show.
                  aspectRatio: `${meta.width}/${meta.height}`,
                  background: alpha(C.vivid, 10),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  cursor: isOrdered ? "grab" : "default",
                }}
              >
                <img
                  src={asset.url}
                  alt={asset.label}
                  draggable={false}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={e => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                {isOrdered && (
                  <>
                    <div
                      style={{
                        position: "absolute",
                        top: 4,
                        left: 4,
                        display: "flex",
                        alignItems: "center",
                        gap: "0.2rem",
                        padding: "0.15rem 0.35rem",
                        background: "rgba(0,0,0,0.6)",
                        borderRadius: "0.3rem",
                      }}
                    >
                      <GripVertical size={12} color="white" />
                      <span style={{ color: "white", fontSize: "0.65rem", fontWeight: 700 }}>
                        {index + 1}
                      </span>
                    </div>
                    {index === 0 && (
                      <span
                        style={{
                          position: "absolute",
                          bottom: 4,
                          left: 4,
                          padding: "0.1rem 0.4rem",
                          background: alpha(C.vivid, 85),
                          borderRadius: "999px",
                          color: "white",
                          fontSize: "0.6rem",
                          fontWeight: 700,
                        }}
                      >
                        Primera
                      </span>
                    )}
                  </>
                )}
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
                  <IconButton onClick={() => copyUrl(asset.id, asset.url)} tone="vivid" active={copiedId === asset.id}>
                    {copiedId === asset.id ? <Check size={13} /> : <Copy size={13} />}
                  </IconButton>
                  <IconButton href={asset.url} tone="muted">
                    <ExternalLink size={13} />
                  </IconButton>
                  <IconButton
                    tone="pink"
                    onClick={() => {
                      if (confirm(`¿Eliminar "${asset.label}"?`)) deleteAsset.mutate({ id: asset.id });
                    }}
                  >
                    <Trash2 size={13} />
                  </IconButton>
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
            border: `1px dashed ${alpha(C.border, 35)}`,
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
            border: `1px solid ${alpha(C.vivid, 40)}`,
            borderRadius: "0.6rem",
            padding: "0.9rem",
            background: alpha(C.vivid, 8),
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
                border: `1px solid ${alpha(C.border, 35)}`,
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
                  background: C.panelAlt,
                  border: `1px solid ${alpha(C.border, 35)}`,
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
              onMouseEnter={() => setCancelHover(true)}
              onMouseLeave={() => setCancelHover(false)}
              disabled={upload.isPending}
              style={{
                flex: 1,
                padding: "0.5rem",
                background: cancelHover ? C.panelAlt : "transparent",
                border: `1px solid ${alpha(C.border, 35)}`,
                borderRadius: "0.5rem",
                color: C.muted,
                fontWeight: 600,
                fontSize: "0.82rem",
                cursor: "pointer",
                transition: "background 0.15s",
              }}
            >
              Cancelar
            </button>
            <button
              onClick={confirmUpload}
              onMouseEnter={() => setConfirmHover(true)}
              onMouseLeave={() => setConfirmHover(false)}
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
                opacity: upload.isPending ? 0.7 : confirmHover ? 0.85 : 1,
                transition: "opacity 0.15s",
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
          onMouseEnter={() => setDropHover(true)}
          onMouseLeave={() => setDropHover(false)}
          style={{
            border: `2px dashed ${dragging ? C.vivid : dropHover ? alpha(C.border, 60) : alpha(C.border, 35)}`,
            borderRadius: "0.6rem",
            padding: "1rem",
            textAlign: "center",
            cursor: "pointer",
            background: dragging ? alpha(C.vivid, 8) : dropHover ? C.panelAlt : "transparent",
            transition: "border-color 0.15s, background 0.15s",
          }}
        >
          <ImagePlus size={20} style={{ color: C.muted, marginBottom: "0.35rem" }} />
          <div style={{ color: C.muted, fontSize: "0.82rem" }}>
            Arrastra una imagen o <span style={{ color: C.bright, fontWeight: 700 }}>haz clic para elegir</span>
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
