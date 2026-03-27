/**
 * Geometry Processor — unified pipeline from raw file → parsed geometry.
 *
 * Routes to the correct parser by extension, computes:
 *   - Bounding box (min/max XYZ)
 *   - Dimensions (X × Y × Z in mm)
 *   - Volume (mm³) via signed-tetrahedra divergence theorem
 *   - Sintered mass (kg) from volume × material density
 *   - Three.js BufferGeometry for the viewer
 *
 * This is the single entry-point — no other code should call parsers directly.
 */

import * as THREE from "three";
import { parseSTL } from "./stl-parser";
import { parseOBJ } from "./obj-parser";
import { parsePLY } from "./ply-parser";
import { parse3MF } from "./threemf-parser";
import { computeMeshVolume } from "./volume";
import { detectUnits } from "./unit-detector";
import { getFileFormat } from "./file-router";
import type { BoundingBox, Dimensions, ParsedGeometry } from "@/types/geometry";

export interface ProcessedFile extends ParsedGeometry {
  volumeMm3: number;
  sinteredMassKg: number;
  wasInches: boolean;
}

/**
 * Parse a 3D file buffer into positions array based on format.
 */
function routeParser(
  buffer: ArrayBuffer,
  format: string
): { positions: Float32Array; triangleCount: number } {
  switch (format) {
    case "stl": {
      const r = parseSTL(buffer);
      return { positions: r.positions, triangleCount: r.triangleCount };
    }
    case "obj": {
      const text = new TextDecoder().decode(buffer);
      return parseOBJ(text);
    }
    case "ply":
      return parsePLY(buffer);
    case "3mf":
      return parse3MF(buffer);
    default:
      throw new Error(`Unsupported format: .${format}`);
  }
}

/**
 * Compute AABB from flat positions array.
 */
function computeBoundingBox(positions: Float32Array): BoundingBox {
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  let minZ = Infinity, maxZ = -Infinity;

  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i], y = positions[i + 1], z = positions[i + 2];
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
    if (z < minZ) minZ = z;
    if (z > maxZ) maxZ = z;
  }

  return { minX, maxX, minY, maxY, minZ, maxZ };
}

/**
 * Build a Three.js BufferGeometry from flat positions, centered at origin.
 */
function buildGeometry(
  positions: Float32Array,
  bb: BoundingBox
): THREE.BufferGeometry {
  const geo = new THREE.BufferGeometry();

  // Center the mesh at origin for proper orbit control
  const cx = (bb.minX + bb.maxX) / 2;
  const cy = (bb.minY + bb.maxY) / 2;
  const cz = (bb.minZ + bb.maxZ) / 2;

  const centered = new Float32Array(positions.length);
  for (let i = 0; i < positions.length; i += 3) {
    centered[i] = positions[i] - cx;
    centered[i + 1] = positions[i + 1] - cy;
    centered[i + 2] = positions[i + 2] - cz;
  }

  geo.setAttribute("position", new THREE.BufferAttribute(centered, 3));
  geo.computeVertexNormals();
  geo.computeBoundingSphere();

  return geo;
}

/**
 * Full processing pipeline: File → ProcessedFile.
 *
 * @param buffer    Raw file bytes
 * @param fileName  Original filename (for format detection)
 * @param density   Material solid density in g/cm³ (default: 1.01 for Nylon 12)
 */
export function processGeometryFile(
  buffer: ArrayBuffer,
  fileName: string,
  density: number = 1.01
): ProcessedFile {
  const format = getFileFormat(fileName);
  if (!format) {
    throw new Error(
      `Unsupported file format: ${fileName.split(".").pop()}. ` +
      `Accepted formats: STL, OBJ, PLY, 3MF.`
    );
  }

  // 1. Parse into flat positions array
  const { positions, triangleCount } = routeParser(buffer, format);

  if (triangleCount === 0) {
    throw new Error("File contains no geometry (0 triangles).");
  }

  // 2. Unit detection — convert inches → mm if needed
  const wasInches = detectUnits(positions);

  // 3. Bounding box → dimensions
  const bb = computeBoundingBox(positions);
  const dimensions: Dimensions = {
    x: Math.round((bb.maxX - bb.minX) * 100) / 100,
    y: Math.round((bb.maxY - bb.minY) * 100) / 100,
    z: Math.round((bb.maxZ - bb.minZ) * 100) / 100,
  };

  // 4. Volume via divergence theorem (mm³)
  //    computeMeshVolume returns volume in the unit³ of the positions (mm³)
  const volumeMm3 = computeMeshVolume(positions);

  // 5. Sintered mass (kg)
  //    1 cm = 10 mm → 1 cm³ = 1000 mm³
  //    volumeCm3 = volumeMm3 / 1000
  //    mass(g)   = volumeCm3 × density(g/cm³)
  //    mass(kg)  = mass(g) / 1000
  const volumeCm3 = volumeMm3 / 1000;
  const sinteredMassKg = (volumeCm3 * density) / 1000;

  // 6. Build Three.js geometry
  const geometry = buildGeometry(positions, bb);

  return {
    geometry,
    dimensions,
    boundingBox: bb,
    volume: volumeMm3,
    volumeMm3,
    triangleCount,
    format,
    fileName,
    sinteredMassKg,
    wasInches,
  };
}
