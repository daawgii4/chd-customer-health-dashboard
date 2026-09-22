import { useEffect, useRef } from "react";
import { drawdown, HEALTH_BASE, type Account } from "../data/accounts";
import {
  daysSince,
  formatArr,
  formatDate,
  formatSeats,
} from "../lib/health-color";
import { weeksToRisk } from "../lib/runway";
import { Trajectory } from "./chart/Trajectory";
import { ScoreWaterfall } from "./chart/ScoreWaterfall";

function Fact({ label, value, alarm }: { label: string; value: React.ReactNode; alarm?: boolean }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.14em] text-ink-faint">{label}</div>
      <div
        className={`mt-1.5 font-mono text-[14px] tabular-nums ${alarm ? "text-alarm" : "text-ink"}`}
      >
        {value}
      </div>
    </div>
  );
}

const dash = (title?: string) => (
  <span className="text-ink-faint" title={title}>
    —
  </span>
);

export function AccountPanel({
  account,
  onClose,
}: {
  account: Account | null;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const returnTo = useRef<HTMLElement | null>(null);
  const open = account !== null;

  useEffect(() => {
    if (!open) return;
    returnTo.current = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      returnTo.current?.focus?.();
    };
  }, [open, onClose]);

  const dd = account ? drawdown(account) : 0;
  const runway = account ? weeksToRisk(account.healthHistory, account.healthScore) : null;
  const since = account ? daysSince(account.lastTouched) : 0;

  return (
    <>
      <div
        aria-hidden
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-scrim transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={account ? `${account.name} account detail` : "Account detail"}
        aria-hidden={!open}
        className={`fixed right-0 top-0 z-50 h-screen w-full overflow-y-auto border-l border-ink-muted bg-background sm:w-[480px] ${
          open ? "translate-x-0" : "pointer-events-none translate-x-full"
        }`}
        style={{ transition: "translate 300ms cubic-bezier(0.22, 1, 0.36, 1)" }}
      >
        {account && (
          <div className="px-7 py-6">
            <div className="flex items-start justify-between gap-6">
              <div>
                <h2 className="font-serif text-2xl leading-[1.05] tracking-tight text-ink">
                  {account.name}
                </h2>
                <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-faint tabular-nums">
                  {account.segment} / {account.owner} / renews{" "}
                  {formatDate(account.renewalDate)}
                </p>
              </div>
              <div className="flex items-start gap-4">
                <span className="font-mono text-[40px] leading-none text-ink tabular-nums">
                  {account.healthScore}
                </span>
                <button
                  ref={closeRef}
                  onClick={onClose}
                  aria-label="Close account detail"
                  className="-mr-1 mt-1 px-1 text-ink-faint transition-colors hover:text-ink"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
                    <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="1.2" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="mt-7">
              <div className="text-[10px] uppercase tracking-[0.14em] text-ink-faint">
                13-week trajectory
              </div>
              <div className="mt-2">
                <Trajectory values={account.healthHistory} alarm={dd > 15} />
              </div>
            </div>

            <div className="mt-7">
              <div className="text-[10px] uppercase tracking-[0.14em] text-ink-faint">
                Score composition
              </div>
              <div className="mt-3">
                <ScoreWaterfall
                  base={HEALTH_BASE}
                  drivers={account.drivers}
                  total={account.healthScore}
                />
              </div>
            </div>

            <div className="mt-8 h-px w-full bg-rule" />
            <div className="mt-5 grid grid-cols-3 gap-x-6 gap-y-5">
              <Fact label="ARR" value={formatArr(account.arr)} />
              <Fact
                label="Seat utilization"
                value={
                  account.seatUtilization === null
                    ? dash("No seat commitment on this contract")
                    : formatSeats(account.seatUtilization)
                }
              />
              <Fact label="Last touch" value={`${since}d`} alarm={since > 30} />
              <Fact
                label="Drawdown"
                value={dd <= 1 ? dash("Account is at or near its 13-week peak") : `−${dd}`}
                alarm={dd > 15}
              />
              <Fact
                label="Runway"
                value={
                  runway === null
                    ? dash("No downward trend to extrapolate")
                    : `~${runway} wks`
                }
                alarm={runway !== null && runway < 8}
              />
            </div>
            <p className="mt-6 text-[11px] text-ink-faint">
              A dash means the metric does not apply to this account, not that it scored zero.
            </p>
          </div>
        )}
      </div>
    </>
  );
}