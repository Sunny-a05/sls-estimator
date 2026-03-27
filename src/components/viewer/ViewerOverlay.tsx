"use client";

import { motion } from "framer-motion";
import { slideRight, stagger, fadeUp } from "@/lib/motion";
import { formatFileSize } from "@/lib/utils/format";
import type { Dimensions } from "@/types/geometry";

interface ViewerOverlayProps {
  dimensions: Dimensions;
  volume: number;
  triangleCount: number;
  fileName: string;
  fileSize: number;
  wasInches?: boolean;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <motion.div variants={fadeUp} className="space-y-0.5">
      <p className="text-micro uppercase tracking-widest text-gray-muted font-semibold">
        {label}
      </p>
      <p className="text-caption font-bold text-black tabular-nums">{value}</p>
    </motion.div>
  );
}

export function ViewerOverlay({
  dimensions,
  volume,
  triangleCount,
  fileName,
  fileSize,
  wasInches,
}: ViewerOverlayProps) {
  return (
    <motion.div
      variants={stagger(0.06, 0.2)}
      initial="initial"
      animate="animate"
      className="absolute bottom-0 left-0 right-0 p-4 pointer-events-none"
    >
      <div className="bg-white/80 backdrop-blur-xl border border-gray-border/50 rounded-xl p-4 pointer-events-auto">
        {/* File name */}
        <motion.p
          variants={slideRight}
          className="text-micro text-gray-muted font-medium mb-3 truncate"
        >
          {fileName}
          {wasInches && (
            <span className="ml-2 text-red font-semibold">
              (converted from inches)
            </span>
          )}
          <span className="ml-2 opacity-60">{formatFileSize(fileSize)}</span>
        </motion.p>

        {/* Stats row */}
        <div className="flex gap-6">
          <Stat
            label="Dimensions"
            value={`${dimensions.x.toFixed(1)} × ${dimensions.y.toFixed(1)} × ${dimensions.z.toFixed(1)} mm`}
          />
          <Stat
            label="Volume"
            value={`${volume.toFixed(1)} mm³`}
          />
          <Stat
            label="Triangles"
            value={triangleCount.toLocaleString()}
          />
        </div>
      </div>
    </motion.div>
  );
}
