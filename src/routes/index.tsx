import { useMemo, useState, type CSSProperties } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Activity } from "lucide-react";
import { sum } from "d3-array";
import { Beeswarm, type BeeswarmView } from "../components/chart/Beeswarm";
import { AccountPanel } from "../components/AccountPanel";
import { StatRow } from "../components/StatRow";
import { Watchlist } from "../components/Watchlist";
import {
  SegmentFilter,
  ViewToggle,
  type SegmentFilterValue,
} from "../components/SegmentFilter";
import { ThemeToggle } from "../components/ThemeToggle";
import { TemplateGuide } from "../components/TemplateGuide";
import { accounts } from "../data/accounts";
import { formatArrTotal } from "../lib/health-color";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Customer health dashboard" },
      {
        name: "description",
        content:
          "An editorial view of customer health: every account plotted by health score and sized by ARR.",
      },
      { property: "og:title", content: "Customer health dashboard" },
      {
        property: "og:description",
        content: "An editorial view of customer health: every account plotted by health score and sized by ARR.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [segment, setSegment] = useState<SegmentFilterValue>("All");
  const [view, setView] = useState<BeeswarmView>("combined");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const bookArr = useMemo(() => sum(accounts, (a) => a.arr), []);

  const highlightedCount =
    segment === "All"
      ? accounts.length
      : accounts.filter((a) => a.segment === segment).length;
  const selected = accounts.find((a) => a.id === selectedId) ?? null;

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-8 py-10">
        <header
          className="page-rise flex items-baseline justify-between"
          style={{ "--rise-delay": "0s" } as CSSProperties}
        >
          <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1">
            <h1 className="font-serif text-3xl leading-tight tracking-tight text-ink">
              <Activity
                className="mr-2.5 inline-block h-6 w-6 -translate-y-0.5 text-ink"
                strokeWidth={2.25}
                aria-hidden="true"
              />
              Customer health
            </h1>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-faint tabular-nums">
              {accounts.length} accounts / {formatArrTotal(bookArr)} ARR
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <TemplateGuide />
            <ThemeToggle />
          </div>
        </header>

        <div className="page-rise" style={{ "--rise-delay": "0.12s" } as CSSProperties}>
          <StatRow accounts={accounts} />
        </div>

        <section
          className="page-rise mt-12"
          style={{ "--rise-delay": "0.24s" } as CSSProperties}
        >
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-10">
              <ViewToggle value={view} onChange={setView} />
              <SegmentFilter value={segment} onChange={setSegment} />
            </div>
            {segment !== "All" && (
              <span className="font-mono text-[11px] text-ink-faint tabular-nums">
                {highlightedCount} accounts
              </span>
            )}
          </div>
          <div className="mt-4">
            <Beeswarm
              accounts={accounts}
              view={view}
              highlight={segment}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
            <p className="mt-1 text-center text-[11px] tracking-tight text-ink-faint">
              Health score
            </p>
          </div>
        </section>

        <div className="page-rise" style={{ "--rise-delay": "0.38s" } as CSSProperties}>
          <Watchlist accounts={accounts} selectedId={selectedId} onSelect={setSelectedId} />
        </div>

        <AccountPanel account={selected} onClose={() => setSelectedId(null)} />
      </div>
    </main>
  );
}
