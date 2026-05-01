'use client';

import React from 'react';

export interface OutlineButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    /** When true, applies an "active" border (border-gray-500 instead of default). */
    active?: boolean;
    /** Additional Tailwind/CSS classes to merge with the base styles. */
    className?: string;
    /** Whether to show a small blue dot indicator on the right side of the button. */
    showDot?: boolean;
    children: React.ReactNode;
}

/**
 * A small, outlined utility button with consistent sizing and styling.
 * Useful for filter toggles, action triggers, "Create new" buttons, etc.
 *
 * @example
 * <OutlineButton onClick={handleClick}>Filters</OutlineButton>
 * <OutlineButton active={isFilterOpen} onClick={toggle}>Filters</OutlineButton>
 * <OutlineButton onClick={onCreate}>+ Create new</OutlineButton>
 */
export default function OutlineButton({
    active = false,
    className = '',
    children,
    showDot = false,
    ...rest
}: OutlineButtonProps) {
    return (
        <button
            type="button"
            {...rest}
            className={`h-8 w-fit bg-white border-[1px] border-[#CED2DA] text-[#202B37] text-nowrap px-3 rounded-[8px] text-[12px] font-medium box-border flex items-center justify-around ${className}`}
        >
            {children}
            {showDot && (<span className='w-1 h-1 bg-blue-600 rounded-full ml-1'></span>)}
        </button>
    );
}
