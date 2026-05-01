'use client';

import { useQuery } from '@tanstack/react-query';
import LandingSkeleton from './components/LandingSkeleton';
import {
  getAllChecklistItems,
  getAllPriorityCustomerOverView,
  getAllPriorityTasks,
  getEventsAndReferences,
  getPriorityEmails,
  getPrioritySignalsAndOpportunites,
} from '../../api/priorities/priorities';
import { apiRequest } from '../../../common/api-request';
import { HoverIcon } from '../../assests/icons/icons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Tabs from './components/tabs';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { toast } from 'react-toastify';
import TaskCard from '../tasks/taskCard';
// import { getAllTasksStatus } from '../../api/tasks/tasks';
// import { getUsers } from '../../api/users/users';
import {
  useCreateChecklistItem,
  useDeleteChecklistItem,
  useMoveChecklistItems,
  useUpdateChecklistItem,
} from '../../../services/mutations/prioritiesMutations';
import PriorityEmails from './components/priorityEmails';

import PriorityCustomers from './components/priorityCustomers';
import References from './components/references';
import CheckList from './components/checklist';
import { getportfolioTeam } from '../../api/my-team/my-team';
import { formatRevenue } from '../../../common/SupportFunctions';

import { useMixpanel } from '../../../common/mixpanel/useMixpanel';
import { getMyTeamConfigs } from '../../api/customers/customers';
import { Notes } from './components/priorityNotes';
import { PrioritySignalCard } from './components/prioritySignalCard';
import Link from 'next/link';
export default function Priorities() {
  dayjs.extend(relativeTime);

  const [referencesType, setReferencesType] = useState('all');
  const [overviewType, setOverviewType] = useState('All');
  const [checkListTitle, setCheckListTitle] = useState('');
  const [addChecklist, setAddChecklist] = useState(false);
  const [hoverId, setHoverId] = useState('');
  const createCheklist = useCreateChecklistItem();
  const updateChecklist = useUpdateChecklistItem();
  const deleteChecklist = useDeleteChecklistItem();
  const moveCheklistItem = useMoveChecklistItems();
  const [visibleId, setVisibleId] = useState('');
  const [pickDate, setPickDate] = useState(null);
  const [titleErrorMes, setTitleErrorMsg] = useState('');
  const [onHover, setOnHover] = useState('');
  const [draggedItemData, setDraggedItemData] = useState<{
    ref_type: string; // "task","insight","customer","stackholder_dob","stackholder_work_anniversary","add-hoc"
    ref_id: string; // 54,null
    title: string;
    metadata: any;
    customer_id?: number;
  } | null>();
  const [draggedChecklistItemData, setDraggedChecklistItemData] =
    useState<any>();
  const [dragOverItemData, setDragOverItemData] = useState<{
    upper: number;
    lower: number;
  } | null>();
  // const [checkListItemPosition, setCheckListItemPosition] = useState<{
  //   upper: number;
  //   lower: number;
  // } | null>();

  const [checkListDate, setCheckListDate] = useState(
    dayjs().format('YYYY-MM-DD')
  );
  const { trackEvent, MIXPANEL_EVENTS } = useMixpanel();
  const {
    data: getPriorityPortfolioTeamData,
    isLoading: isPriorityPortfolioTeamDataLoading,
  } = useQuery({
    queryKey: ['getPriorityPortfolioTeamData'],
    queryFn: () => getportfolioTeam('year_to_date', true),
    refetchOnWindowFocus: false,
  });

  const [tabName, setTabName] = useState('insights');

  const { data: signalsAndOpportunities, isLoading: isSignalsAndOpportunitiesLoading } = useQuery({
    queryKey: ['prioritiesSignalsAndOpportunitiesData'],
    queryFn: () => getPrioritySignalsAndOpportunites(),
    refetchOnWindowFocus: false,
  });
  const { data: emails } = useQuery({
    queryKey: ['prioritiesEmailtData'],
    queryFn: () => getPriorityEmails(),
    refetchOnWindowFocus: false,
  });

  const { data: priorityTasks } = useQuery({
    queryKey: ['prioritiesTaskstData'],
    queryFn: () => getAllPriorityTasks(),
    refetchOnWindowFocus: false,
  });

  const { data: eventAndReferencesData, isLoading: isRefLoading } = useQuery({
    queryKey: ['eventAndReferences'],
    queryFn: () => getEventsAndReferences(),
    refetchOnWindowFocus: false,
  });

  const { data: PriorityCustomerOverView } = useQuery({
    queryKey: ['PriorityCustomerOverView'],
    queryFn: () => getAllPriorityCustomerOverView(),
    refetchOnWindowFocus: false,
  });

  const { data: checklistItems } = useQuery({
    queryKey: ['checklistItems', checkListDate],
    queryFn: () =>
      getAllChecklistItems(dayjs(checkListDate).format('YYYY-MM-DD')),
    refetchOnWindowFocus: false,
  });

  const { data: userinfo } = useQuery({
    queryKey: ['userDetails'],
    queryFn: () =>
      apiRequest({
        url: '/api/app-service/v1/userinfo?is_email_encrypt=true',
      }),
  });

  const { data: myTeamConfigData } = useQuery({
    queryKey: ['myTeamConfigData'],
    queryFn: () => getMyTeamConfigs(),
    refetchOnWindowFocus: false,
  });

  // const { data: statusArr } = useQuery({
  //   queryKey: ['statusArr'],
  //   queryFn: () => getAllTasksStatus(),
  // });
  // const { data: existingUsers } = useQuery({
  //   queryKey: ['users'],
  //   queryFn: getUsers,
  // });

  function getInitial(name: any) {
    // Split the full name by spaces to get each part of the name
    const nameParts = name?.trim().split(' ');
    // Map through each part and get the first letter, then join them together
    const initials = nameParts
      ?.map((name: any) => name?.charAt(0).toUpperCase())
      .join('');
    return initials ? initials : 'NA';
  }

  const eventAndReferences = useMemo(() => {
    if (referencesType == 'all') {
      return eventAndReferencesData?.data?.data;
    } else if (referencesType == 'news') {
      return eventAndReferencesData?.data?.data?.filter(
        (item: any) => item?.type == 'news'
      );
    } else {
      return eventAndReferencesData?.data?.data?.filter(
        (item: any) => item?.type !== 'news'
      );
    }
  }, [referencesType, eventAndReferencesData?.data?.data]);

  const customerOverview = useMemo(() => {
    if (overviewType == 'All') {
      return PriorityCustomerOverView?.data?.data;
    } else if (overviewType == 'Yellow') {
      return PriorityCustomerOverView?.data?.data.filter(
        (item: any) => item?.overview_status === 'Yellow'
      );
    } else if (overviewType == 'Red') {
      return PriorityCustomerOverView?.data?.data.filter(
        (item: any) => item?.overview_status === 'Red'
      );
    } else if (overviewType == 'overdue') {
      return PriorityCustomerOverView?.data?.data.filter(
        (item: any) => item?.overdue === true
      );
    } else if (overviewType == 'near_renewal') {
      return PriorityCustomerOverView?.data?.data.filter(
        (item: any) => item?.near_to_renewal === true
      );
    }
  }, [overviewType, PriorityCustomerOverView?.data?.data]);

  const myTeamConfig = useMemo(() => {
    if (myTeamConfigData?.data) {
      return myTeamConfigData?.data?.value;
    } else {
      return {
        Accounts: { enabled: true, display_name: 'Accounts' },
        ARR: { enabled: true, display_name: 'ARR' },
        Renewals: { enabled: true, display_name: 'Renewals' },
        Renewal_revenue: { enabled: true, display_name: 'Renewal revenue' },
        NRR: { enabled: true, display_name: 'NRR' },
        Expected_billing: { enabled: false, display_name: 'Expected billing' },
        Actual_billed: { enabled: false, display_name: 'Actual billed' },
        Unpaid: { enabled: false, display_name: 'Unpaid' },
        Amount_overdue: { enabled: false, display_name: 'Amount overdue' },
        Invoiced_ARR: { enabled: false, display_name: 'Invoiced ARR' },
        Insights_acted: { enabled: true, display_name: 'Insights acted' },
        Tasks_done: { enabled: true, display_name: 'Tasks done' },
        opportunities: { enabled: true, display_name: 'Opportunities' },
        value_of_opportunities: {
          enabled: true,
          display_name: 'Value of opportunities',
        },
        opportunities_win_count: {
          enabled: false,
          display_name: 'Opportunities win count',
        },
        opportunities_win_value: {
          enabled: false,
          display_name: 'Opportunities win value',
        },
        opportunities_lost_count: {
          enabled: false,
          display_name: 'Opportunities lost count',
        },
        opportunities_lost_value: {
          enabled: false,
          display_name: 'Opportunities lost value',
        },
      };
    }
  }, [myTeamConfigData?.data]);

  const createCheklistItem = async () => {
    if (!checkListTitle) {
      // toast.error('Please enter checklist title');
      setTitleErrorMsg('Please enter checklist title');
      return;
    }
    try {
      const payload = {
        title: checkListTitle,
        ref_type: 'add-hoc',
        date: dayjs(checkListDate).format('YYYY-MM-DD'),
        seq_num:
          checklistItems?.data?.data?.length > 0
            ? checklistItems?.data?.data[0]?.seq_num - 1
            : 256,
      };
      const response = await createCheklist.mutateAsync(payload);

      if (response?.status == 200 || response?.status == 201) {
        trackChecklistEvent(MIXPANEL_EVENTS.CREATE_CHECKLIST, payload);
        setAddChecklist(false);
        setCheckListTitle('');
        // toast.success('Checklist item created successfully.');
      } else {
        toast.error(response?.data?.message || 'Failed to create checklist item');
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to create checklist item');
    }
  };

  const handleCheckList = async (item: any, moveType?: string) => {
    try {
      let upperItemSeqNum;
      let lowerItemSeqNum;
      if (!item?.is_completed) {
        upperItemSeqNum =
          checklistItems?.data?.data[checklistItems?.data?.data.length - 1]
            ?.seq_num;
      } else if (item?.is_completed) {
        const upperPossiton = checklistItems?.data?.data?.filter(
          (ele: any) => ele.is_completed == false
        );
        const lowerPossiton = checklistItems?.data?.data?.filter(
          (ele: any) => ele.is_completed == true
        );
        lowerItemSeqNum = lowerPossiton[0]?.seq_num;
        upperItemSeqNum =
          checklistItems?.data?.data[upperPossiton?.length - 1]?.seq_num;
      }
      let payload;
      if (moveType) {
        payload = {
          checklist_item_id: item?._id,
          date:
            moveType === 'next_day'
              ? dayjs(item?.date).add(1, 'day').format('YYYY-MM-DD')
              : moveType === 'day_after_next_day'
                ? dayjs(item?.date).add(2, 'day').format('YYYY-MM-DD')
                : '',
        };
      } else {
        payload = {
          is_completed: !item?.is_completed,
          checklist_item_id: item?._id,
          seq_num: calculateSeqNum(upperItemSeqNum, lowerItemSeqNum),
        };
      }
      const response = await updateChecklist.mutateAsync(payload);
      if (response?.status == 200 || response?.status == 201) {
        trackChecklistEvent(MIXPANEL_EVENTS.UPDATE_CHECKLIST, payload);
        toast.success('Checklist item updated successfully.');
      } else {
        toast.error(response?.data?.message || 'Failed to update checklist item');
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to update checklist item');
    }
  };

  const handleMovechecklistItem = async (date?: any) => {
    try {
      const response = await moveCheklistItem.mutateAsync(date);
      if (response?.status == 200 || response?.status == 201) {
        toast.success('Checklist item moved successfully.');
      } else {
        toast.error(response?.data?.message || 'Failed to move checklist item');
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to move checklist item');
    }
  };
  const deleteChecklistItem = async (checklist_item_id: any) => {
    try {
      const response = await deleteChecklist.mutateAsync(checklist_item_id);
      if (response?.status == 200 || response?.status == 201) {
        // toast.success('Checklist item deleted successfully.');
      } else {
        toast.error(response?.data?.message || 'Failed to delete checklist item');
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to delete checklist item');
    }
  };
  function calculateSeqNum(upperItemSeqNum: any, lowerItemSeqNum: any) {
    if (upperItemSeqNum && lowerItemSeqNum) {
      return (upperItemSeqNum + lowerItemSeqNum) / 2; // Dropped between two items
    } else if (!upperItemSeqNum && lowerItemSeqNum) {
      return lowerItemSeqNum / 2; // Dropped at the beginning, allows fractional values
    } else if (upperItemSeqNum && !lowerItemSeqNum) {
      return upperItemSeqNum + 256; // Dropped at the end, addition upper seq_num by 256
    } else {
      if (checklistItems?.data?.data?.length > 0) {
        return (
          checklistItems?.data?.data[checklistItems?.data?.data?.length - 1]
            ?.seq_num + 256
        );
      } else {
        return 256;
      }
    }
  }

  const drop = async (event: any) => {
    try {
      if (!draggedChecklistItemData?._id || draggedItemData?.title) {
        const payload = {
          title: draggedItemData?.title,
          ref_id: draggedItemData?.ref_id,
          ref_type: draggedItemData?.ref_type,
          date: checkListDate,
          seq_num: await calculateSeqNum(
            dragOverItemData?.upper,
            dragOverItemData?.lower
          ),
          metadata: draggedItemData?.metadata,
          customer_id: draggedItemData?.customer_id,
        };
        const response = await createCheklist.mutateAsync(payload);
        if (response?.status == 200 || response?.status == 201) {
          trackChecklistEvent(MIXPANEL_EVENTS.CREATE_CHECKLIST, payload);
          setDragOverItemData(null);
          setDraggedItemData(null);
          setAddChecklist(false);
          setCheckListTitle('');
          toast.success('Checklist item created successfully.');
        } else {
          toast.error(response?.data?.message || 'Failed to create checklist item');
        }
      } else {
        const payload = {
          checklist_item_id: draggedChecklistItemData._id,
          seq_num: await calculateSeqNum(
            dragOverItemData?.upper,
            dragOverItemData?.lower
          ),
          // customer_id: draggedChecklistItemData?.customer_id,
        };
        const response = await updateChecklist.mutateAsync(payload);
        if (response?.status == 200 || response?.status == 201) {
          trackChecklistEvent(MIXPANEL_EVENTS.UPDATE_CHECKLIST, payload);
          setDragOverItemData(null);
          toast.success('Checklist item updated successfully.');
        } else {
          toast.error(response?.data?.message || 'Failed to update checklist item');
        }
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to process checklist item');
      setDragOverItemData(null);
      setDraggedItemData(null);
    }
  };

  useEffect(() => {
    const updatePickDate = async () => {
      if (pickDate) {
        const payload = {
          checklist_item_id: visibleId,
          date: dayjs(pickDate).format('YYYY-MM-DD'),
        };

        const response: any = await updateChecklist.mutateAsync(payload);
        if (response?.status == 200 || response?.status == 201) {
          toast.success('Checklist item Moved successfully.');
        }
        setPickDate(null);
        setVisibleId('');
      }
    };

    updatePickDate();
  }, [pickDate]);

  const setVisibleIdEmpty = useCallback(
    (event: any) => {
      const calendarElem =
        document.getElementsByClassName('flatpickr-calendar')[0];
      if (
        !calendarElem?.contains(event.target) &&
        !event.target.closest?.('.dropdown-menu')
      ) {
        setVisibleId('');
      }
    },
    [setVisibleId]
  );

  useEffect(() => {
    document.addEventListener('mousedown', setVisibleIdEmpty);
    return () => {
      document.removeEventListener('mousedown', setVisibleIdEmpty);
    };
  }, [setVisibleIdEmpty]);

  const trackChecklistEvent = (event: any, payload: any) => {
    trackEvent(event, {
      title: payload?.title,
      ref_type: payload?.ref_type,
      ref_id: payload?.ref_id,
      check_list_date: payload?.date,
      seq_num: payload?.seq_num,
      is_completed: payload?.is_completed,
      checklist_item_id: payload?.checklist_item_id,
      environment: process.env.NODE_ENV,
      org_id: localStorage.getItem('org_id'),
    });
  };
  return (
    <>
      <div className="h-[calc(100vh-64px)] overflow-y-auto scroll">
        {!isSignalsAndOpportunitiesLoading ? (
          <div className=" w-[1200px] mx-auto h-fit">
            <div
              className="!w-[1200px] flex flex-row overflow-auto py-[40px] pr-[4px]"
              style={{
                scrollbarWidth: 'none',
              }}
            >
              <div className="flex flex-row justify-between w-full">
                <div className="min-w-[100px]  flex flex-row items-center gap-4">
                  <div className="flex flex-col">
                    <span className="text-[#637083] text-xs">Welcome</span>
                    <span className="text-[#202B37] text-[20px] font-semibold mt-0.5">
                      {userinfo?.data?.first_name}
                    </span>
                  </div>
                </div>

                {!isPriorityPortfolioTeamDataLoading ? (
                  <div className="justify-end gap-[50px] flex flex-row items-center">
                    {myTeamConfig?.Accounts?.enabled && (
                      <div className="flex flex-col">
                        <span className="text-[#637083] text-xs -mt-1">
                          {myTeamConfig?.Accounts?.display_name || 'Accounts'}
                        </span>
                        <span className="text-[#202B37] text-[18px] font-normal">
                          {
                            getPriorityPortfolioTeamData?.data?.data[0]
                              ?.total_customer_details_aggregate?.accounts
                          }
                        </span>
                      </div>
                    )}
                    {myTeamConfig?.ARR?.enabled && (
                      <div className="flex flex-col ">
                        <span className="text-[#637083] text-xs -mt-1">
                          {myTeamConfig?.ARR?.display_name || 'ARR'}
                        </span>

                        <span className="text-[#202B37] text-[18px] font-normal">
                          {
                            getPriorityPortfolioTeamData?.data?.data[0]
                              ?.client_currency?.currency_symbol
                          }
                          {formatRevenue(
                            getPriorityPortfolioTeamData?.data?.data[0]
                              ?.total_customer_details_aggregate?.arr,
                            getPriorityPortfolioTeamData?.data?.data[0]
                              ?.client_currency?.currency
                          )}
                        </span>
                      </div>
                    )}{' '}
                    {myTeamConfig?.Renewals?.enabled && (
                      <div className="flex flex-col ">
                        <span className="text-[#637083] text-xs -mt-1">
                          {myTeamConfig?.Renewals?.display_name || 'Renewals'}
                        </span>
                        <span className="text-[#202B37] text-[18px] font-normal ">
                          {
                            getPriorityPortfolioTeamData?.data?.data[0]
                              ?.total_customer_details_aggregate
                              ?.renewed_accounts_actual
                          }{' '}
                          /{' '}
                          {
                            getPriorityPortfolioTeamData?.data?.data[0]
                              ?.total_customer_details_aggregate
                              ?.renewed_accounts_opportunity
                          }
                        </span>
                      </div>
                    )}
                    {myTeamConfig?.Renewal_revenue?.enabled && (
                      <div className="flex flex-col ">
                        <span className="text-[#637083] text-xs -mt-1">
                          {myTeamConfig?.Renewal_revenue?.display_name ||
                            'Renewal revenue'}
                        </span>
                        <span className="text-[#202B37] text-[18px] font-normal">
                          {
                            getPriorityPortfolioTeamData?.data?.data[0]
                              ?.client_currency?.currency_symbol
                          }
                          {formatRevenue(
                            getPriorityPortfolioTeamData?.data?.data[0]
                              ?.total_customer_details_aggregate
                              ?.actual_renewal_value,
                            getPriorityPortfolioTeamData?.data?.data[0]
                              ?.client_currency?.currency
                          )}{' '}
                          /{' '}
                          {
                            getPriorityPortfolioTeamData?.data?.data[0]
                              ?.client_currency?.currency_symbol
                          }
                          {formatRevenue(
                            getPriorityPortfolioTeamData?.data?.data[0]
                              ?.total_customer_details_aggregate
                              ?.renewal_opportunity,
                            getPriorityPortfolioTeamData?.data?.data[0]
                              ?.client_currency?.currency
                          )}
                        </span>
                      </div>
                    )}{' '}
                    {myTeamConfig?.NRR?.enabled && (
                      <div className="flex flex-col ">
                        <span className="text-[#637083] text-xs -mt-1">
                          {myTeamConfig?.NRR?.display_name || 'NRR'}
                        </span>
                        <span className="text-[#202B37] text-[18px] font-normal">
                          {
                            getPriorityPortfolioTeamData?.data?.data[0]
                              ?.total_customer_details_aggregate?.nrr
                          }
                          %
                        </span>
                      </div>
                    )}{' '}
                    {myTeamConfig?.Expected_billing?.enabled && (
                      <div className="flex flex-col ">
                        <span className="text-[#637083] text-xs -mt-1">
                          {myTeamConfig?.Expected_billing?.display_name ||
                            'Expected billing'}
                        </span>

                        <span className="text-[#202B37] text-[18px] font-normal">
                          {
                            getPriorityPortfolioTeamData?.data?.data[0]
                              ?.client_currency?.currency_symbol
                          }
                          {formatRevenue(
                            getPriorityPortfolioTeamData?.data?.data[0]
                              ?.total_customer_details_aggregate?.expected_billing,
                            getPriorityPortfolioTeamData?.data?.data[0]
                              ?.client_currency?.currency
                          )}
                        </span>
                      </div>
                    )}{' '}
                    {myTeamConfig?.Actual_billed?.enabled && (
                      <div className="flex flex-col ">
                        <span className="text-[#637083] text-xs -mt-1">
                          {myTeamConfig?.Actual_billed?.display_name ||
                            'Actual billed'}
                        </span>

                        <span className="text-[#202B37] text-[18px] font-normal">
                          {
                            getPriorityPortfolioTeamData?.data?.data[0]
                              ?.client_currency?.currency_symbol
                          }
                          {formatRevenue(
                            getPriorityPortfolioTeamData?.data?.data[0]
                              ?.total_customer_details_aggregate?.actual_billed,
                            getPriorityPortfolioTeamData?.data?.data[0]
                              ?.client_currency?.currency
                          )}
                        </span>
                      </div>
                    )}{' '}
                    {myTeamConfig?.Unpaid?.enabled && (
                      <div className="flex flex-col ">
                        <span className="text-[#637083] text-xs -mt-1">
                          {myTeamConfig?.Unpaid?.display_name || 'Unpaid'}
                        </span>

                        <span className="text-[#202B37] text-[18px] font-normal">
                          {
                            getPriorityPortfolioTeamData?.data?.data[0]
                              ?.client_currency?.currency_symbol
                          }
                          {formatRevenue(
                            getPriorityPortfolioTeamData?.data?.data[0]
                              ?.total_customer_details_aggregate?.unpaid,
                            getPriorityPortfolioTeamData?.data?.data[0]
                              ?.client_currency?.currency
                          )}
                        </span>
                      </div>
                    )}{' '}
                    {myTeamConfig?.Amount_overdue?.enabled && (
                      <div className="flex flex-col ">
                        <span className="text-[#637083] text-xs -mt-1">
                          {myTeamConfig?.Amount_overdue?.display_name ||
                            'Amount overdue'}
                        </span>
                        <span className="text-[#202B37] text-[18px] font-normal">
                          {
                            getPriorityPortfolioTeamData?.data?.data[0]
                              ?.client_currency?.currency_symbol
                          }
                          {formatRevenue(
                            getPriorityPortfolioTeamData?.data?.data[0]
                              ?.total_customer_details_aggregate
                              ?.total_amount_overdue,
                            getPriorityPortfolioTeamData?.data?.data[0]
                              ?.client_currency?.currency
                          )}
                        </span>
                      </div>
                    )}{' '}
                    {myTeamConfig?.Invoiced_ARR?.enabled && (
                      <div className="flex flex-col ">
                        <span className="text-[#637083] text-xs -mt-1">
                          {myTeamConfig?.Invoiced_ARR?.display_name ||
                            'Invoiced ARR'}
                        </span>

                        <span className="text-[#202B37] text-[18px] font-normal">
                          {
                            getPriorityPortfolioTeamData?.data?.data[0]
                              ?.client_currency?.currency_symbol
                          }
                          {formatRevenue(
                            getPriorityPortfolioTeamData?.data?.data[0]
                              ?.total_customer_details_aggregate?.invoiced_arr,
                            getPriorityPortfolioTeamData?.data?.data[0]
                              ?.client_currency?.currency
                          )}
                        </span>
                      </div>
                    )}{' '}
                    {myTeamConfig?.Insights_acted?.enabled && (
                      <div className="flex flex-col ">
                        <span className="text-[#637083] text-xs -mt-1">
                          {myTeamConfig?.Insights_acted?.display_name ||
                            'Insights acted'}
                        </span>
                        <span className="text-[#202B37] text-[18px] font-normal">
                          {
                            getPriorityPortfolioTeamData?.data?.data[0]
                              ?.total_customer_details_aggregate?.insights_acted
                          }{' '}
                          /{' '}
                          {
                            getPriorityPortfolioTeamData?.data?.data[0]
                              ?.total_customer_details_aggregate
                              ?.customer_total_insights
                          }
                        </span>
                      </div>
                    )}{' '}
                    {myTeamConfig?.Tasks_done?.enabled && (
                      <div className="flex flex-col ">
                        <span className="text-[#637083] text-xs -mt-1">
                          {myTeamConfig?.Tasks_done?.display_name ||
                            'Tasks done'}
                        </span>
                        {/* <span className="text-[#202B37] text-[18px] font-normal">
                            {
                              getPriorityPortfolioTeamData?.data?.data[0]
                                ?.total_customer_details_aggregate?.tasks
                            }
                          </span> */}
                        <span className="text-[#202B37] text-[18px] font-normal">
                          {
                            getPriorityPortfolioTeamData?.data?.data[0]
                              ?.total_customer_details_aggregate?.tasks
                          }{' '}
                          /{' '}
                          {
                            getPriorityPortfolioTeamData?.data?.data[0]
                              ?.total_customer_details_aggregate
                              ?.customer_total_tasks
                          }
                        </span>
                      </div>
                    )}
                    {myTeamConfig?.opportunities?.enabled && (
                      <div className="flex flex-col ">
                        <span className="text-[#637083] text-xs -mt-1">
                          {myTeamConfig?.opportunities?.display_name ||
                            'Opportunities'}
                        </span>
                        <span className="text-[#202B37] text-[18px] font-normal">
                          {
                            getPriorityPortfolioTeamData?.data?.data[0]
                              ?.total_customer_details_aggregate?.opportunities
                          }
                        </span>
                      </div>
                    )}{' '}
                    {myTeamConfig?.value_of_opportunities?.enabled && (
                      <div className="flex flex-col ">
                        <span className="text-[#637083] text-xs -mt-1">
                          {myTeamConfig?.value_of_opportunities
                            ?.display_name || 'Value of opportunities'}
                        </span>
                        <span className="text-[#202B37] text-[18px] font-normal">
                          {
                            getPriorityPortfolioTeamData?.data?.data[0]
                              ?.client_currency?.currency_symbol
                          }
                          {formatRevenue(
                            getPriorityPortfolioTeamData?.data?.data[0]
                              ?.total_customer_details_aggregate
                              ?.value_of_opportunities,
                            getPriorityPortfolioTeamData?.data?.data[0]
                              ?.client_currency?.currency
                          )}
                          {/* {
                              getPriorityPortfolioTeamData?.data?.data[0]
                                ?.customer_details_aggregate
                                ?.value_of_opportunities
                            } */}
                        </span>
                      </div>
                    )}{' '}
                    {myTeamConfig?.opportunities_win_count?.enabled && (
                      <div className="flex flex-col ">
                        <span className="text-[#637083] text-xs -mt-1">
                          {myTeamConfig?.opportunities_win_count
                            ?.display_name || 'Opportunities win count'}
                        </span>
                        <span className="text-[#202B37] text-[18px] font-normal">
                          {getPriorityPortfolioTeamData?.data?.data[0]
                            ?.total_customer_details_aggregate
                            ?.opportunities_win_count ?? 0}
                        </span>
                      </div>
                    )}{' '}
                    {myTeamConfig?.opportunities_win_value?.enabled && (
                      <div className="flex flex-col ">
                        <span className="text-[#637083] text-xs -mt-1">
                          {myTeamConfig?.opportunities_win_value
                            ?.display_name || 'Opportunities win value'}
                        </span>
                        <span className="text-[#202B37] text-[18px] font-normal">
                          {
                            getPriorityPortfolioTeamData?.data?.data[0]
                              ?.client_currency?.currency_symbol
                          }
                          {formatRevenue(
                            getPriorityPortfolioTeamData?.data?.data[0]
                              ?.total_customer_details_aggregate
                              ?.opportunities_win_value,
                            getPriorityPortfolioTeamData?.data?.data[0]
                              ?.client_currency?.currency
                          )}
                          {/* {getPriorityPortfolioTeamData?.data?.data[0]
                              ?.customer_details_aggregate
                              ?.opportunities_win_value ?? 0} */}
                        </span>
                      </div>
                    )}{' '}
                    {myTeamConfig?.opportunities_lost_count?.enabled && (
                      <div className="flex flex-col ">
                        <span className="text-[#637083] text-xs -mt-1">
                          {myTeamConfig?.opportunities_lost_count
                            ?.display_name || 'Opportunities lost count'}
                        </span>
                        <span className="text-[#202B37] text-[18px] font-normal">
                          {getPriorityPortfolioTeamData?.data?.data[0]
                            ?.total_customer_details_aggregate
                            ?.opportunities_lost_count ?? 0}
                        </span>
                      </div>
                    )}{' '}
                    {myTeamConfig?.opportunities_lost_value?.enabled && (
                      <div className="flex flex-col ">
                        <span className="text-[#637083] text-xs -mt-1">
                          {myTeamConfig?.opportunities_lost_value
                            ?.display_name || 'Opportunities lost value'}
                        </span>
                        <span className="text-[#202B37] text-[18px] font-normal">
                          {
                            getPriorityPortfolioTeamData?.data?.data[0]
                              ?.client_currency?.currency_symbol
                          }
                          {formatRevenue(
                            getPriorityPortfolioTeamData?.data?.data[0]
                              ?.total_customer_details_aggregate
                              ?.opportunities_lost_value,
                            getPriorityPortfolioTeamData?.data?.data[0]
                              ?.client_currency?.currency
                          )}
                          {/* {getPriorityPortfolioTeamData?.data?.data[0]
                              ?.customer_details_aggregate
                              ?.opportunities_lost_value ?? 0} */}
                        </span>
                      </div>
                    )}{' '}
                    {(() => {
                      const node =
                        getPriorityPortfolioTeamData?.data?.data?.[0];
                      if (!node) return null;

                      const customAttrs =
                        node.total_customer_details_aggregate?.custom_attributes ??
                        {};
                      // myTeamConfig from your useMemo
                      return Object.entries(customAttrs)
                        .filter(
                          ([k]) =>
                            !!myTeamConfig?.[k] && myTeamConfig[k].enabled
                        ) // only enabled keys
                        .map(([k, v]) => {
                          // v can be a number (legacy) or an object { type, value, sum?, count? }
                          const attrObj =
                            typeof v === 'number'
                              ? { value: v }
                              : (v as any) || {};
                          const displayName =
                            myTeamConfig?.[k]?.display_name || k;

                          // Prefer value, then sum (for sums), then count (for counts), else 0
                          const rawValue =
                            attrObj.value ??
                            attrObj.sum ??
                            attrObj.count ??
                            0;

                          // Format number for display
                          const formatted =
                            typeof rawValue === 'number'
                              ? formatRevenue(rawValue)
                              : String(rawValue);

                          return (
                            <div
                              key={k}
                              className="flex flex-col pr-[24px] last:pr-[0px]"
                            >
                              <span className="text-[#637083] text-xs -mt-1">
                                {displayName}
                              </span>
                              <span className="text-[#202B37] text-[18px] font-normal">
                                {formatted}
                              </span>
                            </div>
                          );
                        });
                    })()}
                  </div>
                ) : (
                  <div className="justify-end gap-[50px] w-[600px] flex flex-row items-center  ">
                    {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                      <div
                        key={i}
                        className="flex w-[100px] flex-col gap-2 animate-pulse"
                      // style={{ animationDuration: `${1 + i}sec` }}
                      >
                        <div className="bg-gray-200 h-[18px] w-[54px] rounded-md"></div>
                        <div className="bg-gray-200 h-[18px] w-[88px] rounded-md"></div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex h-[585px] h-lt-900:h-[440px] gap-[20px]">
              <div className="flex flex-col gap-[16px] w-[750px]">
                <div className="flex justify-between gap-[16px]">
                  <Tabs
                    tabName={tabName}
                    setTabName={setTabName}
                    insightCount={signalsAndOpportunities?.data?.data?.total_count || 0}
                    emailCount={emails?.data?.total || 0}
                    taskCount={priorityTasks?.data?.total || 0}
                  />
                </div>
                <div className="border rounded-xl border-[#E4E7EC] bg-white h-[496px] h-lt-900:h-[364px] overflow-hidden scrollhide">
                  {tabName === 'insights' ? (
                    signalsAndOpportunities?.data?.data?.total_count !== 0 ? (
                      <div>
                        <div className="flex justify-between gap-[20px] p-[20px] text-[#97A1AF] text-xs border-b border-[#F2F4F7] ">
                          <div className="pl-6 w-[138px] flex justify-start">
                            Customer
                          </div>
                          <div className="flex-1">Insight </div>
                          <div className="w-[110px] flex justify-start">
                            Created
                          </div>
                        </div>
                        <div className=" h-[439px] h-lt-900:h-[306px] overflow-y-auto overflow-x-hidden scroll">
                          {signalsAndOpportunities?.data?.data?.items?.map((item: any) => (
                            <>
                              <Link
                                href={`${item?.collection_type === 'signal'
                                  ? `/app/customers/${item?.customer_id}?activeTab=open_issues`
                                  : `/app/insights/opportunities?selected=${item?._id}`
                                  }`}
                                // target="" //in same tab
                                rel="noopener noreferrer"
                                className="block relative cursor-pointer"
                                draggable={true}
                                onDragStart={(e) => {
                                  setDraggedItemData({
                                    ref_type: item?.collection_type === 'signal' ? 'openissues' : 'opportunity',
                                    ref_id: item?._id,
                                    title: item?.collection_type === 'signal'
                                      ? `Review  ${item?.customer_name}`
                                      : item?.title ||
                                      item?.insight_name,
                                    customer_id: item?.customer_id,
                                    metadata: null,
                                  });
                                }}
                                onDragEnd={(e) => {
                                  setDraggedItemData(null);
                                }}
                                onMouseEnter={() => setOnHover(item._id)}
                                onMouseLeave={() => setOnHover('')}
                              >
                                <PrioritySignalCard
                                  item={item}
                                // setDraggedItemData={setDraggedItemData}
                                />
                                {onHover === item._id && (
                                  <span className="absolute top-5 left-0 right-0 w-[40px]">
                                    <HoverIcon />
                                  </span>
                                )}
                              </Link>
                            </>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-center items-center h-full text-[#97A1AF]">
                        No priority signals and opportunities for your review
                      </div>
                    )
                  ) : tabName === 'emails' ? (
                    emails?.data?.total !== 0 ? (
                      <div>
                        <div className="flex  gap-[20px] p-[20px] text-[#97A1AF] text-xs border-b border-[#F2F4F7] ">
                          <div className="w-full">Emails </div>
                          <div className="w-[35px] pr-[21px]"> Time</div>
                        </div>
                        <div className="h-[439px] h-lt-900:h-[306px] overflow-y-auto scroll">
                          {emails?.data?.data?.map((email: any) => (
                            <PriorityEmails
                              email={email}
                              getInitials={getInitial}
                              key={email?._id}
                              setDraggedItemData={setDraggedItemData}
                            />
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-center items-center h-full text-[#97A1AF]">
                        No priority actions for your review
                      </div>
                    )
                  ) : tabName === 'tasks' ? (
                    priorityTasks?.data?.total !== 0 ? (
                      <div>
                        <div className="flex  gap-[20px] p-[20px] text-[#97A1AF] text-xs border-b border-[#F2F4F7] ">
                          <div className="w-full">Task </div>
                          <div className="w-[35px pr-[px]"> Scheduled</div>
                        </div>
                        <div className="h-[439px] h-lt-900:h-[306px] overflow-y-auto scroll">
                          <div className=" ">
                            {priorityTasks?.data?.data?.map((task: any) => (
                              <div
                                className="relative cursor-pointer border-b border-[#F2F4F7]"
                                draggable={true}
                                onDragStart={(e) => {
                                  setDraggedItemData({
                                    ref_type: 'task',
                                    ref_id: task?._id,
                                    title: task?.title,
                                    metadata: {},
                                    customer_id: task?.customer_id,
                                  });
                                }}
                                onDragEnd={(e) => {
                                  setDraggedItemData(null);
                                }}
                                onMouseEnter={() => setOnHover(task._id)}
                                onMouseLeave={() => setOnHover('')}
                              >
                                <div className="mx-[20px]">
                                  {' '}
                                  <TaskCard
                                    ele={task}
                                    // taskStatus={statusArr?.data?.data}
                                    // existingUsers={existingUsers?.data?.data}
                                    priorityTask={true}
                                  />
                                </div>
                                {onHover === task._id && (
                                  <span className="absolute top-6 ">
                                    <HoverIcon />
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-center items-center h-full text-[#97A1AF]">
                        No priority actions for your review
                      </div>
                    )
                  ) : tabName === 'notes' ? (
                    <>
                      <Notes
                        userId={userinfo?.data?.id}
                        content={userinfo?.data?.supervisor_note}
                      />
                    </>
                  ) : null}
                </div>
              </div>
              <div
                className={`w-[430px] h-full flex flex-col justify-between bg-white border border-[#637083] shadow-lg hover:border-[#637083]  rounded-[10px]  `}
              >
                <CheckList
                  setCheckListDate={setCheckListDate}
                  checkListDate={checkListDate}
                  drop={drop}
                  checklistItems={checklistItems}
                  handleMovechecklistItem={handleMovechecklistItem}
                  addChecklist={addChecklist}
                  setAddChecklist={setAddChecklist}
                  checkListTitle={checkListTitle}
                  setCheckListTitle={setCheckListTitle}
                  createCheklistItem={createCheklistItem}
                  setTitleErrorMsg={setTitleErrorMsg}
                  titleErrorMes={titleErrorMes}
                  setDraggedChecklistItemData={setDraggedChecklistItemData}
                  setDragOverItemData={setDragOverItemData}
                  handleCheckList={handleCheckList}
                  setHoverId={setHoverId}
                  hoverId={hoverId}
                  deleteChecklistItem={deleteChecklistItem}
                  visibleId={visibleId}
                  setPickDate={setPickDate}
                  setVisibleId={setVisibleId}
                  onHover={onHover}
                  setOnHover={setOnHover}
                />
              </div>
            </div>
            <div className="flex mt-[40px] mb-[40px] h-[500px] overflow-hidden gap-[20px] rounded-lg">
              <div className="w-[750px] border border-[#E4E7EC] rounded-xl overflow-hidden">
                <div>
                  <div className="flex p-[20px] border-b border-[#F2F4F7] gap-[12px]">
                    <span
                      className={
                        overviewType === 'All'
                          ? 'inline bg-[#3B82F6] px-[12px] py-[4px] text-white text-[14px] !font-medium rounded-[150px] dark:bg-custom-500/20 dark:border-transparent cursor-pointer'
                          : 'inline bg-[#F2F4F7] px-[12px] py-[4px] text-[#344051] text-[14px] !font-medium rounded-[150px] dark:bg-custom-500/20 dark:border-transparent cursor-pointer'
                      }
                      onClick={() => setOverviewType('All')}
                    >
                      All
                    </span>
                    <span
                      className={
                        overviewType === 'Yellow'
                          ? 'inline bg-[#3B82F6] px-[12px] py-[4px] text-white text-[14px] !font-medium rounded-[150px] dark:bg-custom-500/20 dark:border-transparent cursor-pointer'
                          : 'inline bg-[#F2F4F7] px-[12px] py-[4px] text-[#344051] text-[14px] !font-medium rounded-[150px] dark:bg-custom-500/20 dark:border-transparent cursor-pointer'
                      }
                      onClick={() => setOverviewType('Yellow')}
                    >
                      Yellow (
                      {PriorityCustomerOverView?.data?.overview_counts
                        ?.status_yellow
                        ? PriorityCustomerOverView?.data?.overview_counts
                          ?.status_yellow
                        : 0}
                      )
                    </span>
                    <span
                      className={
                        overviewType === 'Red'
                          ? 'inline bg-[#3B82F6] px-[12px] py-[4px] text-white text-[14px] !font-medium rounded-[150px] dark:bg-custom-500/20 dark:border-transparent cursor-pointer'
                          : 'inline bg-[#F2F4F7] px-[12px] py-[4px] text-[#344051] text-[14px] !font-medium rounded-[150px] dark:bg-custom-500/20 dark:border-transparent cursor-pointer'
                      }
                      onClick={() => setOverviewType('Red')}
                    >
                      Red (
                      {PriorityCustomerOverView?.data?.overview_counts
                        ?.status_red
                        ? PriorityCustomerOverView?.data?.overview_counts
                          ?.status_red
                        : 0}
                      )
                    </span>
                    <span
                      className={
                        overviewType === 'near_renewal'
                          ? 'inline bg-[#3B82F6] px-[12px] py-[4px] text-white text-[14px] !font-medium rounded-[150px] dark:bg-custom-500/20 dark:border-transparent cursor-pointer'
                          : 'inline bg-[#F2F4F7] px-[12px] py-[4px] text-[#344051] text-[14px] !font-medium rounded-[150px] dark:bg-custom-500/20 dark:border-transparent cursor-pointer'
                      }
                      onClick={() => setOverviewType('near_renewal')}
                    >
                      Near renewal (
                      {PriorityCustomerOverView?.data?.overview_counts
                        ?.near_to_renewal
                        ? PriorityCustomerOverView?.data?.overview_counts
                          ?.near_to_renewal
                        : 0}
                      )
                    </span>
                    <span
                      className={
                        overviewType === 'overdue'
                          ? 'inline bg-[#3B82F6] px-[12px] py-[4px] text-white text-[14px] !font-medium rounded-[150px] dark:bg-custom-500/20 dark:border-transparent cursor-pointer'
                          : 'inline bg-[#F2F4F7] px-[12px] py-[4px] text-[#344051] text-[14px] !font-medium rounded-[150px] dark:bg-custom-500/20 dark:border-transparent cursor-pointer'
                      }
                      onClick={() => setOverviewType('overdue')}
                    >
                      Overdue (
                      {PriorityCustomerOverView?.data?.overview_counts
                        ?.overdue
                        ? PriorityCustomerOverView?.data?.overview_counts
                          ?.overdue
                        : 0}
                      )
                    </span>
                  </div>
                  <div className=" border-[#E4E7EC]">
                    <PriorityCustomers
                      setDraggedItemData={setDraggedItemData}
                      customerOverview={customerOverview}
                      setOnHover={setOnHover}
                      onHover={onHover}
                    />
                  </div>
                </div>
              </div>
              <div
                className={`w-[430px] border border-[#E4E7EC] rounded-xl overflow-hidden ${isRefLoading ? 'animate-pulse' : ''
                  }`}
              >
                <References
                  referencesType={referencesType}
                  setReferencesType={setReferencesType}
                  eventAndReferences={eventAndReferences}
                  setDraggedItemData={setDraggedItemData}
                  getInitial={getInitial}
                  setOnHover={setOnHover}
                  onHover={onHover}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-pulse h-[cal(100vh-28rem)] overflow-hidden">
            <LandingSkeleton />
          </div>
        )}
      </div>
    </>
  );
}
