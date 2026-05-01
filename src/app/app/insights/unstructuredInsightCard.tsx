import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import {
  CrossIcon,
  GreenCheckIcon,
  OpportunitiesCreatedBySvgIcon,
} from '../../assests/icons/icons';
import { useState, useEffect, useRef, ChangeEvent, use } from 'react';
import { Check, X } from 'lucide-react';
import Flatpickr from 'react-flatpickr';
import { useRemoveOpportunity } from '../../../services/mutations/insightMutations';
import DeleteModal from '../../../common/components/DeleteModal';
import { toast } from 'react-toastify';
import { getCurrencySymbol } from '../../api/config/insight';
import { formatRevenue } from '../../../common/SupportFunctions';
import { useQuery } from '@tanstack/react-query';
import AssignTo from '../../../common/components/AssignTo';

import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/light.css';
import { getTimeAgo } from '../../../common/SupportFunctions';


export default function UnstructuredInsightCard({
  insight,
  selectedInsightCardId,
  handleCardSelection,
  type,
  isDetail,
  customer360,
  isOnInsightDetailPage,
  handleOnclickWithOutDebounce,
  isGuidaceSectionOpen,
  setCustomerAttributesModal,
  products,
}: any) {
  dayjs.extend(relativeTime);
  

  const [title, setTitle] = useState('');
  const [editTitle, setEditTitle] = useState(false);
  const [titleError, setTitleError] = useState('');
  const [showEditTitleButton, setShowEditTitleButton] = useState(false);
  const [isEditOpportunityValue, setIsEditOpportunityValue] = useState(false);
  const [targetClosureDate, setTargetClosureDate] = useState<any>('');
  const [opportunityValueString, setOpportunityValueString] =
    useState<any>('NA');
  const [opportunityValue, setOpportunityValue] = useState<any>(0);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [assignToId, setAssignToId] = useState<any>('');
  const [editAssignTo, setEditAssignTo] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const removeOpportunity = useRemoveOpportunity();

  const { data: currencySymbol } = useQuery({
    queryKey: ['getCurrencySymbol'],
    queryFn: () => getCurrencySymbol(),
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    setTitle(insight?.title || insight?.insight_name || '');
  }, [insight.title, insight.insight_name]);

  useEffect(() => {
    if (editTitle && textAreaRef.current) {
      const textarea = textAreaRef.current;
      textarea.focus();

      // Move cursor to the end
      const length = textarea.value.length;
      textarea.setSelectionRange(length, length);
    }
    if (textAreaRef.current) {
      textAreaRef.current.style.height = 'auto';
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    }
  }, [editTitle]);
  useEffect(() => {
    if (insight?.insight_type?.toLowerCase() === 'opportunity') {
      setTargetClosureDate(insight?.target_closure_date);
      setOpportunityValue(insight?.opportunity_value || 0);
      setOpportunityValueString(
        typeof insight?.opportunity_value === 'number'
          ? formatRevenue(insight?.opportunity_value)
          : 'NA'
      );
      setAssignToId(insight?.assignee_id?._id);
    }
  }, [insight]);

  const handleTitleUpdate = (newTitle: string) => {
    const trimmedTitle = newTitle.trim();
    if (insight?.title === newTitle) {
      setEditTitle(false);
      setShowEditTitleButton(false);
      return;
    }
    if (!trimmedTitle) {
      setTitleError('Title cannot be empty');
      setShowEditTitleButton(false);
      return;
    }
    setTitle(trimmedTitle);
    insight.title = trimmedTitle;
    handleOnclickWithOutDebounce(
      insight?._id,
      undefined,
      undefined,
      undefined,
      trimmedTitle
    );
    setEditTitle(false);
    setTitleError('');
    setShowEditTitleButton(false);
  };
  const handleDateChange = (selectedDates: Date[]) => {
    handleOnclickWithOutDebounce(insight?._id, selectedDates[0]);
    setIsDatePickerOpen(false);
  };
  const handleIconClick = () => {
    const input: any = document.querySelector('.flatpickr-input');
    if (input) {
      input?.focus();
    }
  };
  const handleDelete = async () => {
    try {
      const response = await removeOpportunity.mutateAsync(insight?._id);

      if (response.status === 200 || response.status === 201) {
        toast.success('Opportunity deleted successfully!');
      } else {
        toast.error('Failed to delete!');
      }
      setDeleteModal(false);
    } catch (err: any) {
      toast.error(
        `Error while deleting opportunity: ${err?.response?.data?.message || err.message
        }`
      );
      setDeleteModal(false);
    }
  };
  const deleteToggle = () => {
    setDeleteModal(() => !deleteModal);
  };

  const handleOnChangeAssignTo = (assignee_id: string | null) => {
    if (assignee_id) {
      // Example: clear assignment on backend / UI
      handleOnclickWithOutDebounce(
        insight?._id,
        undefined,
        undefined,
        undefined,
        undefined,
        assignee_id // or undefined depending on your API
      );
      setAssignToId(null); // ensure UI state cleared
      setEditAssignTo(false);
      return;
    }
  };
  useEffect(() => {
    if (!editAssignTo) return;

    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as Node | null;
      if (containerRef.current && !containerRef.current.contains(target)) {
        setEditAssignTo(false);
        setAssignToId(insight?.assignee_id?._id);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setEditAssignTo(false);
        setAssignToId(insight?.assignee_id?._id);
      }
    };

    // pointerdown handles mouse, pen, touch
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [editAssignTo]);

  return (
    <div>
      <div
        className={
          selectedInsightCardId === insight?._id
            ? ' card !mb-0  shadow-none !border border-[#CED2DA] rounded-[12px] bg-white dark:bg-slate-400/20 dark:border-slate-600 !pt-[8px]'
            : `${
                type !== 'insigthDetails' && isDetail
                  ? ' cursor-pointer card  !mb-0  shadow-none dark:bg-slate-400/20 dark:border-slate-600 !pt-[4px]'
                  : type !== 'insigthDetails' && !isDetail
                  ? ' cursor-pointer card  !mb-0  shadow-none dark:bg-slate-400/20 dark:border-slate-600 !border border-[#E4E7EC] rounded-[12px] bg-[#F2F4F7] !pt-[8px]'
                  : ''
              } `
        }
        onClick={() => {
          if (type !== 'insigthDetails') {
            handleCardSelection(insight?._id);
          }
        }}
      >
        {isDetail ? (
          type !== 'insigthDetails' && !insight?.is_viewed ? (
            <span className="flex rounded-full h-2 w-2 bg-[#0EA5E9] relative top-[12px] right-3"></span>
          ) : type !== 'insigthDetails' &&
            insight?.action_status === 'completed' ? (
            <span className="flex relative w-[20px] top-[14px] right-3.5">
              <GreenCheckIcon className="h- w-3 text-[#249782] font-bold" />
            </span>
          ) : type !== 'insigthDetails' &&
            insight.action_status === 'ignored' ? (
            <span className="flex  relative w-[20px] top-[14px] right-3.5">
              <CrossIcon className="h-2.5 w-3 text-[#E11D48] font-bold" />
            </span>
          ) : null
        ) : type !== 'insigthDetails' && !insight?.is_viewed ? (
          <span className="flex rounded-full h-2 w-2 bg-[#0EA5E9] relative top-[12px] left-4"></span>
        ) : type !== 'insigthDetails' &&
          insight?.action_status === 'completed' ? (
          <span className="flex relative w-[20px] top-[14px] left-4">
            <GreenCheckIcon className="h- w-3 text-[#249782] font-bold" />
          </span>
        ) : type !== 'insigthDetails' && insight.action_status === 'ignored' ? (
          <span className="flex  relative w-[20px] top-[14px] left-4">
            <CrossIcon className="h-2.5 w-3 text-[#E11D48] font-bold" />
          </span>
        ) : null}

        {/* Card Body */}
        <div
          className={`card-body ${
            !insight?.is_viewed ? 'pt-[0px] !pb-[12px]' : ''
          }  ${
            customer360
              ? '!pl-[0px] !pr-[0px] !pt-[0px] !pb-[12px]'
              : type == 'insigthDetails' || isDetail
              ? '!pl-[0px] !pr-[0px] !pt-[12px] !pb-[12px]'
              : '!pl-[32px] !pr-[12px] !pt-[0px] !pb-[12px]'
          } `}
        >
          <div className="dark:text-slate-200 flex items-center justify-between">
            <div className="text-[12px] text-[#202B37] font-normal flex items-center text-start gap-2">
              {insight?.customer_name}
            </div>
            <div className="text-[12px] text-[#637083] font-normal flex items-center gap-2">
              <div className="text-[12px] font-normal text-[#637083] pr-2">
                Created {getTimeAgo(insight?.created_at)}
              </div>
              <div ref={containerRef}>
                <Tippy
                  content={
                    <div className="flex flex-col w-fit py-1">
                      <span className="text-[12px] font-normal text-[#FFFFFF] whitespace-nowrap">
                        Created by{' '}
                        {insight?.created_by && insight?.created_by?._id
                          ? `${
                              insight?.created_by?.first_name +
                              ' ' +
                              insight?.created_by?.last_name
                            }`
                          : 'AI Agent'}
                      </span>
                      <span className="text-[12px] font-normal text-[#FFFFFF] whitespace-nowrap">
                        on{' '}
                        {insight?.created_at &&
                        dayjs(insight?.created_at).isValid()
                          ? dayjs(insight?.created_at).format('MMM D, YYYY')
                          : ''}
                      </span>
                    </div>
                  }
                  placement="top"
                  maxWidth={600}
                  arrow={true}
                  offset={[0, 8]}
                  interactive={false}
                  animation="scale"
                  duration={200}
                  theme="dark"
                  className="h-fit !rounded-[10px] flex justify-center items-center px-1"
                >
                  {isOnInsightDetailPage &&
                    (editAssignTo || !insight?.assignee_id ? (
                      <div className="w-[110px] border-l border-[#E4E7EC] pl-3">
                        <AssignTo
                          value={assignToId}
                          setValue={setAssignToId}
                          placeholder="Assign to"
                          disabled={false}
                          border="border-0"
                          dropdown="top-5 min-w-[170px]"
                          userIcon="text-[#637083] h-3 w-3"
                          text="w-full text-[12px] font-[400] placeholder:text-[12px] placeholder:text-[#637083]"
                          onChange={handleOnChangeAssignTo}
                        />
                      </div>
                    ) : (
                      <div
                        className="flex items-center justify-center gap-1 text-[12px] font-normal text-[#202B37] leading-4 pl-3 border-l border-[#E4E7EC] cursor-pointer"
                        onClick={() => setEditAssignTo(!editAssignTo)}
                      >
                        <OpportunitiesCreatedBySvgIcon />{' '}
                        {insight?.assignee_id?.first_name +
                          ' ' +
                          insight?.assignee_id?.last_name}
                      </div>
                    ))}
                </Tippy>
              </div>

              {isOnInsightDetailPage && setCustomerAttributesModal && (
                <div
                  className="text-[12px] font-normal text-[#202B37] leading-4 pl-3 border-l border-[#E4E7EC] cursor-pointer"
                  onClick={() => setCustomerAttributesModal(true)}
                >
                  Attributes
                </div>
              )}
              {isOnInsightDetailPage && (
                <div
                  className="text-[12px] font-normal text-[#EF4444] pl-3 border-l border-[#E4E7EC] cursor-pointer"
                  onClick={() => setDeleteModal(true)}
                >
                  Delete
                </div>
              )}
            </div>
          </div>

          {/* Title / Textarea Block */}
          <div
            className="text-black text-[14px] flex justify-between items-start group"
            onMouseEnter={() => setShowEditTitleButton(true)}
            onMouseLeave={() => setShowEditTitleButton(false)}
          >
            {isOnInsightDetailPage && editTitle ? (
              <div className="w-full">
                <textarea
                  ref={textAreaRef}
                  className="border border-1 rounded-md text-[14px] py-2 px-3 w-full outline-none border-gray-200 flex-grow resize-none hide-scrollbar"
                  value={title}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                    setTitle(e.target.value)
                  }
                  onBlur={() => handleTitleUpdate(title)}
                  onMouseLeave={() => handleTitleUpdate(title)}
                  // rows={1}
                  style={{ whiteSpace: 'pre-wrap' }}
                />
                {titleError && (
                  <p className="text-red-400 text-sm">{titleError}</p>
                )}
              </div>
            ) : (
              <span
                className={`py-2 w-[96%] break-words cursor-pointer`}
                style={{ whiteSpace: 'pre-wrap' }}
                onClick={() => setEditTitle(true)}
              >
                {title || '+ Add Title here...'}
              </span>
            )}

            {isOnInsightDetailPage && !editTitle && showEditTitleButton && (
              <span
                className="text-gray-800 text-xs cursor-pointer ml-2 mt-2"
                onClick={() => setEditTitle(true)}
              >
                {/* <Edit3 className="inline h-4 w-4 text-black" /> */}
                Edit
              </span>
            )}
          </div>
          {!isOnInsightDetailPage &&
            ((opportunityValueString && opportunityValueString !== 'NA') ||
              targetClosureDate ||
              insight?.action_sub_status) && (
              <div className="flex justify-start items-center gap-2 mb-2 text-[#97A1AF] text-[12px] font-normal">
                {opportunityValueString && opportunityValueString !== 'NA' && (
                  <span>
                    {currencySymbol?.data?.value || ''} {opportunityValueString}
                  </span>
                )}

                {targetClosureDate && dayjs(targetClosureDate).isValid() && (
                  <span
                    className={`${
                      opportunityValueString && opportunityValueString !== 'NA'
                        ? "pl-2 relative before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-3 before:w-px before:bg-[#97A1AF]"
                        : ''
                    } text-center`}
                  >
                    {dayjs(targetClosureDate).format('MMM DD, YYYY')}
                  </span>
                )}
                {insight?.action_sub_status && (
                  <span
                    className={`${
                      targetClosureDate ||
                      (opportunityValueString &&
                        opportunityValueString !== 'NA')
                        ? "pl-2 relative before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-3 before:w-px before:bg-[#97A1AF]"
                        : ''
                    } text-center max-w-[150px] truncate `}
                  >
                    {insight.action_sub_status}
                  </span>
                )}
              </div>
            )}

          <div
            className={`flex w-[100%] justify-start items-center ${
              isOnInsightDetailPage ? 'h-[40px]' : ''
            } gap-12px`}
          >
            <span
              className={
                insight?.status == 'green'
                  ? 'px-2.5 py-0.5 text-xs inline-block font-normal rounded-[4px] bg-white border border-green-200 text-green-text dark:bg-green-500/20 dark:border-green-500/20'
                  : insight?.status == 'yellow'
                  ? 'px-2.5 py-0.5 inline-block text-xs font-normal rounded-[4px] bg-white border border-[#EAB308] text-orange-text dark:bg-yellow-500/20 dark:border-transparent'
                  : 'px-2.5 py-0.5 text-xs font-normal inline-block rounded-[4px] bg-white border transition-all duration-200 ease-linear !border-[#FCCFCF]  border-transparent text-red-text'
              }
            >
              {insight?.insight_type}
            </span>
            {isOnInsightDetailPage &&
              Array.isArray(products) &&
              products.length > 0 && (
                <span
                  className={
                    insight?.status == 'green'
                      ? `px-2.5 py-0.5 text-xs inline-block font-normal rounded-[4px] bg-white border border-green-200 text-green-text dark:bg-green-500/20 dark:border-green-500/20 max-w-[150px]
 truncate hide-scrollbar ${isGuidaceSectionOpen ? 'ml-1' : 'ml-[16px]'}`
                      : insight?.status == 'yellow'
                      ? `px-2.5 py-0.5 inline-block text-xs font-normal rounded-[4px] bg-white border border-[#EAB308] text-orange-text dark:bg-yellow-500/20 dark:border-transparent max-w-[150px]
 truncate hide-scrollbar ${isGuidaceSectionOpen ? 'ml-1' : 'ml-[16px]'}`
                      : `px-2.5 py-0.5 text-xs font-normal inline-block rounded-[4px] bg-white border transition-all duration-200 ease-linear !border-[#FCCFCF]  border-transparent text-red-text max-w-[150px]
 truncate hide-scrollbar ${isGuidaceSectionOpen ? 'ml-1' : 'ml-[16px]'}`
                  }
                >
                  {products?.length > 1
                    ? `${products[0]} +${products.length - 1} more`
                    : products[0]}
                </span>
              )}
            {isOnInsightDetailPage &&
              insight &&
              (insight?.insight_type).toLowerCase() === 'opportunity' && (
                <div className="flex justify-start items-center">
                  <div
                    className={`flex items-center justify-center ${
                      isGuidaceSectionOpen ? 'ml-1' : 'ml-[16px]'
                    } border-l-[1px] border-l-[#E4E7EC] pl-[16px] h-[20px]`}
                  >
                    {!isEditOpportunityValue && (
                      <div className="">
                        <Tippy
                          content={
                            <div className="text-[12px] font-semibold leading-4 text-[#202B37]">
                              Click to edit opportunity value
                            </div>
                          }
                          interactive={true}
                          placement="top"
                          theme="transparent"
                          key="TrackStatus"
                        >
                          <div
                            className="relative group text-[14px] max-w-[215px] font-normal text-[#344051] leading-[20px] text-nowrap cursor-pointer truncate"
                            onClick={() => setIsEditOpportunityValue(true)}
                            // title="Click to edit opportunity value"
                          >
                            Value: {currencySymbol?.data?.value || ''}{' '}
                            {opportunityValueString || 0}
                          </div>
                        </Tippy>
                      </div>
                    )}
                    {isEditOpportunityValue && (
                      <div
                        className={`flex items-center justify-center ${
                          isGuidaceSectionOpen
                            ? 'w-[150px] h-[30px]'
                            : ' w-[193px] h-[40px]'
                        }`}
                      >
                        <input
                          className={`${
                            isGuidaceSectionOpen
                              ? 'max-w-[90px] h-[30px]'
                              : 'max-w-[113px] h-[40px]'
                          } pl-[12px] pr-[8px] py-[8px] text-[16px] font-normal leading-[24px] text-[#141C24] no-spinner outline-none overflow-ellipsis border-[1px] border-[#CED2DA] bg-[#FFFFFF] rounded-l-[8px]`}
                          placeholder=""
                          autoComplete="off"
                          value={opportunityValue}
                          onChange={(e) => setOpportunityValue(e.target.value)}
                          type="number"
                          inputMode="numeric"
                        />
                        <span
                          className={`${
                            isGuidaceSectionOpen
                              ? 'h-[30px] w-[30px]'
                              : ' h-[40px] w-[40px]'
                          } border-t-[1px] border-b-[1px] border-t-[#CED2DA] border-b-[#CED2DA] flex justify-center items-center cursor-pointer`}
                          onClick={() => {
                            const value = Number(opportunityValue);
                            handleOnclickWithOutDebounce(
                              insight?._id,
                              undefined,
                              value
                            );
                            setIsEditOpportunityValue(false);
                            setOpportunityValueString(
                              formatRevenue(value)
                            );
                          }}
                        >
                          <Check />
                        </span>
                        <span
                          className={`${
                            isGuidaceSectionOpen
                              ? 'h-[30px] w-[30px]'
                              : ' h-[40px] w-[40px]'
                          } border-[1px] border-[#CED2DA] rounded-r-[8px] flex justify-center items-center cursor-pointer`}
                          onClick={() => {
                            setIsEditOpportunityValue(false);
                            setOpportunityValue(insight?.opportunity_value);
                          }}
                        >
                          <X />
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center text-nowrap bg-white shink max-w-[232px] ml-[16px] pl-[16px] border-l-[1px] border-l-[#E4E7EC] h-[20px]">
                    <span className="flex items-center gap-[7px]">
                      <Tippy
                        content={
                          <div className="text-[12px] font-semibold leading-4 text-[#202B37]">
                            Click to change date
                          </div>
                        }
                        interactive={true}
                        placement="top"
                        theme="transparent"
                        key="TrackStatus"
                      >
                        <div
                          className="text-[14px] text-[#344051] flex text-nowrap cursor-pointer"
                          onClick={handleIconClick}
                        >
                          Target Closure:
                        </div>
                      </Tippy>
                    </span>
                    <span className="text-[14px]" onClick={handleIconClick}>
                      <Flatpickr
                        onChange={handleDateChange}
                        value={targetClosureDate || null}
                        onOpen={() => setIsDatePickerOpen(true)}
                        onClose={() => setIsDatePickerOpen(false)}
                        options={{
                          dateFormat: 'M d, Y',
                          // disableMobile: true,
                          // minDate: 'today',
                        }}
                        placeholder="MMM DD, YYYY"
                        className="form-input placeholder:text-[14px] px-1 !text-[14px] !m-0 p-0 border-none !font-[400] !rounded-[6px] !text-[#344051] border-slate-200 dark:border-zinc-500 !w-full pr-[2px] hover:cursor-pointer focus:outline-none focus:border-gray-500 disabled:bg-slate-100 dark:disabled:bg-zinc-600 disabled:border-slate-300 dark:disabled:border-zinc-500 dark:disabled:text-zinc-200 disabled:text-slate-500 dark:text-zinc-100 dark:bg-zinc-700 dark:focus:border-custom-800 placeholder:text-slate-400 dark:placeholder:text-zinc-200"
                      />
                    </span>
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>
      <DeleteModal
        show={deleteModal}
        onHide={deleteToggle}
        onDelete={handleDelete}
        title={'opportunity'}
      />
    </div>
  );
}
