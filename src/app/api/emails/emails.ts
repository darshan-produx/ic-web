import { apiRequest } from '../../../common/api-request';
export const getEmails = async (props: {
  folder: string;
  sort_by?: string;
  customer_id?: number;
  stakeholder_id?: string;
  skip?: number;
}) => {
  const params: Record<string, any> = {
    limit: 15,
  };

  const { folder, sort_by, customer_id, stakeholder_id, skip } = props;

  if (folder != '') {
    params['folder'] = folder.toUpperCase();
  }

  if (sort_by) {
    params['sort_by'] = sort_by.toLocaleLowerCase();
  }

  if (customer_id && customer_id !== 0) {
    params['customer_id'] = `${customer_id}`;
  }

  if (stakeholder_id && stakeholder_id != '') {
    params['stakeholder_id'] = stakeholder_id;
  }

  if (skip) {
    params['skip'] = skip;
  }

  const queryString = params.toString();

  return await apiRequest({
    url: `/api/app-service/v1/email-messages`,
    method: 'GET',
    params,
  });
};

export const getConversationById = async (id: string) => {
  if (id?.trim() != '') {
    return await apiRequest({
      url: `/api/app-service/v1/email-conversations/${id}`,
      method: 'GET',
    });
  } else {
    return { data: {} };
  }
};

export const getAllCustomersStakeholders = async (
  is_email_encrypt_flag?: boolean
) => {
  const is_email_encrypt = is_email_encrypt_flag
    ? is_email_encrypt_flag
    : false;
  return await apiRequest({
    url: `/api/app-service/v1/all-customers-stakeholders?is_email_encrypt=${is_email_encrypt}`,
    method: 'GET',
  });
};

export const editEmailbyId = async (id: string, payload: any) => {
  return await apiRequest({
    url: `/api/app-service/v1/email-messages/${id}`,
    method: 'PATCH',
    data: payload,
  });
};

export const sendEmail = async (payload: any) => {
  const formData = new FormData();

  Object.keys(payload).forEach((key) => {
    if (key !== 'attachments') {
      formData.append(key, payload[key]);
    }
  });

  if (payload.attachments && payload.attachments.length > 0) {
    payload.attachments.forEach((file: any, index: any) => {
      formData.append(`attachments`, file);
    });
  }

  return await apiRequest({
    url: `/api/app-service/v1/send-email-message`,
    method: 'POST',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const deleteEmailbyId = async (id: string) => {
  return await apiRequest({
    url: `/api/app-service/v1/email-messages/${id}`,
    method: 'DELETE',
  });
};

export const getEmailById = async (id: string) => {
  if (id != '') {
    return await apiRequest({
      url: `/api/app-service/v1/email-messages/${id}`,
      method: 'GET',
    });
  } else {
    return null;
  }
};

export const getEmailByMessageId = async (id: string) => {
  if (id != '') {
    return await apiRequest({
      url: `/api/app-service/v1/email-messages-lookup?message_id=${id}`,
      method: 'GET',
    });
  } else {
    return null;
  }
};

export const downloadAttachment = async (id: string, part: any) => {
  return await apiRequest({
    url: `/api/app-service/v1/email-messages/${id}/download-attachment`,
    method: 'GET',
    params: { part: part },
    responseType: 'blob',
  }).then((res) => {
    return res;
  });
};

export const getLastSyncEmail = async () => {
  return await apiRequest({
    url: `/api/app-service/v1/last-sync-email`,
    method: 'GET',
  });
};

export const setPasswordforEmail = async (data: any) => {
  return await apiRequest({
    url: `/api/app-service/v1/user-credentials`,
    method: 'POST',
    data: data,
  });
};
