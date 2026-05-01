import { apiRequest } from '../../../common/api-request';

export const getCustomersOverviewData = async (id?: number | null) => {
  const customerId = id ?? null;
  const result = await apiRequest({
    url: ` /api/app-service/v1/myteam-customers-overview`,
    method: 'GET',
    params: {
      customerId,
    },
  });

  return result;
};

export const getCustomersFullOverviewData = async (id?: number | null) => {
  const customerId = id ?? null;
  const result = await apiRequest({
    url: ` /api/app-service/v1/customers-full-overview`,
    method: 'GET',
    params: {
      customerId,
    },
  });

  return result;
};
