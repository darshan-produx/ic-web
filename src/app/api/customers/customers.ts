import { apiRequest } from '../../../common/api-request';
import { ObjectId } from 'mongoose';

export interface AuthenticationData {
  username: string;
  password: string;
}

export const getCustomers = async () => {
  return await apiRequest({
    url: `/api/app-service/v1/customers`,
    method: 'GET',
  });
};

export const getAllOrganizationCustomersHierarchy = async () => {
  return await apiRequest({
    url: `/api/app-service/v1/all-organization-customers`,
    method: 'GET',
  });
};

export const getCustomersAdmin = async () => {
  return await apiRequest({
    url: `/api/app-service/v1/customers/admin`,
    method: 'GET',
  });
};

export const getCustomerDetails = async (customer_id: number) => {
  return await apiRequest({
    url: `/api/app-service/v1/customers/customer-details/${customer_id}`,
    method: 'GET',
  });
};

export const getAllAssignedCustomers = async () => {
  return await apiRequest({
    url: `/api/app-service/v1/customers/myteam-assigned-customers`,
    method: 'GET',
  });
};
export const getAllDirectAssignedCustomers = async () => {
  return await apiRequest({
    url: `/api/app-service/v1/customers/user-assigned-customers-hierarchy`,
    method: 'GET',
  });
};
export const getAllAssignedcustomerdetails = async () => {
  return await apiRequest({
    url: `/api/app-service/v1/customers/myteam-assigned-customers-hierarchy`,
    method: 'GET',
  });
};

export const getAllCustomersOnSearch = async (searchText: string) => {
  return await apiRequest({
    url: `/api/app-service/v1/customers/search`,
    method: 'GET',
    params: {
      searchText,
    },
  });
};

export const getCustomersByuser = async () => {
  return await apiRequest({
    url: ` /api/app-service/v1/customersByid`,
    method: 'GET',
  });
};

export const assignCustomer = async (id: number, data: any) => {
  return await apiRequest({
    url: `/api/app-service/v1/customer-users/${id}`,
    method: 'PATCH',
    data: data,
  });
};

export const getPillarStatus = async (customer_id: number) => {
  return await apiRequest({
    url: `/api/app-service/v1/customers/${customer_id}/pillar-statuses`,
    method: 'GET',
  });
};

export const createLastQBRDate = async (customer_id: number, data: any) => {
  return await apiRequest({
    url: `/api/app-service/v1/customers/${customer_id}/customer_governance`,
    method: 'POST',
    data: data,
  });
};

export const getLastQBRDate = async (customer_id: number) => {
  return await apiRequest({
    url: `/api/app-service/v1/customers/${customer_id}/customer_governance`,
    method: 'GET',
    params: {
      limit: 1,
      interaction_type: 'qbr',
    },
  });
};

export const getLastestNpsScore = async (customer_id: number) => {
  return await apiRequest({
    url: `/api/app-service/v1/customers/${customer_id}/customer_nps`,
    method: 'GET',
    params: {
      limit: 1,
    },
  });
};

export const getLastestNpsScoreTrends = async (customer_id: number) => {
  return await apiRequest({
    url: `/api/app-service/v1/customers/${customer_id}/customer_nps`,
    method: 'GET',
    params: {
      sort: 1,
    },
  });
};

export const updateCustomerDescription = async (
  customer_id: number,
  data: any
) => {
  return await apiRequest({
    url: `/api/app-service/v1/customers/${customer_id}`,
    method: 'PATCH',
    data: data,
  });
};

export const updateUserNotes = async (user_id: string, data: any) => {
  return await apiRequest({
    url: `/api/app-service/v1/users/update-note/${user_id}`,
    method: 'PATCH',
    data: data,
  });
};

export const createUpdateGroupCustomer = async (data: any) => {
  return await apiRequest({
    url: `/api/app-service/v1/customers`,
    method: 'POST',
    data: data,
  });
};

export const getCustomerTypes = async () => {
  return await apiRequest({
    url: ` /api/app-service/v1/customer-types`,
    method: 'GET',
  });
};

export const saveProfilePicture = async (
  ref_type: string,
  ref_id: ObjectId,
  data: any
) => {
  return await apiRequest({
    url: `/api/app-service/v1/picture/${ref_type}/${ref_id}`,
    method: 'POST',
    data,
  });
};

export const getCustomerDetailSynthesis = async (customer_id: number) => {
  return await apiRequest({
    url: `/api/app-service/v1/customers/customer-detail-synthesis/${customer_id}`,
    method: 'GET',
  });
};

export const getCustomerChurnStepsConfig = async () => {
  return await apiRequest({
    url: `/api/app-service/v1/configuration/customer_churn_steps_config`,
    method: 'GET',
  });
};

export const getCustomer360Configs = async () => {
  return await apiRequest({
    url: '/api/app-service/v1/configuration/customer-360-config',
    method: 'GET',
  });
};

export const getNavbarConfigs = async () => {
  return await apiRequest({
    url: '/api/app-service/v1/configuration/navbar-config',
    method: 'GET',
  });
};

export const getOpportunityFeatureConfig = async () => {
  return await apiRequest({
    url: '/api/app-service/v1/configuration/opportunity-create-config',
    method: 'GET',
  });
};

export const getMyTeamConfigs = async () => {
  return await apiRequest({
    url: '/api/app-service/v1/configuration/myteam-config',
    method: 'GET',
  });
};

export const getCustomer360MetricConfigs = async () => {
  return await apiRequest({
    url: '/api/app-service/v1/configuration/customer-360-metric-config',
    method: 'GET',
  });
};

export const getGroupCustomers = async () => {
  return await apiRequest({
    url: `/api/app-service/v1/group-customers`,
    method: 'GET',
  });
};

export const getAllAssociatedCustomers = async () => {
  return await apiRequest({
    url: `/api/app-service/v1/associated-customers`,
    method: 'GET',
  });
};


export const getAllAttributeConfig = async (attribute_type?: string) => {
  return await apiRequest({
    url: `/api/app-service/v1/attribute-config`,
    method: 'GET',
    params: {
      attribute_type,
    },
  });
};

export const getAllAttributes = async (
  customer_id: number,
  base_collection_id?: string,
  base_collection?: string
) => {
  return await apiRequest({
    url: `/api/app-service/v1/attributes/${customer_id}`,
    method: 'GET',
    params: {
      base_collection_id,
      base_collection,
    },
  });
};

export const updateCustomerAttributes = async (
  data: any,
  customer_id: number,
  base_collection?: string,
  base_collection_id?: string
) => {
  return await apiRequest({
    url: `/api/app-service/v1/attributes/${customer_id}`,
    method: 'PATCH',
    data: data,
    params: {
      base_collection,
      base_collection_id,
    },
  });
};

export const getCustomerJourney = async (filters: any) => {
  return await apiRequest({
    url: `/api/app-service/v1/customer-journey`,
    method: 'GET',
    params: {
      ...filters,
    },
  });
};

export const updateCustomerJourneySignal = async (id: string, data: any) => {
  return await apiRequest({
    url: `/api/app-service/v1/customer-journey/${id}`,
    method: 'PATCH',
    data: data,
  });
};

export const getCustomerJourneySignal = async (id: string) => {
  return await apiRequest({
    url: `/api/app-service/v1/customer-journey/${id}`,
    method: 'GET',
  });
};

export const createCustomerEvent = async (data: any) => {
  return await apiRequest({
    url: `/api/app-service/v1/customer-journey`,
    method: 'POST',
    data: data,
  });
};

export const getAllSignals = async (params?: {
  skip?: number;
  limit?: number;
  updated_after?: string;
}) => {
  return await apiRequest({
    url: `/api/app-service/v1/signals`,
    method: 'GET',
    params,
  });
};
export const getCustomer360PageDetailsTabs = async () => {
  return await apiRequest({
    url: `/api/app-service/v1/configuration/customer-360-page-details-tabs`,
    method: 'GET',
  });
};
export const getCustomerPhases = async () => {
  return await apiRequest({
    url: `/api/app-service/v1/configuration/customer-phases`,
    method: 'GET',
  });
};

export const getAllCustomersDocumentsAgentFlow = async () => {
  return await apiRequest({
    url: `/api/app-service/v1/customers/document-agent-flow`,
    method: 'GET',
  });
};

export const getGuidance = async (signal_id: string, signal_master_id: string, customer_id: number, org_id: string, isPolling: boolean = false) => {
  return await apiRequest({
    url: `/api/app-service/v1/guidance`,
    method: 'GET',
    params: {
      signal_mongo_id: signal_id,
      signal_master_id,
      customer_id,
      isPolling: isPolling.toString(),
    },
  });
};