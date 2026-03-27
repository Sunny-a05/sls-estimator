"use client";

import { motion } from "framer-motion";
import { scaleFade } from "@/lib/motion";
import { fmtMin } from "@/lib/utils/format";
import type { EstimatorResult } from "@/types/estimator";

interface TimeBreakdownCardProps {
  result: EstimatorResult;
  className?: string;
}

function TimeSegment({
  label,
  minutes,
  color,
  percentage,
}: {
  label: string;
  minutes: number;
  color: string;
  percentage: number;
}) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-caption text-gray">{label}</span>
        <span className="text-caption font-semibold text-black">
          {fmtMin(minutes)}
        </span>
      </div>
      <div className="h-1.5 bg-gray-light rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </div>
  );
}

export function TimeBreakdownCard({ result, className = "" }: TimeBreakdownCardProps) {
  const total = result.totalMinSingle;
  const segments = [
    {
      label: "Preprint",
      minutes: result.preprintMin,
      color: "bg-gray-muted",
      pct: total > 0 ? (result.preprintMin / total) * 100 : 0,
    },
    {
      label: "Printing",
      minutes: result.printingMin,
      color: "bg-red",
      pct: total > 0 ? (result.printingMin / total) * 100 : 0,
    },
    {
      label: "Cool to 100°C",
      minutes: result.coolTo100Min,
      color: "bg-red-light",
      pct: total > 0 ? (result.coolTo100Min / total) * 100 : 0,
    },
    {
      label: "Cooldown",
      minutes: result.coolingMin,
      color: "bg-red-dark",
      pct: total > 0 ? (result.coolingMin / total) * 100 : 0,
    },
  ];

  return (
    <motion.div
      variants={scaleFade}
      className={`bg-white border border-gray-border rounded-2xl p-6 ${className}`}
    >
      <div className="flex justify-between items-start mb-5">
        <h3 className="text-micro uppercase tracking-widest text-gray-muted font-bold">
          Time Breakdown
        </h3>
        <div className="text-right">
          <p className="text-heading font-bold text-black">{fmtMin(result.totalMinAll)}</p>
          {result.builds > 1 && (
            <p className="text-micro text-gray-muted">
              {result.builds} builds
            </p>
          )}
        </div>
      </div>

      {/* Stacked bar */}
      <div className="flex h-2.5 rounded-full overflow-hidden mb-5">
        {segments.map((seg) => (
          <motion.div
            key={seg.label}
            initial={{ width: 0 }}
            animate={{ width: `${seg.pct}%` }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1], delay: 0.2 }}
            className={`${seg.color} first:rounded-l-full last:rounded-r-full`}
          />
        ))}
      </div>

      {/* Detail rows */}
      <div className="space-y-3">
        {segments.map((seg) => (
          <TimeSegment
            key={seg.label}
            label={seg.label}
            minutes={seg.minutes}
            color={seg.color}
            percentage={seg.pct}
          />
        ))}
      </div>

      {/* Print detail */}
      <div className="mt-4 pt-3 border-t border-gray-border/50">
        <p className="text-micro text-gray-muted leading-relaxed">
          Overhead {fmtMin(result.printOverheadMin)} + Recoat {fmtMin(result.recoatMin)} + Scan {fmtMin(result.scanMin)} — MPD {result.massMPD.toFixed(1)}%
        </p>
      </div>
    </motion.div>
  );
}
