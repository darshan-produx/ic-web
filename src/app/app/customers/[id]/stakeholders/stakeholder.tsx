import {
  EditIcon,
  TrashIconFilled,
} from '../../../../../app/assests/icons/icons';
// import DeleteModal from '../../../../../common/components/DeleteModal';
// import { Trash2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-toastify';
// import AddStakeholder from './addStakeholder';
import Modal from '../../../../../common/Modal';
import { useDeleteStakeholder } from '../../../../../services/mutations/customer360StakeholderMutations';
import { useParams } from 'next/navigation';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useQuery } from '@tanstack/react-query';
// import { getUserById } from '../../../../../app/api/users/users';
import Link from 'next/link';
import { getEmails } from '../../../../../app/api/emails/emails';
import ComposeEmail from '../../../emails/components/ComposeEmailModal';
import ConfirmationModalForEmail from '../../../../../common/components/Modal/confirmationModalForEmail';
import AddStakeholderModal from './addStakeholderModal';
import DeleteStakeholderModal from './deleteStakeholder';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { findOneStakeholder } from '../../../../../app/api/customer-360/stakeholdersApi/customer360-stakeholder';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/light.css';
import { getStakeholderMeetings } from '../../../../../app/api/communication/communication';

function StakeHolder(props: any) {
  const [selectedStakeholder, setSelectedStakeholder] = useState<any>();
  const [selectedStakeholderId, setSelectedStakeholderId] = useState<any>(null);
  const [editData, setEditData] = useState<any>(null);
  const [addStakeholderForm, setAddStakeholderForm] = useState(false);
  const [deleteModal, setDeleteModal] = useState<boolean>(false);
  const deleteStakeholder = useDeleteStakeholder();
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [showToErrorModal, setShowToErrorModal] = useState<boolean>(false);
  const [childFunction, setChildFunction] = useState<(() => void) | null>();
  const { id } = useParams();
  const [showCompose, setShowCompose] = useState(false);

  const { data: emails } = useQuery({
    queryKey: ['emails', selectedStakeholder?._id],
    queryFn: () =>
      getEmails({
        folder: 'Inbox',
        sort_by: 'datetime',
        stakeholder_id: selectedStakeholder?._id,
      }),
  });

  const { data: stakeholderMeetings } = useQuery({
    queryKey: ['stakeholderMeetings', selectedStakeholder?._id],
    queryFn: () => getStakeholderMeetings(selectedStakeholder?._id),
  });

  const deleteToggle = () => {
    setDeleteModal(!deleteModal);
  };
  const handleDelete = async () => {
    try {
      const res = await deleteStakeholder?.mutateAsync({
        customer_id: id,
        stakeholder_id: selectedStakeholder._id,
      });
      if (res?.status == 200 || res?.status == 201) {
        setDeleteModal(false);
        toast.success('Stakeholder deleted successfully.');
      }
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  useEffect(() => {
    if (props?.meetingStakeholderId) {
      setSelectedStakeholderId(props?.meetingStakeholderId);
    }
  }, [props?.meetingStakeholderId]);
  const resolvedStakeholderId = useMemo(() => {
    if (!props?.stakeholders?.length) return null;
    return (
      props.stakeholders.find((ele: any) => ele?._id === selectedStakeholderId)
        ?._id || props.stakeholders[0]?._id
    );
  }, [props?.stakeholders, selectedStakeholderId]);

  const { data: getStakeholder } = useQuery({
    queryKey: ['getstakeholder', resolvedStakeholderId, props?.stakeholders],
    queryFn: () => findOneStakeholder(resolvedStakeholderId),
    enabled: !!resolvedStakeholderId,
  });

  useEffect(() => {
    if (getStakeholder?.data?.data) {
      setSelectedStakeholder(getStakeholder?.data?.data);
    } else if (!resolvedStakeholderId) {
      setSelectedStakeholder(null);
    }
  }, [getStakeholder, props?.stakeholders, selectedStakeholderId]);

  dayjs.extend(relativeTime);

  function getRelativeTime(time: string | Date): string {
    const actionDate = dayjs(time);
    const now = dayjs();

    if (actionDate.isBefore(now)) {
      const difference = now.diff(actionDate, 'day');
      return `${difference} days ago`;
    } else {
      const difference = actionDate.diff(now, 'day');
      return `in ${difference + 1} days`;
    }
  }
  const toggle = useCallback(() => {
    setShowCompose((prevShow) => !prevShow);
  }, []);

  function getDateStatus(inputDateStr: any) {
    const inputDate = dayjs(inputDateStr);
    const today = dayjs();
    const tomorrow = today.add(1, 'day');
    const upcomingEnd = today.add(10, 'day');

    // Check if the input date is tomorrow
    if (inputDate.isSame(tomorrow, 'day')) {
      return 'Tomorrow';
    }

    // Check if the input date is within the upcoming range (today to next 10 days)
    if (
      inputDate.isAfter(today, 'day') &&
      inputDate.isBefore(upcomingEnd, 'day')
    ) {
      return 'Upcoming';
    }

    // If the date doesn't match any criteria
    return '';
  }

  function getInitials(name: string): string {
    const nameArray = name?.trim()?.split(' ');
    const initials = nameArray?.map((word) => word[0]?.toUpperCase());
    const initial = initials?.join('');

    return initial == undefined ||
      (nameArray[0] == 'undefined' && nameArray[1] == 'undefined')
      ? 'NA'
      : initial;
  }

  function formatPhoneNumber(phoneNumber: any) {
    let sanitizedNumber = phoneNumber.replace(/\s-+/g, '');
    let countryCodeMatch = sanitizedNumber.match(/^\+\d+/);
    if (!countryCodeMatch) {
      //   throw new Error('Invalid phone number format');
      return '';
    }
    let countryCode = countryCodeMatch[0];
    let localNumber = sanitizedNumber.slice(countryCode?.length);
    localNumber = localNumber.replace(/-/g, '');
    return `${countryCode}-${localNumber}`;
  }

  function convertDateTimeTotime(dateStr: any) {
    // const date = new Date(dateStr);

    // // Convert to a 12-hour time format with AM/PM
    // const timeString = date.toLocaleTimeString('en-US', {
    //   hour: 'numeric',
    //   minute: 'numeric',
    //   hour12: true,
    // });
    // return timeString;
    return dayjs().to(dayjs(dateStr));
  }
  const childAsyncFunctionRef = useRef<(() => void) | null>(null);
  const handleChildFunctionReady = (fn: () => void) => {
    childAsyncFunctionRef.current = fn;
  };
  const upcomingEvents = selectedStakeholder?.personal_events?.filter(
    (ele: any) => {
      const eventDate = dayjs(ele?.date);
      const today = dayjs();

      // Get the event date set to the current year
      const eventDateThisYear = eventDate.set('year', eventDate.year());

      // Calculate the difference in days
      const diffInDays = eventDateThisYear.diff(today, 'day');

      // Return true if the event is in the next 10 days and in the current year
      return (
        diffInDays >= 0 &&
        diffInDays < 10 &&
        eventDateThisYear.year() === today.year()
      );
    }
  );

  return (
    <div className="border-[0.95px] border-[#E4E7EC] rounded-[12px]">
      <div className="flex">
        <div className="border-r-[0.95px] border-[#E4E7EC] w-[363px]">
          <button
            type="button"
            onClick={() => {
              setAddStakeholderForm(!addStakeholderForm);
              setEditData(null);
            }}
            className={`mx-[20.5px] my-[20px] w-[324px] bg-white font-[600] text-gray-900   btn border-[1px] border-[#637083]`}
          >
            Add stakeholder
          </button>
          <div>
            {props?.stakeholders?.length > 0 ? (
              <>
                {props?.stakeholders?.map((ele: any, index: number) => (
                  <div
                    className={`border-y-[0.95px]  border-[#E4E7EC]  pl-[20px] py-[10px] pr-[10px] cursor-pointer ${selectedStakeholder?._id == ele?._id ? 'bg-gray-100' : ''
                      } hover:bg-gray-100`}
                    onClick={() => setSelectedStakeholderId(ele?._id)}
                    key={index}
                  >
                    <div className="flex gap-2">
                      <div className="w-[15%]">
                        <img
                          src={`/api/app-service/v1/picture/customer_stakeholder_master/${ele?._id
                            }?org_id=${localStorage?.getItem(
                              'org_id'
                            )}&initials=${getInitials(ele?.name)}&ts=${selectedStakeholder?.updated_at
                            }`}
                          className="size-[44px] rounded-full"
                          alt=""
                        />
                      </div>
                      <div className="w-[57%] flex flex-col justify-center">
                        <h6 className="text-[14px] text-gray-900 font-[500]">
                          {ele?.name}
                        </h6>
                        {ele?.designation && (
                          <p className="text-[12px] text-gray-400 font-[400]">
                            {ele?.designation}
                          </p>
                        )}
                      </div>
                      <div className="w-[20%] mt-[6px] text-right">
                        {ele?.engagement_level ? (
                          <span
                            className={`${ele?.engagement_level == 'Average'
                              ? 'bg-[#FFEECC] text-[#EAB308]'
                              : ele?.engagement_level == 'Good'
                                ? 'bg-[#D9F2E5] text-[#249782]'
                                : ele?.engagement_level == 'Poor'
                                  ? 'bg-[#FCCFCF] text-[#EF4444]'
                                  : ''
                              }  text-[12px] font-[600] px-2 py-1.5 rounded-[4px]`}
                          >
                            {ele?.engagement_level}
                          </span>
                        ) : (
                          ''
                        )}
                      </div>
                      <div className="w-[6%] mt-[8px]">
                        <svg
                          width="25"
                          height="25"
                          viewBox="0 0 25 25"
                          fill="CurrentColor"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <mask
                            id="mask0_1880_22197"
                            // style="mask-type:alpha"
                            maskUnits="userSpaceOnUse"
                            x="0"
                            y="0"
                            width="25"
                            height="25"
                          >
                            <rect
                              x="0.72998"
                              y="24.2598"
                              width="24"
                              height="24"
                              transform="rotate(-90 0.72998 24.2598)"
                              fill="#D9D9D9"
                            />
                          </mask>
                          <g mask="url(#mask0_1880_22197)">
                            <path
                              d="M15.7048 12.259C15.7048 12.3923 15.684 12.5173 15.6423 12.634C15.6006 12.7507 15.5298 12.859 15.4298 12.959L10.8298 17.559C10.6465 17.7423 10.4131 17.834 10.1298 17.834C9.84645 17.834 9.61312 17.7423 9.42979 17.559C9.24645 17.3757 9.15479 17.1423 9.15479 16.859C9.15479 16.5757 9.24645 16.3423 9.42979 16.159L13.3298 12.259L9.42979 8.35898C9.24645 8.17565 9.15479 7.94232 9.15479 7.65898C9.15479 7.37565 9.24645 7.14232 9.42979 6.95898C9.61312 6.77565 9.84645 6.68398 10.1298 6.68398C10.4131 6.68398 10.6465 6.77565 10.8298 6.95898L15.4298 11.559C15.5298 11.659 15.6006 11.7673 15.6423 11.884C15.684 12.0007 15.7048 12.1257 15.7048 12.259Z"
                              fill="#97A1AF"
                            />
                          </g>
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <span className="flex justify-center my-20">
                {' '}
                No stakeholder to show{' '}
              </span>
            )}
          </div>
        </div>
        <div className="w-[836px] m-[20px]">
          {selectedStakeholder ? (
            <>
              <div className="flex">
                <div className="flex w-full ">
                  <div className="flex pr-[12px] border-r-[0.95px] border-[#E4E7EC] ml-[10px]">
                    <div className="min-w-[44px]">
                      <img
                        src={`/api/app-service/v1/picture/customer_stakeholder_master/${selectedStakeholder?._id
                          }?org_id=${localStorage?.getItem(
                            'org_id'
                          )}&initials=${getInitials(
                            selectedStakeholder?.name
                          )}&ts=${selectedStakeholder?.updated_at}`}
                        className="size-[44px] rounded-full"
                        alt=""
                      />
                    </div>
                    <div className="w-full ml-[12px]">
                      <h6 className="text-[16px] text-gray-900 font-[600] text-nowrap">
                        {selectedStakeholder?.name}
                      </h6>
                      <p className="text-[12px] text-gray-800 font-[400] text-nowrap">
                        {selectedStakeholder?.designation}
                      </p>
                    </div>
                  </div>
                  <div className="px-[12px]">
                    <p className="text-[14px] font-[400] text-gray-600">{`${selectedStakeholder?.email
                      }${selectedStakeholder?.phone
                        ? ', ' + formatPhoneNumber(selectedStakeholder?.phone)
                        : ''
                      }`}</p>
                    <span className="text-[12px] font-[400] text-[#97A1AF]">{` ${selectedStakeholder?.crm_id
                      ? 'CRM ID : ' + selectedStakeholder?.crm_id
                      : ''
                      }`}</span>
                    <div className="mt-[6px] flex flex-wrap items-center gap-1">
                      <span className="text-[12px] font-[500] text-[#637083]">
                        Offering:
                      </span>
                      {selectedStakeholder?.offerings?.length > 0 ? (
                        selectedStakeholder.offerings.map((offering: any) => (
                          <span
                            key={offering?._id}
                            className="text-[11px] font-[500] px-2 py-0.5 rounded-[4px] bg-[#EEF5FF] text-[#3B82F6]"
                          >
                            {offering?.offering_name}
                          </span>
                        ))
                      ) : (
                        <span className="text-[12px] font-[400] text-[#97A1AF]">
                          None
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="m-2">
                  <div className="flex gap-2">
                    <div className="text-gray-800 text-[14px] font-[600] cursor-pointer">
                      <span
                        className="flex"
                        onClick={() => {
                          setEditData(selectedStakeholder);
                          setAddStakeholderForm(true);
                        }}
                      >
                        <EditIcon className="w-4  mx-1" />
                        <span className="mt-[2px]">Edit</span>
                      </span>
                    </div>
                    <div
                      className="text-[#EF4444] text-[14px] font-[600] cursor-pointer pr-2"
                      onClick={deleteToggle}
                    >
                      <span className="flex items-center">
                        <TrashIconFilled className=" w-4 mx-1 mt-[2px]" />
                        <span className="mt-[2px]">Delete</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mx-[8px] mt-[20px]">
                <div className="grid grid-cols-1 gap-4">
                  {selectedStakeholder?.engagement_level ? (
                    <div className="col-span-2 bg-gray-50">
                      <div className="m-4">
                        <h2 className="text-[14px] font-[400] text-gray-500">
                          Engagement Health & Rationale
                        </h2>
                        <p
                          className={`${selectedStakeholder?.engagement_level == 'Good'
                            ? 'text-[#249782]'
                            : selectedStakeholder?.engagement_level ==
                              'Average'
                              ? 'text-[#EAB308]'
                              : selectedStakeholder?.engagement_level == 'Poor'
                                ? 'text-[#EF4444]'
                                : ''
                            } text-[20px] font-[500] my-2`}
                        >
                          {selectedStakeholder?.engagement_level}
                        </p>
                        <p className="text-gray-900 text-[16px] font-[400] max-h-[100px] overflow-y-auto scroll">
                          {props?.synthesisData?.map((ele: any) => {
                            if (
                              ele?.type?.toLowerCase() === 'stakeholder_data' &&
                              ele?.subtype?.toLowerCase() === 'stakeholder' &&
                              ele?.data_references === selectedStakeholder?._id
                            ) {
                              return (
                                <ReactMarkdown
                                  children={ele?.synthesis}
                                  remarkPlugins={[remarkGfm]}
                                  className={'markdown list-disc list-inside'}
                                />
                              );
                            }
                          })}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="col-span-2"></div>
                  )}
                </div>
                <div className="flex gap-4 mt-4">
                  {/* <div className="col-span-2 bg-gray-50  rounded-sm w-[590px]"> */}
                  <div className="col-span-2 bg-gray-50  rounded-sm w-full">
                    <div className="flex justify-between items-center mb-4 p-[20px] !pb-[0px] ">
                      <div className="">
                        <h2 className="text-[14px] font-[400] text-gray-500">
                          List of Communication
                        </h2>
                      </div>
                      <div className="border-l-[1px] text-gray-200 h-[24px] ml-[10px]"></div>
                      <button
                        className="bg-[#3B82F6] ml-[10px]  text-white text-[12px] rounded-[6px] px-[10px] py-[4px]"
                        onClick={toggle}
                      >
                        Compose Email
                      </button>
                      <Tippy
                        content={
                          <div className="flex flex-col w-fit gap-2 p-2 ">
                            <Link
                              href="/app/emails"
                              className="text-[14px] font-normal text-gray-500 whitespace-nowrap hover:text-blue-500"
                            >
                              View Emails
                            </Link>
                            <Link
                              href="/app/communication/meetings"
                              className="text-[14px] font-normal text-gray-500 whitespace-nowrap hover:text-blue-500"
                            >
                              View Meetings
                            </Link>
                          </div>
                        }
                        placement="bottom"
                        theme="light"
                        arrow={false}
                        offset={[0, 5]}
                        interactive={true}
                        animation="scale"
                        duration={200}
                        className="h-fit !rounded-md flex justify-center items-center px-1"
                      >
                        <span className="text-[14px] font-normal text-gray-500 ml-auto pr-[4px] cursor-pointer">
                          View All
                        </span>
                      </Tippy>
                    </div>
                    <ul className="h-[192px] overflow-y-auto scrollforEmail p-[20px] !pt-[0px]">
                      {emails?.data?.data?.length > 0 ||
                        stakeholderMeetings?.data?.data?.length > 0 ? (
                        <>
                          {' '}
                          {emails?.data?.data?.map((email: any, i: number) => (
                            <>
                              <Link
                                className="relative"
                                key={i}
                                href={`/app/emails?email_message_id=${email?._id}`}
                              >
                                <div
                                  className={`${i == 0 ? 'pb-[16px]' : 'py-[16px]'
                                    } flex w-full cursor-pointer border-b-[1px] border-gray-100`}
                                >
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between ">
                                      <h4
                                        className="font-[500] text-[14px] text-gray-900 w-[50%] overflow-hidden text-ellipsis whitespace-nowrap"
                                        title={
                                          email?.envelope?.from[0]?.name != ''
                                            ? email?.envelope?.from[0]?.name
                                            : email?.envelope?.from[0]?.address
                                        }
                                      >
                                        {email?.envelope?.from[0]?.name != ''
                                          ? email?.envelope?.from[0]?.name
                                          : email?.envelope?.from[0]?.address}
                                      </h4>
                                      <span className="w-[16%] flex justify-between"></span>

                                      <span className="text-[12px] text-right text-gray-400 w-[24%]">
                                        {convertDateTimeTotime(
                                          email?.envelope?.date
                                        )}
                                      </span>
                                    </div>
                                    <div className="flex flex-col gap-[2px]">
                                      <span
                                        className={`block text-[12px] mt-[6px] w-[238px] overflow-hidden text-ellipsis whitespace-nowrap 
                                      
                                         'text-gray-600'
                                    `}
                                        title={email?.envelope?.subject}
                                      >
                                        {email?.envelope?.subject}
                                      </span>
                                      <span
                                        className="block text-[12px]  text-gray-400 w-[238px] overflow-hidden text-ellipsis whitespace-nowrap"
                                        title={email?.body_text_initial}
                                      >
                                        {email?.body_text_initial}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </Link>
                            </>
                          ))}{' '}
                          {/* --- Stakeholder Meetings Section --- */}
                          {stakeholderMeetings?.data?.data?.map(
                            (meeting: any, j: number) => (
                              <Link
                                className="relative"
                                key={`meeting-${j}`}
                                href={`/app/communication/meetings/${meeting?._id}`}
                              >
                                <div
                                  className={`${j === 0 && emails?.data?.data?.length === 0
                                    ? 'pb-[16px]'
                                    : 'py-[16px]'
                                    } flex w-full cursor-pointer border-b-[1px] border-gray-100`}
                                >
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                      <h4
                                        className="font-[500] text-[14px] text-gray-900 w-[50%] overflow-hidden text-ellipsis whitespace-nowrap"
                                        title={meeting?.meeting_name}
                                      >
                                        {meeting?.meeting_name ||
                                          'Untitled Meeting'}
                                      </h4>

                                      <span className="text-[12px] text-right text-gray-400 w-[24%]">
                                        {meeting?.datetime
                                          ? dayjs(meeting?.datetime).format(
                                            'hh:mm A'
                                          )
                                          : ''}
                                      </span>
                                    </div>

                                    <div className="flex flex-col gap-[2px]">
                                      <span
                                        className="block text-[12px] mt-[6px] w-[238px] overflow-hidden text-ellipsis whitespace-nowrap text-gray-600"
                                        title={meeting?.participants
                                          ?.map((p: any) => p.name)
                                          .join(', ')}
                                      >
                                        Participants:{' '}
                                        {meeting?.participants
                                          ?.map((p: any) => p.name)
                                          .join(', ')}
                                      </span>
                                      {/* <span
                                        className="block text-[12px] text-gray-400 w-[238px] overflow-hidden text-ellipsis whitespace-nowrap"
                                        title={meeting?.minutes_of_meeting}
                                      >
                                        {meeting?.minutes_of_meeting ||
                                          'No meeting notes'}
                                      </span> */}
                                    </div>
                                  </div>
                                </div>
                              </Link>
                            )
                          )}
                        </>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <span className="flex justify-center items-center">
                            No communication
                          </span>
                        </div>
                      )}
                    </ul>
                  </div>
                  {/* <div className="bg-gray-50 p-[20px] rounded-sm w-[186px]">
                    <div className="">
                      <h2 className="text-[14px] font-[400] text-gray-500 mb-2 ">
                        Mapped Company Personnel
                      </h2>
                      <div className="">
                        <div className="flex justify-center">
                          <img
                            src={`/api/app-service/v1/picture/customer_stakeholder_master/${
                              selectedStakeholder?.mapped_company_personnel
                                ?.user_id
                            }?org_id=${localStorage?.getItem(
                              'org_id'
                            )}&initials=${
                              selectedStakeholder?.mapped_company_personnel
                                ?.type == 'internal'
                                ? getInitials(
                                    mappedComponyPersonal?.data?.first_name +
                                      ' ' +
                                      mappedComponyPersonal?.data?.last_name
                                  )
                                : selectedStakeholder?.mapped_company_personnel
                                    ?.type == 'external'
                                ? getInitials(
                                    selectedStakeholder
                                      ?.mapped_company_personnel?.name
                                  )
                                : 'NA'
                            } `}
                            alt="Person"
                            className="w-[84px] h-[13.1vh] 2xl:h-[8.1vh] rounded-full object-cover"
                          />
                          <div className="h-[74px] w-[74px] rounded-full object-cover bg-gray-200 text-[24px] font-[500] text-center pt-5">
                            {selectedStakeholder?.mapped_company_personnel
                              ?.type == 'internal'
                              ? getInitials(
                                  mappedComponyPersonal?.data?.first_name +
                                    ' ' +
                                    mappedComponyPersonal?.data?.last_name
                                )
                              : selectedStakeholder?.mapped_company_personnel
                                  ?.type == 'external'
                              ? getInitials(
                                  selectedStakeholder?.mapped_company_personnel
                                    ?.name
                                )
                              : 'NA'}
                          </div>
                        </div>
                        <div className="ml-2 text-center">
                          <h3 className="font-semibold text-[16px] text-gray-900 my-2">
                            {selectedStakeholder?.mapped_company_personnel
                              ?.type == 'internal'
                              ? mappedComponyPersonal?.data?.first_name
                                ? mappedComponyPersonal?.data?.first_name
                                : '' +
                                  ' ' +
                                  mappedComponyPersonal?.data?.last_name
                                ? mappedComponyPersonal?.data?.last_name
                                : ''
                              : selectedStakeholder?.mapped_company_personnel
                                  ?.type == 'external'
                              ? selectedStakeholder?.mapped_company_personnel
                                  ?.name
                              : ''}
                          </h3>
                          <p className="text-[12px] text-gray-600 font-[400]">
                            {selectedStakeholder?.mapped_company_personnel
                              ?.designation &&
                            (mappedComponyPersonal?.data?.name ||
                              selectedStakeholder?.mapped_company_personnel
                                ?.name)
                              ? selectedStakeholder?.mapped_company_personnel
                                  ?.designation
                              : ''}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div> */}
                </div>

                {upcomingEvents && upcomingEvents.length > 0 ? (
                  <div className="mt-4 mb-2 bg-gray-50 p-[20px]">
                    <h2 className="text-[14px] font-[400] text-gray-500 my-2">
                      Personal Events
                    </h2>
                    <ul className="">
                      {upcomingEvents.map((ele: any) => (
                        <li
                          key={ele?.type}
                          className="flex justify-between items-start border-b-[0.95px] border-[#E4E7EC] pb-3 my-2"
                        >
                          <div>
                            <p className="text-[16px] font-[500] text-gray-900">
                              {ele?.name}
                            </p>
                            <p className="text-[14px] text-gray-500 font-[400]">
                              {ele?.description}
                            </p>
                            <span
                              className={`${getDateStatus(ele?.date) == 'Tomorrow'
                                ? 'bg-[#FFEECC] text-[#EAB308]'
                                : getDateStatus(ele?.date) == 'Upcoming'
                                  ? 'bg-[#CCEAFF] text-[#3B82F6]'
                                  : ''
                                }  text-[12px] font-[600] px-2 py-1 rounded-[4px]`}
                            >
                              {getDateStatus(ele?.date)}
                            </span>
                          </div>
                          <span className="text-[16px] font-[400] text-gray-400">
                            {getRelativeTime(ele?.date)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            </>
          ) : (
            ''
          )}
        </div>
      </div>
      {showCompose ? (
        <Modal
          Content={
            <ComposeEmail
              toggle={toggle}
              // stakeholdersArr={stakeholdersArr}
              setShowToErrorModal={setShowToErrorModal}
              setShowConfirmModal={setShowConfirmModal}
              onChildFunctionReady={handleChildFunctionReady}
              stakeholderEmail={selectedStakeholder?.email}
            />
          }
          size=""
          backBg="!border-none !shadow-none"
          composeEmail={true}
        ></Modal>
      ) : (
        <></>
      )}
      {showConfirmModal ? (
        <ConfirmationModalForEmail
          header="Are you sure you want to send an email without subject?"
          handleCancel={() => setShowConfirmModal(false)}
          handleYes={() => {
            if (childAsyncFunctionRef.current) childAsyncFunctionRef.current();
          }}
          yesText="Yes, send it"
          modalOpen={showConfirmModal}
        />
      ) : (
        ''
      )}
      {showToErrorModal ? (
        <ConfirmationModalForEmail
          header="Please specify at least one recipient"
          handleCancel={() => setShowToErrorModal(false)}
          handleYes={() => setShowToErrorModal(false)}
          yesText="OK"
          modalOpen={showToErrorModal}
        />
      ) : (
        ''
      )}

      {addStakeholderForm && (
        <AddStakeholderModal
          addStakeholderForm={addStakeholderForm}
          setAddStakeholderForm={setAddStakeholderForm}
          editData={editData}
        />
      )}
      {/* <DeleteModal
        show={deleteModal}
        onHide={deleteToggle}
        onDelete={handleDelete}
      /> */}
      <DeleteStakeholderModal
        show={deleteModal}
        onHide={deleteToggle}
        onDelete={handleDelete}
        selectedStakeholder={selectedStakeholder}
      />
    </div>
  );
}

export default StakeHolder;
