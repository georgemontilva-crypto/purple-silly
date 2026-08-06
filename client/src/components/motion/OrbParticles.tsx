import { useEffect, useRef } from "react";

const SIZE = 56;
const PARTICLE_COUNT = 22;

interface Particle {
  angle: number;
  radius: number;
  speed: number;
  size: number;
  alpha: number;
  wobble: number;
}

/**
 * Desktop-only decorative glow orb + slow-floating sparks for the navbar's
 * right side. Plain canvas, no dependency — cheap enough for ~20 particles
 * in a 56x56 box. Gate rendering with useIsMobile() at the call site so this
 * never mounts (and never runs its rAF loop) under the md breakpoint.
 */
export function OrbParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = SIZE * dpr;
    canvas.height = SIZE * dpr;
    ctx.scale(dpr, dpr);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const center = SIZE / 2;

    const particles: Particle[] = Array.from({ length: PARTICLE_COUNT }, () => ({
      angle: Math.random() * Math.PI * 2,
      radius: 11 + Math.random() * 13,
      speed: (0.4 + Math.random() * 0.5) * (Math.random() < 0.5 ? 1 : -1),
      size: 0.8 + Math.random() * 1.5,
      alpha: 0.35 + Math.random() * 0.5,
      wobble: Math.random() * Math.PI * 2,
    }));

    function drawGlow() {
      const gradient = ctx!.createRadialGradient(center, center, 0, center, center, center);
      gradient.addColorStop(0, "rgba(216,180,254,0.85)");
      gradient.addColorStop(0.35, "rgba(168,85,247,0.55)");
      gradient.addColorStop(1, "rgba(168,85,247,0)");
      ctx!.fillStyle = gradient;
      ctx!.beginPath();
      ctx!.arc(center, center, center, 0, Math.PI * 2);
      ctx!.fill();
    }

    function drawParticle(p: Particle) {
      const wobbleR = p.radius + Math.sin(p.wobble) * 2;
      const x = center + Math.cos(p.angle) * wobbleR;
      const y = center + Math.sin(p.angle) * wobbleR;
      ctx!.beginPath();
      ctx!.arc(x, y, p.size, 0, Math.PI * 2);
      ctx!.fillStyle = `rgba(233,213,255,${p.alpha})`;
      ctx!.fill();
    }

    let raf = 0;
    function frame() {
      ctx!.clearRect(0, 0, SIZE, SIZE);
      drawGlow();
      for (const p of particles) {
        if (!reduced) {
          p.angle += p.speed * 0.01;
          p.wobble += 0.02;
        }
        drawParticle(p);
      }
      raf = requestAnimationFrame(frame);
    }
    frame();

    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: SIZE, height: SIZE, display: "block", pointerEvents: "none" }}
      aria-hidden="true"
    />
  );
}
