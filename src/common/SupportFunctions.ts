
export function flattenTree(arr: any[], arrFieldName: string): any[] {
    const result: any[] = [];

    function helper(nodes: any[]) {
        for (const node of nodes) {
            const { [arrFieldName]: children, ...rest } = node;
            result.push(rest); // Add node without children
            if (children && children.length > 0) {
                helper(children);
            }
        }
    }

    helper(arr);
    return result;
}

/**
 * Formats revenue/numbers with K, M, B suffixes and max 2 decimals
 * Supports both INR (Cr, L, K) and other currencies (B, M, K)
 */
export function formatRevenue(value: number | string | undefined | null, currency?: string): string {
    // Handle null, undefined, or empty values
    if (value === null || value === undefined || value === '') {
        return '0';
    }

    // Convert to number if string
    const num = typeof value === 'string' ? parseFloat(value) : value;

    // Handle invalid numbers
    if (isNaN(num)) {
        return '0';
    }

    // Handle zero
    if (num === 0) {
        return '0';
    }

    const absNum = Math.abs(num);
    const sign = num < 0 ? '-' : '';

    // Helper to remove trailing zeros
    const formatDecimal = (val: number, decimals: number = 2): string => {
        const fixed = val.toFixed(decimals);
        return fixed.replace(/\.?0+$/, '');
    };

    if (currency === 'INR') {
        // Indian numbering system
        if (absNum >= 1_00_00_000) {
            // Crores
            return `${sign}${formatDecimal(absNum / 1_00_00_000)}Cr`;
        }
        if (absNum >= 1_00_000) {
            // Lakhs
            return `${sign}${formatDecimal(absNum / 1_00_000)}L`;
        }
        if (absNum >= 1_000) {
            // Thousands
            return `${sign}${formatDecimal(absNum / 1_000)}K`;
        }
        return `${sign}${formatDecimal(absNum)}`;
    } else {
        // International numbering system
        if (absNum >= 1_000_000_000) {
            // Billions
            return `${sign}${formatDecimal(absNum / 1_000_000_000)}B`;
        }
        if (absNum >= 1_000_000) {
            // Millions
            return `${sign}${formatDecimal(absNum / 1_000_000)}M`;
        }
        if (absNum >= 1_000) {
            // Thousands
            return `${sign}${formatDecimal(absNum / 1_000)}K`;
        }
        return `${sign}${formatDecimal(absNum)}`;
    }
}

export const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (diffInSeconds < 60) {
        return 'Just now';
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
        return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
        return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
        return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }

    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
        return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
    }

    const diffInYears = Math.floor(diffInMonths / 12);
    return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
};

// export const getExpressionSVGIcon = (string: string, color?: string, height?: number, width?: number): JSX.Element => {
//     const style = height || width ? { height: height ? `${height}px` : undefined, width: width ? `${width}px` : undefined } : undefined;

//     switch (string) {
//         case 'expectation':
//             return <ExpectationSvgIcon style={style} stroke={color} />;
//         case 'commitment':
//             return <CommitmentSvgIcon style={style} stroke={color} />;
//         case 'information':
//             return <InformationSvgIcon style={style} stroke={color} />;
//         case 'delight':
//             return <DelightSvgIcon style={style} stroke={color} />;
//         case 'issue':
//             return <IssueSvgIcon style={style} stroke={color} />;
//         case 'opportunity':
//             return <OpportunitySvgIcon style={style} stroke={color} />;
//         case 'opportunities_created_by':
//             return <OpportunitiesCreatedBySvgIcon style={style} stroke={color} />;
//         case 'meeting_members_divider_line':
//             return <MeetingMembersdividerLineIcon />;
//         default:
//             return <ExpectationSvgIcon style={style} stroke={color} />;
//     }   
// }


// Helper function to generate MongoDB ObjectId
export const generateObjectId = () => {
    const timestamp = Math.floor(new Date().getTime() / 1000).toString(16);
    const randomValue = Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    const counter = Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    return timestamp + randomValue + counter + '00000'.slice(0, 5);
};

export const formatCompactNumber = (value: number | null | undefined): string => {
  if (value === null || value === undefined || isNaN(value)) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 2,
  }).format(value);
};

export function formatChartRevenue(value: number, currency?: string) {
  const isNegative = value < 0;
  const absValue = Math.abs(value);
  let formattedValue: string | number;

  if (
    currency?.toUpperCase() === 'INR' ||
    currency?.toUpperCase() === 'INDIA'
  ) {
    // Crores (10^7)
    if (absValue >= 1_00_00_000) {
      formattedValue = Math.round(absValue / 1_00_00_00) / 10 + 'Cr';
    }
    // Lakhs (10^5)
    else if (absValue >= 1_00_000) {
      formattedValue = Math.round(absValue / 1_00_00) / 10 + 'L';
    }
    // Thousands - Minimum 10k threshold
    else if (absValue >= 10_000) {
      formattedValue = Math.round(absValue / 100) / 10 + 'K';
    }
    // Below 10k
    else {
      formattedValue = Math.round(absValue * 10) / 10;
    }
  } else {
    // Billions (10^9)
    if (absValue >= 1_000_000_000) {
      formattedValue = Math.round(absValue / 1_000_000_00) / 10 + 'B';
    }
    // Millions (10^6)
    else if (absValue >= 1_000_000) {
      formattedValue = Math.round(absValue / 1_000_00) / 10 + 'M';
    }
    // Thousands - Minimum 10k threshold
    else if (absValue >= 10_000) {
      formattedValue = Math.round(absValue / 100) / 10 + 'K';
    }
    // Below 10k
    else {
      formattedValue = Math.round(absValue * 10) / 10;
    }
  }

  return isNegative ? `-${formattedValue}` : formattedValue.toString();
}

const NEW_TEAM_CURRENCY_CONFIG_KEYS = new Set([
  'ARR',
  'Renewal_revenue',
  'Expected_billing',
  'Actual_billed',
  'Unpaid',
  'Amount_overdue',
  'Invoiced_ARR',
  'value_of_opportunities',
  'opportunities_win_value',
  'opportunities_lost_value',
]);

const NEW_TEAM_METRIC_FIELD_MAP: Record<string, string> = {
  Accounts: 'accounts',
  ARR: 'arr',
  Renewal_revenue: 'actual_renewal_value',
  NRR: 'nrr',
  Expected_billing: 'expected_billing',
  Actual_billed: 'actual_billed',
  Unpaid: 'unpaid',
  Amount_overdue: 'total_amount_overdue',
  Invoiced_ARR: 'invoiced_arr',
  Insights_acted: 'insights_acted',
  Tasks_done: 'tasks',
  open_signals: 'open_signals',
  task: 'incomplete_tasks',
  opportunities: 'opportunities',
  value_of_opportunities: 'value_of_opportunities',
  opportunities_win_count: 'opportunities_win_count',
  opportunities_win_value: 'opportunities_win_value',
  opportunities_lost_count: 'opportunities_lost_count',
  opportunities_lost_value: 'opportunities_lost_value',
  risk_acted: 'risk_acted',
  total_risks: 'total_risks',
};

export const getFullName = (firstName?: string, lastName?: string) => {
  return `${firstName || ''} ${lastName || ''}`.trim() || 'Unknown user';
};

export const getMetricValue = (
  row: any,
  configKey: string,
  defaultCurrencySymbol = '',
  metricFieldMap: Record<string, string> = NEW_TEAM_METRIC_FIELD_MAP,
  defaultCurrency = '',
) => {
  const source =
    row?.rowType === 'user'
      ? row?.aggregate
      : row?.customer;

  if (!source) return '-';

  if (configKey === 'Renewals') {
    const actual = Number(source.renewed_accounts_actual ?? 0);
    const opportunity = Number(source.renewed_accounts_opportunity ?? 0);
    return `${actual}/${opportunity}`;
  }

  if (configKey === 'Accounts') {
    const accounts = source.accounts 

    if (row?.rowType !== 'user' && Number(accounts ?? 0) === 0) {
      return '-';
    }

    return formatCompactNumber(Number(accounts ?? 0));
  }

  if (configKey === 'NRR') {
    const nrr = source.nrr;
    if (nrr === null || nrr === undefined) return '-';
    return `${formatCompactNumber(Number(nrr))}%`;
  }

  const field = metricFieldMap[configKey];
  if (!field) return '-';

  if (NEW_TEAM_CURRENCY_CONFIG_KEYS.has(configKey)) {
    const rawValue = source[field] as number | string | undefined | null;
    if (rawValue === null || rawValue === undefined || rawValue === '') {
      return '-';
    }

    const currency = row?.customer?.client_currency?.currency || defaultCurrency;
    const symbol = row?.customer?.client_currency?.currency_symbol || defaultCurrencySymbol;
    const formattedAmount = formatRevenue(rawValue, currency);
    return symbol ? `${symbol}${formattedAmount}` : formattedAmount;
  }

  return formatCompactNumber(Number(source[field] ?? 0));
};

export const aggregateFromCustomers = (customers: any[]) => {
  const aggregate: Record<string, number> = {
    accounts: 0,
    renewed_accounts_actual: 0,
    renewed_accounts_opportunity: 0,
    arr: 0,
    actual_renewal_value: 0,
    nrr: 0,
    expected_billing: 0,
    actual_billed: 0,
    unpaid: 0,
    total_amount_overdue: 0,
    invoiced_arr: 0,
    insights_acted: 0,
    tasks: 0,
    open_signals: 0,
    incomplete_tasks: 0,
    opportunities: 0,
    value_of_opportunities: 0,
    opportunities_win_count: 0,
    opportunities_win_value: 0,
    opportunities_lost_count: 0,
    opportunities_lost_value: 0,
    risk_acted: 0,
    total_risks: 0,
  };

  const flatten = (items: any[]) => {
    const result: any[] = [];
    for (const item of items) {
      result.push(item);
      if (Array.isArray(item?.children)) {
        result.push(...flatten(item.children));
      }
    }
    return result;
  };

  const all = flatten(customers || []);
  aggregate.accounts = all.length;

  all.forEach((item) => {
    Object.keys(aggregate).forEach((key) => {
      if (key === 'accounts') return;
      aggregate[key] += Number(item?.[key] ?? 0);
    });
  });

  return aggregate;
};

export const updateRowById = <T extends { id: string; subRows?: T[] }>(
  rows: T[],
  rowId: string,
  updater: (row: T) => T,
): T[] => {
  return rows.map((row) => {
    if (row.id === rowId) {
      return updater(row);
    }
    if (row.subRows?.length) {
      return {
        ...row,
        subRows: updateRowById(row.subRows, rowId, updater),
      };
    }
    return row;
  });
};

// export const generateUniqueId = (): string => {
//     return uuidv4();
// };


// export function flattenTreeFromUserId(arr: any[], userId: string) {
//     let targetNode = null;

//     // helper to find the user anywhere in the tree
//     function findNode(nodes: any[]) {
//         for (const node of nodes) {
//             if (node._id === userId) {
//                 targetNode = node;
//                 return;
//             }
//             if (node.children && node.children.length > 0) {
//                 findNode(node.children);
//             }
//         }
//     }

//     // flatten tree into single array
//     function flatten(nodes: any[], result: any[]) {
//         for (const node of nodes) {
//             result.push(node);
//             if (node.children && node.children.length > 0) {
//                 flatten(node.children, result);
//             }
//         }
//     }

//     // 1️⃣ find the starting user node
//     findNode(arr);

//     // 2️⃣ if found, flatten its subtree
//     if (targetNode) {
//         const result: any[] = [];
//         flatten([targetNode], result);
//         return result;
//     }

//     return []; // not found
// }
