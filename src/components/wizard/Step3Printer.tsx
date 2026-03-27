"use client";

import { motion } from "framer-motion";
import { fadeUp, stagger, scaleFade } from "@/lib/motion";
import { PrinterCard } from "@/components/shared/PrinterCard";
import type { FittingPrinter } from "@/types/printer";

interface Step3Props {
  fittingPrinters: FittingPrinter[];
  selectedPrinter: FittingPrinter | null;
  onSelectPrinter: (printer: FittingPrinter) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step3Printer({
  fittingPrinters,
  selectedPrinter,
  onSelectPrinter,
  onNext,
  onBack,
}: Step3Props) {
  return (
    <motion.div
      variants={stagger(0.1, 0.1)}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-8"
    >
      <motion.div variants={fadeUp}>
        <h2 className="font-serif text-heading text-black mb-1">Printer Fit</h2>
        <p className="text-body text-gray">
          We check your part against the Fuse 1+ chamber in all 6 orientations.
        </p>
      </motion.div>

      {fittingPrinters.length === 0 ? (
        <motion.div variants={scaleFade} className="p-8 rounded-2xl bg-cream text-center space-y-4">
          {/* Animated bounding box */}
          <div className="relative mx-auto w-16 h-16">
            <motion.div
              className="absolute inset-0 border-2 border-red/40 rounded-lg"
              animate={{
                scale: [1, 1.15, 1],
                borderColor: ["rgba(200,16,46,0.4)", "rgba(200,16,46,0.15)", "rgba(200,16,46,0.4)"],
              }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute inset-2 border-2 border-dashed border-red/25 rounded"
              animate={{ rotate: [0, 90, 180, 270, 360] }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={{ scale: [0.9, 1.05, 0.9] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-red">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              </svg>
            </motion.div>
          </div>
          <div>
            <p className="text-body font-medium text-black">Checking printer fit</p>
            <p className="text-caption text-gray mt-1">Testing all 6 orientations...</p>
          </div>
        </motion.div>
      ) : (
        <motion.div variants={stagger(0.08)} className="space-y-3">
          {fittingPrinters.map((printer) => (
            <PrinterCard
              key={printer.key}
              printer={printer}
              selected={selectedPrinter?.key === printer.key}
              onSelect={() => {
                if (printer.fitResult.status === "fits") onSelectPrinter(printer);
              }}
            />
          ))}
        </motion.div>
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
          disabled={!selectedPrinter}
          className="
            px-6 py-2.5 rounded-xl text-caption font-bold
            bg-red text-white hover:bg-red-dark active:scale-[0.97]
            disabled:opacity-40 disabled:cursor-not-allowed
            transition-all duration-300 ease-smooth shadow-btn
          "
        >
          Continue
        </button>
      </motion.div>
    </motion.div>
  );
}
