import { useMemo } from "react";
import { median, sum } from "d3-array";
import { accounts as allAccounts, healthFourWeeksAgo, type Account } from "../data/accounts";
import { daysUntil, formatArrTotal, formatSigned } from "../lib/health-color";

function Stat({
  label,
  value,
  sub,
  bad,
}: {
  label: string;
  value: string;
  sub: string;
  bad?: boolean;
}) {
  return (
    <div className="px-6 py-5 text-center">
      <div className="text-[10px] uppercase tracking-[0.18em] text-ink-faint">{label}</div>
      <div className="mt-2 font-mono text-[44px] leading-none tracking-tight text-ink tabular-nums">
        {value}
      </div>
      <div
        className={`mt-2 font-mono text-[11px] tabular-nums ${bad ? "text-alarm" : "text-ink-faint"}`}
      >
        {sub}
      </div>
    </div>
  );
}

export function StatRow({ accounts = allAccounts }: { accounts?: Account[] }) {
  const stats = useMemo(() => {
    const atRisk = accounts.filter((a) => a.healthScore < 50);
    const atRiskThen = accounts.filter((a) => healthFourWeeksAgo(a) < 50);

    const arrAtRisk = sum(atRisk, (a) => a.arr);
    const arrAtRiskThen = sum(atRiskThen, (a) => a.arr);
    const arrDelta = arrAtRisk - arrAtRiskThen;

    const countDelta = atRisk.length - atRiskThen.length;

    const med = median(accounts, (a) => a.healthScore) ?? 0;
    const medThen = median(accounts, (a) => healthFourWeeksAgo(a)) ?? 0;
    const medDelta = med - medThen;

    const soon = accounts.filter((a) => {
      const d = daysUntil(a.renewalDate);
      return d >= 0 && d <= 90;
    });

    return {
      arrAtRisk,
      arrDelta,
      count: atRisk.length,
      countDelta,
      med,
      medDelta,
      soonArr: sum(soon, (a) => a.arr),
      soonCount: soon.length,
    };
  }, [accounts]);

  return (
    <section className="mt-5 grid grid-cols-2 divide-x divide-rule border-y-2 border-ink-muted sm:grid-cols-4">
      <Stat
        label="ARR at risk"
        value={formatArrTotal(stats.arrAtRisk)}
        sub={`${formatSigned(stats.arrDelta / 1000)}k vs. 4 weeks ago`}
        bad={stats.arrDelta > 0}
      />
      <Stat
        label="Accounts at risk"
        value={String(stats.count)}
        sub={`${formatSigned(stats.countDelta)} vs. 4 weeks ago`}
        bad={stats.countDelta > 0}
      />
      <Stat
        label="Median health"
        value={stats.med.toFixed(0)}
        sub={`${formatSigned(stats.medDelta)} vs. 4 weeks ago`}
        bad={stats.medDelta < 0}
      />
      <Stat
        label="Renewals · next 90 days"
        value={formatArrTotal(stats.soonArr)}
        sub={`${stats.soonCount} accounts`}
      />
    </section>
  );
}
