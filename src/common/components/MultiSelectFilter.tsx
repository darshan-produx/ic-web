'use client';

import { stat } from 'fs';
import React, { useState, useCallback, useMemo } from 'react';

// Generic interface for selectable items
interface SelectableItem {
    id: string | number;
    name: string;
    selected: boolean;
    [key: string]: any; // Allow additional properties
}

// Props interface for the component
interface MultiSelectFilterProps<T extends SelectableItem> {
    title: string;
    attributeId?: string | number;
    state: T[];
    setState?: React.Dispatch<React.SetStateAction<T[]>>;
    maxVisibleItems?: number;
    className?: string;
    disabled?: boolean;
    showSelectedCount?: boolean;
    onSelectionChange?: (selectedItems: T[], id?: string | number) => void;
    gridColumns?: number; // Optional grid column count
    minColumnWidth?: number; // Minimum column width for auto-responsive grid
}

// Generic Filter Component
const MultiSelectFilter = <T extends SelectableItem>({
    title,
    attributeId,
    state,
    setState,
    maxVisibleItems = 7,
    className = '',
    disabled = false,
    showSelectedCount = true,
    onSelectionChange,
    gridColumns,
    minColumnWidth = 120
}: MultiSelectFilterProps<T>) => {
    const [showAll, setShowAll] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    // Memoized calculations
    const { visibleItems, hasMoreItems, selectedCount, allSelected, noneSelected } = useMemo(() => {
        const visible = showAll ? state : state.slice(0, maxVisibleItems);
        const hasMore = state.length > maxVisibleItems;
        const selected = state.filter(item => item.selected).length;
        const allSel = selected === state.length && state.length > 0;
        const noneSel = selected === 0;

        return {
            visibleItems: visible,
            hasMoreItems: hasMore,
            selectedCount: selected,
            allSelected: allSel,
            noneSelected: noneSel
        };
    }, [state, showAll, maxVisibleItems]);

    // Toggle individual item selection
    const toggleItem = useCallback((id: string | number) => {
        if (disabled) return;

        if (setState) {
            setState(prevState => {
                const newState = prevState.map(item =>
                    item.id === id ? { ...item, selected: !item.selected } : item
                );
                return newState;
            });
        }
        if (onSelectionChange) {
            const updatedItems = state.map(item =>
                item.id === id ? { ...item, selected: !item.selected } : item
            );
            onSelectionChange(updatedItems);
        }
    }, [disabled, setState, onSelectionChange]);

    // Select all items
    const selectAll = useCallback(() => {
        if (disabled || allSelected) return;

        if (setState) {
            setState(prevState => {
                const newState = prevState.map(item => ({ ...item, selected: true }));
                return newState;
            });
        }
        if (onSelectionChange) {
            onSelectionChange(state?.map(item => ({ ...item, selected: true })));
        }
    }, [disabled, allSelected, setState, onSelectionChange]);

    // Clear all selections
    const clearAll = useCallback(() => {
        if (disabled || noneSelected) return;
        if (setState) {
            setState(prevState => { const newState = prevState.map(item => ({ ...item, selected: false })); return newState; });
        }
        if (onSelectionChange) {
            onSelectionChange(state?.map(item => ({ ...item, selected: false })));
        }
    }, [disabled, noneSelected, setState, onSelectionChange]);

    // Toggle show all/less
    const toggleShowAll = useCallback(() => {
        setShowAll(prev => !prev);
    }, []);

    // Handle keyboard navigation
    const handleKeyDown = useCallback((e: React.KeyboardEvent, id: string | number) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleItem(id);
        }
    }, [toggleItem]);

    // Calculate grid columns based on props or container width
    const calculateGridColumns = useCallback(() => {
        if (gridColumns) return gridColumns;
        // Auto-responsive: estimate based on container width and min column width
        // Default to 3 columns for reasonable layout
        return 3;
    }, [gridColumns]);

    const containerClasses = `
    w-full bg-white
    ${disabled ? 'opacity-60 pointer-events-none' : ''}
    ${className}
  `.trim();

    const gridCols = calculateGridColumns();
    const gridColsClass = `grid-cols-${gridCols}`;

    return (
        <div
            // className={containerClasses}
            role="group"
            aria-labelledby={`${title}-filter-title`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`w-full flex flex-col items-start justify-start gap-4 ${className}`}
        >
            {/* Header */}
            <div className="w-[480px] h-4 flex items-center justify-between">
                <h3
                    id={`${title}-filter-title`}
                    className={`text-[16px] font-medium text-[#202B37] m-0 ${className}`}
                >
                    {title}
                </h3>

                {/* Select All / Clear buttons - Only visible on hover */}
                <div className={`flex items-center justify-end gap-2 transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'
                    }`}>
                    <button
                        type="button"
                        onClick={selectAll}
                        disabled={disabled || allSelected}
                        className={`
              px-2 text-xs font-medium
              transition-all duration-200 ease-in-out
              ${allSelected
                                ? 'text-gray-400 cursor-not-allowed'
                                : 'text-blue-600 hover:text-blue-700'
                            }
            `}
                        aria-label={`Select all ${title?.toLowerCase()} options`}
                    >
                        Select all
                    </button>

                    <button
                        type="button"
                        onClick={clearAll}
                        disabled={disabled || noneSelected}
                        className={`
              px-2 text-xs font-medium
              transition-all duration-200 ease-in-out
              ${noneSelected
                                ? 'text-gray-400 cursor-not-allowed'
                                : 'text-blue-600 hover:text-blue-700'
                            }
            `}
                        aria-label={`Clear all ${title?.toLowerCase()} selections`}
                    >
                        Clear
                    </button>
                </div>
            </div>

            {/* Items Grid Container */}
            <div className="">
                {/* Grid Layout */}
                <div className={`w-[480px] grid gap-x-2 gap-y-4 ${gridCols === 1 ? 'grid-cols-1' : gridCols === 2 ? 'grid-cols-2' : gridCols === 3 ? 'grid-cols-3' : gridCols === 4 ? 'grid-cols-4' : gridCols === 5 ? 'grid-cols-5' : 'grid-cols-6'}`}>
                    {visibleItems.map((item) => (
                        <div
                            key={item.id}
                            className={`
                                flex items-center gap-2
                                transition-all duration-200 ease-in-out
                                cursor-pointer
                                
                                ${disabled ? 'cursor-not-allowed opacity-50' : ''}
                            `}
                            onClick={() => toggleItem(item.id)}
                            role="checkbox"
                            tabIndex={disabled ? -1 : 0}
                            aria-checked={item.selected}
                            aria-labelledby={`item-label-${item.id}`}
                            onKeyDown={(e) => handleKeyDown(e, item.id)}
                        >
                            {/* Checkbox */}
                            <div
                                className={`
                                    w-4 h-4 border-[1px] flex-shrink-0
                                    transition-all duration-200 ease-in-out
                                    flex items-center justify-center rounded-md box-border
                                    ${item.selected
                                        ? 'bg-blue-600 border-blue-600 text-white'
                                        : 'border-gray-300 bg-white'
                                    }
                                `}
                            >
                                {item.selected && (
                                    <svg
                                        className="w-3 h-3"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                        aria-hidden="true"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                )}
                            </div>

                            {/* Label with text truncation */}
                            <span
                                id={`item-label-${item.id}`}
                                className="text-[14px] text-[#202B37] text-nowrap truncate flex-1 min-w-0"
                                title={item.name} // Show full text on hover
                            >
                                {item.name}
                            </span>
                        </div>
                    ))}
                    {hasMoreItems && !showAll && (

                        <button
                            type="button"
                            onClick={toggleShowAll}
                            disabled={disabled}
                            className={`
                                w-full flex items-center justify-start gap-2
                                text-[14px] font-normal
                                text-blue-600
                                transition-all duration-200 ease-in-out
                                focus:outline-none focus:ring-none
                                active:bg-blue-200
                                ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                            `}
                            aria-expanded="false"
                            aria-label={`Show ${state.length - maxVisibleItems} more ${title.toLowerCase()} options`}
                        >
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            <span>Show {state.length - maxVisibleItems} more</span>
                        </button>

                    )}
                    {showAll && hasMoreItems && (

                        <button
                            type="button"
                            onClick={toggleShowAll}
                            disabled={disabled}
                            className={`
                                w-full flex items-center justify-start gap-2
                                text-[14px] font-normal
                                text-blue-600
                                transition-all duration-200 ease-in-out
                                focus:outline-none focus:ring-none
                                active:bg-blue-200 underline
                                ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                            `}
                            aria-expanded="true"
                            aria-label={`Show fewer ${title.toLowerCase()} options`}
                        >
                            Show less
                        </button>

                    )}
                </div>
                {/* Selected Count */}
                {/* {showSelectedCount && selectedCount > 0 && (
                    <div className="mt-4 text-center">
                        <span className="text-xs text-gray-500">
                            {selectedCount} of {state.length} selected
                        </span>
                    </div>
                )} */}
            </div>
        </div>
    );
};

export default MultiSelectFilter;