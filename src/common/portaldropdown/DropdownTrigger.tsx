import React from 'react';
import { ChevronDown } from 'lucide-react';

export interface DropdownTriggerProps {
    value: string;
    placeholder?: string;
    isOpen?: boolean;
    onClick: () => void;
    className?: string;
    disabled?: boolean;
    showIcon?: boolean;
    children?: React.ReactNode;
}

// Use forwardRef so you can pass ref from parent
const DropdownTrigger = React.forwardRef<HTMLDivElement, DropdownTriggerProps>(
    (
        {
            value,
            placeholder = 'Select...',
            isOpen = false,
            onClick,
            className = '',
            disabled = false,
            showIcon = true,
            children
        },
        ref
    ) => {
        return (
            <div
                ref={ref}
                onClick={disabled ? undefined : onClick}
                className={`
                    w-full min-h-fit flex items-center justify-between cursor-pointer
                    ${className.includes('border-none') ? '' : 'px-2 py-1 border border-gray-300 rounded'}
                    ${className.includes('outline-none') ? '' : 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'}
                    ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-100' : className.includes('border-none') ? '' : 'bg-white hover:border-gray-400'}
                    ${isOpen && !className.includes('border-none') ? 'ring-2 ring-blue-500 border-transparent' : ''}
                    ${className}
                `}
                tabIndex={disabled ? -1 : 0}
                onKeyDown={(e) => {
                    if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
                        e.stopPropagation();
                        e.preventDefault();
                        onClick();
                    }
                }}
            >
                <span className={`text-[14px] font-normal text-wrap flex-1 text-left ${className.includes('text-red-500') ? 'text-red-500' : 'text-[#202B37]'} ${className.includes('italic') ? 'italic' : ''}`}>
                    {children || value || placeholder}
                </span>
                {showIcon && (
                    <ChevronDown
                        className={`w-4 h-4 text-gray-500 flex-shrink-0 transition-transform ${
                            isOpen ? 'transform rotate-180' : ''
                        }`}
                    />
                )}
            </div>
        );
    }
);

export default DropdownTrigger;