"use client";

import { motion } from "framer-motion";
import { fadeUp, stagger } from "@/lib/motion";

interface Step2Props {
  qty: number;
  purpose: string;
  color: string;
  priority: string;
  notes: string;
  onUpdate: (data: Partial<{ qty: number; purpose: string; color: string; priority: string; notes: string }>) => void;
  onNext: () => void;
  onBack: () => void;
  disabled?: boolean;
  errors?: { qty?: boolean; color?: boolean; notes?: boolean };
}

const PURPOSES = ["Prototype", "Functional Part", "End Use", "Tooling", "Art / Display", "Other"];
const PRIORITIES = ["Standard", "Rush (+20%)", "Economy (-10%)"];

function ChipSelector({
  label,
  value,
  options,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  const labelId = `chip-${label.toLowerCase().replace(/\s+/g, "-")}-label`;
  return (
    <div>
      <label
        id={labelId}
        className="text-micro uppercase tracking-widest text-gray font-semibold mb-1.5 block"
      >
        {label}
      </label>
      <div role="group" aria-labelledby={labelId} className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            aria-pressed={value === opt}
            disabled={disabled}
            className={`
              px-3 py-1.5 rounded-xl text-body font-medium
              border transition-all duration-300 ease-smooth
              focus:outline-none focus:ring-2 focus:ring-red/30 focus:ring-offset-2 focus:ring-offset-white
              disabled:opacity-50 disabled:cursor-not-allowed
              ${value === opt
                ? "border-red bg-red/[0.04] text-red"
                : "border-gray-border text-gray hover:border-gray-muted hover:text-black"
              }
            `}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Step2Setup({ qty, purpose, color, priority, notes, onUpdate, onNext, onBack, disabled, errors }: Step2Props) {
  return (
    <motion.div
      variants={stagger(0.1, 0.1)}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-8"
    >
      <motion.div variants={fadeUp}>
        <h2 className="font-serif text-heading text-black mb-1">Job Setup</h2>
        <p className="text-body text-gray">Configure your print job details.</p>
      </motion.div>

      {/* Quantity */}
      <motion.div variants={fadeUp}>
        <label
          htmlFor="step2-qty"
          className="text-micro uppercase tracking-widest text-gray font-semibold mb-1.5 block"
        >
          Quantity
        </label>
        <input
          id="step2-qty"
          type="number"
          min="1"
          max="999"
          value={qty}
          onChange={(e) => onUpdate({ qty: Math.max(1, parseInt(e.target.value) || 1) })}
          disabled={disabled}
          aria-invalid={errors?.qty ? "true" : undefined}
          aria-describedby={errors?.qty ? "step2-qty-error" : undefined}
          className={`
            w-24 px-3 py-2.5 rounded-xl text-body font-medium
            bg-white border transition-all duration-300 ease-smooth
            focus:outline-none focus:ring-2 focus:ring-red/30 focus:ring-offset-2 focus:ring-offset-white
            disabled:opacity-50 disabled:cursor-not-allowed
            ${errors?.qty
              ? "border-red/50 text-red"
              : "border-gray-border focus:border-red/40 text-black"
            }
          `}
        />
        {errors?.qty && (
          <motion.p
            id="step2-qty-error"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-micro text-red mt-1 font-medium"
            role="alert"
          >
            Required
          </motion.p>
        )}
      </motion.div>

      {/* Purpose */}
      <motion.div variants={fadeUp}>
        <ChipSelector label="Purpose" value={purpose} options={PURPOSES} onChange={(v) => onUpdate({ purpose: v })} disabled={disabled} />
      </motion.div>

      {/* Priority */}
      <motion.div variants={fadeUp}>
        <ChipSelector label="Priority" value={priority} options={PRIORITIES} onChange={(v) => onUpdate({ priority: v })} disabled={disabled} />
      </motion.div>

      {/* Color */}
      <motion.div variants={fadeUp}>
        <label
          htmlFor="step2-color"
          className="text-micro uppercase tracking-widest text-gray font-semibold mb-1.5 block"
        >
          Color Preference
        </label>
        <input
          id="step2-color"
          type="text"
          value={color}
          onChange={(e) => onUpdate({ color: e.target.value })}
          placeholder="e.g., Natural grey, Dyed black"
          disabled={disabled}
          aria-invalid={errors?.color ? "true" : undefined}
          aria-describedby={errors?.color ? "step2-color-error" : undefined}
          className={`
            w-full max-w-xs px-3 py-2.5 rounded-xl text-body font-medium
            bg-white border transition-all duration-300 ease-smooth
            focus:outline-none focus:ring-2 focus:ring-red/30 focus:ring-offset-2 focus:ring-offset-white
            disabled:opacity-50 disabled:cursor-not-allowed
            placeholder:text-gray-muted/50
            ${errors?.color
              ? "border-red/50 text-red"
              : "border-gray-border focus:border-red/40 text-black"
            }
          `}
        />
        {errors?.color && (
          <motion.p
            id="step2-color-error"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-micro text-red mt-1 font-medium"
            role="alert"
          >
            Required
          </motion.p>
        )}
      </motion.div>

      {/* Notes */}
      <motion.div variants={fadeUp}>
        <label
          htmlFor="step2-notes"
          className="text-micro uppercase tracking-widest text-gray font-semibold mb-1.5 block"
        >
          Notes
        </label>
        <textarea
          id="step2-notes"
          value={notes}
          onChange={(e) => onUpdate({ notes: e.target.value })}
          rows={3}
          placeholder="Any special requirements..."
          disabled={disabled}
          className="
            w-full px-3 py-2.5 rounded-xl text-body font-medium
            bg-white border border-gray-border transition-all duration-300 ease-smooth
            focus:outline-none focus:ring-2 focus:ring-red/30 focus:ring-offset-2 focus:ring-offset-white focus:border-red/40
            disabled:opacity-50 disabled:cursor-not-allowed
            placeholder:text-gray-muted/50 text-black
            resize-none
          "
        />
      </motion.div>

      {/* Navigation */}
      <motion.div variants={fadeUp} className="flex justify-between">
        <button
          onClick={onBack}
          className="px-5 py-2.5 rounded-xl text-body font-medium text-gray hover:text-black transition-colors"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="
            px-6 py-2.5 rounded-xl text-body font-bold
            bg-red text-white hover:bg-red-dark active:scale-[0.97]
            transition-all duration-300 ease-smooth shadow-btn
          "
        >
          Continue
        </button>
      </motion.div>
    </motion.div>
  );
}