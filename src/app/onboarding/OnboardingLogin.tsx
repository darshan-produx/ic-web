'use client';
import React, { useEffect, useState } from 'react';
import OnboardingLayout from './components/OnboardingLayout';
import {
  OnboardingGoogleLogoSvgIcon,
  OnboardingMicrosoftLogoSvgIcon,
} from '../assests/icons/icons';
import { useQuery } from '@tanstack/react-query';
import { getOnboardingSSOProvider } from '../api/onboarding/onboarding-client';

const OnboardingLogin: React.FC<{}> = () => {
  const [selectedProvider, setSelectedProvider] = useState<
    'google' | 'microsoft' | null
  >(null);

  const handleLogin = (provider: 'google' | 'microsoft') => {
    // setSelectedProvider(provider);
    window.location.href =
      '/api/app-service/v1/auth/oauth2/redirect?state=onboarding';
  };

  const { data: getSSOProviderData } = useQuery({
    queryKey: ['get-sso-provider'],
    queryFn: getOnboardingSSOProvider,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (getSSOProviderData?.data) {
      const ssoProvider =
        getSSOProviderData?.data === 'GOOGLE' ? 'google' : 'microsoft';
      setSelectedProvider(ssoProvider);
    }
  }, [getSSOProviderData?.data]);

  return (
    <OnboardingLayout>
      {/* Welcome text */}
      <div className="flex flex-col items-center justify-center mb-2">
        <p className="text-gray-700 text-base font-normal leading-6 text-center mb-1">
          Hello,
        </p>
        <p className="text-gray-800 text-base font-normal leading-6 text-center mb-1">
          I am the ImpactCraft AI agent
        </p>
        <p className="text-gray-700 text-base font-normal leading-6 text-center">
          I will help you experience the power of ImpactCraft's customer signal radar
        </p>
      </div>

      {/* Login section */}
      <div className="flex flex-col items-center">
        <h3 className="text-gray-800 text-xl font-medium leading-7 text-center mb-2">
          Login with your company's credentials
        </h3>
        <p className="text-gray-800 text-xl font-medium leading-7 text-center mb-8">
          Select your email service provider
        </p>

        {/* Login buttons */}
        <div className="flex items-center justify-center gap-6">
          {/* Google Login */}
          <button
            onClick={() => handleLogin('google')}
            disabled={selectedProvider === 'microsoft'}
            className={`bg-white w-[134px] h-[52px] rounded-[24px] shadow-sm border border-gray-200 transition-all flex items-center gap-3 pt-[10px] pr-[20px] pb-[10px] pl-[16px] ${
              selectedProvider === 'microsoft'
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:shadow-md hover:border-gray-300 cursor-pointer'
            }`}
          >
            <OnboardingGoogleLogoSvgIcon />
            <span className="text-base font-medium leading-6 text-gray-900">
              Google
            </span>
          </button>

          {/* Microsoft Login */}
          <button
            onClick={() => handleLogin('microsoft')}
            disabled={selectedProvider === 'google'}
            className={`bg-white w-[134px] h-[52px] rounded-[24px] shadow-sm border border-gray-200 transition-all flex items-center gap-3 pt-[10px] pr-[20px] pb-[10px] pl-[16px] ${
              selectedProvider === 'google'
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:shadow-md hover:border-gray-300 cursor-pointer'
            }`}
          >
            <OnboardingMicrosoftLogoSvgIcon />
            <span className="text-base font-medium leading-6 text-gray-900">
              Microsoft
            </span>
          </button>
        </div>
      </div>
    </OnboardingLayout>
  );
};

export default OnboardingLogin;