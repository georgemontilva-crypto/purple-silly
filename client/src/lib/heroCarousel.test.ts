import { describe, expect, it } from "vitest";
import {
  HERO_LAYOUTS,
  MIN_RING_SLOTS,
  PHYSICS,
  activeImageIndex,
  activeSlot,
  buildRingSlots,
  cardHeight,
  padIndex,
  pickLayout,
  ringAngleStep,
  ringOffset,
  slotVisual,
  stepFocus,
} from "./heroCarousel";

const DESKTOP = { radius: 640, angleStep: 30, maxBlurPx: 6 };

describe("pickLayout", () => {
  it("picks the narrowest layout that fits the viewport", () => {
    expect(pickLayout(320).maxWidth).toBe(380);
    expect(pickLayout(380).maxWidth).toBe(380);
    expect(pickLayout(381).maxWidth).toBe(640);
    expect(pickLayout(768).maxWidth).toBe(1024);
    expect(pickLayout(1440).maxWidth).toBe(Infinity);
  });

  it("disables blur at and below the 640px mobile breakpoint", () => {
    expect(pickLayout(360).maxBlurPx).toBe(0);
    expect(pickLayout(640).maxBlurPx).toBe(0);
    expect(pickLayout(641).maxBlurPx).toBeGreaterThan(0);
  });

  it("closes the ring radius and grows the card's share of the screen on mobile", () => {
    const mobile = pickLayout(375);
    const desktop = pickLayout(1440);
    expect(mobile.radius).toBeLessThan(desktop.radius);
    expect(mobile.cardW / 375).toBeGreaterThan(desktop.cardW / 1440);
  });

  it("orders layouts by ascending maxWidth so find() can't shadow one", () => {
    const widths = HERO_LAYOUTS.map(l => l.maxWidth);
    expect(widths).toEqual([...widths].sort((a, b) => a - b));
  });
});

describe("cardHeight", () => {
  it("keeps every card 3:4, matching the 1080x1440 asset spec", () => {
    expect(cardHeight(300)).toBe(400);
    expect(cardHeight(1080)).toBe(1440);
    for (const layout of HERO_LAYOUTS) {
      expect(cardHeight(layout.cardW) / layout.cardW).toBeCloseTo(4 / 3, 2);
    }
  });
});

describe("ringAngleStep", () => {
  it("derives roughly the demo's 30deg step from the desktop geometry", () => {
    expect(ringAngleStep(300, 640)).toBeGreaterThan(28);
    expect(ringAngleStep(300, 640)).toBeLessThan(31);
  });

  it("opens the step up as the ring radius closes in", () => {
    expect(ringAngleStep(232, 300)).toBeGreaterThan(ringAngleStep(300, 640));
  });

  it("clamps so cards never stack or turn fully edge-on", () => {
    expect(ringAngleStep(10, 5000)).toBe(18);
    expect(ringAngleStep(5000, 10)).toBe(52);
  });
});

describe("buildRingSlots", () => {
  it("uses the images as-is once there are enough to fill the ring", () => {
    const slots = buildRingSlots(["a", "b", "c", "d", "e", "f", "g", "h"]);
    expect(slots).toHaveLength(8);
    expect(slots.map(s => s.image)).toEqual(["a", "b", "c", "d", "e", "f", "g", "h"]);
  });

  it("repeats whole passes so the total is always a multiple of the image count", () => {
    for (let n = 1; n <= 12; n++) {
      const images = Array.from({ length: n }, (_, i) => i);
      const slots = buildRingSlots(images);
      expect(slots.length % n).toBe(0);
      expect(slots.length).toBeGreaterThanOrEqual(Math.min(MIN_RING_SLOTS, n));
    }
  });

  it("never repeats an image adjacently at the wrap seam", () => {
    for (let n = 1; n <= 12; n++) {
      if (n === 1) continue; // a single image is unavoidably its own neighbour
      const slots = buildRingSlots(Array.from({ length: n }, (_, i) => i));
      for (let i = 0; i < slots.length; i++) {
        const next = slots[(i + 1) % slots.length];
        expect(next.imageIndex).not.toBe(slots[i].imageIndex);
      }
    }
  });

  it("fills the ring from a single image", () => {
    const slots = buildRingSlots(["only"]);
    expect(slots).toHaveLength(MIN_RING_SLOTS);
    expect(slots.every(s => s.imageIndex === 0)).toBe(true);
  });

  it("numbers slots consecutively from 0", () => {
    const slots = buildRingSlots(["a", "b", "c"]);
    expect(slots.map(s => s.slotIndex)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it("returns nothing for no images, leaving placeholders to the caller", () => {
    expect(buildRingSlots([])).toEqual([]);
  });
});

describe("ringOffset", () => {
  it("is zero for the focused slot", () => {
    expect(ringOffset(3, 3, 8)).toBe(0);
  });

  it("takes the short way around rather than counting up to total", () => {
    // Slot 7 is 1 step BEHIND slot 0 on an 8-slot ring, not 7 ahead.
    expect(ringOffset(7, 0, 8)).toBe(-1);
    expect(ringOffset(1, 0, 8)).toBe(1);
    expect(ringOffset(0, 7, 8)).toBe(1);
  });

  it("stays within (-total/2, total/2] for every slot and any focus", () => {
    for (const total of [8, 9, 10, 12, 14]) {
      for (let focus = -20; focus <= 20; focus += 0.25) {
        for (let slot = 0; slot < total; slot++) {
          const offset = ringOffset(slot, focus, total);
          expect(offset).toBeGreaterThan(-total / 2 - 1e-9);
          expect(offset).toBeLessThanOrEqual(total / 2 + 1e-9);
        }
      }
    }
  });

  it("always keeps one slot at the center, so the ring is never empty there", () => {
    for (const total of [8, 9, 12]) {
      for (let focus = 0; focus < total; focus += 0.5) {
        const nearest = Math.min(
          ...Array.from({ length: total }, (_, s) => Math.abs(ringOffset(s, focus, total)))
        );
        expect(nearest).toBeLessThanOrEqual(0.5 + 1e-9);
      }
    }
  });

  it("moves continuously across the wrap instead of jumping", () => {
    // Slot 0 as focus crosses from just under total to just over 0.
    const before = ringOffset(0, 7.99, 8);
    const after = ringOffset(0, 0.01, 8);
    expect(Math.abs(before - after)).toBeLessThan(0.05);
  });
});

describe("slotVisual", () => {
  it("puts the focused card front, center, unrotated and fully opaque", () => {
    const v = slotVisual(0, 8, DESKTOP);
    expect(v.x).toBeCloseTo(0);
    expect(v.z).toBeCloseTo(0);
    expect(v.rotateY).toBe(-0);
    expect(v.scale).toBe(1);
    expect(v.opacity).toBe(1);
    expect(v.blurPx).toBe(0);
  });

  it("mirrors left and right sides", () => {
    const left = slotVisual(-2, 8, DESKTOP);
    const right = slotVisual(2, 8, DESKTOP);
    expect(left.x).toBeCloseTo(-right.x);
    expect(left.z).toBeCloseTo(right.z);
    expect(left.rotateY).toBeCloseTo(-right.rotateY);
    expect(left.scale).toBeCloseTo(right.scale);
    expect(left.opacity).toBeCloseTo(right.opacity);
  });

  it("pushes side cards back, shrinks, dims and blurs them", () => {
    const center = slotVisual(0, 12, DESKTOP);
    const near = slotVisual(1, 12, DESKTOP);
    const far = slotVisual(2, 12, DESKTOP);
    expect(near.z).toBeLessThan(center.z);
    expect(far.z).toBeLessThan(near.z);
    expect(far.scale).toBeLessThan(near.scale);
    expect(far.opacity).toBeLessThan(near.opacity);
    expect(far.blurPx).toBeGreaterThan(near.blurPx);
    expect(far.zIndex).toBeLessThan(near.zIndex);
  });

  it("fades the back of the ring to exactly 0 so recycling is never seen", () => {
    for (const total of [8, 9, 10, 12, 14, 16]) {
      expect(slotVisual(total / 2, total, DESKTOP).opacity).toBe(0);
      expect(slotVisual(-total / 2, total, DESKTOP).opacity).toBe(0);
    }
  });

  it("keeps opacity monotonically non-increasing away from center", () => {
    const total = 12;
    let previous = Infinity;
    for (let offset = 0; offset <= total / 2; offset += 0.25) {
      const { opacity } = slotVisual(offset, total, DESKTOP);
      expect(opacity).toBeLessThanOrEqual(previous + 1e-9);
      previous = opacity;
    }
  });

  it("emits no blur at all when the layout disables it", () => {
    const mobile = { ...DESKTOP, maxBlurPx: 0 };
    for (let offset = 0; offset <= 6; offset += 0.5) {
      expect(slotVisual(offset, 12, mobile).blurPx).toBe(0);
    }
  });

  it("never exceeds the layout's blur ceiling", () => {
    for (let offset = 0; offset <= 8; offset += 0.5) {
      expect(slotVisual(offset, 16, DESKTOP).blurPx).toBeLessThanOrEqual(DESKTOP.maxBlurPx);
    }
  });
});

describe("activeSlot / activeImageIndex", () => {
  it("normalizes negative and overflowing focus values", () => {
    expect(activeSlot(0, 8)).toBe(0);
    expect(activeSlot(8, 8)).toBe(0);
    expect(activeSlot(-1, 8)).toBe(7);
    expect(activeSlot(-9, 8)).toBe(7);
    expect(activeSlot(2.4, 8)).toBe(2);
    expect(activeSlot(2.6, 8)).toBe(3);
  });

  it("counts against the real images, not the repeated slots", () => {
    // 3 images repeated into 9 slots: slot 4 is image 1, not image 4.
    expect(activeImageIndex(4, 9, 3)).toBe(1);
    expect(activeImageIndex(8, 9, 3)).toBe(2);
    expect(activeImageIndex(-1, 9, 3)).toBe(2);
  });

  it("stays in range for every focus value", () => {
    for (const [total, images] of [[8, 1], [9, 3], [10, 5], [12, 6], [14, 7]]) {
      for (let focus = -30; focus <= 30; focus += 0.5) {
        const index = activeImageIndex(focus, total, images);
        expect(index).toBeGreaterThanOrEqual(0);
        expect(index).toBeLessThan(images);
      }
    }
  });

  it("survives an empty ring instead of dividing by zero", () => {
    expect(activeSlot(3, 0)).toBe(0);
    expect(activeImageIndex(3, 0, 0)).toBe(0);
  });
});

describe("padIndex", () => {
  it("is 1-based and zero-padded", () => {
    expect(padIndex(0)).toBe("01");
    expect(padIndex(8)).toBe("09");
    expect(padIndex(11)).toBe("12");
  });
});

describe("stepFocus", () => {
  it("leaves the state alone while dragging", () => {
    const state = { focus: 3.2, velocity: 0.5 };
    expect(stepFocus(state, { dragging: true, autoplay: true })).toBe(state);
  });

  it("coasts on friction after a throw", () => {
    const next = stepFocus({ focus: 0, velocity: 0.5 }, { dragging: false, autoplay: false });
    expect(next.focus).toBeCloseTo(0.5);
    expect(next.velocity).toBeCloseTo(0.5 * PHYSICS.friction);
  });

  it("brings a throw to rest in a finite number of frames", () => {
    let state = { focus: 0, velocity: 1 };
    let frames = 0;
    while (Math.abs(state.velocity) > PHYSICS.velocityEpsilon && frames < 1000) {
      state = stepFocus(state, { dragging: false, autoplay: false });
      frames++;
    }
    expect(frames).toBeLessThan(1000);
  });

  it("magnets to the nearest card once the throw dies out", () => {
    let state = { focus: 3.4, velocity: 0 };
    for (let i = 0; i < 200; i++) state = stepFocus(state, { dragging: false, autoplay: false });
    expect(state.focus).toBeCloseTo(3, 3);
  });

  it("magnets to the nearer neighbour, not always down", () => {
    let state = { focus: 3.7, velocity: 0 };
    for (let i = 0; i < 200; i++) state = stepFocus(state, { dragging: false, autoplay: false });
    expect(state.focus).toBeCloseTo(4, 3);
  });

  it("drifts forward under autoplay instead of snapping", () => {
    const next = stepFocus({ focus: 3, velocity: 0 }, { dragging: false, autoplay: true });
    expect(next.focus).toBeGreaterThan(3);
    expect(next.focus - 3).toBeLessThan(0.01);
  });

  it("advances less than one card per second of autoplay at 60fps", () => {
    let state = { focus: 0, velocity: 0 };
    for (let i = 0; i < 60; i++) state = stepFocus(state, { dragging: false, autoplay: true });
    expect(state.focus).toBeLessThan(1);
  });
});
