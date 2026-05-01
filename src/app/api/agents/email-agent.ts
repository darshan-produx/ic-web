import { apiRequest } from '../../../common/api-request';

  export const getProspectiveDomainStakeholders = (activation_id: string) => {
    return apiRequest({
      url: `/api/app-service/v1/email-agent/${activation_id}/get-prospective-domain-stakeholders`,
      method: 'GET',
    });
  };

    export const getAllCustomerProspectiveDomainStakeholders = (
      activation_id: string
    ) => {
      return apiRequest({
        url: `/api/app-service/v1/email-agent/${activation_id}/all-customer/get-prospective-domain-stakeholders`,
        method: 'GET',
      });
    };

  export const activateEmailScan = (activation_id: string) => {
    return apiRequest({
      url: `/api/app-service/v1/email-agent/${activation_id}/activate-email-scan`,
      method: 'GET',
    });
  };

  export const updateProspectiveDomainStakeholders = async (
    activation_id: string,
    customer_id: number,
    payload?: {
      status?: string;
      primary_domain?: string;
      customer_id?: number | null;
      customer_name?: string | null;
      prospective_domains?: string[];
      prospective_stakeholders?: { name: string; email: string }[];
    }
  ) => {
    return apiRequest({
      url: `/api/app-service/v1/email-agent/${activation_id}/update-domain-stakeholders/${customer_id}`,
      method: 'PATCH',
      data: payload,
    });
  };

  export const addProspectiveDomainStakeholders = (
    activation_id: string,
    payload?: {}
  ) => {
    return apiRequest({
      url: `/api/app-service/v1/email-agent/${activation_id}/add-prospective-domain-stakeholders`,
      method: 'PATCH',
      data: payload,
    });
  };
