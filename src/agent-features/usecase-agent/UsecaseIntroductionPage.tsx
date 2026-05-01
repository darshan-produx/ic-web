'use client';
import React, { useState } from 'react';
import { ChevronDownIcon, OnboardingAgentClientDetailsSvgIcon } from '../../app/assests/icons/icons';
import { OnboardingLayoutApp } from '../components/OnboardingLayoutApp';
import { ProgressDots } from '../components/ProgressDots';

interface UsecaseIntroductionPageProps {
  onContinue: () => void;
  onBack: () => void;
}

// Mock opportunity data matching the design
const mockOpportunities = [
  {
    customer_name: 'Tata Consultancy Services',
    insight_name: 'Norms are changing in the service industry across globe',
    opportunity_value: 12000,
    target_closure_date: '2025-11-30',
    action_sub_status: 'New',
    insight_type: 'Opportunity',
    alerted_at: new Date().toISOString(),
    is_viewed: false,
    created_by: null,
  },
  {
    customer_name: 'Zomato',
    insight_name: 'New factory setup for expanded operations',
    opportunity_value: 18540,
    target_closure_date: '2025-12-15',
    action_sub_status: 'New',
    insight_type: 'Opportunity',
    alerted_at: new Date().toISOString(),
    is_viewed: false,
    created_by: null,
  },
  {
    customer_name: 'Plum Insurance',
    insight_name: 'New category launch in health insurance sector',
    opportunity_value: 15200,
    target_closure_date: '2025-12-20',
    action_sub_status: 'New',
    insight_type: 'Opportunity',
    alerted_at: new Date().toISOString(),
    is_viewed: false,
    created_by: null,
  },
];

const UsecaseIntroductionPage: React.FC<UsecaseIntroductionPageProps> = ({
  onContinue,
  onBack,
}) => {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(true);

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const goToSlide = (index: number) => {
    setIsTransitioning(true);
    setCurrentSlide(index);
  };

  const handleContinue = () => {
    onContinue();
  };

  const handleBack = () => {
    onBack();
  };

  // Auto-slide effect - moves to left continuously
  React.useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setCurrentSlide((prev) => prev + 1);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Reset to first slide without transition when we reach the cloned slides
  React.useEffect(() => {
    if (currentSlide === mockOpportunities.length) {
      const timeout = setTimeout(() => {
        setIsTransitioning(false);
        setCurrentSlide(0);
      }, 500); // Wait for transition to complete
      return () => clearTimeout(timeout);
    }
  }, [currentSlide]);

  return (
    <OnboardingLayoutApp
      showAgent={true}
      agentIcon={<OnboardingAgentClientDetailsSvgIcon />}
      showLogo={false}
    >
      <div className="flex items-center justify-center min-h-screen px-8">
        <div className="w-full max-w-[600px] space-y-6">
          {/* Title */}
          <h1 className="font-['Inter'] font-medium text-[20px] leading-[28px] text-center text-gray-800">
            To identify opportunities
            <br />
            I'll need your help finalising the use cases
          </h1>

          {/* Progress Dots */}
          <div className="flex justify-center">
            <ProgressDots totalSteps={3} currentStep={1} />
          </div>

          {/* Opportunities Section */}
          <div className="w-[600px] rounded-[24px] border border-gray-200 p-[24px] bg-white/90 backdrop-blur-sm shadow-sm flex flex-col gap-[24px]">
            {/* Description */}
            <div className="font-inter font-normal text-sm leading-5 text-gray-600 mb-4 flex flex-col gap-2">
              <span>Use cases tell the Opportunities Agent what to look for</span>
              <span>Define them based on real business scenarios</span>
              <span>Once you set them up, the agent monitors for these situations in recent news articles and press releases turns them into ready-to-act opportunities</span>
            </div>

            <h2 className="text-base font-medium text-gray-700">
              These are the kind of opportunities I'll find for you
            </h2>

            {/* Opportunity Card Carousel */}
            <div className="flex-1 overflow-hidden relative min-h-0">
              <div
                className={`flex h-full ${isTransitioning ? 'transition-transform duration-500 ease-in-out' : ''}`}
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {/* Original slides */}
                {mockOpportunities.map((opportunity, index) => (
                  <div key={index} className="w-full flex-shrink-0 px-1 h-full">
                    <OpportunityCardMini ele={opportunity} />
                  </div>
                ))}
                {/* Clone first slide for seamless loop */}
                <div className="w-full flex-shrink-0 px-1 h-full">
                  <OpportunityCardMini ele={mockOpportunities[0]} />
                </div>
              </div>
            </div>

            {/* Carousel Dots */}
            <div className="flex justify-center gap-2">
              {mockOpportunities.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-2 h-2 rounded-full transition-colors duration-200 ${currentSlide % mockOpportunities.length === index ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            {/* Continue Button */}
            <div className="flex justify-center relative z-10">
              <button
                type="button"
                onClick={handleContinue}
                className="min-w-[125px] h-[32px] px-3 py-2 bg-blue-600 text-white rounded-[6px] hover:bg-blue-700 active:bg-blue-800 transition-colors duration-200 font-medium text-sm shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 whitespace-nowrap flex-shrink-0 cursor-pointer select-none"
              >
                Decide use cases
              </button>
            </div>
          </div>

          {/* Back Button */}
          <div className="flex justify-center relative z-10">
            <button
              type="button"
              onClick={handleBack}
              className="w-[53px] h-[32px] px-3 py-2 bg-white text-gray-700 rounded-[6px] border border-gray-200 hover:bg-gray-50 transition-colors duration-200 font-medium text-sm shadow-sm flex items-center justify-center gap-1 cursor-pointer"
            >
              Back
            </button>
          </div>

          {/* FAQs Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">FAQs</h2>

            {/* FAQ Item 1 */}
            <div className="w-[600px] h-[52px] rounded-[12px] border border-gray-200 px-5 py-4 bg-white hover:border-gray-300 transition-colors flex items-center justify-between">
              <button
                onClick={() => toggleFaq(0)}
                className="w-full flex justify-between items-center text-left"
              >
                <span className="font-medium text-gray-800 text-sm">What does this agent do?</span>
                <ChevronDownIcon
                  className={`w-5 h-5 text-gray-500 transition-transform flex-shrink-0 ${expandedFaq === 0 ? 'rotate-180' : ''
                    }`}
                />
              </button>
            </div>
            {expandedFaq === 0 && (
              <div className="w-[600px] px-5 py-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  This agent helps identify cross-sell and up-sell opportunities by analyzing customer data,
                  market trends, and service patterns to provide actionable insights for your business growth.
                </p>
              </div>
            )}

            {/* FAQ Item 2 */}
            <div className="w-[600px] h-[52px] rounded-[12px] border border-gray-200 px-5 py-4 bg-white hover:border-gray-300 transition-colors flex items-center justify-between">
              <button
                onClick={() => toggleFaq(1)}
                className="w-full flex justify-between items-center text-left"
              >
                <span className="font-medium text-gray-800 text-sm">When should the agent be used?</span>
                <ChevronDownIcon
                  className={`w-5 h-5 text-gray-500 transition-transform flex-shrink-0 ${expandedFaq === 1 ? 'rotate-180' : ''
                    }`}
                />
              </button>
            </div>
            {expandedFaq === 1 && (
              <div className="w-[600px] px-5 py-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  Use this agent when you want to proactively identify new business opportunities with existing
                  customers, track market changes, or discover potential expansion areas.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </OnboardingLayoutApp>
  );
};

// Simplified opportunity card component matching the existing design
const OpportunityCardMini: React.FC<{ ele: any }> = ({ ele }) => {
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm h-full flex flex-col">
      {/* Header with customer name and timestamp */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
          <span className="text-sm font-medium text-gray-800">{ele.customer_name}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>Just now</span>
          <span className="h-[10px] border-l border-gray-200"></span>
          <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M7.9987 1.33203L9.34 4.81942C9.52801 5.30824 9.62201 5.55265 9.7682 5.75824C9.89776 5.94044 10.057 6.09964 10.2392 6.2292C10.4447 6.37538 10.6892 6.46939 11.178 6.65739L14.6654 7.9987L11.178 9.34C10.6892 9.52801 10.4447 9.62201 10.2392 9.7682C10.057 9.89776 9.89776 10.057 9.7682 10.2392C9.62201 10.4447 9.52801 10.6892 9.34 11.178L7.9987 14.6654L6.65739 11.178C6.46939 10.6892 6.37538 10.4447 6.2292 10.2392C6.09964 10.057 5.94044 9.89776 5.75824 9.7682C5.55265 9.62201 5.30824 9.52801 4.81942 9.34L1.33203 7.9987L4.81942 6.65739C5.30824 6.46939 5.55265 6.37538 5.75824 6.2292C5.94044 6.09964 6.09964 5.94044 6.2292 5.75824C6.37538 5.55265 6.46939 5.30824 6.65739 4.81942L7.9987 1.33203Z" stroke="#97A1AF" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>

      {/* Title */}
      <p className="text-sm text-gray-700 mb-3 flex-grow">{ele.insight_name}</p>

      {/* Value and Date */}
      <div className="flex items-center gap-2 mb-3 text-xs text-gray-500 flex-wrap">
        <span>$ {ele.opportunity_value.toLocaleString('en-IN')}</span>
        <span>•</span>
        <span>Nov 30, 2025</span>
        <span>•</span>
        <span>{ele.action_sub_status}</span>
      </div>

      {/* Tags */}
      <div className="flex gap-2 flex-wrap">
        <span className="px-2.5 py-0.5 bg-green-50 text-green-700 border border-green-200 rounded text-xs font-normal">
          {ele.insight_type}
        </span>
        <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-xs font-normal">
          Usecase match
        </span>
      </div>
    </div>
  );
};

export default UsecaseIntroductionPage;
