"use client";

import { motion } from "framer-motion";
import { fadeIn, ease } from "@/lib/motion";

interface ViewerLoadingProps {
  progress: number;
  status?: string;
}

export function ViewerLoading({ progress, status = "Parsing..." }: ViewerLoadingProps) {
  return (
    <motion.div
      variants={fadeIn}
      initial="initial"
      animate="animate"
      exit="exit"
      className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-10"
    >
      <div className="w-48 space-y-3 text-center">
        <p className="text-caption font-medium text-gray">{status}</p>

        {/* Progress bar */}
        <div className="h-1.5 bg-gray-light rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-red rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: ease.smooth }}
          />
        </div>

        <p className="text-micro text-gray-muted tabular-nums">
          {Math.round(progress)}%
        </p>
      </div>
    </motion.div>
  );
}
