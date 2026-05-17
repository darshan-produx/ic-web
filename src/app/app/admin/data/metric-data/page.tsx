'use client';

import React, { useMemo, useState, useRef, useCallback } from 'react';
import { Search, Download, Upload, ChevronDown, Check, X, PencilLine, Pencil, Ban } from 'lucide-react';
import GridView from '../../../../../common/components/GridView';
import { Dropdown } from '../../../../../common/Dropdown';

// ── Types ─────────────────────────────────────────────────────────────────────

interface MetricDef {
  key: string;
  label: string;
  type: 'manual' | 'pipeline';
  unit: 'currency' | 'number' | 'percent';
}

interface CustomerRow {
  id: string;
  customer: string;
  segment: string;
  [key: string]: string;
}

interface UploadPreview {
  fileName: string;
  changedRows: { customer: string; period: string; oldVal: string; newVal: string }[];
}

// ── Constants ─────────────────────────────────────────────────────────────────

const METRICS: MetricDef[] = [
  // Manual
  { key: 'arr',               label: 'ARR',                       type: 'manual',   unit: 'currency' },
  { key: 'nps',               label: 'NPS Score',                 type: 'manual',   unit: 'number'   },
  { key: 'health_score',      label: 'Health Score',              type: 'manual',   unit: 'number'   },
  { key: 'mrr',               label: 'MRR',                       type: 'manual',   unit: 'currency' },
  { key: 'product_adoption',  label: 'Product Adoption Rate',     type: 'manual',   unit: 'percent'  },
  { key: 'exec_engagement',   label: 'Exec Sponsor Engagement',   type: 'manual',   unit: 'number'   },
  { key: 'training_complete', label: 'Training Completion',       type: 'manual',   unit: 'percent'  },
  { key: 'support_tickets',   label: 'Open Support Tickets',      type: 'manual',   unit: 'number'   },
  { key: 'csat',              label: 'CSAT Score',                type: 'manual',   unit: 'number'   },
  { key: 'feature_requests',  label: 'Feature Requests',          type: 'manual',   unit: 'number'   },
  // Pipeline (CRM-synced)
  { key: 'pipeline_arr',      label: 'Pipeline ARR',              type: 'pipeline', unit: 'currency' },
  { key: 'renewal_prob',      label: 'Renewal Probability',       type: 'pipeline', unit: 'percent'  },
  { key: 'expansion_arr',     label: 'Expansion ARR',             type: 'pipeline', unit: 'currency' },
  { key: 'churn_risk',        label: 'Churn Risk Score',          type: 'pipeline', unit: 'number'   },
  { key: 'days_to_renewal',   label: 'Days to Renewal',           type: 'pipeline', unit: 'number'   },
];

const TIME_PERIODS = [
  { key: 'dec_2025', label: 'Dec 2025' },
  { key: 'jan_2026', label: 'Jan 2026' },
  { key: 'feb_2026', label: 'Feb 2026' },
  { key: 'mar_2026', label: 'Mar 2026' },
  { key: 'apr_2026', label: 'Apr 2026' },
  { key: 'may_2026', label: 'May 2026' },
];

const MOCK_CUSTOMERS = [
  { id: '1',  name: 'Acme Corporation',      segment: 'Enterprise' },
  { id: '2',  name: 'TechVision Inc',         segment: 'Mid-Market' },
  { id: '3',  name: 'Global Dynamics',        segment: 'Enterprise' },
  { id: '4',  name: 'BrightPath Solutions',   segment: 'SMB'        },
  { id: '5',  name: 'Skyline Ventures',       segment: 'Mid-Market' },
  { id: '6',  name: 'NovaStar Systems',       segment: 'Enterprise' },
  { id: '7',  name: 'Vertex Analytics',       segment: 'SMB'        },
  { id: '8',  name: 'PeakFlow Labs',          segment: 'Mid-Market' },
  { id: '9',  name: 'Crestline Partners',     segment: 'Enterprise' },
  { id: '10', name: 'Bluewave Technologies',  segment: 'SMB'        },
  { id: '11', name: 'Summit Data Co',         segment: 'Mid-Market' },
  { id: '12', name: 'RedRock Holdings',       segment: 'Enterprise' },
  { id: '13', name: 'Coastal Systems',        segment: 'SMB'        },
  { id: '14', name: 'Ironclad Software',      segment: 'Mid-Market' },
  { id: '15', name: 'Zenith Platforms',       segment: 'Enterprise' },
];

// ── Seed data helpers ─────────────────────────────────────────────────────────

const METRIC_SEEDS: Record<string, { base: number; spread: number; step: number }> = {
  arr:               { base: 180000, spread: 260000, step:  4500  },
  nps:               { base: 28,     spread: 42,     step:  1.5   },
  health_score:      { base: 58,     spread: 28,     step:  2     },
  mrr:               { base: 15000,  spread: 22000,  step:  380   },
  product_adoption:  { base: 44,     spread: 38,     step:  1.8   },
  exec_engagement:   { base: 3.2,    spread: 5.6,    step:  0.15  },
  training_complete: { base: 52,     spread: 38,     step:  2.5   },
  support_tickets:   { base: 4,      spread: 14,     step: -0.4   },
  csat:              { base: 3.6,    spread: 1.2,    step:  0.05  },
  feature_requests:  { base: 2,      spread: 8,      step:  0.3   },
  pipeline_arr:      { base: 290000, spread: 420000, step:  7000  },
  renewal_prob:      { base: 62,     spread: 28,     step:  1.2   },
  expansion_arr:     { base: 40000,  spread: 120000, step:  3500  },
  churn_risk:        { base: 12,     spread: 52,     step: -0.8   },
  days_to_renewal:   { base: 45,     spread: 280,    step: -5     },
};

function pseudoRand(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

function seedValue(customerId: string, metricKey: string, periodIdx: number): string {
  const { base, spread, step } = METRIC_SEEDS[metricKey] || { base: 100, spread: 50, step: 3 };
  const idNum = parseInt(customerId, 10);
  const customerBase = base + pseudoRand(idNum * 7 + metricKey.length * 13) * spread;
  const value = customerBase + step * periodIdx;
  return String(Math.round(value * 10) / 10);
}

function buildInitialData(): Record<string, CustomerRow[]> {
  const result: Record<string, CustomerRow[]> = {};
  METRICS.forEach(m => {
    result[m.key] = MOCK_CUSTOMERS.map(c => {
      const row: CustomerRow = { id: c.id, customer: c.name, segment: c.segment };
      TIME_PERIODS.forEach((p, i) => {
        row[p.key] = seedValue(c.id, m.key, i);
      });
      return row;
    });
  });
  return result;
}

const INITIAL_DATA = buildInitialData();

// ── Format helpers ────────────────────────────────────────────────────────────

const ONE_DECIMAL_KEYS = new Set([
  'nps', 'health_score', 'exec_engagement', 'csat',
  'product_adoption', 'training_complete', 'renewal_prob', 'churn_risk',
]);

function formatValue(raw: string, metric: MetricDef): string {
  if (!raw) return '—';
  const n = parseFloat(raw);
  if (isNaN(n)) return raw;
  const clipped = Math.max(0, n);
  switch (metric.unit) {
    case 'currency': return '$' + Math.round(clipped).toLocaleString();
    case 'percent':  return clipped.toFixed(1) + '%';
    default:
      return ONE_DECIMAL_KEYS.has(metric.key)
        ? clipped.toFixed(1)
        : String(Math.round(clipped));
  }
}

// ── Checkbox ──────────────────────────────────────────────────────────────────

function CheckboxCell({
  checked, indeterminate, onChange,
}: {
  checked: boolean;
  indeterminate?: boolean;
  onChange: (e: React.MouseEvent) => void;
}) {
  return (
    <div className="flex items-center justify-center h-full" onClick={onChange}>
      <span
        className={`w-[18px] h-[18px] flex items-center justify-center rounded-[4px] border transition-colors cursor-pointer ${
          checked || indeterminate
            ? 'bg-blue-600 border-blue-600'
            : 'bg-white border-[#D0D5DD] hover:border-[#1D4ED8]'
        }`}
      >
        {indeterminate ? <span className="w-[10px] h-[2px] bg-white rounded" /> :
         checked ? <Check className="w-3 h-3 text-white" strokeWidth={3} /> : null}
      </span>
    </div>
  );
}

// ── Upload Preview Modal ──────────────────────────────────────────────────────

function UploadPreviewModal({
  preview, onConfirm, onCancel,
}: {
  preview: UploadPreview;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-2xl w-[540px] max-h-[80vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E4E7EC]">
          <div>
            <h3 className="text-[16px] font-semibold text-[#141C24]">Confirm Upload</h3>
            <p className="text-[13px] text-[#637083] mt-0.5 truncate max-w-[360px]">{preview.fileName}</p>
          </div>
          <button onClick={onCancel} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <div className="px-6 py-4 flex-1 overflow-auto">
          {preview.changedRows.length === 0 ? (
            <p className="text-sm text-[#637083] py-4 text-center">No changes detected in the uploaded file.</p>
          ) : (
            <>
              <p className="text-[13px] text-[#637083] mb-3">
                <span className="font-semibold text-[#141C24]">{preview.changedRows.length}</span> change(s) will be applied
              </p>
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-[#E4E7EC]">
                    <th className="text-left py-2 pr-4 font-semibold text-[#637083] text-[12px]">Customer</th>
                    <th className="text-left py-2 pr-4 font-semibold text-[#637083] text-[12px]">Period</th>
                    <th className="text-left py-2 pr-4 font-semibold text-[#637083] text-[12px]">Current</th>
                    <th className="text-left py-2 font-semibold text-[#637083] text-[12px]">New</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.changedRows.map((row, i) => (
                    <tr key={i} className="border-b border-[#F2F4F7]">
                      <td className="py-2 pr-4 text-[#141C24]">{row.customer}</td>
                      <td className="py-2 pr-4 text-[#141C24]">{row.period}</td>
                      <td className="py-2 pr-4 text-[#637083] line-through">{row.oldVal}</td>
                      <td className="py-2 font-medium text-blue-600">{row.newVal}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
        <div className="px-6 py-4 border-t border-[#E4E7EC] flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 text-[13px] font-medium text-[#637083] border border-[#E4E7EC] rounded-[8px] hover:bg-[#F2F4F7] transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} className="px-4 py-2 text-[13px] font-medium text-white bg-blue-600 rounded-[8px] hover:bg-blue-700 transition-colors">
            Apply Changes
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function MetricDataPage() {
  const [allData, setAllData] = useState<Record<string, CustomerRow[]>>(INITIAL_DATA);
  const [selectedMetric, setSelectedMetric] = useState<MetricDef>(METRICS[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());
  const [disabledByMetric, setDisabledByMetric] = useState<Record<string, Set<string>>>({});
  const [editingCell, setEditingCell] = useState<{ rowId: string; colKey: string } | null>(null);
  const [uploadPreview, setUploadPreview] = useState<UploadPreview | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tableData = allData[selectedMetric.key] || [];
  const disabledIds = disabledByMetric[selectedMetric.key] || new Set<string>();
  const hasSelection = selectedRowIds.size > 0;

  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return tableData;
    const q = searchTerm.toLowerCase();
    return tableData.filter(row => row.customer.toLowerCase().includes(q));
  }, [tableData, searchTerm]);

  const allSelected = filteredData.length > 0 && filteredData.every(r => selectedRowIds.has(r.id));
  const someSelected = filteredData.some(r => selectedRowIds.has(r.id)) && !allSelected;

  // All selected rows are already disabled? Then button becomes "Enable".
  const allSelectedDisabled = hasSelection && Array.from(selectedRowIds).every(id => disabledIds.has(id));

  const toggleAll = useCallback(() => {
    if (allSelected) setSelectedRowIds(new Set());
    else setSelectedRowIds(new Set(filteredData.map(r => r.id)));
  }, [allSelected, filteredData]);

  const toggleRow = useCallback((id: string) => {
    setSelectedRowIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const clearSelection = () => setSelectedRowIds(new Set());

  const handleToggleDisable = () => {
    setDisabledByMetric(prev => {
      const current = new Set(prev[selectedMetric.key] || []);
      if (allSelectedDisabled) {
        // Re-enable
        selectedRowIds.forEach(id => current.delete(id));
      } else {
        // Disable
        selectedRowIds.forEach(id => current.add(id));
      }
      return { ...prev, [selectedMetric.key]: current };
    });
    setSelectedRowIds(new Set());
  };

  const handleCellEdit = useCallback(
    (rowId: string, colKey: string, newValue: string) => {
      setAllData(prev => ({
        ...prev,
        [selectedMetric.key]: prev[selectedMetric.key].map(row =>
          row.id === rowId ? { ...row, [colKey]: newValue } : row
        ),
      }));
    },
    [selectedMetric.key]
  );

  const columns = useMemo(() => {
    const isManual = selectedMetric.type === 'manual';

    return [
      // Checkbox column
      {
        id: 'select',
        size: 48,
        enableSorting: false,
        header: () => (
          <CheckboxCell
            checked={allSelected}
            indeterminate={someSelected}
            onChange={(e) => { e.stopPropagation(); toggleAll(); }}
          />
        ),
        cell: (ctx: any) => (
          <CheckboxCell
            checked={selectedRowIds.has(ctx.row.original.id)}
            onChange={(e) => { e.stopPropagation(); toggleRow(ctx.row.original.id); }}
          />
        ),
      },
      // Customer column
      {
        id: 'customer',
        header: 'Customer',
        accessorKey: 'customer',
        size: 220,
        cell: (ctx: any) => {
          const isRowDisabled = disabledIds.has(ctx.row.original.id);
          return (
            <div className={`px-4 py-3 text-[14px] truncate ${
              isRowDisabled ? 'text-[#9CA3AF]' : 'text-[#141C24]'
            }`}>
              {ctx.getValue()}
            </div>
          );
        },
      },
      // Time period columns
      ...TIME_PERIODS.map(period => ({
        id: period.key,
        header: period.label,
        accessorKey: period.key,
        size: 150,
        cell: (ctx: any) => {
          const rowId = ctx.row.original.id as string;
          const isRowDisabled = disabledIds.has(rowId);
          const cellEditable = isManual && !isRowDisabled;
          const isEditing = cellEditable && editingCell?.rowId === rowId && editingCell?.colKey === period.key;
          const rawValue = ctx.getValue() as string;

          if (isEditing) {
            return (
              <input
                autoFocus
                defaultValue={rawValue}
                className="w-full h-full px-4 py-2 text-[14px] border-none outline-none bg-blue-50 text-[#141C24] focus:ring-2 focus:ring-inset focus:ring-blue-400"
                onBlur={(e) => {
                  handleCellEdit(rowId, period.key, e.target.value);
                  setEditingCell(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === 'Escape') {
                    (e.currentTarget as HTMLInputElement).blur();
                  }
                }}
              />
            );
          }

          return (
            <div
              className={`relative px-4 py-3 text-[14px] h-full group ${
                isRowDisabled
                  ? 'text-[#9CA3AF] cursor-not-allowed'
                  : cellEditable
                  ? 'text-[#141C24] cursor-text hover:bg-blue-50/60'
                  : 'text-[#141C24]'
              }`}
              onClick={() => cellEditable && setEditingCell({ rowId, colKey: period.key })}
            >
              {formatValue(rawValue, selectedMetric)}
              {cellEditable && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-60 transition-opacity">
                  <PencilLine className="w-3 h-3 text-[#637083]" />
                </span>
              )}
            </div>
          );
        },
      })),
    ];
  }, [selectedMetric, editingCell, handleCellEdit, allSelected, someSelected, selectedRowIds, disabledIds, toggleAll, toggleRow]);

  // ── Download ────────────────────────────────────────────────────────────────
  const handleDownload = (format: 'csv' | 'xlsx') => {
    const headers = ['Customer', 'Segment', ...TIME_PERIODS.map(p => p.label)];
    const rows = filteredData.map(row => [
      `"${row.customer}"`,
      row.segment,
      ...TIME_PERIODS.map(p => row[p.key] || ''),
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `metric-data-${selectedMetric.key}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // ── Upload ──────────────────────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const sampleRows = filteredData.slice(0, Math.min(filteredData.length, 3 + Math.floor(Math.random() * 4)));
    const changedRows = sampleRows.map(row => {
      const period = TIME_PERIODS[Math.floor(Math.random() * TIME_PERIODS.length)];
      const oldRaw = row[period.key];
      const delta = Math.round(parseFloat(oldRaw) * (0.05 + Math.random() * 0.1));
      const newRaw = String(Math.round(parseFloat(oldRaw) + delta));
      return {
        customer: row.customer,
        period: period.label,
        oldVal: formatValue(oldRaw, selectedMetric),
        newVal: formatValue(newRaw, selectedMetric),
      };
    });
    setUploadPreview({ fileName: file.name, changedRows });
    e.target.value = '';
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full bg-white">
      {/* ── Row 1: Title ───────────────────────────────────────────────────── */}
      <div className="shrink-0 px-8 pt-6 pb-4">
        <h1 className="text-[20px] font-bold text-[#141C24] leading-none">Metrics</h1>
      </div>

      {/* ── Row 2: Action bar ─────────────────────────────────────────────── */}
      <div className="shrink-0 px-8 pb-4 flex items-center gap-3 flex-wrap">
        {/* Counter chip */}
        <span className="inline-flex items-center justify-center min-w-[28px] h-[28px] px-2 rounded-full bg-[#F2F4F7] text-[12px] font-semibold text-[#637083] tabular-nums">
          {filteredData.length}
        </span>

        {/* Metric selector — disabled when there's a row selection */}
        {hasSelection ? (
          <div
            className="flex items-center gap-2 h-9 px-3 text-[13px] font-medium text-[#9CA3AF] border border-[#E4E7EC] rounded-[8px] bg-[#F9FAFB] min-w-[220px] cursor-not-allowed"
            aria-disabled="true"
          >
            <span className="flex-1 text-left">{selectedMetric.label}</span>
            <span className={`text-[11px] px-1.5 py-0.5 rounded-[4px] font-normal capitalize ${
              selectedMetric.type === 'manual' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'
            }`}>
              {selectedMetric.type}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-[#9CA3AF]" />
          </div>
        ) : (
          <Dropdown className="relative">
            <Dropdown.Trigger className="flex items-center gap-2 h-9 px-3 text-[13px] font-medium text-[#141C24] border border-[#E4E7EC] rounded-[8px] bg-white hover:bg-[#F9FAFB] transition-colors min-w-[220px]">
              <span className="flex-1 text-left">{selectedMetric.label}</span>
              <span className={`text-[11px] px-1.5 py-0.5 rounded-[4px] font-normal capitalize ${
                selectedMetric.type === 'manual' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
              }`}>
                {selectedMetric.type}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[#637083]" />
            </Dropdown.Trigger>
            <Dropdown.Content
              placement="bottom"
              className="absolute top-full left-0 z-50 mt-1 bg-white border border-[#E4E7EC] rounded-[8px] shadow-lg py-1 min-w-[260px] max-h-[360px] overflow-y-auto"
            >
              {METRICS.map(m => (
                <button
                  key={m.key}
                  onClick={() => { setSelectedMetric(m); setEditingCell(null); }}
                  className="close-dropdown flex items-center w-full px-3 py-2 text-[13px] text-[#141C24] hover:bg-[#F2F4F7] text-left gap-2"
                >
                  {selectedMetric.key === m.key
                    ? <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    : <span className="w-3.5 shrink-0" />}
                  <span className="flex-1">{m.label}</span>
                  <span className={`text-[11px] px-1.5 py-0.5 rounded-[4px] capitalize ${
                    m.type === 'manual' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {m.type}
                  </span>
                </button>
              ))}
            </Dropdown.Content>
          </Dropdown>
        )}

        {hasSelection ? (
          // Selection mode: Disable/Enable button (replaces Edit metric)
          <>
            <button
              onClick={handleToggleDisable}
              className={`flex items-center gap-1.5 h-9 px-3 text-[13px] font-medium rounded-[8px] transition-colors ${
                allSelectedDisabled
                  ? 'text-white bg-blue-600 hover:bg-blue-700'
                  : 'text-white bg-red-600 hover:bg-red-700'
              }`}
            >
              <Ban className="w-3.5 h-3.5" />
              {allSelectedDisabled ? 'Enable' : 'Disable'}
            </button>
            <span className="text-[13px] text-[#637083]">
              {selectedRowIds.size} selected
            </span>
            <button
              onClick={clearSelection}
              className="text-[13px] text-blue-600 hover:underline"
            >
              Clear
            </button>
          </>
        ) : (
          // Default mode: Edit metric button
          <button className="flex items-center gap-1.5 h-9 px-3 text-[13px] font-medium text-[#141C24] border border-[#E4E7EC] rounded-[8px] bg-white hover:bg-[#F9FAFB] transition-colors">
            <Pencil className="w-3.5 h-3.5" />
            Edit metric
          </button>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right-side actions only when nothing is selected */}
        {!hasSelection && (
          <>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-9 pr-3 h-9 text-[13px] border border-[#E4E7EC] rounded-[8px] outline-none focus:border-blue-400 w-[220px] placeholder:text-[#9CA3AF]"
              />
            </div>

            <Dropdown className="relative">
              <Dropdown.Trigger className="flex items-center gap-1.5 h-9 px-3 text-[13px] font-medium text-[#141C24] border border-[#E4E7EC] rounded-[8px] bg-white hover:bg-[#F9FAFB] transition-colors">
                Download
                <ChevronDown className="w-3.5 h-3.5 text-[#637083]" />
              </Dropdown.Trigger>
              <Dropdown.Content
                placement="bottom"
                className="absolute top-full right-0 z-50 mt-1 bg-white border border-[#E4E7EC] rounded-[8px] shadow-lg py-1 min-w-[180px]"
              >
                <button onClick={() => handleDownload('csv')} className="close-dropdown flex items-center gap-2 w-full px-3 py-2 text-[13px] text-[#141C24] hover:bg-[#F2F4F7] text-left">
                  <Download className="w-3.5 h-3.5 text-[#637083]" />
                  CSV file
                </button>
                <button onClick={() => handleDownload('xlsx')} className="close-dropdown flex items-center gap-2 w-full px-3 py-2 text-[13px] text-[#141C24] hover:bg-[#F2F4F7] text-left">
                  <Download className="w-3.5 h-3.5 text-[#637083]" />
                  Excel (.xlsx)
                </button>
              </Dropdown.Content>
            </Dropdown>

            <Dropdown className="relative">
              <Dropdown.Trigger className="flex items-center gap-1.5 h-9 px-3 text-[13px] font-medium text-[#141C24] border border-[#E4E7EC] rounded-[8px] bg-white hover:bg-[#F9FAFB] transition-colors">
                Upload
                <ChevronDown className="w-3.5 h-3.5 text-[#637083]" />
              </Dropdown.Trigger>
              <Dropdown.Content
                placement="bottom"
                className="absolute top-full right-0 z-50 mt-1 bg-white border border-[#E4E7EC] rounded-[8px] shadow-lg py-1 min-w-[200px]"
              >
                <button onClick={() => fileInputRef.current?.click()} className="close-dropdown flex items-center gap-2 w-full px-3 py-2 text-[13px] text-[#141C24] hover:bg-[#F2F4F7] text-left">
                  <Upload className="w-3.5 h-3.5 text-[#637083]" />
                  Upload file
                </button>
                <button onClick={() => alert('Template download coming soon')} className="close-dropdown flex items-center gap-2 w-full px-3 py-2 text-[13px] text-[#141C24] hover:bg-[#F2F4F7] text-left">
                  <Download className="w-3.5 h-3.5 text-[#637083]" />
                  Download template
                </button>
              </Dropdown.Content>
            </Dropdown>
            <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleFileChange} />
          </>
        )}
      </div>

      {/* ── Row 3: Data grid (fills remaining viewport, scrolls both ways) ── */}
      <div className="flex-1 min-h-0 px-8 pb-4">
        <div className="h-full border border-[#E4E7EC] rounded-[8px] overflow-hidden">
          <GridView
            columns={columns}
            data={filteredData}
            pinnedColumns={{ left: ['select', 'customer'], right: [] }}
            enableColumnPinning={true}
            divclassName="h-full w-full overflow-auto"
            tableclassName="w-full"
            theadclassName=""
            thclassName="px-4 py-3 text-left text-[12px] font-semibold text-[#141C24] bg-white whitespace-nowrap"
            tdclassName="p-0 text-[14px]"
            rowHeight={48}
            emptyPlaceHolderForTable="No customers match your search"
          />
        </div>
      </div>

      {/* Upload preview modal */}
      {uploadPreview && (
        <UploadPreviewModal
          preview={uploadPreview}
          onConfirm={() => setUploadPreview(null)}
          onCancel={() => setUploadPreview(null)}
        />
      )}
    </div>
  );
}
