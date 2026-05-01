import { apiRequest } from '../../../common/api-request';

export const AskAIAPI = async (type: string | null, payload: any) => {
  const url = type
    ? `/api/app-service/v1/intelligence/chat/${type}`
    : '/api/app-service/v1/intelligence/chat';

  return await apiRequest({
    url: url,
    method: 'POST',
    data: payload,
  });
};


export const getPrompts = async () => {
  return apiRequest({
    url: `/api/app-service/v1/prompts`,
    method: 'GET',
  });
};


export const getCustomResearchChatHistory = async (
  custom_research_id: string
) => {
  return apiRequest({
    url: `/api/app-service/v1/insight-instances/research-chat-conversation/${custom_research_id}`,
    method: 'GET',
  });
};

export const deleteCustomResearchChatConversation = async (
  custom_research_id: string
) => {
  return apiRequest({
    url: `/api/app-service/v1/insight-instances/research-chat-conversation/${custom_research_id}`,
    method: 'DELETE',
  });
};