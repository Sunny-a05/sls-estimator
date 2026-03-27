export interface EstimatorInput {
  layers: number;
  powderL?: number;
  powderKg?: number;
  sinteredKg?: number;
  sinteredVolCm3?: number;
  builds?: number;
}

export interface EstimatorResult {
  // Time breakdown (minutes)
  preprintMin: number;
  printingMin: number;
  printOverheadMin: number;
  recoatMin: number;
  scanMin: number;
  coolTo100Min: number;
  coolingMin: number;
  cooldownTotalMin: number;
  totalMinSingle: number;
  totalMinAll: number;
  massMPD: number;
  sinteredVolCm3: number;
  builds: number;

  // Cost breakdown (THB)
  elecHrs: number;
  materialCost: number;
  electricityCost: number;
  initialCost: number;
  machineCost: number;
  postProcess: number;
  finalQuote: number;
  rates: CostRates;
}

export interface CostRates {
  powderPerG: number;
  electricityHr: number;
  initial: number;
  machine: number;
  postProcess: number;
}

export interface PowderResult {
  chamberL: number;
  powderL: number;
  powderKg: number;
}

export interface LayerResult {
  buildHeightMm: number;
  layers: number;
}

export interface FullEstimateResult extends EstimatorResult {
  buildHeightMm: number;
  layers: number;
  powderL: number;
  powderKg: number;
}
