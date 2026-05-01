import React, { CSSProperties, Fragment, useEffect, useRef, useCallback, useState } from 'react';

import {
  Column,
  Table as ReactTable,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  ColumnPinningState,
  ColumnSizingState,
  Header
} from '@tanstack/react-table';

import { useVirtualizer } from '@tanstack/react-virtual';

// Resize Handle Component with Excel-style icon
const ResizeHandle = ({ header, table }: { header: Header<any, unknown>, table: ReactTable<any> }) => {
  return (
    <div
      onMouseDown={header.getResizeHandler()}
      onTouchStart={header.getResizeHandler()}
      className="absolute right-0 top-0 h-full w-[2px] cursor-col-resize select-none touch-none group hover:bg-gray-800 transition-all duration-200"
      style={{
        transform: header.column.getIsResizing() ? 'translateX(0)' : '',
        zIndex: 999,
      }}
    >
      {/* Excel-style resize icon -translate-x-1/2 */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2  opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <svg
          width="4"
          height="16"
          viewBox="0 0 4 16"
          fill="none"
          className="text-gray-800"
        >
          <rect x="0" y="0" width="1" height="16" fill="currentColor" />
          <rect x="3" y="0" width="1" height="16" fill="currentColor" />
        </svg>
      </div>

      {/* Hover area indicator */}
      <div
        className="absolute right-0 top-0 h-full w-1 opacity-0 group-hover:opacity-100 bg-gray-800 transition-all duration-200"
        style={{ width: '2px' }}
      />
    </div>
  );
};

// Column Filter - kept for optional per-column filtering if needed externally
// (currently unused but available for future use)

interface GridViewProps {
  columns?: any;
  data?: any;
  tableclassName?: any;
  divclassName?: any;
  thclassName?: any;
  trclassName?: any;
  tableClass?: any;
  tdclassName?: any;
  theadclassName?: any;
  tbodyclassName?: any;
  isTfoot?: boolean;
  isBordered?: boolean;
  emptyPlaceHolderForTable?: string;
  showColumnFilters?: boolean;
  pinnedColumns?: ColumnPinningState;
  enableColumnPinning?: boolean;
  showPinningControls?: boolean;
  // Infinite scroll / pagination props
  onLoadMore?: () => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  totalRows?: number;
  rowHeight?: number;
}

const GridView = ({
  columns,
  data,
  tableclassName,
  theadclassName,
  divclassName,
  trclassName,
  thclassName,
  tdclassName,
  tbodyclassName,
  isTfoot,
  emptyPlaceHolderForTable,
  showColumnFilters = false,
  pinnedColumns,
  enableColumnPinning = false,
  showPinningControls = false,
  onLoadMore,
  hasNextPage = false,
  isFetchingNextPage = false,
  totalRows,
  rowHeight = 40,
}: GridViewProps) => {
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const [columnPinning, setColumnPinning] = useState<ColumnPinningState>(
    pinnedColumns || { left: [], right: [] }
  );
  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>({});

  const table = useReactTable({
    columns,
    data: data || [],
    state: {
      columnPinning,
      columnSizing
    },
    onColumnPinningChange: setColumnPinning,
    onColumnSizingChange: setColumnSizing,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableSortingRemoval: true,
    enableColumnPinning: enableColumnPinning,
    enableColumnResizing: true,
    columnResizeMode: 'onChange',
  });

  const {
    getHeaderGroups,
    getFooterGroups,
    getRowModel,
  } = table;

  const { rows } = getRowModel();

  // Virtual row rendering for smooth scrolling
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => rowHeight,
    overscan: 10,
  });

  // Infinite scroll: fetch more when near bottom
  const handleScroll = useCallback(() => {
    const container = tableContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    // Trigger load when within 300px of the bottom
    if (scrollHeight - scrollTop - clientHeight < 300 && hasNextPage && !isFetchingNextPage) {
      onLoadMore?.();
    }
  }, [hasNextPage, isFetchingNextPage, onLoadMore]);

  useEffect(() => {
    const container = tableContainerRef.current;
    if (!container) return;
    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Helper function to pin/unpin all columns in a group
  const pinGroupColumns = (header: any, pinSide: 'left' | 'right' | false) => {
    if (header.subHeaders && header.subHeaders.length > 0) {
      header.subHeaders.forEach((subHeader: any) => {
        if (subHeader.column && subHeader.column.getCanPin()) {
          subHeader.column.pin(pinSide);
        }
      });
    }
  };

  // Helper function to check if all columns in a group are pinned to the same side
  const getGroupPinStatus = (header: any): 'left' | 'right' | 'mixed' | false => {
    if (!header.subHeaders || header.subHeaders.length === 0) {
      return false;
    }

    const pinnedStates = header.subHeaders.map((subHeader: any) =>
      subHeader.column?.getIsPinned()
    );

    const leftPinned = pinnedStates.filter((state: any) => state === 'left').length;
    const rightPinned = pinnedStates.filter((state: any) => state === 'right').length;
    const unpinned = pinnedStates.filter((state: any) => !state).length;

    if (leftPinned === header.subHeaders.length) return 'left';
    if (rightPinned === header.subHeaders.length) return 'right';
    if (leftPinned > 0 || rightPinned > 0) return 'mixed';
    return false;
  };

  // Helper function to create virtual group headers for mixed pinning scenarios
  const createVirtualGroupHeaders = (headerGroup: any) => {
    const virtualHeaders: any[] = [];

    headerGroup.headers.forEach((header: any) => {
      if (!header.subHeaders || header.subHeaders.length === 0) {
        // Regular column, add as is
        virtualHeaders.push(header);
        return;
      }

      // Group header with sub-columns
      const leftPinnedChildren = header.subHeaders.filter((subHeader: any) =>
        subHeader.column.getIsPinned() === 'left'
      );
      const rightPinnedChildren = header.subHeaders.filter((subHeader: any) =>
        subHeader.column.getIsPinned() === 'right'
      );
      const unpinnedChildren = header.subHeaders.filter((subHeader: any) =>
        !subHeader.column.getIsPinned()
      );

      // If all children have the same pinning state, add the original header
      if (leftPinnedChildren.length === header.subHeaders.length ||
        rightPinnedChildren.length === header.subHeaders.length ||
        unpinnedChildren.length === header.subHeaders.length) {
        virtualHeaders.push(header);
        return;
      }

      // Mixed state: create virtual group headers for each section
      if (leftPinnedChildren.length > 0) {
        virtualHeaders.push({
          ...header,
          id: `${header.id}-left-pinned`,
          subHeaders: leftPinnedChildren,
          colSpan: leftPinnedChildren.length,
          virtualGroup: true,
          virtualGroupType: 'left-pinned'
        });
      }

      if (unpinnedChildren.length > 0) {
        virtualHeaders.push({
          ...header,
          id: `${header.id}-unpinned`,
          subHeaders: unpinnedChildren,
          colSpan: unpinnedChildren.length,
          virtualGroup: true,
          virtualGroupType: 'unpinned'
        });
      }

      if (rightPinnedChildren.length > 0) {
        virtualHeaders.push({
          ...header,
          id: `${header.id}-right-pinned`,
          subHeaders: rightPinnedChildren,
          colSpan: rightPinnedChildren.length,
          virtualGroup: true,
          virtualGroupType: 'right-pinned'
        });
      }
    });

    return virtualHeaders;
  };

  // Helper function to get styles for virtual group headers
  const getVirtualGroupHeaderStyles = (header: any): CSSProperties => {
    if (!header.virtualGroup) {
      return getGroupHeaderPinningStyles(header);
    }

    const { virtualGroupType, subHeaders } = header;

    // Check if any of the subheaders are non-editable
    const hasNonEditableColumns = subHeaders.some((subHeader: any) =>
      (subHeader.column?.columnDef?.meta as any)?.isEditable === false
    );

    // Use gray background if any column is non-editable, otherwise white
    const backgroundColor = hasNonEditableColumns ? '#f9fafb' : '#ffffff';

    switch (virtualGroupType) {
      case 'left-pinned':
        return {
          left: `${Math.min(...subHeaders.map((subHeader: any) =>
            subHeader.column.getStart('left')
          ))}px`,
          position: 'sticky',
          minWidth: subHeaders.reduce((sum: number, subHeader: any) =>
            sum + subHeader.column.getSize(), 0),
          maxWidth: subHeaders.reduce((sum: number, subHeader: any) =>
            sum + subHeader.column.getSize(), 0),
          width: subHeaders.reduce((sum: number, subHeader: any) =>
            sum + subHeader.column.getSize(), 0),
          zIndex: 15,
          backgroundColor,
        };

      case 'right-pinned':
        return {
          right: `${Math.min(...subHeaders.map((subHeader: any) =>
            subHeader.column.getAfter('right')
          ))}px`,
          position: 'sticky',
          minWidth: subHeaders.reduce((sum: number, subHeader: any) =>
            sum + subHeader.column.getSize(), 0),
          maxWidth: subHeaders.reduce((sum: number, subHeader: any) =>
            sum + subHeader.column.getSize(), 0),
          width: subHeaders.reduce((sum: number, subHeader: any) =>
            sum + subHeader.column.getSize(), 0),
          zIndex: 15,
          backgroundColor,
        };

      case 'unpinned':
      default:
        return {
          position: 'relative',
          minWidth: subHeaders.reduce((sum: number, subHeader: any) =>
            sum + subHeader.column.getSize(), 0),
          maxWidth: subHeaders.reduce((sum: number, subHeader: any) =>
            sum + subHeader.column.getSize(), 0),
          width: subHeaders.reduce((sum: number, subHeader: any) =>
            sum + subHeader.column.getSize(), 0),
          zIndex: 0,
        };
    }
  };

  // Helper function to calculate group header positioning for pinned columns
  const getGroupHeaderPinningStyles = (header: any): CSSProperties => {
    if (!header.subHeaders || header.subHeaders.length === 0) {
      return getCommonPinningStyles(header.column);
    }

    // Check if this is a group header with pinned children
    const leftPinnedChildren = header.subHeaders.filter((subHeader: any) =>
      subHeader.column.getIsPinned() === 'left'
    );
    const rightPinnedChildren = header.subHeaders.filter((subHeader: any) =>
      subHeader.column.getIsPinned() === 'right'
    );
    const unpinnedChildren = header.subHeaders.filter((subHeader: any) =>
      !subHeader.column.getIsPinned()
    );

    // Helper function to check if group has non-editable columns
    const getGroupBackgroundColor = (children: any[]) => {
      const hasNonEditableColumns = children.some((subHeader: any) =>
        (subHeader.column?.columnDef?.meta as any)?.isEditable === false
      );
      return hasNonEditableColumns ? '#f9fafb' : '#ffffff';
    };

    // If all children are pinned to the same side
    if (leftPinnedChildren.length === header.subHeaders.length) {
      return {
        left: `${Math.min(...leftPinnedChildren.map((subHeader: any) =>
          subHeader.column.getStart('left')
        ))}px`,
        position: 'sticky',
        minWidth: leftPinnedChildren.reduce((sum: number, subHeader: any) =>
          sum + subHeader.column.getSize(), 0),
        maxWidth: leftPinnedChildren.reduce((sum: number, subHeader: any) =>
          sum + subHeader.column.getSize(), 0),
        width: leftPinnedChildren.reduce((sum: number, subHeader: any) =>
          sum + subHeader.column.getSize(), 0),
        zIndex: 15,
        backgroundColor: getGroupBackgroundColor(leftPinnedChildren),
      };
    }

    if (rightPinnedChildren.length === header.subHeaders.length) {
      return {
        right: `${Math.min(...rightPinnedChildren.map((subHeader: any) =>
          subHeader.column.getAfter('right')
        ))}px`,
        position: 'sticky',
        minWidth: rightPinnedChildren.reduce((sum: number, subHeader: any) =>
          sum + subHeader.column.getSize(), 0),
        maxWidth: rightPinnedChildren.reduce((sum: number, subHeader: any) =>
          sum + subHeader.column.getSize(), 0),
        width: rightPinnedChildren.reduce((sum: number, subHeader: any) =>
          sum + subHeader.column.getSize(), 0),
        zIndex: 15,
        backgroundColor: getGroupBackgroundColor(rightPinnedChildren),
      };
    }

    // If no children are pinned, show normal width for unpinned columns only
    if (leftPinnedChildren.length === 0 && rightPinnedChildren.length === 0) {
      return {
        position: 'relative',
        minWidth: unpinnedChildren.reduce((sum: number, subHeader: any) =>
          sum + subHeader.column.getSize(), 0),
        maxWidth: unpinnedChildren.reduce((sum: number, subHeader: any) =>
          sum + subHeader.column.getSize(), 0),
        width: unpinnedChildren.reduce((sum: number, subHeader: any) =>
          sum + subHeader.column.getSize(), 0),
        zIndex: 0,
      };
    }

    // Mixed case: some children are pinned
    // For mixed groups, we need to hide the group header as it will overlap
    // The group header will be handled by virtual headers for each section
    return {
      display: 'none', // Hide the original group header
      width: 0,
      minWidth: 0,
      maxWidth: 0,
    };
  };

  // Helper function to get sticky styles for pinned columns
  const getCommonPinningStyles = (column: Column<any>): CSSProperties => {
    const isPinned = column.getIsPinned();
    const isLastLeftPinnedColumn =
      isPinned === 'left' && column.getIsLastColumn('left');
    const isFirstRightPinnedColumn =
      isPinned === 'right' && column.getIsFirstColumn('right');

    // Determine background color based on editable status and pinned state
    const isEditable = (column?.columnDef?.meta as any)?.isEditable;
    let backgroundColor: string | undefined = undefined;

    if (isPinned) {
      backgroundColor = isEditable === false ? '#f9fafb' : '#ffffff';
    }

    return {
      left: isPinned === 'left' ? `${column.getStart('left')}px` : undefined,
      right: isPinned === 'right' ? `${column.getAfter('right')}px` : undefined,
      position: isPinned ? 'sticky' : 'relative',
      minWidth: column.getSize(),
      maxWidth: column.getSize(),
      width: column.getSize(),
      zIndex: isPinned ? 10 : 0,
      backgroundColor,
    };
  };

  return (
    <Fragment>
      <div
        ref={tableContainerRef}
        className={divclassName}
        style={{ overflowX: 'auto', overflowY: 'auto', position: 'relative' }}
      >
        <table
          className={tableclassName}
          style={{
            borderCollapse: 'separate',
            borderSpacing: 0,
            position: 'relative',
            width: table.getCenterTotalSize(),
          }}
        >
          <thead className={theadclassName}>
            {getHeaderGroups()?.map((headerGroup: any) => (
              <tr key={headerGroup.id} className={trclassName}>
                {createVirtualGroupHeaders(headerGroup).map((header: any, headerIndex: number) => {
                  const isGroupHeader = (header.subHeaders && header.subHeaders.length > 0) || header.virtualGroup;
                  const headerStyles = header.virtualGroup
                    ? getVirtualGroupHeaderStyles(header)
                    : isGroupHeader
                      ? getGroupHeaderPinningStyles(header)
                      : getCommonPinningStyles(header.column);

                  return (
                    <th
                      key={header.id}
                      colSpan={header.colSpan}
                      style={{
                        ...headerStyles,
                        zIndex: (headerStyles.position === 'sticky') ? 20 : 15,
                        backgroundColor: headerStyles.backgroundColor || ((!isGroupHeader && (header.column?.columnDef?.meta as any)?.isEditable === false) ? '#f9fafb' : 'inherit'),
                        borderTop: header.depth === 1 ? '1px solid #e5e7eb' : 'none',
                        borderBottom: '1px solid #E4E7EC',
                        borderLeft: headerIndex === 0 ? '1px solid #e5e7eb' : 'none',
                        borderRight: '1px solid #E4E7EC',
                        position: headerStyles.position || 'relative',
                      }}
                      className={` ${header.column?.getCanSort() ? 'cursor-pointer select-none group' : ''} ${thclassName} ${header.getSize() ? 'w-' + header.getSize() + 'px' : ''} ${(!isGroupHeader && (header.column?.columnDef?.meta as any)?.isEditable === false) ? 'bg-gray-50' : ''}`}
                    >
                      {header.isPlaceholder ? null : (
                        <React.Fragment>
                          <div
                            className={`flex items-center justify-between ${isGroupHeader ? 'font-semibold' : ''}`}
                            onClick={header.column?.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                          >
                            {header.virtualGroup ? (
                              <span>
                                {flexRender(
                                  header.column?.columnDef?.header || header.id.replace('-left-pinned', '').replace('-right-pinned', '').replace('-unpinned', ''),
                                  header.getContext()
                                )}
                                {header.virtualGroupType === 'left-pinned'}
                                {header.virtualGroupType === 'right-pinned'}
                              </span>
                            ) : (
                              flexRender(
                                header.column?.columnDef?.header || header.id,
                                header.getContext()
                              )
                            )}
                            {header.column?.getCanSort() && (
                              <span className={`flex flex-col gap-1 mr-2 transition-opacity duration-200 ${header.column.getIsSorted() ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="6" viewBox="0 0 10 6" fill="none" className={`rotate-180 ${header.column.getIsSorted() === 'desc' ? 'opacity-40' : ''}`}>
                                  <path d="M1.07733 0.912031C1.40277 0.586615 1.9304 0.586615 2.25584 0.912031L4.99992 3.65612L7.744 0.912031C8.06942 0.586615 8.59709 0.586615 8.9225 0.912031C9.24792 1.23745 9.24792 1.76511 8.9225 2.09053L5.58917 5.42387C5.26375 5.74928 4.73609 5.74928 4.41067 5.42387L1.07733 2.09053C0.751894 1.76511 0.751894 1.23745 1.07733 0.912031Z" fill="black" />
                                </svg>
                                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="6" viewBox="0 0 10 6" fill="none" className={`${header.column.getIsSorted() === 'asc' ? 'opacity-40' : ''}`}>
                                  <path d="M1.07733 0.912031C1.40277 0.586615 1.9304 0.586615 2.25584 0.912031L4.99992 3.65612L7.744 0.912031C8.06942 0.586615 8.59709 0.586615 8.9225 0.912031C9.24792 1.23745 9.24792 1.76511 8.9225 2.09053L5.58917 5.42387C5.26375 5.74928 4.73609 5.74928 4.41067 5.42387L1.07733 2.09053C0.751894 1.76511 0.751894 1.23745 1.07733 0.912031Z" fill="black" />
                                </svg>
                              </span>
                            )}
                          </div>
                          <span></span>
                          {showColumnFilters && header.column?.getCanFilter() && (
                            <div className="mt-1">
                              {/* Column filter placeholder - implement externally if needed */}
                            </div>
                          )}

                          {/* Add resize handle for columns */}
                          {header.column?.getCanResize() && !isGroupHeader && (
                            <ResizeHandle header={header} table={table} />
                          )}
                        </React.Fragment>
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          {rows.length !== 0 ? (
            <tbody
              className={tbodyclassName}
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                position: 'relative',
              }}
            >
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const row = rows[virtualRow.index];
                return (
                  <tr
                    key={row.id}
                    className={trclassName}
                    data-index={virtualRow.index}
                    ref={(node) => rowVirtualizer.measureElement(node)}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      transform: `translateY(${virtualRow.start}px)`,
                      willChange: 'transform',
                    }}
                  >
                    {row.getVisibleCells().map((cell: any, cellIndex: number) => {
                      return (
                        <td
                          key={cell.id}
                          className={`${tdclassName} ${(cell.column?.columnDef?.meta as any)?.isEditable === false ? 'bg-gray-50' : ''}`}
                          style={{
                            ...getCommonPinningStyles(cell.column),
                            backgroundColor: getCommonPinningStyles(cell.column).backgroundColor || ((cell.column?.columnDef?.meta as any)?.isEditable === false ? '#f9fafb' : undefined),
                            borderTop: 'none',
                            borderBottom: '1px solid #E4E7EC',
                            borderLeft: cellIndex === 0 ? '1px solid #e5e7eb' : 'none',
                            borderRight: '1px solid #E4E7EC',
                            height: `${rowHeight}px`,
                          }}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          ) : (
            <tbody className={`my-2 text-gray-900 ${tbodyclassName}`}>
              <tr className="text-center text-[14px] text-gray-600 py-2">
                <td colSpan={columns?.length} className="py-2 text-center">
                  {emptyPlaceHolderForTable}
                </td>
              </tr>
            </tbody>
          )}

          {isTfoot && (
            <tfoot>
              {getFooterGroups()?.map((footer: any, tfKey: number) => (
                <tr key={tfKey}>
                  {footer.headers?.map((tf: any, key: number) => {
                    const isFooterGroupHeader = tf.subHeaders && tf.subHeaders.length > 0;
                    const footerStyles = isFooterGroupHeader
                      ? getGroupHeaderPinningStyles(tf)
                      : getCommonPinningStyles(tf.column);

                    return (
                      <th
                        key={key}
                        style={{
                          ...footerStyles,
                          backgroundColor: footerStyles.backgroundColor || (footerStyles.position === 'sticky' ?
                            ((tf.column?.columnDef?.meta as any)?.isEditable === false ? '#f9fafb' : '#ffffff') :
                            undefined),
                        }}
                        className="p-3 text-left group-[.bordered]:border group-[.bordered]:border-gray-300"
                      >
                        {flexRender(tf.column?.columnDef?.header || tf.id, tf.getContext())}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </tfoot>
          )}
        </table>
      </div>

      {/* Loading indicator for infinite scroll */}
      {isFetchingNextPage && (
        <div className="flex items-center justify-center py-3">
          <div className="text-sm text-gray-500">Loading more...</div>
        </div>
      )}

      {/* Row count info */}
      {/* {totalRows !== undefined && rows.length > 0 && (
        <div className="flex items-center justify-between px-4 py-2 text-xs text-gray-500 border-t border-gray-200">
          <span>
            Showing {rows.length.toLocaleString()} of {totalRows.toLocaleString()} rows
          </span>
          {!hasNextPage && rows.length >= totalRows && (
            <span>All rows loaded</span>
          )}
        </div>
      )} */}
    </Fragment>
  );
};

export default GridView;