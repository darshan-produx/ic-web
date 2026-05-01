
import { apiRequest } from '../../../common/api-request';

export const getAdminNavigationConfig = async () => {
  return await apiRequest({
    url: `/api/app-service/v1/configuration/organization-admin-navigation-config`,
    method: 'GET',
  });
};
export const getAdminViewConfig = async (entityType: any, selectedToggle: any) => {
  return await apiRequest({
    url: `/api/app-service/v1/views`,
    method: 'GET',
    params: {
      entity_type: entityType || 'user_master',
      columns_filter: selectedToggle?.path || 'registered'
    },
  });
}

export const getFeedData = async (
  action: any,
  toggle: any,
  globalSearchText: string,
  filters?: Record<string, any>,
  pagination?: { skip: number; limit: number },
) => {
  return await apiRequest({
    url: `/api/app-service/v1/${action?.behavior?.endpoint}`,
    method: action?.behavior?.method,
    // params: { ...(pagination ? { skip: pagination.skip, limit: pagination.limit } : {}) },
    params: {},
    data: {
      global_search: globalSearchText,
      columns_filter: [toggle?.path],
      ...filters,
    }
  });
}

export const updateFeedData = async (
  data: Record<string, any>,
  action: any
) => {
  return await apiRequest({
    url: `/api/app-service/v1/${action?.behavior?.endpoint}`,
    method: action?.behavior?.method,
    params: {},
    data
  })
};

export const createFeedData = async (
  data: Record<string, any>,
  action: any
) => {
  return await apiRequest({
    url: `/api/app-service/v1/${action?.behavior?.endpoint}`,
    method: action?.behavior?.method,
    params: {},
    data
  })
};

export const downloadFeedData = async (
  action: any,
  toggle: any,
  globalSearchText: string,
  filters: Record<string, any>,
) => {
  const response = await apiRequest({
    url: `/api/app-service/v1/${action?.behavior?.endpoint}`,
    method: action?.behavior?.method,
    params: action?.behavior?.params || {},
    data: {
      global_search: globalSearchText,
      columns_filter: [toggle?.path],
      ...filters
    },
    responseType: 'blob',
  });

  const blob = new Blob([response.data], {
    type:
      action?.behavior?.params?.file_type === 'excel'
        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        : 'text/csv',
  });

  const urlObj = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = urlObj;

  const filename = `${action?.behavior?.file_name || 'export'}_${new Date().toISOString().split('T')[0]}`;
  link.download = `${filename}.${action?.behavior?.params?.file_type === 'excel' ? 'xlsx' : 'csv'}`;

  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  window.URL.revokeObjectURL(urlObj);

  return { success: true };
};