"use client";

import { motion } from "framer-motion";
import { fadeUp, stagger } from "@/lib/motion";
import { DimensionInputs } from "@/components/shared/DimensionInputs";
import { DropZone } from "@/components/shared/DropZone";
import { ModelViewer } from "@/components/viewer/ModelViewer";
import { useViewerStore } from "@/stores/viewer-store";
import { isTooSmall } from "@/lib/engine/fit-checker";

interface Step1Props {
  x: number;
  y: number;
  z: number;
  vol: number;
  onDimensionsChange: (dims: { x: number; y: number; z: number; vol: number }) => void;
  onFileDrop?: (file: File) => void;
  hasFile?: boolean;
  onNext: () => void;
}

export function Step1Dimensions({
  x, y, z, vol,
  onDimensionsChange,
  onFileDrop,
  hasFile,
  onNext,
}: Step1Props) {
  const viewer = useViewerStore();
  const hasDims = x > 0 && y > 0 && z > 0;
  const tooSmall = hasDims && isTooSmall(x, y, z);
  const isReady = viewer.parseStatus === "ready";

  // Format volume for display
  const volDisplay = vol > 0
    ? vol > 1e6
      ? `${(vol / 1e6).toFixed(2)} cm³`
      : `${vol.toFixed(1)} mm³`
    : null;

  return (
    <motion.div
      variants={stagger(0.1, 0.1)}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-8"
    >
      <motion.div variants={fadeUp}>
        <h2 className="font-serif text-heading text-black mb-1">Part Dimensions</h2>
        <p className="text-body text-gray">
          Upload a 3D file or enter dimensions manually.
        </p>
      </motion.div>

      {/* ── 3D Viewer + Drop Zone ── */}
      {isReady && viewer.geometry ? (
        <motion.div variants={fadeUp} className="space-y-3">
          <ModelViewer
            geometry={viewer.geometry}
            dimensions={viewer.dimensions}
            volume={viewer.volume}
            triangleCount={viewer.triangleCount}
            fileName={viewer.fileName}
            fileSize={viewer.fileSize}
            wasInches={viewer.wasInches}
            parseStatus={viewer.parseStatus}
            parseProgress={viewer.parseProgress}
            className="h-[360px]"
          />
          {/* Re-upload hint */}
          <div className="flex items-center justify-between">
            <span className="text-caption text-gray">
              {viewer.fileName}
              {viewer.wasInches && (
                <span className="ml-2 text-micro text-amber-600 font-medium">
                  (converted from inches)
                </span>
              )}
            </span>
            <DropZone
              onFileDrop={onFileDrop ?? (() => {})}
              compact
              className="!p-3 !border-0 hover:!bg-gray-light/50"
            />
          </div>
        </motion.div>
      ) : (
        <motion.div variants={fadeUp}>
          <DropZone onFileDrop={onFileDrop ?? (() => {})} />
        </motion.div>
      )}

      {/* ── "or enter manually" divider ── */}
      {!isReady && (
        <motion.div variants={fadeUp} className="flex items-center gap-4">
          <div className="flex-1 h-px bg-gray-border/50" />
          <span className="text-micro text-gray-muted font-semibold uppercase tracking-widest">
            or enter manually
          </span>
          <div className="flex-1 h-px bg-gray-border/50" />
        </motion.div>
      )}

      {/* ── Dimension inputs ── */}
      <DimensionInputs
        x={x}
        y={y}
        z={z}
        vol={vol}
        onChange={onDimensionsChange}
        disabled={isReady} // Lock when auto-filled from file
      />

      {/* ── Auto-computed stats ── */}
      {hasDims && (
        <motion.div
          variants={fadeUp}
          className="flex flex-wrap gap-4 text-caption"
        >
          {volDisplay && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cream border border-gray-border/30">
              <span className="text-gray">Volume</span>
              <span className="font-semibold text-black">{volDisplay}</span>
            </div>
          )}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cream border border-gray-border/30">
            <span className="text-gray">Bounding</span>
            <span className="font-semibold text-black">
              {x.toFixed(1)} × {y.toFixed(1)} × {z.toFixed(1)} mm
            </span>
          </div>
          {viewer.triangleCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cream border border-gray-border/30">
              <span className="text-gray">Triangles</span>
              <span className="font-semibold text-black">
                {viewer.triangleCount.toLocaleString()}
              </span>
            </div>
          )}
        </motion.div>
      )}

      {/* ── Too-small warning ── */}
      {tooSmall && (
        <motion.div
          variants={fadeUp}
          className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-caption text-amber-800"
          role="alert"
        >
          <strong>Warning:</strong> One or more dimensions is below 3 mm.
          SLS printing may not produce reliable results at this scale.
        </motion.div>
      )}

      {/* ── Parse error ── */}
      {viewer.parseStatus === "error" && (
        <motion.div
          variants={fadeUp}
          className="p-4 rounded-xl bg-red/5 border border-red/20 text-caption text-red"
          role="alert"
        >
          <strong>Parse error:</strong> {viewer.errorMessage}
        </motion.div>
      )}

      {/* ── Next button ── */}
      <motion.div variants={fadeUp} className="flex justify-end">
        <button
          onClick={onNext}
          disabled={!hasDims}
          className="
            px-6 py-2.5 rounded-xl text-caption font-bold
            bg-red text-white
            hover:bg-red-dark active:scale-[0.97]
            disabled:opacity-40 disabled:cursor-not-allowed
            transition-all duration-200
            shadow-btn
          "
        >
          Continue
        </button>
      </motion.div>
    </motion.div>
  );
}
