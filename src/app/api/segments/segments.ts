import { apiRequest } from '../../../common/api-request';



export const deleteCustomerSegment = async (id: number) => {
  return await apiRequest({
    url: ` /api/app-service/v1/customer-segment-master/${id}`,
    method: 'DELETE',
  });
};


export const addCustomerSegment = async (data: any) => {
  return await apiRequest({
    url: `/api/app-service/v1/customer-segment-master`,
    method: 'POST',
    data: data,
  });
};

export const getCustomerSegments = async () => {
  return await apiRequest({
    url: `/api/app-service/v1/customer-segment-master`,
    method: 'GET',
  });
};


export const editCustomerSegment = async (id: number, data: any) => {
  return await apiRequest({
    url: ` /api/app-service/v1/customer-segment-master/${id}`,
    method: 'PATCH',
    data: data,
  });
};
