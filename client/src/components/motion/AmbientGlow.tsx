import "./AmbientGlow.css";

export type GlowVariant = "a" | "b" | "c";

/**
 * A soft radial glow behind one section's content.
 *
 * Drop it as the FIRST child of a section that also carries the
 * `ambient-glow-host` class — that class is what makes the section a
 * stacking context, which is what guarantees this layer paints above the
 * section's own background and below everything in it. Without the host
 * class the layer would be positioned inside an un-isolated parent and
 * could paint over the content, which is exactly the old bug.
 *
 * Purely decorative: aria-hidden, no pointer events, and nothing animated.
 */
export function AmbientGlow({ variant = "a" }: { variant?: GlowVariant }) {
  return (
    <div
      className={`ambient-glow ambient-glow--${variant}`}
      aria-hidden="true"
    />
  );
}

export default AmbientGlow;
