import type { BufferGeometry } from "three";

export interface BoundingBox {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZ: number;
  maxZ: number;
}

export interface Dimensions {
  x: number;
  y: number;
  z: number;
}

export interface ParsedGeometry {
  geometry: BufferGeometry;
  dimensions: Dimensions;
  boundingBox: BoundingBox;
  volume: number;
  triangleCount: number;
  format: "stl" | "obj" | "ply" | "3mf";
  fileName: string;
}

export type VolumeMethod = "signed-tetrahedra" | "voxel";
