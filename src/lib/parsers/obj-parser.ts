/**
 * OBJ Parser — extracts triangle mesh from Wavefront OBJ format.
 * Handles "v" vertex lines and "f" face lines (triangulates n-gons via fan).
 * Ignores normals/texcoords for geometry-only use.
 */

export interface OBJParseResult {
  positions: Float32Array;
  triangleCount: number;
}

export function parseOBJ(text: string): OBJParseResult {
  const vertices: number[] = [];
  const triangles: number[] = [];

  const lines = text.split("\n");
  for (const raw of lines) {
    const line = raw.trim();
    if (line.startsWith("v ")) {
      const parts = line.split(/\s+/);
      vertices.push(
        parseFloat(parts[1]),
        parseFloat(parts[2]),
        parseFloat(parts[3])
      );
    } else if (line.startsWith("f ")) {
      const parts = line.split(/\s+/).slice(1);
      // Each face token is "v", "v/vt", "v/vt/vn", or "v//vn"
      const indices = parts.map((p) => {
        const idx = parseInt(p.split("/")[0], 10);
        // OBJ is 1-indexed, can be negative (relative)
        return idx > 0 ? idx - 1 : vertices.length / 3 + idx;
      });
      // Fan triangulate for n-gons (n >= 3)
      for (let i = 1; i < indices.length - 1; i++) {
        triangles.push(indices[0], indices[i], indices[i + 1]);
      }
    }
  }

  const positions = new Float32Array(triangles.length * 3);
  for (let i = 0; i < triangles.length; i++) {
    const vi = triangles[i] * 3;
    positions[i * 3] = vertices[vi];
    positions[i * 3 + 1] = vertices[vi + 1];
    positions[i * 3 + 2] = vertices[vi + 2];
  }

  return {
    positions,
    triangleCount: triangles.length / 3,
  };
}
