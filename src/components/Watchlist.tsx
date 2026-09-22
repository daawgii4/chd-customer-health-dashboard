import { useMemo } from "react";
import {
  accounts as allAccounts,
  drawdown,
  weekDelta,
  type Account,
} from "../data/accounts";
import {
  daysSince,
  formatArr,
  formatDateShort,
  formatSeats,
  formatSigned,
} from "../lib/health-color";
import { weeksToRisk } from "../lib/runway";
import { Sparkline } from "./chart/Sparkline";

const HEAD = [
  "Account",
  "ARR",
  "Health",
  "13 wks",
  "Drawdown",
  "Runway",
  "Seats",
  "WoW",
  "Last touch",
  "Renewal",
];

/**
 * Exposure blends revenue at risk with trajectory:
 *   arr × (1 − health/100)            — always-mediocre revenue
 * + arr × (drawdown/100) × 1.4        — revenue sliding off a recent peak
 * The 1.4 weight means a large account that has fallen 20 points outranks an
 * equally large account that has simply always sat at the same low score.
 */
const exposure = (a: Account) =>
  a.arr * (1 - a.healthScore / 100) + a.arr * (drawdown(a) / 100) * 1.4;

export function Watchlist({
  accounts = allAccounts,
  selectedId,
  onSelect,
}: {
  accounts?: Account[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}) {
  const rows = useMemo(
    () => [...accounts].sort((a, b) => exposure(b) - exposure(a)).slice(0, 8),
    [accounts],
  );

  return (
    <section className="mt-12 bg-surface px-6 py-6 sm:px-8">
      <h2 className="font-serif text-xl tracking-tight text-ink">Watchlist</h2>
      <table className="mt-4 w-full border-collapse text-left">
        <thead>
          <tr>
            {HEAD.map((h, i) => (
              <th
                key={h}
                className={`pb-2 text-[10px] font-normal uppercase tracking-[0.16em] text-ink-faint ${
                  i > 0 ? "text-right" : ""
                }`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((a) => {
            const d = weekDelta(a);
            const dd = drawdown(a);
            const ddAlarm = dd > 15;
            const runway = weeksToRisk(a.healthHistory, a.healthScore);
            const since = daysSince(a.lastTouched);
            const isSelected = selectedId === a.id;
            return (
              <tr
                key={a.id}
                onClick={() => onSelect(isSelected ? null : a.id)}
                className={`cursor-pointer border-t border-rule transition-colors hover:bg-background/60 ${
                  isSelected ? "bg-background" : ""
                }`}
              >
                <td className="py-2.5 pr-4">
                  <span className="text-[13px] text-ink">{a.name}</span>
                  <span className="ml-2 text-[10px] uppercase tracking-[0.12em] text-ink-faint">
                    {a.segment}
                  </span>
                </td>
                <td className="py-2.5 pl-4 text-right font-mono text-[13px] text-ink tabular-nums">
                  {formatArr(a.arr)}
                </td>
                <td className="py-2.5 pl-4 text-right font-mono text-[13px] text-ink tabular-nums">
                  {a.healthScore}
                </td>
                <td className="py-2.5 pl-4 text-right">
                  <span className="inline-block align-middle">
                    <Sparkline values={a.healthHistory} alarm={ddAlarm} />
                  </span>
                </td>
                <td
                  className={`py-2.5 pl-4 text-right font-mono text-[13px] tabular-nums ${
                    ddAlarm ? "text-alarm" : "text-ink-muted"
                  }`}
                >
                  {dd <= 1 ? <span className="text-ink-faint">—</span> : `−${dd}`}
                </td>
                <td
                  className={`py-2.5 pl-4 text-right font-mono text-[13px] tabular-nums ${
                    runway !== null && runway < 8 ? "text-alarm" : "text-ink-muted"
                  }`}
                >
                  {runway === null ? (
                    <span className="text-ink-faint">—</span>
                  ) : (
                    `~${runway} wks`
                  )}
                </td>
                <td className="py-2.5 pl-4 text-right font-mono text-[13px] text-ink-muted tabular-nums">
                  {a.seatUtilization === null ? (
                    <span className="text-ink-faint" title="No seat commitment on this contract">
                      —
                    </span>
                  ) : (
                    formatSeats(a.seatUtilization)
                  )}
                </td>
                <td
                  className={`py-2.5 pl-4 text-right font-mono text-[13px] tabular-nums ${
                    d < 0 ? "text-alarm" : "text-ink-muted"
                  }`}
                >
                  {formatSigned(d)}
                </td>
                <td
                  className={`py-2.5 pl-4 text-right font-mono text-[13px] tabular-nums ${
                    since > 30 ? "text-alarm" : "text-ink-muted"
                  }`}
                >
                  {since}d
                </td>
                <td className="py-2.5 pl-4 text-right font-mono text-[13px] text-ink-muted tabular-nums">
                  {formatDateShort(a.renewalDate)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="mt-3 text-[11px] text-ink-faint">
        A dash means the metric does not apply to that account, not that it scored zero.
      </p>
    </section>
  );
}
