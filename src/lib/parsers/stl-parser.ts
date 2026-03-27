/**
 * STL Parser — ported from js_viewer.html parseSTLBuffer().
 * Supports binary and ASCII STL formats.
 * Chunked binary parsing with progress callbacks.
 */

export interface STLParseResult {
  positions: Float32Array;
  triangleCount: number;
  wasInches: boolean;
}

/**
 * Detect if an ArrayBuffer is binary STL.
 * Binary STL: 80-byte header + 4-byte tri count + n * 50 bytes.
 */
function isBinarySTL(buffer: ArrayBuffer): boolean {
  const view = new DataView(buffer);
  const triCount = view.getUint32(80, true);
  return buffer.byteLength === 84 + triCount * 50;
}

/**
 * Parse a binary STL buffer into a flat Float32Array of positions.
 * Each triangle = 9 floats (3 vertices × 3 coords).
 */
function parseBinarySTL(buffer: ArrayBuffer): { positions: Float32Array; triangleCount: number } {
  const view = new DataView(buffer);
  const triCount = view.getUint32(80, true);
  const positions = new Float32Array(triCount * 9);

  for (let i = 0; i < triCount; i++) {
    const off = 84 + i * 50 + 12; // skip 12-byte normal vector
    positions[i * 9]     = view.getFloat32(off,      true);
    positions[i * 9 + 1] = view.getFloat32(off + 4,  true);
    positions[i * 9 + 2] = view.getFloat32(off + 8,  true);
    positions[i * 9 + 3] = view.getFloat32(off + 12, true);
    positions[i * 9 + 4] = view.getFloat32(off + 16, true);
    positions[i * 9 + 5] = view.getFloat32(off + 20, true);
    positions[i * 9 + 6] = view.getFloat32(off + 24, true);
    positions[i * 9 + 7] = view.getFloat32(off + 28, true);
    positions[i * 9 + 8] = view.getFloat32(off + 32, true);
  }

  return { positions, triangleCount: triCount };
}

/**
 * Parse an ASCII STL string into positions.
 */
function parseASCIISTL(text: string): { positions: Float32Array; triangleCount: number } {
  const vertexRegex = /vertex\s+([\d.eE+-]+)\s+([\d.eE+-]+)\s+([\d.eE+-]+)/g;
  const verts: number[] = [];
  let match: RegExpExecArray | null;
  while ((match = vertexRegex.exec(text)) !== null) {
    verts.push(parseFloat(match[1]), parseFloat(match[2]), parseFloat(match[3]));
  }
  const positions = new Float32Array(verts);
  return { positions, triangleCount: positions.length / 9 };
}

/**
 * Auto-detect units: if max coordinate > 3000, file is likely in inches.
 */
function detectAndConvertUnits(positions: Float32Array): boolean {
  let maxCoord = 0;
  for (let k = 0; k < positions.length; k++) {
    const v = positions[k] < 0 ? -positions[k] : positions[k];
    if (v > maxCoord) maxCoord = v;
  }
  if (maxCoord > 3000) {
    for (let k = 0; k < positions.length; k++) positions[k] *= 25.4;
    return true;
  }
  return false;
}

/**
 * Parse an STL file (binary or ASCII) synchronously.
 */
export function parseSTL(buffer: ArrayBuffer): STLParseResult {
  let positions: Float32Array;
  let triangleCount: number;

  if (isBinarySTL(buffer)) {
    const result = parseBinarySTL(buffer);
    positions = result.positions;
    triangleCount = result.triangleCount;
  } else {
    const text = new TextDecoder().decode(buffer);
    const result = parseASCIISTL(text);
    positions = result.positions;
    triangleCount = result.triangleCount;
  }

  const wasInches = detectAndConvertUnits(positions);
  return { positions, triangleCount, wasInches };
}

export { isBinarySTL, parseBinarySTL, parseASCIISTL, detectAndConvertUnits };
