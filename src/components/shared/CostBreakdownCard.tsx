"use client";

import { motion } from "framer-motion";
import { scaleFade } from "@/lib/motion";
import { thb } from "@/lib/utils/format";
import type { EstimatorResult } from "@/types/estimator";

interface CostBreakdownCardProps {
  result: EstimatorResult;
  className?: string;
}

function CostRow({
  label,
  value,
  muted = false,
}: {
  label: string;
  value: number;
  muted?: boolean;
}) {
  return (
    <div className="flex justify-between items-center py-1.5">
      <span className={`text-caption ${muted ? "text-gray-muted" : "text-gray"}`}>
        {label}
      </span>
      <span className={`text-caption font-semibold ${muted ? "text-gray-muted" : "text-black"}`}>
        {thb(value)}
      </span>
    </div>
  );
}

export function CostBreakdownCard({ result, className = "" }: CostBreakdownCardProps) {
  return (
    <motion.div
      variants={scaleFade}
      className={`bg-white border border-gray-border rounded-2xl p-6 ${className}`}
    >
      <h3 className="text-micro uppercase tracking-widest text-gray-muted font-bold mb-4">
        Cost Breakdown
      </h3>

      <div className="divide-y divide-gray-border/50">
        <div className="pb-3 space-y-0.5">
          <CostRow
            label={`Material (${result.rates.powderPerG} ฿/g)`}
            value={result.materialCost}
          />
          <CostRow
            label={`Electricity (${result.elecHrs}h × ${result.rates.electricityHr} ฿/hr)`}
            value={result.electricityCost}
          />
          <CostRow label="Setup fee" value={result.initialCost} muted />
          <CostRow label="Machine amortisation" value={result.machineCost} muted />
          <CostRow label="Post-processing" value={result.postProcess} muted />
        </div>

        {/* Total */}
        <div className="pt-3 flex justify-between items-center">
          <span className="text-body font-bold text-black">Total</span>
          <span className="text-heading font-bold text-red">
            {thb(result.finalQuote)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
