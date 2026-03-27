"use client";

import { motion } from "framer-motion";
import { slideRight, stagger, fadeUp, ease } from "@/lib/motion";
import { StepIndicator } from "@/components/shared/StepIndicator";
import { thb } from "@/lib/utils/format";
import type { WizardStep } from "@/types/wizard";

interface WizardSidebarProps {
  step: WizardStep;
  onStepClick: (step: number) => void;
  dims?: { x: number; y: number; z: number };
  qty?: number;
  printerName?: string;
  materialName?: string;
  estimatedCost?: number;
}

const STEPS = [
  { label: "Dimensions", shortLabel: "Dims" },
  { label: "Setup", shortLabel: "Setup" },
  { label: "Printer", shortLabel: "Printer" },
  { label: "Material", shortLabel: "Mat." },
  { label: "Results", shortLabel: "Results" },
];

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <motion.div variants={fadeUp} className="flex justify-between items-center">
      <span className="text-micro uppercase tracking-widest text-gray-muted font-semibold">
        {label}
      </span>
      <span className="text-caption font-semibold text-black">{value}</span>
    </motion.div>
  );
}

export function WizardSidebar({
  step,
  onStepClick,
  dims,
  qty,
  printerName,
  materialName,
  estimatedCost,
}: WizardSidebarProps) {
  const hasDims = dims && (dims.x > 0 || dims.y > 0 || dims.z > 0);

  return (
    <motion.div
      variants={stagger(0.08, 0.1)}
      initial="initial"
      animate="animate"
      className="space-y-8"
    >
      {/* Step Indicator */}
      <motion.div variants={slideRight}>
        <StepIndicator
          steps={STEPS}
          currentStep={step}
          onStepClick={onStepClick}
        />
      </motion.div>

      {/* Live Summary */}
      <motion.div
        variants={stagger(0.06)}
        className="space-y-3 pt-4 border-t border-gray-border/50"
      >
        <motion.p
          variants={fadeUp}
          className="text-micro uppercase tracking-widest text-gray-muted/60 font-bold"
        >
          Summary
        </motion.p>

        {hasDims && (
          <SummaryRow
            label="Size"
            value={`${dims.x.toFixed(1)} × ${dims.y.toFixed(1)} × ${dims.z.toFixed(1)} mm`}
          />
        )}

        {qty !== undefined && qty > 0 && (
          <SummaryRow label="Quantity" value={`${qty}`} />
        )}

        {printerName && <SummaryRow label="Printer" value={printerName} />}

        {materialName && <SummaryRow label="Material" value={materialName} />}
      </motion.div>

      {/* Cost Preview */}
      {estimatedCost !== undefined && estimatedCost > 0 && (
        <motion.div
          variants={fadeUp}
          className="p-4 rounded-xl bg-cream border border-gray-border/30"
        >
          <p className="text-micro uppercase tracking-widest text-gray-muted font-semibold mb-1">
            Estimated Total
          </p>
          <motion.p
            className="text-heading font-bold text-red"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, ease: ease.smooth }}
          >
            {thb(estimatedCost)}
          </motion.p>
        </motion.div>
      )}
    </motion.div>
  );
}
