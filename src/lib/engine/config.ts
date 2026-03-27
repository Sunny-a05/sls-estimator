import type { CostRates } from "@/types/estimator";

// ═══════════════════════════════════════════════════════════════
//  CALIBRATED ESTIMATOR ENGINE — BLACK BOX
//  Validated against 4 real Formlabs PreForm builds (mean error <5%)
//  Constants solved via least-squares from PreForm data points:
//    Block (1530L/9%/2.74kg), Cover (365L/15%/0.82kg),
//    Valve Cover (1628L/3%/2.82kg), Piston (209L/1%/0.51kg)
//
//  ⚠️  DO NOT MODIFY THESE VALUES — they are calibrated constants.
// ═══════════════════════════════════════════════════════════════

/** Cost rates in Thai Baht (THB) */
export const FUSE1_COSTS: CostRates = {
  powderPerG:    15,    // ฿/g sintered mass
  electricityHr: 7,     // ฿/hr
  initial:       2000,  // ฿ setup fee
  machine:       1935,  // ฿ machine amortisation
  postProcess:   30,    // ฿ post-processing
};

/** Calibrated physics config for Fuse 1+ 30W */
export const FUSE1_CONFIG = {
  // ── Print time model (13-point, RMSE ±6.9 min) ──
  printOverheadS:       1319.5,   // fixed per-build overhead (22.0 min)
  recoatSecPerLayer:    10.2138,  // s/layer — powder spreading + recoat
  scanSecPerCm3:        9.03,     // s/cm³ sintered volume — laser scan time

  // ── Fixed overheads (exact match on all 13 builds) ──
  preprintMin:          41,       // warmup + nitrogen purge
  coolTo100Min:         58,       // active cool to 100°C inside enclosure

  // ── Cooling model (13-point, RMSE ±4.1 min, max ±7 min) ──
  coolingIntercept:     -105.93,
  coolingPowderCoeff:   356.51,   // min per √L
  coolingSinterCoeff:   -198.0,   // min per kg sintered (negative = faster cooling)
  coolingFloorMin:      300,      // minimum cooling — confirmed on builds ≤1.23 L

  // ── Powder model (verified ±0.5% across 13 builds) ──
  powderMultiplier:     1.2062,
  powderBase:           0.4022,   // fixed dead-zone base (L)
  powderBulkDensity:    0.450,    // Nylon 12 bulk density (kg/L)

  // ── Z-gap padding ──
  zGapMm:               3.0,

  // ── Chamber dimensions (Fuse 1+ 30W) ──
  chamberX: 165,  // mm
  chamberY: 165,  // mm
  chamberZ: 300,  // mm
  layerMm:  0.11, // 110 µm layer thickness

  // ── Material ──
  nylonDensity:   1.01,  // g/cm³ — Nylon 12 solid density

  // ── Powder refresh ratio ──
  // Formlabs requires 30% fresh powder mixed with 70% recycled per build
  FRESH_RATIO:    0.30,
} as const;

export type Fuse1Config = typeof FUSE1_CONFIG;
