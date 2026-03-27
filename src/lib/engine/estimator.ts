import { FUSE1_CONFIG, FUSE1_COSTS } from "./config";
import type {
  EstimatorInput,
  EstimatorResult,
  PowderResult,
  LayerResult,
  FullEstimateResult,
} from "@/types/estimator";

// ═══════════════════════════════════════════════════════════════
//  CALIBRATED ESTIMATOR ENGINE — BLACK BOX
//  ⚠️  DO NOT MODIFY THE MATH — these are calibrated constants.
// ═══════════════════════════════════════════════════════════════

const r2 = (v: number): number => Math.round(v * 100) / 100;

/**
 * Core estimator engine.
 * Computes full time and cost breakdown from job parameters.
 */
export function runEstimator(job: EstimatorInput): EstimatorResult {
  const cfg = FUSE1_CONFIG;
  const {
    layers,
    powderL = 0,
    powderKg = 0,
    sinteredKg = 0,
    builds = 1,
  } = job;

  // Sintered volume (cm³) — from mass if not provided directly
  const sinteredVolCm3 =
    job.sinteredVolCm3 || (sinteredKg / cfg.nylonDensity) * 1000;

  // ── Printing ──
  const printOverheadMin = cfg.printOverheadS / 60;
  const recoatMin = (cfg.recoatSecPerLayer * layers) / 60;
  const scanMin = (cfg.scanSecPerCm3 * sinteredVolCm3) / 60;
  const printingMin = printOverheadMin + recoatMin + scanMin;

  // Mass packing density (for display)
  const massMPD =
    powderKg > 0 ? Math.min(100, (sinteredKg / powderKg) * 100) : 0;

  // ── Cooling ──
  const pL = powderL > 0 ? powderL : powderKg / cfg.powderBulkDensity;
  const rawCooling =
    cfg.coolingIntercept +
    cfg.coolingPowderCoeff * Math.sqrt(pL) +
    cfg.coolingSinterCoeff * sinteredKg;
  const coolingMin = Math.max(cfg.coolingFloorMin, rawCooling);

  // ── Total wall-clock ──
  const totalMinSingle =
    cfg.preprintMin + printingMin + cfg.coolTo100Min + coolingMin;
  const totalMinAll =
    cfg.preprintMin +
    (printingMin + cfg.coolTo100Min + coolingMin) * builds;

  // ── Cost ──
  const rates = FUSE1_COSTS;
  const totalHrsExact = totalMinAll / 60;
  const remMin = (totalHrsExact % 1) * 60;
  let elecHrs: number;
  if (remMin < 25) {
    elecHrs = Math.floor(totalHrsExact);
  } else if (remMin > 35) {
    elecHrs = Math.floor(totalHrsExact) + 1;
  } else {
    elecHrs = Math.floor(totalHrsExact) + (remMin > 30 ? 1 : 0);
  }

  const electricityCost = elecHrs * rates.electricityHr;
  const materialCost = sinteredKg * 1000 * rates.powderPerG * builds;

  // FIX: Machine amortization is charged PER BUILD, not per job.
  // Each build cycle wears the machine equally — multi-build jobs must account for this.
  const machineCostTotal = rates.machine * builds;

  const finalQuote =
    rates.initial +
    machineCostTotal +
    rates.postProcess +
    electricityCost +
    materialCost;

  return {
    preprintMin: cfg.preprintMin,
    printingMin: r2(printingMin),
    printOverheadMin: r2(printOverheadMin),
    recoatMin: r2(recoatMin),
    scanMin: r2(scanMin),
    coolTo100Min: cfg.coolTo100Min,
    coolingMin: r2(coolingMin),
    cooldownTotalMin: r2(cfg.coolTo100Min + coolingMin),
    totalMinSingle: r2(totalMinSingle),
    totalMinAll: r2(totalMinAll),
    massMPD: r2(massMPD),
    sinteredVolCm3: r2(sinteredVolCm3),
    builds,
    elecHrs,
    materialCost: Math.round(materialCost),
    electricityCost: Math.round(electricityCost),
    initialCost: rates.initial,
    machineCost: machineCostTotal,
    postProcess: rates.postProcess,
    finalQuote: Math.round(finalQuote),
    rates,
  };
}

/**
 * Compute powder L and kg from build height (mm).
 */
export function calcPowder(buildHeightMm: number): PowderResult {
  const cfg = FUSE1_CONFIG;
  const chamberL = (cfg.chamberX * cfg.chamberY * buildHeightMm) / 1e6;
  const powderL = cfg.powderMultiplier * chamberL + cfg.powderBase;
  const powderKg = powderL * cfg.powderBulkDensity;
  return {
    chamberL: Math.round(chamberL * 10000) / 10000,
    powderL: Math.round(powderL * 1000) / 1000,
    powderKg: Math.round(powderKg * 1000) / 1000,
  };
}

/**
 * Compute layers and build height from raw STL Z.
 */
export function calcLayers(stlZmm: number): LayerResult {
  const cfg = FUSE1_CONFIG;
  const buildHeightMm = stlZmm + cfg.zGapMm;
  const layers = Math.ceil(buildHeightMm / cfg.layerMm);
  return { buildHeightMm, layers };
}

/**
 * Full pipeline: STL dimensions → complete estimate.
 */
export function estimateFromSTL(
  stlZmm: number,
  sinteredKg: number,
  sinteredVolCm3?: number,
  builds: number = 1
): FullEstimateResult {
  const { buildHeightMm, layers } = calcLayers(stlZmm);
  const { powderL, powderKg } = calcPowder(buildHeightMm);
  const result = runEstimator({
    layers,
    powderL,
    powderKg,
    sinteredKg,
    sinteredVolCm3:
      sinteredVolCm3 || (sinteredKg / FUSE1_CONFIG.nylonDensity) * 1000,
    builds,
  });
  return { buildHeightMm, layers, powderL, powderKg, ...result };
}
