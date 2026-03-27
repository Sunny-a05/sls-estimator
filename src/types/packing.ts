export interface PackItem {
  width: number;
  depth: number;
  height: number;
  id: string;
  quantity: number;
}

export interface PlacedRect {
  x: number;
  y: number;
  width: number;
  depth: number;
  id: string;
}

export interface PackConfig {
  spacing: number;
  allowRotation: boolean;
  bedWidth: number;
  bedDepth: number;
  bedHeight: number;
}

export interface PackResult {
  placed: PlacedRect[];
  unplaced: PackItem[];
  utilization: number;
  buildHeight: number;
}
