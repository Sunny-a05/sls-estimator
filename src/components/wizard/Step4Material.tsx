"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { fadeUp, stagger } from "@/lib/motion";
import { MaterialCard } from "@/components/shared/MaterialCard";
import { runMatch } from "@/lib/engine/material-matcher";
import { MATERIALS } from "@/config/materials";
import type { Material, MatchCriteria, MaterialMatchResult } from "@/types/material";

interface Step4Props {
  selectedMaterial: Material | null;
  onSelectMaterial: (material: Material) => void;
  onNext: () => void;
  onBack: () => void;
}

const CRITERIA_FIELDS: { key: keyof MatchCriteria; label: string; placeholder: string; unit: string }[] = [
  { key: "tensile", label: "Tensile Strength", placeholder: "e.g., 48", unit: "MPa" },
  { key: "elong", label: "Elongation", placeholder: "e.g., 10", unit: "%" },
  { key: "hdt", label: "HDT @ 0.45 MPa", placeholder: "e.g., 180", unit: "°C" },
  { key: "izod", label: "Izod Impact", placeholder: "e.g., 4", unit: "kJ/m²" },
  { key: "modulus", label: "Modulus", placeholder: "e.g., 1700", unit: "MPa" },
  { key: "shore", label: "Shore Hardness", placeholder: "e.g., 75D", unit: "" },
];

export function Step4Material({ selectedMaterial, onSelectMaterial, onNext, onBack }: Step4Props) {
  const [criteria, setCriteria] = useState<MatchCriteria>({});

  const hasCriteria = Object.values(criteria).some((v) => v && v.trim() !== "");

  const matches: MaterialMatchResult[] = useMemo(() => {
    if (!hasCriteria) return [];
    const slsMaterials = MATERIALS.filter((m) => !m.archived);
    return runMatch(slsMaterials, criteria);
  }, [criteria, hasCriteria]);

  return (
    <motion.div
      variants={stagger(0.1, 0.1)}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-8"
    >
      <motion.div variants={fadeUp}>
        <h2 className="font-serif text-heading text-black mb-1">Material Match</h2>
        <p className="text-body text-gray">
          Enter your mechanical requirements and we&apos;ll rank compatible SLS powders.
        </p>
      </motion.div>

      {/* Criteria inputs */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 gap-4">
        {CRITERIA_FIELDS.map((field) => (
          <div key={field.key}>
            <label className="text-micro uppercase tracking-widest text-gray font-semibold mb-1.5 block">
              {field.label}
            </label>
            <div className="relative">
              <input
                type="text"
                value={criteria[field.key] || ""}
                onChange={(e) => setCriteria((c) => ({ ...c, [field.key]: e.target.value }))}
                placeholder={field.placeholder}
                className="
                  w-full px-3 py-2 rounded-xl text-caption
                  bg-white border border-gray-border
                  focus:outline-none focus:ring-2 focus:ring-red/30 focus:ring-offset-2 focus:ring-offset-white focus:border-red/40
                  transition-all duration-300 text-black placeholder:text-gray-muted/40
                "
              />
              {field.unit && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-micro text-gray-muted pointer-events-none">
                  {field.unit}
                </span>
              )}
            </div>
          </div>
        ))}
      </motion.div>

      {/* Results */}
      {matches.length > 0 && (
        <motion.div variants={stagger(0.06)} className="space-y-2">
          <p className="text-micro uppercase tracking-widest text-gray-muted font-bold">
            {matches.length} materials ranked
          </p>
          {matches.slice(0, 8).map((match, i) => (
            <MaterialCard
              key={match.mat.name}
              match={match}
              rank={i + 1}
              selected={selectedMaterial?.name === match.mat.name}
              onSelect={() => onSelectMaterial(match.mat)}
            />
          ))}
        </motion.div>
      )}

      {!hasCriteria && (
        <motion.p variants={fadeUp} className="text-caption text-gray-muted text-center py-4">
          Enter at least one requirement to see material rankings.
        </motion.p>
      )}

      {/* Navigation */}
      <motion.div variants={fadeUp} className="flex justify-between">
        <button
          onClick={onBack}
          className="px-5 py-2.5 rounded-xl text-caption font-medium text-gray hover:text-black transition-colors"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="
            px-6 py-2.5 rounded-xl text-caption font-bold
            bg-red text-white hover:bg-red-dark active:scale-[0.97]
            transition-all duration-300 ease-smooth shadow-btn
          "
        >
          {selectedMaterial ? "Continue" : "Skip Material"}
        </button>
      </motion.div>
    </motion.div>
  );
}
