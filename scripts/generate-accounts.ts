/**
 * Single source of truth for src/data/accounts.ts.
 * Run: bun scripts/generate-accounts.ts
 * Deterministic — no post-hoc hand edits to the generated file.
 */
import { writeFileSync } from "node:fs";

type Segment = "Enterprise" | "Mid-Market" | "SMB";
interface Base {
  id: string;
  name: string;
  segment: Segment;
  arr: number;
  healthScore: number;
  owner: string;
  lastTouched: string;
}

// mulberry32
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Planted stories: sustained decline / sharp recent drop / middling big account.
const PLANTED: Record<
  string,
  Partial<Base> & { arc: "decline" | "cliff"; drivers?: number[] }
> = {
  // usage collapse + champion disengagement; support fine. Sponsor left.
  "Fenwick Legal": {
    segment: "Enterprise", arr: 720000, healthScore: 22, arc: "decline",
    drivers: [-21, -8, 2, -16, -1, 11],
  },
  // support burden + commercial damage; usage only mildly down. Unhappy but using it.
  "Ironpine Energy": {
    segment: "Enterprise", arr: 610000, healthScore: 28, arc: "decline",
    drivers: [-5, 3, -18, -2, 6, -11],
  },
  // narrow adoption, shallow depth. Never landed past the pilot team.
  "Bastion Claims": {
    segment: "Enterprise", arr: 455000, healthScore: 31, arc: "decline",
    drivers: [-3, -15, 1, -2, -10, 5],
  },
  // mostly healthy, one severe commercial negative. Signalled a downgrade.
  "Marlowe Capital": {
    segment: "Enterprise", arr: 840000, healthScore: 54, arc: "cliff",
    drivers: [4, 6, -2, 3, 8, -20],
  },
  // Additional at-risk exposure, spread across two bands so the alarm colour
  // appears in more than one row (7 alarm accounts in total).
  "Blackfell Ports": { segment: "Enterprise", arr: 388000, healthScore: 26, arc: "decline" },
  "Havelock Energy": { segment: "Mid-Market", arr: 214000, healthScore: 24, arc: "decline" },
  "Beckmoor Insurance": { segment: "Mid-Market", arr: 203000, healthScore: 33, arc: "decline" },
  "Redmoor Aviation": { segment: "Enterprise", arr: 342000, healthScore: 30, arc: "decline" },
  // Steep recent decline, still above the at-risk threshold: the watchlist
  // should surface these before the beeswarm's colour does.
  "Norvale Petroleum": { segment: "Enterprise", arr: 566000, healthScore: 51, arc: "cliff" },
  "Strathmore Group": { segment: "Enterprise", arr: 472000, healthScore: 47, arc: "cliff" },
  "Quintain Systems": { segment: "Mid-Market", arr: 198000, healthScore: 49, arc: "cliff" },
};

const r = rng(20260804);

/**
 * ~30 Enterprise names: institutional, infrastructural, multi-word.
 */
const ENTERPRISE_NAMES = [
  "Northwind Analytics","Fenwick Legal","Ironpine Energy","Bastion Claims","Marlowe Capital",
  "Halcyon Bank","Granite Mutual","Meridian Textiles","Hollowell Steel","Aster Manufacturing",
  "Rundle Mining","Tidewater Rail","Stratus Grid","Sable Insurance","Caldwell Freightways",
  "Ashgrove Holdings","Pennington & Co","Westmere Utilities","Kingsford Chemical","Lowlands Trust",
  "Redmoor Aviation","Strathmore Group","Ossington Reinsurance","Blackfell Ports","Varden Pharma",
  "Calderwood Group","Highbourne Rail","Norvale Petroleum","Thornbury Assurance","Ellesmere Foundry",
];

/** ~55 Mid-Market names: modern, compound, a few place names. */
const MIDMARKET_NAMES = [
  "Cobalt Freight","Verity Health","Lumen Payroll","Harbor & Finch","Auralink",
  "Kestrel Robotics","Orchard Logic","Merit Cargo","Vantage Ledger","Northgate Labs",
  "Corvid Media","Arclight Travel","Trellis HR","Marrow Bio","Windrose Supply",
  "Foundry Nine","Blueharbor Marine","Tessellate","Lantern Rail","Nightjar Security",
  "Ravelin Cloud","Gossamer AI","Ferrous Works","Overlook Hotels","Sundial Optics",
  "Perch Networks","Stonecrop Water","Juniper Freight","Cinderpeak","Brightsill",
  "Redwick Logistics","Marlin & Vale","Ostrey Labs","Quintain Systems","Fairholme Foods",
  "Kepler Ridge","Salsbury Group","Anvilcrest","Portway Analytics","Beckmoor Insurance",
  "Halvard Robotics","Tiverton Print","Oakhaven Group","Sennet Data","Brackwater Marine",
  "Ferndale Optics","Lyric Payments","Ambergris","Cardigan Labs","Wrenfield Group",
  "Pallas Freight","Dunmore Textiles","Havelock Energy","Ivory Lane","Sundermere",
];

/** ~75 SMB names: single words, shops, clinics, studios, local suffixes. */
const SMB_NAMES_LIST = [
  "Palisade Retail","Tallow Foods","Quill & Co","Belfry Studios","Pinewood Dental",
  "Salt & Cedar","Kindling Edu","Oakstem Farms","Piedmont Auto","Vellum Press",
  "Rookery Games","Solace Clinics","Copperline","Fathom Depot","Larkspur Home",
  "Thicket Apparel","Bramblewick","Kiln & Ash","Alderfen","Vireo Health",
  "Quarry Tools","Ellipsis Design","Bellhaven","Foxglove Pharma","Cypher Motors",
  "Hearth & Hollow","Marigold Bakery","Pike Street Cycles","Bindery Nine","Copperkettle",
  "Sable & Wren","Thistledown","Fernbrook Vets","Mossgate Coffee","Little Harbor Books",
  "Ridgeway Tile","Plumb & Ash","Corbel Studio","Wickham Florals","Sparrowgate",
  "Barrelhouse","Nettlefold","Rushmere Pottery","Glasswing","Tanner & Roe",
  "Cobbleton Deli","Yardarm Supply","Pepperbox","Whitlow Dental","Grainstore",
  "Lorne Street Optics","Fallowfield","Cinderwick","Hollybrook Care","Sagewood Yoga",
  "Tinderbox Print","Mulberry Lane","Orrery","Kettleby","Ashcombe Kennels",
  "Redstart Media","Pommel & Bit","Saltmarsh","Windlass","Bramble Row",
  "Fenwood Joinery","Dovetail Cabinet","Larchmere","Quillon","Pinch & Fold",
  "Marlowe Street Cafe","Verger","Hemlock Lane","Bristle & Bone","Tidepool Studio",
];

const OWNERS_EXTRA = [
  "Nils Ostberg","Sam Oyelaran","Theo Barnard","Dan Whitmore","Maya Ellison",
  "Grace Okonkwo","Priya Raghavan","Lucia Ferrer","Aiden Fairbairn","Noor Haddad",
  "Tomas Vega","Ines Duarte","Rowan Kelleher","Yuki Tanabe","Mira Solberg",
  "Elias Okafor","Hanne Vissers","Rafael Costa",
];

function arrFor(seg: Segment) {
  const span = seg === "Enterprise" ? [190000, 900000]
    : seg === "Mid-Market" ? [48000, 220000]
    : [8000, 56000];
  const [lo, hi] = span as [number, number];
  return Math.round((lo + (hi - lo) * Math.pow(r(), 0.9)) / 1000) * 1000;
}

/** Smooth continuous distribution: most healthy, sparse but unbroken left tail. */
function healthFor() {
  const u = r();
  // Single continuous curve — dense healthy body, thin but unbroken left tail,
  // no band boundaries and therefore no empty corridors along the axis.
  return Math.round(100 - 88 * Math.pow(u, 3));
}

/**
 * Score composition. The six drivers are the source of truth: the health score
 * is BASE plus their sum, clamped. Drivers are drawn against one latent quality
 * value per account so a healthy account reads as mostly-positive with a mild
 * negative or two, rather than six independent numbers averaging to the middle.
 */
const BASE = 55;
const DRIVER_SPEC = [
  { key: "usage_trend", label: "Product usage trend", lo: -22, hi: 10 },
  { key: "adoption_breadth", label: "Breadth of adoption", lo: -15, hi: 12 },
  { key: "support_burden", label: "Support burden", lo: -18, hi: 4 },
  { key: "champion_engagement", label: "Champion engagement", lo: -16, hi: 8 },
  { key: "feature_depth", label: "Feature depth", lo: -10, hi: 14 },
  { key: "commercial_signal", label: "Commercial signal", lo: -20, hi: 12 },
] as const;

const SPAN_MIN = DRIVER_SPEC.reduce((t, d) => t + d.lo, 0);
const SPAN_MAX = DRIVER_SPEC.reduce((t, d) => t + d.hi, 0);

/** Draw six correlated drivers whose sum lands exactly on `target - BASE`. */
function driversFor(target: number) {
  const want = Math.max(
    Math.max(SPAN_MIN, 8 - BASE),
    Math.min(Math.min(SPAN_MAX, 99 - BASE), target - BASE),
  );
  const t = (want - SPAN_MIN) / (SPAN_MAX - SPAN_MIN); // latent quality, 0-1
  const vals = DRIVER_SPEC.map((d) => {
    const span = d.hi - d.lo;
    const noise = (r() - 0.5) * span * 0.34;
    return Math.max(d.lo, Math.min(d.hi, d.lo + span * t + noise));
  });
  // Reconcile rounding + noise back onto the target, spending the correction
  // where each driver still has headroom in the needed direction.
  let out = vals.map((v) => Math.round(v));
  for (let pass = 0; pass < 400; pass++) {
    const diff = want - out.reduce((a, b) => a + b, 0);
    if (diff === 0) break;
    const step = Math.sign(diff);
    const i = Math.floor(r() * out.length);
    const spec = DRIVER_SPEC[i]!;
    const next = out[i]! + step;
    if (next >= spec.lo && next <= spec.hi) out[i] = next;
  }
  return DRIVER_SPEC.map((d, i) => ({ key: d.key, label: d.label, points: out[i]! }));
}

const WEEKS = 13;

function history(current: number, arc: "flat" | "up" | "down" | "decline" | "cliff") {
  const out: number[] = [];
  let start: number;
  if (arc === "decline") start = Math.min(96, current + 30 + Math.round(r() * 10));
  else if (arc === "cliff") start = Math.min(96, current + 26 + Math.round(r() * 8));
  else if (arc === "up") start = Math.max(8, current - (10 + Math.round(r() * 8)));
  else if (arc === "down") start = Math.min(97, current + 8 + Math.round(r() * 6));
  else start = clamp(current + Math.round((r() - 0.5) * 6));

  for (let i = 0; i < WEEKS; i++) {
    const t = i / (WEEKS - 1);
    let e: number;
    if (arc === "cliff") e = t < 0.62 ? t * 0.12 : 0.0744 + ((t - 0.62) / 0.38) * 0.9256;
    else if (arc === "decline") e = t; // steady slide
    else e = t * t * (3 - 2 * t); // smoothstep
    const base = start + (current - start) * e;
    const wobble = i === WEEKS - 1 ? 0 : (r() - 0.5) * (arc === "flat" ? 4.4 : 2.6);
    out.push(clamp(Math.round(base + wobble)));
  }
  out[WEEKS - 1] = current;
  return out;
}

const clamp = (n: number) => Math.max(1, Math.min(100, n));

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

const TODAY = new Date("2026-08-04T00:00:00Z");

function lastTouchedFor() {
  const days = Math.round(Math.pow(r(), 1.7) * 74);
  const d = new Date(TODAY);
  d.setUTCDate(d.getUTCDate() - days);
  return isoDate(d);
}

/**
 * Share of contracted seats actively used. Null for usage-based contracts with
 * no seat commitment (~15% of the book, weighted toward SMB).
 */
function seatUtilizationFor(segment: Segment, healthScore: number): number | null {
  const nullChance = segment === "SMB" ? 0.26 : segment === "Mid-Market" ? 0.11 : 0.04;
  if (r() < nullChance) return null;
  // Loosely correlated with health: healthy accounts use more of what they buy.
  const base = 0.28 + (healthScore / 100) * 0.6;
  const v = base + (r() - 0.5) * 0.26;
  return Math.round(Math.max(0.04, Math.min(1, v)) * 100) / 100;
}

function renewalFor(i: number) {
  // ~35% cluster inside the next 90 days, rest spread across 12 months
  const soon = i % 3 === 0;
  const days = soon ? 8 + Math.round(r() * 82) : 95 + Math.round(r() * 270);
  const d = new Date(TODAY);
  d.setUTCDate(d.getUTCDate() + days);
  return isoDate(d);
}

/** Segment pyramid: names are authored into the band they belong to. */
const ROSTER: { name: string; segment: Segment }[] = [
  ...ENTERPRISE_NAMES.map((name) => ({ name, segment: "Enterprise" as Segment })),
  ...MIDMARKET_NAMES.map((name) => ({ name, segment: "Mid-Market" as Segment })),
  ...SMB_NAMES_LIST.map((name) => ({ name, segment: "SMB" as Segment })),
];

const seen = new Set<string>();
for (const { name } of ROSTER) {
  if (seen.has(name)) throw new Error(`duplicate account name: ${name}`);
  seen.add(name);
}

const accounts = ROSTER.map(({ name, segment: rosterSegment }, i) => {
  const planted = PLANTED[name];
  const segment = planted?.segment ?? rosterSegment;
  const arr = planted?.arr ?? arrFor(segment);
  // Drivers first; the score is their sum on top of BASE.
  const drivers = planted?.drivers
    ? DRIVER_SPEC.map((d, k) => ({ key: d.key, label: d.label, points: planted.drivers![k]! }))
    : driversFor(planted?.healthScore ?? healthFor());
  const healthScore = Math.max(
    8,
    Math.min(99, BASE + drivers.reduce((t, d) => t + d.points, 0)),
  );
  const owner = OWNERS_EXTRA[Math.floor(r() * OWNERS_EXTRA.length)]!;
  const arc: "flat" | "up" | "down" | "decline" | "cliff" = planted
    ? planted.arc
    : r() < 0.14
      ? "up"
      : r() < 0.14
        ? "down"
        : "flat";
  return {
    id: `a${String(i + 1).padStart(3, "0")}`,
    name,
    segment,
    arr,
    healthScore,
    owner,
    lastTouched: lastTouchedFor(),
    seatUtilization: seatUtilizationFor(segment, healthScore),
    renewalDate: renewalFor(i),
    drivers,
    healthHistory: history(healthScore, arc),
  };
});

// Consistency check: BASE + Σ drivers must equal the score for every account.
for (const a of accounts) {
  const sum = BASE + a.drivers.reduce((t, d) => t + d.points, 0);
  if (sum !== a.healthScore) throw new Error(`${a.name}: drivers sum to ${sum}, score ${a.healthScore}`);
}

const body = accounts
  .map(
    (a) =>
      `  { id: ${JSON.stringify(a.id)}, name: ${JSON.stringify(a.name)}, segment: ${JSON.stringify(
        a.segment,
      )}, arr: ${a.arr}, healthScore: ${a.healthScore}, owner: ${JSON.stringify(
        a.owner,
      )}, lastTouched: ${JSON.stringify(a.lastTouched)}, seatUtilization: ${
        a.seatUtilization === null ? "null" : a.seatUtilization
      }, renewalDate: ${JSON.stringify(
        a.renewalDate,
      )}, drivers: [${a.drivers
        .map((d) => `{ key: ${JSON.stringify(d.key)}, label: ${JSON.stringify(d.label)}, points: ${d.points} }`)
        .join(", ")}], healthHistory: [${a.healthHistory.join(", ")}] },`,
  )
  .join("\n");

const file = `// AUTO-GENERATED by scripts/generate-accounts.ts — do not edit by hand.
export type Segment = "Enterprise" | "Mid-Market" | "SMB";

/** One named contribution to the health score. Signed points. */
export interface Driver {
  key: string;
  label: string;
  points: number;
}

/** Every score is BASE plus the sum of its drivers, clamped to 8-99. */
export const HEALTH_BASE = ${BASE};

export interface Account {
  id: string;
  name: string;
  segment: Segment;
  arr: number;
  healthScore: number;
  owner: string;
  lastTouched: string;
  /** Share of contracted seats actively used, 0-1. Null = no seat commitment. */
  seatUtilization: number | null;
  /** ISO date of the next renewal. */
  renewalDate: string;
  /** Ordered score composition; HEALTH_BASE + sum(points) === healthScore. */
  drivers: Driver[];
  /** 13 weekly readings, oldest first; the last entry equals healthScore. */
  healthHistory: number[];
}

export const accounts: Account[] = [
${body}
];

/** Week-over-week change, derived rather than stored. */
export const weekDelta = (a: Account) =>
  a.healthHistory[a.healthHistory.length - 1]! - a.healthHistory[a.healthHistory.length - 2]!;

/** Change over the trailing four weeks. */
export const fourWeekDelta = (a: Account) =>
  a.healthHistory[a.healthHistory.length - 1]! - a.healthHistory[a.healthHistory.length - 5]!;

/** Peak health within the 13-week window minus the current score. */
export const drawdown = (a: Account) =>
  Math.max(...a.healthHistory) - a.healthScore;

/** Health score as of four weeks ago, for stat-row deltas. */
export const healthFourWeeksAgo = (a: Account) =>
  a.healthHistory[a.healthHistory.length - 5]!;
`;

writeFileSync(new URL("../src/data/accounts.ts", import.meta.url), file);
console.log(`wrote ${accounts.length} accounts`);
