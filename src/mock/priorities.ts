import { mockTasks } from './tasks';
import { mockCustomers } from './customers';

// Priority Tasks — urgent/high tasks surfaced for today
export const mockPriorityTasks = mockTasks.filter((t) =>
  ['Urgent', 'High'].includes(t.priority) && t.status !== 'Done'
);

// Priority Customer Overview — customers needing attention
export const mockPriorityCustomerOverview = [
  {
    customer_id: 102,
    customer_name: 'Meesho',
    health_score: 67,
    overview_status: 'Red',
    NPS: 45,
    renewal_date: '2025-12-31',
    near_to_renewal: false,
    overdue: true,
    is_starred: false,
    customer_metric: { value: 36000000 },
    segment: 'Enterprise',
  },
  {
    customer_id: 107,
    customer_name: 'Pharmeasy',
    health_score: 55,
    overview_status: 'Red',
    NPS: 38,
    renewal_date: '2025-12-31',
    near_to_renewal: false,
    overdue: true,
    is_starred: false,
    customer_metric: { value: 7200000 },
    segment: 'Mid-Market',
  },
  {
    customer_id: 104,
    customer_name: 'CRED',
    health_score: 78,
    overview_status: 'Yellow',
    NPS: 68,
    renewal_date: '2025-08-31',
    near_to_renewal: true,
    overdue: false,
    is_starred: false,
    customer_metric: { value: 22000000 },
    segment: 'Enterprise',
  },
  {
    customer_id: 105,
    customer_name: 'Urban Company',
    health_score: 73,
    overview_status: 'Yellow',
    NPS: 61,
    renewal_date: '2025-06-30',
    near_to_renewal: true,
    overdue: false,
    is_starred: false,
    customer_metric: { value: 9600000 },
    segment: 'Mid-Market',
  },
  {
    customer_id: 101,
    customer_name: 'Swiggy',
    health_score: 82,
    overview_status: 'Green',
    NPS: 72,
    renewal_date: '2026-03-31',
    near_to_renewal: false,
    overdue: false,
    is_starred: true,
    customer_metric: { value: 48000000 },
    segment: 'Enterprise',
  },
  {
    customer_id: 106,
    customer_name: 'Zerodha',
    health_score: 95,
    overview_status: 'Green',
    NPS: 91,
    renewal_date: '2027-02-28',
    near_to_renewal: false,
    overdue: false,
    is_starred: true,
    customer_metric: { value: 54000000 },
    segment: 'Enterprise',
  },
];

// Events & References — stakeholder birthdays, work anniversaries, news
export const mockEventsAndReferences = [
  {
    _id: 'ref_001',
    type: 'news',
    title: 'Meesho raises $275M in fresh funding, plans aggressive merchant expansion',
    customer_name: 'Meesho',
    image: 'https://placehold.co/44x44/6366f1/white?text=M',
    dateTimePub: '2025-04-20T08:00:00Z',
    url: 'https://techcrunch.com',
    stakeholder_name: null,
    stakeholder_id: null,
    date: null,
  },
  {
    _id: 'ref_002',
    type: 'stakeholder_dob',
    title: null,
    customer_name: 'Swiggy',
    image: null,
    dateTimePub: null,
    url: null,
    stakeholder_name: 'Rahul Bothra',
    stakeholder_id: 'sh_101',
    date: '04-22',
    description: null,
  },
  {
    _id: 'ref_003',
    type: 'news',
    title: 'CRED expands into travel bookings, new payment flows expected',
    customer_name: 'CRED',
    image: 'https://placehold.co/44x44/f59e0b/white?text=C',
    dateTimePub: '2025-04-19T10:00:00Z',
    url: 'https://economictimes.com',
    stakeholder_name: null,
    stakeholder_id: null,
    date: null,
  },
  {
    _id: 'ref_004',
    type: 'stakeholder_work_anniversary',
    title: null,
    customer_name: 'Zerodha',
    image: null,
    dateTimePub: null,
    url: null,
    stakeholder_name: 'Kailash Nadh',
    stakeholder_id: 'sh_106',
    date: '04-25',
    description: null,
  },
  {
    _id: 'ref_005',
    type: 'news',
    title: 'Nykaa Q4 results: Revenue up 24% YoY, beauty segment driving growth',
    customer_name: 'Nykaa',
    image: 'https://placehold.co/44x44/ec4899/white?text=N',
    dateTimePub: '2025-04-18T07:00:00Z',
    url: 'https://livemint.com',
    stakeholder_name: null,
    stakeholder_id: null,
    date: null,
  },
  {
    _id: 'ref_006',
    type: 'stakeholder_custom',
    title: 'Pharmeasy exec check-in',
    customer_name: 'Pharmeasy',
    image: null,
    dateTimePub: null,
    url: null,
    stakeholder_name: 'Dhaval Shah',
    stakeholder_id: 'sh_107',
    date: '2025-04-24',
    description: 'Scheduled follow-up to discuss API integration pain points and support escalation.',
  },
];

// Priority Signals & Opportunities
export const mockPrioritySignals = [
  {
    _id: 'sig_001',
    type: 'risk',
    title: 'Meesho payment success rate dropped 4%',
    customer_name: 'Meesho',
    customer_id: 102,
    intensity: 'high',
    status: 'open',
    created_at: '2025-04-10T09:00:00Z',
  },
  {
    _id: 'sig_002',
    type: 'opportunity',
    title: 'Zerodha — RazorpayX Treasury upsell',
    customer_name: 'Zerodha',
    customer_id: 106,
    intensity: 'medium',
    status: 'open',
    created_at: '2025-03-25T09:00:00Z',
  },
  {
    _id: 'sig_003',
    type: 'risk',
    title: 'Pharmeasy NPS dropped to 38',
    customer_name: 'Pharmeasy',
    customer_id: 107,
    intensity: 'urgent',
    status: 'in_progress',
    created_at: '2025-04-12T09:00:00Z',
  },
];

// Portfolio Team Summary (for priorities header)
export const mockPortfolioTeam = {
  total_customers: 8,
  healthy: 5,
  at_risk: 2,
  churn_risk: 2,
  total_arr: 216800000,
  tasks_due_today: 2,
  open_insights: 4,
  avg_health_score: 77.6,
};

// Checklist items for today
export const mockChecklistItems = [
  {
    _id: 'chk_001',
    title: 'Send Meesho escalation summary to Rohan',
    is_completed: false,
    due_date: '2025-04-22',
    ref_type: 'task',
    ref_id: 't_002',
    customer_id: 102,
    position: 1,
  },
  {
    _id: 'chk_002',
    title: 'Review Pharmeasy API audit report',
    is_completed: false,
    due_date: '2025-04-22',
    ref_type: 'task',
    ref_id: 't_005',
    customer_id: 107,
    position: 2,
  },
  {
    _id: 'chk_003',
    title: 'Greet Rahul Bothra (Swiggy) - Birthday',
    is_completed: true,
    due_date: '2025-04-22',
    ref_type: 'stakeholder_dob',
    ref_id: null,
    customer_id: 101,
    position: 3,
  },
];

// My Team / Metric Config
export const mockMyTeamConfig = {
  show_health_score: true,
  show_arr: true,
  show_nps: true,
  show_renewal_date: true,
  currency_symbol: '₹',
};

export const mockCustomer360MetricConfig = {
  metrics: {
    arr: { display_name: 'ARR', enabled: true },
    nps: { display_name: 'NPS', enabled: true },
    health_score: { display_name: 'Health Score', enabled: true },
  },
  tree_map_sorting: { sort_by: 'arr' },
  priority_config: {
    renewal_date: { enabled: true, display_name: 'Renewal Date' },
  },
};
