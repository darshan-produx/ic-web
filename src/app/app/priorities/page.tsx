'use client';

import { useQuery } from '@tanstack/react-query';
import LandingSkeleton from './components/LandingSkeleton';
import {
  getAllPriorityTasks,
  getPrioritySignalsAndOpportunites,
} from '../../api/priorities/priorities';
import { apiRequest } from '../../../common/api-request';
import { useMemo, useState } from 'react';
import { formatRevenue } from '../../../common/SupportFunctions';
import { getportfolioTeam } from '../../api/my-team/my-team';
import { getMyTeamConfigs } from '../../api/customers/customers';
import { PriorityFeedCard } from './components/PriorityFeedCard';
import {
  Check, AlertTriangle, ChevronDown,
  TrendingDown, TrendingUp, RefreshCw, Users, Zap, PlusCircle,
} from 'lucide-react';
import dayjs from 'dayjs';
import OutlineButton from '../../../common/components/OutlineButton';
import { Dropdown } from '../../../common/Dropdown';
import SingleSelectDropDown from '../../../common/components/SingleSelectDropDown';

// ─── Injected styles (only the float-chip animation used by PriorityFeedCard) ──
const INJECTED_STYLES = `
@keyframes icFloatUp {
  0%   { opacity:1; transform:translate(-50%,-50%) scale(1); }
  55%  { opacity:1; transform:translate(-50%,calc(-50% - 48px)) scale(0.92); }
  100% { opacity:0; transform:translate(-50%,calc(-50% - 90px)) scale(0.78); }
}
.ic-float-chip { animation: icFloatUp 0.8s cubic-bezier(0.22,0.61,0.36,1) forwards; }
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatINR(v: number | null | undefined): string | null {
  if (!v) return null;
  if (v >= 10_000_000) return `₹${(v / 10_000_000).toFixed(1)}Cr`;
  if (v >= 100_000)    return `₹${(v / 100_000).toFixed(1)}L`;
  return `₹${v.toLocaleString('en-IN')}`;
}

// ─── Filters & sort ───────────────────────────────────────────────────────────
const VISIBLE_FILTERS = [
  { key: 'all',            label: 'All' },
  { key: 'at_risk',        label: 'Customers at risk' },
  { key: 'signal_pattern', label: 'Signal patterns' },
  { key: 'expansion',      label: 'Expansion' },
] as const;

const MORE_FILTERS = [
  { key: 'upcoming_renewal', label: 'Renewals' },
  { key: 'relationship',     label: 'Relationships' },
  { key: 'onboarding',       label: 'Onboarding' },
  { key: 'qbr_due',          label: 'QBR Due' },
  { key: 'escalation',       label: 'Escalation' },
  { key: 'low_health',       label: 'Low Health' },
] as const;

const ALL_FILTERS = [...VISIBLE_FILTERS, ...MORE_FILTERS];

const SORT_OPTIONS = [
  { key: 'smart',     label: 'Smart' },
  { key: 'newest',    label: 'Newest' },
  { key: 'arr',       label: 'ARR ↓' },
  { key: 'intensity', label: 'Intensity' },
] as const;

const IS = { urgent: 4, high: 3, medium: 2, low: 1 } as Record<string, number>;

function applySortOrder(items: any[], sortBy: string): any[] {
  const pinned = items.filter(i => i.is_pinned);
  const rest   = [...items.filter(i => !i.is_pinned)];
  const sorted = (() => {
    if (sortBy === 'arr')       return rest.sort((a,b) => (b.value_at_stake??0) - (a.value_at_stake??0));
    if (sortBy === 'newest')    return rest.sort((a,b) => new Date(b.signal_created_at??0).getTime() - new Date(a.signal_created_at??0).getTime());
    if (sortBy === 'intensity') return rest.sort((a,b) => (IS[b.intensity]??0) - (IS[a.intensity]??0));
    const sc = (i: any) => { let s=(IS[i.intensity]??1)*10; if(i.celebration_type) s+=55; if(i.value_at_stake) s+=Math.min(20,i.value_at_stake/2_500_000); return s; };
    return rest.sort((a,b) => sc(b) - sc(a));
  })();
  return [...pinned, ...sorted];
}

// ─── Category config ──────────────────────────────────────────────────────────
const CAT_CONFIG: Record<string, { label: string; color: string; bgLight: string; textColor: string; icon: React.ReactNode }> = {
  at_risk:          { label:'At risk',      color:'#EF4444', bgLight:'#FEF2F2', textColor:'#DC2626', icon:<TrendingDown className="w-3 h-3"/> },
  signal_pattern:   { label:'Pattern',      color:'#8B5CF6', bgLight:'#F5F3FF', textColor:'#7C3AED', icon:<Zap className="w-3 h-3"/> },
  upcoming_renewal: { label:'Renewal',      color:'#F59E0B', bgLight:'#FFFBEB', textColor:'#D97706', icon:<RefreshCw className="w-3 h-3"/> },
  relationship:     { label:'Relationship', color:'#10B981', bgLight:'#ECFDF5', textColor:'#059669', icon:<Users className="w-3 h-3"/> },
  expansion:        { label:'Expansion',    color:'#3B82F6', bgLight:'#EFF6FF', textColor:'#2563EB', icon:<TrendingUp className="w-3 h-3"/> },
};

// ─── Inline ActionableRow ─────────────────────────────────────────────────────
const AV_COLORS = ['#6366F1','#3B82F6','#10B981','#F59E0B','#EF4444','#8B5CF6'];
const avColor  = (n: string) => AV_COLORS[(n??'').split('').reduce((a,c) => a+c.charCodeAt(0),0) % AV_COLORS.length];
const initials = (n: string) => (n??'').split(' ').slice(0,2).map(w => w[0]?.toUpperCase()??'').join('');

function ActionableRow({ item, isNew }: { item: any; isNew?: boolean }) {
  const [done, setDone] = useState(
    ['Done','Completed','done','completed'].includes(item.status ?? '')
  );

  const rawDate    = item.planned_end_datetime ?? item.due_date ?? null;
  const endDate    = rawDate ? dayjs(rawDate) : null;
  const now        = dayjs();
  const isOverdue  = endDate && !done && endDate.isBefore(now);
  const delayDays  = isOverdue ? Math.max(1, now.diff(endDate, 'day')) : 0;
  const wasLate    = done && endDate && endDate.isBefore(now);
  const lateDays   = wasLate ? Math.max(1, now.diff(endDate, 'day')) : 0;
  const assigneeName: string = item.assigned_to?.name ?? item.assigned_to?.first_name ?? item.customer_name ?? '';

  return (
    <div className={`border rounded-[8px] bg-white px-4 py-3 flex items-center gap-3 transition-all duration-200 hover:shadow-sm ${isNew ? 'border-[#A7F3D0]' : 'border-[#E4E7EC]'}`}>
      {/* Circle checkbox */}
      <button
        onClick={() => setDone(d => !d)}
        className="flex-shrink-0 focus:outline-none"
        title={done ? 'Mark as incomplete' : 'Mark as complete'}>
        {done ? (
          <div className="w-[22px] h-[22px] rounded-full bg-[#10B981] border-2 border-[#10B981] flex items-center justify-center">
            <Check className="w-3 h-3 text-white" strokeWidth={2.5} />
          </div>
        ) : (
          <div className="w-[22px] h-[22px] rounded-full border-2 border-[#CED2DA] hover:border-[#97A1AF] transition-colors" />
        )}
      </button>

      {/* Title + meta */}
      <div className="flex-1 min-w-0">
        <p className={`text-[14px] font-medium leading-snug ${done ? 'text-[#97A1AF] line-through' : 'text-[#141C24]'}`}>
          {item.title || '(No title)'}
          {isNew && (
            <span className="ml-2 inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#ECFDF5] text-[#059669]">
              <Check className="w-2.5 h-2.5" /> New
            </span>
          )}
        </p>
        <div className="flex items-center flex-wrap gap-0 mt-1">
          {endDate && (
            <span className="text-[12px] text-[#637083]">
              {done ? `Completed: ${endDate.format('MMM D')}` : `Ends ${endDate.format('MMM D')}`}
            </span>
          )}
          {delayDays > 0 && !done && (
            <span className="ml-2 text-[12px] font-medium bg-[#FFFBEB] text-[#B45309] px-2 py-0.5 rounded-full border border-[#FDE68A]">
              {delayDays}d delay
            </span>
          )}
          {wasLate && lateDays > 0 && (
            <span className="ml-2 text-[12px] font-medium bg-[#FFFBEB] text-[#B45309] px-2 py-0.5 rounded-full border border-[#FDE68A]">
              {lateDays}d late
            </span>
          )}
          {assigneeName && (
            <>
              <span className="mx-2 text-[#CED2DA] select-none">|</span>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0"
                  style={{ background: avColor(assigneeName) }}>
                  {initials(assigneeName)}
                </div>
                <span className="text-[12px] text-[#637083]">{assigneeName}</span>
              </div>
            </>
          )}
          {item.status && (
            <>
              <span className="mx-2 text-[#CED2DA] select-none">|</span>
              <span className="text-[12px] text-[#637083]">{item.status}</span>
            </>
          )}
        </div>
      </div>

      {/* Overdue indicator */}
      {isOverdue && !done && (
        <AlertTriangle className="w-4 h-4 text-[#F59E0B] flex-shrink-0 opacity-70" />
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Priorities() {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [view,         setView]         = useState<'feed' | 'tasks'>('feed');
  const [sortBy,       setSortBy]       = useState<string>('smart');
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [pinnedIds,    setPinnedIds]    = useState<Set<string>>(new Set());
  const [createdTasks, setCreatedTasks] = useState<any[]>([]);
  const [addedIds,     setAddedIds]     = useState<Set<string>>(new Set());

  // ── Queries ──────────────────────────────────────────────────────────────────
  const { data: portfolioData } = useQuery({
    queryKey: ['getPriorityPortfolioTeamData'],
    queryFn: () => getportfolioTeam('year_to_date', true),
    refetchOnWindowFocus: false,
  });
  const { data: signalsData, isLoading: isSignalsLoading } = useQuery({
    queryKey: ['prioritiesSignalsAndOpportunitiesData'],
    queryFn: () => getPrioritySignalsAndOpportunites(),
    refetchOnWindowFocus: false,
  });
  const { data: tasksData } = useQuery({
    queryKey: ['prioritiesTaskstData'],
    queryFn: () => getAllPriorityTasks(),
    refetchOnWindowFocus: false,
  });
  const { data: userinfo } = useQuery({
    queryKey: ['userDetails'],
    queryFn: () => apiRequest({ url: '/api/app-service/v1/userinfo?is_email_encrypt=true' }),
  });
  const { data: myTeamConfigData } = useQuery({
    queryKey: ['myTeamConfigData'],
    queryFn: () => getMyTeamConfigs(),
    refetchOnWindowFocus: false,
  });

  // ── Portfolio (kept for data availability) ────────────────────────────────────
  const node = portfolioData?.data?.data?.[0];
  const sym  = node?.client_currency?.currency_symbol ?? '';
  const cur  = node?.client_currency?.currency ?? '';
  const agg  = node?.total_customer_details_aggregate ?? {};

  const myTeamConfig = useMemo(() => {
    if (myTeamConfigData?.data?.value) return myTeamConfigData.data.value;
    return {
      Accounts:       { enabled: true, display_name: 'Accounts' },
      ARR:            { enabled: true, display_name: 'ARR' },
      Renewals:       { enabled: true, display_name: 'Renewals' },
      Revenue:        { enabled: true, display_name: 'Revenue' },
      NRR:            { enabled: true, display_name: 'NRR' },
      Insights_acted: { enabled: true, display_name: 'Insights acted' },
      Tasks_done:     { enabled: true, display_name: 'Tasks done' },
      QBR:            { enabled: true, display_name: 'QBR' },
    };
  }, [myTeamConfigData?.data]);

  // Keep metricItems in scope (data fetched, not displayed in header per design)
  const _metricItems = useMemo(() => {
    const items: { label: string; value: string }[] = [];
    if (myTeamConfig?.Accounts?.enabled)       items.push({ label: myTeamConfig.Accounts.display_name,       value: String(agg?.accounts ?? '–') });
    if (myTeamConfig?.ARR?.enabled)            items.push({ label: myTeamConfig.ARR.display_name,            value: `${sym}${formatRevenue(agg?.arr, cur)}` });
    if (myTeamConfig?.Renewals?.enabled)       items.push({ label: myTeamConfig.Renewals.display_name,       value: `${agg?.renewed_accounts_actual ?? '–'}/${agg?.renewed_accounts_opportunity ?? '–'}` });
    if (myTeamConfig?.Revenue?.enabled)        items.push({ label: myTeamConfig.Revenue.display_name,        value: agg?.total_revenue ? `${sym}${formatRevenue(agg.total_revenue, cur)}` : `${sym}5.1K / ${sym}699` });
    if (myTeamConfig?.NRR?.enabled)            items.push({ label: myTeamConfig.NRR.display_name,            value: `${agg?.nrr ?? '–'}%` });
    if (myTeamConfig?.Insights_acted?.enabled) items.push({ label: myTeamConfig.Insights_acted.display_name, value: `${agg?.insights_acted ?? '–'}/${agg?.customer_total_insights ?? '–'}` });
    if (myTeamConfig?.Tasks_done?.enabled)     items.push({ label: myTeamConfig.Tasks_done.display_name,     value: `${agg?.tasks ?? '–'}/${agg?.customer_total_tasks ?? '–'}` });
    if (myTeamConfig?.QBR?.enabled)            items.push({ label: myTeamConfig.QBR.display_name,            value: String(agg?.qbr_count ?? 2) });
    return items;
  }, [myTeamConfig, agg, sym, cur]);

  // ── Feed ─────────────────────────────────────────────────────────────────────
  const rawItems: any[] = useMemo(() => signalsData?.data?.data?.items ?? [], [signalsData?.data?.data?.items]);

  const feedItems = useMemo(() => {
    const items = rawItems
      .filter((i: any) => !dismissedIds.has(i._id))
      .map((i: any) => ({ ...i, is_pinned: i.is_pinned || pinnedIds.has(i._id) }));
    return applySortOrder(items, sortBy);
  }, [rawItems, dismissedIds, pinnedIds, sortBy]);

  const filteredItems = useMemo(
    () => activeFilter === 'all' ? feedItems : feedItems.filter((i: any) => i.category === activeFilter),
    [feedItems, activeFilter]
  );

  const categoryCount = useMemo(() => {
    const c: Record<string, number> = { all: feedItems.length };
    feedItems.forEach((i: any) => { if (i.category) c[i.category] = (c[i.category] ?? 0) + 1; });
    return c;
  }, [feedItems]);

  const taskList: any[]     = tasksData?.data?.data ?? [];
  const totalTaskCount      = taskList.length + createdTasks.length;

  const activeMoreFilter = MORE_FILTERS.find(f => f.key === activeFilter);

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handlePin = (id: string) =>
    setPinnedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const handleDismiss = (id: string) =>
    setDismissedIds(prev => new Set([...prev, id]));

  const handleCreateTask = (item: any) => {
    if (addedIds.has(item._id)) return;
    setAddedIds(prev => new Set([...prev, item._id]));
    const task = {
      _id: `created_${item._id}`,
      title: item.title,
      customer_name: item.customer_name,
      due_date: dayjs().add(3, 'day').toISOString(),
      status: 'To Do',
    };
    setCreatedTasks(prev => [task, ...prev]);
  };

  const handleRemoveTask = (item: any) => {
    setAddedIds(prev => { const n = new Set(prev); n.delete(item._id); return n; });
    setCreatedTasks(prev => prev.filter(t => t._id !== `created_${item._id}`));
  };

  if (isSignalsLoading) {
    return (
      <div className="animate-pulse h-[calc(100vh-64px)] overflow-hidden">
        <LandingSkeleton />
      </div>
    );
  }

  const firstName  =
    userinfo?.data?.first_name ??
    (userinfo?.data?.name ? String(userinfo.data.name).split(' ')[0] : '') ?? '';
  const greeting   = getGreeting();
  const todayLabel = dayjs().format('ddd, MMM D').toUpperCase();
  const sortLabel  = SORT_OPTIONS.find(s => s.key === sortBy)?.label ?? 'Smart';

  return (
    <div className="h-[calc(100vh-64px)] overflow-y-auto bg-white">
      <style dangerouslySetInnerHTML={{ __html: INJECTED_STYLES }} />

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="max-w-[800px] mx-auto px-8 pt-8 pb-5">
        <p className="text-[11px] font-semibold text-[#97A1AF] tracking-widest uppercase mb-1">{todayLabel}</p>
        <h1 className="text-[22px] font-semibold text-[#141C24] leading-tight">
          {greeting}{firstName && `, ${firstName}`}.
        </h1>
      </div>

      {/* ── Sticky toolbar ──────────────────────────────────────────────── */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-[#E4E7EC]">
        <div className="max-w-[800px] mx-auto px-8 py-2 flex items-center gap-1.5">

          {/* Visible filter pills */}
          {VISIBLE_FILTERS.map(f => {
            const count    = categoryCount[f.key] ?? 0;
            const isActive = activeFilter === f.key;
            return (
              <OutlineButton
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                className={`gap-1.5 ${isActive ? '!bg-[#141C24] !text-white !border-[#141C24]' : 'hover:!bg-[#F2F4F7]'}`}
              >
                {f.label}
                {count > 0 && (
                  <span className={`text-[10px] font-semibold ${isActive ? 'text-white/60' : 'text-[#97A1AF]'}`}>
                    {count}
                  </span>
                )}
              </OutlineButton>
            );
          })}

          {/* More dropdown */}
          <Dropdown className="relative inline-flex">
            <Dropdown.Trigger
              className={`h-8 w-fit text-nowrap px-3 rounded-[8px] text-[12px] font-medium box-border flex items-center gap-1 border ${
                activeMoreFilter
                  ? 'bg-[#141C24] text-white border-[#141C24]'
                  : 'bg-white border-[#CED2DA] text-[#202B37] hover:bg-[#F2F4F7]'
              }`}
            >
              {activeMoreFilter ? activeMoreFilter.label : `More (${MORE_FILTERS.length})`}
              <ChevronDown className="w-3.5 h-3.5" />
            </Dropdown.Trigger>
            <Dropdown.Content
              placement="bottom-start"
              className="absolute z-[9999] top-full mt-1 left-0 bg-white border border-[#CED2DA] rounded-[8px] shadow-md py-1 min-w-[160px]"
            >
              {MORE_FILTERS.map(f => {
                const count    = categoryCount[f.key] ?? 0;
                const isActive = activeFilter === f.key;
                return (
                  <button
                    key={f.key}
                    onClick={() => setActiveFilter(f.key)}
                    className={`w-full text-left px-3 py-2 text-[12px] flex items-center justify-between gap-2 transition-colors rounded-[6px] close-dropdown ${
                      isActive ? 'bg-[#F2F4F7] text-[#141C24] font-medium' : 'text-[#344051] hover:bg-[#F2F4F7]'
                    }`}
                  >
                    <span>{f.label}</span>
                    {count > 0 && <span className="text-[10px] text-[#97A1AF]">{count}</span>}
                  </button>
                );
              })}
            </Dropdown.Content>
          </Dropdown>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Todo / Actionables button */}
          <OutlineButton
            onClick={() => setView(v => v === 'tasks' ? 'feed' : 'tasks')}
            className={`gap-1.5 ${view === 'tasks' ? '!bg-[#FFFBEB] !border-[#F59E0B] !text-[#B45309]' : 'hover:!bg-[#F2F4F7]'}`}
          >
            <span>Todo</span>
            {totalTaskCount > 0 && (
              <span className={`text-[10px] font-bold min-w-[16px] h-[16px] px-1 rounded-full flex items-center justify-center leading-none ${
                view === 'tasks' ? 'bg-[#F59E0B] text-white' : 'bg-[#F2F4F7] text-[#637083]'
              }`}>
                {totalTaskCount}
              </span>
            )}
          </OutlineButton>
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────────────────── */}
      <div className="max-w-[800px] mx-auto px-8 py-6">
        {view === 'feed' ? (
          <>
            {/* Count + sort bar */}
            <div className="flex items-center justify-between mb-5">
              <span className="text-[12px] text-[#97A1AF]">
                {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
              </span>
              <SingleSelectDropDown
                filteredArr={SORT_OPTIONS.map(o => ({ ...o, selected: o.key === sortBy }))}
                dataFieldToUseForSelection="label"
                typeOfData={`Sort by: ${sortLabel}`}
                handleSelection={(opt: any) => setSortBy(opt.key)}
                contentCss="!min-w-[160px]"
                triggerTextCss="w-[160px]"
              />
            </div>

            {filteredItems.length > 0 ? (
              <div className="flex flex-col gap-3">
                {filteredItems.map((item: any) => (
                  <PriorityFeedCard
                    key={item._id}
                    item={item}
                    onPin={() => handlePin(item._id)}
                    onDismiss={() => handleDismiss(item._id)}
                    onCreateTask={handleCreateTask}
                    onRemoveTask={handleRemoveTask}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 gap-3">
                <div className="w-12 h-12 rounded-full bg-[#F2F4F7] flex items-center justify-center text-xl">✓</div>
                <p className="text-[14px] font-medium text-[#637083]">No items in this category</p>
                <button onClick={() => setActiveFilter('all')} className="text-[12px] text-[#3B82F6] hover:underline">
                  View all
                </button>
              </div>
            )}
          </>
        ) : (
          /* ── Actionables view ─────────────────────────────────────── */
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[11px] font-bold text-[#344051] uppercase tracking-widest">Actionables</span>
              <span className="text-[11px] font-semibold text-[#97A1AF]">{createdTasks.length + taskList.length}</span>
            </div>

            {createdTasks.length === 0 && taskList.length === 0 ? (
              <p className="text-[12px] text-[#97A1AF] px-1">No actionables yet.</p>
            ) : (
              <div className="flex flex-col gap-2.5">
                {createdTasks.map(task => <ActionableRow key={task._id} item={task} isNew />)}
                {taskList.map((task: any) => <ActionableRow key={task._id} item={task} />)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
