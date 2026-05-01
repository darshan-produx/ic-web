
import GenericFlatpickr from "../../../../../common/components/Flatpickr";
import React, { useState } from "react";
interface DateRangeFilterProps {
    title?: string;
    startDate?: Date | null;
    setStartDate: (date: Date | null) => void;
    endDate?: Date | null;
    setEndDate: (date: Date | null) => void;
    placeholder?: string;
    className?: string;
    dateFormat?: string;
    isDataChanged?: (isChanged: boolean) => void;
}
7
const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
    title = "Date Range",
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    placeholder = "Select date",
    className = "",
    dateFormat = "M d, Y",
    isDataChanged
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => setIsHovered(false);
    return (
        <div
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div
                className={`h-fit flex justify-end mb-1 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
            ><span
                className={` text-[12px] font-[400] ${(startDate || endDate) ? 'cursor-pointer text-[#2563EB]' : 'cursor-not-allowed text-gray-400'}`}
                onClick={() => {
                    if (startDate || endDate) {
                        setStartDate(null);
                        setEndDate(null);
                        isDataChanged?.(true);
                    } else {
                        return;
                    }
                }}
            >Clear</span></div>
            <div className={`w-full h-8 flex items-center justify-between ${className}`}>
                {/* Label */}
                <span className="text-[#202B37] font-medium text-nowrap flex-shrink-0">{title}</span>
                <div className="flex items-center gap-4 w-fit h-full flex-shrink-0">
                    <div className="w-[146px] h-full flex items-center justify-start border border-[#CED2DA] rounded-[6px] box-border ">
                        {/* <Calendar className="w-4 h-4 text-gray-400" /> */}
                        <GenericFlatpickr
                            value={startDate ?? null}
                            onChange={setStartDate}
                            placeholder={placeholder}
                            className="pl-7 rounded-[6px] "
                            maxDate={endDate ?? undefined}
                            isDataChanged={isDataChanged}
                        />
                    </div>
                    <div className="text-center text-gray-400">-</div>
                    <div className="w-[146px] h-full flex items-center justify-start border border-[#CED2DA] rounded-[6px] box-border">
                        {/* <Calendar className="w-4 h-4 text-gray-400" /> */}
                        <GenericFlatpickr
                            value={endDate ?? null}
                            onChange={setEndDate}
                            placeholder={placeholder}
                            className="pl-7 rounded-[6px] "
                            minDate={startDate ?? undefined}
                            isDataChanged={isDataChanged}
                        />
                    </div>
                </div>
            </div>
        </div>


    );
};
export default DateRangeFilter;