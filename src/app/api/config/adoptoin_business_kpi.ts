import { apiRequest } from '../../../common/api-request';

export const getAdoptionBusinessKpi = async () => {
  return await apiRequest({
    url: ` /api/app-service/v1/adoption-business-kpi`,
    method: 'GET',
  });
};

export const deleteAdoptionBusinessKpi = async (id: string) => {
  const result = await apiRequest({
    url: ` /api/app-service/v1/adoption-business-kpi/${id}`,
    method: 'DELETE',
  });
  return result;
};

export const uploadAdoptionBusinessKpi = async (data: any) => {
  const result = await apiRequest({
    url: `/api/app-service/v1/adoption-business-kpi/upload`,
    method: 'POST',
    data: data,
  });

  return result;
};

export const downloadTemplateAdoptionBusinessKpi = async () => {
  const result = await apiRequest({
    url: `/api/app-service/v1/adoption-business-kpi/template`,
    method: 'GET',
    params: { isTemplate: true },
  });
  return result;
};

export const templateAdoptionBusinessKpi = async () => {
  const result = await apiRequest({
    url: `/api/app-service/v1/adoption-business-kpi/template`,
    method: 'GET',
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

export const addAdoptionBusinessKpi = async (data: any) => {
  const result = await apiRequest({
    url: `/api/app-service/v1/adoption-business-kpi/create`,
    method: 'POST',
    data: data,
  });

  return result;
};

export const editAdoptionBusinessKpi = async (id: string, data: any) => {
  const result = await apiRequest({
    url: `/api/app-service/v1/adoption-business-kpi/${id}`,
    method: 'PATCH',
    data: data,
  });

  return result;
};

export const getUniqueAdoptionBusinessKpiMetrics = async () => {
  const result = await apiRequest({
    url: `/api/app-service/v1/adoption-business-kpi/unique-metrics`,
    method: 'GET',
  });
  return result;
};