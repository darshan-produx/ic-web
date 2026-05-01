import { apiRequest } from '../../../common/api-request';

export const getOpportunitiesByFilter = async (data: {
  customers?: any[];
  status?: any[];
  sortBy?: string;
  valueFrom?: number;
  valueTo?: number;
  generatedBy?: any[];
  targetClosureFrom?: Date | null;
  targetClosureTo?: Date | null;
  assignedTo?: any[];
  searchText?: string;
}, params?: { skip?: number; limit?: number }) => {
  return await apiRequest({
    url: `/api/app-service/v1/insight-instances/opportunities`,
    method: 'POST',
    data,
    params,
  });
};

export const getOpportunityAttributeConfig = async () => {
  return await apiRequest({
    url: `/api/app-service/v1/attribute-config/opportunities`,
    method: 'GET',
  });
};

export const getOpportunityGridViewConfig = async () => {
  return await apiRequest({
    url: `/api/app-service/v1/views`,
    method: 'GET',
    params: { entity_type: 'opportunity' },
  });
}

export const updateOpportunityFromGrid = async (opportunityId: string, configId: string, data: any) => {
  return await apiRequest({
    url: `/api/app-service/v1/insight-instances/gridview/${opportunityId}/config/${configId}`,
    method: 'PATCH',
    data
  });
}
