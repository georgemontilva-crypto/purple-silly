import { LightParticles } from "./LightParticles";

/** Roughly the navbar's own height (68px), plus enough to carry a mote
 *  past the bottom edge rather than have it wink out mid-bar — which is
 *  what sells the light as continuing down into the hero. */
const FALL_DISTANCE = 96;

/**
 * Desktop-only glow zone on the navbar's right side: a dark purple
 * gradient concentrated at the right edge, fading to nothing toward the
 * center, with light motes descending through it.
 *
 * The motes are the SAME component the hero renders behind its carousel —
 * same colour, size, direction and fall speed — so the two read as one
 * flow rather than two unrelated effects: light born here at the right
 * edge, carrying on down into the hero below.
 *
 * This replaces a bespoke canvas that drew its own particles travelling
 * right-to-left with trails. Nothing here blurs or filters, so as before
 * the navbar forces no repaint on scroll — and it's now a good deal less
 * code than a canvas, a RAF loop and a resize observer.
 */
export function NavbarGlow() {
  return (
    <div
      className="absolute inset-y-0 right-0 pointer-events-none overflow-hidden"
      style={{
        width: "42%",
        background:
          "linear-gradient(to left, oklch(0.32 0.18 295 / 65%) 0%, oklch(0.22 0.14 295 / 35%) 25%, oklch(0.14 0.08 295 / 12%) 55%, transparent 85%)",
      }}
      aria-hidden="true"
    >
      <LightParticles className="navbar-particles" count={16} fallDistance={FALL_DISTANCE} />
    </div>
  );
}
