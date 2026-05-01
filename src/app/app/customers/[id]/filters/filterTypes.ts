// ─── Shared filter types and defaults for Journey & Open Issues tabs ───

export interface FilterItem {
  value: string;
  label: string;
  selected: boolean;
}

export interface UserFilterItem {
  _id: string;
  first_name: string;
  last_name: string;
  selected: boolean;
}

export interface StakeholderFilterItem {
  _id: string;
  name: string;
  selected: boolean;
}

export interface OfferingFilterItem {
  _id: string;
  offering_name: string;
  id?: string;
  name?: string;
  value?: string;
  selected: boolean;
}

export interface SortByItem {
  id: string;
  label: string;
  value: string;
  sortOrder: 'asc' | 'desc';
  selected: boolean;
}

/** Filters managed inside the sidebar drawer */
export interface SidebarFilterState {
  statuses: FilterItem[];
  createdStartDate: string | null; // ISO string (for localStorage)
  createdEndDate: string | null;
  updatedStartDate: string | null;
  updatedEndDate: string | null;
  intensityLevels: number[];
  eventTypes: FilterItem[]; // journey only (phase_change, meeting)
  signalTypes: FilterItem[];
  offerings: OfferingFilterItem[];
  users: UserFilterItem[];
  stakeholders: StakeholderFilterItem[];
}

/** Full persisted state (sidebar + toolbar controls) */
export interface FullFilterState extends SidebarFilterState {
  searchText: string;
  sortBy: SortByItem[];
}

export type FilterContext = 'journey' | 'open_issues';

// ─── Default option sets ────────────────────────────────────────────

export const JOURNEY_DEFAULT_STATUSES: FilterItem[] = [
  { value: 'open', label: 'Open', selected: true },
  { value: 'resolved', label: 'Resolved', selected: true },
  { value: 'closed', label: 'Closed', selected: true },
  { value: 'deleted', label: 'Deleted', selected: false },
];

export const OPEN_ISSUES_DEFAULT_STATUSES: FilterItem[] = [
  { value: 'open', label: 'Open', selected: true },
  { value: 'resolved', label: 'Resolved', selected: false },
  { value: 'closed', label: 'Closed', selected: false },
];

export const JOURNEY_DEFAULT_EVENT_TYPES: FilterItem[] = [
  { value: 'phase_change', label: 'Phase Changes', selected: true },
  { value: 'meeting', label: 'Meetings', selected: true },
];

export const JOURNEY_DEFAULT_SIGNAL_TYPES: FilterItem[] = [
  { value: 'issue', label: 'Issues', selected: true },
  { value: 'commitment', label: 'Commitments', selected: true },
  { value: 'expectation', label: 'Expectations', selected: true },
  { value: 'appreciation', label: 'Appreciation', selected: true },
  { value: 'fact', label: 'Information', selected: true },
];

export const OPEN_ISSUES_DEFAULT_SIGNAL_TYPES: FilterItem[] = [
  { value: 'issue', label: 'Issues', selected: true },
  { value: 'commitment', label: 'Commitments', selected: true },
  { value: 'expectation', label: 'Expectations', selected: true },
];

export const DEFAULT_INTENSITY_LEVELS: number[] = [1, 2, 3, 4, 5];

export const OPEN_ISSUES_DEFAULT_SORT_BY: SortByItem[] = [
  {
    id: 'intensity',
    label: 'Intensity',
    value: 'intensity',
    sortOrder: 'desc',
    selected: true,
  },
  {
    id: 'updated_date',
    label: 'Updated date',
    value: 'signal_updated_at',
    sortOrder: 'desc',
    selected: false,
  },
  {
    id: 'created_date',
    label: 'Created date',
    value: 'signal_created_at',
    sortOrder: 'desc',
    selected: false,
  },
];
export const JOURNEY_DEFAULT_SORT_BY: SortByItem[] = [
  // { id: 'intensity', label: 'Intensity', value: 'intensity', sortOrder: 'desc', selected: false },
  {
    id: 'updated_date',
    label: 'Updated date',
    value: 'signal_updated_at',
    sortOrder: 'desc',
    selected: true,
  },
  {
    id: 'created_date',
    label: 'Created date',
    value: 'signal_created_at',
    sortOrder: 'desc',
    selected: false,
  },
];

// ─── Special "Not Assigned" sentinels ───────────────────────────────

export const NOT_ASSIGNED_USER: UserFilterItem = {
  _id: 'include_missing',
  first_name: 'Other',
  last_name: '',
  selected: true,
};

export const NOT_ASSIGNED_STAKEHOLDER: StakeholderFilterItem = {
  _id: 'include_missing',
  name: 'Other',
  selected: true,
};

export const NOT_SELECTED_OFFERING_ID = 'not_selected';
export const NOT_SELECTED_OFFERING_VALUE = 'notselected';
export const NOT_SELECTED_OFFERING_OPTION: OfferingFilterItem = {
  _id: NOT_SELECTED_OFFERING_ID,
  offering_name: 'Not Selected',
  id: NOT_SELECTED_OFFERING_ID,
  name: 'Not Selected',
  value: NOT_SELECTED_OFFERING_VALUE,
  selected: true,
};

// ─── Builder helpers ────────────────────────────────────────────────

export const buildDefaultUsers = (usersList: any[] = []): UserFilterItem[] => [
  { ...NOT_ASSIGNED_USER },
  ...usersList.map((u) => ({
    _id: u._id,
    first_name: u.first_name,
    last_name: u.last_name,
    selected: true,
  })),
];

export const buildDefaultStakeholders = (
  stakeholdersList: any[] = []
): StakeholderFilterItem[] => [
  { ...NOT_ASSIGNED_STAKEHOLDER },
  ...stakeholdersList.map((s) => ({
    _id: s._id,
    name: s.name,
    selected: true,
  })),
];

export const buildDefaultOfferings = (
  offeringsList: any[] = []
): OfferingFilterItem[] => {
  const offerings: OfferingFilterItem[] = offeringsList.map((offering) => ({
    _id: offering?._id,
    offering_name: offering?.offering_name,
    id: offering?._id,
    name: offering?.offering_name,
    value: offering?._id,
    selected: true,
  }));

  if (
    !offerings.some((offering) => offering._id === NOT_SELECTED_OFFERING_ID)
  ) {
    offerings.push({ ...NOT_SELECTED_OFFERING_OPTION });
  }

  return offerings;
};

export const getDefaultSidebarState = (
  context: FilterContext,
  usersList: any[] = [],
  stakeholdersList: any[] = [],
  offeringsList: any[] = []
): SidebarFilterState => ({
  statuses:
    context === 'journey'
      ? JOURNEY_DEFAULT_STATUSES.map((s) => ({ ...s }))
      : OPEN_ISSUES_DEFAULT_STATUSES.map((s) => ({ ...s })),
  createdStartDate: null,
  createdEndDate: null,
  updatedStartDate: null,
  updatedEndDate: null,
  intensityLevels: [...DEFAULT_INTENSITY_LEVELS],
  eventTypes:
    context === 'journey'
      ? JOURNEY_DEFAULT_EVENT_TYPES.map((e) => ({ ...e }))
      : [],
  signalTypes:
    context === 'journey'
      ? JOURNEY_DEFAULT_SIGNAL_TYPES.map((s) => ({ ...s }))
      : OPEN_ISSUES_DEFAULT_SIGNAL_TYPES.map((s) => ({ ...s })),
  offerings:
    context === 'open_issues' ? buildDefaultOfferings(offeringsList) : [],
  users: buildDefaultUsers(usersList),
  stakeholders: buildDefaultStakeholders(stakeholdersList),
});

export const getDefaultFullState = (
  context: FilterContext,
  usersList: any[] = [],
  stakeholdersList: any[] = [],
  offeringsList: any[] = []
): FullFilterState => ({
  ...getDefaultSidebarState(
    context,
    usersList,
    stakeholdersList,
    offeringsList
  ),
  searchText: '',
  sortBy:
    context === 'journey'
      ? JOURNEY_DEFAULT_SORT_BY.map((s) => ({ ...s }))
      : OPEN_ISSUES_DEFAULT_SORT_BY.map((s) => ({ ...s })),
});

// ─── localStorage key ───────────────────────────────────────────────

const STORAGE_KEY_PREFIX = 'ic_filters_';

export const getStorageKey = (
  context: FilterContext,
  _customerId?: number
): string => `${STORAGE_KEY_PREFIX}${context}`;

// ─── Serialization (compact format for localStorage) ────────────────

interface PersistedFilterState {
  statuses: { value: string; selected: boolean }[];
  createdStartDate: string | null;
  createdEndDate: string | null;
  updatedStartDate: string | null;
  updatedEndDate: string | null;
  intensityLevels: number[];
  eventTypes: { value: string; selected: boolean }[];
  signalTypes: { value: string; selected: boolean }[];
  offeringSelections: Record<string, boolean>;
  userSelections: Record<string, boolean>;
  stakeholderSelections: Record<string, boolean>;
  searchText: string;
  sortBy: { id: string; sortOrder: string; selected: boolean }[];
}

export const serializeForStorage = (state: FullFilterState): string => {
  const persisted: PersistedFilterState = {
    statuses: state.statuses.map((s) => ({
      value: s.value,
      selected: s.selected,
    })),
    createdStartDate: state.createdStartDate,
    createdEndDate: state.createdEndDate,
    updatedStartDate: state.updatedStartDate,
    updatedEndDate: state.updatedEndDate,
    intensityLevels: state.intensityLevels,
    eventTypes: state.eventTypes.map((e) => ({
      value: e.value,
      selected: e.selected,
    })),
    signalTypes: state.signalTypes.map((s) => ({
      value: s.value,
      selected: s.selected,
    })),
    offeringSelections: Object.fromEntries(
      state.offerings.map((offering) => [offering._id, offering.selected])
    ),
    userSelections: Object.fromEntries(
      state.users.map((u) => [u._id, u.selected])
    ),
    stakeholderSelections: Object.fromEntries(
      state.stakeholders.map((s) => [s._id, s.selected])
    ),
    searchText: state.searchText,
    sortBy: state.sortBy.map((s) => ({
      id: s.id,
      sortOrder: s.sortOrder,
      selected: s.selected,
    })),
  };
  return JSON.stringify(persisted);
};

export const deserializeFromStorage = (
  json: string,
  context: FilterContext,
  usersList: any[] = [],
  stakeholdersList: any[] = [],
  offeringsList: any[] = []
): FullFilterState | null => {
  try {
    const persisted: PersistedFilterState = JSON.parse(json);
    const defaults = getDefaultFullState(
      context,
      usersList,
      stakeholdersList,
      offeringsList
    );

    return {
      statuses: defaults.statuses.map((def) => ({
        ...def,
        selected:
          persisted.statuses?.find((s) => s.value === def.value)?.selected ??
          def.selected,
      })),
      createdStartDate: persisted.createdStartDate ?? null,
      createdEndDate: persisted.createdEndDate ?? null,
      updatedStartDate: persisted.updatedStartDate ?? null,
      updatedEndDate: persisted.updatedEndDate ?? null,
      intensityLevels: persisted.intensityLevels ?? [
        ...DEFAULT_INTENSITY_LEVELS,
      ],
      eventTypes: defaults.eventTypes.map((def) => ({
        ...def,
        selected:
          persisted.eventTypes?.find((e) => e.value === def.value)?.selected ??
          def.selected,
      })),
      signalTypes: defaults.signalTypes.map((def) => ({
        ...def,
        selected:
          persisted.signalTypes?.find((s) => s.value === def.value)?.selected ??
          def.selected,
      })),
      offerings:
        context === 'open_issues'
          ? buildDefaultOfferings(offeringsList).map((offering) => ({
              ...offering,
              selected: persisted.offeringSelections?.[offering._id] ?? true,
            }))
          : [],
      users: [
        {
          ...NOT_ASSIGNED_USER,
          selected: persisted.userSelections?.['include_missing'] ?? true,
        },
        ...usersList.map((u) => ({
          _id: u._id,
          first_name: u.first_name,
          last_name: u.last_name,
          selected: persisted.userSelections?.[u._id] ?? true,
        })),
      ],
      stakeholders: [
        {
          ...NOT_ASSIGNED_STAKEHOLDER,
          selected:
            persisted.stakeholderSelections?.['include_missing'] ?? true,
        },
        ...stakeholdersList.map((s) => ({
          _id: s._id,
          name: s.name,
          selected: persisted.stakeholderSelections?.[s._id] ?? true,
        })),
      ],
      searchText: persisted.searchText ?? '',
      sortBy: defaults.sortBy.map((def) => ({
        ...def,
        sortOrder:
          (persisted.sortBy?.find((s) => s.id === def.id)?.sortOrder as
            | 'asc'
            | 'desc') ?? def.sortOrder,
        selected:
          persisted.sortBy?.find((s) => s.id === def.id)?.selected ??
          def.selected,
      })),
    };
  } catch {
    return null;
  }
};
