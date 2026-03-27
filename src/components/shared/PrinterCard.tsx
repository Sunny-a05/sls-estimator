"use client";

import { motion } from "framer-motion";
import { scaleFade } from "@/lib/motion";
import type { FittingPrinter } from "@/types/printer";

interface PrinterCardProps {
  printer: FittingPrinter;
  selected?: boolean;
  onSelect?: () => void;
}

export function PrinterCard({ printer, selected = false, onSelect }: PrinterCardProps) {
  const fits = printer.fitResult.status === "fits";

  return (
    <motion.button
      variants={scaleFade}
      onClick={onSelect}
      disabled={!fits}
      className={`
        w-full text-left p-4 rounded-xl border transition-all duration-300
        ${selected
          ? "border-red bg-red/[0.03] shadow-card-selected"
          : fits
            ? "border-gray-border hover:border-gray-muted cursor-pointer"
            : "border-gray-border/50 opacity-50 cursor-not-allowed"
        }
      `}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <h4 className="text-caption font-bold text-black">{printer.name}</h4>
          <p className="text-micro text-gray-muted">
            {printer.x} × {printer.y} × {printer.z} mm
          </p>
        </div>

        {/* Fit badge */}
        <span
          className={`
            px-2 py-0.5 rounded-full text-micro font-bold
            ${fits
              ? "bg-green-50 text-green-700"
              : "bg-red/10 text-red"
            }
          `}
        >
          {fits ? "Fits" : "Too Big"}
        </span>
      </div>

      {fits && printer.fitResult.status === "fits" && (
        <div className="flex gap-4 text-micro text-gray">
          <span>
            <span className="font-semibold text-black">
              {printer.fitResult.orientations.length}
            </span>{" "}
            orientations
          </span>
          <span>
            <span className="font-semibold text-black">
              {printer.fitResult.layers}
            </span>{" "}
            layers
          </span>
          <span>
            Best: <span className="font-semibold text-black">{printer.bestOrient}</span>
          </span>
        </div>
      )}

      {!fits && printer.fitResult.status === "too-big" && (
        <p className="text-micro text-gray-muted">{printer.fitResult.reason}</p>
      )}
    </motion.button>
  );
}
