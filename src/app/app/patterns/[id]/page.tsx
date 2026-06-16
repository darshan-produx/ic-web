'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ChevronLeft, ChevronDown, ChevronUp,
  Plus, Sparkles, Pencil, GitFork, SquareCheck, NotebookPen, EyeOff, Eye,
} from 'lucide-react';
import {
  EditPatternModal,
  SplitPatternModal,
  ReclassifyModal,
} from '../PatternActionModals';
import type { Pattern } from '../PatternsGridView';

// ── Types ────────────────────────────────────────────────────────────────────

interface AffectedCustomer {
  id: string;
  name: string;
  openSignals: number;
  totalSignals: number;
  avgIntensity: number;
  revenueAtRisk: number;
}

interface Update {
  id: string;
  author: string;
  ago: string;
  text: string;
}

// ── Dummy content ────────────────────────────────────────────────────────────

const PATTERN = {
  id: 'gst-invoices',
  type: 'Signal Pattern',
  title: 'GST information is incorrect in all invoices',
  createdOn: 'Nov 12, 2025',
  assignees: ['Ruchit', 'Punit', 'Pooja', 'Aryan', 'Nita'],
  description:
    "GST errors across invoices are affecting multiple customers, with a high volume of open issues and slow resolution. The problem appears systemic, impacting key accounts and putting revenue at risk. Issues are accumulating faster than they're resolved, pointing to a need for a root-cause fix over manual handling.",
  kpis: {
    customersAffected: 10,
    openSignals: 206,
    totalSignals: 206,
    avgIntensity: 2.8,
    revenueAtRisk: 728000,
  },
  affected: [
    { id: 'c1',  name: 'Tata Neu',         openSignals: 35, totalSignals: 11, avgIntensity: 2.8, revenueAtRisk: 45000 },
    { id: 'c2',  name: 'Reliance Digital', openSignals: 14, totalSignals: 12, avgIntensity: 3.6, revenueAtRisk: 28000 },
    { id: 'c3',  name: 'Plum Insurance',   openSignals: 39, totalSignals: 29, avgIntensity: 1.9, revenueAtRisk: 61000 },
    { id: 'c4',  name: 'Dittto Insurance', openSignals: 63, totalSignals: 11, avgIntensity: 3.4, revenueAtRisk: 74000 },
    { id: 'c5',  name: 'Flipkart',         openSignals: 97, totalSignals: 28, avgIntensity: 2.8, revenueAtRisk: 53000 },
    { id: 'c6',  name: 'Urban Piper',      openSignals: 28, totalSignals: 19, avgIntensity: 1.3, revenueAtRisk: 19000 },
    { id: 'c7',  name: 'Safety App',       openSignals: 52, totalSignals: 43, avgIntensity: 2.2, revenueAtRisk: 88000 },
    { id: 'c8',  name: 'Razorpay',         openSignals: 22, totalSignals: 18, avgIntensity: 1.8, revenueAtRisk: 52000 },
    { id: 'c9',  name: 'CRED',             openSignals: 18, totalSignals: 15, avgIntensity: 2.2, revenueAtRisk: 36000 },
    { id: 'c10', name: 'PharmEasy',        openSignals: 17, totalSignals: 12, avgIntensity: 3.0, revenueAtRisk: 28000 },
  ] as AffectedCustomer[],
  observations: [
    'Wrong GSTIN format on outbound invoices',
    'Tax rate mismatches between billing and ship-to state',
    'Reverse-charge invoices missing required identifiers',
  ],
  rootCauses: [
    'Invoice templating service uses stale GST master data',
    'Customer billing state in CRM is out of sync with tax engine',
    'No server-side validation of GSTIN format at submit',
  ],
  resolutions: [
    'Bulk-regenerate impacted invoices after GSTIN correction',
    'Sync customer GST profile from authoritative source weekly',
    'Add server-side GSTIN format check at invoice creation',
  ],
  chart: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug'],
    newSignals:    [ 9, 18, 13, 19, 21,  8, 13, 18],
    closedSignals: [ 6, 11,  7, 14,  6, 13, 11, 15],
    openSignals:   [18, 19, 24, 17, 30, 22, 13, 27],
  },
  updates: [
    {
      id: 'u1', author: 'Harsh Patel', ago: 'Just now',
      text: 'Billing discrepancies generate a cross-functional review task for Finance and Customer Operations.',
    },
    {
      id: 'u2', author: 'Harsh Patel', ago: '2 hours ago',
      text: 'High-priority support ticket created with an urgency label (e.g., "P1 - Feature X is down, stopping our daily operations").',
    },
    {
      id: 'u3', author: 'Rahul Shinde', ago: '1 day ago',
      text: 'A high-priority support ticket has been created and marked as P1, as the Feature X outage is impacting daily operations. Our team is actively investigating and working toward immediate resolution.',
    },
    {
      id: 'u4', author: 'Sachin Tendulkar', ago: '5 days ago',
      text: 'Automated alert triggers an internal service-level agreement (SLA) clock for a Technical Account Manager (TAM) / Engineering.',
    },
  ] as Update[],
};

// Shared grid template — KPI strip + table use the SAME column widths so
// every cell lines up vertically across both widgets.
const COLS = 'grid grid-cols-[2fr_1fr_1fr_1.1fr_1.3fr]';

// ── Formatting helpers ───────────────────────────────────────────────────────

function formatUSD(v: number): string {
  return '$' + Math.round(v).toLocaleString();
}

function intensityColor(score: number): { bg: string; text: string; dot: string } {
  if (score >= 3.0) return { bg: 'bg-red-50',    text: 'text-red-700',    dot: 'bg-red-500'    };
  if (score >= 2.0) return { bg: 'bg-amber-50',  text: 'text-amber-700',  dot: 'bg-amber-500'  };
  return                       { bg: 'bg-green-50',  text: 'text-green-700',  dot: 'bg-green-500'  };
}

function IntensityPill({ score }: { score: number }) {
  const c = intensityColor(score);
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[12px] font-medium ${c.bg} ${c.text}`}>
      {score.toFixed(1)}
    </span>
  );
}

// ── Bar + line chart (inline SVG, no libs) ───────────────────────────────────

function NewVsClosedChart({
  labels, newSignals, closedSignals, openSignals,
}: {
  labels: string[];
  newSignals: number[];
  closedSignals: number[];
  openSignals: number[];
}) {
  const padding = { top: 20, right: 16, bottom: 30, left: 36 };
  const width = 720;
  const height = 280;
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const allValues = [...newSignals, ...closedSignals, ...openSignals];
  const maxValue = Math.max(40, Math.ceil(Math.max(...allValues) / 5) * 5);
  const yTicks = [5, 12, 19, 26, 33, 40].filter(v => v <= maxValue);

  const x = (i: number) => padding.left + (chartW / labels.length) * (i + 0.5);
  const y = (v: number) => padding.top + chartH - (v / maxValue) * chartH;

  const groupW = chartW / labels.length;
  const barW = Math.min(14, groupW / 3);
  const gap = 4;

  const linePath = openSignals
    .map((v, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(v).toFixed(1)}`)
    .join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
      {yTicks.map(t => (
        <g key={t}>
          <line x1={padding.left} x2={width - padding.right} y1={y(t)} y2={y(t)} stroke="#F2F4F7" strokeWidth="1" />
          <text x={padding.left - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill="#9CA3AF">{t}</text>
        </g>
      ))}
      {labels.map((label, i) => {
        const cx = x(i);
        const newH = (newSignals[i] / maxValue) * chartH;
        const closedH = (closedSignals[i] / maxValue) * chartH;
        return (
          <g key={label}>
            <rect x={cx - barW - gap / 2} y={padding.top + chartH - newH} width={barW} height={newH} fill="#475467" rx="1" />
            <rect x={cx + gap / 2} y={padding.top + chartH - closedH} width={barW} height={closedH} fill="#D0D5DD" rx="1" />
            <text x={cx} y={height - 10} textAnchor="middle" fontSize="11" fill="#637083">{label}</text>
          </g>
        );
      })}
      <path d={linePath} fill="none" stroke="#111827" strokeWidth="1.5" />
      {openSignals.map((v, i) => (
        <circle key={i} cx={x(i)} cy={y(v)} r="2" fill="#111827" />
      ))}
    </svg>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function PatternDetailPage() {
  const [title, setTitle] = useState(PATTERN.title);
  const [description, setDescription] = useState(PATTERN.description);
  const [trackingEnabled, setTrackingEnabled] = useState(true);
  const [activeAction, setActiveAction] = useState<'rename' | 'split' | 'reclassify' | null>(null);
  const [splitMessage, setSplitMessage] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };
  const [updates, setUpdates] = useState<Update[]>(PATTERN.updates);
  const [newUpdate, setNewUpdate] = useState('');
  const [showUpdateInput, setShowUpdateInput] = useState(false);
  const [affectedExpanded, setAffectedExpanded] = useState(true);
  const [sortKey, setSortKey] = useState<keyof Pick<AffectedCustomer, 'openSignals' | 'totalSignals' | 'avgIntensity' | 'revenueAtRisk'>>('openSignals');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // Build a minimal Pattern shape so the shared modals (RenamePatternModal,
  // SplitPatternModal) work without needing a fresh data model on this page.
  const patternForModals: Pattern = {
    id: PATTERN.id,
    trend: [],
    title,
    labels: [],
    description,
    openSignals: PATTERN.kpis.openSignals,
    impactedCustomers: PATTERN.kpis.customersAffected,
    createdBy: 'System',
    assignedTo: PATTERN.assignees,
    createdOn: PATTERN.createdOn,
    trackingEnabled,
  };

  const sortedAffected = useMemo(() => {
    return [...PATTERN.affected].sort((a, b) => {
      const diff = (a[sortKey] as number) - (b[sortKey] as number);
      return sortDir === 'asc' ? diff : -diff;
    });
  }, [sortKey, sortDir]);

  const aggregate = useMemo(() => {
    const total = PATTERN.affected.length;
    return {
      total,
      sumOpen: PATTERN.affected.reduce((s, c) => s + c.openSignals, 0),
      sumTotal: PATTERN.affected.reduce((s, c) => s + c.totalSignals, 0),
      sumRevenue: PATTERN.affected.reduce((s, c) => s + c.revenueAtRisk, 0),
      avgIntensity: PATTERN.affected.reduce((s, c) => s + c.avgIntensity, 0) / total,
    };
  }, []);

  const toggleSort = (key: typeof sortKey) => {
    if (sortKey === key) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('desc'); }
  };

  const handleAddUpdate = () => {
    const trimmed = newUpdate.trim();
    if (!trimmed) return;
    setUpdates(prev => [
      { id: `u_${Date.now()}`, author: 'You', ago: 'Just now', text: trimmed },
      ...prev,
    ]);
    setNewUpdate('');
    setShowUpdateInput(false);
  };

  const assigneesLabel = PATTERN.assignees.length > 3
    ? `${PATTERN.assignees.slice(0, 3).join(', ')}, and ${PATTERN.assignees.length - 3} others`
    : PATTERN.assignees.join(', ');

  const SortableHeader = ({ label, k }: { label: string; k: typeof sortKey }) => {
    const active = sortKey === k;
    return (
      <button
        onClick={() => toggleSort(k)}
        className={`inline-flex items-center gap-1 text-[12px] font-medium whitespace-nowrap hover:text-[#141C24] ${active ? 'text-[#141C24]' : 'text-[#637083]'}`}
      >
        <span>{label}</span>
        {active && (sortDir === 'asc'
          ? <ChevronUp className="w-3 h-3 shrink-0" />
          : <ChevronDown className="w-3 h-3 shrink-0" />)}
      </button>
    );
  };

  return (
    <div className="max-w-[1200px] mx-auto px-8 pt-6 pb-12">
      {/* ── Top bar: Back ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/app/patterns"
          className="flex items-center gap-1.5 text-[13px] font-medium text-[#637083] hover:text-[#141C24] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </Link>
      </div>

      {/* Split success toast */}
      {splitMessage && (
        <div className="mb-4 px-4 py-2.5 bg-blue-50 border border-blue-100 rounded-[8px] flex items-center justify-between gap-3">
          <p className="text-[13px] text-blue-900">{splitMessage}</p>
          <button
            onClick={() => setSplitMessage(null)}
            className="text-[12px] font-medium text-blue-700 hover:text-blue-900"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Generic action toast (tracking toggle, reclassify confirmation, etc.) */}
      {toast && (
        <div className="mb-4 px-4 py-2.5 bg-[#F9FAFB] border border-[#E4E7EC] rounded-[8px] text-[13px] text-[#141C24] flex items-center justify-between gap-3">
          <span>{toast}</span>
          <button onClick={() => setToast(null)} className="text-[12px] font-medium text-[#637083] hover:text-[#141C24]">Dismiss</button>
        </div>
      )}

      {/* Tracking disabled banner */}
      {!trackingEnabled && (
        <div className="mb-4 px-4 py-2.5 bg-amber-50 border border-amber-100 rounded-[8px] text-[13px] text-amber-900 flex items-center gap-2">
          <EyeOff className="w-3.5 h-3.5 shrink-0" />
          <span>Tracking is stopped. No new signals will be generated for this pattern until you re-enable tracking.</span>
        </div>
      )}

      {/* ── Title row + action buttons ──────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-6 mb-8">
        <div className="min-w-0 flex-1">
          <h1 className="text-[24px] font-bold text-[#141C24] leading-tight">
            {title}
          </h1>
          <div className="mt-2 flex items-center gap-3 text-[13px] text-[#637083] flex-wrap">
            <span>{PATTERN.type}</span>
            <span className="text-[#D0D5DD]">|</span>
            <span>Created on <span className="text-[#141C24]">{PATTERN.createdOn}</span></span>
            <span className="text-[#D0D5DD]">|</span>
            <span>Assigned to <span className="text-[#141C24]">{assigneesLabel}</span></span>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          <button
            onClick={() => setActiveAction('rename')}
            className="flex items-center gap-1.5 h-9 px-3 text-[13px] font-medium text-[#141C24] border border-[#E4E7EC] rounded-[8px] bg-white hover:bg-[#F9FAFB] transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </button>
          <button
            onClick={() => setActiveAction('split')}
            className="flex items-center gap-1.5 h-9 px-3 text-[13px] font-medium text-[#141C24] border border-[#E4E7EC] rounded-[8px] bg-white hover:bg-[#F9FAFB] transition-colors"
          >
            <GitFork className="w-3.5 h-3.5" />
            Fork
          </button>
          <button
            onClick={() => {
              const next = !trackingEnabled;
              setTrackingEnabled(next);
              showToast(next
                ? 'Tracking enabled. New signals will be classified into this pattern.'
                : 'Tracking stopped. No new signals will be generated for this pattern.');
            }}
            className={`flex items-center gap-1.5 h-9 px-3 text-[13px] font-medium border rounded-[8px] transition-colors ${
              trackingEnabled
                ? 'text-[#141C24] border-[#E4E7EC] bg-white hover:bg-[#F9FAFB]'
                : 'text-blue-700 border-blue-200 bg-blue-50 hover:bg-blue-100'
            }`}
          >
            {trackingEnabled
              ? <><EyeOff className="w-3.5 h-3.5" /> Stop tracking</>
              : <><Eye className="w-3.5 h-3.5" /> Enable tracking</>}
          </button>
          <button className="w-9 h-9 flex items-center justify-center border border-[#E4E7EC] rounded-[8px] text-[#637083] hover:bg-[#F9FAFB] transition-colors" aria-label="Task">
            <SquareCheck className="w-4 h-4" />
          </button>
          <button className="w-9 h-9 flex items-center justify-center border border-[#E4E7EC] rounded-[8px] text-[#637083] hover:bg-[#F9FAFB] transition-colors" aria-label="Notes">
            <NotebookPen className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Main grid: left (overview) + right (rail) ──────────────────────── */}
      <div className="grid grid-cols-12 gap-6">
        {/* ── Left column ──────────────────────────────────────────────────── */}
        <div className="col-span-12 lg:col-span-8 space-y-5">
          {/* Description */}
          <p className="text-[14px] text-[#475467] leading-relaxed">
            {PATTERN.description}
          </p>

          {/* KPI strip — columns aligned with Affected customers table below */}
          <div className="border border-[#E4E7EC] rounded-[12px] overflow-hidden">
            <div className={COLS}>
              <KpiCell label="Customers affected" value={PATTERN.kpis.customersAffected.toString()} />
              <KpiCell label="Open signals"       value={PATTERN.kpis.openSignals.toString()} />
              <KpiCell label="Total signals"      value={PATTERN.kpis.totalSignals.toString()} />
              <KpiCell label="Avg. Intensity"     value={<IntensityPill score={PATTERN.kpis.avgIntensity} />} />
              <KpiCell label="Revenue at risk"    value={formatUSD(PATTERN.kpis.revenueAtRisk)} />
            </div>
          </div>

          {/* Affected customers — collapsible, columns aligned with KPI strip above */}
          <div className="border border-[#E4E7EC] rounded-[12px] overflow-hidden">
            <button
              onClick={() => setAffectedExpanded(v => !v)}
              className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-[#F9FAFB] transition-colors"
            >
              <h2 className="text-[14px] font-semibold text-[#141C24]">
                {PATTERN.kpis.customersAffected} affected customers
              </h2>
              {affectedExpanded
                ? <ChevronUp className="w-4 h-4 text-[#637083]" />
                : <ChevronDown className="w-4 h-4 text-[#637083]" />}
            </button>

            {affectedExpanded && (
              <>
                {/* Header row */}
                <div className={`${COLS} border-t border-[#E4E7EC] bg-[#F9FAFB]`}>
                  <div className="px-4 py-2.5 text-[12px] font-medium text-[#637083] whitespace-nowrap">Customers</div>
                  <div className="px-4 py-2.5"><SortableHeader label="Open signals"    k="openSignals" /></div>
                  <div className="px-4 py-2.5"><SortableHeader label="Total signals"   k="totalSignals" /></div>
                  <div className="px-4 py-2.5"><SortableHeader label="Avg. Intensity"  k="avgIntensity" /></div>
                  <div className="px-4 py-2.5"><SortableHeader label="Revenue at risk" k="revenueAtRisk" /></div>
                </div>

                {/* Aggregate row */}
                <div className={`${COLS} border-t border-[#E4E7EC]`}>
                  <div className="px-4 py-3 text-[14px] text-[#141C24] font-semibold">All customers ({aggregate.total})</div>
                  <div className="px-4 py-3 text-[14px] text-[#141C24] font-semibold">{aggregate.sumOpen}</div>
                  <div className="px-4 py-3 text-[14px] text-[#141C24] font-semibold">{aggregate.sumTotal}</div>
                  <div className="px-4 py-3"><IntensityPill score={aggregate.avgIntensity} /></div>
                  <div className="px-4 py-3 text-[14px] text-[#141C24] font-semibold">{formatUSD(aggregate.sumRevenue)}</div>
                </div>

                {/* Individual rows */}
                {sortedAffected.map((c) => (
                  <div key={c.id} className={`${COLS} border-t border-[#F2F4F7] hover:bg-[#F9FAFB]`}>
                    <div className="px-4 py-3 text-[14px] text-[#141C24]">{c.name}</div>
                    <div className="px-4 py-3 text-[14px] text-[#141C24]">{c.openSignals}</div>
                    <div className="px-4 py-3 text-[14px] text-[#141C24]">{c.totalSignals}</div>
                    <div className="px-4 py-3"><IntensityPill score={c.avgIntensity} /></div>
                    <div className="px-4 py-3 text-[14px] text-[#141C24]">{formatUSD(c.revenueAtRisk)}</div>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* New vs closed issues chart */}
          <div>
            <h2 className="text-[16px] font-semibold text-[#141C24] mb-3">New vs closed issues</h2>
            <div className="border border-[#E4E7EC] rounded-[12px] p-5">
              <div className="flex items-center gap-4 mb-3 text-[12px] text-[#637083]">
                <LegendDot color="#111827" shape="line"  label="Open signals" />
                <LegendDot color="#475467" shape="bar"   label="New" />
                <LegendDot color="#D0D5DD" shape="bar"   label="Closed" />
              </div>
              <NewVsClosedChart
                labels={PATTERN.chart.labels}
                newSignals={PATTERN.chart.newSignals}
                closedSignals={PATTERN.chart.closedSignals}
                openSignals={PATTERN.chart.openSignals}
              />
            </div>
          </div>
        </div>

        {/* ── Right column (rail) ─────────────────────────────────────────── */}
        <aside className="col-span-12 lg:col-span-4 space-y-5">
          {/* Insight card: Get guidance + 3 synthesis sections */}
          <div className="border border-[#E4E7EC] rounded-[12px] divide-y divide-[#E4E7EC]">
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-[14px] font-semibold text-[#141C24]">Want help fixing the root cause?</h3>
                <button className="shrink-0 h-8 px-3 inline-flex items-center gap-1.5 text-[12px] font-medium text-[#141C24] border border-[#E4E7EC] rounded-[8px] bg-white hover:bg-[#F9FAFB] transition-colors">
                  <Sparkles className="w-3.5 h-3.5 text-[#637083]" />
                  Get guidance
                </button>
              </div>
            </div>

            <SynthesisSection title="Top observations"   items={PATTERN.observations} />
            <SynthesisSection title="Likely root causes" items={PATTERN.rootCauses} />
            <SynthesisSection title="Typical resolutions" items={PATTERN.resolutions} />
          </div>

          {/* Updates card (separate) */}
          <div className="border border-[#E4E7EC] rounded-[12px] p-5">
            <h3 className="text-[14px] font-semibold text-[#141C24]">Updates</h3>

            {showUpdateInput ? (
              <div className="mt-3 mb-4 border border-[#E4E7EC] rounded-[8px] p-3 bg-white">
                <textarea
                  autoFocus
                  value={newUpdate}
                  onChange={e => setNewUpdate(e.target.value)}
                  rows={2}
                  placeholder="Share an update…"
                  className="w-full text-[13px] text-[#141C24] outline-none resize-none placeholder:text-[#9CA3AF]"
                />
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    onClick={() => { setShowUpdateInput(false); setNewUpdate(''); }}
                    className="px-3 h-8 text-[12px] font-medium text-[#637083] hover:bg-[#F2F4F7] rounded-[8px]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddUpdate}
                    disabled={!newUpdate.trim()}
                    className="px-3 h-8 text-[12px] font-medium text-white bg-blue-600 rounded-[8px] hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Post update
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowUpdateInput(true)}
                className="mt-3 mb-4 flex items-center gap-1.5 text-[13px] font-medium text-blue-600 hover:text-blue-700"
              >
                <Plus className="w-3.5 h-3.5" />
                Add an update
              </button>
            )}

            <div className="space-y-4">
              {updates.map((u, i) => (
                <div key={u.id} className={i !== updates.length - 1 ? 'pb-4 border-b border-[#F2F4F7]' : ''}>
                  <p className="text-[13px] text-[#141C24] leading-snug">{u.text}</p>
                  <p className="text-[11px] text-[#9CA3AF] mt-1.5">By {u.author}, {u.ago}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* ── Rename / Split modals ─────────────────────────────────────────── */}
      {activeAction === 'rename' && (
        <EditPatternModal
          pattern={patternForModals}
          onCancel={() => setActiveAction(null)}
          onSubmit={({ title: nextTitle, description: nextDescription }) => {
            setTitle(nextTitle);
            setDescription(nextDescription);
            // Always offer reclassify after edit (per call-transcript flow).
            setActiveAction('reclassify');
          }}
        />
      )}

      {activeAction === 'split' && (
        <SplitPatternModal
          pattern={patternForModals}
          onCancel={() => setActiveAction(null)}
          onSubmit={({ forks }) => {
            const summary = forks.map(f => `"${f.title}"`).join(', ');
            setSplitMessage(`Pattern forked into ${forks.length} new pattern${forks.length !== 1 ? 's' : ''}: ${summary}. Original remains; signals will be reclassified automatically.`);
            // Always offer reclassify after fork.
            setActiveAction('reclassify');
          }}
        />
      )}

      {activeAction === 'reclassify' && (
        <ReclassifyModal
          pattern={patternForModals}
          prompt
          onCancel={() => setActiveAction(null)}
          onSkip={() => setActiveAction(null)}
          onSubmit={(scope) => {
            setActiveAction(null);
            showToast(scope === 'this_pattern_only'
              ? 'Reclassifying signals in this pattern…'
              : 'Reclassifying signals in this pattern + unassigned signals…');
          }}
        />
      )}
    </div>
  );
}

// ── Small helpers ────────────────────────────────────────────────────────────

function KpiCell({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="px-4 py-3.5">
      <p className="text-[12px] text-[#637083]">{label}</p>
      <div className="text-[18px] font-bold text-[#141C24] mt-1 leading-tight">{value}</div>
    </div>
  );
}

function SynthesisSection({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="p-5">
      <h3 className="text-[13px] font-semibold text-[#141C24] mb-3">{title}</h3>
      <ul className="space-y-2.5">
        {items.map((it, i) => (
          <li
            key={i}
            className="border-l-[2px] border-[#D0D5DD] pl-3 text-[13px] text-[#141C24] leading-snug"
          >
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}

function LegendDot({ color, shape, label }: { color: string; shape: 'bar' | 'line'; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {shape === 'line' ? (
        <span className="inline-block w-3 h-[2px]" style={{ background: color }} />
      ) : (
        <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: color }} />
      )}
      <span>{label}</span>
    </span>
  );
}
