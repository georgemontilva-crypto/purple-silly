import { useEffect, useRef } from "react";

const PARTICLE_COUNT = 24;
const TRAIL_LENGTH = 7;

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  trail: { x: number; y: number }[];
}

/**
 * Desktop-only glow zone integrated into the navbar's right side: a dark
 * purple gradient concentrated at the right edge, fading to nothing toward
 * the center, with small particles drifting through it. Trails are drawn as
 * a short history of fading-opacity circles per particle — no blur filter,
 * no backdrop-filter, so nothing here forces a repaint on scroll.
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

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const particles: Particle[] = Array.from({ length: PARTICLE_COUNT }, () => {
      const x = Math.random() * width;
      const y = Math.random() * height;
      return {
        x,
        y,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.12,
        size: 0.8 + Math.random() * 1.6,
        alpha: 0.4 + Math.random() * 0.5,
        trail: Array.from({ length: TRAIL_LENGTH }, () => ({ x, y })),
      };
    });

    let raf = 0;
    function frame() {
      ctx!.clearRect(0, 0, width, height);
      for (const p of particles) {
        if (!reduced) {
          p.trail.push({ x: p.x, y: p.y });
          p.trail.shift();
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0 || p.x > width) p.vx *= -1;
          if (p.y < 0 || p.y > height) p.vy *= -1;
        }
        p.trail.forEach((pos, i) => {
          const trailAlpha = p.alpha * ((i + 1) / TRAIL_LENGTH) * 0.5;
          ctx!.beginPath();
          ctx!.arc(pos.x, pos.y, p.size, 0, Math.PI * 2);
          ctx!.fillStyle = `rgba(233,213,255,${trailAlpha})`;
          ctx!.fill();
        });
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(233,213,255,${p.alpha})`;
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
