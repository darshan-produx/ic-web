import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { Signal } from './signalCard';
import { JourneyFilter } from './journeyFilter';
import { getCustomerJourney } from '../../../../../app/api/customers/customers';
import { useUpdateEventInEventJourney } from '../../../../../services/mutations/customersMutations';
import { toast } from 'react-toastify';
import UploadTranscriptModal from '../../../communication/meetings/components/uploadTranscriptModal';
import { apiRequest } from '../../../../../common/api-request';
import { Skeleton } from '../../../../../common/components/Skeleton';
import SignalDetails from './signalDetails';
import PhaseChangeModal from './phaseChange';
import DeleteModal from '../../../../../common/components/DeleteModal';
import { useFilterPersistence } from '../filters/useFilterPersistence';
import FilterSidebar from '../filters/FilterSidebar';


export type SignalType =
  | 'phase_change'
  | 'meeting'
  | 'issue'
  | 'commitment'
  | 'expectation'
  | 'appreciation'
  | 'opportunity'
  | 'fact'
  | 'open'
  | 'resolved'
  | 'closed'
  | 'deleted'
  | '_divider_';

export interface JourneySignal {
  _id: string;
  customer_id: number;
  intensity: number;
  event_type: string;
  signal_types: SignalType[];
  status?: 'open' | 'closed' | 'resolved';
  title: string;
  description: string;
  source: string;
  createdBy?: string;
  created_at: string;
  updated_at: string;
  signal_updated_at: string;
  signal_created_at: string;
  collection_type?: string;
  updates: Array<{
    description: string;
    timestamp: string;
    source?: string;
    update_id: string;
    is_deleted?: boolean;
    created_by?: string;
    update_reference_ids?: string[];
  }>;
  meta_data: {
    reference_ids: string[];
    reference_collection: string;
    title_edited?: boolean;
    description_edited?: boolean;
    status_overriden_by_user?: boolean;
  };
  pillar: string;
  isEditable?: boolean;
  is_deleted?: boolean;
}

// Constants for pagination
const PAGE_SIZE = 20;
const SCROLL_THRESHOLD = 100;

export const Journey: React.FC<{
  customerId: number;
  customerName: string;
  customerCurrentPhase: string;
  usersList?: any[];
  stakeholdersList?: any[];
}> = ({ customerId, customerName, customerCurrentPhase, usersList = [], stakeholdersList = [] }) => {
  const [isSideDrawerOpen, setIsSideDrawerOpen] = useState(false);
  const [createEventType, setCreateEventType] = useState<{ label: string; value: string }>({ label: '', value: '' });
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedSignalId, setSelectedSignalId] = useState<string>('');
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false);

  // ── Filter persistence hook ───────────────────────────────────
  const filterHook = useFilterPersistence({
    context: 'journey',
    customerId,
    usersList,
    stakeholdersList,
  });

  const updateSignalMutation = useUpdateEventInEventJourney();
  const deleteToggle = () => {
    setDeleteModal(() => !deleteModal);
  };
  const handleDelete = async () => {
    try {
      const response = await updateSignalMutation.mutateAsync({ signalId: selectedSignalId, data: { is_deleted: true }, fromPage: 'journey' });
      if (response && response.status === 200) {
        toast.success('Signal deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting signal:', error);
    }
    setIsSideDrawerOpen(false);
    deleteToggle();
  }
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const lastScrollTime = useRef(0);
  const isFetchingRef = useRef(false);

  const { data: userinfo } = useQuery({
    queryKey: ['userDetails'],
    queryFn: () =>
      apiRequest({
        url: '/api/app-service/v1/userinfo?is_email_encrypt=true',
      }),
    refetchOnWindowFocus: false,
  });
  const CreateEventTypeOptions = [
    { label: 'Meeting', value: 'meeting' },
    { label: 'Phase change', value: 'phase_change' },
  ];

  // ── Derive sort value for timeline display ────────────────────
  const sortBy = useMemo(() => {
    const sel = filterHook.applied.sortBy.find((s) => s.selected);
    return (sel?.value === 'signal_created_at' ? 'signal_created_at' : 'signal_updated_at') as
      | 'signal_created_at'
      | 'signal_updated_at';
  }, [filterHook.applied.sortBy]);

  // ── Build query key from applied filters ──────────────────────
  const queryKey = useMemo(() => {
    const params = filterHook.getApiParams({ customer_id: Number(customerId) });
    const { skip, limit, ...keyParams } = params;
    return ['customerJourney', JSON.stringify(keyParams)];
  }, [filterHook, customerId]);

  const {
    data: customerJourneyData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch
  } = useInfiniteQuery({
    queryKey: queryKey,
    queryFn: async ({ pageParam = 0 }) => {
      const filterParams = filterHook.getApiParams({
        customer_id: Number(customerId),
        skip: pageParam * PAGE_SIZE,
        limit: PAGE_SIZE,
      });

      if (!filterParams.source?.length && !filterParams.signal_types?.length && !filterParams.is_deleted) {
        return {
          data: [],
          total: 0,
          skip: pageParam * PAGE_SIZE,
          limit: PAGE_SIZE,
          hasMore: false,
        };
      }

      try {
        const response = await getCustomerJourney(filterParams);
        const responseData = response.data;

        return {
          data: responseData?.data || [],
          total: responseData?.total || 0,
          skip: pageParam * PAGE_SIZE,
          limit: PAGE_SIZE,
          hasMore: (pageParam * PAGE_SIZE) + (responseData?.data?.length || 0) < (responseData?.total || 0),
        };
      } catch (error) {
        console.error('Error fetching customer journey:', error);
        throw error;
      }
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.hasMore) return undefined;
      return allPages.length;
    },
    refetchOnWindowFocus: false,
    enabled: !!customerId && isSideDrawerOpen === false,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const allSignals = useMemo(() => {
    const signals = customerJourneyData?.pages?.flatMap(page => page.data) || [];
    const uniqueSignals = signals.filter((signal: JourneySignal, index: number, self: JourneySignal[]) =>
      index === self.findIndex(s => s._id === signal._id)
    );
    return uniqueSignals;
  }, [customerJourneyData]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const now = Date.now();

    if (now - lastScrollTime.current < 100) return;
    lastScrollTime.current = now;

    if (isFetchingRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const scrollPosition = scrollHeight - scrollTop - clientHeight;

    if (scrollPosition <= SCROLL_THRESHOLD && hasNextPage && !isFetchingNextPage) {
      isFetchingRef.current = true;
      fetchNextPage().finally(() => {
        isFetchingRef.current = false;
      });
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Reset all filters to default state
  const handleResetFilters = useCallback(() => {
    filterHook.resetAllFilters();
  }, [filterHook]);

  return (
    <div className="flex flex-col">
      <div className="h-[72px]">
        <JourneyFilter
          searchText={filterHook.applied.searchText}
          setSearchText={filterHook.setSearchText}
          selectedSortBy={filterHook.applied.sortBy}
          setSelectedSortBy={filterHook.setSortBy}
          createEventType={createEventType}
          setCreateEventType={setCreateEventType}
          createEventTypeOptions={CreateEventTypeOptions}
          onResetFilters={handleResetFilters}
          isFiltersInDefaultState={filterHook.isAtDefaultState}
          onOpenFilterSidebar={() => setIsFilterSidebarOpen(true)}
        />
      </div>
      <div
        ref={scrollContainerRef}
        className="min-h-[calc(100vh-292px)] max-h-[calc(100vh-242px)] h-full flex flex-col gap-0 overflow-y-auto scroll-container w-full mx-auto mt-2"
        onScroll={handleScroll}
      >
        <div className="max-w-[692px] w-full mx-auto">
          <React.Fragment>
            {allSignals.map((signal: any, index: number) => (
              <Signal
                key={signal._id}
                signal={signal}
                sortBy={sortBy}
                setIsSideDrawerOpen={setIsSideDrawerOpen}
                setSelectedSignalId={setSelectedSignalId}
                showTimeline={true}
                showYearOnTimeline={index === allSignals.length - 1 || new Date(allSignals[index + 1][sortBy]).getFullYear() !== new Date(signal[sortBy]).getFullYear()}
              />
            ))}
          </React.Fragment>
        </div>
        {isFetchingNextPage && (
          <div className="flex justify-center py-4">
            <div className="text-gray-500">Loading more events...</div>
          </div>
        )}

        {!(allSignals.length > 0) && (<div className="mx-auto w-[283px] flex flex-col items-center justify-center">
          <Skeleton
          />
        </div>)}
      </div>
      {createEventType.value === 'meeting' ? (
        <UploadTranscriptModal
          uploadTransriptModalOpen={{
            meeting: {
              customer: {
                customer_id: Number(customerId),
                customer_name: customerName,
              }
            },
            isFromCustomerJourney: true,
            status: true,
            isEdit: false,
          }}
          setUploadTransriptModalOpen={() => {
            setCreateEventType({ label: '', value: '' });
          }}
          allCustomers={[]}
          userInfo={userinfo?.data}
        />
      ) : createEventType.value === 'phase_change' ? (
        <PhaseChangeModal
          show={true}
          onHide={() => setCreateEventType({ label: '', value: '' })}
          currentPhase={customerCurrentPhase}
          customerId={customerId}
        />
      ) : null}
      <SignalDetails
        isOpen={isSideDrawerOpen}
        onClose={() => {
          setIsSideDrawerOpen(false);
          setSelectedSignalId('');
        }}
        signalId={selectedSignalId}
        handleDelete={deleteToggle}
        userInfo={userinfo?.data}
        fromPage='journey'
      />

      <DeleteModal
        show={deleteModal}
        onHide={deleteToggle}
        onDelete={handleDelete}
        title={'signal'}
      />

      <FilterSidebar
        isOpen={isFilterSidebarOpen}
        onClose={() => setIsFilterSidebarOpen(false)}
        context="journey"
        appliedSidebar={filterHook.appliedSidebar}
        defaultSidebar={filterHook.getDefaultSidebar()}
        onApply={filterHook.applySidebarFilters}
      />
    </div>
  );
};