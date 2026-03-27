import type { FittingPrinter } from "./printer";
import type { Material } from "./material";

export type WizardStep = 1 | 2 | 3 | 4 | 5;
export type BranchMode = "single" | "multi" | null;

export interface WizardState {
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
}
