export type DurationOption =
  | 'last_month'
  | 'last_quarter'
  | 'last_year'
  | 'month_to_date'
  | 'quarter_to_date'
  | 'year_to_date'
  | 'ttm';

export type DirectAssignedCustomer = {
  customer_id: number;
  type?: 'customer' | 'group';
  children?: number[];
};

export type UserNode = {
  _id: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  supervisor_note?: string;
  parent_id?: string;
  depth?: number;
};

export type AggregateMetrics = Record<string, any>;

export type CustomerMetric = {
  customer_id: number;
  customer_name?: string;
  customer_success_plan?: string;
  is_active?: boolean;
  status?: string;
  incoming_values?: Record<string, any>;
  custom_attributes?: Record<string, any>;
  type?: 'customer' | 'group';
  children?: CustomerMetric[];
  [key: string]: any;
};

export type HierarchyRootNode = {
  user: UserNode;
  direct_assigned_customers: CustomerMetric[];
  total_customer_details_aggregate: AggregateMetrics;
};

export type HierarchySubordinateNode = {
  user: UserNode;
  direct_assigned_customers: Array<DirectAssignedCustomer | CustomerMetric>;
  total_customer_details_aggregate?: AggregateMetrics;
  children?: HierarchySubordinateNode[];
};

export type MyTeamHierarchyData = {
  root: HierarchyRootNode;
  direct_subordinates: HierarchySubordinateNode[];
};

export type TeamRow = {
  id: string;
  rowType: 'user' | 'customer' | 'group-child';
  name: string;
  user?: UserNode;
  aggregate?: AggregateMetrics;
  directAssignedCustomers?: DirectAssignedCustomer[];
  customer?: CustomerMetric;
  hierarchyLoaded?: boolean;
  customersLoaded?: boolean;
  subRows?: TeamRow[];
};

export type MyTeamConfig = Record<
  string,
  {
    enabled: boolean;
    display_name: string;
  }
>;
