"use client";

import { motion } from "framer-motion";
import { fadeUp, scaleFade, stagger } from "@/lib/motion";
import type { BranchMode } from "@/types/wizard";

interface BranchSelectorProps {
  onSelect: (branch: BranchMode) => void;
}

const BRANCHES = [
  {
    mode: "single" as const,
    title: "Single Print",
    description: "Estimate one part — choose printer, material, and get a full cost & time breakdown.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      </svg>
    ),
  },
  {
    mode: "multi" as const,
    title: "Multi-Part Build",
    description: "Pack multiple parts into optimized builds with automatic bin packing and batch scheduling.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
      </svg>
    ),
  },
];

export function BranchSelector({ onSelect }: BranchSelectorProps) {
  return (
    <motion.div
      variants={stagger(0.12, 0.2)}
      initial="initial"
      animate="animate"
      className="space-y-6"
    >
      <motion.div variants={fadeUp}>
        <h2 className="font-serif text-heading text-black mb-1">
          What are you building?
        </h2>
        <p className="text-body text-gray">
          Choose a workflow to get started.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {BRANCHES.map((branch) => (
          <motion.button
            key={branch.mode}
            variants={scaleFade}
            onClick={() => onSelect(branch.mode)}
            className="
              group text-left p-6 rounded-2xl border border-gray-border
              hover:border-red/30 hover:bg-red/[0.02]
              hover:shadow-card-hover
              transition-all duration-300 cursor-pointer
            "
          >
            <div className="text-red mb-4 group-hover:scale-105 transition-transform duration-300">
              {branch.icon}
            </div>
            <h3 className="text-body font-bold text-black mb-1">
              {branch.title}
            </h3>
            <p className="text-caption text-gray leading-relaxed">
              {branch.description}
            </p>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
