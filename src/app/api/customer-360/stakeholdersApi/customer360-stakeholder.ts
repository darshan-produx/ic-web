import { apiRequest } from '../../../../common/api-request';

export const getAllStakeholders = async (customer_id: number) => {
  return await apiRequest({
    url: `/api/app-service/v1/customers/${customer_id}/stakeholders`,
    method: 'GET',
  });
};

export const findOneStakeholder = async (id: string) => {
  if (!id) return null;
  return await apiRequest({
    url: `/api/app-service/v1/customers/stakeholder/${id}`,
    method: 'GET',
  });
};

export const createStakeholders = async (customer_id: number, data: any) => {
  return await apiRequest({
    url: `/api/app-service/v1/customers/${customer_id}/stakeholders`,
    method: 'POST',
    data: data,
  });
};

export const updateStakeholders = async (
  customer_id: number,
  stakeholder_id: string,
  data: any
) => {
  return await apiRequest({
    url: `/api/app-service/v1/customers/${customer_id}/stakeholders/${stakeholder_id}`,
    method: 'PATCH',
    data: data,
  });
};

export const deleteStakeholders = async (
  customer_id: number,
  stakeholder_id: string
) => {
  return await apiRequest({
    url: `/api/app-service/v1/customers/${customer_id}/stakeholders/${stakeholder_id}`,
    method: 'DELETE',
  });
};

export const getAllStakeholderEngagementLevelSynthesis = async (
  activation_id: string
) => {
  return await apiRequest({
    url: `/api/app-service/v1/stakeholders/engagement-level/synthesis/${activation_id}`,
    method: 'GET',
  });
};