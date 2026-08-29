'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ChevronLeft, ChevronDown, Plus, Minus, Sparkles, X, Send, Calendar, Pencil, Check, CheckCircle2,
} from 'lucide-react';
import {
  getAccountSummary, STATUS_HEX, type AccountSummary, type SummaryDimension, type ActionItem,
} from '../../../accountSummaryData';

type Mode = 'current-state' | 'generating' | 'actions';
interface Msg { id: string; from: 'ai' | 'user'; text: string; chips?: string[] }

export default function ActionPlanPage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params?.id ?? '');
  const account = getAccountSummary(id);

  const [mode, setMode] = useState<Mode>('current-state');
  const [target, setTarget] = useState(account?.planTarget ?? 0.77);
  const [expanded, setExpanded] = useState<string>(account?.dimensions[0]?.key ?? '');
  const [chatOpen, setChatOpen] = useState(false);
  const [activated, setActivated] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [actions, setActions] = useState<ActionItem[]>(() => account?.actions ?? []);
  const [gaps, setGaps] = useState(() => (account?.reasoningGaps ?? []).map(g => ({ ...g, answered: false })));
  const [messages, setMessages] = useState<Msg[]>(() => (account ? initialMessages(account) : []));
  const [draft, setDraft] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  if (!account) {
    return <div className="max-w-[1100px] mx-auto px-8 py-16 text-center text-[14px] text-[#637083]">Account not found.</div>;
  }

  const flash = (m: string) => { setToast(m); window.setTimeout(() => setToast(null), 2800); };
  const activeGap = gaps.find(g => !g.answered);

  function develop() {
    setMode('generating');
    window.setTimeout(() => { setMode('actions'); setActivated(true); setShowConfirm(true); }, 1200);
  }
  function activateFromChat() {
    setActivated(true);
    setShowConfirm(true);
    if (mode === 'current-state' || mode === 'generating') setMode('actions');
  }

  function answer(text: string) {
    const gap = activeGap;
    if (!gap) return;
    setMessages(prev => [...prev, { id: `u${prev.length}`, from: 'user', text }]);
    setGaps(prev => prev.map(g => g.id === gap.id ? { ...g, answered: true } : g));
    const remaining = gaps.filter(g => !g.answered && g.id !== gap.id);
    window.setTimeout(() => {
      if (remaining.length > 0) {
        const next = remaining[0];
        setMessages(prev => [...prev,
          { id: `a${prev.length}`, from: 'ai', text: `Got it — I’ve updated the current state on the left.` },
          { id: `a${prev.length + 1}`, from: 'ai', text: next.question, chips: next.suggestions },
        ]);
      } else {
        setMessages(prev => [...prev, { id: `a${prev.length}`, from: 'ai', text: `That sharpens my understanding. I’ve drafted the action plan — review the actions on the left and confirm.` }]);
        activateFromChat();
      }
    }, 240);
  }

  function skipAndActivate() {
    setMessages(prev => [...prev, { id: `u${prev.length}`, from: 'user', text: 'Skipped' }]);
    activateFromChat();
  }

  function sendDraft() {
    const t = draft.trim();
    if (!t) return;
    setDraft('');
    if (activeGap) answer(t);
    else setMessages(prev => [...prev, { id: `u${prev.length}`, from: 'user', text: t }, { id: `a${prev.length + 1}`, from: 'ai', text: 'Noted — I’ve reflected that in the plan.' }]);
  }

  function createTask(aid: string) {
    setActions(prev => prev.map(a => a.id === aid ? { ...a, taskLinked: true } : a));
    const a = actions.find(x => x.id === aid);
    if (a && !a.taskLinked) flash(`Task created and linked to “${a.action}”.`);
  }

  return (
    <div className="h-[calc(100vh-54px)] bg-white relative overflow-hidden">
      {/* Left column — pads right to make room as the chat slides in */}
      <div className="h-full overflow-y-auto transition-[padding] duration-300 ease-in-out" style={{ paddingRight: chatOpen ? 420 : 0 }}>
        <div className="max-w-[760px] mx-auto px-8 py-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <button onClick={() => router.push(`/app/action-plans/customer/${account.id}`)} className="w-8 h-8 rounded-full border border-[#E4E7EC] flex items-center justify-center hover:bg-[#F2F4F7] shrink-0 mt-0.5">
                <ChevronLeft className="w-4 h-4 text-[#414E62]" />
              </button>
              <div>
                <h1 className="text-[22px] font-bold text-[#141C24] leading-tight">{account.name} action plan</h1>
                <div className="mt-1.5 flex items-center gap-3 text-[14px] text-[#637083]">
                  <span>From <span className="font-semibold text-[#141C24]">{account.planFrom.toFixed(2)}</span></span>
                  <span className="text-[#9CA3AF]">→</span>
                  <span>Target <span className="font-semibold text-[#141C24]">{target.toFixed(2)}</span></span>
                  {!activated && (
                    <span className="inline-flex items-center gap-1">
                      <button onClick={() => setTarget(t => Math.max(account.planFrom, Math.round((t - 0.01) * 100) / 100))} className="w-6 h-6 flex items-center justify-center rounded-md border border-[#E4E7EC] text-[#637083] hover:bg-[#F2F4F7]"><Minus className="w-3 h-3" /></button>
                      <button onClick={() => setTarget(t => Math.min(1, Math.round((t + 0.01) * 100) / 100))} className="w-6 h-6 flex items-center justify-center rounded-md border border-[#E4E7EC] text-[#637083] hover:bg-[#F2F4F7]"><Plus className="w-3 h-3" /></button>
                    </span>
                  )}
                  <span className="text-[#D0D5DD]">|</span>
                  <span>Due date: <span className={`text-[#141C24] ${activated ? '' : 'underline underline-offset-2 cursor-pointer'}`}>{account.planDue}</span></span>
                </div>
              </div>
            </div>
            {/* Right-side action */}
            {activated ? (
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => setChatOpen(true)} className="h-9 px-3.5 text-[13px] font-medium text-[#141C24] border border-[#E4E7EC] rounded-[8px] hover:bg-[#F9FAFB]">Chat with agent</button>
                <span className="inline-flex items-center gap-1.5 h-9 px-3 text-[13px] font-medium text-[#059669] bg-[#E7F6EF] rounded-[8px]"><CheckCircle2 className="w-4 h-4" /> Activated</span>
              </div>
            ) : (
              <button onClick={develop} className="shrink-0 h-9 px-4 text-[13px] font-medium text-white bg-[#2563EB] rounded-[8px] hover:bg-[#1D4ED8]">Develop an action plan</button>
            )}
          </div>

          {/* Banner */}
          {activated && showConfirm ? (
            <div className="mt-5 flex items-center justify-between gap-3 bg-[#EEF4FF] border border-[#DCE6FF] rounded-[12px] px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-[#2563EB] flex items-center justify-center shrink-0"><Sparkles className="w-4 h-4 text-white" /></span>
                <div>
                  <p className="text-[14px] font-medium text-[#141C24]">Improving a few low-confidence scores, you can review and confirm.</p>
                  <p className="text-[12px] text-[#637083]">Please review the changes and confirm.</p>
                </div>
              </div>
              <button onClick={() => setShowConfirm(false)} className="shrink-0 h-8 px-3 text-[13px] font-medium text-[#2563EB] hover:bg-white/60 rounded-[6px]">Confirm</button>
            </div>
          ) : !activated ? (
            <div className="mt-5 flex items-center justify-between gap-3 bg-[#EEF4FF] border border-[#DCE6FF] rounded-[12px] px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-[#2563EB] flex items-center justify-center shrink-0"><Sparkles className="w-4 h-4 text-white" /></span>
                <div>
                  <p className="text-[14px] font-medium text-[#141C24]">Have a question about this?</p>
                  <p className="text-[12px] text-[#637083]">Chat with an agent to understand it better</p>
                </div>
              </div>
              <button onClick={() => setChatOpen(true)} className="shrink-0 h-8 px-3 text-[13px] font-medium text-[#141C24] bg-white border border-[#E4E7EC] rounded-[6px] hover:bg-[#F9FAFB]">Ask an agent</button>
            </div>
          ) : null}

          {/* Narrative */}
          <p className="mt-5 text-[15px] text-[#141C24] leading-relaxed">{account.overallState}</p>

          {/* Body by mode */}
          {mode === 'current-state' && (
            <div className="mt-6">
              <h2 className="text-[14px] font-medium text-[#141C24] mb-3">Current state</h2>
              <div className="space-y-3">
                {account.dimensions.map(d => (
                  <DimensionCard key={d.key} d={d} open={expanded === d.key} onToggle={() => setExpanded(expanded === d.key ? '' : d.key)} />
                ))}
              </div>
            </div>
          )}

          {mode === 'generating' && (
            <div className="mt-6">
              <h2 className="text-[14px] font-medium text-[#141C24] mb-3">Actions</h2>
              <div className="space-y-4">
                {[0, 1, 2, 3].map(i => <div key={i} className="h-[132px] rounded-[12px] bg-[#F3F4F6] animate-pulse" />)}
              </div>
            </div>
          )}

          {mode === 'actions' && (
            <div className="mt-6">
              <h2 className="text-[14px] font-medium text-[#141C24] mb-3">Actions</h2>
              <div className="space-y-4">
                {actions.map(a => <ActionCard key={a.id} a={a} onCreateTask={() => createTask(a.id)} />)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chat drawer — slides in from the right, slides out on close */}
      <div
        className={`absolute top-0 right-0 h-full w-[420px] bg-white border-l border-[#E4E7EC] flex flex-col shadow-[-10px_0_28px_rgba(16,24,40,0.06)] transition-transform duration-300 ease-in-out ${chatOpen ? '' : 'pointer-events-none'}`}
        style={{ transform: chatOpen ? 'translateX(0)' : 'translateX(100%)' }}
        aria-hidden={!chatOpen}
      >
          <div className="shrink-0 px-5 py-4 border-b border-[#E4E7EC] flex items-center justify-between">
            <span className="text-[15px] font-semibold text-[#141C24]">Chat with agent</span>
            <button onClick={() => setChatOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[#F2F4F7]"><X className="w-4 h-4 text-[#637083]" /></button>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4 flex flex-col justify-end">
            <div className="space-y-3">
              {messages.map(m => (
                <div key={m.id} className={m.from === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                  {m.from === 'ai' ? (
                    <div className="flex items-start gap-2 max-w-[92%]">
                      <span className="w-6 h-6 rounded-full bg-gradient-to-br from-[#3B6FF6] to-[#6366F1] flex items-center justify-center shrink-0 mt-0.5"><Sparkles className="w-3.5 h-3.5 text-white" /></span>
                      <div>
                        <p className="text-[13px] text-[#141C24] leading-relaxed">{m.text}</p>
                        {m.chips && (
                          <div className="mt-2.5 flex flex-col gap-2">
                            {m.chips.map(c => (
                              <button key={c} onClick={() => answer(c)} className="text-left text-[13px] px-3 py-2 rounded-[8px] border border-[#BFD3FF] text-[#2563EB] hover:bg-[#EEF4FF] transition-colors">{c}</button>
                            ))}
                            <button onClick={skipAndActivate} className="self-start mt-1 text-[13px] px-3 py-1.5 rounded-[8px] border border-[#E4E7EC] text-[#414E62] hover:bg-[#F9FAFB]">Skip and activate</button>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="max-w-[86%] rounded-[10px] bg-[#EEF1F5] text-[#141C24] px-3.5 py-2 text-[13px]">{m.text}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="shrink-0 p-4">
            <div className="flex items-center gap-2 border border-[#E4E7EC] rounded-full pl-4 pr-1.5 py-1.5">
              <input value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') sendDraft(); }} placeholder="Ask me anything" className="flex-1 text-[13px] text-[#141C24] outline-none placeholder:text-[#9CA3AF] bg-transparent" />
              <button onClick={sendDraft} className="w-8 h-8 flex items-center justify-center rounded-full bg-[#2563EB] text-white hover:bg-[#1D4ED8]"><Send className="w-3.5 h-3.5" /></button>
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

// ── Current-state dimension accordion card ────────────────────────────────────

function DimensionCard({ d, open, onToggle }: { d: SummaryDimension; open: boolean; onToggle: () => void }) {
  const c = STATUS_HEX[d.status];
  return (
    <div className="border border-[#E4E7EC] rounded-[14px] overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#FAFBFC] transition-colors">
        <span className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: c.dot }} />
          <span className="text-[15px] font-medium text-[#141C24]">{d.label}</span>
        </span>
        <ChevronDown className={`w-5 h-5 text-[#9CA3AF] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-5 pb-5 pt-0">
          <p className="text-[14px] text-[#637083] leading-relaxed">{d.narrative}</p>
          <p className="mt-4 text-[14px] font-medium text-[#141C24]">Key Breakdown &amp; Impact</p>
          <ul className="mt-1.5 space-y-1.5">
            {d.breakdown.map((b, i) => (
              <li key={i} className="flex gap-2 text-[14px] text-[#637083] leading-relaxed">
                <span className="text-[#9CA3AF] mt-0.5">•</span>
                <span><span className="font-medium text-[#414E62]">{b.label}:</span> {b.text}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[14px] font-medium text-[#141C24]">Recommended Action Plan</p>
          <ul className="mt-1.5 space-y-1.5">
            {d.recommended.map((r, i) => (
              <li key={i} className="flex gap-2 text-[14px] text-[#637083] leading-relaxed">
                <span className="text-[#9CA3AF] mt-0.5">•</span>
                <span><span className="font-medium text-[#414E62]">{r.label}:</span> {r.text}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ── Action card ───────────────────────────────────────────────────────────────

function ActionCard({ a, onCreateTask }: { a: ActionItem; onCreateTask: () => void }) {
  return (
    <div className="border border-[#E4E7EC] rounded-[14px] px-5 py-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[15px] font-medium text-[#141C24] leading-snug">{a.action}</p>
          <p className="text-[13px] text-[#9CA3AF] leading-relaxed mt-1.5">{a.rationale}</p>
        </div>
        <button
          onClick={onCreateTask}
          className={`shrink-0 h-8 px-3 text-[13px] font-medium rounded-[8px] border transition-colors ${a.taskLinked ? 'border-[#6EE7B7] text-[#059669] bg-[#ECFDF5]' : 'border-[#E4E7EC] text-[#141C24] hover:bg-[#F9FAFB]'}`}
        >
          {a.taskLinked ? 'Task linked' : 'Create task'}
        </button>
      </div>
      <div className="mt-3.5 flex items-center gap-2.5 text-[13px] text-[#637083]">
        <span className="inline-flex items-center gap-1.5"><Calendar className="w-4 h-4 text-[#9CA3AF]" /> {a.date}</span>
        <Pencil className="w-3.5 h-3.5 text-[#C0C6CF]" />
        <span className="text-[#D0D5DD]">|</span>
        <span>{a.dimension}</span>
        <span className="text-[#D0D5DD]">|</span>
        <span className="text-[#059669]">+{a.impact.toFixed(2)} impact</span>
        <span className="text-[#D0D5DD]">|</span>
        <span>{a.assignee}</span>
      </div>
    </div>
  );
}

function initialMessages(account: AccountSummary): Msg[] {
  const first = account.reasoningGaps[0];
  return [
    { id: 'a0', from: 'ai', text: `Before I commit to a plan for ${account.name}, I want to be sure I understand the situation. Confidence is low on Adoption, Context — a couple of quick questions will sharpen this. The draft on the left updates as we go.` },
    ...(first ? [{ id: 'a1', from: 'ai' as const, text: first.question, chips: first.suggestions }] : []),
  ];
}
