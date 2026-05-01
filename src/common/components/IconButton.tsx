'use client';

import React from 'react';

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** The icon element to render inside the button. */
  icon: React.ReactNode;
  /** Additional Tailwind/CSS classes to merge with the base styles. */
  className?: string;
}

/**
 * A small, outlined icon-only button with consistent sizing.
 * Ideal for toolbar actions like refresh, settings, etc.
 *
 * @example
 * <IconButton icon={<ReactivateSvgIcon className="w-4 h-4" stroke="#202B37" />} onClick={handleRefresh} />
 */
const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, className = '', ...rest }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        {...rest}
        className={`h-8 bg-white border-[1px] border-[#CED2DA] text-[#202B37] px-3 rounded-[8px] text-[12px] font-medium box-border flex items-center justify-center ${className}`}
      >
        {icon}
      </button>
    );
  },
);

IconButton.displayName = 'IconButton';

export default IconButton;
