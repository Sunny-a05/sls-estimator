/**
 * Mesh volume via divergence theorem — ported from js_viewer.html computeMeshVolume().
 * V = (1/6) × |Σ v0·(v1×v2)| per triangle.
 * Works on closed, watertight (manifold) meshes only.
 */
export function computeMeshVolume(positions: Float32Array): number {
  let volume = 0;
  const n = positions.length / 9;
  for (let i = 0; i < n; i++) {
    const o = i * 9;
    const x1 = positions[o],     y1 = positions[o + 1], z1 = positions[o + 2];
    const x2 = positions[o + 3], y2 = positions[o + 4], z2 = positions[o + 5];
    const x3 = positions[o + 6], y3 = positions[o + 7], z3 = positions[o + 8];
    volume += (
      x1 * (y2 * z3 - y3 * z2) -
      y1 * (x2 * z3 - x3 * z2) +
      z1 * (x2 * y3 - x3 * y2)
    );
  }
  return Math.abs(volume) / 6;
}
