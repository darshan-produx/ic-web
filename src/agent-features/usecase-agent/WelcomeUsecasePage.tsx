'use client';
import React, { useEffect, useState } from 'react';
import { ChevronRightIcon, OnboardingAgentClientDetailsSvgIcon } from '../../app/assests/icons/icons';

interface WelcomeUsecasePageProps {
  onContinue: () => void;
}

const WelcomeUsecasePage: React.FC<WelcomeUsecasePageProps> = ({
  onContinue,
}) => {
  const [userName, setUserName] = useState<string>('');
  
  useEffect(() => {
    const userName = localStorage.getItem('onboarding_user_name');
    if (userName) {
      setUserName(userName);
    }
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#F8FAFE]">
      {/* Four-color gradient blobs */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-[550px] h-[550px] bg-[#BBDEFB] rounded-full blur-[180px] opacity-50"></div>
        <div className="absolute top-0 right-0 w-[550px] h-[550px] bg-[#F8BBD0] rounded-full blur-[180px] opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-[550px] h-[550px] bg-[#C5E1A5] rounded-full blur-[180px] opacity-50"></div>
        <div className="absolute bottom-0 right-0 w-[550px] h-[550px] bg-[#B2DFDB] rounded-full blur-[180px] opacity-50"></div>
      </div>

      {/* Content container */}
      <div className="absolute top-[100px] bottom-[29px] left-0 right-0 flex items-center justify-center px-8">
        <div className="bg-gradient-to-b from-white/95 to-white/80 backdrop-blur-sm shadow-[0_8px_32px_rgba(0,0,0,0.08)] rounded-[50px] p-[40px] w-[770px] h-full max-h-[642px] relative border border-white/50 flex flex-col items-center justify-center">
          {/* Agent positioned above container */}
          <div className="absolute left-10 right-10 -top-20 flex items-center justify-center">
            <div className="relative">
              <OnboardingAgentClientDetailsSvgIcon />
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-col items-center justify-center gap-8">
            {/* Text content */}
            <div className="text-center flex flex-col items-center gap-2">
              {/* Welcome heading */}
              <h1 className="font-['Inter'] font-semibold text-[24px] leading-[32px] text-gray-800">
                Hello {userName},
              </h1>

              {/* Description */}
              <div className="font-['Inter'] font-medium text-[18px] leading-[28px] text-gray-600 text-center">
                I am your opportunity agent,
                <br />
                I will help you to identify cross-sell/upsell opportunities
              </div>
            </div>

            {/* Continue Button */}
            <button
              onClick={onContinue}
              className="inline-flex items-center justify-center px-8 py-3 bg-[#3B82F6] text-white rounded-lg hover:bg-[#2563EB] transition-colors duration-200 font-medium text-base shadow-lg shadow-blue-500/30"
            >
              Continue
              <ChevronRightIcon className="ml-2 w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeUsecasePage;
