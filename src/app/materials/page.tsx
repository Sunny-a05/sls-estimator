"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { fadeUp, blurFadeUp, stagger, viewportOnce } from "@/lib/motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MaterialCard } from "@/components/shared/MaterialCard";
import { runMatch } from "@/lib/engine/material-matcher";
import { MATERIALS } from "@/config/materials";
import type { MatchCriteria, MaterialMatchResult } from "@/types/material";

const CRITERIA_FIELDS: { key: keyof MatchCriteria; label: string; placeholder: string; unit: string }[] = [
  { key: "tensile", label: "Tensile Strength", placeholder: "e.g., 48", unit: "MPa" },
  { key: "elong", label: "Elongation", placeholder: "e.g., 10", unit: "%" },
  { key: "hdt", label: "HDT @ 0.45 MPa", placeholder: "e.g., 180", unit: "°C" },
  { key: "izod", label: "Izod Impact", placeholder: "e.g., 4", unit: "kJ/m²" },
  { key: "modulus", label: "Modulus", placeholder: "e.g., 1700", unit: "MPa" },
  { key: "shore", label: "Shore Hardness", placeholder: "e.g., 75D", unit: "" },
];

export default function MaterialsPage() {
  const [criteria, setCriteria] = useState<MatchCriteria>({});
  const [showAll, setShowAll] = useState(false);

  const hasCriteria = Object.values(criteria).some((v) => v && v.trim() !== "");

  const allMaterials = MATERIALS.filter((m) => !m.archived);

  const matches: MaterialMatchResult[] = useMemo(() => {
    if (!hasCriteria) return [];
    return runMatch(allMaterials, criteria);
  }, [criteria, hasCriteria]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-16">
        {/* Hero */}
        <motion.section
          variants={stagger(0.12, 0.1)}
          initial="initial"
          animate="animate"
          className="py-section px-6"
        >
          <div className="max-w-4xl mx-auto text-center">
            <motion.p
              variants={blurFadeUp}
              className="text-micro uppercase tracking-[0.25em] text-gray-muted font-semibold mb-4"
            >
              Material Library
            </motion.p>
            <motion.h1
              variants={blurFadeUp}
              className="font-serif text-heading text-black mb-4"
            >
              SLS Material Finder
            </motion.h1>
            <motion.p
              variants={blurFadeUp}
              className="text-body-lg text-gray max-w-xl mx-auto"
            >
              Enter your mechanical requirements and we&apos;ll rank compatible SLS powders by match score.
            </motion.p>
          </div>
        </motion.section>

        {/* Criteria inputs */}
        <section className="px-6 pb-8">
          <div className="max-w-3xl mx-auto">
            <motion.div
              variants={stagger(0.06, 0.2)}
              initial="initial"
              whileInView="animate"
              viewport={viewportOnce}
              className="grid grid-cols-2 md:grid-cols-3 gap-4"
            >
              {CRITERIA_FIELDS.map((field) => (
                <motion.div key={field.key} variants={fadeUp}>
                  <label className="text-micro uppercase tracking-widest text-gray font-semibold mb-1.5 block">
                    {field.label}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={criteria[field.key] || ""}
                      onChange={(e) => setCriteria((c) => ({ ...c, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      className="w-full px-3 py-2.5 rounded-xl text-caption bg-white border border-gray-border focus:outline-none focus:ring-2 focus:ring-red/30 focus:ring-offset-2 focus:ring-offset-white focus:border-red/40 transition-all duration-300 text-black placeholder:text-gray-muted/40"
                    />
                    {field.unit && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-micro text-gray-muted pointer-events-none">
                        {field.unit}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Results */}
        <section className="px-6 pb-section">
          <div className="max-w-3xl mx-auto">
            {matches.length > 0 && (
              <motion.div
                variants={stagger(0.06)}
                initial="initial"
                animate="animate"
                className="space-y-3"
              >
                <p className="text-micro uppercase tracking-widest text-gray-muted font-bold mb-2">
                  {matches.length} materials ranked
                </p>
                {matches.slice(0, showAll ? undefined : 10).map((match, i) => (
                  <MaterialCard
                    key={match.mat.name}
                    match={match}
                    rank={i + 1}
                    selected={false}
                    onSelect={() => {}}
                  />
                ))}
                {matches.length > 10 && !showAll && (
                  <button
                    onClick={() => setShowAll(true)}
                    className="w-full py-3 text-caption font-medium text-red hover:underline"
                  >
                    Show all {matches.length} materials
                  </button>
                )}
              </motion.div>
            )}

            {!hasCriteria && (
              <div className="text-center py-12">
                <p className="text-body text-gray-muted mb-2">Enter at least one requirement to see rankings.</p>
                <p className="text-caption text-gray-muted/60">{allMaterials.length} SLS materials available</p>
              </div>
            )}

            {hasCriteria && matches.length === 0 && (
              <div className="text-center py-12">
                <p className="text-body text-gray-muted">No materials match your criteria.</p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
