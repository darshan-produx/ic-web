import { apiRequest } from '../../../common/api-request';

export const getInsightMasters = async () => {
  const result = await apiRequest({
    url: ` /api/app-service/v1/insight-masters`,
    method: 'GET',
  });

  return result;
};

export const getCurrencySymbol = async () => {
  const result = await apiRequest({
    url: ` /api/app-service/v1/configuration/client_currency_symbol`,
    method: 'GET',
  });

  return result;
};
