import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createStakeholders,
  deleteStakeholders,
  updateStakeholders,
} from '../../app/api/customer-360/stakeholdersApi/customer360-stakeholder';
import {
  createCustomerOnboardingPlan,
  updateCustomerOnboardingPlan,
} from '../../app/api/customer-360/customerOnboarding/onboarding';
import dayjs from 'dayjs';
import { createCustomerProjectPlan } from '../../app/api/customer-360/customerProjects/customerProjects';

export function useAddStakeholder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => {
      const customer_id = data?.customer_id;
      delete data?.customer_id;
      return createStakeholders(customer_id, data);
    },
    onSettled: async (data, error) => {
      if (error) console.log(error);
      else {
        //
      }
    },
    onSuccess(data, variables, context) {
      queryClient.invalidateQueries({
        queryKey: ['stakeholders'],
        exact: true,
      });
      queryClient.invalidateQueries({
        queryKey: ['meetings'],
        exact: false,
      });
    },
  });
}

export function useUpdateStakeholder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => {
      const customer_id = data?.customer_id;
      const stakeholder_id = data?.stakeholder_id;
      delete data?.customer_id;
      return updateStakeholders(customer_id, stakeholder_id, data);
    },
    onSettled: async (data, error) => {
      if (error) console.log(error);
      else {
        //
      }
    },
    onSuccess(data, variables, context) {
      queryClient.invalidateQueries({
        queryKey: ['stakeholders'],
        exact: true,
      });
    },
  });
}

export function useDeleteStakeholder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => {
      const customer_id = data?.customer_id;
      const stakeholder_id = data?.stakeholder_id;
      return deleteStakeholders(customer_id, stakeholder_id);
    },
    onSettled: async (data, error) => {
      if (error) console.log(error);
      else {
        //
      }
    },
    onSuccess(data, variables, context) {
      queryClient.invalidateQueries({
        queryKey: ['stakeholders'],
        exact: true,
      });
    },
  });
}

export function useUpdateCustomerOnboardingPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => {
      const customer_id = data?.customer_id;
      return updateCustomerOnboardingPlan(customer_id, data);
    },
    onSuccess(data, variables, context) {
      queryClient.invalidateQueries({
        queryKey: ['customerOnboarding'],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ['customerOnboardingPlan'],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ['customerOnboardingStatus'],
        exact: false,
      });
    },
  });
}

export function useCreateCustomerOnboardingPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => {
      const customer_id = data?.customer_id;
      const start_date = dayjs(data.startDate).format('YYYY-MM-DD');
      return createCustomerOnboardingPlan(customer_id, start_date);
    },
    onSuccess(data, variables, context) {
      queryClient.invalidateQueries({
        queryKey: ['customerOnboarding'],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ['customerOnboardingPlan'],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ['customerOnboardingStatus'],
        exact: false,
      });
    },
  });
}

export function useCreateCustomerProjectPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => {
      const customer_id = data?.customerId;
      delete data?.customerId;
      return createCustomerProjectPlan(customer_id, data);
    },
    onSuccess(data, variables, context) {
      queryClient.invalidateQueries({
        queryKey: ['customerProjectPlan'],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ['getPillarStatus'],
        exact: false,
      });
    },
  });
}