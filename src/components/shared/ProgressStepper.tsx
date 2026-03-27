"use client";

import { motion } from "framer-motion";

interface Step {
  label: string;
  completed: boolean;
  active: boolean;
}

interface ProgressStepperProps {
  steps: Step[];
}

export function ProgressStepper({ steps }: ProgressStepperProps) {
  return (
    <div className="flex items-center gap-1 mb-8">
      {steps.map((step, i) => (
        <div key={step.label} className="flex items-center gap-1 flex-1">
          {/* Step dot + label */}
          <div className="flex items-center gap-2 min-w-0">
            <motion.div
              initial={false}
              animate={{
                backgroundColor: step.completed
                  ? "#C0392B"
                  : step.active
                  ? "#C0392B"
                  : "#E5E7EB",
                scale: step.active ? 1.15 : 1,
              }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            >
              {step.completed && (
                <motion.svg
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-2.5 h-2.5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={4}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </motion.svg>
              )}
            </motion.div>
            <span
              className={`text-micro font-semibold uppercase tracking-widest truncate transition-colors duration-300 ${
                step.active || step.completed
                  ? "text-black"
                  : "text-gray-muted/50"
              }`}
            >
              {step.label}
            </span>
          </div>

          {/* Connector line */}
          {i < steps.length - 1 && (
            <div className="flex-1 h-px mx-1 relative">
              <div className="absolute inset-0 bg-gray-border/40 rounded-full" />
              <motion.div
                initial={false}
                animate={{
                  scaleX: step.completed ? 1 : 0,
                }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 bg-red rounded-full origin-left"
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
