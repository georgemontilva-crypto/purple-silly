import { motion } from "framer-motion";
import { useMemo } from "react";

const COUNT = 22;

function useBurstParticles() {
  return useMemo(
    () =>
      Array.from({ length: COUNT }, (_, i) => {
        const angle = (Math.PI * 2 * i) / COUNT + Math.random() * 0.35;
        const distance = 70 + Math.random() * 160;
        return {
          id: i,
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance,
          size: 3 + Math.random() * 5,
          delay: Math.random() * 0.12,
          duration: 0.7 + Math.random() * 0.5,
        };
      }),
    []
  );
}

/**
 * One-shot burst of purple sparks, fired from mount (parent controls
 * mounting so this only ever plays once per opening — see MobileMenu, which
 * unmounts this entirely by returning null while closed).
 */
export function ParticleBurst({ originX = "50%", originY = "50%" }: { originX?: string; originY?: string }) {
  const particles = useBurstParticles();
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }} aria-hidden="true">
      {particles.map(p => (
        <motion.span
          key={p.id}
          style={{
            position: "absolute",
            left: originX,
            top: originY,
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(233,213,255,0.95) 0%, rgba(168,85,247,0.65) 70%, transparent 100%)",
          }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 0.6 }}
          animate={{ x: p.x, y: p.y, opacity: 0, scale: 1 }}
          transition={{ duration: p.duration, delay: p.delay, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}
