import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/light.css';
import { Dropdown } from '../../../common/Dropdown';
import dayjs from 'dayjs';
import { ChevronUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import Flatpickr from 'react-flatpickr';
import { useQuery } from '@tanstack/react-query';
import { getOpportunityStatusConfig } from '../../api/insights/insights';
import { TreeIcon } from '../../assests/icons/icons';

interface props {
  insightDetails: any;
  handleOnChangeInput: any;
  handleOnclick: any;
  setIgnoredMessages: any;
  isOpportunityInsight: boolean;
  selectedActionStatus: string;
  setSelectedActionStatus: any;
  setCreateTaskModalOpen: any;
  setShowSideChatbox: any;
  setIsGuidaceSectionOpen: any;
  showSideChatbox: boolean;
  setIsCollapsed?: any;
  // isSideBarView?: boolean;
  isCollapsed?: any;
  isGuidaceSectionOpen?: any;
}

function capitalizeFirstLetter(name: string): string {
  if (!name) return '';
  return name
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export default function ActionTaken({
  insightDetails,
  handleOnChangeInput,
  handleOnclick,
  setIgnoredMessages,
  isOpportunityInsight,
  selectedActionStatus,
  setSelectedActionStatus,
  setCreateTaskModalOpen,
  isCollapsed,
  isGuidaceSectionOpen,
  setIsGuidaceSectionOpen,
  setIsCollapsed,
  setShowSideChatbox,
  showSideChatbox,
}: // isSideBarView = false,
props) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [inputValue, setInputValue] = useState(
    insightDetails?.insight_instance?.action_notes !== undefined
      ? insightDetails?.insight_instance?.action_notes
      : ''
  );
  const { data: opportunityStatusesFromConfig } = useQuery({
    queryKey: ['getOpportunityStatusConfig'],
    queryFn: () => getOpportunityStatusConfig(),
    refetchOnWindowFocus: false,
  });

  const [opportunityStatuses, setOpportunityStatuses] = useState<any[]>([]);
  // let staticStatuses:any;
  // Keep track of original statuses from config
  const [originalStatuses, setOriginalStatuses] = useState<any[]>([]);

  useEffect(() => {
    if (insightDetails?.insight_instance?._id && setSelectedActionStatus) {
      setSelectedActionStatus('');
    }
    return () => {
      // Reset status when component unmounts
      if (insightDetails?.insight_instance?._id && setSelectedActionStatus) {
        setSelectedActionStatus('');
      }
    };
  }, [insightDetails?.insight_instance?._id]);

  // Initialize statuses from config
  useEffect(() => {
    const rawStatuses = opportunityStatusesFromConfig?.data?.value;
    if (rawStatuses) {
      const flattened: any[] = [];
      Object.entries(rawStatuses as Record<string, string[]>).forEach(
        ([key, values]) => {
          values.forEach((subStatus: string) => {
            flattened.push({
              label: subStatus,
              value: subStatus,
              statusGroup: key,
            });
          });
        }
      );
      setOriginalStatuses(flattened);
      setOpportunityStatuses(flattened);
    }
  }, [opportunityStatusesFromConfig]);

  useEffect(() => {
    insightDetails?.insight_instance?.action_notes
      ? setInputValue(insightDetails?.insight_instance?.action_notes)
      : setInputValue('');

    return () => {
      setInputValue('');
    };
  }, [insightDetails?.insight_instance]);

  // Filter available statuses based on current status
  useEffect(() => {
    const instance = insightDetails?.insight_instance;
    const currentStatus = instance?.action_sub_status?.toLowerCase();
    const currentGroup = instance?.action_status?.toLowerCase();

    if (!currentStatus || !originalStatuses.length) return;

    // Get all statuses except the current one
    const filteredStatuses = originalStatuses.filter((item) => {
      const itemValue = item.value.toLowerCase();
      const itemGroup = item.statusGroup.toLowerCase();

      // Don't show the current status in the dropdown
      if (itemValue === currentStatus && itemGroup === currentGroup) {
        return false;
      }

      // Keep all other statuses
      return true;
    });

    setOpportunityStatuses(filteredStatuses);
  }, [insightDetails, originalStatuses]);
  return (
    <>
      <div className="flex border px-[16px] py-[8px] rounded-[8px] border-[#637083] flex-col  gap-1 align-bottom h-[132px] overflow-hidden">
        <div className=" overflow-hidden ">
          <label
            htmlFor="textArea"
            className="inline-block  text-gray-800 text-sm font-medium"
          >
            Actions taken
          </label>
          <textarea
            className="form-input scroll overflow-auto rounded-none px-0 text-gray-800 text-sm border-none dark:border-zink-500 focus:outline-none focus:border-custom-500 disabled:bg-slate-100 dark:disabled:bg-zink-600 disabled:border-slate-300 dark:disabled:border-zink-500 dark:disabled:text-zink-200 disabled:text-slate-500 dark:text-zink-100 dark:bg-zink-700 dark:focus:border-custom-800 placeholder:text-slate-400 dark:placeholder:text-zink-200"
            id="textArea"
            placeholder="Write response here"
            rows={4}
            value={inputValue}
            onChange={(e) => {
              handleOnChangeInput(
                e.target.value,
                insightDetails?.insight_instance?._id
              );
              setInputValue(e.target.value);
            }}
            style={{ height: '100px', overflowY: 'scroll' }}
            ref={(ref) => {
              if (ref) {
                ref.scrollTop = ref.scrollHeight;
              }
            }}
          ></textarea>
        </div>
      </div>
      <div className="pb-[2px] flex justify-between pt-[16px] items-center">
        <div className="flex gap-[16px]">
          <div className="flex">
            {!isOpportunityInsight && (
              <button
                className={
                  `text-white text-nowrap font-medium px-4 py-2 btn
                bg-[#3B82F6] border-[#3B82F6] hover:text-white !w-[160px] truncate`
                  // : 'bg-white px-2 py-0.5 text-slate-500 btn border-slate-500 hover:text-white hover:bg-custom-600 hover:border-custom-600 focus:text-white focus:bg-custom-600 focus:border-custom-600 focus:ring-custom-100 active:text-white active:bg-custom-600 active:border-custom-600  active:ring-custom-100 dark:ring-custom-400/20'
                }
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isOpportunityInsight) {
                    handleOnclick(
                      'completed',
                      insightDetails?.insight_instance?._id,
                      undefined,
                      'Completed'
                    ),
                      setIgnoredMessages({
                        message: insightDetails?.insight_instance?.title
                          ? insightDetails?.insight_instance?.title +
                            ' marked as resolved'
                          : insightDetails?.insight_instance
                              ?.metric_display_str + ' marked as resolved',
                        customerName:
                          insightDetails?.insight_instance?.customer_name,
                        action_status: 'Completed',
                      });
                  }
                }}
              >
                {isOpportunityInsight
                  ? capitalizeFirstLetter(
                      selectedActionStatus ||
                        insightDetails?.insight_instance?.action_sub_status ||
                        insightDetails?.insight_instance?.action_status
                    )
                  : 'Mark as resolved'}
              </button>
            )}
            {isOpportunityInsight && (
              <div className="rounded-[6px] bg-[#3B82F6] h-[40px] items-center flex max-w-[200px] border-box">
                <Dropdown className="inline-flex !max-w-[200px]">
                  <Dropdown.Trigger
                    type="button"
                    className="text-center flex justify-between items-center bg-transparent text-gray-900"
                    id="dropdownMenuButton"
                    data-bs-toggle="dropdown"
                  >
                    <span
                      className="text-white text-nowrap font-medium text-[14px] !max-w-[170px] pl-3 text-left truncate"
                      onClick={() => {
                        setIsConfirmOpen(true);
                      }}
                    >
                      {capitalizeFirstLetter(
                        selectedActionStatus ||
                          insightDetails?.insight_instance?.action_sub_status ||
                          insightDetails?.insight_instance?.action_status
                      )}
                    </span>
                    <div
                      className="h-9 !w-[40px] flex items-center justify-center cursor-pointer"
                      onClick={() => {
                        setIsConfirmOpen(true);
                      }}
                    >
                      <ChevronUp className="w-5 h-5 rotate-180 text-white" />
                    </div>
                  </Dropdown.Trigger>
                  {isConfirmOpen && (
                    <Dropdown.Content
                      placement="bottom-middle"
                      className={
                        'absolute border border-[#CED2DA] shadow-md z-100 p-4 ltr:text-left rtl:text-right bg-white rounded-md dropdown-menu w-fit dark:bg-zink-600 truncate bottom-1'
                      }
                      aria-labelledby="dropdownMenuButton"
                    >
                      <ul
                        className="text-sm text-gray-700 dark:text-gray-200 dropdownClick space-y-2 max-h-[500px] overflow-y-auto scroll"
                        aria-labelledby="dropdownMenuIconButton"
                      >
                        {opportunityStatuses.map((item, i) => (
                          <li key={i}>
                            <div className="flex items-center rounded dark:hover:bg-gray-600">
                              <label
                                htmlFor={`checkbox-item-${i}`}
                                className="w-full text-[16px] text-[#344051] dark:text-gray-300 close-dropdown cursor-pointer text-nowrap truncate"
                                onClick={() => {
                                  handleOnclick(
                                    item?.value,
                                    insightDetails?.insight_instance?._id,
                                    undefined,
                                    item?.statusGroup
                                  ),
                                    setIsConfirmOpen(!isConfirmOpen);
                                  setSelectedActionStatus(item?.value);
                                  setIgnoredMessages({
                                    message: insightDetails?.insight_instance
                                      ?.title
                                      ? insightDetails?.insight_instance
                                          ?.title +
                                        ` insight has been marked as ${item.label.toLocaleLowerCase()}`
                                      : insightDetails?.insight_instance
                                          ?.metric_display_str +
                                        ` insight has been marked as ${item.label.toLocaleLowerCase()}`,
                                    customerName:
                                      insightDetails?.insight_instance
                                        ?.customer_name,
                                    action_status: item?.statusGroup,
                                  });
                                }}
                              >
                                {item?.label}
                              </label>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </Dropdown.Content>
                  )}
                </Dropdown>
              </div>
            )}
          </div>
          <div className="h-[40px] border-[#637083] border flex items-center rounded-[6px] overflow-hidden shadow-none w-[110px] border-box">
            <div>
              <Tippy
                content={
                  <span className=" text-[12px] text-[#344051] font-semibold">{`Ignore "${
                    insightDetails?.insight_instance?.title
                      ? insightDetails?.insight_instance?.title
                      : insightDetails?.insight_instance?.metric_display_str
                  }
                " of ${
                  insightDetails?.insight_instance?.customer_name
                } for a month`}</span>
                }
                className="p-1 !shadow-lg w-[211px] rounded-[8px] bg-white"
                theme="light rounded-full shadow-none"
                placement="top-start"
                arrow={true}
                offset={[-70, 10]}
                // followCursor={true}
                interactive={false}
                animation="scale"
                duration={0}
              >
                <span
                  className={
                    // selectedAnswer === answer
                    //   ? 'text-white px-2 py-0.5 btn bg-custom-500 border-custom-500 hover:text-white hover:bg-custom-600 hover:border-custom-600 focus:text-white focus:bg-custom-600 focus:border-custom-600 focus:ring-custom-100 active:text-white active:bg-custom-600 active:border-custom-600  active:ring-custom-100 dark:ring-custom-400/20'
                    'bg-white font-medium h-full flex items-center text-[#141C24] text-[14px] px-[12px] py-[9.5px] border-[#637083] !border-r text-nowrap cursor-pointer'
                  }
                  onClick={(e) => {
                    e.stopPropagation();
                    setIgnoredMessages({
                      message: insightDetails?.insight_instance?.title
                        ? insightDetails?.insight_instance?.title +
                          ' insight have ignored for 30 days'
                        : insightDetails?.insight_instance?.metric_display_str +
                          ' insight have ignored for 30 days',
                      customerName:
                        insightDetails?.insight_instance?.customer_name,
                      action_status: 'Ignored',
                    });
                    handleOnclick(
                      'ignored',
                      insightDetails?.insight_instance?._id,
                      dayjs().add(30, 'day'),
                      'Ignored'
                    );
                  }}
                >
                  Ignore
                </span>
              </Tippy>
            </div>
            <div className="h-[40px] items-center flex w-full">
              <Dropdown className="inline-flex !w-full ">
                <Dropdown.Trigger
                  type="button"
                  className="text-center flex justify-center items-center  bg-white text-gray-900 "
                  id="dropdownMenuButton"
                  data-bs-toggle="dropdown"
                >
                  <div
                    className="relative h-9 !w-[40px] flex items-center justify-center cursor-pointer"
                    onClick={() => {
                      setIsDropdownOpen(true);
                    }}
                  >
                    <ChevronUp className="w-5 h-5 rotate-180" />
                  </div>
                </Dropdown.Trigger>
                {isDropdownOpen && (
                  <Dropdown.Content
                    placement="top-middle"
                    className={
                      'absolute border border-[#CED2DA] shadow-md z-50 p-4 bottom-1 ltr:text-left rtl:text-right bg-white rounded-md dropdown-menu w-[138px] dark:bg-zink-600'
                    }
                    aria-labelledby="dropdownMenuButton"
                  >
                    <ul
                      className="text-sm text-gray-700 dark:text-gray-200 dropdownClick space-y-2"
                      aria-labelledby="dropdownMenuIconButton"
                    >
                      {[
                        { label: 'For a week', value: 7 },
                        { label: 'For a month', value: 30 },
                        { label: 'For a quarter', value: 90 },
                        { label: 'For a year', value: 365 },
                      ].map((item, i) => (
                        <li key={i}>
                          <div className="flex items-center rounded dark:hover:bg-gray-600">
                            <label
                              htmlFor={`checkbox-item-${i}`}
                              className="w-full text-[16px] text-[#344051] rounded dark:text-gray-300 close-dropdown cursor-pointer"
                              onClick={() => {
                                handleOnclick(
                                  'ignored',
                                  insightDetails?.insight_instance?._id,
                                  dayjs().add(item.value, 'day')
                                ),
                                  setIsDropdownOpen(!isDropdownOpen),
                                  setIgnoredMessages({
                                    message: insightDetails?.insight_instance
                                      ?.title
                                      ? insightDetails?.insight_instance
                                          ?.title +
                                        ` insight have ignored ${item.label.toLocaleLowerCase()}`
                                      : insightDetails?.insight_instance
                                          ?.metric_display_str +
                                        ` insight have ignored ${item.label.toLocaleLowerCase()}`,
                                    customerName:
                                      insightDetails?.insight_instance
                                        ?.customer_name,
                                    action_status: 'Ignored',
                                  });
                              }}
                            >
                              {item.label}
                            </label>
                          </div>
                        </li>
                      ))}
                      <li>
                        <div className="flex items-center dark:hover:bg-gray-600 pt-1 overflow-hidden">
                          <span className=" cursor-pointer">
                            <Flatpickr
                              options={{
                                minDate: 'today',
                                dateFormat: 'Y-m-d',
                              }}
                              onChange={(e: any) => {
                                handleOnclick(
                                  'ignored',
                                  insightDetails?.insight_instance?._id,
                                  e[0].toISOString()
                                ),
                                  setIsDropdownOpen(!isDropdownOpen),
                                  setIgnoredMessages({
                                    message: insightDetails?.insight_instance
                                      ?.title
                                      ? insightDetails?.insight_instance
                                          ?.title +
                                        ` insight have ignored until ${dayjs(
                                          e[0]
                                        ).format('MMM DD, YYYY')}.`
                                      : insightDetails?.insight_instance
                                          ?.metric_display_str +
                                        ` insight have ignored until ${dayjs(
                                          e[0]
                                        ).format('MMM DD, YYYY')}.`,
                                    customerName:
                                      insightDetails?.insight_instance
                                        ?.customer_name,
                                    action_status: 'Ignored',
                                  });
                              }}
                              placeholder="Pick a date"
                              className="z-[1000] text-[#141C24] placeholder:text-[16px] placeholder:text-[#344051] placeholder:font-normal dark:border-zink-500 focus:outline-none focus:border-custom-500 disabled:bg-slate-100 dark:disabled:bg-zink-600 disabled:border-slate-300 dark:disabled:border-zink-500 dark:disabled:text-zink-200 disabled:text-slate-500 dark:text-zink-100 dark:bg-zink-700 dark:focus:border-custom-800 dark:placeholder:text-zink-200"
                            />
                          </span>
                        </div>
                      </li>
                    </ul>
                  </Dropdown.Content>
                )}
              </Dropdown>
            </div>
          </div>
          {!isGuidaceSectionOpen && insightDetails?.guidance && (
            <div
              className="border h-[40px] width-[120px] py-[10px] px-[12px] flex gap-3 justify-between items-center border-[#637083] rounded-md cursor-pointer border-box"
              onClick={() => {
                if (
                  setShowSideChatbox &&
                  typeof setShowSideChatbox === 'function'
                ) {
                  setShowSideChatbox(false);
                }
                setIsGuidaceSectionOpen(true), setIsCollapsed(false);
              }}
            >
              <TreeIcon className="text-[#3B82F6] h-[20px] w-[20px]" />

              <div className="text-[14px] font-medium leading-5 text-[#141C24]">
                Guidance
              </div>
            </div>
          )}
          {!isGuidaceSectionOpen && !showSideChatbox && (
            <div
              className={
                'h-[40px] border-[1px] border-[#637083] rounded-[6px] px-[12px] py-[10px] cursor-pointer items-center flex'
              }
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setCreateTaskModalOpen((prev: any) => !prev);
              }}
            >
              <span className="text-[14px] text-[#141C24] font-[500]">
                Create task
              </span>
            </div>
          )}
        </div>
        <div className="text-xs text-gray-500 text-right">
          Last updated <br />
          {isCollapsed && isGuidaceSectionOpen
            ? dayjs(insightDetails?.insight_instance?.updated_at).format(
                'MMM DD, YYYY'
              )
            : dayjs(insightDetails?.insight_instance?.updated_at).format(
                'MMM DD, YYYY, HH:mm '
              )}
        </div>
      </div>
    </>
  );
}
