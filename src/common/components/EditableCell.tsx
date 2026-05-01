import React, { useState, useRef, useEffect } from 'react';
import { GridConfiguration } from '../../app/app/insights/opportunities/types/opportunityTypes';
import GenericFlatpickr from '../../common/components/Flatpickr';
import MultiSelectPortal from '../portaldropdown/MultiSelectPortal';
import SingleSelectPortal from '../portaldropdown/SingleSelectPortal';
import DropdownTrigger from '../portaldropdown/DropdownTrigger';
import { useDropdown } from '../hooks/useDropdown';
import { DropdownOption } from '../portaldropdown/MultiSelectPortal';
import { ChevronDown, X } from 'lucide-react';

interface EditableCellProps {
    value: any;
    config: GridConfiguration;
    rowData: any;
    onSave: (fieldPath: string, newValue: any, rowData: any, configId: string) => Promise<void>;
    itemDetailView: (rowData: any) => void;
    onClickFieldToOpenDetailView?: string;
    clientCurrency?: {
        currency: string;
        currencySymbol: string;
    };
}

const EditableCell: React.FC<EditableCellProps> = ({
    value,
    config,
    rowData,
    onSave,
    itemDetailView,
    clientCurrency,
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(value);
    const [isSaving, setIsSaving] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);
    const editRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const flatpickrRef = useRef<any>(null);
    const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const dropdown = useDropdown();
    // Local state to accumulate multi-select changes without triggering saves/re-renders
    const [localMultiSelectValues, setLocalMultiSelectValues] = useState<any[] | null>(null);

    const handleDropdownToggle = () => {
        // Clear validation error when user starts interacting with dropdown
        if (validationError) {
            setValidationError(null);
        }

        // If closing a multi-select dropdown, go through the proper close handler
        // so accumulated local selections get saved
        if (dropdown.isOpen && config.is_multi_select) {
            handleMultiSelectDropdownClose();
            return;
        }

        dropdown.toggle();
    };

    // Helper function to check if field is required (can_empty defaults to true if not specified)
    const isFieldRequired = () => {
        return config.editable && config.can_empty === false;
    };

    // Helper function to validate the current value
    const validateValue = (valueToValidate: any) => {
        if (!isFieldRequired()) {
            return null; // No validation needed if field can be empty
        }

        // Check if value is empty
        const isEmpty = valueToValidate === null ||
            valueToValidate === undefined ||
            valueToValidate === '' ||
            (Array.isArray(valueToValidate) && valueToValidate.length === 0);

        if (isEmpty) {
            return 'This field is required';
        }

        return null; // No error
    };

    // Cleanup timeouts on unmount
    useEffect(() => {
        return () => {
            if (clickTimeoutRef.current) {
                clearTimeout(clickTimeoutRef.current);
            }
        };
    }, []);

    // Reset edit value and clear validation error when value changes
    useEffect(() => {
        setEditValue(value);
        setValidationError(null);
        // Reset local multi-select state when value changes externally
        // (only if not currently editing — don't overwrite user's in-progress selections)
        if (!isEditing) {
            setLocalMultiSelectValues(null);
        }
    }, [value]);

    // Focus input when entering edit mode and auto-resize if textarea
    useEffect(() => {
        if (isEditing && editRef.current) {
            editRef.current.focus();

            // Auto-resize textarea if it's a textarea element
            if (editRef.current instanceof HTMLTextAreaElement) {
                editRef.current.style.height = 'auto';
                editRef.current.style.height = `${editRef.current.scrollHeight}px`;

                // Set cursor position to the end of the text
                const textLength = editRef.current.value.length;
                editRef.current.setSelectionRange(textLength, textLength);
            } else if (editRef.current instanceof HTMLInputElement) {
                // For input elements, only set cursor to the end if it's not a number type
                // (number inputs don't support setSelectionRange)
                if (editRef.current.type !== 'number') {
                    const textLength = editRef.current.value.length;
                    editRef.current.setSelectionRange(textLength, textLength);
                }
            }
        }
    }, [isEditing]);

    // Handle click outside to save
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;

            // Don't handle click outside if clicking on flatpickr calendar
            if (target && (target as Element).closest?.('.flatpickr-calendar')) {
                return;
            }

            if (containerRef.current && !containerRef.current.contains(target)) {
                // Also ignore clicks inside any portal dropdown content
                const portalDropdown = (target as Element).closest?.('[data-portal-dropdown="true"]');
                if (portalDropdown) {
                    return;
                }

                if (isEditing) {
                    // For multi-select text fields, always use the multi-select close handler
                    if (config.formatter === 'text' && config.is_multi_select && config.list_options && config.list_options.length > 0) {
                        if (!dropdown.isOpen) {
                            handleMultiSelectDropdownClose();
                        }
                    }
                    // For input fields (text, number, currency) without list options
                    else if (config.formatter === 'text' || config.formatter === 'number' || config.formatter === 'currency') {
                        if (!dropdown.isOpen) { // Don't save if dropdown is open
                            // Check for validation errors before allowing save
                            const error = validateValue(editValue);
                            if (error) {
                                // If there's a validation error, prevent saving and stay in edit mode
                                setValidationError(error);
                                return;
                            }
                            handleSave();
                        }
                    }
                    // For datetime fields - they save immediately when date is selected
                    else if (config.formatter === 'datetime') {
                        // Check for validation errors before allowing exit
                        const error = validateValue(value);
                        if (error) {
                            setValidationError(error);
                            return;
                        }
                        // Just exit edit mode - save already happened via onChange or user didn't select anything
                        setIsEditing(false);
                    }
                    // For dropdown fields (boolean, text with options)
                    else if (config.formatter === 'boolean' ||
                        (config.formatter === 'text' && config.list_options && config.list_options.length > 0)) {
                        if (!dropdown.isOpen) { // Don't close edit mode if dropdown is open
                            // Check for validation errors before allowing save
                            const error = validateValue(value); // Use current value, not editValue for dropdowns
                            if (error) {
                                // If there's a validation error, prevent closing edit mode
                                setValidationError(error);
                                return;
                            }
                            // Just exit edit mode - save already happened via dropdown selection or user didn't select anything
                            setIsEditing(false);
                        }
                    }
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isEditing, editValue, value, dropdown.isOpen]);

    const handleSingleClick = () => {
        // Clear any existing timeout
        if (clickTimeoutRef.current) {
            clearTimeout(clickTimeoutRef.current);
            clickTimeoutRef.current = null;
        }

        // For detail view navigation
        if (config?.allow_click_to_open_details_view) {
            itemDetailView(rowData);
            return;
        }


        // Enter edit mode immediately
        setIsEditing(true);

        // Initialize local multi-select state when entering edit mode
        if (config.is_multi_select && config.list_options && config.list_options.length > 0) {
            setLocalMultiSelectValues(Array.isArray(value) ? [...value] : []);
        }

        // For dropdowns and datepickers, open them immediately after entering edit mode
        setTimeout(() => {
            if (config.formatter === 'text' && config.list_options && config.list_options.length > 0) {
                // Open dropdown for text with options
                dropdown.open();
            } else if (config.formatter === 'boolean' && config.list_options && config.list_options.length > 0) {
                // Open dropdown for boolean with options
                dropdown.open();
            } else if (config.formatter === 'datetime') {
                // For datetime, open the flatpickr programmatically
                if (flatpickrRef.current && flatpickrRef.current.flatpickr) {
                    flatpickrRef.current.flatpickr.open();
                }
            }
        }, 10); // Small delay to ensure the component is rendered
    };

    // const handleDoubleClick = () => {
    //     // Clear the single click timeout since this is a double click
    //     if (clickTimeoutRef.current) {
    //         clearTimeout(clickTimeoutRef.current);
    //         clickTimeoutRef.current = null;
    //     }

    //     // Enter edit mode
    //     setIsEditing(true);
    // };

    const handleSave = async () => {
        if (isSaving) return;

        // Validate the value before saving
        const error = validateValue(editValue);
        if (error) {
            setValidationError(error);
            return; // Don't save if validation fails
        }

        setValidationError(null);
        setIsSaving(true);
        try {
            let processedValue = editValue;
            // Handle empty values for required fields vs optional fields FIRST
            if (editValue === '' || editValue === null || editValue === undefined) {
                // If field can be empty (can_empty is true or not specified), send undefined
                if (config.can_empty !== false) {
                    processedValue = undefined;
                } else {
                    // Field is required but empty, this shouldn't happen due to validation
                    // but if it does, keep the empty value for error handling
                    processedValue = editValue;
                }
            } else {
                // Process value based on formatter type ONLY if not empty
                if (config.formatter === 'number' || config.formatter === 'currency') {
                    processedValue = parseFloat(editValue) || 0;
                }
            }
            // Since we're using debounced saving, we don't await the result
            // The debounced function will handle the actual API call
            onSave(config.path, processedValue, rowData, config.id);
            setIsEditing(false);

            // Show brief saving indicator then hide it
            setTimeout(() => {
                setIsSaving(false);
            }, 300);
        } catch (error) {
            console.error('Failed to save:', error);
            // Reset to original value on error
            setEditValue(value);
            setValidationError(null);
            setIsSaving(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            // For text formatter without dropdown options, allow Shift+Enter for new line
            if (config.formatter === 'text' && !config.list_options && e.shiftKey) {
                // Shift+Enter: Allow new line (default behavior)
                return;
            } else {
                // Enter: Save the value for all other cases
                e.preventDefault();
                handleSave();
            }
        } else if (e.key === 'Escape') {
            setEditValue(value);
            setValidationError(null);
            setIsEditing(false);
        }
    };

    const formatDisplayValue = () => {
        if (value === null || value === undefined) return '';

        switch (config.formatter) {
            case 'currency':
                if (typeof value === 'number') {
                    const currency = clientCurrency?.currency || 'USD';
                    const formattedValue = new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: currency,
                        currencyDisplay: 'symbol'
                    }).format(value);
                    return formattedValue;
                }
                return value;

            case 'datetime':
                if (value) {
                    const date = new Date(value);
                    return date.toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                    });
                }
                return '';

            case 'boolean':
                if (config.list_options) {
                    const option = config.list_options.find((opt: any) => opt.value === value || opt.original_value === value);
                    return option ? option.label : value;
                }
                return value ? 'Yes' : 'No';

            case 'text':
                if (config.list_options && !config.is_multi_select) {
                    const option = config.list_options.find((opt: any) => opt.value === value || opt.original_value === value);
                    return option ? option.label : value;
                }
                if (config.list_options && config.is_multi_select && Array.isArray(value)) {
                    const labels = value.map((v: any) => {
                        const option = config.list_options!.find(
                            (opt: any) => opt.value === v || opt.original_value === v
                        );
                        return option ? option.label : null; // return null instead of ''
                    })
                        .filter((label: any) => label); // remove null / empty

                    if (labels.length > 12) {
                        return labels.slice(0, 12).join(', ') + ` +${labels.length - 12} more`;
                    }
                    return labels.join(', ');
                }
                return value;

            case 'number':
                if (typeof value === 'number') {
                    return value.toLocaleString();
                }
                return value;

            case 'action':
            default:
                return value;
        }
    };

    // Unified dropdown save handler for all dropdown types
    const handleDropdownSave = async (newValue: any, dropdownType: 'legacy' | 'single-select' | 'multi-select' = 'legacy') => {
        // Validate the value before saving
        const error = validateValue(newValue);
        if (error) {
            // For multi-select, don't show validation error in state to avoid UI issues
            if (dropdownType !== 'multi-select') {
                setValidationError(error);
            }
            return; // Don't save if validation fails
        }

        setValidationError(null);
        setIsSaving(true);
        try {
            let processedValue = newValue;

            // Handle empty values for required fields vs optional fields
            const isEmpty = newValue === '' ||
                newValue === null ||
                newValue === undefined ||
                (Array.isArray(newValue) && newValue.length === 0);

            if (isEmpty) {
                // If field can be empty (can_empty is true or not specified), send undefined
                if (config.can_empty !== false) {
                    if (dropdownType === 'multi-select') {
                        processedValue = [];
                    } else {
                        processedValue = undefined;
                    }
                } else {
                    // Field is required but empty, this shouldn't happen due to validation
                    // but if it does, keep the empty value for error handling
                    processedValue = newValue;
                }
            }
            // Note: No additional processing needed for dropdown values as they come pre-processed

            // Since we're using debounced saving, we don't await the result
            onSave(config.path, processedValue, rowData, config.id);

            // Handle dropdown closing behavior and exit edit mode
            if (dropdownType === 'legacy' && !config.is_multi_select) {
                // For legacy single select, close dropdown and exit edit mode
                const shouldClose = config.formatter === 'text' || config.formatter === 'boolean';
                if (shouldClose) {
                    dropdown.close();
                    setIsEditing(false);
                }
            } else if (dropdownType === 'single-select') {
                // For single-select: exit edit mode immediately after save
                setIsEditing(false);
            }
            // For multi-select: exit edit mode but keep dropdown open for multiple selections
            else if (dropdownType === 'multi-select') {
                // Don't exit edit mode for multi-select to allow multiple selections
                // Edit mode will be exited when dropdown is closed via onClose handler
            }


            // Show brief saving indicator then hide it
            setTimeout(() => {
                setIsSaving(false);
            }, 300);
        } catch (error) {
            console.error(`Failed to save ${dropdownType} dropdown value:`, error);
            setValidationError(null);
            setIsSaving(false);
        }
    };

    // Wrapper functions for backward compatibility and clarity
    const handleSingleSelectSave = (newValue: any) => handleDropdownSave(newValue, 'single-select');
    const handleMultiSelectSave = (newValue: any) => handleDropdownSave(newValue, 'multi-select');

    // Handler for multi-select local changes (no API call, just local state)
    const handleMultiSelectLocalChange = (newValues: any[]) => {
        setLocalMultiSelectValues(newValues);
    };

    // Dropdown close handlers that exit edit mode
    const handleDropdownClose = () => {
        dropdown.close();
        setIsEditing(false); // Exit edit mode when dropdown closes
    };

    // Multi-select dropdown close: flush accumulated selections as a single save
    const handleMultiSelectDropdownClose = () => {
        if (localMultiSelectValues !== null) {
            const currentValue = Array.isArray(value) ? value : [];
            // Only save if selections actually changed
            const hasChanged =
                localMultiSelectValues.length !== currentValue.length ||
                localMultiSelectValues.some((v: any) => !currentValue.includes(v)) ||
                currentValue.some((v: any) => !localMultiSelectValues.includes(v));

            if (hasChanged) {
                handleDropdownSave(localMultiSelectValues, 'multi-select');
            }
            setLocalMultiSelectValues(null);
        }
        dropdown.close();
        setIsEditing(false);
    };

    // Enhanced datetime save handler that also exits edit mode
    const handleDateTimeSave = (newValue: any) => {
        // Handle the save logic
        handleDropdownSave(newValue, 'single-select');
        // Exit edit mode immediately after date selection
        setIsEditing(false);
    };

    // Convert list_options to DropdownOption format
    const convertToDropdownOptions = (
        options: any[],
        selectedValues: any[]
    ): DropdownOption[] => {
        return options.map((option: any) => {
            const isSelected = selectedValues?.length > 0 && selectedValues.includes(option.value);
            return {
                ...option,
                value: option.value,
                label: option.label,
                disabled: isSelected ? false : option.disabled || false, // Disable option if it's not currently selected (for multi-select) to prevent deselection
            };
        });
    };

    const renderEditingComponent = () => {
        switch (config.formatter) {
            case 'text':
                if (config.list_options && config.list_options.length > 0) {
                    const dropdownOptions = convertToDropdownOptions(config.list_options, Array.isArray(value) ? value : [value]);

                    if (config.is_multi_select) {
                        // Multi-select dropdown with portal
                        // Use local state if user is actively selecting, otherwise use prop value
                        const displayValues = localMultiSelectValues !== null
                            ? localMultiSelectValues
                            : (Array.isArray(value) ? value : []);

                        // Compute trigger display text from local selections
                        const triggerDisplayText = displayValues.length > 0
                            ? (() => {
                                const labels = displayValues.map((v: any) => {
                                    const option = config.list_options!.find(
                                        (opt: any) => opt.value === v || opt.original_value === v
                                    );
                                    return option ? option.label : null; // return null instead of ''
                                }).filter((label: any) => label); // remove null / empty

                                return labels.length > 12
                                    ? labels.slice(0, 12).join(', ') + ` +${labels.length - 12} more`
                                    : labels.join(', ');
                            })()
                            : '';

                        return (
                            <>
                                <DropdownTrigger
                                    ref={dropdown.triggerRef}
                                    value={validationError ? '' : triggerDisplayText}
                                    placeholder={validationError || "Select options"}
                                    isOpen={dropdown.isOpen}
                                    onClick={handleDropdownToggle}
                                    className={`w-full min-h-fit border-none outline-none px-0 py-0 ${validationError ? 'text-red-500 italic' : ''}`}
                                />
                                <MultiSelectPortal
                                    isOpen={dropdown.isOpen}
                                    triggerRef={dropdown.triggerRef}
                                    options={dropdownOptions}
                                    selectedValues={displayValues}
                                    onSelectionChange={handleMultiSelectLocalChange}
                                    onClose={handleMultiSelectDropdownClose}
                                    showSearch={dropdownOptions.length > 5}
                                    title="Select Options"
                                    placement='auto'
                                />
                            </>
                        );
                    } else {
                        // Single select dropdown with portal
                        return (
                            <>
                                <DropdownTrigger
                                    ref={dropdown.triggerRef}
                                    value={validationError ? '' : formatDisplayValue()}
                                    placeholder={validationError || "Select option"}
                                    isOpen={dropdown.isOpen}
                                    onClick={handleDropdownToggle}
                                    className={`w-full h-fit border-none outline-none px-0 py-0 ${validationError ? 'text-red-500 italic' : ''}`}
                                />
                                <SingleSelectPortal
                                    isOpen={dropdown.isOpen}
                                    triggerRef={dropdown.triggerRef}
                                    options={dropdownOptions}
                                    selectedValue={value}
                                    onSelectionChange={handleSingleSelectSave}
                                    onClose={handleDropdownClose}
                                    showSearch={dropdownOptions.length > 5}
                                    allowClear={config.can_empty !== false} // Allow clear if can_empty is not explicitly false
                                    closeOnSelect={true} // Set to false if you want dropdown to stay open after selection
                                    placement='auto'
                                />
                            </>
                        );
                    }
                }
                // Regular text input (textarea for multi-line support)
                return (
                    <textarea
                        ref={editRef as React.RefObject<HTMLTextAreaElement>}
                        value={editValue || ''}
                        onChange={(e) => {
                            setEditValue(e.target.value);
                            // Clear validation error when user starts typing
                            if (validationError) {
                                setValidationError(null);
                            }
                            // Auto-resize textarea
                            const textarea = e.target as HTMLTextAreaElement;
                            textarea.style.height = 'auto';
                            textarea.style.height = `${textarea.scrollHeight}px`;
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder={validationError || config.meta?.placeholder || ''}
                        className={`w-full min-h-fit px-0 py-0 border-none outline-none text-s bg-transparent text-wrap whitespace-pre-wrap resize-none overflow-hidden ${validationError ? 'text-red-500 italic placeholder:text-red-500 placeholder:italic' : ''}`}
                        rows={1}
                        style={{ minHeight: '21px', lineHeight: '21px' }}
                    />
                );

            case 'number':
            case 'currency':
                return (
                    <input
                        ref={editRef as React.RefObject<HTMLInputElement>}
                        type="number"
                        value={editValue || ''}
                        onChange={(e) => {
                            let inputValue = e.target.value;

                            // If input is not empty and is a valid number, check bounds
                            if (inputValue !== '' && !isNaN(parseFloat(inputValue))) {
                                const numericValue = parseFloat(inputValue);

                                // Clamp to min if below minimum
                                if (config.meta?.min !== undefined && numericValue < config.meta.min) {
                                    inputValue = config.meta.min.toString();
                                }
                                // Clamp to max if above maximum
                                else if (config.meta?.max !== undefined && numericValue > config.meta.max) {
                                    inputValue = config.meta.max.toString();
                                }
                            }

                            setEditValue(inputValue);
                            // Clear validation error when user starts typing
                            if (validationError) {
                                setValidationError(null);
                            }
                        }}
                        onKeyDown={handleKeyDown}
                        min={config.meta?.min}
                        max={config.meta?.max}
                        step={config.formatter === 'currency' ? '10' : '1'}
                        placeholder={validationError || ''}
                        className={`w-full h-fit py-0 border-none outline-none text-s bg-transparent ${validationError ? 'text-red-500 italic placeholder:text-red-500 placeholder:italic' : ''}`}
                    />
                );

            case 'boolean':
                if (config.list_options && config.list_options.length > 0) {
                    const dropdownOptions = convertToDropdownOptions(config.list_options, [value]);

                    return (
                        <>
                            <DropdownTrigger
                                ref={dropdown.triggerRef}
                                value={validationError ? '' : formatDisplayValue()}
                                placeholder={validationError || "Select option"}
                                isOpen={dropdown.isOpen}
                                onClick={handleDropdownToggle}
                                className={`w-full h-fit border-none outline-none px-0 py-0 ${validationError ? 'text-red-500 italic' : ''}`}
                            />
                            <SingleSelectPortal
                                isOpen={dropdown.isOpen}
                                triggerRef={dropdown.triggerRef}
                                options={dropdownOptions}
                                selectedValue={value}
                                onSelectionChange={handleSingleSelectSave}
                                onClose={handleDropdownClose}// Use 'value' field for selection matching instead of 'original_value'
                                allowClear={config.can_empty !== false} // Allow clear if can_empty is not explicitly false
                                closeOnSelect={true} // Close dropdown after selection
                                placement='auto'
                            />
                        </>
                    );
                }
                return null;

            case 'datetime':
                return (
                    <div className="w-full h-fit relative flex items-center">
                        <GenericFlatpickr
                            ref={flatpickrRef}
                            value={value ? new Date(value) : null}
                            onChange={handleDateTimeSave}
                            placeholder={validationError || "Select date"}
                            className={`w-full h-[21px] !px-0 py-0 border-none outline-none !text-[14px] bg-transparent !placeholder:text-[14px] ${validationError ? '!text-red-500 italic placeholder:italic placeholder:text-red-500' : ''}`}
                            dateFormat="F j, Y"
                            showCalendarIcon={false}
                            showClearIcon={true}
                        />
                        {/* <X className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" /> */}
                    </div>
                );

            default:
                return (
                    <input
                        ref={editRef as React.RefObject<HTMLInputElement>}
                        type="text"
                        value={editValue || ''}
                        onChange={(e) => {
                            setEditValue(e.target.value);
                            // Clear validation error when user starts typing
                            if (validationError) {
                                setValidationError(null);
                            }
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder={validationError || ''}
                        className={`w-full h-fit px-0 py-0 border-none outline-none text-s bg-transparent text-wrap overflow-visible ${validationError ? 'text-red-500 italic placeholder:text-red-500 placeholder:italic' : ''}`}
                    />
                );
        }
    };

    if (!config.editable) {
        return (
            <div ref={containerRef} className="w-full h-full flex items-start">
                <span className="text-wrap whitespace-pre-wrap">{formatDisplayValue()}</span>
            </div>
        );
    }

    return (
        <div ref={containerRef} className={`p-2 w-full h-full flex flex-col ${isEditing ? 'shadow-[inset_0_0_0_2px_#3B82F6]' : ''} box-border`}>
            {isEditing ? (
                <div className="w-full h-fit bg-white flex items-start">
                    {renderEditingComponent()}
                </div>
            ) : (
                <div
                    className="w-full h-full cursor-pointer flex items-start"
                    onClick={handleSingleClick}
                // onDoubleClick={handleDoubleClick}  border-[2px] border-blue-500
                // title={`${config.path?.toLowerCase() === onClickFieldToOpenDetailView?.toLowerCase() ? 'Click to view details, double click to edit' : 'Double click to edit'}`}
                >
                    {isSaving ? (
                        <span className="text-gray-400 italic text-sm">Saving</span>
                    ) : (
                        <div className='flex items-center justify-between w-full h-fit group'
                            title={`${formatDisplayValue()}`}
                        >
                            <span className={`${config?.allow_click_to_open_details_view ? 'text-blue-600' : ''} text-wrap whitespace-pre-wrap align-top flex-1`}>
                                {formatDisplayValue()}
                            </span>
                            {config?.list_options && config?.list_options?.length > 0 && (<ChevronDown
                                className={`w-4 h-4 text-gray-500 text-center flex-shrink-0 transition-transform opacity-0 group-hover:opacity-100 mt-1`}
                            />)}
                            {/* Show validation error for required empty fields */}
                            {isFieldRequired() && (value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) && (
                                <span className="text-red-500 text-xs italic border-none">This field is required</span>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default EditableCell;