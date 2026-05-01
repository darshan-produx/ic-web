'use client';
import React from 'react';

interface OnboardingContainerProps {
  children: React.ReactNode;
  className?: string;
  centered?: boolean;
}

/**
 * Reusable container for onboarding screens with consistent background and centering
 */
export const OnboardingContainer: React.FC<OnboardingContainerProps> = ({
  children,
  className = '',
  centered = true
}) => {
  return (
    <div data-onboarding-page className={`h-screen bg-gradient-to-br from-gray-50 to-blue-50 overflow-y-auto ${className}`}>
      <div className={`p-4 ${centered ? 'flex items-center justify-center min-h-full' : ''}`}>
        {children}
      </div>
    </div>
  );
};
