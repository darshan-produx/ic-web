import { apiRequest } from '../../../common/api-request';

export const getInsightMaster = async () => {
  return await apiRequest({
    url: ` /api/app-service/v1/upload-insight-masters`,
    method: 'GET',
  });
};

export const deleteInsightMaster = async (id: string) => {
  const result = await apiRequest({
    url: ` /api/app-service/v1/upload-insight-masters/${id}`,
    method: 'DELETE',
  });
  return result;
};

export const uploadInsightMaster = async (data: any) => {
  const result = await apiRequest({
    url: `/api/app-service/v1/upload-insight-masters/upload`,
    method: 'POST',
    data: data,
  });

  return result;
};

export const downloadTemplateInsightMaster = async () => {
  const result = await apiRequest({
    url: `/api/app-service/v1/upload-insight-masters/template`,
    method: 'GET',
    params: { isTemplate: true },
  });
  return result;
};

export const templateInsightMaster = async () => {
  const result = await apiRequest({
    url: `/api/app-service/v1/upload-insight-masters/template`,
    method: 'GET',
  });
  return result;
};
