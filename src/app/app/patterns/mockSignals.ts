// Deterministic mock signal data per pattern. Used by SignalDrawer (sidebar
// list + detail view) and SplitPatternModal (signal assignment to new patterns).

export type SignalIntensity = 'low' | 'medium' | 'high';

export interface SignalLite {
  id: string;
  patternId: string;
  customer: string;
  title: string;
  intensity: SignalIntensity;
  createdAt: string; // ISO date
  status: 'open' | 'resolved';
  description: string;
  rootCause?: string;
  resolution?: string;
  updates?: { author: string; ago: string; text: string; type: UpdateType }[];
  assignee?: string;
  updatedAt?: string; // formatted display string
  targetClosure?: string; // formatted display string
}

export type UpdateType = 'insight' | 'email' | 'action' | 'call';

const CUSTOMER_POOL = [
  'Tata Neu', 'Reliance Digital', 'Plum Insurance', 'Dittto Insurance', 'Flipkart',
  'Urban Piper', 'Safety App', 'Razorpay', 'CRED', 'PharmEasy',
  'Acme Corporation', 'TechVision Inc', 'Global Dynamics', 'BrightPath Solutions',
];

const SIGNAL_TEMPLATES = [
  { title: 'Invoice rejected — GSTIN format mismatch',         intensity: 'high'   as SignalIntensity, root: 'Stale GST master cache', resolution: 'Bulk re-generated invoices' },
  { title: 'Tax rate applied incorrectly for ship-to state',   intensity: 'high'   as SignalIntensity, root: 'CRM state out of sync with tax engine', resolution: 'Sync customer profile' },
  { title: 'Reverse-charge identifier missing on invoice',     intensity: 'medium' as SignalIntensity, root: 'Template missing RCM flag', resolution: 'Regenerate with updated template' },
  { title: 'Duplicate GSTIN entries flagged in audit log',     intensity: 'medium' as SignalIntensity, root: 'Manual entry drift', resolution: 'Dedupe + audit job' },
  { title: 'Customer disputed invoice for wrong CGST split',   intensity: 'high'   as SignalIntensity, root: 'Billing state mismatch', resolution: 'Issued corrected invoice' },
  { title: 'Auto-validation failed — CGST + SGST + IGST sum',  intensity: 'medium' as SignalIntensity, root: 'Rate fallback to 18%', resolution: 'Updated rate lookup' },
  { title: 'PAN-derived GSTIN does not match company filing',  intensity: 'low'    as SignalIntensity, root: 'Stale company master data', resolution: 'Refresh from MCA' },
  { title: 'Invoice not surfacing in GST portal sync',         intensity: 'medium' as SignalIntensity, root: 'Portal API retry exhausted', resolution: 'Manual resubmission' },
  { title: 'Vendor flagged GSTIN as inactive',                 intensity: 'low'    as SignalIntensity, root: 'Vendor profile lapsed', resolution: 'Vendor follow-up + de-listing' },
  { title: 'Refund credit-note GSTIN mismatch',                intensity: 'high'   as SignalIntensity, root: 'Original invoice routing error', resolution: 'Reissue with correct GSTIN' },
];

const UPDATE_AUTHORS = ['Harsh Patel', 'Rahul Shinde', 'Priya Sharma', 'Sachin Tendulkar'];
const UPDATE_AGOS = ['Just now', '2 hours ago', '1 day ago', '3 days ago', '1 week ago'];

// Stable PRNG-ish hash → deterministic mocks per pattern.
function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function pickFrom<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}

const CACHE: Record<string, SignalLite[]> = {};

export function getSignalsForPattern(patternId: string, count = 10): SignalLite[] {
  const cap = Math.max(1, Math.min(count, 12));
  const cacheKey = `${patternId}:${cap}`;
  if (CACHE[cacheKey]) return CACHE[cacheKey];

  const base = hash(patternId);
  const signals: SignalLite[] = Array.from({ length: cap }).map((_, i) => {
    const tpl = pickFrom(SIGNAL_TEMPLATES, base + i * 3);
    const customer = pickFrom(CUSTOMER_POOL, base + i * 7);
    const daysAgo = (i + 1) * 2 + (base % 5);
    const date = new Date(Date.now() - daysAgo * 86400000);
    return {
      id: `${patternId}_s${i + 1}`,
      patternId,
      customer,
      title: tpl.title,
      intensity: tpl.intensity,
      createdAt: date.toISOString(),
      status: i < cap - 2 ? 'open' : 'resolved',
      description: `${customer} reported: "${tpl.title}". Multiple invoices in the recent billing cycle are affected.`,
      rootCause: tpl.root,
      resolution: i >= cap - 2 ? tpl.resolution : undefined,
      assignee: pickFrom(['Vikram Sahu', 'Aryan Verma', 'Priya Sharma', 'Rahul Shinde'], base + i),
      updatedAt: 'Aug 21, 2025',
      targetClosure: 'Nov 30, 2025',
      updates: [
        { author: pickFrom(UPDATE_AUTHORS, base + i),       ago: '1 day ago',  text: 'High-priority support ticket created with an urgency label (e.g., "P1 - Feature X is down, stopping our daily operations").', type: 'insight' },
        { author: pickFrom(UPDATE_AUTHORS, base + i + 1),   ago: '1 day ago',  text: 'A high-priority support ticket has been created and marked as P1, as the Feature X outage is impacting daily operations. Our team is actively investigating and working toward immediate resolution.', type: 'email' },
        { author: pickFrom(UPDATE_AUTHORS, base + i + 2),   ago: '5 days ago', text: 'Automated alert triggers an internal service-level agreement (SLA) clock for a Technical Account Manager (TAM) / Engineering.', type: 'action' },
        { author: pickFrom(UPDATE_AUTHORS, base + i + 3),   ago: '6 days ago', text: 'The TAM or CSM sends a high-touch, personalized communication (e.g., a direct phone call followed by an email).', type: 'call' },
      ],
    };
  });

  CACHE[cacheKey] = signals;
  return signals;
}

export function intensityClasses(intensity: SignalIntensity): { bg: string; text: string; label: string } {
  switch (intensity) {
    case 'high':   return { bg: 'bg-red-50',   text: 'text-red-700',   label: 'High'   };
    case 'medium': return { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Medium' };
    case 'low':    return { bg: 'bg-green-50', text: 'text-green-700', label: 'Low'    };
  }
}
