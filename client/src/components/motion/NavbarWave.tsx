import "./NavbarWave.css";

/**
 * Geometry of the wave.
 *
 * TILE is one seamless repeat. The viewBox holds two of them and the
 * element renders at 200% of its container, so translating by exactly -50%
 * lands on an identical shape and the loop has no seam.
 *
 * PERIOD is what the previous version got wrong. It was 720 units against
 * an amplitude of 24 — on screen that worked out to about 13px of rise
 * across 712px of run, which is not a wave, it's a gentle diagonal. The
 * ratio here is roughly five times steeper.
 */
const TILE = 1200;
const VIEW_W = TILE * 2;
const VIEW_H = 120;
const PERIOD = 240;

/**
 * A sine-like wave built from cubic Béziers, C1-continuous.
 *
 * Each half-period is one cubic arch with both control points offset by
 * 4A/3 — that factor puts the curve's peak at exactly A, and because
 * consecutive arches alternate the sign of the offset, the outgoing
 * tangent of one arch is collinear with the incoming tangent of the next.
 * That collinearity is what makes the joins smooth instead of leaving a
 * visible kink at every zero crossing.
 *
 * `closed` fills the region ABOVE the curve, up to the top of the box. The
 * shape's only bottom boundary is then the curve itself — nothing is
 * squared off against the bottom of the container, which is where the old
 * version's hard-edged dark band came from.
 */
function wave(mid: number, amplitude: number, closed: boolean): string {
  const half = PERIOD / 2;
  const ctrl = (amplitude * 4) / 3;

  let d = `M0,${mid}`;
  for (let i = 0; i * half < VIEW_W; i++) {
    const x0 = i * half;
    // Up on even arches, down on odd. In SVG, up is a smaller y.
    const dir = i % 2 === 0 ? -1 : 1;
    d +=
      ` C${x0 + half / 3},${mid + dir * ctrl}` +
      ` ${x0 + (half * 2) / 3},${mid + dir * ctrl}` +
      ` ${x0 + half},${mid}`;
  }

  return closed ? `${d} L${VIEW_W},0 L0,0 Z` : d;
}

/**
 * The navbar's undulating bottom edge.
 *
 * Two layers drifting at different speeds and directions — one wave alone
 * reads as a sliding picture, two crossing read as water.
 *
 * The filled layer is the navbar's own colour and fills UPWARD from its
 * curve, so the bar genuinely ends in a wave and everything below the
 * curve is transparent: the hero shows straight through with no band, no
 * step and no second colour in between. The purple stroke is a separate,
 * slower ripple; where it drifts under the filled edge it reads as a
 * highlight on the water, and where it passes above it simply slides
 * behind the bar.
 *
 * transform only, no filters. Under prefers-reduced-motion the CSS stops
 * the drift and the wave sits still — the shape is the decoration, the
 * movement is the flourish.
 */
export function NavbarWave() {
  return (
    <div className="navbar-wave" aria-hidden="true">
      <svg
        className="navbar-wave__svg navbar-wave__svg--back"
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        preserveAspectRatio="none"
        focusable="false"
      >
        <path
          d={wave(72, 26, false)}
          fill="none"
          stroke="oklch(0.62 0.28 295)"
          strokeWidth={7}
          strokeLinecap="round"
        />
      </svg>

      <svg
        className="navbar-wave__svg navbar-wave__svg--front"
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        preserveAspectRatio="none"
        focusable="false"
      >
        {/* Same colour as the header above it, so the join is invisible and
            the bar simply has a wavy bottom. */}
        <path d={wave(52, 32, true)} fill="oklch(0.10 0.04 295)" />
        {/* A soft magenta line riding the fill's own edge, so the wave has
            a defined crest against the hero rather than fading out. */}
        <path
          d={wave(52, 32, false)}
          fill="none"
          stroke="oklch(0.72 0.22 320 / 55%)"
          strokeWidth={3}
        />
      </svg>
    </div>
  );
}

export default NavbarWave;
