import React, { useState, useEffect, useMemo, useCallback } from 'react';
import SideDrawer from '../../../../common/components/SideDrawer';
import SingleSelectDropDown from '../../../../common/components/SingleSelectDropDown';
import MultiSelectDropDown from '../../../../common/components/MultiSelectDropDown';
import GenericFlatpickr from '../../../../common/components/Flatpickr';
import { getAdminViewConfig } from '../../../api/admin/admin';
import { useQuery } from '@tanstack/react-query';
import { Loader } from 'lucide-react';

/* ────────────────────────────────────────────────────────────────────────────
 *  Types
 * ──────────────────────────────────────────────────────────────────────────── */

export type FormType = 'single_edit' | 'bulk_edit' | 'create_new';

export interface FormViewProps {
    isOpen: boolean;
    onClose: () => void;
    viewConfig: any;
    configuration: any[];
    type: FormType;
    onSave: (payload: Record<string, any>) => Promise<void>;
    onCancel: () => void;
    /** Row data — only provided for single_edit */
    data?: Record<string, any> | null;
    /** Row IDs selected for bulk edit */
    selectedIds?: string[];
    /** Whether the save operation is in progress */
    isSaving?: boolean;
    setOpenModal: (modalState: { open: boolean; type: string; content_type: string; header: string; title: string; saveFunc: () => void }) => void;
}

/* ────────────────────────────────────────────────────────────────────────────
 *  Validation helpers
 * ──────────────────────────────────────────────────────────────────────────── */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMAIL_DOMAIN_REGEX = /^(?!@)([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
const NUMBER_ONLY_REGEX = /^-?\d*\.?\d*$/;
const URL_REGEX = /^(https?:\/\/)?(www\.)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$/;

interface FieldError {
    path: string;
    message: string;
}

/**
 * Validate a single field value based on its configuration.
 * Returns an error message string or null if valid.
 */
const validateField = (
    value: any,
    config: any,
    type: FormType,
): string | null => {
    const { formatter, data_type, can_empty } = config;

    // Required check (can_empty === false means required)
    if (can_empty === false) {
        if (value === null || value === undefined || value === '') {
            return `${config.label} is required`;
        }
        if (data_type === 'list' && Array.isArray(value) && value.filter((i: any) => i.selected).length === 0) {
            return `${config.label} is required`;
        }
        if (config.is_support_multi_item && Array.isArray(value) && value.length === 0) {
            return `${config.label} is required`;
        }
    }

    // For multi-item fields, individual items are validated on entry
    if (config.is_support_multi_item) return null;

    // Skip further validation if value is empty and field is optional
    if (value === null || value === undefined || value === '') return null;

    switch (formatter) {
        case 'email':
            if (typeof value === 'string' && !EMAIL_REGEX.test(value)) {
                return 'Please enter a valid email address';
            }
            break;
        case 'email_domain':
            if (typeof value === 'string' && !EMAIL_DOMAIN_REGEX.test(value)) {
                return 'Please enter a valid email domain (e.g. example.com)';
            }
            break;
        case 'url':
            if (typeof value === 'string' && !URL_REGEX.test(value)) {
                return 'Please enter a valid URL (e.g. https://example.com)';
            }
            break;
        case 'number':
        case 'currency':
            if (typeof value === 'string' && value !== '' && !NUMBER_ONLY_REGEX.test(value)) {
                return 'Please enter a valid number';
            }
            break;

        case 'text':
            // For pure text fields (data_type string, not list), warn if only numbers
            if (data_type === 'string' && typeof value === 'string' && value.length > 0) {
                if (/^\d+$/.test(value.trim())) {
                    return 'Numbers not allowed';
                }
            }
            break;

        default:
            break;
    }

    return null;
};

/* ────────────────────────────────────────────────────────────────────────────
 *  Helpers to filter configuration based on form type
 * ──────────────────────────────────────────────────────────────────────────── */

const getFormFields = (configuration: any[], type: FormType): any[] => {
    if (!configuration || configuration.length === 0) return [];

    let filtered: any[];

    switch (type) {
        case 'create_new':
            filtered = configuration.filter((c) => c.allow_in_create_form);
            break;

        case 'single_edit':
            filtered = configuration.filter((c) => c.allow_in_single_edit);
            break;

        case 'bulk_edit':
            filtered = configuration.filter((c) => c.allow_in_bulk_edit && c.editable);
            break;

        default:
            filtered = [];
    }

    // Exclude action / checkbox formatters
    filtered = filtered.filter(
        (c) =>
            c.formatter !== 'action' &&
            c.formatter !== 'checkbox' &&
            c.data_type !== 'action' &&
            c.data_type !== 'checkbox' &&
            c.formatter !== 'pencil' &&
            c.data_type !== 'pencil',

    );

    return filtered.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
};

/**
 * Build initial form values from configuration + optional existing data.
 */
const buildInitialValues = (
    fields: any[],
    type: FormType,
    data?: Record<string, any> | null,
): Record<string, any> => {
    const values: Record<string, any> = {};

    for (const field of fields) {
        const { path, formatter, data_type, list_options } = field;
        const existingValue = data?.[path];

        if (type === 'single_edit' && existingValue !== undefined) {
            // Multi-item string fields (e.g. aliases, email domains)
            if (field.is_support_multi_item) {
                values[path] = Array.isArray(existingValue) ? existingValue : [];
                continue;
            }
            // For list types with multiselect, convert array of values to checkbox items
            if (data_type === 'list' && field.is_multi_select && Array.isArray(existingValue)) {
                const options = (list_options ?? []).map((opt: any) => {
                    const isPreSelected = existingValue.includes(opt.value || opt.original_value);
                    return {
                        ...opt,
                        selected: isPreSelected,
                        // Override disabled to false for pre-selected items so user can deselect them
                        disabled: isPreSelected ? false : (opt.disabled ?? false),
                    };
                });
                values[path] = options;
            } else if (data_type === 'list' && !field.is_multi_select && list_options.length > 0) {
                // Single select — store the raw value
                const opt = list_options.find((o: any) => o.value === existingValue || o.original_value === existingValue);
                values[path] = opt ? opt.value || opt.original_value : null;
            } else if (formatter === 'datetime') {
                values[path] = existingValue ? new Date(existingValue) : null;
            } else {
                values[path] = existingValue;
            }
        } else {
            // Default empty values for create / bulk
            if (field.is_support_multi_item) {
                values[path] = [];
                continue;
            }
            if (data_type === 'list' && field.is_multi_select) {
                values[path] = (list_options ?? []).map((opt: any) => ({
                    ...opt,
                    selected: false,
                }));
            } else if (data_type === 'list' && !field.is_multi_select) {
                values[path] = null;
            } else if (formatter === 'datetime') {
                values[path] = null;
            } else if (formatter === 'number' || formatter === 'currency') {
                values[path] = '';
            } else {
                values[path] = '';
            }
        }
    }

    return values;
};

/* ────────────────────────────────────────────────────────────────────────────
 *  Component
 * ──────────────────────────────────────────────────────────────────────────── */

const FormView: React.FC<FormViewProps> = ({
    isOpen,
    onClose,
    viewConfig,
    configuration,
    type,
    onSave,
    onCancel,
    data,
    selectedIds,
    isSaving = false,
    setOpenModal,
}) => {
    // ── Derived field list ───────────────────────────────────────────────


    // ── Local form state ─────────────────────────────────────────────────
    const [formValues, setFormValues] = useState<Record<string, any>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const [isDirty, setIsDirty] = useState(false);

    // Per-field search text for dropdowns
    const [dropdownSearchTexts, setDropdownSearchTexts] = useState<Record<string, string>>({});

    // Per-field input text for multi-item fields (current typing value)
    const [multiItemInputTexts, setMultiItemInputTexts] = useState<Record<string, string>>({});

    // Bulk edit: track initial values and fields explicitly marked for clearing
    const [initialValues, setInitialValues] = useState<Record<string, any>>({});
    const [markedAsEmpty, setMarkedAsEmpty] = useState<Set<string>>(new Set());

    const {
        data: adminCreateNewViewConfig,
        isLoading: isAdminCreateNewViewConfigLoading,
        isFetching: isAdminCreateNewViewConfigFetching,
    } = useQuery({
        queryKey: ['adminCreateNewViewConfig', viewConfig?.create_new_entity_type],
        queryFn: async (): Promise<any> => getAdminViewConfig(viewConfig?.create_new_entity_type, null),
        enabled: !!viewConfig?.create_new_entity_type && type === 'create_new',
        refetchOnWindowFocus: false,
    });
    // Whether we expect API config for create_new but it hasn't loaded yet
    const isCreateNewConfigLoading = type === 'create_new' && !!viewConfig?.create_new_entity_type && (isAdminCreateNewViewConfigLoading || isAdminCreateNewViewConfigFetching);

    const formFields = useMemo(() => {
        if (type === 'create_new' && adminCreateNewViewConfig?.data?.data?.[0]?.configuration) {
            return getFormFields(adminCreateNewViewConfig?.data?.data?.[0]?.configuration, type);
        }
        return getFormFields(configuration, type);
    }, [configuration, adminCreateNewViewConfig, type]);
    // Initialise form values whenever the drawer opens or data/type changes
    useEffect(() => {
        if (isOpen) {
            const initial = buildInitialValues(formFields, type, data);
            setFormValues(initial);
            setInitialValues(initial);
            setErrors({});
            setTouched({});
            setIsDirty(false);
            setDropdownSearchTexts({});
            setMultiItemInputTexts({});
            setMarkedAsEmpty(new Set());
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, type, data]);

    // Also reinitialise when formFields change (e.g. API config arrives for create_new)
    useEffect(() => {
        if (isOpen && formFields.length > 0) {
            const initial = buildInitialValues(formFields, type, data);
            setFormValues(initial);
            setInitialValues(initial);
            setErrors({});
            setTouched({});
            setIsDirty(false);
            setDropdownSearchTexts({});
            setMultiItemInputTexts({});
            setMarkedAsEmpty(new Set());
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formFields]);

    /* ── Value change handler ────────────────────────────────────────── */

    const handleChange = useCallback(
        (path: string, value: any, config: any) => {
            setFormValues((prev) => ({ ...prev, [path]: value }));
            setTouched((prev) => ({ ...prev, [path]: true }));
            setIsDirty(true);

            // If field was marked as empty and user is now providing a value, unmark it
            if (type === 'bulk_edit') {
                setMarkedAsEmpty((prev) => {
                    if (prev.has(path)) {
                        const next = new Set(prev);
                        next.delete(path);
                        return next;
                    }
                    return prev;
                });
            }

            // Validate on change
            const error = validateField(value, config, type);
            setErrors((prev) => {
                const next = { ...prev };
                if (error) {
                    next[path] = error;
                } else {
                    delete next[path];
                }
                return next;
            });
        },
        [type],
    );

    /* ── Bulk edit helpers ────────────────────────────────────────────── */

    /** Get the "empty" value for a field based on its config */
    const getEmptyValue = useCallback((config: any): any => {
        const { data_type, formatter, is_multi_select, is_support_multi_item, list_options } = config;
        if (is_support_multi_item) return [];
        if (data_type === 'list' && is_multi_select) {
            return (list_options ?? []).map((opt: any) => ({ ...opt, selected: false }));
        }
        if (data_type === 'list' && !is_multi_select) return null;
        if (formatter === 'datetime') return null;
        return '';
    }, []);

    /** Check if a field's current value is the same as its initial value */
    const isValueEqualToInitial = useCallback((path: string, currentValue: any, config: any): boolean => {
        const initial = initialValues[path];
        if (config.data_type === 'list' && config.is_multi_select) {
            const currentSelected = Array.isArray(currentValue)
                ? currentValue.filter((i: any) => i.selected).map((i: any) => String(i.value)).sort()
                : [];
            const initialSelected = Array.isArray(initial)
                ? initial.filter((i: any) => i.selected).map((i: any) => String(i.value)).sort()
                : [];
            return JSON.stringify(currentSelected) === JSON.stringify(initialSelected);
        }
        if (config.is_support_multi_item) {
            return JSON.stringify(Array.isArray(currentValue) ? currentValue : []) === JSON.stringify(Array.isArray(initial) ? initial : []);
        }
        return currentValue === initial;
    }, [initialValues]);

    /** Check if a field has actual modifications (value differs from initial or is marked empty) */
    const isFieldModified = useCallback((path: string): boolean => {
        if (markedAsEmpty.has(path)) return true;
        if (!touched[path]) return false;
        const config = formFields.find((f) => f.path === path);
        if (!config) return false;
        return !isValueEqualToInitial(path, formValues[path], config);
    }, [markedAsEmpty, touched, formFields, formValues, isValueEqualToInitial]);

    /** Undo all changes on a field — revert to initial value */
    // const handleUndoField = useCallback((path: string) => {
    //     const initial = initialValues[path];
    //     setFormValues((prev) => ({ ...prev, [path]: initial }));
    //     setTouched((prev) => ({ ...prev, [path]: false }));
    //     setMarkedAsEmpty((prev) => {
    //         const next = new Set(prev);
    //         next.delete(path);
    //         return next;
    //     });
    //     setErrors((prev) => {
    //         const next = { ...prev };
    //         delete next[path];
    //         return next;
    //     });
    // }, [initialValues]);

    /** Toggle "set to empty" for a field */
    const handleToggleEmpty = useCallback((path: string, config: any) => {
        setMarkedAsEmpty((prev) => {
            const next = new Set(prev);
            if (next.has(path)) {
                // Unmark → revert to initial
                next.delete(path);
                setFormValues((p) => ({ ...p, [path]: initialValues[path] }));
                setTouched((p) => ({ ...p, [path]: false }));
            } else {
                // Mark as empty → set to empty value
                next.add(path);
                const emptyVal = getEmptyValue(config);
                setFormValues((p) => ({ ...p, [path]: emptyVal }));
                setTouched((p) => ({ ...p, [path]: true }));
            }
            return next;
        });
        setErrors((prev) => {
            const next = { ...prev };
            delete next[path];
            return next;
        });
        setIsDirty(true);
    }, [initialValues, getEmptyValue]);

    /** Whether there are actual changes to submit (for bulk edit, accounts for reverted fields) */
    const hasActualChanges = useMemo((): boolean => {
        if (type !== 'bulk_edit') return isDirty;
        if (markedAsEmpty.size > 0) return true;
        for (const field of formFields) {
            if (!touched[field.path]) continue;
            if (!isValueEqualToInitial(field.path, formValues[field.path], field)) return true;
        }
        return false;
    }, [type, isDirty, markedAsEmpty, formFields, formValues, touched, isValueEqualToInitial]);

    /* ── Validate all fields ────────────────────────────────────────── */

    const validateAll = useCallback((): boolean => {
        const newErrors: Record<string, string> = {};
        const newTouched: Record<string, boolean> = {};

        for (const field of formFields) {
            // For bulk_edit, skip validation for fields that haven't been touched
            if (type === 'bulk_edit' && !touched[field.path]) continue;

            const value = formValues[field.path];
            const error = validateField(value, field, type);
            if (error) {
                newErrors[field.path] = error;
            }
            newTouched[field.path] = true;
        }

        // For create_new, validate all required fields even if untouched
        if (type === 'create_new') {
            for (const field of formFields) {
                const value = formValues[field.path];
                const error = validateField(value, field, type);
                if (error) {
                    newErrors[field.path] = error;
                }
                newTouched[field.path] = true;
            }
        }

        setErrors(newErrors);
        setTouched((prev) => ({ ...prev, ...newTouched }));
        return Object.keys(newErrors).length === 0;
    }, [formFields, formValues, type, touched]);

    /* ── Submit ──────────────────────────────────────────────────────── */

    const handleSubmit = useCallback(async () => {
        if (!validateAll()) return;

        // Build the payload
        const payload: Record<string, any> = {};

        for (const field of formFields) {
            const { path, data_type, formatter } = field;
            const value = formValues[path];

            // For bulk edit, only include fields that are actually modified or explicitly marked as empty
            if (type === 'bulk_edit') {
                const isMarkedEmpty = markedAsEmpty.has(path);
                const isTouched = touched[path];
                // Not touched and not marked as empty → skip
                if (!isTouched && !isMarkedEmpty) continue;
                // Touched but value equals initial and not marked as empty → skip (user reverted)
                if (isTouched && !isMarkedEmpty && isValueEqualToInitial(path, value, field)) continue;
            }

            // Multi-item string fields — send as array of strings
            if (field.is_support_multi_item) {
                payload[path] = Array.isArray(value) ? value : [];
                continue;
            }
            // Convert list multi-select back to array of values
            if (data_type === 'list' && field.is_multi_select && Array.isArray(value)) {
                payload[path] = value
                    .filter((item: any) => item.selected)
                    .map((item: any) => item.value);
            } else if (formatter === 'number' || formatter === 'currency') {
                payload[path] = value !== '' && value !== null ? Number(value) : null;
            } else if (formatter === 'datetime') {
                payload[path] = value
                    ? value instanceof Date
                        ? value.toISOString()
                        : value
                    : null;
            } else {
                payload[path] = value;
            }
        }

        // Attach IDs for edit operations
        if (type === 'single_edit' && (data?.[viewConfig?.['unique_id_field']] || data?._id)) {
            payload.ids = [data?.[viewConfig?.['unique_id_field']] || data._id];
        } else if (type === 'bulk_edit' && selectedIds && selectedIds.length > 0) {
            payload.ids = selectedIds;
        }

        // For bulk edit, show confirmation modal before saving
        if (type === 'bulk_edit') {
            const bulkEditConfig = configuration.find((c: any) => c.path === 'bulk_edit');
            const confirmAction = bulkEditConfig?.actions?.find((a: any) => a.type === 'confirmation');
            if (confirmAction?.behavior) {
                const { behavior } = confirmAction;
                setOpenModal({
                    open: true,
                    type: behavior.type || 'CONFIRMATION',
                    content_type: behavior.content_type || 'Update',
                    header: behavior.header || 'Confirm Bulk Update',
                    title: behavior.title || 'Are you sure you want to update all selected items?',
                    saveFunc: async () => {
                        await onSave(payload);
                    },
                });
                return;
            }
        }

        await onSave(payload);
    }, [validateAll, formFields, formValues, type, data, selectedIds, onSave, touched, viewConfig, markedAsEmpty, isValueEqualToInitial, configuration, setOpenModal]);

    /* ── Reset ───────────────────────────────────────────────────────── */

    const handleReset = useCallback(() => {
        const initial = buildInitialValues(formFields, type, data);
        setFormValues(initial);
        setErrors({});
        setTouched({});
        setIsDirty(false);
        setDropdownSearchTexts({});
        setMultiItemInputTexts({});
        setMarkedAsEmpty(new Set());
    }, [formFields, type, data]);

    /* ── Cancel ──────────────────────────────────────────────────────── */

    const handleCancel = useCallback(() => {
        onCancel();
        onClose();
    }, [onCancel, onClose]);

    /* ── Info banner message (bulk edit) ──────────────────────────────── */

    const infoBannerMessage = useMemo(() => {
        if (type === 'bulk_edit' && selectedIds && selectedIds.length > 0) {
            return `Editing ${selectedIds.length} item${selectedIds.length > 1 ? 's' : ''}. Only modified fields will be updated. Use 'Set to empty' to clear the field for all selected items.`;
        }
        return null;
    }, [type, selectedIds]);

    /* ── Dropdown search handler ─────────────────────────────────────── */

    const handleDropdownSearchChange = useCallback((path: string, text: string) => {
        setDropdownSearchTexts((prev) => ({ ...prev, [path]: text }));
    }, []);

    const getFilteredDropdownItems = useCallback(
        (path: string, items: any[]) => {
            const search = (dropdownSearchTexts[path] ?? '').toLowerCase();
            if (!search) return items;
            return items.filter(
                (item: any) =>
                    (item.label || item.name || '').toLowerCase().includes(search),
            );
        },
        [dropdownSearchTexts],
    );

    /* ── Title ────────────────────────────────────────────────────────── */

    const drawerTitle = useMemo(() => {
        switch (type) {
            case 'single_edit':
                return 'Edit';
            case 'bulk_edit':
                return 'Bulk Edit';
            case 'create_new':
                return 'Create new';
            default:
                return 'Form';
        }
    }, [type]);

    const submitLabel = useMemo(() => {
        switch (type) {
            case 'single_edit':
                return 'Save';
            case 'bulk_edit':
                return 'Update';
            case 'create_new':
                return 'Create';
            default:
                return 'Save';
        }
    }, [type]);

    /* ── Render a single field ────────────────────────────────────────── */

    const renderField = useCallback(
        (config: any) => {
            const {
                path,
                label,
                formatter,
                data_type,
                editable,
                edit_condition,
                can_empty,
                list_options,
                is_multi_select,
                is_support_multi_item,
            } = config;
            const value = formValues[path];
            const error = touched[path] ? errors[path] : undefined;
            const isRequired = can_empty === false;

            // For single_edit: non-editable fields are shown as read-only
            const isDisabled = type === 'single_edit' && !editable || (edit_condition ? Object.entries(edit_condition).some(
                ([key, value]) => formValues?.[key] !== value
            ) : false);

            // ── Read-only display for non-editable fields in single_edit ──
            if (isDisabled) {
                const displayValue = (() => {
                    if (is_support_multi_item && Array.isArray(value)) {
                        return value.length > 0 ? value.join(', ') : '—';
                    }
                    if (
                        data_type === 'list' &&
                        is_multi_select &&
                        Array.isArray(value)
                    ) {
                        const labels = value
                            .filter((item: any) => item.selected)
                            .map((item: any) => item.label || item.name || null) // ❗ use null
                            .filter(Boolean); // ✅ remove empty values

                        return labels.length ? labels.join(', ') : '—';
                    }
                    if (data_type === 'list' && !is_multi_select && list_options) {
                        const opt = list_options.find(
                            (o: any) => o.value === value,
                        );
                        return opt?.label || value || '—';
                    }
                    if (formatter === 'datetime' && value) {
                        return new Date(value).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                        });
                    }
                    return value ?? '—';
                })();

                return (
                    <div key={path} className="flex flex-col gap-[6px]">
                        <label className="text-[14px] font-medium text-[#344051]">
                            {label}
                        </label>
                        <div className="w-full py-[10px] px-[14px] bg-[#F9FAFB] border border-[#E4E7EC] rounded-[8px] text-[14px] text-[#637083] cursor-not-allowed">
                            {displayValue}
                        </div>
                    </div>
                );
            }

            // ── Multi-item string input (chips) ─────────────────────────
            if (is_support_multi_item) {
                const items: string[] = Array.isArray(value) ? value : [];
                const inputText = multiItemInputTexts[path] ?? '';

                const validateSingleItem = (item: string): string | null => {
                    if (!item) return 'Value cannot be empty';
                    if (formatter === 'email' && !EMAIL_REGEX.test(item)) {
                        return 'Please enter a valid email address';
                    }
                    if (formatter === 'email_domain' && !EMAIL_DOMAIN_REGEX.test(item)) {
                        return 'Please enter a valid email domain (e.g. example.com)';
                    }
                    if (formatter === 'url' && !URL_REGEX.test(item)) {
                        return 'Please enter a valid URL (e.g. https://example.com)';
                    }
                    return null;
                };

                const addItem = (raw: string) => {
                    const trimmed = raw.trim().replace(/,$/g, '').trim();
                    if (!trimmed) return;
                    const itemError = validateSingleItem(trimmed);
                    if (itemError) {
                        setErrors((prev) => ({ ...prev, [path]: itemError }));
                        return;
                    }
                    if (items.includes(trimmed)) {
                        setErrors((prev) => ({ ...prev, [path]: `"${trimmed}" already added` }));
                        return;
                    }
                    const newItems = [...items, trimmed];
                    handleChange(path, newItems, config);
                    setMultiItemInputTexts((prev) => ({ ...prev, [path]: '' }));
                    // Clear any previous error for this field
                    setErrors((prev) => {
                        const next = { ...prev };
                        delete next[path];
                        return next;
                    });
                };

                const removeItem = (index: number) => {
                    const newItems = items.filter((_, i) => i !== index);
                    handleChange(path, newItems, config);
                };

                return (
                    <div key={path} className="flex flex-col gap-[6px]">
                        <label className="text-[14px] font-medium text-[#344051]">
                            {label}
                            {isRequired && (
                                <span className="text-red-500 ml-0.5">*</span>
                            )}
                        </label>
                        <div
                            className={`flex flex-wrap items-center gap-1 border rounded-[8px] px-[10px] py-[6px] min-h-[42px] bg-white ${error ? 'border-red-400' : 'border-[#CED2DA]'
                                }`}
                        >
                            {items.map((item, index) => (
                                <div
                                    key={`${item}-${index}`}
                                    className="flex items-center gap-1.5 rounded-[35px] py-[2px] px-2 bg-gray-200"
                                >
                                    <span className="text-[12px] text-gray-800 font-semibold whitespace-nowrap">
                                        {item}
                                    </span>
                                    <button
                                        type="button"
                                        className="flex items-center"
                                        aria-label={`Remove ${item}`}
                                        onClick={() => removeItem(index)}
                                    >
                                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M7.31706 0.650002L0.650391 7.31667M0.650391 0.650002L7.31706 7.31667" stroke="black" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">
                                            </path>
                                        </svg>
                                    </button>
                                </div>
                            ))}
                            <input
                                type="text"
                                value={inputText}
                                onChange={(e) => {
                                    setMultiItemInputTexts((prev) => ({ ...prev, [path]: e.target.value }));
                                    // Clear error as user types
                                    if (errors[path]) {
                                        setErrors((prev) => {
                                            const next = { ...prev };
                                            delete next[path];
                                            return next;
                                        });
                                    }
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ',') {
                                        e.preventDefault();
                                        addItem(inputText);
                                    } else if (e.key === 'Backspace' && !inputText && items.length > 0) {
                                        removeItem(items.length - 1);
                                    }
                                }}
                                onBlur={() => {
                                    if (inputText.trim()) {
                                        addItem(inputText);
                                    }
                                }}
                                placeholder={items.length === 0 ? `Enter ${label.toLowerCase()}` : ''}
                                className="flex-1 min-w-[80px] py-[4px] text-[14px] font-normal text-[#141C24] outline-none bg-transparent placeholder:text-[14px] placeholder:text-[#637083] placeholder:font-normal"
                            />
                        </div>
                        {error && (
                            <span className="text-red-500 text-[12px]">
                                {error}
                            </span>
                        )}
                    </div>
                );
            }

            // ── List data type: dropdowns ─────────────────────────────────
            if (data_type === 'list') {
                const options = list_options ?? [];

                // Multi-select dropdown
                if (is_multi_select) {
                    const checkboxItems = Array.isArray(value) ? value : [];
                    const filteredItems = getFilteredDropdownItems(
                        path,
                        checkboxItems,
                    );

                    return (
                        <div key={path} className="flex flex-col gap-[6px]">
                            <label className="text-[14px] font-medium text-[#344051]">
                                {label}
                                {isRequired && (
                                    <span className="text-red-500 ml-0.5">
                                        *
                                    </span>
                                )}
                            </label>
                            <MultiSelectDropDown
                                filteredItems={filteredItems}
                                dataFieldToUseForSelection="label"
                                uniqueIdFieldToUseForSelection="value"
                                checkboxItems={checkboxItems}
                                setCheckboxItems={(items) => {
                                    const newItems =
                                        typeof items === 'function'
                                            ? items(checkboxItems)
                                            : items;
                                    handleChange(path, newItems, config);
                                }}
                                typeOfData={`Select ${label.toLowerCase()}`}
                                wantToShowSearchBox={options.length > 5}
                                setSearchText={(text) =>
                                    handleDropdownSearchChange(path, text)
                                }
                                searchText={dropdownSearchTexts[path] || ''}
                                wantToShowSelectedItems={true}
                                dropDownContentCss="w-full"
                                triggerTextCss={`!min-h-[32px] !text-[14px] !font-[400] !text-left ${checkboxItems.some(
                                    (i: any) => i.selected,
                                )
                                    ? '!text-[#141C24]'
                                    : '!text-[#637083]'
                                    }`}
                            />
                            {error && (
                                <span className="text-red-500 text-[12px]">
                                    {error}
                                </span>
                            )}
                        </div>
                    );
                }

                // Single-select dropdown (boolean or regular list)
                const selectedOption = list_options?.find(
                    (opt: any) => opt.value === value,
                );
                const displayText =
                    selectedOption?.label ||
                    `Select ${label.toLowerCase()}`;

                return (
                    <div key={path} className="flex flex-col gap-[6px]">
                        <label className="text-[14px] font-medium text-[#344051]">
                            {label}
                            {isRequired && (
                                <span className="text-red-500 ml-0.5">*</span>
                            )}
                        </label>
                        <SingleSelectDropDown
                            filteredArr={options}
                            dataFieldToUseForSelection="label"
                            uniqueIdFieldToUseForSelection="value"
                            wantToShowSearchBox={options.length > 5}
                            setSearchText={(text) =>
                                handleDropdownSearchChange(path, text)
                            }
                            typeOfData={displayText}
                            handleSelection={(item: any) => {
                                handleChange(path, item.value, config);
                            }}
                            triggerTextCss={`!h-[42px] !text-[14px] !font-[400] !text-left !rounded-[8px] ${selectedOption
                                ? '!text-[#141C24]'
                                : '!text-[#637083]'
                                }`}
                            contentCss="w-full top-1"
                        />
                        {error && (
                            <span className="text-red-500 text-[12px]">
                                {error}
                            </span>
                        )}
                    </div>
                );
            }

            // ── Datetime ─────────────────────────────────────────────────
            if (formatter === 'datetime') {
                return (
                    <div key={path} className="flex flex-col gap-[6px]">
                        <label className="text-[14px] font-medium text-[#344051]">
                            {label}
                            {isRequired && (
                                <span className="text-red-500 ml-0.5">*</span>
                            )}
                        </label>
                        <div className="border border-[#CED2DA] rounded-[8px] h-[42px] overflow-hidden">
                            <GenericFlatpickr
                                value={
                                    value instanceof Date
                                        ? value
                                        : value
                                            ? new Date(value)
                                            : null
                                }
                                onChange={(date) =>
                                    handleChange(path, date, config)
                                }
                                placeholder={`Select ${label.toLowerCase()}`}
                                showCalendarIcon={true}
                                showClearIcon={true}
                                className="pl-7"
                            />
                        </div>
                        {error && (
                            <span className="text-red-500 text-[12px]">
                                {error}
                            </span>
                        )}
                    </div>
                );
            }

            // ── Number / Currency ────────────────────────────────────────
            if (formatter === 'number' || formatter === 'currency') {
                return (
                    <div key={path} className="flex flex-col gap-[6px]">
                        <label className="text-[14px] font-medium text-[#344051]">
                            {label}
                            {isRequired && (
                                <span className="text-red-500 ml-0.5">*</span>
                            )}
                        </label>
                        <div
                            className={`flex border rounded-[8px] overflow-hidden items-center ${error
                                ? 'border-red-400'
                                : 'border-[#CED2DA]'
                                }`}
                        >
                            <input
                                type="text"
                                inputMode="numeric"
                                value={value ?? ''}
                                onChange={(e) =>
                                    handleChange(
                                        path,
                                        e.target.value,
                                        config,
                                    )
                                }
                                placeholder={`Enter ${label.toLowerCase()}`}
                                className="py-[10px] px-[14px] w-full text-[#141C24] text-[14px] font-normal outline-none bg-white placeholder:text-[14px] placeholder:text-[#637083] placeholder:font-normal"
                            />
                        </div>
                        {error && (
                            <span className="text-red-500 text-[12px]">
                                {error}
                            </span>
                        )}
                    </div>
                );
            }

            // ── Email ────────────────────────────────────────────────────
            if (formatter === 'email') {
                return (
                    <div key={path} className="flex flex-col gap-[6px]">
                        <label className="text-[14px] font-medium text-[#344051]">
                            {label}
                            {isRequired && (
                                <span className="text-red-500 ml-0.5">*</span>
                            )}
                        </label>
                        <div
                            className={`flex border rounded-[8px] overflow-hidden items-center ${error
                                ? 'border-red-400'
                                : 'border-[#CED2DA]'
                                }`}
                        >
                            <input
                                type="email"
                                value={value ?? ''}
                                onChange={(e) =>
                                    handleChange(
                                        path,
                                        e.target.value,
                                        config,
                                    )
                                }
                                placeholder={`Enter ${label.toLowerCase()}`}
                                className="py-[10px] px-[14px] w-full text-[#141C24] text-[14px] font-normal outline-none bg-white placeholder:text-[14px] placeholder:text-[#637083] placeholder:font-normal"
                            />
                        </div>
                        {error && (
                            <span className="text-red-500 text-[12px]">
                                {error}
                            </span>
                        )}
                    </div>
                );
            }

            // ── Boolean (non-list) ───────────────────────────────────────
            if (formatter === 'boolean' && data_type !== 'list') {
                return (
                    <div key={path} className="flex flex-col gap-[6px]">
                        <label className="text-[14px] font-medium text-[#344051]">
                            {label}
                            {isRequired && (
                                <span className="text-red-500 ml-0.5">*</span>
                            )}
                        </label>
                        <SingleSelectDropDown
                            filteredArr={[
                                { label: 'Yes', value: true },
                                { label: 'No', value: false },
                            ]}
                            dataFieldToUseForSelection="label"
                            uniqueIdFieldToUseForSelection="value"
                            wantToShowSearchBox={false}
                            typeOfData={
                                value === true
                                    ? 'Yes'
                                    : value === false
                                        ? 'No'
                                        : `Select ${label.toLowerCase()}`
                            }
                            handleSelection={(item: any) =>
                                handleChange(path, item.value, config)
                            }
                            triggerTextCss={`!h-[42px] !text-[14px] !font-[400] !text-left !rounded-[8px] ${value !== null &&
                                value !== undefined &&
                                value !== ''
                                ? '!text-[#141C24]'
                                : '!text-[#637083]'
                                }`}
                            contentCss="w-full"
                        />
                        {error && (
                            <span className="text-red-500 text-[12px]">
                                {error}
                            </span>
                        )}
                    </div>
                );
            }

            // ── Default: Text input ──────────────────────────────────────
            return (
                <div key={path} className="flex flex-col gap-[6px]">
                    <label className="text-[14px] font-medium text-[#344051]">
                        {label}
                        {isRequired && (
                            <span className="text-red-500 ml-0.5">*</span>
                        )}
                    </label>
                    <div
                        className={`flex border rounded-[8px] overflow-hidden items-center ${error ? 'border-red-400' : 'border-[#CED2DA]'
                            }`}
                    >
                        <input
                            type="text"
                            value={value ?? ''}
                            onChange={(e) =>
                                handleChange(path, e.target.value, config)
                            }
                            placeholder={`Enter ${label.toLowerCase()}`}
                            className="py-[10px] px-[14px] w-full text-[#141C24] text-[14px] font-normal outline-none bg-white placeholder:text-[14px] placeholder:text-[#637083] placeholder:font-normal"
                        />
                    </div>
                    {error && (
                        <span className="text-red-500 text-[12px]">
                            {error}
                        </span>
                    )}
                </div>
            );
        },
        [
            formValues,
            errors,
            touched,
            type,
            handleChange,
            getFilteredDropdownItems,
            dropdownSearchTexts,
            handleDropdownSearchChange,
            multiItemInputTexts,
        ],
    );

    /* ── Render ───────────────────────────────────────────────────────── */
    return (
        <SideDrawer
            isOpen={isOpen}
            onClose={handleCancel}
            title={drawerTitle}
            width="w-[520px] h-[100vh]"
        >
            <div className="h-full">
                {/* ── Scrollable form body ────────────────────────────────── */}
                <div className="h-[calc(100vh-130px)] pl-5 pr-7 space-y-[24px] flex-1 overflow-y-auto overflow-x-hidden scroll py-6">

                    {/* ── Info banner (bulk edit) ─────────────────────────── */}
                    {infoBannerMessage && (
                        <div className="px-4 py-3 bg-blue-50 rounded-[8px] text-[14px] text-blue-700 font-medium">
                            {infoBannerMessage}
                        </div>
                    )}
                    {isCreateNewConfigLoading ? (
                        <div className="flex items-center justify-center py-10">
                            <span className="text-[14px] text-[#637083]"><Loader className="w-6 h-6 text-gray-400 animate-spin" /></span>
                        </div>
                    ) : (
                        formFields.map((config) => {
                            const fieldElement = renderField(config);
                            if (type !== 'bulk_edit') return fieldElement;

                            const { path, can_empty } = config;
                            const modified = isFieldModified(path);
                            const isMarkedEmpty = markedAsEmpty.has(path);

                            return (
                                <div key={`bulk-${path}`} className="relative">
                                    {/* Status indicator + undo */}
                                    {/* {modified && (
                                        <div className="flex items-center justify-between mb-1">
                                            <span className={`text-[11px] font-medium flex items-center gap-1 ${isMarkedEmpty ? 'text-amber-600' : 'text-blue-600'}`}>
                                                {isMarkedEmpty ? (
                                                    <>
                                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        Will be cleared
                                                    </>
                                                ) : (
                                                    <>
                                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 inline-block" />
                                                        Modified
                                                    </>
                                                )}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => handleUndoField(path)}
                                                className="text-[11px] text-gray-500 hover:text-gray-700 flex items-center gap-0.5"
                                            >
                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a5 5 0 015 5v2M3 10l4-4m-4 4l4 4" />
                                                </svg>
                                                Undo
                                            </button>
                                        </div>
                                    )} */}

                                    {/* Field (disabled when marked empty) */}
                                    <div className={isMarkedEmpty ? 'opacity-40 pointer-events-none select-none' : ''}>
                                        {fieldElement}
                                    </div>

                                    {/* "Set to empty" checkbox */}
                                    {can_empty !== false && (
                                        <label className="flex items-center gap-2 mt-2 cursor-pointer select-none">
                                            <input
                                                type="checkbox"
                                                checked={isMarkedEmpty}
                                                onChange={() => handleToggleEmpty(path, config)}
                                                className="w-3.5 h-3.5 rounded border-gray-300 text-amber-600 focus:ring-amber-500 accent-amber-600"
                                            />
                                            <span className={`text-[11px] ${isMarkedEmpty ? 'text-amber-600 font-medium' : 'text-gray-400'}`}>
                                                Set to empty
                                            </span>
                                        </label>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

                {/* ── Action buttons ──────────────────────────────────────── */}
                <div className="h-[72px] bg-white bottom-0 left-0 w-full px-4 border-t border-gray-200 rounded-b-[12px] flex items-center justify-end gap-2">
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="h-10 w-fit font-medium py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-0 border text-[#202B37] border-gray-300 hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={
                            !(type === 'bulk_edit' ? hasActualChanges : isDirty) ||
                            isSaving ||
                            Object.keys(errors).length > 0
                        }
                        className={`${(type === 'bulk_edit' ? hasActualChanges : isDirty) &&
                            !isSaving &&
                            Object.keys(errors).length === 0
                            ? 'bg-blue-600 hover:bg-blue-700'
                            : 'bg-[#CCE0FF] cursor-not-allowed'
                            } h-10 w-fit text-white font-medium py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-0`}
                    >
                        {isSaving ? 'Saving...' : submitLabel}
                    </button>
                </div>
            </div>
        </SideDrawer>
    );
};

export default FormView;

