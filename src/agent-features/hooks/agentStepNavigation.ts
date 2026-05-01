import { useMemo, useRef, useEffect, useCallback } from 'react';
import { useUpdateActivationStepMutation } from '../../services/mutations/agents';

export const useAgentStepNavigation = ({
  activationId,
  currentStep,
  backendSteps,
  defaultSteps,
}: {
  activationId: string;
  currentStep: string | null;
  backendSteps?: string[];
  defaultSteps: string[];
}) => {
  const updateActivationStep = useUpdateActivationStepMutation();
  
  // Safety Refs
  const inFlight = useRef(false);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Compute Steps
  const steps = useMemo<string[]>(() => {
    if (backendSteps && Array.isArray(backendSteps)) {
      return backendSteps;
    }
    return Array.from(defaultSteps);
  }, [backendSteps, defaultSteps]);

  // Compute Index
  const currentIndex = useMemo(() => {
    if (!currentStep) return -1;
    return steps.indexOf(currentStep);
  }, [currentStep, steps]);

  // Generic Transition Handler (Handling Optimistic UI & Rollback)
  const performTransition = useCallback(
    async (
      targetStep: string,
      action: 'next' | 'prev' | 'jump'
    ) => {
      if (!activationId) return;
      if(!targetStep) return;
      if (inFlight.current) return;
      inFlight.current = true;

      try {
        const payload: any = { activation_id: activationId, action };
        if (action === 'jump') payload.target_step = targetStep;

      await updateActivationStep.mutateAsync(payload);

        if (!isMounted.current) return;
      } catch (err) {
        console.error(`Failed to ${action} step`, err);
      } finally {
        inFlight.current = false;
      }
    },
    [activationId, updateActivationStep]
  );

  // Public Actions
  const goToNextStep = useCallback(() => {
    if (currentIndex < 0 || steps.length === 0) return;
    const nextIndex = Math.min(currentIndex + 1, steps.length - 1);
    if (nextIndex === currentIndex) return;
    
    performTransition(steps[nextIndex], 'next');
  }, [currentIndex, steps, currentStep, performTransition]);

  const goToPrevStep = useCallback(() => {
    if (currentIndex < 0 || steps.length === 0) return;
    const prevIndex = Math.max(currentIndex - 1, 0);
    if (prevIndex === currentIndex) return;

    performTransition(steps[prevIndex], 'prev');
  }, [currentIndex, steps, currentStep, performTransition]);

  const jumpToStep = useCallback(
    (targetStep: string) => {
      if (targetStep === currentStep) return;
      performTransition(targetStep, 'jump');
    },
    [currentStep, performTransition]
  );

  return {
    steps,
    currentIndex,
    goToNextStep,
    goToPrevStep,
    jumpToStep,
  };
};