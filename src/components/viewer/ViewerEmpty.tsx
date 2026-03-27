"use client";

import { motion } from "framer-motion";
import { fadeUp } from "@/lib/motion";

export function ViewerEmpty() {
  return (
    <motion.div
      variants={fadeUp}
      initial="initial"
      animate="animate"
      className="flex flex-col items-center justify-center h-full text-center px-6"
    >
      <div className="w-16 h-16 rounded-2xl bg-gray-light flex items-center justify-center mb-4">
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-gray-muted"
        >
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      </div>
      <p className="text-caption font-medium text-gray-muted">
        No model loaded
      </p>
      <p className="text-micro text-gray-muted/70 mt-1">
        Upload an STL, OBJ, PLY, or 3MF file
      </p>
    </motion.div>
  );
}
