import { create } from "zustand";
import type { PackItem, PackResult, PackConfig } from "@/types/packing";

export interface BuilderPart {
  id: string;
  fileName: string;
  fileSize: number;
  x: number;
  y: number;
  z: number;
  volume: number;
  triangleCount: number;
  quantity: number;
  parseStatus: "parsing" | "ready" | "error";
  errorMessage?: string;
}

type BuilderStep = 1 | 2 | 3 | 4;

interface BuilderState {
  step: BuilderStep;
  parts: BuilderPart[];
  selectedPrinter: string;
  layerHeight: number;
  materialName: string;
  packConfig: PackConfig;
  packResult: PackResult | null;

  setStep: (step: BuilderStep) => void;
  addPart: (part: BuilderPart) => void;
  updatePart: (id: string, updates: Partial<BuilderPart>) => void;
  removePart: (id: string) => void;
  setPartQuantity: (id: string, qty: number) => void;
  setSelectedPrinter: (key: string) => void;
  setLayerHeight: (lt: number) => void;
  setMaterialName: (name: string) => void;
  setPackConfig: (config: Partial<PackConfig>) => void;
  setPackResult: (result: PackResult | null) => void;
  reset: () => void;
}

const defaultPackConfig: PackConfig = {
  spacing: 5,
  allowRotation: true,
  bedWidth: 165,
  bedDepth: 165,
  bedHeight: 300,
};

const initialState = {
  step: 1 as BuilderStep,
  parts: [] as BuilderPart[],
  selectedPrinter: "fuse1plus",
  layerHeight: 0.11,
  materialName: "Nylon 12",
  packConfig: defaultPackConfig,
  packResult: null as PackResult | null,
};

export const useBuilderStore = create<BuilderState>((set) => ({
  ...initialState,

  setStep: (step) => set({ step }),

  addPart: (part) => set((s) => ({ parts: [...s.parts, part] })),

  updatePart: (id, updates) =>
    set((s) => ({
      parts: s.parts.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    })),

  removePart: (id) =>
    set((s) => ({ parts: s.parts.filter((p) => p.id !== id) })),

  setPartQuantity: (id, qty) =>
    set((s) => ({
      parts: s.parts.map((p) => (p.id === id ? { ...p, quantity: Math.max(1, qty) } : p)),
    })),

  setSelectedPrinter: (key) => set({ selectedPrinter: key }),

  setLayerHeight: (lt) => set({ layerHeight: lt }),

  setMaterialName: (name) => set({ materialName: name }),

  setPackConfig: (config) =>
    set((s) => ({ packConfig: { ...s.packConfig, ...config } })),

  setPackResult: (result) => set({ packResult: result }),

  reset: () => set(initialState),
}));
