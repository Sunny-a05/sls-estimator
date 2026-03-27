/**
 * Orientation Optimizer — ranks all 6 axis-aligned orientations by COST, not height.
 *
 * Key insight from calibration: minimum build height ≠ minimum cost.
 * Powder cost dominates SLS economics, and chamber height drives powder volume.
 * But scan time depends on sintered volume per layer, so the optimal orientation
 * balances layer count vs. scan density vs. powder consumption.
 *
 * This module tests all 6 orientations, runs a full cost estimate for each,
 * and returns them ranked cheapest-first.
 */

import type { PrinterConfig, Orientation, FitResult } from "@/types/printer";
import { estimateFromSTL } from "./estimator";
import { checkFitForPrinter } from "./fit-checker";
import type { FullEstimateResult } from "@/types/estimator";

export interface OrientationCostResult {
  orientation: Orientation;
  fitResult: FitResult;
  estimate: FullEstimateResult | null;
  costPerPart: number;
  totalMin: number;
  layers: number;
  buildHeightMm: number;
}

export interface OptimizationResult {
  ranked: OrientationCostResult[];
  best: OrientationCostResult | null;
  allTooBig: boolean;
}

/**
 * Generate all 6 axis-aligned orientations from part dimensions.
 */
function allOrientations(x: number, y: number, z: number): Orientation[] {
  return [
    { bH: z, fW: x, fD: y, label: "Z up (default)" },
    { bH: z, fW: y, fD: x, label: "Z up, rotated 90°" },
    { bH: x, fW: y, fD: z, label: "X up" },
    { bH: x, fW: z, fD: y, label: "X up, rotated 90°" },
    { bH: y, fW: x, fD: z, label: "Y up" },
    { bH: y, fW: z, fD: x, label: "Y up, rotated 90°" },
  ];
}

/**
 * Test all 6 orientations and rank by total cost (cheapest first).
 *
 * @param x            Part width (mm)
 * @param y            Part depth (mm)
 * @param z            Part height (mm)
 * @param sinteredKg   Part sintered mass (kg)
 * @param sinteredVolCm3  Part sintered volume (cm³)
 * @param printer      Printer config
 * @param qty          Number of parts (default 1)
 */
export function optimizeOrientation(
  x: number,
  y: number,
  z: number,
  sinteredKg: number,
  sinteredVolCm3: number,
  printer: PrinterConfig,
  qty: number = 1
): OptimizationResult {
  const orientations = allOrientations(x, y, z);
  const results: OrientationCostResult[] = [];

  for (const orient of orientations) {
    // Check if this orientation fits
    const margin = 2;
    const fitW = orient.fW <= printer.x - margin;
    const fitD = orient.fD <= printer.y - margin;
    const fitH = orient.bH <= printer.z - margin;

    if (!fitW || !fitD || !fitH) {
      results.push({
        orientation: orient,
        fitResult: {
          status: "too-big",
          name: printer.short,
          reason: `Exceeds chamber in this orientation`,
          orientations: [],
        },
        estimate: null,
        costPerPart: Infinity,
        totalMin: Infinity,
        layers: 0,
        buildHeightMm: orient.bH,
      });
      continue;
    }

    // Run full estimate for this orientation
    const estimate = estimateFromSTL(
      orient.bH,
      sinteredKg,
      sinteredVolCm3,
      qty
    );

    results.push({
      orientation: orient,
      fitResult: {
        status: "fits",
        name: printer.short,
        best: orient,
        orientations: [orient],
        layers: estimate.layers,
        count: 1,
      },
      estimate,
      costPerPart: estimate.finalQuote / qty,
      totalMin: estimate.totalMinAll,
      layers: estimate.layers,
      buildHeightMm: estimate.buildHeightMm,
    });
  }

  // Sort by cost (cheapest first), then by time as tiebreaker
  const ranked = results
    .filter((r) => r.estimate !== null)
    .sort((a, b) => {
      const costDiff = a.costPerPart - b.costPerPart;
      if (Math.abs(costDiff) > 0.01) return costDiff;
      return a.totalMin - b.totalMin;
    });

  return {
    ranked,
    best: ranked.length > 0 ? ranked[0] : null,
    allTooBig: ranked.length === 0,
  };
}
