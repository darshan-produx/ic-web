import { apiRequest } from '../../../common/api-request';

export const getAllInsights = async () => {
  return await apiRequest({
    url: `/api/app-service/v1/insight-instances`,
    method: 'GET',
  });
};

export const getInsightDetails = async (insight_instance_id: string) => {
  const response = await apiRequest({
    url: `/api/app-service/v1/insight-instances/${insight_instance_id}`,
    method: 'GET',
  });
  if (response.data?.guidance && !response.data?.guidance.answer_map) {
    (response.data?.guidance as any).answer_map = {};
  }
  if (response.data?.guidance && !response.data?.guidance.selected_node_id) {
    (response.data?.guidance as any).selected_node_id = '';
  }
  return response;
};

export const createOpportunity = async (data: any) => {
  return await apiRequest({
    url: `/api/app-service/v1/insight-instances`,
    method: 'POST',
    data,
  });
};

export const getOpportunityStatusConfig = async () => {
  return await apiRequest({
    url: `/api/app-service/v1/configuration/insight_action_status_config`,
    method: 'GET',
  });
};
export const removeOpportunity = async (insight_instance_id: string) => {
  return await apiRequest({
    url: `/api/app-service/v1/insight-instances/${insight_instance_id}`,
    method: 'DELETE',
  });
};

export const updateInsightDetails = async (
  insight_instance_id: string,
  data: any
) => {
  return await apiRequest({
    url: `/api/app-service/v1/insight-instances/${insight_instance_id}`,
    method: 'PATCH',
    data,
  });
};

export const reRunResearch = async (data: {
  org_id: string;
  insight_instance_id: string;
}) => {
  return await apiRequest({
    url: `/api/app-service/v1/re-run-research`,
    method: 'POST',
    data,
  });
};

export const updateGuidance = async (guidance_id: string, data: any) => {
  return await apiRequest({
    url: `/api/app-service/v1/guidances/${guidance_id}`,
    method: 'PATCH',
    data: {
      ...data,
    },
  });
};

export const getAllActiveInsights = async (customer_id: number) => {
  return await apiRequest({
    url: `/api/app-service/v1/insight-instances`,
    method: 'GET',
    params: {
      // status: ['Active', 'Identified', 'New'],
      status: ['Active', 'New'],
      customer_id,
      isFrom360View: true,
    },
  });
};

export const getInsightByFilter = async (props: {
  segments?: any[];
  pillars?: any[];
  customers?: any[];
  status?: any[];
  insightType?: any;
  urlSelectedId?: string;
  customer_id?: number;
}) => {
  return await apiRequest({
    url: `/api/app-service/v1/insight-instances`,
    method: 'GET',
    params: props,
  });
};

export const getOpportunitiesProducts = async (opportunity_id: string) => {
  return await apiRequest({
    url: `/api/app-service/v1/attributes/opportunities/${opportunity_id}`,
    method: 'GET',
  });
};

export const postIntelligenceChatInsight = async (data: any) => {
  return await apiRequest({
    url: `/api/app-service/v1/intelligence/chat/insight`,
    method: 'POST',
    data: data,
  });
};
export const getAllOpportunities = async () => {
  return await apiRequest({
    url: `/api/app-service/v1/insight-masters/opportunities`,
    method: 'GET',
  });
};
