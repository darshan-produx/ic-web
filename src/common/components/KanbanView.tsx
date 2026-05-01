import React, { useState, useEffect, useRef } from 'react';
// import { FilePlusIcon } from '../../app/assests/icons/icons';
import { Plus } from 'lucide-react';
import { toast } from 'react-toastify';
import { formatRevenue } from '../SupportFunctions';
import KanbanItem from './KanbanItem';

interface KanbanItemProps {
    ele: any;
}
interface Bucket {
    id: string;
    bucket: string;
    mainBucket?: string;
}
interface KanbanViewProps {
  buckets: any[];
  dataFieldToMatchBuckets: string;
  filterdListOfItems: any[];
  typeOfItemSingular?: string;
    typeOfItemPlural?: string;
  itemValueField?: string;
  currencySymbol?: string;
  currency?: string;
  children?: (props: KanbanItemProps) => React.ReactNode;
  isLoading?: boolean;
  needToShowCreateNewInBucket?: boolean;
  updateItemFunc?: any;
  onCreateNew?: () => void;
  itemDetailView?: (id: any) => void;
}

const KanbanView: React.FC<KanbanViewProps> = ({
    buckets,                    //columnsArray,
    dataFieldToMatchBuckets,  // data field to match with column,
    filterdListOfItems,  //list of items
    typeOfItemSingular = '', // types of data item like task, opportunity
    typeOfItemPlural = '', // types of data item like tasks, opportunities
    itemValueField = '', // field to calculate total value in each column
    currencySymbol = '$',
    currency = 'USD',
    children,
    isLoading = false,
    needToShowCreateNewInBucket = false,
    updateItemFunc,
    onCreateNew,
    itemDetailView,
}) => {
  const [draggedOver, setDraggedOver] = useState<Bucket | null>(null);
  const [draggedItem, setDraggedItem] = useState<any | null>(null);
  const [draggedFrom, setDraggedFrom] = useState<Bucket | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const columnRefs = useRef<(HTMLDivElement | null)[]>([]);
  const hasScrolledRef = useRef<boolean>(false);

  // Auto-scroll to first non-empty column on page load (only once)
  useEffect(() => {
    if (!isLoading && filterdListOfItems?.length > 0 && !hasScrolledRef.current) {
      const selectedBuckets = buckets.filter((bucket) => bucket.selected);
      const firstNonEmptyIndex = selectedBuckets.findIndex((column) => {
        const count = filterdListOfItems.filter(
          (ele: any) =>
            ele?.[dataFieldToMatchBuckets]?.toLowerCase() ===
            column?.bucket?.toLowerCase()
        ).length;
        return count > 0;
      });

      if (firstNonEmptyIndex !== -1 && columnRefs.current[firstNonEmptyIndex]) {
        columnRefs.current[firstNonEmptyIndex]?.scrollIntoView({
          behavior: 'smooth',
          inline: 'start',
          block: 'nearest',
        });
        hasScrolledRef.current = true;
      }
    }
  }, [isLoading, filterdListOfItems, buckets, dataFieldToMatchBuckets]);

  // Cleanup drag state on unmount or when critical data changes
  useEffect(() => {
    // Global dragend listener to ensure cleanup
    const handleGlobalDragEnd = () => {
      setDraggedItem(null);
      setDraggedFrom(null);
      setDraggedOver(null);
      setDragOverIndex(null);
    };

    document.addEventListener('dragend', handleGlobalDragEnd);
    document.addEventListener('drop', handleGlobalDragEnd);

    return () => {
      document.removeEventListener('dragend', handleGlobalDragEnd);
      document.removeEventListener('drop', handleGlobalDragEnd);
      setDraggedItem(null);
      setDraggedFrom(null);
      setDraggedOver(null);
      setDragOverIndex(null);
    };
  }, []);

  const onDragOver = (event: React.DragEvent, column: Bucket) => {
    event.preventDefault();
    setDraggedOver(column);
  };

  const onDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    // Reset draggedOver when leaving the column
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const x = event.clientX;
    const y = event.clientY;
    
    // Check if mouse is outside the column bounds
    if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
      setDraggedOver(null);
    }
  };

    const onDrop = async (event: React.DragEvent) => {
        event.preventDefault();
        if (draggedOver === null || draggedItem === null) {
            setDraggedOver(null);
            setDraggedItem(null);
            setDraggedFrom(null);
            setDragOverIndex(null);
            return;
        }
        if (draggedOver?.bucket?.toLowerCase() === draggedItem?.[dataFieldToMatchBuckets]?.toLowerCase()) {
            setDraggedOver(null);
            setDraggedItem(null);
            setDraggedFrom(null);
        } else {
            if (draggedItem && draggedOver && updateItemFunc) {
                const updatedItem = {
                    ...draggedItem, firstUpdatedDataField: draggedOver?.bucket, secondUpdatedDataField: draggedOver?.mainBucket
                        || ''
                };
                try {
                    await updateItemFunc(updatedItem);
                    toast.success(`${typeOfItemSingular} updated successfully`);
                } catch (error) {
                    toast.error(`Failed to update ${typeOfItemSingular}`);
                    console.error('Error updating item:', error);
                }
            }
        }
        // Reset drag state
        setDraggedOver(null);
        setDraggedItem(null);
        setDraggedFrom(null);
        setDragOverIndex(null);
    };

  const handleCreateNew = () => {
    if (onCreateNew) {
      onCreateNew();
    } else {
      toast.info('Create new functionality not implemented');
    }
  };
  const getColumnCount = (column: Bucket) => {
    return filterdListOfItems?.filter(
      (ele: any) =>
        ele?.[dataFieldToMatchBuckets]?.toLowerCase() ===
        column?.bucket?.toLowerCase()
    ).length;
  };

    const getColumnTotalValue = (column: Bucket) => {
        return itemValueField ? formatRevenue(filterdListOfItems.filter((item) => item[dataFieldToMatchBuckets]?.toLowerCase() === column.bucket.toLowerCase()).reduce((sum, item) => sum + (item[itemValueField] || 0), 0), currency) : 'NA';
    };
    return (
        <div className="h-full">
            {isLoading ? (
                <div className="h-full flex flex-col items-center justify-center space-y-2">
                    <div
                        className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-white border-r-[#80c2fe] align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
                        role="status"
                    >
                        <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                            Loading...
                        </span>
                    </div>
                </div>
            ) : (
                <div className="flex border-t-[1px] border-gray-200 bg-[#F9FAFB] overflow-x-auto pl-7 overflow-y-hidden scroll h-full">
                    {filterdListOfItems?.length > 0 ? (
                        <div className="flex">
                            {buckets.filter((bucket) => bucket.selected).map((column, i) => {
                                const columnCount = getColumnCount(column);
                                const columnWidth = columnCount > 0 ? 'w-[470px]' : 'w-[150px]';
                                return (
                                <div
                                    key={i}
                                    ref={(el) => { columnRefs.current[i] = el; }}
                                    className={`column-container !scroll ${columnWidth} h-full ${columnCount > 0 ? '!px-[30px]' : '!px-[10px]'} overflow-y-auto border-r-[1px] last:border-none border-[#E4E7EC] box-border `}
                                    onDragOver={(e) => onDragOver(e, column)}
                                    onDragLeave={onDragLeave}
                                    onDrop={onDrop}
                                >
                                    <div className="mt-[24px] relative">
                                        <div className={`text-[#637083] font-normal text-[14px] flex items-center ${columnCount === 0 ? 'justify-center' : 'justify-between'} mb-4 cursor-pointer`}>
                                            <span className={`${columnCount === 0 ? 'truncate max-w-full text-center' : ''}`} title={column?.bucket}>{column?.bucket}</span>
                                            {columnCount > 0 && (
                                                <span className="flex items-center gap-1">
                                                    <span>{columnCount}</span>
                                                    {itemValueField && (<span className='h-3 border-l border-[#E4E7EC] mx-1'></span>)}
                                                    {itemValueField && (<span>{currencySymbol}{getColumnTotalValue(column)}</span>)}
                                                </span>
                                            )}
                                        </div>
                                        {/* <h6 className="text-[#637083] font-normal text-[14px] mb-4">
                                            {column?.bucket}
                                        </h6> */}
                                        {i === 0 && needToShowCreateNewInBucket && (
                                            <div className="my-4">
                                                <button
                                                    type="button"
                                                    onClick={handleCreateNew}
                                                    className="text-[#414E62] text-base btn text-left w-full rounded-md px-3 border-[#E4E7EC]"
                                                >
                                                    <Plus className="inline-block size-4 mr-2" />
                                                    <span className="align-middle relative top-[-1px]">
                                                        Create new {typeOfItemSingular?.toLocaleLowerCase() || 'item'}
                                                    </span>
                                                </button>
                                            </div>
                                        )}
                                        {filterdListOfItems?.length === 0 ? (
                                            <div className="flex justify-center mt-20 text-center">
                                                <span className="text-[24px] text-center text-gray-400">
                                                </span>
                                            </div>
                                        ) : (
                                            <>
                                                {/* Skeleton placeholder in destination column (where dropping to) - SHOW AT TOP */}
                                                {draggedItem && draggedOver?.bucket?.toLowerCase() === column?.bucket?.toLowerCase() && draggedItem?.[dataFieldToMatchBuckets]?.toLowerCase() !== column?.bucket?.toLowerCase() && (
                                                    <div className="mb-4 animate-pulse">
                                                        <div className="card shadow-none !border border-dashed border-[#3B82F6] rounded-[12px] bg-[#EFF6FF] h-[150px] flex items-center justify-center">
                                                            <span className="text-[#3B82F6] text-sm">Drop here</span>
                                                        </div>
                                                    </div>
                                                )}
                                                {filterdListOfItems?.filter((ele: any) => ele?.[dataFieldToMatchBuckets]?.toLowerCase() === column?.bucket?.toLowerCase()).map((ele: any, j: number) => (
                                                    <KanbanItem
                                                        key={ele._id || ele.id || j}
                                                        item={ele}
                                                        dataFieldToMatchBuckets={dataFieldToMatchBuckets}
                                                        isDraggable={true}
                                                        setDraggedItem={setDraggedItem}
                                                        draggedItem={draggedItem}
                                                        draggedOver={draggedOver}
                                                        draggedFrom={draggedFrom}
                                                        setDraggedFrom={setDraggedFrom}
                                                        setDragOverIndex={setDragOverIndex}
                                                        currentColumn={column}
                                                        onClick={() => itemDetailView?.(ele._id)}
                                                    >
                                                        {children &&
                                                            children({
                                                                ele,
                                                            })}
                                                    </KanbanItem>
                                                ))}
                                            </>
                                        )}
                                    </div>
                                </div>
                            );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col gap-5 items-center w-full h-full">
                            <div className="flex flex-col items-center justify-center pt-[150px] gap-6">
                                {/* <span>
                                    <FilePlusIcon className="text-[#141C24]" />
                                </span> */}
                                <div className="flex text-center !text-[#141C24] !font-normal">
                                    No {typeOfItemPlural?.toLocaleLowerCase() || 'items'} to show
                                    {/* <br /> Let's create a new {typeOfItem} to get started */}
                                </div>
                                <button
                                    type="button"
                                    onClick={handleCreateNew}
                                    className="h-8 w-fit bg-[#3B82F6] text-white text-nowrap px-3 rounded-[8px] text-[12px] font-medium box-border flex items-center justify-center"
                                >
                                    + Create new
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )} //
        </div>
    );
};

export default KanbanView;
//  h-[calc(100vh-8.875rem)]