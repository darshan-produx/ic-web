'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

/**
 * Per-grid Standard View vs Personal View persistence (ICA-2232 Adaptive Grid Layouts).
 *
 * - Standard View: organization-wide default. Defined by the page (`systemView`) or, for
 *   Configurators, overridden via `saveAsStandard()` and persisted globally (mocked here
 *   via localStorage; a real implementation lives in the Global Config Table).
 * - Personal View: per-user customization. Auto-saved on any change to columns/sort/filters.
 *
 * The first time a user transitions Standard → Personal we surface a one-time warning
 * via `showFirstTimeWarning`; consumers should display it and call `dismissWarning()`.
 */

export interface GridViewState {
  columnOrder: string[];
  /** Per-column visibility. Missing entries default to visible. */
  columnVisibility: Record<string, boolean>;
  sorting: { id: string; desc: boolean }[];
  columnSizing: Record<string, number>;
  filters: Record<string, any>;
}

const PERSONAL_PREFIX = 'ic:grid-view:personal:';
const STANDARD_PREFIX = 'ic:grid-view:standard:';
const WARNED_PREFIX   = 'ic:grid-view:warned:';
const ACTIVE_PREFIX   = 'ic:grid-view:active:';

interface UseGridViewOptions {
  /** When true, exposes `saveAsStandard()` and writes to the standard-view slot. */
  isConfigurator?: boolean;
}

function safeLoad<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function safeSave(key: string, value: unknown) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

function safeRemove(key: string) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(key);
  } catch {}
}

export function useGridView(
  gridId: string,
  systemView: GridViewState,
  options: UseGridViewOptions = {}
) {
  const { isConfigurator = false } = options;

  const personalKey = PERSONAL_PREFIX + gridId;
  const standardKey = STANDARD_PREFIX + gridId;
  const warnedKey   = WARNED_PREFIX + gridId;
  const activeKey   = ACTIVE_PREFIX + gridId;

  const [standardOverride, setStandardOverride] = useState<GridViewState | null>(null);
  const [personalView, setPersonalView] = useState<GridViewState | null>(null);
  const [isPersonal, setIsPersonal] = useState(false);
  const [showFirstTimeWarning, setShowFirstTimeWarning] = useState(false);

  // Hydrate from localStorage after mount (avoids SSR mismatch).
  useEffect(() => {
    const stdOv = safeLoad<GridViewState>(standardKey);
    const personal = safeLoad<GridViewState>(personalKey);
    const lastActive = safeLoad<'standard' | 'personal'>(activeKey);

    if (stdOv) setStandardOverride(stdOv);
    if (personal) setPersonalView(personal);

    // Default to the last active view; fallback to Personal when one exists.
    if (lastActive === 'personal' && personal) setIsPersonal(true);
    else if (lastActive === 'standard') setIsPersonal(false);
    else if (personal) setIsPersonal(true);
  }, [gridId]);

  const effectiveStandard = standardOverride ?? systemView;
  const currentView = useMemo<GridViewState>(
    () => (isPersonal && personalView ? personalView : effectiveStandard),
    [isPersonal, personalView, effectiveStandard]
  );

  /** Persist a change to the Personal View. Auto-transitions to Personal mode. */
  const updatePersonal = useCallback(
    (partial: Partial<GridViewState>) => {
      setPersonalView(prev => {
        const base = prev ?? effectiveStandard;
        const next: GridViewState = {
          columnOrder:      partial.columnOrder      ?? base.columnOrder,
          columnVisibility: partial.columnVisibility ?? base.columnVisibility,
          sorting:          partial.sorting          ?? base.sorting,
          columnSizing:     partial.columnSizing     ?? base.columnSizing,
          filters:          partial.filters          ?? base.filters,
        };
        safeSave(personalKey, next);
        return next;
      });

      // One-time warning when Personal View first comes into existence.
      const alreadyWarned = safeLoad<boolean>(warnedKey);
      if (!alreadyWarned) {
        setShowFirstTimeWarning(true);
        safeSave(warnedKey, true);
      }

      setIsPersonal(true);
      safeSave(activeKey, 'personal');
    },
    [effectiveStandard, personalKey, warnedKey, activeKey]
  );

  const setView = useCallback(
    (view: 'standard' | 'personal') => {
      if (view === 'personal' && !personalView) return;
      setIsPersonal(view === 'personal');
      safeSave(activeKey, view);
    },
    [personalView, activeKey]
  );

  const resetPersonal = useCallback(() => {
    safeRemove(personalKey);
    setPersonalView(null);
    setIsPersonal(false);
    safeSave(activeKey, 'standard');
  }, [personalKey, activeKey]);

  /** Configurator-only: promote the current Personal View to the org-wide Standard. */
  const saveAsStandard = useCallback(() => {
    if (!isConfigurator || !personalView) return;
    safeSave(standardKey, personalView);
    setStandardOverride(personalView);
    // Personal View is now identical to Standard — clear it and switch to Standard.
    safeRemove(personalKey);
    setPersonalView(null);
    setIsPersonal(false);
    safeSave(activeKey, 'standard');
  }, [isConfigurator, personalView, standardKey, personalKey, activeKey]);

  const dismissWarning = useCallback(() => setShowFirstTimeWarning(false), []);

  return {
    currentView,
    isPersonal,
    hasPersonalView: personalView !== null,
    isConfigurator,
    showFirstTimeWarning,
    updatePersonal,
    setView,
    resetPersonal,
    saveAsStandard,
    dismissWarning,
  };
}
