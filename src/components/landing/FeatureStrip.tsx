"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { scaleBlur, iconPop, blurFadeUp, stagger, viewportOnce, ease } from "@/lib/motion";

const FEATURES = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
    title: "3D File Parsing",
    description: "Upload STL, OBJ, PLY, or 3MF files. Auto-detect units, compute volume, and visualize in real-time.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    title: "Calibrated Estimates",
    description: "Time and cost predictions calibrated against real Fuse 1+ builds with <5% RMSE accuracy.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="9" y1="21" x2="9" y2="9" />
      </svg>
    ),
    title: "Batch Optimizer",
    description: "Multi-part builds with automatic bin packing, optimal batch scheduling, and per-part costing.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
    title: "Material Finder",
    description: "Score and rank 26 SLS powders against your mechanical requirements — tensile, HDT, elongation, and more.",
  },
];

/** 3D tilt card with magnetic mouse-follow effect */
function TiltCard({
  children,
  className = "",
  index,
}: {
  children: React.ReactNode;
  className?: string;
  index: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [6, -6]), {
    stiffness: 300,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-6, 6]), {
    stiffness: 300,
    damping: 20,
  });
  const glowX = useSpring(useTransform(mouseX, [-0.5, 0.5], [0, 100]), {
    stiffness: 200,
    damping: 25,
  });
  const glowY = useSpring(useTransform(mouseY, [-0.5, 0.5], [0, 100]), {
    stiffness: 200,
    damping: 25,
  });

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      variants={scaleBlur}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformPerspective: 800,
        transformStyle: "preserve-3d",
      }}
      custom={index}
      className={`relative ${className}`}
    >
      {/* Glow follow */}
      <motion.div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: useTransform(
            [glowX, glowY],
            ([x, y]) =>
              `radial-gradient(circle at ${x}% ${y}%, rgba(200,16,46,0.06) 0%, transparent 60%)`
          ),
        }}
      />
      {children}
    </motion.div>
  );
}

export function FeatureStrip() {
  return (
    <section className="relative py-section overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <motion.div
          variants={stagger(0.15, 0.1)}
          initial="initial"
          whileInView="animate"
          viewport={viewportOnce}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          style={{ perspective: "1200px" }}
        >
          {FEATURES.map((feature, i) => (
            <TiltCard key={feature.title} index={i} className="group">
              <div
                className="
                  relative space-y-3 p-5 rounded-2xl
                  bg-white/60 backdrop-blur-sm
                  border border-white/40
                  shadow-soft
                  group-hover:bg-white/80 group-hover:shadow-elevated
                  transition-all duration-500 ease-smooth
                "
              >
                {/* Icon — spring pop entrance */}
                <motion.div
                  variants={iconPop}
                  className="w-10 h-10 rounded-xl bg-cream flex items-center justify-center text-red"
                >
                  {feature.icon}
                </motion.div>

                {/* Title */}
                <motion.h3
                  variants={blurFadeUp}
                  className="text-body font-bold text-black"
                >
                  {feature.title}
                </motion.h3>

                {/* Description */}
                <motion.p
                  variants={blurFadeUp}
                  className="text-caption text-gray leading-relaxed"
                >
                  {feature.description}
                </motion.p>

                {/* Hover accent line */}
                <motion.div
                  className="absolute bottom-0 left-5 right-5 h-[2px] bg-red/0 group-hover:bg-red/20 rounded-full"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  transition={{ duration: 0.8, ease: ease.cinematic, delay: 0.3 + i * 0.1 }}
                  style={{ originX: 0 }}
                />
              </div>
            </TiltCard>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
