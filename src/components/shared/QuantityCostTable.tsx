"use client";

import { motion } from "framer-motion";
import { scaleFade, stagger, fadeUp } from "@/lib/motion";
import { fmtMin, thb } from "@/lib/utils/format";
import type { OptimalBatchData } from "@/lib/engine/batch-calculator";

interface QuantityCostTableProps {
  data: OptimalBatchData;
  currentQty: number;
  className?: string;
}

/**
 * Quantity vs. Cost comparison table.
 * Shows how per-part cost changes across quantity brackets,
 * highlighting the current selection and the global minimum.
 */
export function QuantityCostTable({
  data,
  currentQty,
  className = "",
}: QuantityCostTableProps) {
  const { brackets, optimalResults, globalMinQty, globalMin, ppcGrid, ppcDivergence } = data;

  return (
    <motion.div
      variants={scaleFade}
      className={`bg-white border border-gray-border rounded-2xl overflow-hidden ${className}`}
    >
      <div className="p-4 border-b border-gray-border/50 flex items-center justify-between">
        <h3 className="text-micro uppercase tracking-widest text-gray-muted font-bold">
          Quantity vs. Cost
        </h3>
        <span className="text-micro text-gray">
          {ppcGrid} parts/build (grid packing)
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-caption">
          <thead>
            <tr className="border-b border-gray-border/50">
              <th className="text-left px-4 py-2.5 text-micro uppercase tracking-widest text-gray-muted font-semibold">
                Qty
              </th>
              <th className="text-right px-4 py-2.5 text-micro uppercase tracking-widest text-gray-muted font-semibold">
                Builds
              </th>
              <th className="text-right px-4 py-2.5 text-micro uppercase tracking-widest text-gray-muted font-semibold">
                Total Time
              </th>
              <th className="text-right px-4 py-2.5 text-micro uppercase tracking-widest text-gray-muted font-semibold">
                Total Cost
              </th>
              <th className="text-right px-4 py-2.5 text-micro uppercase tracking-widest text-gray-muted font-semibold">
                Per Part
              </th>
            </tr>
          </thead>
          <motion.tbody variants={stagger(0.03)}>
            {brackets.map((qty, i) => {
              const row = optimalResults[i];
              if (!row) return null;

              const isCurrent = qty === currentQty;
              const isBest = qty === globalMinQty;

              return (
                <motion.tr
                  key={qty}
                  variants={fadeUp}
                  className={`
                    border-b border-gray-border/30 last:border-0
                    ${isCurrent ? "bg-red/[0.04]" : ""}
                    ${isBest && !isCurrent ? "bg-green-50/50" : ""}
                  `}
                >
                  <td className="px-4 py-2.5 font-semibold text-black">
                    {qty}
                    {isBest && (
                      <span className="ml-1.5 text-micro text-green-600 font-bold">
                        ★
                      </span>
                    )}
                    {isCurrent && (
                      <span className="ml-1.5 text-micro text-red font-bold">
                        ←
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-right text-gray tabular-nums">
                    {row.builds}
                  </td>
                  <td className="px-4 py-2.5 text-right text-gray tabular-nums">
                    {fmtMin(row.wallMin)}
                  </td>
                  <td className="px-4 py-2.5 text-right text-gray tabular-nums">
                    {thb(row.costTotal)}
                  </td>
                  <td className={`px-4 py-2.5 text-right font-semibold tabular-nums ${
                    isBest ? "text-green-700" : "text-black"
                  }`}>
                    {thb(row.costPerPart)}
                  </td>
                </motion.tr>
              );
            })}
          </motion.tbody>
        </table>
      </div>

      {/* Footer — best-price advisory */}
      <div className="p-4 border-t border-gray-border/50 bg-cream/50 flex items-center gap-3">
        <span className="text-micro text-green-600 font-bold">★</span>
        <span className="text-caption text-gray">
          Best per-part price at <strong className="text-black">{globalMinQty} parts</strong>
          {" = "}<strong className="text-green-700">{thb(globalMin)}/part</strong>
        </span>
      </div>

      {/* Packing divergence advisory */}
      {ppcDivergence && (
        <div className="px-4 pb-4 text-micro text-amber-700">
          Note: Tight packing (5 mm gaps) diverges from standard grid — consider consulting for high-volume orders.
        </div>
      )}
    </motion.div>
  );
}
