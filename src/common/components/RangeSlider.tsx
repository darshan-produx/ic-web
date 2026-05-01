"use client";
import React, { useState, useRef } from "react";
import { ScrollThumbSvgIcon } from "../../app/assests/icons/icons";
import { formatRevenue } from "../SupportFunctions";

interface RangeSliderProps {
    title: string;
    fixStart: number;
    fixEnd: number;
    mobileStart?: number;
    mobileEnd?: number;
    step?: number;
    initialMin?: number;
    initialMax?: number;
    currencySymbol?: string;
    currency?: string;
    onChange?: (values: { minValue: number; maxValue: number }) => void;
}

const RangeSlider: React.FC<RangeSliderProps> = ({
    title,
    fixStart,
    fixEnd,
    mobileStart,
    mobileEnd,
    step = 1,
    currencySymbol,
    currency,
    onChange,
}) => {
    const [minValue, setMinValue] = useState(mobileStart ? mobileStart : fixStart);
    const [maxValue, setMaxValue] = useState(mobileEnd ? mobileEnd : fixEnd);
    const [isDragging, setIsDragging] = useState<'min' | 'max' | null>(null);
    const sliderRef = useRef<HTMLDivElement>(null);

    const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Math.min(Number(e.target.value), maxValue - step);
        setMinValue(value);
        onChange?.({ minValue: value, maxValue });
    };

    const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Math.max(Number(e.target.value), minValue + step);
        setMaxValue(value);
        onChange?.({ minValue, maxValue: value });
    };

    // Calculate percentages for positioning
    const minPercent = ((minValue - fixStart) / (fixEnd - fixStart)) * 100;
    const maxPercent = ((maxValue - fixStart) / (fixEnd - fixStart)) * 100;

    const handleMouseDown = (type: 'min' | 'max') => (e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(type);
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging || !sliderRef.current) return;

        const rect = sliderRef.current.getBoundingClientRect();
        const percent = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
        const value = Math.round(fixStart + (percent / 100) * (fixEnd - fixStart));

        if (isDragging === 'min') {
            const newMinValue = Math.min(value, maxValue - step);
            setMinValue(newMinValue);
            onChange?.({ minValue: newMinValue, maxValue });
        } else {
            const newMaxValue = Math.max(value, minValue + step);
            setMaxValue(newMaxValue);
            onChange?.({ minValue, maxValue: newMaxValue });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(null);
    };

    React.useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, minValue, maxValue]);

    return (
        <div className="w-[470px] h-[76px] mx-auto flex flex-col items-center justify-between gap-4 select-none">
            {/* Label */}
            <div className="h-8 w-full flex items-center justify-between">
                <span className="text-gray-400 font-medium text-[16px]"><span className="text-[#202B37]">{title}{' '}</span>({currencySymbol}{currency ? formatRevenue(minValue, currency) : minValue} to {currencySymbol}{currency ? formatRevenue(maxValue, currency) : maxValue})</span>
                <span className="flex gap-4">
                    <div className="flex-1 w-[81px]">
                        <input
                            type="number"
                            value={minValue}
                            min={fixStart}
                            onChange={(e) => {
                                const inputValue = Number(e.target.value);
                                // Add validation for both upper and lower bounds
                                const value = Math.max(fixStart, Math.min(inputValue, maxValue - step));
                                setMinValue(value);
                                onChange?.({ minValue: value, maxValue });
                            }}
                            className="w-full h-8 px-3 py-1 border border-gray-300 rounded-[8px] text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent box-border"
                        />
                    </div>
                    <div className="flex-1 w-[81px]">
                        <input
                            type="number"
                            value={maxValue}
                            max={fixEnd}
                            onChange={(e) => {
                                const inputValue = Number(e.target.value);
                                // Add validation for both upper and lower bounds
                                const value = Math.min(fixEnd, Math.max(inputValue, minValue + step));
                                setMaxValue(value);
                                onChange?.({ minValue, maxValue: value });
                            }}
                            className="w-full h-8 px-3 py-1 border border-gray-300 rounded-[8px] text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent box-border"
                        />
                    </div>
                </span>
            </div>


            {/* Input boxes */}


            {/* Slider Container */}
            <div className="h-7 w-full p-2">
                {/* Background Track with tick marks */}
                {/* Tick marks */}
                <div className="h-5 w-full relative" ref={sliderRef}>
                    <div className="w-full flex gap-[2px] overflow-hidden">
                        {Array.from({ length: 120 }).map((_, i) => (
                            <span
                                key={i}
                                className="w-[2px] h-5 bg-gray-200 rounded-[52px] flex-shrink-0"
                            ></span>
                        ))}
                    </div>

                    {/* Active range highlight */}
                    <div
                        className="absolute h-5 bg-blue-200 rounded-full opacity-50 top-0"
                        style={{
                            left: `${minPercent}%`,
                            width: `${maxPercent - minPercent}%`,
                        }}
                    />

                    {/* Hidden range inputs for accessibility */}
                    <input
                        type="range"
                        min={fixStart}
                        max={fixEnd}
                        step={step}
                        value={minValue}
                        onChange={handleMinChange}
                        className="absolute inset-0 w-full h-5 opacity-0 cursor-pointer"
                        style={{ zIndex: 1 }}
                    />

                    <input
                        type="range"
                        min={fixStart}
                        max={fixEnd}
                        step={step}
                        value={maxValue}
                        onChange={handleMaxChange}
                        className="absolute inset-0 w-full h-5 opacity-0 cursor-pointer"
                        style={{ zIndex: 2 }}
                    />

                    {/* Custom SVG Thumbs */}
                    {/* Min Thumb */}
                    <div
                        className="absolute cursor-pointer select-none"
                        style={{
                            left: `calc(${minPercent}% - 14px)`,
                            top: '-4.4px',
                            zIndex: 10
                        }}
                        onMouseDown={handleMouseDown('min')}
                    >
                        <ScrollThumbSvgIcon />
                    </div>

                    {/* Max Thumb */}
                    <div
                        className="absolute cursor-pointer select-none"
                        style={{
                            left: `calc(${maxPercent}% - 14px)`,
                            top: '-4.4px',
                            zIndex: 11
                        }}
                        onMouseDown={handleMouseDown('max')}
                    >
                        <ScrollThumbSvgIcon />
                    </div>
                </div>
            </div>
        </div>
    );
};
export default RangeSlider;