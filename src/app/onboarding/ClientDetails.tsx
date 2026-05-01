// 3 - company details/ found not found page
'use client';

import React, { useState } from 'react';
import {
  clientDetails,
} from '../api/onboarding/onboarding-types';
import {
  OnboardingCompanyBuildingSvgIcon,
  OnboardingGlobeSvgIcon,
  OnboardingChevronRightSvgIcon,
} from '../assests/icons/icons';
import OnboardingLayout from './components/OnboardingLayout';
import {
  useCompleteStep,
  useCreateClient,
  useMoveBackStep,
} from '../../services/mutations/onboarding';

interface ClientDetailsProps {
  onContinue: (clientDetails: clientDetails) => void;
  onBack?: () => void;
  direction?: 'forward' | 'backward';
}

const ClientDetails: React.FC<ClientDetailsProps> = ({ onContinue, onBack, direction = 'forward' }) => {
  const [clientName, setClientName] = useState<string>('');
  const [websiteUrl, setWebsiteUrl] = useState<string>('');
  const [urlError, setUrlError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [apiError, setApiError] = useState<string>('');
  const completeStep = useCompleteStep();
  const moveBackStep = useMoveBackStep();
  
  const animationClass = `transition-transform duration-500 ease-in-out ${
    direction === 'forward' ? 'animate-slide-left' : 'animate-slide-right'
  }`;
  const validateUrl = (url: string): boolean => {
    if (!url) return false;
    const urlPattern =
      /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;
    return urlPattern.test(url);
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setWebsiteUrl(value);
    if (value && !validateUrl(value)) {
      setUrlError('Please enter a valid URL');
    } else {
      setUrlError('');
    }
  };
  const createClient = useCreateClient();
  const handleContinue = async () => {
    if (clientName && websiteUrl && validateUrl(websiteUrl)) {
      setIsLoading(true);
      setApiError('');
      setApiResponse(null);
      await completeStep.mutateAsync({ step: 'client_details' });
      try {
        const response = await createClient.mutateAsync({
          clientName,
          clientWebsiteUrl: websiteUrl,
        });
        if (
          response.data?.success ||
          response.status === 200 ||
          response.status === 201
        ) {
          onContinue(response?.data?.data);
        } else {
          const errorMsg =
            response.data?.message || 'Failed to fetch client data';
          console.error('API returned error:', errorMsg);
          setApiError(errorMsg);
        }
      } catch (error: any) {
        console.error('Error calling API:', error);
        console.error('Error details:', {
          message: error.message,
          response: error.response,
          status: error.response?.status,
          data: error.response?.data,
        });
        const errorMsg =
          error.response?.data?.message ||
          error.message ||
          'Failed to connect to the server';
        setApiError(errorMsg);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleBack = async () => {
    setIsLoading(true);
    try {
      await moveBackStep.mutateAsync({});
    } catch (error) {
      console.error('Error moving back:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = clientName && websiteUrl && validateUrl(websiteUrl);
  const hasData = clientName && websiteUrl;

  return (
    <OnboardingLayout showHand={false} agentType="clientDetails" animationClass={animationClass}>
      <div className="flex flex-col items-center">
        <h2 className="w-[350px] text-gray-800 font-['Inter'] font-medium text-[14px] leading-[20px] text-left mb-4">
          {hasData ? "Can you confirm details about your company?" : "Let's start with basic details"}
        </h2>

        <form onSubmit={(e) => { e.preventDefault(); if (isFormValid && !isLoading) handleContinue(); }} className="space-y-4 mb-8">
          <div className="relative">
            <div className="absolute left-[10px] top-1/2 -translate-y-1/2 text-gray-400">
              <OnboardingCompanyBuildingSvgIcon />
            </div>
            <input
              type="text"
              placeholder={hasData ? clientName : "Enter your company name"}
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              disabled={isLoading}
              className="w-[350px] h-[32px] pl-9 pr-[10px] pt-[6px] pb-[6px] border border-gray-300 rounded-[8px] font-['Inter'] font-normal text-[14px] leading-[20px] text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-50"
            />
          </div>

          <div>
            <div className="relative">
              <div className="absolute left-[10px] top-1/2 -translate-y-1/2 text-gray-400">
                <OnboardingGlobeSvgIcon />
              </div>
              <input
                type="text"
                placeholder={hasData ? websiteUrl : "Enter company's website URL"}
                value={websiteUrl}
                onChange={handleUrlChange}
                disabled={isLoading}
                className={`w-[350px] h-[32px] pl-9 pr-[10px] pt-[6px] pb-[6px] border rounded-[8px] font-['Inter'] font-normal text-[14px] leading-[20px] text-gray-700 placeholder:text-gray-400 focus:outline-none transition-all disabled:bg-gray-50 ${
                  urlError
                    ? 'border-red-500'
                    : 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                }`}
              />
            </div>
            {urlError && (
              <p className="text-red-500 text-sm mt-2">{urlError}</p>
            )}
          </div>

          <div className="w-[350px] h-[32px] flex justify-between items-center mt-8">
            <button
              type="button"
              onClick={handleBack}
              disabled={isLoading}
              className="w-[53px] h-[32px] rounded-[6px] border border-gray-300 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed pt-[8px] pr-[12px] pb-[8px] pl-[12px] flex items-center justify-center gap-1"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={!isFormValid || isLoading}
              className={`h-[32px] rounded-[6px] text-sm font-medium transition-all flex items-center gap-1 px-3 ${
                isFormValid && !isLoading
                  ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                  : 'bg-blue-300 text-white cursor-not-allowed'
              }`}
            >
              <span>{isLoading ? 'Loading...' : 'Continue'}</span>
              {!isLoading && <OnboardingChevronRightSvgIcon />}
            </button>
          </div>
        </form>

        {apiError && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg w-full">
            <p className="text-red-700 text-sm font-medium">
              Error: {apiError}
            </p>
          </div>
        )}
      </div>
    </OnboardingLayout>
  );
};

export default ClientDetails;
