import dayjs from 'dayjs';
import CustomerGridView from './CustomerGridView';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import { getTreemap } from './tree-reactangle';
import Link from 'next/link';
import { formatRevenue } from '../../../../common/SupportFunctions';
import React, {
  useMemo,
  useState,
  useCallback,
  startTransition,
  useDeferredValue,
  memo,
  useEffect,
} from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../../../../common/api-request';
import {
  getAllAttributeConfig,
  getCustomer360Configs,
} from '../../../api/customers/customers';
import {
  CustomerStarredFillIcon,
  ReactivateSvgIcon,
} from '../../../assests/icons/icons';
import { useUpdateEventInEventJourney } from '../../../../services/mutations/customersMutations';
import { toast } from 'react-toastify';
import SignalDetails from '../[id]/journey/signalDetails';
import DeleteModal from '../../../../common/components/DeleteModal';
import CustomersAdvancedFilter from './customersAdvancedFilters';

// Memoized TreemapItem component to prevent unnecessary re-renders
const TreemapItem = memo(
  ({
    rectangle,
    isSelected,
    onClick,
  }: {
    rectangle: any;
    isSelected: boolean;
    onClick: () => void;
  }) => {
    const backgroundColor = isSelected ? rectangle.data.color : '#F2F4F7';
    const paddingPx = rectangle.width > 40 && rectangle.height > 40 ? 12 : 0;
    const totalArea = totalWidth * totalHeight;
    const percentageArea =
      totalArea > 0
        ? Math.round(((rectangle.width * rectangle.height) / totalArea) * 100)
        : 0;
    return (
      <Tippy
        content={
          <div className="flex items-center justify-between p-[4px] bg-white">
            <div className="flex">
              {rectangle?.data?.is_starred && (
                <CustomerStarredFillIcon className="inline w-5 h-5 text-[#3B82F6] transition-colors flex-shrink-0 mt-0.5" />
              )}
              <div>
                <h2 className="text-[16px] font-[400] text-gray-900">
                  {rectangle.data.customerName}
                </h2>
                <p className="text-[12px] font-[400] text-gray-600">
                  {rectangle?.data?.sort_by === 'nrr' &&
                  typeof rectangle?.data?.[rectangle?.data?.sort_by] ===
                    'number'
                    ? Number(
                        rectangle?.data?.[rectangle?.data?.sort_by] ?? 0
                      ) !== 0
                      ? `${Number(
                          rectangle?.data?.[rectangle?.data?.sort_by] ?? 0
                        ).toFixed(2)}%`
                      : '0'
                    : formatRevenue(
                        rectangle.data[rectangle.data.sort_by],
                        rectangle?.data?.client_currency?.currency
                      )}{' '}
                  {rectangle.data.display_name}
                </p>
                <p className="text-[12px] font-[400] text-gray-600">
                  {rectangle.data.renewal_date}
                </p>
              </div>
            </div>
            <div className="flex flex-nowrap text-nowrap">
              <Link
                href={`/app/customers/${rectangle.data.customer_id}?activeTab=view`}
                className="px-4 py-2 ml-[12px] text-white text-[14px] bg-[#3B82F6] rounded-[4px]"
              >
                360° view
              </Link>
            </div>
          </div>
        }
        interactive={true}
        placement="top"
        theme="transparent"
        appendTo={() => document.body}
      >
        <div
          onClick={onClick}
          style={{
            position: 'absolute',
            left: rectangle.x + 'px',
            top: rectangle.y + 'px',
            width: rectangle.width + 'px',
            height: rectangle.height + 'px',
            boxSizing: 'border-box',
            backgroundColor: backgroundColor,
            color: 'white',
            border: '1px solid white',
            padding: paddingPx + 'px',
            display: 'flex',
            flexDirection: 'column',
          }}
          className="rounded-md cursor-pointer overflow-hidden"
        >
          {rectangle.width > 80 && rectangle.height > 75 ? (
            <>
              <span className="font-[500] text-[16px] w-full text text-[#202B37] overflow-hidden text-nowrap text-ellipsis">
                {rectangle.data.customerName}
              </span>
              <div className="flex-grow"></div>
              {rectangle.data[rectangle.data.sort_by] !== 0 &&
                rectangle.data[rectangle.data.sort_by] && (
                  <div className="text-[12px] font-[400] mb-[0px] text-[#6B7280]">
                    {rectangle?.data?.sort_by === 'nrr' &&
                    typeof rectangle?.data?.[rectangle?.data?.sort_by] ===
                      'number'
                      ? `${Number(
                          rectangle?.data?.[rectangle?.data?.sort_by] ?? 0
                        ).toFixed(2)}%`
                      : formatRevenue(
                          rectangle.data[rectangle.data.sort_by],
                          rectangle?.data?.client_currency?.currency
                        )}{' '}
                    {/* {rectangle.data.display_name} */}
                    {percentageArea > 0 && `(${percentageArea}%)`}
                  </div>
                )}
            </>
          ) : null}
        </div>
      </Tippy>
    );
  }
);

TreemapItem.displayName = 'TreemapItem';

// Interface for attribute filter - supports different data types
export interface AttributeFilter {
  attributeId: string;
  dataType: 'integer' | 'float' | 'string' | 'list' | 'boolean' | 'date';
  // For integer/float: range values
  rangeFrom?: number;
  rangeTo?: number;
  // For list: selected options
  selectedOptions?: Set<string>;
  // For boolean: selected values (true/false)
  booleanValue?: { true: boolean; false: boolean };
  // For string: search text (case insensitive match)
  searchText?: string;
  // For date: date range
  dateFrom?: Date | null;
  dateTo?: Date | null;
  // Flag to include customers with missing attribute value
  includeMissing: boolean;
  // Flag to indicate if this filter has been modified from default
  isApplied: boolean;
}

// Interface for pillar config from API
export interface PillarConfig {
  enabled: boolean;
  display_name: string;
  order: number;
}

// Interface for pillar status filter - OR condition within pillar
export interface PillarStatusFilter {
  pillarKey: string; // Key from config (e.g., 'Adoption', 'NPS', 'Impact')
  displayName: string;
  selectedStatuses: Set<string>; // Selected statuses: 'red', 'yellow', 'green', 'grey'
  includeMissing: boolean; // Include customers without this pillar status
  isApplied: boolean; // Whether this filter has been modified
}

// Interface for advanced filters
export interface AdvancedFiltersState {
  starredFilter: { starred: boolean; notStarred: boolean };
  openIssuesRange: { from: number | undefined; to: number | undefined };
  criticalIssuesRange: { from: number | undefined; to: number | undefined };
  arrRange: { from: number | undefined; to: number | undefined };
  selectedUserIds: Set<string>;
  selectedSegmentIds: Set<string>;
  // Flags for including customers with missing data
  includeCustomersWithNoSegment: boolean;
  includeCustomersWithNoAssignedUser: boolean;
  // Flag to indicate if filters have been modified (for strict filtering)
  isFiltersApplied: boolean;
  // Dynamic attribute filters - keyed by attribute ID
  attributeFilters: Map<string, AttributeFilter>;
  // Pillar status filters - keyed by pillar key (AND between pillars, OR within each pillar)
  pillarFilters: Map<string, PillarStatusFilter>;
  // Toggle to show/hide accounts with zero values for the sort criteria
  showZeroValues: boolean;
}

// Default state where all filters are "allow all"
const getDefaultAdvancedFilters = (): AdvancedFiltersState => ({
  starredFilter: { starred: true, notStarred: true },
  openIssuesRange: { from: undefined, to: undefined },
  criticalIssuesRange: { from: undefined, to: undefined },
  arrRange: { from: undefined, to: undefined },
  selectedUserIds: new Set<string>(),
  selectedSegmentIds: new Set<string>(),
  includeCustomersWithNoSegment: true,
  includeCustomersWithNoAssignedUser: true,
  isFiltersApplied: false,
  attributeFilters: new Map<string, AttributeFilter>(),
  pillarFilters: new Map<string, PillarStatusFilter>(),
  showZeroValues: false, // By default, hide accounts with zero values
});

type TreeMapChart2Props = {
  data: any[];
  highestOpenSignal: number;
  highestCriticalSignal: number;
  highestArr: number;
  setSelectedCustomers: any;
  selectedCustomers: any;
};

let totalWidth = 1172;
let totalHeight = 282;

// LocalStorage helper functions
const getLocalStorage = (name: string): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(name);
};

const setLocalStorage = (name: string, value: string) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(name, value);
};

export default function TreeMapChart2({
  data,
  highestOpenSignal,
  highestCriticalSignal,
  highestArr,
  setSelectedCustomers,
  selectedCustomers,
}: TreeMapChart2Props) {
  const [accounts, setAccounts] = useState('allAccounts');
  const [searchText, setSearchText] = useState('');

  // Initialize isOn from localStorage, default to false
  const [isOn, setIsOn] = useState(() => {
    const savedValue = getLocalStorage('isGroup');
    return savedValue === null || savedValue === ''
      ? false
      : savedValue === 'true';
  });
  const [isSignalDrawerOpen, setIsSignalDrawerOpen] = useState(false);
  const [selectedSignalId, setSelectedSignalId] = useState<string>('');
  const [deleteModal, setDeleteModal] = useState(false);

  const [advancedFiltersOn, setAdvancedFiltersOn] = useState(false);

  // Local state for show zero values toggle (displayed above treemap)
  const [showZeroValues, setShowZeroValues] = useState(false);

  // Advanced filters state - applied when user clicks "Apply filter"
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFiltersState>(
    getDefaultAdvancedFilters
  );

  // Reset key to trigger reset in child components
  const [resetKey, setResetKey] = useState(0);

  // Callback to apply filters from CustomersAdvancedFilter
  const handleApplyAdvancedFilters = useCallback(
    (filters: AdvancedFiltersState) => {
      startTransition(() => {
        setAdvancedFilters(filters);
      });
    },
    []
  );

  const setFiltersBackToDefault = useCallback(() => {
    startTransition(() => {
      setAccounts('allAccounts');
      setIsOn(false);
      setLocalStorage('isGroup', 'false');
      setAdvancedFiltersOn(false);
      setSearchText('');
      setAdvancedFilters(getDefaultAdvancedFilters());
      setSelectedCustomers([]);
      setShowZeroValues(false); // Reset show zero values toggle
      setResetKey((prev) => prev + 1); // Trigger reset in child components
    });
  }, [setSelectedCustomers]);

  const { data: config } = useQuery({
    queryKey: ['customer360Config'],
    queryFn: () => getCustomer360Configs(),
    refetchOnWindowFocus: false,
  });
  const { data: attributesConfig } = useQuery({
    queryKey: ['customersAttributesConfig'],
    queryFn: () => getAllAttributeConfig('account'),
    refetchOnWindowFocus: false,
  });

  const scale =
    data[0]?.treemap_scale?.toUpperCase() === 'LINEAR' ? 'LINEAR' : 'LOG';

  const { data: userinfo } = useQuery({
    queryKey: ['userDetails'],
    queryFn: () =>
      apiRequest({
        url: '/api/app-service/v1/userinfo?is_email_encrypt=true',
      }),
  });

  function getRenewalMessage(renewalDate: string | null | undefined): string {
    if (!renewalDate) {
      return '';
    }

    const parsedDate = dayjs(renewalDate, 'DD-MMM-YY');
    if (!parsedDate.isValid()) {
      return '';
    }
    const today = dayjs().startOf('day');
    const renewalDateStartOfDay = parsedDate.startOf('day');
    const daysUntilRenewal = renewalDateStartOfDay.diff(today, 'day');
    if (daysUntilRenewal === 0) {
      return 'Renewal is today';
    } else if (daysUntilRenewal === 1) {
      return 'Renewal is tomorrow';
    } else if (daysUntilRenewal > 1) {
      return `Renewal in ${daysUntilRenewal} days`;
    } else {
      return '';
    }
  }
  let minNonZeroValue: any = null;
  const hasChurnedAccounts =
    data?.length > 0 && data.some((cust: any) => cust?.is_active === false);
  if (data?.length > 0) {
    minNonZeroValue = data?.reduce((min: any, item: any) => {
      // Use the new API response structure: metric_value instead of customer_metric.value
      const value = item?.metric_value ?? item?.customer_metric?.value;
      return value > 0 && value < min ? value : min;
    }, Infinity);
  }

  // minNonZeroValue = Number.isFinite(minNonZeroValue)
  //   ? minNonZeroValue / 2
  //   : Math.E;

  const handleClick = useCallback(
    (customerId: string) => {
      startTransition(() => {
        if (selectedCustomers.includes(customerId)) {
          setSelectedCustomers(
            selectedCustomers.filter((id: any) => id !== customerId)
          );
        } else {
          setSelectedCustomers([...selectedCustomers, customerId]);
        }
      });
    },
    [selectedCustomers, setSelectedCustomers]
  );

  // Helper function to check if a customer passes advanced filters
  // This is extracted to be reusable for filtering both main customers and associated customers
  const checkAdvancedFilters = useCallback(
    (ele: any): boolean => {
      const {
        starredFilter,
        openIssuesRange,
        criticalIssuesRange,
        selectedUserIds,
        selectedSegmentIds,
        includeCustomersWithNoSegment,
        includeCustomersWithNoAssignedUser,
        isFiltersApplied,
      } = advancedFilters;

      // Check if starred filter should be applied
      const hasStarredFilter = !(
        starredFilter.starred && starredFilter.notStarred
      );

      // Check if range filters should be applied
      const hasOpenIssuesFilter =
        openIssuesRange.from !== undefined || openIssuesRange.to !== undefined;
      const hasCriticalIssuesFilter =
        criticalIssuesRange.from !== undefined ||
        criticalIssuesRange.to !== undefined;

      // For user and segment filters - apply strict filtering when filters have been applied
      const hasUserFilter =
        isFiltersApplied &&
        (selectedUserIds.size > 0 || includeCustomersWithNoAssignedUser);
      const hasSegmentFilter =
        isFiltersApplied &&
        (selectedSegmentIds.size > 0 || includeCustomersWithNoSegment);

      // If filters applied but nothing is selected at all for users/segments, show empty
      const noUserSelectionAtAll =
        isFiltersApplied &&
        selectedUserIds.size === 0 &&
        !includeCustomersWithNoAssignedUser;
      const noSegmentSelectionAtAll =
        isFiltersApplied &&
        selectedSegmentIds.size === 0 &&
        !includeCustomersWithNoSegment;

      // If nothing selected in starred (both false), show empty
      const noStarredSelection =
        !starredFilter.starred && !starredFilter.notStarred;

      // Early exit if nothing is selected in critical filters
      if (
        noStarredSelection ||
        noUserSelectionAtAll ||
        noSegmentSelectionAtAll
      ) {
        return false;
      }

      // Filter by starred (advanced filter)
      if (hasStarredFilter) {
        const isStarred = ele?.is_starred === true;
        if (starredFilter.starred && !starredFilter.notStarred && !isStarred) {
          return false;
        }
        if (!starredFilter.starred && starredFilter.notStarred && isStarred) {
          return false;
        }
        if (!starredFilter.starred && !starredFilter.notStarred) {
          return false;
        }
      }

      // Filter by open issues range
      if (hasOpenIssuesFilter) {
        const openSignals = ele?.signals?.open_signals ?? 0;
        if (
          openIssuesRange.from !== undefined &&
          openSignals < openIssuesRange.from
        ) {
          return false;
        }
        if (
          openIssuesRange.to !== undefined &&
          openSignals > openIssuesRange.to
        ) {
          return false;
        }
      }

      // Filter by critical issues range
      if (hasCriticalIssuesFilter) {
        const criticalIssues = ele?.signals?.critical_issues ?? 0;
        if (
          criticalIssuesRange.from !== undefined &&
          criticalIssues < criticalIssuesRange.from
        ) {
          return false;
        }
        if (
          criticalIssuesRange.to !== undefined &&
          criticalIssues > criticalIssuesRange.to
        ) {
          return false;
        }
      }

      // Filter by ARR range
      const hasArrFilter =
        advancedFilters.arrRange.from !== undefined ||
        advancedFilters.arrRange.to !== undefined;
      if (hasArrFilter) {
        const customerArr = ele?.metric_value ?? ele?.customer_metric?.value ?? ele?.arr ?? 0;
        if (
          advancedFilters.arrRange.from !== undefined &&
          customerArr < advancedFilters.arrRange.from
        ) {
          return false;
        }
        if (
          advancedFilters.arrRange.to !== undefined &&
          customerArr > advancedFilters.arrRange.to
        ) {
          return false;
        }
      }

      // Filter by assigned users
      if (hasUserFilter) {
        const customerUsers = ele?.users ?? [];
        const hasNoAssignedUser = customerUsers.length === 0;

        if (hasNoAssignedUser && includeCustomersWithNoAssignedUser) {
          // Customer passes this filter
        } else if (hasNoAssignedUser && !includeCustomersWithNoAssignedUser) {
          return false;
        } else {
          const hasMatchingUser = customerUsers.some((user: any) =>
            selectedUserIds.has(user?.user_id)
          );
          if (!hasMatchingUser) {
            return false;
          }
        }
      }

      // Filter by segments
      if (hasSegmentFilter) {
        const customerSegmentId = ele?.customer_segment?._id;
        const hasNoSegment = !customerSegmentId;

        if (hasNoSegment && includeCustomersWithNoSegment) {
          // Customer passes this filter
        } else if (hasNoSegment && !includeCustomersWithNoSegment) {
          return false;
        } else {
          if (!selectedSegmentIds.has(customerSegmentId)) {
            return false;
          }
        }
      }

      // Filter by dynamic attributes
      if (advancedFilters.attributeFilters.size > 0) {
        const customerAttributes = ele?.attributes ?? {};

        for (const [attributeId, filter] of advancedFilters.attributeFilters) {
          if (!filter.isApplied) continue;

          const attributeValue = customerAttributes[attributeId];
          const hasNoValue =
            attributeValue === undefined ||
            attributeValue === null ||
            attributeValue === '';

          if (hasNoValue) {
            if (filter.dataType === 'list' || filter.dataType === 'boolean') {
              if (filter.includeMissing) {
                continue;
              } else {
                return false;
              }
            } else {
              return false;
            }
          }

          switch (filter.dataType) {
            case 'integer':
            case 'float': {
              const numValue = Number(attributeValue);
              if (isNaN(numValue)) {
                return false;
              }
              if (
                filter.rangeFrom !== undefined &&
                numValue < filter.rangeFrom
              ) {
                return false;
              }
              if (filter.rangeTo !== undefined && numValue > filter.rangeTo) {
                return false;
              }
              break;
            }

            case 'list': {
              if (
                !filter.selectedOptions ||
                filter.selectedOptions.size === 0
              ) {
                return false;
              }
              const valueArray = Array.isArray(attributeValue)
                ? attributeValue
                : [attributeValue];
              const hasMatch = valueArray.some((val: string) =>
                filter.selectedOptions!.has(val)
              );
              if (!hasMatch) {
                return false;
              }
              break;
            }

            case 'boolean': {
              if (!filter.booleanValue) continue;
              const boolVal =
                attributeValue === true || attributeValue === 'true';
              if (boolVal && !filter.booleanValue.true) {
                return false;
              }
              if (!boolVal && !filter.booleanValue.false) {
                return false;
              }
              break;
            }

            case 'string': {
              if (!filter.searchText) continue;
              const strValue = String(attributeValue).toLowerCase();
              const searchLower = filter.searchText.toLowerCase();
              if (!strValue.includes(searchLower)) {
                return false;
              }
              break;
            }

            case 'date': {
              if (!filter.dateFrom && !filter.dateTo) continue;
              const dateValue = new Date(attributeValue);
              if (isNaN(dateValue.getTime())) {
                return false;
              }
              if (filter.dateFrom && dateValue < filter.dateFrom) {
                return false;
              }
              if (filter.dateTo && dateValue > filter.dateTo) {
                return false;
              }
              break;
            }
          }
        }
      }

      // Filter by pillar statuses
      if (
        advancedFilters.pillarFilters &&
        advancedFilters.pillarFilters.size > 0
      ) {
        const customerPillarStatuses = ele?.pillar_statuses ?? [];

        for (const [pillarKey, filter] of advancedFilters.pillarFilters) {
          if (!filter.isApplied) continue;

          const pillarAltKey = pillarKey === 'Impact' ? 'Business' : pillarKey;
          const pillarStatus = customerPillarStatuses.find(
            (ps: any) => ps.pillar === pillarKey || ps.pillar === pillarAltKey
          );

          const hasNoStatus = !pillarStatus || !pillarStatus.status;

          if (hasNoStatus) {
            if (filter.selectedStatuses.has('grey')) {
              continue;
            } else {
              return false;
            }
          }

          const customerStatus = pillarStatus.status.toLowerCase();
          const normalizedStatus =
            customerStatus === 'gray' ||
            customerStatus === 'unknown' ||
            customerStatus === 'na' ||
            customerStatus === ''
              ? 'grey'
              : customerStatus;

          if (!filter.selectedStatuses.has(normalizedStatus)) {
            return false;
          }
        }
      }

      return true;
    },
    [advancedFilters]
  );

  // Memoize all filtering operations together for better performance
  const filterCustomers = useMemo(() => {
    const customerMap = new Map<number, any>();
    for (const customer of data) {
      customerMap.set(customer.customer_id, customer);
    }

    // Step 1: Apply advanced filters to ALL data first (before grouping)
    // This creates a set of customer IDs that pass advanced filters
    // NOTE: Churned customers (is_active === false) are excluded from advanced filters
    const advancedFilteredIds = new Set<number>();
    for (const customer of data) {
      // Skip advanced filters for churned customers - they always pass
      if (customer.is_active === false) {
        advancedFilteredIds.add(customer.customer_id);
        continue;
      }
      // Apply advanced filters only to active customers
      if (checkAdvancedFilters(customer)) {
        advancedFilteredIds.add(customer.customer_id);
      }
    }

    // Step 2: Handle grouping logic using only advanced-filtered customers
    let result: any[] = [];
    if (isOn) {
      for (const customer of customerMap.values()) {
        // Only include group customers that passed advanced filters
        if (
          customer.is_group &&
          advancedFilteredIds.has(customer.customer_id) &&
          (accounts === 'churnedAccounts'
            ? customer.is_active === false
            : customer.is_active === true)
        ) {
          // Filter associated customers: must pass advanced filters AND match active status
          const associated_customers = customer.associated_customer_ids
            .map((id: any) => customerMap.get(id))
            .filter((cust: any): cust is any => {
              if (!cust) return false;
              // Must pass advanced filters
              if (!advancedFilteredIds.has(cust.customer_id)) return false;
              // Must match active status
              if (customer.is_active) {
                return cust.is_active === true;
              } else {
                return cust.is_active === false;
              }
            });
          result.push({
            ...customer,
            associated_customers,
          });
        } else if (
          advancedFilteredIds.has(customer.customer_id) &&
          !Array.from(customerMap.values()).some(
            (c) =>
              c.is_group &&
              advancedFilteredIds.has(c.customer_id) &&
              (accounts === 'churnedAccounts'
                ? c.is_active === false
                : c.is_active === true) &&
              c.associated_customer_ids.includes(customer.customer_id)
          )
        ) {
          result.push(customer);
        }
      }
    } else {
      const groupAssociatedIds = new Set<number>();
      for (const customer of customerMap.values()) {
        if (customer.is_group) {
          for (const id of customer.associated_customer_ids) {
            groupAssociatedIds.add(id);
          }
        }
      }
      for (const customer of customerMap.values()) {
        // Only include customers that passed advanced filters
        if (!advancedFilteredIds.has(customer.customer_id)) continue;

        if (
          !customer.is_group &&
          groupAssociatedIds.has(customer.customer_id)
        ) {
          result.push(customer);
        } else if (
          !customer.is_group &&
          !groupAssociatedIds.has(customer.customer_id)
        ) {
          result.push(customer);
        }
      }
    }

    // Step 3: Apply account type and search filters (non-advanced filters)
    const lowerSearchText = searchText.toLowerCase();

    return result.filter((ele: any) => {
      // Filter by account type
      if (accounts === 'directAccounts') {
        if (
          !ele?.users?.some(
            (user: any) => user?.user_id === userinfo?.data?.id
          ) ||
          ele?.is_active !== true
        ) {
          return false;
        }
      } else if (accounts === 'allAccounts') {
        if (ele?.is_active !== true) {
          return false;
        }
      } else if (accounts === 'churnedAccounts') {
        if (ele?.is_active !== false) {
          return false;
        }
      }

      // Filter by search text
      if (searchText) {
        const nameMatch = ele?.customer_name
          ?.toLowerCase()
          .includes(lowerSearchText);
        const associatedMatch = ele?.associated_customers?.some(
          (customer: any) =>
            customer?.customer_name?.toLowerCase().includes(lowerSearchText)
        );
        if (!nameMatch && !associatedMatch) {
          return false;
        }
      }

      return true;
    });
  }, [
    isOn,
    data,
    accounts,
    searchText,
    userinfo?.data?.id,
    checkAdvancedFilters,
  ]);

  // Calculate minimum ARR value from data array for filter range
  const minArrValue = useMemo(() => {
    let minMetricValue = Number.MAX_VALUE;
    let hasZeroValues = false;
    let hasNonZeroValues = false;

    if (Array.isArray(data)) {
      for (const customer of data) {
        const metricValue = customer?.metric_value ?? customer?.customer_metric?.value ?? 0;
        
        // Track zero and non-zero values separately
        if (metricValue === 0) {
          hasZeroValues = true;
        } else {
          hasNonZeroValues = true;
          if (metricValue < minMetricValue) {
            minMetricValue = metricValue;
          }
        }
      }
    }

    // If there are zero ARR accounts, min should always be 0
    if (hasZeroValues) {
      return 0;
    } else if (minMetricValue === Number.MAX_VALUE) {
      return 0; // Fallback for edge cases
    }
    
    return minMetricValue;
  }, [data]);

  // Calculate actual highest signal values from filtered customers (what's actually displayed)
  const actualHighestValues = useMemo(() => {
    let maxOpenSignal = 0;
    let maxCriticalSignal = 0;

    if (Array.isArray(filterCustomers)) {
      for (const customer of filterCustomers) {
        const openSignals = customer?.signals?.open_signals || 0;
        const criticalIssues = customer?.signals?.critical_issues || 0;

        if (openSignals > maxOpenSignal) {
          maxOpenSignal = openSignals;
        }
        if (criticalIssues > maxCriticalSignal) {
          maxCriticalSignal = criticalIssues;
        }
      }
    }

    // Use API values directly for ARR, calculated values for signals
    return {
      openSignal: maxOpenSignal || highestOpenSignal,
      criticalSignal: maxCriticalSignal || highestCriticalSignal,
      arr: highestArr, // Use API value directly
      minArr: minArrValue, // Use calculated min from active customers only
    };
  }, [filterCustomers, highestOpenSignal, highestCriticalSignal, highestArr, minArrValue]);

  // Memoize table filter
  const filterCustomersForTable = useMemo(() => {
    if (selectedCustomers?.length === 0) {
      return filterCustomers;
    }
    return filterCustomers?.filter((ele: any) =>
      selectedCustomers?.includes(ele.customer_id)
    );
  }, [filterCustomers, selectedCustomers]);
  // Memoize elements calculation (sorting + mapping)
  const hasNonZeroValue = useMemo(() => {
    if (filterCustomers?.length === 0) return false;
    return filterCustomers.some((item: any) => item?.metric_value > 0);
  }, [filterCustomers]);

  // Check if financial filter should be disabled (all metric values are zero)
  const shouldDisableFinancialFilter = useMemo(() => {
    if (!Array.isArray(filterCustomers) || filterCustomers?.length === 0) return true;
    
    // Check if ALL customers have zero or null metric values
    const allZeroValues = filterCustomers.every((item: any) => {
      const metricValue = item?.metric_value ?? item?.customer_metric?.value ?? 0;
      return metricValue === 0 || metricValue === null || metricValue === undefined;
    });
    
    return allZeroValues;
  }, [filterCustomers]);

  const filteredCustomersWithNonZeroValue = useMemo(() => {
    if (!Array.isArray(filterCustomers) || filterCustomers?.length === 0)
      return [];
    if (!hasNonZeroValue) return filterCustomers;
    // Respect the showZeroValues toggle (local state above treemap)
    if (showZeroValues) {
      return filterCustomers.filter((item: any) => (item?.metric_value ?? 0) === 0); // Show only customers with zero values
    }
    return filterCustomers.filter((item: any) => item?.metric_value > 0);
  }, [filterCustomers, hasNonZeroValue, showZeroValues]);



  const elements = useMemo(() => {
    if (
      !Array.isArray(filteredCustomersWithNonZeroValue) ||
      !filteredCustomersWithNonZeroValue?.length
    )
      return [];

    const sortOrder =
      filteredCustomersWithNonZeroValue[0]?.metric_order ||
      filteredCustomersWithNonZeroValue[0]?.customer_metric?.order ||
      'desc';

    return [...filteredCustomersWithNonZeroValue]
      .sort((a: any, b: any) => {
        const aValue = a?.metric_value ?? a?.customer_metric?.value;
        const bValue = b?.metric_value ?? b?.customer_metric?.value;

        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        if (bValue !== aValue) {
          return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
        }
        const nameA = a?.customer_name?.toLowerCase() || '';
        const nameB = b?.customer_name?.toLowerCase() || '';
        return nameA.localeCompare(nameB);
      })
      .map((item: any) => {
        const filteredPillarStatuses =
          item?.pillar_statuses?.filter(
            (ele: any) => !(ele?.pillar === 'NPS')
          ) ?? [];
        const pillarStatuses = filteredPillarStatuses.map((ele: any) =>
          ele?.status?.toLowerCase()
        );

        const metricValue =
          item?.metric_value ?? item?.customer_metric?.value ?? 0;
        let valueForScaling = metricValue;
        if (scale === 'LINEAR') {
          if (Number.isFinite(minNonZeroValue)) {
            if (valueForScaling < minNonZeroValue) {
              valueForScaling = minNonZeroValue * 0.5;
            }
          } else {
            valueForScaling = 1;
          }
        } else {
          if (valueForScaling < 1) {
            valueForScaling = 1;
          }
          let logVal = Math.log(valueForScaling);

          if (Number.isFinite(minNonZeroValue) && minNonZeroValue > 1) {
            const minNonZeroValueLog = Math.log(minNonZeroValue);
            if (logVal < minNonZeroValueLog) {
              logVal = minNonZeroValueLog * 0.5;
            }
          } else {
            logVal = 1;
          }
          valueForScaling = Math.pow(logVal, 3);
        }
        const sortBy =
          item?.metric_sort_by ?? item?.customer_metric?.sort_by ?? 'arr';
        const displayName =
          item?.metric_display_name ??
          item?.customer_metric?.display_name ??
          '';
        const clientCurrency = item?.currency
          ? { currency: item?.currency, currencySymbol: item?.currency_symbol }
          : item?.client_currency;
        return {
          user_id: item?.user_id,
          customerName: item?.customer_name,
          is_starred: item?.is_starred,
          value: valueForScaling,
          [sortBy]: metricValue,
          sort_by: sortBy,
          display_name: displayName,
          renewal_date: getRenewalMessage(item?.renewal_date) || '',
          customer_id: item?.customer_id,
          client_currency: clientCurrency,
          color: pillarStatuses.includes('red')
            ? '#FCCFCF'
            : pillarStatuses.includes('yellow')
            ? '#FFEECC'
            : pillarStatuses.includes('green')
            ? '#D9F2E5'
            : '#F2F4F7',
        };
      });
  }, [filterCustomers, filteredCustomersWithNonZeroValue, minNonZeroValue]);

  // Memoize treemap calculation
  const rectangles = useMemo(() => {
    if (!elements?.length) return [];

    const rects = getTreemap({
      data: elements,
      width: totalWidth,
      height: totalHeight,
    });
    // const totalArea = totalWidth * totalHeight;
    // rects.forEach((r) => {
    //   const pct = ((r.width * r.height) / totalArea) * 100;
    //   console.log(`Treemap % | ${r.data.customerName}: ${pct}%`);
    // });
    return rects;
  }, [elements]);

  const toggle = useCallback(() => {
    startTransition(() => {
      setIsOn((prev) => {
        const newValue = !prev;
        setLocalStorage('isGroup', String(newValue));
        return newValue;
      });
    });
  }, []);

  // Set localStorage on page load if it doesn't exist
  useEffect(() => {
    const savedValue = getLocalStorage('isGroup');
    if (savedValue === null || savedValue === '') {
      setLocalStorage('isGroup', 'false');
    }
  }, []);

  const updateSignalMutation = useUpdateEventInEventJourney();

  const deleteToggle = useCallback(() => {
    setDeleteModal((prev) => !prev);
  }, []);
  const handleDelete = async () => {
    try {
      const response = await updateSignalMutation.mutateAsync({
        signalId: selectedSignalId,
        data: { is_deleted: true },
        fromPage: 'customers',
      });
      if (response && response.status === 200) {
        toast.success('Signal deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting signal:', error);
    }
    setIsSignalDrawerOpen(false);
    deleteToggle();
  };

  // Calculate sort metric info and toggle display logic
  const sortMetricInfo = useMemo(() => {
    if (!filterCustomers || filterCustomers.length === 0) {
      return { key: 'arr', displayName: 'ARR', showToggle: false };
    }

    const firstCustomer = filterCustomers[0];
    const sortBy = firstCustomer?.metric_sort_by ?? firstCustomer?.customer_metric?.sort_by ?? 'arr';
    const displayName = firstCustomer?.metric_display_name ?? firstCustomer?.customer_metric?.display_name ?? 'ARR';

    // Check if there are both zero and non-zero values
    const hasZeroValues = filterCustomers.some((c: any) => (c?.metric_value ?? 0) === 0);
    const hasNonZeroValues = filterCustomers.some((c: any) => (c?.metric_value ?? 0) > 0);
    const showToggle = hasZeroValues && hasNonZeroValues;

    return { key: sortBy, displayName, showToggle };
  }, [filterCustomers]);

  return (
    <div className="">
      <div
        className={`min-h-0 ${
          accounts !== 'churnedAccounts' ? 'h-lt-900:h-[400px]' : ''
        }`}
      >
        <div className="w-full flex justify-between items-center text-[18px] pt-[24px] font-[500] leading-[28px] text-[#141C24] h-lt-900:pt-[16px]">
          Overview of accounts you manage({sortMetricInfo.displayName ? `by ${sortMetricInfo.displayName}` : 'by ARR'})
          <div className="h-[32px] py-[2px] flex items-center gap-3">
            {data?.filter((ele: any) => ele?.is_group === true)?.length > 0 && (
              <div className="flex justify-center items-center gap-2">
                <button
                  onClick={toggle}
                  className={`w-[36px] h-[20px] flex items-center rounded-full p-[4px] transition-colors duration-300 ${
                    isOn ? 'bg-[#3B82F6]' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`bg-white w-[16px] h-[16px] rounded-full shadow-md transform transition-transform duration-300 bottom-[2px] ${
                      isOn ? 'translate-x-[12px]' : 'translate-x-0'
                    }`}
                  />
                </button>
                <span className="text-[14px] text-[#2A2928] font-medium">
                  Group customers
                </span>
              </div>
            )}
            <div className="flex items-center border border-[#CED2DA] rounded-[8px] overflow-hidden h-[32px] !min-w-[104px]">
              <div
                className={
                  accounts === 'directAccounts'
                    ? 'px-[16px] text-[12px] font-semibold text-[#344051] h-8 items-center flex border-[#CED2DA] bg-[#F2F4F7] cursor-pointer'
                    : 'bg-whitec px-[16px] text-[12px] font-semibold text-[#344051] h-8 items-center flex border-[#CED2DA] cursor-pointer'
                }
                onClick={() =>
                  startTransition(() => setAccounts('directAccounts'))
                }
              >
                Direct
              </div>
              <div
                className={
                  accounts === 'allAccounts'
                    ? 'px-[16px] h-8 items-center text-[12px] font-semibold text-[#344051] flex border-[#CED2DA] bg-[#F2F4F7] cursor-pointer border-l-[1px]'
                    : 'bg-whitec px-[16px] h-8 text-[12px] font-semibold text-[#344051] items-center flex border-[#CED2DA] cursor-pointer border-l-[1px]'
                }
                onClick={() =>
                  startTransition(() => setAccounts('allAccounts'))
                }
              >
                All
              </div>
              {hasChurnedAccounts && (
                <div
                  className={
                    accounts === 'churnedAccounts'
                      ? 'px-[16px] h-full items-center text-[12px] font-semibold text-[#344051] flex border-[#CED2DA] bg-[#F2F4F7] cursor-pointer border-l-[1px]'
                      : 'bg-whitec px-[16px] h-full text-[12px] font-semibold text-[#344051] items-center flex border-[#CED2DA] cursor-pointer border-l-[1px]'
                  }
                  onClick={() => {
                    startTransition(() => {
                      setAccounts('churnedAccounts');
                      setIsOn(false);
                    });
                  }}
                >
                  Churned
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => setAdvancedFiltersOn(!advancedFiltersOn)}
              className={`h-8 bg-white border-[1px]  ${
                !advancedFiltersOn ? ' border-[#CED2DA]' : 'border-gray-500'
              }    text-[#202B37]  px-3 rounded-[8px] text-[12px] font-medium box-border flex items-center justify-center`}
            >
              Filters
            </button>
            <button
              type="button"
              onClick={() => setFiltersBackToDefault()}
              className={`h-8 bg-white border-[1px] border-[#CED2DA] text-[#202B37] px-3 rounded-[8px] text-[12px] font-medium box-border flex items-center justify-center`}
            >
              <ReactivateSvgIcon className="w-4 h-4" stroke="#202B37" />
            </button>
          </div>
        </div>
        {!(accounts === 'churnedAccounts') && (
          <div className="w-full mt-[20px] h-lt-900:mt-[12px]">
            <div className="w-full p-[20px]  border border-gray-200 rounded-[12px] h-lt-900:p-[12px]">
              <div className="w-full flex justify-between items-center mb-[12px] h-lt-900:mb-[6px]">
                <h1 className="text-[14px] font-[400] leading-[20px] text-[#637083] pl-[5px]">
                  Accounts you manage ({sortMetricInfo.displayName ? `by ${sortMetricInfo.displayName}` : 'by ARR'})
                </h1>
                {sortMetricInfo.showToggle && (
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-[400] text-[#637083]">
                      Only accounts with Zero {sortMetricInfo.displayName}
                    </span>
                    <button
                      onClick={() => setShowZeroValues(prev => !prev)}
                      className={`w-[36px] h-[20px] flex items-center rounded-full p-[4px] transition-colors duration-300 ${
                        showZeroValues ? 'bg-[#3B82F6]' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`bg-white w-[12px] h-[12px] rounded-full shadow-md transform transition-transform duration-300 ${
                          showZeroValues ? 'translate-x-[16px]' : 'translate-x-0'
                        }`}
                      ></span>
                    </button>
                  </div>
                )}
              </div>

              <div
                className="relative"
                style={{ width: totalWidth + 'px', height: totalHeight + 'px' }}
              >
                {rectangles?.map((rectangle, index) => {
                  const isSelected =
                    selectedCustomers?.length === 0
                      ? true
                      : selectedCustomers?.includes(rectangle.data.customer_id);

                  return (
                    <TreemapItem
                      key={rectangle.data.customer_id}
                      rectangle={rectangle}
                      isSelected={isSelected}
                      onClick={() => handleClick(rectangle.data.customer_id)}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="mt-[40px]">
        <CustomerGridView
          data={filterCustomersForTable}
          userinfo={userinfo?.data}
          config={config?.data?.value}
          isOn={isOn}
          isSearch={true}
          searchText={searchText}
          setSearchText={setSearchText}
          setSelectedSignalId={setSelectedSignalId}
          setIsSignalDrawerOpen={setIsSignalDrawerOpen}
          resetKey={resetKey}
        />
      </div>
      <CustomersAdvancedFilter
        isOpen={advancedFiltersOn}
        onClose={() => setAdvancedFiltersOn(false)}
        userInfo={userinfo?.data}
        highestOpenSignal={actualHighestValues.openSignal}
        highestCriticalSignal={actualHighestValues.criticalSignal}
        highestArr={highestArr}
        minArr={actualHighestValues.minArr}
        onApply={handleApplyAdvancedFilters}
        currentFilters={advancedFilters}
        resetKey={resetKey}
        attributesConfig={attributesConfig?.data?.data ?? []}
        pillarConfig={config?.data?.value}
        sortMetricDisplayName={sortMetricInfo.displayName || 'ARR'}
        shouldDisableFinancialFilter={shouldDisableFinancialFilter}
      />
      <SignalDetails
        isOpen={isSignalDrawerOpen}
        onClose={() => {
          setIsSignalDrawerOpen(false);
          setSelectedSignalId('');
        }}
        signalId={selectedSignalId}
        handleDelete={deleteToggle}
        userInfo={userinfo?.data}
        fromPage="customers"
      />
      <DeleteModal
        show={deleteModal}
        onHide={deleteToggle}
        onDelete={handleDelete}
        title={'signal'}
      />
    </div>
  );
}
