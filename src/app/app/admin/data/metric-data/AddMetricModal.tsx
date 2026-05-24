'use client';

import React, { useState, useMemo } from 'react';
import { X, Plus, Trash2, Check, ChevronDown, Search, StickyNote } from 'lucide-react';
import { Dropdown } from '../../../../../common/Dropdown';

export type ApplyTo = 'all' | 'segment' | 'specific';
export type MetricType = 'currency' | 'number' | 'percent' | 'multi-select';

export interface NewMetricInput {
  name: string;
  type: MetricType;
  description?: string;
  options?: string[];
  applyTo: ApplyTo;
  segmentName?: string;
  customerIds?: string[];
}

interface AddMetricModalProps {
  customers: { id: string; name: string }[];
  segments: string[];
  onCancel: () => void;
  onSubmit: (metric: NewMetricInput) => void;
}

const TYPE_OPTIONS: { value: MetricType; label: string }[] = [
  { value: 'currency',     label: 'Currency'    },
  { value: 'number',       label: 'Number'      },
  { value: 'percent',      label: 'Percentage'  },
  { value: 'multi-select', label: 'Multi-select' },
];

const APPLY_OPTIONS: { value: ApplyTo; label: string }[] = [
  { value: 'all',      label: 'All customers' },
  { value: 'segment',  label: 'Segment based' },
  { value: 'specific', label: 'Specific'      },
];

// ── Segmented control (inline, no extra deps) ────────────────────────────────

function SegmentedControl<T extends string>({
  options, value, onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex gap-0 border border-[#E4E7EC] rounded-[10px] p-1 bg-[#F9FAFB]">
      {options.map(opt => {
        const isActive = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`flex-1 h-9 px-3 text-[13px] font-medium rounded-[7px] transition-all ${
              isActive
                ? 'bg-white text-[#141C24] shadow-[0_1px_2px_rgba(16,24,40,0.08)]'
                : 'text-[#637083] hover:text-[#141C24]'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

// ── Slide-over drawer for creating a new metric ──────────────────────────────

export default function AddMetricModal({
  customers, segments, onCancel, onSubmit,
}: AddMetricModalProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<MetricType>('currency');
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState<string[]>(['', '']);
  const [applyTo, setApplyTo] = useState<ApplyTo>('all');
  const [segmentName, setSegmentName] = useState(segments[0] ?? '');
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<Set<string>>(new Set());
  const [customerSearch, setCustomerSearch] = useState('');

  const validOptions = options.filter(o => o.trim()).length >= 2;
  const canSubmit =
    name.trim().length > 0 &&
    (type !== 'multi-select' || validOptions) &&
    (applyTo !== 'segment'  || !!segmentName) &&
    (applyTo !== 'specific' || selectedCustomerIds.size > 0);

  const toggleCustomer = (id: string) => {
    setSelectedCustomerIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredCustomers = useMemo(() => {
    const q = customerSearch.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(c => c.name.toLowerCase().includes(q));
  }, [customers, customerSearch]);

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit({
      name: name.trim(),
      type,
      description: description.trim() || undefined,
      options: type === 'multi-select' ? options.map(o => o.trim()).filter(Boolean) : undefined,
      applyTo,
      segmentName: applyTo === 'segment'  ? segmentName : undefined,
      customerIds: applyTo === 'specific' ? Array.from(selectedCustomerIds) : undefined,
    });
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[998] bg-black/30 transition-opacity"
        onClick={onCancel}
      />

      {/* Slide-over drawer */}
      <div className="fixed top-0 right-0 bottom-0 w-[480px] z-[999] bg-white shadow-2xl flex flex-col animate-[slideIn_0.18s_ease-out]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E4E7EC]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 flex items-center justify-center bg-[#F2F4F7] rounded-[6px]">
              <StickyNote className="w-4 h-4 text-[#637083]" />
            </div>
            <h3 className="text-[16px] font-semibold text-[#141C24]">New metric</h3>
          </div>
          <button
            onClick={onCancel}
            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[#F2F4F7] transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-[#637083]" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-5 flex-1 overflow-y-auto space-y-5">
          {/* Metric name */}
          <div>
            <label className="block text-[13px] font-medium text-[#141C24] mb-1.5">
              Metric name <span className="text-red-500">*</span>
            </label>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Customer Lifetime Value"
              className="w-full h-10 px-3 text-[14px] text-[#141C24] border border-[#E4E7EC] rounded-[8px] outline-none focus:border-blue-400 placeholder:text-[#9CA3AF]"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[13px] font-medium text-[#141C24] mb-1.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Add note"
              rows={4}
              className="w-full px-3 py-2 text-[14px] text-[#141C24] border border-[#E4E7EC] rounded-[8px] outline-none focus:border-blue-400 placeholder:text-[#9CA3AF] resize-none"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-[13px] font-medium text-[#141C24] mb-1.5">Type</label>
            <SegmentedControl options={TYPE_OPTIONS} value={type} onChange={setType} />
          </div>

          {/* Multi-select options */}
          {type === 'multi-select' && (
            <div>
              <label className="block text-[13px] font-medium text-[#141C24] mb-1.5">
                Options <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                {options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={opt}
                      onChange={e => setOptions(prev => prev.map((o, idx) => (idx === i ? e.target.value : o)))}
                      placeholder={`Option ${i + 1}`}
                      className="flex-1 h-10 px-3 text-[14px] text-[#141C24] border border-[#E4E7EC] rounded-[8px] outline-none focus:border-blue-400 placeholder:text-[#9CA3AF]"
                    />
                    <button
                      type="button"
                      onClick={() => setOptions(prev => prev.filter((_, idx) => idx !== i))}
                      disabled={options.length <= 2}
                      className="w-10 h-10 flex items-center justify-center text-[#637083] hover:bg-[#F2F4F7] rounded-md disabled:opacity-40 disabled:cursor-not-allowed"
                      aria-label="Remove option"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setOptions(prev => [...prev, ''])}
                  className="flex items-center gap-1.5 text-[13px] text-blue-600 hover:text-blue-700 font-medium"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add option
                </button>
              </div>
            </div>
          )}

          {/* Apply to */}
          <div>
            <label className="block text-[13px] font-medium text-[#141C24] mb-1.5">Apply to</label>
            <SegmentedControl options={APPLY_OPTIONS} value={applyTo} onChange={setApplyTo} />
          </div>

          {/* Segment dropdown — shown when Apply to = Segment based */}
          {applyTo === 'segment' && (
            <div>
              <label className="block text-[13px] font-medium text-[#141C24] mb-1.5">Segment</label>
              <Dropdown className="relative">
                <Dropdown.Trigger className="flex items-center justify-between w-full h-10 px-3 text-[14px] text-[#141C24] border border-[#E4E7EC] rounded-[8px] bg-white hover:bg-[#F9FAFB]">
                  <span>{segmentName || 'Select a segment'}</span>
                  <ChevronDown className="w-4 h-4 text-[#637083]" />
                </Dropdown.Trigger>
                <Dropdown.Content
                  placement="bottom"
                  className="absolute top-full left-0 right-0 z-[1000] mt-1 bg-white border border-[#E4E7EC] rounded-[8px] shadow-lg py-1 max-h-[240px] overflow-y-auto"
                >
                  {segments.map(seg => (
                    <button
                      key={seg}
                      type="button"
                      onClick={() => setSegmentName(seg)}
                      className="close-dropdown flex items-center gap-2 w-full px-3 py-2 text-[13px] text-[#141C24] hover:bg-[#F2F4F7] text-left"
                    >
                      {segmentName === seg
                        ? <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        : <span className="w-3.5 shrink-0" />}
                      {seg}
                    </button>
                  ))}
                </Dropdown.Content>
              </Dropdown>
            </div>
          )}

          {/* Specific customers — shown when Apply to = Specific */}
          {applyTo === 'specific' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[13px] font-medium text-[#141C24]">Select Customers</label>
                <div className="flex items-center gap-3 text-[12px]">
                  <button
                    type="button"
                    onClick={() => setSelectedCustomerIds(new Set(customers.map(c => c.id)))}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Select all
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedCustomerIds(new Set())}
                    disabled={selectedCustomerIds.size === 0}
                    className="text-[#637083] hover:text-[#141C24] disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Clear
                  </button>
                </div>
              </div>
              <div className="relative mb-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                <input
                  type="text"
                  value={customerSearch}
                  onChange={e => setCustomerSearch(e.target.value)}
                  placeholder="Search"
                  className="w-full pl-9 pr-3 h-10 text-[14px] text-[#141C24] border border-[#E4E7EC] rounded-[8px] outline-none focus:border-blue-400 placeholder:text-[#9CA3AF]"
                />
              </div>
              <div className="space-y-0.5 max-h-[260px] overflow-y-auto">
                {filteredCustomers.map(c => {
                  const checked = selectedCustomerIds.has(c.id);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => toggleCustomer(c.id)}
                      className="flex items-center gap-2.5 w-full px-2 py-2 hover:bg-[#F9FAFB] text-left rounded-md"
                    >
                      <span className={`w-[18px] h-[18px] flex items-center justify-center rounded-[4px] border shrink-0 ${
                        checked ? 'bg-blue-600 border-blue-600' : 'bg-white border-[#D0D5DD]'
                      }`}>
                        {checked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                      </span>
                      <span className="text-[14px] text-[#141C24]">{c.name}</span>
                    </button>
                  );
                })}
                {filteredCustomers.length === 0 && (
                  <p className="px-3 py-4 text-[13px] text-[#9CA3AF] text-center">No customers match</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-[#E4E7EC] flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 h-9 text-[13px] font-medium text-[#637083] border border-[#E4E7EC] bg-white rounded-[8px] hover:bg-[#F2F4F7] transition-colors"
          >
            Close
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="px-4 h-9 text-[13px] font-medium text-white bg-blue-600 rounded-[8px] hover:bg-blue-700 transition-colors disabled:bg-[#E4E7EC] disabled:text-[#9CA3AF] disabled:cursor-not-allowed"
          >
            Create
          </button>
        </div>
      </div>

      {/* Slide-in keyframes (Tailwind-compatible, no extra deps) */}
      <style jsx global>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
      `}</style>
    </>
  );
}
