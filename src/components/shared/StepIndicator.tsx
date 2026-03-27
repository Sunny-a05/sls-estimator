"use client";

import { motion } from "framer-motion";

interface Step {
  label: string;
  shortLabel?: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export function StepIndicator({ steps, currentStep, onStepClick }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-1" role="navigation" aria-label="Wizard steps">
      {steps.map((step, i) => {
        const stepNum = i + 1;
        const isActive = stepNum === currentStep;
        const isDone = stepNum < currentStep;
        const isFuture = stepNum > currentStep;

        return (
          <div key={i} className="flex items-center gap-1">
            {/* Dot */}
            <button
              onClick={() => {
                if (!isFuture && onStepClick) onStepClick(stepNum);
              }}
              disabled={isFuture}
              aria-label={`Step ${stepNum}: ${step.label}`}
              aria-current={isActive ? "step" : undefined}
              className={`
                relative flex items-center justify-center
                w-8 h-8 rounded-full text-micro font-bold
                transition-all duration-400 ease-smooth
                ${isActive
                  ? "bg-red text-white shadow-step-active"
                  : isDone
                    ? "bg-red/10 text-red cursor-pointer hover:bg-red/20"
                    : "bg-gray-light text-gray-muted cursor-not-allowed"
                }
              `}
            >
              {isDone ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                stepNum
              )}

              {/* Active pulse ring */}
              {isActive && (
                <motion.div
                  layoutId="step-ring"
                  className="absolute inset-0 rounded-full border-2 border-red/30"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </button>

            {/* Label (visible on larger screens) */}
            <span
              className={`
                hidden sm:inline text-micro font-semibold
                transition-colors duration-300
                ${isActive ? "text-red" : isDone ? "text-black" : "text-gray-muted"}
              `}
            >
              {step.shortLabel || step.label}
            </span>

            {/* Connector line */}
            {i < steps.length - 1 && (
              <div className="w-6 sm:w-10 h-px mx-1">
                <div
                  className={`
                    h-full transition-colors duration-400
                    ${isDone ? "bg-red/30" : "bg-gray-border"}
                  `}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
