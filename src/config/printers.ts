import type { PrinterConfig } from "@/types/printer";

/**
 * Printer configuration map.
 * Chamber dimensions must match FUSE1_CONFIG in lib/engine/config.ts.
 * The Fuse 1+ 30W build volume is 165 × 165 × 300 mm (per Formlabs spec sheet).
 */
export const PRINTER_MAP: Record<string, PrinterConfig> = {
  fuse1plus: {
    name: "Fuse 1+ 30W (Formlabs SLS)",
    short: "Fuse 1+ 30W",
    x: 165,
    y: 165,
    z: 300,
    costPerHr: 8,
    lt: 0.11,
    minFeature: 1.0,
    note: "Min. wall 0.7 mm, min. feature 0.5 mm, 110 µm layer height",
  },
};

/** Convenience alias — the only printer we support right now. */
export const DEFAULT_PRINTER_KEY = "fuse1plus";
export const DEFAULT_PRINTER = PRINTER_MAP[DEFAULT_PRINTER_KEY];
