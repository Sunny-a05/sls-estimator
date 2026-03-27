"use client";

import { useCallback } from "react";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/motion";

interface DimensionInputsProps {
  x: number;
  y: number;
  z: number;
  vol: number;
  onChange: (dims: { x: number; y: number; z: number; vol: number }) => void;
  disabled?: boolean;
  errors?: { x?: boolean; y?: boolean; z?: boolean };
}

function DimensionField({
  label,
  unit,
  value,
  onChange,
  error,
  disabled,
}: {
  label: string;
  unit: string;
  value: number;
  onChange: (v: number) => void;
  error?: boolean;
  disabled?: boolean;
}) {
  const fieldId = `dim-${label.toLowerCase()}`;
  const errorId = `${fieldId}-error`;

  return (
    <div className="flex-1 min-w-0">
      <label
        htmlFor={fieldId}
        className="text-micro uppercase tracking-widest text-gray font-semibold mb-1.5 block"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={fieldId}
          type="number"
          step="0.1"
          min="0"
          value={value || ""}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          disabled={disabled}
          aria-label={`${label} dimension`}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error ? errorId : undefined}
          className={`
            w-full px-3 py-2.5 rounded-xl text-body font-medium
            bg-white border transition-all duration-300 ease-smooth
            focus:outline-none focus:ring-2 focus:ring-red/30 focus:ring-offset-2 focus:ring-offset-white
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error
              ? "border-red/50 text-red"
              : "border-gray-border focus:border-red/40 text-black"
            }
          `}
          placeholder="0.0"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-caption text-gray-muted pointer-events-none">
          {unit}
        </span>
      </div>
      {error && (
        <motion.p
          id={errorId}
          role="alert"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-micro text-red mt-1 font-medium"
        >
          Required
        </motion.p>
      )}
    </div>
  );
}

export function DimensionInputs({
  x,
  y,
  z,
  vol,
  onChange,
  disabled,
  errors,
}: DimensionInputsProps) {
  const update = useCallback(
    (field: "x" | "y" | "z" | "vol", value: number) => {
      onChange({ x, y, z, vol, [field]: value });
    },
    [x, y, z, vol, onChange]
  );

  return (
    <motion.div variants={fadeUp} className="space-y-4">
      {/* XYZ Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <DimensionField
          label="X"
          unit="mm"
          value={x}
          onChange={(v) => update("x", v)}
          error={errors?.x}
          disabled={disabled}
        />
        <DimensionField
          label="Y"
          unit="mm"
          value={y}
          onChange={(v) => update("y", v)}
          error={errors?.y}
          disabled={disabled}
        />
        <DimensionField
          label="Z"
          unit="mm"
          value={z}
          onChange={(v) => update("z", v)}
          error={errors?.z}
          disabled={disabled}
        />
      </div>

      {/* Volume — auto-compute from bounding box when no parsed volume */}
      <div className="max-w-[250px]">
        {(() => {
          const hasDims = x > 0 && y > 0 && z > 0;
          const computedVol = hasDims && vol === 0 ? x * y * z : vol;
          const isEstimated = hasDims && vol === 0 && computedVol > 0;
          const displayUnit = computedVol > 1e6 ? "cm³" : "mm³";
          const displayVal = computedVol > 1e6 ? computedVol / 1e6 : computedVol;
          return (
            <div>
              <DimensionField
                label="Volume"
                unit={displayUnit}
                value={parseFloat(displayVal.toFixed(2))}
                onChange={(v) => update("vol", v)}
                disabled={disabled || isEstimated}
              />
              {isEstimated && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-micro text-amber-600 font-medium mt-1 flex items-center gap-1"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Bounding-box estimate
                </motion.p>
              )}
            </div>
          );
        })()}
      </div>
    </motion.div>
  );
}
