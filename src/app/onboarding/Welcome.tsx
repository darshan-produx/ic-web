//2 -  after signing - welcome message page
'use client';

import React, { useEffect, useState } from 'react';
import { OnboardingStep } from '../api/onboarding/onboarding-types';
import OnboardingLayout from './components/OnboardingLayout';
import { OnboardingArrowRightSvgIcon } from '../assests/icons/icons';

interface WelcomeProps {
  onContinue: (step: OnboardingStep) => void;
  direction?: 'forward' | 'backward';
}

const Welcome: React.FC<WelcomeProps> = ({ onContinue, direction = 'forward' }) => {
  const [userName, setUserName] = useState<string>('');
  
  useEffect(() => {
    const userName = localStorage.getItem('onboarding_user_name');
    if (userName) {
      setUserName(userName);
    }
  }, []);

  const animationClass = `transition-transform duration-500 ease-in-out ${
    direction === 'forward' ? 'animate-slide-left' : 'animate-slide-right'
  }`;

  return (
    <OnboardingLayout showHand={false} agentType="welcome" animationClass={animationClass}>
      {/* Welcome message */}
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-gray-900 font-['Inter'] font-semibold text-[24px] leading-[32px] text-center align-middle mb-4">
          Hello {userName},
        </h1>
        <p className="text-gray-700 font-['Inter'] font-medium text-[18px] leading-[28px] text-center mb-4">
          Pleasure to meet you.
        </p>

        {/* Let's start button */}
        <button
          onClick={() => onContinue('welcome')}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-3 py-2 flex items-center gap-2 transition-colors cursor-pointer"
        >
          <span className="text-sm font-medium">Let's start</span>
          <OnboardingArrowRightSvgIcon />
        </button>
      </div>
    </OnboardingLayout>
  );
};

export default Welcome;
