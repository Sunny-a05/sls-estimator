"use client";

import { motion } from "framer-motion";
import { scaleFade } from "@/lib/motion";
import type { MaterialMatchResult, MatchStatus } from "@/types/material";

interface MaterialCardProps {
  match: MaterialMatchResult;
  selected?: boolean;
  onSelect?: () => void;
  rank?: number;
}

const STATUS_STYLES: Record<MatchStatus, { bg: string; text: string; label: string }> = {
  MEETS: { bg: "bg-green-50", text: "text-green-700", label: "Meets All" },
  CLOSE: { bg: "bg-amber-50", text: "text-amber-700", label: "Close" },
  NO: { bg: "bg-red/10", text: "text-red", label: "No Match" },
};

export function MaterialCard({ match, selected = false, onSelect, rank }: MaterialCardProps) {
  const status = STATUS_STYLES[match.status];

  return (
    <motion.button
      variants={scaleFade}
      onClick={onSelect}
      className={`
        w-full text-left p-4 rounded-xl border transition-all duration-300
        ${selected
          ? "border-red bg-red/[0.03] shadow-card-selected"
          : "border-gray-border hover:border-gray-muted cursor-pointer"
        }
      `}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          {rank !== undefined && (
            <span className="w-5 h-5 rounded-full bg-gray-light flex items-center justify-center text-micro font-bold text-gray">
              {rank}
            </span>
          )}
          <h4 className="text-caption font-bold text-black">{match.mat.name}</h4>
        </div>

        <span className={`px-2 py-0.5 rounded-full text-micro font-bold ${status.bg} ${status.text}`}>
          {status.label}
        </span>
      </div>

      <p className="text-micro text-gray-muted mb-2">{match.mat.profile}</p>

      {/* Property match details */}
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {match.details.map((d) => (
          <span key={d.label} className="text-micro">
            <span className={d.ok ? "text-green-600" : "text-red"}>
              {d.ok ? "✓" : "✗"}
            </span>{" "}
            <span className="text-gray">{d.label}</span>
          </span>
        ))}
      </div>

      {/* Score */}
      <div className="mt-2 flex items-center gap-2">
        <div className="flex-1 h-1 bg-gray-light rounded-full overflow-hidden">
          <div
            className="h-full bg-red rounded-full transition-all duration-500"
            style={{ width: `${Math.min(match.score * 100, 100)}%` }}
          />
        </div>
        <span className="text-micro font-semibold text-gray tabular-nums">
          {(match.score * 100).toFixed(0)}%
        </span>
      </div>
    </motion.button>
  );
}
