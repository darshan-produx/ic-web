'use client';

import React, { useMemo, useState, Fragment, useCallback, useRef, useEffect } from 'react';
import { ColumnDef, Row, flexRender, useReactTable, getCoreRowModel, getSortedRowModel, getExpandedRowModel, ExpandedState, SortingState, SortingFn } from '@tanstack/react-table';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/light.css';
import { CustomerStarredFillIcon, SearchIconCustomerPage } from '../../../assests/icons/icons';
import { getExpressionSvgIcon } from '../[id]/journey/signalCard';
import { useDebounce } from '../../../../common/hooks/useDebounce';

// Types
interface PillarStatus {
  pillar: string;
  status: string;
}

interface ConfigValues {
  enabled: boolean;
  display_name: string;
  order: number;
}

interface CustomerUser {
  user_id: string;
  name?: string;
  user_first_name?: string;
  user_last_name?: string;
}

interface CustomerData {
  customer_id: number;
  customer_name: string;
  is_starred: boolean | null;
  is_group: boolean;
  is_active: boolean;
  associated_customer_ids: number[];
  associated_customers?: CustomerData[];
  pillar_statuses: PillarStatus[];
  users: CustomerUser[];
  signals?: {
    open_signals: number;
    critical_issues: number;
    one_signal?: any;
  };
  [key: string]: any;
}

interface CustomerGridViewProps {
  data: CustomerData[];
  config: Record<string, ConfigValues>;
  userinfo: any;
  setSelectedSignalId: (id: string) => void;
  setIsSignalDrawerOpen: (open: boolean) => void;
  searchText?: string;
  isSearch?: boolean;
  isOn?: boolean;
  setSearchText?: (text: string) => void;
  // isCustomer360Page?: boolean;
  isStarredOn?: boolean;
  resetKey?: number;
}

// Helper function to get pillar reference for navigation
const getPillarRef = (pillarName: string): string => {
  switch (pillarName) {
    case 'Adoption':
      return 'AdoptionRef';
    case 'Stakeholder':
      return 'StakeholderRef';
    case 'CustomerService':
      return 'CustomerServiceRef';
    case 'Impact':
      return 'ImpactRef';
    case 'Projects':
      return 'ProjectsRef';
    case 'Performance':
      return 'PerformanceRef';
    default:
      return '';
  }
};

// Helper function to get status class based on value
const getStatusClass = (value?: string): string => {
  switch (value?.toLowerCase()) {
    case 'green':
      return 'bg-[#D9F2E5] text-[#249782] justify-center';
    case 'yellow':
      return 'bg-[#FFEECC] text-[#EAB308] justify-center';
    case 'red':
      return 'bg-[#FCCFCF] text-[#EF4444] justify-center';
    default:
      return 'bg-[#F2F4F7] text-[#202B37] justify-center';
  }
};

// Helper function to get display text for status
const getStatusDisplayText = (status: string): string => {
  switch (status?.toLowerCase()) {
    case 'green':
      return 'Good';
    case 'yellow':
      return 'Average';
    case 'red':
      return 'Poor';
    default:
      return '-';
  }
};

// Helper function to format signal text
const getSignalText = (allOpen: number, critical: number): string => {
  if (allOpen === 0 && critical === 0) return ' - ';
  if (allOpen <= 0) return ' - ';
  if (critical <= 0) return `${allOpen}`;
  return allOpen === critical
    ? `${allOpen} critical`
    : `${allOpen} (${critical} critical)`;
};

// Helper function to get status sort priority
// Default ordering for ascending: green (1) -> yellow (2) -> red (3)
const getStatusSortValue = (status: string | null | undefined): number => {
  const normalizedStatus = status?.toLowerCase() || '';
  switch (normalizedStatus) {
    case 'green':
      return 1;
    case 'yellow':
      return 2;
    case 'red':
      return 3;
    case 'gray':
    case 'unknown':
    default:
      return 100; // Large value for gray/unknown
  }
};

// Helper function to check if a status is gray/unknown
const isGrayStatus = (status: string): boolean => {
  return status === 'gray' || status === 'unknown' || status === '';
};

// Helper function to get status for a pillar from customer data
const getStatusForPillar = (customer: CustomerData, pillarKey: string): string => {
  const pillarAlt = pillarKey === 'Impact' ? 'Business' : pillarKey;
  const statusObj = customer.pillar_statuses?.find(
    (status) => status.pillar === pillarKey || status.pillar === pillarAlt
  );
  return statusObj?.status?.toLowerCase() || 'unknown';
};

// Common sorting comparator for pillar statuses - gray always last regardless of sort direction
const comparePillarStatus = (
  statusA: string,
  statusB: string,
  isDesc: boolean
): number => {
  const aIsGray = isGrayStatus(statusA);
  const bIsGray = isGrayStatus(statusB);

  // Both gray - equal
  if (aIsGray && bIsGray) return 0;
  
  // Gray always goes to end, counter the desc reversal from TanStack
  if (aIsGray) return isDesc ? -1 : 1;
  if (bIsGray) return isDesc ? 1 : -1;

  // Normal status comparison: green(1) < yellow(2) < red(3)
  const valueA = getStatusSortValue(statusA);
  const valueB = getStatusSortValue(statusB);
  return valueA - valueB;
};

// Default sorting function for subcustomers: is_starred (desc) -> arr (desc) -> customer_name (asc)
const sortSubcustomersByDefault = (customers: CustomerData[]): CustomerData[] => {
  if (!customers || customers.length === 0) return customers;

  return [...customers].sort((a, b) => {
    // First level: is_starred (true first - descending)
    const starredA = a.is_starred === true ? 1 : 0;
    const starredB = b.is_starred === true ? 1 : 0;
    if (starredB !== starredA) return starredB - starredA;

    // Second level: arr (higher first - descending)
    const arrA = a.arr || 0;
    const arrB = b.arr || 0;
    if (arrB !== arrA) return arrB - arrA;

    // Third level: customer_name (alphabetical ascending)
    const nameA = (a.customer_name || '').toLowerCase();
    const nameB = (b.customer_name || '').toLowerCase();
    return nameA.localeCompare(nameB);
  });
};

// Common sorting function for customer data - used by both main table and sub-rows
const sortCustomersByColumn = (
  customers: CustomerData[],
  columnId: string,
  isDesc: boolean
): CustomerData[] => {
  if (!customers || customers.length === 0) return customers;

  return [...customers].sort((a, b) => {
    let comparison = 0;

    if (columnId === 'customer_name') {
      // Sort by customer name alphabetically
      const nameA = a.customer_name?.toLowerCase() || '';
      const nameB = b.customer_name?.toLowerCase() || '';
      comparison = nameA.localeCompare(nameB);
    } else if (columnId === 'OpenIssues') {
      // Sort by open signals count
      const countA = a.signals?.open_signals || 0;
      const countB = b.signals?.open_signals || 0;
      comparison = countA - countB;
    } else {
      // Sort by pillar status - gray always last
      const statusA = getStatusForPillar(a, columnId);
      const statusB = getStatusForPillar(b, columnId);
      
      // Use comparePillarStatus but handle desc ourselves since we're not in TanStack
      const aIsGray = isGrayStatus(statusA);
      const bIsGray = isGrayStatus(statusB);

      if (aIsGray && bIsGray) {
        comparison = 0;
      } else if (aIsGray) {
        // Gray always last - return positive to push A after B
        return 1;
      } else if (bIsGray) {
        // Gray always last - return negative to push B after A
        return -1;
      } else {
        // Normal status comparison
        const valueA = getStatusSortValue(statusA);
        const valueB = getStatusSortValue(statusB);
        comparison = valueA - valueB;
      }
    }

    // Apply descending order if needed (but not for gray which is already handled)
    return isDesc ? -comparison : comparison;
  });
};

// Search Header Component - Manages its own local state to avoid column re-renders
const SearchHeader = React.memo(({
  onSearchChange,
  isSearch,
  isTableOpen,
  setIsTableOpen,
  searchText,
  resetKey,
}: {
  onSearchChange?: (text: string) => void;
  isSearch?: boolean;
  isTableOpen: boolean;
  setIsTableOpen: (open: boolean) => void;
  searchText?: string;
  resetKey?: number;
}) => {
  const [localSearchText, setLocalSearchText] = useState('');
  const debouncedSearchText = useDebounce(localSearchText, 300);

  // Sync local state with parent searchText
  useEffect(() => {
    setLocalSearchText(searchText || '');
  }, [searchText]);

  // Reset local search text when resetKey changes
  useEffect(() => {
    if (resetKey !== undefined) {
      setLocalSearchText('');
    }
  }, [resetKey]);

  // Call onSearchChange when debounced value changes
  useEffect(() => {
    onSearchChange?.(debouncedSearchText);
  }, [debouncedSearchText, onSearchChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearchText(value);
  };

  if (isSearch) {
    return (
      <div className="relative xl:col-span-2 w-[150px]" onClick={(e) => e.stopPropagation()}>
        <input
          type="text"
          className="px-8 search form-input bg-[#F9FAFB] border-none focus:outline-none disabled:bg-slate-100 dark:disabled:bg-zink-600 disabled:border-slate-300 dark:disabled:border-zink-500 dark:disabled:text-zink-200 disabled:text-slate-500 dark:text-zink-100 dark:bg-zink-700 dark:focus:border-custom-800 placeholder:text-slate-400 dark:placeholder:text-zink-200"
          placeholder="Search "
          autoComplete="off"
          value={localSearchText}
          onChange={handleChange}
        />
        <div className="inline-block size-4 absolute left-2 top-2.5 text-slate-500 dark:text-zink-200 fill-slate-100 dark:fill-zink-600">
          <SearchIconCustomerPage />
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex xl:col-span-2 w-[150px] items-center px-[4px] gap-1 cursor-pointer"
      onClick={() => setIsTableOpen(!isTableOpen)}
    >
      <span>
        <ChevronDown
          className={`w-[18px] h-[18px] ${!isTableOpen ? 'rotate-180' : ''}`}
        />
      </span>
      Accounts
    </div>
  );
});

// Customer Name Cell Component - Memoized to prevent unnecessary re-renders
const CustomerNameCell = React.memo(({
  row,
  userinfo,
  isOn,
  setSelectedSignalId,
  setIsSignalDrawerOpen,
  isSubRow = false,
}: {
  row: CustomerData;
  userinfo: any;
  isOn?: boolean;
  setSelectedSignalId: (id: string) => void;
  setIsSignalDrawerOpen: (open: boolean) => void;
  isSubRow?: boolean;
}) => {
  const getUserName = (customer: CustomerData): string => {
    const users = customer?.users;
    const userCount = users?.length || 0;

    if (userCount > 1) {
      const isCurrentUserIncluded = users?.some(
        (user) => user?.user_id === userinfo?.id
      );

      if (isCurrentUserIncluded) {
        const currentUser = users?.find(
          (user) => user?.user_id === userinfo?.id
        );
        const name = currentUser?.name || currentUser?.user_first_name || '';
        const firstName = name.split(' ')[0];
        return `${firstName} +${userCount - 1} more`;
      } else {
        const name = users?.[0]?.name || users?.[0]?.user_first_name || '';
        const firstName = name.split(' ')[0];
        return `${firstName} +${userCount - 1} more`;
      }
    } else {
      return users?.[0]?.name || users?.[0]?.user_first_name + ' ' + users?.[0]?.user_last_name || 'No users assigned';
    }
  };

  return (
    <div className={`flex items-center w-full h-full ${isSubRow ? 'pl-[30px]' : 'pl-[4px]'}`}>
      <Link href={`/app/customers/${row?.customer_id}?activeTab=view`} className="flex-1 min-w-0">
        <div className="flex flex-col hover:text-[#3B82F6] text-[#202B37] justify-start items-start pl-[4px] pr-[8px] py-[10px] font-[400] text-[14px] leading-5 cursor-pointer">
          <div className="flex items-center gap-1">
            <span>{row?.customer_name}</span>
            {row?.is_starred && (
              <CustomerStarredFillIcon className="inline w-5 h-5 text-[#3B82F6] transition-colors flex-shrink-0" />
            )}
          </div>
          {row?.is_group ? (
            <span className="text-[#97A1AF] text-[12px]">
              {row?.associated_customers?.length || 0} accounts
            </span>
          ) : (
            <div>
              <Tippy
                content={
                  <div className="flex flex-col w-fit">
                    <span className="text-[16px] font-medium text-[#141C24]">
                      Users:
                    </span>
                    <span className="text-xs font-normal text-[#414E62] flex flex-col gap-1">
                      {row?.users && row?.users.length > 0 ? (
                        row?.users.map((user, idx) => (
                          <span key={idx}>{user?.name || (user?.user_first_name + ' ' + user?.user_last_name)}</span>
                        ))
                      ) : (
                        <span>No users assigned</span>
                      )}
                    </span>
                  </div>
                }
                className="!rounded-[6px]"
                theme="light !rounded-[6px] !no-shadow"
                placement="bottom-start"
                maxWidth={600}
                arrow={true}
                offset={[0, 6]}
                // followCursor={true}
                interactive={false}
                animation="scale"
                duration={0}
              >
                <span className="text-[12px] text-[#97A1AF]">
                  {getUserName(row)}
                </span>
              </Tippy>
            </div>
          )}
        </div>
      </Link>
      {(row?.signals?.one_signal || row?.one_signal) && (
        <div
          className="flex items-center justify-center pr-2 cursor-pointer flex-shrink-0"
          onClick={() => {
            const signalId = row?.signals?.one_signal?._id || row?.one_signal?._id;
            if (signalId) {
              setSelectedSignalId(signalId);
              setIsSignalDrawerOpen(true);
            }
          }}
        >
          {(row?.signals?.one_signal?.signal_types?.includes('appreciation') ||
            row?.one_signal?.signal_types?.includes('appreciation'))
            ? getExpressionSvgIcon(
              'appreciation',
              '#249782',
              'w-[16.87px] h-[17.53px] font-normal'
            )
            : getExpressionSvgIcon(
              'information',
              '#202B37',
              'w-4 h-4 font-normal'
            )
          }
        </div>
      )}
    </div>
  );
});

CustomerNameCell.displayName = 'CustomerNameCell';

// Pillar Status Cell Component - Memoized to prevent unnecessary re-renders
const PillarStatusCell = React.memo(({
  pillarName,
  statuses,
  customerId,
  isActive,
  signals,
}: {
  pillarName: string;
  statuses: PillarStatus[];
  customerId: number;
  isActive?: boolean;
  signals?: any;
}) => {
  const pillarAlt = pillarName === 'Impact' ? 'Business' : pillarName;
  const statusObj = statuses?.find(
    (status) => status.pillar === pillarName || status.pillar === pillarAlt
  );
  const status = statusObj?.status?.toLowerCase() || 'Unknown';
  const displayText = getStatusDisplayText(status);

  if (!isActive) {
    return (
      <div className="h-6 px-[4px] py-[4px] flex justify-center items-center text-[12px] font-[600] leading-[16px] rounded-[4px] bg-[#E4E7EC] text-[#202B37] cursor-not-allowed">
        NA
      </div>
    );
  }

  const href =
    pillarName === 'NPS'
      ? `/app/customers/${customerId}?activeTab=view`
      : pillarName === 'OpenIssues'
        ? `/app/customers/${customerId}?activeTab=open_issues`
        : `/app/customers/${customerId}?activeTab=view&selected=${getPillarRef(pillarName)}`;

  return (
    <Link
      href={href}
      className={`h-6 px-[4px] py-[4px] flex items-center text-[12px] font-[600] leading-[16px] rounded-[4px] ${pillarName === 'OpenIssues'
        ? 'text-[#202B37] text-[14px] font-normal justify-start hover:text-blue-500'
        : getStatusClass(status)
        } cursor-pointer hover:opacity-90`}
    >
      {pillarName === 'OpenIssues'
        ? getSignalText(
          signals?.open_signals || 0,
          signals?.critical_issues || 0
        )
        : displayText}
    </Link>
  );
});

PillarStatusCell.displayName = 'PillarStatusCell';

// Sorting Icon Component - Memoized
const SortingIcon = React.memo(({ isSorted }: { isSorted: false | 'asc' | 'desc' }) => {
  return (
    <span className={`flex flex-col gap-1 mr-2 transition-opacity duration-200 ${isSorted ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="10"
        height="6"
        viewBox="0 0 10 6"
        fill="none"
        className={`rotate-180 transition-opacity duration-200 ${isSorted === 'asc' ? 'opacity-100' : isSorted === 'desc' ? 'opacity-30' : 'opacity-100'
          }`}
      >
        <path
          d="M1.07733 0.912031C1.40277 0.586615 1.9304 0.586615 2.25584 0.912031L4.99992 3.65612L7.744 0.912031C8.06942 0.586615 8.59709 0.586615 8.9225 0.912031C9.24792 1.23745 9.24792 1.76511 8.9225 2.09053L5.58917 5.42387C5.26375 5.74928 4.73609 5.74928 4.41067 5.42387L1.07733 2.09053C0.751894 1.76511 0.751894 1.23745 1.07733 0.912031Z"
          fill="black"
        />
      </svg>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="10"
        height="6"
        viewBox="0 0 10 6"
        fill="none"
        className={`transition-opacity duration-200 ${isSorted === 'desc' ? 'opacity-100' : isSorted === 'asc' ? 'opacity-30' : 'opacity-100'
          }`}
      >
        <path
          d="M1.07733 0.912031C1.40277 0.586615 1.9304 0.586615 2.25584 0.912031L4.99992 3.65612L7.744 0.912031C8.06942 0.586615 8.59709 0.586615 8.9225 0.912031C9.24792 1.23745 9.24792 1.76511 8.9225 2.09053L5.58917 5.42387C5.26375 5.74928 4.73609 5.74928 4.41067 5.42387L1.07733 2.09053C0.751894 1.76511 0.751894 1.23745 1.07733 0.912031Z"
          fill="black"
        />
      </svg>
    </span>
  );
});

SortingIcon.displayName = 'SortingIcon';

// Status Bar Component for column headers
const StatusBar = React.memo(({ pillarKey, data }: { pillarKey: string; data: CustomerData[] }) => {
  const statusCounts = useMemo(() => {
    let green = 0, yellow = 0, red = 0, gray = 0;

    const pillarAlt = pillarKey === 'Impact' ? 'Business' : pillarKey;

    data.forEach((customer) => {
      // Only count active customers
      if (!customer.is_active) return;

      const statusObj = customer.pillar_statuses?.find(
        (status) => status.pillar === pillarKey || status.pillar === pillarAlt
      );
      const status = statusObj?.status?.toLowerCase() || 'unknown';

      switch (status) {
        case 'green':
          green++;
          break;
        case 'yellow':
          yellow++;
          break;
        case 'red':
          red++;
          break;
        default:
          gray++;
      }
    });

    const total = green + yellow + red + gray;

    return {
      green,
      yellow,
      red,
      gray,
      total,
      greenPercent: total > 0 ? (green / total) * 100 : 0,
      yellowPercent: total > 0 ? (yellow / total) * 100 : 0,
      redPercent: total > 0 ? (red / total) * 100 : 0,
      grayPercent: total > 0 ? (gray / total) * 100 : 0,
    };
  }, [pillarKey, data]);

  if (statusCounts.total === 0) {
    return null;
  }

  return (
    <div className="w-full h-[4px] flex rounded-full overflow-hidden mt-1 flex-shrink-0">
      {statusCounts.redPercent > 0 && (
        <div
          className="bg-[#FCCFCF] h-full"
          style={{ width: `${statusCounts.redPercent}%` }}
        />
      )}
      {statusCounts.yellowPercent > 0 && (
        <div
          className="bg-[#FFEECC] h-full"
          style={{ width: `${statusCounts.yellowPercent}%` }}
        />
      )}
      {statusCounts.greenPercent > 0 && (
        <div
          className="bg-[#D9F2E5] h-full"
          style={{ width: `${statusCounts.greenPercent}%` }}
        />
      )}
      {statusCounts.grayPercent > 0 && (
        <div
          className="bg-gray-200 h-full"
          style={{ width: `${statusCounts.grayPercent}%` }}
        />
      )}
    </div>
  );
});

// Expandable Customer Cell - Manages its own expansion state from ref
const ExpandableCustomerCell = React.memo(({
  customer,
  hasSubRows,
  userinfo,
  isOn,
  setSelectedSignalId,
  setIsSignalDrawerOpen,
  expandedRowsRef,
  toggleRowExpanded,
}: {
  customer: CustomerData;
  hasSubRows: boolean;
  userinfo: any;
  isOn?: boolean;
  setSelectedSignalId: (id: string) => void;
  setIsSignalDrawerOpen: (open: boolean) => void;
  expandedRowsRef: React.MutableRefObject<Record<string, boolean>>;
  toggleRowExpanded: (customerId: number) => void;
}) => {
  // Use local state that syncs with ref for this specific row
  const [isExpanded, setIsExpanded] = useState(expandedRowsRef.current[customer.customer_id] || false);
  
  const handleToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
    toggleRowExpanded(customer.customer_id);
  }, [isExpanded, toggleRowExpanded, customer.customer_id]);

  return (
    <div className="flex items-center">
      {hasSubRows && (
        <div
          className="pt-2 cursor-pointer"
          onClick={handleToggle}
        >
          <button>
            <ChevronDown
              className={`w-[24px] h-[24px] transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            />
          </button>
        </div>
      )}
      <CustomerNameCell
        row={customer}
        userinfo={userinfo}
        isOn={isOn}
        setSelectedSignalId={setSelectedSignalId}
        setIsSignalDrawerOpen={setIsSignalDrawerOpen}
      />
    </div>
  );
});

ExpandableCustomerCell.displayName = 'ExpandableCustomerCell';

const CustomerGridView: React.FC<CustomerGridViewProps> = ({
  data,
  config,
  userinfo,
  setSelectedSignalId,
  setIsSignalDrawerOpen,
  searchText,
  isSearch = true,
  isOn = false,
  setSearchText,
  resetKey,
}) => {
  const [isTableOpen, setIsTableOpen] = useState(true);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [sorting, setSorting] = useState<SortingState>([]);
  
  // Pagination state - show 30 rows at a time for performance
  const ROWS_PER_PAGE = 30;
  const [visibleRowCount, setVisibleRowCount] = useState(ROWS_PER_PAGE);
  
  // Reset visible rows when data changes significantly (filter change)
  const prevDataLengthRef = useRef(data.length);
  useEffect(() => {
    if (Math.abs(data.length - prevDataLengthRef.current) > 10) {
      setVisibleRowCount(ROWS_PER_PAGE);
    }
    prevDataLengthRef.current = data.length;
  }, [data.length]);
  
  // Use ref to track sorting state without causing column re-renders
  const sortingRef = useRef<SortingState>([]);
  // Use ref to track current data without causing column re-renders
  const dataRef = useRef<CustomerData[]>(data);
  // Use ref for expanded rows to avoid column recreation
  const expandedRowsRef = useRef<Record<string, boolean>>({});
  // Use ref for resetKey to pass to SearchHeader without recreating columns
  const resetKeyRef = useRef<number | undefined>(resetKey);
  
  // Update dataRef whenever data changes
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  // Update expandedRowsRef whenever expandedRows changes
  useEffect(() => {
    expandedRowsRef.current = expandedRows;
  }, [expandedRows]);

  // Reset sorting when resetKey changes
  useEffect(() => {
    if (resetKey !== undefined) {
      setSorting([]);
      sortingRef.current = [];
      resetKeyRef.current = resetKey;
    }
  }, [resetKey]);
  
  // Memoized toggle function for row expansion
  const toggleRowExpanded = useCallback((customerId: number) => {
    setExpandedRows((prev) => ({
      ...prev,
      [customerId]: !prev[customerId],
    }));
  }, []);
  
  // Load more rows handler
  const handleLoadMore = useCallback(() => {
    setVisibleRowCount(prev => Math.min(prev + ROWS_PER_PAGE, data.length));
  }, [data.length]);
  
  // Ref for the sentinel element used for infinite scroll
  const loadMoreSentinelRef = useRef<HTMLDivElement>(null);

  // Custom handler that updates ref synchronously BEFORE state update
  const handleSortingChange = useCallback((updaterOrValue: SortingState | ((old: SortingState) => SortingState)) => {
    const newSorting = typeof updaterOrValue === 'function'
      ? updaterOrValue(sorting)
      : updaterOrValue;
    sortingRef.current = newSorting; // Update ref synchronously
    setSorting(newSorting);
  }, [sorting]);

  // Create header columns from config
  const headerColumns = useMemo(() => {
    if (!config) return [];

    return Object.entries(config as Record<string, ConfigValues>)
      .filter(([key]) => key !== 'PurchasesAndRenewals')
      .sort((a, b) => a[1].order - b[1].order)
      .map(([key, value]) =>
        value?.enabled ? { key, displayName: value?.display_name } : null
      )
      .filter(Boolean) as { key: string; displayName: string }[];
  }, [config]);

  // Create columns for TanStack Table
  const columns = useMemo<ColumnDef<CustomerData>[]>(() => {
    // Custom sorting function for pillar status columns
    // Uses ref to access current sorting state without re-creating columns
    const createStatusSortingFn = (): SortingFn<CustomerData> => {
      return (rowA, rowB, columnId) => {
        // Get current sort direction for this column from ref
        const sortConfig = sortingRef.current.find(s => s.id === columnId);
        const isDesc = sortConfig?.desc ?? false;

        const statusA = getStatusForPillar(rowA.original, columnId);
        const statusB = getStatusForPillar(rowB.original, columnId);

        // Use common comparator - handles gray always last
        return comparePillarStatus(statusA, statusB, isDesc);
      };
    };

    // Custom sorting function for OpenIssues column
    const openIssuesSortingFn: SortingFn<CustomerData> = (rowA, rowB) => {
      const countA = rowA.original.signals?.open_signals || rowA.original.open_signals || 0;
      const countB = rowB.original.signals?.open_signals || rowB.original.open_signals || 0;
      return countA - countB;
    };

    const cols: ColumnDef<CustomerData>[] = [
      {
        id: 'customer_name',
        accessorKey: 'customer_name',
        header: () => (
          <SearchHeader
            onSearchChange={setSearchText}
            isSearch={isSearch}
            isTableOpen={isTableOpen}
            setIsTableOpen={setIsTableOpen}
            searchText={searchText}
            resetKey={resetKeyRef.current}
          />
        ),
        cell: ({ row }) => {
          const customer = row.original;
          const hasSubRows = !!(customer.is_group && isOn && customer.associated_customers && customer.associated_customers.length > 0);

          return (
            <ExpandableCustomerCell
              customer={customer}
              hasSubRows={hasSubRows}
              userinfo={userinfo}
              isOn={isOn}
              setSelectedSignalId={setSelectedSignalId}
              setIsSignalDrawerOpen={setIsSignalDrawerOpen}
              expandedRowsRef={expandedRowsRef}
              toggleRowExpanded={toggleRowExpanded}
            />
          );
        },
        enableSorting: false,
        size: 200,
      },
    ];

    // Add pillar columns from config
    headerColumns.forEach((header) => {
      const isOpenIssues = header.key === 'OpenIssues';
      cols.push({
        id: header.key,
        accessorKey: header.key,
        header: () => (
          <div className="h-full flex flex-col w-full items-start justify-end gap-0.5">
            <span className="h-[calc(100%-4px)] font-medium text-sm leading-5 text-[#202B37] flex items-center justify-start">
              {header.displayName}
            </span>
            {!isOpenIssues && <StatusBar pillarKey={header.key} data={dataRef.current} />}
          </div>
        ),
        cell: ({ row }) => {
          const customer = row.original;
          return (
            <PillarStatusCell
              pillarName={header.key}
              statuses={customer.pillar_statuses}
              customerId={customer.customer_id}
              isActive={customer.is_active}
              signals={customer.signals}
            />
          );
        },
        enableSorting: true,
        sortingFn: isOpenIssues ? openIssuesSortingFn : createStatusSortingFn(),
        size:111,
      });
    });

    return cols;
  }, [
    headerColumns,
    isSearch,
    isTableOpen,
    isOn,
    toggleRowExpanded,
  ]);

  // TanStack Table instance - use FULL data for sorting, then slice for display
  const table = useReactTable({
    data: data, // Full data so sorting works on all rows
    columns,
    state: {
      sorting,
    },
    onSortingChange: handleSortingChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableSortingRemoval: true,
  });
  
  // Get sorted rows from table, then slice for display (pagination)
  const allSortedRows = table.getRowModel().rows;
  const visibleRows = useMemo(() => allSortedRows.slice(0, visibleRowCount), [allSortedRows, visibleRowCount]);
  const hasMoreRows = allSortedRows.length > visibleRowCount;
  const remainingCount = allSortedRows.length - visibleRowCount;

  // Infinite scroll using Intersection Observer on page scroll
  useEffect(() => {
    const sentinel = loadMoreSentinelRef.current;
    if (!sentinel) return;
    
    // Only observe if there are more rows to load
    if (!hasMoreRows) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          // Load more rows when sentinel becomes visible
          handleLoadMore();
        }
      },
      {
        // Use null for root to observe intersection with the viewport (page scroll)
        root: null,
        // Trigger slightly before the element is fully visible for smoother UX
        rootMargin: '100px',
        threshold: 0.1,
      }
    );
    
    observer.observe(sentinel);
    
    return () => {
      observer.disconnect();
    };
  }, [hasMoreRows, handleLoadMore]);

  // Sort associated customers (subcustomers):
  // 1. First apply default sorting: is_starred (desc) -> arr (desc) -> customer_name (asc)
  // 2. Then apply column sorting if user has selected one
  const sortAssociatedCustomers = useCallback((customers: CustomerData[]): CustomerData[] => {
    if (!customers || customers.length === 0) {
      return customers;
    }

    // First, apply default subcustomer sorting: is_starred (desc) -> arr (desc) -> customer_name (asc)
    let sortedCustomers = sortSubcustomersByDefault(customers);

    // Then, if user has applied column sorting, apply that on top
    if (sorting && sorting.length > 0) {
      const sortConfig = sorting[0]; // Get the first (and typically only) sort column
      sortedCustomers = sortCustomersByColumn(sortedCustomers, sortConfig.id, sortConfig.desc);
    }

    return sortedCustomers;
  }, [sorting]);

  // Render sub-rows for expanded groups - Memoized callback
  const renderSubRows = useCallback((parentRow: CustomerData) => {
    if (!expandedRows[parentRow.customer_id] || !parentRow.associated_customers) {
      return null;
    }

    // Sort associated customers based on current sorting state
    const sortedAssociatedCustomers = sortAssociatedCustomers(parentRow.associated_customers);

    return sortedAssociatedCustomers.map((child) => (
      <tr
        key={`subrow-${child.customer_id}`}
        className="w-full overflow-hidden bg-[#F9FAFB] shadow-md"
      >
        <td className="border-r-[1px] border-gray-200">
          <CustomerNameCell
            row={{
              ...child,
            }}
            userinfo={userinfo}
            isOn={isOn}
            setSelectedSignalId={setSelectedSignalId}
            setIsSignalDrawerOpen={setIsSignalDrawerOpen}
            isSubRow={true}
          />
        </td>
        {headerColumns.map((header, index) => (
          <td
            key={`${child.customer_id}-${header.key}`}
            className="h-10 p-[8px] border-l-[1px] border-gray-200 flex-1 w-[167px]"
          >
            <PillarStatusCell
              pillarName={header.key}
              statuses={child.pillar_statuses}
              customerId={child.customer_id}
              isActive={child.is_active}
              signals={child.signals}
            />
          </td>
        ))}
      </tr>
    ));
  }, [expandedRows, headerColumns, isOn, sortAssociatedCustomers, userinfo, setSelectedSignalId, setIsSignalDrawerOpen]);

  if (!isTableOpen) {
    return (
      <div className="overflow-x-auto border rounded-[12px] w-full border-[#E4E7EC] overflow-hidden">
        <div
          className="flex h-[40px] bg-white items-center gap-2 text-[#202B37] text-[14px] w-full justify-center cursor-pointer"
          onClick={() => setIsTableOpen(true)}
        >
          <span className="pt-[1px]">
            <ChevronDown className="h-5 w-5" />
          </span>
          <span>See Accounts</span>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border rounded-[12px] w-full border-[#E4E7EC] overflow-hidden">
      <table className="min-w-full bg-white">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="bg-[#F9FAFB] border-[#E4E7EC]">
              {headerGroup.headers.map((header, headerIndex) => (
                <th
                  key={header.id}
                  className={`group h-[32px] ${headerIndex === 0 ? 'border-r-[1px]' : 'border-l-[1px]'
                    } ${headerIndex === 0 ? 'rounded-tl-[12px]' : ''
                    } border-[#E4E7EC] font-[500] text-[14px] leading-5 text-[#202B37] text-left py-2 ${header.column.getCanSort() ? 'cursor-pointer select-none' : ''
                    }`}
                  onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                  style={{ width: header.getSize() }}
                >
                  <div className={`h-full pl-2 flex items-center justify-start`}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getCanSort() && header.id !== 'customer_name' && (
                      <SortingIcon isSorted={header.column.getIsSorted()} />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        {visibleRows.length > 0 && (
          <tbody>
            {visibleRows.map((row, rowIndex) => (
              <Fragment key={row.id}>
                <tr
                  className={`${rowIndex === visibleRows.length - 1 && !hasMoreRows ? '' : 'border-b-[1px]'
                    } border-gray-200 overflow-hidden`}
                >
                  {row.getVisibleCells().map((cell, cellIndex) => (
                    <td
                      key={cell.id}
                      className={`${cellIndex === 0 ? 'border-r-[1px]' : ''
                        } ${cellIndex !== 0 ? 'h-10 p-[8px] border-l-[1px] border-gray-200 flex-1 w-[167px]' : 'border-gray-200'
                        }`}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
                {renderSubRows(row.original)}
              </Fragment>
            ))}
          </tbody>
        )}
      </table>
      {/* Infinite scroll sentinel - triggers loading more rows when scrolled into view */}
      {hasMoreRows && (
        <div 
          ref={loadMoreSentinelRef}
          className="flex items-center justify-center py-3"
        >
          <span className="text-[14px] text-[#667085] font-normal">
            Loading more... ({remainingCount} remaining)
          </span>
        </div>
      )}
    </div>
  );
};

export default React.memo(CustomerGridView);
