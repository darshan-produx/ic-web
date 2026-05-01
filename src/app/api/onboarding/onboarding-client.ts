
import { apiRequest } from '../../../common/api-request';
import {
  ClientData,
  clientDetails,
  OnboardClientResponse,
  OnboardingStep,
} from './onboarding-types';

export const getOnboardingSSOProvider = () => {
  return apiRequest({
    url: '/api/app-service/v1/onboarding/get-sso-provider',
    method: 'GET',
  });
};
export const getOnboardingCurrentStep = () => {
  return apiRequest({
    url: '/api/app-service/v1/onboarding/current-step',
    method: 'GET',
  });
};

export const completeOnboardingStep = async (
  step: OnboardingStep,
  payload?: any
) => {
  return apiRequest({
    url: '/api/app-service/v1/onboarding/mark-step-complete',
    method: 'PATCH',
    data: { step, payload },
  });
};

export const moveBackOnboardingStep = async (
  step?: OnboardingStep,
  payload?: any
) => {
  return apiRequest({
    url: '/api/app-service/v1/onboarding/mark-step-back',
    method: 'PATCH',
    data: { step, payload },
  });
};

export const createClient = async (payload: ClientData) => {
  return apiRequest({
    url: '/api/app-service/v1/onboarding/create-client',
    method: 'POST',
    data: payload,
  });
};

export const getOnboardingClient = (client_id: string) => {
  if (!client_id) return null;
  return apiRequest({
    url: `/api/app-service/v1/onboarding/client/${client_id}`,
    method: 'GET',
  });
};

export const updateOnboardingClient = (
  client_id: string,
  payload: clientDetails
) => {
  return apiRequest({
    url: `/api/app-service/v1/onboarding/client/${client_id}`,
    method: 'PATCH',
    data: payload,
  });
};

export const addNewCustomerForOnboardingClient = (payload: {
  clientId: string;
  clientName: string;
  customerName: string;
  customerWebsiteUrl: string;
}) => {
  console.log('Adding new customer with payload:', payload);
  return apiRequest({
    url: `/api/app-service/v1/onboarding/client/add-customer`,
    method: 'POST',
    data: payload,
  });
};

export const addCustomersandInsightInMaster = (clientId: string) => {
  return apiRequest({
    url: `/api/app-service/v1/onboarding/client/add-customers-and-insight-in-master/${clientId}`,
    method: 'POST',
  });
};

export const regenerateClientDetails = async (clientId: string) => {
  return apiRequest({
    url: `/api/app-service/v1/onboarding/regenerate-client-details/${clientId}`,
    method: 'GET',
  });
};

export const deleteClientDetails = async (clientId: string) => {
  return apiRequest({
    url: `/api/app-service/v1/onboarding/delete-client-details/${clientId}`,
    method: 'DELETE',
  });
};