import { apiRequest } from '../../../common/api-request';

export const uploadTranscript = async (data: Record<string, any>) => {
  const formData: any = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value instanceof File || value instanceof Blob) {
      formData.append(key, value);
    } else if (Array.isArray(value)) {
      formData.append(key, JSON.stringify(value));
    } else if (typeof value === 'object' && value !== null) {
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, value);
    }
  });

  return apiRequest({
    url: '/api/app-service/v1/customer-meeting/create-meeting',
    method: 'POST',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const uploadMeetingsMOM = async (data: any) => {
  return apiRequest({
    url: '/api/app-service/v1/customer-meeting/create-meeting/minutes-of-meeting',
    method: 'POST',
    data: data,
  });
};

export const getCustomerMeetings = async (
  customerId: any,
  startDuration: any,
  searchText: string
) => {
  return apiRequest({
    url: `/api/app-service/v1/customer-meeting?customer_id=${customerId}&start_duration=${startDuration}&meetingSearch=${searchText}`,
    method: 'GET',
  });
};

export const getStakeholderMeetings = async (stakeholder_id: string) => {
  if (!stakeholder_id || stakeholder_id.trim() === '') {
    return { data: [] };
  }
  return await apiRequest({
    url: `/api/app-service/v1/customer-meeting/stakeholder-meetings/${stakeholder_id}`,
    method: 'GET',
  });
};

export const getCustomerStakeholdersWithTeamUsers = async (customer_id: string) => {
  return apiRequest({
    url: `/api/app-service/v1/customer-stakeholders-with-team-users/${customer_id}`,
    method: 'GET',
  });
};
export const getAllMyTeamCustomers = async () => {
  return apiRequest({
    url: `/api/app-service/v1/customers/myteam-customers`,
    method: 'GET',
  });
};

export const updateMeeting = async (id: string, data: any) => {
  return apiRequest({
    url: `/api/app-service/v1/customer-meeting/${id}`,
    method: 'PATCH',
    data: data,
  });
};

export const deleteMeeting = async (id: string, keepSuggestion: boolean) => {
  return apiRequest({
    url: `/api/app-service/v1/customer-meeting/${id}?keep_suggestion=${keepSuggestion}`,
    method: 'DELETE',
  });
};

export const getMeetingSuggestion = async (meeting_id: string) => {
  return apiRequest({
    url: `/api/app-service/v1/meeting-suggestion?meeting_id=${meeting_id}`,
    method: 'GET',
  });
};

export const updateSingleMeetingSuggetion = async (
  id: string,
  data?: any,
  action?: string
) => {
  return apiRequest({
    url: `/api/app-service/v1/meeting-suggestion/${id}?update_suggestion=${action}`,
    method: 'PATCH',
    data,
  });
};

export const updateAllMeetingSuggetions = async (data: any) => {
  return apiRequest({
    url: `/api/app-service/v1/meeting-suggestion?update_suggestion=${data?.action}&meeting_id=${data?.id}`,
    method: 'PATCH',
  });
};
