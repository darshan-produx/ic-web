'use client';

import { useState, useMemo, useCallback } from 'react';
import { SlidersHorizontal, RotateCcw, Combine, Trash2, X, Plus } from 'lucide-react';
import SearchBox from '../../../common/components/SearchBox';
import PatternsGridView, { Pattern } from './PatternsGridView';
import {
  AddPatternModal, EditPatternModal, ReclassifyModal,
  SplitPatternModal, MergePatternsModal, DeletePatternModal,
  type NewPatternInput, type PatternEdit, type ReclassifyScope,
  type DeleteScope, type ForkResult,
} from './PatternActionModals';
import SignalDrawer from './SignalDrawer';

const INITIAL_PATTERNS: Pattern[] = [
  { id: '1',  trend: [30, 38, 35, 42, 45, 41, 45], title: 'High churn rate among new B2B clients',          labels: [{ text: 'High ARR impact',     variant: 'blue'  }], description: 'New B2B clients often leave within the first three months due to unmet expectations.',                  openSignals: 45, impactedCustomers: 45, createdBy: 'System', assignedTo: ['Aryan','Sanjay','Lakshmi','Priya','Rahul','Nita','Dev'], createdOn: '2025-12-02', trackingEnabled: true  },
  { id: '2',  trend: [50, 46, 42, 40, 30, 28, 28], title: 'Delayed onboarding process',                     labels: [{ text: 'Most customers affected', variant: 'yellow' }], description: 'The initial setup takes too long, frustrating new users and delaying their time to value.',          openSignals: 28, impactedCustomers: 28, createdBy: 'User',   assignedTo: ['Aryan','Sanjay','Lakshmi','Priya','Rahul','Nita','Dev'], createdOn: '2026-01-15', trackingEnabled: true  },
  { id: '3',  trend: [20, 28, 35, 50, 58, 60, 61], title: 'Inadequate training resources',                  labels: [],                                                  description: 'Clients report feeling unprepared due to a lack of comprehensive training materials.',                openSignals: 61, impactedCustomers: 61, createdBy: 'System', assignedTo: ['Aryan','Sanjay','Lakshmi','Priya','Rahul','Nita','Dev'], createdOn: '2025-11-22', trackingEnabled: true  },
  { id: '4',  trend: [40, 50, 60, 68, 72, 73, 74], title: 'Poor communication during initial setup',        labels: [],                                                  description: 'Inconsistent updates and unclear instructions lead to confusion and dissatisfaction.',                openSignals: 74, impactedCustomers: 74, createdBy: 'User',   assignedTo: ['Aryan','Sanjay','Lakshmi','Priya','Rahul','Nita','Dev'], createdOn: '2026-02-01', trackingEnabled: true  },
  { id: '5',  trend: [60, 58, 55, 54, 53, 53, 53], title: 'Lack of personalized support',                   labels: [{ text: 'Signals reducing', variant: 'green' }],     description: 'Clients express a need for more tailored assistance to address their specific business needs.',      openSignals: 53, impactedCustomers: 53, createdBy: 'System', assignedTo: ['Aryan','Sanjay','Lakshmi','Priya','Rahul','Nita','Dev'], createdOn: '2025-12-28', trackingEnabled: true  },
  { id: '6',  trend: [25, 22, 20, 20, 19, 19, 19], title: 'Software integration difficulties',              labels: [],                                                  description: 'Incompatibilities with existing systems cause significant disruptions and require extensive support.', openSignals: 19, impactedCustomers: 19, createdBy: 'User',   assignedTo: ['Aryan','Sanjay','Lakshmi','Priya','Rahul','Nita','Dev'], createdOn: '2026-01-08', trackingEnabled: true  },
  { id: '7',  trend: [50, 60, 70, 80, 85, 87, 88], title: 'Unclear expectations for product usage',         labels: [],                                                  description: 'Clients struggle to see the full benefits of the product, leading to underutilization and dissatisfaction.', openSignals: 88, impactedCustomers: 88, createdBy: 'System', assignedTo: ['Aryan','Sanjay','Lakshmi','Priya','Rahul','Nita','Dev'], createdOn: '2025-11-18', trackingEnabled: true  },
  { id: '8',  trend: [20, 16, 14, 12, 12, 12, 12], title: 'Insufficient follow-up post-implementation',     labels: [],                                                  description: 'Lack of proactive engagement after launch results in unresolved issues and decreased satisfaction.',  openSignals: 12, impactedCustomers: 12, createdBy: 'User',   assignedTo: ['Aryan','Sanjay','Lakshmi','Priya','Rahul','Nita','Dev'], createdOn: '2026-02-02', trackingEnabled: true  },
  { id: '9',  trend: [20, 25, 30, 34, 36, 37, 37], title: 'Difficulty in understanding product value',      labels: [],                                                  description: 'Clients fail to grasp how the product solves their problems, leading to low adoption rates.',         openSignals: 37, impactedCustomers: 37, createdBy: 'System', assignedTo: ['Aryan','Sanjay','Lakshmi','Priya','Rahul','Nita','Dev'], createdOn: '2025-12-01', trackingEnabled: true  },
  { id: '10', trend: [30, 35, 40, 44, 45, 46, 46], title: 'Technical glitches during critical operations',  labels: [],                                                  description: 'Unexpected errors during crucial tasks cause frustration and erode trust in the product.',            openSignals: 46, impactedCustomers: 46, createdBy: 'User',   assignedTo: ['Aryan','Sanjay','Lakshmi','Priya','Rahul','Nita','Dev'], createdOn: '2026-01-02', trackingEnabled: true  },
  { id: '11', trend: [50, 60, 72, 82, 88, 90, 91], title: 'Complex pricing structure confusion',            labels: [],                                                  description: 'The intricate pricing model confuses clients, leading to billing disputes and dissatisfaction.',      openSignals: 91, impactedCustomers: 91, createdBy: 'System', assignedTo: ['Aryan','Sanjay','Lakshmi','Priya','Rahul','Nita','Dev'], createdOn: '2025-11-27', trackingEnabled: true  },
  { id: '12', trend: [30, 28, 25, 24, 23, 23, 23], title: 'Limited access to advanced features',            labels: [],                                                  description: 'Restricted access to key functionalities limits the product\'s usefulness and hinders client success.', openSignals: 23, impactedCustomers: 23, createdBy: 'User',   assignedTo: ['Aryan','Sanjay','Lakshmi','Priya','Rahul','Nita','Dev'], createdOn: '2026-02-12', trackingEnabled: true  },
  { id: '13', trend: [30, 38, 48, 56, 63, 66, 67], title: 'Data migration challenges',                      labels: [],                                                  description: 'Moving data from legacy systems is complex and error-prone, causing delays and data loss.',            openSignals: 67, impactedCustomers: 67, createdBy: 'System', assignedTo: ['Aryan','Sanjay','Lakshmi','Priya','Rahul','Nita','Dev'], createdOn: '2025-12-15', trackingEnabled: true  },
  { id: '14', trend: [20, 16, 15, 15, 15, 15, 15], title: 'Scalability issues with growing usage',          labels: [],                                                  description: 'The product struggles to handle increased usage, resulting in performance slowdowns and service interruptions.', openSignals: 15, impactedCustomers: 15, createdBy: 'User',   assignedTo: ['Aryan','Sanjay','Lakshmi','Priya','Rahul','Nita','Dev'], createdOn: '2026-01-22', trackingEnabled: true  },
  // ── A couple of pre-seeded exclusion (disabled-tracking) patterns ──────────
  { id: 'x1', trend: [],                          title: 'Meeting appointments',                            labels: [],                                                  description: 'Calendar invites, meeting reminders, and routine appointments. Signals should NOT be generated for these.', openSignals: 0,  impactedCustomers: 0,  createdBy: 'User',   assignedTo: [], createdOn: '2025-10-12', trackingEnabled: false },
  { id: 'x2', trend: [],                          title: 'Auto-generated billing notifications',            labels: [],                                                  description: 'Routine billing emails (renewal receipts, invoices) that do not indicate any customer issue.',                openSignals: 0,  impactedCustomers: 0,  createdBy: 'User',   assignedTo: [], createdOn: '2025-09-05', trackingEnabled: false },
];

type ActionState =
  | { type: 'add' }
  | { type: 'edit'; pattern: Pattern }
  | { type: 'fork'; pattern: Pattern }
  | { type: 'merge'; patterns: Pattern[] }
  | { type: 'delete'; patterns: Pattern[] }
  | { type: 'reclassify'; pattern: Pattern; prompt?: boolean }
  | null;

export default function PatternsPage() {
  const [patterns, setPatterns] = useState<Pattern[]>(INITIAL_PATTERNS);
  const [searchText, setSearchText] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [action, setAction] = useState<ActionState>(null);
  const [drawerPattern, setDrawerPattern] = useState<Pattern | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  // ── Filter + partition into enabled vs disabled tracking ──────────────────
  const filtered = useMemo(() => {
    if (!searchText.trim()) return patterns;
    const q = searchText.toLowerCase();
    return patterns.filter(p => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
  }, [patterns, searchText]);

  // Single table — tracking-enabled patterns first, disabled patterns at the
  // bottom (rows in the grid will dim themselves when trackingEnabled === false).
  const sortedPatterns = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (a.trackingEnabled === b.trackingEnabled) return 0;
      return a.trackingEnabled ? -1 : 1;
    });
  }, [filtered]);

  const selectedPatterns = useMemo(
    () => patterns.filter(p => selectedIds.has(p.id)),
    [patterns, selectedIds]
  );

  // ── Selection handlers ─────────────────────────────────────────────────────
  const toggleRow = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    // Only tracking-enabled patterns can be selected for bulk merge.
    const selectableIds = sortedPatterns.filter(p => p.trackingEnabled).map(p => p.id);
    setSelectedIds(prev => {
      const allSelected = selectableIds.every(id => prev.has(id));
      if (allSelected) {
        const next = new Set(prev);
        selectableIds.forEach(id => next.delete(id));
        return next;
      }
      const next = new Set(prev);
      selectableIds.forEach(id => next.add(id));
      return next;
    });
  }, [sortedPatterns]);

  const clearSelection = () => setSelectedIds(new Set());

  // ── Mutations ──────────────────────────────────────────────────────────────
  const handleAdd = (input: NewPatternInput) => {
    const newPattern: Pattern = {
      id: `np-${Date.now()}`,
      trend: input.trackingEnabled ? [10, 12, 11, 14, 16, 15, 18] : [],
      title: input.title,
      labels: input.trackingEnabled
        ? [{ text: 'New', variant: 'blue' }]
        : [{ text: 'Tracking disabled', variant: 'gray' }],
      description: input.description,
      openSignals: 0,
      impactedCustomers: 0,
      createdBy: 'User',
      assignedTo: [],
      createdOn: new Date().toISOString().slice(0, 10),
      trackingEnabled: input.trackingEnabled,
    };
    setPatterns(prev => [newPattern, ...prev]);
    setAction(null);
    showToast(
      input.trackingEnabled
        ? `Pattern "${input.title}" created. Classifying ${input.scope === 'all_open' ? 'all open' : 'unclassified'} signals…`
        : `Exclusion pattern "${input.title}" created. New signals won't be generated for it.`
    );
  };

  const handleEdit = (id: string, edit: PatternEdit) => {
    setPatterns(prev => prev.map(p => p.id === id ? { ...p, title: edit.title, description: edit.description } : p));
    // After edit → always prompt to reclassify so signals match the new criteria.
    const target = patterns.find(p => p.id === id);
    if (target) {
      setAction({ type: 'reclassify', pattern: { ...target, ...edit }, prompt: true });
    } else {
      setAction(null);
    }
  };

  const handleFork = (origId: string, result: ForkResult) => {
    setPatterns(prev => {
      const idx = prev.findIndex(p => p.id === origId);
      if (idx === -1) return prev;
      const orig = prev[idx];
      // New forks start with zero signals — the LLM reclassification step (next
      // modal) is what actually moves signals across.
      const newForks: Pattern[] = result.forks.map((f, i) => ({
        ...orig,
        id: `${orig.id}-fork-${i + 1}-${Date.now()}`,
        title: f.title,
        labels: [{ text: 'Forked', variant: 'blue' }],
        description: f.description || `Forked from "${orig.title}".`,
        openSignals: 0,
        impactedCustomers: 0,
        createdBy: 'User',
        createdOn: new Date().toISOString().slice(0, 10),
        trackingEnabled: true,
      }));

      const next = [...prev];
      next.splice(idx + 1, 0, ...newForks);
      return next;
    });
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.delete(origId);
      return next;
    });
    // Always offer reclassify follow-up — LLM will distribute signals across forks.
    const target = patterns.find(p => p.id === origId);
    if (target) {
      setAction({ type: 'reclassify', pattern: target, prompt: true });
    } else {
      setAction(null);
    }
  };

  const handleMerge = (ids: string[], input: { title: string; description: string }) => {
    let mergedPattern: Pattern | null = null;
    setPatterns(prev => {
      const toMerge = prev.filter(p => ids.includes(p.id));
      if (toMerge.length < 2) return prev;
      const firstIdx = prev.findIndex(p => p.id === toMerge[0].id);
      const base = toMerge[0];
      const merged: Pattern = {
        ...base,
        id: `merged-${Date.now()}`,
        title: input.title,
        labels: [{ text: 'Merged', variant: 'blue' }],
        description: input.description,
        openSignals: toMerge.reduce((s, p) => s + p.openSignals, 0),
        impactedCustomers: toMerge.reduce((s, p) => s + p.impactedCustomers, 0),
        createdBy: 'User',
        createdOn: new Date().toISOString().slice(0, 10),
        trackingEnabled: true,
      };
      mergedPattern = merged;
      const remaining = prev.filter(p => !ids.includes(p.id));
      remaining.splice(Math.min(firstIdx, remaining.length), 0, merged);
      return remaining;
    });
    setSelectedIds(new Set());
    // Offer reclassify follow-up
    if (mergedPattern) {
      setAction({ type: 'reclassify', pattern: mergedPattern, prompt: true });
    } else {
      setAction(null);
    }
  };

  const handleDelete = (ids: string[], scope: DeleteScope) => {
    setPatterns(prev => prev.filter(p => !ids.includes(p.id)));
    setSelectedIds(prev => {
      const next = new Set(prev);
      ids.forEach(id => next.delete(id));
      return next;
    });
    setAction(null);
    showToast(
      scope === 'pattern_only'
        ? `${ids.length} pattern${ids.length !== 1 ? 's' : ''} deleted. Associated signals are now unclassified.`
        : `${ids.length} pattern${ids.length !== 1 ? 's' : ''} deleted along with their signals.`
    );
  };

  const handleReclassify = (patternId: string, scope: ReclassifyScope) => {
    setAction(null);
    showToast(
      scope === 'this_pattern_only'
        ? 'Reclassifying signals in this pattern…'
        : 'Reclassifying signals in this pattern + unassigned signals…'
    );
    void patternId;
  };

  const handleToggleTracking = (pattern: Pattern) => {
    setPatterns(prev => prev.map(p =>
      p.id === pattern.id ? { ...p, trackingEnabled: !p.trackingEnabled } : p
    ));
    showToast(
      pattern.trackingEnabled
        ? `Tracking disabled for "${pattern.title}". New signals won't be generated for it.`
        : `Tracking enabled for "${pattern.title}". Signal classification resumed.`
    );
  };

  const handleReset = () => setSearchText('');

  const hasSelection = selectedIds.size > 0;

  // Shared row-action handlers (passed to both tables).
  const rowHandlers = {
    onToggleRow: toggleRow,
    onEdit:         (p: Pattern) => setAction({ type: 'edit', pattern: p }),
    onFork:         (p: Pattern) => setAction({ type: 'fork', pattern: p }),
    onReclassify:   (p: Pattern) => setAction({ type: 'reclassify', pattern: p }),
    onToggleTracking: handleToggleTracking,
    onDelete:       (p: Pattern) => setAction({ type: 'delete', patterns: [p] }),
    onOpenSignals:  (p: Pattern) => setDrawerPattern(p),
  };

  return (
    <div className="flex flex-col h-[calc(100vh-54px)] bg-white">
      <div className="w-full max-w-[1200px] mx-auto flex flex-col flex-1 min-h-0">
        {/* Toast */}
        {toast && (
          <div className="mx-4 mt-4 px-3 py-2 bg-blue-50 border border-blue-100 rounded-[8px] text-[13px] text-blue-900 flex items-center justify-between gap-3">
            <span>{toast}</span>
            <button onClick={() => setToast(null)} className="text-blue-700 hover:text-blue-900">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Sub-header */}
        <div className="flex items-center justify-between px-4 py-6 border-b border-[#CED2DA]">
          {hasSelection ? (
            <>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center h-[32px] px-3 rounded-[6px] bg-[#EEF4FF] text-[13px] font-semibold text-[#1D4ED8]">
                  {selectedIds.size} selected
                </span>
                <button
                  onClick={clearSelection}
                  className="text-[13px] text-[#637083] hover:text-[#141C24] inline-flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" />
                  Clear
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAction({ type: 'merge', patterns: selectedPatterns })}
                  disabled={selectedIds.size < 2}
                  className="flex items-center gap-1.5 px-3 h-[32px] rounded-[6px] border border-[#CED2DA] bg-white text-[13px] font-medium text-[#414E62] hover:bg-[#F2F4F7] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Combine className="w-[14px] h-[14px]" />
                  Merge
                </button>
                <button
                  onClick={() => setAction({ type: 'delete', patterns: selectedPatterns })}
                  className="flex items-center gap-1.5 px-3 h-[32px] rounded-[6px] border border-red-200 bg-white text-[13px] font-medium text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-[14px] h-[14px]" />
                  Delete
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center h-[32px] px-3 rounded-[6px] bg-[#F9FAFB] text-[13px] font-semibold text-[#202B37]">
                  {filtered.length} Patterns
                </span>
                <div className="w-[250px] h-[32px]">
                  <SearchBox
                    searchText={searchText}
                    setSearchText={setSearchText}
                    dataType="Search by title or account"
                    needBorder
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1.5 px-3 h-[32px] rounded-[6px] border border-[#CED2DA] text-[13px] font-medium text-[#414E62] hover:bg-[#F2F4F7]">
                  <SlidersHorizontal className="w-[14px] h-[14px]" />
                  Filter
                </button>
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1.5 px-3 h-[32px] rounded-[6px] border border-[#CED2DA] text-[13px] font-medium text-[#414E62] hover:bg-[#F2F4F7]"
                >
                  <RotateCcw className="w-[14px] h-[14px]" />
                  Reset
                </button>
                <button
                  onClick={() => setAction({ type: 'add' })}
                  className="flex items-center gap-1.5 px-3 h-[32px] rounded-[6px] bg-blue-600 text-[13px] font-medium text-white hover:bg-blue-700"
                >
                  <Plus className="w-[14px] h-[14px]" />
                  New pattern
                </button>
              </div>
            </>
          )}
        </div>

        {/* Single table — disabled-tracking patterns sort to the bottom and dim. */}
        <div className="flex-1 overflow-x-auto overflow-y-auto px-4 py-5">
          <PatternsGridView
            data={sortedPatterns}
            selectedIds={selectedIds}
            onToggleAll={toggleAll}
            {...rowHandlers}
          />
        </div>
      </div>

      {/* ── Modals ─────────────────────────────────────────────────────────── */}
      {action?.type === 'add' && (
        <AddPatternModal
          onCancel={() => setAction(null)}
          onSubmit={handleAdd}
        />
      )}

      {action?.type === 'edit' && (
        <EditPatternModal
          pattern={action.pattern}
          onCancel={() => setAction(null)}
          onSubmit={(edit) => handleEdit(action.pattern.id, edit)}
        />
      )}

      {action?.type === 'fork' && (
        <SplitPatternModal
          pattern={action.pattern}
          onCancel={() => setAction(null)}
          onSubmit={(result) => handleFork(action.pattern.id, result)}
        />
      )}

      {action?.type === 'merge' && (
        <MergePatternsModal
          patterns={action.patterns}
          onCancel={() => setAction(null)}
          onSubmit={(input) => handleMerge(action.patterns.map(p => p.id), input)}
        />
      )}

      {action?.type === 'delete' && (
        <DeletePatternModal
          patterns={action.patterns}
          onCancel={() => setAction(null)}
          onConfirm={(scope) => handleDelete(action.patterns.map(p => p.id), scope)}
        />
      )}

      {action?.type === 'reclassify' && (
        <ReclassifyModal
          pattern={action.pattern}
          prompt={action.prompt}
          onCancel={() => setAction(null)}
          onSkip={() => setAction(null)}
          onSubmit={(scope) => handleReclassify(action.pattern.id, scope)}
        />
      )}

      {drawerPattern && (
        <SignalDrawer
          patternId={drawerPattern.id}
          patternTitle={drawerPattern.title}
          openCount={drawerPattern.openSignals}
          onClose={() => setDrawerPattern(null)}
        />
      )}
    </div>
  );
}
