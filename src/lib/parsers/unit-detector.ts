/**
 * Unit auto-detection — ported from js_viewer.html.
 * If max coordinate exceeds 3000, the file is likely in inches.
 * Converts in-place and returns whether conversion was applied.
 */
export function detectUnits(positions: Float32Array): boolean {
  let maxCoord = 0;
  for (let k = 0; k < positions.length; k++) {
    const v = positions[k] < 0 ? -positions[k] : positions[k];
    if (v > maxCoord) maxCoord = v;
  }
  if (maxCoord > 3000) {
    for (let k = 0; k < positions.length; k++) positions[k] *= 25.4;
    return true; // was inches, now converted to mm
  }
  return false;
}
