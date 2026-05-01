'use client';
import React, { useEffect, useState } from 'react';
import { OnboardingLayoutApp } from '../components/OnboardingLayoutApp';
import { ProgressDots } from '../components/ProgressDots';
import { OnboardingAgentClientDetailsSvgIcon } from '../../app/assests/icons/icons';
import OpportunityCard from '../../app/app/insights/opportunities/components/opportunityCard';
import OpportunityDetailsSideBarView from '../../app/app/insights/opportunities/opportunityDetailsSideBarView';
import { ActionButtons } from '../components/ActionButtons';

interface OpportunitiesListPageProps {
  activation_id: string;
  onDone: () => void;
  onBack?: () => void;
  opportunitiesData: any[];
}

const OpportunitiesListPage: React.FC<OpportunitiesListPageProps> = ({
  activation_id,
  onDone,
  onBack,
  opportunitiesData,
}) => {
  // Hardcoded opportunities based on the image
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<
    string | null
  >(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (Array.isArray(opportunitiesData) && opportunitiesData.length > 0) {
      setOpportunities(opportunitiesData);
      const timeoutId = setTimeout(() => setIsAnimating(true), 50);
      return () => clearTimeout(timeoutId);
    }
  }, [opportunitiesData]);

  if (Array.isArray(opportunitiesData) && opportunities.length === 0) {
    return null;
  }

  return (
    <>
      <OnboardingLayoutApp
        showAgent={true}
        agentIcon={<OnboardingAgentClientDetailsSvgIcon />}
        showLogo={false}
      >
        <div className="flex items-center justify-center min-h-screen px-8">
          <div
            className={`w-full max-w-[600px] space-y-6 transition-all duration-700 ease-out ${
              isAnimating
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-8'
            }`}
          >
            {/* Title */}
            <div className="text-center">
              <h1 className="font-['Inter'] font-medium text-[20px] leading-[28px] text-gray-800 mb-2">
                I have identified cross-sell and upsell opportunities
              </h1>
              <p className="font-inter font-normal text-sm leading-5 text-gray-600">
                You can click to know more and run further research on any
                opportunity
              </p>
            </div>

            {/* Progress Dots */}
            <div className="flex justify-center">
              <ProgressDots totalSteps={3} currentStep={3} />
            </div>

            {/* Opportunities Section */}
            <div className="w-[600px] rounded-[24px] border border-gray-200 p-[24px] bg-white/90 backdrop-blur-sm shadow-sm">
              {/* Opportunities List */}
              <div className="space-y-4">
                {opportunities.map((opportunity, index) => (
                  <div
                    className={`card shadow-none !border border-[#E4E7EC] rounded-[12px] cursor-pointer flex gap-0 transition-all duration-200 hover:shadow-md ${
                      isAnimating
                        ? 'animate-[slideIn_0.5s_ease-out_both]'
                        : 'opacity-0'
                    }`}
                    key={index}
                    onClick={() =>
                      setSelectedOpportunityId(opportunity?._id?.toString())
                    }
                    style={
                      isAnimating
                        ? { animationDelay: `${index * 0.1}s` }
                        : undefined
                    }
                  >
                    <OpportunityCard key={index} ele={opportunity} />
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-center">
              <ActionButtons
                onBack={onBack}
                onContinue={onDone}
                backLabel="Back"
                continueLabel="Continue"
              />
            </div>
          </div>
        </div>
      </OnboardingLayoutApp>
      {selectedOpportunityId !== null && (
        <div className="">
          <OpportunityDetailsSideBarView
            isOpen={selectedOpportunityId !== null}
            onClose={() => setSelectedOpportunityId(null)}
            selectedOpportunityId={selectedOpportunityId}
          />
        </div>
      )}
    </>
  );
};


export default OpportunitiesListPage;
