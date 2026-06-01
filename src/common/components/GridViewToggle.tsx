'use client';

import React, { useState } from 'react';
import {
  User, Monitor, Check, Settings2, GripVertical, Lock,
  RotateCcw, BookmarkCheck,
} from 'lucide-react';
import { Dropdown } from '../Dropdown';

// ── ViewToggle — two-icon segmented control (Personal | System) ──────────────

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
  onChangeView,
}: ViewChipProps) {
  // The Personal half is disabled until the user has actually created a
  // Personal view (any change auto-creates it). Hover tooltips explain.
  const personalDisabled = !isPersonal && !hasPersonalView;

  return (
    <div
      className="inline-flex items-center bg-[#F2F4F7] rounded-[8px] p-0.5"
      role="tablist"
    >
      <button
        type="button"
        onClick={() => !personalDisabled && onChangeView('personal')}
        disabled={personalDisabled}
        title={
          personalDisabled
            ? 'Make a change to create a Personal view'
            : isPersonal
              ? 'Currently in Personal view'
              : 'Switch to Personal view'
        }
        className={`w-7 h-7 flex items-center justify-center rounded-[6px] transition-all ${
          isPersonal
            ? 'bg-white text-[#141C24] shadow-[0_1px_2px_rgba(16,24,40,0.08)]'
            : personalDisabled
              ? 'text-[#D0D5DD] cursor-not-allowed'
              : 'text-[#637083] hover:text-[#141C24]'
        }`}
        aria-pressed={isPersonal}
        aria-label="Personal view"
      >
        <User className="w-3.5 h-3.5" strokeWidth={2} />
      </button>
      <button
        type="button"
        onClick={() => onChangeView('standard')}
        title={!isPersonal ? 'Currently in System view' : 'Switch to System view'}
        className={`w-7 h-7 flex items-center justify-center rounded-[6px] transition-all ${
          !isPersonal
            ? 'bg-white text-[#141C24] shadow-[0_1px_2px_rgba(16,24,40,0.08)]'
            : 'text-[#637083] hover:text-[#141C24]'
        }`}
        aria-pressed={!isPersonal}
        aria-label="System view"
      >
        <Monitor className="w-3.5 h-3.5" strokeWidth={2} />
      </button>
    </div>
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
  // View-management actions shown in the popover footer (optional).
  isPersonal?: boolean;
  hasPersonalView?: boolean;
  isConfigurator?: boolean;
  onResetPersonal?: () => void;
  onSaveAsStandard?: () => void;
}

export function ColumnManager({
  columns,
  columnOrder,
  columnVisibility = {},
  onColumnOrderChange,
  onColumnVisibilityChange,
  iconOnly = false,
  isPersonal,
  hasPersonalView,
  isConfigurator,
  onResetPersonal,
  onSaveAsStandard,
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

        {/* View-management actions (only if any are available) */}
        {((hasPersonalView && onResetPersonal) || (isConfigurator && isPersonal && onSaveAsStandard)) && (
          <>
            <div className="py-1">
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
            </div>
            <div className="border-t border-[#E4E7EC]" />
          </>
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
