import { useEffect, useRef, useState } from "react";

const SECTIONS: { n: string; title: string; body: string; prompt: string }[] = [
  {
    n: "01",
    title: "Swap in your accounts",
    body: "Every account on this page is demo data. Paste a spreadsheet or CSV export from your CRM into the chat and ask Lovable to swap it in. The chart, stats and watchlist all update to match your book.",
    prompt: "Replace the demo accounts with the customers in this CSV.",
  },
  {
    n: "02",
    title: "Wire a live source",
    body: "A one-time paste is a fine start. When you want the page to stay current on its own, ask Lovable to connect your CRM or add a database so accounts refresh automatically.",
    prompt: "Connect my CRM and keep these accounts synced automatically.",
  },
  {
    n: "03",
    title: "Score health your way",
    body: "Health scores here are built from named drivers, like product usage and champion engagement, so every score can be explained. Tell Lovable which 3 to 5 signals you actually track and have it rebuild the score around those. Don't score what you can't measure.",
    prompt: "Rebuild the health score from the signals I actually have: logins, support tickets and renewal conversations.",
  },
  {
    n: "04",
    title: "Capture weekly history",
    body: "The trend lines, drawdown and runway all read from weekly score snapshots. Ask Lovable to save a weekly snapshot for each account; the trends fill in as history accumulates.",
    prompt: "Save a weekly health snapshot for every account so the trends build over time.",
  },
  {
    n: "05",
    title: "Tune the thresholds",
    body: "The risk line at 40, the alarm colors and the watchlist ranking are opinions, not facts. Tell Lovable how your team thinks about risk and have it adjust the thresholds to match.",
    prompt: "Move the risk threshold to 50 and flag accounts we haven't talked to in 2 weeks.",
  },
];

export function TemplateGuide() {
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const returnTo = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    returnTo.current = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      returnTo.current?.focus?.();
    };
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-full border border-ink-faint px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted transition-colors hover:border-ink hover:text-ink"
      >
        Template guide
      </button>

      <div
        aria-hidden
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-40 bg-scrim transition-[opacity,visibility] duration-300 ${
          open ? "visible opacity-100" : "pointer-events-none invisible opacity-0"
        }`}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Template guide"
        aria-hidden={!open}
        className={`fixed right-0 top-0 z-50 h-screen w-full overflow-y-auto border-l border-ink-muted bg-background sm:w-[480px] ${
          open ? "visible translate-x-0" : "pointer-events-none invisible translate-x-full"
        }`}
        style={{
          transition:
            "translate 300ms cubic-bezier(0.22, 1, 0.36, 1), visibility 300ms",
        }}
      >
        <div className="px-7 py-6">
          <div className="flex items-start justify-between gap-6">
            <div>
              <h2 className="font-serif text-2xl leading-[1.05] tracking-tight text-ink">
                Using this template
              </h2>
              <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-faint">
                From demo data to your book
              </p>
            </div>
            <button
              ref={closeRef}
              onClick={() => setOpen(false)}
              aria-label="Close template guide"
              className="-mr-1 mt-1 px-1 text-ink-faint transition-colors hover:text-ink"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
                <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="1.2" />
              </svg>
            </button>
          </div>

          <p className="mt-5 text-[13px] leading-relaxed text-ink-muted">
            After remixing, you make this yours by talking to Lovable in the chat. No code
            required; describe what you want and it does the wiring. Work through these steps.
          </p>

          <div className="mt-6 space-y-6">
            {SECTIONS.map((s) => (
              <div key={s.n}>
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-[11px] text-ink-faint tabular-nums">{s.n}</span>
                  <h3 className="font-serif text-[17px] tracking-tight text-ink">{s.title}</h3>
                </div>
                <p className="mt-1.5 pl-[30px] text-[13px] leading-relaxed text-ink-muted">
                  {s.body}
                </p>
                <p className="mt-2 pl-[30px] text-[12px] leading-relaxed text-ink-faint">
                  Try: <span className="italic">"{s.prompt}"</span>
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 h-px w-full bg-rule" />
          <p className="mt-5 text-[12px] leading-relaxed text-ink-faint">
            Not sure where to start? Ask Lovable: "Walk me through making this dashboard work with
            my real customer data."
          </p>
        </div>
      </div>
    </>
  );
}