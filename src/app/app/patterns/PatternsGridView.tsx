'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { ColumnDef } from '@tanstack/react-table';
import { Check, MoreHorizontal, Pencil, GitFork, Trash2, RefreshCw, EyeOff, Eye } from 'lucide-react';
import GridView from '../../../common/components/GridView';
import { Dropdown } from '../../../common/Dropdown';
import dayjs from 'dayjs';

export interface Pattern {
  id: string;
  trend: number[];
  title: string;
  labels: { text: string; variant: 'blue' | 'green' | 'yellow' | 'gray' }[];
  description: string;
  openSignals: number;
  impactedCustomers: number;
  createdBy: 'System' | 'User';
  assignedTo: string[];
  createdOn: string;
  /** When false, this is an exclusion pattern — no new signals are generated for it. */
  trackingEnabled: boolean;
}

interface PatternsGridViewProps {
  data: Pattern[];
  selectedIds: Set<string>;
  onToggleRow: (id: string) => void;
  onToggleAll: () => void;
  onEdit: (pattern: Pattern) => void;
  onFork: (pattern: Pattern) => void;
  onReclassify: (pattern: Pattern) => void;
  onToggleTracking: (pattern: Pattern) => void;
  onDelete: (pattern: Pattern) => void;
  onOpenSignals: (pattern: Pattern) => void;
  /** Hide the trend column for the exclusion (disabled) table. */
  compact?: boolean;
}

// Tiny sparkline rendered as an inline SVG
function Sparkline({ values }: { values: number[] }) {
  const w = 44;
  const h = 24;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const step = w / (values.length - 1);

  const points = values
    .map((v, i) => `${i * step},${h - ((v - min) / range) * h}`)
    .join(' ');

  const trending = values[values.length - 1] >= values[0];

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
      <polyline
        points={points}
        stroke={trending ? '#249782' : '#EF4444'}
        strokeWidth="1.5"
        fill="none"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

const LABEL_STYLES: Record<string, string> = {
  blue: 'bg-[#E8F0FE] text-[#3B6FF6]',
  green: 'bg-[#D9F2E5] text-[#249782]',
  yellow: 'bg-[#FFEECC] text-[#EAB308]',
  gray: 'bg-[#F2F4F7] text-[#414E62]',
};

// Wrap cell content with a muted class when the pattern is not currently
// tracking signals — keeps the row recognizable as still actionable while
// signalling that no new signals are being generated.
function CellMuted({ muted, className = '', children }: { muted: boolean; className?: string; children: React.ReactNode }) {
  return <div className={`${muted ? 'opacity-50' : ''} ${className}`.trim()}>{children}</div>;
}

// Inline checkbox — force a 1:1 square via aspect-square + shrink-0 so flex
// parents can't stretch it horizontally.
function CheckboxCell({
  checked, indeterminate, onChange,
}: {
  checked: boolean;
  indeterminate?: boolean;
  onChange: (e: React.MouseEvent) => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      style={{ width: 18, height: 18 }}
      className={`shrink-0 aspect-square inline-flex items-center justify-center rounded-[4px] border transition-colors ${
        checked || indeterminate
          ? 'bg-blue-600 border-blue-600'
          : 'bg-white border-[#D0D5DD] hover:border-[#1D4ED8]'
      }`}
      aria-label={checked ? 'Unselect row' : 'Select row'}
    >
      {indeterminate ? (
        <span className="w-[10px] h-[2px] bg-white rounded" />
      ) : checked ? (
        <Check className="w-3 h-3 text-white" strokeWidth={3} />
      ) : null}
    </button>
  );
}

export default function PatternsGridView({
  data, selectedIds, onToggleRow, onToggleAll, onEdit, onFork, onReclassify, onToggleTracking, onDelete, onOpenSignals, compact,
}: PatternsGridViewProps) {
  const allSelected = data.length > 0 && data.every(p => selectedIds.has(p.id));
  const someSelected = data.some(p => selectedIds.has(p.id)) && !allSelected;

  const columns = useMemo<ColumnDef<Pattern>[]>(
    () => [
      // Selection checkbox — hidden for tracking-disabled rows (they can't be merged).
      {
        id: 'select',
        size: 44,
        header: () => (
          <div className="flex items-center justify-center w-full">
            <CheckboxCell
              checked={allSelected}
              indeterminate={someSelected}
              onChange={(e) => { e.stopPropagation(); onToggleAll(); }}
            />
          </div>
        ),
        cell: ({ row }) => row.original.trackingEnabled ? (
          <div className="flex items-center justify-center w-full">
            <CheckboxCell
              checked={selectedIds.has(row.original.id)}
              onChange={(e) => { e.stopPropagation(); onToggleRow(row.original.id); }}
            />
          </div>
        ) : null,
      },
      {
        id: 'trend',
        header: 'Trend',
        size: 60,
        cell: ({ row }) => (
          <CellMuted muted={!row.original.trackingEnabled} className="flex items-center justify-center w-full">
            {row.original.trend.length > 0
              ? <Sparkline values={row.original.trend} />
              : <span className="text-[11px] text-[#9CA3AF]">—</span>}
          </CellMuted>
        ),
      },
      {
        id: 'title',
        header: 'Issue Patterns',
        size: 289,
        cell: ({ row }) => (
          <CellMuted muted={!row.original.trackingEnabled} className="flex flex-col gap-1 py-1">
            <Link
              href={`/app/patterns/${row.original.id}`}
              className="text-[#202B37] text-[13px] font-medium leading-[18px] line-clamp-2 hover:text-[#3B6FF6] hover:underline transition-colors"
            >
              {row.original.title}
            </Link>
            <div className="flex flex-wrap gap-1">
              {row.original.labels.map((label, i) => (
                <span
                  key={i}
                  className={`inline-flex items-center px-[6px] py-[2px] rounded-[4px] text-[11px] font-medium leading-[16px] ${LABEL_STYLES[label.variant]}`}
                >
                  {label.text}
                </span>
              ))}
            </div>
          </CellMuted>
        ),
      },
      {
        id: 'description',
        header: 'Description',
        size: 290,
        cell: ({ row }) => (
          <CellMuted muted={!row.original.trackingEnabled}>
            <span className="text-[#414E62] text-[13px] leading-[18px] line-clamp-2">
              {row.original.description}
            </span>
          </CellMuted>
        ),
      },
      {
        id: 'openSignals',
        header: 'Open signals',
        size: 92,
        cell: ({ row }) => row.original.trackingEnabled ? (
          <button
            type="button"
            onClick={() => onOpenSignals(row.original)}
            className="text-[#3B6FF6] text-[13px] font-medium hover:underline"
          >
            {row.original.openSignals}
          </button>
        ) : (
          <span className="text-[#9CA3AF] text-[13px]">—</span>
        ),
      },
      {
        id: 'impactedCustomers',
        header: 'Impacted Customers',
        size: 94,
        cell: ({ row }) => row.original.trackingEnabled ? (
          <button
            type="button"
            onClick={() => onOpenSignals(row.original)}
            className="text-[#3B6FF6] text-[13px] font-medium hover:underline"
          >
            {row.original.impactedCustomers}
          </button>
        ) : (
          <span className="text-[#9CA3AF] text-[13px]">—</span>
        ),
      },
      {
        id: 'createdBy',
        header: 'Created by',
        size: 94,
        cell: ({ row }) => (
          <CellMuted muted={!row.original.trackingEnabled}>
            <span
              className={`inline-flex items-center px-[8px] py-[2px] rounded-[4px] text-[12px] font-medium ${
                row.original.createdBy === 'System'
                  ? 'bg-[#E8F0FE] text-[#3B6FF6]'
                  : 'bg-[#F2F4F7] text-[#414E62]'
              }`}
            >
              {row.original.createdBy}
            </span>
          </CellMuted>
        ),
      },
      {
        id: 'assignedTo',
        header: 'Assigned to',
        size: 181,
        cell: ({ row }) => {
          const names = row.original.assignedTo;
          const visible = names.slice(0, 2);
          const rest = names.length - 2;
          return (
            <CellMuted muted={!row.original.trackingEnabled}>
              <span className="text-[#414E62] text-[13px]">
                {names.length === 0 ? <span className="text-[#9CA3AF]">—</span> : visible.join(', ')}
                {rest > 0 && (
                  <span className="text-[#3B6FF6]">{` and ${rest} others`}</span>
                )}
              </span>
            </CellMuted>
          );
        },
      },
      {
        id: 'createdOn',
        header: 'Created on',
        size: 140,
        cell: ({ row }) => (
          <CellMuted muted={!row.original.trackingEnabled}>
            <span className="text-[#414E62] text-[13px]">
              {dayjs(row.original.createdOn).format('MMMM D, YYYY')}
            </span>
          </CellMuted>
        ),
      },
      // Actions kebab
      {
        id: 'actions',
        size: 44,
        header: () => null,
        cell: ({ row }) => (
          <div className="flex items-center justify-center w-full">
            <Dropdown className="relative inline-flex">
              <Dropdown.Trigger
                className="w-7 h-7 flex items-center justify-center rounded-md text-[#637083] hover:bg-[#F2F4F7] transition-colors"
              >
                <MoreHorizontal className="w-4 h-4" />
              </Dropdown.Trigger>
              <Dropdown.Content
                placement="bottom"
                className="absolute top-full right-0 z-50 mt-1 bg-white border border-[#E4E7EC] rounded-[8px] shadow-lg py-1 min-w-[200px]"
              >
                <button
                  onClick={() => onEdit(row.original)}
                  className="close-dropdown flex items-center gap-2 w-full px-3 py-2 text-[13px] text-[#141C24] hover:bg-[#F2F4F7] text-left"
                >
                  <Pencil className="w-3.5 h-3.5 text-[#637083]" />
                  Edit
                </button>
                {row.original.trackingEnabled && (
                  <button
                    onClick={() => onFork(row.original)}
                    className="close-dropdown flex items-center gap-2 w-full px-3 py-2 text-[13px] text-[#141C24] hover:bg-[#F2F4F7] text-left"
                  >
                    <GitFork className="w-3.5 h-3.5 text-[#637083]" />
                    Fork pattern
                  </button>
                )}
                {row.original.trackingEnabled && (
                  <button
                    onClick={() => onReclassify(row.original)}
                    className="close-dropdown flex items-center gap-2 w-full px-3 py-2 text-[13px] text-[#141C24] hover:bg-[#F2F4F7] text-left"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-[#637083]" />
                    Reclassify signals
                  </button>
                )}
                <button
                  onClick={() => onToggleTracking(row.original)}
                  className="close-dropdown flex items-center gap-2 w-full px-3 py-2 text-[13px] text-[#141C24] hover:bg-[#F2F4F7] text-left"
                >
                  {row.original.trackingEnabled
                    ? <><EyeOff className="w-3.5 h-3.5 text-[#637083]" /> Disable tracking</>
                    : <><Eye className="w-3.5 h-3.5 text-[#637083]" /> Enable tracking</>}
                </button>
                <div className="border-t border-[#E4E7EC] my-1" />
                <button
                  onClick={() => onDelete(row.original)}
                  className="close-dropdown flex items-center gap-2 w-full px-3 py-2 text-[13px] text-red-600 hover:bg-red-50 text-left"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </Dropdown.Content>
            </Dropdown>
          </div>
        ),
      },
    ],
    [allSelected, someSelected, selectedIds, onToggleAll, onToggleRow, onEdit, onFork, onReclassify, onToggleTracking, onDelete, onOpenSignals, compact]
  );

  return (
    <div className="rounded-[12px] border border-[#E5E7EB] overflow-hidden">
      <GridView
        columns={columns}
        data={data}
        rowHeight={56}
        divclassName="min-w-max w-full"
        theadclassName="sticky top-0 z-10 bg-white"
        thclassName="text-[12px] font-semibold text-[#637083] uppercase tracking-wide px-4 py-3 text-left border-b border-[#CED2DA] whitespace-normal break-words"
        tdclassName="px-4 py-2 border-b border-[#F2F4F7] align-middle"
        trclassName="hover:bg-[#F7F8FA]"
        emptyPlaceHolderForTable="No patterns found"
      />
    </div>
  );
}
