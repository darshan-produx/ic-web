'use client';
import React, { useState } from 'react';
import { OnboardingContainer } from '../components/OnboardingContainer';
import { ContentCard } from '../components/ContentCard';
import { ProgressDots } from '../components/ProgressDots';

interface ActiveTabsProps {
  defaultTab?: 'insights' | 'summaries';
  children: (activeTab: 'insights' | 'summaries') => React.ReactNode;
}

const ActiveTabs: React.FC<ActiveTabsProps> = ({ 
  defaultTab = 'insights',
  children
}) => {
  const [activeTab, setActiveTab] = useState<'insights' | 'summaries'>(defaultTab);

  return (
    <OnboardingContainer>
      <ContentCard maxWidth="720px">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-xl font-medium text-gray-900 mb-2">
            Stakeholder summaries and insights
          </h1>
        </div>

        <ProgressDots totalSteps={3} currentStep={3} />
        
        {/* Tabs */}
        <div className="mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('insights')}
              className={`px-6 py-3 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === 'insights'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              Insights
            </button>
            <button
              onClick={() => setActiveTab('summaries')}
              className={`px-6 py-3 text-sm font-normal border-b-2 transition-colors ${
                activeTab === 'summaries'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              Summaries
            </button>
          </div>
        </div>

        {/* Content */}
        {children(activeTab)}
      </ContentCard>
    </OnboardingContainer>
  );
};

export default ActiveTabs;
