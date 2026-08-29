'use client';

import React from 'react';
import { statusFor, STATUS_HEX, STATUS_LABEL } from './stateData';

// Overall / dimension status pill.
export function StatusPill({ score, showScore = true, size = 'md' }: { score: number; showScore?: boolean; size?: 'sm' | 'md' }) {
  const st = statusFor(score);
  const c = STATUS_HEX[st];
  const pad = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-[12px]';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${pad}`} style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.dot }} />
      {STATUS_LABEL[st]}
      {showScore && <span className="tabular-nums opacity-80">· {score.toFixed(2)}</span>}
    </span>
  );
}

// Score track with a target marker.
export function ScoreBar({ score, target, height = 6 }: { score: number; target?: number; height?: number }) {
  const c = STATUS_HEX[statusFor(score)];
  return (
    <div className="relative w-full rounded-full bg-[#EEF1F5]" style={{ height }}>
      <div className="absolute left-0 top-0 rounded-full transition-all" style={{ width: `${Math.round(score * 100)}%`, height, background: c.dot }} />
      {target != null && (
        <span className="absolute top-1/2 -translate-y-1/2 w-[2px] rounded-full bg-[#414E62]" style={{ left: `calc(${Math.round(target * 100)}% - 1px)`, height: height + 4 }} title={`Target ${target.toFixed(2)}`} />
      )}
    </div>
  );
}

// Confidence as 5 segmented dots.
export function ConfidenceMeter({ value, showLabel = true }: { value: number; showLabel?: boolean }) {
  const filled = Math.round(value * 5);
  const low = value < 0.7;
  return (
    <span className="inline-flex items-center gap-1.5" title={`Confidence ${value.toFixed(2)}`}>
      <span className="flex items-center gap-0.5">
        {[0, 1, 2, 3, 4].map(i => (
          <span key={i} className="w-1.5 h-3 rounded-[1px] transition-colors" style={{ background: i < filled ? (low ? '#F59E0B' : '#3B6FF6') : '#E4E7EC' }} />
        ))}
      </span>
      {showLabel && <span className={`text-[12px] tabular-nums ${low ? 'text-[#B45309]' : 'text-[#637083]'}`}>{value.toFixed(2)}</span>}
    </span>
  );
}

// Ring gauge for the overall score.
export function ScoreRing({ score, size = 120 }: { score: number; size?: number }) {
  const st = statusFor(score);
  const c = STATUS_HEX[st];
  const stroke = 10;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * score;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#EEF1F5" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={c.dot} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={`${dash} ${circ - dash}`} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[28px] font-bold text-[#141C24] leading-none tabular-nums">{score.toFixed(2)}</span>
        <span className="mt-1 text-[12px] font-medium" style={{ color: c.text }}>{STATUS_LABEL[st]}</span>
      </div>
    </div>
  );
}

// Minimal markdown: ## heading, - bullets, **bold**, `code`.
export function Markdown({ text, className = '' }: { text: string; className?: string }) {
  const lines = text.split('\n');
  const out: React.ReactNode[] = [];
  let bullets: string[] = [];
  const flush = (key: string) => {
    if (bullets.length) {
      out.push(<ul key={key} className="list-disc pl-5 space-y-1 my-2">{bullets.map((b, i) => <li key={i} className="text-[13px] text-[#414E62] leading-relaxed">{inline(b)}</li>)}</ul>);
      bullets = [];
    }
  };
  lines.forEach((raw, i) => {
    const line = raw.trimEnd();
    if (line.startsWith('## ')) { flush(`f${i}`); out.push(<h4 key={i} className="text-[14px] font-semibold text-[#141C24] mt-3 mb-1.5 first:mt-0">{inline(line.slice(3))}</h4>); }
    else if (line.startsWith('- ')) bullets.push(line.slice(2));
    else if (line.trim() === '') flush(`f${i}`);
    else { flush(`f${i}`); out.push(<p key={i} className="text-[13px] text-[#414E62] leading-relaxed my-1.5">{inline(line)}</p>); }
  });
  flush('end');
  return <div className={className}>{out}</div>;
}

function inline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter(Boolean);
  return parts.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**')) return <strong key={i} className="font-semibold text-[#141C24]">{p.slice(2, -2)}</strong>;
    if (p.startsWith('`') && p.endsWith('`')) return <code key={i} className="px-1 py-0.5 rounded bg-[#F2F4F7] text-[12px]">{p.slice(1, -1)}</code>;
    return <React.Fragment key={i}>{p}</React.Fragment>;
  });
}

// Chat-bubble bold-only markdown.
export function InlineMd({ text, light }: { text: string; light?: boolean }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  return <p>{parts.map((p, i) => p.startsWith('**') && p.endsWith('**')
    ? <strong key={i} className={light ? 'font-semibold' : 'font-semibold text-[#141C24]'}>{p.slice(2, -2)}</strong>
    : <React.Fragment key={i}>{p}</React.Fragment>)}</p>;
}
