import * as customersMock from './customers.mock';
import * as usersMock from './users.mock';
import * as tasksMock from './tasks.mock';
import * as insightsMock from './insights.mock';
import {
  mockPriorityTasks,
  mockPriorityCustomerOverview,
  mockEventsAndReferences,
  mockPrioritySignals,
  mockPortfolioTeam,
  mockChecklistItems,
  mockMyTeamConfig,
  mockCustomer360MetricConfig,
} from '../priorities';
import {
  mockUserHierarchyRoot,
  mockMyTeamHierarchy,
  mockCustomerMetrics,
} from '../myteam';
import {
  mockCustomersOverviewData,
  mockCustomersOverviewMeta,
} from '../customersOverview';

const nested = (data: any) => Promise.resolve({ data: { data, success: true } });
const flat = (data: any) => Promise.resolve({ data });

type MockHandler = (url: string, method: string, data?: any, params?: any) => Promise<any>;

const routes: Array<{ pattern: RegExp; method?: string; handler: MockHandler }> = [
  // Auth
  { pattern: /\/authenticate$/, method: 'POST', handler: (_, __, data) => usersMock.login(data) },
  { pattern: /\/my-roles$/, handler: () => usersMock.getMyRoles() },
  { pattern: /\/request-otp$/, method: 'POST', handler: (_, __, data) => usersMock.sendOTP(data?.email) },
  { pattern: /\/verify-otp$/, method: 'POST', handler: (_, __, data) => usersMock.verifyOTP(data) },
  { pattern: /\/passwordreset\/performreset$/, method: 'POST', handler: (_, __, data) => usersMock.createNewPassword(data) },
  { pattern: /\/passwordreset\/(.+)$/, method: 'GET', handler: (url) => usersMock.validateToken(url.split('/').pop()!) },
  { pattern: /\/passwordreset$/, method: 'POST', handler: (_, __, data) => usersMock.passwordreset(data?.email) },
  { pattern: /\/request-access$/, method: 'POST', handler: () => flat({ success: true }) },
  { pattern: /\/check-valid-domain$/, method: 'POST', handler: (_, __, data) => usersMock.checkDomain(data) },

  // Users
  { pattern: /\/users\/getOrganizationUserHierarchy$/, handler: () => usersMock.getOrganizationUsersHierarchy() },
  { pattern: /\/users\/getOrganizationUsers$/, handler: () => usersMock.getOrganizationUsers() },
  { pattern: /\/users\/getUserHierarchy$/, handler: () => Promise.resolve({ data: mockUserHierarchyRoot }) },
  { pattern: /\/users\/getUsersForTask$/, handler: () => usersMock.getUsersForTask() },
  { pattern: /\/users\/getBYId\/(.+)$/, handler: (url) => usersMock.getUserById(url.split('/').pop()!) },
  { pattern: /\/users\/change_activate_status$/, method: 'PATCH', handler: (_, __, data) => usersMock.statusChange(data) },
  { pattern: /\/users\/(\d+)$/, method: 'GET', handler: (url) => usersMock.getUserById(url.split('/').pop()!) },
  { pattern: /\/users\/(\d+)$/, method: 'PATCH', handler: (url, _, data) => usersMock.editUser(Number(url.split('/').pop()), data) },
  { pattern: /\/users\/(\d+)$/, method: 'DELETE', handler: (url) => usersMock.deleteUser(Number(url.split('/').pop())) },
  { pattern: /\/users$/, method: 'GET', handler: (_, __, _d, params) => params?.is_active === 'false' ? usersMock.getNotApprovedUser() : usersMock.getUsers() },
  { pattern: /\/users$/, method: 'POST', handler: (_, __, data) => usersMock.addUser(data) },
  { pattern: /\/roles$/, handler: () => usersMock.getRoles() },
  { pattern: /\/userteam$/, handler: () => usersMock.getUserTeam() },
  { pattern: /\/userinfo/, handler: () => flat({ id: 4, name: 'Rohan Sharma', email: 'rohan.sharma@razorpay.com', org_id: 'rzp_org_001' }) },

  // Customers
  { pattern: /\/all-organization-customers$/, handler: () => customersMock.getAllOrganizationCustomersHierarchy() },
  { pattern: /\/customers\/admin$/, handler: () => customersMock.getCustomersAdmin() },
  { pattern: /\/customers\/myteam-assigned-customers-hierarchy$/, handler: () => customersMock.getAllAssignedCustomers() },
  { pattern: /\/customers\/myteam-assigned-customers$/, handler: () => customersMock.getAllAssignedCustomers() },
  { pattern: /\/customers\/user-assigned-customers-hierarchy$/, handler: () => customersMock.getAllDirectAssignedCustomers() },
  { pattern: /\/customers\/customer-details\/(\d+)$/, handler: (url) => customersMock.getCustomerDetails(Number(url.split('/').pop())) },
  { pattern: /\/customers\/search$/, handler: () => customersMock.getCustomers() },
  { pattern: /\/customers\/(\d+)\/pillar-statuses$/, handler: (url) => customersMock.getPillarStatus(Number(url.match(/\/customers\/(\d+)\//)![1])) },
  { pattern: /\/customers\/(\d+)\/customer_governance$/, method: 'GET', handler: (url) => customersMock.getLastQBRDate(Number(url.match(/\/customers\/(\d+)\//)![1])) },
  { pattern: /\/customers\/(\d+)\/customer_governance$/, method: 'POST', handler: (url, _, data) => customersMock.createLastQBRDate(Number(url.match(/\/customers\/(\d+)\//)![1]), data) },
  { pattern: /\/customers\/(\d+)\/customer_nps$/, handler: (url) => customersMock.getLastestNpsScore(Number(url.match(/\/customers\/(\d+)\//)![1])) },
  { pattern: /\/customers\/myteam-customers$/, handler: () => flat([
    { customer_id: 101, customer_name: 'Swiggy', is_prospect: false },
    { customer_id: 102, customer_name: 'Meesho', is_prospect: false },
    { customer_id: 103, customer_name: 'Nykaa', is_prospect: false },
    { customer_id: 104, customer_name: 'CRED', is_prospect: false },
    { customer_id: 105, customer_name: 'Urban Company', is_prospect: false },
    { customer_id: 106, customer_name: 'Zerodha', is_prospect: false },
    { customer_id: 107, customer_name: 'Pharmeasy', is_prospect: false },
    { customer_id: 108, customer_name: 'Lenskart', is_prospect: false },
  ]) },
  { pattern: /\/customers$/, handler: () => customersMock.getCustomers() },
  { pattern: /\/customersByid$/, handler: () => customersMock.getCustomersByuser() },
  { pattern: /\/customer-users\/(\d+)$/, method: 'PATCH', handler: (url, _, data) => customersMock.assignCustomer(Number(url.split('/').pop()), data) },
  { pattern: /\/customer-segment-master\/(\d+)$/, method: 'PATCH', handler: () => flat({ success: true }) },
  { pattern: /\/customer-segment-master\/(\d+)$/, method: 'DELETE', handler: () => flat({ success: true }) },
  { pattern: /\/customer-segment-master$/, method: 'GET', handler: () => customersMock.getCustomerSegments() },
  { pattern: /\/customer-segment-master$/, method: 'POST', handler: (_, __, data) => nested(data) },

  // Tasks
  { pattern: /\/task-statuses$/, handler: () => tasksMock.getAllTasksStatus() },
  { pattern: /\/task-history\/byTaskId$/, handler: (_, __, _d, params) => tasksMock.getTaskHistory(params?.task_id) },
  { pattern: /\/tasks\/(\w+)$/, method: 'GET', handler: (url) => tasksMock.getTaskById(url.split('/').pop()!) },
  { pattern: /\/tasks\/(\w+)$/, method: 'PATCH', handler: (url, _, data) => tasksMock.updateTask(url.split('/').pop()!, data) },
  { pattern: /\/tasks\/(\w+)$/, method: 'DELETE', handler: (url) => tasksMock.deleteTask(url.split('/').pop()!) },
  { pattern: /\/tasks/, method: 'GET', handler: (_, __, _d, params) =>
    tasksMock.getBYFilter({ status: params?.status, company: params?.company })
  },
  { pattern: /\/tasks$/, method: 'POST', handler: (_, __, data) => tasksMock.createTask(data) },

  // Insights / Opportunities
  { pattern: /\/insight-instances\/research-chat-conversation\//, handler: () => flat([]) },
  { pattern: /\/insight-masters\/opportunities$/, method: 'GET', handler: () => flat({ data: [], success: true }) },
  { pattern: /\/insight-instances\/opportunities$/, method: 'POST', handler: () => insightsMock.getOpportunities() },
  { pattern: /\/insight-instances\/([^/]+)$/, method: 'GET', handler: (url) => insightsMock.getInsightDetails(url.split('/').pop()!) },
  { pattern: /\/insight-instances\/([^/]+)$/, method: 'PATCH', handler: (url, _, data) => insightsMock.updateInsightDetails(url.split('/').pop()!, data) },
  { pattern: /\/insight-instances\/([^/]+)$/, method: 'DELETE', handler: (url) => insightsMock.removeOpportunity(url.split('/').pop()!) },
  { pattern: /\/insight-instances$/, method: 'GET', handler: () => insightsMock.getAllInsights() },
  { pattern: /\/insight-instances$/, method: 'POST', handler: (_, __, data) => insightsMock.createOpportunity(data) },
  { pattern: /\/attribute-config\/opportunities$/, handler: () => flat([]) },
  { pattern: /\/attributes\/opportunities\//, handler: () => nested([]) },
  { pattern: /\/views$/, handler: () => flat([]) },

  // Configuration
  { pattern: /\/configuration\/insight_action_status_config$/, handler: () => insightsMock.getOpportunityStatusConfig() },
  { pattern: /\/configuration\/myteam-config$/, handler: () => flat({ value: mockMyTeamConfig }) },
  { pattern: /\/configuration\/customer-360-metric-config$/, handler: () => flat({ value: mockCustomer360MetricConfig }) },
  { pattern: /\/configuration\/client_currency_symbol$/, handler: () => flat({ value: '₹' }) },
  { pattern: /\/configuration\/email-settings$/, handler: () => flat([
    { key: 'ai_assist_enabled', value: 1 },
    { key: 'email_sync_enabled', value: 1 },
  ]) },
  { pattern: /\/configuration\/kpi-settings$/, handler: () => flat([]) },
  { pattern: /\/configuration\//, handler: () => flat({}) },

  // Priorities — all sections
  { pattern: /\/priority-tasks$/, handler: () => flat({ data: mockPriorityTasks, total: mockPriorityTasks.length }) },
  { pattern: /\/priority-customer-overview$/, handler: () => nested(mockPriorityCustomerOverview) },
  { pattern: /\/priority-signals-and-opportunities$/, handler: () => nested({ items: mockPrioritySignals, total: mockPrioritySignals.length }) },
  { pattern: /\/events-and-references$/, handler: () => nested(mockEventsAndReferences) },
  { pattern: /\/checklist-items\/([^/]+)$/, method: 'PATCH', handler: (url, _, data) => nested({ ...data, _id: url.split('/').pop() }) },
  { pattern: /\/checklist-items\/([^/]+)$/, method: 'DELETE', handler: (url) => nested({ _id: url.split('/').pop(), deleted: true }) },
  { pattern: /\/checklist-items$/, method: 'GET', handler: () => nested(mockChecklistItems) },
  { pattern: /\/checklist-items$/, method: 'POST', handler: (_, __, data) => nested({ _id: `chk_${Date.now()}`, ...data }) },
  { pattern: /\/move-checklist-items$/, method: 'POST', handler: () => nested({ success: true }) },

  // Portfolio / My Team
  { pattern: /\/portfolio-team$/, handler: () => nested(mockPortfolioTeam) },
  { pattern: /\/my-team\/data$/, method: 'POST', handler: (_, __, data) => {
    if (data?.mode === 'customers') {
      // Return detailed customer metrics for the given direct_assigned_customers
      const customers = (data.direct_assigned_customers || [])
        .map((c: any) => mockCustomerMetrics[c.customer_id])
        .filter(Boolean);
      return nested(customers);
    }
    // hierarchy mode
    return nested(mockMyTeamHierarchy);
  }},
  { pattern: /\/my-team\/opportunity-scope$/, method: 'POST', handler: (_, __, data) => {
    // Return customer IDs in scope for opportunities drawer
    const ids = data?.user_id
      ? mockMyTeamHierarchy.direct_subordinates
          .find((s) => s.user._id === data.user_id)
          ?.direct_assigned_customers.map((c: any) => c.customer_id) ?? []
      : data?.customer_ids ?? [];
    return nested(ids);
  }},
  { pattern: /\/myteam-customers-overview/, handler: () => Promise.resolve({
    data: {
      data: mockCustomersOverviewData,
      ...mockCustomersOverviewMeta,
    },
  }) },
  { pattern: /\/customers-full-overview/, handler: () => Promise.resolve({
    data: {
      data: mockCustomersOverviewData,
      ...mockCustomersOverviewMeta,
    },
  }) },

  // Emails
  { pattern: /\/last-sync-email/, handler: () => flat({ last_sync: new Date().toISOString(), status: 'success' }) },
  { pattern: /\/all-customers-stakeholders/, handler: () => flat([
    { customer_id: 101, customer_name: 'Swiggy', stakeholders: [{ _id: 'sh_101', name: 'Rahul Bothra', email: 'rahul@swiggy.in', designation: 'VP Payments' }] },
    { customer_id: 102, customer_name: 'Meesho', stakeholders: [{ _id: 'sh_102', name: 'Sreeram Iyer', email: 'sreeram@meesho.com', designation: 'VP Payments' }] },
    { customer_id: 103, customer_name: 'Nykaa', stakeholders: [{ _id: 'sh_103', name: 'Adwaita Nayar', email: 'adwaita@nykaa.com', designation: 'CEO - Nykaa Fashion' }] },
    { customer_id: 104, customer_name: 'CRED', stakeholders: [{ _id: 'sh_104', name: 'Kunal Shah', email: 'kunal@cred.club', designation: 'CEO' }] },
    { customer_id: 105, customer_name: 'Urban Company', stakeholders: [{ _id: 'sh_105', name: 'Varun Khaitan', email: 'varun@urbancompany.com', designation: 'Co-founder & CEO' }] },
    { customer_id: 106, customer_name: 'Zerodha', stakeholders: [{ _id: 'sh_106', name: 'Kailash Nadh', email: 'kailash@zerodha.com', designation: 'CTO' }] },
    { customer_id: 107, customer_name: 'Pharmeasy', stakeholders: [{ _id: 'sh_107', name: 'Dhaval Shah', email: 'dhaval@pharmeasy.in', designation: 'CFO' }] },
    { customer_id: 108, customer_name: 'Lenskart', stakeholders: [{ _id: 'sh_108', name: 'Peyush Bansal', email: 'peyush@lenskart.com', designation: 'CEO' }] },
  ]) },
  { pattern: /\/email-messages\/([^/]+)$/, method: 'PATCH', handler: (url, _, data) => nested({ _id: url.split('/').pop(), ...data }) },
  { pattern: /\/email-messages$/, handler: () => nested([]) },
  { pattern: /\/customer-meeting/, handler: () => flat([]) },
  { pattern: /\/send-email$/, method: 'POST', handler: () => flat({ success: true }) },

  // Signals / Journey
  { pattern: /\/signals\//, handler: () => flat([]) },
  { pattern: /\/customerJourney\//, handler: () => flat([]) },
  { pattern: /\/getCustomerJourneySignal\//, handler: () => flat(null) },

  // AI / Prompts
  { pattern: /\/prompts$/, handler: () => flat([]) },
  { pattern: /\/intelligence\/chat/, method: 'POST', handler: () => flat({ answer: 'Mock AI response', source_documents: [], success: true }) },

  // Catch-all
  { pattern: /.*/, handler: (url, method) => {
    console.warn(`[MOCK] Unhandled route: ${method} ${url}`);
    return nested(null);
  }},
];

export async function mockRouter(url: string, method: string = 'GET', data?: any, params?: any): Promise<any> {
  const normalizedMethod = method.toUpperCase();
  const route = routes.find((r) => r.pattern.test(url) && (!r.method || r.method === normalizedMethod));
  if (route) return route.handler(url, normalizedMethod, data, params);
  return nested(null);
}
