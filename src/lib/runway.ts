/**
 * Naive linear extrapolation over the trailing 6 health readings — a straight
 * least-squares fit projected forward. This is not a forecast: it ignores
 * seasonality, contract events, and the fact that scores are bounded.
 */
const RISK_LINE = 40;
const WINDOW = 6;

/** Least-squares slope, in points per week. */
export function recentSlope(history: number[]): number {
  const y = history.slice(-WINDOW);
  const n = y.length;
  if (n < 2) return 0;
  const meanX = (n - 1) / 2;
  const meanY = y.reduce((t, v) => t + v, 0) / n;
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (i - meanX) * (y[i]! - meanY);
    den += (i - meanX) ** 2;
  }
  return den === 0 ? 0 : num / den;
}

/**
 * Weeks until the fitted line crosses the risk threshold. Null when the trend
 * is flat or rising, or the account is already below the threshold.
 */
export function weeksToRisk(history: number[], current: number): number | null {
  if (current < RISK_LINE) return null;
  const slope = recentSlope(history);
  if (slope >= -0.05) return null;
  const weeks = (current - RISK_LINE) / -slope;
  if (!Number.isFinite(weeks) || weeks > 260) return null;
  return Math.max(1, Math.round(weeks));
}
