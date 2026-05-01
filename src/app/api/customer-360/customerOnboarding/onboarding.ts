import { apiRequest } from '../../../../common/api-request';

export const getCustomerOnboardingStatus = async (customer_id: number) => {
  return await apiRequest({
    url: `/api/app-service/v1/customers/${customer_id}/onboarding-status`,
    method: 'GET',
  });
};

export const getCustomerOnboardingPlan = async (cstomer_id: number) => {
  return apiRequest({
    url: `/api/app-service/v1/customers/${cstomer_id}/onboarding-plan`,
    method: 'GET',
  });
};

export const updateCustomerOnboardingPlan = async (
  cstomer_id: number,
  data: any
) => {
  return apiRequest({
    url: `/api/app-service/v1/customers/${cstomer_id}/onboarding-plan`,
    method: 'PATCH',
    data: data,
  });
};

export const createCustomerOnboardingPlan = async (
  cstomer_id: number,
  start_date: any
) => {
  return apiRequest({
    url: `/api/app-service/v1/customers/${cstomer_id}/onboarding-plan`,
    method: 'POST',
    data: { start_date },
  });
};
