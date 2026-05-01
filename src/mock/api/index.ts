// Re-export all mock API functions grouped by domain
export * as customersMockApi from './customers.mock';
export * as usersMockApi from './users.mock';
export * as tasksMockApi from './tasks.mock';
export * as insightsMockApi from './insights.mock';
export * as dashboardMockApi from './dashboard.mock';

export const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true';
