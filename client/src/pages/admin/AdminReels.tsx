import { useRef, useState } from "react";
import { trpc } from "@/lib/trpc";
import { ADMIN_COLORS as C, alpha } from "@/lib/adminTheme";
import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  Film,
  Loader2,
  Trash2,
  UploadCloud,
} from "lucide-react";

const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
const ALLOWED_POSTER_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_VIDEO_BYTES = 100 * 1024 * 1024;
const MAX_POSTER_BYTES = 5 * 1024 * 1024;
/** Mirrors MAX_VISIBLE_REELS in server/routers/homeReels.ts. */
const MAX_VISIBLE = 4;

/**
 * PUTs a file straight to R2 with the presigned URL.
 *
 * XHR rather than fetch purely for `upload.onprogress` — fetch still can't
 * report upload progress, and a 100MB video with no feedback looks like a
 * frozen page. The Content-Type must match what the URL was signed for or
 * R2 rejects the signature.
 */
function putToR2(
  uploadUrl: string,
  file: File,
  onProgress: (percent: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.upload.onprogress = e => {
      if (e.lengthComputable)
        onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(
            new Error(
              `Upload failed (${xhr.status}). Check the bucket's CORS rules.`
            )
          );
    xhr.onerror = () =>
      reject(
        new Error(
          "Upload failed. The R2 bucket most likely needs a CORS rule allowing PUT from this origin."
        )
      );
    xhr.send(file);
  });
}

export default function AdminReels() {
  const utils = trpc.useUtils();
  const { data: reels, isLoading } = trpc.homeReels.list.useQuery();

  const [title, setTitle] = useState("");
  const [video, setVideo] = useState<File | null>(null);
  const [poster, setPoster] = useState<File | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoInput = useRef<HTMLInputElement>(null);
  const posterInput = useRef<HTMLInputElement>(null);

  const createUploadUrl = trpc.homeReels.createUploadUrl.useMutation();
  const create = trpc.homeReels.create.useMutation();
  const update = trpc.homeReels.update.useMutation({
    onSuccess: () => utils.homeReels.invalidate(),
    onError: e => setError(e.message),
  });
  const reorder = trpc.homeReels.reorder.useMutation({
    onSuccess: () => utils.homeReels.invalidate(),
    onError: e => setError(e.message),
  });
  const remove = trpc.homeReels.delete.useMutation({
    onSuccess: () => utils.homeReels.invalidate(),
    onError: e => setError(e.message),
  });

  const uploading = progress !== null;
  const activeCount = reels?.filter(r => r.active).length ?? 0;

  function pickVideo(file: File | undefined) {
    setError(null);
    if (!file) return;
    if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
      setError("Video must be MP4, WebM or MOV.");
      return;
    }
    if (file.size > MAX_VIDEO_BYTES) {
      setError(`Video is too large. Max ${MAX_VIDEO_BYTES / (1024 * 1024)}MB.`);
      return;
    }
    setVideo(file);
  }

  function pickPoster(file: File | undefined) {
    setError(null);
    if (!file) return;
    if (!ALLOWED_POSTER_TYPES.includes(file.type)) {
      setError("Poster must be JPG, PNG or WebP.");
      return;
    }
    if (file.size > MAX_POSTER_BYTES) {
      setError("Poster is too large. Max 5MB.");
      return;
    }
    setPoster(file);
  }

  async function handleUpload() {
    if (!video) return;
    setError(null);
    setProgress(0);
    try {
      // Video first, then the optional poster, then one row. Nothing is
      // recorded until both files are actually in the bucket, so a failure
      // halfway leaves no reel pointing at a missing object.
      const v = await createUploadUrl.mutateAsync({
        kind: "video",
        fileName: video.name,
        contentType: video.type,
      });
      await putToR2(v.uploadUrl, video, setProgress);

      let posterKey: string | undefined;
      let posterUrl: string | undefined;
      if (poster) {
        const p = await createUploadUrl.mutateAsync({
          kind: "poster",
          fileName: poster.name,
          contentType: poster.type,
        });
        await putToR2(p.uploadUrl, poster, () => {});
        posterKey = p.key;
        posterUrl = p.publicUrl;
      }

      await create.mutateAsync({
        title: title.trim() || undefined,
        videoKey: v.key,
        videoUrl: v.publicUrl,
        posterKey,
        posterUrl,
      });

      await utils.homeReels.invalidate();
      setTitle("");
      setVideo(null);
      setPoster(null);
      if (videoInput.current) videoInput.current.value = "";
      if (posterInput.current) posterInput.current.value = "";
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setProgress(null);
    }
  }

  function move(index: number, direction: -1 | 1) {
    if (!reels) return;
    const next = [...reels];
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
          Reels del home
        </h2>
        <p style={{ color: C.muted, fontSize: "0.9rem", margin: 0 }}>
          Videos verticales (9:16). El home muestra los primeros {MAX_VISIBLE}{" "}
          activos, en este orden. Los videos se suben directo a R2, sin pasar
          por el servidor.
        </p>
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

      {/* ─── Upload ─────────────────────────────────────────────── */}
      <div style={{ ...panelStyle, marginBottom: "1.5rem" }}>
        <h3
          style={{
            margin: "0 0 1rem",
            color: C.text,
            fontSize: "1rem",
            fontWeight: 700,
          }}
        >
          Subir un reel
        </h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "0.85rem",
            marginBottom: "1rem",
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                color: C.muted,
                fontSize: "0.75rem",
                fontWeight: 700,
                marginBottom: "0.3rem",
              }}
            >
              Título <span style={{ fontWeight: 500 }}>· opcional</span>
            </label>
            <input
              value={title}
              maxLength={128}
              onChange={e => setTitle(e.target.value)}
              placeholder="Silly Dots en acción"
              style={fieldStyle}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                color: C.muted,
                fontSize: "0.75rem",
                fontWeight: 700,
                marginBottom: "0.3rem",
              }}
            >
              Video{" "}
              <span style={{ fontWeight: 500 }}>
                · MP4/WebM/MOV, máx. 100MB
              </span>
            </label>
            <input
              ref={videoInput}
              type="file"
              accept={ALLOWED_VIDEO_TYPES.join(",")}
              onChange={e => pickVideo(e.target.files?.[0])}
              style={{ ...fieldStyle, padding: "0.4rem" }}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                color: C.muted,
                fontSize: "0.75rem",
                fontWeight: 700,
                marginBottom: "0.3rem",
              }}
            >
              Miniatura{" "}
              <span style={{ fontWeight: 500 }}>· opcional, máx. 5MB</span>
            </label>
            <input
              ref={posterInput}
              type="file"
              accept={ALLOWED_POSTER_TYPES.join(",")}
              onChange={e => pickPoster(e.target.files?.[0])}
              style={{ ...fieldStyle, padding: "0.4rem" }}
            />
          </div>
        </div>

        {uploading && (
          <div style={{ marginBottom: "0.85rem" }}>
            <div
              style={{
                height: 8,
                borderRadius: 999,
                background: alpha(C.border, 20),
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${progress}%`,
                  height: "100%",
                  background: `linear-gradient(90deg, ${C.vivid}, ${C.pink})`,
                  transition: "width 0.2s",
                }}
              />
            </div>
            <p
              style={{
                margin: "0.4rem 0 0",
                color: C.muted,
                fontSize: "0.78rem",
              }}
            >
              Subiendo… {progress}%
            </p>
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!video || uploading}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.6rem 1.1rem",
            borderRadius: "0.5rem",
            border: "none",
            background: !video || uploading ? alpha(C.vivid, 40) : C.vivid,
            color: "#fff",
            fontWeight: 700,
            fontSize: "0.85rem",
            cursor: !video || uploading ? "default" : "pointer",
          }}
        >
          {uploading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <UploadCloud size={16} />
          )}
          {uploading ? "Subiendo…" : "Subir reel"}
        </button>
      </div>

      {/* ─── List ───────────────────────────────────────────────── */}
      {isLoading ? (
        <p style={{ color: C.muted }}>Cargando…</p>
      ) : !reels || reels.length === 0 ? (
        <div style={{ ...panelStyle, textAlign: "center", color: C.muted }}>
          <Film
            size={28}
            style={{ margin: "0 auto 0.5rem", display: "block" }}
          />
          Todavía no hay reels. Sube el primero arriba.
        </div>
      ) : (
        <>
          {activeCount > MAX_VISIBLE && (
            <p
              style={{
                color: C.bright,
                fontSize: "0.82rem",
                marginBottom: "0.75rem",
              }}
            >
              Hay {activeCount} reels activos; el home solo muestra los{" "}
              {MAX_VISIBLE} primeros de esta lista.
            </p>
          )}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))",
              gap: "1rem",
            }}
          >
            {reels.map((reel, index) => (
              <div
                key={reel.id}
                style={{
                  ...panelStyle,
                  padding: "0.75rem",
                  opacity: reel.active ? 1 : 0.55,
                }}
              >
                <div
                  style={{
                    position: "relative",
                    aspectRatio: "9 / 16",
                    borderRadius: "0.55rem",
                    overflow: "hidden",
                    background: "#000",
                    marginBottom: "0.6rem",
                  }}
                >
                  <video
                    src={reel.videoUrl}
                    poster={reel.posterUrl ?? undefined}
                    muted
                    playsInline
                    preload="metadata"
                    controls
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                  {index < MAX_VISIBLE && reel.active && (
                    <span
                      style={{
                        position: "absolute",
                        top: 6,
                        left: 6,
                        padding: "0.1rem 0.45rem",
                        borderRadius: 999,
                        background: alpha(C.green, 85),
                        color: "#04120a",
                        fontSize: "0.65rem",
                        fontWeight: 800,
                      }}
                    >
                      EN EL HOME
                    </span>
                  )}
                </div>

                <input
                  defaultValue={reel.title ?? ""}
                  maxLength={128}
                  placeholder="Sin título"
                  onBlur={e => {
                    const next = e.target.value;
                    if (next !== (reel.title ?? ""))
                      update.mutate({ id: reel.id, title: next });
                  }}
                  style={{ ...fieldStyle, marginBottom: "0.6rem" }}
                />

                <div style={{ display: "flex", gap: "0.35rem" }}>
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
                    disabled={index === reels.length - 1}
                    aria-label="Bajar"
                    style={{
                      ...iconButton(),
                      opacity: index === reels.length - 1 ? 0.4 : 1,
                    }}
                  >
                    <ArrowDown size={15} />
                  </button>
                  <button
                    onClick={() =>
                      update.mutate({ id: reel.id, active: !reel.active })
                    }
                    aria-label={reel.active ? "Ocultar" : "Mostrar"}
                    style={iconButton()}
                  >
                    {reel.active ? <Eye size={15} /> : <EyeOff size={15} />}
                  </button>
                  <button
                    onClick={() => {
                      // Deleting also removes the file from R2, so it can't
                      // be undone by re-adding the row.
                      if (
                        confirm(
                          "¿Borrar este reel? También se borra el video de R2."
                        )
                      ) {
                        remove.mutate({ id: reel.id });
                      }
                    }}
                    aria-label="Borrar"
                    style={{ ...iconButton(true), marginLeft: "auto" }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
