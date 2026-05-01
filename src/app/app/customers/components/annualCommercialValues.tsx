import { useQuery } from '@tanstack/react-query';
import TableContainer from '../../../../common/components/TableContainer';
import dayjs from 'dayjs';
import React, { useMemo, useState } from 'react';
import { getCustomer360MetricConfigs } from '../../../api/customers/customers';
import { formatRevenue } from '../../../../common/SupportFunctions';
interface props {
  customerCommercialsDetails: any;
  displayName?: string;
}

const AnnualCommercialValues = ({
  customerCommercialsDetails,
  displayName,
}: props) => {
  const [activeTab, setActiveTab] = useState<'contracts' | 'invoices'>(
    'contracts'
  );
  const { data: customer360MetricConfigData } = useQuery({
    queryKey: ['customer360MetricConfigData'],
    queryFn: () => getCustomer360MetricConfigs(),
    refetchOnWindowFocus: false,
  });

  const customer360MetricConfig = useMemo(() => {
    if (
      customer360MetricConfigData?.data?.value &&
      customer360MetricConfigData?.data?.value?.metrics
    ) {
      return customer360MetricConfigData?.data?.value?.metrics;
    } else {
      return {
        metrics: {
          budget_revenue_current_year: {
            enabled: true,
            display_name: 'Budget Revenue Current Year',
          },
          actual_revenue_ytd: {
            enabled: true,
            display_name: 'Actual Revenue YTD',
          },
          last_year_revenue: {
            enabled: true,
            display_name: 'Last Year Revenue',
          },
          arr: {
            enabled: true,
            display_name: 'ARR (Annual recurring revenue)',
          },
          total_amount_due: {
            enabled: true,
            display_name: 'Total amount due',
          },
          nrr: {
            enabled: false,
            display_name: 'NRR',
          },
          planned_billing_ytd: {
            enabled: false,
            display_name: 'Planned billing YTD',
          },
          invoiced_arr: {
            enabled: false,
            display_name: 'Invoiced ARR',
          },
        },
        tree_map_sorting: {
          sort_by: 'arr',
          order: 'desc',
        },
      };
    }
  }, [customer360MetricConfigData?.data]);
  const configCurrencyValue =
    customerCommercialsDetails?.client_currency?.currency;
  const configSymbolValue =
    customerCommercialsDetails?.client_currency?.currency_symbol;
  const customer_contracts =
    customerCommercialsDetails?.customer_contracts?.map((contract: any) => {
      return {
        'Contract ID': contract?.contract_id,
        'Product / Service/ Line Item  Details':
          contract?.line_item_id ?? contract?.product_service,
        'Start date': contract?.start_date
          ? dayjs(contract?.start_date).format('MMM DD, YYYY')
          : null,
        'End date': contract?.end_date
          ? dayjs(contract?.end_date).format('MMM DD, YYYY')
          : null,
        Amount: `${configSymbolValue}${formatRevenue(
          contract?.total_billing_amount ?? 0,
          configCurrencyValue
        )}`,
        Frequency: contract?.billing_frequency,
        Status: contract?.contract_status,
      };
    });
  const columns = useMemo(() => {
    const columns: any = [];
    for (const contractsRow of customer_contracts ?? []) {
      for (const key in contractsRow) {
        if (!columns.includes(key)) {
          columns.push(key);
        }
      }
    }

    return columns.map((column: any) => {
      return {
        header: column,
        accessorKey: column,
        enableColumnFilter: false,
        enableSorting: false,
        cell: (cell: any) => (
          <span className="">{cell?.row?.original?.[column] ?? '-'}</span>
        ),
      };
    });
  }, []);
  const customer_invoices: any =
    customerCommercialsDetails?.customer_invoices?.map((invoice: any) => {
      return {
        'Invoice ID': invoice?.invoice_id,
        'Contract id': invoice?.contract_id,
        'Product / Service/ Line Item  Details':
          invoice?.line_item_id ?? invoice?.product_service,
        'Invoice Date': dayjs(invoice?.actual_billing_date).format(
          'MMM DD, YYYY'
        ),
        'Invoice Amount': `${configSymbolValue}${formatRevenue(
          invoice?.actual_billing_amount ?? 0,
          configCurrencyValue
        )}`,
        'Due date': invoice?.billing_due_date
          ? dayjs(invoice?.billing_due_date).format('MMM DD, YYYY')
          : null,
        Status: invoice?.payment_status,
        'Amount Due': `${configSymbolValue}${formatRevenue(
          invoice?.amount_due ?? 0,
          configCurrencyValue
        )}`,
      };
    });
  const invoiceColumns: any = useMemo(() => {
    const columns: any = [];
    for (const invoicesRow of customer_invoices ?? []) {
      for (const key in invoicesRow) {
        if (!columns.includes(key)) {
          columns.push(key);
        }
      }
    }

    return columns.map((column: any) => {
      return {
        header: column,
        accessorKey: column,
        enableColumnFilter: false,
        enableSorting: false,
        cell: (cell: any) => (
          <span className="">{cell?.row?.original?.[column] ?? '-'}</span>
        ),
      };
    });
  }, []);
  const handleTabClick = (tab: 'contracts' | 'invoices') => {
    setActiveTab(tab);
  };
  return (
    customerCommercialsDetails?.customer_commercials &&
    ((Array.isArray(customer_contracts) && customer_contracts?.length > 0) ||
      (Array.isArray(customer_invoices) && customer_invoices?.length > 0)) && (
      <div className="mb-[40px]">
        <p className="text-[16px] text-gray-900 pb-5 pt-[10px] font-medium ">
          {displayName ?? 'Commercials'}
        </p>
        {customerCommercialsDetails?.customer_commercials && (
          <div className="flex justify-between items-start gap-[15px] font-normal ">
            {customer360MetricConfig?.budget_revenue_current_year?.enabled && (
              <div className="rounded-[12px] bg-gray-50 w-auto p-[20px]  flex flex-col grow">
                <span className="text-gray-500 font-normal text-[14px]">
                  {customer360MetricConfig?.budget_revenue_current_year
                    ?.display_name ?? 'Budget Revenue Current Year'}
                </span>
                <p className="text-[36px] text-gray-900 font-[700] flex gap-3">
                  <span>{configSymbolValue}</span>
                  <span>
                    {formatRevenue(
                      customerCommercialsDetails?.customer_commercials
                        ?.budget_revenue_current_year ?? 0,
                      configCurrencyValue
                    )}
                  </span>
                </p>
              </div>
            )}
            {customer360MetricConfig?.actual_revenue_ytd?.enabled && (
              <div className="rounded-[12px] bg-gray-50 w-auto p-[20px]  flex flex-col grow">
                <span className="text-gray-500 font-normal text-[14px]">
                  {customer360MetricConfig?.actual_revenue_ytd?.display_name ??
                    'Actual Revenue YTD'}
                </span>
                <p className="text-[36px] text-gray-900 font-[700] flex gap-3">
                  <span>{configSymbolValue}</span>
                  <span>
                    {formatRevenue(
                      customerCommercialsDetails?.customer_commercials
                        ?.annual_revenue_ytd ?? 0,
                      configCurrencyValue
                    )}
                  </span>
                </p>
              </div>
            )}
            {customer360MetricConfig?.last_year_revenue?.enabled && (
              <div className="rounded-[12px] bg-gray-50 w-auto p-[20px]  flex flex-col grow">
                <span className="text-gray-500 font-normal text-[14px]">
                  {customer360MetricConfig?.last_year_revenue?.display_name ??
                    'Last Year Revenue'}
                </span>
                <p className="text-[36px] text-gray-900 font-[700] flex gap-3">
                  <span>{configSymbolValue}</span>
                  <span>
                    {formatRevenue(
                      customerCommercialsDetails?.customer_commercials
                        ?.actual_revenue_last_year ?? 0,
                      configCurrencyValue
                    )}
                  </span>
                </p>
              </div>
            )}
            {customer360MetricConfig?.arr?.enabled && (
              <div className="rounded-[12px] bg-gray-50 w-auto p-[20px]  flex flex-col grow">
                <span className="text-gray-500 font-normal text-[14px]">
                  {customer360MetricConfig?.arr?.display_name ??
                    'ARR (Annual recurring revenue)'}
                </span>
                <p className="text-[36px] text-gray-900 font-[700] flex gap-3">
                  <span>{configSymbolValue}</span>
                  <span>
                    {formatRevenue(
                      customerCommercialsDetails?.customer_commercials
                        ?.arr_current_year ?? 0,
                      configCurrencyValue
                    )}
                  </span>
                </p>
              </div>
            )}
            {customer360MetricConfig?.total_amount_due?.enabled && (
              <div className="rounded-[12px] bg-gray-50 w-auto p-[20px] flex flex-col grow">
                <span className="text-gray-500 font-normal text-[14px]">
                  {customer360MetricConfig?.total_amount_due?.display_name ??
                    'Total amount due'}
                </span>
                <p className="text-[36px] text-gray-900 font-[700] flex gap-3">
                  <span>{configSymbolValue}</span>
                  <span>
                    {formatRevenue(
                      customerCommercialsDetails?.customer_commercials
                        ?.total_amount_due ?? 0,
                      configCurrencyValue
                    )}
                  </span>
                </p>
              </div>
            )}
            {customer360MetricConfig?.nrr?.enabled && (
              <div className="rounded-[12px] bg-gray-50 w-auto p-[20px] flex flex-col grow">
                <span className="text-gray-500 font-normal text-[14px]">
                  {customer360MetricConfig?.nrr?.display_name ?? 'NRR'}
                </span>
                <p className="text-[36px] text-gray-900 font-[700] flex gap-3">
                  <span>
                    {customerCommercialsDetails?.customer_metrics?.nrr
                      ? customerCommercialsDetails?.customer_metrics?.nrr + '%'
                      : 0}
                  </span>
                </p>
              </div>
            )}
            {customer360MetricConfig?.planned_billing_ytd?.enabled && (
              <div className="rounded-[12px] bg-gray-50 w-auto p-[20px] flex flex-col grow">
                <span className="text-gray-500 font-normal text-[14px]">
                  {customer360MetricConfig?.planned_billing_ytd?.display_name ??
                    'Planned billing YTD'}
                </span>
                <p className="text-[36px] text-gray-900 font-[700] flex gap-3">
                  <span>{configSymbolValue}</span>
                  <span>
                    {formatRevenue(
                      customerCommercialsDetails?.customer_metrics
                        ?.planned_billing_ytd ?? 0,
                      configCurrencyValue
                    )}
                  </span>
                </p>
              </div>
            )}
            {customer360MetricConfig?.invoiced_arr?.enabled && (
              <div className="rounded-[12px] bg-gray-50 w-auto p-[20px] flex flex-col grow">
                <span className="text-gray-500 font-normal text-[14px]">
                  {customer360MetricConfig?.invoiced_arr?.display_name ??
                    'Invoiced ARR'}
                </span>
                <p className="text-[36px] text-gray-900 font-[700] flex gap-3">
                  <span>{configSymbolValue}</span>
                  <span>
                    {formatRevenue(
                      customerCommercialsDetails?.customer_metrics
                        ?.invoiced_arr ?? 0,
                      configCurrencyValue
                    )}
                  </span>
                </p>
              </div>
            )}
          </div>
        )}

        <div className="flex border-b border-gray-200 space-x-6 pt-4">
          <button
            className={`pb-2 text-[14px] font-medium ${
              activeTab === 'contracts'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-blue-600'
            }`}
            onClick={() => handleTabClick('contracts')}
          >
            Contracts
          </button>
          <button
            className={`pb-2 text-[14px] font-medium ${
              activeTab === 'invoices'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-blue-600'
            }`}
            onClick={() => handleTabClick('invoices')}
          >
            Invoices
          </button>
        </div>
        {activeTab === 'contracts' &&
          Array.isArray(customer_contracts) &&
          customer_contracts?.length > 0 && (
            <>
              {/* <p className="text-[14px] text-gray-500 pt-[16px] pb-[12px] font-normal rounded-lg">
              Contracts
            </p> */}
              <div className="w-full mt-[16px] mb-[12px]">
                <TableContainer
                  isPagination={true}
                  columns={columns ?? []}
                  data={customer_contracts ?? []}
                  // customPageSize={5}
                  // isGlobalFilter={true}
                  searchTerm={''}
                  divclassName=" col-span-12 overflow-x-auto lg:col-span-12 border border-gray-200 rounded-xl"
                  tableclassName="border-gray-200 shadow-sm dataTable w-full dataTable w-full text-sm align-middle whitespace-nowrap no-footer"
                  theadclassName="border-gray-200 dark:border-zink-500"
                  tbodyclassName="divide-y border-gray-200 border-b-rounded-xl divide-gray-200 dark:divide-zink-500 text-center"
                  thclassName="p-3 divide-y sorting !px-[20px] py-[10px] text-[14px] text-[#202B37] bg-gray-50 font-medium text-center dark:text-zink-50 dark:bg-zink-600 dark:group-[.bordered]:border-zink-500 sorting_asc"
                  tdclassName="p-3 group-[.bordered]:border px-[20px] text-gray-800 text-sm font-normal group-[.bordered]:border-gray-200 group-[.bordered]:dark:border-zink-500"
                  PaginationClassName="flex flex-col items-center mt-5 md:flex-row"
                  emptyPlaceHolderForTable="No data"
                />
              </div>
            </>
          )}
        {activeTab === 'contracts' &&
          Array.isArray(customer_contracts) &&
          customer_contracts?.length === 0 && (
            <p className="text-[14px] text-gray-500 pt-[16px] pb-[12px] font-normal rounded-lg">
              No Contracts Found
            </p>
          )}
        {activeTab === 'invoices' &&
          Array.isArray(customer_invoices) &&
          customer_invoices?.length > 0 && (
            <>
              {/* <p className="text-[14px] text-gray-500 pt-[16px] pb-[12px] font-normal rounded-lg">
              Invoices
            </p> */}
              <div className="w-full mt-[16px] mb-[12px]">
                <TableContainer
                  isPagination={true}
                  columns={invoiceColumns ?? []}
                  data={customer_invoices ?? []}
                  // customPageSize={5}
                  searchTerm={''}
                  divclassName="col-span-12 overflow-x-auto lg:col-span-12 border border-gray-200 rounded-xl"
                  tableclassName="border-gray-200 shadow-sm dataTable w-full text-sm align-middle whitespace-nowrap no-footer"
                  theadclassName="border-gray-200 dark:border-zink-500"
                  tbodyclassName="divide-y border-gray-200 divide-gray-200 dark:divide-zink-500 text-center"
                  thclassName="p-3 px-[20px] py-[10px] text-[14px] text-[#202B37] bg-gray-50 font-medium text-center dark:text-zink-50 dark:bg-zink-600 sorting_asc"
                  tdclassName="p-3 px-[20px] text-gray-800 text-sm font-normal"
                  PaginationClassName="flex flex-col items-center mt-5 md:flex-row"
                  emptyPlaceHolderForTable="No invoices data"
                />
              </div>
            </>
          )}
        {activeTab === 'invoices' &&
          Array.isArray(customer_invoices) &&
          customer_invoices?.length === 0 && (
            <p className="text-[14px] text-gray-500 pt-[16px] pb-[12px] font-normal rounded-lg">
              No Invoices Found
            </p>
          )}
      </div>
    )
  );
};
export default AnnualCommercialValues;
