'use client';
import React from 'react';

interface ProgressDotsProps {
  totalSteps: number;
  currentStep: number;
  className?: string;
}

/**
 * Reusable progress dots indicator
 * Shows current progress through multi-step flows
 */
export const ProgressDots: React.FC<ProgressDotsProps> = ({
  totalSteps,
  currentStep,
  className = ''
}) => {
  return (
    <div className={`flex justify-center gap-2 ${className}`}>
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div
          key={index}
          className={`${
            index < currentStep ? 'bg-blue-500' : 'bg-gray-300'
          }`}
          style={{ width: '20px', height: '6px', borderRadius: '10px' }}
        />
      ))}
    </div>
  );
};
