// Numerical formula taken from Google's Lighthouse calculator: https://googlechrome.github.io/lighthouse/scorecalc/

export type LighthouseMetric = "FCP" | "SI" | "LCP" | "TBT" | "CLS";
export type MetricRating = "pass" | "average" | "fail"; // pass = green, average = yellow, fail = red

interface CurveParams {
  median: number;
  p10: number;
}

// Mobile curve parameters for Lighthouse v10, v11, v12
const MOBILE_CURVES = new Map<LighthouseMetric, CurveParams>([
  ["FCP", { median: 3000, p10: 1800 }],
  ["SI", { median: 5800, p10: 3387 }],
  ["LCP", { median: 4000, p10: 2500 }],
  ["TBT", { median: 600, p10: 200 }],
  ["CLS", { median: 0.25, p10: 0.1 }],
]);

function internalErf(x: number): number {
  const sign = x < 0 ? -1 : 1;
  const absX = Math.abs(x);
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;
  const t = 1 / (1 + p * absX);
  const y = t * (a1 + t * (a2 + t * (a3 + t * (a4 + t * a5))));
  return sign * (1 - y * Math.exp(-absX * absX));
}

function derivePodrFromP10(median: number, p10: number): number {
  const u = Math.log(median);
  const shape = Math.abs(Math.log(p10) - u) / (Math.SQRT2 * 0.9061938024368232);
  const inner1 = -3 * shape - Math.sqrt(4 + shape * shape);
  return Math.exp(u + (shape / 2) * inner1);
}

function quantileAtValue(curve: CurveParams, value: number): number {
  const podr = derivePodrFromP10(curve.median, curve.p10);
  const location = Math.log(curve.median);
  const logRatio = Math.log(podr / curve.median);
  const shape =
    Math.sqrt(
      1 - 3 * logRatio - Math.sqrt((logRatio - 3) * (logRatio - 3) - 8),
    ) / 2;
  const standardizedX = (Math.log(value) - location) / (Math.SQRT2 * shape);

  return (1 - internalErf(standardizedX)) / 2;
}

/**
 * Returns score, rating, and color status for a given Lighthouse mobile metric value.
 */
export function getMetricRating(
  metric: LighthouseMetric,
  value: number,
): {
  score: number;
  rating: MetricRating;
  color: string;
} {
  const curve = MOBILE_CURVES.get(metric);
  if (!curve) {
    throw new Error(`Invalid metric: ${metric}`);
  }

  // Calculate raw log-normal score and round to 0-100 integer
  const rawScore = quantileAtValue(curve, value);
  const score = Math.round(rawScore * 100);

  if (score >= 90) {
    return { score, rating: "pass", color: "rgb(0, 204, 102)" };
  }
  if (score >= 50) {
    return { score, rating: "average", color: "rgb(255, 170, 51)" };
  }
  return { score, rating: "fail", color: "rgb(255, 51, 51)" };
}
