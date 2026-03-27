"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ease } from "@/lib/motion";

interface ConfigSectionProps {
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export function ConfigSection({ title, subtitle, defaultOpen = false, children }: ConfigSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-t border-gray-border/50">
      {/* Section header — always visible, click to toggle */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full py-5 flex items-center justify-between text-left group"
      >
        <div>
          <h2 className="font-serif text-subheading text-black group-hover:text-red transition-colors duration-200">
            {title}
          </h2>
          {subtitle && (
            <p className="text-caption text-gray mt-0.5">{subtitle}</p>
          )}
        </div>
        <motion.div
          animate={{ rotate: open ? 0 : -90 }}
          transition={{ duration: 0.3, ease: ease.smooth }}
          className="w-6 h-6 flex items-center justify-center shrink-0 text-gray group-hover:text-black transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {open ? (
              <line x1="5" y1="12" x2="19" y2="12" />
            ) : (
              <>
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </>
            )}
          </svg>
        </motion.div>
      </button>

      {/* Collapsible content */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: ease.smooth }}
            className="overflow-hidden"
          >
            <div className="pb-6">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
