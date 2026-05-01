'use client';
import React from 'react';
import { OnboardingLoadingAgentSvgIcon, SparkleIcon1, SparkleIcon2, SparkleIcon3 } from '../../app/assests/icons/icons';

interface OnBoardingLoadingProps {
  title?: string;
  subtitle?: string;
  message?: string;
  showLogo?: boolean;
  onExplore?: () => void;
}

const OnBoardingLoading: React.FC<OnBoardingLoadingProps> = ({
  title = 'I am understanding your',
  subtitle = 'business, customers, and products',
  message = 'Please stay on the page',
  showLogo = false,
  onExplore
}) => {
  return (
    <div className="min-h-screen relative overflow-hidden bg-[#F8FAFE]">
      {/* Animated gradient blobs moving anticlockwise */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Blue blob - starts top-left, moves anticlockwise */}
        <div className="absolute w-[550px] h-[550px] bg-[#BBDEFB] rounded-full blur-[180px] opacity-50 animate-orbit-1"></div>
        {/* Pink blob - starts top-right, moves anticlockwise */}
        <div className="absolute w-[550px] h-[550px] bg-[#F8BBD0] rounded-full blur-[180px] opacity-50 animate-orbit-2"></div>
        {/* Yellow-Green blob - starts bottom-left, moves anticlockwise */}
        <div className="absolute w-[550px] h-[550px] bg-[#C5E1A5] rounded-full blur-[180px] opacity-50 animate-orbit-3"></div>
        {/* Mint blob - starts bottom-right, moves anticlockwise */}
        <div className="absolute w-[550px] h-[550px] bg-[#B2DFDB] rounded-full blur-[180px] opacity-50 animate-orbit-4"></div>
      </div>

      {/* Content container - Centered card */}
      <div className="absolute top-[100px] bottom-[29px] left-0 right-0 flex items-center justify-center px-8">
        <div className="bg-gradient-to-b from-white/95 to-white/80 backdrop-blur-sm shadow-[0_8px_32px_rgba(0,0,0,0.08)] rounded-[50px] p-[40px] w-[770px] h-full max-h-[642px] relative border border-white/50 flex flex-col items-center justify-center">
          {/* Header with logo and agent - positioned above container */}
          <div className={`absolute left-10 right-10 -top-20 flex items-center ${showLogo ? 'justify-between' : 'justify-center'}`}>
            {/* Logo - Top Left */}
            {showLogo && (
              <div className="flex items-center">
                <img
                  src="https://res.cloudinary.com/dllylnxit/image/upload/v1764577620/ImpactCraft_original_100x30px_tri7dy.png"
                  alt="ImpactCraft Logo"
                  className="h-12 w-auto"
                />
              </div>
            )}

            {/* Agent with thinking animation */}
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
          </div>

          {/* Content */}
          <div className="flex flex-col items-center justify-center gap-4">
            {/* Main text container */}
            <div className="text-center w-[335px] font-['Inter'] font-medium text-[20px] leading-[28px] text-gray-800">
              {title} {subtitle}
            </div>

            {/* Message text */}
            <p className="text-gray-400 text-base text-center">
              {message}
            </p>

            {/* Explore button */}
            {onExplore && (
              <button
                onClick={onExplore}
                className="mt-2 px-6 py-2.5 bg-[#1A75FF] text-white rounded-lg font-medium text-sm hover:bg-[#1565D8] transition-colors duration-200 shadow-sm hover:shadow-md"
              >
                Explore
              </button>
            )}

            {/* Loading spinner */}
            <div className="flex justify-center">
              <div className="relative w-6 h-6">
                <div className="absolute w-[18px] h-[18px] top-[3.09px] left-[3.1px] rounded-full border-2 border-[#1A75FF] border-t-transparent animate-spin"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnBoardingLoading;
