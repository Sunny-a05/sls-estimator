import type { PrinterConfig, FitResult, Orientation } from "@/types/printer";

const MIN_FEATURE_MM = 3;

/**
 * Try all 6 axis-aligned orientations for [x,y,z] inside printer chamber.
 * Returns the orientation with the minimum build height that fits.
 */
export function checkFitForPrinter(
  x: number,
  y: number,
  z: number,
  p: PrinterConfig
): FitResult {
  const margin = 2; // mm clearance
  const CX = p.x - margin;
  const CY = p.y - margin;
  const CZ = p.z - margin;
  const lt = p.lt || 0.11;

  // All 6 axis-aligned orientations [buildHeight, footW, footD, label]
  const candidates: Orientation[] = [
    { bH: z, fW: x, fD: y, label: "Z up" },
    { bH: z, fW: y, fD: x, label: "Z up, rotated" },
    { bH: x, fW: y, fD: z, label: "X up" },
    { bH: x, fW: z, fD: y, label: "X up, rotated" },
    { bH: y, fW: x, fD: z, label: "Y up" },
    { bH: y, fW: z, fD: x, label: "Y up, rotated" },
  ];

  const valid = candidates
    .filter((o) => o.fW <= CX && o.fD <= CY && o.bH <= CZ)
    .sort((a, b) => a.bH - b.bH);

  if (!valid.length) {
    const excess = Math.max(x - p.x, y - p.y, z - p.z, 0);
    return {
      status: "too-big",
      name: p.short,
      reason: `Exceeds build volume by ${excess.toFixed(0)} mm (all 6 orientations tried)`,
      orientations: [],
    };
  }

  const best = valid[0];
  return {
    status: "fits",
    name: p.short,
    best,
    orientations: valid,
    layers: Math.ceil(best.bH / lt),
    count: valid.length,
  };
}

/**
 * Check if part dimensions are too small for SLS printing.
 */
export function isTooSmall(x: number, y: number, z: number): boolean {
  return (
    x > 0 &&
    y > 0 &&
    z > 0 &&
    (x < MIN_FEATURE_MM || y < MIN_FEATURE_MM || z < MIN_FEATURE_MM)
  );
}

export { MIN_FEATURE_MM };
