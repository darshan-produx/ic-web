'use client';

import React, { useMemo, useState } from 'react';
import { X, Plus, Trash2, AlertTriangle, Sparkles } from 'lucide-react';
import type { Pattern } from './PatternsGridView';

// ── Shared modal shell ────────────────────────────────────────────────────────

function ModalShell({
  title, description, children, onCancel, footer, width = 520,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  onCancel: () => void;
  footer: React.ReactNode;
  width?: number;
}) {
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40">
      <div
        className="bg-white rounded-xl shadow-2xl max-h-[88vh] flex flex-col overflow-hidden"
        style={{ width }}
      >
        <div className="flex items-start justify-between px-6 py-4 border-b border-[#E4E7EC]">
          <div className="min-w-0">
            <h3 className="text-[16px] font-semibold text-[#141C24]">{title}</h3>
            {description && (
              <p className="text-[12px] text-[#637083] mt-0.5 truncate">{description}</p>
            )}
          </div>
          <button
            onClick={onCancel}
            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[#F2F4F7] transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-[#637083]" />
          </button>
        </div>
        <div className="flex-1 overflow-auto px-6 py-5">{children}</div>
        <div className="px-6 py-4 border-t border-[#E4E7EC] flex items-center justify-end gap-2">{footer}</div>
      </div>
    </div>
  );
}

// ── 1. Add pattern ────────────────────────────────────────────────────────────

export interface NewPatternInput {
  title: string;
  description: string;
  trackingEnabled: boolean;        // false = exclusion (stop tracking)
  scope: 'all_open' | 'unclassified'; // run classification on
}

export function AddPatternModal({
  onCancel, onSubmit,
}: {
  onCancel: () => void;
  onSubmit: (input: NewPatternInput) => void;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [trackingEnabled, setTrackingEnabled] = useState(true);
  const [scope, setScope] = useState<NewPatternInput['scope']>('unclassified');

  const canSubmit = title.trim().length > 0;
  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit({ title: title.trim(), description: description.trim(), trackingEnabled, scope });
  };

  return (
    <ModalShell
      title="New pattern"
      description="Create a new signal pattern."
      onCancel={onCancel}
      footer={
        <>
          <button
            onClick={onCancel}
            className="px-4 h-9 text-[13px] font-medium text-[#637083] border border-[#E4E7EC] bg-white rounded-[8px] hover:bg-[#F2F4F7]"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="px-4 h-9 text-[13px] font-medium text-white bg-blue-600 rounded-[8px] hover:bg-blue-700 disabled:bg-[#E4E7EC] disabled:text-[#9CA3AF] disabled:cursor-not-allowed"
          >
            Create pattern
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-[13px] font-medium text-[#141C24] mb-1.5">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            autoFocus
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Onboarding delays for mid-market clients"
            className="w-full h-10 px-3 text-[14px] text-[#141C24] border border-[#E4E7EC] rounded-[8px] outline-none focus:border-blue-400 placeholder:text-[#9CA3AF]"
          />
        </div>

        <div>
          <label className="block text-[13px] font-medium text-[#141C24] mb-1.5">
            Description
          </label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
            placeholder="What signals does this pattern capture?"
            className="w-full px-3 py-2 text-[14px] text-[#141C24] border border-[#E4E7EC] rounded-[8px] outline-none focus:border-blue-400 placeholder:text-[#9CA3AF] resize-none"
          />
        </div>

        <fieldset>
          <legend className="block text-[13px] font-medium text-[#141C24] mb-2">Type</legend>
          <div className="space-y-2">
            <RadioRow
              checked={trackingEnabled}
              onChange={() => setTrackingEnabled(true)}
              label="Track signals (inclusion)"
              hint="New signals matching this pattern will be created."
            />
            <RadioRow
              checked={!trackingEnabled}
              onChange={() => setTrackingEnabled(false)}
              label="Stop tracking (exclusion)"
              hint="Signals matching this pattern will not be created."
            />
          </div>
        </fieldset>

        {trackingEnabled && (
          <fieldset>
            <legend className="block text-[13px] font-medium text-[#141C24] mb-2">
              Run classification on
            </legend>
            <div className="space-y-2">
              <RadioRow
                checked={scope === 'unclassified'}
                onChange={() => setScope('unclassified')}
                label="Unclassified signals only"
                hint="Only signals not already in another pattern."
              />
              <RadioRow
                checked={scope === 'all_open'}
                onChange={() => setScope('all_open')}
                label="All open signals"
                hint="Re-evaluate every open signal against the new pattern."
              />
            </div>
          </fieldset>
        )}
      </div>
    </ModalShell>
  );
}

// ── 2. Edit pattern (title + description) ────────────────────────────────────

export interface PatternEdit {
  title: string;
  description: string;
}

export function EditPatternModal({
  pattern, onCancel, onSubmit,
}: {
  pattern: Pattern;
  onCancel: () => void;
  onSubmit: (edit: PatternEdit) => void;
}) {
  const [title, setTitle] = useState(pattern.title);
  const [description, setDescription] = useState(pattern.description);
  const canSubmit = title.trim().length > 0 && (title.trim() !== pattern.title || description.trim() !== pattern.description);

  return (
    <ModalShell
      title="Edit pattern"
      description="Sharpen the title and description so signal classification stays accurate."
      onCancel={onCancel}
      footer={
        <>
          <button
            onClick={onCancel}
            className="px-4 h-9 text-[13px] font-medium text-[#637083] border border-[#E4E7EC] bg-white rounded-[8px] hover:bg-[#F2F4F7]"
          >
            Cancel
          </button>
          <button
            onClick={() => canSubmit && onSubmit({ title: title.trim(), description: description.trim() })}
            disabled={!canSubmit}
            className="px-4 h-9 text-[13px] font-medium text-white bg-blue-600 rounded-[8px] hover:bg-blue-700 disabled:bg-[#E4E7EC] disabled:text-[#9CA3AF] disabled:cursor-not-allowed"
          >
            Save
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-[13px] font-medium text-[#141C24] mb-1.5">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            autoFocus
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full h-10 px-3 text-[14px] text-[#141C24] border border-[#E4E7EC] rounded-[8px] outline-none focus:border-blue-400"
          />
        </div>
        <div>
          <label className="block text-[13px] font-medium text-[#141C24] mb-1.5">Description</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 text-[14px] text-[#141C24] border border-[#E4E7EC] rounded-[8px] outline-none focus:border-blue-400 resize-none"
          />
        </div>
      </div>
    </ModalShell>
  );
}

// ── 3. Reclassify ────────────────────────────────────────────────────────────

export type ReclassifyScope = 'this_pattern_only' | 'this_pattern_and_unassigned';

export function ReclassifyModal({
  pattern, prompt, onSkip, onCancel, onSubmit,
}: {
  pattern: Pattern;
  /** When true, the modal is being shown as a follow-up to another action. */
  prompt?: boolean;
  onSkip?: () => void;
  onCancel: () => void;
  onSubmit: (scope: ReclassifyScope) => void;
}) {
  const [scope, setScope] = useState<ReclassifyScope>('this_pattern_only');

  return (
    <ModalShell
      title={prompt ? 'Reclassify signals?' : 'Reclassify signals'}
      description={prompt
        ? 'The pattern was updated. Rerun classification so signals match the new criteria.'
        : `Rerun classification for "${pattern.title}".`}
      onCancel={onCancel}
      footer={
        <>
          {prompt && onSkip ? (
            <button
              onClick={onSkip}
              className="px-4 h-9 text-[13px] font-medium text-[#637083] border border-[#E4E7EC] bg-white rounded-[8px] hover:bg-[#F2F4F7]"
            >
              Skip
            </button>
          ) : (
            <button
              onClick={onCancel}
              className="px-4 h-9 text-[13px] font-medium text-[#637083] border border-[#E4E7EC] bg-white rounded-[8px] hover:bg-[#F2F4F7]"
            >
              Cancel
            </button>
          )}
          <button
            onClick={() => onSubmit(scope)}
            className="px-4 h-9 text-[13px] font-medium text-white bg-blue-600 rounded-[8px] hover:bg-blue-700"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5 inline" />
            Reclassify
          </button>
        </>
      }
    >
      <fieldset>
        <legend className="block text-[13px] font-medium text-[#141C24] mb-2">Scope</legend>
        <div className="space-y-2">
          <RadioRow
            checked={scope === 'this_pattern_only'}
            onChange={() => setScope('this_pattern_only')}
            label="Signals in this pattern only"
            hint="Re-check existing signals to confirm they still match."
          />
          <RadioRow
            checked={scope === 'this_pattern_and_unassigned'}
            onChange={() => setScope('this_pattern_and_unassigned')}
            label="This pattern + unassigned signals"
            hint="Also pull in any unclassified signals that now match."
          />
        </div>
      </fieldset>
    </ModalShell>
  );
}

// ── 4. Merge ─────────────────────────────────────────────────────────────────

export function MergePatternsModal({
  patterns, onCancel, onSubmit,
}: {
  patterns: Pattern[];
  onCancel: () => void;
  onSubmit: (input: { title: string; description: string }) => void;
}) {
  // Pre-fill with an LLM-suggested merged title + description so the user can tweak.
  const suggestedTitle = useMemo(() => {
    const titles = patterns.map(p => p.title);
    if (titles.length === 0) return '';
    const common = titles[0].split(' ').slice(0, 3).join(' ');
    return `${common} (merged)`;
  }, [patterns]);
  const suggestedDescription = useMemo(
    () => `Merged from ${patterns.length} patterns: ${patterns.map(p => `"${p.title}"`).join(', ')}.`,
    [patterns]
  );

  const [title, setTitle] = useState(suggestedTitle);
  const [description, setDescription] = useState(suggestedDescription);
  const canSubmit = title.trim().length > 0;
  const totalOpenSignals = patterns.reduce((s, p) => s + p.openSignals, 0);
  const totalImpacted = patterns.reduce((s, p) => s + p.impactedCustomers, 0);

  return (
    <ModalShell
      title={`Merge ${patterns.length} patterns`}
      description="Combine the selected patterns into one. The system suggests a title and description — tweak as needed."
      onCancel={onCancel}
      footer={
        <>
          <button
            onClick={onCancel}
            className="px-4 h-9 text-[13px] font-medium text-[#637083] border border-[#E4E7EC] bg-white rounded-[8px] hover:bg-[#F2F4F7]"
          >
            Cancel
          </button>
          <button
            onClick={() => canSubmit && onSubmit({ title: title.trim(), description: description.trim() })}
            disabled={!canSubmit}
            className="px-4 h-9 text-[13px] font-medium text-white bg-blue-600 rounded-[8px] hover:bg-blue-700 disabled:bg-[#E4E7EC] disabled:text-[#9CA3AF] disabled:cursor-not-allowed"
          >
            Merge
          </button>
        </>
      }
    >
      <div className="mb-4 border border-[#E4E7EC] rounded-[8px] overflow-hidden">
        <p className="px-3 py-2 text-[11px] uppercase tracking-wide text-[#9CA3AF] font-semibold bg-[#F9FAFB] border-b border-[#E4E7EC]">
          Patterns being merged
        </p>
        <ul className="divide-y divide-[#F2F4F7]">
          {patterns.map(p => (
            <li key={p.id} className="px-3 py-2.5 flex items-center justify-between gap-3">
              <span className="text-[13px] text-[#141C24] truncate">{p.title}</span>
              <span className="text-[11px] text-[#9CA3AF] shrink-0">
                {p.openSignals} open · {p.impactedCustomers} customers
              </span>
            </li>
          ))}
        </ul>
        <div className="px-3 py-2 bg-[#F9FAFB] border-t border-[#E4E7EC] flex items-center justify-between">
          <span className="text-[12px] font-medium text-[#141C24]">Aggregated</span>
          <span className="text-[11px] text-[#637083]">
            {totalOpenSignals} open · {totalImpacted} customers
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-[13px] font-medium text-[#141C24] mb-1.5">
            <Sparkles className="w-3 h-3 inline-block mr-1 text-blue-600" />
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full h-10 px-3 text-[14px] text-[#141C24] border border-[#E4E7EC] rounded-[8px] outline-none focus:border-blue-400"
          />
        </div>
        <div>
          <label className="block text-[13px] font-medium text-[#141C24] mb-1.5">
            <Sparkles className="w-3 h-3 inline-block mr-1 text-blue-600" />
            Description
          </label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 text-[14px] text-[#141C24] border border-[#E4E7EC] rounded-[8px] outline-none focus:border-blue-400 resize-none"
          />
        </div>
      </div>
    </ModalShell>
  );
}

// ── 5. Delete ────────────────────────────────────────────────────────────────

export type DeleteScope = 'pattern_only' | 'pattern_and_signals';

export function DeletePatternModal({
  patterns, onCancel, onConfirm,
}: {
  patterns: Pattern[];
  onCancel: () => void;
  onConfirm: (scope: DeleteScope) => void;
}) {
  const [scope, setScope] = useState<DeleteScope>('pattern_only');
  const isBulk = patterns.length > 1;

  return (
    <ModalShell
      title={isBulk ? `Delete ${patterns.length} patterns?` : 'Delete pattern?'}
      onCancel={onCancel}
      footer={
        <>
          <button
            onClick={onCancel}
            className="px-4 h-9 text-[13px] font-medium text-[#637083] border border-[#E4E7EC] bg-white rounded-[8px] hover:bg-[#F2F4F7]"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(scope)}
            className="px-4 h-9 text-[13px] font-medium text-white bg-red-600 rounded-[8px] hover:bg-red-700"
          >
            Delete{isBulk ? ` ${patterns.length}` : ''}
          </button>
        </>
      }
    >
      <div className="flex items-start gap-3 mb-4 p-3 bg-red-50 border border-red-100 rounded-[8px]">
        <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
        <p className="text-[13px] text-red-900 leading-snug">
          This action is permanent. Choose what should happen to the signals currently associated with {isBulk ? 'these patterns' : 'this pattern'}.
        </p>
      </div>

      <fieldset className="mb-4">
        <legend className="block text-[13px] font-medium text-[#141C24] mb-2">What to delete</legend>
        <div className="space-y-2">
          <RadioRow
            checked={scope === 'pattern_only'}
            onChange={() => setScope('pattern_only')}
            label={`Delete only the pattern${isBulk ? 's' : ''}`}
            hint="Signals stay but become unclassified."
          />
          <RadioRow
            checked={scope === 'pattern_and_signals'}
            onChange={() => setScope('pattern_and_signals')}
            label={`Delete pattern${isBulk ? 's' : ''} and all associated signals`}
            hint="Signals will also be permanently removed."
          />
        </div>
      </fieldset>

      <ul className="space-y-1.5">
        {patterns.map(p => (
          <li key={p.id} className="text-[12px] text-[#637083] flex gap-2">
            <span className="text-[#D0D5DD]">·</span>
            <span className="truncate">{p.title}</span>
          </li>
        ))}
      </ul>
    </ModalShell>
  );
}

// ── 6. Fork — just title + description per new pattern; LLM handles signal reassignment ─

export interface ForkResult {
  forks: { title: string; description: string }[];
}

export function SplitPatternModal({
  pattern, onCancel, onSubmit,
}: {
  pattern: Pattern;
  onCancel: () => void;
  onSubmit: (result: ForkResult) => void;
}) {
  const MAX_FORKS = 2;
  const [forks, setForks] = useState<{ title: string; description: string }[]>([
    { title: '', description: '' },
  ]);

  const updateFork = (i: number, key: 'title' | 'description', value: string) =>
    setForks(prev => prev.map((f, idx) => (idx === i ? { ...f, [key]: value } : f)));

  const addFork = () => {
    if (forks.length >= MAX_FORKS) return;
    setForks(prev => [...prev, { title: '', description: '' }]);
  };

  const removeFork = (i: number) => {
    if (forks.length <= 1) return;
    setForks(prev => prev.filter((_, idx) => idx !== i));
  };

  const filled = forks.filter(f => f.title.trim().length > 0);
  const canSubmit = filled.length >= 1;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit({
      forks: filled.map(f => ({ title: f.title.trim(), description: f.description.trim() })),
    });
  };

  return (
    <ModalShell
      title="Fork pattern"
      description={`Create new patterns from "${pattern.title}". The original stays — signals will be re-classified automatically.`}
      onCancel={onCancel}
      width={580}
      footer={
        <>
          <button
            onClick={onCancel}
            className="px-4 h-9 text-[13px] font-medium text-[#637083] border border-[#E4E7EC] bg-white rounded-[8px] hover:bg-[#F2F4F7]"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="px-4 h-9 text-[13px] font-medium text-white bg-blue-600 rounded-[8px] hover:bg-blue-700 disabled:bg-[#E4E7EC] disabled:text-[#9CA3AF] disabled:cursor-not-allowed"
          >
            Fork
          </button>
        </>
      }
    >
      <div className="space-y-5">
        {forks.map((f, i) => (
          <div key={i} className="border border-[#E4E7EC] rounded-[10px] p-4 bg-[#FAFBFC]">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[12px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
                New pattern {i + 1}
              </p>
              {forks.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeFork(i)}
                  className="text-[12px] text-[#637083] hover:text-red-600 inline-flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Remove
                </button>
              )}
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-[12px] font-medium text-[#141C24] mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={f.title}
                  onChange={e => updateFork(i, 'title', e.target.value)}
                  placeholder={`e.g. ${pattern.title.split(' ').slice(0, 4).join(' ')} — narrower scope`}
                  className="w-full h-10 px-3 text-[14px] text-[#141C24] border border-[#E4E7EC] rounded-[8px] outline-none focus:border-blue-400 placeholder:text-[#9CA3AF] bg-white"
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[#141C24] mb-1">Description</label>
                <textarea
                  value={f.description}
                  onChange={e => updateFork(i, 'description', e.target.value)}
                  rows={2}
                  placeholder="What signals should this pattern capture?"
                  className="w-full px-3 py-2 text-[14px] text-[#141C24] border border-[#E4E7EC] rounded-[8px] outline-none focus:border-blue-400 placeholder:text-[#9CA3AF] resize-none bg-white"
                />
              </div>
            </div>
          </div>
        ))}

        {forks.length < MAX_FORKS && (
          <button
            type="button"
            onClick={addFork}
            className="flex items-center gap-1.5 text-[13px] font-medium text-blue-600 hover:text-blue-700"
          >
            <Plus className="w-3.5 h-3.5" />
            Add another pattern (max {MAX_FORKS})
          </button>
        )}
      </div>
    </ModalShell>
  );
}

function RadioRow({
  checked, onChange, label, hint,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
  hint: string;
}) {
  return (
    <label className="flex items-start gap-2.5 p-3 border border-[#E4E7EC] rounded-[8px] cursor-pointer hover:border-[#D0D5DD] has-[:checked]:bg-blue-50/40 has-[:checked]:border-blue-300">
      <input
        type="radio"
        checked={checked}
        onChange={onChange}
        className="mt-0.5 accent-blue-600 shrink-0"
      />
      <div className="min-w-0">
        <p className="text-[13px] font-medium text-[#141C24]">{label}</p>
        <p className="text-[12px] text-[#637083] mt-0.5 leading-snug">{hint}</p>
      </div>
    </label>
  );
}

