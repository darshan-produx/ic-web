'use client';
import React from 'react';

interface ContentCardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  maxWidth?: string;
  padding?: string;
}

/**
 * Reusable white content card with rounded corners and border
 * Used across onboarding flows for form containers and content areas
 */
export const ContentCard: React.FC<ContentCardProps> = ({
  children,
  title,
  subtitle,
  className = '',
  maxWidth = '720px',
  padding = '40px'
}) => {
  return (
    <div 
      className={`bg-white border border-gray-300 ${className}`}
      style={{ 
        borderRadius: '30px', 
        padding,
        maxWidth,
        width: '100%'
      }}
    >
      {(title || subtitle) && (
        <div className="text-center mb-6">
          {title && (
            <h1 className="text-xl font-medium text-gray-900 mb-2">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="text-gray-600 text-sm">
              {subtitle}
            </p>
          )}
        </div>
      )}
      {children}
    </div>
  );
};
