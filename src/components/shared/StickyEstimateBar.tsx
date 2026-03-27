"use client";

import { motion, AnimatePresence } from "framer-motion";

interface StickyEstimateBarProps {
  cost: string;
  time: string;
  builds: number;
  qty: number;
  onRequestQuote: () => void;
}

export function StickyEstimateBar({
  cost,
  time,
  builds,
  qty,
  onRequestQuote,
}: StickyEstimateBarProps) {
  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 80, opacity: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="fixed bottom-0 left-0 right-0 z-40 lg:left-[55%]"
    >
      <div className="bg-white/90 backdrop-blur-xl border-t border-gray-border/50 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="px-6 lg:px-10 py-3 flex items-center justify-between gap-4">
          {/* Estimate details */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <motion.span
                key={cost}
                initial={{ scale: 1.1, color: "#C0392B" }}
                animate={{ scale: 1, color: "#000000" }}
                transition={{ duration: 0.4 }}
                className="font-serif text-lg font-bold text-black"
              >
                {cost}
              </motion.span>
              <span className="text-gray-muted">·</span>
              <motion.span
                key={time}
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 1 }}
                className="text-caption font-medium text-gray"
              >
                {time}
              </motion.span>
              <span className="text-gray-muted">·</span>
              <span className="text-caption text-gray-muted">
                {builds} build{builds !== 1 ? "s" : ""} · {qty}×
              </span>
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={onRequestQuote}
            className="
              flex-shrink-0 px-5 py-2.5 rounded-xl
              text-caption font-bold bg-red text-white
              hover:bg-red-dark active:scale-[0.97]
              transition-all duration-200
              shadow-btn hover:shadow-btn-hover
            "
          >
            Request Quote
          </button>
        </div>
      </div>
    </motion.div>
  );
}
