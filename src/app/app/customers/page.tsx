'use client';

import { useQuery } from '@tanstack/react-query';
import { getCustomersOverviewData } from '../../api/customers-overview/customers-overview';
import TreeMapChart2 from './components/treeMapChart2';
import { useState, useMemo } from 'react';
import { FilePlusIcon } from '../../assests/icons/icons';
import { apiRequest } from '../../../common/api-request';
import Loading from '../../../common/components/loading';

const CustomerOverviewPage = () => {
  const { data: customersOverviewData, isLoading } = useQuery({
    queryKey: ['customers-overview-data'],
    queryFn: () => getCustomersOverviewData(),
    refetchOnWindowFocus: false,
  });

  const [selectedCustomers, setSelectedCustomers] = useState<number[]>([]);

  const { data: userinfo } = useQuery({
    queryKey: ['info'],
    queryFn: () =>
      apiRequest({
        url: '/api/app-service/v1/userinfo?is_email_encrypt=true',
      }),
    refetchOnWindowFocus: false,
  });

  // Memoize the actual customer data to ensure proper re-renders

  const customerData = useMemo(() => {
    return customersOverviewData?.data?.data || [];
  }, [customersOverviewData]);

  // Memoize the empty state check
  const hasCustomers = useMemo(() => {
    return customerData.length > 0;
  }, [customerData.length]);

  return isLoading ? (
    <Loading />
  ) : (
    <div className="h-[calc(100vh-64px)] overflow-x-hidden overflow-y-auto scroll">
      <div className="max-w-[1200px] mx-auto h-content pb-4">
        {hasCustomers ? (
          <TreeMapChart2
            data={customerData}
            highestOpenSignal={customersOverviewData?.data?.highest_open_signal || 0}
            highestCriticalSignal={customersOverviewData?.data?.highest_critical_signal || 0}
            highestArr={customersOverviewData?.data?.highestFinacialvalues?.highest_financial_value || 0}
            selectedCustomers={selectedCustomers}
            setSelectedCustomers={setSelectedCustomers}
          />
        ) : (
          <div className="flex flex-col gap-5 items-center w-full h-screen">
            <div className="flex flex-col items-center pt-[150px] gap-5">
              <span>
                <FilePlusIcon className="text-[#141C24]" />
              </span>
              <div className="flex text-center !text-[#141C24] !font-normal">
                {' '}
                {userinfo?.data?.first_name}, you do not have any customer mapped
                to your account.
                <br />
                Please contact admin.
                <br />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerOverviewPage;
