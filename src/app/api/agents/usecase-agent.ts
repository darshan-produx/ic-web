import { apiRequest } from '../../../common/api-request';


export const getAllUsecaseSuggestions = (
  activation_id: string,
  status?: string
) => {
  return apiRequest({
    url: `/api/app-service/v1/usecase-agent/${activation_id}`,
    method: 'GET',
    params: status ? { status } : {},
  });
};


export const regenerateUsecaseWithoutContext = (activation_id: string) => {
  return apiRequest({
    url: `/api/app-service/v1/usecase-agent/regenerate-without-context/${activation_id}`,
    method: 'POST',
  });
};

export const regenerateUsecaseWithContext = (
  activation_id: string,
  payload: { context: string }
) => {
  return apiRequest({
    url: `/api/app-service/v1/usecase-agent/regenerate-with-context/${activation_id}`,
    method: 'POST',
    data: payload,
  });
};

export const getAllProducts = async () => {
  return await apiRequest({
    url: `/api/app-service/v1/insight-masters/products`,
    method: 'GET',
  });
};

export const updateUsecase = (
  activation_id: string,
  agent_staging_id: string,
  payload: any
) => {
  return apiRequest({
    url: `/api/app-service/v1/usecase-agent/${activation_id}/update-usecase/${agent_staging_id}`,
    method: 'PATCH',
    data: payload,
  });
};

export const createUseCaseConfigAndInsightUseCaseMapFromAgentStaging = (
  activation_id: string,
  agent_staging_id: string
) => {
  return apiRequest({
    url: `/api/app-service/v1/usecase-agent/${activation_id}/create-usecase-config-and-insight-usecase-map/${agent_staging_id}`,
    method: 'PATCH',
  });
};

export const getAllOpportunitiesList = async (activation_id: string) => {
  const payload = activation_id ? { activation_id: activation_id } : {};
  return await apiRequest({
    url: `/api/app-service/v1/insight-instances/opportunities-list/news-agent`,
    method: 'GET',
    params: payload,
  });
};