"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fadeUp, blurFadeUp, stagger, ease } from "@/lib/motion";
import { useWizardStore } from "@/stores/wizard-store";
import { useViewerStore } from "@/stores/viewer-store";
import { useFileProcessor } from "@/hooks/useFileProcessor";
import { checkFitForPrinter } from "@/lib/engine/fit-checker";
import { optimizeOrientation } from "@/lib/engine/orientation-optimizer";
import { computeOptimalBatches } from "@/lib/engine/batch-calculator";
import { PRINTER_MAP, DEFAULT_PRINTER } from "@/config/printers";
import { FUSE1_CONFIG } from "@/lib/engine/config";
import dynamic from "next/dynamic";
import { DropZone } from "@/components/shared/DropZone";

// Code-split Three.js — only loads when the viewer is actually needed
const ModelViewer = dynamic(
  () => import("@/components/viewer/ModelViewer").then((m) => ({ default: m.ModelViewer })),
  {
    ssr: false,
    loading: () => (
      <div className="h-full min-h-[250px] flex flex-col items-center justify-center animate-pulse">
        <div className="w-32 h-32 rounded-2xl bg-gray-border/30" />
        <div className="mt-4 w-48 h-3 rounded bg-gray-border/30" />
        <div className="mt-2 w-32 h-3 rounded bg-gray-border/20" />
      </div>
    ),
  }
);
import { DimensionInputs } from "@/components/shared/DimensionInputs";
import { CostBreakdownCard } from "@/components/shared/CostBreakdownCard";
import { TimeBreakdownCard } from "@/components/shared/TimeBreakdownCard";
import { QuantityCostTable } from "@/components/shared/QuantityCostTable";
import { PrinterCard } from "@/components/shared/PrinterCard";
import { StickyEstimateBar } from "@/components/shared/StickyEstimateBar";
import { ProgressStepper } from "@/components/shared/ProgressStepper";
import { ConfigSection } from "./ConfigSection";
import { SummaryPanel } from "./SummaryPanel";
import { SaveActions } from "./SaveActions";
import { isTooSmall } from "@/lib/engine/fit-checker";
import type { EstimatorResult } from "@/types/estimator";

const PURPOSES = ["Prototype", "Functional Part", "End Use", "Tooling", "Art / Display", "Other"];
const PRIORITIES = ["Standard", "Rush (+20%)", "Economy (-10%)"];

export function ConfiguratorShell() {
  const store = useWizardStore();
  const viewer = useViewerStore();
  const { processFile } = useFileProcessor();
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const [showSummary, setShowSummary] = useState(false);

  // Auto-set branch to single (no more branch selector)
  useEffect(() => {
    if (!store.branch) store.setBranch("single");
  }, [store.branch]);

  const hasDims = store.x > 0 && store.y > 0 && store.z > 0;
  const tooSmall = hasDims && isTooSmall(store.x, store.y, store.z);
  const isReady = viewer.parseStatus === "ready";
  const density = FUSE1_CONFIG.nylonDensity;

  // ── Volume fallback: use bounding-box volume when no file-parsed volume ──
  // For manual dimension entry, vol stays 0 since no STL was parsed.
  // Approximate with full bounding box — conservative upper bound.
  const effectiveVol = store.vol > 0 ? store.vol : (hasDims ? store.x * store.y * store.z : 0);
  const sinteredVolCm3 = effectiveVol > 0 ? effectiveVol / 1000 : 0;
  const sinteredKg = sinteredVolCm3 > 0 ? (sinteredVolCm3 * density) / 1000 : 0;

  // ── Fit check: synchronous useMemo — no flash, no "Checking fit..." stuck state ──
  const computedPrinters = useMemo(() => {
    if (!hasDims) return [];
    return Object.entries(PRINTER_MAP).map(([key, config]) => {
      const fitResult = checkFitForPrinter(store.x, store.y, store.z, config);
      return {
        ...config,
        key,
        bestBH: fitResult.status === "fits" ? fitResult.best.bH : 0,
        bestOrient: fitResult.status === "fits" ? fitResult.best.label : "",
        fitResult,
      };
    });
  }, [store.x, store.y, store.z, hasDims]);

  // Sync computed printers to store (for contact page, etc.)
  useEffect(() => {
    store.setFittingPrinters(computedPrinters);
  }, [computedPrinters]);

  // Auto-select first fitting printer when printers change or selection is cleared
  useEffect(() => {
    const first = computedPrinters.find((p) => p.fitResult.status === "fits");
    if (first && !store.selectedPrinter) {
      store.setSelectedPrinter(first);
    }
  }, [computedPrinters, store.selectedPrinter]);

  const p = store.selectedPrinter || DEFAULT_PRINTER;

  const optimization = useMemo(() => {
    if (store.x <= 0 || store.y <= 0 || store.z <= 0 || !store.selectedPrinter) return null;
    return optimizeOrientation(store.x, store.y, store.z, sinteredKg, sinteredVolCm3, p, store.qty);
  }, [store.x, store.y, store.z, sinteredKg, sinteredVolCm3, p, store.qty, store.selectedPrinter]);

  const result: EstimatorResult | null = optimization?.best?.estimate ?? null;
  const orientLabel = optimization?.best?.orientation.label ?? "";

  const batchData = useMemo(() => {
    if (!optimization?.best || store.x <= 0) return null;
    const fit = optimization.best.fitResult;
    return computeOptimalBatches(store.x, store.y, store.z, p, fit, effectiveVol, density);
  }, [optimization, store.x, store.y, store.z, effectiveVol, p, density]);

  const fmtTime = (min: number) => {
    const h = Math.floor(min / 60);
    const m = Math.round(min % 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };
  const fmtTHB = (v: number) => `฿${v.toLocaleString()}`;

  const volDisplay = effectiveVol > 0
    ? effectiveVol > 1e6 ? `${(effectiveVol / 1e6).toFixed(2)} cm³` : `${effectiveVol.toFixed(1)} mm³`
    : null;
  const isEstimatedVol = store.vol === 0 && effectiveVol > 0;

  // ── Progress stepper logic ──
  const steps = [
    { label: "Dimensions", completed: hasDims, active: !hasDims },
    { label: "Setup", completed: hasDims && !!store.purpose, active: hasDims && !store.purpose },
    { label: "Printer", completed: !!store.selectedPrinter, active: hasDims && !store.selectedPrinter },
    { label: "Estimate", completed: !!result, active: !!store.selectedPrinter && !result },
  ];

  return (
    <div className="min-h-screen pt-16">
      {/* ── Porsche-style two-column layout ── */}
      <div className="flex flex-col lg:flex-row">
        {/* LEFT: Fixed 3D Viewer Panel */}
        <div className="lg:fixed lg:top-16 lg:left-0 lg:bottom-0 lg:w-[55%] bg-gray-light flex flex-col">
          <div className="flex-1 relative">
            {isReady && viewer.geometry ? (
              <ModelViewer
                geometry={viewer.geometry}
                dimensions={viewer.dimensions}
                volume={viewer.volume}
                triangleCount={viewer.triangleCount}
                fileName={viewer.fileName}
                fileSize={viewer.fileSize}
                wasInches={viewer.wasInches}
                parseStatus={viewer.parseStatus}
                parseProgress={viewer.parseProgress}
                className="h-full min-h-[400px] lg:min-h-0 !rounded-none"
              />
            ) : (
              /* Empty state with branding */
              <div className="h-full min-h-[250px] lg:min-h-0 flex flex-col items-center justify-center px-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: ease.cinematic }}
                  className="text-center"
                >
                  <p className="text-caption text-gray-muted tracking-widest uppercase mb-4">
                    Your design becomes reality
                  </p>
                  <h2 className="font-serif text-display text-gray-muted/20 font-bold leading-none">
                    SLS
                  </h2>
                  <div className="mt-8 max-w-sm mx-auto">
                    <DropZone onFileDrop={processFile} />
                    <p className="mt-3 text-micro text-gray-muted/60">
                      STL · OBJ · PLY · 3MF
                    </p>
                  </div>
                </motion.div>
              </div>
            )}

            {/* File info bar at bottom of viewer */}
            {isReady && (
              <div className="absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t border-gray-border/30 px-4 py-2 flex items-center justify-between">
                <div className="flex items-center gap-3 text-caption">
                  <span className="text-gray">{viewer.fileName}</span>
                  {viewer.wasInches && (
                    <span className="text-micro text-amber-600 font-medium px-2 py-0.5 bg-amber-50 rounded-lg">
                      converted from inches
                    </span>
                  )}
                </div>
                <DropZone
                  onFileDrop={processFile}
                  compact
                  className="!p-2 !border-0 hover:!bg-gray-light/50"
                />
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Scrollable Configuration Panel */}
        <div
          ref={rightPanelRef}
          className="lg:ml-[55%] w-full lg:w-[45%] min-h-[calc(100vh-4rem)]"
        >
          <motion.div
            variants={stagger(0.12, 0.1)}
            initial="initial"
            animate="animate"
            className="px-6 lg:px-10 py-8 space-y-0"
          >
            {/* Progress Stepper */}
            <motion.div variants={blurFadeUp}>
              <ProgressStepper steps={steps} />
            </motion.div>

            {/* Header */}
            <motion.div variants={blurFadeUp} className="mb-8">
              <h1 className="font-serif text-heading text-black">
                Print Configuration
              </h1>
              <p className="text-body text-gray mt-1">
                Configure your SLS print job for the Formlabs Fuse&nbsp;1+
              </p>
            </motion.div>

            {/* ═══ SECTION: Part Dimensions ═══ */}
            <ConfigSection
              title="Part Dimensions"
              subtitle="Upload a 3D file or enter dimensions manually"
              defaultOpen
            >
              {!isReady && (
                <>
                  <DropZone onFileDrop={processFile} />
                  <div className="flex items-center gap-4 my-4">
                    <div className="flex-1 h-px bg-gray-border/50" />
                    <span className="text-micro text-gray-muted font-semibold uppercase tracking-widest">
                      or enter manually
                    </span>
                    <div className="flex-1 h-px bg-gray-border/50" />
                  </div>
                </>
              )}

              <DimensionInputs
                x={store.x}
                y={store.y}
                z={store.z}
                vol={store.vol}
                onChange={(dims) => store.setDimensions(dims.x, dims.y, dims.z, dims.vol)}
                disabled={isReady}
              />

              {hasDims && (
                <div className="flex flex-wrap gap-3 mt-4 text-caption">
                  {volDisplay && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cream border border-gray-border/30">
                      <span className="text-gray">Volume</span>
                      <span className="font-semibold text-black">{volDisplay}</span>
                      {isEstimatedVol && (
                        <span className="text-micro text-amber-600 font-medium px-1.5 py-0.5 bg-amber-50 rounded">
                          bbox est.
                        </span>
                      )}
                    </div>
                  )}
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cream border border-gray-border/30">
                    <span className="text-gray">Bounding</span>
                    <span className="font-semibold text-black">
                      {store.x.toFixed(1)} × {store.y.toFixed(1)} × {store.z.toFixed(1)} mm
                    </span>
                  </div>
                </div>
              )}

              {tooSmall && (
                <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-caption text-amber-800">
                  <strong>Warning:</strong> One or more dimensions is below 3 mm.
                </div>
              )}
            </ConfigSection>

            {/* ═══ SECTION: Job Setup ═══ */}
            <ConfigSection
              title="Job Setup"
              subtitle="Quantity, purpose, and preferences"
            >
              {/* Quantity */}
              <div className="mb-5">
                <label className="text-micro uppercase tracking-widest text-gray font-semibold mb-1.5 block">
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  max="999"
                  value={store.qty}
                  onChange={(e) => store.setSetup({ qty: Math.max(1, parseInt(e.target.value) || 1) })}
                  className="w-24 px-3 py-2.5 rounded-xl text-body font-medium bg-white border border-gray-border focus:outline-none focus:ring-2 focus:ring-red/30 focus:ring-offset-2 focus:ring-offset-white text-black transition-all duration-300"
                />
              </div>

              {/* Purpose */}
              <div className="mb-5">
                <label className="text-micro uppercase tracking-widest text-gray font-semibold mb-1.5 block">
                  Purpose
                </label>
                <div className="flex flex-wrap gap-2">
                  {PURPOSES.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => store.setSetup({ purpose: opt })}
                      className={`px-3 py-1.5 rounded-xl text-caption font-medium border transition-all duration-300 ${
                        store.purpose === opt
                          ? "border-red bg-red/[0.04] text-red"
                          : "border-gray-border text-gray hover:border-gray-muted hover:text-black"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Priority */}
              <div className="mb-5">
                <label className="text-micro uppercase tracking-widest text-gray font-semibold mb-1.5 block">
                  Priority
                </label>
                <div className="flex flex-wrap gap-2">
                  {PRIORITIES.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => store.setSetup({ priority: opt })}
                      className={`px-3 py-1.5 rounded-xl text-caption font-medium border transition-all duration-300 ${
                        store.priority === opt
                          ? "border-red bg-red/[0.04] text-red"
                          : "border-gray-border text-gray hover:border-gray-muted hover:text-black"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color */}
              <div className="mb-5">
                <label className="text-micro uppercase tracking-widest text-gray font-semibold mb-1.5 block">
                  Color Preference
                </label>
                <input
                  type="text"
                  value={store.color}
                  onChange={(e) => store.setSetup({ color: e.target.value })}
                  placeholder="e.g., Natural grey, Dyed black"
                  className="w-full max-w-xs px-3 py-2.5 rounded-xl text-body font-medium bg-white border border-gray-border focus:outline-none focus:ring-2 focus:ring-red/30 focus:ring-offset-2 focus:ring-offset-white text-black placeholder:text-gray-muted/50 transition-all duration-300"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="text-micro uppercase tracking-widest text-gray font-semibold mb-1.5 block">
                  Notes
                </label>
                <textarea
                  value={store.notes}
                  onChange={(e) => store.setSetup({ notes: e.target.value })}
                  rows={2}
                  placeholder="Any special requirements..."
                  className="w-full px-3 py-2.5 rounded-xl text-body font-medium bg-white border border-gray-border focus:outline-none focus:ring-2 focus:ring-red/30 focus:ring-offset-2 focus:ring-offset-white text-black placeholder:text-gray-muted/50 resize-none transition-all duration-300"
                />
              </div>
            </ConfigSection>

            {/* ═══ SECTION: Printer Fit ═══ */}
            <ConfigSection
              title="Printer"
              subtitle="Automatic fit check against the Fuse 1+ chamber"
            >
              {!hasDims ? (
                <p className="text-caption text-gray-muted text-center py-4">
                  Enter dimensions above to check printer fit.
                </p>
              ) : computedPrinters.length === 0 ? (
                <p className="text-caption text-gray-muted text-center py-4">
                  No printers available for these dimensions.
                </p>
              ) : (
                <div className="space-y-3">
                  {computedPrinters.map((printer) => (
                    <PrinterCard
                      key={printer.key}
                      printer={printer}
                      selected={store.selectedPrinter?.key === printer.key}
                      onSelect={() => {
                        if (printer.fitResult.status === "fits") store.setSelectedPrinter(printer);
                      }}
                    />
                  ))}
                </div>
              )}
            </ConfigSection>

            {/* ═══ SECTION: Estimate Results ═══ */}
            {result && (
              <ConfigSection
                title="Your Estimate"
                subtitle={`${store.qty}× part${store.qty > 1 ? "s" : ""} on ${p.name}`}
                defaultOpen
              >
                {orientLabel && (
                  <div className="flex gap-2 flex-wrap mb-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-green-50 border border-green-200 text-micro font-semibold text-green-700">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Cost-optimal: {orientLabel}
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4 mb-4">
                  <CostBreakdownCard result={result} />
                  <TimeBreakdownCard result={result} />
                </div>

                {batchData && batchData.brackets.length > 1 && (
                  <div className="mb-4">
                    <QuantityCostTable data={batchData} currentQty={store.qty} />
                  </div>
                )}

                {/* Job Details Summary */}
                <div className="bg-cream border border-gray-border/30 rounded-2xl p-5 space-y-2 mb-6">
                  <h3 className="text-micro uppercase tracking-widest text-gray-muted font-bold mb-3">Job Details</h3>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-caption">
                    <span className="text-gray">Dimensions</span>
                    <span className="font-semibold text-black">{store.x.toFixed(1)} × {store.y.toFixed(1)} × {store.z.toFixed(1)} mm</span>
                    {volDisplay && (
                      <>
                        <span className="text-gray">Volume</span>
                        <span className="font-semibold text-black">
                          {volDisplay}
                          {isEstimatedVol && <span className="text-micro text-amber-600 ml-1">(est.)</span>}
                        </span>
                      </>
                    )}
                    <span className="text-gray">Quantity</span>
                    <span className="font-semibold text-black">{store.qty}</span>
                    <span className="text-gray">Orientation</span>
                    <span className="font-semibold text-black">{orientLabel || "Default"}</span>
                    <span className="text-gray">Builds needed</span>
                    <span className="font-semibold text-black">{result.builds}</span>
                    <span className="text-gray">Total time</span>
                    <span className="font-semibold text-black">{fmtTime(result.totalMinAll)}</span>
                    <span className="text-gray">Total cost</span>
                    <span className="font-semibold text-black">{fmtTHB(result.finalQuote)}</span>
                    <span className="text-gray">Purpose</span>
                    <span className="font-semibold text-black">{store.purpose || "—"}</span>
                    {store.color && (
                      <>
                        <span className="text-gray">Color</span>
                        <span className="font-semibold text-black">{store.color}</span>
                      </>
                    )}
                    <span className="text-gray">Priority</span>
                    <span className="font-semibold text-black">{store.priority || "Standard"}</span>
                    {store.notes && (
                      <>
                        <span className="text-gray">Notes</span>
                        <span className="font-semibold text-black">{store.notes}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Save / PDF / Email actions (Porsche-style) */}
                <SaveActions
                  result={result}
                  store={store}
                  fmtTime={fmtTime}
                  fmtTHB={fmtTHB}
                  orientLabel={orientLabel}
                  volDisplay={volDisplay}
                  density={density}
                  sinteredVolCm3={sinteredVolCm3}
                />
              </ConfigSection>
            )}

            {/* Show prompt when no estimate */}
            {!result && hasDims && store.selectedPrinter && (
              <div className="border-t border-gray-border/30 py-8 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 border border-amber-200">
                  <svg className="w-4 h-4 text-amber-600 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <p className="text-caption text-amber-800 font-medium">Computing estimate...</p>
                </div>
                <p className="text-micro text-gray-muted mt-2">If this persists, try adjusting dimensions or volume.</p>
              </div>
            )}

            {!result && hasDims && !store.selectedPrinter && (
              <div className="border-t border-gray-border/30 py-8 text-center">
                <p className="text-caption text-gray-muted">No compatible printer found for these dimensions.</p>
                <p className="text-micro text-gray-muted/60 mt-1">Try reducing the part size.</p>
              </div>
            )}

            {/* Bottom action bar */}
            <div className="border-t border-gray-border/30 py-8 flex items-center justify-between">
              <button
                onClick={() => {
                  store.reset();
                  viewer.reset();
                }}
                className="px-5 py-2.5 rounded-xl text-caption font-medium text-gray hover:text-black border border-gray-border hover:border-gray-muted transition-all duration-200"
              >
                New Configuration
              </button>
              {result && (
                <button
                  onClick={() => setShowSummary(true)}
                  className="px-6 py-2.5 rounded-xl text-caption font-bold bg-red text-white hover:bg-red-dark active:scale-[0.97] transition-all duration-300 shadow-btn"
                >
                  Request Quote
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Sticky Estimate Bar ── */}
      <AnimatePresence>
        {result && !showSummary && (
          <StickyEstimateBar
            cost={fmtTHB(result.finalQuote)}
            time={fmtTime(result.totalMinAll)}
            builds={result.builds}
            qty={store.qty}
            onRequestQuote={() => setShowSummary(true)}
          />
        )}
      </AnimatePresence>

      {/* ── Summary / Quote Request Modal ── */}
      <AnimatePresence>
        {showSummary && result && (
          <SummaryPanel
            store={store}
            result={result}
            orientLabel={orientLabel}
            volDisplay={volDisplay}
            fmtTime={fmtTime}
            fmtTHB={fmtTHB}
            onClose={() => setShowSummary(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
