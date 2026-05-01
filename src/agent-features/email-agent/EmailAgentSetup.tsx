import React, { useCallback, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import OnBoardingLoading from '../components/Loading';
import ReviewDomains from './ReviewDomains';
import ReviewStakeholders from './ReviewStakeholders';
import EngagementLevel from './EngagementLevel';
import { getActivationDetails } from '../../app/api/agents/agents';
import { useRouter } from 'next/navigation';
import {
  activateEmailScan,
  getAllCustomerProspectiveDomainStakeholders,
} from '../../app/api/agents/email-agent';
import { useAgentStepNavigation } from '../hooks/agentStepNavigation';
import { usePollingTimeout } from '../hooks/usePollingTimeout';
import { toast } from 'react-toastify';

interface EmailAgentSetupProps {
  activation_id: string;
}

const DEFAULT_STEPS = [
  'mining_emails',
  'review_customer_domains',
  'review_stakeholders',
  'adding_domains_and_stakeholders',
  'completed',
  'failed',
] as string[];

const EmailAgentSetup: React.FC<EmailAgentSetupProps> = ({ activation_id }) => {
  const router = useRouter();
  const [activationDetails, setActivationDetails] = useState<any | null>(null);
  const [currentStep, setCurrentStep] = useState<string | null>(null);

  useQuery({
    queryKey: ['activate-email-scan', activation_id],
    queryFn: () => activateEmailScan(activation_id),
    refetchOnWindowFocus: false,
    enabled: !!activation_id && currentStep === 'mining_emails',
  });

  const { data: activationDetailsData, isLoading } = useQuery({
    queryKey: ['activations', activation_id],
    queryFn: () => getActivationDetails(activation_id),
    refetchOnWindowFocus: false,
    refetchInterval: () => {
      if (
        currentStep === 'mining_emails' ||
        currentStep === 'adding_domains_and_stakeholders'
      ) {
        return 5000;
      }
      return false;
    },
  });

  useEffect(() => {
    if (activationDetailsData?.data) {
      setActivationDetails(activationDetailsData.data);
      const backendCurrent = activationDetailsData.data.current_step as
        | string
        | undefined;
      const stepsFromBackend: string[] =
        activationDetailsData.data.steps_list ?? [];
      if (backendCurrent && stepsFromBackend.includes(backendCurrent)) {
        setCurrentStep(backendCurrent);
      } else if (stepsFromBackend.length > 0) {
        setCurrentStep(stepsFromBackend[0]);
      } else {
        setCurrentStep(DEFAULT_STEPS[0]);
      }
    }
  }, [activationDetailsData]);

  const { goToNextStep, goToPrevStep, jumpToStep } = useAgentStepNavigation({
    activationId: activation_id,
    currentStep,
    backendSteps: activationDetails?.steps_list,
    defaultSteps: DEFAULT_STEPS,
  });

  const isactivationDetailsDataPollingRunning =
    currentStep === 'mining_emails' ||
    currentStep === 'adding_domains_and_stakeholders';

  const isactivationDetailsDataPollingSuccessful =
    currentStep !== 'mining_emails' &&
    currentStep !== 'adding_domains_and_stakeholders';

  usePollingTimeout({
    isRunning: isactivationDetailsDataPollingRunning,
    isSuccessful: isactivationDetailsDataPollingSuccessful,
    timeoutMs: 60000 * 2,
    resetKey: activation_id, // Resets timer if ID changes
    onTimeout: () => {
      console.warn('Check access polling timed out');
      if (currentStep === 'mining_emails') {
        router.push('/app/admin/agents');
      }
      if (currentStep === 'adding_domains_and_stakeholders') {
        jumpToStep('review_stakeholders');
      }
      toast.error('Timed out. Please try again.');
    },
  });

  const { data: getAllCustomersProspectiveDomainStakeholdersData } = useQuery({
    queryKey: [
      'email-agent-get-all-customer-prospective-domain-stakeholders',
      activation_id,
    ],
    queryFn: () => getAllCustomerProspectiveDomainStakeholders(activation_id),
    refetchOnWindowFocus: false,
    enabled:
      !!activation_id &&
      (currentStep === 'review_customer_domains' ||
        currentStep === 'review_stakeholders'),
  });

  const renderForStep = useCallback(
    (step: string | null) => {
      if (!step) return null;

      switch (step) {
        case 'mining_emails':
          return (
            <OnBoardingLoading
              title="I am now analysing domains and mapping 
stakeholders for each customer"
              subtitle=""
              message="Please stay on the page"
            />
          );

        case 'review_customer_domains':
          return (
            <ReviewDomains
              customers={
                getAllCustomersProspectiveDomainStakeholdersData?.data ?? []
              }
              activation_id={activation_id}
              onBack={() => router.push('/app/admin/agents')}
              onNext={() => goToNextStep()}
            />
          );

        case 'review_stakeholders':
          return (
            <ReviewStakeholders
              customers={
                getAllCustomersProspectiveDomainStakeholdersData?.data ?? []
              }
              activation_id={activation_id}
              onBack={() => jumpToStep('review_customer_domains')}
              onActivate={() => goToNextStep()}
            />
          );

        case 'adding_domains_and_stakeholders':
          return (
            <OnBoardingLoading
              title="I’m now analysing and generating insights"
              subtitle=""
              message="Please stay on the page"
            />
          );

        case 'completed':
          return (
            <EngagementLevel
              activation_id={activation_id}
              onBack={() => jumpToStep('review_stakeholders')}
              onContinue={() => router.push('/app/admin/agents')}
            />
          );

        // case 'completed':
        //   return (
        //     <StakeholderInsights
        //       onBack={() => goToPrevStep()}
        //       onNext={() => goToNextStep()}
        //     />
        //   );

        // case 'completed':
        //   return (
        //     <StakeholderSummaries
        //       onBack={() => goToPrevStep()}
        //       onActivate={() => onContinue()}
        //     />
        //   );

        case 'failed':
          return (
            <ReviewDomains
              customers={
                getAllCustomersProspectiveDomainStakeholdersData?.data ?? []
              }
              activation_id={activation_id}
              onBack={() => router.push('/app/admin/agents')}
              onNext={() => goToNextStep()}
            />
          );

        default:
          return (
            <OnBoardingLoading
              title="Agent is processing..."
              subtitle={step}
              message="This won't take long — please stay on the page"
            />
          );
      }
    },
    [goToNextStep, goToPrevStep]
  );

  if (isLoading && !currentStep) {
    return (
      <OnBoardingLoading
        title="Loading activation details..."
        subtitle=""
        message="Please wait"
      />
    );
  }

  const content = renderForStep(currentStep);

  if (!content) {
    return (
      <OnBoardingLoading
        title="Loading activation details..."
        subtitle=""
        message="Please wait"
      />
    );
  }

  return <>{content}</>;
};

export default EmailAgentSetup;
