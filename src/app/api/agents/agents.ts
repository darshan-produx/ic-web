import { apiRequest } from '../../../common/api-request';

export const getAllAgentsMaster = () => {
  return apiRequest({
    url: '/api/app-service/v1/agents',
    method: 'GET',
  });
};

export const getAllActiveAgents = () => {
  return apiRequest({
    url: `/api/app-service/v1/agents/activations`,
    method: 'GET',
  });
};

export const getActivationDetails = async (activation_id: string) => {
  return apiRequest({
    url: `/api/app-service/v1/agents/activations/${activation_id}`,
    method: 'GET',
  });
};

export const updateActivationStep = async (
  activation_id: string,
  payload?: {
    action: string;
    target_step?: string;
  }
) => {
  return apiRequest({
    url: `/api/app-service/v1/agents/activations/${activation_id}/step`,
    method: 'PATCH',
    data: payload,
  });
};

export const updateActivationMetadata = async (
  activation_id: string,
  payload: {
    metadata: Record<string, any>;
  }
) => {
  return apiRequest({
    url: `/api/app-service/v1/agents/activations/${activation_id}/metadata`,
    method: 'PATCH',
    data: payload,
  });
};

export const activateAgent = (agentType: string) => {
  return apiRequest({
    url: `/api/app-service/v1/agents/activate/${agentType}`,
    method: 'POST',
  });
};

export const deleteDatabase = () => {
  return apiRequest({
    url: '/api/app-service/v1/onboarding/collections/purge',
    method: 'DELETE',
  });
};
export const getDeleteDatabaseConfig = () => {
  return apiRequest({
    url: '/api/app-service/v1/configuration/delete-database-config',
    method: 'GET',
  });
};
