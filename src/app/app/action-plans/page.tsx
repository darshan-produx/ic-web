'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Target, ArrowRight, Sparkles } from 'lucide-react';
import { ENTITIES, type Entity, type EntityKind } from './stateData';
import { StatusPill } from './stateUi';

// A deliberately minimal launcher. The Action Plan feature attaches to any Account
// or Opportunity — this is just the demo entry into a few sample entities.
export default function ActionPlansIndex() {
  const router = useRouter();
  const accounts = ENTITIES.filter(e => e.kind === 'account');
  const opportunities = ENTITIES.filter(e => e.kind === 'opportunity');

  return (
    <div className="bg-[#FAFBFC] min-h-[calc(100vh-54px)]">
      <div className="max-w-[880px] mx-auto px-8 py-8">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#3B6FF6]" />
          <h1 className="text-[22px] font-bold text-[#141C24] leading-none">Action Plan</h1>
        </div>
        <p className="text-[13px] text-[#637083] mt-2 leading-relaxed max-w-[620px]">
          The same construct sits on any <span className="font-medium text-[#414E62]">Account</span> or <span className="font-medium text-[#414E62]">Opportunity</span>: read its <span className="font-medium text-[#414E62]">State summary</span>, then develop an Action Plan to move it from where it is to its target. Open a sample entity to see it.
        </p>

        <Group kind="account" title="Accounts" entities={accounts} onOpen={e => router.push(e.id === 'acc-reliance' ? '/app/action-plans/customer/reliance-digital' : `/app/action-plans/account/${e.id}`)} />
        <Group kind="opportunity" title="Opportunities" entities={opportunities} onOpen={e => router.push(`/app/action-plans/opportunity/${e.id}`)} />
      </div>
    </div>
  );
}

function Group({ kind, title, entities, onOpen }: { kind: EntityKind; title: string; entities: Entity[]; onOpen: (e: Entity) => void }) {
  const Icon = kind === 'account' ? Building2 : Target;
  return (
    <div className="mt-7">
      <p className="text-[12px] font-semibold uppercase tracking-wide text-[#9CA3AF] mb-2">{title}</p>
      <div className="grid grid-cols-2 gap-3">
        {entities.map(e => (
          <button key={e.id} onClick={() => onOpen(e)} className="group text-left bg-white border border-[#E4E7EC] rounded-[12px] p-4 hover:border-[#CED2DA] hover:shadow-sm transition-all">
            <div className="flex items-start justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] text-[#637083]"><Icon className="w-3.5 h-3.5" /> {kind === 'account' ? 'Account' : 'Opportunity'}</span>
              <StatusPill score={e.state.overall.score} size="sm" />
            </div>
            <p className="text-[14px] font-medium text-[#141C24] mt-2 leading-snug group-hover:text-[#3B6FF6]">{e.name}</p>
            <p className="text-[12px] text-[#637083] mt-0.5">{e.customer} · {e.meta.map(m => m.value).join(' · ')}</p>
            <span className="inline-flex items-center gap-1 text-[12px] text-[#3B6FF6] mt-3">Open <ArrowRight className="w-3.5 h-3.5" /></span>
          </button>
        ))}
      </div>
    </div>
  );
}
