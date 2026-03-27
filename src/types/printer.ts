export interface PrinterConfig {
  name: string;
  short: string;
  x: number;
  y: number;
  z: number;
  costPerHr: number;
  lt: number;
  minFeature: number;
  note: string;
}

export interface Orientation {
  bH: number;
  fW: number;
  fD: number;
  label: string;
}

export type FitStatus = "fits" | "too-big";

export interface FitResultFits {
  status: "fits";
  name: string;
  best: Orientation;
  orientations: Orientation[];
  layers: number;
  count: number;
}

export interface FitResultTooBig {
  status: "too-big";
  name: string;
  reason: string;
  orientations: [];
}

export type FitResult = FitResultFits | FitResultTooBig;

export interface FittingPrinter extends PrinterConfig {
  key: string;
  bestBH: number;
  bestOrient: string;
  fitResult: FitResult;
}
