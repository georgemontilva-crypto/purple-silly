import { useEffect, useRef } from "react";

const PARTICLE_COUNT = 22;
const TRAIL_LENGTH = 7;
// Particles die at this fraction of the width (measured from the right
// edge) — they never reach the center, matching the light source being
// anchored to the right.
const DEATH_FRACTION = 0.55;

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  baseAlpha: number;
  trail: { x: number; y: number }[];
}

function spawn(width: number, height: number): Particle {
  const x = width - Math.random() * width * 0.25;
  const y = Math.random() * height;
  return {
    x,
    y,
    vx: -(0.35 + Math.random() * 0.55),
    vy: (Math.random() - 0.5) * 0.12,
    size: 0.8 + Math.random() * 1.6,
    baseAlpha: 0.45 + Math.random() * 0.45,
    trail: Array.from({ length: TRAIL_LENGTH }, () => ({ x, y })),
  };
}

/**
 * Desktop-only glow zone integrated into the navbar's right side: a dark
 * purple gradient concentrated at the right edge, fading to nothing toward
 * the center, with sparks flowing right-to-left through it — emitted from
 * the right edge, drifting left, fading out and dying before reaching the
 * center (never a static, evenly-scattered field). Trails are drawn as a
 * short history of fading-opacity circles — no blur filter, no
 * backdrop-filter, so nothing here forces a repaint on scroll.
 */
export function NavbarGlow() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    let width = 0;
    let height = 0;
    let deathX = 0;

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      deathX = width * (1 - DEATH_FRACTION);
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const particles: Particle[] = Array.from({ length: PARTICLE_COUNT }, () => spawn(width, height));

    // How far along its right-edge -> death-point journey a particle is,
    // as a 1 (just spawned, full brightness) -> 0 (at/past death, invisible)
    // fade multiplier.
    function lifeFade(p: Particle): number {
      const span = width - deathX;
      if (span <= 0) return 0;
      return Math.max(0, Math.min(1, (p.x - deathX) / span));
    }

    let raf = 0;
    function frame() {
      ctx!.clearRect(0, 0, width, height);
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (!reduced) {
          p.trail.push({ x: p.x, y: p.y });
          p.trail.shift();
          p.x += p.vx;
          p.y += p.vy;
          if (p.x <= deathX || p.y < 0 || p.y > height) {
            particles[i] = spawn(width, height);
            continue;
          }
        }
        const fade = lifeFade(p);
        if (fade <= 0) continue;
        p.trail.forEach((pos, idx) => {
          const trailAlpha = p.baseAlpha * fade * ((idx + 1) / TRAIL_LENGTH) * 0.5;
          ctx!.beginPath();
          ctx!.arc(pos.x, pos.y, p.size, 0, Math.PI * 2);
          ctx!.fillStyle = `rgba(233,213,255,${trailAlpha})`;
          ctx!.fill();
        });
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(233,213,255,${p.baseAlpha * fade})`;
        ctx!.fill();
      }
      raf = requestAnimationFrame(frame);
    }
    frame();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

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
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />
    </div>
  );
}
