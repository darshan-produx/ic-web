import { apiRequest } from '../../../common/api-request';
import { DirectAssignedCustomer, DurationOption } from '../../app/my-team/types';

export const getportfolioTeam = async (duration: any, is_priority: boolean) => {
  const res = await apiRequest({
    url: `/api/app-service/v1/portfolio-team`,
    method: 'GET',
    params: { duration, is_priority },
  });
  return res;
};

export const fetchMyTeamHierarchyData = async (
	userId: string,
	duration: DurationOption,
	searchText?: string,
	searchMode?: 'person' | 'account',
) => {
	return apiRequest({
		url: '/api/app-service/v1/my-team/data',
		method: 'POST',
		data: {
			mode: 'hierarchy',
			user_id: userId,
			duration,
			search_text: searchText,
			search_mode: searchMode,
		},
	});
};

export const fetchMyTeamCustomersData = async (
	directAssignedCustomers: DirectAssignedCustomer[],
	duration: DurationOption,
) => {
	return apiRequest({
		url: '/api/app-service/v1/my-team/data',
		method: 'POST',
		data: {
			mode: 'customers',
			direct_assigned_customers: directAssignedCustomers,
			duration,
		},
	});
};

export const fetchMyTeamOpportunityScopeCustomerIds = async (payload: {
	userId?: string;
	customerIds?: number[];
	directAssignedCustomers?: DirectAssignedCustomer[];
}) => {
	return apiRequest({
		url: '/api/app-service/v1/my-team/opportunity-scope',
		method: 'POST',
		data: {
			user_id: payload.userId,
			customer_ids: payload.customerIds,
			direct_assigned_customers: payload.directAssignedCustomers,
		},
	});
};

export const fetchMyTeamScopedOpportunities = async (customerIds: number[], page = 1, limit = 30) => {
	return apiRequest({
		url: '/api/app-service/v1/my-team/opportunities',
		method: 'POST',
		data: {
			customer_ids: customerIds,
			page,
			limit,
		},
	});
};

export const fetchMyTeamScopedSignals = async (customerIds: number[], page = 1, limit = 30) => {
	return apiRequest({
		url: '/api/app-service/v1/my-team/signals',
		method: 'POST',
		data: {
			customer_ids: customerIds,
			page,
			limit,
		},
	});
};

export const fetchMyTeamScopedTasks = async (customerIds: number[], page = 1, limit = 30) => {
	return apiRequest({
		url: '/api/app-service/v1/my-team/tasks',
		method: 'POST',
		data: {
			customer_ids: customerIds,
			page,
			limit,
		},
	});
};