import { ImageIcon } from "lucide-react";

/** Decent "no image uploaded yet" state for a site-asset slot — never a broken <img>. */
export function AssetPlaceholder({
  width,
  height,
  variant = "dark",
  label,
  className,
  style,
}: {
  width: number;
  height: number;
  variant?: "dark" | "light";
  label?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const isDark = variant === "dark";
  return (
    <div
      className={className}
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.4rem",
        padding: "0.5rem",
        textAlign: "center",
        background: isDark ? "rgba(255,255,255,0.04)" : "#f3f4f6",
        color: isDark ? "rgba(255,255,255,0.35)" : "#9ca3af",
        ...style,
      }}
    >
      <ImageIcon size={26} strokeWidth={1.5} />
      <span style={{ fontSize: "0.68rem", fontWeight: 600, lineHeight: 1.3 }}>
        {label ? `${label} · ` : ""}
        {width}×{height}px
      </span>
    </div>
  );
}
