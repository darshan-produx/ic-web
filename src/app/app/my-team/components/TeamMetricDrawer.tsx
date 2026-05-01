'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PanelLeftOpen, Search } from 'lucide-react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { XIcon } from '../../../assests/icons/icons';
import { Signal } from '../../customers/[id]/journey/signalCard';
import SignalDetails from '../../customers/[id]/journey/signalDetails';
import OpportunityCard from '../../insights/opportunities/components/opportunityCard';
import CreateOpportunityModal from '../../insights/opportunities/components/createOpportunityModal';
import OpportunityDetailsSideBarView from '../../insights/opportunities/opportunityDetailsSideBarView';
import TaskCard from '../../tasks/taskCard';
import CreateNewTask from '../../tasks/createNewTask';
import Modal from '../../../../common/components/Modal';
import DeleteModal from '../../../../common/components/DeleteModal';
import { getCustomers } from '../../../api/customers/customers';
import { getUsersForTask } from '../../../api/users/users';
import { apiRequest } from '../../../../common/api-request';
import { getAllTasksStatus } from '../../../api/tasks/tasks';
import { useUpdateEventInEventJourney } from '../../../../services/mutations/customersMutations';
import {
  fetchMyTeamScopedOpportunities,
  fetchMyTeamScopedSignals,
  fetchMyTeamScopedTasks,
} from '../../../api/my-team/my-team';

const PAGE_SIZE = 30;

// ─── Public types ─────────────────────────────────────────────────────────────

export type TeamMetricKey = 'opportunities' | 'open_signals' | 'task';

type CommonProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  customerIds: number[];
  isScopeLoading?: boolean;
};

export type TeamMetricDrawerProps = CommonProps & {
  metricKey: TeamMetricKey | null;
};

// ─── Shared drawer shell ──────────────────────────────────────────────────────

type DrawerShellProps = {
  isOpen: boolean;
  onBackdropClick: () => void;
  /** Framer-motion animated panel width in px */
  panelWidth: number;
  /** px from right edge; shifts left when a detail pane is open */
  rightOffset: number;
  title: string;
  showCloseButton: boolean;
  onClose: () => void;
  /** When false, backdrop click and escape key are disabled */
  canClose?: boolean;
  searchText: string;
  onSearchChange: (v: string) => void;
  searchPlaceholder: string;
  actionSlot?: React.ReactNode;
  isLoading: boolean;
  loadingText: string;
  isEmpty: boolean;
  emptyText: string;
  /** List items rendered in the scroll area */
  children: React.ReactNode;
  /** When true, renders collapsedSlot instead of the normal panel body */
  isCollapsed?: boolean;
  /** Slot for the collapsed (icon-only) panel state (opportunities only) */
  collapsedSlot?: React.ReactNode;
  listRef?: React.RefObject<HTMLDivElement>;
  onListScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
  listFooter?: React.ReactNode;
};

const DrawerShell: React.FC<DrawerShellProps> = ({
  isOpen,
  onBackdropClick,
  panelWidth,
  rightOffset,
  title,
  showCloseButton,
  onClose,
  canClose = true,
  searchText,
  onSearchChange,
  searchPlaceholder,
  actionSlot,
  isLoading,
  loadingText,
  isEmpty,
  emptyText,
  children,
  isCollapsed = false,
  collapsedSlot,
  listRef,
  onListScroll,
  listFooter,
}) => {
  // Escape key support
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && canClose) onClose();
    };
    document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  }, [isOpen, onClose, canClose]);

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="metric-drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="fixed inset-0 bg-black/50"
            style={{ zIndex: 1049 }}
            onClick={() => canClose && onBackdropClick()}
          />

          {/* Panel */}
          <motion.div
            key="metric-drawer-panel"
            initial={{ x: '100%', opacity: 0.8 }}
            animate={{ x: 0, opacity: 1, width: panelWidth }}
            exit={{ x: '100%', opacity: 0.8 }}
            transition={{ type: 'tween', duration: 0.24, ease: [0.32, 0.72, 0, 1] }}
            className="fixed top-0 bottom-0 overflow-hidden rounded-l-[12px] bg-white"
            style={{ zIndex: 1050, right: `${rightOffset}px` }}
          >
            {isCollapsed && collapsedSlot ? (
              collapsedSlot
            ) : (
              <>
                {/* Header */}
                <div className="flex h-[56px] items-center justify-between border-b border-gray-200 box-border p-4">
                  <div className="min-w-0 flex-1 overflow-hidden">
                    <p className="m-0 truncate text-[16px] font-normal text-[#202B37]">{title}</p>
                  </div>
                  {showCloseButton && (
                    <button
                      type="button"
                      onClick={onClose}
                      className="ml-2 flex-shrink-0 rounded-md p-1 text-[#202B37] transition-colors"
                    >
                      <XIcon className="text-[#97A1AF]" stroke="#97A1AF" />
                    </button>
                  )}
                </div>

                {/* Body */}
                <div className="flex h-[calc(100vh-56px)] flex-col">
                  {/* Search */}
                  <div className="border-b border-[#E4E7EC] px-6 py-4">
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#97A1AF]" />
                      <input
                        value={searchText}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder={searchPlaceholder}
                        className="h-10 w-full rounded-[10px] border border-[#E4E7EC] bg-white pl-9 pr-3 text-[13px] text-[#202B37] outline-none placeholder:text-[#97A1AF] focus:border-[#60A5FA]"
                      />
                    </div>
                  </div>

                  {actionSlot && (
                    <div className="px-6 py-3">
                      {actionSlot}
                    </div>
                  )}

                  {/* List */}
                  <div
                    ref={listRef}
                    onScroll={onListScroll}
                    className="flex-1 overflow-y-auto px-6 py-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                  >
                    {isLoading ? (
                      <div className="py-10 text-center text-sm text-[#637083]">{loadingText}</div>
                    ) : isEmpty ? (
                      <div className="py-10 text-center text-sm text-[#637083]">{emptyText}</div>
                    ) : (
                      <div className="flex flex-col gap-4">{children}</div>
                    )}
                    {listFooter}
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// ─── Opportunities pane ───────────────────────────────────────────────────────

const OpportunitiesPane: React.FC<CommonProps> = ({
  isOpen,
  onClose,
  title,
  customerIds,
  isScopeLoading = false,
}) => {
  const [searchText, setSearchText] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [createOpportunityModal, setCreateOpportunityModal] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isAuxPaneOpen, setIsAuxPaneOpen] = useState(false);
  const [suppressUntil, setSuppressUntil] = useState(0);

  const isDetailOpen = !!selectedId;
  const isCombined = isOpen && isDetailOpen;
  const detailOffset = isAuxPaneOpen ? 1237 : 800;

  const listRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['team-opportunities', customerIds],
    queryFn: ({ pageParam }) =>
      fetchMyTeamScopedOpportunities(customerIds, pageParam as number, PAGE_SIZE),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage?.data?.pagination?.has_next_page ? allPages.length + 1 : undefined,
    enabled: isOpen && !isScopeLoading && customerIds.length > 0,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 5 * 60 * 1000,
  });

  const all: any[] = useMemo(
    () =>
      (data?.pages ?? []).flatMap((page: any) =>
        Array.isArray(page?.data?.data) ? page.data.data : [],
      ),
    [data],
  );

  const handleListScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const el = e.currentTarget;
      if (!hasNextPage || isFetchingNextPage) return;
      if (el.scrollHeight - el.scrollTop - el.clientHeight < 150) {
        void fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage],
  );
  const filtered = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return all;
    return all.filter((o) =>
      [o?.title, o?.insight_name, o?.customer_name, o?.action_sub_status]
        .filter(Boolean)
        .map((v) => String(v).toLowerCase())
        .some((v) => v.includes(q)),
    );
  }, [all, searchText]);

  const handleClose = () => {
    setSearchText('');
    setSelectedId('');
    setIsCollapsed(false);
    setIsAuxPaneOpen(false);
    onClose();
  };

  const closeAuxPane = () => {
    const container = document.querySelector('.team-opportunity-detail-drawer');
    if (!container) return;
    (Array.from(container.querySelectorAll('button, span')) as HTMLElement[])
      .filter((n) => n.textContent?.trim().toLowerCase() === 'close')
      .forEach((n) => n.click());
  };

  // Auto-collapse list when guidance pane opens
  useEffect(() => {
    if (!isDetailOpen) { setIsCollapsed(false); setIsAuxPaneOpen(false); return; }
    if (isAuxPaneOpen && Date.now() >= suppressUntil) setIsCollapsed(true);
  }, [isAuxPaneOpen, isDetailOpen, suppressUntil]);

  // Track detail drawer width via ResizeObserver
  useEffect(() => {
    if (!isDetailOpen) return;
    const el = document.querySelector(
      '.team-opportunity-detail-drawer .fixed.bg-white',
    ) as HTMLElement | null;
    if (!el) { setIsAuxPaneOpen(false); return; }
    const update = () => setIsAuxPaneOpen(el.getBoundingClientRect().width > 1000);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [isDetailOpen]);

  return (
    <>
      <DrawerShell
        isOpen={isOpen}
        onBackdropClick={() => !isCombined && handleClose()}
        panelWidth={isCollapsed ? 48 : 481}
        rightOffset={isCombined ? detailOffset : 0}
        title={title}
        showCloseButton={!isCombined}
        onClose={handleClose}
        searchText={searchText}
        onSearchChange={setSearchText}
        searchPlaceholder="Search opportunity"
        actionSlot={
          <span
            className="pt-[2px] text-[14px] text-[#3B82F6] cursor-pointer"
            onClick={() => setCreateOpportunityModal(true)}
          >
            <span className="text-[18px]">+</span> &nbsp;Create new
          </span>
        }
        isLoading={isScopeLoading || isLoading}
        loadingText="Loading opportunities..."
        isEmpty={filtered.length === 0}
        emptyText="No active opportunities found"
        listRef={listRef}
        onListScroll={handleListScroll}
        listFooter={
          isFetchingNextPage ? (
            <div className="py-4 text-center text-sm text-[#637083]">Loading more...</div>
          ) : undefined
        }
        isCollapsed={isCollapsed}
        collapsedSlot={
          <div className="flex h-full flex-col items-center justify-start border-r border-[#E4E7EC] pt-3">
            <button
              type="button"
              onClick={() => {
                setSuppressUntil(Date.now() + 900);
                setIsCollapsed(false);
                closeAuxPane();
                setIsAuxPaneOpen(false);
              }}
              className="group flex h-8 w-8 items-center justify-center rounded-[10px] border border-[#D0D5DD] bg-white text-[#344051] shadow-sm transition-all hover:border-[#98A2B3] hover:shadow"
              aria-label="Open opportunities panel"
            >
              <PanelLeftOpen className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
            </button>
          </div>
        }
      >
        <div className="team-opportunity-drawer-list -mx-6 flex flex-col gap-4">
          {filtered.map((o: any) => (
            <div
              key={o._id}
              className="team-opportunity-drawer-card mx-[24px] h-[140px] w-[426px] cursor-pointer"
              onClick={() => setSelectedId(o._id)}
            >
              <OpportunityCard ele={o} />
            </div>
          ))}
        </div>
      </DrawerShell>

      {/* Detail pane */}
      <div className="team-opportunity-detail-drawer">
        <style jsx global>{`
          .team-opportunity-drawer-card > div {
            width: 100%;
            height: 100%;
            margin: 0 !important;
            gap: 3px !important;
            padding: 16px;
            border: 1px solid #E4E7EC;
            border-radius: 12px;
            box-sizing: border-box;
            overflow: hidden;
          }

          .team-opportunity-detail-drawer .bg-black\/50 { display: none !important; }
          .team-opportunity-detail-drawer div[class*='rounded-l-'] {
            border-top-left-radius: 0 !important;
            border-bottom-left-radius: 0 !important;
          }
        `}</style>
        {isDetailOpen && (
          <OpportunityDetailsSideBarView
            isOpen={isDetailOpen}
            onClose={handleClose}
            selectedOpportunityId={selectedId}
          />
        )}
      </div>

      {/* Seam line */}
      {isCombined && !isCollapsed && (
        <div
          className="pointer-events-none fixed top-0 bottom-0 z-[1055] w-px bg-[#E4E7EC]"
          style={{ right: `${detailOffset}px` }}
        />
      )}

      {!!createOpportunityModal && (
        <div className="fixed inset-0 z-[1060]">
          <CreateOpportunityModal
            createOpportunityModal={createOpportunityModal}
            setCreateOpportunityModal={setCreateOpportunityModal}
            customerId={customerIds.length === 1 ? Number(customerIds[0]) : undefined}
          />
        </div>
      )}
    </>
  );
};

// ─── Signals pane ─────────────────────────────────────────────────────────────

const SignalsPane: React.FC<CommonProps> = ({
  isOpen,
  onClose,
  title,
  customerIds,
  isScopeLoading = false,
}) => {
  const [searchText, setSearchText] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [isAuxPaneOpen, setIsAuxPaneOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);

  const isDetailOpen = !!selectedId;
  const detailOffset = isAuxPaneOpen ? 1210 : 620;
  const updateSignalMutation = useUpdateEventInEventJourney();

  const listRef = useRef<HTMLDivElement>(null);

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['team-signals', customerIds],
    queryFn: ({ pageParam }) =>
      fetchMyTeamScopedSignals(customerIds, pageParam as number, PAGE_SIZE),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage?.data?.pagination?.has_next_page ? allPages.length + 1 : undefined,
    enabled: isOpen && !isScopeLoading && customerIds.length > 0,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 5 * 60 * 1000,
  });

  const { data: userinfo } = useQuery({
    queryKey: ['userDetails'],
    queryFn: () =>
      apiRequest({
        url: '/api/app-service/v1/userinfo?is_email_encrypt=true',
      }),
    enabled: isOpen,
    refetchOnWindowFocus: false,
  });

  const safeUserInfo = useMemo(() => {
    const raw = userinfo?.data || userinfo || {};
    const firstName = raw?.first_name || raw?.firstname || raw?.name || 'User';
    const lastName = raw?.last_name || raw?.lastname || '';
    return { ...raw, first_name: firstName, last_name: lastName };
  }, [userinfo]);

  const all: any[] = useMemo(
    () =>
      (data?.pages ?? []).flatMap((page: any) =>
        Array.isArray(page?.data?.data) ? page.data.data : [],
      ),
    [data],
  );

  const handleListScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const el = e.currentTarget;
      if (!hasNextPage || isFetchingNextPage) return;
      if (el.scrollHeight - el.scrollTop - el.clientHeight < 150) {
        void fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage],
  );

  const filtered = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return all;
    return all.filter((s) =>
      [s?.title, s?.description, ...(Array.isArray(s?.signal_types) ? s.signal_types : [])]
        .filter(Boolean)
        .map((v) => String(v).toLowerCase())
        .some((v) => v.includes(q)),
    );
  }, [all, searchText]);

  const handleClose = () => {
    setSearchText('');
    setSelectedId('');
    setIsAuxPaneOpen(false);
    setDeleteModal(false);
    onClose();
  };

  const deleteToggle = () => {
    setDeleteModal((prev) => !prev);
  };

  const handleDeleteSignal = async () => {
    if (!selectedId) return;
    try {
      const response = await updateSignalMutation.mutateAsync({
        signalId: selectedId,
        data: { is_deleted: true },
        fromPage: 'my-team',
      });
      if (response && response.status === 200) {
        toast.success('Signal deleted successfully');
      }
      setSelectedId('');
      setIsAuxPaneOpen(false);
      setDeleteModal(false);
      refetch();
    } catch (error) {
      console.error('Error deleting signal:', error);
      toast.error('Failed to delete signal');
    }
  };

  // Track detail drawer width via ResizeObserver
  useEffect(() => {
    if (!isDetailOpen) { setIsAuxPaneOpen(false); return; }
    const el = document.querySelector(
      '.team-signal-detail-drawer .fixed.bg-white',
    ) as HTMLElement | null;
    if (!el) { setIsAuxPaneOpen(false); return; }
    const update = () => setIsAuxPaneOpen(el.getBoundingClientRect().width > 1000);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [isDetailOpen]);

  return (
    <>
      <DrawerShell
        isOpen={isOpen}
        onBackdropClick={() => !isDetailOpen && handleClose()}
        panelWidth={474}
        rightOffset={isDetailOpen ? detailOffset : 0}
        title={title}
        showCloseButton={!isDetailOpen}
        onClose={handleClose}
        searchText={searchText}
        onSearchChange={setSearchText}
        searchPlaceholder="Search issues"
        isLoading={isScopeLoading || isLoading}
        loadingText="Loading open issues..."
        isEmpty={filtered.length === 0}
        emptyText="No open issues found"
        listRef={listRef}
        onListScroll={handleListScroll}
        listFooter={
          isFetchingNextPage ? (
            <div className="py-4 text-center text-sm text-[#637083]">Loading more...</div>
          ) : undefined
        }
      >
        {filtered.map((s: any) => (
          <div key={s._id} className="mx-auto w-full max-w-[426px]">
            <Signal
              signal={s}
              setIsSideDrawerOpen={() => undefined}
              setSelectedSignalId={setSelectedId}
              showTimeline={false}
            />
          </div>
        ))}
      </DrawerShell>

      {/* Detail pane */}
      <div className="team-signal-detail-drawer">
        <style jsx global>{`
          .team-signal-detail-drawer .bg-black\/50 { display: none !important; }
          .team-signal-detail-drawer div[class*='rounded-l-'] {
            border-top-left-radius: 0 !important;
            border-bottom-left-radius: 0 !important;
          }
        `}</style>
        {isDetailOpen && (
          <SignalDetails
            isOpen={isDetailOpen}
            onClose={handleClose}
            signalId={selectedId}
            handleDelete={deleteToggle}
            userInfo={safeUserInfo}
            fromPage="my-team"
          />
        )}
      </div>

      <div className="team-metric-signal-delete-modal">
        <style jsx global>{`
          .team-metric-signal-delete-modal #deleteModal {
            z-index: 1072 !important;
          }
          .team-metric-signal-delete-modal #backDropDiv {
            z-index: 1071 !important;
          }
        `}</style>
        <DeleteModal
          show={deleteModal}
          onHide={deleteToggle}
          onDelete={handleDeleteSignal}
          title={'signal'}
        />
      </div>

      {/* Seam line */}
      {isDetailOpen && (
        <div
          className="pointer-events-none fixed top-0 bottom-0 z-[1055] w-px bg-[#E4E7EC]"
          style={{ right: `${detailOffset}px` }}
        />
      )}
    </>
  );
};

// ─── Tasks pane ───────────────────────────────────────────────────────────────

const TasksPane: React.FC<CommonProps> = ({
  isOpen,
  onClose,
  title,
  customerIds,
  isScopeLoading = false,
}) => {
  const [searchText, setSearchText] = useState('');
  const [openTaskModalState, setOpenTaskModalState] = useState<Record<string, boolean>>({});
  const [createTaskModalOpen, setCreateTaskModalOpen] = useState(false);

  const listRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['team-tasks', customerIds],
    queryFn: ({ pageParam }) =>
      fetchMyTeamScopedTasks(customerIds, pageParam as number, PAGE_SIZE),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage?.data?.pagination?.has_next_page ? allPages.length + 1 : undefined,
    enabled: isOpen && !isScopeLoading && customerIds.length > 0,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 5 * 60 * 1000,
  });

  const { data: allCustomers } = useQuery({
    queryKey: ['allCustomers'],
    queryFn: getCustomers,
    enabled: createTaskModalOpen,
    refetchOnWindowFocus: false,
  });

  const { data: existingUsers } = useQuery({
    queryKey: ['users'],
    queryFn: getUsersForTask,
    enabled: createTaskModalOpen,
    refetchOnWindowFocus: false,
  });

  const { data: userinfo } = useQuery({
    queryKey: ['userDetails'],
    queryFn: () =>
      apiRequest({
        url: '/api/app-service/v1/userinfo?is_email_encrypt=true',
      }),
    enabled: createTaskModalOpen,
    refetchOnWindowFocus: false,
  });

  const { data: statusArr } = useQuery({
    queryKey: ['statusArr'],
    queryFn: () => getAllTasksStatus(),
    enabled: createTaskModalOpen,
    refetchOnWindowFocus: false,
  });

  const all: any[] = useMemo(
    () =>
      (data?.pages ?? []).flatMap((page: any) =>
        Array.isArray(page?.data?.data) ? page.data.data : [],
      ),
    [data],
  );

  const handleListScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const el = e.currentTarget;
      if (!hasNextPage || isFetchingNextPage) return;
      if (el.scrollHeight - el.scrollTop - el.clientHeight < 150) {
        void fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage],
  );

  const filtered = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return all;
    return all.filter((t) => {
      const assignee = [t?.assignee_id?.first_name, t?.assignee_id?.last_name]
        .filter(Boolean)
        .join(' ');
      return [t?.title, t?.account, assignee, t?.notes]
        .filter(Boolean)
        .map((v) => String(v).toLowerCase())
        .some((v) => v.includes(q));
    });
  }, [all, searchText]);

  const hasOpenModal = useMemo(
    () => Object.values(openTaskModalState).some(Boolean),
    [openTaskModalState],
  );

  const handleClose = () => {
    setSearchText('');
    onClose();
  };

  return (
    <>
      <DrawerShell
        isOpen={isOpen}
        onBackdropClick={handleClose}
        panelWidth={474}
        rightOffset={0}
        title={title}
        showCloseButton={!hasOpenModal}
        onClose={handleClose}
        canClose={!hasOpenModal}
        searchText={searchText}
        onSearchChange={setSearchText}
        searchPlaceholder="Search tasks"
        actionSlot={
          <span
            className="pt-[2px] text-[14px] text-[#3B82F6] cursor-pointer"
            onClick={() => setCreateTaskModalOpen(true)}
          >
            <span className="text-[18px]">+</span> &nbsp;Create new
          </span>
        }
        isLoading={isScopeLoading || isLoading}
        loadingText="Loading tasks..."
        isEmpty={filtered.length === 0}
        emptyText="No open tasks found"
        listRef={listRef}
        onListScroll={handleListScroll}
        listFooter={
          isFetchingNextPage ? (
            <div className="py-4 text-center text-sm text-[#637083]">Loading more...</div>
          ) : undefined
        }
      >
        {filtered.map((t: any) => (
          <div key={t._id} className="mx-auto w-full max-w-[426px]">
            <TaskCard
              ele={t}
              done={t?.is_completed}
              teamDrawer
              onDetailModalVisibilityChange={(open: boolean) =>
                setOpenTaskModalState((prev) => ({ ...prev, [t._id]: open }))
              }
            />
          </div>
        ))}
      </DrawerShell>

      <div className={createTaskModalOpen ? 'fixed inset-0 z-[1060]' : ''}>
        <Modal
          show={createTaskModalOpen}
          onHide={() => setCreateTaskModalOpen(false)}
          id="defaultModal"
          modal-center="true"
          className="fixed flex flex-col transition-all duration-300 ease-in-out left-2/4 z-drawer -translate-x-2/4 -translate-y-2/4"
          dialogClassName="w-screen md:w-[750px] bg-white shadow rounded-md dark:bg-zink-600"
        >
        <Modal.Body className="max-h-[calc(theme('height.screen')_-_61px)] p-4 overflow-y-auto barScroll">
          {createTaskModalOpen && (
            <CreateNewTask
              onHide={() => setCreateTaskModalOpen(false)}
              allCustomers={allCustomers}
              existingUsers={existingUsers?.data?.data}
              statusArr={statusArr?.data?.data}
              userDetails={userinfo?.data}
              isEditMode={false}
              customerId={customerIds.length === 1 ? customerIds[0] : undefined}
            />
          )}
        </Modal.Body>
      </Modal>
      </div>
    </>
  );
};

// ─── Unified public component ─────────────────────────────────────────────────
//
// Renders all three panes simultaneously (just like having them mounted in
// page.tsx) so AnimatePresence exit animations fire correctly when switching
// or closing. Each pane's `isOpen` drives its own AnimatePresence.

const TeamMetricDrawer: React.FC<TeamMetricDrawerProps> = ({
  metricKey,
  isOpen,
  onClose,
  title,
  customerIds,
  isScopeLoading,
}) => (
  <>
    <OpportunitiesPane
      isOpen={isOpen && metricKey === 'opportunities'}
      onClose={onClose}
      title={title}
      customerIds={customerIds}
      isScopeLoading={isScopeLoading}
    />
    <SignalsPane
      isOpen={isOpen && metricKey === 'open_signals'}
      onClose={onClose}
      title={title}
      customerIds={customerIds}
      isScopeLoading={isScopeLoading}
    />
    <TasksPane
      isOpen={isOpen && metricKey === 'task'}
      onClose={onClose}
      title={title}
      customerIds={customerIds}
      isScopeLoading={isScopeLoading}
    />
  </>
);

export default TeamMetricDrawer;
