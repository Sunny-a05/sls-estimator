"use client";

import { motion } from "framer-motion";
import { fadeUp, stagger, viewportOnce } from "@/lib/motion";

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}

export function AnimatedSection({
  children,
  className = "",
  staggerDelay = 0.08,
}: AnimatedSectionProps) {
  return (
    <motion.section
      initial="initial"
      whileInView="animate"
      viewport={viewportOnce}
      variants={stagger(staggerDelay)}
      className={className}
    >
      {children}
    </motion.section>
  );
}

export function AnimatedItem({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div variants={fadeUp} className={className}>
      {children}
    </motion.div>
  );
}
