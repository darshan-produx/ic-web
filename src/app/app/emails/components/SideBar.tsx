'use client';

import ButtonLoader from '../../../../common/components/buttonloader';
import { usePatchEmailStarOrView } from '../../../../services/mutations/emailSettingMutations';
import dayjs from 'dayjs';
import { Star } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

interface Props {
  priority: number;
  urgency: number;
  emotion: number;
  sortBy: string;
}

export default function SideBar(props: {
  emails: any[];
  selectedEmail: { conversation_id: string; email_id: string };
  setSelectedEmail: any;
  allCustomers: any[];
  onLoadMore: () => any;
  sortBy: any;
  singleEmail?: boolean;
  setDummy: (value: number) => void;
  setStopEmailSettingOnApiCall: any;
  userinfo: any;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const [showStar, setShowStar] = useState<{ [key: string]: boolean }>({});
  const starOrViewEmail = usePatchEmailStarOrView();
  const [showDataWithdate, setShowDataWithdates] = useState([]) as any;
  const [starLoader, setStarLoaderId] = useState();

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  function dataWithDates(data: any[]) {
    const newArr = [];
    let prevDate = null;
    let hide_id = null;

    for (let i = 0; i < data.length; i++) {
      if (prevDate !== data[i]?.date) {
        newArr.push({
          type: 'dateHeader',
          value: data[i]?.date,
          hide_id: i,
        });
        hide_id = i;
        prevDate = data[i]?.date;
      }
      let newObj = data[i];
      newObj['hide_id'] = hide_id;
      newArr.push(newObj);
    }

    return newArr;
  }

  const sortedEmailByDates = dataWithDates(props?.emails ?? []);

  function getInitials(id: string) {
    const stakeholders: any[] = [];
    props?.allCustomers?.map((ele: any) => {
      stakeholders?.push(...ele?.stakeholders);
    });
    const stakeholder = stakeholders?.filter((ele: any) => ele?._id == id)[0];
    const nameArray = stakeholder?.name?.trim()?.split(' ');
    const initials = nameArray?.map((word: any) => word[0]?.toUpperCase());
    const initial = initials?.join('');

    return initial == undefined ||
      (nameArray[0] == 'undefined' && nameArray[1] == 'undefined')
      ? 'NA'
      : initial;
  }

  function convertDateTimeTotime(dateStr: any) {
    const date = new Date(dateStr);

    // Convert to a 12-hour time format with AM/PM
    const timeString = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });
    return timeString;
  }

  function formatDate(isoDate: string): string {
    const date = dayjs(isoDate);
    const today = dayjs();
    const yesterday = dayjs().subtract(1, 'day');

    if (date.isSame(today, 'day')) {
      return 'Today';
    } else if (date.isSame(yesterday, 'day')) {
      return 'Yesterday';
    } else {
      return date.format('MMM DD, YYYY');
    }
  }

  useEffect(() => {
    let observer: IntersectionObserver | null = null;

    const observeLoader = () => {
      if (observer) {
        observer.disconnect(); // Clean up old observer.
      }

      observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && !isLoading) {
            setIsLoading(true);
            props.onLoadMore().finally(() => setIsLoading(false));
          }
        },
        {
          root: null, // Observe relative to the viewport.
          rootMargin: '200px', // Trigger 200px before the element is in view (to handle zoom/resize).
          threshold: 0.1, // 10% of the element in view before triggering.
        }
      );

      if (loaderRef.current) {
        observer.observe(loaderRef.current);
      }
    };

    // Initial observer setup.
    observeLoader();

    // Handle resizing (debounced for better performance).
    const handleResize = () => {
      observeLoader(); // Re-observe when resizing or zooming.
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (observer && loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [isLoading, props]);

  const StatusBars = ({ priority, urgency, emotion, sortBy }: Props) => {
    const maxBars = 5;

    const renderBars = (value: number, color: string) => {
      if (sortBy == 'datetime' || value == 0) {
        return '';
      }
      return Array.from({ length: maxBars }, (_, i) => (
        <div
          key={i}
          className={`border-[2px] rounded-[4px] h-[10px] ${
            i < value ? `border-[${color}] bg-[${color}]` : 'border-gray-100'
          }`}
        ></div>
      ));
    };

    let value = 0;
    let color = '#249782';

    if (sortBy === 'Priority') {
      value = Math.round(priority);
      color = '#249782';
      urgency = 0;
      emotion = 0;
    } else if (sortBy === 'Urgency') {
      value = Math.round(urgency);
      color = '#EF4444';
      priority = 0;
      emotion = 0;
    } else if (sortBy === 'Emotion') {
      value = Math.round(emotion);
      color = '#EAB308';
      priority = 0;
      urgency = 0;
    } else {
      value = Math.max(priority, urgency, emotion);
      if (value === urgency) color = '#EF4444';
      else if (value === emotion) color = '#EAB308';
      else color = '#249782';
    }

    return <div className="flex space-x-1">{renderBars(value, color)}</div>;
  };

  return (
    <div>
      <div
        ref={scrollContainerRef}
        className="w-full overflow-y-hidden hover:overflow-y-auto overflow-x-hidden h-[calc(100vh-14.6rem)] border-t-[1px] border-gray-200 scrollforEmail"
      >
        <>
          {sortedEmailByDates?.map((email: any, i: any) => (
            <div key={i}>
              {showDataWithdate?.includes(email?.hide_id) ? (
                <>
                  {email.hasOwnProperty('type') ? (
                    <div
                      className="border-b border-gray-100 sticky top-0 bg-white"
                      key={i}
                      onClick={() => {
                        if (showDataWithdate.includes(email.hide_id)) {
                          setShowDataWithdates(
                            showDataWithdate.filter(
                              (id: any) => id !== email.hide_id
                            )
                          );
                        } else {
                          setShowDataWithdates([
                            ...showDataWithdate,
                            email.hide_id,
                          ]);
                        }
                      }}
                    >
                      <button
                        // onClick={toggleToday}
                        className="w-full flex justify-between items-center text-[14px] text-gray-900 px-4 py-2 text-left"
                      >
                        <span>{formatDate(email?.value)}</span>
                        <span>
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M12.6666 6.0013L8.70707 9.96086C8.31654 10.3514 7.68338 10.3514 7.29285 9.96086L3.33329 6.0013"
                              stroke="#637083"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                      </button>
                    </div>
                  ) : (
                    ''
                  )}
                </>
              ) : (
                <>
                  {email.hasOwnProperty('type') ? (
                    <div
                      className="border-b border-gray-100 sticky top-0 bg-white"
                      key={i}
                      onClick={() => {
                        if (showDataWithdate.includes(email.hide_id)) {
                          setShowDataWithdates(
                            showDataWithdate.filter(
                              (id: any) => id !== email.hide_id
                            )
                          );
                        } else {
                          setShowDataWithdates([
                            ...showDataWithdate,
                            email.hide_id,
                          ]);
                        }
                      }}
                    >
                      <button
                        // onClick={toggleToday}
                        className="w-full flex justify-between items-center text-[14px] text-gray-900 px-4 py-2 text-left"
                      >
                        <span>{formatDate(email?.value)}</span>
                        <span className="">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M3.33337 9.9987L7.29293 6.03914C7.68346 5.64861 8.31662 5.64861 8.70715 6.03914L12.6667 9.9987"
                              stroke="#637083"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                      </button>
                    </div>
                  ) : (
                    <div
                      className="border-b border-gray-100 w-[319px] relative"
                      key={i}
                    >
                      <div
                        className={`px-[12px] py-[16px] flex w-full cursor-pointer ${
                          email?._id == props?.selectedEmail?.email_id
                            ? 'border-r-[3px] border-gray-700'
                            : ''
                        }`}
                        onMouseOver={() =>
                          setShowStar((prev) => ({
                            ...prev,
                            [email._id]: true,
                          }))
                        }
                        onMouseLeave={() =>
                          setShowStar((prev) => ({
                            ...prev,
                            [email._id]: false,
                          }))
                        }
                        onClick={async (e: any) => {
                          // e.preventDefault();
                          props?.setSelectedEmail({
                            conversation_id: email?.email_conversation_id,
                            email_id: email?._id,
                          });
                          if (!email?.is_viewed) {
                            await starOrViewEmail?.mutateAsync({
                              _id: email?._id,
                              is_viewed: true,
                            });
                          }
                        }}
                      >
                        <div className="w-[44px] h-[44px] flex-shrink-0 mt-[6px]">
                          <img
                            src={
                              email?.sender_stakeholder_id
                                ? `/api/app-service/v1/picture/customer_stakeholder_master/${email?.sender_stakeholder_id?.toString()}?org_id=${localStorage?.getItem(
                                    'org_id'
                                  )}&initials=${getInitials(
                                    email?.sender_stakeholder_id?.toString()
                                  )}&ts=${email?.datetime}`
                                : getSvgAsDataUrl(
                                    email?.envelope?.from[0]?.name != '' &&
                                      email?.envelope?.from[0]?.name !==
                                        email?.envelope?.from[0]?.address
                                      ? email?.envelope?.from[0]?.name
                                      : email?.envelope?.from[0]?.address ===
                                        props?.userinfo?.data?.email
                                      ? `${props?.userinfo?.data?.first_name} ${props?.userinfo?.data?.last_name}`
                                      : email?.envelope?.from[0]?.address
                                  ) // Fallback to the encoded SVG
                            }
                            className="w-full h-full rounded-full"
                            alt="Stakeholder Image"
                          />
                        </div>
                        <div className="ml-[10px] w-[238px]  flex-1">
                          <div className="flex items-center justify-between ">
                            <h4
                              className="font-[500] text-[14px] text-gray-900 w-[50%] overflow-hidden text-ellipsis whitespace-nowrap"
                              title={
                                email?.envelope?.from[0]?.name != '' &&
                                email?.envelope?.from[0]?.name !==
                                  email?.envelope?.from[0]?.address
                                  ? email?.envelope?.from[0]?.name
                                  : email?.envelope?.from[0]?.address ===
                                    props?.userinfo?.data?.email
                                  ? `${props?.userinfo?.data?.first_name} ${props?.userinfo?.data?.last_name}`
                                  : email?.envelope?.from[0]?.address
                              }
                            >
                              {email?.envelope?.from[0]?.name != '' &&
                              email?.envelope?.from[0]?.name !==
                                email?.envelope?.from[0]?.address
                                ? email?.envelope?.from[0]?.name
                                : email?.envelope?.from[0]?.address ===
                                  props?.userinfo?.data?.email
                                ? `${props?.userinfo?.data?.first_name} ${props?.userinfo?.data?.last_name}`
                                : email?.envelope?.from[0]?.address}
                            </h4>
                            <span className="w-[16%] flex justify-between">
                              {email?.folder == 'INBOX' && (
                                <StatusBars
                                  priority={
                                    email?.priority ? email?.priority : 0
                                  }
                                  urgency={email?.urgency ? email?.urgency : 0}
                                  emotion={email?.emotion ? email?.emotion : 0}
                                  sortBy={props?.sortBy}
                                />
                              )}
                            </span>
                            {email.is_starred ? (
                              starLoader === email._id &&
                              starOrViewEmail?.isPending ? (
                                <ButtonLoader />
                              ) : (
                                <span
                                  className="w-[10%] ml-[3px]"
                                  onClick={async (e: any) => {
                                    // e.preventDefault();
                                    e.stopPropagation();
                                    setStarLoaderId(email._id);
                                    await starOrViewEmail?.mutateAsync({
                                      _id: email?._id,
                                      is_starred: false,
                                    });
                                  }}
                                >
                                  <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 20 20"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      d="M9.77873 2.08705C9.87253 1.90927 10.1271 1.90927 10.221 2.08705L12.4895 6.38684C12.5257 6.4554 12.5917 6.5033 12.668 6.51652L17.4584 7.34538C17.6565 7.37965 17.7352 7.62181 17.5951 7.76595L14.2068 11.2522C14.1527 11.3078 14.1275 11.3853 14.1386 11.4621L14.8306 16.2741C14.8592 16.4731 14.6532 16.6227 14.4728 16.534L10.1102 14.3889C10.0406 14.3547 9.95909 14.3547 9.88953 14.3889L5.52684 16.534C5.34645 16.6227 5.14046 16.4731 5.16908 16.2741L5.86109 11.4621C5.87213 11.3853 5.84695 11.3078 5.79292 11.2522L2.40461 7.76596C2.26451 7.62181 2.3432 7.37965 2.54127 7.34538L7.33164 6.51652C7.40803 6.5033 7.47396 6.4554 7.51013 6.38684L9.77873 2.08705Z"
                                      fill="#EAB308"
                                      stroke="#EAB308"
                                      strokeWidth="1.5"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                </span>
                              )
                            ) : (
                              ''
                            )}

                            {showStar[email._id] == true &&
                            !email.is_starred ? (
                              <span
                                className="w-[24%]"
                                onClick={async (e: any) => {
                                  // e.preventDefault();
                                  e.stopPropagation();
                                  setStarLoaderId(email._id);
                                  await starOrViewEmail?.mutateAsync({
                                    _id: email?._id,
                                    is_starred: true,
                                  });
                                }}
                              >
                                {starLoader === email._id &&
                                starOrViewEmail?.isPending ? (
                                  <ButtonLoader />
                                ) : (
                                  <Star className="text-[#EAB308] w-[20px] h-[20px] float-end" />
                                )}
                              </span>
                            ) : (
                              <span className="text-[12px] text-right text-gray-400 w-[24%]">
                                {convertDateTimeTotime(email?.envelope?.date)}
                              </span>
                            )}
                          </div>

                          <span
                            className={`block text-[12px] mt-[6px] w-[238px] overflow-hidden text-ellipsis whitespace-nowrap ${
                              !email?.is_viewed
                                ? 'text-[#3B82F6]'
                                : 'text-gray-600'
                            }`}
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
                  )}
                </>
              )}
            </div>
          ))}
          {!props?.singleEmail ? (
            <div className="w-full">
              <div className="mx-auto flex justify-center my-[16px]">
                <div
                  onClick={() => {
                    if (window?.location?.href) {
                      const url = new URL(window.location.href);
                      url.searchParams.delete('email_message_id');
                      url.searchParams.delete('message_id');
                      window.history.replaceState({}, '', url.toString());
                      props.setDummy(Math.random());
                      props?.setStopEmailSettingOnApiCall(false);
                    }
                  }}
                  className="text-center text-[14px] text-[#3B82F6] hover:no-underline cursor-pointer"
                >
                  View all emails
                </div>
              </div>
            </div>
          ) : (
            <div ref={loaderRef} className="text-center py-4">
              {isLoading && (
                <div
                  className="inline-block h-[32px] w-[32px] animate-spin rounded-full border-4 border-solid border-white border-r-[#3B82F6] align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
                  role="status"
                >
                  <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                    Loading...
                  </span>
                </div>
              )}
            </div>
          )}
        </>
      </div>
    </div>
  );
}
export const getSvgAsDataUrl = (name: string | undefined) => {
  const nameArray = name?.trim()?.split(' ');
  const initials = nameArray?.map((word: any) => word[0]?.toUpperCase());
  const initial = initials?.join('');
  const svg = `<svg
                  width="40mm"
                  height="40mm"
                  viewBox="0 0 40 40"
                  version="1.1"
                  id="svg1"
                  xmlns="http://www.w3.org/2000/svg"
                  xmlns:svg="http://www.w3.org/2000/svg">
                    <defs>
                    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%" gradientTransform="rotate(80.64)">
                      <stop offset="0%" style="stopColor:#AF7D4B;stopOpacity:1" />
                      <stop offset="100%" style="stopColor:#B8A07A;stopOpacity:1" />
                    </linearGradient>
                  </defs>
                  <g
                    id="layer1"
                    transform="translate(-35.60495,-4.182745)">
                    <circle
                      style="fill:url(#grad1);fill-opacity:1;stroke:none;"
                      id="circle1"
                      cx="55.60495"
                      cy="24.182745"
                      r="20" />
                    <text
                      xml:space="preserve"
                      style="font-size:16px; font-family:'Inter', sans-serif; font-weight:600; text-anchor:middle; fill:#ffffff;"
                      x="55.60495"
                      y="29.5"
                      id="text1">${initial}</text>
                  </g>
                </svg> `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};
