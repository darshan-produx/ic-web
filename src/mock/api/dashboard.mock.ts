import {
  mockDashboardSummary,
  mockHealthScoreTrend,
  mockARRBySegment,
  mockTaskCompletionTrend,
  mockUpcomingRenewals,
  mockChurnRiskSummary,
  mockPriorityEvents,
} from '../dashboard';

const res = (data: any) => Promise.resolve({ data: { data, success: true } });

export const getDashboardSummary = async () => res(mockDashboardSummary);
export const getHealthScoreTrend = async () => res(mockHealthScoreTrend);
export const getARRBySegment = async () => res(mockARRBySegment);
export const getTaskCompletionTrend = async () => res(mockTaskCompletionTrend);
export const getUpcomingRenewals = async () => res(mockUpcomingRenewals);
export const getChurnRiskSummary = async () => res(mockChurnRiskSummary);
export const getPriorityEvents = async () => res(mockPriorityEvents);

export const getEventsAndReferences = async () => res(mockPriorityEvents);
export const getpersonalEventsAndExternalNews = async () => res(mockPriorityEvents);
export const getAllPriorityTasks = async () => res([]);
export const getAllChecklistItemsForGivenDate = async () => res([]);
export const createChecklistItem = async (data: any) => res({ _id: `chk_${Date.now()}`, ...data });
export const updateChecklistItem = async (id: any, data: any) => res({ id, ...data });
export const deleteChecklistItem = async (id: any) => res({ id, deleted: true });
