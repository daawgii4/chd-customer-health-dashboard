import { useMemo } from "react";
import { scaleLinear } from "d3-scale";
import type { Driver } from "../../data/accounts";

const WIDTH = 432;
const ROW_H = 26;
const BAR_H = 11;
const LABEL_W = 150;
const VALUE_W = 40;

/** Negative contributions warm toward the alarm colour, scaled by magnitude. */
function contributionColor(points: number) {
  if (points >= 0) return "var(--ink-muted)";
  const t = Math.min(1, Math.abs(points) / 20);
  return `color-mix(in oklch, var(--alarm) ${(t * 100).toFixed(0)}%, var(--ink-muted))`;
}

type Row = {
  label: string;
  from: number;
  to: number;
  points: number;
  kind: "base" | "driver" | "total";
};

interface Props {
  base: number;
  drivers: Driver[];
  total: number;
}

/** Cumulative waterfall: base, one row per driver, then the resulting score. */
export function ScoreWaterfall({ base, drivers, total }: Props) {
  const rows = useMemo(() => {
    let cursor = base;
    const out: Row[] = [{ label: "Base", from: 0, to: base, points: base, kind: "base" }];
    for (const d of drivers) {
      const from = cursor;
      cursor += d.points;
      out.push({ label: d.label, from, to: cursor, points: d.points, kind: "driver" });
    }
    out.push({ label: "Health score", from: 0, to: total, points: total, kind: "total" });
    return out;
  }, [base, drivers, total]);

  const max = Math.max(100, ...rows.map((r) => Math.max(r.from, r.to)));
  const x = scaleLinear().domain([0, max]).range([LABEL_W, WIDTH - VALUE_W]);
  const height = rows.length * ROW_H + 6;

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${height}`}
      width="100%"
      height={height}
      role="img"
      aria-label="Health score composition"
    >
      {rows.map((r, i) => {
        const y = i * ROW_H + 4;
        const x0 = x(Math.min(r.from, r.to));
        const x1 = x(Math.max(r.from, r.to));
        const fill =
          r.kind === "driver" ? contributionColor(r.points) : "var(--ink-faint)";
        const next = rows[i + 1];
        return (
          <g key={r.label}>
            <text
              x={LABEL_W - 10}
              y={y + BAR_H}
              textAnchor="end"
              className={`text-[11px] ${r.kind === "total" ? "fill-[var(--ink)]" : "fill-[var(--ink-muted)]"}`}
            >
              {r.label}
            </text>
            <rect
              x={x0}
              y={y + 1}
              width={Math.max(1.5, x1 - x0)}
              height={BAR_H}
              fill={fill}
              opacity={r.kind === "driver" ? 0.9 : 0.5}
            />
            {next && r.kind !== "total" && (
              <line
                x1={x(r.to)}
                x2={x(r.to)}
                y1={y + 1}
                y2={y + ROW_H + 1}
                stroke="var(--ink-faint)"
                strokeWidth={0.6}
                opacity={0.45}
              />
            )}
            <text
              x={WIDTH - 4}
              y={y + BAR_H}
              textAnchor="end"
              className="font-mono text-[11px] tabular-nums fill-[var(--ink)]"
            >
              {r.kind === "driver"
                ? `${r.points > 0 ? "+" : r.points < 0 ? "−" : "±"}${Math.abs(r.points)}`
                : r.points}
            </text>
          </g>
        );
      })}
    </svg>
  );
}