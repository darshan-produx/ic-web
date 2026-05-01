import React from 'react';
import PortalDropdown from './PortalDropdown';
import SearchBox from './SearchBox';
import { DropdownOption } from './MultiSelectPortal';
import { Check } from 'lucide-react';

interface SingleSelectPortalProps {
    isOpen: boolean;
    triggerRef: React.RefObject<HTMLElement>;
    options: DropdownOption[];
    selectedValue: any;
    onSelectionChange: (value: any) => void;
    onClose: () => void;
    dataFieldToUseForSelection?: string;
    uniqueIdFieldToUseForSelection?: string;
    backupUniqueIdFieldToUseForSelection?: string; // New prop for backup unique ID field
    showSearch?: boolean;
    placeholder?: string;
    allowClear?: boolean;
    className?: string;
    optionClassName?: string;
    maxHeight?: number;
    closeOnSelect?: boolean; // New prop to control closing behavior
    placement?: 'bottom' | 'top' | 'auto';
}

const SingleSelectPortal: React.FC<SingleSelectPortalProps> = ({
    isOpen,
    triggerRef,
    options,
    selectedValue,
    onSelectionChange,
    onClose,
    dataFieldToUseForSelection = 'label',
    uniqueIdFieldToUseForSelection = 'value',
    backupUniqueIdFieldToUseForSelection = 'original_value', // Fallback field for selection matching
    showSearch = false,
    placeholder = 'Select option',
    allowClear = false,
    className = '',
    optionClassName = '',
    maxHeight = 320,
    closeOnSelect = true, // Default to true for backward compatibility
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

    const handleSelectItem = (item: DropdownOption) => {
        if (item.disabled) return;

        onSelectionChange(item[uniqueIdFieldToUseForSelection] || item[backupUniqueIdFieldToUseForSelection]);

        // Only close if closeOnSelect is true
        if (closeOnSelect) {
            onClose();
        }
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();

        // Only allow clearing if allowClear is true
        if (!allowClear) return;

        onSelectionChange(null);

        // Only close if closeOnSelect is true
        if (closeOnSelect) {
            onClose();
        }
    };

    const clearAndSearchHeight = () => {
        if (showSearch && (allowClear && selectedValue !== null && selectedValue !== undefined)) {
            return 100;
        } else if (showSearch || (allowClear && selectedValue !== null && selectedValue !== undefined)) {
            return 50;
        } else {
            return 0;
        }
    }
    const calculateHeight = () => {
        if (maxHeight && filteredOptions.length * 40 < maxHeight) {
            return filteredOptions.length * 40 + clearAndSearchHeight() + 20;
        } else {
            return clearAndSearchHeight() === 50 ? maxHeight - 35 : maxHeight;
        }
    }
    return (
        <PortalDropdown
            isOpen={isOpen}
            triggerRef={triggerRef}
            onClose={onClose}
            maxHeight={calculateHeight()}
            // maxHeight={100}
            className={className}
            placement={placement}
        >
            <div className="">
                {/* Header with clear option */}
                {allowClear && selectedValue !== null && selectedValue !== undefined && (
                    <>
                        <div
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm border-b border-gray-100 text-red-600"
                            onClick={handleClear}
                        >
                            Clear selection
                        </div>
                    </>
                )}

                {/* Search */}
                {showSearch && (
                    <div className="p-2 border-b border-gray-100">
                        <SearchBox
                            onSearch={setSearchText}
                            placeholder="Search options..."
                            className="w-full"
                        />
                    </div>
                )}

                {/* Options list */}
                <div className="h-fit py-2 max-h-[240px] overflow-y-auto scroll">
                    {filteredOptions.length === 0 ? (
                        <div className="text-[14px] text-gray-500 text-center py-4 px-3">
                            {searchText ? 'No matching options found' : 'No options available'}
                        </div>
                    ) : (
                        filteredOptions.map((option: any, index: number) => {
                            const isSelected = (selectedValue !== null && selectedValue !== undefined) && (option[uniqueIdFieldToUseForSelection] === selectedValue || option[backupUniqueIdFieldToUseForSelection] === selectedValue);
                            return (
                                <div
                                    key={option[uniqueIdFieldToUseForSelection] || option[backupUniqueIdFieldToUseForSelection] || index}
                                    className={`text-[#202B37] mx-2 px-3 py-2 hover:text-blue-600 cursor-pointer text-[14px] flex items-center justify-between rounded-[8px] ${isSelected ? 'bg-blue-50 text-blue-600' : ''
                                        } ${option.disabled ? 'opacity-50 cursor-not-allowed' : ''
                                        } ${optionClassName}`}
                                    onClick={() => handleSelectItem(option)}
                                >
                                    <span className="flex-1">
                                        {option[dataFieldToUseForSelection]}
                                    </span>
                                    {/* {isSelected && (
                                        <Check className="w-4 h-4 text-blue-600" />
                                    )} */}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </PortalDropdown>
    );
};

export default SingleSelectPortal;