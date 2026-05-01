'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ColumnDef,
  ExpandedState,
  functionalUpdate,
  OnChangeFn,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { motion } from 'framer-motion';
import { ChevronRight, Loader2 } from 'lucide-react';
import EditableCell from './EditableCell';
import {
  updateCustomerDescription,
  updateUserNotes,
} from '../../../api/customers/customers';
import { MyTeamConfig, TeamRow } from '../types';
import { formatCompactNumber, getMetricValue } from '../../../../common/SupportFunctions';
import { METRIC_COLUMN_ORDER } from '../constants';

type TeamTableProps = {
  rows: TeamRow[];
  config: MyTeamConfig;
  defaultCurrencySymbol?: string;
  defaultCurrency?: string;
  expanded: ExpandedState;
  onExpandedChange: OnChangeFn<ExpandedState>;
  onExpandRow: (row: TeamRow, willExpand: boolean) => Promise<void> | void;
  loadingRowIds: Record<string, boolean>;
  onOpenMetric: (
    row: TeamRow,
    metricKey: 'opportunities' | 'open_signals' | 'task',
  ) => Promise<void> | void;
  scrollToNotes?: boolean;
  onCustomerNavigate?: (customerId: number) => void;
  lastVisitedCustomerId?: number | null;
  searchQuery?: string;
  onLastVisitedCustomerHandled?: () => void;
};

const OPEN_ANIMATION_MS = 300;
const CLOSE_ANIMATION_MS = 155;

const TeamTable: React.FC<TeamTableProps> = ({
  rows,
  config,
  defaultCurrencySymbol,
  defaultCurrency,
  expanded,
  onExpandedChange,
  onExpandRow,
  loadingRowIds,
  onOpenMetric,
  scrollToNotes = false,
  onCustomerNavigate,
  lastVisitedCustomerId,
  searchQuery,
  onLastVisitedCustomerHandled,
}) => {
  const router = useRouter();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [openingRowIds, setOpeningRowIds] = useState<Record<string, boolean>>({});
  const [closingRowIds, setClosingRowIds] = useState<Record<string, boolean>>({});
  const [noteOverrides, setNoteOverrides] = useState<Record<string, string>>({});
  const openTimeoutsRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const collapseTimeoutsRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const getNoteEntityKey = useCallback((row: TeamRow) => {
    if (row.rowType === 'user' && row.user?._id) {
      return `user:${row.user._id}`;
    }
    if (row.customer?.customer_id) {
      return `customer:${row.customer.customer_id}`;
    }
    return `row:${row.id}`;
  }, []);

  const getSavedNoteFromResponse = useCallback(
    (response: any, row: TeamRow, fallbackValue: string) => {
      const payload = response?.data?.data ?? response?.data ?? response ?? {};

      if (row.rowType === 'user') {
        return payload?.supervisor_note ?? fallbackValue;
      }

      return payload?.customer_success_plan ?? payload?.description ?? fallbackValue;
    },
    [],
  );

  useEffect(() => {
    return () => {
      Object.values(openTimeoutsRef.current).forEach((timeoutId) => {
        clearTimeout(timeoutId);
      });
      Object.values(collapseTimeoutsRef.current).forEach((timeoutId) => {
        clearTimeout(timeoutId);
      });
    };
  }, []);

  useEffect(() => {
    if (!scrollToNotes || !scrollContainerRef.current) {
      return;
    }

    scrollContainerRef.current.scrollTo({
      left: scrollContainerRef.current.scrollWidth,
      behavior: 'smooth',
    });
  }, [scrollToNotes]);

  useEffect(() => {
    if (!lastVisitedCustomerId || !scrollContainerRef.current) {
      return;
    }

    const selector = `[data-customer-id="${lastVisitedCustomerId}"]`;
    const targetRow = scrollContainerRef.current.querySelector(selector) as HTMLTableRowElement | null;

    if (!targetRow) {
      return;
    }

    targetRow.scrollIntoView({
      block: 'center',
      inline: 'nearest',
      behavior: 'smooth',
    });

    onLastVisitedCustomerHandled?.();
  }, [rows, lastVisitedCustomerId, onLastVisitedCustomerHandled]);

  useEffect(() => {
    const normalizedQuery = (searchQuery || '').trim().toLowerCase();
    if (!normalizedQuery || !scrollContainerRef.current) {
      return;
    }

    const rowNodes = Array.from(
      scrollContainerRef.current.querySelectorAll('tr[data-row-name]'),
    ) as HTMLTableRowElement[];

    const matchedRow = rowNodes.find((rowNode) =>
      (rowNode.dataset.rowName || '').includes(normalizedQuery),
    );

    if (!matchedRow) {
      return;
    }

    matchedRow.scrollIntoView({
      block: 'center',
      inline: 'nearest',
      behavior: 'smooth',
    });
  }, [rows, searchQuery]);

  const clearOpeningAnimation = (rowId: string) => {
    if (openTimeoutsRef.current[rowId]) {
      clearTimeout(openTimeoutsRef.current[rowId]);
      delete openTimeoutsRef.current[rowId];
    }

    setOpeningRowIds((prev) => {
      if (!prev[rowId]) return prev;
      const next = { ...prev };
      delete next[rowId];
      return next;
    });
  };

  const clearClosingAnimation = (rowId: string) => {
    if (collapseTimeoutsRef.current[rowId]) {
      clearTimeout(collapseTimeoutsRef.current[rowId]);
      delete collapseTimeoutsRef.current[rowId];
    }

    setClosingRowIds((prev) => {
      if (!prev[rowId]) return prev;
      const next = { ...prev };
      delete next[rowId];
      return next;
    });
  };

  const setRowExpanded = (rowId: string, isExpanded: boolean) => {
    onExpandedChange((old) => {
      const previous = functionalUpdate(old, expanded);
      const normalizedPrevious = previous === true ? {} : previous;
      const nextState = { ...normalizedPrevious };

      if (isExpanded) {
        nextState[rowId] = true;
      } else {
        delete nextState[rowId];
      }

      return nextState;
    });
  };

  const startOpenAnimation = (rowId: string) => {
    clearClosingAnimation(rowId);
    clearOpeningAnimation(rowId);

    setOpeningRowIds((prev) => ({ ...prev, [rowId]: true }));
    setRowExpanded(rowId, true);

    openTimeoutsRef.current[rowId] = setTimeout(() => {
      setOpeningRowIds((prev) => {
        const next = { ...prev };
        delete next[rowId];
        return next;
      });
      delete openTimeoutsRef.current[rowId];
    }, OPEN_ANIMATION_MS);
  };

  const getStatusColorClass = (status?: string) => {
    const normalizedStatus = status?.toLowerCase();
    if (normalizedStatus === 'green') return 'bg-[#249782]';
    if (normalizedStatus === 'yellow') return 'bg-[#FFD600]';
    if (normalizedStatus === 'red') return 'bg-[#FF4D4F]';
    return 'bg-[#F2F4F7]';
  };

  const getRowNote = useCallback((row: TeamRow) => {
    const base = row.rowType === 'user'
      ? row.user?.supervisor_note || ''
      : row.customer?.customer_success_plan || '';
    const noteEntityKey = getNoteEntityKey(row);

    if (noteOverrides[noteEntityKey] !== undefined) {
      return noteOverrides[noteEntityKey];
    }

    return base;
  }, [getNoteEntityKey, noteOverrides]);

  const handleSaveNote = useCallback(
    async (row: TeamRow, nextValue: string) => {
      const originalValue = getRowNote(row);
      if (originalValue === nextValue) {
        return;
      }

      const noteEntityKey = getNoteEntityKey(row);
      let savedValue = nextValue;

      if (row.rowType === 'user' && row.user?._id) {
        const response = await updateUserNotes(row.user._id, {
          supervisor_note: nextValue,
        });
        savedValue = getSavedNoteFromResponse(response, row, nextValue);
      } else if (row.customer?.customer_id) {
        const response = await updateCustomerDescription(row.customer.customer_id, {
          description: nextValue,
        });
        savedValue = getSavedNoteFromResponse(response, row, nextValue);
      }

      setNoteOverrides((prev) => ({
        ...prev,
        [noteEntityKey]: savedValue,
      }));
    },
    [getNoteEntityKey, getRowNote, getSavedNoteFromResponse],
  );

  const enabledMetricKeys = useMemo(
    () =>
      METRIC_COLUMN_ORDER.filter(
        (key) => config?.[key]?.enabled,
      ),
    [config],
  );
  const showNotesColumn = config?.notes?.enabled !== false;

  const columns = useMemo<ColumnDef<TeamRow>[]>(() => {
    const nameColumn: ColumnDef<TeamRow> = {
      id: 'name',
      header: 'Name',
      cell: ({ row }) => {
        const original = row.original;
        const isLoading = Boolean(loadingRowIds[original.id]);
        const canExpand = row.getCanExpand();
        const isClosing = Boolean(closingRowIds[row.id]);
        const isExpanded = row.getIsExpanded();
        const isCustomerRow =
          original.rowType === 'customer' || original.rowType === 'group-child';
        const customerId = original.customer?.customer_id;
        const isClickableCustomerCell = isCustomerRow && Boolean(customerId);
        const showStatusStrip =
          isCustomerRow &&
          Boolean(original.customer?.status);

        return (
          <div
            style={{ paddingLeft: `${row.depth * 16}px` }}
            className={`flex items-center gap-2 ${isClickableCustomerCell ? 'group' : ''}`}
          >
            {canExpand ? (
              <button
                type="button"
                onClick={async () => {
                  const willExpand = !row.getIsExpanded();

                  if (willExpand) {
                    if (loadingRowIds[row.id]) {
                      return;
                    }

                    const shouldWaitForData =
                      original.rowType === 'user' &&
                      (!original.hierarchyLoaded || !original.customersLoaded);

                    if (shouldWaitForData) {
                      await onExpandRow(original, true);
                    }

                    startOpenAnimation(row.id);

                    if (!shouldWaitForData) {
                      void onExpandRow(original, true);
                    }

                    return;
                  }

                  if (!row.getIsExpanded() || closingRowIds[row.id]) {
                    return;
                  }

                  clearOpeningAnimation(row.id);

                  setClosingRowIds((prev) => ({ ...prev, [row.id]: true }));
                  const timeoutId = setTimeout(() => {
                    setRowExpanded(row.id, false);
                    setClosingRowIds((prev) => {
                      const next = { ...prev };
                      delete next[row.id];
                      return next;
                    });
                    delete collapseTimeoutsRef.current[row.id];
                  }, CLOSE_ANIMATION_MS);
                  collapseTimeoutsRef.current[row.id] = timeoutId;
                }}
                className="inline-flex h-5 w-5 items-center justify-center rounded hover:bg-gray-200"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ChevronRight
                    className={`h-4 w-4 transform transition-transform ${isClosing ? 'duration-[155ms] ease-in' : 'duration-300 ease-out'} ${isExpanded && !isClosing ? 'rotate-90' : 'rotate-0'}`}
                  />
                )}
              </button>
            ) : (
              <span className="inline-block h-5 w-5" />
            )}

            {showStatusStrip && (
              <span
                className={`inline-block h-[13px] w-[6px] rounded-[10px] ${getStatusColorClass(original.customer?.status)}`}
              />
            )}

            {isClickableCustomerCell ? (
              <span
                className="flex-1 whitespace-nowrap text-sm text-gray-900 transition-colors hover:cursor-pointer hover:text-blue-600"
                onClick={() => {
                  onCustomerNavigate?.(Number(customerId));
                  router.push(`/app/customers/${customerId}`);
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onCustomerNavigate?.(Number(customerId));
                    router.push(`/app/customers/${customerId}`);
                  }
                }}
                role="link"
                tabIndex={0}
              >
                {original.name}
              </span>
            ) : (
              <span className="whitespace-nowrap text-sm text-gray-900">{original.name}</span>
            )}
          </div>
        );
      },
    };

    const metricColumns: ColumnDef<TeamRow>[] = enabledMetricKeys.map((key) => ({
      id: key,
      header: config[key]?.display_name || key,
      cell: ({ row }) => {
        const interactiveMetricKeys = new Set(['opportunities', 'open_signals', 'task']);
        const isInteractiveMetric = interactiveMetricKeys.has(key);
        const metricValue = getMetricValue(row.original, key, defaultCurrencySymbol, undefined, defaultCurrency);
        const isClickable = isInteractiveMetric;

        return isClickable ? (
          <button
            type="button"
            className="-mx-3 -my-2 flex h-10 w-[calc(100%+24px)] items-center px-3 py-2 text-left text-sm text-gray-900 transition-colors hover:cursor-pointer hover:text-blue-600 focus:text-blue-600 focus:outline-none"
            onClick={() => void onOpenMetric(row.original, key as 'opportunities' | 'open_signals' | 'task')}
          >
            {metricValue}
          </button>
        ) : (
          <span className="text-xs text-gray-700">{metricValue}</span>
        );
      },
    }));

    const notesColumn: ColumnDef<TeamRow> = {
      id: 'notes',
      header: 'Notes',
      size: 300,
      cell: ({ row }) => {
        const note = getRowNote(row.original);

        return (
          <EditableCell
            value={note}
            placeholder=""
            onSave={(nextValue) => handleSaveNote(row.original, nextValue)}
            className="w-full whitespace-pre-wrap break-words [overflow-wrap:anywhere]"
          />
        );
      },
    };

    return showNotesColumn
      ? [nameColumn, ...metricColumns, notesColumn]
      : [nameColumn, ...metricColumns];
  }, [
    closingRowIds,
    config,
    defaultCurrencySymbol,
    defaultCurrency,
    enabledMetricKeys,
    getRowNote,
    handleSaveNote,
    loadingRowIds,
    noteOverrides,
    onOpenMetric,
    onExpandRow,
    showNotesColumn,
  ]);

  const table = useReactTable({
    data: rows,
    columns,
    state: { expanded },
    onExpandedChange,
    getRowId: (row) => row.id,
    getSubRows: (row) => row.subRows,
    getRowCanExpand: (row) => row.original.rowType === 'user' || !!row.original.subRows?.length,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  });

  return (
    <div className="rounded-md border border-gray-200 bg-white">
      <div
        ref={scrollContainerRef}
        className="relative max-h-[72vh] overflow-auto [scrollbar-width:thin] [scrollbar-color:#CBD5E1_#F1F5F9] [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-slate-100 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300 hover:[&::-webkit-scrollbar-thumb]:bg-slate-400"
      >
        <table className="w-full min-w-max table-auto border-separate border-spacing-0">
          <thead className="sticky top-0 z-[88] bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={`sticky top-0 h-10 border-b border-gray-200 px-3 py-2 text-left text-xs font-semibold text-gray-700 ${header.column.id === 'name' ? 'left-0 z-[95] whitespace-nowrap bg-[#F9FAFB] shadow-[inset_-1px_0_0_0_#E5E7EB]' : 'z-[90] whitespace-normal break-words border-r border-gray-200 bg-[#F9FAFB]'} ${header.column.id === 'notes' ? 'bg-[#F9FAFB]' : ''} ${header.column.id === 'name' ? '' : 'last:border-r-0'}`}
                    style={
                      header.column.id === 'notes'
                        ? { width: '300px', minWidth: '300px', maxWidth: '300px' }
                        : undefined
                    }
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody>
            {table.getRowModel().rows.map((row) => (
              (() => {
                const parentRows = row.depth > 0 ? row.getParentRows() : [];
                const isRowInsideClosingBranch = parentRows.some(
                  (parentRow) => Boolean(closingRowIds[parentRow.id]),
                );
                const isRowInsideOpeningBranch = parentRows.some(
                  (parentRow) => Boolean(openingRowIds[parentRow.id]),
                );
                const shouldAnimateRow = isRowInsideClosingBranch || isRowInsideOpeningBranch;
                return (
              <tr
                key={row.id}
                data-customer-id={row.original.customer?.customer_id ?? undefined}
                data-row-name={row.original.name?.toLowerCase() || ''}
                className="group hover:bg-gray-50"
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className={`${cell.column.id === 'notes' ? 'min-h-10 px-0 py-0 focus-within:border-blue-400 focus-within:shadow-[inset_0_0_0_1px_#60a5fa]' : 'h-10 px-3 py-2'} border-b align-top text-sm ${cell.column.id === 'name' ? "relative whitespace-nowrap sticky left-0 z-30 bg-white group-hover:bg-white shadow-[inset_-1px_0_0_0_#E5E7EB] border-gray-200" : 'relative z-0 border-r border-gray-200'} ${cell.column.id === 'notes' ? 'bg-white' : cell.column.id === 'name' ? '' : 'bg-[#F9FAFB]'} last:border-r-0`}
                    style={
                      cell.column.id === 'notes'
                        ? { width: '300px', minWidth: '300px', maxWidth: '300px' }
                        : undefined
                    }
                  >
                    <motion.div
                      initial={
                        row.depth > 0 && isRowInsideOpeningBranch
                          ? { x: -6, y: -4 }
                          : false
                      }
                      animate={
                        row.depth > 0
                          ? shouldAnimateRow
                            ? isRowInsideClosingBranch
                              ? { x: -6, y: -4 }
                              : { x: 0, y: 0 }
                            : { x: 0, y: 0 }
                          : undefined
                      }
                      transition={{
                        duration: (isRowInsideClosingBranch ? CLOSE_ANIMATION_MS : OPEN_ANIMATION_MS) / 1000,
                        ease: isRowInsideClosingBranch ? 'easeIn' : 'easeOut',
                      }}
                      style={row.depth > 0 && shouldAnimateRow ? { willChange: 'transform' } : undefined}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </motion.div>
                  </td>
                ))}
              </tr>
                );
              })()
            ))}

            {table.getRowModel().rows.length === 0 && (
              <tr>
                <td
                  className="px-3 py-10 text-center text-sm text-gray-500"
                  colSpan={Math.max(columns.length, 1)}
                >
                  No data found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default TeamTable;
