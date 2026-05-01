import React, { useMemo } from 'react';

import GridView from '../../../../../common/components/GridView';
import { GridConfiguration, OpportunityData } from '../types/opportunityTypes';
import EditableCell from '../../../../../common/components/EditableCell';
import { ColumnDef } from '@tanstack/react-table';
import dayjs from 'dayjs';

interface OpportunityGridViewProps {
    configuration?: GridConfiguration[];
    data?: OpportunityData[];
    isLoading?: boolean;
    clientCurrency?: {
        currency: string;
        currencySymbol: string;
    };
    itemDetailView: (rowData: any) => void;
    onSave?: (fieldPath: string, newValue: any, rowData: any, configId: string) => Promise<void>;
    // Infinite scroll props
    onLoadMore?: () => void;
    hasNextPage?: boolean;
    isFetchingNextPage?: boolean;
    totalRows?: number;
}

const OpportunityGridView = ({ configuration = [], data = [], isLoading = false, clientCurrency, onSave, itemDetailView = () => { }, onLoadMore, hasNextPage = false, isFetchingNextPage = false, totalRows }: OpportunityGridViewProps) => {
    // Dummy save function if none provided
    const defaultSave = async (fieldPath: string, newValue: any, rowData: any, configId: string) => {
        return Promise.resolve();
    };

    const saveFunction = onSave || defaultSave;
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
                    const option = config.list_options.find(opt => opt.value === value);
                    return option ? option.label : value;
                }
                return value ? 'Yes' : 'No';

            case 'text':
                if (config.list_options && !config.is_multi_select) {
                    const option = config.list_options.find(opt => opt.value === value);
                    if (config.path === 'created_by' && (option === undefined || option === null || !option || (Array.isArray(option) && option.length === 0))) {
                        return 'AI Agent';
                    } else {
                        return option ? option.label : value;
                    }
                }
                if (config.list_options && config.is_multi_select && Array.isArray(value)) {
                    const labels = value.map(v => {
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

            default:
                return value;
        }
    };

    // Helper function to create column from configuration
    const createColumnFromConfig = (config: GridConfiguration): ColumnDef<any> => {
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
                const value = config.path === 'created_by' && (info.getValue() === null || info.getValue() === undefined || info.getValue() === '') ? 'ai_agent' : info.getValue();
                const rowData = info.row.original;
                if (config.path === 'created_by' ? (value !== 'ai_agent' && config.editable) : config.editable) {
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

                if (config.path === 'title' && typeof value === 'string') {
                    return <span className="text-blue-600 cursor-pointer p-2 block w-full h-full flex items-start" onClick={() => itemDetailView(rowData)} title={value}>{value}</span>;
                }
                // if (config.path === 'created_by' && typeof value === 'string') {
                //     return <span className="text-blue-600 cursor-pointer" onClick={() => itemDetailView(rowData._id)}>{value}</span>;
                // }
                return <span className="p-2 block w-full h-full flex items-start" title={formatCellValue(value, config)}>{formatCellValue(value, config)}</span>; // ${config.editable ? '' : 'w-full py-2 bg-gray-100 '}
            }
        };
        return baseColumn;
    };

    // Transform configuration into column definitions
    const columns: ColumnDef<any>[] = useMemo(() => {
        if (!configuration || configuration.length === 0) return [];

        // Filter visible configurations
        const visibleConfigs = configuration.filter(config => config.visible);

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
    }, [configuration, clientCurrency]);

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
                <div className="relative h-full pl-14">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-32">
                            <div className="text-gray-500">Loading...</div>
                        </div>
                    ) : (
                        <GridView
                            columns={columns}
                            data={data}
                            enableColumnPinning={true}
                            showPinningControls={false}
                            pinnedColumns={pinnedColumns}
                            tableclassName="mr-14"
                            theadclassName="sticky top-0 bg-white z-50"
                            divclassName="overflow-scroll max-h-[calc(100vh-180px)] scroll"
                            trclassName="bg-white box-border"
                            thclassName="p-2 text-left text-[14px] font-normal text-[#202B37] font-semibold box-border overflow-hidden"
                            tdclassName="box-border text-[14px] font-normal text-[#202B37] text-wrap overflow-hidden !p-0"
                            tbodyclassName=""
                            isTfoot={false}
                            showColumnFilters={false}
                            emptyPlaceHolderForTable="No opportunities found"
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

export default OpportunityGridView;