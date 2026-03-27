import type {
  Material,
  MatchCriteria,
  MatchResult,
  MatchDetail,
  MaterialMatchResult,
} from "@/types/material";

/**
 * Extract the first numeric value from a string.
 */
export function extractN(val: string | undefined | null): number | null {
  if (!val) return null;
  const m = String(val).match(/([\d.]+)/);
  return m ? parseFloat(m[1]) : null;
}

/**
 * Score a single material against mechanical criteria.
 */
export function scoreAndMatch(mat: Material, criteria: MatchCriteria): MatchResult {
  let totalWeight = 0;
  let metWeight = 0;
  const details: MatchDetail[] = [];

  function check(
    key: keyof MatchCriteria,
    propKey: string,
    gte: boolean,
    label: string
  ): void {
    const critValue = criteria[key];
    if (!critValue) return;
    const threshold = parseFloat(critValue);
    if (isNaN(threshold)) return;
    const val = extractN(mat.props[propKey]);
    totalWeight += 1;
    if (val !== null) {
      const ok = gte ? val >= threshold : val <= threshold;
      if (ok) metWeight += 1;
      else if (Math.abs(val - threshold) / threshold < 0.2) metWeight += 0.5;
      details.push({ label, required: threshold, actual: val, ok });
    }
  }

  check("tensile", "Ultimate Tensile Strength (MPa)", true, "Tensile");
  check("elong", "Elongation at Break (%)", true, "Elongation");
  check("hdt", "Heat Deflection Temp @ 1.8 MPa (°C)", true, "HDT");
  check("izod", "Notched Izod Impact Strength (J/m)", true, "Izod");
  check("modulus", "Tensile Modulus (MPa)", false, "Modulus");

  // Shore Hardness — scale-aware (A or D)
  if (criteria.shore) {
    const userStr = String(criteria.shore).trim();
    const userNum = parseFloat(userStr);
    const userScale = /[Aa]/.test(userStr)
      ? "A"
      : /[Dd]/.test(userStr)
        ? "D"
        : null;
    const matStr = mat.props["Shore Hardness"] || "";
    const matNum = parseFloat(matStr);
    const matScale = /[Aa]/.test(matStr)
      ? "A"
      : /[Dd]/.test(matStr)
        ? "D"
        : null;
    if (!isNaN(userNum) && !isNaN(matNum)) {
      totalWeight += 1;
      const scaleMatch = !userScale || !matScale || userScale === matScale;
      const ok = scaleMatch && matNum >= userNum;
      if (ok) metWeight += 1;
      else if (scaleMatch && Math.abs(matNum - userNum) / userNum < 0.2)
        metWeight += 0.5;
      details.push({
        label: `Shore ${userScale || "?"}`,
        required: userNum,
        actual: isNaN(matNum) ? "—" : matNum,
        ok: ok,
      });
    }
  }

  const score = totalWeight > 0 ? Math.round((metWeight / totalWeight) * 100) : 0;
  const status = score >= 100 ? "MEETS" : score >= 60 ? "CLOSE" : "NO";
  return { score, status, details };
}

/**
 * Run material matching against all provided materials.
 * Returns sorted results (best match first), excluding "NO" matches.
 */
export function runMatch(
  materials: Material[],
  criteria: MatchCriteria
): MaterialMatchResult[] {
  return materials
    .map((mat) => ({ mat, ...scoreAndMatch(mat, criteria) }))
    .filter((r) => r.status !== "NO")
    .sort((a, b) => b.score - a.score);
}
