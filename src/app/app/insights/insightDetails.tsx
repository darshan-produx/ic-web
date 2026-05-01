import { useQuery } from '@tanstack/react-query';
import TaskCard from '../tasks/taskCard';
import TaskInsightCrad from './taskInsightCard';
import TimeSeriesInsightCard from './timeSeriesInsightCard';
import UnstructuredInsightCard from './unstructuredInsightCard';
import { useHeaderContext } from '../headerContext';
import { useEffect, useRef, useState, ChangeEvent, useCallback } from 'react';
import ActionTaken from './actionTaken';
import {
  useReRunResearch,
  useUpdateInsight,
} from '../../../services/mutations/insightMutations';
import { toast } from 'react-toastify';
import { ChevronRight, ChevronUp, ChevronDown } from 'lucide-react';
import { TreeIcon } from '../../assests/icons/icons';
import ExpandChartModal from '../customers/[id]/metrics/expandChartModal';
import {
  useOnExpandChartFrequency,
  useOnExpandChartModalArray,
  useOnExpandChartModalOpenState,
} from '../../../services/mutations/customer360ChartMutations';
import LineChart from '../customers/[id]/metrics/lineChart';
import { formatNumber } from '../../utils/formatNumber';
import { useMixpanel } from '../../../common/mixpanel/useMixpanel';
import { getAllTasksStatus } from '../../api/tasks/tasks';
import { getUsersForTask } from '../../api/users/users';
import { apiRequest } from '../../../common/api-request';
import Modal from '../../../common/components/Modal';
import CreateNewTask from '../tasks/createNewTask';
import { getCustomers } from '../../api/customers/customers';

import ResearchCard from './Research/researchCard';
import Tippy from '@tippyjs/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import ConfirmationPopUp from '../communication/meetings/components/confirmationPopUp';
import CustomerAttributesPanel from '../customers/components/customerAttriibutesForm';
import { getOpportunitiesProducts } from '../../api/insights/insights';
import { getNumberFormatSetting } from '../../api/globalconfig/globalconfig';
import { AnimatePresence, motion } from 'framer-motion';
import UpdateItem from '../customers/[id]/journey/UpdateItem';
import AddUpdateForm from '../../../common/components/AddUpdateForm';

export default function InsightDeatils({
  insightDetails,
  insights,
  // dummy,
  setIsGuidaceSectionOpen,
  setIsCollapsed,
  setIgnoredMessages,
  ignoredMessages,
  isGuidaceSectionOpen,
  insightSuggetion,
  selectedActionStatus,
  setSelectedActionStatus,
  isCollapsed,
  setShowSideChatbox,
  userinfo,
  showSideChatbox,
}: any) {
  const { setHeaderVariable } = useHeaderContext();
  const [actionNotes, setActionNotes] = useState('');
  const [editOppoDescription, setEditOppoDescription] = useState(false);
  const MAX_SHORT_DESCRIPTION_LENGTH = 2400;
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);
  const { onExpandChartModalOpen, setOnExpandChartModalOpen } =
    useOnExpandChartModalOpenState();
  const { setOnExpandChartModalArray } = useOnExpandChartModalArray();
  const { setOnExpandChartFrequency } = useOnExpandChartFrequency();
  const updateInsight = useUpdateInsight();
  const reRunResearch = useReRunResearch();
  const { trackEvent, MIXPANEL_EVENTS } = useMixpanel();
  const [isOpportunityInsight, setIsOpportunityInsight] = useState(false);
  const [oppoDescription, setOppoDescription] = useState('');
  const [showEditOppoButton, setShowEditOppoButton] = useState(false);
  const [createTaskModalOpen, setCreateTaskModalOpen] = useState(false);
  const [attributeType, setAttributeType] = useState('');
  const [formatKey, setFormatKey] = useState('GLOBAL');
  const [
    reRunResearchConfirmationModalOpen,
    setReRunResearchConfirmationModalOpen,
  ] = useState(false);
  const [customerAttributesModal, setCustomerAttributesModal] = useState(false);
  // ── Opportunity Updates ──────────────────────────────────────────────────
  const [localUpdates, setLocalUpdates] = useState<any[]>([]);
  const [showAddUpdate, setShowAddUpdate] = useState(false);
  const addUpdateFormRef = useRef<HTMLDivElement | null>(null);
  const updatesScrollRef = useRef<HTMLDivElement | null>(null);

  const { data: allCustomers } = useQuery({
    queryKey: ['allCustomers'],
    queryFn: getCustomers,
  });

  const { data: statusArr } = useQuery({
    queryKey: ['getstatusArr'],
    queryFn: () => getAllTasksStatus(),
    refetchOnWindowFocus: false,
  });

  const { data: existingUsers } = useQuery({
    queryKey: ['users'],
    queryFn: getUsersForTask,
    refetchOnWindowFocus: false,
  });

  const { data: getProductOpportunities } = useQuery({
    queryKey: [
      'getProductOpportunities',
      insightDetails?.insight_instance?._id,
    ],
    queryFn: () =>
      getOpportunitiesProducts(insightDetails?.insight_instance?._id),
    enabled: isOpportunityInsight && !!insightDetails?.insight_instance?._id,
    refetchOnWindowFocus: false,
  });

  const { data: numberFormatSetting } = useQuery({
    queryKey: ['getNumberFormatSetting'],
    queryFn: getNumberFormatSetting,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (numberFormatSetting?.data) {
      const data = numberFormatSetting?.data;
      if (data.key === 'numerical_format') {
        setFormatKey(data.value);
      }
    }
  }, [numberFormatSetting]);

  const [selectedUseCaseId, setSelectedUseCaseId] = useState<number | null>(
    null
  );
  // Use research array directly
  const researchArray = Array.isArray(
    insightDetails?.insight_instance?.research
  )
    ? insightDetails.insight_instance.research
    : [];

  let debounceTimerIds: Record<string, number | undefined> = {};
  const toggle = useCallback(() => {
    setCreateTaskModalOpen((prev) => !prev);
  }, []);

  // function debounce(debounceId: string, func: any, timeout = 500) {
  //   window.clearTimeout(debounceTimerIds[debounceId]);
  //   debounceTimerIds[debounceId] = window.setTimeout(func, timeout);
  // }
  // Debounce timer ref for action notes update
  const actionNotesDebounceRef = useRef<NodeJS.Timeout | null>(null);

  const handleOnChangeInput = (action_notes: string, id?: string) => {
    setActionNotes(action_notes);
    // insightDetails.insight_instance.action_notes = action_notes;

    // Clear previous debounce timer
    if (actionNotesDebounceRef.current) {
      clearTimeout(actionNotesDebounceRef.current);
    }

    // Set new debounce timer
    actionNotesDebounceRef.current = setTimeout(() => {
      updateInsight.mutateAsync({
        id: id,
        data: {
          action_notes,
        },
      });
    }, 1000);
  };

  const handleOnclick = async (
    action_sub_status: string,
    id: string,
    snoozeTill?: Date,
    action_status?: string
  ) => {
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current!);
    }

    // If action_status is not provided, derive it from action_sub_status
    const finalActionStatus =
      action_status ||
      (() => {
        switch (action_sub_status.toLowerCase()) {
          case 'completed':
            return 'Completed';
          case 'ignored':
            return 'Ignored';
          case 'active':
            return 'Active';
          default:
            return action_sub_status; // Use the sub_status as status if no mapping exists
        }
      })();

    timeoutIdRef.current = setTimeout(async () => {
      try {
        setIgnoredMessages({});
        const response = await updateInsight.mutateAsync({
          id: id,
          data: {
            action_status: finalActionStatus,
            action_sub_status: action_sub_status,
            snooze_till: snoozeTill,
          },
        });

        // Track insight action with minimal required data
        trackEvent(MIXPANEL_EVENTS.INSIGHT_ACTION, {
          action: finalActionStatus,
          customer_id: insightDetails.insight_instance.customer_id,
          insight_type: insightDetails.insight_instance.insight_data_type,
          previous_status: insightDetails.insight_instance.action_status,
          environment: process.env.NODE_ENV,
          org_id: localStorage.getItem('org_id'),
        });

        if (response?.status === 200 || response?.status === 201) {
          const statusLower = finalActionStatus.toLowerCase();
          if (statusLower === 'completed' || statusLower === 'closed') {
            toast.success('Marked as completed.');
          } else if (statusLower === 'ignored') {
            toast.success('Ignored!');
          } else {
            toast.success(`Status updated to ${action_sub_status}!`);
          }
        }
      } catch (error) {
        console.error('Error updating insight:', error);
        toast.error('Failed to update status. Please try again.');
      }
    }, 5000); // Reduced timeout from 10000 to 1000 ms for better responsiveness
  };

  const handleOnclickWithOutDebounce = async (
    id?: string,
    target_closure_date?: Date,
    opportunity_value?: number,
    opportunity_description?: string,
    opportunity_title?: string,
    assignee_id?: string
  ) => {
    try {
      if (!id) {
        console.error('No insight ID provided');
        return;
      }

      setIgnoredMessages({});

      const payload: any = {
        id: id,
        data: {},
      };

      // Only include fields that are explicitly provided
      if (target_closure_date !== undefined) {
        payload.data.target_closure_date = target_closure_date;
      }
      if (opportunity_value !== undefined) {
        payload.data.opportunity_value = opportunity_value;
      }
      if (opportunity_description !== undefined) {
        payload.data.description = opportunity_description;
      }
      if (opportunity_title !== undefined) {
        payload.data.title = opportunity_title;
      }

      if (assignee_id !== undefined) {
        payload.data.assignee_id = assignee_id;
      }

      const response = await updateInsight.mutateAsync(payload);

      // Track insight action with minimal required data
      trackEvent(MIXPANEL_EVENTS.INSIGHT_ACTION, {
        customer_id: insightDetails.insight_instance.customer_id,
        insight_type: insightDetails.insight_instance.insight_data_type,
        previous_status: insightDetails.insight_instance.action_status,
        environment: process.env.NODE_ENV,
        org_id: localStorage.getItem('org_id'),
      });
      const showToast = (attribute: string) => {
        toast.success(`${attribute} updated successfully.`);
      };
      if (response?.status === 200 || response?.status === 201) {
        target_closure_date
          ? showToast('Target Closure date')
          : opportunity_value
          ? showToast('Opportunity value')
          : opportunity_description
          ? showToast('Opportunity description')
          : opportunity_title
          ? showToast('Opportunity title')
          : showToast('Assignee');
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message);
    }
  };

  const handleReRun = async () => {
    try {
      const payload: any = {
        insight_instance_id: insightDetails?.insight_instance?._id,
        org_id: localStorage.getItem('org_id') || '',
      };
      await reRunResearch.mutateAsync(payload);
      await updateInsight.mutateAsync({
        id: insightDetails?.insight_instance?._id,
        data: {
          researched_at: new Date().toISOString(),
          research: [],
        },
      });
      toast.success('Insight re-run successfully.');
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message);
    }
  };

  const handleCancel = () => {
    setReRunResearchConfirmationModalOpen(false);
  };

  const handleYes = () => {
    handleReRun();
    setReRunResearchConfirmationModalOpen(false);
  };

  useEffect(() => {
    if (insightDetails?.insight_instance) {
      trackEvent(MIXPANEL_EVENTS.INSIGHT_VIEWED, {
        insight_id: insightDetails.insight_instance._id,
        insight_type: insightDetails.insight_instance.insight_data_type,
        customer_name: insightDetails.insight_instance.customer_name,
        customer_id: insightDetails.insight_instance.customer_id,
        metric_name: insightDetails.insight_instance.metric_name,
        metric_value: insightDetails.insight_instance.metric_value,
        status: insightDetails.insight_instance.status,
        action_status: insightDetails.insight_instance.action_status,
        has_comments: !!insightDetails.insight_instance.action_notes,
        guidance_available: !!insightDetails.guidance,
      });
      const attributeTypeFromInsight =
        insightDetails?.insight_instance?.insight_type?.toLowerCase();
      setAttributeType(attributeTypeFromInsight);
    }
  }, [insightDetails?.insight_instance?._id]);

  useEffect(() => {
    if (!ignoredMessages?.message && timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
    }
  }, [ignoredMessages]);
  useEffect(() => {
    const instance = insightDetails?.insight_instance;
    const insightType = instance?.insight_type?.toLowerCase();
    setHeaderVariable(insightDetails?.insight_instance?.customer_id);
    setIsOpportunityInsight(insightType === 'opportunity');
    setSelectedUseCaseId(instance?.usecase_id || null);
  }, [insightDetails]);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    setOppoDescription(insightDetails?.insight_instance?.description || '');
  }, [insightDetails?.insight_instance?.description]);

  // Sync updates from server data whenever the insight changes
  useEffect(() => {
    setLocalUpdates(insightDetails?.insight_instance?.updates || []);
    setShowAddUpdate(false);
  }, [insightDetails?.insight_instance?._id]);

  useEffect(() => {
    if (editOppoDescription && textAreaRef.current) {
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
  }, [editOppoDescription]);
  const handleOppoDescriptionUpdate = (opportunity_description: string) => {
    if (insightDetails?.insight_instance?.description === oppoDescription) {
      setEditOppoDescription(false);
      return;
    }
    setOppoDescription(opportunity_description);
    insightDetails.insight_instance.description = opportunity_description;
    handleOnclickWithOutDebounce(
      insightDetails?.insight_instance?._id,
      undefined,
      undefined,
      opportunity_description,
      undefined
    );
    setEditOppoDescription(false);
  };

  const onClose = () => setCustomerAttributesModal(false);

  // ── Opportunity Update handlers ──────────────────────────────────────────
  const handleAddUpdate = async (description: string) => {
    const userName = userinfo?.data?.name ||
      [userinfo?.data?.first_name, userinfo?.data?.last_name].filter(Boolean).join(' ') ||
      'You';
    const newUpdate = {
      update_id: `upd_${Date.now()}`,
      description,
      timestamp: new Date().toISOString(),
      source: 'manual' as const,
      is_deleted: false,
      created_by: userinfo?.data?.id || userinfo?.data?._id || null,
      created_by_name: userName,
    };
    // Optimistic update
    setLocalUpdates((prev) => [newUpdate, ...prev]);
    setShowAddUpdate(false);
    try {
      await updateInsight.mutateAsync({
        id: insightDetails?.insight_instance?._id,
        data: { update: newUpdate },
      });
    } catch (err) {
      // Rollback
      setLocalUpdates((prev) => prev.filter((u) => u.update_id !== newUpdate.update_id));
      toast.error('Failed to add update');
    }
  };

  const handleEditUpdate = async (updateId: string, newDescription: string) => {
    setLocalUpdates((prev) =>
      prev.map((u) => (u.update_id === updateId ? { ...u, description: newDescription } : u))
    );
    try {
      await updateInsight.mutateAsync({
        id: insightDetails?.insight_instance?._id,
        data: { update: { update_id: updateId, description: newDescription } },
      });
    } catch (err) {
      toast.error('Failed to edit update');
    }
  };

  const handleDeleteUpdate = async (updateId: string) => {
    const snapshot = localUpdates;
    setLocalUpdates((prev) => prev.filter((u) => u.update_id !== updateId));
    try {
      await updateInsight.mutateAsync({
        id: insightDetails?.insight_instance?._id,
        data: { update: { update_id: updateId, is_deleted: true } },
      });
    } catch (err) {
      setLocalUpdates(snapshot);
      toast.error('Failed to delete update');
    }
  };

  const activeUpdates = localUpdates.filter((u) => !u.is_deleted);

  return (
    <div className="flex flex-col justify-between h-full">
      <div>
        <div className="">
          {/* <TimeSeriesInsightCard insight={insightDetails?.insight_instance} /> */}
          {insightDetails?.insight_instance?.insight_type === 'Risk' ? (
            <div className="pt-[12px] border-b border-gray-100">
              <TimeSeriesInsightCard
                insight={insightDetails?.insight_instance}
                type={'insigthDetails'}
                isOnInsightDetailPage={true}
                setCustomerAttributesModal={setCustomerAttributesModal}
              />
            </div>
          ) : insightDetails?.insight_instance?.insight_data_type === 'task' ? (
            <div className="pt-[12px] border-b border-gray-100">
              <TaskInsightCrad
                insight={insightDetails?.insight_instance}
                type={'insigthDetails'}
                isOnInsightDetailPage={true}
                setCustomerAttributesModal={setCustomerAttributesModal}
              />
            </div>
          ) : insightDetails?.insight_instance?.insight_type ===
            'Opportunity' ? (
            <div
              className={`${
                !editOppoDescription && 'border-b'
              } border-gray-100`}
            >
              <UnstructuredInsightCard
                insight={insightDetails?.insight_instance}
                type={'insigthDetails'}
                isOnInsightDetailPage={true}
                handleOnclickWithOutDebounce={handleOnclickWithOutDebounce}
                isGuidaceSectionOpen={isGuidaceSectionOpen}
                setCustomerAttributesModal={setCustomerAttributesModal}
                products={
                  getProductOpportunities?.data?.data?.[0]?.attribute_value || []
                }
              />
            </div>
          ) : null}
        </div>
        {insightDetails?.insight_instance?.insight_data_type && (
          <div
            className={`${
              !isGuidaceSectionOpen && insightDetails?.guidance
                ? 'border-b border-[#F2F4F7] pb-[4px]'
                : ''
            }`}
          >
            {insightDetails?.insight_instance?.insight_data_type === 'task' && (
              <>
                <div className="text-gray-800 text-sm pt-6 pb-[10px] ">
                  Task details
                </div>

                <TaskCard
                  ele={insightDetails?.task}
                  // taskStatus={statusArr?.data?.data}
                  done={insightDetails?.task?.is_completed}
                  // existingUsers={existingUsers?.data?.data}
                  isDraggable={false}
                  isCustomerDropDownDisabled={true}
                />
              </>
            )}
            {insightDetails?.insight_instance?.insight_data_type === 'data' &&
              insightDetails?.time_series_data?.l3_data?.length > 0 && (
                <>
                  <div className="text-gray-800 text-sm py-5">
                    {insightDetails?.insight_instance?.description}
                  </div>
                  <LineChart
                    key={insightDetails?.time_series_data?.chartId}
                    data={
                      insightDetails?.time_series_data?.l3_data?.map(
                        (data: any) => ({
                          ...data,
                          metric_value: formatNumber(data?.metric_value),
                        })
                      ) || []
                    }
                    metric_name={insightDetails?.time_series_data?.metric_name}
                    metric_display_str={
                      insightDetails?.time_series_data?.metric_display_str
                    }
                    unit={insightDetails?.time_series_data?.unit}
                    chartId={insightDetails?.time_series_data?.chartId}
                    target={insightDetails?.time_series_data?.target}
                    threshold={insightDetails?.time_series_data?.threshold}
                    trigger={
                      insightDetails?.time_series_data?.opportunity_trigger
                    }
                    filterType={
                      insightDetails?.time_series_data?.status_aggregation_level
                    }
                    status={insightDetails?.time_series_data?.status}
                    description={insightDetails?.time_series_data?.description}
                    height={270}
                    chartMongoId={insightDetails?.time_series_data?._id}
                    isChartOnInsight={true}
                    chartOnInsightType={
                      insightDetails?.insight_instance?.insight_type
                    }
                    formatKey={formatKey}
                  />
                </>
              )}
            {(insightDetails?.insight_instance?.insight_data_type === 'llm' ||
              insightDetails?.insight_instance?.insight_data_type === 'unstructured') && (
              <div className="">
                <div
                  className="text-gray-800 text-[14px] flex justify-between items-start group"
                  onMouseEnter={() => setShowEditOppoButton(true)}
                  onMouseLeave={() => setShowEditOppoButton(false)}
                >
                  {editOppoDescription ? (
                    <div className="relative w-full">
                      <textarea
                        ref={textAreaRef}
                        rows={4}
                        className="h-full w-full text-[14px] py-2 px-3 border border-gray-200 rounded-md outline-none resize-none"
                        value={oppoDescription}
                        onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                          setOppoDescription(e.target.value)
                        }
                        style={{ whiteSpace: 'pre-wrap' }}
                      />
                      <div className="flex justify-end gap-2 mt-2">
                        <button
                          type="button"
                          className="w-[80px] h-[32px] rounded-[6px] border border-[#637083] bg-white text-[#637083] font-semibold text-sm leading-[20px] font-inter"
                          onClick={() => {
                            setEditOppoDescription(false);
                            setOppoDescription(
                              insightDetails?.insight_instance?.description
                            );
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          className="w-[76px] h-[32px] rounded-[6px] text-white bg-custom-500 border-custom-500 hover:bg-custom-600 hover:border-custom-600 focus:ring focus:ring-custom-100 active:ring active:ring-custom-100"
                          onClick={() => {
                            setEditOppoDescription(false);
                            handleOppoDescriptionUpdate(oppoDescription);
                          }}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`py-2 w-[96%] break-words cursor-pointer ${
                        !oppoDescription ? 'text-gray-400' : ''
                      }`}
                      onClick={() => setEditOppoDescription(true)}
                      style={{ whiteSpace: 'pre-wrap' }}
                    >
                      {oppoDescription || 'Add description here...'}
                    </div>
                  )}

                  {!editOppoDescription && showEditOppoButton && (
                    <span
                      className="text-gray-800 text-xs cursor-pointer mt-2 inline-block"
                      onClick={() => setEditOppoDescription(true)}
                    >
                      Edit
                    </span>
                  )}
                </div>

                {insightDetails?.insight_instance?.insight_data_type === 'unstructured' ? (
                  /* ── Updates section (Opportunities) ─────────────────── */
                  <div className="mt-2" ref={updatesScrollRef}>
                    {/* Add update trigger */}
                    {!showAddUpdate && (
                      <button
                        onClick={() => setShowAddUpdate(true)}
                        className="flex items-center gap-2 text-xs font-normal mt-4 text-[#202B37] cursor-pointer"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="#202B37" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add update
                      </button>
                    )}

                    {/* Animated form */}
                    <AnimatePresence mode="wait">
                      {showAddUpdate && (
                        <motion.div
                          ref={addUpdateFormRef}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3, ease: 'easeInOut' }}
                          className="overflow-hidden"
                        >
                          <div className="mt-4">
                            <AddUpdateForm
                              placeholder="Add update details"
                              onSave={(value) => handleAddUpdate(value)}
                              onCancel={() => setShowAddUpdate(false)}
                              submitButtonText="Add"
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Updates list */}
                    <div className="pb-2">
                      {activeUpdates.length > 0 ? (
                        [...activeUpdates]
                          .sort(
                            (a, b) =>
                              new Date(b.timestamp).getTime() -
                              new Date(a.timestamp).getTime()
                          )
                          .map((update) => (
                            <UpdateItem
                              key={update.update_id}
                              update={update}
                              onEdit={handleEditUpdate}
                              onDelete={handleDeleteUpdate}
                            />
                          ))
                      ) : (
                        !showAddUpdate && (
                          <p className="text-[#97A1AF] text-sm py-4">
                            No updates yet
                          </p>
                        )
                      )}
                    </div>
                  </div>
                ) : (
                  /* ── Research card (llm insights) ────────────────────── */
                  <ResearchCard
                    title={insightDetails?.insight_instance?.usecase}
                    runAt={insightDetails?.insight_instance?.researched_at}
                    onReRun={() => {
                      setReRunResearchConfirmationModalOpen(true);
                    }}
                    researchArray={researchArray}
                    insightId={insightDetails?.insight_instance?.insight_id}
                    useCaseId={insightDetails?.insight_instance?.usecase_id}
                    insightObjectId={insightDetails?.insight_instance?._id}
                    is_customer_active={
                      insightDetails?.insight_instance?.is_customer_active
                    }
                    setShowSideChatbox={setShowSideChatbox}
                    setIsGuidaceSectionOpen={setIsGuidaceSectionOpen}
                  >
                    <div className="text-gray-800 text-[14px] flex flex-col gap-4 justify-between items-start group">
                      {Array.isArray(researchArray) && researchArray?.length > 0 ? (
                        <span className="w-[full] break-words">
                          {researchArray?.map((ele: any, idx: number) => (
                            <div className="mb-4 pb-4 last:mb-0 last:pb-0" key={idx}>
                              <div className="mb-2 text-[#000000] font-inter font-medium text-[14px] leading-5">
                                {ele?.question?.replace(/\\n/g, '\n')}
                              </div>
                              <div className="mb-2 text-[#202B37] font-inter font-normal text-[14px] leading-5">
                                <div>
                                  <ReactMarkdown
                                    children={ele?.answer?.replace(/\\n/g, '\n')}
                                    remarkPlugins={[remarkGfm, remarkBreaks]}
                                    className={'markdown list-inside'}
                                  />
                                </div>
                              </div>
                              {Array.isArray(ele.source) && ele.source.length > 0 && (
                                <Tippy
                                  interactive={true}
                                  trigger="click"
                                  placement="top-start"
                                  arrow={false}
                                  offset={[0, 6]}
                                  className="!border !border-gray-200 !shadow-md !max-w-[410px] !rounded-lg !bg-white !max-h-[230px] overflow-y-auto scroll"
                                  content={
                                    <ul className="">
                                      <div className="p-[11px]">
                                        {ele.source.map((src: any, sidx: number) => (
                                          <li key={sidx} className="pb-4 last:pb-0">
                                            <a
                                              href={
                                                src?.conversation_id && src?.uri
                                                  ? `/app/emails?email_message_id=${src?.uri}`
                                                  : src?.url
                                              }
                                              target="_blank"
                                              rel="noopener noreferrer"
                                            >
                                              <h1
                                                className="text-[14px] font-normal text-[#3B82F6] leading-5"
                                                title={src?.title || src?.file_name}
                                              >
                                                {src?.title || src?.file_name}
                                              </h1>
                                            </a>
                                          </li>
                                        ))}
                                      </div>
                                    </ul>
                                  }
                                >
                                  <button className="flex items-center px-[10px] py-[6px] mt-[8px] bg-gray-100 text-[14px] text-gray-500 rounded-[6px]">
                                    <span>Sources</span>
                                    <ChevronDown className="relative left-[5px] top-[1px] h-[16px] w-[16px] text-gray-500" />
                                  </button>
                                </Tippy>
                              )}
                            </div>
                          ))}
                        </span>
                      ) : (
                        <div className="w-full min-h-[161px] flex items-center justify-center text-center text-[14px] font-normal leading-5 text-gray-400">
                          No research found
                        </div>
                      )}
                    </div>
                  </ResearchCard>
                )}

                {/* {insightDetails?.insight_instance?.metadata?.source_documents
                  .length > 0 && (
                  <>
                    <h6 className="text-slate-500 text-[14px] font-[400] dark:text-zink-200 pb-3">
                      Reference links
                    </h6>
                    {insightDetails?.insight_instance?.metadata?.source_documents?.map(
                      (source: any) => {
                        return (
                          <>
                            <div className="shadow-none border card border-gray-200 dark:border-zink-500">
                              {source?.doc_type === 'email' ? (
                                <a
                                  href={`/api/emails?message_id=${source.uri}`}
                                >
                                  <div className=" !p-3 ">
                                    <div className="!flex items-center overflow-hidden">
                                      <div className="w-[44px] rounded-md ">
                                        <img
                                          className="object-cover  h-10 w-10 rounded-md"
                                          src={source.image}
                                          alt={''}
                                        />
                                      </div>
                                      <div className="text-ellipsis pl-2 w-[calc(100%-44px)]">
                                        <h6 className="text-gray-900 text-sm font-semibold dark:text-zink-200">
                                          {source.title}
                                        </h6>
                                        <p className="text-gray-600 text-sm">
                                          {getShortDescription(
                                            source.description,
                                            35
                                          )}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </a>
                              ) : (
                                <a href={source.url} target="_blank">
                                  <div className=" !p-3 ">
                                    <div className="flex items-center overflow-hidden">
                                      <span className="w-[44px] rounded-md ">
                                        <img
                                          className="object-cover h-10 w-10 rounded-md"
                                          src={source.image}
                                          alt={''}
                                        />
                                      </span>
                                      <div className="text-ellipsis pl-2 w-[calc(100%-44px)]">
                                        <h6 className="text-gray-900 text-sm font-semibold dark:text-zink-200">
                                          {source.title}
                                        </h6>
                                        <p className="text-gray-600 text-sm">
                                          {getShortDescription(
                                            source.description,
                                            35
                                          )}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </a>
                              )}
                            </div>
                          </>
                        );
                      }
                    )}
                  </>
                )} */}
              </div>
            )}
          </div>
        )}
        {/* <div className="text-[12px] pt-[24px] text-[#97A1AF]">Not helpful?</div> */}
      </div>

      <div className="pt-[24px] gap-4 flex flex-col">
        {/* {!isGuidaceSectionOpen &&
          insightDetails?.guidance &&
          !isSideBarView && (
            <div
              className="border h-[62px] pr-[22px] overflow-hidden flex justify-between items-center border-[#3B82F6] rounded-[12px] cursor-pointer"
              onClick={() => {
                setIsGuidaceSectionOpen(true), setIsCollapsed(false);
              }}
            >
              <div className="flex h-full items-center gap-2">
                <div className="bg-[#F9FAFB] h-full items-center flex p-[16px] ">
                  <TreeIcon className="text-[#3B82F6] h-[28px] w-[30px]" />
                </div>
                <div className="leading-4">
                  <div className="text-[12px] font-medium text-[#97A1AF]">
                    Need a help to resolve this insight?
                  </div>
                  <div className="text-[14px] text-[#202B37]">
                    Check step-by-step guidance for this insight
                  </div>
                </div>
              </div>

              <span className="">
                <ChevronRight className="h-5 w-4 text-[#414E62]" />
              </span>
            </div>
          )} */}
        <div className="">
          {insightDetails && (
            <div className="">
              <ActionTaken
                insightDetails={insightDetails}
                handleOnChangeInput={handleOnChangeInput}
                handleOnclick={handleOnclick}
                setIgnoredMessages={setIgnoredMessages}
                isOpportunityInsight={isOpportunityInsight}
                selectedActionStatus={selectedActionStatus}
                setSelectedActionStatus={setSelectedActionStatus}
                setCreateTaskModalOpen={setCreateTaskModalOpen}
                isCollapsed={isCollapsed}
                isGuidaceSectionOpen={isGuidaceSectionOpen}
                setIsGuidaceSectionOpen={setIsGuidaceSectionOpen}
                setIsCollapsed={setIsCollapsed}
                setShowSideChatbox={setShowSideChatbox}
                showSideChatbox={showSideChatbox}
              />
            </div>
          )}
        </div>
      </div>

      <ExpandChartModal
        modalOpen={onExpandChartModalOpen}
        handleCancel={() => {
          setOnExpandChartModalOpen(false);
          setOnExpandChartModalArray([]);
          setOnExpandChartFrequency('');
        }}
        id={Number(insightDetails?.insight_instance?.customer_id)}
        customerName={insightDetails?.insight_instance?.customer_name}
        chartFrequency={insightDetails?.insight_instance?.frequency}
        formatKey={formatKey}
      />
      <Modal
        show={createTaskModalOpen}
        onHide={toggle}
        id="defaultModal"
        modal-center="true"
        className="fixed flex flex-col transition-all duration-300 ease-in-out left-2/4 z-drawer -translate-x-2/4 -translate-y-2/4"
        dialogClassName="w-screen md:w-[750px] bg-white shadow rounded-md dark:bg-zink-600"
      >
        <Modal.Body className="max-h-[calc(theme('height.screen')_-_61px)] p-4 overflow-y-auto barScroll">
          {createTaskModalOpen && (
            <CreateNewTask
              onHide={toggle}
              allCustomers={allCustomers}
              existingUsers={existingUsers?.data?.data}
              statusArr={statusArr?.data?.data}
              userDetails={userinfo?.data}
              isEditMode={false}
              isCustomerDropDownDisabled={true}
              customerId={insightDetails?.insight_instance?.customer_id}
            />
          )}
        </Modal.Body>
      </Modal>

      {reRunResearchConfirmationModalOpen && (
        <ConfirmationPopUp
          header={`This action will clear the research`}
          modalOpen={reRunResearchConfirmationModalOpen}
          handleCancel={handleCancel}
          handleYes={handleYes}
          yesText={'Yes'}
          noText={'No'}
          title={'Do you want to continue?'}
        />
      )}
      <CustomerAttributesPanel
        onClose={onClose}
        customerAttributesModal={customerAttributesModal}
        customerId={insightDetails.insight_instance.customer_id}
        base_collection={'insight_instance'}
        base_collection_id={insightDetails.insight_instance._id}
        attribute_type={attributeType}
      />
    </div>
  );
}
