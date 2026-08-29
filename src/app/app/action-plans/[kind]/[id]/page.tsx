'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ChevronLeft, ChevronDown, Sparkles, ArrowRight, Building2, Target, User, AlertTriangle,
} from 'lucide-react';
import {
  getEntity, EVIDENCE_KIND_LABEL, type StateDimension, type EvidenceKind, type PlanStatus,
} from '../../stateData';
import { StatusPill, ConfidenceMeter, ScoreBar, ScoreRing, Markdown } from '../../stateUi';

const EVIDENCE_DOT: Record<EvidenceKind, string> = {
  signal: '#8B5CF6', meeting: '#3B6FF6', email: '#0EA5E9', crm: '#10B981', metric: '#F59E0B', external: '#EC4899',
};

const PLAN_CTA: Record<PlanStatus, string> = {
  none: 'Develop action plan',
  draft: 'Open action plan',
  executing: 'Open action plan',
  completed: 'View action plan',
};

export default function EntityStatePage() {
  const params = useParams();
  const router = useRouter();
  const kind = String(params?.kind ?? '');
  const id = String(params?.id ?? '');
  const entity = getEntity(id);

  const [expanded, setExpanded] = useState<Set<string>>(() => {
    if (!entity) return new Set();
    const worst = [...entity.state.dimensions].sort((a, b) => (a.score - a.target) - (b.score - b.target))[0];
    return new Set([worst.key]);
  });

  if (!entity || entity.kind !== kind) {
    return (
      <div className="max-w-[1100px] mx-auto px-8 py-16 text-center">
        <p className="text-[14px] text-[#637083]">Not found.</p>
        <Link href="/app/action-plans" className="text-[13px] text-blue-600 hover:underline mt-2 inline-block">← Back</Link>
      </div>
    );
  }

  const { overall, dimensions } = entity.state;
  const KindIcon = entity.kind === 'account' ? Building2 : Target;
  const toggle = (k: string) => setExpanded(prev => {
    const next = new Set(prev);
    next.has(k) ? next.delete(k) : next.add(k);
    return next;
  });
  const openPlan = () => router.push(`/app/action-plans/${entity.kind}/${entity.id}/plan`);

  return (
    <div className="bg-[#FAFBFC] min-h-[calc(100vh-54px)]">
      <div className="max-w-[1100px] mx-auto px-8 py-6">
        <Link href="/app/action-plans" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#637083] hover:text-[#141C24]">
          <ChevronLeft className="w-4 h-4" /> Action Plan
        </Link>

        {/* Header */}
        <div className="mt-3 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#637083] bg-white border border-[#E4E7EC] rounded-full px-2 py-0.5">
              <KindIcon className="w-3.5 h-3.5" /> {entity.kind === 'account' ? 'Account' : 'Opportunity'}
            </span>
            <h1 className="text-[24px] font-bold text-[#141C24] leading-tight mt-2">{entity.name}</h1>
            <div className="mt-2 flex items-center flex-wrap gap-x-4 gap-y-1.5 text-[13px] text-[#637083]">
              {entity.kind === 'opportunity' && <span>{entity.customer}</span>}
              <span>{entity.segment}</span>
              {entity.meta.map(m => <span key={m.label}><span className="text-[#9CA3AF]">{m.label}:</span> {m.value}</span>)}
              <span className="inline-flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> {entity.owner}</span>
            </div>
          </div>
        </div>

        {/* Summary (State) + Action Plan card — side by side */}
        <div className="mt-5 grid grid-cols-[1fr_360px] gap-4 items-stretch">
          {/* State summary */}
          <div className="bg-white border border-[#E4E7EC] rounded-[12px] p-5">
            <div className="flex items-start gap-5">
              <div className="shrink-0 flex flex-col items-center">
                <ScoreRing score={overall.score} />
                <div className="mt-2 flex items-center gap-1.5">
                  <span className="text-[11px] text-[#637083]">confidence</span>
                  <ConfidenceMeter value={overall.confidence} />
                </div>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-[15px] font-semibold text-[#141C24]">State summary</h2>
                  <StatusPill score={overall.score} />
                  {entity.churnRisk != null && (
                    <span className="inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded-full bg-[#FDECEC] text-[#E02424] border border-[#FAD1D1]">
                      <AlertTriangle className="w-3 h-3" /> {Math.round(entity.churnRisk * 100)}% churn risk
                    </span>
                  )}
                </div>
                <Markdown text={overall.summary} className="mt-2" />
                <p className="mt-2 text-[11px] text-[#9CA3AF]">Updated {overall.lastUpdated} · recomputes as new signals & events arrive</p>
              </div>
            </div>
          </div>

          {/* Action Plan card — sits right next to the summary */}
          <div className="bg-gradient-to-br from-[#F5F8FF] to-white border border-[#DDE3FF] rounded-[12px] p-5 flex flex-col">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-[9px] bg-gradient-to-br from-[#3B6FF6] to-[#6366F1] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </span>
              <h2 className="text-[15px] font-semibold text-[#141C24]">Action Plan</h2>
            </div>
            <p className="text-[13px] text-[#637083] leading-relaxed mt-3 flex-1">
              {entity.planStatus === 'none'
                ? `Develop a plan to move ${entity.kind === 'account' ? 'this account' : 'this opportunity'} from its current state toward target. I’ll reason through the gaps with you, then draft the actions.`
                : entity.planStatus === 'executing'
                  ? 'An active plan is in execution. Open it to see actions, progress and the working chat.'
                  : 'A draft plan is ready. Open it to review the actions and refine with the assistant.'}
            </p>
            {entity.planStatus !== 'none' && (
              <span className="text-[11px] font-medium text-[#4F46E5] bg-[#EEF2FF] border border-[#DDE3FF] rounded-full px-2 py-0.5 self-start mb-3 capitalize">{entity.planStatus}</span>
            )}
            <button onClick={openPlan} className="inline-flex items-center justify-center gap-1.5 h-10 px-4 text-[14px] font-medium text-white bg-blue-600 rounded-[8px] hover:bg-blue-700">
              {PLAN_CTA[entity.planStatus]} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* State dimensions */}
        <div className="mt-6 flex items-center justify-between">
          <h2 className="text-[16px] font-semibold text-[#141C24]">State dimensions</h2>
          <span className="text-[12px] text-[#9CA3AF]">{dimensions.length} dimensions · overall = weighted average · marker = target</span>
        </div>
        <div className="mt-3 bg-white border border-[#E4E7EC] rounded-[12px] overflow-hidden">
          <div className="grid grid-cols-[1.5fr_1.6fr_110px_120px_80px] items-center bg-[#F9FAFB] border-b border-[#E4E7EC] px-4 py-2.5 text-[12px] text-[#637083]">
            <span>Dimension</span><span>Score vs target</span><span>Status</span><span>Confidence</span><span className="text-right">Weight</span>
          </div>
          {dimensions.map((d, i) => (
            <DimensionRow key={d.key} d={d} open={expanded.has(d.key)} onToggle={() => toggle(d.key)} last={i === dimensions.length - 1} />
          ))}
        </div>
      </div>
    </div>
  );
}

function DimensionRow({ d, open, onToggle, last }: { d: StateDimension; open: boolean; onToggle: () => void; last: boolean }) {
  const belowTarget = d.score < d.target;
  return (
    <div className={last ? '' : 'border-b border-[#F2F4F7]'}>
      <button onClick={onToggle} className="w-full grid grid-cols-[1.5fr_1.6fr_110px_120px_80px] items-center px-4 py-3 text-left hover:bg-[#FAFBFC] transition-colors">
        <span className="flex items-center gap-2 min-w-0">
          <ChevronDown className={`w-4 h-4 text-[#9CA3AF] transition-transform shrink-0 ${open ? '' : '-rotate-90'}`} />
          <span className="text-[14px] font-medium text-[#141C24] truncate">{d.label}</span>
        </span>
        <span className="flex items-center gap-2 pr-4">
          <span className="text-[12px] tabular-nums text-[#637083] w-8">{d.score.toFixed(2)}</span>
          <span className="flex-1"><ScoreBar score={d.score} target={d.target} /></span>
          <span className="text-[12px] tabular-nums text-[#141C24] w-8">{d.target.toFixed(2)}</span>
        </span>
        <span><StatusPill score={d.score} showScore={false} size="sm" /></span>
        <span><ConfidenceMeter value={d.confidence} /></span>
        <span className="text-right text-[13px] tabular-nums text-[#637083]">{Math.round(d.weight * 100)}%</span>
      </button>
      {open && (
        <div className="px-4 pb-4 pl-10">
          <div className="bg-[#FAFBFC] border border-[#F2F4F7] rounded-[10px] p-4">
            <Markdown text={d.summary} />
            {belowTarget && <p className="mt-2 text-[12px] text-[#B45309]">{Math.round((d.target - d.score) * 100)} points below the {d.target.toFixed(2)} target for this segment.</p>}
            {d.evidence.length > 0 && (
              <div className="mt-3">
                <p className="text-[12px] font-medium text-[#141C24] mb-2">Supporting evidence</p>
                <div className="flex flex-wrap gap-2">
                  {d.evidence.map(e => (
                    <span key={e.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[#E4E7EC] bg-white text-[12px] text-[#414E62]">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: EVIDENCE_DOT[e.kind] }} />
                      <span className="text-[#9CA3AF]">{EVIDENCE_KIND_LABEL[e.kind]}</span>{e.label}
                      <span className="text-[#9CA3AF]">· {e.ago}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
            <p className="mt-3 text-[11px] text-[#9CA3AF]">Last updated {d.lastUpdated}</p>
          </div>
        </div>
      )}
    </div>
  );
}
