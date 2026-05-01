// My Team hierarchy data — Razorpay CS team structure

export const mockUserHierarchyRoot = {
  _id: 'u_004',
  first_name: 'Rohan',
  last_name: 'Sharma',
  email: 'rohan.sharma@razorpay.com',
  role: 'Team Lead - CS',
  parent_id: 'u_005',
};

const csm1 = { _id: 'u_001', first_name: 'Priya', last_name: 'Nair', email: 'priya.nair@razorpay.com', role: 'CSM', parent_id: 'u_004' };
const csm2 = { _id: 'u_002', first_name: 'Arjun', last_name: 'Mehta', email: 'arjun.mehta@razorpay.com', role: 'CSM', parent_id: 'u_004' };
const csm3 = { _id: 'u_003', first_name: 'Sneha', last_name: 'Kulkarni', email: 'sneha.kulkarni@razorpay.com', role: 'CSM', parent_id: 'u_004' };

const buildAggregate = (arr: number, renewals: number, tasks: number, insights: number, signals: number, opportunities: number) => ({
  arr,
  accounts: 0, // will be derived from customer count
  renewed_accounts_actual: renewals,
  renewed_accounts_opportunity: renewals + 1,
  actual_renewal_value: arr * 0.9,
  nrr: 102,
  expected_billing: arr / 12,
  actual_billed: arr / 12 * 0.95,
  unpaid: arr * 0.02,
  total_amount_overdue: 0,
  invoiced_arr: arr,
  insights_acted: insights,
  tasks: tasks,
  incomplete_tasks: Math.floor(tasks * 0.4),
  open_signals: signals,
  opportunities,
  value_of_opportunities: opportunities * 5000000,
  opportunities_win_count: Math.floor(opportunities * 0.5),
  opportunities_win_value: Math.floor(opportunities * 0.5) * 5000000,
  opportunities_lost_count: 0,
  opportunities_lost_value: 0,
  risk_acted: Math.floor(signals * 0.6),
  total_risks: signals,
});

// Each direct subordinate (CSM) with their assigned customers
export const mockMyTeamHierarchy = {
  root: {
    user: mockUserHierarchyRoot,
    direct_assigned_customers: [], // Team lead has no direct customers
    total_customer_details_aggregate: buildAggregate(216800000, 3, 24, 14, 8, 6),
    client_currency: { currency: 'INR', currency_symbol: '₹' },
  },
  direct_subordinates: [
    {
      user: csm1,
      direct_assigned_customers: [
        { customer_id: 101, customer_name: 'Swiggy', type: 'customer', children: [] },
        { customer_id: 102, customer_name: 'Meesho', type: 'customer', children: [] },
        { customer_id: 107, customer_name: 'Pharmeasy', type: 'customer', children: [] },
      ],
      total_customer_details_aggregate: buildAggregate(91200000, 1, 9, 5, 4, 2),
      children: [],
    },
    {
      user: csm2,
      direct_assigned_customers: [
        { customer_id: 103, customer_name: 'Nykaa', type: 'customer', children: [] },
        { customer_id: 104, customer_name: 'CRED', type: 'customer', children: [] },
        { customer_id: 108, customer_name: 'Lenskart', type: 'customer', children: [] },
      ],
      total_customer_details_aggregate: buildAggregate(62000000, 1, 8, 5, 2, 2),
      children: [],
    },
    {
      user: csm3,
      direct_assigned_customers: [
        { customer_id: 105, customer_name: 'Urban Company', type: 'customer', children: [] },
        { customer_id: 106, customer_name: 'Zerodha', type: 'customer', children: [] },
      ],
      total_customer_details_aggregate: buildAggregate(63600000, 1, 7, 4, 2, 2),
      children: [],
    },
  ],
};

// Detailed customer metrics for when a CSM row is expanded
export const mockCustomerMetrics: Record<number, any> = {
  101: {
    customer_id: 101, customer_name: 'Swiggy', type: 'customer', children: [],
    arr: 48000000, health_score: 82, nrr: 105, open_signals: 1, incomplete_tasks: 1,
    opportunities: 1, value_of_opportunities: 5000000, insights_acted: 2,
    tasks: 3, accounts: 1, renewed_accounts_actual: 1, renewed_accounts_opportunity: 1,
    actual_renewal_value: 45000000, expected_billing: 4000000, actual_billed: 3800000,
    unpaid: 200000, total_amount_overdue: 0, invoiced_arr: 48000000,
    risk_acted: 0, total_risks: 1, opportunities_win_count: 0, opportunities_win_value: 0,
    opportunities_lost_count: 0, opportunities_lost_value: 0,
  },
  102: {
    customer_id: 102, customer_name: 'Meesho', type: 'customer', children: [],
    arr: 36000000, health_score: 67, nrr: 96, open_signals: 2, incomplete_tasks: 2,
    opportunities: 0, value_of_opportunities: 0, insights_acted: 1,
    tasks: 3, accounts: 1, renewed_accounts_actual: 0, renewed_accounts_opportunity: 1,
    actual_renewal_value: 0, expected_billing: 3000000, actual_billed: 2800000,
    unpaid: 500000, total_amount_overdue: 200000, invoiced_arr: 36000000,
    risk_acted: 1, total_risks: 2, opportunities_win_count: 0, opportunities_win_value: 0,
    opportunities_lost_count: 0, opportunities_lost_value: 0,
  },
  103: {
    customer_id: 103, customer_name: 'Nykaa', type: 'customer', children: [],
    arr: 28000000, health_score: 91, nrr: 110, open_signals: 0, incomplete_tasks: 0,
    opportunities: 1, value_of_opportunities: 8000000, insights_acted: 3,
    tasks: 2, accounts: 1, renewed_accounts_actual: 1, renewed_accounts_opportunity: 1,
    actual_renewal_value: 28000000, expected_billing: 2333333, actual_billed: 2333333,
    unpaid: 0, total_amount_overdue: 0, invoiced_arr: 28000000,
    risk_acted: 0, total_risks: 0, opportunities_win_count: 1, opportunities_win_value: 8000000,
    opportunities_lost_count: 0, opportunities_lost_value: 0,
  },
  104: {
    customer_id: 104, customer_name: 'CRED', type: 'customer', children: [],
    arr: 22000000, health_score: 78, nrr: 100, open_signals: 1, incomplete_tasks: 1,
    opportunities: 0, value_of_opportunities: 0, insights_acted: 1,
    tasks: 3, accounts: 1, renewed_accounts_actual: 0, renewed_accounts_opportunity: 1,
    actual_renewal_value: 0, expected_billing: 1833333, actual_billed: 1833333,
    unpaid: 0, total_amount_overdue: 0, invoiced_arr: 22000000,
    risk_acted: 0, total_risks: 1, opportunities_win_count: 0, opportunities_win_value: 0,
    opportunities_lost_count: 0, opportunities_lost_value: 0,
  },
  105: {
    customer_id: 105, customer_name: 'Urban Company', type: 'customer', children: [],
    arr: 9600000, health_score: 73, nrr: 103, open_signals: 1, incomplete_tasks: 1,
    opportunities: 1, value_of_opportunities: 3000000, insights_acted: 1,
    tasks: 2, accounts: 1, renewed_accounts_actual: 0, renewed_accounts_opportunity: 1,
    actual_renewal_value: 0, expected_billing: 800000, actual_billed: 800000,
    unpaid: 0, total_amount_overdue: 0, invoiced_arr: 9600000,
    risk_acted: 0, total_risks: 1, opportunities_win_count: 0, opportunities_win_value: 0,
    opportunities_lost_count: 0, opportunities_lost_value: 0,
  },
  106: {
    customer_id: 106, customer_name: 'Zerodha', type: 'customer', children: [],
    arr: 54000000, health_score: 95, nrr: 112, open_signals: 0, incomplete_tasks: 0,
    opportunities: 1, value_of_opportunities: 12000000, insights_acted: 2,
    tasks: 2, accounts: 1, renewed_accounts_actual: 1, renewed_accounts_opportunity: 1,
    actual_renewal_value: 54000000, expected_billing: 4500000, actual_billed: 4500000,
    unpaid: 0, total_amount_overdue: 0, invoiced_arr: 54000000,
    risk_acted: 0, total_risks: 0, opportunities_win_count: 0, opportunities_win_value: 0,
    opportunities_lost_count: 0, opportunities_lost_value: 0,
  },
  107: {
    customer_id: 107, customer_name: 'Pharmeasy', type: 'customer', children: [],
    arr: 7200000, health_score: 55, nrr: 92, open_signals: 2, incomplete_tasks: 2,
    opportunities: 0, value_of_opportunities: 0, insights_acted: 1,
    tasks: 2, accounts: 1, renewed_accounts_actual: 0, renewed_accounts_opportunity: 1,
    actual_renewal_value: 0, expected_billing: 600000, actual_billed: 550000,
    unpaid: 150000, total_amount_overdue: 100000, invoiced_arr: 7200000,
    risk_acted: 1, total_risks: 2, opportunities_win_count: 0, opportunities_win_value: 0,
    opportunities_lost_count: 0, opportunities_lost_value: 0,
  },
  108: {
    customer_id: 108, customer_name: 'Lenskart', type: 'customer', children: [],
    arr: 12000000, health_score: 80, nrr: 104, open_signals: 1, incomplete_tasks: 1,
    opportunities: 1, value_of_opportunities: 4000000, insights_acted: 1,
    tasks: 2, accounts: 1, renewed_accounts_actual: 1, renewed_accounts_opportunity: 1,
    actual_renewal_value: 12000000, expected_billing: 1000000, actual_billed: 1000000,
    unpaid: 0, total_amount_overdue: 0, invoiced_arr: 12000000,
    risk_acted: 0, total_risks: 1, opportunities_win_count: 0, opportunities_win_value: 0,
    opportunities_lost_count: 0, opportunities_lost_value: 0,
  },
};
