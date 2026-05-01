import { apiRequest } from '../../../common/api-request';

export const getSLAMaster = async () => {
  const result = await apiRequest({
    url: ` /api/app-service/v1/sla-master`,
    method: 'GET',
  });

  return result;
};

export const getSLAMasterById = async (id: string) => {
  return await apiRequest({
    url: ` /api/app-service/v1/sla-master/${id}`,
    method: 'GET',
  });
};

export const addSLAMaster = async (data: any) => {
  const result = await apiRequest({
    url: `/api/app-service/v1/sla-master`,
    method: 'POST',
    data: data,
  });
  return result;
};

export const editSLAMaster = async (data: any) => {
  const result = await apiRequest({
    url: `/api/app-service/v1/sla-master/${data?._id}`,
    method: 'PATCH',
    data: { ...data },
  });
  return result;
};

export const deleteSLAMaster = async (id: string) => {
  const result = await apiRequest({
    url: ` /api/app-service/v1/sla-master/${id}`,
    method: 'DELETE',
  });
  return result;
};
