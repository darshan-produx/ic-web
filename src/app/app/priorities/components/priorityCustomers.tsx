import dayjs from 'dayjs';
import { formatRevenue } from '../../../../common/SupportFunctions';
import { useMemo, useState } from 'react';
import { ArrowDownUp, ArrowUpDown } from 'lucide-react';
import {
  CustomerStarredFillIcon,
  HoverIcon,
} from '../../../assests/icons/icons';
import { getCustomer360MetricConfigs } from '../../../api/customers/customers';
import { useQuery } from '@tanstack/react-query';

interface props {
  setDraggedItemData: any;
  customerOverview: any;
  setOnHover: any;
  onHover: string;
}

export default function PriorityCustomers({
  customerOverview,
  setDraggedItemData,
  setOnHover,
  onHover,
}: props) {
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const { data: customer360MetricConfigData } = useQuery({
    queryKey: ['customer360MetricConfigData'],
    queryFn: () => getCustomer360MetricConfigs(),
    refetchOnWindowFocus: false,
  });

  const customerOverviewData = useMemo(() => {
    if (!customerOverview) return undefined;
    if (!sortField) return [...customerOverview];

    return [...customerOverview].sort((a, b) => {
      let aVal: any;
      let bVal: any;

      if (sortField === 'value') {
        aVal = a.customer_metric?.[sortField] ?? null;
        bVal = b.customer_metric?.[sortField] ?? null;
      } else if (sortField === 'renewal_date') {
        aVal = a[sortField] ? new Date(a[sortField]).getTime() : null;
        bVal = b[sortField] ? new Date(b[sortField]).getTime() : null;
      } else if (sortField === 'NPS') {
        aVal = a[sortField] != null ? Number(a[sortField]) : null;
        bVal = b[sortField] != null ? Number(b[sortField]) : null;
      } else {
        aVal = a[sortField] ?? null;
        bVal = b[sortField] ?? null;
      }

      // Push nulls/undefined to the end regardless of sort direction
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      } else {
        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
      }
    });
  }, [customerOverview, sortDirection, sortField]);

  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return (
    <div className="overflow-x-auto h-[430px] overflow-auto scroll">
      <table className="min-w-full  ">
        <thead>
          <tr className="border-b border-[#F2F4F7] text-[12px] !font-normal text-[#97A1AF]">
            <th
              className={`ml-7 py-[10px] px-4 font-normal text-left flex items-center`}
            >
              <div className="flex items-center gap-0.5">
                Customer
                <span
                  className="cursor-pointer"
                  onClick={() => handleSort('customer_name')}
                >
                  {sortField === 'customer_name' && sortDirection === 'asc' ? (
                    <ArrowUpDown className="w-[12px] h-[12px]" />
                  ) : (
                    <ArrowDownUp className="w-[12px] h-[12px]" />
                  )}
                </span>
              </div>
            </th>

            <th className="py-[10px] px-4 font-normal text-left">Overview</th>
            <th
              className={`py-[10px] px-4 font-normal text-left flex items-center `}
            >
              <div className="flex items-center gap-0.5">
                NPS
                <span
                  className="cursor-pointer"
                  onClick={() => handleSort('NPS')}
                >
                  {sortField === 'NPS' && sortDirection === 'asc' ? (
                    <ArrowUpDown className="w-[12px] h-[12px]" />
                  ) : (
                    <ArrowDownUp className="w-[12px] h-[12px]" />
                  )}
                </span>
              </div>
            </th>
            <th className={`py-[10px] px-4 font-normal text-left  `}>
              <div className="flex items-center gap-0.5">
                {customer360MetricConfigData?.data?.value?.metrics?.[customer360MetricConfigData?.data?.value?.tree_map_sorting?.sort_by]?.display_name || 'ARR'}
                <span
                  className="cursor-pointer"
                  onClick={() => handleSort('value')}
                >
                  {sortField === 'value' && sortDirection === 'asc' ? (
                    <ArrowUpDown className="w-[12px] h-[12px]" />
                  ) : (
                    <ArrowDownUp className="w-[12px] h-[12px]" />
                  )}
                </span>
              </div>
            </th>
            {customer360MetricConfigData?.data?.value?.priority_config?.renewal_date?.enabled && (<th className="py-[10px] px-4 font-normal text-left">
              <div className="flex items-center gap-0.5">
                {customer360MetricConfigData?.data?.value?.priority_config?.renewal_date?.display_name || 'Renewal date'}
                <span
                  className="cursor-pointer"
                  onClick={() => handleSort('renewal_date')}
                >
                  {sortField === 'renewal_date' && sortDirection === 'asc' ? (
                    <ArrowUpDown className="w-[12px] h-[12px]" />
                  ) : (
                    <ArrowDownUp className="w-[12px] h-[12px]" />
                  )}
                </span>
              </div>
            </th>)}
          </tr>
        </thead>
        <tbody className="p-[20px] ">
          {customerOverviewData?.map((overView: any) => (
            <tr
              className="cursor-pointer relative"
              onMouseEnter={() => setOnHover(overView.customer_id)}
              onMouseLeave={() => setOnHover('')}
              draggable={true}
              onDragStart={(e) => {
                setDraggedItemData({
                  ref_type: 'customer',
                  ref_id: overView?.customer_id,
                  title: `Review  ${overView?.customer_name}`,
                  customer_id: overView?.customer_id,
                  metadata: {},
                });
              }}
              onDragEnd={(e) => {
                setDraggedItemData(null);
              }}
              onClick={() => {
                window.open(
                  `/app/customers/${overView?.customer_id}`,
                  '_blank'
                );
              }}
            >
              <td className="py-5 pl-5 pr-4 text-[14px] font-normal text-[#3B82F6] max-w-[200px] truncate">
                {overView?.is_starred ? (
                  <CustomerStarredFillIcon className="inline w-5 h-5 text-[#3B82F6] transition-colors" />
                ) : (<span className='w-5 h-5 inline-block'></span>)}{' '}
                {overView?.customer_name ? overView?.customer_name : '-'}
              </td>
              <td className="py-5 px-4">
                <span
                  className={
                    overView?.overview_status == 'Green'
                      ? 'px-[10px] py-1 w-full text-xs inline-block font-semibold rounded-[4px] bg-green-light border-green-200 text-green-text dark:bg-green-500/20 dark:border-green-500/20'
                      : overView?.overview_status == 'Yellow'
                        ? 'px-[10px] py-1 w-full inline-block text-xs font-semibold rounded-[4px] bg-orange-light border-[#EAB308] text-orange-text dark:bg-yellow-500/20 dark:border-transparent'
                        : overView?.overview_status == 'Red'
                          ? 'px-[10px] py-1 w-full text-xs font-semibold inline-block rounded-[4px] transition-all duration-200 ease-linear bg-red-light border-transparent text-red-text hover:bg-red-200 dark:bg-red-400/20 dark:hover:bg-red-400/30 dark:border-transparent'
                          : 'px-[10px] py-1 w-full text-xs inline-block font-semibold rounded-[4px] bg-[#F2F4F7] text-[#202B37] dark:bg-green-500/20 dark:border-green-500/20'
                  }
                >
                  {overView?.overview_status === 'Green'
                    ? 'Good'
                    : overView?.overview_status === 'Red'
                      ? 'Poor'
                      : overView?.overview_status === 'Yellow'
                        ? 'Average'
                        : overView?.overview_status === 'Gray'
                          ? 'N/A'
                          : null}
                </span>
              </td>
              <td className="py-5 px-4">
                <span
                  className={`${overView?.NPS
                    ? 'px-[10px] py-1 w-full text-xs inline-block font-semibold rounded-[4px] bg-[#F2F4F7] text-[#202B37] dark:bg-green-500/20 dark:border-green-500/20'
                    : 'px-[10px] py-1 w-full'
                    }`}
                >
                  {overView?.NPS ? overView?.NPS : '-'}
                </span>
              </td>

              <td className="py-5 px-4 text-[12px] text-[#202B37] font-normal">
                {overView?.customer_metric
                  ? overView?.client_currency?.currency_symbol
                  : null}
                {overView?.customer_metric
                  ? formatRevenue(
                    overView?.customer_metric?.value,
                    overView?.client_currency?.currency
                  )
                  : '-'}

                {/* {overView?.customer_commercials?.arr
                  ? overView?.customer_commercials?.arr
                  : '-'} */}
              </td>
              {customer360MetricConfigData?.data?.value?.priority_config?.renewal_date?.enabled && (<td className="py-5 px-4 text-[12px] text-[#202B37] font-normal">
                {overView?.renewal_date
                  ? dayjs(overView?.renewal_date).format('MMM DD, YYYY')
                  : '-'}
              </td>)}
              {onHover === overView.customer_id && (
                <span className="absolute top-6 left-0 right-0">
                  <HoverIcon />
                </span>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
