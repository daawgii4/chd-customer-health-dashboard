import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { scaleLinear, scaleSqrt } from "d3-scale";
import { extent, sum } from "d3-array";
import type { Account, Segment } from "../../data/accounts";
import { useBeeswarmLayout, type BeeswarmInput } from "../../hooks/useBeeswarmLayout";
import { formatArr, formatArrTotal, healthColor } from "../../lib/health-color";
import { Axis } from "./Axis";
import { BeeswarmDot } from "./BeeswarmDot";
import { Tooltip } from "./Tooltip";

export type BeeswarmView = "combined" | "segment";

const WIDTH = 1080;
const ROWS: Segment[] = ["Enterprise", "Mid-Market", "SMB"];

/* Split view. Bands are sized to what each swarm actually needs: Enterprise has
 * 30 large dots, SMB 75 small ones, so uniform bands leave dead air up top. */
const SPLIT_MARGIN = { top: 22, right: 56, bottom: 38, left: 168 };
const ROW_HEIGHTS: Record<Segment, number> = {
  Enterprise: 96,
  "Mid-Market": 112,
  SMB: 124,
};
const ROW_GAP = 22;
const SPLIT_TOPS = ROWS.map(
  (_, i) =>
    SPLIT_MARGIN.top +
    ROWS.slice(0, i).reduce((t, s) => t + ROW_HEIGHTS[s] + ROW_GAP, 0),
);
const SPLIT_HEIGHT =
  SPLIT_MARGIN.top +
  ROWS.reduce((t, s) => t + ROW_HEIGHTS[s], 0) +
  ROW_GAP * (ROWS.length - 1) +
  SPLIT_MARGIN.bottom;

/* Combined view: one compact band. */
const COMBINED_MARGIN = { top: 22, right: 56, bottom: 38, left: 56 };
const COMBINED_BAND = 176;
const COMBINED_HEIGHT = COMBINED_MARGIN.top + COMBINED_BAND + COMBINED_MARGIN.bottom;

interface BeeswarmProps {
  accounts: Account[];
  view: BeeswarmView;
  highlight: "All" | Segment;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

export function Beeswarm({ accounts, view, highlight, selectedId, onSelect }: BeeswarmProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [wrapW, setWrapW] = useState(WIDTH);

  const split = view === "segment";
  const margin = split ? SPLIT_MARGIN : COMBINED_MARGIN;
  const height = split ? SPLIT_HEIGHT : COMBINED_HEIGHT;
  const innerW = WIDTH - margin.left - margin.right;

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWrapW(e?.contentRect.width ?? WIDTH));
    ro.observe(el);
    setWrapW(el.clientWidth || WIDTH);
    return () => ro.disconnect();
  }, []);

  // No account sits below the low teens, so starting the domain at 10 lets the
  // swarm use the full width instead of leaving a dead left corridor.
  const x = useMemo(
    () => scaleLinear().domain([10, 100]).range([margin.left, margin.left + innerW]),
    [margin.left, innerW],
  );

  const radius = useMemo(() => {
    const [lo = 0, hi = 1] = extent(accounts, (d) => d.arr);
    return scaleSqrt().domain([lo, hi]).range([3, 18]);
  }, [accounts]);

  const input = useMemo<BeeswarmInput[]>(
    () =>
      accounts.map((a) => {
        if (!split) {
          const top = COMBINED_MARGIN.top;
          return {
            id: a.id,
            x: x(a.healthScore),
            y: top + COMBINED_BAND / 2,
            r: radius(a.arr),
            yMin: top,
            yMax: top + COMBINED_BAND,
          };
        }
        const i = ROWS.indexOf(a.segment);
        const top = i >= 0 ? SPLIT_TOPS[i]! : SPLIT_MARGIN.top;
        const h = i >= 0 ? ROW_HEIGHTS[ROWS[i]!] : SPLIT_HEIGHT;
        return {
          id: a.id,
          x: x(a.healthScore),
          y: top + h / 2,
          r: radius(a.arr),
          yMin: top,
          yMax: top + h,
        };
      }),
    [accounts, x, radius, split],
  );

  const nodes = useBeeswarmLayout(input, WIDTH);
  const byId = useMemo(() => new Map(accounts.map((a) => [a.id, a])), [accounts]);

  const hovered = hoveredId ? byId.get(hoveredId) : null;
  const hoveredNode = nodes.find((n) => n.id === hoveredId);

  // Fade labels with the flow between views rather than snapping them.
  const [labelsOn, setLabelsOn] = useState(split);
  useEffect(() => {
    const t = setTimeout(() => setLabelsOn(split), split ? 220 : 0);
    return () => clearTimeout(t);
  }, [split]);

  const pxHeight = (height / WIDTH) * wrapW;

  return (
    <div ref={wrapRef} className="relative w-full">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${WIDTH} ${height}`}
        width="100%"
        height={pxHeight}
        preserveAspectRatio="xMidYMid meet"
        style={{ transition: "height 900ms cubic-bezier(0.22, 1, 0.36, 1)" }}
        onClick={(e) => e.target === svgRef.current && onSelect(null)}
      >
        <g aria-hidden>
          <line
            x1={x(40)}
            x2={x(40)}
            y1={margin.top + 2}
            y2={height - margin.bottom + 12}
            stroke="currentColor"
            strokeWidth={1}
            className="text-ink-faint"
            opacity={0.35}
          />
          <text
            x={x(40) + 6}
            y={margin.top - 2}
            className="fill-ink-faint text-[10px] uppercase tracking-[0.16em]"
          >
            risk threshold
          </text>
        </g>

        <g style={{ transition: "opacity 400ms ease", opacity: labelsOn && split ? 1 : 0 }}>
          {ROWS.map((segment, i) => {
            const rows = accounts.filter((a) => a.segment === segment);
            const cy = SPLIT_TOPS[i]! + ROW_HEIGHTS[segment] / 2;
            const dimmedRow = highlight !== "All" && highlight !== segment;
            return (
              <g
                key={segment}
                opacity={dimmedRow ? 0.28 : 1}
                style={{ transition: "opacity 300ms ease" }}
              >
                <text
                  x={SPLIT_MARGIN.left - 28}
                  y={cy - 4}
                  textAnchor="end"
                  className="fill-ink font-serif text-[20px]"
                >
                  {segment}
                </text>
                <text
                  x={SPLIT_MARGIN.left - 28}
                  y={cy + 18}
                  textAnchor="end"
                  className="fill-ink-faint font-mono text-[11px]"
                  style={{ fontVariantNumeric: "tabular-nums" }}
                >
                  {rows.length} · {formatArrTotal(sum(rows, (d) => d.arr))}
                </text>
              </g>
            );
          })}
        </g>

        {nodes.map((n) => {
          const a = byId.get(n.id);
          if (!a) return null;
          const segDimmed = highlight !== "All" && highlight !== a.segment;
          return (
            <BeeswarmDot
              key={n.id}
              cx={n.x}
              cy={n.y}
              r={n.r}
              fill={healthColor(a.healthScore)}
              dimmed={segDimmed || (selectedId !== null && selectedId !== n.id)}
              hovered={hoveredId === n.id}
              selected={selectedId === n.id}
              label={`${a.name}, health ${a.healthScore}, ${formatArr(a.arr)} ARR`}
              onEnter={() => setHoveredId(n.id)}
              onLeave={() => setHoveredId((c) => (c === n.id ? null : c))}
              onSelect={() => onSelect(selectedId === n.id ? null : n.id)}
            />
          );
        })}

        <Axis scale={x} ticks={[20, 40, 60, 80, 100]} y={height - 12} />
      </svg>

      {hovered && hoveredNode && (
        <Tooltip
          x={`${(hoveredNode.x / WIDTH) * 100}%`}
          y={`${((hoveredNode.y - hoveredNode.r) / height) * 100}%`}
        >
          <div className="whitespace-nowrap">
            <div className="text-[13px] text-ink">{hovered.name}</div>
            <div className="mt-1 flex gap-3 font-mono text-[11px] text-ink-muted tabular-nums">
              <span>{formatArr(hovered.arr)}</span>
              <span>{hovered.healthScore}</span>
              <span className="font-sans text-ink-faint">{hovered.segment}</span>
            </div>
          </div>
        </Tooltip>
      )}
    </div>
  );
}
