import React, { useState, useEffect, useMemo, useCallback } from 'react';
import SideDrawer from '../../../../common/components/SideDrawer';
import RangeSlider from '../../../../common/components/RangeSlider';
import MultiSelectFilter from '../../../../common/components/MultiSelectFilter';
import MultiSelectDropDown from '../../../../common/components/MultiSelectDropDown';
import DateRangeFilter from '../../insights/opportunities/components/DateRangeFilter';
import SearchBox from '../../../../common/components/SearchBox';

interface VerticalFilterViewProps {
    isOpen: boolean;
    onClose: () => void;
    configuration: any[];
    verticalFilters: Record<string, any> | null;
    defaultFilters: Record<string, any>;
    onApply: (filters: Record<string, any>) => void;
}

const VerticalFilterView: React.FC<VerticalFilterViewProps> = ({
    isOpen,
    onClose,
    configuration,
    verticalFilters,
    defaultFilters,
    onApply,
}) => {
    // Local copy of filters for editing within the drawer
    const [localFilters, setLocalFilters] = useState<Record<string, any>>({});
    const [isAnyAttributeChanged, setIsAnyAttributeChanged] = useState(false);
    // Per-config search text for list-type drop-downs
    const [listSearchTexts, setListSearchTexts] = useState<Record<string, string>>({});

    // Sync local state every time the drawer opens
    useEffect(() => {
        if (isOpen && verticalFilters) {
            setLocalFilters(structuredClone(verticalFilters));
            setIsAnyAttributeChanged(false);
            setListSearchTexts({});
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    // Sorted filterable configs (memoised to avoid re-sorting every render)
    const filterableConfigs = useMemo(() => {
        if (!configuration) return [];
        return [...configuration]
            .filter((c: any) => c.allow_in_side_filter)
            .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));
    }, [configuration]);

    // Whether local state matches the defaults (controls Reset button)
    const isAtDefaultState = useMemo(() => {
        if (!defaultFilters || Object.keys(localFilters).length === 0) return true;
        return JSON.stringify(localFilters) === JSON.stringify(defaultFilters);
    }, [localFilters, defaultFilters]);

    /* ── Handlers ─────────────────────────────────────────────────────── */

    const handleRangeChange = useCallback(
        (path: string, values: { minValue: number; maxValue: number }) => {
            setLocalFilters((prev) => ({
                ...prev,
                [path]: { from: values.minValue, to: values.maxValue },
            }));
            setIsAnyAttributeChanged(true);
        },
        [],
    );

    const handleDateChange = useCallback(
        (path: string, field: 'dateFrom' | 'dateTo', date: Date | null) => {
            setLocalFilters((prev) => ({
                ...prev,
                [path]: { ...prev[path], [field]: date },
            }));
            setIsAnyAttributeChanged(true);
        },
        [],
    );

    const handleStringChange = useCallback((path: string, value: string) => {
        setLocalFilters((prev) => ({ ...prev, [path]: value }));
        setIsAnyAttributeChanged(true);
    }, []);

    /** Handles checkbox-item updates for non-boolean lists. Supports functional updates from MultiSelectDropDown. */
    const handleListChange = useCallback(
        (path: string, items: any[] | ((prev: any[]) => any[])) => {
            setLocalFilters((prev) => {
                const newItems = typeof items === 'function' ? items(prev[path] ?? []) : items;
                return { ...prev, [path]: newItems };
            });
            setIsAnyAttributeChanged(true);
        },
        [],
    );

    /** Handles selection change for boolean-type lists (MultiSelectFilter). */
    const handleBooleanChange = useCallback((path: string, items: any[]) => {
        setLocalFilters((prev) => ({ ...prev, [path]: items }));
        setIsAnyAttributeChanged(true);
    }, []);

    const handleListSearchChange = useCallback((path: string, text: string) => {
        setListSearchTexts((prev) => ({ ...prev, [path]: text }));
    }, []);

    const handleReset = useCallback(() => {
        if (defaultFilters) {
            setLocalFilters(structuredClone(defaultFilters));
            setListSearchTexts({});
            setIsAnyAttributeChanged(true);
        }
    }, [defaultFilters]);

    const handleApply = useCallback(() => {
        if (!isAnyAttributeChanged) return;
        onApply(localFilters);
        setIsAnyAttributeChanged(false);
    }, [isAnyAttributeChanged, localFilters, onApply]);

    /** Filter list items for a given config path by the current search text. */
    const getFilteredListItems = useCallback(
        (path: string, items: any[]) => {
            const search = (listSearchTexts[path] ?? '').toLowerCase();
            if (!search) return items;
            return items.filter((item: any) =>
                (item.label || item.name || '').toLowerCase().includes(search),
            );
        },
        [listSearchTexts],
    );

    /* ── Render ───────────────────────────────────────────────────────── */

    return (
        <SideDrawer isOpen={isOpen} onClose={onClose} title="Filters" width="w-[520px]">
            <div>
                <div className="pl-5 pr-7 pt-6 space-y-[30px] h-[calc(100vh-130px)] overflow-y-auto box-border overflow-x-hidden scroll">
                    {filterableConfigs.length > 0 && (
                        <>
                            {filterableConfigs.map((config: any) => (
                                <React.Fragment key={config.id}>
                                    {/* ── Integer / Float → Range Slider ──────────── */}
                                    {(config.data_type === 'integer' || config.data_type === 'float') && (
                                        <>
                                            <div className="mb-4">
                                                <RangeSlider
                                                    key={`range-${config.id}`}
                                                    title={config.label}
                                                    fixStart={config.min_value ?? 0}
                                                    fixEnd={config.max_value ?? 100}
                                                    mobileStart={localFilters[config.path]?.from}
                                                    mobileEnd={localFilters[config.path]?.to}
                                                    step={config.data_type === 'float' ? 0.1 : 1}
                                                    onChange={(values) => handleRangeChange(config.path, values)}
                                                />
                                            </div>
                                            <div className="border-b border-[#E4E7EC]" />
                                        </>
                                    )}

                                    {/* ── List (non-boolean) → MultiSelectDropDown ── */}
                                    {config.data_type === 'list' && config.formatter !== 'boolean' && (
                                        <>
                                            <MultiSelectDropDown
                                                key={`list-${config.id}`}
                                                filteredItems={getFilteredListItems(
                                                    config.path,
                                                    localFilters[config.path] ?? [],
                                                )}
                                                dataFieldToUseForSelection="label"
                                                uniqueIdFieldToUseForSelection="value"
                                                checkboxItems={localFilters[config.path] ?? []}
                                                setCheckboxItems={(items) =>
                                                    handleListChange(config.path, items as any)
                                                }
                                                typeOfData={config.label}
                                                wantToShowSearchBox={true}
                                                setSearchText={(text) =>
                                                    handleListSearchChange(config.path, text)
                                                }
                                                searchText={listSearchTexts[config.path] ?? ''}
                                                triggerTextCss="h-[32px] text-nowrap border-none"
                                                dropDownContentCss="w-full border-none shadow-none"
                                                dropDownContentTitleCss="text-[16px] leading-6 font-medium text-[#202B37]"
                                                alwaysOpen={true}
                                                hideTrigger={true}
                                            />
                                            <div className="border-b border-[#E4E7EC]" />
                                        </>
                                    )}

                                    {/* ── Boolean list → MultiSelectFilter ────────── */}
                                    {config.data_type === 'list' && config.formatter === 'boolean' && (
                                        <>
                                            <MultiSelectFilter
                                                title={config.label}
                                                attributeId={config.path}
                                                key={`bool-${config.id}`}
                                                state={localFilters[config.path] ?? []}
                                                maxVisibleItems={3}
                                                onSelectionChange={(items) =>
                                                    handleBooleanChange(config.path, items)
                                                }
                                                className="h-fit"
                                            />
                                            <div className="border-b border-[#E4E7EC]" />
                                        </>
                                    )}

                                    {/* ── String → SearchBox ──────────────────────── */}
                                    {config.data_type === 'string' && (
                                        <>
                                            <div className="w-full flex justify-start items-center gap-10 h-8">
                                                <label className="block text-[16px] leading-6 font-medium text-[#202B37] text-nowrap">
                                                    {config.label}
                                                </label>
                                                <SearchBox
                                                    searchText={localFilters[config.path] ?? ''}
                                                    setSearchText={(value) =>
                                                        handleStringChange(config.path, value)
                                                    }
                                                    dataType="Enter keyword"
                                                    needBorder={true}
                                                    needSearchIcon={false}
                                                />
                                            </div>
                                            <div className="border-b border-[#E4E7EC]" />
                                        </>
                                    )}

                                    {/* ── Date → DateRangeFilter ──────────────────── */}
                                    {config.data_type === 'date' && (
                                        <>
                                            <DateRangeFilter
                                                title={config.label}
                                                startDate={localFilters[config.path]?.dateFrom ?? null}
                                                setStartDate={(date) =>
                                                    handleDateChange(config.path, 'dateFrom', date)
                                                }
                                                endDate={localFilters[config.path]?.dateTo ?? null}
                                                setEndDate={(date) =>
                                                    handleDateChange(config.path, 'dateTo', date)
                                                }
                                                isDataChanged={() => setIsAnyAttributeChanged(true)}
                                            />
                                            <div className="border-b border-[#E4E7EC]" />
                                        </>
                                    )}
                                </React.Fragment>
                            ))}
                        </>
                    )}
                </div>

                {/* ── Action buttons ──────────────────────────────────────── */}
                <div className="h-18 bottom-0 left-0 w-full py-4 px-4 border-t border-gray-200 flex justify-end gap-2 box-border bg-white rounded-b-[12px]">
                    <button
                        onClick={handleReset}
                        disabled={isAtDefaultState}
                        className={`w-fit font-medium py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-0 border ${
                            isAtDefaultState
                                ? 'text-gray-400 border-gray-200 cursor-not-allowed bg-gray-50'
                                : 'text-[#202B37] border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                        Reset
                    </button>
                    <button
                        onClick={handleApply}
                        disabled={!isAnyAttributeChanged}
                        className={`${
                            isAnyAttributeChanged
                                ? 'bg-blue-600 hover:bg-blue-700'
                                : 'bg-[#CCE0FF] cursor-not-allowed'
                        } w-fit text-white font-medium py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-0`}
                    >
                        Apply filter
                    </button>
                </div>
            </div>
        </SideDrawer>
    );
};

export default VerticalFilterView;

