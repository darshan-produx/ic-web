import SearchBox from "../../../../common/components/SearchBox";
import { Toggle } from "../../../../common/components/Toggle";
import { Plus } from "lucide-react";
import SingleSelectDropDown from "../../../../common/components/SingleSelectDropDown";

interface HorizontalFilterViewProps {
    selectedView: any;
    globalSearchText: string;
    setGlobalSearchText: (text: string) => void;
    verticalFiltersViewOn: boolean;
    setVerticalFiltersViewOn: (isOn: boolean) => void;
    setAllFiltersBackToDefault: () => void;
    handleExportSelection: (option: any) => void;
    count: number;
    filters: Array<any>;
    selectedToggle: any;
    setSelectedToggle: (option: any) => void;
    hasAppliedFilters: boolean;
    onCreateNew?: () => void;
    onBulkEdit?: () => void;
    hasSelectedRows?: boolean;
    setSelectedRowIds?: (ids: Set<string>) => void;
    configuration?: any;
}
interface toggleOption {
    id: string;
    label: string;
    path: string;
    formatter?: string;
    use_default?: boolean;
}

const HorizontalFilterView: React.FC<HorizontalFilterViewProps> = ({
    selectedView,
    globalSearchText,
    setGlobalSearchText,
    verticalFiltersViewOn,
    setVerticalFiltersViewOn,
    setAllFiltersBackToDefault,
    handleExportSelection,
    count,
    filters,
    selectedToggle,
    setSelectedToggle,
    hasAppliedFilters,
    onCreateNew,
    onBulkEdit,
    hasSelectedRows = false,
    setSelectedRowIds,
    configuration,
}) => {
    const toggleOptions = filters?.find((filter) => filter.data_type === 'toggle')?.toggle_options || [];

    const exportSelectionOptions = [
        { label: 'Filtered results in .csv', value: 'current_view' },
        { label: 'All results in .csv', value: 'all_data' },
    ];

    const onToggleChange = (option: any) => {
        setSelectedToggle(option);
        setSelectedRowIds && setSelectedRowIds(new Set<string>()); // Clear selected rows when toggle changes
    }

    const allowVerticalFilters = configuration && configuration?.some((config: any) => config.allow_in_side_filter);
    return (
        <div className="w-full flex flex-col items-start justify-start px-6 gap-5 py-5">
            <div className="text-[#141C24] text-[20px] font-medium leading-7">{selectedView?.label || 'User master'}</div>
            <div className="w-full flex items-center justify-between">
                <div className="w-fit h-8 flex items-center justify-start gap-2">
                    <span className="text-[#202B37] text-[12px] font-medium bg-[#F9FAFB] w-10 h-8 flex items-center justify-center rounded-[8px]">{count}</span>

                    {toggleOptions && toggleOptions.length > 0 &&
                        (
                            <Toggle
                                toggleOptions={toggleOptions || []}
                                selectedToggle={selectedToggle}
                                onToggleChange={onToggleChange}
                            />
                        )}
                    <span className="w-[70px]">
                        <SingleSelectDropDown
                            filteredArr={exportSelectionOptions}
                            dataFieldToUseForSelection="label"
                            uniqueIdFieldToUseForSelection="value"
                            handleSelection={handleExportSelection}
                            typeOfData="Export"
                            contentCss="min-w-fit top-[-6px]"
                        />
                    </span>
                    <button
                        type="button"
                        onClick={() => setVerticalFiltersViewOn(!verticalFiltersViewOn)}
                        className={`h-8 bg-white border-[1px]  ${!verticalFiltersViewOn ? ' border-[#CED2DA]' : 'border-gray-500'
                            }  text-[#202B37]  px-3 rounded-[8px] text-[12px] font-medium box-border flex items-center justify-center ${allowVerticalFilters ? 'cursor-pointer' : 'cursor-not-allowed pointer-events-none text-[#9CA3AF]'} `}
                    >
                        {hasAppliedFilters ? 'Filters applied' : 'Filters'}
                    </button>
                    <button
                        type="button"
                        onClick={() => setAllFiltersBackToDefault()}
                        disabled={!hasAppliedFilters}
                        className={`h-8 bg-white border-[1px] border-[#CED2DA] px-3 rounded-[8px] text-[12px] font-medium box-border flex items-center justify-center ${hasAppliedFilters ? 'text-[#202B37] cursor-pointer' : 'text-[#9CA3AF] cursor-not-allowed'}`}
                    >
                        Reset
                        {/* <ReactivateSvgIcon
                            className="w-4 h-4"
                            stroke="#202B37"
                        /> */}
                    </button>
                </div>
                <div className="w-fit h-8 flex items-center justify-end gap-2">
                    {hasSelectedRows && onBulkEdit && (
                        <button
                            type="button"
                            onClick={onBulkEdit}
                            className="h-8 bg-white border-[1px] border-gray-300 text-[#202B37]  px-3 rounded-[8px] text-[12px] font-medium box-border flex items-center justify-center text-nowrap"
                        >
                            {/* <Pencil className="w-3.5 h-3.5" /> */}
                            Bulk Edit
                        </button>
                    )}
                    {/* {hasSelectedRows && onBulkEdit && ( */}


                    {/* )} */}

                    <SearchBox
                        searchText={globalSearchText}
                        setSearchText={setGlobalSearchText}
                        dataType="Search"
                        needBorder={true}
                    />
                    {onCreateNew && (
                        <button
                            type="button"
                            onClick={onCreateNew}
                            className="h-8 bg-white border-[1px] border-gray-300 text-[#202B37]  px-3 rounded-[8px] text-[12px] font-medium box-border flex items-center justify-center text-nowrap gap-1"

                        >
                            <Plus className="w-3.5 h-3.5" />
                            Create New
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HorizontalFilterView;