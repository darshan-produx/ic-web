import React, { useState, useEffect, lazy, Suspense, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  getCustomerJourneySignal,
  getGuidance,
} from '../../../../api/customers/customers';
import { toast } from 'react-toastify';
import RiskLevelDropdown from '../../../../../common/components/RiskLevelDropdown';
import MultiTextFieldEditor from '../../../../../common/components/MultiTextFieldEditor';
import UpdateItem from './UpdateItem';
import AddUpdateForm from '../../../../../common/components/AddUpdateForm';
import { MeetingMembersdividerLineIcon, SemiCricleCheckIcon, TreeIcon, } from '../../../../../app/assests/icons/icons';
import GenericFlatpickr from '../../../../../common/components/Flatpickr';
import { getBgColorForExpressionAndIntensity, getColorForExpressionAndIntensity, getExpressionSvgIcon } from './signalCard';
import SideDrawer from '../../../../../common/components/SideDrawer';
import { useQuery } from '@tanstack/react-query';
import { useUpdateEventInEventJourney } from '../../../../../services/mutations/customersMutations';
import dayjs from 'dayjs';
import ReactMarkdown from 'react-markdown';
import { useGraphDataQuery } from '../../../../../services/queries/graphChartQuery';
import { formatNumber } from '../../../../../app/utils/formatNumber';

// Lazy load the heavy LineChart component
const LineChart = lazy(() => import('../metrics/lineChart'));

// Loading skeleton for the chart
const ChartLoadingSkeleton = () => (
  <div className="px-6 py-6 flex-shrink-0">
    <div className="animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
      <div className="h-[240px] bg-gray-100 rounded flex items-center justify-center">
        <span className="text-[#97A1AF] text-sm">Loading chart</span>
      </div>
    </div>
  </div>
);

// Content loading skeleton
const ContentLoadingSkeleton = () => (
  <div className="py-3 px-6 animate-pulse">
    <div className="flex items-center justify-between mb-4">
      <div className="flex gap-3 items-center">
        <div className="h-4 bg-gray-200 rounded w-24"></div>
        <div className="h-4 bg-gray-200 rounded w-32"></div>
      </div>
      <div className="flex gap-3 items-center">
        <div className="h-4 bg-gray-200 rounded w-12"></div>
        <div className="h-4 bg-gray-200 rounded w-12"></div>
      </div>
    </div>
    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
    <div className="flex gap-3">
      <div className="h-8 bg-gray-200 rounded-full w-24"></div>
      <div className="h-8 bg-gray-200 rounded w-20"></div>
    </div>
  </div>
);
import Guidance from '../../../insights/guidance';
import AssignTo from '../../../../../common/components/AssignTo';
import { getNumberFormatSetting } from '../../../../../app/api/globalconfig/globalconfig';

interface SignalDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  signalId: string;
  handleDelete: () => void;
  fromPage?:
    | 'journey'
    | 'my-team'
    | 'customers'
    | 'customer-360'
    | 'group-customers';
  userInfo?: any;
  // onUpdate?: () => void;
}

interface SignalData {
  _id: string;
  customer_id: number;
  org_id: string;
  intensity: number;
  event_type: string;
  signal_types: string[];
  status: 'open' | 'closed' | 'resolved';
  source: 'manual' | 'system' | 'email' | 'meeting';
  title: string;
  targeted_closure_date: Date | null;
  description: string;
  created_at: string;
  updated_at: string;
  signal_master_id: string;
  assignee_id?: string;
  updates: Array<{
    description: string;
    timestamp: string;
    source?: 'manual' | 'system' | 'email' | 'meeting';
    update_id: string;
    is_deleted?: boolean;
    created_by?: string;
    created_by_name?: string;
    update_reference_ids?: string[];
  }>;
  pillar: string;
  meta_data: {
    reference_ids: any[];
    reference_collection?: string;
    metric_id?: number;
  };
  is_editable: boolean;
  is_deleted: boolean;
  signal_created_at: string;
  signal_updated_at: string;

  created_by?: {
    _id: string;
    name: string;
  };
  customer_details: {
    _id: string;
    customer_id: number;
    customer_name: string;
  };
  collection_type: string;
  can_guidance_exist?: boolean;
}

const SignalDetails: React.FC<SignalDetailsProps> = ({
  isOpen,
  onClose,
  signalId,
  // isSideDrawerOpen,
  handleDelete,
  userInfo,
  // onUpdate,

  fromPage,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showAddUpdate, setShowAddUpdate] = useState(false);
  const [addUpdateInitialValue, setAddUpdateInitialValue] = useState<
    string | undefined
  >(undefined);
  const [localSignalData, setLocalSignalData] = useState<SignalData | null>(
    null
  );
  const [isGuidanceSectionOpen, setIsGuidanceSectionOpen] = useState(false);
  const [assignToUserId, setAssignToUserId] = useState<any>('');

  // Pending action state for deferred intensity/status changes
  const [pendingAction, setPendingAction] = useState<
    'intensity' | 'resolved' | 'unresolved' | null
  >(null);
  const [pendingIntensityChange, setPendingIntensityChange] = useState<{
    from: number;
    to: number;
  } | null>(null);
  const [pendingDataSnapshot, setPendingDataSnapshot] =
    useState<SignalData | null>(null);

  // Guidance polling state
  const [guidanceData, setGuidanceData] = useState<any>(null);
  const [guidanceLoading, setGuidanceLoading] = useState(false);
  const [guidanceStatus, setGuidanceStatus] = useState<
    'idle' | 'generating' | 'found' | 'not_found' | 'error'
  >('idle');
  const [formatKey, setFormatKey] = useState('GLOBAL');
  const pollingCountRef = useRef(0);
  const pollingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const signalDataRef = useRef<SignalData | null>(null);
  const addUpdateFormRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const updateSignalMutation = useUpdateEventInEventJourney();

  const {
    data: signalDetailsData,
    refetch,
    isLoading: isSignalLoading,
    isError: isSignalError,
    error: signalError,
  } = useQuery({
    queryKey: ['getCustomerJourneySignal', signalId],
    queryFn: async () => await getCustomerJourneySignal(signalId),
    refetchOnWindowFocus: false,
    enabled: isOpen && !!signalId,
  });

  const querySignalData = signalDetailsData?.data as SignalData | undefined;

  // Sync local state with query data when it changes or drawer opens
  useEffect(() => {
    if (isOpen && querySignalData) {
      setLocalSignalData(querySignalData);
      setAssignToUserId(querySignalData?.assignee_id || '');
      signalDataRef.current = querySignalData; // Keep ref updated
    }
  }, [isOpen, querySignalData]);

  // Use local state for rendering (enables optimistic updates)
  const signalData = localSignalData;

  const { data: signalMetricTRawData, isLoading: isMetricLoading } =
    useGraphDataQuery(
      Number(signalData?.customer_id || 0),
      signalData?.pillar || '',
      'default',
      '',
      '',
      [],
      isOpen && !!signalData?.customer_id && !!signalData?.meta_data?.metric_id,
      signalData?.meta_data?.metric_id,
      undefined,
      undefined
    );

  const signalMetricData = signalMetricTRawData?.data?.data?.[0] || null;

  // Reset state when drawer closes
  useEffect(() => {
    if (!isOpen) {
      setIsEditing(false);
      setShowAddUpdate(false);
      setAddUpdateInitialValue(undefined);
      setLocalSignalData(null);
      setIsGuidanceSectionOpen(false);
      // Clear pending action state
      setPendingAction(null);
      setPendingIntensityChange(null);
      setPendingDataSnapshot(null);
    }
  }, [isOpen]);

  // Auto-scroll to update form when it opens
  useEffect(() => {
    if (showAddUpdate && addUpdateFormRef.current && scrollContainerRef.current) {
      // Small delay to ensure DOM is updated and animation starts
      setTimeout(() => {
        const formElement = addUpdateFormRef.current;
        const containerElement = scrollContainerRef.current;
        
        if (formElement && containerElement) {
          const formRect = formElement.getBoundingClientRect();
          const containerRect = containerElement.getBoundingClientRect();
          
          // Calculate the scroll position to center the form in view
          const scrollTop = formElement.offsetTop - containerRect.height / 4;
          
          containerElement.scrollTo({
            top: scrollTop,
            behavior: 'smooth',
          });
        }
      }, 350); // Wait for animation to complete (300ms animation + 50ms buffer)
    }
  }, [showAddUpdate]);

  const canChangeIntensity =
    ['issue', 'commitment', 'expectation'].some((type) =>
      signalData?.signal_types?.includes(type)
    ) || false;

  const handleClosureDateChange = async (newDate: Date | null) => {
    if (!signalData) return;

    // Optimistic update - update UI immediately
    const previousData = signalData;
    setLocalSignalData((prev) =>
      prev ? { ...prev, targeted_closure_date: newDate } : prev
    );

    try {
      const response = await updateSignalMutation.mutateAsync({
        signalId,
        data: { targeted_closure_date: newDate },
        fromPage: fromPage,
      });
      if (response && response.status === 200) {
        toast.success('Closure date updated successfully');
        // if (onUpdate) onUpdate();
      }
    } catch (error) {
      // Rollback on error
      setLocalSignalData(previousData);
      console.error('Error updating closure date:', error);
      toast.error('Failed to update closure date');
    }
  };

  const handleMarkAsResolved = () => {
    if (!signalData) return;

    // Store snapshot for potential rollback
    setPendingDataSnapshot(signalData);
    setPendingAction('resolved');

    // Determine status based on pillar - 'resolved' for stakeholder, 'closed' for others
    const newStatus = signalData.pillar === 'stakeholder' ? 'resolved' : 'closed';

    // Optimistic UI update - but don't call API yet
    setLocalSignalData((prev) => (prev ? { ...prev, status: newStatus } : prev));

    // Open AddUpdate form without initial value
    setAddUpdateInitialValue(undefined);
    setShowAddUpdate(true);
  };

  const handleMarkAsUnresolved = () => {
    if (!signalData || signalData.status !== 'resolved') return;

    // Store snapshot for potential rollback
    setPendingDataSnapshot(signalData);
    setPendingAction('unresolved');

    // Optimistic UI update - but don't call API yet
    setLocalSignalData((prev) => (prev ? { ...prev, status: 'open' } : prev));

    // Open AddUpdate form without initial value
    setAddUpdateInitialValue(undefined);
    setShowAddUpdate(true);
  };

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

  const handleIntensityChange = (newIntensity: number) => {
    if (!signalData) return;

    // If there's already a pending intensity change, keep the original "from" value
    const originalFromValue =
      pendingAction === 'intensity' && pendingIntensityChange
        ? pendingIntensityChange.from
        : signalData.intensity;
    if (!pendingAction) {
      setPendingDataSnapshot(signalData);
    }

    setPendingIntensityChange({ from: originalFromValue, to: newIntensity });
    setPendingAction('intensity');

    // Optimistic UI update - but don't call API yet
    setLocalSignalData((prev) =>
      prev ? { ...prev, intensity: newIntensity } : prev
    );

    // Open AddUpdate form without initial value
    setAddUpdateInitialValue(undefined);
    setShowAddUpdate(true);
  };

  const handleAssigneeChange = async (newAssignee: string | null) => {
    // Optimistic update - update UI immediately
    const previousData = signalData;
    setLocalSignalData((prev) =>
      prev ? { ...prev, assignee: newAssignee } : prev
    );

    try {
      const response = await updateSignalMutation.mutateAsync({
        signalId,
        data: { assignee_id: newAssignee },
        fromPage: fromPage,
      });
      if (response && response.status === 200) {
        toast.success('Assignee updated successfully');
        // if (onUpdate) onUpdate();
      }
    } catch (error) {
      // Rollback on error
      if (previousData) setLocalSignalData(previousData);
      console.error('Error updating assign to:', error);
      toast.error('Failed to update assign to');
    }
  };

  const handleSaveEdit = async (title?: string, description?: string) => {
    // Optimistic update - update UI immediately
    const previousData = signalData;
    setLocalSignalData((prev) =>
      prev
        ? {
            ...prev,
            title: title ?? prev.title,
            description: description ?? prev.description,
          }
        : prev
    );
    setIsEditing(false);

    try {
      const response = await updateSignalMutation.mutateAsync({
        signalId,
        data: { title, description },
        fromPage: fromPage,
      });
      if (response && response.status === 200) {
        toast.success('Signal updated successfully');
        // if (onUpdate) onUpdate();
      }
    } catch (error) {
      // Rollback on error
      if (previousData) setLocalSignalData(previousData);
      setIsEditing(true); // Re-open editor on failure
      console.error('Error saving edit:', error);
      toast.error('Failed to update signal');
    }
  };

  const handleAddUpdate = async (description: string) => {
    if (!signalData) return;

    // Build the final update description based on pending action
    let finalDescription = description;
    let apiData: any = {};

    if (pendingAction === 'intensity' && pendingIntensityChange) {
      // Combine intensity change message with user text
      const intensityText = `**Intensity** changed from **${pendingIntensityChange.from}** to **${pendingIntensityChange.to}** by *${userInfo?.first_name} ${userInfo?.last_name}*.`;
      finalDescription = description.trim()
        ? `${intensityText}\n\n${description.trim()}`
        : intensityText;
      apiData.intensity = pendingIntensityChange.to;
    } else if (pendingAction === 'resolved') {
      // Determine status based on pillar - 'resolved' for stakeholder, 'closed' for others
      const newStatus = signalData.pillar === 'stakeholder' ? 'resolved' : 'closed';
      const statusLabel = newStatus === 'resolved' ? 'resolved' : 'closed';
      const resolvedText = `Status changed to **${statusLabel}** by *${userInfo?.first_name} ${userInfo?.last_name}*.`;
      finalDescription = description.trim()
        ? `${resolvedText}\n\n${description.trim()}`
        : resolvedText;
      apiData.status = newStatus;
      apiData.status_overriden_by_user = true;
    } else if (pendingAction === 'unresolved') {
      // Change status from resolved to open
      const unresolvedText = `Status changed to **open** by *${userInfo?.first_name} ${userInfo?.last_name}*.`;
      finalDescription = description.trim()
        ? `${unresolvedText}\n\n${description.trim()}`
        : unresolvedText;
      apiData.status = 'open';
      apiData.status_overriden_by_user = true;
    }

    const newUpdate = {
      description: finalDescription,
      timestamp: new Date().toISOString(),
      source: 'manual' as const,
      is_deleted: false,
    };
    apiData.update = newUpdate;

    // Clear form state
    setShowAddUpdate(false);
    setAddUpdateInitialValue(undefined);

    // Store pending action info before clearing for error handling
    const wasPendingAction = pendingAction;
    const previousSnapshot = pendingDataSnapshot;

    // Clear pending action state
    setPendingAction(null);
    setPendingIntensityChange(null);
    setPendingDataSnapshot(null);

    try {
      const response = await updateSignalMutation.mutateAsync({
        signalId,
        data: apiData,
        fromPage: fromPage,
      });
      if (response && response.status === 200) {
        if (wasPendingAction === 'intensity') {
          toast.success('Intensity updated successfully');
        } else if (wasPendingAction === 'resolved') {
          toast.success('Signal marked as resolved');
        } else if (wasPendingAction === 'unresolved') {
          toast.success('Signal marked as unresolved');
        } else {
          toast.success('Update added successfully');
        }
      }
    } catch (error) {
      // Rollback on error
      if (previousSnapshot && wasPendingAction) {
        setLocalSignalData(previousSnapshot);
      }
      setShowAddUpdate(true);
      // Restore pending action state for retry
      if (wasPendingAction) {
        setPendingAction(wasPendingAction);
        setPendingDataSnapshot(previousSnapshot);
        if (wasPendingAction === 'intensity' && pendingIntensityChange) {
          setPendingIntensityChange(pendingIntensityChange);
        }
      }
      console.error('Error adding update:', error);
      toast.error('Failed to add update');
    }
  };

  // Handle cancel for both normal updates and pending action updates
  const handleCancelUpdate = () => {
    setShowAddUpdate(false);
    setAddUpdateInitialValue(undefined);

    // Rollback if there was a pending action
    if (pendingAction && pendingDataSnapshot) {
      setLocalSignalData(pendingDataSnapshot);
    }

    // Clear pending action state
    setPendingAction(null);
    setPendingIntensityChange(null);
    setPendingDataSnapshot(null);
  };

  const handleEditUpdate = async (updateId: string, newDescription: string) => {
    if (!signalData) return;

    // Optimistic update - update UI immediately
    const previousData = signalData;
    setLocalSignalData((prev) =>
      prev
        ? {
            ...prev,
            updates: prev.updates.map((update) =>
              update.update_id === updateId
                ? { ...update, description: newDescription }
                : update
            ),
          }
        : prev
    );

    try {
      const updateEdit = {
        update_id: updateId,
        description: newDescription,
      };
      const response = await updateSignalMutation.mutateAsync({
        signalId,
        data: { update: updateEdit },
        fromPage: fromPage,
      });
      if (response && response.status === 200) {
        toast.success('Update edited successfully');
        // if (onUpdate) onUpdate();
      }
    } catch (error) {
      // Rollback on error
      setLocalSignalData(previousData);
      console.error('Error editing update:', error);
      toast.error('Failed to edit update');
    }
  };

  const handleDeleteUpdate = async (updateId: string) => {
    if (!signalData) return;

    // Optimistic update - mark as deleted in UI immediately
    const previousData = signalData;
    setLocalSignalData((prev) =>
      prev
        ? {
            ...prev,
            updates: prev.updates.map((update) =>
              update.update_id === updateId
                ? { ...update, is_deleted: true }
                : update
            ),
          }
        : prev
    );

    try {
      const updateEdit = {
        update_id: updateId,
        is_deleted: true,
      };
      const response = await updateSignalMutation.mutateAsync({
        signalId,
        data: { update: updateEdit },
        fromPage: fromPage,
      });
      if (response && response.status === 200) {
        toast.success('Update deleted successfully');
        // if (onUpdate) onUpdate();
      }
    } catch (error) {
      // Rollback on error
      setLocalSignalData(previousData);
      console.error('Error deleting update:', error);
      toast.error('Failed to delete update');
    }
  };

  const isIssueCommitmentExpectation = signalData?.signal_types?.some(
    (type: string) => ['issue', 'commitment', 'expectation'].includes(type)
  );
  const isClosed =
    (signalData?.status === 'closed' || signalData?.status === 'resolved') && isIssueCommitmentExpectation;
  const activeUpdates =
    signalData?.updates?.filter((update) => !update.is_deleted) || [];

  // Polling configuration
  const MAX_POLL_COUNT = 10;
  const FIRST_POLL_DELAY = 15000; // 15 seconds for first poll
  const SUBSEQUENT_POLL_DELAY = 2000; // 2 seconds for subsequent polls

  // Cleanup polling on unmount or when section closes
  const clearPolling = useCallback(() => {
    if (pollingTimeoutRef.current) {
      clearTimeout(pollingTimeoutRef.current);
      pollingTimeoutRef.current = null;
    }
    pollingCountRef.current = 0;
  }, []);

  // Polling function - using useRef to avoid stale closures
  const pollGuidance = useCallback(
    async (isPolling: boolean = false) => {
      const currentSignalData = signalDataRef.current;

      if (
        !currentSignalData?._id ||
        !currentSignalData?.signal_master_id ||
        !currentSignalData?.customer_id ||
        !currentSignalData?.org_id
      ) {
        return;
      }

      try {
        const response = await getGuidance(
          currentSignalData._id,
          currentSignalData.signal_master_id,
          currentSignalData.customer_id,
          currentSignalData.org_id,
          isPolling
        );

        const data = response?.data;

        // Check if response has status field (dynamic guidance response)
        if (data?.status === 'started' || data?.status === 'processing') {
          // Guidance is being generated, continue polling
          setGuidanceStatus('generating');
          pollingCountRef.current += 1;

          if (pollingCountRef.current >= MAX_POLL_COUNT) {
            // Max polls reached, show not found with retry option
            setGuidanceStatus('not_found');
            setGuidanceLoading(false);
            clearPolling();
            return;
          }

          // Schedule next poll
          const delay =
            pollingCountRef.current === 1
              ? FIRST_POLL_DELAY
              : SUBSEQUENT_POLL_DELAY;
          pollingTimeoutRef.current = setTimeout(() => {
            pollGuidance(true);
          }, delay);
        } else if (data?.recipe_tree || data?._id) {
          // Guidance found (has recipe_tree or _id which are present in actual guidance)
          setGuidanceData(response);
          setGuidanceStatus('found');
          setGuidanceLoading(false);
          clearPolling();
        } else {
          // Unexpected response, treat as not found
          setGuidanceStatus('not_found');
          setGuidanceLoading(false);
          clearPolling();
        }
      } catch (error) {
        console.error('Error fetching guidance:', error);
        setGuidanceStatus('error');
        setGuidanceLoading(false);
        clearPolling();
      }
    },
    [clearPolling]
  );

  // Retry guidance fetch
  const retryGuidanceFetch = useCallback(() => {
    clearPolling();
    setGuidanceData(null);
    setGuidanceStatus('idle');
    setGuidanceLoading(true);
    pollingCountRef.current = 0;
    pollGuidance(false);
  }, [clearPolling, pollGuidance]);

  // Fetch guidance when section opens
  useEffect(() => {
    if (
      isGuidanceSectionOpen &&
      signalDataRef.current?._id &&
      signalDataRef.current?.can_guidance_exist === true &&
      guidanceStatus === 'idle'
    ) {
      setGuidanceLoading(true);
      pollGuidance(false);
    }
  }, [isGuidanceSectionOpen, guidanceStatus, pollGuidance]);

  // Reset guidance state when drawer closes
  useEffect(() => {
    if (!isGuidanceSectionOpen) {
      clearPolling();
      setGuidanceData(null);
      setGuidanceStatus('idle');
      setGuidanceLoading(false);
    }
  }, [isGuidanceSectionOpen, clearPolling]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearPolling();
    };
  }, [clearPolling]);

  // Define guidance for the Guidance component
  const guidance = guidanceData;

  if (isSignalLoading) {
    return (
      <SideDrawer
        isOpen={isOpen}
        onClose={onClose}
        title="Loading..."
        width="w-[620px]"
      >
        <ContentLoadingSkeleton />
        <div className="border-t border-[#E4E7EC]"></div>
        <div className="px-6 py-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
            <div className="h-16 bg-gray-100 rounded"></div>
          </div>
        </div>
      </SideDrawer>
    );
  }

  // Error state
  if (isSignalError) {
    return (
      <SideDrawer
        isOpen={isOpen}
        onClose={onClose}
        title="Error"
        width="w-[620px]"
      >
        <div className="flex flex-col items-center justify-center p-8">
          <div className="text-[#EF4444] mb-2">
            <svg
              className="w-12 h-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="text-[#637083] mb-4 text-center">
            {(signalError as Error)?.message || 'Failed to load signal details'}
          </div>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </SideDrawer>
    );
  }

  // No data found state
  if (!signalData) {
    return (
      <SideDrawer
        isOpen={isOpen}
        onClose={onClose}
        title="Signal Not Found"
        width="w-[620px]"
      >
        <div className="flex flex-col items-center justify-center p-8">
          <div className="text-[#97A1AF] mb-2">
            <svg
              className="w-12 h-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="text-[#637083] text-center">
            Signal not found or has been deleted
          </div>
        </div>
      </SideDrawer>
    );
  }

  return (
    <SideDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={signalData?.title}
      width={`${
        isGuidanceSectionOpen ? 'max-w-[1210px] w-content' : 'w-[620px]'
      }`}
      canClose={!showAddUpdate}
      // width="w-[620px]"
      // zIndex={999}
    >
      <div className="flex w-full">
        <div ref={scrollContainerRef} className="flex flex-col w-[620px] h-[calc(100vh-3.8rem)] overflow-y-auto scroll-container">
          <div className="py-3 px-6 flex-shrink-0">
            {/* Description or Edit Section */}
            {isEditing ? (
              <MultiTextFieldEditor
                title={signalData.title}
                description={signalData.description}
                onSave={handleSaveEdit}
                onCancel={() => setIsEditing(false)}
              />
            ) : (
              <>
                <div className="w-full flex items-center justify-between mb-4">
                  <div className="w-fit flex gap-3 items-center justify-start">
                    {/* Customer Name */}
                    <div className="text-[12px] text-[#637083] font-normal">
                      {signalData.customer_details.customer_name}
                    </div>

                    {/* Created By */}
                    {/* {signalData.created_by && (
                    <div className="flex items-center gap-3 text-xs text-[#202B37] font-normal">
                      <span><MeetingMembersdividerLineIcon /></span>
                      <span className='flex items-center gap-1'><OpportunitiesCreatedBySvgIcon /><span>{signalData?.created_by?.name || "Akash Sapkal"}</span></span>
                    </div>
                  )} */}
                    {signalData.signal_updated_at && (
                      <div className="flex items-center gap-3 text-xs text-[#202B37] font-normal">
                        <span>
                          <MeetingMembersdividerLineIcon />
                        </span>
                        <span className="flex items-center gap-1 text-[#637083] text-xs">
                          Updated{' '}
                          <span>
                            {' '}
                            {dayjs(signalData?.signal_updated_at).format(
                              'MMM D, YYYY'
                            )}
                          </span>
                        </span>
                        <span>
                          <MeetingMembersdividerLineIcon />
                        </span>
                        {
                          <div
                            // ref={containerRef}
                            className="flex items-center text-[#637083] text-xs w-[160px]"
                          >
                            <AssignTo
                              value={assignToUserId}
                              setValue={setAssignToUserId}
                              placeholder="Assign to"
                              disabled={false}
                              border="border-0"
                              dropdown="top-5 min-w-[170px]"
                              userIcon="text-[#637083] h-3 w-3"
                              text="w-full text-[12px] font-[400] placeholder:text-[12px] placeholder:text-[#637083]"
                              onChange={handleAssigneeChange}
                            />
                          </div>
                        }
                      </div>
                    )}
                  </div>
                  <div className="w-fit flex gap-3 items-center justify-end">
                    {/* Edit Button */}
                    <button
                      onClick={() => {
                        if (showAddUpdate) {
                          return;
                        }
                        setIsEditing(true);
                        // setShowAddUpdate(false);
                      }}
                      className={`text-xs font-normal ${
                        showAddUpdate
                          ? 'text-[#A1A8B3] cursor-not-allowed'
                          : 'text-[#202B37] cursor-pointer'
                      }`}
                    >
                      Edit
                    </button>
                    <span>
                      <MeetingMembersdividerLineIcon />
                    </span>
                    {/* Delete Button */}
                    <button
                      onClick={handleDelete}
                      className="text-xs font-normal text-[#EF4444]"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {(signalData.status === 'open' || signalData.status === 'resolved') &&
                  !signalData?.signal_types.includes('opportunity') && (
                    <div className="flex items-center justify-start text-[#202B37] text-[14px] font-normal gap-1 mb-4 ">
                      <span> Targeted closure:</span>
                      <GenericFlatpickr
                        value={
                          signalData?.targeted_closure_date
                            ? new Date(signalData.targeted_closure_date)
                            : null
                        }
                        onChange={handleClosureDateChange}
                        placeholder="MMM DD, YYYY"
                        showCalendarIcon={false}
                        showClearIcon={true}
                        dateFormat="M d, Y"
                        className="w-[160px] text-[#202B37] !text-[14px] !font-normal placeholder:text-[14px] !p-0"
                      />
                    </div>
                  )}
                {/* Description */}
                <ReactMarkdown className="text-[14px] text-[#202B37] mb-4">
                  {signalData.description}
                </ReactMarkdown>

                {/* Interactive Section */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center justify-start gap-3">
                    {/* Signal Type */}
                    {signalData.signal_types.map((type, index) => {
                      const color = getColorForExpressionAndIntensity(
                        type,
                        signalData.intensity,
                        undefined,
                        undefined,
                        isClosed
                      );
                      const bg = getBgColorForExpressionAndIntensity(
                        type,
                        signalData.intensity,
                        undefined,
                        isClosed
                      );
                      return (
                        <span
                          key={index}
                          className="flex text-xs font-medium py-2 px-3 rounded-[32px] items-center"
                          style={{
                            color: color,
                            backgroundColor: bg,
                          }}
                        >
                          {isClosed ? (
                            <SemiCricleCheckIcon
                              className="w-[13.33px] h-[13.33px]"
                              stroke={color}
                            />
                          ) : (
                            getExpressionSvgIcon(
                              type,
                              color,
                              `${
                                type == 'appreciation'
                                  ? 'w-[16.37px] h-[14.53px] font-normal mb-[1px]'
                                  : 'w-4 h-[13.7px] font-normal mb-[1px]'
                              }`
                            )
                          )}
                          &nbsp;
                          {type === 'fact'
                            ? 'Information'
                            : type.replace('_', ' ').charAt(0).toUpperCase() +
                              type.slice(1)}
                        </span>
                      );
                    })}
                  </div>
                  <div className="flex items-center justify-end gap-3">
                    {!isGuidanceSectionOpen &&
                      signalData?.can_guidance_exist && (
                        <div
                          className="text-xs text-[#202B37] font-medium py-2 px-3 border border-[#E4E7EC] rounded-[6px] flex gap-3 justify-between items-center cursor-pointer border-box"
                          onClick={() => {
                            setIsGuidanceSectionOpen(true);
                          }}
                        >
                          <TreeIcon className="text-[#3B82F6] h-[16px] w-[16px]" />
                          <div className="">Guidance</div>
                        </div>
                      )}
                    {/* Risk Level Dropdown */}
                    {canChangeIntensity && (
                      <RiskLevelDropdown
                        intensity={signalData.intensity}
                        onIntensityChange={handleIntensityChange}
                        isIssue={
                          signalData.signal_types?.includes('issue') || false
                        }
                        disabled={signalData.status === 'closed' || signalData.status === 'resolved'}
                      />
                    )}
                    {/* Mark as Resolved / Unresolved */}
                    {signalData.status === 'open' &&
                      !signalData?.signal_types.includes('opportunity') && (
                        <button
                          onClick={handleMarkAsResolved}
                          disabled={
                            signalData?.status !== 'open' ||
                            signalData?.signal_types.includes('opportunity') ||
                            pendingAction === 'intensity'
                          }
                          className={`text-xs text-[#202B37] font-medium py-2 px-3 border border-[#E4E7EC] rounded-[6px] ${
                            signalData?.status === 'open' &&
                            !signalData?.signal_types.includes('opportunity') &&
                            pendingAction !== 'intensity'
                              ? 'cursor-pointer'
                              : 'cursor-not-allowed opacity-50'
                          }`}
                        >
                          Mark as resolved
                        </button>
                      )}
                    {signalData.status === 'resolved' &&
                      signalData.pillar === 'stakeholder' &&
                      !signalData?.signal_types.includes('opportunity') && (
                        <button
                          onClick={handleMarkAsUnresolved}
                          disabled={
                            signalData?.status !== 'resolved' ||
                            signalData?.signal_types.includes('opportunity') ||
                            pendingAction === 'intensity'
                          }
                          className={`text-xs text-[#202B37] font-medium py-2 px-3 border border-[#E4E7EC] rounded-[6px] ${
                            signalData?.status === 'resolved' &&
                            signalData.pillar === 'stakeholder' &&
                            !signalData?.signal_types.includes('opportunity') &&
                            pendingAction !== 'intensity'
                              ? 'cursor-pointer'
                              : 'cursor-not-allowed opacity-50'
                          }`}
                        >
                          Mark as unresolved
                        </button>
                      )}
                  </div>
                </div>
              </>
            )}
          </div>
          {/* Divider */}
          <div className="border-t border-[#E4E7EC] flex-shrink-0"></div>
          {signalData?.meta_data?.metric_id && isMetricLoading && (
            <>
              <ChartLoadingSkeleton />
              <div className="border-t border-[#E4E7EC] flex-shrink-0"></div>
            </>
          )}
          {signalMetricData?.l3_data?.length > 0 && (
            <>
              <div className="px-6 pt-6 flex-shrink-0">
                <Suspense fallback={<ChartLoadingSkeleton />}>
                  <LineChart
                    key={`signal-metric-chart-${
                      signalMetricData?.chartId || signalId
                    }`}
                    data={
                      signalMetricData?.l3_data?.map((data: any) => ({
                        ...data,
                        metric_value: formatNumber(data?.metric_value),
                      })) || []
                    }
                    metric_name={signalMetricData?.metric_name}
                    metric_display_str={signalMetricData?.metric_display_str}
                    unit={signalMetricData?.unit}
                    chartId={signalMetricData?.chartId}
                    target={signalMetricData?.target}
                    threshold={signalMetricData?.threshold}
                    filterType={signalMetricData?.status_aggregation_level}
                    status={signalMetricData?.status}
                    description={signalMetricData?.description}
                    chartMongoId={signalMetricData?._id}
                    height={240}
                    isChartOnInsight={true}
                    chartOnInsightType={'Opportunity'}
                  />
                </Suspense>
              </div>
              {/* <div className="border-t border-[#E4E7EC] flex-shrink-0"></div> */}
            </>
          )}
          <div className="h-fit flex-1 flex flex-col">
            <div className="px-6 flex-shrink-0">
              {/* Add Update Button */}
              {!showAddUpdate &&
                (signalData.status === 'open' || signalData.status === 'resolved') &&
                !signalData?.signal_types.includes('opportunity') && (
                  <button
                    onClick={() => {
                      if (isEditing) {
                        return;
                      }
                      setAddUpdateInitialValue(undefined);
                      setShowAddUpdate(true);
                    }}
                    className={`flex items-center gap-2 text-xs font-normal mt-6 ${
                      isEditing
                        ? 'text-[#A1A8B3] cursor-not-allowed'
                        : 'text-[#202B37] cursor-pointer'
                    }`}
                    disabled={isEditing}
                  >
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke={`${isEditing ? '#A1A8B3' : '#202B37'}`}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Add update
                  </button>
                )}
              {/* <div className='mt-1'> */}
              {/* Add Update Form with animation */}
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
                    <div className="mt-6 flex flex-col gap-[6px]">
                      {/* Contextual title for pending actions */}
                      {pendingAction === 'intensity' &&
                        pendingIntensityChange && (
                          <p className="text-[14px] text-[#344051] font-medium">
                            Changing intensity from{' '}
                            {pendingIntensityChange.from} to{' '}
                            {pendingIntensityChange.to}
                          </p>
                        )}
                      {pendingAction === 'resolved' && (
                        <p className="text-[14px] text-[#344051] font-medium">
                          Marking this signal as resolved
                        </p>
                      )}
                      {pendingAction === 'unresolved' && (
                        <p className="text-[14px] text-[#344051] font-medium">
                          Marking this signal as unresolved
                        </p>
                      )}
                      <AddUpdateForm
                        initialValue={addUpdateInitialValue}
                        placeholder="Add update details"
                        onSave={(value) => handleAddUpdate(value)}
                        onCancel={handleCancelUpdate}
                        submitButtonText="Add"
                        className=""
                        enableWithInitialValue={!!pendingAction}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              {/* </div> */}
            </div>
            {/* <div className='border-t border-[#F2F4F7]'></div> */}
            {/* Updates List */}
            {/* {!isEditing && ( */}
            <div className="h-fit flex-1 w-full scroll px-6 pb-6">
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
                <div className="text-center text-[#97A1AF] py-4">
                  No updates yet
                </div>
              )}
            </div>
          </div>
        </div>
        {isGuidanceSectionOpen && (
          <div
            className={`${'w-[590px] border-l-[1px] border-gray-200 h-[calc(100vh-3.8rem)]'}`}
          >
            {guidanceStatus === 'generating' && (
              <div className="flex flex-col items-center justify-center h-full p-8">
                <div className="relative mb-4">
                  <div className="w-8 h-8 border-4 border-blue-300 rounded-full animate-spin border-t-blue-500"></div>
                </div>
                <div className="text-gray-500 font-medium text-lg mb-2">
                  Thinking in progress
                </div>
                <div className="text-gray-400 text-sm text-center">
                  Generating personalized guidance for this signal
                </div>
              </div>
            )}
            {guidanceStatus === 'not_found' && (
              <div className="flex flex-col items-center justify-center h-full p-8">
                <div className="text-[#97A1AF] mb-4">
                  <svg
                    className="w-12 h-12"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="text-gray-500 font-medium text-lg mb-2">
                  Guidance not found
                </div>
                <div className="text-gray-400 text-sm text-center mb-4">
                  Unable to generate guidance at this time.
                </div>
                <button
                  onClick={retryGuidanceFetch}
                  className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  Retry
                </button>
              </div>
            )}
            {guidanceStatus === 'error' && (
              <div className="flex flex-col items-center justify-center h-full p-8">
                <div className="text-[#EF4444] mb-4">
                  <svg
                    className="w-12 h-12"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="text-gray-500 font-medium text-lg mb-2">
                  Error loading guidance
                </div>
                <div className="text-gray-400 text-sm text-center mb-4">
                  Something went wrong while fetching guidance.
                </div>
                <button
                  onClick={retryGuidanceFetch}
                  className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  Retry
                </button>
              </div>
            )}
            {(guidanceStatus === 'found' || guidanceStatus === 'idle') && (
              <Guidance
                data={guidance?.data}
                // insightDetails={insightDetails?.data}
                // setDummyvalue={0}
                setIsGuidaceSectionOpen={setIsGuidanceSectionOpen}
                setIsCollapsed={() => setIsGuidanceSectionOpen(false)}
                isLoading={guidanceLoading}
              />
            )}
          </div>
        )}
      </div>
    </SideDrawer>
  );
};

export default SignalDetails;
