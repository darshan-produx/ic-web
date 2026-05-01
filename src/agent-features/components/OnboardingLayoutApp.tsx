'use client';
import React from 'react';
import { OnboardingAgentClientDetailsSvgIcon } from '../../app/assests/icons/icons';

interface OnboardingLayoutAppProps {
  children: React.ReactNode;
  showAgent?: boolean;
  agentIcon?: React.ReactNode;
  showLogo?: boolean;
}

/**
 * Reusable onboarding layout with four-color gradient background,
 * logo, and optional agent icon for agent setup flows
 */
export const OnboardingLayoutApp: React.FC<OnboardingLayoutAppProps> = ({
  children,
  showAgent = true,
  agentIcon,
  showLogo = false,
}) => {
  return (
    <div className="min-h-screen relative overflow-hidden bg-[#F8FAFE]">
      {/* Four-color gradient blobs */}
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

      {/* Content container - Centered card */}
      <div className="relative flex flex-col items-center justify-start min-h-screen px-8 pt-16 pb-12">
        {/* Logo and Agent positioned above card */}
        <div className={`w-[770px] flex items-center px-6 mb-6 ${showLogo && showAgent ? 'justify-between' : showAgent ? 'justify-center' : ''}`}>
          {/* Logo - Top Left */}
          {showLogo && (
            <div className="flex items-center">
              <img
                src="https://res.cloudinary.com/dllylnxit/image/upload/v1764577620/ImpactCraft_original_100x30px_tri7dy.png"
                alt="ImpactCraft Logo"
                className="h-10 w-auto"
              />
            </div>
          )}

          {/* Agent - Top Right */}
          {showAgent && (
            <div className="w-12 h-10">
              {agentIcon || <OnboardingAgentClientDetailsSvgIcon />}
            </div>
          )}
        </div>

        {/* White card container */}
        <div className="bg-white/90 backdrop-blur-sm shadow-[0_8px_32px_rgba(0,0,0,0.08)] rounded-[32px] p-10 w-[770px] relative border border-gray-200">
          {children}
        </div>
      </div>
    </div>
  );
};
