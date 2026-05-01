'use client';
import React from 'react';
import '../../../index.css';
import { OnboardingAgentLoginSvgIcon, OnboardingAgentWelcomeSvgIcon, OnboardingAgentClientDetailsSvgIcon, OnboardingHandSvgIcon } from '../../assests/icons/icons';

interface OnboardingLayoutProps {
  children: React.ReactNode;
  showHand?: boolean;
  agentType?: 'login' | 'welcome' | 'clientDetails';
  animationClass?: string;
}

const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({ children, showHand = true, agentType = 'login', animationClass = '' }) => {
  const getAgentIcon = () => {
    if (showHand) {
      return <OnboardingAgentLoginSvgIcon />;
    }
    
    switch (agentType) {
      case 'welcome':
        return <OnboardingAgentWelcomeSvgIcon />;
      case 'clientDetails':
        return <OnboardingAgentClientDetailsSvgIcon />;
      default:
        return <OnboardingAgentWelcomeSvgIcon />;
    }
  };

  return (
    <div className="min-h-screen fixed inset-0 overflow-hidden bg-[#F8FAFE]">
      {/* Four-color gradient blobs - Fixed background */}
      <div className="absolute inset-0">
        {/* Top Left - Blue */}
        <div className="absolute top-0 left-0 w-[550px] h-[550px] bg-[#BBDEFB] rounded-full blur-[180px] opacity-50"></div>
        {/* Top Right - Magenta/Pink */}
        <div className="absolute top-0 right-0 w-[550px] h-[550px] bg-[#F8BBD0] rounded-full blur-[180px] opacity-50"></div>
        {/* Bottom Left - Yellow-Green */}
        <div className="absolute bottom-0 left-0 w-[550px] h-[550px] bg-[#C5E1A5] rounded-full blur-[180px] opacity-50"></div>
        {/* Bottom Right - Mint Green */}
        <div className="absolute bottom-0 right-0 w-[550px] h-[550px] bg-[#B2DFDB] rounded-full blur-[180px] opacity-50"></div>
      </div>

      {/* Fixed Logo and Agent */}
      <div className="absolute top-[28px] left-1/2 -translate-x-1/2 z-20">
        <div className="w-[681px] h-[42.72px] flex items-center justify-between">
          {/* Logo - Top Left */}
          <div className="flex items-center">
            <img
              src="https://res.cloudinary.com/dllylnxit/image/upload/v1764577620/ImpactCraft_original_100x30px_tri7dy.png"
              alt="ImpactCraft Logo"
              className="h-12 w-auto"
            />
          </div>

          {/* Agent - Top Right */}
          {showHand ? (
            <div className="flex items-center relative animate-float">
              <div className="w-10 h-10 absolute left-0 top-2 z-10 origin-bottom-right animate-wave-float">
                <OnboardingHandSvgIcon />
              </div>
              <div className="w-16 h-14 ml-6">
                {getAgentIcon()}
              </div>
            </div>
          ) : (
            <div className="w-14 h-12">
              {getAgentIcon()}
            </div>
          )}
        </div>
      </div>

      {/* Sliding Content container */}
      <div className="absolute top-[100px] bottom-[29px] left-0 right-0 z-10 flex items-center justify-center">
        <div className={`bg-gradient-to-b from-white/95 to-white/80 backdrop-blur-sm shadow-[0_8px_32px_rgba(0,0,0,0.08)] rounded-[50px] p-[40px] w-[770px] h-full max-h-[642px] border border-white/50 flex flex-col gap-8 justify-center ${animationClass}`}>
          {/* Content */}
          {children}
        </div>
      </div>
    </div>
  );
};

export default OnboardingLayout;
