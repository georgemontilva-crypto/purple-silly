import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAnimationFrame, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useHeroLayout } from "@/hooks/useHeroLayout";
import {
  MIN_RING_SLOTS,
  PHYSICS,
  activeImageIndex,
  buildRingSlots,
  cardHeight,
  padIndex,
  ringAngleStep,
  ringOffset,
  slotVisual,
  stepFocus,
} from "@/lib/heroCarousel";

export interface HeroSlide {
  id: number | string;
  url: string;
  label: string;
}

/** Ceiling on wheel/throw velocity, in ring slots per frame. */
const MAX_VELOCITY = 0.6;

/** Stand-ins with their target size labelled, until images are uploaded. */
const PLACEHOLDER_SLIDES: HeroSlide[] = Array.from({ length: MIN_RING_SLOTS }, (_, i) => ({
  id: `placeholder-${i}`,
  url: "",
  label: `Imagen ${i + 1}`,
}));

/**
 * The 3D filmstrip itself: a ring of cards in perspective, the centered
 * one large and sharp, the rest rotated away, smaller, dimmer and (on
 * desktop) blurred.
 *
 * The loop is infinite in the real sense — there is no first or last
 * card. Each slot's position is computed from its wrapped offset to the
 * focused point, so a card leaving one side re-enters from the other on
 * the very next frame, and the back of the ring is held at opacity 0 so
 * the hand-off is never visible. Fewer images than ring slots get
 * repeated in whole passes to fill it (see buildRingSlots).
 *
 * Renders as two grid children — the stage and the controls — so the
 * panel's row template can keep the cards out of the logo and control
 * safe zones. That's why it returns a fragment.
 */
export default function HeroCarousel({
  slides,
  active,
}: {
  slides: HeroSlide[];
  /** False while the hero is scrolled out of view: the loop idles. */
  active: boolean;
}) {
  const layout = useHeroLayout();
  const reduceMotion = useReducedMotion() ?? false;

  const source = slides.length > 0 ? slides : PLACEHOLDER_SLIDES;
  const isPlaceholder = slides.length === 0;
  const ringSlots = useMemo(() => buildRingSlots(source), [source]);
  const total = ringSlots.length;
  const angleStep = useMemo(
    () => ringAngleStep(layout.cardW, layout.radius),
    [layout.cardW, layout.radius]
  );

  const stageRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Ring state lives in refs, not React state: it changes every frame,
  // and a re-render per frame is exactly what this needs to avoid.
  const focusRef = useRef(0);
  const velocityRef = useRef(0);
  const draggingRef = useRef(false);
  const lastXRef = useRef(0);
  const hoverRef = useRef(false);
  const tiltRef = useRef({ x: 0, y: 0 });
  // Cached so pointermove never forces a layout read mid-gesture.
  const stageRectRef = useRef<DOMRect | null>(null);

  // The one piece of ring state React renders: the counter.
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const measure = () => {
      stageRectRef.current = stageRef.current?.getBoundingClientRect() ?? null;
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useAnimationFrame(() => {
    if (!active || total === 0) return;

    if (reduceMotion) {
      // No inertia, no drift: settle on whole cards immediately.
      if (!draggingRef.current) {
        focusRef.current = Math.round(focusRef.current);
        velocityRef.current = 0;
      }
    } else {
      const next = stepFocus(
        { focus: focusRef.current, velocity: velocityRef.current },
        {
          dragging: draggingRef.current,
          autoplay: !hoverRef.current && !draggingRef.current,
        }
      );
      focusRef.current = next.focus;
      velocityRef.current = next.velocity;
    }

    const focus = focusRef.current;
    for (let i = 0; i < total; i++) {
      const el = cardRefs.current[i];
      if (!el) continue;
      const v = slotVisual(ringOffset(i, focus, total), total, {
        radius: layout.radius,
        angleStep,
        maxBlurPx: layout.maxBlurPx,
      });
      el.style.transform =
        `translate(-50%, -50%) translate3d(${v.x.toFixed(2)}px, 0, ${v.z.toFixed(2)}px) ` +
        `rotateY(${v.rotateY.toFixed(2)}deg) scale(${v.scale.toFixed(3)})`;
      el.style.opacity = v.opacity.toFixed(3);
      // Cleared rather than left stale, so shrinking past the mobile
      // breakpoint actually drops the filter instead of freezing it.
      el.style.filter = layout.maxBlurPx > 0 ? `blur(${v.blurPx.toFixed(1)}px)` : "";
      el.style.zIndex = String(v.zIndex);
    }

    if (trackRef.current) {
      const { x, y } = tiltRef.current;
      trackRef.current.style.transform =
        `rotateY(${(x * layout.parallaxDeg).toFixed(2)}deg) ` +
        `rotateX(${(-y * layout.parallaxDeg * 0.85).toFixed(2)}deg)`;
    }

    const index = activeImageIndex(focus, total, source.length);
    setCurrent(prev => (prev === index ? prev : index));
  });

  const step = useCallback((direction: 1 | -1) => {
    velocityRef.current = 0;
    focusRef.current = Math.round(focusRef.current) + direction;
  }, []);

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    draggingRef.current = true;
    lastXRef.current = e.clientX;
    velocityRef.current = 0;
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (layout.parallaxDeg > 0 && !reduceMotion) {
      const rect = stageRectRef.current;
      if (rect && rect.width > 0) {
        tiltRef.current = {
          x: ((e.clientX - rect.left) / rect.width - 0.5) * 2,
          y: ((e.clientY - rect.top) / rect.height - 0.5) * 2,
        };
      }
    }
    if (!draggingRef.current) return;
    const dx = e.clientX - lastXRef.current;
    lastXRef.current = e.clientX;
    const delta = (-dx / layout.cardW) * PHYSICS.dragScale;
    focusRef.current += delta;
    velocityRef.current = delta;
  }

  function endDrag(e: React.PointerEvent<HTMLDivElement>) {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  }

  /**
   * Deliberately passive — no preventDefault. The reference demo swallowed
   * every wheel event over the hero, which traps the page: with the hero
   * filling the top of the viewport you could never scroll past it. Here
   * the ring responds to the wheel and the page still scrolls normally.
   */
  function handleWheel(e: React.WheelEvent<HTMLDivElement>) {
    if (reduceMotion) return;
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (delta === 0) return;
    velocityRef.current = Math.max(
      -MAX_VELOCITY,
      Math.min(MAX_VELOCITY, velocityRef.current + Math.sign(delta) * PHYSICS.wheelImpulse)
    );
  }

  /**
   * Scoped to the focused stage rather than the window. A global arrow-key
   * listener would hijack the keys for the whole page — including from
   * anyone using them to scroll or to move through a form further down.
   */
  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      step(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      step(-1);
    }
  }

  const stageStyle = {
    "--hc-card-w": `${layout.cardW}px`,
    "--hc-card-h": `${cardHeight(layout.cardW)}px`,
    "--hc-perspective": `${layout.perspective}px`,
  } as React.CSSProperties;

  return (
    <>
      <div
        ref={stageRef}
        className="hero-stage"
        style={stageStyle}
        role="region"
        aria-roledescription="carrusel"
        aria-label="Galería de productos Silly Dots"
        tabIndex={0}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerEnter={e => {
          if (e.pointerType === "mouse") hoverRef.current = true;
        }}
        onPointerLeave={e => {
          if (e.pointerType === "mouse") hoverRef.current = false;
          tiltRef.current = { x: 0, y: 0 };
        }}
        onWheel={handleWheel}
        onKeyDown={handleKeyDown}
      >
        <div ref={trackRef} className="hero-track" data-hc-active={active && !reduceMotion}>
          {ringSlots.map((slot, i) => (
            <div
              key={`${slot.image.id}-${i}`}
              ref={el => {
                cardRefs.current[i] = el;
              }}
              className={`hero-card${isPlaceholder ? " hero-card--placeholder" : ""}`}
              aria-hidden={slot.imageIndex !== current}
            >
              {isPlaceholder ? (
                <>
                  <svg className="hero-card__icon" viewBox="0 0 24 24" aria-hidden="true">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="M21 15l-5-5L5 21" />
                  </svg>
                  <div className="hero-card__num">{padIndex(slot.imageIndex)}</div>
                  <div className="hero-card__label">{slot.image.label}</div>
                  <div className="hero-card__dim">1080 × 1440 px</div>
                </>
              ) : (
                <img
                  className="hero-card__img"
                  src={slot.image.url}
                  alt={slot.image.label}
                  draggable={false}
                  decoding="async"
                  /* The first slide is the one on screen at load, above
                     the fold — lazy-loading it would leave a visible
                     blank card. Everything else waits. */
                  loading={i === 0 ? "eager" : "lazy"}
                  width={1080}
                  height={1440}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="hero-controls">
        <button
          type="button"
          className="hero-controls__btn"
          onClick={() => step(-1)}
          aria-label="Imagen anterior"
        >
          <ChevronLeft size={20} aria-hidden="true" />
        </button>
        <span className="hero-controls__counter" aria-live="polite">
          {padIndex(current)} / {padIndex(source.length - 1)}
        </span>
        <button
          type="button"
          className="hero-controls__btn"
          onClick={() => step(1)}
          aria-label="Imagen siguiente"
        >
          <ChevronRight size={20} aria-hidden="true" />
        </button>
      </div>
    </>
  );
}
