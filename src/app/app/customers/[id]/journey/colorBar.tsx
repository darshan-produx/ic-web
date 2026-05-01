export const getIntensityColor = (intensity: number, value: number, isIssue?: boolean) => {
    // If not an issue, simply fill up to intensity with gray and rest with light gray
    if (!isIssue) {
        return value <= intensity ? 'bg-[#637083]' : 'bg-[#E4E7EC]';
    }

    // Original issue-based color logic
    switch (value) {
        case 1:
            return intensity <= 2 ? 'bg-[#637083]' : intensity > 3 ? 'bg-[#EF4444]' : 'bg-[#EAB308]';
        case 2:
            return intensity === 2 ? 'bg-[#637083]' : intensity === 1 ? 'bg-[#E4E7EC]' : intensity > 3 ? 'bg-[#EF4444]' : 'bg-[#EAB308]';
        case 3:
            return intensity < 3 ? 'bg-[#E4E7EC]' : intensity > 3 ? 'bg-[#EF4444]' : 'bg-[#EAB308]';
        case 4:
            return intensity < 4 ? 'bg-[#E4E7EC]' : 'bg-[#EF4444]';
        case 5:
            return intensity < 5 ? 'bg-[#E4E7EC]' : 'bg-[#EF4444]';
        default:
            return 'bg-[#E4E7EC]';
    }
};

interface ColorBarProps {
    intensity: number;
    is_deleted?: boolean;
    isClosed?: boolean;
    isIssue?: boolean;
}

export const ColorBar: React.FC<ColorBarProps> = ({ intensity, is_deleted, isClosed, isIssue }) => {
    return (
        <span className={`inline-flex items-center gap-[2px] flex-shrink-0 ${is_deleted ? 'opacity-50' : ''}`}>
            <span className={`${getIntensityColor(intensity, 1, isIssue)} h-[10px] w-[4px] min-w-[4px] rounded-[4px]`}></span>
            <span className={`${getIntensityColor(intensity, 2, isIssue)} h-[10px] w-[4px] min-w-[4px] rounded-[4px]`}></span>
            <span className={`${getIntensityColor(intensity, 3, isIssue)} h-[10px] w-[4px] min-w-[4px] rounded-[4px]`}></span>
            <span className={`${getIntensityColor(intensity, 4, isIssue)} h-[10px] w-[4px] min-w-[4px] rounded-[4px]`}></span>
            <span className={`${getIntensityColor(intensity, 5, isIssue)} h-[10px] w-[4px] min-w-[4px] rounded-[4px]`}></span>
        </span>
    )
}
