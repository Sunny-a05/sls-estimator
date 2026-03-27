"use client";

import { useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { pageTransition } from "@/lib/motion";
import { useWizardStore } from "@/stores/wizard-store";
import { useViewerStore } from "@/stores/viewer-store";
import { useFileProcessor } from "@/hooks/useFileProcessor";
import { checkFitForPrinter } from "@/lib/engine/fit-checker";
import { PRINTER_MAP } from "@/config/printers";

import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { WizardSidebar } from "./WizardSidebar";
import { BranchSelector } from "./BranchSelector";
import { Step1Dimensions } from "./Step1Dimensions";
import { Step2Setup } from "./Step2Setup";
import { Step3Printer } from "./Step3Printer";
import { Step4Material } from "./Step4Material";
import { Step5Results } from "./Step5Results";
import type { WizardStep } from "@/types/wizard";

export function WizardShell() {
  const store = useWizardStore();
  const viewer = useViewerStore();
  const { processFile } = useFileProcessor();

  // Run fit check across all printers when dimensions change
  useEffect(() => {
    if (store.x <= 0 || store.y <= 0 || store.z <= 0) return;

    const results = Object.entries(PRINTER_MAP).map(([key, config]) => {
      const fitResult = checkFitForPrinter(
        store.x, store.y, store.z, config
      );
      return {
        ...config,
        key,
        bestBH: fitResult.status === "fits" ? fitResult.best.bH : 0,
        bestOrient: fitResult.status === "fits" ? fitResult.best.label : "",
        fitResult,
      };
    });

    store.setFittingPrinters(results);

    // Auto-select first fitting printer
    const first = results.find((p) => p.fitResult.status === "fits");
    if (first && !store.selectedPrinter) {
      store.setSelectedPrinter(first);
    }
  }, [store.x, store.y, store.z]);

  const goTo = useCallback((step: number) => {
    if (step >= 1 && step <= 5) {
      store.setStep(step as WizardStep);
    }
  }, [store]);

  const handleNext = useCallback(() => {
    if (store.step < 5) store.setStep((store.step + 1) as WizardStep);
  }, [store]);

  const handleBack = useCallback(() => {
    if (store.step > 1) store.setStep((store.step - 1) as WizardStep);
  }, [store]);

  // If no branch selected yet, show branch selector
  if (!store.branch) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center px-6">
        <div className="w-full max-w-2xl">
          <BranchSelector onSelect={(mode) => store.setBranch(mode)} />
        </div>
      </div>
    );
  }

  const sidebar = (
    <WizardSidebar
      step={store.step}
      onStepClick={goTo}
      dims={{ x: store.x, y: store.y, z: store.z }}
      qty={store.qty}
      printerName={store.selectedPrinter?.name}
      materialName={store.materialMatch?.name}
    />
  );

  return (
    <SidebarLayout sidebar={sidebar}>
      <div className="p-6 lg:p-10 max-w-3xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={store.step}
            variants={pageTransition}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {store.step === 1 && (
              <Step1Dimensions
                x={store.x}
                y={store.y}
                z={store.z}
                vol={store.vol}
                onDimensionsChange={(dims) =>
                  store.setDimensions(dims.x, dims.y, dims.z, dims.vol)
                }
                hasFile={viewer.parseStatus === "ready"}
                onFileDrop={processFile}
                onNext={handleNext}
              />
            )}

            {store.step === 2 && (
              <Step2Setup
                qty={store.qty}
                purpose={store.purpose}
                color={store.color}
                priority={store.priority}
                notes={store.notes}
                onUpdate={(data) => store.setSetup(data)}
                onNext={handleNext}
                onBack={handleBack}
              />
            )}

            {store.step === 3 && (
              <Step3Printer
                fittingPrinters={store.fittingPrinters}
                selectedPrinter={store.selectedPrinter}
                onSelectPrinter={(p) => store.setSelectedPrinter(p)}
                onNext={handleNext}
                onBack={handleBack}
              />
            )}

            {store.step === 4 && (
              <Step4Material
                selectedMaterial={store.materialMatch}
                onSelectMaterial={(m) => store.setMaterialMatch(m)}
                onNext={handleNext}
                onBack={handleBack}
              />
            )}

            {store.step === 5 && (
              <Step5Results
                x={store.x}
                y={store.y}
                z={store.z}
                vol={store.vol}
                qty={store.qty}
                printer={store.selectedPrinter}
                material={store.materialMatch}
                purpose={store.purpose}
                color={store.color}
                priority={store.priority}
                notes={store.notes}
                onBack={handleBack}
                onReset={store.reset}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </SidebarLayout>
  );
}
