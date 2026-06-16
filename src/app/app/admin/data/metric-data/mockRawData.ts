// Raw data behind an "Aggregated" metric. Each row is a single observation for
// a customer (with tags + date + value). The aggregated metric cell shows the
// cumulative sum of these rows for a given customer + period.

export interface RawDataRow {
  id: string;
  customer: string;
  date: string;      // ISO date
  tags: string[];
  value: number;
}

export const RAW_TAG_POOL = [
  'Hyderabad', 'Delhi', 'Bangalore', 'Pune', 'Mumbai',
  'POS', 'Gateway', 'Remittance', 'Payouts', 'Lending',
];

const RAW_CUSTOMERS = [
  'Acme Corporation', 'TechVision Inc', 'Global Dynamics', 'BrightPath Solutions',
  'Skyline Ventures', 'NovaStar Systems', 'Vertex Analytics', 'PeakFlow Labs',
  'Crestline Partners', 'Bluewave Technologies', 'Summit Data Co', 'RedRock Holdings',
  'Coastal Systems', 'Ironclad Software', 'Zenith Platforms',
];

const VALUE_POOL = [370119.1, 208473, 393798, 368030.2, 227747.9, 360455.1, 431193.4, 410441.8];
const MONTHS = [
  'Nov 1, 2025', 'Nov 12, 2025', 'Dec 9, 2025', 'Sep 28, 2025',
  'Jan 15, 2026', 'Feb 4, 2026', 'Oct 16, 2025', 'Nov 9, 2025',
  'Nov 28, 2025', 'Nov 15, 2025', 'Nov 4, 2025', 'Nov 16, 2025',
];

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function pick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}

const CACHE: Record<string, RawDataRow[]> = {};

/**
 * Raw rows for a metric. When `customer` is provided, returns ~7 rows for just
 * that customer (used when editing a single aggregated cell). Otherwise returns
 * a wider set spanning all customers (the full "Raw data" table).
 */
export function getRawData(metricKey: string, customer?: string): RawDataRow[] {
  const cacheKey = `${metricKey}::${customer ?? '__all__'}`;
  if (CACHE[cacheKey]) return CACHE[cacheKey];

  const base = hash(cacheKey);
  const count = customer ? 7 : 22;
  const rows: RawDataRow[] = Array.from({ length: count }).map((_, i) => {
    const seed = base + i * 13;
    const t1 = pick(RAW_TAG_POOL, seed);
    const t2 = pick(RAW_TAG_POOL, seed + 5);
    const tags = t1 === t2 ? [t1] : [t1, t2];
    return {
      id: `${metricKey}-raw-${customer ?? 'all'}-${i + 1}`,
      customer: customer ?? pick(RAW_CUSTOMERS, seed),
      date: pick(MONTHS, seed + 2),
      tags,
      value: pick(VALUE_POOL, seed + 3),
    };
  });

  CACHE[cacheKey] = rows;
  return rows;
}

export function formatRawValue(v: number): string {
  // Match the "$370,119.1" style from the design.
  const rounded = Math.round(v * 10) / 10;
  return '$' + rounded.toLocaleString('en-US', { maximumFractionDigits: 1 });
}
