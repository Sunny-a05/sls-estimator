/**
 * 3MF Parser — extracts triangle mesh from 3D Manufacturing Format.
 * 3MF is a ZIP archive containing XML model data at 3D/3dmodel.model.
 * Uses fflate for decompression (already in deps).
 */

import { unzipSync } from "fflate";

export interface ThreeMFParseResult {
  positions: Float32Array;
  triangleCount: number;
}

export function parse3MF(buffer: ArrayBuffer): ThreeMFParseResult {
  // Decompress ZIP
  const files = unzipSync(new Uint8Array(buffer));

  // Find the model file — typically "3D/3dmodel.model"
  let modelXML: string | null = null;
  for (const [path, data] of Object.entries(files)) {
    if (path.toLowerCase().endsWith(".model")) {
      modelXML = new TextDecoder().decode(data);
      break;
    }
  }

  if (!modelXML) {
    throw new Error("No .model file found inside 3MF archive");
  }

  // Parse XML via DOMParser
  const parser = new DOMParser();
  const doc = parser.parseFromString(modelXML, "application/xml");

  // Extract vertices and triangles from first mesh
  const meshEl =
    doc.querySelector("mesh") ||
    doc.getElementsByTagName("mesh")[0];
  if (!meshEl) {
    throw new Error("No <mesh> element found in 3MF model");
  }

  // Vertices — <vertex x="" y="" z="" />
  const vertexEls = meshEl.querySelectorAll("vertices > vertex");
  const vertCount = vertexEls.length;
  const verts = new Float32Array(vertCount * 3);
  vertexEls.forEach((v, i) => {
    verts[i * 3] = parseFloat(v.getAttribute("x") || "0");
    verts[i * 3 + 1] = parseFloat(v.getAttribute("y") || "0");
    verts[i * 3 + 2] = parseFloat(v.getAttribute("z") || "0");
  });

  // Triangles — <triangle v1="" v2="" v3="" />
  const triEls = meshEl.querySelectorAll("triangles > triangle");
  const triCount = triEls.length;
  const positions = new Float32Array(triCount * 9);
  triEls.forEach((t, i) => {
    const v1 = parseInt(t.getAttribute("v1") || "0", 10);
    const v2 = parseInt(t.getAttribute("v2") || "0", 10);
    const v3 = parseInt(t.getAttribute("v3") || "0", 10);
    positions[i * 9]     = verts[v1 * 3];
    positions[i * 9 + 1] = verts[v1 * 3 + 1];
    positions[i * 9 + 2] = verts[v1 * 3 + 2];
    positions[i * 9 + 3] = verts[v2 * 3];
    positions[i * 9 + 4] = verts[v2 * 3 + 1];
    positions[i * 9 + 5] = verts[v2 * 3 + 2];
    positions[i * 9 + 6] = verts[v3 * 3];
    positions[i * 9 + 7] = verts[v3 * 3 + 1];
    positions[i * 9 + 8] = verts[v3 * 3 + 2];
  });

  return { positions, triangleCount: triCount };
}
