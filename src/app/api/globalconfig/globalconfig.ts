import { apiRequest } from '../../../common/api-request';

export interface AuthenticationData {
  username: string;
  password: string;
}

export const getAllEmailSettings = async () => {
  return await apiRequest({
    url: ` /api/app-service/v1/configuration/email-settings`,
    method: 'GET',
  });
};

export const getAllKPISettings = async () => {
  return await apiRequest({
    url: ` /api/app-service/v1/configuration/kpi-settings`,
    method: 'GET',
  });
};

export const updateGlobalEmailSettings = async (data: any) => {
  return await apiRequest({
    url: ` /api/app-service/v1/configuration/email-settings`,
    method: 'PATCH',
    data: data,
  });
};

export const updateGlobalKPISettings = async (data: any) => {
  return await apiRequest({
    url: ` /api/app-service/v1/configuration/kpi-settings`,
    method: 'PATCH',
    data: data,
  });
};


export const getNumberFormatSetting = async () => {
  return await apiRequest({
    url: ` /api/app-service/v1/configuration/numerical-format`,
    method: 'GET',
  });
};

