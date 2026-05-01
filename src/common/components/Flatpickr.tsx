import React, { forwardRef } from 'react';
import Flatpickr from 'react-flatpickr';
import { Calendar, X } from 'lucide-react';

interface GenericFlatpickrProps {
    value: Date | null;
    onChange: (date: Date | null) => void;
    placeholder?: string;
    className?: string;
    dateFormat?: string;
    enableTime?: boolean;
    minDate?: Date;
    maxDate?: Date;
    isDataChanged?: (isChanged: boolean) => void;
    showCalendarIcon?: boolean;
    showClearIcon?: boolean;
}

const GenericFlatpickr = forwardRef<any, GenericFlatpickrProps>(({
    value,
    onChange,
    placeholder = "Select date",
    className = "",
    dateFormat = "M d, Y",
    enableTime = false,
    minDate,
    maxDate,
    isDataChanged,
    showCalendarIcon = true,
    showClearIcon = false
}, ref) => {
    const handleDateChange = (selectedDates: Date[]) => {
        if (selectedDates.length > 0) {
            const date = selectedDates[0];
            onChange(date);
            isDataChanged?.(true);
        }
    };

    return (
        <div className="h-full relative">
            {showCalendarIcon && <Calendar className={`absolute left-[6px] top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none`} />}
            <Flatpickr
                ref={ref}
                options={{
                    dateFormat: dateFormat,
                    minDate: minDate ?? undefined,
                    maxDate: maxDate ?? undefined,
                    enableTime: enableTime,
                }}
                onChange={handleDateChange}
                value={value ? value : ''}
                placeholder={placeholder}
                className={`h-full text-[14px] !font-[400] w-[100%] text-[#141C24] placeholder:text-[#637083] focus:outline-none focus:border-gray-500 disabled:bg-slate-100 disabled:border-slate-300 disabled:text-slate-500 flatpickr-input1 border-none form-input ${className}`}
            />
            {showClearIcon && value && (
                <X className="w-4 h-4 text-[#414E62] absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer" onClick={() => onChange(null)} />
            )}
        </div>
    );
});

GenericFlatpickr.displayName = 'GenericFlatpickr';
export default GenericFlatpickr;