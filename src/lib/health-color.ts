export const ALARM = "var(--alarm)";

/** Predicate used by the watchlist and stat row. It does NOT drive dot colour. */
export function isAtRisk(healthScore: number, arr: number) {
  return healthScore < 35 && arr >= 200_000;
}

const clamp01 = (t: number) => Math.max(0, Math.min(1, t));

/** Continuous mix between two ramp tokens, resolved by the browser in oklch. */
const mix = (from: string, to: string, t: number) =>
  `color-mix(in oklch, ${to} ${(clamp01(t) * 100).toFixed(1)}%, ${from})`;

/**
 * Colour encodes health and nothing else (size already carries revenue).
 *   100 → 55  neutral warm ink, subtle lightness only
 *    55 → 45  warming, picking up chroma
 *    45 → 0   into full alarm vermilion
 */
export function healthColor(healthScore: number): string {
  const h = Math.max(0, Math.min(100, healthScore));
  if (h >= 55) return mix("var(--health-lo)", "var(--health-hi)", (h - 55) / 45);
  if (h >= 45) return mix("var(--health-lo)", "var(--health-warm)", (55 - h) / 10);
  return mix("var(--health-warm)", "var(--alarm)", (45 - h) / 45);
}

export const formatArr = (arr: number) =>
  arr >= 1000 ? `$${Math.round(arr / 1000)}k` : `$${arr}`;

export const formatArrTotal = (arr: number) =>
  arr >= 1_000_000 ? `$${(arr / 1_000_000).toFixed(1)}M` : formatArr(arr);

export const formatSeats = (v: number) => `${Math.round(v * 100)}%`;

export const formatDate = (iso: string) =>
  new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export const formatDateShort = (iso: string) => {
  const d = new Date(iso + "T00:00:00");
  const md = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${md} ’${String(d.getFullYear()).slice(-2)}`;
};

/** The book's "today" — the seed data is generated against this date. */
export const TODAY = new Date("2026-08-04T00:00:00Z");

export const daysSince = (iso: string) =>
  Math.round((TODAY.getTime() - new Date(iso + "T00:00:00Z").getTime()) / 86_400_000);

export const daysUntil = (iso: string) =>
  Math.round((new Date(iso + "T00:00:00Z").getTime() - TODAY.getTime()) / 86_400_000);

export const formatSigned = (n: number, digits = 0) =>
  `${n > 0 ? "+" : n < 0 ? "−" : "±"}${Math.abs(n).toFixed(digits)}`;
