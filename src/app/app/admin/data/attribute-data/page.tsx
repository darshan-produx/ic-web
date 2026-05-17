'use client';

import React, { useMemo, useState, useRef, useCallback } from 'react';
import { Search, Download, Upload, ChevronDown, Check, X } from 'lucide-react';
import GridView from '../../../../../common/components/GridView';
import { Dropdown } from '../../../../../common/Dropdown';

// ── Types ─────────────────────────────────────────────────────────────────────

type ColType = 'text' | 'select';

interface AttributeColDef {
  key: string;
  label: string;
  type: ColType;
  options?: string[];
  width: number;
}

interface CustomerRow {
  id: string;
  customer: string;
  [key: string]: string;
}

interface UploadPreview {
  fileName: string;
  changedRows: { customer: string; attribute: string; oldVal: string; newVal: string }[];
}

// ── Constants ─────────────────────────────────────────────────────────────────

const ATTRIBUTE_COLS: AttributeColDef[] = [
  { key: 'segment',        label: 'Segment',        type: 'select', options: ['Enterprise', 'Mid-Market', 'SMB'], width: 160 },
  { key: 'geography',      label: 'Geography',      type: 'select', options: ['North America', 'Europe', 'APAC', 'LATAM', 'MEA'], width: 170 },
  { key: 'customer_type',  label: 'Customer Type',  type: 'select', options: ['Direct', 'Partner', 'Self-service'], width: 170 },
  { key: 'account_owner',  label: 'Account Owner',  type: 'text',   width: 180 },
  { key: 'installed_base', label: 'Installed Base', type: 'select', options: ['Core', 'Core + Analytics', 'Core + Analytics + AI', 'Premium'], width: 220 },
];

const MOCK_CUSTOMERS = [
  { id: '1',  name: 'Acme Corporation'     },
  { id: '2',  name: 'TechVision Inc'        },
  { id: '3',  name: 'Global Dynamics'       },
  { id: '4',  name: 'BrightPath Solutions'  },
  { id: '5',  name: 'Skyline Ventures'      },
  { id: '6',  name: 'NovaStar Systems'      },
  { id: '7',  name: 'Vertex Analytics'      },
  { id: '8',  name: 'PeakFlow Labs'         },
  { id: '9',  name: 'Crestline Partners'    },
  { id: '10', name: 'Bluewave Technologies' },
  { id: '11', name: 'Summit Data Co'        },
  { id: '12', name: 'RedRock Holdings'      },
  { id: '13', name: 'Coastal Systems'       },
  { id: '14', name: 'Ironclad Software'     },
  { id: '15', name: 'Zenith Platforms'      },
];

function pseudoRand(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

function pickFrom<T>(arr: T[], seed: number): T {
  return arr[Math.floor(pseudoRand(seed) * arr.length)];
}

const ACCOUNT_OWNERS = ['Alice Johnson', 'Bob Smith', 'Carol Davis', 'David Lee', 'Emma Wilson'];

function buildInitialData(): CustomerRow[] {
  return MOCK_CUSTOMERS.map(c => {
    const id = parseInt(c.id, 10);
    return {
      id: c.id,
      customer: c.name,
      segment:        pickFrom(['Enterprise', 'Mid-Market', 'SMB'],                          id * 3),
      geography:      pickFrom(['North America', 'Europe', 'APAC', 'LATAM', 'MEA'],         id * 7),
      customer_type:  pickFrom(['Direct', 'Partner', 'Self-service'],                        id * 11),
      account_owner:  pickFrom(ACCOUNT_OWNERS,                                               id * 17),
      installed_base: pickFrom(['Core', 'Core + Analytics', 'Core + Analytics + AI', 'Premium'], id * 13),
    };
  });
}

const INITIAL_DATA = buildInitialData();

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

// ── Inline cell components ────────────────────────────────────────────────────

function TextEditCell({ value, onSave }: { value: string; onSave: (v: string) => void }) {
  return (
    <input
      autoFocus
      defaultValue={value}
      className="w-full h-full px-4 py-2 text-[14px] border-none outline-none bg-blue-50 text-[#141C24] focus:ring-2 focus:ring-inset focus:ring-blue-400"
      onBlur={(e) => onSave(e.currentTarget.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === 'Escape') (e.currentTarget as HTMLInputElement).blur();
      }}
    />
  );
}

function SelectEditCell({
  value, options, onSave, onClose,
}: {
  value: string;
  options: string[];
  onSave: (v: string) => void;
  onClose: () => void;
}) {
  return (
    <>
      <div className="absolute top-full left-0 z-50 mt-0 bg-white border border-[#E4E7EC] rounded-[8px] shadow-lg py-1 min-w-[180px]">
        {options.map(opt => (
          <button
            key={opt}
            onMouseDown={(e) => { e.preventDefault(); onSave(opt); }}
            className="flex items-center w-full px-3 py-2 text-[13px] text-[#141C24] hover:bg-[#F2F4F7] text-left gap-2"
          >
            {value === opt ? <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" /> : <span className="w-3.5 shrink-0" />}
            {opt}
          </button>
        ))}
      </div>
      <div className="fixed inset-0 z-40" onMouseDown={onClose} />
    </>
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
                    <th className="text-left py-2 pr-4 font-semibold text-[#637083] text-[12px]">Attribute</th>
                    <th className="text-left py-2 pr-4 font-semibold text-[#637083] text-[12px]">Current</th>
                    <th className="text-left py-2 font-semibold text-[#637083] text-[12px]">New</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.changedRows.map((row, i) => (
                    <tr key={i} className="border-b border-[#F2F4F7]">
                      <td className="py-2 pr-4 text-[#141C24]">{row.customer}</td>
                      <td className="py-2 pr-4 text-[#141C24]">{row.attribute}</td>
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

export default function AttributeDataPage() {
  const [tableData, setTableData] = useState<CustomerRow[]>(INITIAL_DATA);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());
  const [editingCell, setEditingCell] = useState<{ rowId: string; colKey: string } | null>(null);
  const [uploadPreview, setUploadPreview] = useState<UploadPreview | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return tableData;
    const q = searchTerm.toLowerCase();
    return tableData.filter(row => row.customer.toLowerCase().includes(q));
  }, [tableData, searchTerm]);

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

  const handleCellEdit = useCallback((rowId: string, colKey: string, newValue: string) => {
    setTableData(prev => prev.map(row => (row.id === rowId ? { ...row, [colKey]: newValue } : row)));
    setEditingCell(null);
  }, []);

  const columns = useMemo(() => {
    return [
      // Checkbox column
      {
        id: 'select',
        size: 48,
        enableSorting: false,
        meta: { isEditable: false },
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
        meta: { isEditable: false },
        cell: (ctx: any) => (
          <div className="px-4 py-3 text-[14px] text-[#141C24] truncate">
            {ctx.getValue()}
          </div>
        ),
      },
      // Attribute columns
      ...ATTRIBUTE_COLS.map(col => ({
        id: col.key,
        header: col.label,
        accessorKey: col.key,
        size: col.width,
        meta: { isEditable: true },
        cell: (ctx: any) => {
          const rowId = ctx.row.original.id as string;
          const rawValue = ctx.getValue() as string;
          const isEditing = editingCell?.rowId === rowId && editingCell?.colKey === col.key;

          if (isEditing && col.type === 'text') {
            return <TextEditCell value={rawValue} onSave={(v) => handleCellEdit(rowId, col.key, v)} />;
          }

          if (isEditing && col.type === 'select') {
            return (
              <div className="relative h-full">
                <div className="px-4 py-3 text-[14px] text-[#141C24] bg-blue-50">{rawValue || '—'}</div>
                <SelectEditCell
                  value={rawValue}
                  options={col.options!}
                  onSave={(v) => handleCellEdit(rowId, col.key, v)}
                  onClose={() => setEditingCell(null)}
                />
              </div>
            );
          }

          return (
            <div
              className="relative px-4 py-3 text-[14px] text-[#141C24] cursor-pointer hover:bg-blue-50/60 group h-full"
              onClick={() => setEditingCell({ rowId, colKey: col.key })}
            >
              {rawValue || '—'}
              {col.type === 'select' && (
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#637083] opacity-0 group-hover:opacity-60 transition-opacity" />
              )}
            </div>
          );
        },
      })),
    ];
  }, [editingCell, handleCellEdit, allSelected, someSelected, selectedRowIds, toggleAll, toggleRow]);

  const handleDownload = (format: 'csv' | 'xlsx') => {
    const headers = ['Customer', ...ATTRIBUTE_COLS.map(c => c.label)];
    const rows = filteredData.map(row => [
      `"${row.customer}"`,
      ...ATTRIBUTE_COLS.map(c => `"${row[c.key] || ''}"`),
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attribute-data.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const sampleRows = filteredData.slice(0, Math.min(filteredData.length, 3 + Math.floor(Math.random() * 3)));
    const changedRows = sampleRows.map(row => {
      const col = ATTRIBUTE_COLS[Math.floor(Math.random() * ATTRIBUTE_COLS.length)];
      const oldVal = row[col.key];
      const opts = col.options || ACCOUNT_OWNERS;
      const newVal = opts.find(o => o !== oldVal) || opts[0];
      return { customer: row.customer, attribute: col.label, oldVal, newVal };
    });
    setUploadPreview({ fileName: file.name, changedRows });
    e.target.value = '';
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* ── Row 1: Title ───────────────────────────────────────────────────── */}
      <div className="shrink-0 px-8 pt-6 pb-4">
        <h1 className="text-[20px] font-bold text-[#141C24] leading-none">Attributes</h1>
      </div>

      {/* ── Row 2: Action bar ─────────────────────────────────────────────── */}
      <div className="shrink-0 px-8 pb-4 flex items-center gap-3 flex-wrap">
        {/* Counter chip */}
        <span className="inline-flex items-center justify-center min-w-[28px] h-[28px] px-2 rounded-full bg-[#F2F4F7] text-[12px] font-semibold text-[#637083] tabular-nums">
          {filteredData.length}
        </span>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Search */}
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

        {/* Download dropdown */}
        <Dropdown className="relative">
          <Dropdown.Trigger className="flex items-center gap-1.5 h-9 px-3 text-[13px] font-medium text-[#141C24] border border-[#E4E7EC] rounded-[8px] bg-white hover:bg-[#F9FAFB] transition-colors">
            Download
            <ChevronDown className="w-3.5 h-3.5 text-[#637083]" />
          </Dropdown.Trigger>
          <Dropdown.Content
            placement="bottom"
            className="absolute top-full right-0 z-50 mt-1 bg-white border border-[#E4E7EC] rounded-[8px] shadow-lg py-1 min-w-[180px]"
          >
            <button
              onClick={() => handleDownload('csv')}
              className="close-dropdown flex items-center gap-2 w-full px-3 py-2 text-[13px] text-[#141C24] hover:bg-[#F2F4F7] text-left"
            >
              <Download className="w-3.5 h-3.5 text-[#637083]" />
              CSV file
            </button>
            <button
              onClick={() => handleDownload('xlsx')}
              className="close-dropdown flex items-center gap-2 w-full px-3 py-2 text-[13px] text-[#141C24] hover:bg-[#F2F4F7] text-left"
            >
              <Download className="w-3.5 h-3.5 text-[#637083]" />
              Excel (.xlsx)
            </button>
          </Dropdown.Content>
        </Dropdown>

        {/* Upload dropdown */}
        <Dropdown className="relative">
          <Dropdown.Trigger className="flex items-center gap-1.5 h-9 px-3 text-[13px] font-medium text-[#141C24] border border-[#E4E7EC] rounded-[8px] bg-white hover:bg-[#F9FAFB] transition-colors">
            Upload
            <ChevronDown className="w-3.5 h-3.5 text-[#637083]" />
          </Dropdown.Trigger>
          <Dropdown.Content
            placement="bottom"
            className="absolute top-full right-0 z-50 mt-1 bg-white border border-[#E4E7EC] rounded-[8px] shadow-lg py-1 min-w-[200px]"
          >
            <button
              onClick={() => fileInputRef.current?.click()}
              className="close-dropdown flex items-center gap-2 w-full px-3 py-2 text-[13px] text-[#141C24] hover:bg-[#F2F4F7] text-left"
            >
              <Upload className="w-3.5 h-3.5 text-[#637083]" />
              Upload file
            </button>
            <button
              onClick={() => alert('Template download coming soon')}
              className="close-dropdown flex items-center gap-2 w-full px-3 py-2 text-[13px] text-[#141C24] hover:bg-[#F2F4F7] text-left"
            >
              <Download className="w-3.5 h-3.5 text-[#637083]" />
              Download template
            </button>
          </Dropdown.Content>
        </Dropdown>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          className="hidden"
          onChange={handleFileChange}
        />
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
