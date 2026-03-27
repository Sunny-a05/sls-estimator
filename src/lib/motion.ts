/**
 * Motion system — Prodigy-level Framer Motion variants & easing curves.
 *
 * Design DNA extracted from:
 *   - formless.xyz: dark luxury, restrained palette, slow confident motion
 *   - osmo.supply:  staggered reveals, custom cubic-bezier, asymmetric timing
 *   - Apple product pages: word-by-word reveals, blur-to-sharp, parallax
 *   - Tesla configurator: magnetic interactions, spring physics
 *
 * Rules:
 *   1. Never use default `ease` or `linear` — always custom cubic-bezier
 *   2. Exit animations are 40-50% faster than entrances (responsive → graceful)
 *   3. Small translation distances (20-40px, not 100px) — emergence, not flying
 *   4. Opacity ALWAYS accompanies translation — softens every motion
 *   5. Blur transitions add cinematic depth — use sparingly
 *   6. Springs for interactive elements, easing for reveals
 */

import type { Variants, Transition } from "framer-motion";

// ── Custom easing curves ──
export const ease = {
  /** Smooth deceleration — the workhorse curve */
  smooth: [0.25, 0.1, 0.25, 1.0] as const,
  /** Symmetric smooth in-out */
  smoothInOut: [0.76, 0, 0.24, 1] as const,
  /** Snappy — fast start, smooth landing */
  snappy: [0.19, 1, 0.22, 1] as const,
  /** Soft bounce — for playful elements only */
  bounceSoft: [0.34, 1.56, 0.64, 1] as const,
  /** Snap — for layout morphing */
  snap: [0.4, 0, 0, 1] as const,
  /** Cinematic — slow start, dramatic deceleration */
  cinematic: [0.16, 1, 0.3, 1] as const,
  /** Elastic — for attention-grabbing elements */
  elastic: [0.68, -0.55, 0.27, 1.55] as const,
};

// ── Fade Up — the workhorse animation ──
export const fadeUp: Variants = {
  initial: { opacity: 0, y: 24 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: ease.smooth },
  },
  exit: {
    opacity: 0,
    y: -12,
    transition: { duration: 0.35, ease: ease.smoothInOut },
  },
};

// ── Blur Fade Up — cinematic hero entrance ──
export const blurFadeUp: Variants = {
  initial: { opacity: 0, y: 32, filter: "blur(12px)" },
  animate: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.9, ease: ease.cinematic },
  },
  exit: {
    opacity: 0,
    y: -16,
    filter: "blur(6px)",
    transition: { duration: 0.4, ease: ease.smoothInOut },
  },
};

// ── Blur Fade In (no translation, pure blur-to-sharp) ──
export const blurFadeIn: Variants = {
  initial: { opacity: 0, filter: "blur(16px)" },
  animate: {
    opacity: 1,
    filter: "blur(0px)",
    transition: { duration: 1.0, ease: ease.cinematic },
  },
  exit: {
    opacity: 0,
    filter: "blur(8px)",
    transition: { duration: 0.4, ease: ease.smoothInOut },
  },
};

// ── Fade In (no translation) ──
export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.5, ease: ease.smooth },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.25, ease: ease.smoothInOut },
  },
};

// ── Scale Fade — for cards, modals, overlays ──
export const scaleFade: Variants = {
  initial: { opacity: 0, scale: 0.92 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: ease.cinematic },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    transition: { duration: 0.3, ease: ease.smoothInOut },
  },
};

// ── Scale Blur — dramatic card/modal entrance (scale + blur combo) ──
export const scaleBlur: Variants = {
  initial: { opacity: 0, scale: 0.88, filter: "blur(8px)" },
  animate: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: ease.cinematic },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    filter: "blur(4px)",
    transition: { duration: 0.35, ease: ease.smoothInOut },
  },
};

// ── Slide Right — for sidebar elements ──
export const slideRight: Variants = {
  initial: { opacity: 0, x: -20, filter: "blur(4px)" },
  animate: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: ease.cinematic },
  },
  exit: {
    opacity: 0,
    x: -10,
    filter: "blur(2px)",
    transition: { duration: 0.3, ease: ease.smoothInOut },
  },
};

// ── Slide Up Rotate — dramatic entrance with slight rotation ──
export const slideUpRotate: Variants = {
  initial: { opacity: 0, y: 40, rotate: 2 },
  animate: {
    opacity: 1,
    y: 0,
    rotate: 0,
    transition: { duration: 0.8, ease: ease.cinematic },
  },
  exit: {
    opacity: 0,
    y: -20,
    rotate: -1,
    transition: { duration: 0.4, ease: ease.smoothInOut },
  },
};

// ── Draw Line — for decorative lines/dividers ──
export const drawLine: Variants = {
  initial: { scaleX: 0, originX: 0 },
  animate: {
    scaleX: 1,
    transition: { duration: 1.2, ease: ease.cinematic },
  },
};

// ── Number Reveal — dramatic large number entrance ──
export const numberReveal: Variants = {
  initial: { opacity: 0, y: 60, scale: 0.7, filter: "blur(10px)" },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 1.0, ease: ease.cinematic },
  },
};

// ── Icon Pop — spring-based icon entrance ──
export const iconPop: Variants = {
  initial: { opacity: 0, scale: 0, rotate: -30 },
  animate: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 15,
      mass: 0.6,
    },
  },
};

// ── Staggered Container ──
export const stagger = (staggerDelay = 0.08, delayChildren = 0.1): Variants => ({
  initial: {},
  animate: {
    transition: {
      staggerChildren: staggerDelay,
      delayChildren,
    },
  },
});

// ── Word-by-word stagger (for headline text) ──
export const wordStagger = (staggerDelay = 0.06, delayChildren = 0.2): Variants => ({
  initial: {},
  animate: {
    transition: {
      staggerChildren: staggerDelay,
      delayChildren,
    },
  },
});

// ── Single word reveal (used inside wordStagger container) ──
export const wordReveal: Variants = {
  initial: {
    opacity: 0,
    y: 20,
    filter: "blur(8px)",
    rotateX: 40,
  },
  animate: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    rotateX: 0,
    transition: { duration: 0.6, ease: ease.cinematic },
  },
};

// ── Character reveal (for micro-text, taglines) ──
export const charReveal: Variants = {
  initial: { opacity: 0, x: -4 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: ease.smooth },
  },
};

// ── Number/value spring transition ──
export const countTransition: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 30,
  mass: 0.8,
};

// ── Magnetic spring (for interactive hover states) ──
export const magneticSpring: Transition = {
  type: "spring",
  stiffness: 350,
  damping: 20,
  mass: 0.5,
};

// ── Viewport config for whileInView ──
export const viewportOnce = { once: true, margin: "-80px" as const };
export const viewportEager = { once: true, margin: "-20px" as const };

// ── Page / step transition (for AnimatePresence mode="wait") ──
export const pageTransition: Variants = {
  initial: { opacity: 0, y: 20, filter: "blur(6px)" },
  animate: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: ease.smooth },
  },
  exit: {
    opacity: 0,
    y: -10,
    filter: "blur(4px)",
    transition: { duration: 0.3, ease: ease.snap },
  },
};
