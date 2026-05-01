import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { getAdminViewConfig, getFeedData, createFeedData, downloadFeedData } from '../../../api/admin/admin';
import MainGridView from './mainGridView';
import HorizontalFilterView from './horizontalFilterView';
import VerticalFilterView from './verticalFilterView';
import FormView, { FormType } from './formView';
import { useUpdateFeedData } from '../../../../services/mutations/adminMutations';
import { toast } from 'react-toastify';
import DeleteModal from '../../../../common/components/DeleteModal';
import ConfirmationModalForEmail from '../../../../common/components/Modal/confirmationModalForEmail';

interface NavItem {
    id: string;
    label: string;
    icon?: string;
    type: string;
    order: number;
    level: number;
    enabled: boolean;
    children?: NavItem[];
    action?: any;
}

interface MainViewProps {
    selectedView: NavItem;
}

/* ────────────────────────────────────────────────────────────────────────────
 *  Pure helpers – defined at module level so they are never recreated.
 * ──────────────────────────────────────────────────────────────────────────── */

/** Check whether a list's option values are numeric (decides the "Not selected" placeholder value). */
const areListValuesNumeric = (listOptions: any[], uniqueIdType?: string): boolean => {
    if (uniqueIdType === 'number') return true;
    if (!listOptions || listOptions.length === 0) return false;
    return typeof listOptions[0]?.value === 'number';
};

/**
 * Build the default (initial) vertical-filter state from the view configuration.
 * Only configs with `allow_in_side_filter: true` are included.
 *
 *  • string         → ''
 *  • integer / float → { from: min_value, to: max_value }
 *  • date           → { dateFrom: null, dateTo: null }
 *  • list (boolean) → [{ id, name, value, selected: true }, …]
 *  • list (normal)  → [{ label, value, selected: true }, …]
 *
 * If `include_missing` is true on a list config, a "Not selected" entry is prepended.
 */
export const buildDefaultVerticalFilters = (configuration: any[]): Record<string, any> => {
    if (!configuration || configuration.length === 0) return {};

    const filters: Record<string, any> = {};

    for (const config of configuration) {
        if (!config.allow_in_side_filter) continue;

        const { path, data_type, formatter, list_options, include_missing, min_value, max_value, list_options_unique_id_type } = config;

        switch (data_type) {
            case 'string':
                filters[path] = '';
                break;

            case 'integer':
            case 'float':
                filters[path] = { from: min_value ?? 0, to: max_value ?? 100 };
                break;

            case 'date':
                filters[path] = { dateFrom: null, dateTo: null };
                break;

            case 'list': {
                let options: any[];

                if (formatter === 'boolean') {
                    options = (list_options ?? []).map((opt: any) => ({
                        id: opt.value ?? opt.id,
                        name: opt.label,
                        value: opt.value,
                        selected: true,
                    }));
                    if (include_missing) {
                        options.unshift({ id: 'notselected', name: 'Not selected', value: 'notselected', selected: true });
                    }
                } else {
                    options = (list_options ?? []).map((opt: any) => ({ ...opt, selected: true }));
                    if (include_missing) {
                        const isNumeric = areListValuesNumeric(list_options, list_options_unique_id_type as string);
                        options.unshift({
                            label: 'Not selected',
                            value: isNumeric ? -1 : 'include_missing',
                            selected: true,
                        });
                    }
                }

                filters[path] = options;
                break;
            }

            default:
                break;
        }
    }

    return filters;
};

/**
 * Convert the vertical-filter UI state into a flat payload for the API.
 *  • list → array of selected values (e.g. [-1, 1001, 1002] or ["include_missing", "id1"])
 *  • integer / float → { from, to }
 *  • date → { dateFrom, dateTo }  (only when at least one date is set)
 *  • string → the search text        (only when non-empty)
 */
const buildFiltersPayload = (
    verticalFilters: Record<string, any> | null,
    configuration: any[],
): Record<string, any> => {
    if (!verticalFilters || !configuration) return {};

    const payload: Record<string, any> = {};

    for (const config of configuration) {
        if (!config.allow_in_side_filter) continue;

        const { path, data_type } = config;
        const value = verticalFilters[path];
        if (value === undefined || value === null) continue;

        switch (data_type) {
            case 'string':
                if (value !== '') payload[path] = value;
                break;

            case 'integer':
            case 'float':
                payload[path] = { from: value.from, to: value.to };
                break;

            case 'date':
                if (value.dateFrom || value.dateTo) {
                    payload[path] = { dateFrom: value.dateFrom, dateTo: value.dateTo };
                }
                break;

            case 'list': {
                if (Array.isArray(value)) {
                    const selected = value
                        .filter((item: any) => item.selected)
                        .map((item: any) => item.value);
                    payload[path] = selected;
                }
                break;
            }

            default:
                break;
        }
    }

    return payload;
};

/* ──────────────────────────────────────────────────────────────────────────── */

const FEED_PAGE_SIZE = 50; // Number of rows to fetch per page

const MainView: React.FC<MainViewProps> = ({ selectedView }) => {
    const [globalSearchText, setGlobalSearchText] = useState('');
    const [verticalFiltersViewOn, setVerticalFiltersViewOn] = useState(false);
    const [selectedToggle, setSelectedToggle] = useState<any>(null);
    const [verticalFilters, setVerticalFilters] = useState<Record<string, any> | null>(null);
    const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());

    // ── Form state ──────────────────────────────────────────────────────
    const [formOpen, setFormOpen] = useState(false);
    const [formType, setFormType] = useState<FormType>('create_new');
    const [formRowData, setFormRowData] = useState<Record<string, any> | null>(null);
    const [isFormSaving, setIsFormSaving] = useState(false);
    const [openModal, setOpenModal] = useState<{ open: boolean; type: string; content_type: string; header: string; title: string; saveFunc: () => void }>({ open: false, type: '', content_type: '', header: '', title: '', saveFunc: () => { } });

    const action = selectedView.action;
    const updateFeedData = useUpdateFeedData();

    // Debounce refs — accumulate rapid edits per user before flushing
    const debounceTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());
    const pendingUpdates = useRef<Map<string, Record<string, any>>>(new Map());

    // Cleanup pending timeouts on unmount
    useEffect(() => {
        return () => {
            debounceTimeouts.current.forEach((t) => clearTimeout(t));
            debounceTimeouts.current.clear();
            pendingUpdates.current.clear();
        };
    }, []);

    // ── Reset all state when the selected view changes ──────────────────
    useEffect(() => {
        setGlobalSearchText('');
        setSelectedToggle(null);
        setVerticalFilters(null);
        setSelectedRowIds(new Set());
        setVerticalFiltersViewOn(false);
        setFormOpen(false);
        setFormRowData(null);
    }, [selectedView.id]);

    // ── View configuration ──────────────────────────────────────────────
    const {
        data: adminViewConfig,
        isLoading: isViewConfigLoading,
        isFetching: isViewConfigFetching,
    } = useQuery({
        queryKey: ['adminViewConfig', selectedView.id, selectedToggle?.path || 'registered'],
        queryFn: async (): Promise<any> => getAdminViewConfig(selectedView?.id, selectedToggle),
        enabled: !!selectedView.id,
        refetchOnWindowFocus: false,
    });

    const viewConfig = adminViewConfig?.data?.data?.[0];
    const configuration: any[] = useMemo(() => viewConfig?.configuration || [], [viewConfig]);

    // ── Default vertical filters (derived from configuration) ───────────
    const defaultVerticalFilters = useMemo(
        () => buildDefaultVerticalFilters(configuration),
        [configuration],
    );

    // ── Combined initialization: set toggle + vertical filters once viewConfig is ready ──
    useEffect(() => {
        if (verticalFilters !== null) return;
        if (!viewConfig || isViewConfigFetching) return;

        // Initialize default toggle if not already set
        if (selectedToggle === null) {
            const toggleOptions = viewConfig.filters?.find((f: any) => f.data_type === 'toggle')?.toggle_options || [];
            const defaultOption = toggleOptions.find((opt: any) => opt.use_default) ?? null;
            if (defaultOption) {
                setSelectedToggle(defaultOption);
                return; // viewConfig will refetch with new toggle — wait for it
            }
        }

        // Toggle is settled — initialize vertical filters
        setVerticalFilters(buildDefaultVerticalFilters(configuration));
    }, [viewConfig, isViewConfigFetching, selectedToggle, configuration, verticalFilters]);

    // ── Filters payload for the API ─────────────────────────────────────
    const filtersPayload = useMemo(
        () => buildFiltersPayload(verticalFilters, configuration),
        [verticalFilters, configuration],
    );

    const hasAppliedVerticalFilters = useMemo(() => {
        const defaultPayload = buildFiltersPayload(defaultVerticalFilters, configuration);
        return JSON.stringify(filtersPayload) !== JSON.stringify(defaultPayload);
    }, [filtersPayload, defaultVerticalFilters, configuration]);

    const defaultToggleOption = useMemo(() => {
        const toggleOptions = viewConfig?.filters?.find((filter: any) => filter.data_type === 'toggle')?.toggle_options || [];
        return toggleOptions.find((option: any) => option.use_default) ?? null;
    }, [viewConfig?.filters]);

    const hasAppliedToggleFilter = useMemo(() => {
        if (!selectedToggle && !defaultToggleOption) return false;
        if (!selectedToggle && defaultToggleOption) return true;
        if (selectedToggle && !defaultToggleOption) return true;

        const selectedKey = selectedToggle?.id ?? selectedToggle?.path ?? selectedToggle?.label ?? null;
        const defaultKey = defaultToggleOption?.id ?? defaultToggleOption?.path ?? defaultToggleOption?.label ?? null;
        return selectedKey !== defaultKey;
    }, [selectedToggle, defaultToggleOption]);

    const hasAppliedFilters = useMemo(
        () => globalSearchText.trim().length > 0 || hasAppliedVerticalFilters || hasAppliedToggleFilter,
        [globalSearchText, hasAppliedVerticalFilters, hasAppliedToggleFilter],
    );

    // ── Stable query key for feed data (infinite scroll) ─────────────────
    const feedQueryKey = useMemo(
        () => ['adminFeedData', viewConfig?._id, selectedToggle?.path, globalSearchText, filtersPayload],
        [viewConfig?._id, selectedToggle?.path, globalSearchText, filtersPayload],
    );

    // ── Feed data (paginated with infinite scroll) ──────────────────────
    const {
        data: adminFeedInfiniteData,
        isLoading: isFeedDataLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteQuery({
        queryKey: feedQueryKey,
        queryFn: async ({ pageParam = 0 }): Promise<any> =>
            getFeedData(
                viewConfig?.actions ? viewConfig.actions?.find((a: any) => a.id === 'get') : null,
                selectedToggle,
                globalSearchText,
                filtersPayload,
                { skip: pageParam, limit: FEED_PAGE_SIZE },
            ),
        initialPageParam: 0,
        getNextPageParam: (lastPage) => {
            const currentSkip = lastPage?.data?.skip ?? 0;
            const total = lastPage?.data?.total ?? 0;
            const nextSkip = currentSkip + FEED_PAGE_SIZE;
            return nextSkip < total ? nextSkip : undefined;
        },
        enabled: verticalFilters !== null && !!viewConfig?.actions?.find((a: any) => a.id === 'get'),
        refetchOnWindowFocus: false,
    });

    // Flatten all infinite-query pages into a single array
    const data = useMemo(() => {
        if (!adminFeedInfiniteData?.pages) return [];
        return adminFeedInfiniteData.pages.flatMap(page => page?.data?.data ?? []);
    }, [adminFeedInfiniteData]);

    // Derive total from the latest page
    const latestPage = adminFeedInfiniteData?.pages?.[adminFeedInfiniteData.pages.length - 1];
    const totalRows = latestPage?.data?.total ?? 0;

    const isLoading = isViewConfigLoading || isFeedDataLoading;

    // ── Callbacks ───────────────────────────────────────────────────────

    /** Called when "Apply" is clicked in the vertical-filter drawer. */
    const handleApplyVerticalFilters = useCallback((filters: Record<string, any>) => {
        setVerticalFilters(filters);
        setVerticalFiltersViewOn(false);
    }, []);

    /** Resets every filter (horizontal + vertical) back to its default. */
    const handleResetAllFilters = useCallback(() => {
        setGlobalSearchText('');
        setSelectedToggle(defaultToggleOption);
        setVerticalFilters(defaultVerticalFilters);
    }, [defaultVerticalFilters, defaultToggleOption]);

    /** Handle export selection from the dropdown. */
    const handleExportSelection = useCallback(
        (option: any) => {
            const exportAction = viewConfig?.actions?.find((a: any) => a.id === 'export') ?? null;
            if (option.value === 'current_view') {
                downloadFeedData(exportAction, selectedToggle, globalSearchText, filtersPayload);
            } else if (option.value === 'all_data') {
                const defaultPayload = buildFiltersPayload(defaultVerticalFilters, configuration);
                downloadFeedData(exportAction, selectedToggle, '', defaultPayload);
            }
        },
        [selectedToggle, globalSearchText, filtersPayload, defaultVerticalFilters, configuration],
    );

    /**
     * Flush a pending update for the given key.
     * Merges all accumulated field changes into one API call.
     */
    const flushUpdate = useCallback(
        async (key: string) => {
            const patch = pendingUpdates.current.get(key);
            if (!patch) return;

            pendingUpdates.current.delete(key);
            debounceTimeouts.current.delete(key);

            const updateAction = viewConfig?.actions?.find((a: any) => a.id === 'update') ?? null;

            try {
                await updateFeedData.mutateAsync({
                    data: { ...patch },
                    queryKey: feedQueryKey,
                    action: updateAction,
                });
            } catch (error: any) {
                toast.error(error?.response?.data?.message || 'Update failed. Please try again.');
                console.error('Bulk update failed:', {
                    message: error?.message,
                    response: error?.response?.data,
                    status: error?.response?.status,
                });
            }
        },
        [updateFeedData, feedQueryKey, viewConfig],
    );

    /**
     * Debounced save — accumulates rapid field changes for the same user(s)
     * and flushes them in a single API call after a short delay (300 ms).
     *
     * @param ids      - Array of user _id strings to update
     * @param field    - The field path being changed
     * @param value    - New value for that field
     * @param delay    - Debounce window in ms (default: 300)
     */
    const debouncedSave = useCallback(
        (ids: string[], field: string, value: any, delay = 300) => {
            // Use a stable key so edits on the same set of ids merge together
            const key = ids.sort().join(',');

            // Merge into pending patch
            const existing = pendingUpdates.current.get(key) || { ids };
            existing[field] = value;
            pendingUpdates.current.set(key, existing);

            // Reset the debounce timer
            const prev = debounceTimeouts.current.get(key);
            if (prev) clearTimeout(prev);

            const timeout = setTimeout(() => flushUpdate(key), delay);
            debounceTimeouts.current.set(key, timeout);
        },
        [flushUpdate],
    );

    /**
     * Called by each EditableCell when a value changes.
     * Signature matches MainGridView's `onSave` prop.
     */
    const handleSave = useCallback(
        async (fieldPath: string, newValue: any, rowData: any) => {
            if (!rowData?.[viewConfig?.['unique_id_field']] && !rowData?._id) return;
            if (newValue === rowData[fieldPath]) return; // No change
            if (newValue === '' || newValue === null || newValue === undefined) {
                newValue = null; // Normalize empty values to null
            }
            debouncedSave([rowData?.[viewConfig?.['unique_id_field']] || rowData?._id], fieldPath, newValue);
            setOpenModal({ open: false, type: '', content_type: '', header: '', title: '', saveFunc: () => { } });
        },
        [debouncedSave],
    );

    // ── Form handlers ────────────────────────────────────────────────────

    /** Open the single_edit form when a detail-view cell is clicked. */
    const handleItemDetailView = useCallback(
        (rowData: any) => {
            // rowData can be the full row object or just an _id string
            let row: Record<string, any> | null = null;
            if (typeof rowData === 'string') {
                row = data.find((r: any) => r._id === rowData) ?? null;
            } else {
                row = rowData;
            }
            if (!row) return;
            setFormRowData(row);
            setFormType('single_edit');
            setFormOpen(true);
        },
        [data],
    );

    /** Open the bulk edit form. */
    const handleOpenBulkEdit = useCallback(() => {
        if (selectedRowIds.size === 0) {
            toast.info('Please select at least one row to bulk edit.');
            return;
        }
        setFormRowData(null);
        setFormType('bulk_edit');
        setFormOpen(true);
    }, [selectedRowIds]);

    /** Open the create new form. */
    const handleOpenCreateNew = useCallback(() => {
        setFormRowData(null);
        setFormType('create_new');
        setFormOpen(true);
    }, []);

    /** Close the form drawer. */
    const handleCloseForm = useCallback(() => {
        setFormOpen(false);
        setFormRowData(null);
    }, []);

    /** Handle form save for all three types. */
    const handleFormSave = useCallback(
        async (payload: Record<string, any>) => {
            setIsFormSaving(true);
            console.log('Form payload:', payload);
            try {
                if (formType === 'create_new') {
                    await createFeedData({ ...payload }, viewConfig?.actions ? viewConfig.actions?.find((a: any) => a.id === 'create') : null,);

                    toast.success('Record created successfully');
                } else {
                    // single_edit & bulk_edit → use existing update mutation
                    await updateFeedData.mutateAsync({
                        data: { ...payload },
                        queryKey: feedQueryKey,
                        action: viewConfig?.actions ? viewConfig.actions?.find((a: any) => a.id === 'update') : null,
                    });
                    toast.success('Updated successfully');
                }
                setFormOpen(false);
                setFormRowData(null);
                setSelectedRowIds(new Set());
                setOpenModal({ open: false, type: '', content_type: '', header: '', title: '', saveFunc: () => { } });
            } catch (error: any) {
                toast.error(
                    error?.response?.data?.message || 'Operation failed. Please try again.',
                );
            } finally {
                setIsFormSaving(false);
            }
        },
        [formType, action, updateFeedData, feedQueryKey],
    );

    // ── Render ──────────────────────────────────────────────────────────
    return (
        <div className="h-full flex flex-col">
            <HorizontalFilterView
                selectedView={selectedView}
                globalSearchText={globalSearchText}
                setGlobalSearchText={setGlobalSearchText}
                verticalFiltersViewOn={verticalFiltersViewOn}
                setVerticalFiltersViewOn={setVerticalFiltersViewOn}
                setAllFiltersBackToDefault={handleResetAllFilters}
                handleExportSelection={handleExportSelection}
                count={totalRows}
                filters={viewConfig?.filters || []}
                selectedToggle={selectedToggle}
                setSelectedToggle={setSelectedToggle}
                hasAppliedFilters={hasAppliedFilters}
                onCreateNew={handleOpenCreateNew}
                onBulkEdit={handleOpenBulkEdit}
                hasSelectedRows={selectedRowIds.size > 0}
                setSelectedRowIds={setSelectedRowIds}
                configuration={configuration}
            />
            <MainGridView
                configuration={configuration}
                viewConfig={viewConfig}
                data={data}
                isLoading={isLoading}
                onSave={handleSave}
                selectedRowIds={selectedRowIds}
                onSelectedRowIdsChange={setSelectedRowIds}
                itemDetailView={handleItemDetailView}
                onLoadMore={() => fetchNextPage()}
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
                totalRows={totalRows}
                setOpenModal={setOpenModal}
            />
            <VerticalFilterView
                isOpen={verticalFiltersViewOn}
                onClose={() => setVerticalFiltersViewOn(false)}
                configuration={configuration}
                verticalFilters={verticalFilters}
                defaultFilters={defaultVerticalFilters}
                onApply={handleApplyVerticalFilters}
            />
            <FormView
                isOpen={formOpen}
                onClose={handleCloseForm}
                viewConfig={viewConfig}
                configuration={configuration}
                type={formType}
                onSave={handleFormSave}
                onCancel={handleCloseForm}
                data={formRowData}
                selectedIds={Array.from(selectedRowIds)}
                isSaving={isFormSaving}
                setOpenModal={setOpenModal}
            />
            <ConfirmationModalForEmail
                header={openModal.header}
                modalOpen={openModal.open && openModal.type === 'CONFIRMATION'}
                handleCancel={() => setOpenModal({ open: false, type: '', content_type: '', header: '', title: '', saveFunc: () => { } })}
                handleYes={openModal.saveFunc}
                yesText={openModal.content_type}
                title={openModal.title}
            />
            <DeleteModal
                show={openModal.open && openModal.type === 'DELETE'}
                onHide={() => setOpenModal({ open: false, type: '', content_type: '', header: '', title: '', saveFunc: () => { } })}
                onDelete={openModal.saveFunc}
                title={openModal.content_type || ''}
            />

        </div>
    );
};

export default MainView;