import "./NavbarWave.css";

/*
 * One wave period is 720 units wide; the path lays down four of them
 * across a 2880-wide viewBox. The element is rendered at 200% of its
 * container, so translating it by -50% advances exactly two periods and
 * lands on an identical shape — that's what makes the loop seamless.
 *
 * Built from quadratic curves rather than a real sine: Q gives the crest a
 * slightly fuller shoulder, which reads better at this size than a
 * textbook sine, and it's a fraction of the path data.
 *
 * The path closes down to y=60 so it fills BELOW the wave line — the fill
 * is the navbar's own colour, so the effect is the bar having a wavy
 * bottom edge rather than a wave drawn under a straight one.
 */
const wavePath = (amplitude: number): string => {
  const mid = 30;
  const up = mid - amplitude;
  const down = mid + amplitude;
  let d = `M0,${mid}`;
  for (let x = 0; x < 2880; x += 720) {
    d += ` Q${x + 180},${up} ${x + 360},${mid} Q${x + 540},${down} ${x + 720},${mid}`;
  }
  return `${d} L2880,60 L0,60 Z`;
};

/**
 * The navbar's undulating bottom edge.
 *
 * Two stacked layers drifting at different speeds and directions — one
 * wave alone reads as a sliding picture, two crossing read as water. Both
 * animate `transform` only, so the compositor runs them without repainting
 * the path; there is no blur or filter anywhere in here.
 *
 * Under prefers-reduced-motion the CSS stops the drift and the wave simply
 * sits still, which is the whole point: the shape is the decoration, the
 * movement is the flourish.
 */
export function NavbarWave() {
  return (
    <div className="navbar-wave" aria-hidden="true">
      {/*
        Back layer: the visible wave. Its amplitude is deliberately about
        twice the front's — the front is filled in the navbar's own colour,
        and the hero directly beneath it is oklch(0.09 0.04 295) against the
        bar's oklch(0.10 0.04 295), i.e. all but the same colour. Measured
        with the two amplitudes close together, only ~2px of purple showed
        and the whole effect read as a faint smudge. The gap between the two
        amplitudes IS the wave.
      */}
      <svg
        className="navbar-wave__svg navbar-wave__svg--back"
        viewBox="0 0 2880 60"
        preserveAspectRatio="none"
        focusable="false"
      >
        <path d={wavePath(24)} fill="oklch(0.62 0.28 295)" />
      </svg>

      {/* Front layer in the navbar's own background colour, so the bar
          looks like it ends in a wave instead of having one taped under
          it. The purple layer behind shows through as the crests. */}
      <svg
        className="navbar-wave__svg"
        viewBox="0 0 2880 60"
        preserveAspectRatio="none"
        focusable="false"
      >
        <path d={wavePath(11)} fill="oklch(0.10 0.04 295)" />
      </svg>
    </div>
  );
}

export default NavbarWave;
