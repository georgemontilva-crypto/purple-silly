/**
 * Geometry and physics for the Hero 3D filmstrip carousel.
 *
 * Everything here is pure — no DOM, no React — for two reasons. The ring
 * math is the part that's easy to get subtly wrong (an off-by-one in the
 * wrap makes an empty gap sweep through the ring once per revolution), so
 * it's the part worth unit-testing. And the render loop runs on every
 * animation frame: keeping it as plain arithmetic that writes straight to
 * element styles avoids a React re-render per frame.
 *
 * Card sizing lives here too, not in CSS. The 3D layout needs the card
 * width in JS anyway (it sets the ring's angular step and the drag
 * sensitivity), and the demo this was built from carried a standing
 * "FRAME_W must match --frame-w" comment precisely because the two copies
 * drift. The component writes these numbers out as CSS custom properties
 * instead, so JS stays the single source of truth.
 */

/**
 * Fallback slide aspect (height ÷ width): 3:4 portrait, the old 1080×1440
 * asset spec. Used only until the real images report their own dimensions,
 * and for the placeholder frames, which have no image to measure.
 */
export const SLIDE_ASPECT = 4 / 3;

/**
 * Bounds on a measured aspect. A card is a fixed width, so this is really
 * a bound on its height: below 0.5 it's a letterbox strip, above 2 it's a
 * tower taller than the panel. Anything outside is a broken or wrongly
 * exported asset, and the ring should not deform to accommodate it.
 */
export const MIN_SLIDE_ASPECT = 0.5;
export const MAX_SLIDE_ASPECT = 2;

/**
 * Picks the one aspect every card will use, from the aspects of the images
 * actually loaded.
 *
 * One shared ratio rather than a per-card one, deliberately: the cards sit
 * on a ring at a common radius, and giving each its own height makes the
 * arc ragged and leaves the stage's min-height chasing whichever card
 * happens to be tallest. A single ratio keeps the ring even.
 *
 * The MEDIAN, not the mean: these are product shots from one shoot, so the
 * ratios are near-identical and the median lands exactly on them. If one
 * asset is exported wrong, the median ignores it where an average would
 * let it drag every card off the correct shape.
 */
export function pickSlideAspect(aspects: readonly number[]): number {
  const usable = aspects
    .filter(
      a => Number.isFinite(a) && a >= MIN_SLIDE_ASPECT && a <= MAX_SLIDE_ASPECT
    )
    .sort((a, b) => a - b);

  if (usable.length === 0) return SLIDE_ASPECT;

  const mid = Math.floor(usable.length / 2);
  return usable.length % 2 === 1
    ? usable[mid]
    : (usable[mid - 1] + usable[mid]) / 2;
}

/**
 * Ring positions to fill. Below this the visible arc has holes in it at
 * the sides, so fewer images than this get repeated around the ring.
 */
export const MIN_RING_SLOTS = 8;

/**
 * Distance between adjacent card centers, measured along the ring's arc,
 * in card widths. Slightly over 1 so neighbours sit shoulder to shoulder
 * with a sliver of gap rather than overlapping.
 */
export const RING_SPACING = 1.1;

export interface HeroLayout {
  /** Largest viewport width (inclusive) this layout applies to. */
  readonly maxWidth: number;
  /** Center card width in px at full scale. */
  readonly cardW: number;
  /** Ring radius in px — smaller pulls the side cards in and around. */
  readonly radius: number;
  /** CSS `perspective` for the stage. */
  readonly perspective: number;
  /**
   * Blur applied to the farthest cards, in px. 0 disables the filter
   * entirely (side cards fall back to opacity + scale alone).
   */
  readonly maxBlurPx: number;
  /** Peak cursor-parallax tilt of the whole ring, in degrees. */
  readonly parallaxDeg: number;
  /** Falling light-beam particles to render. */
  readonly particleCount: number;
}

/**
 * Ordered narrowest -> widest; the first entry whose maxWidth fits wins.
 *
 * maxBlurPx is 0 for both mobile layouts on purpose. A blur() filter on a
 * dozen elements that are transforming every frame can't be composited —
 * the browser re-rasterizes each card per frame — and this site has
 * already had to walk back scroll-jank from an animated blur (see the
 * .orb notes in index.css). Depth on small screens comes from scale and
 * opacity only. Particle counts drop for the same reason.
 */
export const HERO_LAYOUTS: readonly HeroLayout[] = [
  {
    maxWidth: 380,
    cardW: 196,
    radius: 250,
    perspective: 900,
    maxBlurPx: 0,
    parallaxDeg: 0,
    particleCount: 10,
  },
  {
    maxWidth: 640,
    cardW: 232,
    radius: 300,
    perspective: 1000,
    maxBlurPx: 0,
    parallaxDeg: 0,
    particleCount: 14,
  },
  {
    maxWidth: 1024,
    cardW: 264,
    radius: 520,
    perspective: 1400,
    maxBlurPx: 4,
    parallaxDeg: 4,
    particleCount: 20,
  },
  {
    maxWidth: Infinity,
    cardW: 300,
    radius: 640,
    perspective: 1600,
    maxBlurPx: 6,
    parallaxDeg: 6,
    particleCount: 26,
  },
];

export function pickLayout(viewportWidth: number): HeroLayout {
  return (
    HERO_LAYOUTS.find(l => viewportWidth <= l.maxWidth) ??
    HERO_LAYOUTS[HERO_LAYOUTS.length - 1]
  );
}

/** Card height derived from the width, so the frame is always 3:4. */
/**
 * Card height from its width and the slide aspect.
 *
 * Width is what stays fixed and height is what moves. That's the whole
 * reason this change doesn't disturb the carousel: ringAngleStep() derives
 * the angular gap between cards from cardW and radius ONLY, so changing
 * the height cannot make neighbours overlap or open a gap in the arc.
 */
export function cardHeight(
  cardW: number,
  aspect: number = SLIDE_ASPECT
): number {
  return Math.round(cardW * aspect);
}

/**
 * Degrees between adjacent cards, derived from how far apart they need to
 * sit along the arc. Clamped: below ~18° the cards stack on top of each
 * other, above ~52° the neighbours turn so far edge-on they read as
 * slivers rather than images.
 */
export function ringAngleStep(cardW: number, radius: number): number {
  const deg = ((cardW * RING_SPACING) / radius) * (180 / Math.PI);
  return Math.min(52, Math.max(18, deg));
}

export interface RingSlot<T> {
  /** Position around the ring, 0..total-1. */
  readonly slotIndex: number;
  /** Which source image fills it. */
  readonly imageIndex: number;
  readonly image: T;
}

/**
 * Lays the source images out around the ring, repeating them when there
 * are fewer than MIN_RING_SLOTS.
 *
 * The repeat count is a whole number of passes, never a partial one, so
 * the total is always a multiple of the image count. That's what keeps
 * the wrap seamless: with 7 images in 8 slots the ring would read
 * 1..7,1 and you'd see the same image twice side by side at the seam,
 * whereas 14 slots read 1..7,1..7 and the sequence just continues.
 */
export function buildRingSlots<T>(
  images: readonly T[],
  minSlots = MIN_RING_SLOTS
): RingSlot<T>[] {
  if (images.length === 0) return [];
  const passes = Math.max(1, Math.ceil(minSlots / images.length));
  const slots: RingSlot<T>[] = [];
  for (let pass = 0; pass < passes; pass++) {
    for (let i = 0; i < images.length; i++) {
      slots.push({ slotIndex: slots.length, imageIndex: i, image: images[i] });
    }
  }
  return slots;
}

/**
 * Signed distance from the focused position to a slot, wrapped to the
 * SHORT way around the ring: always in (-total/2, total/2].
 *
 * This wrap is what makes the loop infinite. A slot that walks off one
 * side re-enters from the other on the next frame, so there's no first
 * or last card and no edge to run out of.
 */
export function ringOffset(
  slotIndex: number,
  focus: number,
  total: number
): number {
  let offset = (((slotIndex - focus) % total) + total) % total;
  if (offset > total / 2) offset -= total;
  return offset;
}

/** How dark the farthest card gets, as a scrim alpha over an opaque card. */
export const MAX_DIM = 0.72;

/** Darkening added per slot of distance from center. */
const DIM_PER_SLOT = 0.22;

export interface SlotVisual {
  readonly x: number;
  readonly z: number;
  readonly rotateY: number;
  readonly scale: number;
  /**
   * Element opacity. 1 across the front of the arc — those cards must
   * stay solid, with nothing of the panel reading through them — then
   * easing to 0 as a card turns into the back of the ring, so the
   * filmstrip dissolves at its edges instead of ending on a hard-edged
   * slab. Depth darkening in between is `dim`.
   */
  readonly opacity: number;
  /**
   * Alpha of the dark scrim laid over the card, 0 at center rising with
   * distance. This is what creates depth now: element opacity would have
   * made the card translucent, which is exactly the washed-out look this
   * replaced.
   */
  readonly dim: number;
  readonly blurPx: number;
  readonly zIndex: number;
}

/**
 * Where a slot sits, and how it reads, given its wrapped offset.
 *
 * Geometry (x, z, rotateY, scale, zIndex) is untouched from the original
 * ring — only the shading changed.
 *
 * Opacity is now purely the edge fade, and it's load-bearing: the back
 * slot is the one about to be recycled round to the front, and if it were
 * still even faintly visible you'd catch it teleporting.
 */
export function slotVisual(
  offset: number,
  total: number,
  opts: { radius: number; angleStep: number; maxBlurPx: number }
): SlotVisual {
  const angle = offset * opts.angleStep;
  const rad = (angle * Math.PI) / 180;
  const dist = Math.abs(offset);

  // Slot-based backstop. The angle fade below is what's actually visible,
  // but this guarantees 0 at the ring's back for ANY geometry — if a very
  // small angular step ever meant the back slot hadn't turned past the
  // fade angle, the recycling hand-off would otherwise be on screen.
  const edge = total / 2 - 1.2;
  const backstop = dist > edge ? Math.max(0, 1 - (dist - edge) * 1.6) : 1;

  return {
    x: Math.sin(rad) * opts.radius,
    z: Math.cos(rad) * opts.radius - opts.radius,
    rotateY: -angle,
    scale: Math.max(0.5, 1 - dist * 0.11),
    opacity: Math.min(edgeFade(angle), backstop),
    dim: Math.min(MAX_DIM, dist * DIM_PER_SLOT),
    blurPx: opts.maxBlurPx * blurRamp(angle),
    zIndex: 100 - Math.round(dist * 10),
  };
}

/** Rotation past which a card begins dissolving into the back of the ring. */
export const FADE_START_DEG = 58;
/** Rotation by which it's gone. Just past the backface cutoff. */
export const FADE_END_DEG = 92;

/**
 * 1 for every card that should render solid, easing to 0 as one turns
 * into the back of the ring.
 *
 * Keyed on rotation for the same reason blurRamp is, and fixing the same
 * mistake. Tying the fade to slot index put the whole fade zone behind
 * the ~90-degree point where backface-visibility already stops painting
 * the card, so nothing on screen ever faded: the outermost visible card
 * sat at full opacity with its border and shadow at full strength, and
 * the filmstrip ended on a hard-edged slab instead of dissolving.
 *
 * The cards at the front stay at exactly 1 — they must not go
 * translucent, which is what made them look washed out before.
 */
export function edgeFade(angleDeg: number): number {
  const turn = Math.abs(angleDeg);
  const t = (turn - FADE_START_DEG) / (FADE_END_DEG - FADE_START_DEG);
  return 1 - Math.min(1, Math.max(0, t));
}

/** Card rotation past which blur starts easing in, in degrees. */
export const BLUR_START_DEG = 45;
/**
 * Rotation at which a card is edge-on and `backface-visibility: hidden`
 * stops painting it — the outer limit of what anyone can actually see.
 */
export const BLUR_END_DEG = 90;

/**
 * 0 for every card that should read sharp, easing to 1 as a card turns
 * away toward the back of the ring.
 *
 * Keyed on the card's ROTATION, not its slot index. Slot index was the
 * obvious choice and it was wrong: how many slots are visible depends on
 * the angular step, which differs per breakpoint and with the number of
 * images. Measured on the real ring, a 12-slot desktop configuration only
 * ever shows three positions per side — everything past ~90 degrees is
 * already hidden by backface-visibility — so an index-based rule put the
 * blur on cards nobody could see, and the effect did nothing at all.
 *
 * Against rotation the rule holds at any breakpoint: the center card and
 * its neighbours are square-on to the viewer and stay perfectly sharp,
 * and only the outermost card, the one turning into the back of the
 * ring, carries blur.
 */
export function blurRamp(angleDeg: number): number {
  const turn = Math.abs(angleDeg);
  const t = (turn - BLUR_START_DEG) / (BLUR_END_DEG - BLUR_START_DEG);
  return Math.min(1, Math.max(0, t));
}

/** Slot nearest the center, normalized into 0..total-1. */
export function activeSlot(focus: number, total: number): number {
  if (total <= 0) return 0;
  return ((Math.round(focus) % total) + total) % total;
}

/**
 * Which SOURCE image is centered. Distinct from activeSlot: when images
 * repeat around the ring, several slots map to the same image, and the
 * counter has to read "03 / 06" against the real images — not against
 * however many slots the repeat happened to produce.
 */
export function activeImageIndex(
  focus: number,
  total: number,
  imageCount: number
): number {
  if (imageCount <= 0) return 0;
  return activeSlot(focus, total) % imageCount;
}

/** 1-based, zero-padded to at least 2 digits: 0 -> "01". */
export function padIndex(index: number): string {
  return String(index + 1).padStart(2, "0");
}

export const PHYSICS = {
  /** Per-frame velocity decay once the drag is released. */
  friction: 0.92,
  /** Below this, the throw is over and the magnet/autoplay takes back over. */
  velocityEpsilon: 0.0005,
  /** Slots per frame while idling. Deliberately barely-perceptible. */
  autoplayStep: 0.004,
  /** Share of the remaining gap closed per frame when snapping. */
  snapStrength: 0.12,
  /** Slots travelled per card-width of pointer drag. */
  dragScale: 0.9,
  /** Velocity added per wheel notch. */
  wheelImpulse: 0.08,
} as const;

export interface FocusState {
  readonly focus: number;
  readonly velocity: number;
}

/**
 * One frame of ring motion. Released throws coast on friction; once
 * they've died out the ring either drifts (autoplay) or is pulled to the
 * nearest card (the magnet). Dragging is driven by pointer deltas
 * instead, so this is a no-op then.
 */
export function stepFocus(
  state: FocusState,
  opts: { dragging: boolean; autoplay: boolean }
): FocusState {
  if (opts.dragging) return state;

  if (Math.abs(state.velocity) > PHYSICS.velocityEpsilon) {
    return {
      focus: state.focus + state.velocity,
      velocity: state.velocity * PHYSICS.friction,
    };
  }
  if (opts.autoplay) {
    return { focus: state.focus + PHYSICS.autoplayStep, velocity: 0 };
  }
  const nearest = Math.round(state.focus);
  return {
    focus: state.focus + (nearest - state.focus) * PHYSICS.snapStrength,
    velocity: 0,
  };
}
