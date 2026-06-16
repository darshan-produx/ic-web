'use client';

import React, { useMemo, useState } from 'react';
import {
  X, Search, User, AlertTriangle, Plus, Lightbulb, Mail, CheckCircle2, Video, ChevronDown,
} from 'lucide-react';
import { getSignalsForPattern, type SignalLite, type UpdateType } from './mockSignals';

interface SignalDrawerProps {
  patternId: string;
  patternTitle: string;
  openCount: number;
  onClose: () => void;
}

const UPDATE_ICONS: Record<UpdateType, React.ComponentType<{ className?: string }>> = {
  insight: Lightbulb,
  email:   Mail,
  action:  CheckCircle2,
  call:    Video,
};

function formatTimeShort(iso: string): string {
  // Mock — return a clock-style time so list cards look like the design.
  const d = new Date(iso);
  let hh = d.getHours();
  const mm = String(d.getMinutes()).padStart(2, '0');
  const period = hh >= 12 ? 'PM' : 'AM';
  hh = hh % 12 || 12;
  return `${hh}:${mm} ${period}`;
}

export default function SignalDrawer({
  patternId, patternTitle: _patternTitle, openCount, onClose,
}: SignalDrawerProps) {
  const allSignals = getSignalsForPattern(patternId, openCount);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const signals = useMemo(() => {
    if (!query.trim()) return allSignals;
    const q = query.toLowerCase();
    return allSignals.filter(s =>
      s.title.toLowerCase().includes(q) ||
      s.customer.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q)
    );
  }, [allSignals, query]);

  const selected = signals.find(s => s.id === selectedId) ?? null;
  const isExpanded = selected !== null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[998] bg-black/30 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 bottom-0 z-[999] bg-white shadow-2xl flex flex-col transition-[width] duration-200 animate-[slideIn_0.18s_ease-out] ${
          isExpanded ? 'w-[1180px] max-w-[95vw]' : 'w-[560px] max-w-[95vw]'
        }`}
      >
        {/* Top bar */}
        <div className="shrink-0 px-6 py-4 border-b border-[#E4E7EC] flex items-center justify-between">
          <h2 className="text-[18px] font-semibold text-[#141C24]">All signals</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[#F2F4F7] transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-[#637083]" />
          </button>
        </div>

        {/* Body: list panel + (optional) detail panel */}
        <div className="flex-1 flex min-h-0">
          {/* ── List panel ──────────────────────────────────────────────── */}
          <div className={`${isExpanded ? 'w-[480px]' : 'flex-1'} shrink-0 border-r border-[#E4E7EC] flex flex-col`}>
            {/* Search */}
            <div className="shrink-0 px-6 pt-4 pb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                <input
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search signals"
                  className="w-full pl-9 pr-3 h-10 text-[13px] border border-[#E4E7EC] rounded-[8px] outline-none focus:border-blue-400 placeholder:text-[#9CA3AF]"
                />
              </div>
            </div>

            {/* Cards */}
            <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-2.5">
              {signals.map(s => {
                const active = selectedId === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => setSelectedId(s.id)}
                    className={`w-full text-left p-3.5 rounded-[10px] border transition-colors ${
                      active
                        ? 'border-[#3B6FF6] bg-blue-50/40 ring-1 ring-blue-200'
                        : 'border-[#E4E7EC] hover:border-[#D0D5DD] bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="text-[13px] font-semibold text-[#141C24] leading-snug line-clamp-1 flex-1">
                        {s.title}
                      </h4>
                      <span className="shrink-0 text-[11px] text-[#637083] tabular-nums">
                        {formatTimeShort(s.createdAt)}
                      </span>
                    </div>
                    <p className="mt-1.5 text-[12px] text-[#637083] leading-snug line-clamp-2">
                      {s.description}
                    </p>
                  </button>
                );
              })}
              {signals.length === 0 && (
                <p className="text-[13px] text-[#9CA3AF] text-center py-8">No signals match your search</p>
              )}
            </div>
          </div>

          {/* ── Detail panel ──────────────────────────────────────────── */}
          {isExpanded && selected && (
            <div className="flex-1 flex flex-col bg-white min-w-0">
              {/* Title */}
              <div className="shrink-0 px-7 pt-6 pb-2">
                <h2 className="text-[22px] font-bold text-[#141C24] leading-snug">
                  {selected.title}
                </h2>
              </div>

              {/* Meta row */}
              <div className="shrink-0 px-7 pb-4 flex items-center gap-3 text-[12px] text-[#637083] flex-wrap">
                <span className="font-medium text-[#3B6FF6]">{selected.customer}</span>
                {selected.assignee && (
                  <span className="inline-flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    {selected.assignee}
                  </span>
                )}
                {selected.updatedAt && <span>Updated, August 21, 2025</span>}
                <span className="ml-auto flex items-center gap-3">
                  <button className="text-[#637083] hover:text-[#141C24] font-medium">Edit</button>
                  <button className="text-red-600 hover:text-red-700 font-medium">Delete</button>
                </span>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto px-7 pb-6">
                {selected.targetClosure && (
                  <p className="text-[13px] text-[#141C24] mb-3">
                    <span className="font-semibold">Targeted Closure:</span> {selected.targetClosure}
                  </p>
                )}

                <p className="text-[14px] text-[#414E62] leading-relaxed">
                  {selected.description}
                </p>

                {/* Action row */}
                <div className="mt-5 flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-[#F2F4F7] text-[12px] font-medium text-[#414E62]">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    Issue
                  </span>

                  <button className="inline-flex items-center gap-2 h-8 px-3 rounded-[8px] border border-[#E4E7EC] bg-white text-[12px] font-medium text-[#141C24] hover:bg-[#F9FAFB]">
                    Intensity
                    <IntensityBars score={3} />
                    <ChevronDown className="w-3 h-3 text-[#637083]" />
                  </button>

                  <button className="h-8 px-3 rounded-[8px] border border-[#E4E7EC] bg-white text-[12px] font-medium text-[#141C24] hover:bg-[#F9FAFB]">
                    Mark as resolved
                  </button>
                </div>

                {/* Add update */}
                <button className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-medium text-[#3B6FF6] hover:text-[#1D4ED8]">
                  <Plus className="w-3.5 h-3.5" />
                  Add update
                </button>

                {/* Updates */}
                {selected.updates && selected.updates.length > 0 && (
                  <div className="mt-4 space-y-4">
                    {selected.updates.map((u, i) => {
                      const Icon = UPDATE_ICONS[u.type];
                      return (
                        <div key={i} className="flex gap-3">
                          <div className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full bg-[#F2F4F7]">
                            <Icon className="w-3.5 h-3.5 text-[#637083]" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[13px] text-[#141C24] leading-snug">{u.text}</p>
                            <p className="text-[11px] text-[#9CA3AF] mt-1">{u.ago}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
      `}</style>
    </>
  );
}

// Small horizontal bar indicator like the Figma "Intensity" affordance.
function IntensityBars({ score }: { score: number }) {
  // score: 1..5
  const filled = Math.max(1, Math.min(5, Math.round(score)));
  return (
    <span className="inline-flex items-end gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={`block w-[3px] rounded-sm ${i < filled ? 'bg-[#141C24]' : 'bg-[#D0D5DD]'}`}
          style={{ height: 6 + i * 2 }}
        />
      ))}
    </span>
  );
}

// Re-export type so consumers using a SignalLite reference still resolve.
export type { SignalLite };
