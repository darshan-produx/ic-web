'use client';

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

import {
  FilterContext,
  FullFilterState,
  NOT_SELECTED_OFFERING_ID,
  SidebarFilterState,
  SortByItem,
  getDefaultFullState,
  getDefaultSidebarState,
  getStorageKey,
  serializeForStorage,
  deserializeFromStorage,
  buildDefaultUsers,
  buildDefaultStakeholders,
  buildDefaultOfferings,
} from './filterTypes';

dayjs.extend(utc);

// ─── Helpers to build UTC boundaries (same as app/utils/date-util) ──

const toStartUTC = (d: Date) =>
  dayjs.utc(`${dayjs(d).format('YYYY-MM-DD')}T00:00:00.000Z`).toDate();

const toEndUTC = (d: Date) =>
  dayjs.utc(`${dayjs(d).format('YYYY-MM-DD')}T23:59:59.999Z`).toDate();

// ─── Return type (exported so consumers can type props) ─────────────

export interface UseFilterPersistenceReturn {
  /** Currently applied state that drives API calls */
  applied: FullFilterState;
  /** Sidebar-only portion of the applied state */
  appliedSidebar: SidebarFilterState;
  /** Update search text – takes effect immediately & persists */
  setSearchText: (text: string) => void;
  /** Update sort-by – takes effect immediately & persists */
  setSortBy: (updater: SortByItem[] | ((prev: SortByItem[]) => SortByItem[])) => void;
  /** Push pending sidebar edits into the applied state & persist */
  applySidebarFilters: (sidebar: SidebarFilterState) => void;
  /** Get the default sidebar state (used for the sidebar Reset button) */
  getDefaultSidebar: () => SidebarFilterState;
  /** Reset ALL filters (sidebar + search + sort) to defaults & persist */
  resetAllFilters: () => void;
  /** True when every field matches its default value */
  isAtDefaultState: boolean;
  /** Build a ready-to-send API params object from current applied state */
  getApiParams: (extra?: Record<string, any>) => Record<string, any>;
}

// ─── Extract sidebar portion from a full state ──────────────────────

const extractSidebar = (s: FullFilterState): SidebarFilterState => ({
  statuses: s.statuses,
  createdStartDate: s.createdStartDate,
  createdEndDate: s.createdEndDate,
  updatedStartDate: s.updatedStartDate,
  updatedEndDate: s.updatedEndDate,
  intensityLevels: s.intensityLevels,
  eventTypes: s.eventTypes,
  signalTypes: s.signalTypes,
  offerings: s.offerings,
  users: s.users,
  stakeholders: s.stakeholders,
});

// ─── The hook ───────────────────────────────────────────────────────

interface UseFilterPersistenceOptions {
  context: FilterContext;
  customerId: number;
  usersList: any[];
  stakeholdersList: any[];
  offeringsList?: any[];
}

export const useFilterPersistence = ({
  context,
  customerId,
  usersList,
  stakeholdersList,
  offeringsList = [],
}: UseFilterPersistenceOptions): UseFilterPersistenceReturn => {
  const storageKey = getStorageKey(context, customerId);

  // ── Initialise from localStorage or fall back to defaults ─────
  const [applied, setApplied] = useState<FullFilterState>(() => {
    if (typeof window === 'undefined')
      return getDefaultFullState(
        context,
        usersList,
        stakeholdersList,
        offeringsList,
      );

    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = deserializeFromStorage(
          stored,
          context,
          usersList,
          stakeholdersList,
          offeringsList,
        );
        if (parsed) return parsed;
      }
    } catch {
      /* ignore */
    }

    return getDefaultFullState(
      context,
      usersList,
      stakeholdersList,
      offeringsList,
    );
  });

  // ── Re-merge users / stakeholders when the API lists arrive ───
  // Track the last *content* key we processed so we don't re-fire when the
  // parent passes structurally identical but referentially new arrays (e.g.
  // `users?.data?.data ?? []` creates a new [] on every render).
  const lastListsKeyRef = useRef<string>('');

  useEffect(() => {
    if (!usersList?.length && !stakeholdersList?.length && !offeringsList?.length) return;

    // Build a stable content key from IDs.  If the lists haven't actually
    // changed, skip the setApplied call to break the infinite-loop cycle.
    const newKey = [
      (usersList ?? []).map((u: any) => u._id).join(','),
      (stakeholdersList ?? []).map((s: any) => s._id).join(','),
      (offeringsList ?? []).map((o: any) => o._id).join(','),
      context,
    ].join('|');

    if (newKey === lastListsKeyRef.current) return;
    lastListsKeyRef.current = newKey;

    setApplied((prev) => {
      let stored: string | null = null;
      try {
        stored = localStorage.getItem(storageKey);
      } catch {
        /* ignore */
      }

      // Users
      let newUsers = prev.users;
      if (usersList?.length) {
        const selections: Record<string, boolean> = {};
        if (stored) {
          try {
            const p = JSON.parse(stored);
            Object.assign(selections, p.userSelections ?? {});
          } catch {
            /* ignore */
          }
        }
        // Fallback: keep current in-memory selections
        prev.users.forEach((u) => {
          if (selections[u._id] === undefined) selections[u._id] = u.selected;
        });
        newUsers = buildDefaultUsers(usersList).map((u) => ({
          ...u,
          selected: selections[u._id] ?? true,
        }));
      }

      // Stakeholders
      let newStakeholders = prev.stakeholders;
      if (stakeholdersList?.length) {
        const selections: Record<string, boolean> = {};
        if (stored) {
          try {
            const p = JSON.parse(stored);
            Object.assign(selections, p.stakeholderSelections ?? {});
          } catch {
            /* ignore */
          }
        }
        prev.stakeholders.forEach((s) => {
          if (selections[s._id] === undefined) selections[s._id] = s.selected;
        });
        newStakeholders = buildDefaultStakeholders(stakeholdersList).map((s) => ({
          ...s,
          selected: selections[s._id] ?? true,
        }));
      }

      // Offerings (open issues only)
      let newOfferings = prev.offerings;
      if (context === 'open_issues' && offeringsList?.length) {
        const selections: Record<string, boolean> = {};
        if (stored) {
          try {
            const p = JSON.parse(stored);
            Object.assign(selections, p.offeringSelections ?? {});
          } catch {
            /* ignore */
          }
        }
        prev.offerings.forEach((offering) => {
          if (selections[offering._id] === undefined) {
            selections[offering._id] = offering.selected;
          }
        });
        newOfferings = buildDefaultOfferings(offeringsList).map((offering) => ({
          ...offering,
          selected: selections[offering._id] ?? true,
        }));
      }

      const next = {
        ...prev,
        users: newUsers,
        stakeholders: newStakeholders,
        offerings: newOfferings,
      };

      try {
        // When a list hasn't loaded yet, preserve its existing stored
        // selections to avoid overwriting them with incomplete data.
        // This prevents the bug where e.g. stakeholders load before
        // users, triggering a localStorage write that clobbers the
        // saved userSelections with only the NOT_ASSIGNED sentinel.
        const nextSerialized = serializeForStorage(next);
        if (
          stored &&
          (!usersList?.length || !stakeholdersList?.length || !offeringsList?.length)
        ) {
          const existingParsed = JSON.parse(stored);
          const nextParsed = JSON.parse(nextSerialized);
          if (!usersList?.length && existingParsed.userSelections) {
            nextParsed.userSelections = existingParsed.userSelections;
          }
          if (!stakeholdersList?.length && existingParsed.stakeholderSelections) {
            nextParsed.stakeholderSelections = existingParsed.stakeholderSelections;
          }
          if (!offeringsList?.length && existingParsed.offeringSelections) {
            nextParsed.offeringSelections = existingParsed.offeringSelections;
          }
          localStorage.setItem(storageKey, JSON.stringify(nextParsed));
        } else {
          localStorage.setItem(storageKey, nextSerialized);
        }
      } catch {
        /* ignore */
      }

      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usersList, stakeholdersList, offeringsList, context]);

  // ── Persist helper ────────────────────────────────────────────
  const persistAndSet = useCallback(
    (newState: FullFilterState) => {
      setApplied(newState);
      try {
        localStorage.setItem(storageKey, serializeForStorage(newState));
      } catch {
        /* ignore */
      }
    },
    [storageKey],
  );

  // ── Toolbar: search text (immediate) ──────────────────────────
  const setSearchText = useCallback(
    (text: string) => {
      setApplied((prev) => {
        const next = { ...prev, searchText: text };
        try {
          localStorage.setItem(storageKey, serializeForStorage(next));
        } catch {
          /* ignore */
        }
        return next;
      });
    },
    [storageKey],
  );

  // ── Toolbar: sort by (immediate) ──────────────────────────────
  const setSortBy = useCallback(
    (updater: SortByItem[] | ((prev: SortByItem[]) => SortByItem[])) => {
      setApplied((prev) => {
        const newSortBy = typeof updater === 'function' ? updater(prev.sortBy) : updater;
        const next = { ...prev, sortBy: newSortBy };
        try {
          localStorage.setItem(storageKey, serializeForStorage(next));
        } catch {
          /* ignore */
        }
        return next;
      });
    },
    [storageKey],
  );

  // ── Sidebar: apply pending filters ────────────────────────────
  const applySidebarFilters = useCallback(
    (sidebar: SidebarFilterState) => {
      setApplied((prev) => {
        const next: FullFilterState = { ...prev, ...sidebar };
        try {
          localStorage.setItem(storageKey, serializeForStorage(next));
        } catch {
          /* ignore */
        }
        return next;
      });
    },
    [storageKey],
  );

  // ── Sidebar: get defaults (for in-sidebar Reset) ─────────────
  const getDefaultSidebar = useCallback(
    (): SidebarFilterState =>
      getDefaultSidebarState(
        context,
        usersList ?? [],
        stakeholdersList ?? [],
        offeringsList ?? [],
      ),
    [context, usersList, stakeholdersList, offeringsList],
  );

  // ── Reset everything ──────────────────────────────────────────
  const resetAllFilters = useCallback(() => {
    const defaults = getDefaultFullState(
      context,
      usersList ?? [],
      stakeholdersList ?? [],
      offeringsList ?? [],
    );
    persistAndSet(defaults);
  }, [context, usersList, stakeholdersList, offeringsList, persistAndSet]);

  // ── isAtDefaultState ──────────────────────────────────────────
  const isAtDefaultState = useMemo(() => {
    const defaults = getDefaultFullState(
      context,
      usersList ?? [],
      stakeholdersList ?? [],
      offeringsList ?? [],
    );

    if (applied.searchText !== '') return false;

    // Sort
    const defSort = defaults.sortBy.find((s) => s.selected);
    const curSort = applied.sortBy.find((s) => s.selected);
    if (defSort?.id !== curSort?.id || defSort?.sortOrder !== curSort?.sortOrder) return false;

    // Statuses
    if (
      !applied.statuses.every((s) => {
        const d = defaults.statuses.find((ds) => ds.value === s.value);
        return d && s.selected === d.selected;
      })
    )
      return false;

    // Dates
    if (
      applied.createdStartDate ||
      applied.createdEndDate ||
      applied.updatedStartDate ||
      applied.updatedEndDate
    )
      return false;

    // Intensity
    if (
      applied.intensityLevels.length !== defaults.intensityLevels.length ||
      !applied.intensityLevels.every((l) => defaults.intensityLevels.includes(l))
    )
      return false;

    // Event types
    if (
      !applied.eventTypes.every((e) => {
        const d = defaults.eventTypes.find((de) => de.value === e.value);
        return d && e.selected === d.selected;
      })
    )
      return false;

    // Signal types
    if (
      !applied.signalTypes.every((s) => {
        const d = defaults.signalTypes.find((ds) => ds.value === s.value);
        return d && s.selected === d.selected;
      })
    )
      return false;

    // Offerings/Users – default is all selected
    if (applied.offerings.some((offering) => !offering.selected)) return false;
    if (applied.users.some((u) => !u.selected)) return false;

    // Stakeholders – default is all selected
    if (applied.stakeholders.some((s) => !s.selected)) return false;

    return true;
  }, [applied, context, usersList, stakeholdersList, offeringsList]);

  // ── Build API params ──────────────────────────────────────────
  const getApiParams = useCallback(
    (extra?: Record<string, any>): Record<string, any> => {
      const selectedSort = applied.sortBy.find((s) => s.selected) ?? applied.sortBy[0];

      const params: Record<string, any> = {
        signal_types: applied.signalTypes.filter((s) => s.selected).map((s) => s.value),
        search_text: applied.searchText || '',
        sort_by: selectedSort.value,
        sort_order: selectedSort.sortOrder,
        statuses: applied.statuses
          .filter((s) => s.selected && s.value !== 'deleted')
          .map((s) => s.value),
        is_deleted: applied.statuses.some((s) => s.value === 'deleted' && s.selected),
      };

      // Source (journey: events → source mapping)
      if (context === 'journey') {
        params.source = [
          ...(applied.eventTypes.some((e) => e.value === 'meeting' && e.selected)
            ? ['meeting']
            : []),
          ...(applied.eventTypes.some((e) => e.value === 'phase_change' && e.selected)
            ? ['manual']
            : []),
        ];
      } else {
        params.source = [];
      }

      // Intensity (omit when all 5 levels selected – no filtering needed)
      if (applied.intensityLevels.length > 0 && applied.intensityLevels.length < 5) {
        params.intensity = applied.intensityLevels;
      }

      // Date ranges
      if (applied.createdStartDate)
        params.created_start_date = toStartUTC(new Date(applied.createdStartDate));
      if (applied.createdEndDate)
        params.created_end_date = toEndUTC(new Date(applied.createdEndDate));
      if (applied.updatedStartDate)
        params.updated_start_date = toStartUTC(new Date(applied.updatedStartDate));
      if (applied.updatedEndDate)
        params.updated_end_date = toEndUTC(new Date(applied.updatedEndDate));

      // Users – always send the array (all IDs when all selected, [] when none)
      const selectedUsers = applied.users.filter((u) => u.selected);
      params.internal_communicator_ids = selectedUsers.map((u) => u._id);

      // Stakeholders – always send the array (all IDs when all selected, [] when none)
      const selectedStakeholders = applied.stakeholders.filter((s) => s.selected);
      params.external_communicator_ids = selectedStakeholders.map((s) => s._id);

      if (context === 'open_issues' && applied.offerings.length > 0) {
        const notSelectedOffering = applied.offerings.find(
          (offering) => offering._id === NOT_SELECTED_OFFERING_ID,
        );
        const includeMissingOffering = Boolean(notSelectedOffering?.selected);

        const selectableOfferings = applied.offerings.filter(
          (offering) => offering._id !== NOT_SELECTED_OFFERING_ID,
        );
        const selectedOfferingIds = selectableOfferings
          .filter((offering) => offering.selected)
          .map((offering) => offering._id);

        const allRealOfferingsSelected =
          selectedOfferingIds.length === selectableOfferings.length;

        // Default state (all offerings + Not Selected) should not add query params.
        const shouldApplyOfferingFilter =
          !allRealOfferingsSelected || !includeMissingOffering;

        if (shouldApplyOfferingFilter) {
          params.offering_ids = selectedOfferingIds;
          params.offering_include_missing = includeMissingOffering;
        }
      }

      // Merge caller-supplied overrides (e.g. customer_id, skip, limit)
      if (extra) Object.assign(params, extra);

      return params;
    },
    [applied, context],
  );

  // ── Derived: sidebar portion ──────────────────────────────────
  const appliedSidebar = useMemo(() => extractSidebar(applied), [applied]);

  return {
    applied,
    appliedSidebar,
    setSearchText,
    setSortBy,
    applySidebarFilters,
    getDefaultSidebar,
    resetAllFilters,
    isAtDefaultState,
    getApiParams,
  };
};
