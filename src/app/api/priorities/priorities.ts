import { apiRequest } from '../../../common/api-request';

export const getpersonalEventsAndExternalNews = async () => {
  return apiRequest({
    url: '/api/app-service/v1/events-and-references',
    method: 'GET',
  });
};

export const getAllPriorityTasks = async () => {
  return apiRequest({
    url: '/api/app-service/v1/priority-tasks',
    method: 'GET',
  });
};

export const getEventsAndReferences = async () => {
  return apiRequest({
    url: '/api/app-service/v1/events-and-references',
    method: 'GET',
  });
};

export const getAllChecklistItemsForGivenDate = async () => {
  return apiRequest({
    url: '/api/app-service/v1/checklist-items',
    method: 'GET',
    params: {
      // todo
      data: { date: new Date().toISOString() },
    },
  });
};

export const createChecklistItem = (data: any) => {
  return apiRequest({
    url: '/api/app-service/v1/checklist-items',
    method: 'POST',
    data: data,
  });
};

export const updateChecklistItem = async (
  checklist_item_id: any,
  data: any
) => {
  return apiRequest({
    url: `/api/app-service/v1/checklist-items/${checklist_item_id}`,
    method: 'PATCH',
    data: data,
  });
};

export const deleteChecklistItem = async (checklist_item_id: any) => {
  return apiRequest({
    url: `/api/app-service/v1/checklist-items/${checklist_item_id}`,
    method: 'DELETE',
  });
};

export const getPriorityInsightByFilter = async (props: { type: string }) => {
  return await apiRequest({
    url: `/api/app-service/v1/insight-instances`,
    method: 'GET',
    params: props,
  });
};

export const getPrioritySignalsAndOpportunites = async () => {
  return await apiRequest({
    url: `/api/app-service/v1/priority-signals-and-opportunities`,
    method: 'GET',
  });
};

export const getPriorityEmails = async () => {
  return await apiRequest({
    url: `/api/app-service/v1/email-messages`,
    method: 'GET',
    params: { type: 'priorities', sort_by: 'priority' },
  });
};

export const getAllPriorityCustomerOverView = async () => {
  return await apiRequest({
    url: `/api/app-service/v1/priority-customer-overview`,
    method: 'GET',
  });
};

export const getAllChecklistItems = async (date: any) => {
  return await apiRequest({
    url: `/api/app-service/v1/checklist-items`,
    method: 'GET',
    params: { date },
  });
};

export const moveChecklistItems = async (date?: any) => {
  return await apiRequest({
    url: `/api/app-service/v1/move-checklist-items`,
    method: 'POST',
    params: { date },
  });
};
