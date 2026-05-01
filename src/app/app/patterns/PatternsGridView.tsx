'use client';

import React, { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import GridView from '../../../common/components/GridView';
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
}

interface PatternsGridViewProps {
  data: Pattern[];
  onRowClick?: (row: Pattern) => void;
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

export default function PatternsGridView({ data, onRowClick }: PatternsGridViewProps) {
  const columns = useMemo<ColumnDef<Pattern>[]>(
    () => [
      {
        id: 'trend',
        header: 'Trend',
        size: 60,
        cell: ({ row }) => (
          <div className="flex items-center justify-center w-full">
            <Sparkline values={row.original.trend} />
          </div>
        ),
      },
      {
        id: 'title',
        header: 'Issue Patterns',
        size: 289,
        cell: ({ row }) => (
          <div className="flex flex-col gap-1 py-1">
            <span className="text-[#202B37] text-[13px] font-medium leading-[18px] line-clamp-2">
              {row.original.title}
            </span>
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
          </div>
        ),
      },
      {
        id: 'description',
        header: 'Description',
        size: 290,
        cell: ({ row }) => (
          <span className="text-[#414E62] text-[13px] leading-[18px] line-clamp-2">
            {row.original.description}
          </span>
        ),
      },
      {
        id: 'openSignals',
        header: 'Open signals',
        size: 92,
        cell: ({ row }) => (
          <span className="text-[#202B37] text-[13px] font-medium">
            {row.original.openSignals}
          </span>
        ),
      },
      {
        id: 'impactedCustomers',
        header: 'Impacted Customers',
        size: 94,
        cell: ({ row }) => (
          <span className="text-[#202B37] text-[13px] font-medium">
            {row.original.impactedCustomers}
          </span>
        ),
      },
      {
        id: 'createdBy',
        header: 'Created by',
        size: 94,
        cell: ({ row }) => (
          <span
            className={`inline-flex items-center px-[8px] py-[2px] rounded-[4px] text-[12px] font-medium ${
              row.original.createdBy === 'System'
                ? 'bg-[#E8F0FE] text-[#3B6FF6]'
                : 'bg-[#F2F4F7] text-[#414E62]'
            }`}
          >
            {row.original.createdBy}
          </span>
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
            <span className="text-[#414E62] text-[13px]">
              {visible.join(', ')}
              {rest > 0 && (
                <span className="text-[#3B6FF6]">{` and ${rest} others`}</span>
              )}
            </span>
          );
        },
      },
      {
        id: 'createdOn',
        header: 'Created on',
        size: 160,
        cell: ({ row }) => (
          <span className="text-[#414E62] text-[13px]">
            {dayjs(row.original.createdOn).format('MMMM D, YYYY')}
          </span>
        ),
      },
    ],
    []
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
        trclassName="hover:bg-[#F7F8FA] cursor-pointer"
        emptyPlaceHolderForTable="No patterns found"
      />
    </div>
  );
}
