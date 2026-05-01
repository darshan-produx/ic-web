'use client';
import React from 'react';
import { OnboardingCloseSvgIcon, OnboardingPlusSvgIcon } from '../../app/assests/icons/icons';

interface EditablePillProps {
  value: string;
  onRemove: () => void;
  className?: string;
}

/**
 * Reusable editable pill component
 * Used for displaying removable items like domains, stakeholders, etc.
 */
export const EditablePill: React.FC<EditablePillProps> = ({
  value,
  onRemove,
  className = ''
}) => {
  return (
    <div 
      className={`inline-flex items-center border border-gray-300 text-sm text-gray-900 bg-white h-7 rounded-[50px] px-2 py-1 gap-1 ${className}`}
    >
      <span>{value}</span>
      <button
        onClick={onRemove}
        className="text-gray-600 hover:text-gray-900 flex-shrink-0"
        aria-label="Remove"
      >
        <div className="w-3.5 h-3.5">
          <OnboardingCloseSvgIcon />
        </div>
      </button>
    </div>
  );
};

interface AddButtonProps {
  onClick: () => void;
  className?: string;
}

/**
 * Reusable add button component
 * Used for adding new items in editable lists
 */
export const AddButton: React.FC<AddButtonProps> = ({
  onClick,
  className = ''
}) => {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center justify-center w-7 h-7 rounded-full border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 ${className}`}
      aria-label="Add item"
    >
      <div className="w-4 h-4">
        <OnboardingPlusSvgIcon />
      </div>
    </button>
  );
};
