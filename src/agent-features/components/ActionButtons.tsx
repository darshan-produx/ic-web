'use client';
import React from 'react';
import { OnboardingChevronRightArrowSvgIcon } from '../../app/assests/icons/icons';

interface ActionButtonsProps {
  onBack?: () => void;
  onContinue?: () => void;
  backLabel?: string;
  continueLabel?: string;
  continueIcon?: boolean;
  continueDisabled?: boolean;
  backDisabled?: boolean;
  className?: string;
  layout?: 'centered' | 'spaced';
}

/**
 * Reusable action buttons component for Back and Continue/Activate/Next actions
 */
export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onBack,
  onContinue,
  backLabel = 'Back',
  continueLabel = 'Continue',
  continueIcon = false,
  continueDisabled = false,
  backDisabled = false,
  className = '',
  layout = 'centered',
}) => {
  const containerClass =
    layout === 'centered'
      ? 'flex justify-center gap-20'
      : 'flex justify-between';

  return (
    <div className={`${containerClass} ${className}`}>
      {onBack && (
        <button
          onClick={onBack}
          disabled={backDisabled}
          className={`px-6 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-normal hover:bg-gray-50 ${
            backDisabled ? 'cursor-not-allowed opacity-50' : ''
          }`}
        >
          {backLabel}
        </button>
      )}
      {onContinue && (
        <button
          onClick={onContinue}
          disabled={continueDisabled}
          className={`px-6 py-2 rounded-lg text-white text-sm font-normal flex items-center gap-2 ${
            continueDisabled
              ? 'bg-blue-300 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {continueLabel}
          {continueIcon && (
            <div className="w-3.5 h-3.5">
              <OnboardingChevronRightArrowSvgIcon />
            </div>
          )}
        </button>
      )}
    </div>
  );
};
