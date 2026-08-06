import { motion, type Variants } from "framer-motion";
import type { CSSProperties, ReactNode } from "react";

// prefers-reduced-motion is handled globally via <MotionConfig reducedMotion="user">
// in App.tsx — no per-component check needed here.

// Exported so components that need `motion.div` directly (custom style props,
// non-div tags, etc.) can still use the same fade + slide-up variant.
export const revealItemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const item = revealItemVariants;

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

type RevealProps = { children: ReactNode; className?: string; style?: CSSProperties };

/** Fades + slides a single block in once it enters the viewport. */
export function Reveal({ children, className, style }: RevealProps) {
  return (
    <motion.div
      className={className}
      style={style}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={item}
    >
      {children}
    </motion.div>
  );
}

/** Wrap a group of <RevealItem> children to stagger their entrance slightly. */
export function RevealStagger({ children, className, style }: RevealProps) {
  return (
    <motion.div
      className={className}
      style={style}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      variants={container}
    >
      {children}
    </motion.div>
  );
}

/** A single staggered element — must be a direct/nested child of <RevealStagger>. */
export function RevealItem({ children, className, style }: RevealProps) {
  return (
    <motion.div className={className} style={style} variants={item}>
      {children}
    </motion.div>
  );
}
