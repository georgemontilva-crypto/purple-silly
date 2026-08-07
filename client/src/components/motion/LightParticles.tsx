import { useMemo } from "react";
import { useReducedMotion } from "framer-motion";
import "./LightParticles.css";

/**
 * Fall speed in px/s at the median particle. Speed, not duration, is what
 * the two call sites share: the navbar's strip is a fraction of the
 * hero's height, so a fixed duration would make its motes crawl while the
 * hero's raced, and the two would never read as the same flow. Deriving
 * duration from distance keeps them moving at one pace.
 *
 * 70px/s reproduces the hero's original 4–9s over its ~460px drop.
 */
const BASE_SPEED_PX_PER_S = 70;

export interface LightParticlesProps {
  /** How many motes to render. */
  count: number;
  /** How far each falls before fading out, in px. */
  fallDistance: number;
  /** Consumer class that positions and sizes the field. */
  className?: string;
  /**
   * Shifts the deterministic layout without making it random. Two fields
   * with the same count would otherwise be identical twins — which is
   * exactly what the navbar's two sides would look like. Same inputs still
   * give the same output every render.
   */
  seed?: number;
}

/**
 * The shared falling-light effect: white-to-lavender motes drifting
 * downward, fading in as they enter and out as they go.
 *
 * Deterministic rather than random — re-rendering must not reshuffle the
 * field, and the same inputs give the same layout every time.
 */
export function LightParticles({
  count,
  fallDistance,
  className,
  seed = 0,
}: LightParticlesProps) {
  const reduceMotion = useReducedMotion() ?? false;

  const particles = useMemo(() => {
    if (reduceMotion) return [];
    return Array.from({ length: count }, (_, index) => {
      const i = index + seed;
      // 0.7–1.5, so motes don't descend in lockstep.
      const speedJitter = 0.7 + ((i * 0.23) % 0.8);
      const duration = fallDistance / (BASE_SPEED_PX_PER_S * speedJitter);
      return {
        left: 8 + ((i * 37) % 84),
        size: 2 + ((i * 0.9) % 2.4),
        duration,
        // Negative delay starts each one mid-flight, so the field is
        // already populated on the first frame instead of raining in.
        delay: -((i * 0.63) % duration),
      };
    });
  }, [count, fallDistance, reduceMotion, seed]);

  return (
    <div
      className={`light-particles${className ? ` ${className}` : ""}`}
      style={
        { "--lp-fall-distance": `${fallDistance}px` } as React.CSSProperties
      }
      aria-hidden="true"
    >
      {particles.map((p, i) => (
        <span
          key={i}
          className="light-particle"
          style={{
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationDuration: `${p.duration.toFixed(2)}s`,
            animationDelay: `${p.delay.toFixed(2)}s`,
          }}
        />
      ))}
    </div>
  );
}
