import { apiRequest } from '../../../common/api-request';

export const getNpsMetric = async () => {
  const result = await apiRequest({
    url: ` /api/app-service/v1/nps-metric`,
    method: 'GET',
  });

  return result;
};

export const getNpsMetricById = async (id: string) => {
  return await apiRequest({
    url: ` /api/app-service/v1/nps-metric/${id}`,
    method: 'GET',
  });
};

export const addNpsMetric = async (data: any) => {
  const result = await apiRequest({
    url: `/api/app-service/v1/nps-metric`,
    method: 'POST',
    data: data,
  });
  return result;
};

export const editNpsMetric = async (data: any) => {
  const result = await apiRequest({
    url: `/api/app-service/v1/nps-metric/${data?._id}`,
    method: 'PATCH',
    data: { ...data },
  });
  return result;
};

export const deleteNpsMetric = async (id: string) => {
  const result = await apiRequest({
    url: ` /api/app-service/v1/nps-metric/${id}`,
    method: 'DELETE',
  });
  return result;
};
