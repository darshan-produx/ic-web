import { apiRequest } from '../../../common/api-request';

export type OfferingEntityType =
  | 'customer_master'
  | 'user_master'
  | 'customer_stakeholder_master'
  | 'signals'
  | 'insight_instance'
  | 'adoption_business_kpi_config'
  | 'performance_defect_kpi_config'
  | 'usecase_config';

const toOfferingsArray = (response: any): any[] => {
  const payload = response?.data;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

export const getOfferings = async () => {
  const response = await apiRequest({
    url: '/api/app-service/v1/offerings',
    method: 'GET',
  });
  return toOfferingsArray(response);
};

export const getOfferingsByEntity = async (
  entityType: OfferingEntityType,
  entityId: string
) => {
  const response = await apiRequest({
    url: `/api/app-service/v1/offerings/entity/${entityType}/${entityId}`,
    method: 'GET',
  });
  return toOfferingsArray(response);
};

export const setEntityOfferings = async (
  entityType: OfferingEntityType,
  entityId: string,
  offeringIds: string[]
) => {
  return await apiRequest({
    url: '/api/app-service/v1/offerings/entity/assign',
    method: 'POST',
    data: {
      entity_type: entityType,
      entity_id: entityId,
      offering_ids: offeringIds,
    },
  });
};
