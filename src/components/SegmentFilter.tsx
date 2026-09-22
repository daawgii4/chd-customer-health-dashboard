import type { Segment } from "../data/accounts";
import type { BeeswarmView } from "./chart/Beeswarm";

export type SegmentFilterValue = "All" | Segment;
const OPTIONS: SegmentFilterValue[] = ["All", "Enterprise", "Mid-Market", "SMB"];

const cls = (active: boolean) =>
  `text-[13px] tracking-tight transition-colors ${
    active ? "text-ink" : "text-ink-faint hover:text-ink-muted"
  }`;

export function ViewToggle({
  value,
  onChange,
}: {
  value: BeeswarmView;
  onChange: (v: BeeswarmView) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <button onClick={() => onChange("combined")} className={cls(value === "combined")}>
        Combined
      </button>
      <span className="text-[13px] text-ink-faint">·</span>
      <button onClick={() => onChange("segment")} className={cls(value === "segment")}>
        By segment
      </button>
    </div>
  );
}

export function SegmentFilter({
  value,
  onChange,
}: {
  value: SegmentFilterValue;
  onChange: (v: SegmentFilterValue) => void;
}) {
  return (
    <div className="flex items-center gap-6">
      {OPTIONS.map((o) => (
        <button key={o} onClick={() => onChange(o)} className={cls(value === o)}>
          {o}
        </button>
      ))}
    </div>
  );
}
