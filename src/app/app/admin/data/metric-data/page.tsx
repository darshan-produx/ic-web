'use client';

import React, { useMemo, useState, useRef, useCallback } from 'react';
import { Search, Download, Upload, ChevronDown, Check, X, PencilLine, Plus, SlidersHorizontal, Info, Target as TargetIcon, UploadCloud, Layers } from 'lucide-react';
import GridView from '../../../../../common/components/GridView';
import { Dropdown } from '../../../../../common/Dropdown';
import { useGridView, type GridViewState } from '../../../../../common/hooks/useGridView';
import { ViewChip, ColumnManager } from '../../../../../common/components/GridViewToggle';
import AddMetricModal, { type NewMetricInput } from './AddMetricModal';
import RawDataDrawer from './RawDataDrawer';

// ── Types ─────────────────────────────────────────────────────────────────────

interface MetricDef {
  key: string;
  label: string;
  type: 'manual' | 'aggregated';
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
  // Aggregated (backed by raw data rows; cell values are cumulative sums)
  { key: 'monthly_avg_revenue', label: 'Monthly Avg. Revenue',    type: 'aggregated', unit: 'currency' },
  { key: 'pipeline_arr',      label: 'Pipeline ARR',              type: 'aggregated', unit: 'currency' },
  { key: 'renewal_prob',      label: 'Renewal Probability',       type: 'aggregated', unit: 'percent'  },
  { key: 'expansion_arr',     label: 'Expansion ARR',             type: 'aggregated', unit: 'currency' },
  { key: 'churn_risk',        label: 'Churn Risk Score',          type: 'aggregated', unit: 'number'   },
  { key: 'days_to_renewal',   label: 'Days to Renewal',           type: 'aggregated', unit: 'number'   },
];

// Full set of available time periods. The default System View hides the later months;
// users can show them from the column visibility dropdown.
const TIME_PERIODS = [
  { key: 'dec_2025', label: 'Dec 2025', defaultVisible: true  },
  { key: 'jan_2026', label: 'Jan 2026', defaultVisible: true  },
  { key: 'feb_2026', label: 'Feb 2026', defaultVisible: true  },
  { key: 'mar_2026', label: 'Mar 2026', defaultVisible: true  },
  { key: 'apr_2026', label: 'Apr 2026', defaultVisible: true  },
  { key: 'may_2026', label: 'May 2026', defaultVisible: false },
  { key: 'jun_2026', label: 'Jun 2026', defaultVisible: false },
  { key: 'jul_2026', label: 'Jul 2026', defaultVisible: false },
  { key: 'aug_2026', label: 'Aug 2026', defaultVisible: false },
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
  monthly_avg_revenue: { base: 310000, spread: 220000, step: 6200 },
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

function seedTarget(metricKey: string): string {
  // Target is roughly 110% of the first-period base value
  const seed = METRIC_SEEDS[metricKey];
  if (!seed) return '';
  const baseTarget = seed.base * 1.1 + seed.spread * 0.5;
  return String(Math.round(baseTarget * 10) / 10);
}

function buildInitialData(): Record<string, CustomerRow[]> {
  const result: Record<string, CustomerRow[]> = {};
  METRICS.forEach(m => {
    result[m.key] = MOCK_CUSTOMERS.map(c => {
      const row: CustomerRow = {
        id: c.id,
        customer: c.name,
        segment: c.segment,
        target: seedTarget(m.key),
      };
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

// Standard view — organization default. Only Select + Customer are locked (frozen).
// Status, Target, and the time periods are reorderable/draggable.
// Later months are hidden by default; users can show them via the column manager.
const SYSTEM_VIEW: GridViewState = {
  columnOrder: ['select', 'customer', 'status', 'target', ...TIME_PERIODS.map(p => p.key)],
  columnVisibility: {
    status: true,
    target: true,
    ...Object.fromEntries(TIME_PERIODS.map(p => [p.key, p.defaultVisible])),
  },
  sorting: [],
  columnSizing: {},
  filters: {},
};

// ── Main Page ─────────────────────────────────────────────────────────────────

// Mock current user for edit attribution (real impl would come from auth context).
const CURRENT_USER_NAME = 'Rajan Dubey';

interface CellEditMeta {
  modifiedBy: string;
  modifiedAt: number; // ms timestamp
}

function formatEditDate(ts: number): string {
  return new Date(ts).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

export default function MetricDataPage() {
  // `cleanData` is the last published snapshot; `allData` includes pending edits.
  // Diffing the two surfaces which cells are dirty and the count for the publish banner.
  const [cleanData, setCleanData] = useState<Record<string, CustomerRow[]>>(INITIAL_DATA);
  const [allData, setAllData] = useState<Record<string, CustomerRow[]>>(INITIAL_DATA);
  const [metricList, setMetricList] = useState<MetricDef[]>(METRICS);
  const [selectedMetric, setSelectedMetric] = useState<MetricDef>(METRICS[0]);
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());
  const [disabledByMetric, setDisabledByMetric] = useState<Record<string, Set<string>>>({});
  const [editingCell, setEditingCell] = useState<{ rowId: string; colKey: string } | null>(null);
  const [uploadPreview, setUploadPreview] = useState<UploadPreview | null>(null);
  const [showAddMetricModal, setShowAddMetricModal] = useState(false);
  // Per-cell edit attribution: who modified, and when. Keyed by `${metric}:${row}:${col}`.
  const [cellEdits, setCellEdits] = useState<Record<string, CellEditMeta>>({});
  // Toggle to hide rows that have no dirty cells (only meaningful when there are drafts).
  const [showOnlyUpdated, setShowOnlyUpdated] = useState(false);
  // Raw-data drawer (aggregated metrics): either a full table ('all') or a single cell.
  const [rawDrawer, setRawDrawer] = useState<{ mode: 'all' | 'cell'; customer?: string; period?: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Standard vs Personal view (ICA-2232). User is treated as a Configurator.
  const {
    currentView,
    isPersonal,
    hasPersonalView,
    isConfigurator,
    showFirstTimeWarning,
    updatePersonal,
    setView,
    resetPersonal,
    saveAsStandard,
    dismissWarning,
  } = useGridView('admin.metrics', SYSTEM_VIEW, { isConfigurator: true });

  // Search term is part of the saved view ("filters").
  const searchTerm = (currentView.filters?.search as string) ?? '';
  const setSearchTerm = (next: string) =>
    updatePersonal({ filters: { ...currentView.filters, search: next } });

  const tableData = allData[selectedMetric.key] || [];
  const disabledIds = disabledByMetric[selectedMetric.key] || new Set<string>();
  const hasSelection = selectedRowIds.size > 0;

  // Precompute set of row ids that have at least one dirty cell on the active metric.
  const dirtyRowIds = useMemo(() => {
    const ids = new Set<string>();
    const liveRows = allData[selectedMetric.key] || [];
    const cleanRows = cleanData[selectedMetric.key] || [];
    liveRows.forEach(liveRow => {
      const cleanRow = cleanRows.find(r => r.id === liveRow.id);
      if (!cleanRow) return;
      const hasDirty = Object.keys(liveRow).some(field => {
        if (field === 'id' || field === 'customer' || field === 'segment') return false;
        return liveRow[field] !== cleanRow[field];
      });
      if (hasDirty) ids.add(liveRow.id);
    });
    return ids;
  }, [allData, cleanData, selectedMetric.key]);

  const filteredData = useMemo(() => {
    let rows = tableData;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      rows = rows.filter(row => row.customer.toLowerCase().includes(q));
    }
    if (showOnlyUpdated) {
      rows = rows.filter(row => dirtyRowIds.has(row.id));
    }
    return rows;
  }, [tableData, searchTerm, showOnlyUpdated, dirtyRowIds]);

  const allSelected = filteredData.length > 0 && filteredData.every(r => selectedRowIds.has(r.id));
  const someSelected = filteredData.some(r => selectedRowIds.has(r.id)) && !allSelected;

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

  const handleEnable = () => {
    setDisabledByMetric(prev => {
      const current = new Set(prev[selectedMetric.key] || []);
      selectedRowIds.forEach(id => current.delete(id));
      return { ...prev, [selectedMetric.key]: current };
    });
    setSelectedRowIds(new Set());
  };

  const handleDisable = () => {
    setDisabledByMetric(prev => {
      const current = new Set(prev[selectedMetric.key] || []);
      selectedRowIds.forEach(id => current.add(id));
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
      // Stamp the edit so the tooltip can show who/when.
      setCellEdits(prev => ({
        ...prev,
        [`${selectedMetric.key}:${rowId}:${colKey}`]: {
          modifiedBy: CURRENT_USER_NAME,
          modifiedAt: Date.now(),
        },
      }));
    },
    [selectedMetric.key]
  );

  // Lookup helpers for the dirty-cell tooltip.
  const getCellEditMeta = useCallback(
    (rowId: string, colKey: string): CellEditMeta | undefined =>
      cellEdits[`${selectedMetric.key}:${rowId}:${colKey}`],
    [cellEdits, selectedMetric.key]
  );

  const getCleanValue = useCallback(
    (rowId: string, colKey: string): string | undefined => {
      const cleanRows = cleanData[selectedMetric.key] || [];
      return cleanRows.find(r => r.id === rowId)?.[colKey];
    },
    [cleanData, selectedMetric.key]
  );

  // ── Dirty cells (unpublished changes) ──────────────────────────────────────
  // A cell is dirty when its value in `allData` differs from `cleanData`.
  const dirtyCellKeys = useMemo(() => {
    const keys = new Set<string>();
    let total = 0;
    Object.keys(allData).forEach(metricKey => {
      const liveRows = allData[metricKey];
      const cleanRows = cleanData[metricKey] || [];
      liveRows.forEach(liveRow => {
        const cleanRow = cleanRows.find(r => r.id === liveRow.id);
        if (!cleanRow) return;
        Object.keys(liveRow).forEach(field => {
          if (field === 'id' || field === 'customer' || field === 'segment') return;
          if (liveRow[field] !== cleanRow[field]) {
            total += 1;
            if (metricKey === selectedMetric.key) {
              keys.add(`${liveRow.id}:${field}`);
            }
          }
        });
      });
    });
    return { keys, total };
  }, [allData, cleanData, selectedMetric.key]);

  const isCellDirty = useCallback(
    (rowId: string, colKey: string) => dirtyCellKeys.keys.has(`${rowId}:${colKey}`),
    [dirtyCellKeys]
  );

  const handlePublish = () => {
    setCleanData(allData);
    setCellEdits({});
    setShowOnlyUpdated(false);
  };

  const handleDiscardChanges = () => {
    setAllData(cleanData);
    setCellEdits({});
    setShowOnlyUpdated(false);
  };

  // ── Add metric ─────────────────────────────────────────────────────────────
  const handleAddMetric = (input: NewMetricInput) => {
    const key = input.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
    const newMetric: MetricDef = {
      key,
      label: input.name,
      type: 'manual',
      unit: input.type === 'multi-select' ? 'number' : (input.type as 'currency' | 'number' | 'percent'),
    };
    if (metricList.some(m => m.key === key)) {
      // eslint-disable-next-line no-alert
      alert(`A metric with the key "${key}" already exists. Choose a different name.`);
      return;
    }

    // Resolve which customers this metric applies to.
    let targetIds: Set<string>;
    if (input.applyTo === 'all') {
      targetIds = new Set(MOCK_CUSTOMERS.map(c => c.id));
    } else if (input.applyTo === 'segment') {
      targetIds = new Set(
        MOCK_CUSTOMERS.filter(c => c.segment === input.segmentName).map(c => c.id)
      );
    } else {
      targetIds = new Set(input.customerIds ?? []);
    }

    const rows: CustomerRow[] = MOCK_CUSTOMERS.map(c => {
      const row: CustomerRow = {
        id: c.id,
        customer: c.name,
        segment: c.segment,
        target: '',
      };
      const isApplied = targetIds.has(c.id);
      TIME_PERIODS.forEach(p => {
        row[p.key] = isApplied ? (input.type === 'multi-select' ? (input.options?.[0] ?? '') : '0') : '';
      });
      return row;
    });

    setMetricList(prev => [...prev, newMetric]);
    setAllData(prev => ({ ...prev, [key]: rows }));
    setCleanData(prev => ({ ...prev, [key]: rows })); // newly added metric starts clean
    setSelectedMetric(newMetric);
    setShowAddMetricModal(false);
  };

  // Segments available for the "Segment based" applyTo option in the new-metric drawer.
  const AVAILABLE_SEGMENTS = useMemo(
    () => Array.from(new Set(MOCK_CUSTOMERS.map(c => c.segment))).concat(['High-Ticket Customers']),
    []
  );

  const columns = useMemo(() => {
    const isManual = selectedMetric.type === 'manual';
    const isAggregated = selectedMetric.type === 'aggregated';

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
      // Status column
      {
        id: 'status',
        header: 'Status',
        size: 110,
        enableSorting: false,
        cell: (ctx: any) => {
          const isRowDisabled = disabledIds.has(ctx.row.original.id);
          return (
            <div className="px-4 py-3 flex items-center">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[12px] font-medium ${
                isRowDisabled
                  ? 'bg-red-50 text-red-700'
                  : 'bg-green-50 text-green-700'
              }`}>
                {isRowDisabled ? 'Disabled' : 'Enabled'}
              </span>
            </div>
          );
        },
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
      // Target column — per-customer, per-metric threshold
      {
        id: 'target',
        header: 'Target',
        accessorKey: 'target',
        size: 130,
        cell: (ctx: any) => {
          const rowId = ctx.row.original.id as string;
          const isRowDisabled = disabledIds.has(rowId);
          const cellEditable = isManual && !isRowDisabled;
          const isEditing = cellEditable && editingCell?.rowId === rowId && editingCell?.colKey === 'target';
          const rawValue = ctx.getValue() as string;
          const dirty = isCellDirty(rowId, 'target');

          if (isEditing) {
            return (
              <input
                autoFocus
                defaultValue={rawValue}
                className="w-full h-full px-4 py-2 text-[14px] border-none outline-none bg-blue-50 text-[#141C24] focus:ring-2 focus:ring-inset focus:ring-blue-400"
                onBlur={(e) => { handleCellEdit(rowId, 'target', e.target.value); setEditingCell(null); }}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === 'Escape') (e.currentTarget as HTMLInputElement).blur(); }}
              />
            );
          }
          const meta = dirty ? getCellEditMeta(rowId, 'target') : undefined;
          const oldVal = dirty ? getCleanValue(rowId, 'target') : undefined;
          return (
            <div
              className={`relative px-4 py-3 text-[14px] h-full group flex items-center gap-1.5 ${
                isRowDisabled
                  ? 'text-[#9CA3AF] cursor-not-allowed'
                  : cellEditable
                  ? 'text-[#141C24] cursor-text hover:bg-blue-50/60'
                  : 'text-[#141C24]'
              }`}
              onClick={() => cellEditable && setEditingCell({ rowId, colKey: 'target' })}
            >
              {dirty
                ? <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                : <TargetIcon className="w-3 h-3 text-[#9CA3AF] shrink-0" />}
              <span>{formatValue(rawValue, selectedMetric)}</span>
              {cellEditable && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-60 transition-opacity">
                  <PencilLine className="w-3 h-3 text-[#637083]" />
                </span>
              )}
              {dirty && meta && oldVal != null && (
                <div className="hidden group-hover:block absolute top-full left-3 mt-1 z-[60] bg-[#1F2937] text-white text-[11px] leading-snug px-3 py-2 rounded-md shadow-lg whitespace-nowrap pointer-events-none">
                  <div>Old Value: {formatValue(oldVal, selectedMetric)}</div>
                  <div className="opacity-90">Modified by, {meta.modifiedBy} on {formatEditDate(meta.modifiedAt)}</div>
                </div>
              )}
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
          const customer = ctx.row.original.customer as string;
          const isRowDisabled = disabledIds.has(rowId);
          const cellEditable = isManual && !isRowDisabled;
          // Aggregated cells aren't edited inline — clicking opens the raw-data drawer.
          const cellOpensRaw = isAggregated && !isRowDisabled;
          const isEditing = cellEditable && editingCell?.rowId === rowId && editingCell?.colKey === period.key;
          const rawValue = ctx.getValue() as string;
          const dirty = isCellDirty(rowId, period.key);

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

          const meta = dirty ? getCellEditMeta(rowId, period.key) : undefined;
          const oldVal = dirty ? getCleanValue(rowId, period.key) : undefined;
          return (
            <div
              className={`relative px-4 py-3 text-[14px] h-full group flex items-center gap-1.5 ${
                isRowDisabled
                  ? 'text-[#9CA3AF] cursor-not-allowed'
                  : cellEditable || cellOpensRaw
                  ? 'text-[#141C24] cursor-pointer hover:bg-blue-50/60'
                  : 'text-[#141C24]'
              }`}
              onClick={() => {
                if (cellEditable) setEditingCell({ rowId, colKey: period.key });
                else if (cellOpensRaw) setRawDrawer({ mode: 'cell', customer, period: period.label });
              }}
            >
              {dirty && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />}
              <span>{formatValue(rawValue, selectedMetric)}</span>
              {(cellEditable || cellOpensRaw) && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-60 transition-opacity">
                  <PencilLine className="w-3 h-3 text-[#637083]" />
                </span>
              )}
              {dirty && meta && oldVal != null && (
                <div className="hidden group-hover:block absolute top-full left-3 mt-1 z-[60] bg-[#1F2937] text-white text-[11px] leading-snug px-3 py-2 rounded-md shadow-lg whitespace-nowrap pointer-events-none">
                  <div>Old Value: {formatValue(oldVal, selectedMetric)}</div>
                  <div className="opacity-90">Modified by, {meta.modifiedBy} on {formatEditDate(meta.modifiedAt)}</div>
                </div>
              )}
            </div>
          );
        },
      })),
    ];
  }, [selectedMetric, editingCell, handleCellEdit, allSelected, someSelected, selectedRowIds, disabledIds, toggleAll, toggleRow, isCellDirty, getCellEditMeta, getCleanValue]);

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

  // Columns the column manager will offer for show/hide + reorder.
  const columnDescriptors = useMemo(
    () => [
      { id: 'select',   label: 'Selection', pinned: true },
      { id: 'customer', label: 'Customer',  pinned: true },
      { id: 'status',   label: 'Status' },
      { id: 'target',   label: 'Target' },
      ...TIME_PERIODS.map(p => ({ id: p.key, label: p.label })),
    ],
    []
  );

  // Filter the columns we pass to GridView based on visibility (pinned columns
  // are always visible regardless of toggle state).
  const visibleColumns = useMemo(() => {
    const visibility = currentView.columnVisibility ?? {};
    return columns.filter(c => {
      const id = c.id as string;
      if (id === 'select' || id === 'customer') return true;
      return visibility[id] !== false;
    });
  }, [columns, currentView.columnVisibility]);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full bg-white">
      {/* ── Draft banner (subtle info style) ──────────────────────────────── */}
      {dirtyCellKeys.total > 0 && (
        <div className="shrink-0 px-8 pt-4">
          <div className="flex items-center gap-3 px-4 py-2.5 bg-blue-50 border border-blue-100 rounded-[8px]">
            <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
            <div className="flex-1 text-[13px] text-[#141C24]">
              Your changes are saved as a draft. Only you can see them.
            </div>
            <button
              onClick={handleDiscardChanges}
              className="px-3 h-8 text-[13px] font-medium text-[#637083] border border-[#E4E7EC] bg-white rounded-[8px] hover:bg-[#F2F4F7] transition-colors"
            >
              Discard
            </button>
            <button
              onClick={handlePublish}
              className="px-3 h-8 text-[13px] font-medium text-white bg-blue-600 rounded-[8px] hover:bg-blue-700 transition-colors"
            >
              Publish to all
            </button>
          </div>
        </div>
      )}

      {/* ── Row 1: Title + column settings + view toggle ─────────────────── */}
      <div className="shrink-0 px-8 pt-6 pb-4 flex items-center gap-3">
        <h1 className="text-[20px] font-bold text-[#141C24] leading-none">Metrics</h1>
        <div className="ml-auto flex items-center gap-2">
          <ColumnManager
            iconOnly
            columns={columnDescriptors}
            columnOrder={currentView.columnOrder}
            columnVisibility={currentView.columnVisibility}
            onColumnOrderChange={(next) => updatePersonal({ columnOrder: next })}
            onColumnVisibilityChange={(next) => updatePersonal({ columnVisibility: next })}
            isPersonal={isPersonal}
            hasPersonalView={hasPersonalView}
            isConfigurator={isConfigurator}
            onResetPersonal={resetPersonal}
            onSaveAsStandard={saveAsStandard}
          />
          <ViewChip
            isPersonal={isPersonal}
            hasPersonalView={hasPersonalView}
            isConfigurator={isConfigurator}
            onChangeView={setView}
            onResetPersonal={resetPersonal}
            onSaveAsStandard={saveAsStandard}
          />
        </div>
      </div>

      {/* First-time auto-transition warning */}
      {showFirstTimeWarning && (
        <div className="shrink-0 px-8 pb-3">
          <div className="flex items-start gap-3 px-3 py-2.5 bg-blue-50 border border-blue-200 rounded-[8px]">
            <Info className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
            <div className="flex-1 text-[13px] text-blue-900 leading-snug">
              We saved your change to a <strong>Personal view</strong>. You can switch back to the
              Standard view anytime from the chip next to the title.
            </div>
            <button
              onClick={dismissWarning}
              className="text-blue-700 hover:text-blue-900 shrink-0"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

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
              selectedMetric.type === 'manual' ? 'bg-green-50 text-green-600' : 'bg-indigo-50 text-indigo-400'
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
                selectedMetric.type === 'manual' ? 'bg-green-100 text-green-700' : 'bg-indigo-100 text-indigo-700'
              }`}>
                {selectedMetric.type}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[#637083]" />
            </Dropdown.Trigger>
            <Dropdown.Content
              placement="bottom"
              className="absolute top-full left-0 z-50 mt-1 bg-white border border-[#E4E7EC] rounded-[8px] shadow-lg py-1 min-w-[260px] max-h-[360px] overflow-y-auto"
            >
              {metricList.map(m => (
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
                    m.type === 'manual' ? 'bg-green-100 text-green-700' : 'bg-indigo-100 text-indigo-700'
                  }`}>
                    {m.type}
                  </span>
                </button>
              ))}
            </Dropdown.Content>
          </Dropdown>
        )}

        {hasSelection ? (
          // Selection mode: Enable + Disable buttons (no icons)
          <>
            <button
              onClick={handleEnable}
              className="h-9 px-3 text-[13px] font-medium text-[#141C24] border border-[#E4E7EC] rounded-[8px] bg-white hover:bg-[#F9FAFB] transition-colors"
            >
              Enable
            </button>
            <button
              onClick={handleDisable}
              className="h-9 px-3 text-[13px] font-medium text-red-600 border border-red-200 rounded-[8px] bg-white hover:bg-red-50 transition-colors"
            >
              Disable
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
          // Default mode: Edit metric + Add metric
          <>
            <button className="h-9 px-3 text-[13px] font-medium text-[#141C24] border border-[#E4E7EC] rounded-[8px] bg-white hover:bg-[#F9FAFB] transition-colors">
              Edit metric
            </button>
            <button
              onClick={() => setShowAddMetricModal(true)}
              className="flex items-center gap-1.5 h-9 px-3 text-[13px] font-medium text-[#141C24] border border-[#E4E7EC] rounded-[8px] bg-white hover:bg-[#F9FAFB] transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add metric
            </button>
          </>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right-side actions only when nothing is selected */}
        {!hasSelection && (
          <>
            {/* "Show only updated row" toggle — inline-edit drafts only exist for
                manual metrics (aggregated metrics edit via the raw-data drawer). */}
            {selectedMetric.type !== 'aggregated' && (() => {
              const hasDrafts = dirtyCellKeys.total > 0;
              return (
                <label
                  className={`flex items-center gap-2 select-none ${hasDrafts ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}
                  title={hasDrafts ? '' : 'No unpublished changes yet'}
                >
                  <button
                    type="button"
                    role="switch"
                    aria-checked={showOnlyUpdated}
                    disabled={!hasDrafts}
                    onClick={() => hasDrafts && setShowOnlyUpdated(v => !v)}
                    className={`relative w-[34px] h-[20px] rounded-full transition-colors ${
                      showOnlyUpdated && hasDrafts ? 'bg-blue-600' : 'bg-[#D0D5DD]'
                    } ${!hasDrafts ? 'cursor-not-allowed' : ''}`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                        showOnlyUpdated && hasDrafts ? 'translate-x-[14px]' : ''
                      }`}
                    />
                  </button>
                  <span className="text-[13px] text-[#141C24]">Show only updated row</span>
                </label>
              );
            })()}

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

            {/* Download / Upload live in the raw-data drawer for aggregated metrics */}
            {selectedMetric.type !== 'aggregated' && (
              <>
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

            <button className="flex items-center gap-1.5 h-9 px-3 text-[13px] font-medium text-[#141C24] border border-[#E4E7EC] rounded-[8px] bg-white hover:bg-[#F9FAFB] transition-colors">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filter
            </button>

            {/* Aggregated metrics expose their underlying raw data */}
            {selectedMetric.type === 'aggregated' && (
              <button
                onClick={() => setRawDrawer({ mode: 'all' })}
                className="flex items-center gap-1.5 h-9 px-3 text-[13px] font-medium text-[#141C24] border border-[#E4E7EC] rounded-[8px] bg-white hover:bg-[#F9FAFB] transition-colors"
              >
                <Layers className="w-3.5 h-3.5" />
                Raw data
              </button>
            )}
          </>
        )}
      </div>

      {/* ── Row 3: Data grid (fills remaining viewport, scrolls both ways) ── */}
      <div className="flex-1 min-h-0 px-8 pb-4">
        <div className="h-full border border-[#E4E7EC] rounded-[8px] overflow-hidden">
          <GridView
            columns={visibleColumns}
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
            sorting={currentView.sorting}
            onSortingChange={(next) => updatePersonal({ sorting: next })}
            columnSizing={currentView.columnSizing}
            onColumnSizingChange={(next) => updatePersonal({ columnSizing: next })}
            columnOrder={currentView.columnOrder}
            onColumnOrderChange={(next) => updatePersonal({ columnOrder: next })}
          />
        </div>
      </div>

      {/* Upload preview modal */}
      {uploadPreview && (
        <UploadPreviewModal
          preview={uploadPreview}
          onConfirm={() => {
            // Apply all preview changes to `allData` so they show up as dirty cells,
            // and stamp each affected cell with edit metadata for the hover tooltip.
            const now = Date.now();
            const stamps: Record<string, CellEditMeta> = {};
            setAllData(prev => {
              const next = { ...prev };
              const rows = (next[selectedMetric.key] || []).map(r => ({ ...r }));
              uploadPreview.changedRows.forEach(change => {
                const row = rows.find(r => r.customer === change.customer);
                const period = TIME_PERIODS.find(p => p.label === change.period);
                if (!row || !period) return;
                const numeric = change.newVal.replace(/[$,%\s]/g, '');
                row[period.key] = numeric;
                stamps[`${selectedMetric.key}:${row.id}:${period.key}`] = {
                  modifiedBy: CURRENT_USER_NAME,
                  modifiedAt: now,
                };
              });
              next[selectedMetric.key] = rows;
              return next;
            });
            setCellEdits(prev => ({ ...prev, ...stamps }));
            setUploadPreview(null);
          }}
          onCancel={() => setUploadPreview(null)}
        />
      )}

      {/* Add metric drawer */}
      {showAddMetricModal && (
        <AddMetricModal
          customers={MOCK_CUSTOMERS.map(c => ({ id: c.id, name: c.name }))}
          segments={AVAILABLE_SEGMENTS}
          onCancel={() => setShowAddMetricModal(false)}
          onSubmit={handleAddMetric}
        />
      )}

      {/* Raw data drawer (aggregated metrics) */}
      {rawDrawer && (
        <RawDataDrawer
          metricLabel={selectedMetric.label}
          mode={rawDrawer.mode}
          customerName={rawDrawer.customer}
          periodLabel={rawDrawer.period}
          onClose={() => setRawDrawer(null)}
        />
      )}
    </div>
  );
}
