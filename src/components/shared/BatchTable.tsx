"use client";

import { motion } from "framer-motion";
import { scaleFade, stagger, fadeUp } from "@/lib/motion";
import { fmtMin, thb } from "@/lib/utils/format";

interface BatchRow {
  buildNum: number;
  partsInBuild: number;
  buildHeight: number;
  timeMin: number;
  costPerPart: number;
}

interface BatchTableProps {
  batches: BatchRow[];
  totalParts: number;
  totalCost: number;
  className?: string;
}

export function BatchTable({ batches, totalParts, totalCost, className = "" }: BatchTableProps) {
  return (
    <motion.div
      variants={scaleFade}
      className={`bg-white border border-gray-border rounded-2xl overflow-hidden ${className}`}
    >
      <div className="p-4 border-b border-gray-border/50">
        <h3 className="text-micro uppercase tracking-widest text-gray-muted font-bold">
          Build Schedule
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-caption">
          <thead>
            <tr className="border-b border-gray-border/50">
              <th className="text-left px-4 py-2.5 text-micro uppercase tracking-widest text-gray-muted font-semibold">
                Build
              </th>
              <th className="text-right px-4 py-2.5 text-micro uppercase tracking-widest text-gray-muted font-semibold">
                Parts
              </th>
              <th className="text-right px-4 py-2.5 text-micro uppercase tracking-widest text-gray-muted font-semibold">
                Height
              </th>
              <th className="text-right px-4 py-2.5 text-micro uppercase tracking-widest text-gray-muted font-semibold">
                Time
              </th>
              <th className="text-right px-4 py-2.5 text-micro uppercase tracking-widest text-gray-muted font-semibold">
                Cost/Part
              </th>
            </tr>
          </thead>
          <motion.tbody variants={stagger(0.04)}>
            {batches.map((batch) => (
              <motion.tr
                key={batch.buildNum}
                variants={fadeUp}
                className="border-b border-gray-border/30 last:border-0"
              >
                <td className="px-4 py-2.5 font-semibold text-black">
                  #{batch.buildNum}
                </td>
                <td className="px-4 py-2.5 text-right text-gray tabular-nums">
                  {batch.partsInBuild}
                </td>
                <td className="px-4 py-2.5 text-right text-gray tabular-nums">
                  {batch.buildHeight.toFixed(1)} mm
                </td>
                <td className="px-4 py-2.5 text-right text-gray tabular-nums">
                  {fmtMin(batch.timeMin)}
                </td>
                <td className="px-4 py-2.5 text-right font-semibold text-black tabular-nums">
                  {thb(batch.costPerPart)}
                </td>
              </motion.tr>
            ))}
          </motion.tbody>
        </table>
      </div>

      {/* Summary footer */}
      <div className="p-4 border-t border-gray-border/50 bg-cream/50 flex justify-between items-center">
        <span className="text-caption text-gray">
          {totalParts} parts across {batches.length} build{batches.length !== 1 ? "s" : ""}
        </span>
        <span className="text-body font-bold text-red">{thb(totalCost)}</span>
      </div>
    </motion.div>
  );
}
