'use client';
import React, { useState } from 'react';
import { OnboardingLayoutApp } from '../components/OnboardingLayoutApp';
import { ProgressDots } from '../components/ProgressDots';
import { ContextSection } from './ContextSection';
import { OnboardingLoadingAgentSvgIcon, SparkleIcon1, SparkleIcon2, SparkleIcon3 } from '../../app/assests/icons/icons';

interface UsecaseContextPageProps {
  activation_id: string;
  onBack: () => void;
  onSubmitWithContext: (context: string) => void;
  onSubmitWithoutContext: () => void;
}

const UsecaseContextPage: React.FC<UsecaseContextPageProps> = ({
  activation_id,
  onBack,
  onSubmitWithContext,
  onSubmitWithoutContext,
}) => {
  const [context, setContext] = useState('');

  const handleSubmitWithContext = () => {
    if (context.trim()) {
      onSubmitWithContext(context);
    }
  };

  return (
    <OnboardingLayoutApp
      showAgent={true}
      agentIcon={
        <div className="relative">
          {/* Agent SVG */}
          <div>
            <OnboardingLoadingAgentSvgIcon />
          </div>

          {/* Thinking sparkles - positioned around top right of agent */}
          <div className="absolute -top-3 -right-3">
            <SparkleIcon1 />
          </div>
          <div className="absolute -top-1 right-4">
            <SparkleIcon2 />
          </div>
          <div className="absolute top-2 -right-1">
            <SparkleIcon3 />
          </div>
        </div>
      }
      showLogo={false}
    >
      <div className="flex items-start justify-center min-h-screen px-8 pt-8">
        <div className="w-full max-w-[600px] space-y-6">
          {/* Title */}
          <h1 className="font-['Inter'] font-medium text-[20px] leading-[28px] text-center text-gray-800">
            Setting up the context
          </h1>

          {/* Progress Dots */}
          <div className="flex justify-center">
            <ProgressDots totalSteps={3} currentStep={2} />
          </div>

          {/* Context Section */}
          <ContextSection
            activation_id={activation_id}
            context={context}
            onContextChange={setContext}
            onBack={onBack}
            onSubmitWithContext={handleSubmitWithContext}
            onSubmitWithoutContext={onSubmitWithoutContext}
            placeholder="e.g. Reliance digital prefers to see the customer last QBR to generate new cross-sell and up-sell opportunities"
          />
        </div>
      </div>
    </OnboardingLayoutApp>
  );
};

export default UsecaseContextPage;
