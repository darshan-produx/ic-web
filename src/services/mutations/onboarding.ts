import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  addCustomersandInsightInMaster,
  addNewCustomerForOnboardingClient,
  completeOnboardingStep,
  createClient,
  deleteClientDetails,
  moveBackOnboardingStep,
  regenerateClientDetails,
  updateOnboardingClient,
} from '../../app/api/onboarding/onboarding-client';
import {
  ClientData,
  clientDetails,
  OnboardingStep,
} from '../../app/api/onboarding/onboarding-types';

export function useCompleteStep() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { step: OnboardingStep; data?: any }) =>
      completeOnboardingStep(payload.step, payload.data),
    onSuccess() {
      // canonical current step may have changed on server
      qc.invalidateQueries({ queryKey: ['onboarding', 'current'] });
    },
  });
}

export function useCreateClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ClientData) => createClient(payload),
    onSuccess(data) {
      qc.invalidateQueries({ queryKey: ['onboarding', 'current'] });
    },
  });
}

export function useUpdateClient() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: clientDetails) => {
      if (!payload?._id) {
        throw new Error('Client ID is missing in payload.');
      }
      const clientId = payload._id.toString();
      const response = await updateOnboardingClient(clientId, payload);
      return response?.data ?? response;
    },
    onSuccess: async () => {
      // await qc.invalidateQueries({ queryKey: ['onboarding', 'current'] });
      await qc.invalidateQueries({ queryKey: ['clientDetails'], exact: false });
    },
    onError: (error) => {
      console.error('Failed to update client details:', error);
    },
  });
}

export function useAddNewCustomerClient() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      clientId: string;
      clientName: string;
      customerName: string;
      customerWebsiteUrl: string;
    }) => {
      const response = await addNewCustomerForOnboardingClient(payload);
      return response?.data ?? response;
    },
    onSuccess: async (data, variables) => {
      const clientId = variables.clientId;
      qc.invalidateQueries({
        queryKey: ['clientDetails', clientId],
        exact: false,
      });
    },
    onError: (error) => {
      console.error('Failed to update client details:', error);
    },
  });
}

export function useAddCustomersandInsightInMaster() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (clientId: string) => {
      const response = await addCustomersandInsightInMaster(clientId);
      return response?.data ?? response;
    },
    onSuccess: async (data, variables) => {
      const clientId = variables;
      qc.invalidateQueries({
        queryKey: ['clientDetails', clientId],
        exact: false,
      });
    },
    onError: (error) => {
      console.error('Failed to update client details:', error);
    },
  });
}

export function useMoveBackStep() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload?: { step?: OnboardingStep; data?: any }) =>
      moveBackOnboardingStep(payload?.step, payload?.data),
    onSuccess() {
      // canonical current step may have changed on server
      qc.invalidateQueries({ queryKey: ['onboarding', 'current'] });
    },
  });
}

export function useDeleteClientDetails() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (clientId: string) => {
      if (!clientId) {
        throw new Error('Client ID is required for deletion.');
      }
      const response = await deleteClientDetails(clientId);
      return response?.data ?? response;
    },
    onSuccess: async (data, variables) => {
      const clientId = variables;
      qc.invalidateQueries({
        queryKey: ['clientDetails', clientId],
        exact: false,
      });
    },
    onError: (error) => {
      console.error('Failed to delete client details:', error);
    },
  });
}

export function useRegenerateClientDetails() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (clientId: string) => {
      if (!clientId) {
        throw new Error('Client ID is required for regeneration.');
      }
      const response = await regenerateClientDetails(clientId);
      return response?.data ?? response;
    },
    onSuccess: async (data, variables) => {
      const clientId = variables;
      qc.invalidateQueries({
        queryKey: ['clientDetails', clientId],
        exact: false,
      });
    },
    onError: (error) => {
      console.error('Failed to regenerate client details:', error);
    },
  });
}