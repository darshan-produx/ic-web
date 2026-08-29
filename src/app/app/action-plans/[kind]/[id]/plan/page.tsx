'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ChevronLeft, Sparkles, Send, Check, Plus, CalendarDays, Target, ClipboardList,
  Minus, Lightbulb, ArrowRight,
} from 'lucide-react';
import {
  getEntity, getPlanSeed, DIMENSION_BY_KEY_ALL, CONF_THRESHOLD,
  type ActionItem, type Entity, type PlanSeed,
} from '../../../stateData';
import { StatusPill, ConfidenceMeter, ScoreBar, Markdown, InlineMd } from '../../../stateUi';

interface WorkingDim { key: string; short: string; target: number; weight: number; score: number; confidence: number; }
interface Msg { id: string; from: 'ai' | 'user'; text: string; chips?: string[]; }
interface TrackedAction extends ActionItem { taskLinked: boolean; }

function weightedAvg(dims: WorkingDim[], field: 'score' | 'confidence') {
  const total = dims.reduce((s, d) => s + d.weight, 0) || 1;
  return Math.round((dims.reduce((s, d) => s + d[field] * d.weight, 0) / total) * 100) / 100;
}

export default function ActionPlanDetailPage() {
  const params = useParams();
  const kind = String(params?.kind ?? '');
  const id = String(params?.id ?? '');
  const entity = getEntity(id);

  const seed = useMemo(() => (entity ? getPlanSeed(entity) : undefined), [entity]);

  const [dims, setDims] = useState<WorkingDim[]>(() =>
    entity ? entity.state.dimensions.map(d => ({ key: d.key, short: d.short, target: d.target, weight: d.weight, score: d.score, confidence: d.confidence })) : [],
  );
  const [targets, setTargets] = useState<Record<string, number>>(() =>
    entity ? Object.fromEntries(entity.state.dimensions.map(d => [d.key, d.target])) : {},
  );
  const [gaps, setGaps] = useState(() => (seed ? seed.reasoningGaps.map(g => ({ ...g, answered: false })) : []));
  const [skipped, setSkipped] = useState(false);
  const [actions, setActions] = useState<TrackedAction[]>(() => (seed ? seed.actions.map(a => ({ ...a, taskLinked: false })) : []));
  const [messages, setMessages] = useState<Msg[]>(() => (entity && seed ? initialMessages(entity, seed) : []));
  const [draft, setDraft] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const [activated, setActivated] = useState(() => entity?.planStatus === 'executing');

  const overallScore = useMemo(() => weightedAvg(dims, 'score'), [dims]);
  const overallConf = useMemo(() => weightedAvg(dims, 'confidence'), [dims]);

  if (!entity || entity.kind !== kind || !seed) {
    return (
      <div className="max-w-[1100px] mx-auto px-8 py-16 text-center">
        <p className="text-[14px] text-[#637083]">Not found.</p>
        <Link href="/app/action-plans" className="text-[13px] text-blue-600 hover:underline mt-2 inline-block">← Back</Link>
      </div>
    );
  }

  const activeGap = gaps.find(g => !g.answered);
  const reasoningActive = !skipped && !!activeGap;
  const flash = (m: string) => { setToast(m); window.setTimeout(() => setToast(null), 3000); };

  function submitAnswer(text: string) {
    const gap = activeGap;
    if (!gap) return;
    setMessages(prev => [...prev, { id: `u${prev.length}`, from: 'user', text }]);
    setDims(prev => prev.map(d => d.key === gap.dimensionKey ? { ...d, confidence: gap.raisesConfidenceTo, score: gap.raisesScoreTo ?? d.score } : d));
    setGaps(prev => prev.map(g => g.id === gap.id ? { ...g, answered: true } : g));
    const remaining = gaps.filter(g => !g.answered && g.id !== gap.id);
    const label = DIMENSION_BY_KEY_ALL[gap.dimensionKey]?.short ?? gap.dimensionKey;
    window.setTimeout(() => {
      if (remaining.length > 0) {
        const next = remaining[0];
        setMessages(prev => [...prev,
          { id: `a${prev.length}`, from: 'ai', text: `Got it — that raises my confidence on **${label}**. I’ve updated the current state on the left.` },
          { id: `a${prev.length + 1}`, from: 'ai', text: next.question, chips: next.suggestions },
        ]);
      } else {
        setMessages(prev => [...prev,
          { id: `a${prev.length}`, from: 'ai', text: `That was my last open question on **${label}**. Confidence is now high enough to plan reliably — the action plan on the left reflects everything we discussed.` },
          { id: `a${prev.length + 1}`, from: 'ai', text: `Ask me to reprioritise, change a target date, add or remove actions — or create tasks from any action for your own tracking.` },
        ]);
      }
    }, 240);
  }

  function skipReasoning() {
    setSkipped(true);
    setMessages(prev => [...prev,
      { id: `u${prev.length}`, from: 'user', text: 'Skip to action plan.' },
      { id: `a${prev.length + 1}`, from: 'ai', text: `Understood — planning with what we have. I’ve flagged the lower-confidence dimensions so we can revisit them. Ask me to refine anything.` },
    ]);
  }

  function sendDraft() {
    const t = draft.trim();
    if (!t) return;
    setDraft('');
    if (reasoningActive) submitAnswer(t);
    else setMessages(prev => [...prev,
      { id: `u${prev.length}`, from: 'user', text: t },
      { id: `a${prev.length + 1}`, from: 'ai', text: `Noted — I’ve reflected that in the plan document and adjusted the actions where relevant.` },
    ]);
  }

  function toggleTask(id: string) {
    setActions(prev => prev.map(a => a.id === id ? { ...a, taskLinked: !a.taskLinked } : a));
    const a = actions.find(x => x.id === id);
    if (a && !a.taskLinked) flash(`Task created and linked to “${a.action}”.`);
  }

  function bumpTarget(key: string, delta: number) {
    setTargets(prev => ({ ...prev, [key]: Math.min(1, Math.max(0.5, Math.round((prev[key] + delta) * 100) / 100)) }));
  }

  const actionWord = 'Actions'; // account & opportunity both use "actions" (initiatives are portfolio-level)

  return (
    <div className="h-[calc(100vh-54px)] flex flex-col bg-[#FAFBFC]">
      {/* Top bar */}
      <div className="shrink-0 bg-white border-b border-[#E4E7EC] px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <Link href={`/app/action-plans/${entity.kind}/${entity.id}`} className="inline-flex items-center gap-1 text-[13px] text-[#637083] hover:text-[#141C24] shrink-0">
            <ChevronLeft className="w-4 h-4" /> Back
          </Link>
          <span className="h-4 w-px bg-[#E4E7EC]" />
          <span className="w-8 h-8 rounded-[9px] bg-gradient-to-br from-[#3B6FF6] to-[#6366F1] flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </span>
          <div className="min-w-0">
            <p className="text-[14px] font-semibold text-[#141C24] truncate">Action Plan · {entity.name}</p>
            <p className="text-[12px] text-[#637083]">{entity.kind === 'account' ? 'Account' : 'Opportunity'} · {entity.customer} · complete by {seed.targetCompletion}</p>
          </div>
        </div>
        <button
          onClick={() => { setActivated(true); flash('Plan activated. The assistant will keep it current as new signals arrive.'); }}
          disabled={activated}
          className="shrink-0 inline-flex items-center gap-1.5 h-9 px-4 text-[13px] font-medium text-white bg-blue-600 rounded-[8px] hover:bg-blue-700 disabled:bg-[#B7E4D3] disabled:text-[#249782]"
        >
          {activated ? <><Check className="w-4 h-4" /> Plan active</> : 'Activate plan'}
        </button>
      </div>

      {/* Summary strip (top) */}
      <div className="shrink-0 bg-white border-b border-[#E4E7EC] px-6 py-3">
        <div className="flex items-start gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[20px] font-bold text-[#141C24] tabular-nums">{overallScore.toFixed(2)}</span>
            <StatusPill score={overallScore} showScore={false} size="sm" />
          </div>
          <span className="h-8 w-px bg-[#E4E7EC] shrink-0" />
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[12px] text-[#637083]">confidence</span>
            <ConfidenceMeter value={overallConf} />
            <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${overallConf >= CONF_THRESHOLD && dims.every(d => d.confidence >= CONF_THRESHOLD) ? 'bg-[#E7F6F0] text-[#249782]' : 'bg-[#FEF6E7] text-[#B45309]'}`}>
              {overallConf >= CONF_THRESHOLD && dims.every(d => d.confidence >= CONF_THRESHOLD) ? 'Ready to plan' : `Threshold ${CONF_THRESHOLD.toFixed(2)}`}
            </span>
          </div>
          <span className="h-8 w-px bg-[#E4E7EC] shrink-0" />
          <p className="text-[12px] text-[#637083] leading-snug line-clamp-2">{entity.state.overall.summary.replace(/\*\*/g, '')}</p>
        </div>
      </div>

      {/* Body: action plan (left) + chat (right) */}
      <div className="flex-1 min-h-0 flex">
        {/* Left — Action plan */}
        <div className="flex-1 min-w-0 overflow-y-auto">
          <div className="max-w-[720px] mx-auto px-6 py-6 space-y-6">
            {reasoningActive && (
              <div className="flex items-start gap-2.5 px-4 py-3 bg-[#FEF6E7] border border-[#FCE4B6] rounded-[10px]">
                <Lightbulb className="w-4 h-4 text-[#B45309] mt-0.5 shrink-0" />
                <p className="text-[13px] text-[#8A5A00] leading-snug">
                  I’m improving my understanding of the lower-confidence dimensions before finalising — answer on the right, or <button onClick={skipReasoning} className="font-semibold underline hover:text-[#B45309]">skip to the action plan</button>. The plan below already reflects a draft.
                </p>
              </div>
            )}

            {/* Target impact — the plan is defined by its targets */}
            <section>
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-4 h-4 text-[#3B6FF6]" />
                <h2 className="text-[16px] font-semibold text-[#141C24]">Target impact</h2>
              </div>
              <p className="text-[12px] text-[#9CA3AF] mb-2">An action plan is defined by its targets. Targets come from the segment config — adjust any of them and the plan adapts.</p>
              <div className="bg-white border border-[#E4E7EC] rounded-[10px] overflow-hidden">
                <div className="grid grid-cols-[1.3fr_1.4fr_150px_80px] items-center bg-[#F9FAFB] border-b border-[#E4E7EC] px-4 py-2 text-[12px] text-[#637083]">
                  <span>Dimension</span><span>Current → target</span><span className="text-center">Adjust target</span><span className="text-right">Impact</span>
                </div>
                {dims.map(d => {
                  const target = targets[d.key];
                  const impact = Math.round((target - d.score) * 100) / 100;
                  const contribution = seed.initiative?.contributesTo.find(c => c.dimensionKey === d.key)?.delta;
                  return (
                    <div key={d.key} className="grid grid-cols-[1.3fr_1.4fr_150px_80px] items-center px-4 py-2.5 border-b border-[#F2F4F7] last:border-0 text-[13px]">
                      <span className="text-[#141C24]">{d.short}</span>
                      <span className="flex items-center gap-2 pr-3">
                        <span className="tabular-nums text-[#637083] w-8">{d.score.toFixed(2)}</span>
                        <span className="flex-1"><ScoreBar score={d.score} target={target} height={5} /></span>
                        <span className="tabular-nums text-[#141C24] w-8">{target.toFixed(2)}</span>
                      </span>
                      <span className="flex items-center justify-center gap-1.5">
                        <button onClick={() => bumpTarget(d.key, -0.05)} className="w-6 h-6 flex items-center justify-center rounded-md border border-[#E4E7EC] text-[#637083] hover:bg-[#F2F4F7]"><Minus className="w-3 h-3" /></button>
                        <button onClick={() => bumpTarget(d.key, 0.05)} className="w-6 h-6 flex items-center justify-center rounded-md border border-[#E4E7EC] text-[#637083] hover:bg-[#F2F4F7]"><Plus className="w-3 h-3" /></button>
                      </span>
                      <span className="text-right tabular-nums font-medium flex items-center justify-end gap-1" style={{ color: impact <= 0 ? '#249782' : '#B45309' }}>
                        {impact <= 0 ? '—' : `+${impact.toFixed(2)}`}
                        {contribution ? <span className="text-[10px] text-[#4F46E5] bg-[#EEF2FF] border border-[#DDE3FF] px-1 rounded-full">init +{contribution.toFixed(2)}</span> : null}
                      </span>
                    </div>
                  );
                })}
              </div>
              {seed.initiative && (
                <p className="mt-2 text-[12px] text-[#637083]">
                  Portfolio initiative <span className="font-medium text-[#4F46E5]">{seed.initiative.name}</span> already contributes here — the plan only closes the remaining gap.
                </p>
              )}
            </section>

            {/* Actions */}
            <section>
              <div className="flex items-center gap-2 mb-2">
                <ClipboardList className="w-4 h-4 text-[#3B6FF6]" />
                <h2 className="text-[16px] font-semibold text-[#141C24]">{actionWord}</h2>
                <span className="text-[12px] text-[#9CA3AF]">{actions.length} suggested · prioritised by impact vs effort</span>
              </div>
              <div className="space-y-2.5">
                {actions.map((a, i) => <ActionRow key={a.id} a={a} index={i} onToggleTask={() => toggleTask(a.id)} />)}
              </div>
            </section>

            {/* Plan document */}
            <section>
              <h2 className="text-[16px] font-semibold text-[#141C24] mb-2">Plan document</h2>
              <div className="bg-white border border-[#E4E7EC] rounded-[10px] px-5 py-4">
                <Markdown text={seed.document} />
              </div>
            </section>
          </div>
        </div>

        {/* Right — chat */}
        <div className="w-[400px] max-w-[42vw] shrink-0 bg-white border-l border-[#E4E7EC] flex flex-col">
          <div className="shrink-0 px-4 py-3 border-b border-[#E4E7EC] flex items-center justify-between">
            <span className="inline-flex items-center gap-2 text-[13px] font-medium text-[#141C24]"><Sparkles className="w-4 h-4 text-[#3B6FF6]" /> Assistant</span>
            {reasoningActive && <button onClick={skipReasoning} className="inline-flex items-center gap-1 text-[12px] text-[#3B6FF6] hover:text-[#1D4ED8]">Skip to plan <ArrowRight className="w-3.5 h-3.5" /></button>}
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-3">
            {messages.map(m => (
              <div key={m.id} className={m.from === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                <div className={`max-w-[86%] rounded-[12px] px-3.5 py-2.5 text-[13px] leading-relaxed ${m.from === 'user' ? 'bg-[#3B6FF6] text-white' : 'bg-[#F2F4F7] text-[#141C24]'}`}>
                  <InlineMd text={m.text} light={m.from === 'user'} />
                  {m.chips && m.chips.length > 0 && (
                    <div className="mt-2 flex flex-col gap-1.5">
                      {m.chips.map(c => (
                        <button key={c} onClick={() => submitAnswer(c)} className="text-left text-[12px] px-2.5 py-1.5 rounded-[8px] bg-white border border-[#E4E7EC] text-[#141C24] hover:border-[#3B6FF6] hover:text-[#3B6FF6] transition-colors">{c}</button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="shrink-0 border-t border-[#E4E7EC] p-3">
            <div className="flex items-end gap-2">
              <textarea
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendDraft(); } }}
                rows={1}
                placeholder={reasoningActive ? 'Answer, or add context…' : 'Ask me to refine the plan…'}
                className="flex-1 resize-none max-h-28 px-3 py-2 text-[13px] text-[#141C24] border border-[#E4E7EC] rounded-[8px] outline-none focus:border-blue-400 placeholder:text-[#9CA3AF]"
              />
              <button onClick={sendDraft} disabled={!draft.trim()} className="w-9 h-9 shrink-0 flex items-center justify-center rounded-[8px] bg-blue-600 text-white hover:bg-blue-700 disabled:bg-[#C7D2FE]"><Send className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-2 bg-[#141C24] text-white text-[13px] px-4 py-3 rounded-[10px] shadow-2xl">
          <Check className="w-4 h-4 text-green-300" /> {toast}
        </div>
      )}
    </div>
  );
}

function ActionRow({ a, index, onToggleTask }: { a: TrackedAction; index: number; onToggleTask: () => void }) {
  const dim = DIMENSION_BY_KEY_ALL[a.dimensionKey];
  const complexityCls = a.complexity === 'Low' ? 'text-[#249782]' : a.complexity === 'Medium' ? 'text-[#B45309]' : 'text-[#E02424]';
  return (
    <div className="bg-white border border-[#E4E7EC] rounded-[10px] px-4 py-3">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 w-5 h-5 rounded-full bg-[#EEF2FF] text-[#4F46E5] text-[11px] font-semibold flex items-center justify-center shrink-0">{index + 1}</span>
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-medium text-[#141C24] leading-snug">{a.action}</p>
          <p className="text-[13px] text-[#637083] leading-relaxed mt-1">{a.rationale}</p>
          <div className="flex items-center flex-wrap gap-x-3 gap-y-1.5 mt-2.5 text-[12px]">
            <span className="inline-flex items-center gap-1 text-[#637083]"><CalendarDays className="w-3.5 h-3.5" /> {a.targetDate}</span>
            <span className="text-[#637083]">{dim?.short}</span>
            <span className="text-[#637083]">·</span>
            <span className="text-[#249782]">+{a.impact.toFixed(2)} impact</span>
            <span className="text-[#637083]">·</span>
            <span className={complexityCls}>{a.complexity} effort</span>
            {a.assignedTo && <><span className="text-[#637083]">·</span><span className="text-[#637083]">{a.assignedTo}</span></>}
            {a.fromInitiative && <span className="text-[11px] text-[#4F46E5] bg-[#EEF2FF] border border-[#DDE3FF] px-1.5 py-0.5 rounded-full">{a.fromInitiative}</span>}
          </div>
        </div>
        <button onClick={onToggleTask} className={`shrink-0 inline-flex items-center gap-1.5 h-8 px-2.5 text-[12px] font-medium rounded-[6px] border transition-colors ${a.taskLinked ? 'border-[#B7E4D3] text-[#249782] bg-[#F3FBF8]' : 'border-[#E4E7EC] text-[#414E62] hover:bg-[#F9FAFB]'}`}>
          {a.taskLinked ? <><Check className="w-3.5 h-3.5" /> Task linked</> : <><Plus className="w-3.5 h-3.5" /> Create task</>}
        </button>
      </div>
    </div>
  );
}

function initialMessages(entity: Entity, seed: PlanSeed): Msg[] {
  const hasLowConfidence = entity.state.overall.confidence < CONF_THRESHOLD || entity.state.dimensions.some(d => d.confidence < CONF_THRESHOLD);
  if (seed.reasoningGaps.length === 0 || !hasLowConfidence) {
    return [{ id: 'a0', from: 'ai', text: `Confidence in the current state is already high, so I’ve gone straight to a draft plan on the left. Ask me to reprioritise, change dates, or add and remove actions.` }];
  }
  const first = seed.reasoningGaps[0];
  const lows = entity.state.dimensions.filter(d => d.confidence < CONF_THRESHOLD).map(d => d.short);
  return [
    { id: 'a0', from: 'ai', text: `Before I commit to a plan for **${entity.name}**, I want to be sure I understand the situation. Confidence is low on ${lows.join(', ')} — a couple of quick questions will sharpen this. The draft on the left updates as we go.` },
    { id: 'a1', from: 'ai', text: first.question, chips: first.suggestions },
  ];
}
