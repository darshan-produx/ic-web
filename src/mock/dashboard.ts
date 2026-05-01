// Dashboard summary data for Razorpay's CS team on ImpactCraft

export const mockDashboardSummary = {
  total_customers: 8,
  healthy_customers: 5,
  at_risk_customers: 2,
  churn_risk_customers: 2,
  total_arr: 216800000, // ₹21.68Cr ARR across portfolio
  avg_health_score: 77.6,
  avg_nps: 66.8,
  open_tasks: 6,
  overdue_tasks: 1,
  open_insights: 4,
  renewals_next_90_days: 3,
};

export const mockHealthScoreTrend = [
  { month: 'Nov 2024', avg_score: 71.2 },
  { month: 'Dec 2024', avg_score: 73.5 },
  { month: 'Jan 2025', avg_score: 75.1 },
  { month: 'Feb 2025', avg_score: 76.4 },
  { month: 'Mar 2025', avg_score: 77.0 },
  { month: 'Apr 2025', avg_score: 77.6 },
];

export const mockARRBySegment = [
  { segment: 'Enterprise', arr: 188000000, customer_count: 4 },
  { segment: 'Mid-Market', arr: 28800000, customer_count: 3 },
  { segment: 'SMB', arr: 0, customer_count: 0 },
];

export const mockTaskCompletionTrend = [
  { week: 'Week 1 Apr', completed: 4, created: 6 },
  { week: 'Week 2 Apr', completed: 3, created: 5 },
  { week: 'Week 3 Apr', completed: 2, created: 4 },
  { week: 'Week 4 Apr', completed: 1, created: 3 },
];

export const mockUpcomingRenewals = [
  {
    customer_id: 102,
    customer_name: 'Meesho',
    renewal_date: '2025-12-31',
    arr: 36000000,
    health_score: 67,
    is_churn_risk: true,
    days_to_renewal: 253,
  },
  {
    customer_id: 104,
    customer_name: 'CRED',
    renewal_date: '2025-08-31',
    arr: 22000000,
    health_score: 78,
    is_churn_risk: false,
    days_to_renewal: 131,
  },
  {
    customer_id: 105,
    customer_name: 'Urban Company',
    renewal_date: '2025-06-30',
    arr: 9600000,
    health_score: 73,
    is_churn_risk: false,
    days_to_renewal: 69,
  },
];

export const mockChurnRiskSummary = [
  {
    customer_id: 102,
    customer_name: 'Meesho',
    health_score: 67,
    nps_score: 45,
    arr: 36000000,
    risk_reason: 'Settlement delays, low NPS',
  },
  {
    customer_id: 107,
    customer_name: 'Pharmeasy',
    health_score: 55,
    nps_score: 38,
    arr: 7200000,
    risk_reason: 'API integration issues, support dissatisfaction',
  },
];

export const mockPriorityEvents = [
  {
    id: 'ev_001',
    title: 'Meesho escalation call',
    type: 'Call',
    date: '2025-04-23T11:00:00Z',
    customer_id: 102,
    customer_name: 'Meesho',
    assigned_to_name: 'Priya Nair',
  },
  {
    id: 'ev_002',
    title: 'CRED renewal proposal due',
    type: 'Deadline',
    date: '2025-05-15T00:00:00Z',
    customer_id: 104,
    customer_name: 'CRED',
    assigned_to_name: 'Arjun Mehta',
  },
  {
    id: 'ev_003',
    title: 'Pharmeasy technical audit',
    type: 'Review',
    date: '2025-04-25T14:00:00Z',
    customer_id: 107,
    customer_name: 'Pharmeasy',
    assigned_to_name: 'Priya Nair',
  },
];
