import { apiRequest } from '../../../common/api-request';

export const getAllTasks = async () => {
  return await apiRequest({
    url: `/api/app-service/v1/tasks`,
    method: 'GET',
  });
};

export const getBYFilter = async (props: {
  status: any[];
  company?: any[];
  assigned_to_me?: boolean;
  assigned_to_others?: boolean;
}) => {
  const params = new URLSearchParams();
  const { status, company, assigned_to_me, assigned_to_others } = props;
  if (status && status.length > 0) {
    status?.forEach((s: any) => params.append('status', s));
  }
  if (company && company.length > 0) {
    company?.forEach((c: any) => params.append('company', c));
  }
  if (assigned_to_me !== undefined) {
    params.append('assigned_to_me', String(assigned_to_me));
  }
  if (assigned_to_others !== undefined) {
    params.append('assigned_to_others', String(assigned_to_others));
  }

  const queryString = params.toString();

  return await apiRequest({
    url: `/api/app-service/v1/tasks?${queryString}`,
    method: 'GET',
  });
};

export const getAllTasksStatus = async () => {
  return await apiRequest({
    url: `/api/app-service/v1/task-statuses`,
    method: 'GET',
  });
};

export const createTask = async (data: any) => {
  return await apiRequest({
    url: `/api/app-service/v1/tasks`,
    method: 'POST',
    data: data,
  });
};

export const updateTask = async (id: string, data: any) => {
  delete data?._id;
  return await apiRequest({
    url: `/api/app-service/v1/tasks/${id}`,
    method: 'PATCH',
    data: data,
  });
};

export const deleteTask = async (id: string) => {
  return await apiRequest({
    url: `/api/app-service/v1/tasks/${id}`,
    method: 'DELETE',
  });
};

export const getTaskHistory = async (id: string) => {
  return await apiRequest({
    url: `/api/app-service/v1/task-history/byTaskId`,
    method: 'GET',
    params: { task_id: id },
  });
};

export const getTaskById = async (task_id: string) => {
  return await apiRequest({
    url: `/api/app-service/v1/tasks/${task_id}`,
    method: 'GET',
  });
};

export const getAllPriorityTasks = async (customer_id: number) => {
  return await apiRequest({
    url: `/api/app-service/v1/tasks/customers/${customer_id}`,
    method: 'GET',
  });
};

export const getCustomerComercials = async (customer_id: number) => {
  return await apiRequest({
    url: `/api/app-service/v1/customers/${customer_id}/commercials`,
    method: 'GET',
  });
};

export const getAllCustomerTickets = async (customer_id: number) => {
  return await apiRequest({
    url: `/api/app-service/v1/customers/${customer_id}/tickets-aggregate`,
    method: 'GET',
  });
};

export const getAllCustomerTicketsByType = async (
  customer_id: number,
  ticket_type: string,
  status: string,
  startDate?: string,
  endDate?: string,
  missed_sla?: boolean
) => {
  return await apiRequest({
    url: `/api/app-service/v1/customers/${customer_id}/tickets-by-type`,
    method: 'GET',
    params: {
      ticket_type,
      start_date: startDate,
      end_date: endDate,
      status,
      missed_sla: missed_sla ? true : undefined,
    },
  });
};
export const findAllTaskToAddDependency = async (task_id: string) => {
  return await apiRequest({
    url: `/api/app-service/v1/tasks/add-dependency/${task_id}`,
    method: 'GET',
  });
};