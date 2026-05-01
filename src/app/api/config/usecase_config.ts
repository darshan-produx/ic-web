import { apiRequest } from '../../../common/api-request';

export const getUsecaseConfig = async () => {
  return await apiRequest({
    url: ` /api/app-service/v1/usecase-config`,
    method: 'GET',
  });
};

export const deleteUsecaseConfig = async (id: string) => {
  const result = await apiRequest({
    url: ` /api/app-service/v1/usecase-config/${id}`,
    method: 'DELETE',
  });
  return result;
};

export const uploadUsecaseConfig = async (data: any) => {
  const result = await apiRequest({
    url: `/api/app-service/v1/usecase-config/upload`,
    method: 'POST',
    data: data,
  });
  return result;
};

export const downloadTemplateUsecaseConfig = async () => {
  const result = await apiRequest({
    url: `/api/app-service/v1/usecase-config/template`,
    method: 'GET',
    params: { isTemplate: true },
  });
  return result;
};

export const templateUsecaseConfig = async () => {
  const result = await apiRequest({
    url: `/api/app-service/v1/usecase-config/template`,
    method: 'GET',
  });
  return result;
};
