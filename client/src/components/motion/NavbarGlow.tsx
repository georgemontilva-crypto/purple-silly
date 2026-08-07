import { LightParticles } from "./LightParticles";
import "./NavbarGlow.css";

/**
 * How far a mote travels before it fades out: the bar's own height (68px)
 * plus the wave's, plus a little more so the last of the light is still
 * fading as it leaves rather than winking out on a hard line. The wave is
 * 48px on desktop and 34px on a phone, hence the two figures.
 *
 * The fade is in the keyframe itself (opacity reaches 0 at the end of the
 * fall), which is what keeps the bottom of the field from having an edge.
 */
const FALL_DISTANCE = { desktop: 138, mobile: 112 };

/**
 * Total motes across BOTH zones, not per zone.
 *
 * Split rather than duplicated on purpose: two sides at the desktop count
 * would have doubled the number of animated elements at the very top of
 * every page. Eight a side reads as dense as sixteen on one because each
 * zone is the same width it always was.
 *
 * Mobile gets three a side. The gradient is the expensive-looking part and
 * costs nothing — it's one static radial that never repaints — so the
 * phone keeps the whole glow and only thins the field that actually
 * animates. Scroll jank at the top of this page has been a recurring
 * problem, and animated elements are the part that can cause it.
 */
const PARTICLE_COUNT = { desktop: 16, mobile: 6 };

function GlowZone({
  side,
  seed,
  compact,
}: {
  side: "left" | "right";
  seed: number;
  compact: boolean;
}) {
  const key = compact ? "mobile" : "desktop";
  return (
    <div className={`navbar-glow navbar-glow--${side}`} aria-hidden="true">
      <LightParticles
        className="navbar-particles"
        count={PARTICLE_COUNT[key] / 2}
        fallDistance={FALL_DISTANCE[key]}
        seed={seed}
      />
    </div>
  );
}

/**
 * Glow zones at both ends of the navbar: a dark purple bloom concentrated
 * at each outer edge, fading to nothing toward the centre so the logo and
 * links stay on clean ground, with light motes descending through both.
 *
 * The motes are the SAME component the hero renders behind its carousel —
 * same colour, size, direction and fall speed — so the two read as one
 * flow rather than two unrelated effects: light born up here at the edges,
 * carrying on down through the wave and into the hero below.
 *
 * The two zones take different particle seeds so they aren't identical
 * twins; the layout stays deterministic either way.
 *
 * Nothing here blurs or filters, and the motes animate transform and
 * opacity only, so the navbar forces no repaint on scroll.
 * LightParticles renders an empty field under prefers-reduced-motion, so
 * the glow survives there as a still gradient.
 *
 * `compact` is the phone variant: same gradients, a thinner field.
 */
export function NavbarGlow({ compact = false }: { compact?: boolean }) {
  return (
    <>
      <GlowZone side="left" seed={0} compact={compact} />
      <GlowZone side="right" seed={8} compact={compact} />
    </>
  );
}
