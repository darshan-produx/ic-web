'use client';
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import { useQuery } from '@tanstack/react-query';
import OnboardingLogin from './OnboardingLogin';
import {
  getOnboardingClient,
  getOnboardingCurrentStep,
} from '../api/onboarding/onboarding-client';
import Welcome from './Welcome';
import Loading from '../../common/components/loading';
import {
  useCompleteStep,
  useDeleteClientDetails,
  useMoveBackStep,
} from '../../services/mutations/onboarding';
import ClientDetails from './ClientDetails';
import OnBoardingLoading from '../../agent-features/components/Loading';
import {
  clientDetails,
  OnboardingStep,
} from '../api/onboarding/onboarding-types';
import AgentResults from './AgentResults';
// import AgentGreeting from './AgentGreeting';
// import ActivateAgents from './ActivateAgents';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
export default function OnboardingPage() {
  const router = useRouter();
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [clientDetails, setClientDetails] = useState<clientDetails | null>(
    null
  );
  const [isRedirecting, setIsRedirecting] = useState(false);
  const { data: currentStepData, isLoading: isCurrentStepLoading } = useQuery({
    queryKey: ['onboarding', 'current'],
    queryFn: getOnboardingCurrentStep,
    refetchOnWindowFocus: false,
  });
  const completeStep = useCompleteStep();
  const moveBackStep = useMoveBackStep();
  const deleteClientDetails = useDeleteClientDetails();
  const currentStep = useMemo(() => {
    const rawStep = (currentStepData as any)?.data?.currentStep;
    return typeof rawStep === 'string' && rawStep.trim() !== ''
      ? rawStep.toLowerCase()
      : null;
  }, [currentStepData]);

  const handleClientDetails = async (newClientDetails: clientDetails) => {
    setClientDetails(newClientDetails);
    const clientId = String(newClientDetails._id);
    localStorage.setItem('client_id', String(clientId));
  };

  const { data: clientDetailsData, isLoading: clientDetailsDataLoading } =
    useQuery({
      queryKey: [
        'clientDetails',
        clientDetails?._id?.toString() ??
          localStorage.getItem('client_id') ??
          '',
      ],
      queryFn: ({ queryKey }) => {
        const clientId = String(queryKey[1]);
        return getOnboardingClient(clientId);
      },
      enabled:
        (!!clientDetails?._id && clientDetails?.is_analyzed === false) ||
        (currentStep === 'agent_results' && !clientDetails),
      refetchOnWindowFocus: false,
      refetchInterval: (latestData: any) => {
        const payload = latestData?.state?.data?.data ?? {};
        const isAnalyzed = !!payload?.is_analyzed;
        return isAnalyzed ? false : 2_000;
      },
    });

  const timeoutRef = useRef<number | null>(null);
  const currentStepRef = useRef(currentStep);
  useEffect(() => {
    currentStepRef.current = currentStep;
  }, [currentStep]);

  const latestMoveBackRef = useRef(moveBackStep);
  useEffect(() => {
    latestMoveBackRef.current = moveBackStep;
  }, [moveBackStep]);

  useEffect(() => {
    if (currentStep !== 'processing') return;
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    const TIMEOUT_MS = 60000;
    timeoutRef.current = window.setTimeout(async () => {
      if (currentStepRef.current !== 'processing') {
        timeoutRef.current = null;
        return;
      }
      const payload = clientDetailsData?.data;
      const isAnalyzed = !!payload?.is_analyzed;

      if (isAnalyzed) {
        timeoutRef.current = null;
        return;
      }

      try {
        setClientDetails(null);
        localStorage.removeItem('client_id');

        const moveBack = latestMoveBackRef.current;
        if (typeof moveBack?.mutateAsync === 'function') {
          await moveBack.mutateAsync({});
        } else if (typeof moveBack?.mutate === 'function') {
          moveBack.mutate({});
        } else {
          console.warn('moveBack mutation not available');
        }
        toast.error('Timed out. Please try again.');
      } catch (err) {
        console.error('moveBack failed', err);
      } finally {
        timeoutRef.current = null;
      }
    }, TIMEOUT_MS);
    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [currentStep, clientDetails?._id]);

  const markedAgentResultsRef = useRef<string | null>(null);
  // Keep stable reference to mutation call
  const handleStepComplete = useCallback(
    async (step: OnboardingStep) => {
      try {
        await completeStep.mutateAsync({ step });
      } catch (error) {
        console.error('Error completing step:', error);
      }
    },
    [completeStep] // depends only on mutation instance
  );

  const handleAgentResultsBack = useCallback(async () => {
    try {
      await deleteClientDetails.mutateAsync(clientDetails?._id ?? '');
      setClientDetails(null);
      localStorage.removeItem('client_id');
      const moveBack = latestMoveBackRef.current;
      if (typeof moveBack?.mutateAsync === 'function') {
        await moveBack.mutateAsync({
          step: 'client_details',
        });
      } else if (typeof moveBack?.mutate === 'function') {
        moveBack.mutate({
          step: 'client_details',
        });
      } else {
        console.warn('moveBack mutation not available');
      }
    } catch (err) {
      console.error('Failed to move back:', err);
      toast.error('Failed to move back. Please try again.');
    }
  }, [handleStepComplete]);

  useEffect(() => {
    if (!clientDetailsData) return;
    const payload = clientDetailsData?.data;
    if (!payload) return;
    const clientId = String(payload?._id ?? clientDetails?._id ?? '');
    if (!payload?.is_analyzed || !clientId) return;
    setClientDetails(
      (prev) => ({ ...(prev ?? {}), ...(payload ?? {}) } as clientDetails)
    );
    if (markedAgentResultsRef.current === clientId) return;

    let mounted = true;
    (async () => {
      try {
        await handleStepComplete('processing');
        if (mounted) markedAgentResultsRef.current = clientId;
      } catch (err) {
        console.error('Failed to mark agent_results:', err);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [clientDetailsData]);

  const hasRedirected = useRef(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (currentStep === 'activate' && !hasRedirected.current) {
      hasRedirected.current = true;
      setIsRedirecting(true);
      timeoutId = setTimeout(() => {
        router.replace('/app/admin/agents');
      }, 500);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [currentStep, router]);

  if (isCurrentStepLoading) return <Loading />;
  if (currentStep === 'activate' || isRedirecting) {
    return (
      <OnBoardingLoading
        title=""
        subtitle="Finalizing Agent setup"
        message=""
        showLogo={true}
      />
    );
  }
  return (
    <div data-onboarding-page className="relative">
      {currentStep === 'login' || !currentStep ? (
        <div key={currentStep}>
          <OnboardingLogin />
        </div>
      ) : (
        <div key={currentStep}>
          {currentStep && currentStep === 'welcome' && (
            <Welcome onContinue={handleStepComplete} direction={direction} />
          )}
          {currentStep === 'client_details' && (
            <ClientDetails
              onContinue={handleClientDetails}
              direction={direction}
            />
          )}
          {currentStep === 'processing' && (
            <OnBoardingLoading showLogo={true} />
          )}
          {currentStep === 'agent_results' && (
            <AgentResults
              clientDetails={clientDetails}
              onComplete={handleStepComplete}
              setClientDetails={setClientDetails}
              direction={direction}
              onBack={handleAgentResultsBack}
            />
          )}
          {/* {currentStep === 'agent_greeting' && (
            <AgentGreeting onComplete={handleAgentGreetingComplete} />
          )} */}
          {/* {currentStep === 'activate' && <ActivateAgents />} */}
        </div>
      )}
    </div>
  );
}
