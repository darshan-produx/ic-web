'use client';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import Conversation from './components/Conversation';
import SideBar from './components/SideBar';
import {
  getAllCustomersStakeholders,
  getEmailById,
  getEmailByMessageId,
  getEmails,
  getLastSyncEmail,
} from '../../api/emails/emails';
import { useCallback, useEffect, useState } from 'react';
import { Dropdown } from '../../../common/Dropdown';
import { MultiValue } from 'react-select';
import { ChevronDown, PenLine, Search } from 'lucide-react';
import { DropdownHover } from '../../../common/components/DropdownOnHover';
import ComposeEmail from './components/ComposeEmailModal';
import Modal from '../../../common/Modal';
import ConfirmationModalForEmail from '../../../common/components/Modal/confirmationModalForEmail';
import { getAllEmailSettings } from '../../api/globalconfig/globalconfig';
import { useSetPasswordForEmail } from '../../../services/mutations/emailSettingMutations';
import { toast } from 'react-toastify';
import {
  EmailPasswordQuestionMark,
  EyeIcon,
  EyeOffIcon,
} from '../../assests/icons/icons';
import { apiRequest } from '../../../common/api-request';

interface Option {
  value: string;
  label: string;
  stakeholders?: any[];
}

export default function Email(props: any) {
  const [, setDummy] = useState(0);
  let urlSelectedId: string | null = null;
  let urlSelectedMessageId: string | null = null;
  if (typeof window !== 'undefined' && window?.location?.href) {
    const url = new URL(window.location.href);
    urlSelectedId = String(url.searchParams.get('email_message_id'));
    urlSelectedMessageId = String(url.searchParams.get('message_id'));
  }

  const [stopEmailSettingOnApiCall, setStopEmailSettingOnApiCall] =
    useState(false);
  const [mainFilter, setMainFilter] = useState('Inbox');
  const [customerFilter, setCustomerFilter] = useState({
    customer: 'All customers',
    stakeholder: '',
  });

  const { data: allCustomers } = useQuery({
    queryKey: ['allCustomersStakeholders'],
    queryFn: () => getAllCustomersStakeholders(true),
    refetchOnWindowFocus: false,
  });

  const { data: allGlobalEmailSettings } = useQuery({
    queryKey: ['getAllEmailSettings'],
    queryFn: getAllEmailSettings,
    refetchOnWindowFocus: false,
  });

  const { data: lastSyncStatus } = useQuery({
    queryKey: ['last-sync-email'],
    queryFn: () => getLastSyncEmail(),
    refetchOnWindowFocus: false,
  });

  const passwordSet = useSetPasswordForEmail();
  const [password, setPassword] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [showToErrorModal, setShowToErrorModal] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState(false);
  const [disabledPass, setDisabledPass] = useState(false);

  const [sortBy, setSortBy] = useState('datetime');

  const { data: emails, fetchNextPage } = useInfiniteQuery({
    queryKey: ['user-emails', mainFilter, customerFilter, sortBy],
    queryFn: ({ pageParam }) =>
      getEmails({
        folder: mainFilter,
        sort_by: mainFilter == 'Inbox' ? sortBy : '',
        customer_id: Number(customerFilter?.customer),
        stakeholder_id: customerFilter?.stakeholder,
        skip: pageParam,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) =>
      lastPage?.data.data.length > 0 ? lastPage?.data.skip + 15 : undefined,
  });
  const { data: userinfo } = useQuery({
    queryKey: ['userDetails'],
    queryFn: () =>
      apiRequest({
        url: '/api/app-service/v1/userinfo?is_email_encrypt=false',
      }),
    refetchOnWindowFocus: false,
  });
  const [childFunction, setChildFunction] = useState<(() => void) | null>();

  const { data: emailById, isLoading: isLoadingEmailById, isFetched: isFetchedEmailById } = useQuery({
    queryKey: ['getEmailBymongoId', urlSelectedId],
    queryFn: () =>
      getEmailById(
        urlSelectedId && urlSelectedId != 'null' ? urlSelectedId : ''
      ),
    enabled: !!urlSelectedId && urlSelectedId !== 'null',
    refetchOnWindowFocus: false,
  });

  const { data: emailByMessageId, isLoading: isLoadingEmailByMessageId, isFetched: isFetchedEmailByMessageId } = useQuery({
    queryKey: ['getEmailByMessage_id', urlSelectedMessageId],
    queryFn: () =>
      getEmailByMessageId(
        urlSelectedMessageId && urlSelectedMessageId !== 'null'
          ? urlSelectedMessageId
          : ''
      ),
    enabled: !!urlSelectedMessageId && urlSelectedMessageId !== 'null',
    refetchOnWindowFocus: false,
  });

  const email_by_message_id =
    urlSelectedMessageId && urlSelectedMessageId !== 'null'
      ? urlSelectedMessageId
      : urlSelectedId && urlSelectedId !== 'null'
        ? urlSelectedId
        : null;

  const [emailArr, setEmailArr] = useState<any[]>([]);

  // Update emailArr when query data changes
  useEffect(() => {
    if (urlSelectedMessageId && urlSelectedMessageId !== 'null' && Array.isArray(emailByMessageId?.data?.data)) {
      setEmailArr([...emailByMessageId.data.data]);
    } else if (urlSelectedId && urlSelectedId !== 'null' && emailById?.data?.data) {
      setEmailArr([emailById.data.data]);
    } else if (isFetchedEmailById || isFetchedEmailByMessageId) {
      // API finished but returned null/empty - set to empty array
      setEmailArr([]);
    }
  }, [emailById, emailByMessageId, urlSelectedId, urlSelectedMessageId, isFetchedEmailById, isFetchedEmailByMessageId]);

  const [selectedEmail, setSelectedEmail] = useState({
    conversation_id: '',
    email_id: '',
  });

  // const stakeholdersArr = [] as any;
  // allCustomers?.data?.map((ele: any) => {
  //   stakeholdersArr.push(...ele?.stakeholders);
  // });

  const [show, setShow] = useState<boolean>(false);

  const toggle = useCallback(() => {
    setShow((prevShow) => !prevShow);
  }, []);

  useEffect(() => {
    setStopEmailSettingOnApiCall(false);
  }, [mainFilter, customerFilter, sortBy]);

  useEffect(() => {
    setCustomerFilter({
      customer: 'All customers',
      stakeholder: '',
    });
    setSortBy('datetime');
  }, [mainFilter]);

  const handleSubmit = async (e: any) => {
    setPassword('');
    e.preventDefault();
    const dataForSetPassword = {
      password: password,
      use_password: true,
    };
    try {
      const res = passwordSet.mutateAsync(dataForSetPassword);
      setDisabledPass(true);
      toast.success(
        'Your password has been set successfully. Please check this page after some time while your emails are fetched.'
      );
    } catch (err: any) {
      toast.error(err?.message);
    }
  };

  useEffect(() => {
    if (allGlobalEmailSettings?.data) {
      allGlobalEmailSettings?.data.forEach((setting: any) => {
        if (setting.key === 'ai_assist_enabled') {
          if (setting?.value == 1) {
            setSortBy('Priority');
          }
        }
      });
    }
  }, [allGlobalEmailSettings, mainFilter]);

  useEffect(() => {
    const newEmails: any[] =
      emails?.pages.reduce(
        (arr, pageResponse) => arr.concat(pageResponse?.data.data),
        []
      ) ?? [];

    if (email_by_message_id) {
      setStopEmailSettingOnApiCall(true);
      setSelectedEmail({
        conversation_id: emailArr[0]?.email_conversation_id,
        email_id: emailArr[0]?._id,
      });
    } else {
      if (stopEmailSettingOnApiCall == false) {
        if (newEmails?.length > 0) {
          setStopEmailSettingOnApiCall(true);
          setSelectedEmail({
            conversation_id: newEmails[0]?.email_conversation_id,
            email_id: newEmails[0]?._id,
          });
        } else {
          setSelectedEmail({
            conversation_id: '',
            email_id: '',
          });
        }
      }
    }
  }, [emails, stopEmailSettingOnApiCall]);

  const handleChildFunctionReady = (fn: () => void) => {
    setChildFunction(() => fn);
  };

  const onEyeClick = () => {
    setShowPassword(!showPassword);
  };
  const sso_user = lastSyncStatus?.data?.sso_user;
  const EMAIL_SERVICE_PROVIDER = lastSyncStatus?.data?.EMAIL_SERVICE_PROVIDER;
  const app_password_url =
    EMAIL_SERVICE_PROVIDER === 'GOOGLE'
      ? 'https://support.google.com/mail/answer/185833?hl=en'
      : EMAIL_SERVICE_PROVIDER === 'MICROSOFT'
        ? 'https://support.microsoft.com/en-us/account-billing/how-to-get-and-use-app-passwords-5896ed9b-4263-e681-128a-a6f2979a7944'
        : '';
  return (
    <>
      {!lastSyncStatus?.data?.error_message ? (
        <div className="flex h-[calc(100vh-3.375rem)] overflow-hidden justify-center max-w-[1200px] m-auto">
          <div className="w-[320px] border-r-[1px] border-[#E4E7EC] h-[calc(100vh-3.375rem)]">
            <div className="mx-[12px] gap-[12px] mt-[12px] flex w-full">
              <div
                className={`w-[142px] ${email_by_message_id ? 'pointer-not-allowed opacity-50 ' : ''
                  }`}
              >
                {renderDropdown(
                  'Inbox',
                  mainFilter,
                  [
                    { label: 'Inbox', value: 'Inbox' },
                    { label: 'Sent', value: 'Sent' },
                    { label: 'Starred', value: 'Star' },
                    // { label: 'Trash', value: 'Trash' },
                  ],
                  setMainFilter,
                  email_by_message_id != null
                )}
              </div>
              <div className="w-[142px]">
                <button
                  className="rounded-[6px] bg-[#ECF3FF] px-[12px] py-[8px] w-full flex gap-[10px] "
                  onClick={() => {
                    toggle();
                  }}
                >
                  <PenLine className="w-[16px] h-[16px] text-[#3B82F6]" />{' '}
                  <span className="font-[500] text-[12px] text-[#3B82F6]">
                    Compose
                  </span>
                </button>
              </div>
            </div>
            <div className="mx-[12px] mt-[16px]">
              <div
                className={`w-full ${email_by_message_id ? 'cursor-not-allowed opacity-50 ' : ''
                  }`}
              >
                <RenderDropdownForCustomer
                  label={customerFilter}
                  options={
                    allCustomers?.data?.map((ele: any) => ({
                      label: ele?.customer_name,
                      value: ele?.customer_id,
                      stakeholders: ele?.stakeholders,
                    })) ?? []
                  }
                  setFilterOption={setCustomerFilter}
                  disabled={email_by_message_id != null}
                />
              </div>
            </div>
            <div className="mx-[12px] my-[16px]">
              {mainFilter == 'Inbox' ? (
                <>
                  <div
                    className={`w-full ${email_by_message_id ? ' opacity-50 ' : ''
                      }`}
                  >
                    {renderDropdown(
                      'Sort by',
                      `Sort by ${sortBy}`,
                      [
                        { label: 'Priority', value: 'Priority' },
                        { label: 'Urgency', value: 'Urgency' },
                        { label: 'Emotion', value: 'Emotion' },
                        { label: 'Newest first', value: 'datetime' },
                      ],
                      setSortBy,
                      email_by_message_id != null
                    )}
                  </div>
                </>
              ) : (
                <></>
              )}
            </div>
            {emails?.pages.reduce(
                (arr, pageResponse) => arr.concat(pageResponse?.data.data),
                []
              )?.length != 0 ||
              email_by_message_id ? (
              <SideBar
                emails={
                  email_by_message_id
                    ? emailArr
                    : (emails?.pages.reduce(
                      (arr, pageResponse) =>
                        arr.concat(pageResponse?.data.data),
                      []
                    ) as any[])
                }
                selectedEmail={selectedEmail}
                setSelectedEmail={setSelectedEmail}
                allCustomers={allCustomers?.data}
                onLoadMore={fetchNextPage}
                sortBy={sortBy}
                singleEmail={email_by_message_id == null}
                setDummy={setDummy}
                setStopEmailSettingOnApiCall={setStopEmailSettingOnApiCall}
                userinfo={userinfo}
              />
            ) : (
              <>
                <div className="w-full text-center pt-[32px] border-t-[1px] border-gray-200 ">
                  <div>
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 32 32"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="m-auto"
                    >
                      <path
                        d="M29.0551 4.01562H10.978C9.35426 4.01562 8.0332 5.33669 8.0332 6.96244C8.0332 8.58619 9.35426 9.90725 10.978 9.90725H29.055C30.6788 9.90725 31.9998 8.58619 31.9998 6.96244C31.9999 5.33663 30.6788 4.01562 29.0551 4.01562Z"
                        fill="#CED2DA"
                      />
                      <path
                        d="M2.94587 4.01562C1.32156 4.01562 0 5.33713 0 6.96144C0 8.58575 1.32156 9.90725 2.94587 9.90725C4.57019 9.90725 5.89169 8.58575 5.89169 6.96144C5.89169 5.33713 4.57019 4.01562 2.94587 4.01562Z"
                        fill="#CED2DA"
                      />
                      <path
                        d="M2.94587 13.0547C1.32156 13.0547 0 14.3762 0 16.0005C0 17.6248 1.32156 18.9463 2.94587 18.9463C4.57019 18.9463 5.89169 17.6248 5.89169 16.0005C5.89169 14.3762 4.57019 13.0547 2.94587 13.0547Z"
                        fill="#CED2DA"
                      />
                      <path
                        d="M2.94587 22.0898C1.32156 22.0898 0 23.4113 0 25.0357C0 26.66 1.32156 27.9815 2.94587 27.9815C4.57019 27.9815 5.89169 26.66 5.89169 25.0357C5.89169 23.4113 4.57019 22.0898 2.94587 22.0898Z"
                        fill="#CED2DA"
                      />
                      <path
                        d="M29.0551 13.0547H10.978C9.35426 13.0547 8.0332 14.3757 8.0332 16.0015C8.0332 17.6252 9.35426 18.9463 10.978 18.9463H29.055C30.6788 18.9463 31.9998 17.6252 31.9998 16.0015C31.9999 14.3757 30.6788 13.0547 29.0551 13.0547Z"
                        fill="#CED2DA"
                      />
                      <path
                        d="M29.0551 22.0898H10.978C9.35426 22.0898 8.0332 23.4109 8.0332 25.0367C8.0332 26.6604 9.35426 27.9815 10.978 27.9815H29.055C30.6788 27.9815 31.9998 26.6604 31.9998 25.0367C31.9999 23.4109 30.6788 22.0898 29.0551 22.0898Z"
                        fill="#CED2DA"
                      />
                    </svg>

                    <h6 className="font-[400] text-[14px] mt-[24px] text-gray-900">
                      No emails found
                    </h6>
                    <p className="mb-[6px] text-gray-400 text-[12px]">
                      Contact admin if emails are not in sync
                    </p>
                    {mainFilter != 'Inbox' ||
                      sortBy != 'Priority' ||
                      customerFilter?.customer != 'All customers' ? (
                      <button
                        onClick={() => {
                          setCustomerFilter({
                            customer: 'All customers',
                            stakeholder: '',
                          });
                          setMainFilter('Inbox');
                          setSortBy('Priority');
                        }}
                        className="text-center  bg-white text-gray-800 border-gray-200 border-[1px] rounded-[6px] w-[91px] mx-auto mt-[24px] px-[10px] py-[8px] font-[500] text-[12px] text-gray-900"
                      >
                        Reset filters
                      </button>
                    ) : (
                      ''
                    )}
                  </div>
                </div>
              </>
            )}
            {show ? (
              <>
                <Modal
                  Content={
                    <ComposeEmail
                      toggle={toggle}
                      // stakeholdersArr={stakeholdersArr}
                      setShowToErrorModal={setShowToErrorModal}
                      setShowConfirmModal={setShowConfirmModal}
                      onChildFunctionReady={handleChildFunctionReady}
                    />
                  }
                  size=""
                  backBg="!border-none !shadow-none"
                  composeEmail={true}
                ></Modal>
                {showConfirmModal ? (
                  <ConfirmationModalForEmail
                    header="Are you sure you want to send an email without subject?"
                    handleCancel={() => setShowConfirmModal(false)}
                    handleYes={() => {
                      if (childFunction) {
                        childFunction();
                      }
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
              </>
            ) : (
              ''
            )}
          </div>
          <div className="w-[880px]">
            {/* Case 1: Looking at a specific email via URL params */}
            {email_by_message_id ? (
              // Loading state for specific email
              (isLoadingEmailById || isLoadingEmailByMessageId) ? (
                <div className="ripple">
                  <svg
                    width="900"
                    height="948"
                    viewBox="0 0 900 948"
                    fill="none"
                    className=""
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <line
                      x1="0.5"
                      y1="-2.18557e-08"
                      x2="0.500041"
                      y2="949"
                      stroke="#E4E7EC"
                    />
                    <rect
                      x="30"
                      y="24"
                      width="850"
                      height="21"
                      rx="6"
                      fill="#F9FAFB"
                    />
                    <rect
                      x="30"
                      y="57"
                      width="86"
                      height="21"
                      rx="6"
                      fill="#F9FAFB"
                    />
                    <rect
                      x="128"
                      y="57"
                      width="86"
                      height="21"
                      rx="6"
                      fill="#F9FAFB"
                    />
                    <rect
                      x="226"
                      y="57"
                      width="86"
                      height="21"
                      rx="6"
                      fill="#F9FAFB"
                    />
                    <line
                      x1="30"
                      y1="101.5"
                      x2="880"
                      y2="101.5"
                      stroke="#F9FAFB"
                    />
                    <rect
                      x="30"
                      y="126"
                      width="44"
                      height="45"
                      rx="22"
                      fill="#F9FAFB"
                    />
                    <rect
                      x="94"
                      y="126"
                      width="786"
                      height="45"
                      rx="6"
                      fill="#F9FAFB"
                    />
                    <line
                      x1="30"
                      y1="194.5"
                      x2="880"
                      y2="194.5"
                      stroke="#F9FAFB"
                    />
                    <rect
                      x="30"
                      y="219"
                      width="44"
                      height="45"
                      rx="22"
                      fill="#F9FAFB"
                    />
                    <rect
                      x="94"
                      y="219"
                      width="786"
                      height="45"
                      rx="6"
                      fill="#F9FAFB"
                    />
                    <rect
                      x="94"
                      y="288"
                      width="786"
                      height="266"
                      rx="6"
                      fill="#F9FAFB"
                    />
                  </svg>
                </div>
              ) : emailArr.length === 0 && (isFetchedEmailById || isFetchedEmailByMessageId) ? (
                // Email not found - API returned null
                <div className="flex flex-col items-center justify-center h-full">
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 48 48"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="mb-4"
                  >
                    <path
                      d="M42 12L24 24L6 12V36C6 37.0609 6.42143 38.0783 7.17157 38.8284C7.92172 39.5786 8.93913 40 10 40H38C39.0609 40 40.0783 39.5786 40.8284 38.8284C41.5786 38.0783 42 37.0609 42 36V12Z"
                      stroke="#CED2DA"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M42 12C42 10.9391 41.5786 9.92172 40.8284 9.17157C40.0783 8.42143 39.0609 8 38 8H10C8.93913 8 7.92172 8.42143 7.17157 9.17157C6.42143 9.92172 6 10.9391 6 12L24 24L42 12Z"
                      stroke="#CED2DA"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <h6 className="font-[500] text-[16px] text-gray-900 mb-2">
                    Email not found
                  </h6>
                  <p className="text-gray-500 text-[14px] text-center max-w-[300px]">
                    This email doesn't exist or you don't have permission to view it.
                  </p>
                </div>
              ) : (
                // Specific email found - show conversation
                <Conversation
                  selectedEmail={selectedEmail}
                  allCustomers={allCustomers?.data}
                  setStopEmailSettingOnApiCall={setStopEmailSettingOnApiCall}
                  stopEmailSettingOnApiCall={stopEmailSettingOnApiCall}
                  userinfo={userinfo}
                />
              )
            ) : (
              /* Case 2: Normal inbox view - no specific email requested */
              emails?.pages.reduce(
                (arr, pageResponse) => arr.concat(pageResponse?.data.data),
                []
              )?.length != 0 ? (
                <Conversation
                  selectedEmail={selectedEmail}
                  allCustomers={allCustomers?.data}
                  setStopEmailSettingOnApiCall={setStopEmailSettingOnApiCall}
                  stopEmailSettingOnApiCall={stopEmailSettingOnApiCall}
                  userinfo={userinfo}
                />
              ) : (
                <div className="ripple">
                  <svg
                    width="900"
                    height="948"
                    viewBox="0 0 900 948"
                    fill="none"
                    className=""
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <line
                      x1="0.5"
                      y1="-2.18557e-08"
                      x2="0.500041"
                      y2="949"
                      stroke="#E4E7EC"
                    />
                    <rect
                      x="30"
                      y="24"
                      width="850"
                      height="21"
                      rx="6"
                      fill="#F9FAFB"
                    />
                    <rect
                      x="30"
                      y="57"
                      width="86"
                      height="21"
                      rx="6"
                      fill="#F9FAFB"
                    />
                    <rect
                      x="128"
                      y="57"
                      width="86"
                      height="21"
                      rx="6"
                      fill="#F9FAFB"
                    />
                    <rect
                      x="226"
                      y="57"
                      width="86"
                      height="21"
                      rx="6"
                      fill="#F9FAFB"
                    />
                    <line
                      x1="30"
                      y1="101.5"
                      x2="880"
                      y2="101.5"
                      stroke="#F9FAFB"
                    />
                    <rect
                      x="30"
                      y="126"
                      width="44"
                      height="45"
                      rx="22"
                      fill="#F9FAFB"
                    />
                    <rect
                      x="94"
                      y="126"
                      width="786"
                      height="45"
                      rx="6"
                      fill="#F9FAFB"
                    />
                    <line
                      x1="30"
                      y1="194.5"
                      x2="880"
                      y2="194.5"
                      stroke="#F9FAFB"
                    />
                    <rect
                      x="30"
                      y="219"
                      width="44"
                      height="45"
                      rx="22"
                      fill="#F9FAFB"
                    />
                    <rect
                      x="94"
                      y="219"
                      width="786"
                      height="45"
                      rx="6"
                      fill="#F9FAFB"
                    />
                    <rect
                      x="94"
                      y="288"
                      width="786"
                      height="266"
                      rx="6"
                      fill="#F9FAFB"
                    />
                  </svg>
                </div>
              )
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center absolute top-[15vh] left-[37vw] max-w-[23.375rem] max-h-[26.5rem] rounded-[12px] border border-gray-300 p-5 gap-[34px]">
          <div className="flex flex-col items-center justify-center">
            <div className="mt-5 mb-3">
              <svg
                width="36"
                height="36"
                viewBox="0 0 36 36"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clipPath="url(#clip0_4544_126313)">
                  <path
                    d="M21.5684 16.8052L19.3518 19.0218L16.9798 16.6498L19.1964 14.4332C19.6083 14.0214 19.6083 13.3536 19.1964 12.9417C18.7845 12.5299 18.1168 12.5298 17.7049 12.9417L15.4883 15.1583L13.9692 13.6393C13.7714 13.4415 13.5032 13.3303 13.2235 13.3303C12.9437 13.3303 12.6756 13.4415 12.4778 13.6393L8.74143 17.3756C7.42124 18.6958 6.69421 20.451 6.69421 22.318C6.69421 23.8286 7.17036 25.2659 8.05138 26.4589L0.308918 34.2011C-0.102973 34.613 -0.102973 35.2808 0.308918 35.6927C0.514863 35.8986 0.784793 36.0015 1.05472 36.0015C1.32465 36.0015 1.59458 35.8986 1.80046 35.6926L9.54271 27.9503C10.7357 28.8313 12.173 29.3075 13.6836 29.3075C15.5506 29.3075 17.3058 28.5805 18.626 27.2603L22.3624 23.5239C22.5602 23.3262 22.6713 23.0579 22.6713 22.7782C22.6713 22.4985 22.5602 22.2303 22.3624 22.0325L20.8433 20.5134L23.0599 18.2968C23.4718 17.885 23.4718 17.2172 23.0599 16.8053C22.648 16.3933 21.9802 16.3933 21.5684 16.8052ZM17.1344 25.7688C16.2127 26.6905 14.9871 27.1982 13.6836 27.1982C12.38 27.1982 11.1546 26.6905 10.2328 25.7688C9.3111 24.8471 8.80344 23.6215 8.80344 22.318C8.80344 21.0145 9.3111 19.7889 10.2328 18.8672L13.2234 15.8766L20.1251 22.7783L17.1344 25.7688Z"
                    fill="#CED2DA"
                  />
                  <path
                    d="M35.691 0.308918C35.2792 -0.102973 34.6113 -0.102973 34.1995 0.308918L30.6729 3.83551C27.9397 1.82345 24.0619 2.0533 21.5902 4.52507L17.8538 8.26147C17.4419 8.67336 17.4419 9.34112 17.8538 9.75301L26.247 18.1462C26.453 18.3522 26.7229 18.4552 26.9928 18.4552C27.2626 18.4552 27.5326 18.3522 27.7385 18.1462L31.4749 14.4099C33.9467 11.9381 34.1765 8.06045 32.1645 5.32712L35.6911 1.80053C36.103 1.38857 36.103 0.720809 35.691 0.308918ZM29.9834 12.9183L26.9928 15.9088L20.0912 9.00721L23.0817 6.01661C24.9847 4.11381 28.0807 4.11388 29.9834 6.01661C31.8861 7.9194 31.8861 11.0155 29.9834 12.9183Z"
                    fill="#CED2DA"
                  />
                  <path
                    d="M12.377 22.5484C12.377 23.1426 12.8586 23.6242 13.4527 23.6242C14.0469 23.6242 14.5285 23.1426 14.5285 22.5484C14.5285 21.9543 14.0469 21.4727 13.4527 21.4727C12.8586 21.4727 12.377 21.9543 12.377 22.5484Z"
                    fill="#CED2DA"
                  />
                  <path
                    d="M26.7633 8.16016C26.1691 8.16016 25.6875 8.6418 25.6875 9.23594C25.6875 9.83008 26.1691 10.3117 26.7633 10.3117C27.3574 10.3117 27.8391 9.83008 27.8391 9.23594C27.8391 8.64187 27.3574 8.16016 26.7633 8.16016Z"
                    fill="#CED2DA"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_4544_126313">
                    <rect width="36" height="36" fill="white" />
                  </clipPath>
                </defs>
              </svg>
            </div>
            <p className="text-gray-900 font-[400] text-[18px] text-center">
              We are unable to connect to your email account at the moment
            </p>
          </div>
          {!sso_user && (
            <div>
              <p className="text-gray-900 font-[400] text-[14px] text-center pb-5">
                Please enter{' '}
                <a
                  className="text-[#3B82F6] inline-flex items-center space-x-1"
                  href={app_password_url}
                  target="_blank"
                >
                  <span>App password</span>
                  <EmailPasswordQuestionMark />
                </a>
              </p>
              <form onSubmit={handleSubmit} className="flex space-x-2">
                <div className="relative">
                  <input
                    type={!showPassword ? 'password' : 'text'}
                    placeholder="Enter app password"
                    value={password}
                    autoComplete="off"
                    autoFocus
                    onChange={(e) => setPassword(e.target.value)}
                    className="border border-gray-300 rounded-[8px] py-[8px] pr-[30px] pl-[12px]  text-gray-500 placeholder:text-[#637083] outline-none  w-full"
                  />
                  {!showPassword ? (
                    <span onClick={onEyeClick}>
                      <EyeIcon className="absolute top-0  right-0 h-6 mr-1.5 my-2 text-slate-400 cursor-pointer"></EyeIcon>
                    </span>
                  ) : (
                    <span onClick={onEyeClick}>
                      <EyeOffIcon className="absolute top-0 right-0 h-6 mr-1.5 my-2 text-slate-400 cursor-pointer"></EyeOffIcon>
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  className={`${password ? 'bg-[#1A75FF] text-white' : 'bg-[#F9FAFB]'
                    } font-[600] text-[#97A1AF] text-[14px] px-[20px] py-[10px] rounded-[8px] cursor-pointer disabled:cursor-not-allowed`}
                  disabled={disabledPass || password === ''}
                >
                  Submit
                </button>
              </form>
            </div>
          )}
          {!sso_user && (
            <div className="flex items-center justify-center">
              <span className="border-[1px] w-[6rem] border-[#E4E7EC]"></span>
              <span className="text-[#637083] font-[400] text-[16px] text-center px-6">
                Or
              </span>
              <span className="border-[1px] w-[6rem] border-[#E4E7EC]"></span>
            </div>
          )}
          <div
            className="flex items-center justify-center text-white bg-[#1A75FF] rounded-[16px] h-[54px] text-[16px] font-semibold cursor-pointer px-[23px] py-[15px]"
            onClick={() => {
              localStorage.removeItem('access_token');
              localStorage.removeItem('org_id');
              window.location.replace(window.location.origin);
            }}
          >
            Login with your company credentials
          </div>
        </div>
      )}
    </>
  );
}

const renderDropdown = (
  placeholder: string,
  label: string,
  options: MultiValue<Option>,
  setFilterOption?: any,
  disabled?: boolean
) => (
  <Dropdown className="inline-flex !w-full ">
    <Dropdown.Trigger
      type="button"
      className={`text-center w-full ${disabled
          ? 'bg-gray-100 text-gray-800 !cursor-not-allowed'
          : 'bg-white text-gray-800'
        } border-gray-200 border-[1px] rounded-[6px] `}
      id="dropdownMenuButton"
      data-bs-toggle="dropdown"
    >
      <div className="flex justify-between items-center px-[12px]  py-[7px]">
        <span className="text-[12px]">
          {label == 'Sort by datetime' ? 'Sort by Newest first' : label}
        </span>
        <ChevronDown className="relative left-[6px] h-[16px] w-[16px] text-gray-500  " />
      </div>
    </Dropdown.Trigger>
    <Dropdown.Content
      placement="bottom-end"
      className={`absolute border border-gray-300 ${disabled ? 'opacity-0' : ''
        }  z-50 px-[6px] py-[6px] ltr:text-left rtl:text-right bg-white rounded-md shadow-md  dropdown-menu ${placeholder == 'Inbox' ? 'w-[8.875rem]' : 'w-[18.5rem]'
        }
       dark:bg-zink-600`}
      aria-labelledby="dropdownMenuButton"
    >
      <ul
        className="text-sm text-gray-700 dark:text-gray-200 "
        aria-labelledby="dropdownMenuIconButton"
      >
        {options.map((item, i) => (
          <li key={i}>
            <div onClick={() => setFilterOption(item.value)}>
              <span
                className={`w-full p-[8px] text-[16px]  ${label?.includes(item?.value)
                    ? 'text-[#3B82F6]'
                    : 'text-gray-700'
                  } rounded dark:text-gray-300 cursor-pointer flex justify-between`}
              >
                <div className="w-[85%] close-dropdown">{item.label}</div>
                {placeholder != 'Inbox' && item?.label !== 'Newest first' ? (
                  <div className="w-[10%]">
                    <svg
                      width="17"
                      height="20"
                      viewBox="0 0 17 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className={`float-end mt-[6px] ${label?.includes(item?.value)
                          ? 'text-[#3B82F6]'
                          : 'text-gray-500'
                        }`}
                    >
                      <path
                        d="M10.6319 3.89346L10.0596 5.48379C9.4231 7.24883 8.03336 8.63851 6.26839 9.27498L4.67807 9.84728C4.53455 9.89898 4.53455 10.1022 4.67807 10.1539L6.26839 10.7262C8.03343 11.3627 9.42312 12.7525 10.0596 14.5174L10.6319 16.1078C10.6836 16.2513 10.8868 16.2513 10.9385 16.1078L11.5108 14.5174C12.1473 12.7524 13.5371 11.3627 15.302 10.7262L16.8924 10.1539C17.0359 10.1022 17.0359 9.89899 16.8924 9.84728L15.302 9.27498C13.537 8.63849 12.1473 7.24876 11.5108 5.48379L10.9385 3.89346C10.8868 3.74905 10.6836 3.74905 10.6319 3.89346Z"
                        fill="CurrentColor"
                      />
                      <path
                        d="M3.472 0.0711168L3.1814 0.876069C2.85869 1.76929 2.15536 2.47351 1.26125 2.79622L0.456296 3.08682C0.383199 3.11356 0.383199 3.21608 0.456296 3.24193L1.26125 3.53253C2.15447 3.85523 2.85869 4.55856 3.1814 5.45268L3.472 6.25763C3.49874 6.33073 3.60126 6.33073 3.62711 6.25763L3.91771 5.45268C4.24041 4.55945 4.94374 3.85523 5.83786 3.53253L6.64281 3.24193C6.71591 3.21518 6.71591 3.11267 6.64281 3.08682L5.83786 2.79622C4.94463 2.47351 4.24041 1.77018 3.91771 0.876069L3.62711 0.0711168C3.60126 -0.00287227 3.49785 -0.00287227 3.472 0.0711168Z"
                        fill="CurrentColor"
                      />
                      <path
                        d="M3.472 13.7423L3.1814 14.5473C2.85869 15.4405 2.15536 16.1447 1.26125 16.4674L0.456296 16.758C0.383199 16.7848 0.383199 16.8873 0.456296 16.9131L1.26125 17.2037C2.15447 17.5264 2.85869 18.2298 3.1814 19.1239L3.472 19.9288C3.49874 20.0019 3.60126 20.0019 3.62711 19.9288L3.91771 19.1239C4.24041 18.2307 4.94374 17.5264 5.83786 17.2037L6.64281 16.9131C6.71591 16.8864 6.71591 16.7839 6.64281 16.758L5.83786 16.4674C4.94463 16.1447 4.24041 15.4414 3.91771 14.5473L3.62711 13.7423C3.60126 13.6692 3.49785 13.6692 3.472 13.7423Z"
                        fill="CurrentColor"
                      />
                    </svg>
                  </div>
                ) : (
                  <></>
                )}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </Dropdown.Content>
  </Dropdown>
);

const RenderDropdownForCustomer = ({
  label,
  options,
  setFilterOption,
  disabled,
}: {
  label: any;
  options: MultiValue<Option>;
  setFilterOption?: any;
  disabled?: boolean;
}) => {
  const [searchText, setSearchText] = useState('');
  const regex = new RegExp(`(${escapeRegExp(searchText)})`, 'i');
  const newOptions = options?.filter((item) => regex.test(item.label));
  function escapeRegExp(string: string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
  }
  const customerName = options?.filter(
    (ele: any) => ele?.value == label?.customer
  );
  function getStakeholderNameById(id: any) {
    for (const company of customerName) {
      const stakeholder = company?.stakeholders?.find((st) => st._id === id);
      if (stakeholder) {
        return stakeholder.name;
      }
    }
    return null;
  }
  const stakeholderName = getStakeholderNameById(label?.stakeholder);
  function getInitials(name: string): string {
    const nameParts = name.trim().split(' ');
    let initials = '';

    for (let i = 0; i < Math.min(2, nameParts.length); i++) {
      initials += nameParts[i].charAt(0).toUpperCase();
    }

    return initials;
  }

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      setSearchText('');
    };

    document.addEventListener('click', handleOutsideClick);

    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, []);

  return (
    <Dropdown className="inline-flex !w-full ">
      <Dropdown.Trigger
        type="button"
        className={`text-center w-full ${disabled
            ? 'bg-gray-100 text-gray-800 !cursor-not-allowed'
            : 'bg-white text-gray-800'
          } border-gray-200 border-[1px] rounded-[6px] `}
        id="dropdownMenuButton"
        data-bs-toggle="dropdown"
      >
        <div className="flex justify-between items-center px-[12px]  py-[8px]">
          <span className="text-[12px]">
            {customerName?.length > 0
              ? stakeholderName
                ? `${stakeholderName} (${customerName[0]?.label}) `
                : `${customerName[0]?.label}`
              : 'All customers'}
          </span>
          <ChevronDown className="relative left-[6px] h-[16px] w-[16px] text-gray-500" />
        </div>
      </Dropdown.Trigger>
      <Dropdown.Content
        placement="bottom-end"
        className={`absolute border border-gray-300 ${disabled ? 'opacity-0' : ''
          } z-50  pt-[6px] ltr:text-left rtl:text-right bg-white rounded-md shadow-md  dropdown-menu ${'w-[18.5rem]'}
       dark:bg-zink-600`}
        aria-labelledby="dropdownMenuButton"
      >
        <ul
          className="text-sm text-gray-700 dark:text-gray-200 "
          aria-labelledby="dropdownMenuIconButton"
        >
          <li className=" p-[8px] mx-[6px] pl-[12px] bg-gray-50 rounded-[6px]">
            <div className="flex items-center text-gray-400">
              <Search className="w-[15px] h-[15px] mr-2" />
              <input
                type="text"
                placeholder="Search customer"
                className="outline-none bg-transparent placeholder-gray-400 text-gray-900 text-[16px]"
                value={searchText}
                onChange={(e: any) => setSearchText(e?.target?.value)}
              />
            </div>
          </li>
          <li
            onClick={() =>
              setFilterOption({
                customer: 'All customers',
                stakeholder: '',
              })
            }
            className="mt-[4px] py-[8px] px-[14px] relative"
          >
            {newOptions?.length > 0 ? (
              <span
                className={`w-full   text-[16px]  ${label?.customer == 'All customers'
                    ? 'text-[#3B82F6]'
                    : 'text-gray-700'
                  } rounded dark:text-gray-300 cursor-pointer close-dropdown`}
              >
                All customers
              </span>
            ) : (
              <span
                className={`w-full text-[16px] text-gray-700 rounded dark:text-gray-300 close-dropdown`}
              >
                No customers
              </span>
            )}
          </li>
          {newOptions?.map((item, i) => (
            <li key={i} className="mt-[4px] py-[8px]  relative">
              <DropdownHover className="inline-flex !w-full ">
                <DropdownHover.Trigger
                  type="button"
                  className="w-full"
                  id="dropdownMenuButton"
                  data-bs-toggle="dropdown"
                >
                  <div className="px-[14px]">
                    <span
                      className={`w-full text-[16px]  ${label?.customer == item?.value
                          ? 'text-[#3B82F6]'
                          : 'text-gray-700'
                        } rounded dark:text-gray-300 cursor-pointer flex justify-between`}
                    >
                      <div className="w-[90%] text-left hover:text-[#3B82F6]"> {item.label}</div>
                      <div className="w-[10%]">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                          className="float-end mt-[6px]"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M6.33333 3.33203L10.2929 7.29159C10.6834 7.68212 10.6834 8.31528 10.2929 8.7058L6.33333 12.6654"
                            stroke="#141C24"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    </span>
                  </div>
                </DropdownHover.Trigger>
                <DropdownHover.Content
                  placement="bottom-end"
                  className={`absolute border border-gray-300 ml-[4px]  z-50 px-[6px] py-[8px] ltr:text-left rtl:text-right bg-white rounded-md shadow-md max-h-[216px] scroll overflow-y-auto overflow-x-hidden dropdown-menu ${'w-[18.5rem]'}
       dark:bg-zink-600`}
                  aria-labelledby="dropdownMenuButton"
                >
                  <ul
                    className="text-sm text-gray-700 dark:text-gray-200"
                    aria-labelledby="dropdownMenuIconButton"
                  >
                    <li
                      onClick={() =>
                        setFilterOption({
                          customer: item?.value,
                          stakeholder: '',
                        })
                      }
                    >
                      {item?.stakeholders && item?.stakeholders?.length > 0 ? (
                        <span
                          className={`w-full p-[8px]  text-[16px]  ${label?.stakeholder == ''
                              ? 'text-[#3B82F6]'
                              : 'text-gray-700'
                            } rounded dark:text-gray-300 cursor-pointer`}
                        >
                          All stakeholders
                        </span>
                      ) : (
                        <span
                          className={`w-full p-[8px] text-[16px] text-gray-700
                        } rounded dark:text-gray-300 `}
                        >
                          No stakeholders
                        </span>
                      )}
                    </li>
                    {item?.stakeholders?.map((obj, i) => (
                      <li
                        key={i}
                        onClick={() =>
                          setFilterOption({
                            customer: item?.value,
                            stakeholder: obj?._id,
                          })
                        }
                        className=" p-[8px] mt-[4px]"
                      >
                        <div>
                          <span
                            className={`w-full text-[16px]  ${label?.stakeholder == obj?._id
                                ? 'text-[#3B82F6]'
                                : 'text-gray-700'
                              } rounded dark:text-gray-300 cursor-pointer flex`}
                          >
                            <div className="w-[32px] h-[32px] close-dropdown">
                              <img
                                src={`/api/app-service/v1/picture/customer_stakeholder_master/${obj?._id
                                  }?org_id=${localStorage?.getItem(
                                    'org_id'
                                  )}&initials=${getInitials(
                                    obj?.name
                                  )}&ts=${Math.random()}`}
                                className="w-full h-full rounded-full"
                                alt=""
                              />
                            </div>
                            <div className="close-dropdown mx-[8px] my-[4px]">
                              {obj?.name}
                            </div>
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </DropdownHover.Content>
              </DropdownHover>
            </li>
          ))}
        </ul>
      </Dropdown.Content>
    </Dropdown>
  );
};
