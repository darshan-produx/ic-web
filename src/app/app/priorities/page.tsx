'use client';

import { useQuery } from '@tanstack/react-query';
import LandingSkeleton from './components/LandingSkeleton';
import {
  getAllPriorityTasks,
  getPrioritySignalsAndOpportunites,
} from '../../api/priorities/priorities';
import { apiRequest } from '../../../common/api-request';
import { useMemo, useState, useRef, useEffect } from 'react';
import { formatRevenue } from '../../../common/SupportFunctions';
import { getportfolioTeam } from '../../api/my-team/my-team';
import { getMyTeamConfigs } from '../../api/customers/customers';
import { PriorityFeedCard } from './components/PriorityFeedCard';
import {
  CheckSquare, Check, ArrowUpDown, AlertTriangle,
  TrendingDown, TrendingUp, RefreshCw, Users, Zap, PlusCircle,
} from 'lucide-react';
import dayjs from 'dayjs';

// ─── Injected styles ──────────────────────────────────────────────────────────
const INJECTED_STYLES = `
@keyframes gradientDrift {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
.animated-header-bg {
  background: linear-gradient(-45deg,#FFF6F6,#FFF0F5,#F7F0FF,#F0F5FF,#FFF9F0,#FFF6F6);
  background-size: 400% 400%;
  animation: gradientDrift 18s ease infinite;
}
@keyframes icFloatUp {
  0%   { opacity:1; transform:translate(-50%,-50%) scale(1); }
  55%  { opacity:1; transform:translate(-50%,calc(-50% - 48px)) scale(0.92); }
  100% { opacity:0; transform:translate(-50%,calc(-50% - 90px)) scale(0.78); }
}
.ic-float-chip { animation: icFloatUp 0.8s cubic-bezier(0.22,0.61,0.36,1) forwards; }
.sg-dash-border {
  border: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25'%3e%3crect width='100%25' height='100%25' fill='none' rx='16' ry='16' stroke='%23C1C9D4' stroke-width='1.5' stroke-dasharray='12 7'/%3e%3c/svg%3e");
}
.sg-dash-border:hover {
  background-image: none;
}
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}
function getBlobColors(): [string, string] {
  const h = new Date().getHours();
  if (h < 12) return ['rgba(251,146,60,0.20)','rgba(253,224,71,0.15)'];
  if (h < 17) return ['rgba(99,102,241,0.16)','rgba(59,130,246,0.13)'];
  return ['rgba(139,92,246,0.18)','rgba(236,72,153,0.13)'];
}
function formatINR(v: number | null | undefined): string | null {
  if (!v) return null;
  if (v >= 10_000_000) return `₹${(v / 10_000_000).toFixed(1)}Cr`;
  if (v >= 100_000)    return `₹${(v / 100_000).toFixed(1)}L`;
  return `₹${v.toLocaleString('en-IN')}`;
}

// ─── Filters & sort ───────────────────────────────────────────────────────────
const FEED_FILTERS = [
  { key: 'all',              label: 'All' },
  { key: 'at_risk',          label: 'At risk' },
  { key: 'signal_pattern',   label: 'Patterns' },
  { key: 'upcoming_renewal', label: 'Renewals' },
  { key: 'relationship',     label: 'Relationships' },
  { key: 'expansion',        label: 'Expansion' },
] as const;
const SORT_OPTIONS = [
  { key: 'smart',     label: 'Smart' },
  { key: 'arr',       label: 'ARR ↓' },
  { key: 'newest',    label: 'Newest' },
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

// ─── Category config (for suggestion card) ───────────────────────────────────
const CAT_CONFIG: Record<string, { label: string; color: string; bgLight: string; textColor: string; icon: React.ReactNode }> = {
  at_risk:          { label:'At risk',      color:'#EF4444', bgLight:'#FEF2F2', textColor:'#DC2626', icon:<TrendingDown className="w-3 h-3"/> },
  signal_pattern:   { label:'Pattern',      color:'#8B5CF6', bgLight:'#F5F3FF', textColor:'#7C3AED', icon:<Zap className="w-3 h-3"/> },
  upcoming_renewal: { label:'Renewal',      color:'#F59E0B', bgLight:'#FFFBEB', textColor:'#D97706', icon:<RefreshCw className="w-3 h-3"/> },
  relationship:     { label:'Relationship', color:'#10B981', bgLight:'#ECFDF5', textColor:'#059669', icon:<Users className="w-3 h-3"/> },
  expansion:        { label:'Expansion',    color:'#3B82F6', bgLight:'#EFF6FF', textColor:'#2563EB', icon:<TrendingUp className="w-3 h-3"/> },
};

// ─── Task card ────────────────────────────────────────────────────────────────
const AV_COLORS = ['#6366F1','#3B82F6','#10B981','#F59E0B','#EF4444','#8B5CF6'];
const avColor  = (n: string) => AV_COLORS[(n??'').split('').reduce((a,c) => a+c.charCodeAt(0),0) % AV_COLORS.length];
const initials = (n: string) => (n??'').split(' ').slice(0,2).map(w => w[0]?.toUpperCase()??'').join('');

function TaskCard({ item, isNew }: { item: any; isNew?: boolean }) {
  const [done, setDone] = useState(
    ['Done','Completed','done','completed'].includes(item.status ?? '')
  );

  const rawDate   = item.planned_end_datetime ?? item.due_date ?? null;
  const endDate   = rawDate ? dayjs(rawDate) : null;
  const now       = dayjs();
  const isOverdue = endDate && !done && endDate.isBefore(now);
  const delayDays = isOverdue ? Math.max(1, now.diff(endDate, 'day')) : 0;
  const wasLate   = done && endDate && endDate.isBefore(now);
  const lateDays  = wasLate ? Math.max(1, now.diff(endDate, 'day')) : 0;
  const assigneeName: string = item.assigned_to?.name ?? item.assigned_to?.first_name ?? item.customer_name ?? '';

  return (
    <div className={`bg-white rounded-xl transition-all duration-200
      border ${isNew ? 'border-[#86EFAC]' : 'border-[#E4E7EC]'}
      hover:shadow-[0_2px_8px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.07)]
      hover:border-transparent px-5 py-4`}>
      <div className="flex items-start gap-3.5">

        {/* Circle checkbox */}
        <button
          onClick={() => setDone(d => !d)}
          className="flex-shrink-0 mt-0.5 focus:outline-none group/cb"
          title={done ? 'Mark as incomplete' : 'Mark as complete'}>
          {done ? (
            <div className="w-[22px] h-[22px] rounded-full bg-[#10B981] border-2 border-[#10B981] flex items-center justify-center transition-colors">
              <Check className="w-3 h-3 text-white" strokeWidth={2.5} />
            </div>
          ) : (
            <div className="w-[22px] h-[22px] rounded-full border-2 border-[#D1D5DB] group-hover/cb:border-[#9CA3AF] transition-colors" />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className={`text-[15px] font-semibold leading-snug transition-colors ${done ? 'text-[#9CA3AF] line-through decoration-[#C4C9D0]' : 'text-[#1A2330]'}`}>
              {item.title || '(No title)'}
            </p>
            {isNew && (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#ECFDF5] text-[#059669] flex-shrink-0">
                <Check className="w-2.5 h-2.5" /> New
              </span>
            )}
          </div>

          <div className="flex items-center flex-wrap gap-0 mt-1.5">
            {endDate && (
              <span className="text-[13px] text-[#637083]">
                {done ? `Completed on: ${endDate.format('MMM D')}` : `Ends ${endDate.format('MMM D')}`}
              </span>
            )}
            {delayDays > 0 && !done && (
              <span className="ml-2 text-[12px] font-medium bg-[#FEF9EC] text-[#B45309] px-2.5 py-0.5 rounded-full border border-[#FDE68A]">
                {delayDays} day{delayDays > 1 ? 's' : ''} delay
              </span>
            )}
            {wasLate && lateDays > 0 && (
              <span className="ml-2 text-[12px] font-medium bg-[#FEF9EC] text-[#B45309] px-2.5 py-0.5 rounded-full border border-[#FDE68A]">
                {lateDays} day{lateDays > 1 ? 's' : ''} late
              </span>
            )}
            {assigneeName && (
              <>
                <span className="mx-2.5 text-[#D1D5DB] select-none">|</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0"
                    style={{ background: avColor(assigneeName) }}>
                    {initials(assigneeName)}
                  </div>
                  <span className="text-[13px] text-[#637083]">{assigneeName}</span>
                </div>
              </>
            )}
            {item.status && (
              <>
                <span className="mx-2.5 text-[#D1D5DB] select-none">|</span>
                <span className="text-[13px] text-[#637083]">{item.status}</span>
              </>
            )}
          </div>
        </div>

        {isOverdue && !done && (
          <AlertTriangle className="w-[17px] h-[17px] text-[#F59E0B] flex-shrink-0 mt-0.5 opacity-70" />
        )}
      </div>
    </div>
  );
}

// ─── Suggestion card — similar to feed card but visually distinct ─────────────
interface SuggestionChip { id: string; top: number; left: number }

function SuggestionCard({ item, onCreateTask, alreadyAdded }: {
  item: any;
  onCreateTask: (item: any) => void;
  alreadyAdded: boolean;
}) {
  const [chips, setChips] = useState<SuggestionChip[]>([]);
  const cat        = CAT_CONFIG[item.category] ?? CAT_CONFIG.signal_pattern;
  const valueLabel = formatINR(item.value_at_stake);

  const handleCreate = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (alreadyAdded) return;
    const r = e.currentTarget.getBoundingClientRect();
    const id = `sc_${Date.now()}`;
    setChips(prev => [...prev, { id, top: r.top + r.height/2, left: r.left + r.width/2 }]);
    setTimeout(() => setChips(prev => prev.filter(c => c.id !== id)), 850);
    onCreateTask(item);
  };

  return (
    <>
      {chips.map(chip => (
        <div key={chip.id}
          className="ic-float-chip fixed pointer-events-none z-[9999] flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#059669] text-white text-[11px] font-bold shadow-lg"
          style={{ top: chip.top, left: chip.left, transform: 'translate(-50%,-50%)' }}>
          <Check className="w-3 h-3" /> Added to tasks
        </div>
      ))}

      <div className={`rounded-2xl transition-all duration-200
        hover:shadow-[0_4px_12px_rgba(0,0,0,0.06),0_16px_36px_rgba(0,0,0,0.08)]
        ${alreadyAdded
          ? 'border border-[#A7F3D0] bg-[#F0FDF4]'
          : 'bg-white sg-dash-border'
        }`}>
        <div className="px-6 pt-5 pb-5 flex flex-col gap-3">

          {/* Row 1: name · category badge */}
          <div className="flex items-center justify-between gap-3">
            <p className="text-[13px] font-semibold text-[#637083]">{item.customer_name}</p>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded-md whitespace-nowrap flex-shrink-0"
              style={{ background: cat.bgLight, color: cat.textColor }}>
              {cat.icon}{cat.label}
            </span>
          </div>

          {/* Row 2: title */}
          <p className="text-[15px] font-semibold text-[#1A2330] leading-snug -mt-1">
            {item.title}
          </p>

          {/* Row 3: summary */}
          {item.signal_summary && (
            <p className="text-[13px] text-[#637083] leading-relaxed line-clamp-2">
              {item.signal_summary}
            </p>
          )}

          {/* Row 4: ARR + create task button */}
          <div className="flex items-center justify-between gap-3 pt-0.5">
            <div className="flex items-center gap-1.5">
              {valueLabel && (
                <span className="text-[12px] font-semibold text-[#344051] bg-white px-2.5 py-1 rounded-lg border border-[#E2E8F0] whitespace-nowrap">
                  {valueLabel} ARR
                </span>
              )}
              {(item.other_signals_count ?? 0) > 0 && (
                <span className="text-[11px] text-[#637083] px-2 py-1 rounded-lg bg-white border border-[#E2E8F0] whitespace-nowrap">
                  +{item.other_signals_count} signal{item.other_signals_count > 1 ? 's' : ''}
                </span>
              )}
            </div>

            <button
              onClick={handleCreate}
              disabled={alreadyAdded}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[13px] font-semibold
                transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                alreadyAdded
                  ? 'bg-[#ECFDF5] text-[#059669] cursor-default'
                  : 'bg-[#059669] text-white hover:bg-[#047857] shadow-sm shadow-green-200'
              }`}>
              {alreadyAdded
                ? <><Check className="w-3.5 h-3.5" /> Added</>
                : <><PlusCircle className="w-3.5 h-3.5" /> Create task</>
              }
            </button>
          </div>

        </div>
      </div>
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Priorities() {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [view,         setView]         = useState<'feed' | 'tasks'>('feed');
  const [sortBy,       setSortBy]       = useState<string>('smart');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [pinnedIds,    setPinnedIds]    = useState<Set<string>>(new Set());
  const [createdTasks, setCreatedTasks] = useState<any[]>([]);
  const [addedIds,     setAddedIds]     = useState<Set<string>>(new Set());
  const sortMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(e.target as Node)) setShowSortMenu(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  // ── Queries ──────────────────────────────────────────────────────────────────
  const { data: portfolioData, isLoading: isPortfolioLoading } = useQuery({
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

  // ── Portfolio ─────────────────────────────────────────────────────────────────
  const node = portfolioData?.data?.data?.[0];
  const sym  = node?.client_currency?.currency_symbol ?? '';
  const cur  = node?.client_currency?.currency ?? '';
  const agg  = node?.total_customer_details_aggregate ?? {};

  const myTeamConfig = useMemo(() => {
    if (myTeamConfigData?.data) return myTeamConfigData?.data?.value;
    return {
      Accounts:       { enabled: true, display_name: 'Accounts' },
      ARR:            { enabled: true, display_name: 'ARR' },
      Renewals:       { enabled: true, display_name: 'Renewals' },
      NRR:            { enabled: true, display_name: 'NRR' },
      Insights_acted: { enabled: true, display_name: 'Insights acted' },
      Tasks_done:     { enabled: true, display_name: 'Tasks done' },
    };
  }, [myTeamConfigData?.data]);

  const metricItems = useMemo(() => {
    const items: { label: string; value: string }[] = [];
    if (myTeamConfig?.Accounts?.enabled)       items.push({ label: myTeamConfig.Accounts.display_name,       value: String(agg?.accounts ?? '–') });
    if (myTeamConfig?.ARR?.enabled)            items.push({ label: myTeamConfig.ARR.display_name,            value: `${sym}${formatRevenue(agg?.arr, cur)}` });
    if (myTeamConfig?.Renewals?.enabled)       items.push({ label: myTeamConfig.Renewals.display_name,       value: `${agg?.renewed_accounts_actual ?? '–'}/${agg?.renewed_accounts_opportunity ?? '–'}` });
    if (myTeamConfig?.NRR?.enabled)            items.push({ label: myTeamConfig.NRR.display_name,            value: `${agg?.nrr ?? '–'}%` });
    if (myTeamConfig?.Insights_acted?.enabled) items.push({ label: myTeamConfig.Insights_acted.display_name, value: `${agg?.insights_acted ?? '–'}/${agg?.customer_total_insights ?? '–'}` });
    if (myTeamConfig?.Tasks_done?.enabled)     items.push({ label: myTeamConfig.Tasks_done.display_name,     value: `${agg?.tasks ?? '–'}/${agg?.customer_total_tasks ?? '–'}` });
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

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handlePin     = (id: string) =>
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

  const firstName =
    userinfo?.data?.first_name ??
    (userinfo?.data?.name ? String(userinfo.data.name).split(' ')[0] : '') ?? '';
  const greeting       = getGreeting();
  const todayLabel     = dayjs().format('ddd, MMM D');
  const [blobA, blobB] = getBlobColors();
  const sortLabel      = SORT_OPTIONS.find(s => s.key === sortBy)?.label ?? 'Sort';

  return (
    <div className="h-[calc(100vh-64px)] overflow-y-auto bg-white">
      <style dangerouslySetInnerHTML={{ __html: INJECTED_STYLES }} />

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="animated-header-bg relative overflow-hidden border-b border-[#EDE8ED]">
        <div className="pointer-events-none absolute -top-24 -right-24 w-[340px] h-[340px] rounded-full"
          style={{ background: `radial-gradient(circle,${blobA},transparent 70%)` }} />
        <div className="pointer-events-none absolute -bottom-20 -left-20 w-[300px] h-[300px] rounded-full"
          style={{ background: `radial-gradient(circle,${blobB},transparent 70%)` }} />
        <div className="pointer-events-none absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: 'radial-gradient(#1A2330 1px,transparent 1px)', backgroundSize: '20px 20px' }} />

        <div className="relative max-w-[800px] mx-auto px-8 pt-9 pb-7">
          <p className="text-[11px] font-semibold text-[#B0A0A0] tracking-widest uppercase mb-1">{todayLabel}</p>
          <h1 className="text-[30px] font-bold text-[#1A2330] leading-tight tracking-tight">
            {greeting}{firstName && `, ${firstName}`}{'.'}
          </h1>
          {isPortfolioLoading ? (
            <div className="flex items-center gap-8 mt-5">
              {[72,60,56,52,68,60].map((w,i) => (
                <div key={i} className="flex flex-col gap-2 animate-pulse">
                  <div className="h-2.5 rounded-full bg-[#E8DADC]" style={{ width: w }} />
                  <div className="h-4   rounded-full bg-[#E8DADC]" style={{ width: w-14 }} />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-8 mt-5 overflow-x-auto" style={{ scrollbarWidth:'none' }}>
              {metricItems.map(m => (
                <div key={m.label} className="flex flex-col flex-shrink-0">
                  <span className="text-[11px] font-semibold text-[#B0A0A0] uppercase tracking-wider">{m.label}</span>
                  <span className="text-[18px] font-semibold text-[#1A2330] mt-0.5 tabular-nums">{m.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Toolbar ─────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-[#ECEEF1]">
        <div className="max-w-[800px] mx-auto px-8 py-2.5 flex items-center gap-2">
          <div className="flex items-center gap-1.5 flex-1 min-w-0 overflow-x-auto" style={{ scrollbarWidth:'none' }}>
            {FEED_FILTERS.map(f => {
              const count    = categoryCount[f.key] ?? 0;
              const isActive = activeFilter === f.key && view === 'feed';
              return (
                <button key={f.key} onClick={() => { setActiveFilter(f.key); setView('feed'); }}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-[6px] rounded-full text-[13px] font-medium
                    whitespace-nowrap flex-shrink-0 border transition-colors ${
                    isActive
                      ? 'bg-[#1A2330] border-[#1A2330] text-white'
                      : 'bg-white border-[#E4E7EC] text-[#344051] hover:border-[#C1C9D4] hover:bg-[#FAFAFA]'
                  }`}>
                  {f.label}
                  {count > 0 && <span className={`text-[11px] font-semibold ${isActive ? 'text-white/60' : 'text-[#97A1AF]'}`}>{count}</span>}
                </button>
              );
            })}
          </div>

          <div className="w-px h-5 bg-[#E4E7EC] flex-shrink-0" />

          {/* Sort */}
          <div className="relative flex-shrink-0" ref={sortMenuRef}>
            <button onClick={() => setShowSortMenu(p => !p)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-[6px] rounded-full text-[13px] font-medium
                border whitespace-nowrap transition-colors ${
                showSortMenu ? 'bg-[#1A2330] border-[#1A2330] text-white' : 'bg-white border-[#E4E7EC] text-[#344051] hover:border-[#C1C9D4] hover:bg-[#FAFAFA]'
              }`}>
              <ArrowUpDown className="w-3 h-3" />{sortLabel}
            </button>
            {showSortMenu && (
              <div className="absolute right-0 top-[calc(100%+6px)] z-50 bg-white rounded-xl border border-[#E4E7EC] shadow-[0_4px_16px_rgba(0,0,0,0.10)] py-1 min-w-[130px]">
                {SORT_OPTIONS.map(opt => (
                  <button key={opt.key} onClick={() => { setSortBy(opt.key); setShowSortMenu(false); }}
                    className={`w-full text-left px-4 py-2 text-[13px] hover:bg-[#F8F9FB] transition-colors ${sortBy === opt.key ? 'font-semibold text-[#1A2330]' : 'text-[#637083]'}`}>
                    {opt.label}{sortBy === opt.key && <span className="float-right text-[#3B82F6]">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="w-px h-5 bg-[#E4E7EC] flex-shrink-0" />

          {/* Tasks toggle */}
          <button onClick={() => setView(v => v === 'tasks' ? 'feed' : 'tasks')}
            className={`flex items-center gap-1.5 px-3.5 py-[6px] rounded-full text-[13px] font-medium
              flex-shrink-0 border transition-colors ${
              view === 'tasks'
                ? 'bg-[#1A2330] border-[#1A2330] text-white'
                : totalTaskCount > 0
                  ? 'bg-[#FFFBEB] border-[#FDE68A] text-[#B45309] hover:bg-[#FEF3C7]'
                  : 'bg-white border-[#E4E7EC] text-[#344051] hover:border-[#C1C9D4] hover:bg-[#FAFAFA]'
            }`}>
            <CheckSquare className="w-[13px] h-[13px]" />
            To Do
            {totalTaskCount > 0 && (
              <span className={`text-[10px] font-bold w-[18px] h-[18px] rounded-full flex items-center justify-center leading-none ${
                view === 'tasks' ? 'bg-white/20 text-white' : 'bg-[#F59E0B] text-white'
              }`}>{totalTaskCount}</span>
            )}
          </button>
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────────────────── */}
      <div className="max-w-[800px] mx-auto px-8 py-6">
        {view === 'feed' ? (
          filteredItems.length > 0 ? (
            <div className="flex flex-col gap-5">
              {filteredItems.map((item: any) => (
                <PriorityFeedCard key={item._id} item={item}
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
              <button onClick={() => setActiveFilter('all')} className="text-[13px] text-[#3B82F6] hover:underline">View all</button>
            </div>
          )
        ) : (
          /* ── Tasks view: two groups ──────────────────────────────────── */
          <div className="flex flex-col gap-8">

            {/* Group 1: Tasks */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[11px] font-bold text-[#344051] uppercase tracking-wider">To Do</span>
                <span className="text-[11px] font-semibold text-[#97A1AF]">{createdTasks.length + taskList.length}</span>
              </div>
              {createdTasks.length === 0 && taskList.length === 0 ? (
                <p className="text-[13px] text-[#97A1AF] px-1">Nothing to do yet.</p>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {createdTasks.map(task => <TaskCard key={task._id} item={task} isNew />)}
                  {taskList.map((task: any) => <TaskCard key={task._id} item={task} />)}
                </div>
              )}
            </section>

          </div>
        )}
      </div>
    </div>
  );
}
