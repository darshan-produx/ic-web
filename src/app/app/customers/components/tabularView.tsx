'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  CustomerStarredFillIcon,
  SearchIconCustomerPage,
} from '../../../assests/icons/icons';
import { ChevronDown } from 'lucide-react';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/light.css';
import { getExpressionSvgIcon } from '../[id]/journey/signalCard';

type PillarStatus = {
  pillar: string;
  status: string;
};

interface ConfigValues {
  enabled: boolean;
  display_name: string;
  order: number;
}

type CustomerData = {
  customer_id: number;
  customer_name: string;
  pillar_statuses: PillarStatus[];
};

type TabularViewProps = {
  data: CustomerData[];
  config: Record<string, ConfigValues>;
  userinfo: any;
  setSelectedSignalId: any;
  setIsSignalDrawerOpen: any;
  searchText?: string;
  isSearch?: boolean;
  isOn?: boolean;
  setSearchText?: any;
  isCustomer360Page?: boolean;
};

const TabularView: React.FC<any> = ({
  data,
  config,
  userinfo,
  setSelectedSignalId,
  setIsSignalDrawerOpen,
  searchText,
  isSearch,
  isOn,
  setSearchText,
  isCustomer360Page = false,
}: TabularViewProps) => {
  const [dropdownId, setDropdownId] = useState(0);
  const [isTableOpen, setIsTableOpen] = useState(true);

  const getClass = (value?: string) => {
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
  const HeaderArr =
    (Object.entries((config as Record<string, ConfigValues>) ? config : {})
      .filter(([key, value]) => key !== 'PurchasesAndRenewals')
      .sort((a, b) => {
        return a[1].order - b[1].order;
      })
      .map(([key, value]) =>
        value?.enabled ? { key, displayName: value?.display_name } : null
      )
      .filter(Boolean) as { key: string; displayName: string }[]) || [];

  function getPillarRef(pillarName: any) {
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
  }

  // const getPillarWidth = (pillarName: string) => {
  //   switch (pillarName) {
  //     case 'OpenIssues':
  //       return 'w-[120px]';
  //     case 'NPS':
  //       return 'w-[94px]';
  //     case 'Adoption':
  //       return 'w-[120px]';
  //     case 'Impact':
  //       return 'w-[120px]';
  //     case 'Performance':
  //       return 'w-[160px]';
  //     case 'CustomerService':
  //       return 'w-[220px]';
  //     case 'Projects':
  //       return 'w-[130px]';
  //     case 'Stakeholder':
  //       return 'w-[160px]';
  //     default:
  //       return '';
  //   }
  // };
  function getUserName(row: any) {
    const users = row?.users;
    const userCount = row?.users?.length || 0;

    if (userCount > 1) {
      const isCurrentUserIncluded = users?.some(
        (user: any) => user?.user_id === userinfo?.id
      );

      if (isCurrentUserIncluded) {
        const currentUser = users?.find(
          (user: any) => user?.user_id === userinfo?.id
        );
        return `${currentUser?.user_first_name} +${userCount - 1} more`;
      } else {
        return `${users?.[0]?.user_first_name} +${userCount - 1} more`;
      }
    } else {
      return `${users?.[0]?.user_first_name} ${users?.[0]?.user_last_name}`;
    }
  }

  const renderCell = (
    pillarName: string,
    statuses: PillarStatus[],
    index: number,
    customer_id: number,
    is_active?: boolean,
    signal_details?: any
  ) => {
    const pillarAlt = pillarName === 'Impact' ? 'Business' : pillarName;
    const statusObj = statuses?.find(
      (status) => status.pillar === pillarName || status.pillar === pillarAlt
    );
    const status = statusObj?.status?.toLowerCase() || 'Unknown';
    const displayText =
      status === 'green'
        ? 'Good'
        : status === 'yellow'
        ? 'Average'
        : status === 'red'
        ? 'Poor'
        : '-';

    const getsignalText = (allOpen: number, critical: number) => {
      if (allOpen === 0 && critical === 0) return ' - ';
      if (allOpen <= 0) return ' - ';
      if (critical <= 0) return `${allOpen}`;
      // when there are criticals
      return allOpen === critical
        ? `${allOpen} critical`
        : `${allOpen} (${critical} critical)`;
    };
    return (
      <td
        className={`h-10 p-[8px] border-l-[1px] border-gray-200 flex-1 w-[167px]`}
        key={index}
      >
        {is_active ? (
          <Link
            href={
              pillarName == 'NPS'
                ? `/app/customers/${customer_id}?activeTab=view`
                : pillarName == 'OpenIssues'
                ? `/app/customers/${customer_id}?activeTab=open_issues`
                : `/app/customers/${customer_id}?activeTab=view&selected=${getPillarRef(
                    pillarName
                  )}`
            }
            className={`h-6 px-[4px] py-[4px] flex  items-center text-[12px] font-[600] leading-[16px] rounded-[4px]  ${
              pillarName == 'OpenIssues'
                ? 'text-[#202B37] text-[14px] font-normal justify-start hover:text-blue-500'
                : getClass(status)
            } cursor-pointer hover:opacity-90`}
          >
            {pillarName == 'OpenIssues'
              ? `${getsignalText(
                  signal_details?.open_signals || 0,
                  signal_details?.critical_issues || 0
                )}`
              : displayText}
          </Link>
        ) : (
          <div
            className={`h-6 px-[4px] py-[4px] flex justify-center items-center text-[12px] font-[600] leading-[16px] rounded-[4px] bg-[#E4E7EC] text-[#202B37] cursor-not-allowed`}
          >
            NA
          </div>
        )}
      </td>
    );
  };
  return (
    <div className="overflow-x-auto border rounded-[12px] w-full  border-[#E4E7EC] overflow-hidden">
      {isTableOpen ? (
        <table className="min-w-full bg-white ">
          <thead>
            <tr className="bg-[#F9FAFB]  border-[#E4E7EC]">
              <th
                className={`${
                  isCustomer360Page ? 'w-[160px]' : 'w-[200px]'
                } h-10 border-r-[1px] rounded-tl-[12px] border-[#E4E7EC] font-[500] text-[14px] leading-5 text-[#202B37]`}
              >
                {isSearch ? (
                  <div className="relative xl:col-span-2 w-[150px]">
                    <input
                      type="text"
                      className="px-8 search form-input bg-[#F9FAFB] border-none focus:outline-none disabled:bg-slate-100 dark:disabled:bg-zink-600 disabled:border-slate-300 dark:disabled:border-zink-500 dark:disabled:text-zink-200 disabled:text-slate-500 dark:text-zink-100 dark:bg-zink-700 dark:focus:border-custom-800 placeholder:text-slate-400 dark:placeholder:text-zink-200"
                      placeholder="Search "
                      autoComplete="off"
                      autoFocus
                      value={searchText}
                      onChange={(e: any) => setSearchText(e?.target?.value)}
                    />
                    <div className="inline-block size-4 absolute left-2 top-2.5 text-slate-500 dark:text-zink-200 fill-slate-100 dark:fill-zink-600">
                      <SearchIconCustomerPage />
                    </div>
                  </div>
                ) : (
                  <div
                    className="flex xl:col-span-2 w-[150px] items-center px-[4px] gap-1 cursor-pointer"
                    onClick={() => setIsTableOpen(!isTableOpen)}
                  >
                    <span className="">
                      <ChevronDown
                        className={`w-[18px] h-[18px] ${
                          !isTableOpen && 'rotate-180'
                        }`}
                      />
                    </span>{' '}
                    Accounts
                  </div>
                )}
              </th>
              {HeaderArr?.map((header) => (
                <th
                  key={header?.key}
                  className={`w-[167px] h-10 border-l-[1px] border-gray-200 font-medium text-sm leading-5 text-[#202B37] flex-1 pl-2 ${
                    header?.key == 'OpenIssues' ? 'text-left' : ''
                  }`}
                >
                  <span className="font-medium text-sm leading-5 text-[#202B37]">
                    {header?.displayName}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          {data?.length > 0 && isTableOpen && (
            <tbody>
              {data?.map((row: any, i: number) => (
                <>
                  <tr
                    key={row?.customer_id}
                    className={`${
                      i == data?.length - 1 ? '' : 'border-b-[1px]'
                    } border-gray-200 overflow-hidden`}
                  >
                    <td className="border-r-[1px] border-gray-200">
                      <div
                        className={`flex ${
                          !row?.is_group && isOn ? 'pl-[4px]' : 'pl-[4px]'
                        }`}
                      >
                        {row?.is_group && isOn && (
                          <div
                            className="pt-2"
                            onClick={() =>
                              dropdownId === row.customer_id
                                ? setDropdownId(0)
                                : setDropdownId(row.customer_id)
                            }
                          >
                            <button>
                              <ChevronDown
                                className={`w-[24px] h-[24px]  ${
                                  dropdownId === row.customer_id
                                    ? 'rotate-180'
                                    : ''
                                }`}
                              />
                            </button>
                          </div>
                        )}
                        <Link
                          href={`/app/customers/${row?.customer_id}?activeTab=view`}
                          // className="absolute inset-0 z-0"
                        >
                          <div className="flex flex-col hover:text-[#3B82F6] text-[#202B37] justify-start items-start pl-[4px] pr-[8px] py-[10px] font-[400] text-[14px] leading-5 cursor-pointer">
                            <div className="flex items-center gap-1">
                              <span className="">{row?.customer_name} </span>
                              {row?.is_starred && (
                                <CustomerStarredFillIcon className="inline w-5 h-5 text-[#3B82F6] transition-colors flex-shrink-0" />
                              )}
                            </div>
                            {row?.is_group ? (
                              <span className="text-[#97A1AF] text-[12px]">
                                {row?.associated_customers?.length} accounts
                              </span>
                            ) : (
                              <Tippy
                                key={row?.customer_id}
                                content={
                                  <div className="flex flex-col w-fit">
                                    <span className="text-[16px] font-medium text-[#141C24]">
                                      Users:
                                    </span>
                                    <span className="text-xs font-normal text-[#414E62] flex flex-col gap-1">
                                      {row?.users && row?.users.length > 0 ? (
                                        row?.users.map(
                                          (user: any, idx: number) => (
                                            <span
                                              key={idx}
                                            >{`${user?.user_first_name} ${user?.user_last_name}`}</span>
                                          )
                                        )
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
                                followCursor={true}
                                interactive={false}
                                animation="scale"
                                duration={0}
                              >
                                <span className="text-[12px] text-[#97A1AF]">
                                  {getUserName(row) || 'No users assigned'}
                                </span>
                              </Tippy>
                            )}
                          </div>
                        </Link>
                        <div
                          className="flex items-center justify-end ml-auto pr-2 cursor-pointer"
                          onClick={() => {
                            setSelectedSignalId(
                              row?.signal_details?.one_signal?._id
                            );
                            setIsSignalDrawerOpen(true);
                          }}
                        >
                          {row?.signal_details?.one_signal
                            ? row?.signal_details?.one_signal?.signal_types?.includes(
                                'appreciation'
                              )
                              ? getExpressionSvgIcon(
                                  'appreciation',
                                  '#249782',
                                  'w-[16.87px] h-[17.53px] font-normal mb-[1px]'
                                )
                              : getExpressionSvgIcon(
                                  'information',
                                  '#202B37',
                                  'w-4 h-4 font-normal'
                                )
                            : null}
                        </div>
                      </div>
                    </td>
                    {HeaderArr?.map((pillar: any, index: number) =>
                      renderCell(
                        pillar?.key,
                        row?.pillar_statuses,
                        index,
                        row?.customer_id,
                        row?.is_active,
                        row?.signal_details
                      )
                    )}
                  </tr>

                  {row?.associated_customers?.length > 0 &&
                    isOn &&
                    dropdownId === row?.customer_id &&
                    row?.associated_customers?.map(
                      (child: any, index: number) => (
                        <tr
                          key={child?.customer_id}
                          className="overflow-hidden bg-[#F9FAFB] shadow-md"
                        >
                          <td className="border-r-[1px] border-gray-300 pl-[34px]">
                            <div className="flex">
                              <Link
                                href={`/app/customers/${child?.customer_id}?activeTab=view`}
                              >
                                <div className="flex flex-col hover:text-[#3B82F6] text-[#202B37] justify-start items-start pr-[8px] py-[10px] font-[400] text-[14px] leading-5 cursor-pointer">
                                  <div className="flex items-center gap-1">
                                    <span className="">
                                      {child?.customer_name}
                                    </span>
                                    {child?.is_starred && (
                                      <CustomerStarredFillIcon className="inline w-5 h-5 text-[#3B82F6] transition-colors flex-shrink-0" />
                                    )}
                                  </div>
                                  <Tippy
                                    key={child?.customer_id}
                                    content={
                                      <div className="flex flex-col w-fit">
                                        <span className="text-[16px] font-medium text-[#141C24]">
                                          Users:
                                        </span>
                                        <span className="text-xs font-normal text-[#414E62] flex flex-col gap-1">
                                          {child?.users &&
                                          child?.users.length > 0 ? (
                                            child?.users.map(
                                              (user: any, idx: number) => (
                                                <span
                                                  key={idx}
                                                >{`${user?.user_first_name} ${user?.user_last_name}`}</span>
                                              )
                                            )
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
                                    followCursor={true}
                                    interactive={false}
                                    animation="scale"
                                    duration={0}
                                  >
                                    <span className="text-[12px] text-[#97A1AF]">
                                      {getUserName(child) ||
                                        'No users assigned'}
                                    </span>
                                  </Tippy>
                                </div>
                              </Link>
                              <div
                                className="flex items-center justify-end ml-auto pr-2 cursor-pointer"
                                onClick={() => {
                                  setSelectedSignalId(
                                    child?.signal_details?.one_signal?._id
                                  );
                                  setIsSignalDrawerOpen(true);
                                }}
                              >
                                {child?.signal_details?.one_signal
                                  ? child?.signal_details?.one_signal?.signal_types?.includes(
                                      'appreciation'
                                    )
                                    ? getExpressionSvgIcon(
                                        'appreciation',
                                        '#249782',
                                        'w-[16.87px] h-[17.53px] font-normal mb-[1px]'
                                      )
                                    : getExpressionSvgIcon(
                                        'information',
                                        '#202B37',
                                        'w-4 h-4 font-normal'
                                      )
                                  : null}
                              </div>
                            </div>
                          </td>
                          {HeaderArr?.map((pillar: any, index: number) =>
                            renderCell(
                              pillar?.key,
                              child.pillar_statuses,
                              index,
                              child.customer_id,
                              child?.is_active,
                              child?.signal_details
                            )
                          )}
                        </tr>
                      )
                    )}
                </>
              ))}
            </tbody>
          )}
        </table>
      ) : (
        <div
          className="flex h-[40px] bg-white items-center gap-2 text-[#202B37] text-[14px] w-full justify-center cursor-pointer"
          onClick={() => setIsTableOpen(true)}
        >
          <span className="pt-[1px]">
            <ChevronDown className="h-5 w-5" />
          </span>
          <span>See Accounts</span>
        </div>
      )}
    </div>
  );
};

export default TabularView;
