import { useQuery } from '@tanstack/react-query';
import { getMyRoles } from '../../app/api/users/users';
import { getOnboardingCurrentStep } from '../../app/api/onboarding/onboarding-client';

export function useMyRoles() {
  return useQuery({
    queryKey: ['roles'],
    queryFn: getMyRoles,
    refetchOnWindowFocus: false,
  });
}

export function useMyOnboarding() {
  return useQuery({
    queryKey: ['onboarding', 'current', 'step'],
    queryFn: getOnboardingCurrentStep,
    refetchOnWindowFocus: false,
  });
}


