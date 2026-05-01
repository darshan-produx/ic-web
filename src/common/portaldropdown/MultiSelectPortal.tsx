import React from 'react';
import PortalDropdown from './PortalDropdown';
import SearchBox from './SearchBox';

export interface DropdownOption {
    value: any;
    label: string;
    disabled?: boolean;
    [key: string]: any;
}

interface MultiSelectPortalProps {
    isOpen: boolean;
    triggerRef: React.RefObject<HTMLElement>;
    options: DropdownOption[];
    selectedValues: any[];
    onSelectionChange: (values: any[]) => void;
    onClose: () => void;
    dataFieldToUseForSelection?: string;
    uniqueIdFieldToUseForSelection?: string;
    showSearch?: boolean;
    showSelectAll?: boolean;
    title?: string;
    className?: string;
    optionClassName?: string;
    maxHeight?: number;
    placement?: 'bottom' | 'top' | 'auto';
}

const MultiSelectPortal: React.FC<MultiSelectPortalProps> = ({
    isOpen,
    triggerRef,
    options,
    selectedValues,
    onSelectionChange,
    onClose,
    dataFieldToUseForSelection = 'label',
    uniqueIdFieldToUseForSelection = 'value',
    showSearch = true,
    showSelectAll = true,
    title = 'Options',
    className = '',
    optionClassName = '',
    maxHeight = 320,
    placement = 'bottom'
}) => {
    const [searchText, setSearchText] = React.useState('');
    const [filteredOptions, setFilteredOptions] = React.useState(options);

    React.useEffect(() => {
        if (!searchText.trim()) {
            setFilteredOptions(options);
        } else {
            const filtered = options.filter(option =>
                option[dataFieldToUseForSelection]
                    ?.toString()
                    .toLowerCase()
                    .includes(searchText.toLowerCase())
            );
            setFilteredOptions(filtered);
        }
    }, [searchText, options, dataFieldToUseForSelection]);

    const handleToggleItem = (item: DropdownOption, event: React.MouseEvent) => {
        // Prevent event from bubbling up
        event.stopPropagation();

        if (item.disabled) return;

        const isSelected = selectedValues.includes(item[uniqueIdFieldToUseForSelection]);
        if (isSelected) {
            onSelectionChange(selectedValues.filter(v => v !== item[uniqueIdFieldToUseForSelection]));
        } else {
            onSelectionChange([...selectedValues, item[uniqueIdFieldToUseForSelection]]);
        }
    };

    const selectAll = (event: React.MouseEvent) => {
        event.stopPropagation();
        const allValues = filteredOptions
            .filter(option => !option.disabled)
            .map(item => item[uniqueIdFieldToUseForSelection]);
        onSelectionChange([...new Set([...selectedValues, ...allValues])]);
    };

    const clearAll = (event: React.MouseEvent) => {
        event.stopPropagation();
        const filteredValues = filteredOptions.map(item => item[uniqueIdFieldToUseForSelection]);
        onSelectionChange(selectedValues.filter(v => !filteredValues.includes(v)));
    };

    const selectedCount = selectedValues.length;
    const filteredSelectedCount = filteredOptions.filter(option =>
        selectedValues.includes(option[uniqueIdFieldToUseForSelection])
    ).length;

    const calculateHeight = () => {
        if (maxHeight && filteredOptions.length * 40 + 100 < maxHeight) {
            return showSearch ? filteredOptions.length * 40 + 100 : filteredOptions.length * 40 + 50;
        } else {
            return maxHeight;
        }
    }
    return (
        <PortalDropdown
            isOpen={isOpen}
            triggerRef={triggerRef}
            onClose={onClose}
            maxHeight={calculateHeight()}
            className={className}
            placement={placement}
        >
            <div className="h-full p-3">
                {/* Header */}
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-700">
                        {`(${selectedCount} selected)`}
                    </span>
                    {showSelectAll && (
                        <div className="flex items-center gap-2 text-xs">
                            <button
                                type="button"
                                onClick={selectAll}
                                className="text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed"
                                disabled={filteredSelectedCount === filteredOptions.filter(o => !o.disabled).length}
                            >
                                Select All
                            </button>
                            <span className="text-gray-300">|</span>
                            <button
                                type="button"
                                onClick={clearAll}
                                className="text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed"
                                disabled={filteredSelectedCount === 0}
                            >
                                Clear
                            </button>
                        </div>
                    )}
                </div>

                {/* Search */}
                {showSearch && (
                    <div className="mb-2">
                        <SearchBox
                            onSearch={setSearchText}
                            placeholder="Search options..."
                            className="w-full"
                        />
                    </div>
                )}

                {/* Options list */}
                <div className="max-h-[220px] overflow-y-auto scroll">
                    {filteredOptions.length === 0 ? (
                        <div className="text-sm text-gray-500 text-center py-4">
                            No options found
                        </div>
                    ) : (
                        filteredOptions.map((option, index) => {
                            const isSelected = selectedValues.includes(option[uniqueIdFieldToUseForSelection]);
                            return (
                                <div
                                    key={option[uniqueIdFieldToUseForSelection] || index}
                                    className={`flex items-center ps-2 cursor-pointer ${option.disabled ? 'opacity-50 cursor-not-allowed' : ''
                                        } ${optionClassName}`}
                                    onClick={(e) => handleToggleItem(option, e)}
                                >
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        readOnly
                                        disabled={option.disabled}
                                        className="w-3 h-3 cursor-pointer pointer-events-none"
                                        id={`multi-option-${index}`}
                                    />
                                    <label
                                        className="text-[14px] py-2 ms-2 cursor-pointer flex-1 select-none truncate text-[#202B37]"
                                    >
                                        {option[dataFieldToUseForSelection]}
                                    </label>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </PortalDropdown>
    );
};

export default MultiSelectPortal;