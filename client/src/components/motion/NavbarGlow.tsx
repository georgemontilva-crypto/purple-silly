import { LightParticles } from "./LightParticles";
import "./NavbarGlow.css";

/**
 * How far a mote travels before it fades out: the bar's own height (68px)
 * plus the wave's 48px, plus a little more so the last of the light is
 * still fading as it leaves rather than winking out on a hard line.
 *
 * The fade is in the keyframe itself (opacity reaches 0 at the end of the
 * fall), which is what keeps the bottom of the field from having an edge.
 */
const FALL_DISTANCE = 138;

/**
 * Total motes across BOTH zones, not per zone.
 *
 * Split rather than duplicated on purpose: two sides at the old count
 * would have doubled the number of animated elements at the very top of
 * every page. Eight a side reads as dense as sixteen on one because each
 * zone is the same width it always was.
 */
const PARTICLE_COUNT = 16;

function GlowZone({ side, seed }: { side: "left" | "right"; seed: number }) {
  return (
    <div className={`navbar-glow navbar-glow--${side}`} aria-hidden="true">
      <LightParticles
        className="navbar-particles"
        count={PARTICLE_COUNT / 2}
        fallDistance={FALL_DISTANCE}
        seed={seed}
      />
    </div>
  );
}

/**
 * Desktop-only glow zones at both ends of the navbar: a dark purple bloom
 * concentrated at each outer edge, fading to nothing toward the centre so
 * the logo and links stay on clean ground, with light motes descending
 * through both.
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
 * opacity only, so the navbar still forces no repaint on scroll. Not
 * rendered at all under md (gated by the caller), and LightParticles
 * renders an empty field under prefers-reduced-motion.
 */
export function NavbarGlow() {
  return (
    <>
      <GlowZone side="left" seed={0} />
      <GlowZone side="right" seed={8} />
    </>
  );
}
