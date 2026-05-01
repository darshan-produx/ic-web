'use client';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import KanbanView from '../../../../common/components/KanbanView';
import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { getOpportunityStatusConfig } from '../../../api/insights/insights';
import { getOpportunitiesByFilter, getOpportunityAttributeConfig, getOpportunityGridViewConfig } from '../../../api/insights/opportunities';
import OpportunityCard from './components/opportunityCard';
import { useUpdateOpportunityStatus } from '../../../../services/mutations/insightMutations';
import CreateOpportunityModal from './components/createOpportunityModal';
import { OpportunityFilterBar } from './components/opportunityFilterBar';
import OpportunityAdvancedFilter from './components/opportunityAdvancedFilter';
import OpportunityDetailsSideBarView from './opportunityDetailsSideBarView';
import OpportunityGridView from './components/OpportunityGridView';
import { useUpdateOpportunityFromGrid } from '../../../../services/mutations/insightMutations';
const Opportunities = () => {
    const GRID_PAGE_SIZE = 50; // Number of rows to fetch per page in grid view

    const [advancedFiltersOpen, setAdvancedFiltersOpen] =
        useState<boolean>(false);
    const [opportunitiesSidebarViewOpen, setOpportunitiesSidebarViewOpen] =
        useState<boolean>(false);
    const [selectedOpportunityId, setSelectedOpportunityId] =
        useState<string>('');
    const [checkboxItemsCustomer, setCheckboxItemsCustomer] = useState<any[]>([]);

    // Check for selected opportunity in URL and open sidebar
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            const selectedId = url.searchParams.get('selected');
            if (selectedId) {
                setSelectedOpportunityId(selectedId);
                setOpportunitiesSidebarViewOpen(true);
            }
        }
    }, []);
    const [checkboxItemStatus, setCheckboxItemStatus] = useState<any[]>([]);
    const [selectedSortBy, setSelectedSortBy] = useState<any[]>([]);
    const [valueFrom, setValueFrom] = useState<number | undefined>(undefined);
    const [valueTo, setValueTo] = useState<number | undefined>(undefined);
    // const [generatedBy, setGeneratedBy] = useState<any[]>([]);
    const [createdDateFrom, setCreatedDateFrom] = useState<Date | null>();
    const [createdDateTo, setCreatedDateTo] = useState<Date | null>();
    const [targetClosureDateFrom, setTargetClosureDateFrom] =
        useState<Date | null>();
    const [targetClosureDateTo, setTargetClosureDateTo] = useState<Date | null>();
    const [checkboxAssignedTo, setCheckboxAssignedTo] = useState<any[]>([]);
    const [checkboxCreatedBy, setCheckboxCreatedBy] = useState<any[]>([]);
    const [searchText, setSearchText] = useState<string | undefined>(undefined);
    const [attributeFilterArr, setAttributeFilterArr] = useState<any[]>([]);
    const updateInsight = useUpdateOpportunityStatus();
    const [createOpportunityModal, setCreateOpportunityModal] = useState(false);
    const [dummyState, setDummyState] = useState(false); // State to force re-render

    const updateOpportunityFromGrid = useUpdateOpportunityFromGrid();

    // Debounced save function to prevent too frequent API calls
    const debounceTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());
    const pendingUpdates = useRef<Map<string, any>>(new Map());

    // Cleanup timeouts on unmount
    useEffect(() => {
        return () => {
            debounceTimeouts.current.forEach(timeout => clearTimeout(timeout));
            debounceTimeouts.current.clear();
            pendingUpdates.current.clear();
        };
    }, []);

    const [view, setView] = useState<'kanban' | 'grid'>(() => {
        if (typeof window !== 'undefined') {
            const savedView = localStorage.getItem('opportunityView');
            return (savedView as 'kanban' | 'grid') || 'kanban';
        }
        return 'kanban';
    });
    useEffect(() => {
        localStorage.setItem('opportunityView', view);
    }, [view]);

    const { data: opportunityStatusesFromConfig } = useQuery({
        queryKey: ['getOpportunityStatusConfig'],
        queryFn: () => getOpportunityStatusConfig(),
        refetchOnWindowFocus: false,
    });

    const opportunityAttributeConfig = useQuery({
        queryKey: ['opportunityAttributeConfig'],
        queryFn: () => getOpportunityAttributeConfig(),
        refetchOnWindowFocus: false,
    });

    const opportunityGridViewConfig = useQuery({
        queryKey: ['opportunityGridViewConfig'],
        queryFn: () => getOpportunityGridViewConfig(),
        refetchOnWindowFocus: false,
    });

    const getFilters = () => {
        return {
            status: checkboxItemStatus
                ?.filter((item) => item.selected)
                ?.map((item) => item.bucket),
            customers: checkboxItemsCustomer
                ?.filter((item) => item.selected)
                ?.map((item) => item.customer_id),
            searchText: searchText,
            sortBy: Array.isArray(selectedSortBy) ? selectedSortBy
                ?.find((item) => item.selected)
                ?.value : undefined,
            sortOrder: Array.isArray(selectedSortBy) ? selectedSortBy
                ?.find((item) => item.selected)
                ?.sortOrder || 'desc' : 'desc',
            valueFrom: valueFrom ? Number(valueFrom) : undefined,
            valueTo: valueTo ? Number(valueTo) : undefined,
            createdDateFrom: createdDateFrom,
            createdDateTo: createdDateTo,
            targetClosureFrom: targetClosureDateFrom,
            targetClosureTo: targetClosureDateTo,
            assignedTo: checkboxAssignedTo
                ?.filter((item) => item.selected)
                ?.map((item) => item._id),
            createdBy: checkboxCreatedBy
                ?.filter((item) => item.selected)
                ?.map((item) => item._id),
            attributeFilterArr: attributeFilterArr.length ? attributeFilterArr?.map((item: any) => {
                return {
                    attribute_id: item.attribute_id,
                    data_type: item.data_type,
                    attribute_value_from: item.data_type === 'float' ? (item.attribute_value_from ? Number(item.attribute_value_from) : undefined) : undefined,
                    attribute_value_to: item.data_type === 'float' ? (item.attribute_value_to ? Number(item.attribute_value_to) : undefined) : undefined,
                    attributes_lists: item.data_type === 'list' ? item.attributes_lists?.filter((i: any) => i.selected && !(i.value === 'notselected')).map((i: any) => i.value) : undefined,
                    attribute_boolean_arr: item.data_type === 'boolean' ? item.attribute_boolean_arr?.filter((i: any) => i.selected && !(i.value === 'notselected')).map((i: any) => i.value) : undefined,
                    include_missing: item.include_missing
                };
            }) : undefined,
            isGridView: view === 'grid' ? true : false
        };
    }
    const queryKey = useMemo(() => {
        return ['opportunities', JSON.stringify(getFilters())];
    }, [
        checkboxItemStatus,
        checkboxItemsCustomer,
        selectedSortBy,
        valueFrom,
        valueTo,
        targetClosureDateFrom,
        targetClosureDateTo,
        checkboxAssignedTo,
        checkboxCreatedBy,
        searchText,
        attributeFilterArr,
        view,
    ]);

    // Kanban view: fetch all data without pagination (useQuery)
    const { data: kanbanData, isLoading: isKanbanLoading } = useQuery({
        queryKey: queryKey,
        queryFn: () =>
            getOpportunitiesByFilter(getFilters()),
        refetchOnWindowFocus: false,
        enabled: view === 'kanban',
    });

    // Grid view: fetch paginated data with infinite scroll (useInfiniteQuery)
    const {
        data: gridInfiniteData,
        isLoading: isGridLoading,
        fetchNextPage,
        hasNextPage: gridHasNextPage,
        isFetchingNextPage: isGridFetchingNextPage,
    } = useInfiniteQuery({
        queryKey: ['opportunities-grid', JSON.stringify(getFilters())],
        queryFn: ({ pageParam = 0 }) =>
            getOpportunitiesByFilter(getFilters(), { skip: pageParam, limit: GRID_PAGE_SIZE }),
        initialPageParam: 0,
        getNextPageParam: (lastPage) => {
            const currentSkip = lastPage?.data?.skip ?? 0;
            const total = lastPage?.data?.total ?? 0;
            const nextSkip = currentSkip + GRID_PAGE_SIZE;
            return nextSkip < total ? nextSkip : undefined;
        },
        refetchOnWindowFocus: false,
        enabled: view === 'grid',
    });

    // Flatten grid infinite query pages into a single array
    const gridData = useMemo(() => {
        if (!gridInfiniteData?.pages) return [];
        return gridInfiniteData.pages.flatMap(page => page?.data?.data ?? []);
    }, [gridInfiniteData]);

    // Derive the metadata from the latest page (for filters, currency, etc.)
    const gridLatestPage = gridInfiniteData?.pages?.[gridInfiniteData.pages.length - 1];
    const gridTotal = gridLatestPage?.data?.total ?? 0;

    // Unified data accessor: use the right data source based on view
    const opportunitiesData = view === 'kanban' ? kanbanData : gridLatestPage;
    const isLoading = view === 'kanban' ? isKanbanLoading : isGridLoading;

    // Compute the grid-specific query key for mutations
    const gridQueryKey = useMemo(() => {
        return ['opportunities-grid', JSON.stringify(getFilters())];
    }, [
        checkboxItemStatus,
        checkboxItemsCustomer,
        selectedSortBy,
        valueFrom,
        valueTo,
        targetClosureDateFrom,
        targetClosureDateTo,
        checkboxAssignedTo,
        checkboxCreatedBy,
        searchText,
        attributeFilterArr,
        view,
    ]);

    // Debounced save function - defined after queryKey
    const debouncedSave = useCallback((opportunityId: string, configId: string, data: any, fieldPath: string, delay: number = 0) => {
        const key = `${opportunityId}_${configId}`;
        const existingTimeout = debounceTimeouts.current.get(key);
        if (existingTimeout) {
            clearTimeout(existingTimeout);
        }
        pendingUpdates.current.set(key, { opportunityId, configId, data });
        const timeoutId = setTimeout(async () => {
            const pendingUpdate = pendingUpdates.current.get(key);
            if (pendingUpdate) {
                try {
                    await updateOpportunityFromGrid.mutateAsync({
                        opportunityId: pendingUpdate.opportunityId,
                        configId: pendingUpdate.configId,
                        data: pendingUpdate.data,
                        fieldPath: fieldPath,
                        queryKey: gridQueryKey
                    });
                    pendingUpdates.current.delete(key);
                    debounceTimeouts.current.delete(key);
                } catch (error: any) {
                    console.error('Error details:', {
                        message: error?.message,
                        response: error?.response?.data,
                        status: error?.response?.status
                    });
                }
            }
        }, delay);

        debounceTimeouts.current.set(key, timeoutId);
    }, [updateOpportunityFromGrid, gridQueryKey]);

    useMemo(() => {
        const sortByArr = [
            {
                id: "updated_date",
                label: 'Updated date',
                value: 'updated_at',
                sortOrder: 'desc',
                selected: true
            },
            {
                id: "created_date",
                label: 'Created date',
                value: 'created_at',
                sortOrder: 'desc',
                selected: false
            },
            {
                id: "target_date",
                label: 'Target date',
                value: 'target_closure_date',
                sortOrder: 'asc',
                selected: false
            },
            {
                id: "company_name",
                label: 'Company name',
                value: 'customer_name',
                sortOrder: 'desc',
                selected: false
            },
            {
                id: "opportunity_value",
                label: 'Opportunity value',
                value: 'opportunity_value',
                sortOrder: 'asc',
                selected: false
            },
        ];

        setSelectedSortBy(sortByArr);
    }, [dummyState]);

    useMemo(() => {
        if (opportunityAttributeConfig?.data?.data?.data) {
            const newArr = opportunityAttributeConfig.data.data.data.map((attribute: any) => {
                if (attribute.data_type === 'boolean') {
                    return {
                        // name: attribute.name,
                        attribute_id: attribute._id,
                        data_type: attribute.data_type,
                        attribute_boolean_arr: [
                            { id: 'yes', name: 'Yes', value: 'yes', selected: true },
                            { id: 'no', name: 'No', value: 'no', selected: true },
                            { id: 'not_selected', name: 'Not Selected', value: 'notselected', selected: true }
                        ],
                        include_missing: true
                    }
                } else if (attribute.data_type === 'list') {
                    return {
                        // name: attribute.name,
                        attribute_id: attribute._id,
                        data_type: attribute.data_type,
                        attributes_lists: attribute.list_options?.map((option: string, index: number) => ({
                            id: index,
                            name: option,
                            value: option,
                            selected: true
                        })) || [],
                        include_missing: true
                    }
                } else if (attribute.data_type === 'float' || attribute.data_type === 'integer') {
                    return {
                        // name: attribute.name,
                        attribute_id: attribute._id,
                        data_type: attribute.data_type,
                        attribute_value_from: attribute.min_value || 0,
                        attribute_value_to: attribute.max_value || 100,
                        include_missing: true
                    }
                } else {
                    return {
                        // name: attribute.name,
                        attribute_id: attribute._id,
                        data_type: attribute.data_type,
                        attribute_value: attribute.default_value || '',
                        include_missing: true
                    }
                }
            });
            const newArrList = newArr.map((item: any) => {
                if (item.data_type === 'list') {
                    return {
                        ...item,
                        attributes_lists: [...item.attributes_lists, {
                            id: "not_selected",
                            name: "Not Selected",
                            value: "notselected",
                            selected: true
                        }]
                    }
                }
                return item;
            }) || [];
            setAttributeFilterArr(newArrList);
        }
    }, [opportunityAttributeConfig?.data?.data?.data, dummyState]);
    useMemo(() => {
        if (opportunityStatusesFromConfig?.data?.value) {
            const valueObject = opportunityStatusesFromConfig.data.value;
            const opportunityActionSubStatusArray = Object.entries(valueObject).flatMap(([mainBucket, items]) =>
                (Array.isArray(items) ? items : []).map((item: any) => ({
                    id: Math.random().toString(36).substring(2, 9), // random id
                    bucket: item,          // now holds the string
                    mainBucket: mainBucket, // parent key
                    selected: true
                }))
            );
            const Ignored = {
                id: Math.random().toString(36).substring(2, 9),
                bucket: 'Ignored',
                mainBucket: 'Ignored',
                selected: false
            }
            setCheckboxItemStatus([...opportunityActionSubStatusArray, Ignored]);
        }
        return;
    }, [opportunityStatusesFromConfig, dummyState]);

    // Sort the Stage column list_options in the same order as actionTaken
    const sortedGridViewConfig = useMemo(() => {
        if (!opportunityGridViewConfig?.data?.data?.data?.[0]?.configuration) {
            return opportunityGridViewConfig?.data?.data?.data?.[0]?.configuration;
        }

        const config = opportunityGridViewConfig.data.data.data[0].configuration;
        const rawStatuses = opportunityStatusesFromConfig?.data?.value;

        if (!rawStatuses) {
            return config;
        }

        // Create flattened array in the order from config
        const orderedStatuses: string[] = [];
        Object.entries(rawStatuses as Record<string, string[]>).forEach(([key, values]) => {
            values.forEach((subStatus: string) => {
                orderedStatuses.push(subStatus);
            });
        });

        // Update the action_sub_status column's list_options
        return config.map((col: any) => {
            if (col.path === 'action_sub_status' && col.list_options) {
                // Sort list_options based on orderedStatuses
                const sortedOptions = [...col.list_options].sort((a: any, b: any) => {
                    const indexA = orderedStatuses.indexOf(a.value);
                    const indexB = orderedStatuses.indexOf(b.value);
                    return indexA - indexB;
                });
                return { ...col, list_options: sortedOptions };
            }
            return col;
        });
    }, [opportunityGridViewConfig, opportunityStatusesFromConfig]);

    const updateItemFunc = async (data: any) => {
        const forwardData = {
            id: data._id,
            data: {
                action_sub_status: data.firstUpdatedDataField,
                action_status: data.secondUpdatedDataField
            },
            queryKey: queryKey
        };
        try {
            return await updateInsight.mutateAsync(forwardData);
        } catch (error) {
            throw error; // Re-throw so KanbanView can handle it
        }
    }

    interface HandleUpdateAdvancedFiltersProps {
        valueFrom: number | undefined;
        valueTo: number | undefined;
        generatedBy: any[];
        createdDateFrom: Date | null | undefined;
        createdDateTo: Date | null | undefined;
        targetClosureDateFrom: Date | null | undefined;
        targetClosureDateTo: Date | null | undefined;
        attributeFilterArr: any[];
    }
    const onUpdateAdvancedFilters = (filters: HandleUpdateAdvancedFiltersProps): void => {
        setValueFrom(filters.valueFrom);
        setValueTo(filters.valueTo);
        setCreatedDateFrom(filters.createdDateFrom);
        setCreatedDateTo(filters.createdDateTo);
        setTargetClosureDateFrom(filters.targetClosureDateFrom);
        setTargetClosureDateTo(filters.targetClosureDateTo);
        setAttributeFilterArr(filters.attributeFilterArr);
    }

    const setFiltersBackToDefault = () => {
        setDummyState(prev => !prev); // Toggle dummy state to force re-render
        setValueFrom(undefined);
        setValueTo(undefined);
        setCreatedDateFrom(null);
        setCreatedDateTo(null);
        setTargetClosureDateFrom(null);
        setTargetClosureDateTo(null);
        setSearchText('');
        // setCheckboxAssignedTo([]);
    }
    const dataFieldToMatchBuckets = 'action_sub_status';

    // Save function for grid editable cells
    const handleGridSave = async (fieldPath: string, newValue: any, rowData: any, configId: string) => {
        try {
            // Try different data structures - the API might expect different formats
            const dataStructures = [
                { [fieldPath]: newValue },
                { empty_cell: fieldPath },
                { value: newValue, field: fieldPath },
                { field_name: fieldPath, field_value: newValue },
                { column_name: fieldPath, column_value: newValue }
            ];
            const data = newValue === undefined ? dataStructures[1] : dataStructures[0];
            debouncedSave(rowData._id, configId, data, fieldPath);

        } catch (error: any) {
            throw error; // Re-throw so the EditableCell can handle the error
        }
    };
    // function downloadPDF() {
    //         const element = document.getElementById('deatail-grid-view');
    //         const opt = {
    //             margin: 10,
    //             filename: 'opportunity_grid_view.pdf',
    //             image: { type: 'jpeg', quality: 0.98 },
    //             html2canvas: { scale: 2 },
    //             jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
    //         };
    //         html2pdf().set(opt).from(element).save();
    //     }
    return (
        <div className="h-full overflow-hidden">
            <OpportunityFilterBar
                opportunitiesData={opportunitiesData?.data}
                buckets={checkboxItemStatus}
                checkboxItemsCustomer={checkboxItemsCustomer}
                setCheckboxItemsCustomer={setCheckboxItemsCustomer}
                checkboxItemStatus={checkboxItemStatus}
                setCheckboxItemStatus={setCheckboxItemStatus}
                selectedSortBy={selectedSortBy}
                setSelectedSortBy={setSelectedSortBy}
                checkboxAssignedTo={checkboxAssignedTo}
                setCheckboxAssignedTo={setCheckboxAssignedTo}
                checkboxCreatedBy={checkboxCreatedBy}
                setCheckboxCreatedBy={setCheckboxCreatedBy}
                searchText={searchText}
                setSearchText={setSearchText}
                advancedFilters={advancedFiltersOpen}
                setAdvancedFilters={setAdvancedFiltersOpen}
                view={view}
                setView={setView}
                setCreateOpportunityModal={setCreateOpportunityModal}
                setFiltersBackToDefault={setFiltersBackToDefault}
                dummyState={dummyState}
            />
            <div className="h-[calc(100vh-180px)]">
                {view === 'kanban' ? (
                    <KanbanView
                        buckets={checkboxItemStatus} // Should be string array, not boolean
                        dataFieldToMatchBuckets={dataFieldToMatchBuckets}
                        filterdListOfItems={opportunitiesData?.data?.data ?? []}
                        typeOfItemSingular={'Opportunity'}
                        typeOfItemPlural={'opportunities'}
                        itemValueField={'opportunity_value'}
                        currencySymbol={
                            opportunitiesData?.data?.client_currency?.currency_symbol
                        }
                        currency={opportunitiesData?.data?.client_currency?.currency}
                        isLoading={isLoading}
                        updateItemFunc={updateItemFunc}
                        onCreateNew={() => setCreateOpportunityModal(true)}
                        itemDetailView={(id: any) => {
                            setOpportunitiesSidebarViewOpen(true);
                            setSelectedOpportunityId(id);
                        }}
                    >
                        {(props: any) => <OpportunityCard {...props} />}
                    </KanbanView>) :
                    (<OpportunityGridView
                        configuration={sortedGridViewConfig}
                        data={gridData}
                        isLoading={isLoading}
                        clientCurrency={opportunitiesData?.data?.client_currency}
                        itemDetailView={(rowData: any) => {
                            setOpportunitiesSidebarViewOpen(true);
                            setSelectedOpportunityId(rowData._id);
                        }}
                        onSave={handleGridSave}
                        onLoadMore={() => fetchNextPage()}
                        hasNextPage={gridHasNextPage}
                        isFetchingNextPage={isGridFetchingNextPage}
                        totalRows={gridTotal}
                    />)}
            </div>
            {
                !!createOpportunityModal && (
                    <CreateOpportunityModal
                        createOpportunityModal={createOpportunityModal}
                        setCreateOpportunityModal={setCreateOpportunityModal}
                    />
                )
            }
            <OpportunityAdvancedFilter
                isOpen={advancedFiltersOpen}
                onClose={() => setAdvancedFiltersOpen(false)}
                valueFrom={valueFrom}
                valueTo={valueTo}
                createdDateFrom={createdDateFrom}
                createdDateTo={createdDateTo}
                targetClosureDateFrom={targetClosureDateFrom}
                targetClosureDateTo={targetClosureDateTo}
                opportunityAttributeConfig={
                    opportunityAttributeConfig?.data?.data?.data
                }
                attributeFilterArr={attributeFilterArr}
                onUpdate={onUpdateAdvancedFilters}
                opportunitiesData={opportunitiesData?.data}
            />
            <OpportunityDetailsSideBarView
                isOpen={opportunitiesSidebarViewOpen}
                onClose={() => setOpportunitiesSidebarViewOpen(false)}
                selectedOpportunityId={selectedOpportunityId}
            />
        </div >
    );
};

export default Opportunities;
