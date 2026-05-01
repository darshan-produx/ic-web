'use client';

import { Dropdown } from '../../../../common/Dropdown';
import { ChevronDown, Search } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  NoMeetingIcon,
  PowerIcon,
  SearchIconMyTeamSearchPage,
  UploadIcon,
} from '../../../assests/icons/icons';
import MeetingCard from './components/meetingCard';
import UploadTranscriptModal from './components/uploadTranscriptModal';
import { useQuery } from '@tanstack/react-query';
import {
  getAllMyTeamCustomers,
  getCustomerMeetings,
} from '../../../api/communication/communication';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';
import { useDeleteMeeting } from '../../../../services/mutations/communicationMutations';
import Loading from '../../../../common/components/loading';
import ConfirmationPopUp from './components/confirmationPopUp';
import Modal from '../../../../common/Modal';
import ComposeEmail from '../../emails/components/ComposeEmailModal';
import { escapeRegExp } from '../../../utils/constant';
import { getAllCustomersStakeholders } from '../../../api/emails/emails';
import { marked } from 'marked';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import MeetingDetails from './components/meetingDetails';
import { apiRequest } from '../../../../common/api-request';
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

export default function Meetings() {
  const [dropDownLabel, setDropDownLabel] = useState('Last 365 days');
  const deleteMeeting = useDeleteMeeting();
  const [meetingFilter, setMeetingFilter] = useState('all');
  const [confirmWith, setConfirmWith] = useState(false);
  const [showCompose, setShowCompose] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [showToErrorModal, setShowToErrorModal] = useState<boolean>(false);
  const [debounceText, setDebounceText] = useState('');
  const [customerSearchText, setCustomerSearchText] = useState('');
  const [duration, setDuration] = useState<string>(
    dayjs().subtract(365, 'day').toISOString()
  );
  const [confirmationModalOpen, setConfirmationModalOpen] = useState<any>({
    data: {},
    status: false,
  });
  const [meetingDetails, setMeetingDetails] = useState<any>(null);
  const [momMeetingDetails, setMomMeetingDetails] = useState<any>(null);
  const [customerDropdown, setCustomerDropdown] = useState<{
    label: string;
    value: string;
    is_prospect?: boolean;
  }>({
    value: '',
    label: 'All customers',
    is_prospect: false,
  });
  const [searchText, setSearchText] = useState('');
  const [uploadTransriptModalOpen, setUploadTransriptModalOpen] = useState({
    meeting: {},
    status: false,
    isEdit: false,
  });


  const { data: allDirectCustomers } = useQuery({
    queryKey: ['allDirectCustomersStakeholders'],
    queryFn: () => getAllCustomersStakeholders(true),
  });

  const { data: allCustomers } = useQuery({
    queryKey: ['allMyTeamCustomers'],
    queryFn: () => getAllMyTeamCustomers(),
  });


  // const { data: allCustomers } = useQuery({
  //   queryKey: [''],
  //   queryFn: () => getAllCustomersStakeholders(false),
  // });

  const { data: userinfo } = useQuery({
    queryKey: ['userDetails'],
    queryFn: () =>
      apiRequest({
        url: '/api/app-service/v1/userinfo?is_email_encrypt=true',
      }),
    refetchOnWindowFocus: false,
  });

  const { data: allMeetings, isLoading } = useQuery({
    queryKey: ['meetings', debounceText, duration, customerDropdown?.value],
    queryFn: () =>
      getCustomerMeetings(customerDropdown?.value, duration, debounceText),
    refetchInterval: (data: any) => {
      return data?.state?.data?.data?.data?.filter(
        (ele: any) => ele?.is_processed === false
      )?.length > 0
        ? 10000
        : false;
    },
  });

  const newOptions = useMemo(() => {
    const regex = new RegExp(`(${escapeRegExp(customerSearchText)})`, 'i');
    return allCustomers?.data
      ?.map((ele: any) => ({
        value: ele.customer_id,
        label: ele.customer_name,
        is_prospect: Boolean(ele?.is_prospect),
      }))
      ?.filter((item: any) => regex.test(item.label));
  }, [allCustomers, customerSearchText]);

  useEffect(() => {
    setTimeout(() => {
      setDebounceText(searchText);
    }, 1000);
  }, [searchText]);

  const handleCancel = () => {
    setConfirmationModalOpen({ data: {}, status: false });
  };
  const handleYes = async () => {
    try {
      const response = await deleteMeeting.mutateAsync({
        id: confirmationModalOpen?.data?._id,
        keepSuggestion: confirmWith,
      });
      if (response?.status == 200 || response?.status == 201) {
        setConfirmationModalOpen({ data: {}, status: false });

        toast.success('Meeting deleted successfully.');
        setMeetingDetails(null);
      }
    } catch (error) {
      // toast.error(error?.response?.message?.);
    }
  };

  const habndelDeleteMeeting = async (data: any) => {
    setConfirmationModalOpen({ data: data, status: true });
  };

  const meetings = useMemo(() => {
    if (meetingFilter === 'pending') {
      return allMeetings?.data?.data?.filter((ele: any) => {
        // Check if meeting is processed
        if (!ele.is_processed) return false;

        // Check for pending tasks
        const hasPendingTasks = ele.task?.some(
          (task: any) => !task.is_completed
        );

        // Check for pending insights
        const hasPendingInsights = ele.insightInstance?.some(
          (insight: any) => insight.action_status === 'active'
        );

        return hasPendingTasks || hasPendingInsights;
      });
    } else if (meetingFilter === 'done') {
      return allMeetings?.data?.data?.filter((ele: any) => {
        // Check if meeting is processed
        if (!ele.is_processed) return false;
        // if (ele?.datetime && dayjs(ele?.datetime).isAfter(dayjs())) return false;
        const tasks = ele.task || [];
        const insights = ele.insightInstance || [];

        // If no tasks and no insights, consider it done
        if (tasks.length === 0 && insights.length === 0) return true;

        // Check if all tasks are completed
        const allTasksCompleted =
          tasks.length > 0 && tasks.every((task: any) => task.is_completed);

        // Check if all insights are completed or ignored
        const allInsightsCompleted =
          insights.length > 0 &&
          insights.every(
            (insight: any) =>
              insight.action_status === 'completed' ||
              insight.action_status === 'ignored' ||
              insight.action_status === 'closed'
          );

        return allTasksCompleted || allInsightsCompleted;
        // ele?.insightInstance?.filter(
        //   (element: any) =>
        //     element?.action_status === 'completed' ||
        //     element?.action_status === 'ignored'
        // ).length > 0 ||
        // ele?.task?.filter?.((element: any) => element?.is_completed).length >
        //   0 ||
        // (!ele?.is_pending &&
        //   ele?.insightInstance?.length === 0 &&
        //   ele?.task?.length === 0)}
      });
    } else if (meetingFilter === 'myMeetings') {
      const assignedCustomersIds =
        allDirectCustomers?.data && Array.isArray(allDirectCustomers?.data)
          ? allDirectCustomers?.data?.map((ele: any) => ele.customer_id)
          : [];
      return allMeetings?.data?.data?.filter((ele: any) => {
        return assignedCustomersIds?.includes(ele?.customer_id) || ele?.user_id === userinfo?.data?.id;
      });
    } else if (meetingFilter === 'internalMeetings') {

      return allMeetings?.data?.data?.filter((ele: any) => ele?.is_internal_meeting);
    } else {
      return allMeetings?.data?.data;
    }
  }, [meetingFilter, allMeetings, allDirectCustomers]);

  useEffect(() => {
    if (meetingDetails) {
      const meeting = allMeetings?.data?.data?.find(
        (ele: any) => ele?._id === meetingDetails?._id
      );
      setMeetingDetails(meeting);
      if (!meeting) {
        setMeetingDetails(null);
      }
    }
  }, [allMeetings]);

  const childAsyncFunctionRef = useRef<(() => void) | null>(null);
  const handleChildFunctionReady = (fn: () => void) => {
    childAsyncFunctionRef.current = fn;
  };
  const toggle = useCallback(() => {
    setShowCompose((prevShow) => !prevShow);
  }, []);
  // const stakeholdersArr = [] as any;
  // allCustomers?.data?.map((ele: any) => {
  //   stakeholdersArr.push(...ele?.stakeholders);
  // });

  const handleMeetingCardClick = (meeting: any) => {
    setMeetingDetails(meeting);
    setTimeout(() => {
      const detailsSection = document.getElementById('meeting-details-section');
      if (detailsSection) {
        detailsSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  // Categorize meetings
  const recentMeetings = meetings?.filter((meeting: any) => {
    const currentMonth = dayjs().format('MMMM');
    const meetingMonth = dayjs(meeting?.created_at).format('MMMM');
    return currentMonth === meetingMonth;
  });
  const lastMonthStart = dayjs().subtract(1, 'month').startOf('month');
  const lastMonthEnd = dayjs().subtract(1, 'month').endOf('month');
  const lastMonthMeetings = meetings?.filter((meeting: any) => {
    const meetingDate = dayjs(meeting?.created_at);
    return (
      meetingDate.isSameOrAfter(lastMonthStart) &&
      meetingDate.isSameOrBefore(lastMonthEnd)
    );
  });

  return isLoading ? (
    <Loading />
  ) : (
    <div>
      <div className="sticky top-[54px] bg-white pb-[20px] border-b border-[#CED2DA] z-10 opacity-100">
        <div className="text-[20px] text-[#414E62]  w-[1200px] mx-auto pt-[60px]">
          <span>Meetings of</span>
          <span>
            <Dropdown className="inline-flex z-[50]">
              <Dropdown.Trigger
                type="button"
                className="mr-[] bg-white btn w-full !py-1.5 "
                id="dropdownMenuButton"
                data-bs-toggle="dropdown"
              >
                <div className="flex items-center justify-between w-full text-[20px] text-[#141C24] font-medium">
                  <span className="flex items-center justify-between flex-1 min-w-0 pr-2">
                    <span className="truncate">{customerDropdown?.label}</span>
                    {customerDropdown?.is_prospect ? (
                      <span className="inline-flex items-center px-1 py-0.5 rounded-full border border-[#1A75FF] text-[#1A75FF] text-[9px] leading-[10px] font-medium ml-2">
                        Prospect
                      </span>
                    ) : null}
                  </span>
                  <span className=" ">
                    <ChevronDown className="relative !pt-1 !text-[#344051] " />
                  </span>
                </div>
              </Dropdown.Trigger>
              <Dropdown.Content
                placement="bottom-end"
                className="absolute z-50 p-2 ltr:text-left rtl:text-right max-h-[300px] scroll overflow-auto  bg-white border-[1px] border-[#CED2DA] rounded-lg shadow-md dropdown-menu  dark:bg-zink-600"
                aria-labelledby="dropdownMenuButton"
              >
                <ul
                  className="text-sm text-gray-700 dark:text-gray-200 dropdownClick"
                  aria-labelledby="dropdownMenuIconButton"
                >
                  <li className=" p-[8px] mx-[6px] pl-[12px] bg-gray-50 rounded-[6px]">
                    <div className="flex items-center text-gray-400">
                      <Search className="w-[15px] h-[15px] mr-2" />
                      <input
                        type="text"
                        placeholder="Search customer"
                        className="outline-none bg-transparent placeholder-gray-400 text-gray-900 text-[16px]"
                        value={customerSearchText}
                        onChange={(e: any) =>
                          setCustomerSearchText(e?.target?.value)
                        }
                      />
                    </div>
                  </li>
                  {!customerSearchText && (
                    <li>
                      <div
                        className="flex items-center after:rounded dark:hover:bg-gray-600 cursor-pointer "
                        onClick={() => {
                          setCustomerDropdown({
                            label: 'All customers',
                            value: '',
                            is_prospect: false,
                          });
                        }}
                      >
                        <label
                          htmlFor={`checkbox-item-${999}`}
                          className={`w-full py-1.5 px-2 text-[16px] cursor-pointer ${customerDropdown?.value === ''
                            ? 'text-[#3B82F6]'
                            : 'text-[#344051]'
                            } rounded dark:text-gray-300 close-dropdown hover:text-[#3B82F6]`}
                        >
                          All customers
                        </label>
                      </div>
                    </li>
                  )}
                  {newOptions?.map((item: any, i: number) => (
                    <li key={i}>
                      <div
                        className="flex items-center after:rounded dark:hover:bg-gray-600 cursor-pointer "
                        onClick={() => {
                          setCustomerDropdown({
                            label: item?.label,
                            value: item?.value,
                            is_prospect: item?.is_prospect,
                          });
                        }}
                      >
                        <label
                          htmlFor={`checkbox-item-${i}`}
                          className={`w-full py-1.5 px-2 text-[16px] cursor-pointer ${item.label === customerDropdown?.label
                            ? 'text-[#3B82F6]'
                            : 'text-[#344051]'
                            } rounded dark:text-gray-300 close-dropdown hover:text-[#3B82F6]`}
                        >
                          <span className="flex items-center justify-between w-full gap-2">
                            <span className="truncate">{item?.label}</span>
                            {item?.is_prospect ? (
                              <span className="inline-flex items-center px-1 py-0.5 rounded-full border border-[#1A75FF] text-[#1A75FF] text-[9px] leading-[10px] font-medium">
                                Prospect
                              </span>
                            ) : null}
                          </span>
                        </label>
                      </div>
                    </li>
                  ))}
                </ul>
              </Dropdown.Content>
            </Dropdown>
          </span>
          <span>from</span>
          <span>
            <span>
              <Dropdown className="inline-flex z-[50]">
                <Dropdown.Trigger
                  type="button"
                  className="mr-[] bg-white btn w-full !py-1.5 "
                  id="dropdownMenuButton"
                  data-bs-toggle="dropdown"
                >
                  <div className="flex items-center justify-between w-full text-[20px] text-[#141C24] font-medium">
                    <span>{dropDownLabel}</span>
                    <span className=" ">
                      <ChevronDown className="relative !pt-1 !text-[#344051] " />
                    </span>
                  </div>
                </Dropdown.Trigger>
                <Dropdown.Content
                  placement="bottom-end"
                  className="absolute z-50 p-2 ltr:text-left rtl:text-right !w-[162px] bg-white border-[1px] border-[#CED2DA] rounded-lg shadow-md dropdown-menu  dark:bg-zink-600"
                  aria-labelledby="dropdownMenuButton"
                >
                  <ul
                    className="text-sm text-gray-700 dark:text-gray-200 dropdownClick"
                    aria-labelledby="dropdownMenuIconButton"
                  >
                    {[
                      {
                        value: dayjs().subtract(30, 'day').toISOString(),
                        label: 'Last 30 days',
                      },
                      {
                        value: dayjs().subtract(90, 'day').toISOString(),
                        label: 'Last 90 days',
                      },

                      {
                        value: dayjs().subtract(180, 'day').toISOString(),
                        label: 'Last 180 days',
                      },

                      {
                        value: dayjs().subtract(365, 'day').toISOString(),
                        label: 'Last 365 days',
                      },

                      // {
                      //   value: '',
                      //   label: 'Select period',
                      // },
                    ].map((item: any, i: number) => (
                      <li key={i}>
                        <div
                          className="flex items-center after:rounded dark:hover:bg-gray-600 cursor-pointer "
                          onClick={() => {
                            setDuration(item?.value);
                            setDropDownLabel(item?.label);
                          }}
                        >
                          <label
                            htmlFor={`checkbox-item-${i}`}
                            className={`w-full py-1.5 px-2 text-[16px] cursor-pointer ${item.label === dropDownLabel
                              ? 'text-[#3B82F6]'
                              : 'text-[#344051]'
                              } rounded dark:text-gray-300 close-dropdown hover:text-[#3B82F6]`}
                          >
                            {item?.label}
                          </label>
                        </div>
                      </li>
                    ))}
                  </ul>
                </Dropdown.Content>
              </Dropdown>
            </span>
          </span>
        </div>
        <div className="w-[1200px] mx-auto pt-[27px]">
          <div className="flex w-full items-center justify-between h-[40px]">
            <div className="flex w-full gap-[16px] h-full">
              <div className="relative xl:col-span-2 h-full">
                <div className="w-[332px] h-full">
                  <input
                    type="text"
                    className="h-full pl-8 search form-input border-slate-200 dark:border-zink-500 focus:outline-none focus:border-custom-500 disabled:bg-slate-100 dark:disabled:bg-zink-600 disabled:border-slate-300 dark:disabled:border-zink-500 dark:disabled:text-zink-200 disabled:text-slate-500 dark:text-zink-100 dark:bg-zink-700 dark:focus:border-custom-800 placeholder:text-[16px] placeholder:text-[#637083]  dark:placeholder:text-zink-200"
                    placeholder="Search people, topics, customer, etc"
                    autoComplete="off"
                    autoFocus
                    value={searchText}
                    onChange={(e: any) => setSearchText(e?.target?.value)}
                  />
                  {/* <Search className="mx-2 inline-block size-4 absolute ltr:left-2.5 rtl:right-2.5 top-2.5 text-slate-500 dark:text-zink-200 fill-slate-100 dark:fill-zink-600" /> */}
                  <div className="mx-2 inline-block size-4 absolute ltr:left-2.5 rtl:right-2.5 top-2.5 text-slate-500 dark:text-zink-200 fill-slate-100 dark:fill-zink-600">
                    <SearchIconMyTeamSearchPage />
                  </div>
                </div>
              </div>
              <div className="flex w-full justify-between text-[14px] font-semibold text-[#344051]">
                <div className="flex w-fit items-center border overflow-hidden border-[#CED2DA] rounded-[6px] ">
                  <div
                    className={
                      meetingFilter === 'all'
                        ? 'border-r px-[20px] flex items-center bg-gray-100 border-[#CED2DA] h-full cursor-pointer'
                        : 'border-r px-[20px] flex items-center border-[#CED2DA] h-full cursor-pointer'
                    }
                    onClick={() => setMeetingFilter('all')}
                  >
                    <span className=""> All meetings</span>{' '}
                  </div>
                  <div
                    className={
                      meetingFilter === 'myMeetings'
                        ? 'border-r px-[20px] flex items-center bg-gray-100 border-[#CED2DA] h-full cursor-pointer'
                        : 'border-r px-[20px] flex items-center border-[#CED2DA] h-full cursor-pointer'
                    }
                    onClick={() => setMeetingFilter('myMeetings')}
                  >
                    <span className=""> My meetings</span>{' '}
                  </div>
                  <div
                    className={
                      meetingFilter === 'internalMeetings'
                        ? 'border-r px-[20px] flex items-center bg-gray-100 border-[#CED2DA] h-full cursor-pointer'
                        : 'border-r px-[20px] flex items-center border-[#CED2DA] h-full cursor-pointer'
                    }
                    onClick={() => setMeetingFilter('internalMeetings')}
                  >
                    <span className=""> Internal meetings</span>{' '}
                  </div>
                  <div
                    className={
                      meetingFilter === 'pending'
                        ? 'border-r px-[20px] flex items-center gap-[11px] bg-gray-100 border-[#CED2DA] h-full cursor-pointer'
                        : 'border-r px-[20px] flex items-center gap-[11px] border-[#CED2DA] h-full cursor-pointer'
                    }
                    onClick={() => setMeetingFilter('pending')}
                  >
                    <span className="w-3 h-4 items-center flex">
                      <PowerIcon className="text-[#EAB308]" />
                    </span>
                    Pending tasks
                  </div>
                  <div
                    className={
                      meetingFilter === 'done'
                        ? 'px-[20px] flex items-center gap-[11px] bg-gray-100 border-[#CED2DA] h-full cursor-pointer'
                        : 'px-[20px] flex items-center gap-[11px] border-[#CED2DA] h-full cursor-pointer'
                    }
                    onClick={() => setMeetingFilter('done')}
                  >
                    <span className="w-3 h-4 items-center flex">
                      <PowerIcon className="text-[#249782]" />
                    </span>
                    Done
                  </div>
                </div>
                <div className="flex justify-end h-full">
                  <button
                    className="btn text-[#3B82F6] flex items-center gap-[8px] text-[14px] font-semibold border-[#3B82F6] border rounded-[6px] px-[16px] h-[40px]"
                    onClick={() =>
                      setUploadTransriptModalOpen({
                        meeting: {},
                        status: true,
                        isEdit: false,
                      })
                    }
                  >
                    <span className="relative inline-block w-[20px] h-[20px]">
                      <svg
                        width="11.67"
                        height="11.67"
                        viewBox="0 0 12 12"
                        className="absolute opacity-100"
                        style={{ top: '4.17px', left: '4.17px' }}
                      >
                        <path
                          d="M6 1 L6 11 M1 6 L11 6"
                          stroke="#3B82F6"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </span>
                    <span>Create Meeting</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {meetings?.length > 0 ? (
        <div className="w-[1200px] mx-auto pt-[23px] scroll h-[cal(100vh-18rem)] pb-[20px]">
          {recentMeetings?.length > 0 && (
            <>
              <span className="text-[12px] text-[#97A1AF] mb-0 block">
                Recent
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[23px] pt-[16px]">
                {recentMeetings.map((meeting: any, index: number) => (
                  <MeetingCard
                    key={meeting?._id || index}
                    meeting={meeting}
                    index={index}
                    habndelDeleteMeeting={habndelDeleteMeeting}
                    toggle={toggle}
                    setMeetingDetails={handleMeetingCardClick}
                    setMomMeetingDetails={setMomMeetingDetails}
                    setUploadTransriptModalOpen={setUploadTransriptModalOpen}
                  />
                ))}
              </div>
            </>
          )}
          {/* {lastMonthMeetings?.length > 0 && (
            <>
              <span className="text-[12px] text-[#97A1AF] mt-[20px] mb-2 block">
                Last Month
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[23px] pt-[16px]">
                {lastMonthMeetings.map((meeting: any, index: number) => (
                  <MeetingCard
                    key={meeting?._id || index}
                    meeting={meeting}
                    index={index}
                    habndelDeleteMeeting={habndelDeleteMeeting}
                    toggle={toggle}
                    setMeetingDetails={handleMeetingCardClick}
                    setMomMeetingDetails={setMomMeetingDetails}
                    setUploadTransriptModalOpen={setUploadTransriptModalOpen}
                  />
                ))}
              </div>
            </>
          )} */}
          {meetings?.filter((meeting: any) => {
            const startOfLastMonth = dayjs()
              .subtract(1, 'month')
              .startOf('month');
            const endOfLastMonth = dayjs().subtract(1, 'month').endOf('month');
            const meetingDate = dayjs(meeting?.created_at);
            return (
              meetingDate.isSameOrAfter(startOfLastMonth) &&
              meetingDate.isSameOrBefore(endOfLastMonth)
            );
          })?.length > 0 && (
              <div className="text-[12px] text-[#97A1AF] mt-[20px]">
                Last Month
              </div>
            )}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[23px] pt-[16px]">
            {meetings
              ?.filter((meeting: any) => {
                const startOfLastMonth = dayjs()
                  .subtract(1, 'month')
                  .startOf('month');
                const endOfLastMonth = dayjs()
                  .subtract(1, 'month')
                  .endOf('month');
                const meetingDate = dayjs(meeting?.created_at);
                return (
                  meetingDate.isSameOrAfter(startOfLastMonth) &&
                  meetingDate.isSameOrBefore(endOfLastMonth)
                );
              })
              .map((meeting: any, index: number) => (
                <>
                  <MeetingCard
                    meeting={meeting}
                    index={index}
                    habndelDeleteMeeting={habndelDeleteMeeting}
                    toggle={toggle}
                    setMeetingDetails={handleMeetingCardClick}
                    setMomMeetingDetails={setMomMeetingDetails}
                    setUploadTransriptModalOpen={setUploadTransriptModalOpen}
                  />
                </>
              ))}
          </div>
          {meetings?.filter((meeting: any) => {
            const startOfLastMonth = dayjs()
              .subtract(1, 'month')
              .startOf('month');
            const meetingDate = dayjs(meeting?.created_at);
            return meetingDate.isBefore(startOfLastMonth);
          })?.length > 0 && (
              <div className="text-[12px] text-[#97A1AF] mt-[20px]">
                Old Meetings
              </div>
            )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[23px] pt-[16px]">
            {meetings
              ?.filter((meeting: any) => {
                const startOfLastMonth = dayjs()
                  .subtract(1, 'month')
                  .startOf('month');
                const meetingDate = dayjs(meeting?.created_at);
                return meetingDate.isBefore(startOfLastMonth);
              })
              .map((meeting: any, index: number) => (
                <MeetingCard
                  key={meeting?.id || index}
                  meeting={meeting}
                  index={index}
                  habndelDeleteMeeting={habndelDeleteMeeting}
                  toggle={toggle}
                  setMeetingDetails={setMeetingDetails}
                  setMomMeetingDetails={setMomMeetingDetails}
                  setUploadTransriptModalOpen={setUploadTransriptModalOpen}
                />
              ))}
          </div>
        </div>
      ) : (
        <div className="w-[1200px] mx-auto flex flex-col gap-[20px] items-center justify-center pt-[106px]">
          <span>
            <NoMeetingIcon />
          </span>
          <span className="text-[16px] font-medium text-[#414E62]">
            No Meetings Found
          </span>
        </div>
      )}

      {meetingDetails && (
        <div id="meeting-details-section">
          <MeetingDetails
            meetingDetails={meetingDetails}
            setMeetingDetails={setMeetingDetails}
            confirmWith={confirmWith}
            setConfirmWith={setConfirmWith}
            setUploadTransriptModalOpen={setUploadTransriptModalOpen}
            // allCustomers={allCustomers?.data}
          />
        </div>
      )}
      {uploadTransriptModalOpen?.status && (
        <UploadTranscriptModal
          uploadTransriptModalOpen={uploadTransriptModalOpen}
          setUploadTransriptModalOpen={setUploadTransriptModalOpen}
          allCustomers={allCustomers?.data}
          userInfo={userinfo?.data}
        />
      )}
      {confirmationModalOpen && (
        <ConfirmationPopUp
          header={'Associated details cannot be retrieved later'}
          modalOpen={confirmationModalOpen?.status}
          handleCancel={handleCancel}
          handleYes={handleYes}
          yesText={'Delete meeting'}
          title={'Are you sure to delete this meeting?'}
          setConfirmWith={setConfirmWith}
          confirmWith={confirmWith}
          data={{
            insight: confirmationModalOpen?.data?.insightInstance,
            task: confirmationModalOpen?.data?.task,
          }}
        />
      )}
      {showCompose ? (
        <Modal
          Content={
            <ComposeEmail
              toggle={toggle}
              // stakeholdersArr={stakeholdersArr}
              setShowToErrorModal={setShowToErrorModal}
              setShowConfirmModal={setShowConfirmModal}
              onChildFunctionReady={handleChildFunctionReady}
              communicationData={{
                type: 'meeting',
                meetingDetails: momMeetingDetails,
                mom_html: marked(momMeetingDetails?.minutes_of_meeting ?? ''),
              }}
            />
          }
          size=""
          backBg="!border-none !shadow-none"
          composeEmail={true}
        ></Modal>
      ) : (
        <></>
      )}
    </div>
  );
}
