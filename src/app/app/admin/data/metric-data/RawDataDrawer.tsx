'use client';

import React, { useMemo, useState, useCallback } from 'react';
import { X, ChevronDown, Plus, Download, Upload, Check, Search, Trash2 } from 'lucide-react';
import { Dropdown } from '../../../../../common/Dropdown';
import {
  getRawData, formatRawValue, RAW_TAG_POOL, type RawDataRow,
} from './mockRawData';

interface RawDataDrawerProps {
  metricLabel: string;
  /** 'cell' = editing one aggregated cell (pre-filtered to a customer + period). 'all' = full raw table. */
  mode: 'cell' | 'all';
  customerName?: string;  // cell mode
  periodLabel?: string;   // cell mode
  onClose: () => void;
}

// A draft edit map: rowId → fields changed. Used for the blue-dot dirty marker.
type DirtyMap = Record<string, Set<string>>;

const TOTAL_CUSTOMERS = 216;
const DATE_RANGE_LABEL = 'Nov 1, 2025 to May 31, 2026';

export default function RawDataDrawer({
  metricLabel, mode, customerName, periodLabel, onClose,
}: RawDataDrawerProps) {
  const seedRows = useMemo(
    () => getRawData(metricLabel, mode === 'cell' ? customerName : undefined),
    [metricLabel, mode, customerName]
  );

  const [rows, setRows] = useState<RawDataRow[]>(seedRows);
  const [cleanRows] = useState<RawDataRow[]>(seedRows);
  const [dirty, setDirty] = useState<DirtyMap>({});
  const [showOnlyUpdated, setShowOnlyUpdated] = useState(false);
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [newRow, setNewRow] = useState<RawDataRow | null>(null);
  const [editing, setEditing] = useState<{ rowId: string; field: 'value' | 'date' } | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState(false);

  const hasDrafts = Object.values(dirty).some(s => s.size > 0);

  const markDirty = useCallback((rowId: string, field: string) => {
    setDirty(prev => {
      const next: DirtyMap = { ...prev };
      const set = new Set(next[rowId] ?? []);
      set.add(field);
      next[rowId] = set;
      return next;
    });
  }, []);

  const isDirty = (rowId: string, field: string) => dirty[rowId]?.has(field) ?? false;

  const updateRow = (rowId: string, patch: Partial<RawDataRow>, dirtyField: string) => {
    setRows(prev => prev.map(r => (r.id === rowId ? { ...r, ...patch } : r)));
    markDirty(rowId, dirtyField);
  };

  const removeTag = (rowId: string, tag: string) => {
    const row = rows.find(r => r.id === rowId);
    if (!row) return;
    updateRow(rowId, { tags: row.tags.filter(t => t !== tag) }, 'tags');
  };

  const addTag = (rowId: string, tag: string) => {
    const row = rows.find(r => r.id === rowId);
    if (!row || row.tags.includes(tag)) return;
    updateRow(rowId, { tags: [...row.tags, tag] }, 'tags');
  };

  // ── New-row workflow ────────────────────────────────────────────────────────
  const startNewRow = () => {
    setNewRow({
      id: `new-${Date.now()}`,
      customer: mode === 'cell' ? (customerName ?? '') : '',
      date: '',
      tags: [],
      value: 0,
    });
  };
  const cancelNewRow = () => setNewRow(null);
  const saveNewRow = () => {
    if (!newRow) return;
    setRows(prev => [{ ...newRow }, ...prev]);
    markDirty(newRow.id, 'all');
    setNewRow(null);
  };

  const handlePublish = () => { setDirty({}); setShowOnlyUpdated(false); };
  const handleDiscard = () => { setRows(cleanRows); setDirty({}); setShowOnlyUpdated(false); };

  // ── Visible rows (tag filter + show-only-updated) ─────────────────────────────
  const visibleRows = useMemo(() => {
    let r = rows;
    if (tagFilter) r = r.filter(row => row.tags.includes(tagFilter));
    if (showOnlyUpdated) r = r.filter(row => (dirty[row.id]?.size ?? 0) > 0);
    return r;
  }, [rows, tagFilter, showOnlyUpdated, dirty]);

  // ── Selection ─────────────────────────────────────────────────────────────────
  const allVisibleSelected = visibleRows.length > 0 && visibleRows.every(r => selectedIds.has(r.id));
  const someVisibleSelected = visibleRows.some(r => selectedIds.has(r.id)) && !allVisibleSelected;

  const toggleRowSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const toggleAllSelect = () => {
    setSelectedIds(prev => {
      if (visibleRows.every(r => prev.has(r.id))) {
        const next = new Set(prev);
        visibleRows.forEach(r => next.delete(r.id));
        return next;
      }
      const next = new Set(prev);
      visibleRows.forEach(r => next.add(r.id));
      return next;
    });
  };
  const clearSelection = () => setSelectedIds(new Set());
  const confirmDeleteSelected = () => {
    setRows(prev => prev.filter(r => !selectedIds.has(r.id)));
    setDirty(prev => {
      const next: DirtyMap = {};
      Object.entries(prev).forEach(([id, set]) => { if (!selectedIds.has(id)) next[id] = set; });
      return next;
    });
    setSelectedIds(new Set());
    setConfirmDelete(false);
  };

  const hasSelection = selectedIds.size > 0;

  const title = mode === 'cell'
    ? `Editing ${metricLabel} of ${customerName} for ${periodLabel}`
    : `Raw data of ${metricLabel}`;

  const filterCount = mode === 'cell' ? 7 : 921;

  return (
    <>
      <div className="fixed inset-0 z-[998] bg-black/30" onClick={onClose} />
      <div className="fixed top-0 right-0 bottom-0 z-[999] w-[1180px] max-w-[94vw] bg-white shadow-2xl flex flex-col animate-[slideIn_0.18s_ease-out]">
        {/* Header */}
        <div className="shrink-0 px-7 py-5 flex items-center justify-between border-b border-transparent">
          <h2 className="text-[20px] font-semibold text-[#141C24]">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[#F2F4F7] transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-[#637083]" />
          </button>
        </div>

        {/* Filter / action bar OR new-row save bar */}
        {newRow ? (
          <div className="shrink-0 px-7 pb-4 flex items-center justify-end gap-2">
            <button
              onClick={cancelNewRow}
              className="px-4 h-9 text-[13px] font-medium text-[#141C24] border border-[#E4E7EC] rounded-[8px] bg-white hover:bg-[#F9FAFB]"
            >
              Cancel
            </button>
            <button
              onClick={saveNewRow}
              disabled={!newRow.customer.trim() || !newRow.date.trim()}
              className="px-4 h-9 text-[13px] font-medium text-white bg-blue-600 rounded-[8px] hover:bg-blue-700 disabled:bg-[#C7D2FE] disabled:cursor-not-allowed"
            >
              Save
            </button>
          </div>
        ) : hasSelection ? (
          /* Bulk-selection action bar */
          <div className="shrink-0 px-7 pb-4 flex items-center gap-3">
            <span className="inline-flex items-center h-[32px] px-3 rounded-[6px] bg-[#EEF4FF] text-[13px] font-semibold text-[#1D4ED8]">
              {selectedIds.size} selected
            </span>
            <button
              onClick={clearSelection}
              className="flex items-center gap-1.5 h-9 px-3 text-[13px] font-medium text-[#637083] border border-[#E4E7EC] rounded-[8px] bg-white hover:bg-[#F2F4F7]"
            >
              <X className="w-3.5 h-3.5" />
              Clear selection
            </button>
            <div className="flex-1" />
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-1.5 h-9 px-3 text-[13px] font-medium text-red-700 border border-red-200 rounded-[8px] bg-white hover:bg-red-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          </div>
        ) : (
          <div className="shrink-0 px-7 pb-4 flex items-center gap-3 flex-wrap">
            {/* Count + clear filter */}
            <span className="inline-flex items-center justify-center h-[28px] px-2.5 rounded-[6px] bg-[#F2F4F7] text-[12px] font-semibold text-[#637083] tabular-nums">
              {filterCount}
            </span>
            {(mode === 'cell' || tagFilter) && (
              <button
                onClick={() => setTagFilter(null)}
                className="text-[13px] text-blue-600 hover:underline"
              >
                Clear filter
              </button>
            )}

            {/* Customer filter */}
            <PillDropdown
              label={mode === 'cell' ? (customerName ?? 'Customer') : `All customers`}
              suffix={mode === 'cell' ? undefined : `(${TOTAL_CUSTOMERS})`}
            >
              <div className="px-3 py-2 text-[13px] text-[#637083]">Customer filtering (mock)</div>
            </PillDropdown>

            {/* Date range */}
            <PillDropdown label={DATE_RANGE_LABEL}>
              <div className="px-3 py-2 text-[13px] text-[#637083]">Date range picker (mock)</div>
            </PillDropdown>

            {/* Tags filter */}
            <PillDropdown label={tagFilter ?? 'All tags'} suffix={tagFilter ? undefined : `(16)`}>
              <button
                onClick={() => setTagFilter(null)}
                className="close-dropdown flex items-center gap-2 w-full px-3 py-2 text-[13px] text-[#141C24] hover:bg-[#F2F4F7] text-left"
              >
                {!tagFilter ? <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" /> : <span className="w-3.5 shrink-0" />}
                All tags
              </button>
              {RAW_TAG_POOL.map(t => (
                <button
                  key={t}
                  onClick={() => setTagFilter(t)}
                  className="close-dropdown flex items-center gap-2 w-full px-3 py-2 text-[13px] text-[#141C24] hover:bg-[#F2F4F7] text-left"
                >
                  {tagFilter === t ? <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" /> : <span className="w-3.5 shrink-0" />}
                  {t}
                </button>
              ))}
            </PillDropdown>

            <div className="flex-1" />

            <button
              onClick={startNewRow}
              className="flex items-center gap-1.5 h-9 px-3 text-[13px] font-medium text-[#141C24] border border-[#E4E7EC] rounded-[8px] bg-white hover:bg-[#F9FAFB]"
            >
              <Plus className="w-3.5 h-3.5" />
              New
            </button>
            <Dropdown className="relative">
              <Dropdown.Trigger className="flex items-center gap-1.5 h-9 px-3 text-[13px] font-medium text-[#141C24] border border-[#E4E7EC] rounded-[8px] bg-white hover:bg-[#F9FAFB]">
                Download <ChevronDown className="w-3.5 h-3.5 text-[#637083]" />
              </Dropdown.Trigger>
              <Dropdown.Content placement="bottom" className="absolute top-full right-0 z-50 mt-1 bg-white border border-[#E4E7EC] rounded-[8px] shadow-lg py-1 min-w-[160px]">
                <button className="close-dropdown flex items-center gap-2 w-full px-3 py-2 text-[13px] text-[#141C24] hover:bg-[#F2F4F7] text-left"><Download className="w-3.5 h-3.5 text-[#637083]" /> CSV file</button>
                <button className="close-dropdown flex items-center gap-2 w-full px-3 py-2 text-[13px] text-[#141C24] hover:bg-[#F2F4F7] text-left"><Download className="w-3.5 h-3.5 text-[#637083]" /> Excel (.xlsx)</button>
              </Dropdown.Content>
            </Dropdown>
            <button className="flex items-center gap-1.5 h-9 px-3 text-[13px] font-medium text-[#141C24] border border-[#E4E7EC] rounded-[8px] bg-white hover:bg-[#F9FAFB]">
              <Upload className="w-3.5 h-3.5" />
              Upload
            </button>
          </div>
        )}

        {/* Draft banner */}
        {hasDrafts && !newRow && (
          <div className="shrink-0 px-7 pb-4">
            <div className="flex items-center gap-3 px-4 py-3 bg-blue-50/70 border border-blue-100 rounded-[10px]">
              <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
              <div className="flex-1">
                <p className="text-[13px] font-semibold text-blue-900">Changes saved as draft</p>
                <p className="text-[12px] text-blue-700">Your edits won't affect live metric values until you publish.</p>
              </div>
              <button onClick={handlePublish} className="px-4 h-9 text-[13px] font-medium text-white bg-blue-600 rounded-[8px] hover:bg-blue-700">Publish</button>
              <button onClick={handleDiscard} className="px-4 h-9 text-[13px] font-medium text-[#141C24] border border-[#E4E7EC] rounded-[8px] bg-white hover:bg-[#F9FAFB]">Discard</button>
            </div>
          </div>
        )}

        {/* Show only updated toggle */}
        {hasDrafts && !newRow && (
          <div className="shrink-0 px-7 pb-3 flex items-center gap-2">
            <button
              type="button"
              role="switch"
              aria-checked={showOnlyUpdated}
              onClick={() => setShowOnlyUpdated(v => !v)}
              className={`relative w-[34px] h-[20px] rounded-full transition-colors ${showOnlyUpdated ? 'bg-blue-600' : 'bg-[#D0D5DD]'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${showOnlyUpdated ? 'translate-x-[14px]' : ''}`} />
            </button>
            <span className="text-[13px] text-[#141C24]">Show only updated row</span>
          </div>
        )}

        {/* Table */}
        <div className="flex-1 overflow-auto px-7 pb-7">
          <div className="border border-[#E4E7EC] rounded-[10px] overflow-hidden">
            {/* Header row */}
            <div className="grid grid-cols-[44px_1fr_180px_1.4fr_180px] bg-white border-b border-[#E4E7EC]">
              <div className="px-3 py-3 flex items-center">
                <CheckboxBox checked={allVisibleSelected} indeterminate={someVisibleSelected} onToggle={toggleAllSelect} />
              </div>
              <div className="px-2 py-3 text-[13px] font-semibold text-[#141C24]">Customer</div>
              <div className="px-2 py-3 text-[13px] font-semibold text-[#141C24]">Date</div>
              <div className="px-2 py-3 text-[13px] font-semibold text-[#141C24]">Tags</div>
              <div className="px-2 py-3 text-[13px] font-semibold text-[#141C24]">Value</div>
            </div>

            {/* New row (inline create) */}
            {newRow && (
              <div className="grid grid-cols-[44px_1fr_180px_1.4fr_180px] border-b border-[#E4E7EC] bg-blue-50/30">
                <div className="px-3 py-3 flex items-center"><CheckboxBox checked={false} /></div>
                <div className="px-2 py-2.5">
                  <input
                    autoFocus
                    value={newRow.customer}
                    onChange={e => setNewRow({ ...newRow, customer: e.target.value })}
                    placeholder="Enter Customer"
                    className="w-full h-8 px-2 text-[14px] border border-blue-300 rounded-[6px] outline-none focus:border-blue-500 placeholder:text-[#9CA3AF]"
                  />
                </div>
                <div className="px-2 py-2.5">
                  <input
                    value={newRow.date}
                    onChange={e => setNewRow({ ...newRow, date: e.target.value })}
                    placeholder="Enter Date"
                    className="w-full h-8 px-2 text-[14px] border border-[#E4E7EC] rounded-[6px] outline-none focus:border-blue-500 placeholder:text-[#9CA3AF]"
                  />
                </div>
                <div className="px-2 py-2.5 flex items-center">
                  <TagAddButton onAdd={(t) => setNewRow({ ...newRow, tags: [...newRow.tags, t] })} existing={newRow.tags} />
                </div>
                <div className="px-2 py-2.5">
                  <input
                    value={newRow.value || ''}
                    onChange={e => setNewRow({ ...newRow, value: Number(e.target.value.replace(/[^0-9.]/g, '')) || 0 })}
                    placeholder="Enter Value"
                    className="w-full h-8 px-2 text-[14px] border border-[#E4E7EC] rounded-[6px] outline-none focus:border-blue-500 placeholder:text-[#9CA3AF]"
                  />
                </div>
              </div>
            )}

            {/* Data rows */}
            {visibleRows.map((row, i) => {
              const rowDirty = (dirty[row.id]?.size ?? 0) > 0;
              const rowSelected = selectedIds.has(row.id);
              return (
                <div
                  key={row.id}
                  className={`grid grid-cols-[44px_1fr_180px_1.4fr_180px] ${i !== visibleRows.length - 1 ? 'border-b border-[#F2F4F7]' : ''} ${rowSelected ? 'bg-blue-50/50' : 'hover:bg-[#F9FAFB]'}`}
                >
                  <div className="px-3 py-3.5 flex items-center"><CheckboxBox checked={rowSelected} onToggle={() => toggleRowSelect(row.id)} /></div>
                  {/* Customer (blue dot when row dirty) */}
                  <div className="px-2 py-3.5 flex items-center gap-2">
                    {rowDirty && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />}
                    <span className="text-[14px] text-[#141C24] truncate">{row.customer}</span>
                  </div>
                  {/* Date */}
                  <div className="px-2 py-3.5 flex items-center">
                    {editing?.rowId === row.id && editing.field === 'date' ? (
                      <input
                        autoFocus
                        defaultValue={row.date}
                        onBlur={(e) => { updateRow(row.id, { date: e.target.value }, 'date'); setEditing(null); }}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === 'Escape') (e.currentTarget as HTMLInputElement).blur(); }}
                        className="w-full h-8 px-2 text-[14px] border border-blue-400 rounded-[6px] outline-none bg-blue-50"
                      />
                    ) : (
                      <button onClick={() => setEditing({ rowId: row.id, field: 'date' })} className="text-[14px] text-[#141C24] hover:text-blue-600 text-left">
                        {row.date}
                      </button>
                    )}
                  </div>
                  {/* Tags */}
                  <div className="px-2 py-3 flex items-center flex-wrap gap-1.5">
                    {row.tags.map(t => (
                      <span key={t} className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-full border border-[#E4E7EC] text-[12px] text-[#414E62]">
                        {t}
                        <button onClick={() => removeTag(row.id, t)} className="text-[#9CA3AF] hover:text-[#414E62]">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    <TagAddButton onAdd={(t) => addTag(row.id, t)} existing={row.tags} />
                  </div>
                  {/* Value (editable, blue dot when dirty) */}
                  <div className="px-2 py-3.5 flex items-center gap-2">
                    {isDirty(row.id, 'value') && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />}
                    {editing?.rowId === row.id && editing.field === 'value' ? (
                      <input
                        autoFocus
                        defaultValue={String(row.value)}
                        onBlur={(e) => { updateRow(row.id, { value: Number(e.target.value.replace(/[^0-9.]/g, '')) || 0 }, 'value'); setEditing(null); }}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === 'Escape') (e.currentTarget as HTMLInputElement).blur(); }}
                        className="w-full h-8 px-2 text-[14px] border border-blue-400 rounded-[6px] outline-none bg-blue-50"
                      />
                    ) : (
                      <button onClick={() => setEditing({ rowId: row.id, field: 'value' })} className="text-[14px] text-[#141C24] hover:text-blue-600 text-left">
                        {formatRawValue(row.value)}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Delete confirmation (generic pattern) */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[1001] flex items-center justify-center bg-black/40" onClick={() => setConfirmDelete(false)}>
          <div className="bg-white rounded-md shadow-xl w-[26rem] max-w-[92vw] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-4">
              <h3 className="text-lg font-medium text-[#202B37]">
                Do you want to delete {selectedIds.size > 1 ? `these ${selectedIds.size} records` : 'this record'}?
              </h3>
            </div>
            <div className="px-4 pb-4">
              <p className="text-base text-[#414E62]">
                You can't retrieve associated details with {selectedIds.size > 1 ? 'these records' : 'this record'} later.
              </p>
            </div>
            <div className="p-4 border-t border-slate-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="bg-white px-4 py-1.5 text-[13px] text-gray-500 border border-gray-400 rounded-[8px] font-semibold hover:bg-[#F9FAFB]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteSelected}
                className="text-white bg-red-500 px-4 py-1.5 text-[13px] font-semibold border border-red-500 rounded-[8px] hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
      `}</style>
    </>
  );
}

// ── Small helpers ─────────────────────────────────────────────────────────────

function CheckboxBox({
  checked, indeterminate, onToggle,
}: {
  checked: boolean;
  indeterminate?: boolean;
  onToggle?: () => void;
}) {
  const active = checked || indeterminate;
  const Tag: any = onToggle ? 'button' : 'span';
  return (
    <Tag
      {...(onToggle ? { type: 'button', onClick: (e: React.MouseEvent) => { e.stopPropagation(); onToggle(); } } : {})}
      style={{ width: 18, height: 18 }}
      className={`shrink-0 aspect-square inline-flex items-center justify-center rounded-[4px] border transition-colors ${active ? 'bg-blue-600 border-blue-600' : 'bg-white border-[#D0D5DD]'} ${onToggle ? 'cursor-pointer hover:border-[#1D4ED8]' : ''}`}
    >
      {indeterminate
        ? <span className="w-[10px] h-[2px] bg-white rounded" />
        : checked
        ? <Check className="w-3 h-3 text-white" strokeWidth={3} />
        : null}
    </Tag>
  );
}

function PillDropdown({ label, suffix, children }: { label: string; suffix?: string; children: React.ReactNode }) {
  return (
    <Dropdown className="relative">
      <Dropdown.Trigger className="flex items-center gap-1.5 h-9 px-3.5 text-[13px] font-medium text-[#141C24] border border-[#E4E7EC] rounded-full bg-white hover:bg-[#F9FAFB]">
        {label}
        {suffix && <span className="text-[#9CA3AF]">{suffix}</span>}
        <ChevronDown className="w-3.5 h-3.5 text-[#637083]" />
      </Dropdown.Trigger>
      <Dropdown.Content placement="bottom" className="absolute top-full left-0 z-50 mt-1 bg-white border border-[#E4E7EC] rounded-[8px] shadow-lg py-1 min-w-[200px] max-h-[300px] overflow-y-auto">
        {children}
      </Dropdown.Content>
    </Dropdown>
  );
}

function TagAddButton({ onAdd, existing }: { onAdd: (tag: string) => void; existing: string[] }) {
  const available = RAW_TAG_POOL.filter(t => !existing.includes(t));
  return (
    <Dropdown className="relative inline-flex">
      <Dropdown.Trigger className="w-6 h-6 flex items-center justify-center rounded-full border border-[#E4E7EC] text-[#637083] hover:bg-[#F2F4F7]">
        <Plus className="w-3 h-3" />
      </Dropdown.Trigger>
      <Dropdown.Content placement="bottom" className="absolute top-full left-0 z-[1100] mt-1 bg-white border border-[#E4E7EC] rounded-[8px] shadow-lg py-1 min-w-[160px] max-h-[240px] overflow-y-auto">
        {available.length === 0 ? (
          <div className="px-3 py-2 text-[12px] text-[#9CA3AF]">All tags added</div>
        ) : available.map(t => (
          <button key={t} onClick={() => onAdd(t)} className="close-dropdown flex items-center w-full px-3 py-1.5 text-[13px] text-[#141C24] hover:bg-[#F2F4F7] text-left">
            {t}
          </button>
        ))}
      </Dropdown.Content>
    </Dropdown>
  );
}
