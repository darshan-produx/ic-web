'use client';

import { useState } from 'react';
import {
  Pin, X, TrendingDown, TrendingUp,
  RefreshCw, Users, Zap, Check, Cake, Star,
} from 'lucide-react';
import Link from 'next/link';
import OutlineButton from '../../../../common/components/OutlineButton';

// (logo lookup removed — cards no longer show customer logos)

// ─── Category config ──────────────────────────────────────────────────────────
const CATEGORY_CONFIG: Record<string, {
  label: string; color: string; bgLight: string; textColor: string;
  avatarBg: string; icon: React.ReactNode;
}> = {
  at_risk: {
    label: 'At risk', color: '#EF4444', bgLight: '#FEF2F2', textColor: '#DC2626',
    avatarBg: 'linear-gradient(135deg,#FCA5A5,#EF4444)', icon: <TrendingDown className="w-3 h-3" />,
  },
  signal_pattern: {
    label: 'Pattern', color: '#8B5CF6', bgLight: '#F5F3FF', textColor: '#7C3AED',
    avatarBg: 'linear-gradient(135deg,#C4B5FD,#8B5CF6)', icon: <Zap className="w-3 h-3" />,
  },
  upcoming_renewal: {
    label: 'Renewal', color: '#F59E0B', bgLight: '#FFFBEB', textColor: '#D97706',
    avatarBg: 'linear-gradient(135deg,#FDE68A,#F59E0B)', icon: <RefreshCw className="w-3 h-3" />,
  },
  relationship: {
    label: 'Relationship', color: '#10B981', bgLight: '#ECFDF5', textColor: '#059669',
    avatarBg: 'linear-gradient(135deg,#6EE7B7,#10B981)', icon: <Users className="w-3 h-3" />,
  },
  expansion: {
    label: 'Expansion', color: '#3B82F6', bgLight: '#EFF6FF', textColor: '#2563EB',
    avatarBg: 'linear-gradient(135deg,#93C5FD,#3B82F6)', icon: <TrendingUp className="w-3 h-3" />,
  },
};

// ─── Sparklines ───────────────────────────────────────────────────────────────
const SPARKLINE_PATHS: Record<string, { path: string; dotY: number }> = {
  at_risk:          { path: 'M0,10 L14,12 L28,18 L42,14 L56,22 L70,26 L88,30', dotY: 30 },
  signal_pattern:   { path: 'M0,20 L14,8  L28,22 L42,10 L56,24 L70,12 L88,20', dotY: 20 },
  upcoming_renewal: { path: 'M0,24 L14,22 L28,20 L42,22 L56,14 L70,16 L88,10', dotY: 10 },
  relationship:     { path: 'M0,18 L14,16 L28,18 L42,14 L56,16 L70,14 L88,12', dotY: 12 },
  expansion:        { path: 'M0,30 L14,26 L28,22 L42,18 L56,14 L70,8  L88,4',  dotY:  4 },
};
function Sparkline({ category, color }: { category: string; color: string }) {
  const sp = SPARKLINE_PATHS[category] ?? SPARKLINE_PATHS.signal_pattern;
  const id = `sg-${category}`;
  return (
    <svg width="88" height="36" viewBox="0 0 88 36" fill="none" className="flex-shrink-0">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${sp.path} L88,36 L0,36 Z`} fill={`url(#${id})`} />
      <path d={sp.path} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="88" cy={sp.dotY} r="3.5" fill={color} />
    </svg>
  );
}

function BarChart({ data, color }: { data: { bars: number[]; label: string }; color: string }) {
  const max = Math.max(...data.bars);
  const H = 32, BW = 9, GAP = 3;
  const total = data.bars.length * BW + (data.bars.length - 1) * GAP;
  return (
    <div className="flex flex-col items-end gap-1 flex-shrink-0">
      <svg width={total} height={H} viewBox={`0 0 ${total} ${H}`} fill="none">
        {data.bars.map((v, i) => {
          const h = Math.max(3, Math.round((v / max) * H));
          return <rect key={i} x={i * (BW + GAP)} y={H - h} width={BW} height={h} rx="2"
            fill={i === data.bars.length - 1 ? color : `${color}55`} />;
        })}
      </svg>
      <span className="text-[9px] font-medium text-[#97A1AF] whitespace-nowrap">{data.label}</span>
    </div>
  );
}

function PieRing({ data, color }: { data: { value: number; max: number; label: string }; color: string }) {
  const R = 18, C = 2 * Math.PI * R;
  const pct = Math.min(100, Math.max(0, (data.value / data.max) * 100));
  return (
    <div className="flex flex-col items-center gap-1 flex-shrink-0">
      <svg width="48" height="48" viewBox="0 0 48 48">
        <circle cx="24" cy="24" r={R} stroke="#F2F4F7" strokeWidth="5" fill="none" />
        <circle cx="24" cy="24" r={R} stroke={color} strokeWidth="5" fill="none"
          strokeDasharray={C} strokeDashoffset={C - (pct / 100) * C}
          strokeLinecap="round" transform="rotate(-90 24 24)" />
        <text x="24" y="24" textAnchor="middle" dominantBaseline="central"
          fontSize="11" fontWeight="700" fill="#141C24">{data.value}</text>
      </svg>
      <span className="text-[9px] font-medium text-[#97A1AF] whitespace-nowrap">{data.label}</span>
    </div>
  );
}

function MetricPair({ data, color }: { data: { current: number; previous: number; unit: string; label: string }; color: string }) {
  const up = data.current > data.previous;
  return (
    <div className="flex flex-col items-end gap-0.5 flex-shrink-0 min-w-[72px]">
      <div className="flex items-baseline gap-0.5">
        <span className="text-[22px] font-bold tabular-nums leading-none" style={{ color }}>{data.current}</span>
        <span className="text-[11px] font-semibold text-[#97A1AF]">{data.unit}</span>
      </div>
      <div className={`flex items-center gap-0.5 text-[10px] font-semibold ${up ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
        {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        {Math.abs(data.current - data.previous).toFixed(1)}{data.unit} vs prev
      </div>
      <span className="text-[9px] font-medium text-[#97A1AF] whitespace-nowrap">{data.label}</span>
    </div>
  );
}

function Countdown({ data, color }: { data: { days: number; label: string }; color: string }) {
  const c = data.days <= 30 ? '#EF4444' : data.days <= 90 ? '#F59E0B' : color;
  return (
    <div className="flex flex-col items-center gap-0 flex-shrink-0">
      <span className="text-[28px] font-black tabular-nums leading-none" style={{ color: c }}>{data.days}</span>
      <span className="text-[10px] font-semibold text-[#97A1AF]">days</span>
      <span className="text-[9px] text-[#97A1AF] mt-0.5 whitespace-nowrap">{data.label}</span>
    </div>
  );
}

const CONFETTI_COLORS = ['#6366F1','#F59E0B','#EC4899','#10B981','#3B82F6','#F97316'];
function ConfettiDots() {
  const dots = [
    {x:4,y:6,r:3,c:0},{x:16,y:2,r:2,c:1},{x:28,y:8,r:2.5,c:2},
    {x:8,y:18,r:2,c:3},{x:22,y:16,r:3,c:4},{x:34,y:4,r:2,c:5},
    {x:38,y:20,r:2,c:0},{x:44,y:10,r:3,c:1},{x:12,y:28,r:2,c:2},
    {x:30,y:26,r:2.5,c:3},{x:46,y:28,r:2,c:4},{x:2,y:34,r:2,c:5},
    {x:18,y:36,r:2,c:0},{x:40,y:36,r:3,c:1},
  ];
  return (
    <svg width="52" height="44" viewBox="0 0 52 44" fill="none" className="flex-shrink-0 opacity-85">
      {dots.map((d,i) => <circle key={i} cx={d.x} cy={d.y} r={d.r} fill={CONFETTI_COLORS[d.c]} />)}
    </svg>
  );
}

const MOCK_STAKEHOLDERS: Record<string, string[]> = {
  Meesho: ['Sreeram Iyer','Rohit Kumar'], Pharmeasy: ['Dhaval Shah','Sanjay Nair'],
  Zerodha: ['Kailash Nadh','Nithin Kamath'], CRED: ['Kunal Shah','Miten Sampat'],
  'Urban Company': ['Varun Khaitan','Abhiraj Bhal'], Swiggy: ['Rahul Bothra','Sriharsha Majety'],
  Nykaa: ['Adwaita Nayar','Falguni Nayar'], Lenskart: ['Peyush Bansal','Kapil Barathi'],
};
const AV_COLORS = ['#6366F1','#3B82F6','#10B981','#F59E0B','#EF4444','#8B5CF6','#0EA5E9'];
const avColor  = (n: string) => AV_COLORS[n.split('').reduce((a,c) => a+c.charCodeAt(0),0) % AV_COLORS.length];
const initials = (n: string) => n.split(' ').slice(0,2).map(w => w[0]?.toUpperCase() ?? '').join('');

function AvatarGroup({ customerName }: { customerName: string }) {
  const people = MOCK_STAKEHOLDERS[customerName] ?? [customerName];
  return (
    <div className="flex items-center -space-x-2">
      {people.slice(0,3).map(name => (
        <div key={name} title={name}
          className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
          style={{ background: avColor(name) }}>{initials(name)}</div>
      ))}
    </div>
  );
}

function formatINR(v: number | null | undefined): string | null {
  if (!v) return null;
  if (v >= 10_000_000) return `₹${(v / 10_000_000).toFixed(1)}Cr`;
  if (v >= 100_000)    return `₹${(v / 100_000).toFixed(1)}L`;
  return `₹${v.toLocaleString('en-IN')}`;
}

function CardVisual({ item, cat }: { item: any; cat: typeof CATEGORY_CONFIG[string] }) {
  const { visual_type: vt, visual_data: vd } = item;
  if (vt === 'confetti')                                 return <ConfettiDots />;
  if (vt === 'bar_chart'   && vd?.bars)                  return <BarChart data={vd} color={cat.color} />;
  if (vt === 'pie_ring'    && vd?.value !== undefined)   return <PieRing data={vd} color={cat.color} />;
  if (vt === 'metric_pair' && vd?.current !== undefined) return <MetricPair data={vd} color={cat.color} />;
  if (vt === 'countdown'   && vd?.days !== undefined)    return <Countdown data={vd} color={cat.color} />;
  if (vt === 'avatar_group')                             return <AvatarGroup customerName={item.customer_name} />;
  return <Sparkline category={item.category} color={cat.color} />;
}

function getCelebStyle(type?: string): React.CSSProperties {
  if (type === 'birthday')         return { background: 'linear-gradient(135deg,#FFFBEB 0%,#FFF7ED 55%,#FEF2FF 100%)' };
  if (type === 'work_anniversary') return { background: 'linear-gradient(135deg,#F0FDF4 0%,#ECFDF5 55%,#F0F9FF 100%)' };
  return {};
}

interface Chip { id: string; top: number; left: number }

interface PriorityFeedCardProps {
  item: any;
  onPin?: () => void;
  onDismiss?: () => void;
  onCreateTask?: (item: any) => void;
  onRemoveTask?: (item: any) => void;
}

export const PriorityFeedCard = ({ item, onPin, onDismiss, onCreateTask, onRemoveTask }: PriorityFeedCardProps) => {
  const [taskCreated, setTaskCreated] = useState(false);
  const [chips, setChips]             = useState<Chip[]>([]);

  const cat           = CATEGORY_CONFIG[item.category] ?? CATEGORY_CONFIG.signal_pattern;
  const isCelebration = !!item.celebration_type;
  const href = item.category === 'signal_pattern'
    ? `/app/patterns/${item._id}`
    : item.collection_type === 'signal'
    ? `/app/customers/${item.customer_id}?activeTab=open_issues`
    : `/app/insights/opportunities?selected=${item._id}`;
  const valueLabel = formatINR(item.value_at_stake);

  const handleCreateTask = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (taskCreated) {
      setTaskCreated(false);
      onRemoveTask?.(item);
      return;
    }
    const r = e.currentTarget.getBoundingClientRect();
    const id = `chip_${Date.now()}`;
    setChips(prev => [...prev, { id, top: r.top + r.height / 2, left: r.left + r.width / 2 }]);
    setTimeout(() => setChips(prev => prev.filter(c => c.id !== id)), 850);
    setTaskCreated(true);
    onCreateTask?.(item);
  };

  return (
    <>
      {chips.map(chip => (
        <div key={chip.id}
          className="ic-float-chip fixed pointer-events-none z-[9999] flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#059669] text-white text-[11px] font-bold shadow-lg"
          style={{ top: chip.top, left: chip.left, transform: 'translate(-50%,-50%)' }}>
          <Check className="w-3 h-3" /> Added to actionables
        </div>
      ))}

      <div
        className="group relative rounded-[12px] border border-[#E4E7EC] bg-white transition-all duration-200 hover:shadow-sm"
        style={isCelebration ? getCelebStyle(item.celebration_type) : undefined}
      >
        {/* Dismiss X — pops half-outside top-right corner on hover */}
        <button
          onClick={onDismiss}
          className="absolute -top-3 -right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity
            w-7 h-7 rounded-full bg-white border-2 border-[#E4E7EC] shadow-md
            flex items-center justify-center
            text-[#637083] hover:text-white hover:bg-[#EF4444] hover:border-[#EF4444]"
          title="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        <div className="px-5 py-4 flex flex-col gap-3">

          {/* Row 1: customer name · visual widget */}
          <div className="flex items-start justify-between gap-4 pr-6">
            <p className="text-[13px] font-semibold text-[#202B37] leading-tight flex items-center gap-1.5 pt-0.5">
              {item.customer_name}
              {isCelebration && (item.celebration_type === 'birthday'
                ? <Cake className="w-3.5 h-3.5 text-[#F59E0B]" />
                : <Star className="w-3.5 h-3.5 text-[#10B981]" />
              )}
            </p>
            <CardVisual item={item} cat={cat} />
          </div>

          {/* Row 2: title */}
          <Link href={href} className="block group/link">
            <p className="text-[16px] font-bold text-[#141C24] leading-snug group-hover/link:text-[#3B82F6] transition-colors">
              {item.title}
            </p>
          </Link>

          {/* Row 3: description / summary */}
          {item.signal_summary && (
            <p className="text-[12px] text-[#637083] leading-relaxed line-clamp-2">
              {item.signal_summary}
            </p>
          )}

          {/* Row 4: pin · chips · add todo button */}
          <div className="flex items-center gap-2">
            {/* Pin icon — left side, takes NO space until hovered or pinned */}
            <button
              onClick={onPin}
              title={item.is_pinned ? 'Unpin' : 'Pin to top'}
              className={`flex-shrink-0 transition-all duration-150 overflow-hidden ${
                item.is_pinned
                  ? 'w-5 opacity-100'
                  : 'w-0 opacity-0 group-hover:w-5 group-hover:opacity-100'
              }`}
            >
              <Pin className={`w-4 h-4 ${item.is_pinned ? 'text-[#3B82F6] fill-[#3B82F6]' : 'text-[#CED2DA] hover:text-[#637083]'}`} />
            </button>

            {/* Badges */}
            <div className="flex items-center gap-1.5 flex-wrap min-w-0 flex-1">
              <span
                className="inline-flex items-center gap-1 h-8 px-3 rounded-[8px] text-[12px] font-medium whitespace-nowrap"
                style={{ background: cat.bgLight, color: cat.textColor }}>
                {cat.icon}{cat.label}
              </span>
              {valueLabel && (
                <span className="inline-flex items-center h-8 px-3 rounded-[8px] text-[12px] font-medium text-[#344051] bg-[#F2F4F7] whitespace-nowrap">
                  {valueLabel} ARR
                </span>
              )}
              {(item.other_signals_count ?? 0) > 0 && (
                <span className="inline-flex items-center h-8 px-3 rounded-[8px] text-[12px] font-medium text-[#344051] bg-[#F2F4F7] whitespace-nowrap">
                  +{item.other_signals_count} signal{item.other_signals_count > 1 ? 's' : ''}
                </span>
              )}
            </div>

            {/* Add todo / Added */}
            <OutlineButton
              onClick={handleCreateTask}
              className={`flex-shrink-0 ${
                taskCreated
                  ? '!bg-[#ECFDF5] !border-[#A7F3D0] !text-[#059669] hover:!bg-[#FEF2F2] hover:!border-[#FCA5A5] hover:!text-[#DC2626]'
                  : 'hover:!bg-[#F2F4F7]'
              }`}
            >
              {taskCreated
                ? <><Check className="w-3 h-3" /> Added</>
                : 'Add todo'
              }
            </OutlineButton>
          </div>

        </div>
      </div>
    </>
  );
};
