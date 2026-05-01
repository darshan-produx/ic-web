'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import TeamToolbar from './components/TeamToolbar';
import TeamTable from './components/TeamTable';
import TeamMetricDrawer from './components/TeamMetricDrawer';
import {
  DirectAssignedCustomer,
  DurationOption,
  MyTeamConfig,
  TeamRow,
  CustomerMetric,
  HierarchySubordinateNode,
} from './types';
import {
  fetchMyTeamCustomersData,
  fetchMyTeamHierarchyData,
  fetchMyTeamOpportunityScopeCustomerIds,
} from '../../api/my-team/my-team';
import { getCurrencySymbol } from '../../api/config/insight';
import { getMyTeamConfigs } from '../../api/customers/customers';
import { getUserHierarchy } from '../../api/users/users';
import {
  aggregateFromCustomers,
  getFullName,
  updateRowById,
} from '../../../common/SupportFunctions';
import { ExpandedState } from '@tanstack/react-table';
import Loading from '../../../common/components/loading';

const DEFAULT_CONFIG: MyTeamConfig = {
  Accounts: { enabled: true, display_name: 'Accounts' },
  ARR: { enabled: true, display_name: 'ARR' },
  Renewals: { enabled: true, display_name: 'Renewals' },
  Renewal_revenue: { enabled: true, display_name: 'Renewal revenue' },
  NRR: { enabled: true, display_name: 'NRR' },
  Expected_billing: { enabled: true, display_name: 'Expected billing' },
  Actual_billed: { enabled: true, display_name: 'Actual billed' },
  Unpaid: { enabled: true, display_name: 'Unpaid' },
  Amount_overdue: { enabled: false, display_name: 'Amount overdue' },
  Invoiced_ARR: { enabled: false, display_name: 'Invoiced ARR' },
  Insights_acted: { enabled: true, display_name: 'Insights acted' },
  Tasks_done: { enabled: true, display_name: 'Tasks done' },
  open_signals: { enabled: true, display_name: 'Open signals' },
  task: { enabled: true, display_name: 'Task' },
  notes: { enabled: true, display_name: 'Notes' },
  opportunities: { enabled: true, display_name: 'Opportunities' },
  value_of_opportunities: { enabled: true, display_name: 'Value of opportunities' },
  opportunities_win_count: { enabled: false, display_name: 'Opportunities won' },
  opportunities_win_value: { enabled: false, display_name: 'Opportunities won value' },
  opportunities_lost_count: { enabled: false, display_name: 'Opportunities lost' },
  opportunities_lost_value: { enabled: false, display_name: 'Opportunities lost value' },
  risk_acted: { enabled: false, display_name: 'Risk acted' },
  total_risks: { enabled: false, display_name: 'Total risks' },
};

const MY_TEAM_STORAGE_TTL_MS = 30 * 60 * 1000;
const MY_TEAM_STATE_PREFIX = 'my_team_state_v2_user-';
const MY_TEAM_EXPANDED_PREFIX = 'my_team_expanded_v1_user-';

const getLastVisitedCustomerStorageKey = (userId?: string) =>
  userId ? `my_team_last_customer_v1_user-${userId}` : '';

const GROUP_ROLLUP_FIELDS = [
  'renewed_accounts_actual',
  'renewed_accounts_opportunity',
  'arr',
  'actual_renewal_value',
  'nrr',
  'expected_billing',
  'actual_billed',
  'unpaid',
  'total_amount_overdue',
  'invoiced_arr',
  'insights_acted',
  'tasks',
  'open_signals',
  'incomplete_tasks',
  'opportunities',
  'value_of_opportunities',
  'opportunities_win_count',
  'opportunities_win_value',
  'opportunities_lost_count',
  'opportunities_lost_value',
  'risk_acted',
  'total_risks',
] as const;

const countCustomerLeaves = (item: CustomerMetric): number => {
  const children = Array.isArray(item.children) ? item.children : [];
  if (!children.length) {
    return 1;
  }

  return children.reduce((total, child) => total + countCustomerLeaves(child), 0);
};

const rollupCustomerTree = (item: CustomerMetric): CustomerMetric => {
  const children = Array.isArray(item.children)
    ? item.children.map((child) => rollupCustomerTree(child))
    : [];

  const hasChildren = children.length > 0;
  if (!hasChildren) {
    return {
      ...item,
      children,
    };
  }

  const rolledItem: CustomerMetric = {
    ...item,
    type: item.type || 'group',
    children,
  };

  for (const metricField of GROUP_ROLLUP_FIELDS) {
    const childSum = children.reduce((total, child) => total + Number(child?.[metricField] ?? 0), 0);
    const ownValue = Number(item?.[metricField] ?? 0);
    rolledItem[metricField] = childSum !== 0 ? childSum : ownValue;
  }

  const leafCount = countCustomerLeaves(rolledItem);
  rolledItem.accounts = leafCount > 0 ? leafCount : Number(item?.accounts ?? 0);

  return rolledItem;
};

const toCustomerRows = (items: CustomerMetric[], parentId: string): TeamRow[] => {
  return items.map((item) => {
    const normalizedItem = rollupCustomerTree(item);
    const rowId = `${parentId}-customer-${item.customer_id}`;
    const childRows: TeamRow[] = Array.isArray(normalizedItem.children)
      ? normalizedItem.children.map((child) => ({
          id: `${rowId}-child-${child.customer_id}`,
          rowType: 'group-child',
          name: child.customer_name || `Customer ${child.customer_id}`,
          customer: child,
        }))
      : [];

    return {
      id: rowId,
      rowType: 'customer',
      name: normalizedItem.customer_name || `Customer ${normalizedItem.customer_id}`,
      customer: normalizedItem,
      subRows: childRows,
    };
  });
};

const toUserRows = (items: HierarchySubordinateNode[], parentPath: string): TeamRow[] => {
  return items.map((sub, index) => {
    const rowId = `${parentPath}-user-${sub.user._id}-${sub.user.parent_id || 'root'}-${index}`;
    const rawCustomers = Array.isArray(sub.direct_assigned_customers)
      ? sub.direct_assigned_customers
      : [];

    const detailedCustomers = rawCustomers.filter((customer: any) =>
      typeof customer?.customer_name === 'string' || typeof customer?.customer_id === 'number',
    ) as CustomerMetric[];

    const customerRows = detailedCustomers.length
      ? toCustomerRows(detailedCustomers, rowId)
      : [];
    const childUserRows = Array.isArray(sub.children)
      ? toUserRows(sub.children, rowId)
      : [];

    return {
      id: rowId,
      rowType: 'user',
      name: getFullName(sub.user.first_name, sub.user.last_name),
      user: sub.user,
      directAssignedCustomers: rawCustomers
        .map((customer: any): DirectAssignedCustomer => {
          const normalizedType: DirectAssignedCustomer['type'] =
            customer?.type === 'group' ? 'group' : 'customer';

          return {
            customer_id: Number(customer?.customer_id),
            type: normalizedType,
            children: Array.isArray(customer?.children)
              ? customer.children
                  .map((child: any) => Number(child?.customer_id ?? child))
                  .filter((childId: number) => !Number.isNaN(childId))
              : [],
          };
        })
        .filter((customer) => !Number.isNaN(customer.customer_id)),
      aggregate: sub.total_customer_details_aggregate,
      hierarchyLoaded: childUserRows.length > 0,
      customersLoaded: detailedCustomers.length > 0,
      subRows: [...customerRows, ...childUserRows],
    };
  });
};

const NewTeamPage: React.FC = () => {
  const [duration, setDuration] = useState<DurationOption>('year_to_date');
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [rows, setRows] = useState<TeamRow[]>([]);
  const [loadingRowIds, setLoadingRowIds] = useState<Record<string, boolean>>({});
  const [isTableReady, setIsTableReady] = useState(false);
  const [activeDrawer, setActiveDrawer] = useState<'opportunities' | 'open_signals' | 'task' | null>(null);
  const [searchText, setSearchText] = useState('');
  const [debouncedSearchText, setDebouncedSearchText] = useState('');
  const [drawerTitle, setDrawerTitle] = useState('');
  const [drawerCustomerIds, setDrawerCustomerIds] = useState<number[]>([]);
  const [snapshotChecked, setSnapshotChecked] = useState(false);
  const [hasFreshSnapshot, setHasFreshSnapshot] = useState(false);
  const [searchSourceRows, setSearchSourceRows] = useState<TeamRow[]>([]);
  const [lastVisitedCustomerId, setLastVisitedCustomerId] = useState<number | null>(null);
  const latestPersistentStateRef = useRef<{ rows: TeamRow[]; expanded: ExpandedState } | null>(null);
  const preSearchSnapshotRef = useRef<{ rows: TeamRow[]; expanded: ExpandedState } | null>(null);
  const prevDebouncedSearchRef = useRef('');
  const expandedHydratedRef = useRef(false);
  const restoredFromSearchRef = useRef(false);

  const { data: userHierarchyData } = useQuery({
    queryKey: ['newTeamUserHierarchy'],
    queryFn: getUserHierarchy,
    refetchOnWindowFocus: false,
  });

  const userId = userHierarchyData?.data?._id;
  const expandedStorageKey = userId ? `${MY_TEAM_EXPANDED_PREFIX}${userId}` : '';
  const tableStateStorageKey = userId
    ? `${MY_TEAM_STATE_PREFIX}${userId}_duration-${duration}`
    : '';
  const lastVisitedCustomerStorageKey = getLastVisitedCustomerStorageKey(userId);

  useEffect(() => {
    const cleanupStaleMyTeamStorage = () => {
      const now = Date.now();
      const keysToDelete: string[] = [];

      for (let i = 0; i < localStorage.length; i += 1) {
        const key = localStorage.key(i);
        if (!key) continue;

        if (!key.startsWith(MY_TEAM_STATE_PREFIX) && !key.startsWith(MY_TEAM_EXPANDED_PREFIX)) {
          continue;
        }

        try {
          const raw = localStorage.getItem(key);
          if (!raw) {
            keysToDelete.push(key);
            continue;
          }

          const parsed = JSON.parse(raw) as { savedAt?: number };
          const savedAt = Number(parsed?.savedAt);
          const isExpired = !Number.isFinite(savedAt) || now - savedAt > MY_TEAM_STORAGE_TTL_MS;

          if (isExpired) {
            keysToDelete.push(key);
          }
        } catch {
          keysToDelete.push(key);
        }
      }

      for (const key of keysToDelete) {
        localStorage.removeItem(key);
      }
    };

    cleanupStaleMyTeamStorage();
    const intervalId = setInterval(cleanupStaleMyTeamStorage, 60_000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    if (!lastVisitedCustomerStorageKey) {
      setLastVisitedCustomerId(null);
      return;
    }

    const savedValue = sessionStorage.getItem(lastVisitedCustomerStorageKey);
    const parsed = Number(savedValue);
    if (Number.isFinite(parsed) && parsed > 0) {
      setLastVisitedCustomerId(parsed);
      return;
    }

    setLastVisitedCustomerId(null);
  }, [lastVisitedCustomerStorageKey]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearchText(searchText.trim());
    }, 500);

    return () => clearTimeout(timeout);
  }, [searchText]);

  useEffect(() => {
    const hadSearch = prevDebouncedSearchRef.current.length > 0;
    const hasSearch = debouncedSearchText.length > 0;

    if (!hadSearch && hasSearch && rows.length > 0) {
      if (expandedStorageKey) {
        localStorage.removeItem(expandedStorageKey);
      }
      preSearchSnapshotRef.current = {
        rows,
        expanded,
      };
      setHasFreshSnapshot(false);
    }

    if (hadSearch && !hasSearch) {
      const snapshot = preSearchSnapshotRef.current;
      if (snapshot && snapshot.rows.length > 0) {
        setRows(snapshot.rows);
        setExpanded(snapshot.expanded && typeof snapshot.expanded === 'object' ? snapshot.expanded : {});
        setLoadingRowIds({});
        setIsTableReady(true);
        setHasFreshSnapshot(true);
        restoredFromSearchRef.current = true;
      }
    }

    prevDebouncedSearchRef.current = debouncedSearchText;
  }, [debouncedSearchText, rows, expanded, expandedStorageKey]);

  useEffect(() => {
    if (searchText.trim().length > 0 || debouncedSearchText.length > 0) {
      latestPersistentStateRef.current = null;
      return;
    }

    if (!tableStateStorageKey || rows.length === 0) {
      return;
    }

    latestPersistentStateRef.current = {
      rows,
      expanded,
    };

    try {
      localStorage.setItem(
        tableStateStorageKey,
        JSON.stringify({
          rows,
          expanded,
          savedAt: Date.now(),
        }),
      );
    } catch {
      // ignore localStorage errors
    }
  }, [tableStateStorageKey, rows, expanded, searchText, debouncedSearchText]);

  // Persist only stable (non-search) state when leaving my-team page
  useEffect(() => {
    return () => {
      const state = latestPersistentStateRef.current;
      if (!tableStateStorageKey || !state || state.rows.length === 0) {
        return;
      }

      try {
        localStorage.setItem(
          tableStateStorageKey,
          JSON.stringify({
            rows: state.rows,
            expanded: state.expanded,
            savedAt: Date.now(),
          }),
        );
      } catch {
        // ignore localStorage errors
      }
    };
  }, [tableStateStorageKey]);

  // Persist expanded state to localStorage so it survives navigation away and back
  useEffect(() => {
    if (searchText.trim().length > 0 || debouncedSearchText.length > 0) return;
    if (!expandedStorageKey || Object.keys(expanded as Record<string, boolean>).length === 0) return;
    try {
      localStorage.setItem(
        expandedStorageKey,
        JSON.stringify({
          expanded,
          savedAt: Date.now(),
        }),
      );
    } catch {
      // ignore localStorage errors
    }
  }, [expanded, expandedStorageKey, searchText, debouncedSearchText]);

  useEffect(() => {
    expandedHydratedRef.current = false;
  }, [tableStateStorageKey, debouncedSearchText]);

  const { data: configData } = useQuery({
    queryKey: ['newTeamConfig'],
    queryFn: getMyTeamConfigs,
    refetchOnWindowFocus: false,
  });

  const { data: currencySymbolData } = useQuery({
    queryKey: ['newTeamCurrencySymbol'],
    queryFn: getCurrencySymbol,
    refetchOnWindowFocus: false,
  });

  const config: MyTeamConfig = configData?.data?.value || DEFAULT_CONFIG;
  const defaultCurrencySymbol: string = currencySymbolData?.data?.value || '';

  useEffect(() => {
    if (debouncedSearchText.length === 0 && rows.length > 0) {
      setSearchSourceRows(rows);
    }
  }, [rows, debouncedSearchText]);

  const normalizedSearchQuery = debouncedSearchText.toLowerCase();

  const fuzzyScore = (target: string, query: string): number => {
    if (!target || !query) return 0;
    const normalizedTarget = target.toLowerCase().trim();
    const normalizedQuery = query.toLowerCase().trim();
    if (!normalizedTarget || !normalizedQuery) return 0;
    if (normalizedTarget === normalizedQuery) return 120;
    if (normalizedTarget.startsWith(normalizedQuery)) return 80;
    if (normalizedTarget.includes(normalizedQuery)) return 55;

    let qIdx = 0;
    for (let tIdx = 0; tIdx < normalizedTarget.length && qIdx < normalizedQuery.length; tIdx += 1) {
      if (normalizedTarget[tIdx] === normalizedQuery[qIdx]) {
        qIdx += 1;
      }
    }
    return qIdx === normalizedQuery.length ? 25 : 0;
  };

  const getSearchTypeScores = (rowList: TeamRow[], query: string): { person: number; account: number } => {
    let person = 0;
    let account = 0;

    const visit = (list: TeamRow[]) => {
      for (const row of list) {
        if (row.rowType === 'user') {
          person = Math.max(person, fuzzyScore(row.name || '', query));
        } else {
          account = Math.max(account, fuzzyScore(row.name || '', query));
        }

        if (row.subRows?.length) {
          visit(row.subRows);
        }
      }
    };

    visit(rowList);
    return { person, account };
  };

  const resolvedSearchMode = useMemo<'person' | 'account' | undefined>(() => {
    if (!normalizedSearchQuery) {
      return undefined;
    }

    const sourceRows = searchSourceRows.length > 0 ? searchSourceRows : rows;
    const scores = getSearchTypeScores(sourceRows, normalizedSearchQuery);
    if (scores.person === 0 && scores.account === 0) {
      return 'account';
    }
    return scores.person >= scores.account ? 'person' : 'account';
  }, [normalizedSearchQuery, searchSourceRows, rows]);

  const { data: hierarchyResponse, isLoading } = useQuery({
    queryKey: ['newTeamHierarchy', userId, duration, debouncedSearchText, resolvedSearchMode],
    queryFn: () =>
      fetchMyTeamHierarchyData(
        userId,
        duration,
        debouncedSearchText || undefined,
        resolvedSearchMode,
      ),
    enabled: Boolean(userId) && snapshotChecked,
    refetchOnWindowFocus: false,
  });

  const rootClientCurrency = hierarchyResponse?.data?.data?.root?.client_currency;
  const defaultCurrency: string = rootClientCurrency?.currency || '';
  const resolvedCurrencySymbol: string = rootClientCurrency?.currency_symbol || defaultCurrencySymbol;

  const userFirstName = userHierarchyData?.data?.first_name
    || hierarchyResponse?.data?.data?.root?.user?.first_name
    || '';

  const customerMutation = useMutation({
    mutationFn: (payload: {
      directAssignedCustomers: DirectAssignedCustomer[];
      duration: DurationOption;
    }) => fetchMyTeamCustomersData(payload.directAssignedCustomers, payload.duration),
  });

  const opportunityScopeMutation = useMutation<
    { data?: { data?: number[] } },
    unknown,
    {
      userId?: string;
      customerIds?: number[];
      directAssignedCustomers?: DirectAssignedCustomer[];
    }
  >({
    mutationFn: (payload: {
      userId?: string;
      customerIds?: number[];
      directAssignedCustomers?: DirectAssignedCustomer[];
    }) => fetchMyTeamOpportunityScopeCustomerIds(payload),
  });

  useEffect(() => {
    setIsTableReady(false);
  }, [userId, duration]);

  useEffect(() => {
    if (!tableStateStorageKey) {
      setHasFreshSnapshot(false);
      setSnapshotChecked(true);
      return;
    }

    setHasFreshSnapshot(false);
    setSnapshotChecked(false);

    try {
      const saved = localStorage.getItem(tableStateStorageKey);
      if (!saved) {
        setHasFreshSnapshot(false);
        setSnapshotChecked(true);
        return;
      }

      const parsed = JSON.parse(saved) as {
        rows?: TeamRow[];
        expanded?: ExpandedState;
        savedAt?: number;
      };

      const savedAt = Number(parsed?.savedAt);
      const isFresh = Number.isFinite(savedAt)
        ? Date.now() - savedAt <= MY_TEAM_STORAGE_TTL_MS
        : false;

      if (!isFresh) {
        localStorage.removeItem(tableStateStorageKey);
        setHasFreshSnapshot(false);
        setSnapshotChecked(true);
        return;
      }

      if (Array.isArray(parsed?.rows) && parsed.rows.length > 0) {
        setRows(parsed.rows);
        setExpanded(parsed.expanded && typeof parsed.expanded === 'object' ? parsed.expanded : {});
        setLoadingRowIds({});
        setIsTableReady(true);
        setHasFreshSnapshot(true);
      } else {
        localStorage.removeItem(tableStateStorageKey);
        setHasFreshSnapshot(false);
      }
    } catch {
      // ignore localStorage errors
      setHasFreshSnapshot(false);
    } finally {
      setSnapshotChecked(true);
    }
  }, [tableStateStorageKey]);

  useEffect(() => {
    if (!hierarchyResponse) {
      return;
    }

    if (debouncedSearchText.length === 0 && restoredFromSearchRef.current) {
      restoredFromSearchRef.current = false;
      setLoadingRowIds({});
      setIsTableReady(true);
      return;
    }

    const hierarchyData = hierarchyResponse?.data?.data;
    if (!hierarchyData?.root) {
      setRows([]);
      setExpanded({});
      setLoadingRowIds({});
      setIsTableReady(true);
      return;
    }

    const rootId = `user-${hierarchyData.root.user._id}`;
    const rootDirectCustomers = hierarchyData.root.direct_assigned_customers || [];
    const subordinateRows: TeamRow[] = toUserRows(hierarchyData.direct_subordinates || [], rootId);
    const rootCustomerRows: TeamRow[] = toCustomerRows(rootDirectCustomers, rootId);

    const rootRow: TeamRow = {
      id: rootId,
      rowType: 'user',
      name: getFullName(hierarchyData.root.user.first_name, hierarchyData.root.user.last_name),
      user: hierarchyData.root.user,
      aggregate: hierarchyData.root.total_customer_details_aggregate,
      directAssignedCustomers: rootDirectCustomers,
      hierarchyLoaded: true,
      customersLoaded: true,
      subRows: [...rootCustomerRows, ...subordinateRows],
    };

    setRows([rootRow]);
    setLoadingRowIds({});

    if (debouncedSearchText.length > 0) {
      const expandedState: ExpandedState = {};
      const normalizedQuery = debouncedSearchText.toLowerCase();
      const isPersonSearch = resolvedSearchMode === 'person';

      const collectExpandedIds = (rowList: TeamRow[]) => {
        for (const row of rowList) {
          const hasChildren = Array.isArray(row.subRows) && row.subRows.length > 0;
          const isMatchedPerson =
            isPersonSearch
            && row.rowType === 'user'
            && row.name.toLowerCase().includes(normalizedQuery);

          if (row.rowType === 'user' && hasChildren && !isMatchedPerson) {
            expandedState[row.id] = true;
          }
          if (row.subRows?.length) {
            collectExpandedIds(row.subRows);
          }
        }
      };
      collectExpandedIds([rootRow]);
      setExpanded(expandedState);
    } else if (!expandedHydratedRef.current) {
      // Hydrate non-search expanded state only once per context to avoid overriding user toggles repeatedly.
      let restoredExpanded: ExpandedState = { [rootId]: true };
      try {
        const saved = expandedStorageKey ? localStorage.getItem(expandedStorageKey) : null;
        if (saved) {
          const parsed = JSON.parse(saved) as { expanded?: ExpandedState; savedAt?: number } | ExpandedState;
          const savedAt = Number((parsed as { savedAt?: number })?.savedAt);
          const isFresh = Number.isFinite(savedAt)
            ? Date.now() - savedAt <= MY_TEAM_STORAGE_TTL_MS
            : false;

          if (!isFresh) {
            localStorage.removeItem(expandedStorageKey);
          } else {
            const expandedFromStorage = (parsed as { expanded?: ExpandedState })?.expanded
              ?? (parsed as ExpandedState);
            if (expandedFromStorage && typeof expandedFromStorage === 'object') {
              restoredExpanded = { ...expandedFromStorage, [rootId]: true };
            }
          }
        }
      } catch {
        // ignore localStorage errors
      }
      setExpanded(restoredExpanded);
      expandedHydratedRef.current = true;
    }

    setIsTableReady(true);
  }, [hierarchyResponse, expandedStorageKey, debouncedSearchText, hasFreshSnapshot, resolvedSearchMode]);

  const handleExpandRow = async (row: TeamRow, willExpand: boolean) => {
    if (!willExpand) return;
    if (row.rowType !== 'user') return;
    if (row.hierarchyLoaded && row.customersLoaded) return;

    if (!row.user?._id) {
      return;
    }

    setLoadingRowIds((prev) => ({ ...prev, [row.id]: true }));

    try {
      const hierarchyRes = row.hierarchyLoaded
        ? null
        : await fetchMyTeamHierarchyData(row.user._id, duration);

      const hierarchyData = hierarchyRes?.data?.data;
      const effectiveDirectAssignedCustomers = hierarchyData?.root?.direct_assigned_customers
        || row.directAssignedCustomers
        || [];

      const customerRes = row.customersLoaded || !effectiveDirectAssignedCustomers.length
        ? null
        : await customerMutation.mutateAsync({
            directAssignedCustomers: effectiveDirectAssignedCustomers,
            duration,
          });

      const childUserRows = hierarchyData?.direct_subordinates
        ? toUserRows(hierarchyData.direct_subordinates, row.id)
        : (row.subRows || []).filter((r) => r.rowType === 'user');

      const customers = Array.isArray(customerRes?.data?.data)
        ? customerRes.data.data
        : [];
      const customerRows = customerRes
        ? toCustomerRows(customers, row.id)
        : (row.subRows || []).filter((r) => r.rowType !== 'user');

      const nextSubRows = [...customerRows, ...childUserRows];
      const nextAggregate = hierarchyData?.root?.total_customer_details_aggregate
        ? hierarchyData.root.total_customer_details_aggregate
        : customerRes
        ? aggregateFromCustomers(customers)
        : row.aggregate;

      const nextDirectAssignedCustomers = hierarchyData?.root?.direct_assigned_customers
        ? hierarchyData.root.direct_assigned_customers
        : row.directAssignedCustomers;

      setRows((prev) =>
        updateRowById(prev, row.id, (target) => ({
          ...target,
          aggregate: nextAggregate,
          directAssignedCustomers: nextDirectAssignedCustomers,
          hierarchyLoaded: true,
          customersLoaded: true,
          subRows: nextSubRows,
        })),
      );
    } finally {
      setLoadingRowIds((prev) => ({ ...prev, [row.id]: false }));
    }
  };

  const handleOpenMetric = async (
    row: TeamRow,
    metricKey: 'opportunities' | 'open_signals' | 'task',
  ) => {
    const title = metricKey === 'opportunities'
      ? `Opportunities of ${row.name}`
      : metricKey === 'open_signals'
      ? `Open issues of ${row.name}`
      : `Tasks created for ${row.name}`;

    setDrawerTitle(title);
    setDrawerCustomerIds([]);
    setActiveDrawer(metricKey);

    const customerType: DirectAssignedCustomer['type'] =
      row.customer?.type === 'group' ? 'group' : 'customer';

    const payload: {
      userId?: string;
      customerIds?: number[];
      directAssignedCustomers?: DirectAssignedCustomer[];
    } = row.rowType === 'user'
      ? { userId: row.user?._id }
      : row.rowType === 'customer'
      ? {
          directAssignedCustomers: row.customer?.customer_id
            ? [{
                customer_id: row.customer.customer_id,
                type: customerType,
                children: Array.isArray(row.customer.children)
                  ? row.customer.children
                      .map((child) => Number(child.customer_id))
                      .filter((childId) => !Number.isNaN(childId))
                  : [],
              }]
            : [],
        }
      : {
          customerIds: row.customer?.customer_id ? [row.customer.customer_id] : [],
        };

    const response = await opportunityScopeMutation.mutateAsync(payload);
    const customerIds = Array.isArray(response?.data?.data)
      ? response.data.data.map((customerId: number) => Number(customerId)).filter((customerId: number) => !Number.isNaN(customerId))
      : [];

    setDrawerCustomerIds(customerIds);
  };

  const filteredRows = rows;

  if (isLoading || !isTableReady) {
    return <Loading />;
  }

  return (
    <div className="py-4 pl-14 ">
      <TeamToolbar
        duration={duration}
        onDurationChange={setDuration}
        userFirstName={userFirstName}
        searchText={searchText}
        onSearchChange={setSearchText}
      />

      <TeamTable
        rows={filteredRows}
        config={config}
        defaultCurrencySymbol={resolvedCurrencySymbol}
        defaultCurrency={defaultCurrency}
        expanded={expanded}
        onExpandedChange={setExpanded}
        onExpandRow={handleExpandRow}
        loadingRowIds={loadingRowIds}
        onOpenMetric={handleOpenMetric}
        lastVisitedCustomerId={lastVisitedCustomerId}
        onCustomerNavigate={(customerId) => {
          if (lastVisitedCustomerStorageKey) {
            sessionStorage.setItem(lastVisitedCustomerStorageKey, String(customerId));
          }
        }}
        searchQuery={debouncedSearchText}
        onLastVisitedCustomerHandled={() => {
          if (lastVisitedCustomerStorageKey) {
            sessionStorage.removeItem(lastVisitedCustomerStorageKey);
          }
          setLastVisitedCustomerId(null);
        }}
      />

      <TeamMetricDrawer
        metricKey={activeDrawer}
        isOpen={activeDrawer !== null}
        onClose={() => {
          setActiveDrawer(null);
          setDrawerCustomerIds([]);
        }}
        title={drawerTitle}
        customerIds={drawerCustomerIds}
        isScopeLoading={opportunityScopeMutation.isPending}
      />
    </div>
  );
};

export default NewTeamPage;
