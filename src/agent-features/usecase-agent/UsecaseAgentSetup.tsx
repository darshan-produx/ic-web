'use client';
import React, { useCallback, useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import OnBoardingLoading from '../components/Loading';
import { getActivationDetails } from '../../app/api/agents/agents';
import {
  useCreateUseCaseConfigAndInsightUseCaseMapFromAgentStagingMutation,
  useRegenerateUsecaseWithContextMutation,
  useRegenerateUsecaseWithoutContextMutation,
} from '../../services/mutations/agents';
import WelcomeUsecasePage from './WelcomeUsecasePage';
import UsecaseIntroductionPage from './UsecaseIntroductionPage';
import ReviewUsecasesPage from './ReviewUsecasesPage';
import OpportunitiesListPage from './OpportunitiesListPage';
import { toast } from 'react-toastify';
import {
  getAllOpportunitiesList,
  getAllUsecaseSuggestions,
} from '../../app/api/agents/usecase-agent';
import { DiscoveryStatus } from '../../app/api/agents/agent-types';
import { useAgentStepNavigation } from '../hooks/agentStepNavigation';
import { usePollingTimeout } from '../hooks/usePollingTimeout';

interface UsecaseAgentSetupProps {
  activation_id: string;
}

const DEFAULT_STEPS = [
  'welcome',
  'introduction',
  // 'usecase_context',
  'generate_usecase',
  'review_usecase',
  'identify_opportunities',
  'opportunities_list',
  'completed',
  'failed',
] as string[];

const UsecaseAgentSetup: React.FC<UsecaseAgentSetupProps> = ({
  activation_id,
}) => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const [activationDetails, setActivationDetails] = useState<any | null>(null);

  const { data: activationDetailsData, isLoading } = useQuery({
    queryKey: ['activations', activation_id],
    queryFn: () => getActivationDetails(activation_id),
    enabled: !!activation_id,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (activationDetailsData?.data) {
      setActivationDetails(activationDetailsData.data);
    }
  }, [activationDetailsData]);

  const { steps, currentIndex, goToNextStep, goToPrevStep, jumpToStep } =
    useAgentStepNavigation({
      activationId: activation_id,
      currentStep,
      backendSteps: activationDetails?.steps_list,
      defaultSteps: DEFAULT_STEPS,
    });

  // Sync Logic
  useEffect(() => {
    if (isLoading) return;
    let timeoutId: NodeJS.Timeout;
    const syncStepLogic = async () => {
      try {
        const details = activationDetailsData?.data;
        if (!details) {
          if (currentStep !== steps[0])
            setCurrentStep(steps[0] ?? DEFAULT_STEPS[0]);
          return;
        }

        const backendCurrent = details.current_step;

        if (backendCurrent === 'failed' || backendCurrent === 'completed') {
          // Ensure we don't loop if we are already there
          if (currentStep !== backendCurrent) {
            setCurrentStep(backendCurrent);
          }
          return;
        }

        if (backendCurrent && steps.includes(backendCurrent)) {
          setCurrentStep(backendCurrent);
        } else if (!backendCurrent && steps.length > 0) {
          // Default to first step if backend is null
          const firstStep = steps[0];
          if (currentStep !== firstStep) {
            jumpToStep(firstStep);
          }
        }
      } catch (err) {
        console.error('syncStepLogic error', err);
      }
    };

    syncStepLogic();

    return () => {};
  }, [activationDetailsData, isLoading, steps, jumpToStep]);

  const handleNext = useCallback(async () => {
    if (currentIndex === steps.length - 1) {
      jumpToStep('completed');
    } else {
      goToNextStep();
    }
  }, [currentIndex, steps.length, goToNextStep, jumpToStep]);

  const handlePrev = useCallback(async () => {
    goToPrevStep();
  }, [goToPrevStep]);

  const enableUseCaseSuggestionPollingQuery =
    Boolean(activation_id) && currentStep === 'generate_usecase';
  // --- Queries ---
  const {
    data: useCaseSuggestionDetailsDataStatus,
    isLoading: docIngestionDetailsLoading,
  } = useQuery({
    queryKey: ['get-all-usecase-suggestions-status', activation_id],
    queryFn: () => getAllUsecaseSuggestions(activation_id!, 'status'),
    enabled: enableUseCaseSuggestionPollingQuery,
    refetchOnWindowFocus: false,
    refetchInterval: (queryData) => {
      const data = queryData?.state?.data?.data.data;
      return data?.status === DiscoveryStatus.PENDING ? 5_000 : false;
    },
  });

  const isUseCaseSuggestionDetailsDataStatusProcessed =
    useCaseSuggestionDetailsDataStatus?.data?.data?.status ===
    DiscoveryStatus.PROCESSED;

  usePollingTimeout({
    isRunning: enableUseCaseSuggestionPollingQuery,
    isSuccessful: isUseCaseSuggestionDetailsDataStatusProcessed,
    timeoutMs: 60000 * 3,
    resetKey: activation_id, // Resets timer if ID changes
    onTimeout: () => {
      console.warn('Usecase generation timed out');
      toast.error('Timed out. Please try again.');
      jumpToStep('review_usecase');
    },
  });

  useEffect(() => {
    if (
      !enableUseCaseSuggestionPollingQuery ||
      !useCaseSuggestionDetailsDataStatus
    )
      return;
    const checkAndAdvanceStep = async () => {
      const status = useCaseSuggestionDetailsDataStatus?.data?.data?.status;
      if (status === DiscoveryStatus.PROCESSED) {
        jumpToStep('review_usecase');
      }
    };

    checkAndAdvanceStep();

    return () => {
      // Cleanup if needed
    };
  }, [
    useCaseSuggestionDetailsDataStatus,
    enableUseCaseSuggestionPollingQuery,
    jumpToStep,
  ]);

  const enableOpportunitiesDataQuery =
    Boolean(activation_id) &&
    (currentStep === 'identify_opportunities' ||
      currentStep === 'opportunities_list');

  const { data: opportunitiesData } = useQuery({
    queryKey: ['get-all-opportunities-list', activation_id],
    queryFn: () => getAllOpportunitiesList(activation_id!),
    enabled: enableOpportunitiesDataQuery,
    refetchOnWindowFocus: false,
    refetchInterval: (queryData) => {
      const isAgentStagingPending =
        queryData?.state?.data?.data?.isAgentStagingPending;
      return isAgentStagingPending ? 5_000 : false;
    },
  });

  const isOpportunitiesDataSuccessful =
    opportunitiesData?.data?.isAgentStagingPending === false;

  usePollingTimeout({
    isRunning: enableOpportunitiesDataQuery,
    isSuccessful: isOpportunitiesDataSuccessful,
    timeoutMs: 60000 * 4,
    resetKey: activation_id, // Resets timer if ID changes
    onTimeout: () => {
      console.warn('Opportunity identification timed out');
      toast.error('Timed out. Please try again.');
      jumpToStep('review_usecase');
    },
  });

  useEffect(() => {
    if (!enableOpportunitiesDataQuery || !opportunitiesData) return;
    const checkAndAdvanceStep = async () => {
      const opportunitiesList = opportunitiesData?.data?.data || [];
      if (Array.isArray(opportunitiesList) && opportunitiesList.length > 0) {
        jumpToStep('opportunities_list');
      }
    };
    checkAndAdvanceStep();
    return () => {
      // Cleanup if needed
    };
  }, [opportunitiesData, enableOpportunitiesDataQuery, jumpToStep]);

  const regenerateUsecaseWithoutContextMutation =
    useRegenerateUsecaseWithoutContextMutation();
  const regenerateUsecaseWithContextMutation =
    useRegenerateUsecaseWithContextMutation();
  const queryClient = useQueryClient();

  const handleContextSubmit = useCallback(
    async (contextValue: string) => {
      queryClient.removeQueries({
        queryKey: ['get-all-usecase-suggestions-status', activation_id],
      });
      jumpToStep('generate_usecase');
      try {
        if (contextValue) {
          await regenerateUsecaseWithContextMutation.mutateAsync({
            activation_id,
            context: contextValue,
          });
        } else {
          await regenerateUsecaseWithoutContextMutation.mutateAsync({
            activation_id,
          });
        }
      } catch (error: any) {
        console.error('Failed to regenerate usecase', error);
        jumpToStep('review_usecase');
        toast.error(
          'Failed to regenerate usecase',
          error?.response?.data?.message || ''
        );
      }
    },
    [
      activation_id,
      currentStep,
      goToNextStep,
      regenerateUsecaseWithContextMutation,
      regenerateUsecaseWithoutContextMutation,
    ]
  );

  const handleReviewBack = useCallback(async () => {
    router.push('/app/admin/agents');
  }, [router]);

  const createUseCaseConfigAndInsightUseCaseMapFromAgentStaging =
    useCreateUseCaseConfigAndInsightUseCaseMapFromAgentStagingMutation();

  const handleReviewComplete = useCallback(
    async (agent_staging_id: string) => {
      const stepAtStart = currentStep;
      if (stepAtStart === 'review_usecase') {
        goToNextStep();
      }
      try {
        const res =
          await createUseCaseConfigAndInsightUseCaseMapFromAgentStaging.mutateAsync(
            {
              activation_id,
              agent_staging_id,
            }
          );

        // if (res?.status === 200 || res?.status === 201) {
        //   if (
        //     stepAtStart === 'review_usecase' ||
        //     stepAtStart === 'identify_opportunities'
        //   ) {
        //     goToNextStep();
        //   }
        // }
      } catch (error: any) {
        console.error(
          'Failed to create usecase config and insight usecase map',
          error
        );
        toast.error(
          'Failed to create usecase',
          error?.response?.data?.message || ''
        );
      }
    },
    [
      activation_id,
      currentStep,
      goToNextStep,
      createUseCaseConfigAndInsightUseCaseMapFromAgentStaging,
    ]
  );

  const handleDone = useCallback(() => {
    router.push('/app/admin/agents');
  }, [router]);

  if (isLoading || !currentStep) {
    return (
      <OnBoardingLoading
        title="Loading agent setup"
        subtitle=""
        message="Please wait"
        showLogo={true}
      />
    );
  }

  // Render logic remains same, cleaner switch
  switch (currentStep) {
    case 'welcome':
      return <WelcomeUsecasePage onContinue={handleNext} />;

    case 'introduction':
      return (
        <UsecaseIntroductionPage
          onContinue={() => handleContextSubmit('')}
          onBack={handlePrev}
        />
      );

    // case 'usecase_context':
    //   return (
    //     <UsecaseContextPage
    //       activation_id={activation_id}
    //       onBack={handlePrev}
    //       onSubmitWithContext={handleContextSubmit}
    //       onSubmitWithoutContext={() => handleContextSubmit('')}
    //     />
    //   );

    case 'generate_usecase':
      return (
        <OnBoardingLoading
          title="I am now analysing your company and generating"
          subtitle="use cases that fit well"
          message="Please stay on the page"
          showLogo={false}
        />
      );

    case 'review_usecase':
      return (
        <ReviewUsecasesPage
          activation_id={activation_id}
          onBack={handleReviewBack}
          onSubmitWithContext={handleContextSubmit}
          onSubmitWithoutContext={() => handleContextSubmit('')}
          onComplete={handleReviewComplete}
        />
      );

    case 'identify_opportunities':
      return (
        <OnBoardingLoading
          title="I am now identifying new opportunities from the"
          subtitle="use cases we defined"
          message="Please stay on the page"
          showLogo={false}
        />
      );

    case 'opportunities_list':
      return (
        <OpportunitiesListPage
          activation_id={activation_id}
          onDone={handleDone}
          onBack={() => jumpToStep('review_usecase')}
          opportunitiesData={opportunitiesData?.data?.data || []}
        />
      );

    case 'completed':
      return (
        <OnBoardingLoading
          title="Setup Complete!"
          subtitle="Your usecase agent is ready"
          message="Redirecting to agents page"
          showLogo={true}
        />
      );

    case 'failed':
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-red-600">Setup Failed</h2>
            <p className="text-gray-600 mt-2">
              Please try again or contact support
            </p>
            <button
              onClick={handleDone}
              className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Return to Agents
            </button>
          </div>
        </div>
      );

    default:
      return (
        <OnBoardingLoading
          title="Processing"
          subtitle=""
          message="Please wait"
          showLogo={true}
        />
      );
  }
};

export default UsecaseAgentSetup;
