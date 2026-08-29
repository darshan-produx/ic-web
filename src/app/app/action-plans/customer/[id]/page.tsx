'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Star, ChevronDown, MoreVertical } from 'lucide-react';
import { getAccountSummary, gapFor, STATUS_HEX, type AccountSummary, type Status } from '../../accountSummaryData';

const TABS = ['360 Degree View', 'Journey', 'Summary', 'Risks (6)', 'Opportunities (3)', 'Tasks (21)'];

export default function CustomerAccountPage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params?.id ?? '');
  const account = getAccountSummary(id);
  const [tab, setTab] = useState('Summary');

  if (!account) {
    return <div className="max-w-[1200px] mx-auto px-8 py-16 text-center text-[14px] text-[#637083]">Account not found.</div>;
  }

  return (
    <div className="bg-white min-h-[calc(100vh-54px)]">
      {/* Account header */}
      <div className="bg-[#F7F8FA] border-b border-[#EAECEF]">
        <div className="max-w-[1200px] mx-auto px-8">
          {/* row 1 */}
          <div className="flex items-center justify-between pt-5 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="w-1.5 h-5 rounded-full bg-[#10B981]" />
              <Star className="w-4 h-4 text-[#3B6FF6] fill-[#3B6FF6]" />
              <button className="flex items-center gap-1.5 text-[18px] font-semibold text-[#141C24]">
                {account.name} <ChevronDown className="w-4 h-4 text-[#637083]" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#8A6D00] bg-[#FBF3D9] rounded-md px-2.5 py-1">
                NPS <span className="font-semibold">{account.nps.toFixed(1)}</span>
              </span>
              {account.pillars.map(p => <PillarChip key={p.label} label={p.label} status={p.status} />)}
              <button className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[#EEF1F5]"><MoreVertical className="w-4 h-4 text-[#637083]" /></button>
            </div>
          </div>
          {/* row 2 — tabs */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              {TABS.map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t.startsWith('Summary') ? 'Summary' : t)}
                  className={`relative py-3 text-[14px] transition-colors ${tab === t || (t === 'Summary' && tab === 'Summary') ? 'text-[#141C24] font-medium' : 'text-[#637083] hover:text-[#141C24]'}`}
                >
                  {t}
                  {((tab === 'Summary' && t === 'Summary') || tab === t) && <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-[#141C24] rounded-full" />}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 text-[13px] text-[#9CA3AF]">
              <span>{account.accountType}</span><span className="text-[#D0D5DD]">|</span>
              <span>{account.care}</span><span className="text-[#D0D5DD]">|</span>
              <span>{account.renewal}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1200px] mx-auto px-8 py-6">
        {tab === 'Summary'
          ? <SummaryTab account={account} onReview={() => router.push(`/app/action-plans/customer/${account.id}/plan`)} />
          : <div className="py-24 text-center text-[14px] text-[#9CA3AF]">The “{tab}” tab isn’t part of this prototype.</div>}
      </div>
    </div>
  );
}

function PillarChip({ label, status }: { label: string; status: Status }) {
  const c = STATUS_HEX[status];
  return (
    <span className="inline-flex items-center gap-1.5 text-[13px] text-[#414E62] bg-white border border-[#E4E7EC] rounded-full px-2.5 py-1">
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.dot }} /> {label}
    </span>
  );
}

// ── Summary tab ───────────────────────────────────────────────────────────────

function SummaryTab({ account, onReview }: { account: AccountSummary; onReview: () => void }) {
  return (
    <div>
      {/* Health card */}
      <div className="bg-[#F7F8FA] border border-[#EEF0F3] rounded-[16px] p-6">
        <div className="flex items-start gap-6">
          <div className="shrink-0 flex flex-col items-center">
            <Gauge value={account.healthScore} />
            <p className="text-[14px] text-[#414E62] mt-1">Health score <span className="font-semibold text-[#DC2626]">{account.healthScore.toFixed(2)}</span></p>
          </div>
          <p className="flex-1 text-[14px] text-[#637083] leading-relaxed pt-3">{account.narrative}</p>
          <button onClick={onReview} className="shrink-0 h-9 px-4 text-[13px] font-medium text-white bg-[#2563EB] rounded-[8px] hover:bg-[#1D4ED8]">Review &amp; act</button>
        </div>
      </div>

      {/* Dimension list */}
      <div className="mt-6 space-y-2.5">
        {[...account.dimensions].sort((a, b) => gapFor(a) - gapFor(b)).map(d => {
          const gap = gapFor(d);
          return (
            <p key={d.key} className="text-[14px] text-[#637083] leading-relaxed">
              <span className="text-[#141C24]">{d.label}:</span> Score of {d.score.toFixed(2)} vs target {d.target.toFixed(2)} (Gap: {gap >= 0 ? '+' : ''}{gap.toFixed(2)}). {d.issue}
            </p>
          );
        })}
      </div>
    </div>
  );
}

// ── Gauge ─────────────────────────────────────────────────────────────────────

function Gauge({ value }: { value: number }) {
  const cx = 100, cy = 100, r = 78, stroke = 16;
  const polar = (angleDeg: number, radius: number) => {
    const a = (angleDeg * Math.PI) / 180;
    return { x: cx + radius * Math.cos(a), y: cy - radius * Math.sin(a) };
  };
  // arc path between two angles (degrees, measured CCW from east)
  const arc = (a0: number, a1: number) => {
    const p0 = polar(a0, r), p1 = polar(a1, r);
    const large = Math.abs(a0 - a1) > 180 ? 1 : 0;
    // sweep 0 because angles decrease left→right in our drawing
    return `M ${p0.x.toFixed(1)} ${p0.y.toFixed(1)} A ${r} ${r} 0 ${large} 1 ${p1.x.toFixed(1)} ${p1.y.toFixed(1)}`;
  };
  const needleAngle = 180 * (1 - Math.max(0, Math.min(1, value))); // v0→180 (left), v1→0 (right)
  const tip = polar(needleAngle, r - 10);
  return (
    <svg viewBox="0 0 200 112" width="168" height="94">
      {/* green (left) → yellow (mid) → red (right) */}
      <path d={arc(180, 120)} fill="none" stroke="#10B981" strokeWidth={stroke} strokeLinecap="round" />
      <path d={arc(118, 62)} fill="none" stroke="#EAB308" strokeWidth={stroke} />
      <path d={arc(60, 0)} fill="none" stroke="#EF4444" strokeWidth={stroke} strokeLinecap="round" />
      {/* needle */}
      <line x1={cx} y1={cy} x2={tip.x} y2={tip.y} stroke="#141C24" strokeWidth={4} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={6} fill="#141C24" />
    </svg>
  );
}
