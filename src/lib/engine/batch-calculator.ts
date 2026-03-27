import { FUSE1_CONFIG } from "./config";
import { runEstimator, calcPowder } from "./estimator";
import { checkFitForPrinter } from "./fit-checker";
import type { PrinterConfig, FitResult } from "@/types/printer";

// ═══════════════════════════════════════════════════════════════
//  OPTIMAL BATCH CALCULATOR ENGINE
//  Computes cost-per-part across quantity brackets, finds the
//  cheapest quantity, and flags when packing strategy should switch.
// ═══════════════════════════════════════════════════════════════

export interface BatchCostResult {
  qty: number;
  builds: number;
  ppc: number;
  bh: number;
  layers: number;
  powderKg: number;
  sinteredKg: number;
  wallMin: number;
  costTotal: number;
  costPerPart: number;
  costPowder: number;
  costElec: number;
  strategy?: string;
}

export interface OptimalBatchData {
  ppcGrid: number;
  ppcTight: number;
  ppcDensity: number;
  bh: number;
  fW: number;
  fD: number;
  chamberX: number;
  chamberY: number;
  partVolMm3: number;
  matDensity: number;
  brackets: number[];
  optimalResults: (BatchCostResult | null)[];
  gridResults: (BatchCostResult | null)[];
  globalMinQty: number;
  globalMin: number;
  ppcDivergence: boolean;
  densityResult: BatchCostResult | null;
  gridResult: BatchCostResult | null;
  orientLabel: string;
  gx: number;
  gy: number;
  gz: number;
}

export function buildCostForParams(
  qty: number,
  ppc: number,
  bh: number,
  layerMm: number,
  chamberX: number,
  chamberY: number,
  partVolMm3PerPart: number,
  matDensity: number
): BatchCostResult | null {
  if (ppc <= 0 || bh <= 0) return null;
  const builds = Math.ceil(qty / ppc);
  const lt = layerMm || FUSE1_CONFIG.layerMm;
  const layers = Math.ceil(bh / lt);

  const { powderL, powderKg } = calcPowder(bh);

  const density = matDensity || 1.01;
  const sinteredKgPerBuild = partVolMm3PerPart
    ? (partVolMm3PerPart * ppc * density) / 1e6
    : powderKg;
  const sinteredVolCm3 = partVolMm3PerPart
    ? (partVolMm3PerPart * ppc) / 1000
    : (sinteredKgPerBuild / density) * 1000;

  const est = runEstimator({
    layers,
    powderL,
    powderKg,
    sinteredKg: sinteredKgPerBuild,
    sinteredVolCm3,
    builds,
  });

  return {
    qty,
    builds,
    ppc,
    bh,
    layers,
    powderKg: powderKg * builds,
    sinteredKg: sinteredKgPerBuild * builds,
    wallMin: est.totalMinAll,
    costTotal: est.finalQuote,
    costPerPart: est.finalQuote / qty,
    costPowder: est.materialCost,
    costElec: est.electricityCost,
  };
}

export function computeOptimalBatches(
  x: number,
  y: number,
  z: number,
  printer: PrinterConfig,
  fitResult: FitResult | null,
  partVolMm3: number,
  matDensity: number
): OptimalBatchData | null {
  const p = printer;
  const lt = p.lt || 0.11;
  const r = fitResult || checkFitForPrinter(x, y, z, p);
  if (r.status !== "fits") return null;

  const best = r.best;
  const fW = best.fW;
  const fD = best.fD;
  const bh = best.bH;

  // Standard grid packing (10 mm gap)
  const gx10 = Math.floor(p.x / (fW + 10));
  const gy10 = Math.floor(p.y / (fD + 10));
  const gz10 = Math.floor(p.z / (bh + 10));
  const ppcGrid = Math.max(1, gx10 * gy10 * gz10);

  // Tight packing (5 mm gap)
  const gx5 = Math.floor(p.x / (fW + 5));
  const gy5 = Math.floor(p.y / (fD + 5));
  const gz5 = Math.floor(p.z / (bh + 5));
  const ppcTight = Math.max(1, gx5 * gy5 * gz5);

  // Build strategies for each distinct gz value
  const strategies: { ppc: number; bh: number; gz: number; label: string }[] = [];
  for (let gz = 1; gz <= gz5; gz++) {
    const bhZ = gz * bh + (gz - 1) * 5;
    if (bhZ > p.z) break;
    const gxS = Math.floor(p.x / (fW + 5));
    const gyS = Math.floor(p.y / (fD + 5));
    const ppcS = Math.max(1, gxS * gyS * gz);
    strategies.push({ ppc: ppcS, bh: bhZ, gz, label: `${gxS}×${gyS}×${gz} grid` });
  }

  // Deduplicate by ppc
  const seen = new Set<number>();
  const uniqueStrategies = strategies.filter((s) => {
    if (seen.has(s.ppc)) return false;
    seen.add(s.ppc);
    return true;
  });

  // Build brackets
  const MAX_QTY = Math.min(500, ppcGrid * 20);
  const TEST_QTYS: number[] = [];
  for (let n = 1; n * ppcGrid <= MAX_QTY; n++) TEST_QTYS.push(n * ppcGrid);
  if (ppcTight !== ppcGrid) {
    for (let n = 1; n * ppcTight <= MAX_QTY; n++) TEST_QTYS.push(n * ppcTight);
  }
  const brackets = [...new Set(TEST_QTYS)].sort((a, b) => a - b);

  // Compute cost for grid strategy at each bracket
  const gridResults = brackets.map((q) =>
    buildCostForParams(q, ppcGrid, bh, lt, p.x, p.y, partVolMm3, matDensity)
  );

  // Find cost-optimal ppc across all strategies at each bracket qty
  const optimalResults = brackets.map((q) => {
    let bestOpt: (BatchCostResult & { strategy?: string }) | null = null;
    for (const s of uniqueStrategies) {
      const res = buildCostForParams(q, s.ppc, s.bh, lt, p.x, p.y, partVolMm3, matDensity);
      if (res && (!bestOpt || res.costPerPart < bestOpt.costPerPart)) {
        bestOpt = { ...res, strategy: s.label, ppc: s.ppc };
      }
    }
    return bestOpt;
  });

  // Find global minimum cpp
  let globalMin = Infinity;
  let globalMinQty = brackets[0];
  optimalResults.forEach((r) => {
    if (r && r.costPerPart < globalMin) {
      globalMin = r.costPerPart;
      globalMinQty = r.qty;
    }
  });

  // Packing advisory
  const ppcDensity = ppcTight;
  const bhDensity = gz5 * bh + (gz5 - 1) * 5;

  const densityResult = buildCostForParams(
    ppcDensity, ppcDensity, bhDensity, lt, p.x, p.y, partVolMm3, matDensity
  );
  const gridResult = buildCostForParams(
    ppcGrid, ppcGrid, bh, lt, p.x, p.y, partVolMm3, matDensity
  );

  const ppcDivergence =
    ppcDensity !== ppcGrid &&
    densityResult !== null &&
    gridResult !== null &&
    (densityResult.costPerPart - gridResult.costPerPart) / gridResult.costPerPart > 0.05;

  return {
    ppcGrid,
    ppcTight,
    ppcDensity,
    bh,
    fW,
    fD,
    chamberX: p.x,
    chamberY: p.y,
    partVolMm3,
    matDensity,
    brackets: brackets.slice(0, 12),
    optimalResults: optimalResults.slice(0, 12),
    gridResults: gridResults.slice(0, 12),
    globalMinQty,
    globalMin,
    ppcDivergence,
    densityResult,
    gridResult,
    orientLabel: best.label,
    gx: gx10,
    gy: gy10,
    gz: gz10,
  };
}
