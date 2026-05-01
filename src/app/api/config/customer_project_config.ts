import { apiRequest } from '../../../common/api-request';

export const getCustomerProjectConfig = async () => {
  return await apiRequest({
    url: ` /api/app-service/v1/project-config`,
    method: 'GET',
  });
};

export const deleteCustomerProjectConfig = async (id: string) => {
  const result = await apiRequest({
    url: ` /api/app-service/v1/project-config/${id}`,
    method: 'DELETE',
  });
  return result;
};

export const uploadCustomerProjectConfig = async (data: any) => {
  const result = await apiRequest({
    url: `/api/app-service/v1/project-config/upload`,
    method: 'POST',
    data: data,
  });
  return result;
};

export const downloadTemplateCustomerProjectConfig = async () => {
  const result = await apiRequest({
    url: `/api/app-service/v1/project-config/template`,
    method: 'GET',
    params: { isTemplate: true },
  });
  return result;
};

export const templateCustomerProjectConfig = async () => {
  const result = await apiRequest({
    url: `/api/app-service/v1/project-config/template`,
    method: 'GET',
  });
  return result;
};
