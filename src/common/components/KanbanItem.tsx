import React from 'react';

interface KanbanItemProps {
    item: any;
    dataFieldToMatchBuckets: string;
    isDraggable: boolean;
    setDraggedItem: (item: any) => void;
    draggedItem: any | null;
    draggedOver: any | null;
    draggedFrom: any | null;
    setDraggedFrom: (bucket: any) => void;
    setDragOverIndex: (index: number | null) => void;
    currentColumn: any;
    children: React.ReactNode;
    onClick?: () => void;
}

const KanbanItem: React.FC<KanbanItemProps> = ({
    item,
    dataFieldToMatchBuckets,
    isDraggable,
    setDraggedItem,
    draggedItem,
    draggedOver,
    draggedFrom,
    setDraggedFrom,
    setDragOverIndex,
    currentColumn,
    children,
    onClick,
}) => {
    const cardRef = React.useRef<HTMLDivElement>(null);

    const onDragStart = (event: React.DragEvent<HTMLDivElement>) => {
        setDraggedItem(item);
        setDraggedFrom(currentColumn);
        event.dataTransfer.effectAllowed = 'move';
        
        // Create a fully visible custom drag image with exact size
        if (cardRef.current) {
            const dragImg = cardRef.current.cloneNode(true) as HTMLElement;
            dragImg.style.position = 'absolute';
            dragImg.style.top = '-9999px';
            dragImg.style.left = '-9999px';
            dragImg.style.width = '470px';
            dragImg.style.opacity = '1';
            dragImg.style.transform = 'rotate(3deg)';
            dragImg.style.backgroundColor = 'white';
            dragImg.style.boxShadow = '0 10px 25px rgba(0,0,0,0.15)';
            document.body.appendChild(dragImg);
            
            event.dataTransfer.setDragImage(dragImg, 235, 20);
            
            setTimeout(() => {
                if (document.body.contains(dragImg)) {
                    document.body.removeChild(dragImg);
                }
            }, 0);
        }
    };

    const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        const status = item?.[dataFieldToMatchBuckets];
        if (draggedOver !== status) {
            setDragOverIndex(item?._id || item?.id);
        }
    };

    const onDragEnd = (event: React.DragEvent<HTMLDivElement>) => {
        // Reset all drag states to prevent skeleton from getting stuck
        setTimeout(() => {
            setDraggedItem(null);
            setDraggedFrom(null);
            setDragOverIndex(null);
        }, 0);
    };

    // Check if this specific card is being dragged - use proper ID comparison
    const isDraggedItem = draggedItem && (
        (draggedItem._id && item._id && draggedItem._id === item._id) || 
        (draggedItem.id && item.id && draggedItem.id === item.id)
    );
    const isInSourceColumn = isDraggedItem && draggedFrom && draggedFrom.bucket?.toLowerCase() === currentColumn.bucket?.toLowerCase();

    // Show Moving placeholder in place of the dragged card in source column ONLY
    if (isInSourceColumn) {
        return (
            <div className="mb-4">
                <div className="card shadow-none !border border-dashed border-[#9CA3AF] rounded-[12px] bg-[#F3F4F6] h-[150px] flex items-center justify-center">
                    <span className="text-[#6B7280] text-sm">Moving...</span>
                </div>
            </div>
        );
    }

    return (
        <div
            onClick={isDraggedItem ? undefined : onClick}
            onDragOver={onDragOver}
            className="mb-4"
        >
            <div
                ref={cardRef}
                draggable={isDraggable}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                className="card shadow-none !border border-[#E4E7EC] rounded-[12px] cursor-pointer flex gap-0 hover:shadow-md [&:is(:active)]:opacity-100"
                style={{ WebkitUserDrag: 'element' } as React.CSSProperties}
            >
                {children}
            </div>
        </div>
    );
}

export default KanbanItem;