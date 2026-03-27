import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { WizardStep, BranchMode } from "@/types/wizard";
import type { FittingPrinter } from "@/types/printer";
import type { Material } from "@/types/material";

interface WizardStoreState {
  step: WizardStep;
  branch: BranchMode;
  preset: string;
  purpose: string;
  qty: number;
  color: string;
  priority: string;
  notes: string;
  x: number;
  y: number;
  z: number;
  vol: number;
  fittingPrinters: FittingPrinter[];
  selectedPrinter: FittingPrinter | null;
  materialMatch: Material | null;

  setStep: (step: WizardStep) => void;
  setBranch: (branch: BranchMode) => void;
  setDimensions: (x: number, y: number, z: number, vol?: number) => void;
  setSetup: (data: Partial<Pick<WizardStoreState, "preset" | "purpose" | "qty" | "color" | "priority" | "notes">>) => void;
  setFittingPrinters: (printers: FittingPrinter[]) => void;
  setSelectedPrinter: (printer: FittingPrinter | null) => void;
  setMaterialMatch: (material: Material | null) => void;
  reset: () => void;
}

const initialState = {
  step: 1 as WizardStep,
  branch: null as BranchMode,
  preset: "Prototype",
  purpose: "",
  qty: 1,
  color: "",
  priority: "",
  notes: "",
  x: 0,
  y: 0,
  z: 0,
  vol: 0,
  fittingPrinters: [] as FittingPrinter[],
  selectedPrinter: null as FittingPrinter | null,
  materialMatch: null as Material | null,
};

export const useWizardStore = create<WizardStoreState>()(
  persist(
    (set) => ({
      ...initialState,

      setStep: (step) => set({ step }),
      setBranch: (branch) => set({ branch }),
      setDimensions: (x, y, z, vol) =>
        set({
          x,
          y,
          z,
          vol: vol ?? 0,
          // Don't clear fittingPrinters/selectedPrinter here —
          // ConfiguratorShell useMemo recomputes them synchronously,
          // preventing the "Checking fit..." flash on every keystroke.
        }),
      setSetup: (data) => set(data),
      setFittingPrinters: (printers) => set({ fittingPrinters: printers }),
      setSelectedPrinter: (printer) => set({ selectedPrinter: printer }),
      setMaterialMatch: (material) => set({ materialMatch: material }),
      reset: () => set(initialState),
    }),
    {
      name: "sls-wizard",
      storage: createJSONStorage(() => {
        if (typeof window === "undefined") {
          return { getItem: () => null, setItem: () => {}, removeItem: () => {} };
        }
        return localStorage;
      }),
      partialize: (state) => ({
        step: state.step,
        branch: state.branch,
        preset: state.preset,
        purpose: state.purpose,
        qty: state.qty,
        color: state.color,
        priority: state.priority,
        notes: state.notes,
        x: state.x,
        y: state.y,
        z: state.z,
        vol: state.vol,
      }),
    }
  )
);
