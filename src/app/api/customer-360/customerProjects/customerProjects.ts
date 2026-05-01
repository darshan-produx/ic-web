import { apiRequest } from '../../../../common/api-request';

export const getCustomerProjectConfig = async (customer_id: number) => {
  return await apiRequest({
    url: `/api/app-service/v1/project-config`,
    method: 'GET',
  });
};

export const createCustomerProjectPlan = async (
  customer_id: number,
  data: any
) => {
  return apiRequest({
    url: `/api/app-service/v1/customers/${customer_id}/project-plan`,
    method: 'POST',
    data,
  });
};

export const getCustomerProjectPlan = async (
  customer_id: number,
  status?: string,
  project_name?: string
) => {
  const params: Record<string, any> = {};
  if (status != '') {
    params['status'] = status;
  }

  if (project_name) {
    params['project_name'] = project_name;
  }

  return apiRequest({
    url: `/api/app-service/v1/customers/${customer_id}/project-plan`,
    method: 'GET',
    params,
  });
};

export const getProjectPlan = async (
  project_id: string, 
) => {
  return apiRequest({
    url: `/api/app-service/v1/customers/project-plan/${project_id}`,
    method: 'GET',
  });
};

export const addTaskMilestone = async (project_plan_id: string, data: any) => {
  return apiRequest({
    url: `/api/app-service/v1/project-plan/${project_plan_id}`,
    method: 'POST',
    data,
  });
};

export const editProject = async (project_plan_id: string, data: any) => {
  return apiRequest({
    url: `/api/app-service/v1/project-plan/${project_plan_id}`,
    method: 'PATCH',
    data,
  });
};