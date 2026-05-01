import React, { useMemo, useCallback } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import GridView from '../../../../common/components/GridView';
import dayjs from 'dayjs';
import { GridConfiguration } from '../../insights/opportunities/types/opportunityTypes';
import EditableCell from '../../../../common/components/EditableCell';
import { Edit2Icon } from 'lucide-react';

interface OpportunityGridViewProps {
    configuration: GridConfiguration[];
    viewConfig: any;
    data: any[];
    isLoading?: boolean;
    clientCurrency?: {
        currency: string;
        currencySymbol: string;
    };
    itemDetailView: (rowData: any) => void;
    onSave?: (fieldPath: string, newValue: any, rowData: any) => Promise<void>;
    // Checkbox selection props
    selectedRowIds?: Set<string>;
    onSelectedRowIdsChange?: (ids: Set<string>) => void;
    // Infinite scroll props
    onLoadMore?: () => void;
    hasNextPage?: boolean;
    isFetchingNextPage?: boolean;
    totalRows?: number;
    setOpenModal?: (modalState: { open: boolean; type: string; content_type: string; header: string; title: string; saveFunc: () => void }) => void;
}

const MainGridView = ({ configuration: configProp, viewConfig, data: dataProp, isLoading = false, clientCurrency, onSave, selectedRowIds = new Set(), onSelectedRowIdsChange, itemDetailView = () => { }, onLoadMore, hasNextPage = false, isFetchingNextPage = false, totalRows, setOpenModal }: OpportunityGridViewProps) => {
    // Dummy save function if none provided
    const configuration = configProp || [];
    const data = dataProp || [];

    const defaultSave = async (fieldPath: string, newValue: any, rowData: any) => {
        return Promise.resolve();
    };

    const saveFunction = onSave || defaultSave;

    // ── Checkbox selection helpers ────────────────────────────────────────
    const toggleRowSelection = useCallback((rowId: string) => {
        const next = new Set(selectedRowIds);
        if (next.has(rowId)) {
            next.delete(rowId);
        } else {
            next.add(rowId);
        }
        onSelectedRowIdsChange?.(next);
    }, [selectedRowIds, onSelectedRowIdsChange]);

    const toggleSelectAll = useCallback(() => {
        if (selectedRowIds.size > 0) {
            // Deselect all
            onSelectedRowIdsChange?.(new Set());
        } else {
            // Select all currently loaded rows
            const allIds = new Set(data.map((row: any) => row?.[viewConfig?.['unique_id_field']] || row._id as string).filter(Boolean));
            onSelectedRowIdsChange?.(allIds);
        }
    }, [selectedRowIds, data, onSelectedRowIdsChange, viewConfig]);

    // Helper function to format cell values based on formatter type
    const formatCellValue = (value: any, config: GridConfiguration) => {
        if (value === null || value === undefined) return '';

        switch (config.formatter) {
            case 'currency':
                if (typeof value === 'number') {
                    const currency = clientCurrency?.currency || 'USD';
                    const symbol = clientCurrency?.currencySymbol || '$';

                    return new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: currency,
                        currencyDisplay: 'symbol'
                    }).format(value);
                }
                return value;

            case 'datetime':
                if (value) {
                    const date = new Date(value);
                    return dayjs(date).format('MMMM D, YYYY');
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
                if (config.list_options && config.list_options.length > 0 && config.is_multi_select && Array.isArray(value)) {
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
                if ((config.list_options && config.list_options.length === 0) && config.is_multi_select && Array.isArray(value) && value.length > 0) {
                    return value.join(', ');
                }
                return value;

            case 'number':
                if (typeof value === 'number') {
                    return value.toLocaleString();
                }
                return value;
            default:
                return value;
        }
    };

    // Helper function to create column from configuration
    const createColumnFromConfig = (config: GridConfiguration): ColumnDef<any> => {
        // ── Checkbox column ──────────────────────────────────────────────
        if (config.data_type === 'checkbox' || config.formatter === 'checkbox') {
            return {
                accessorKey: config.path,
                enableSorting: false,
                enableResizing: false,
                size: config?.width || 40,
                minSize: 40,
                maxSize: 70,
                meta: { isEditable: config.editable || true },
                header: () => {
                    const hasSelection = selectedRowIds.size > 0;
                    return (
                        <div
                            role="button"
                            aria-label={hasSelection ? 'Deselect all' : 'Select all'}
                            className="flex items-center justify-center cursor-pointer select-none w-full h-full"
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleSelectAll();
                            }}
                        >
                            {hasSelection ? (
                                /* Minus icon – deselect all */
                                <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect x="1" y="1" width="18" height="18" rx="6" fill="none" stroke="#CED2DA" strokeWidth="1.5" />
                                    <rect x="5" y="9" width="10" height="1.3" rx="0" fill="#97A1AF" />
                                </svg>
                            ) : (
                                /* Plus icon – select all */
                                <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect x="1" y="1" width="18" height="18" rx="6" fill="white" stroke="#CED2DA" strokeWidth="1.5" />
                                    {/* <rect x="9.5" y="5" width="1.3" height="10" rx="0" fill="#97A1AF" />
                                    <rect x="5" y="9.5" width="10" height="1.3" rx="0" fill="#97A1AF" /> */}
                                </svg>
                            )}
                        </div>
                    );
                },
                cell: (info) => {
                    const rowData = info.row.original;
                    const rowId = rowData?.[viewConfig?.['unique_id_field']] || rowData?._id as string;
                    const isSelected = rowId ? selectedRowIds.has(rowId) : false;

                    return (
                        <div
                            role="button"
                            aria-label={isSelected ? 'Deselect row' : 'Select row'}
                            className="flex items-center justify-center cursor-pointer select-none w-full h-full"
                            onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                e.nativeEvent.stopImmediatePropagation();
                                if (rowId) toggleRowSelection(rowId);
                            }}
                        >
                            {isSelected ? (
                                /* Blue checked box */
                                <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect x="1" y="1" width="18" height="18" rx="6" fill="#2563EB" stroke="#2563EB" strokeWidth="1.5" />
                                    <path d="M6 10L9 13L14 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            ) : (
                                /* Empty box */
                                <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect x="1" y="1" width="18" height="18" rx="6" fill="white" stroke="#CED2DA" strokeWidth="1.5" />
                                </svg>
                            )}
                        </div>
                    );
                },
            };
        }

        if (config.data_type === 'pencil' || config.formatter === 'pencil') {
            return {
                header: config.label,
                accessorKey: config.path,
                enableSorting: false,
                enableResizing: false,
                size: config?.width || 40,
                minSize: 40,
                maxSize: 70,
                meta: { isEditable: config.editable || true },
                cell: (info) => {
                    const rowData = info.row.original;
                    return (
                        <div className='w-full h-full flex items-center justify-center cursor-pointer select-none' onClick={() => itemDetailView(rowData)}>
                            <Edit2Icon className="w-4 h-4 text-blue-600" />
                        </div>
                    );
                },
            };
        }

        const checkEditable = (config: any, rowData: any) => {
            if (config?.editable && config?.edit_condition) {
                return Object.entries(config.edit_condition).every(
                    ([key, value]) => rowData?.[key] === value
                );
            }
            return config?.editable ?? false;
        };

        const baseColumn: ColumnDef<any> = {
            header: config.label,
            accessorKey: config.path,
            enableSorting: config?.enablesorting || false,
            enableResizing: true,
            meta: {
                isEditable: config.editable || false,
            },
            // enableColumnFilter: true,
            size: config.width || 200,
            minSize: 50,
            maxSize: 800,
            cell: (info) => {
                const value = info.getValue();
                const rowData = info.row.original;
                const isEditable = checkEditable(config, rowData);

                if (isEditable && config.formatter !== 'action') {
                    return (
                        <div className="w-full h-full">
                            <EditableCell
                                value={value}
                                config={config}
                                rowData={rowData}
                                onSave={saveFunction}
                                itemDetailView={itemDetailView}
                                onClickFieldToOpenDetailView="title"
                                clientCurrency={clientCurrency}
                            />
                        </div>
                    );
                }
                if (config.formatter === 'action') {
                    return <div className='text-[#202B37] flex items-center justify-start'>
                        {config?.actions ? config?.actions?.length > 0 && config?.actions?.map((action: any) => (
                            <span className={`h-4 border-r-[1px] border-gray-200 last:border-r-0 px-2 cursor-pointer flex items-center justify-center ${action?.id === 'delete' ? 'text-red-600' : 'text-blue-600'}`} key={action.label} onClick={() => {
                                if (action?.behavior?.action_type === 'OPEN_MODEL') {
                                    setOpenModal && setOpenModal({ open: true, type: action?.behavior?.type || '', content_type: action?.behavior?.content_type || '', header: action?.behavior?.header || '', title: action?.behavior?.title || '', saveFunc: () => saveFunction("actions", action?.id, rowData) })
                                } else {
                                    saveFunction("actions", action?.id, rowData)
                                }
                            }}>{action.label}</span> //saveFunction("actions", action?.id, rowData)
                        )) : (<span className="text-gray-400 italic">No action</span>)}
                    </div>;
                }
                return <span className={`p-2 block w-full h-full flex items-start ${isEditable ? '' : ''}`} title={formatCellValue(value, config)}>{formatCellValue(value, config)}</span>; // ${config.editable ? '' : 'w-full py-2 bg-gray-100 '}
            }
        };
        return baseColumn;
    };

    // Transform configuration into column definitions
    const columns: ColumnDef<any>[] = useMemo(() => {
        if (!configuration || configuration?.length === 0) return [];

        // Filter visible configurations
        const visibleConfigs = configuration?.filter(config => config.visible);

        // Check if any column has a valid group
        const hasValidGroups = visibleConfigs.some(config =>
            config.group &&
            config.group.trim() !== '' &&
            config.group !== 'undefined'
        );

        // If no valid groups exist, return flat columns without grouping
        if (!hasValidGroups) {
            return visibleConfigs
                .sort((a, b) => a.order - b.order)
                .map(config => createColumnFromConfig(config));
        }

        // Group configurations by group, treating empty/undefined groups as no-group
        const groupedConfigs = visibleConfigs.reduce((acc, config) => {
            // Determine the group key - use a special key for ungrouped columns
            let groupKey = 'NO_GROUP';
            if (config.group && config.group.trim() !== '' && config.group !== 'undefined') {
                groupKey = config.group.trim();
            }

            if (!acc[groupKey]) {
                acc[groupKey] = [];
            }
            acc[groupKey].push(config);
            return acc;
        }, {} as Record<string, GridConfiguration[]>);

        // Create columns based on groups
        const result: ColumnDef<any>[] = [];

        Object.entries(groupedConfigs).forEach(([groupKey, configs]) => {
            // Sort configs by order within the group
            const sortedConfigs = configs.sort((a, b) => a.order - b.order);

            if (groupKey === 'NO_GROUP') {
                // Add ungrouped columns as flat columns
                sortedConfigs.forEach(config => {
                    result.push(createColumnFromConfig(config));
                });
            } else {
                // Create grouped column (even for single columns with valid group names)
                result.push({
                    header: groupKey,
                    columns: sortedConfigs.map(config => createColumnFromConfig(config))
                });
            }
        });

        // Sort the final result by the minimum order of each group/column
        return result.sort((a, b) => {
            const getMinOrder = (col: any) => {
                if ('columns' in col && col.columns) {
                    // For grouped columns, get the minimum order from sub-columns
                    return Math.min(...col.columns.map((subCol: any) => {
                        const config = visibleConfigs.find(c => c.path === subCol.accessorKey);
                        return config ? config.order : Infinity;
                    }));
                } else {
                    // For flat columns, get the order from configuration
                    const config = visibleConfigs.find(c => c.path === col.accessorKey);
                    return config ? config.order : Infinity;
                }
            };

            return getMinOrder(a) - getMinOrder(b);
        });
    }, [configuration, clientCurrency, selectedRowIds, toggleRowSelection, toggleSelectAll]);

    const pinnedColumns = useMemo(() => {
        if (!configuration || configuration.length === 0) {
            return { left: [], right: [] };
        }

        const leftPinnedColumns: string[] = [];
        const rightPinnedColumns: string[] = [];

        // Filter visible columns and check their freeze property
        configuration
            .filter(config => config.visible)
            .forEach(config => {
                if (config.freeze === 'left') {
                    leftPinnedColumns.push(config.path);
                } else if (config.freeze === 'right') {
                    rightPinnedColumns.push(config.path);
                }
            });

        return {
            left: leftPinnedColumns,
            right: rightPinnedColumns
        };
    }, [configuration]);
    // <div className="w-[calc(100%+(100vw-1232px)/2)] pl-[calc((100vw-1232px)/2)] h-full bg-white rounded-lg overflow-y-auto scroll">
    return (
        <div className='w-full h-full'>
            <div className="w-full h-full bg-white rounded-lg">
                <div className="h-full ml-6">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-32">
                            <div className="text-gray-500">Loading</div>
                        </div>
                    ) : (
                        <GridView
                            columns={columns}
                            data={data}
                            enableColumnPinning={true}
                            showPinningControls={false}
                            pinnedColumns={pinnedColumns}
                            tableclassName="mr-5"
                            theadclassName="sticky top-0 bg-white z-50"
                            divclassName="overflow-scroll max-h-[calc(100vh-176px)] scroll"
                            trclassName="bg-white box-border"
                            thclassName="p-2 text-left text-[14px] font-normal text-[#202B37] font-semibold box-border overflow-hidden"
                            tdclassName="box-border text-[14px] font-normal text-[#202B37] text-wrap overflow-hidden !p-0"
                            tbodyclassName=""
                            isTfoot={false}
                            showColumnFilters={false}
                            emptyPlaceHolderForTable="No data found"
                            onLoadMore={onLoadMore}
                            hasNextPage={hasNextPage}
                            isFetchingNextPage={isFetchingNextPage}
                            totalRows={totalRows}
                        />
                    )}
                </div>
            </div>
        </div>


    );
};

export default MainGridView;