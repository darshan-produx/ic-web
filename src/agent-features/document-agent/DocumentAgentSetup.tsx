//
'use client';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import ConnectRepository from './ConnectRepository';
import OnBoardingLoading from '../components/Loading';
import ReviewFolders, { FolderDataResponse } from './ReviewFolders';
import FoldersAndQnA from './FoldersAndQnA';
import { getActivationDetails } from '../../app/api/agents/agents';
import {
  useAnalyzeFolderMutation,
  useCreateIngestFoldersFromAgentStagingMutation,
} from '../../services/mutations/agents';
import {
  getDocumentAgentStagingDetails,
  getDocumentIngestion,
  getDocumentIngestionQna,
} from '../../app/api/agents/document-agent';
import { RequestAccessFolderPayload } from '../../app/api/agents/agent-types';
import { useAgentStepNavigation } from '../hooks/agentStepNavigation';
import { usePollingTimeout } from '../hooks/usePollingTimeout';

interface DocumentAgentSetupProps {
  activation_id: string;
}

const DEFAULT_STEPS = [
  'connected_folders',
  'connect_to_repository',
  'analyze_folders',
  'review_folders',
  'ingesting_folders',
  // 'signals',
  'completed',
  'failed',
] as string[];

const DocumentAgentSetup: React.FC<DocumentAgentSetupProps> = ({
  activation_id,
}) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activationDetails, setActivationDetails] = useState<any | null>(null);
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const [agentStagingId, setAgentStagingId] = useState<string | null>(null);
  const [folderData, setFolderData] = useState<FolderDataResponse | null>(null);
  const [qnaCountBeforeIngestion, setQnaCountBeforeIngestion] =
    useState<number>(0);
  const [isTimedOut, setIsTimedOut] = useState(false);

  const { data: activationDetailsData, isLoading } = useQuery({
    queryKey: ['activations', activation_id],
    queryFn: () => getActivationDetails(activation_id),
    refetchOnWindowFocus: false,
    refetchInterval: () => {
      if (isTimedOut) return false;
      if (
        currentStep === 'analyze_folders' &&
        !activationDetailsData?.data?.metadata?.agent_staging_id
      ) {
        return 5000;
      }
      return false;
    },
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

  const firstStep = useMemo(
    () =>
      Array.isArray(steps) && steps?.length > 0 ? steps[0] : DEFAULT_STEPS[0],
    [steps]
  );

  const isActivationDetailsDataPollingRunning =
    currentStep === 'analyze_folders' &&
    !activationDetailsData?.data?.metadata?.agent_staging_id;

  const isActivationDetailsDataSuccessful =
    currentStep === 'analyze_folders' &&
    !!activationDetailsData?.data?.metadata?.agent_staging_id;

  usePollingTimeout({
    isRunning: isActivationDetailsDataPollingRunning,
    isSuccessful: isActivationDetailsDataSuccessful,
    timeoutMs: 60000 * 3,
    resetKey: activation_id, // Resets timer if ID changes
    onTimeout: () => {
      console.warn('Document Agent activation Details Data polling timed out');
      toast.error('Timed out. Please try again.');
      setIsTimedOut(true);
    },
  });

  const {
    data: documentIngestionDetailsData,
    isLoading: documentIngestionLoading,
  } = useQuery({
    queryKey: ['get-document-ingestion', activation_id],
    queryFn: () => getDocumentIngestion(activation_id!),
    enabled: Boolean(activation_id),
    refetchOnWindowFocus: false,
  });
  const docIngestionData = documentIngestionDetailsData?.data;
  const hasConnectedFolders = useMemo(() => {
    return (
      (docIngestionData?.docs &&
        Array.isArray(docIngestionData?.docs) &&
        docIngestionData?.docs.length > 0) ||
      (docIngestionData?.pendingIngest &&
        docIngestionData?.pendingIngest > 0) ||
      (docIngestionData?.pendingIngest && docIngestionData?.pendingIngest > 0)
    );
  }, [documentIngestionDetailsData]);

  // Fetch QnA data from API - must be declared before syncStepLogic effect
  const isQnaQueryEnabled =
    Boolean(activation_id) &&
    (currentStep === 'connected_folders' ||
      currentStep === 'ingesting_folders');

  const {
    data: qnaData,
    isLoading: isQnALoading,
    isFetching: isQnAFetching,
  } = useQuery({
    queryKey: ['get-document-qna', activation_id],
    queryFn: () => getDocumentIngestionQna(activation_id!),
    enabled: isQnaQueryEnabled,
    refetchOnWindowFocus: false,
    retry: false,
    refetchInterval: (query) => {
      const data = query.state.data?.data;
      if (!data) return false;
      if (
        typeof data.pendingProcessed === 'number' &&
        data.pendingProcessed > 0
      ) {
        return 10_000;
      }
      return false;
    },
  });

  const hasPendingQnA = (qnaData?.data?.pendingProcessed ?? 0) > 0;
  const isQnALoadingState = isQnALoading || isQnAFetching || hasPendingQnA;
  const hasQnAs = (qnaData?.data?.docs?.length ?? 0) > 0;

  const isqnaDataSuccessful = Boolean(
    qnaData?.data?.pendingProcessed
      ? qnaData?.data?.pendingProcessed === 0
      : false
  );

  usePollingTimeout({
    isRunning: isQnaQueryEnabled && hasPendingQnA,
    isSuccessful: isqnaDataSuccessful,
    timeoutMs: 60000 * 3,
    resetKey: activation_id, // Resets timer if ID changes
    onTimeout: () => {
      console.warn('Document QNA polling timed out');
      toast.error('Timed out. Please try again.');
      if (currentStep === 'ingesting_folders') {
        jumpToStep('review_folders');
      } else {
        jumpToStep(firstStep!);
      }
    },
  });

  useEffect(() => {
    let cancelled = false;
    if (isLoading || documentIngestionLoading) return;
    const syncStepLogic = async () => {
      try {
        if (!activationDetails) {
          if (!cancelled) jumpToStep(firstStep!);
          return;
        }
        const backendCurrent = activationDetails.current_step;
        const stepsFromBackend = activationDetails.steps_list ?? [];
        if (backendCurrent === 'failed' || backendCurrent === 'completed') {
          if (!cancelled) jumpToStep(firstStep!);
          return;
        }
        if (
          backendCurrent === 'connected_folders' &&
          !hasConnectedFolders &&
          !hasQnAs
        ) {
          try {
            if (!cancelled) jumpToStep('connect_to_repository');
          } catch (error) {
            console.error('Failed to auto-advance step', error);
          }
          return;
        }
        if (backendCurrent && stepsFromBackend.includes(backendCurrent)) {
          if (!cancelled) setCurrentStep(backendCurrent);
        } else if (!backendCurrent && stepsFromBackend.length > 0) {
          if (!cancelled) jumpToStep(stepsFromBackend[0]);
        } else {
          if (!cancelled) jumpToStep(firstStep!);
        }
        if (activationDetailsData?.data?.metadata?.agent_staging_id) {
          setAgentStagingId(
            activationDetailsData.data.metadata.agent_staging_id
          );
        }
      } catch (err) {
        console.error('syncStepLogic error', err);
      }
    };

    syncStepLogic();
    return () => {
      cancelled = true;
    };
  }, [
    activationDetailsData,
    hasConnectedFolders,
    hasQnAs,
    goToNextStep,
    jumpToStep,
    setCurrentStep,
  ]);

  const analyzeFolder = useAnalyzeFolderMutation();

  const handleConnectRepository = useCallback(
    async (requestAccessFolderPayload: RequestAccessFolderPayload) => {
      // 1. Enter Loading Step
      goToNextStep();

      try {
        await analyzeFolder.mutateAsync({
          activation_id,
          requestAccessFolderPayload,
        });
      } catch (error) {
        // 4. Handle Network/System Error (revert step)
        console.error('Repository Connection Failed:', error);
        goToPrevStep();
      }
    },
    // Ensure all external functions/variables are in the dependency array
    [goToNextStep, goToPrevStep, activation_id, analyzeFolder]
  );

  const isDocumentAgentStagingDetailsQueryEnabled =
    Boolean(agentStagingId) && currentStep === 'analyze_folders';

  const {
    data: documentAgentStagingDetailsData,
    isLoading: documentAgentStagingDetailsLoading,
    isError,
  } = useQuery({
    queryKey: ['document-agent-staging-details', agentStagingId],
    queryFn: () => getDocumentAgentStagingDetails(agentStagingId!),
    enabled: isDocumentAgentStagingDetailsQueryEnabled,
    refetchOnWindowFocus: false,
    retry: false,
    refetchInterval: (query) => {
      const details = query.state.data?.data;
      if (!details) return 5_000;
      if (details.is_mapped) return false;
      return 5_000;
    },
  });

  const isDocumentAgentStagingDetailsDataSuccessful =
    documentAgentStagingDetailsData?.data?.is_mapped === true;

  usePollingTimeout({
    isRunning: isDocumentAgentStagingDetailsQueryEnabled,
    isSuccessful: isDocumentAgentStagingDetailsDataSuccessful,
    timeoutMs: 60000 * 3,
    resetKey: activation_id, // Resets timer if ID changes
    onTimeout: () => {
      console.warn('Document Agent Staging polling timed out');
      toast.error('Timed out. Please try again.');
      jumpToStep(firstStep!);
    },
  });

  useEffect(() => {
    if (
      isLoading ||
      documentAgentStagingDetailsLoading ||
      isError ||
      !documentAgentStagingDetailsData ||
      currentStep !== 'analyze_folders'
    ) {
      return;
    }
    const details = documentAgentStagingDetailsData.data;
    if (!details) return;
    if (!details.is_mapped) return;
    setFolderData(details);
    let cancelled = false;
    const proceed = async () => {
      try {
        if (!cancelled) {
          jumpToStep('review_folders');
        }
      } catch (error) {
        console.error('Failed to auto-advance step', error);
        if (!cancelled) {
          jumpToStep(firstStep!);
        }
      }
    };
    proceed();
    return () => {
      cancelled = true;
    };
  }, [documentAgentStagingDetailsData, isError, goToNextStep, jumpToStep]);

  const createIngestFoldersFromAgentStaging =
    useCreateIngestFoldersFromAgentStagingMutation();

  const handleReviewFoldersActivation = useCallback(async () => {
    try {
      // Store current QnA count before ingestion
      const currentCount = qnaData?.data?.docs?.length ?? 0;
      setQnaCountBeforeIngestion(currentCount);

      const response = await createIngestFoldersFromAgentStaging.mutateAsync({
        agent_staging_id: agentStagingId!,
        activation_id,
      });
      if (response) {
        toast.success('Folders activated successfully! Starting ingestion...');
        // Jump to ingesting_folders step BEFORE invalidating queries
        jumpToStep('ingesting_folders');
      }
    } catch (error: any) {
      console.error('Failed to create ingest folders:', error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to activate folders';
      toast.error(errorMessage);
    }
  }, [
    createIngestFoldersFromAgentStaging,
    agentStagingId,
    activation_id,
    jumpToStep,
    queryClient,
    qnaData,
  ]);

  // Transition from ingesting_folders to connected_folders when new QnA arrives
  const [hasShownCompletionToast, setHasShownCompletionToast] = useState(false);
  useEffect(() => {
    if (currentStep !== 'ingesting_folders') return;

    const currentQnaCount = qnaData?.data?.docs?.length ?? 0;
    const hasNewQuestion = currentQnaCount > qnaCountBeforeIngestion;

    // Only transition when we have at least one new QnA
    if (hasNewQuestion && currentQnaCount > 0) {
      jumpToStep('connected_folders');
      // Show success toast after analysis is complete - only once
      if (!hasShownCompletionToast) {
        toast.success('Document agent has now completed the analysis');
        setHasShownCompletionToast(true);
      }
    }
  }, [
    currentStep,
    qnaData,
    qnaCountBeforeIngestion,
    jumpToStep,
    hasShownCompletionToast,
  ]);

  const renderForStep = useCallback(
    (step: string | null) => {
      if (!step) return null;
      switch (step) {
        case 'connected_folders':
          return (
            <FoldersAndQnA
              activation_id={activation_id}
              qnaData={qnaData}
              isQnALoading={isQnALoadingState}
              onConnectMore={() => jumpToStep('connect_to_repository')}
              onDone={() => {}}
              jumpToStep={jumpToStep}
              firstStep={firstStep!}
            />
          );

        case 'connect_to_repository':
          return (
            <ConnectRepository
              activation_id={activation_id}
              onBack={() => jumpToStep('connected_folders')}
              onConnect={handleConnectRepository}
              hasConnectedFolders={hasConnectedFolders}
            />
          );

        case 'analyze_folders':
          return (
            <OnBoardingLoading
              title=""
              subtitle="I am analyzing folders"
              message="Please stay on the page"
            />
          );

        case 'review_folders':
          return (
            <ReviewFolders
              activation_id={activation_id}
              agentStagingId={agentStagingId}
              onBack={() => jumpToStep(firstStep!)}
              onActivate={handleReviewFoldersActivation}
              folderData={folderData as FolderDataResponse}
            />
          );

        case 'ingesting_folders':
          return (
            <OnBoardingLoading
              title="I am analysing your folders"
              subtitle=""
              message="This won't take long, you can explore till then"
              onExplore={() => router.push('/app/admin/agents')}
            />
          );

        case 'failed':
          return (
            <ConnectRepository
              activation_id={activation_id}
              onBack={() => router.push('/app/admin/agents')}
              onConnect={() => goToNextStep()}
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
    [activation_id, goToNextStep, goToPrevStep, router]
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

export default DocumentAgentSetup;
