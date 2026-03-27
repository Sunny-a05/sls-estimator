/**
 * PLY Parser — extracts triangle mesh from Stanford PLY format.
 * Supports ASCII and binary_little_endian (the two most common variants).
 * Handles standard x/y/z vertex properties and triangular/quad faces.
 */

export interface PLYParseResult {
  positions: Float32Array;
  triangleCount: number;
}

interface PLYHeader {
  format: "ascii" | "binary_little_endian" | "binary_big_endian";
  vertexCount: number;
  faceCount: number;
  headerBytes: number;
  vertexProps: string[];
}

function parseHeader(text: string): PLYHeader {
  const lines = text.split("\n");
  let format: PLYHeader["format"] = "ascii";
  let vertexCount = 0;
  let faceCount = 0;
  let headerBytes = 0;
  const vertexProps: string[] = [];
  let inVertex = false;

  for (const line of lines) {
    headerBytes += line.length + 1; // +1 for newline
    const trimmed = line.trim();
    if (trimmed.startsWith("format ")) {
      if (trimmed.includes("binary_little_endian")) format = "binary_little_endian";
      else if (trimmed.includes("binary_big_endian")) format = "binary_big_endian";
    } else if (trimmed.startsWith("element vertex")) {
      vertexCount = parseInt(trimmed.split(/\s+/)[2], 10);
      inVertex = true;
    } else if (trimmed.startsWith("element face")) {
      faceCount = parseInt(trimmed.split(/\s+/)[2], 10);
      inVertex = false;
    } else if (trimmed.startsWith("property") && inVertex) {
      const parts = trimmed.split(/\s+/);
      vertexProps.push(parts[parts.length - 1]);
    } else if (trimmed === "end_header") {
      break;
    }
  }

  return { format, vertexCount, faceCount, headerBytes, vertexProps };
}

function parseASCII(text: string, header: PLYHeader): PLYParseResult {
  const lines = text.split("\n");
  // Skip header lines
  let lineIdx = 0;
  for (; lineIdx < lines.length; lineIdx++) {
    if (lines[lineIdx].trim() === "end_header") {
      lineIdx++;
      break;
    }
  }

  const xi = header.vertexProps.indexOf("x");
  const yi = header.vertexProps.indexOf("y");
  const zi = header.vertexProps.indexOf("z");

  // Read vertices
  const vertices = new Float32Array(header.vertexCount * 3);
  for (let i = 0; i < header.vertexCount; i++) {
    const parts = lines[lineIdx + i].trim().split(/\s+/);
    vertices[i * 3] = parseFloat(parts[xi]);
    vertices[i * 3 + 1] = parseFloat(parts[yi]);
    vertices[i * 3 + 2] = parseFloat(parts[zi]);
  }
  lineIdx += header.vertexCount;

  // Read faces — fan-triangulate
  const tris: number[] = [];
  for (let i = 0; i < header.faceCount; i++) {
    const parts = lines[lineIdx + i].trim().split(/\s+/).map(Number);
    const n = parts[0];
    for (let j = 1; j < n - 1; j++) {
      tris.push(parts[1], parts[j + 1], parts[j + 2]);
    }
  }

  const positions = new Float32Array(tris.length * 3);
  for (let i = 0; i < tris.length; i++) {
    const vi = tris[i] * 3;
    positions[i * 3] = vertices[vi];
    positions[i * 3 + 1] = vertices[vi + 1];
    positions[i * 3 + 2] = vertices[vi + 2];
  }

  return { positions, triangleCount: tris.length / 3 };
}

function parseBinaryLE(buffer: ArrayBuffer, header: PLYHeader): PLYParseResult {
  const view = new DataView(buffer);
  let offset = header.headerBytes;

  // Each vertex property is a float32 (4 bytes) — simplified assumption
  const bytesPerVertex = header.vertexProps.length * 4;
  const xi = header.vertexProps.indexOf("x");
  const yi = header.vertexProps.indexOf("y");
  const zi = header.vertexProps.indexOf("z");

  const vertices = new Float32Array(header.vertexCount * 3);
  for (let i = 0; i < header.vertexCount; i++) {
    const base = offset + i * bytesPerVertex;
    vertices[i * 3] = view.getFloat32(base + xi * 4, true);
    vertices[i * 3 + 1] = view.getFloat32(base + yi * 4, true);
    vertices[i * 3 + 2] = view.getFloat32(base + zi * 4, true);
  }
  offset += header.vertexCount * bytesPerVertex;

  // Read faces
  const tris: number[] = [];
  for (let i = 0; i < header.faceCount; i++) {
    const n = view.getUint8(offset);
    offset += 1;
    const indices: number[] = [];
    for (let j = 0; j < n; j++) {
      indices.push(view.getInt32(offset, true));
      offset += 4;
    }
    // Fan-triangulate
    for (let j = 1; j < n - 1; j++) {
      tris.push(indices[0], indices[j], indices[j + 1]);
    }
  }

  const positions = new Float32Array(tris.length * 3);
  for (let i = 0; i < tris.length; i++) {
    const vi = tris[i] * 3;
    positions[i * 3] = vertices[vi];
    positions[i * 3 + 1] = vertices[vi + 1];
    positions[i * 3 + 2] = vertices[vi + 2];
  }

  return { positions, triangleCount: tris.length / 3 };
}

export function parsePLY(buffer: ArrayBuffer): PLYParseResult {
  // Decode enough of the buffer to read the header (ASCII text)
  const headerText = new TextDecoder().decode(buffer.slice(0, Math.min(buffer.byteLength, 8192)));
  const header = parseHeader(headerText);

  if (header.format === "ascii") {
    const fullText = new TextDecoder().decode(buffer);
    return parseASCII(fullText, header);
  }

  if (header.format === "binary_little_endian") {
    return parseBinaryLE(buffer, header);
  }

  // binary_big_endian — rare, fall back to ascii attempt
  throw new Error("PLY format binary_big_endian is not supported. Please re-export as ASCII or binary_little_endian.");
}
