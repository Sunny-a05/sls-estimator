export { FUSE1_CONFIG, FUSE1_COSTS } from "./config";
export { runEstimator, calcPowder, calcLayers, estimateFromSTL } from "./estimator";
export { checkFitForPrinter, isTooSmall, MIN_FEATURE_MM } from "./fit-checker";
export { buildCostForParams, computeOptimalBatches } from "./batch-calculator";
export { extractN, scoreAndMatch, runMatch } from "./material-matcher";
export { optimizeOrientation } from "./orientation-optimizer";
export type { OrientationCostResult, OptimizationResult } from "./orientation-optimizer";
export type { BatchCostResult, OptimalBatchData } from "./batch-calculator";
