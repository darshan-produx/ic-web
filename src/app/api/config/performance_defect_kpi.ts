import { apiRequest } from '../../../common/api-request';

export const getPerformanceDefectKpi = async () => {
  return await apiRequest({
    url: ` /api/app-service/v1/performance-defect-kpi`,
    method: 'GET',
  });
};

export const deletePerformanceDefectKpi = async (id: string) => {
  const result = await apiRequest({
    url: ` /api/app-service/v1/performance-defect-kpi/${id}`,
    method: 'DELETE',
  });
  return result;
};

export const uploadPerformanceDefectKpi = async (data: any) => {
  const result = await apiRequest({
    url: `/api/app-service/v1/performance-defect-kpi/upload`,
    method: 'POST',
    data: data,
  });
  return result;
};

export const downloadTemplatePerformanceDefectKpi = async () => {
  const result = await apiRequest({
    url: `/api/app-service/v1/performance-defect-kpi/template`,
    method: 'GET',
    params: { isTemplate: true },
  });
  return result;
};

export const templatePerformanceDefectKpi = async () => {
  const result = await apiRequest({
    url: `/api/app-service/v1/performance-defect-kpi/template`,
    method: 'GET',
  });
  return result;
};


export const addPerformanceDefectsKpi = async (data: any) => {
  const result = await apiRequest({
    url: `/api/app-service/v1/performance-defect-kpi/create`,
    method: 'POST',
    data: data,
  });

  return result;
};

export const editPerformanceDefectsKpi = async (id: string, data: any) => {
  const result = await apiRequest({
    url: `/api/app-service/v1/performance-defect-kpi/${id}`,
    method: 'PATCH',
    data: data,
  });

  return result;
};

export const getUniquePerformanceDefectsKpiMetrics = async () => {
  const result = await apiRequest({
    url: `/api/app-service/v1/performance-defect-kpi/unique-metrics`,
    method: 'GET',
  });
  return result;
};