'use client';

import React, { useState } from 'react';
import {
  User, Layers, Check, Settings2, GripVertical, Lock,
  RotateCcw, BookmarkCheck, ChevronDown,
} from 'lucide-react';
import { Dropdown } from '../Dropdown';

// ── ViewChip — compact title-row indicator that doubles as a toggle ───────────

interface ViewChipProps {
  isPersonal: boolean;
  hasPersonalView: boolean;
  isConfigurator?: boolean;
  onChangeView: (view: 'standard' | 'personal') => void;
  onResetPersonal?: () => void;
  onSaveAsStandard?: () => void;
}

export function ViewChip({
  isPersonal,
  hasPersonalView,
  isConfigurator = false,
  onChangeView,
  onResetPersonal,
  onSaveAsStandard,
}: ViewChipProps) {
  // Hide the chip entirely when there's nothing to switch to or indicate
  // (clean Standard state with no customization). The first-time warning
  // banner is what teaches the user about the feature.
  if (!isPersonal && !hasPersonalView && !isConfigurator) return null;

  // Standard mode with no personal yet — render a passive label (only for Configurators).
  const dimChip = !isPersonal && !hasPersonalView;

  return (
    <Dropdown className="relative inline-flex">
      <Dropdown.Trigger
        className={`flex items-center gap-1.5 h-7 px-2.5 text-[12px] font-medium rounded-full border transition-colors ${
          isPersonal
            ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
            : dimChip
            ? 'bg-transparent text-[#9CA3AF] border-[#E4E7EC] hover:bg-[#F9FAFB]'
            : 'bg-[#F2F4F7] text-[#637083] border-transparent hover:bg-[#E4E7EC]'
        }`}
      >
        {isPersonal ? <User className="w-3 h-3" /> : <Layers className="w-3 h-3" />}
        <span>{isPersonal ? 'Personal' : 'Standard'}</span>
        <ChevronDown className="w-3 h-3 opacity-70" />
      </Dropdown.Trigger>
      <Dropdown.Content
        placement="bottom"
        className="absolute top-full left-0 z-50 mt-1 bg-white border border-[#E4E7EC] rounded-[8px] shadow-lg py-1 min-w-[220px]"
      >
        {/* View options */}
        <button
          type="button"
          onClick={() => onChangeView('standard')}
          className="close-dropdown flex items-start w-full px-3 py-2 text-[13px] text-[#141C24] hover:bg-[#F2F4F7] text-left gap-2"
        >
          {!isPersonal ? (
            <Check className="w-3.5 h-3.5 text-blue-600 mt-0.5 shrink-0" />
          ) : (
            <span className="w-3.5 shrink-0" />
          )}
          <Layers className="w-3.5 h-3.5 text-[#637083] mt-0.5 shrink-0" />
          <div className="flex-1">
            <div className="font-medium">Standard view</div>
            <div className="text-[11px] text-[#9CA3AF]">Organization default</div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onChangeView('personal')}
          disabled={!hasPersonalView}
          title={!hasPersonalView ? 'No personal view yet' : ''}
          className="close-dropdown flex items-start w-full px-3 py-2 text-[13px] text-[#141C24] hover:bg-[#F2F4F7] text-left gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
        >
          {isPersonal ? (
            <Check className="w-3.5 h-3.5 text-blue-600 mt-0.5 shrink-0" />
          ) : (
            <span className="w-3.5 shrink-0" />
          )}
          <User className="w-3.5 h-3.5 text-[#637083] mt-0.5 shrink-0" />
          <div className="flex-1">
            <div className="font-medium">Personal view</div>
            <div className="text-[11px] text-[#9CA3AF]">
              {hasPersonalView ? 'Your customizations' : 'Make a change to create one'}
            </div>
          </div>
        </button>

        {(hasPersonalView || (isConfigurator && isPersonal)) && (
          <div className="border-t border-[#E4E7EC] my-1" />
        )}

        {hasPersonalView && onResetPersonal && (
          <button
            type="button"
            onClick={onResetPersonal}
            className="close-dropdown flex items-center gap-2 w-full px-3 py-2 text-[12px] text-[#637083] hover:bg-[#F2F4F7] hover:text-[#141C24] text-left"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Personal view
          </button>
        )}

        {isConfigurator && isPersonal && onSaveAsStandard && (
          <button
            type="button"
            onClick={onSaveAsStandard}
            className="close-dropdown flex items-center gap-2 w-full px-3 py-2 text-[12px] text-blue-600 hover:bg-blue-50 text-left"
          >
            <BookmarkCheck className="w-3.5 h-3.5" />
            Save as Standard
            <span className="ml-auto text-[10px] text-[#9CA3AF]">Org-wide</span>
          </button>
        )}
      </Dropdown.Content>
    </Dropdown>
  );
}

// ── ColumnManager — drag-and-drop column reorder + visibility toggle ─────────

interface ColumnDescriptor {
  id: string;
  label: string;
  /** Pinned columns are shown as locked and cannot be reordered or hidden. */
  pinned?: boolean;
}

interface ColumnManagerProps {
  columns: ColumnDescriptor[];
  columnOrder: string[];
  /** Per-column visibility map. Missing entries default to visible. */
  columnVisibility?: Record<string, boolean>;
  onColumnOrderChange: (next: string[]) => void;
  onColumnVisibilityChange?: (next: Record<string, boolean>) => void;
  /** Render as a small icon-only trigger (used next to the view chip). */
  iconOnly?: boolean;
}

export function ColumnManager({
  columns,
  columnOrder,
  columnVisibility = {},
  onColumnOrderChange,
  onColumnVisibilityChange,
  iconOnly = false,
}: ColumnManagerProps) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<'above' | 'below'>('above');

  // Compute the rendered order: pinned first (in column-array order), then unpinned per columnOrder
  const pinnedCols = columns.filter(c => c.pinned);
  const unpinnedOrder = (columnOrder.length > 0)
    ? columnOrder.filter(id => columns.find(c => c.id === id && !c.pinned))
    : columns.filter(c => !c.pinned).map(c => c.id);

  // Append any unpinned columns missing from columnOrder
  columns
    .filter(c => !c.pinned && !unpinnedOrder.includes(c.id))
    .forEach(c => unpinnedOrder.push(c.id));

  const handleDragStart = (id: string) => (e: React.DragEvent) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
    // Required for Firefox
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (id: string) => (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedId === id) return;
    setDropTargetId(id);
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const halfway = rect.top + rect.height / 2;
    setDropPosition(e.clientY < halfway ? 'above' : 'below');
  };

  const handleDragLeave = (id: string) => () => {
    if (dropTargetId === id) setDropTargetId(null);
  };

  const handleDrop = (id: string) => (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedId || draggedId === id) {
      setDraggedId(null);
      setDropTargetId(null);
      return;
    }

    const next = [...unpinnedOrder];
    const fromIdx = next.indexOf(draggedId);
    if (fromIdx === -1) {
      setDraggedId(null);
      setDropTargetId(null);
      return;
    }
    next.splice(fromIdx, 1);

    let toIdx = next.indexOf(id);
    if (dropPosition === 'below') toIdx += 1;
    next.splice(toIdx, 0, draggedId);

    onColumnOrderChange([...pinnedCols.map(c => c.id), ...next]);
    setDraggedId(null);
    setDropTargetId(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDropTargetId(null);
  };

  const isVisible = (id: string) => columnVisibility[id] !== false;

  const toggleVisibility = (id: string) => {
    if (!onColumnVisibilityChange) return;
    onColumnVisibilityChange({ ...columnVisibility, [id]: !isVisible(id) });
  };

  return (
    <Dropdown className="relative">
      <Dropdown.Trigger
        className={
          iconOnly
            ? 'flex items-center justify-center w-7 h-7 text-[#637083] hover:bg-[#F2F4F7] rounded-md transition-colors'
            : 'flex items-center gap-1.5 h-9 px-3 text-[12px] font-medium text-[#141C24] border border-[#E4E7EC] rounded-[8px] bg-white hover:bg-[#F9FAFB] transition-colors'
        }
        aria-label={iconOnly ? 'Customize columns' : undefined}
      >
        <Settings2 className="w-3.5 h-3.5 text-[#637083]" />
        {!iconOnly && 'Columns'}
      </Dropdown.Trigger>
      <Dropdown.Content
        placement="bottom"
        className="absolute top-full left-0 z-50 mt-1 bg-white border border-[#E4E7EC] rounded-[8px] shadow-lg py-2 min-w-[280px] max-h-[440px] overflow-y-auto"
      >
        <div className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
          Show / hide · Drag to reorder
        </div>

        {/* Pinned columns — locked, shown for context */}
        {pinnedCols.length > 0 && (
          <div className="py-1">
            {pinnedCols.map(col => (
              <div
                key={col.id}
                className="flex items-center gap-2 px-3 py-2 opacity-60"
              >
                <Lock className="w-3.5 h-3.5 text-[#9CA3AF]" />
                <span className="text-[13px] text-[#637083] flex-1">{col.label}</span>
                <span className="text-[10px] text-[#9CA3AF] uppercase">Locked</span>
              </div>
            ))}
            <div className="border-t border-[#E4E7EC] my-1" />
          </div>
        )}

        {/* Reorderable columns — visibility checkbox + drag handle */}
        <div className="py-1">
          {unpinnedOrder.map((id) => {
            const col = columns.find(c => c.id === id);
            if (!col) return null;
            const visible = isVisible(id);
            const isDragging = draggedId === id;
            const isDropTarget = dropTargetId === id && draggedId !== id;
            return (
              <div
                key={id}
                draggable
                onDragStart={handleDragStart(id)}
                onDragOver={handleDragOver(id)}
                onDragLeave={handleDragLeave(id)}
                onDrop={handleDrop(id)}
                onDragEnd={handleDragEnd}
                className={`relative flex items-center gap-2 px-3 py-1.5 select-none transition-colors ${
                  isDragging ? 'opacity-30' : 'hover:bg-[#F9FAFB]'
                }`}
              >
                {isDropTarget && dropPosition === 'above' && (
                  <div className="absolute left-2 right-2 top-0 h-0.5 bg-blue-500 rounded-full pointer-events-none" />
                )}

                {/* Visibility checkbox */}
                <button
                  type="button"
                  onClick={() => toggleVisibility(id)}
                  className={`shrink-0 w-[18px] h-[18px] flex items-center justify-center rounded-[4px] border transition-colors ${
                    visible
                      ? 'bg-blue-600 border-blue-600'
                      : 'bg-white border-[#D0D5DD] hover:border-[#1D4ED8]'
                  }`}
                  aria-label={visible ? 'Hide column' : 'Show column'}
                >
                  {visible && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                </button>

                <span className={`text-[13px] flex-1 truncate ${visible ? 'text-[#141C24]' : 'text-[#9CA3AF]'}`}>
                  {col.label}
                </span>

                {/* Drag handle (icon serves as visual affordance; whole row is draggable) */}
                <GripVertical className="w-3.5 h-3.5 text-[#9CA3AF] shrink-0 cursor-grab active:cursor-grabbing" />

                {isDropTarget && dropPosition === 'below' && (
                  <div className="absolute left-2 right-2 bottom-0 h-0.5 bg-blue-500 rounded-full pointer-events-none" />
                )}
              </div>
            );
          })}
        </div>
      </Dropdown.Content>
    </Dropdown>
  );
}

// ── Legacy default export (kept for any callers using the old name) ──────────
export const GridViewToggle = ViewChip;
