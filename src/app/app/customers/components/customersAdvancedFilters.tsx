import React, { useState, useEffect, useMemo, useCallback } from 'react';
import SideDrawer from '../../../../common/components/SideDrawer';
import RangeSlider from '../../../../common/components/RangeSlider';
import MultiSelectFilter from '../../../../common/components/MultiSelectFilter';
import { getUserHierarchy } from '../../../api/users/users';
import { flattenTree } from '../../../../common/SupportFunctions';
import { useQuery } from '@tanstack/react-query';
import MultiSelectDropDown from '../../../../common/components/MultiSelectDropDown';
import { getCustomerSegments } from '../../../api/segments/segments';
import { AdvancedFiltersState, AttributeFilter, PillarConfig, PillarStatusFilter } from './treeMapChart2';
import DateRangeFilter from '../../insights/opportunities/components/DateRangeFilter';
import SearchBox from '../../../../common/components/SearchBox';

// Interface for attribute config from API
interface AttributeConfig {
    _id: string;
    name: string;
    type: string;
    data_type: 'integer' | 'float' | 'string' | 'list' | 'boolean' | 'date';
    list_options?: string[];
    is_multi_select?: boolean;
    min_value?: number;
    max_value?: number;
    order?: number;
}

interface CustomersAdvancedFilterProps {
    isOpen: boolean;
    onClose: () => void;
    userInfo: any;
    highestOpenSignal: number;
    highestCriticalSignal: number;
    highestArr: number;
    minArr?: number; // Minimum value for financial metric
    onApply?: (filters: AdvancedFiltersState) => void;
    currentFilters?: AdvancedFiltersState;
    resetKey?: number;
    attributesConfig?: AttributeConfig[];
    pillarConfig?: Record<string, PillarConfig>; // Pillar configuration from API
    sortMetricKey?: string; // The sort metric key (e.g., 'arr', 'nrr')
    sortMetricDisplayName?: string; // Display name for the sort metric (e.g., 'ARR', 'NRR')
    showZeroValuesToggle?: boolean; // Whether to show the zero values toggle
    shouldDisableFinancialFilter?: boolean; // Whether to disable financial filter when all values are zero
}

// Default starred state
const getDefaultStarredState = () => [
    { id: 0, name: 'Starred', value: 'starred', selected: true },
    { id: 1, name: 'Not Starred', value: 'not_starred', selected: true }
];

// Special ID for "Not Selected" / missing data option (used for segments only)
const NOT_SELECTED_SEGMENT_ID = '__not_selected_segment__';

const CustomersAdvancedFilter: React.FC<CustomersAdvancedFilterProps> = ({
    isOpen,
    onClose,
    userInfo,
    highestOpenSignal,
    highestCriticalSignal,
    highestArr,
    minArr = 0,
    onApply,
    currentFilters,
    resetKey,
    attributesConfig = [],
    pillarConfig = {},
    sortMetricDisplayName = 'ARR', // Default to ARR if not provided
    shouldDisableFinancialFilter = false, // Default to enabled
}) => {
    const [isAnyAttributeChanged, setIsAnyAttributeChanged] = useState(false);

    const [starredState, setStarredState] = useState<any[]>(getDefaultStarredState);

    // Initialize range sliders with fixStart/fixEnd values (0 and highest values)
    const [openIssuesFrom, setOpenIssuesFrom] = useState<number>(0);
    const [openIssuesTo, setOpenIssuesTo] = useState<number>(highestOpenSignal);

    const [criticalIssuesFrom, setCriticalIssuesFrom] = useState<number>(0);
    const [criticalIssuesTo, setCriticalIssuesTo] = useState<number>(highestCriticalSignal);

    const [arrFrom, setArrFrom] = useState<number>(0);
    const [arrTo, setArrTo] = useState<number>(highestArr);

    // Check if current metric is NRR (percentage-based)
    const isNRRMetric = useMemo(() => {
        return sortMetricDisplayName?.toLowerCase().includes('nrr') || 
               sortMetricDisplayName?.toLowerCase().includes('net revenue retention');
    }, [sortMetricDisplayName]);

    // Calculate proper min/max values for financial filter
    const financialFilterRange = useMemo(() => {
        if (shouldDisableFinancialFilter || (minArr === 0 && highestArr === 0)) {
            return { min: 0, max: 0 };
        }
        
        if (isNRRMetric) {
            // For NRR, use percentage format (0% to max% or min% to max%)
            return { 
                min: Math.max(0, minArr), // NRR typically starts from 0% or actual min
                max: Math.max(100, highestArr) // NRR max should be at least 100%
            };
        } else {
            // For other metrics (ARR, Invoiced Values), use actual values
            return { min: minArr, max: highestArr };
        }
    }, [minArr, highestArr, isNRRMetric, shouldDisableFinancialFilter]);

    const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
    const [searchTextUsers, setSearchTextUsers] = useState<string>('');
    const [checkboxUsers, setCheckboxUsers] = useState<any[]>([]);

    const [filteredSegments, setFilteredSegments] = useState<any[]>([]);
    const [searchTextSegments, setSearchTextSegments] = useState<string>('');
    const [checkboxSegments, setCheckboxSegments] = useState<any[]>([]);

    // Track if initial data is loaded for users and segments
    const [isUsersInitialized, setIsUsersInitialized] = useState(false);
    const [isSegmentsInitialized, setIsSegmentsInitialized] = useState(false);

    // Local reset key to trigger RangeSlider re-render
    const [localResetKey, setLocalResetKey] = useState(0);

    // Track previous resetKey to detect changes
    const prevResetKeyRef = React.useRef(resetKey);

    const [attributeFilterStates, setAttributeFilterStates] = useState<Map<string, any>>(new Map());

    // Pillar status filter states - Map<pillarKey, statusOptions[]>
    const [pillarFilterStates, setPillarFilterStates] = useState<Map<string, any[]>>(new Map());

    // Track which attributes have been initialized
    const [initializedAttributes, setInitializedAttributes] = useState<Set<string>>(new Set());

    // Helper function to get default filter state for an attribute
    const getDefaultAttributeFilterState = useCallback((attribute: AttributeConfig) => {
        switch (attribute.data_type) {
            case 'integer':
            case 'float':
                return {
                    from: attribute.min_value ?? 0,
                    to: attribute.max_value ?? 100,
                };
            case 'list':
                // Create array with "Not Selected" option + all list options selected by default
                // Use _id for MultiSelectDropDown compatibility
                const listOptions = [
                    { _id: '__not_selected__', name: 'Not Selected', value: 'notselected', selected: true },
                    ...(attribute.list_options?.map((opt, idx) => ({
                        _id: `opt_${idx}`,
                        name: opt,
                        value: opt,
                        selected: true,
                    })) ?? [])
                ];
                return {
                    options: listOptions,
                    filteredOptions: listOptions,
                    searchText: '',
                    includeMissing: true,
                };
            case 'boolean':
                return {
                    options: [
                        { id: 0, name: 'Yes', value: 'true', selected: true },
                        { id: 1, name: 'No', value: 'false', selected: true },
                        { id: '__not_selected__', name: 'Not Selected', value: 'notselected', selected: true },
                    ],
                    includeMissing: true,
                };
            case 'string':
                return {
                    searchText: '',
                    // includeMissing: true,
                };
            case 'date':
                return {
                    dateFrom: null as Date | null,
                    dateTo: null as Date | null,
                };
            default:
                return { includeMissing: true };
        }
    }, []);

    // Initialize attribute filter states when attributesConfig changes
    // Use refs to track state without causing re-renders or effect re-runs
    const isAttributeFiltersInitialized = React.useRef(false);
    const prevAttributesConfigIdsRef = React.useRef<string>('');
    const attributeFilterStatesRef = React.useRef<Map<string, any>>(attributeFilterStates);

    // Keep ref in sync with state
    useEffect(() => {
        attributeFilterStatesRef.current = attributeFilterStates;
    }, [attributeFilterStates]);

    useEffect(() => {
        if (attributesConfig && attributesConfig.length > 0) {
            // Check if attributesConfig actually changed (compare by IDs)
            const currentIds = attributesConfig.map(a => a._id).sort().join(',');

            if (isAttributeFiltersInitialized.current && currentIds === prevAttributesConfigIdsRef.current) {
                // Config hasn't changed, preserve existing states
                return;
            }

            const existingStates = attributeFilterStatesRef.current;
            const newStates = new Map<string, any>();
            const newInitialized = new Set<string>();

            attributesConfig.forEach((attr) => {
                // Keep existing state if already initialized, otherwise create default
                const existingState = existingStates.get(attr._id);
                if (existingState && isAttributeFiltersInitialized.current) {
                    newStates.set(attr._id, existingState);
                } else {
                    newStates.set(attr._id, getDefaultAttributeFilterState(attr));
                }
                newInitialized.add(attr._id);
            });

            setAttributeFilterStates(newStates);
            setInitializedAttributes(newInitialized);
            isAttributeFiltersInitialized.current = true;
            prevAttributesConfigIdsRef.current = currentIds;
        }
    }, [attributesConfig, getDefaultAttributeFilterState]);

    // Helper function to get default pillar status filter state
    // All statuses selected by default (red, yellow, green, grey)
    // Grey represents: actual grey status, null, missing, undefined, unknown statuses
    const getDefaultPillarStatusState = useCallback(() => [
        { id: 0, name: 'Red', value: 'red', selected: true },
        { id: 1, name: 'Yellow', value: 'yellow', selected: true },
        { id: 2, name: 'Green', value: 'green', selected: true },
        { id: 3, name: 'Grey', value: 'grey', selected: true },
    ], []);

    // Get enabled pillars from config (excluding OpenIssues - handled separately)
    const enabledPillars = useMemo(() => {
        if (!pillarConfig || Object.keys(pillarConfig).length === 0) return [];
        return Object.entries(pillarConfig)
            .filter(([key, config]) => config.enabled && key !== 'OpenIssues')
            .sort((a, b) => (a[1].order ?? 0) - (b[1].order ?? 0))
            .map(([key, config]) => ({
                key,
                displayName: config.display_name,
                order: config.order,
            }));
    }, [pillarConfig]);

    // Check if OpenIssues is enabled (for showing open/critical issues range filters)
    const isOpenIssuesEnabled = useMemo(() => {
        return pillarConfig?.OpenIssues?.enabled ?? true;
    }, [pillarConfig]);

    // Initialize pillar filter states when pillarConfig changes
    const isPillarFiltersInitialized = React.useRef(false);
    const prevPillarConfigKeysRef = React.useRef<string>('');
    const pillarFilterStatesRef = React.useRef<Map<string, any[]>>(pillarFilterStates);

    // Keep ref in sync with state
    useEffect(() => {
        pillarFilterStatesRef.current = pillarFilterStates;
    }, [pillarFilterStates]);

    useEffect(() => {
        if (enabledPillars && enabledPillars.length > 0) {
            // Check if pillarConfig actually changed (compare by keys)
            const currentKeys = enabledPillars.map(p => p.key).sort().join(',');

            if (isPillarFiltersInitialized.current && currentKeys === prevPillarConfigKeysRef.current) {
                // Config hasn't changed, preserve existing states
                return;
            }

            const existingStates = pillarFilterStatesRef.current;
            const newStates = new Map<string, any[]>();

            enabledPillars.forEach((pillar) => {
                // Keep existing state if already initialized, otherwise create default
                const existingState = existingStates.get(pillar.key);
                if (existingState && isPillarFiltersInitialized.current) {
                    newStates.set(pillar.key, existingState);
                } else {
                    newStates.set(pillar.key, getDefaultPillarStatusState());
                }
            });

            setPillarFilterStates(newStates);
            isPillarFiltersInitialized.current = true;
            prevPillarConfigKeysRef.current = currentKeys;
        }
    }, [enabledPillars, getDefaultPillarStatusState]);

    // Sync range slider max values when highestArr props change
    useEffect(() => {
        // Only update if the current value equals the old max (meaning it was at default)
        setOpenIssuesTo(prev => prev === 0 || prev === undefined ? highestOpenSignal : prev);
    }, [highestOpenSignal]);

    useEffect(() => {
        setCriticalIssuesTo(prev => prev === 0 || prev === undefined ? highestCriticalSignal : prev);
    }, [highestCriticalSignal]);

    useEffect(() => {
        setArrFrom(financialFilterRange.min);
        setArrTo(financialFilterRange.max);
    }, [financialFilterRange]);

    // Reset all internal state when resetKey changes (from parent reset button)
    useEffect(() => {
        if (prevResetKeyRef.current !== resetKey && resetKey !== undefined) {
            // Reset starred
            setStarredState(getDefaultStarredState());

            // Reset range sliders
            setOpenIssuesFrom(0);
            setOpenIssuesTo(highestOpenSignal);
            setCriticalIssuesFrom(0);
            setCriticalIssuesTo(highestCriticalSignal);
            setArrFrom(0);
            setArrTo(highestArr);

            // Increment local reset key to trigger RangeSlider re-render
            setLocalResetKey(prev => prev + 1);

            // Reset search text
            setSearchTextUsers('');
            setSearchTextSegments('');

            // Reset change flag
            setIsAnyAttributeChanged(false);

            // Reset attribute filters to defaults
            if (attributesConfig && attributesConfig.length > 0) {
                const resetStates = new Map<string, any>();
                attributesConfig.forEach((attr) => {
                    resetStates.set(attr._id, getDefaultAttributeFilterState(attr));
                });
                setAttributeFilterStates(resetStates);
            }

            // Reset pillar filters to defaults
            if (enabledPillars && enabledPillars.length > 0) {
                const resetPillarStates = new Map<string, any[]>();
                enabledPillars.forEach((pillar) => {
                    resetPillarStates.set(pillar.key, getDefaultPillarStatusState());
                });
                setPillarFilterStates(resetPillarStates);
            }

            // Reset users and segments will be handled by re-initialization
            setIsUsersInitialized(false);
            setIsSegmentsInitialized(false);
        }
        prevResetKeyRef.current = resetKey;
    }, [resetKey, highestOpenSignal, highestCriticalSignal, enabledPillars, getDefaultPillarStatusState]);


    const { data: userHierarchy } = useQuery({
        queryKey: ['userHierarchy'],
        queryFn: getUserHierarchy,
        refetchOnWindowFocus: false,
    });
    const { data: allCustomerSegments } = useQuery({
        queryKey: ['allCustomerSegments'],
        queryFn: getCustomerSegments,
    });

    const usersTeamList = useMemo(() => {
        if (userHierarchy?.data) {
            return flattenTree([userHierarchy.data], 'children');
        } else {
            return [];
        }
    }, [userHierarchy, userInfo?.id]);

    // Initialize users checkbox - all selected by default (means no filtering)
    useEffect(() => {
        if (usersTeamList?.length > 0 && !isUsersInitialized) {
            const userCheckboxItems = usersTeamList.map((user: any) => ({
                ...user,
                selected: true,
            }));
            setCheckboxUsers(userCheckboxItems);
            setIsUsersInitialized(true);
        }
    }, [usersTeamList, isUsersInitialized]);

    // Initialize segments checkbox - all selected by default (means no filtering)
    // Add "Not Selected" option for customers with missing segment
    useEffect(() => {
        if (allCustomerSegments?.data?.data?.length > 0 && !isSegmentsInitialized) {
            const notSelectedOption = {
                _id: NOT_SELECTED_SEGMENT_ID,
                segment_name: 'Not Selected',
                selected: true,
            };
            const segmentCheckboxItems = allCustomerSegments?.data?.data?.map((segment: any) => ({
                ...segment,
                selected: true,
            }));
            setCheckboxSegments([notSelectedOption, ...segmentCheckboxItems]);
            setIsSegmentsInitialized(true);
        }
    }, [allCustomerSegments, isSegmentsInitialized]);

    // Filter users based on search text
    useEffect(() => {
        if (checkboxUsers) {
            if (searchTextUsers === '') {
                setFilteredUsers(checkboxUsers);
            } else {
                const lowerSearch = searchTextUsers.toLowerCase();
                const filtered = checkboxUsers.filter((user: any) =>
                    user?.first_name?.toLowerCase()?.includes(lowerSearch) ||
                    user?.last_name?.toLowerCase()?.includes(lowerSearch)
                ) || [];
                setFilteredUsers(filtered);
            }
        }
    }, [searchTextUsers, checkboxUsers]);

    // Filter segments based on search text
    useEffect(() => {
        if (checkboxSegments) {
            if (searchTextSegments === '') {
                setFilteredSegments(checkboxSegments);
            } else {
                const lowerSearch = searchTextSegments.toLowerCase();
                const filtered = checkboxSegments.filter((segment: any) =>
                    segment?.segment_name?.toLowerCase()?.includes(lowerSearch)
                ) || [];
                setFilteredSegments(filtered);
            }
        }
    }, [searchTextSegments, checkboxSegments]);

    // Handle users checkbox change
    const handleUsersChange = useCallback((updatedUsers: any[] | ((prev: any[]) => any[])) => {
        if (typeof updatedUsers === 'function') {
            setCheckboxUsers(updatedUsers);
        } else {
            setCheckboxUsers(updatedUsers);
        }
        setIsAnyAttributeChanged(true);
    }, []);

    // Handle segments checkbox change
    const handleSegmentsChange = useCallback((updatedSegments: any[] | ((prev: any[]) => any[])) => {
        if (typeof updatedSegments === 'function') {
            setCheckboxSegments(updatedSegments);
        } else {
            setCheckboxSegments(updatedSegments);
        }
        setIsAnyAttributeChanged(true);
    }, []);

    const handleStarredChange = useCallback((selectedValues: any[]) => {
        setStarredState(selectedValues);
        setIsAnyAttributeChanged(true);
    }, []);

    const handleOpenIssues = useCallback((values: { minValue: number; maxValue: number; }) => {
        setOpenIssuesFrom(values.minValue);
        setOpenIssuesTo(values.maxValue);
        setIsAnyAttributeChanged(true);
    }, []);

    const handleCriticalIssues = useCallback((values: { minValue: number; maxValue: number; }) => {
        setCriticalIssuesFrom(values.minValue);
        setCriticalIssuesTo(values.maxValue);
        setIsAnyAttributeChanged(true);
    }, []);

    const handleArrChange = useCallback((values: { minValue: number; maxValue: number; }) => {
        setArrFrom(values.minValue);
        setArrTo(values.maxValue);
        setIsAnyAttributeChanged(true);
    }, []);

    // Handler for numeric (integer/float) attribute range changes
    const handleAttributeRangeChange = useCallback((attributeId: string, values: { minValue: number; maxValue: number }) => {
        setAttributeFilterStates(prev => {
            const newStates = new Map(prev);
            const currentState = newStates.get(attributeId) || {};
            newStates.set(attributeId, {
                ...currentState,
                from: values.minValue,
                to: values.maxValue,
            });
            return newStates;
        });
        setIsAnyAttributeChanged(true);
    }, []);

    // Handler for list/boolean attribute selection changes
    const handleAttributeListChange = useCallback((attributeId: string, selectedItems: any[] | ((prev: any[]) => any[])) => {
        setAttributeFilterStates(prev => {
            const newStates = new Map(prev);
            const currentState = newStates.get(attributeId) || {};

            // Handle function updater pattern from MultiSelectDropDown
            const resolvedItems = typeof selectedItems === 'function'
                ? selectedItems(currentState.options || [])
                : selectedItems;

            const includeMissing = resolvedItems.some((item: any) => item.value === 'notselected' && item.selected);

            // Update both options and filteredOptions
            const searchText = currentState.searchText || '';
            const filteredOptions = searchText
                ? resolvedItems.filter((item: any) =>
                    item.name?.toLowerCase()?.includes(searchText.toLowerCase()))
                : resolvedItems;

            newStates.set(attributeId, {
                ...currentState,
                options: resolvedItems,
                filteredOptions,
                includeMissing,
            });
            return newStates;
        });
        setIsAnyAttributeChanged(true);
    }, []);

    // Handler for list attribute search text changes
    const handleAttributeListSearchChange = useCallback((attributeId: string, searchText: string) => {
        setAttributeFilterStates(prev => {
            const newStates = new Map(prev);
            const currentState = newStates.get(attributeId) || {};
            const options = currentState.options || [];

            const filteredOptions = searchText
                ? options.filter((item: any) =>
                    item.name?.toLowerCase()?.includes(searchText.toLowerCase()))
                : options;

            newStates.set(attributeId, {
                ...currentState,
                searchText,
                filteredOptions,
            });
            return newStates;
        });
    }, []);

    // Handler for string attribute search text changes
    const handleAttributeStringChange = useCallback((attributeId: string, searchText: string) => {
        setAttributeFilterStates(prev => {
            const newStates = new Map(prev);
            const currentState = newStates.get(attributeId) || {};
            newStates.set(attributeId, {
                ...currentState,
                searchText,
            });
            return newStates;
        });
        setIsAnyAttributeChanged(true);
    }, []);

    // Handler for date attribute date range changes
    const handleAttributeDateFromChange = useCallback((attributeId: string, date: Date | null) => {
        setAttributeFilterStates(prev => {
            const newStates = new Map(prev);
            const currentState = newStates.get(attributeId) || {};
            newStates.set(attributeId, {
                ...currentState,
                dateFrom: date,
            });
            return newStates;
        });
        setIsAnyAttributeChanged(true);
    }, []);

    const handleAttributeDateToChange = useCallback((attributeId: string, date: Date | null) => {
        setAttributeFilterStates(prev => {
            const newStates = new Map(prev);
            const currentState = newStates.get(attributeId) || {};
            newStates.set(attributeId, {
                ...currentState,
                dateTo: date,
            });
            return newStates;
        });
        setIsAnyAttributeChanged(true);
    }, []);

    // Handler for pillar status filter changes
    const handlePillarStatusChange = useCallback((pillarKey: string, selectedValues: any[]) => {
        setPillarFilterStates(prev => {
            const newStates = new Map(prev);
            newStates.set(pillarKey, selectedValues);
            return newStates;
        });
        setIsAnyAttributeChanged(true);
    }, []);

    // Check if current state differs from default (to enable/disable reset button)
    const isAtDefaultState = useMemo(() => {
        // Check starred - both should be selected
        const starredDefault = starredState.every((s: any) => s.selected === true);

        // Check range sliders - should be at full range (0 to highest)
        const openIssuesDefault = openIssuesFrom === 0 && openIssuesTo === highestOpenSignal;
        const criticalIssuesDefault = criticalIssuesFrom === 0 && criticalIssuesTo === highestCriticalSignal;

        // Check users - all should be selected
        const usersDefault = checkboxUsers.length === 0 || checkboxUsers.every((user: any) => user.selected === true);

        // Check segments - all should be selected
        const segmentsDefault = checkboxSegments.length === 0 || checkboxSegments.every((segment: any) => segment.selected === true);

        // Check dynamic attributes - all should be at default
        let attributesDefault = true;
        if (attributesConfig && attributesConfig.length > 0) {
            for (const attr of attributesConfig) {
                const state = attributeFilterStates.get(attr._id);
                if (!state) continue;

                const defaultState = getDefaultAttributeFilterState(attr);

                switch (attr.data_type) {
                    case 'integer':
                    case 'float':
                        if (state.from !== defaultState.from || state.to !== defaultState.to) {
                            attributesDefault = false;
                        }
                        break;
                    case 'list':
                    case 'boolean':
                        // Check if all options are selected (default state)
                        if (state.options?.some((opt: any) => !opt.selected)) {
                            attributesDefault = false;
                        }
                        break;
                    case 'string':
                        if (state.searchText && state.searchText !== '') {
                            attributesDefault = false;
                        }
                        break;
                    case 'date':
                        if (state.dateFrom !== null || state.dateTo !== null) {
                            attributesDefault = false;
                        }
                        break;
                }

                if (!attributesDefault) break;
            }
        }

        // Check pillar filters - all statuses should be selected for each pillar
        let pillarsDefault = true;
        if (enabledPillars && enabledPillars.length > 0) {
            for (const pillar of enabledPillars) {
                const state = pillarFilterStates.get(pillar.key);
                if (state && state.some((s: any) => !s.selected)) {
                    pillarsDefault = false;
                    break;
                }
            }
        }

        return starredDefault && openIssuesDefault && criticalIssuesDefault && usersDefault && segmentsDefault && attributesDefault && pillarsDefault;
    }, [starredState, openIssuesFrom, openIssuesTo, criticalIssuesFrom, criticalIssuesTo, checkboxUsers, checkboxSegments, highestOpenSignal, highestCriticalSignal, attributeFilterStates, attributesConfig, getDefaultAttributeFilterState, enabledPillars, pillarFilterStates]);

    // Reset all filters back to default state and apply them
    const handleReset = useCallback(() => {
        // Reset starred
        setStarredState(getDefaultStarredState());

        // Reset range sliders to full range (0 to highest)
        setOpenIssuesFrom(0);
        setOpenIssuesTo(highestOpenSignal);
        setCriticalIssuesFrom(0);
        setCriticalIssuesTo(highestCriticalSignal);

        // Increment local reset key to trigger RangeSlider re-render
        setLocalResetKey(prev => prev + 1);

        // Reset users - all selected
        if (usersTeamList?.length > 0) {
            const resetUsers = usersTeamList.map((user: any) => ({
                ...user,
                selected: true,
            }));
            setCheckboxUsers(resetUsers);
        }

        // Reset segments - all selected including "Not Selected" option
        const segmentsData = allCustomerSegments?.data?.data;
        if (segmentsData?.length > 0) {
            const notSelectedOption = {
                _id: NOT_SELECTED_SEGMENT_ID,
                segment_name: 'Not Selected',
                selected: true,
            };
            const resetSegments = segmentsData.map((segment: any) => ({
                ...segment,
                selected: true,
            }));
            setCheckboxSegments([notSelectedOption, ...resetSegments]);
        }

        // Reset search text
        setSearchTextUsers('');
        setSearchTextSegments('');

        // Reset dynamic attribute filters to defaults
        if (attributesConfig && attributesConfig.length > 0) {
            const resetStates = new Map<string, any>();
            attributesConfig.forEach((attr) => {
                resetStates.set(attr._id, getDefaultAttributeFilterState(attr));
            });
            setAttributeFilterStates(resetStates);
        }

        // Reset pillar filters to defaults
        if (enabledPillars && enabledPillars.length > 0) {
            const resetPillarStates = new Map<string, any[]>();
            enabledPillars.forEach((pillar) => {
                resetPillarStates.set(pillar.key, getDefaultPillarStatusState());
            });
            setPillarFilterStates(resetPillarStates);
        }

        // Apply default filters to data immediately
        const defaultFilters: AdvancedFiltersState = {
            starredFilter: { starred: true, notStarred: true },
            openIssuesRange: { from: undefined, to: undefined },
            criticalIssuesRange: { from: undefined, to: undefined },
            arrRange: { from: undefined, to: undefined },
            selectedUserIds: new Set<string>(),
            selectedSegmentIds: new Set<string>(),
            includeCustomersWithNoSegment: true,
            includeCustomersWithNoAssignedUser: true,
            isFiltersApplied: false,
            attributeFilters: new Map<string, AttributeFilter>(),
            pillarFilters: new Map<string, PillarStatusFilter>(),
            showZeroValues: false,
        };

        onApply?.(defaultFilters);
        setIsAnyAttributeChanged(false);
    }, [highestOpenSignal, highestCriticalSignal, highestArr, usersTeamList, allCustomerSegments, onApply, attributesConfig, getDefaultAttributeFilterState, enabledPillars, getDefaultPillarStatusState]);

    // Apply filters - build the filter state and call onApply
    const handleApply = useCallback(() => {
        if (!isAnyAttributeChanged) return;

        // Build starred filter
        const starredSelected = starredState.find((s: any) => s.value === 'starred')?.selected ?? true;
        const notStarredSelected = starredState.find((s: any) => s.value === 'not_starred')?.selected ?? true;

        // Check if "Not Selected" option is checked for segments
        const notSelectedSegmentItem = checkboxSegments.find((segment: any) => segment._id === NOT_SELECTED_SEGMENT_ID);
        const includeCustomersWithNoSegment = notSelectedSegmentItem?.selected ?? true;

        // Build selected user IDs set
        const selectedUserIds = new Set<string>();
        checkboxUsers.forEach((user: any) => {
            if (user.selected && user._id) {
                selectedUserIds.add(user._id);
            }
        });

        // Build selected segment IDs set (exclude the special "Not Selected" ID)
        const selectedSegmentIds = new Set<string>();
        checkboxSegments.forEach((segment: any) => {
            if (segment.selected && segment._id && segment._id !== NOT_SELECTED_SEGMENT_ID) {
                selectedSegmentIds.add(segment._id);
            }
        });

        // Build attribute filters
        const attributeFilters = new Map<string, AttributeFilter>();
        if (attributesConfig && attributesConfig.length > 0) {
            attributesConfig.forEach((attr) => {
                const state = attributeFilterStates.get(attr._id);
                if (!state) return;

                const defaultState = getDefaultAttributeFilterState(attr);
                let isApplied = false;

                // Check if this filter has been modified from default
                switch (attr.data_type) {
                    case 'integer':
                    case 'float':
                        isApplied = state.from !== defaultState.from || state.to !== defaultState.to;
                        if (isApplied) {
                            attributeFilters.set(attr._id, {
                                attributeId: attr._id,
                                dataType: attr.data_type,
                                rangeFrom: state.from,
                                rangeTo: state.to,
                                includeMissing: false, // Always exclude missing for numeric types
                                isApplied: true,
                            });
                        }
                        break;
                    case 'list':
                        // Check if any option is deselected
                        isApplied = state.options?.some((opt: any) => !opt.selected);
                        if (isApplied) {
                            const selectedOptions = new Set<string>();
                            state.options?.forEach((opt: any) => {
                                if (opt.selected && opt.value !== 'notselected') {
                                    selectedOptions.add(opt.value);
                                }
                            });
                            const includeMissing = state.options?.find((opt: any) => opt.value === 'notselected')?.selected ?? true;
                            attributeFilters.set(attr._id, {
                                attributeId: attr._id,
                                dataType: 'list',
                                selectedOptions,
                                includeMissing,
                                isApplied: true,
                            });
                        }
                        break;
                    case 'boolean':
                        // Check if any option is deselected
                        isApplied = state.options?.some((opt: any) => !opt.selected);
                        if (isApplied) {
                            const trueSelected = state.options?.find((opt: any) => opt.value === 'true')?.selected ?? true;
                            const falseSelected = state.options?.find((opt: any) => opt.value === 'false')?.selected ?? true;
                            const includeMissing = state.options?.find((opt: any) => opt.value === 'notselected')?.selected ?? true;
                            attributeFilters.set(attr._id, {
                                attributeId: attr._id,
                                dataType: 'boolean',
                                booleanValue: { true: trueSelected, false: falseSelected },
                                includeMissing,
                                isApplied: true,
                            });
                        }
                        break;
                    case 'string':
                        isApplied = state.searchText && state.searchText !== '';
                        if (isApplied) {
                            attributeFilters.set(attr._id, {
                                attributeId: attr._id,
                                dataType: 'string',
                                searchText: state.searchText,
                                includeMissing: false, // Always exclude missing for string types
                                isApplied: true,
                            });
                        }
                        break;
                    case 'date':
                        isApplied = state.dateFrom !== null || state.dateTo !== null;
                        if (isApplied) {
                            attributeFilters.set(attr._id, {
                                attributeId: attr._id,
                                dataType: 'date',
                                dateFrom: state.dateFrom,
                                dateTo: state.dateTo,
                                includeMissing: false, // Always exclude missing for date types
                                isApplied: true,
                            });
                        }
                        break;
                }
            });
        }

        // Build pillar status filters (AND between pillars, OR within each pillar)
        // Note: Grey status represents missing/null/undefined statuses as well
        const pillarFilters = new Map<string, PillarStatusFilter>();
        if (enabledPillars && enabledPillars.length > 0) {
            enabledPillars.forEach((pillar) => {
                const state = pillarFilterStates.get(pillar.key);
                if (!state) return;

                // Check if any status is deselected (filter is applied)
                const isApplied = state.some((s: any) => !s.selected);
                if (isApplied) {
                    const selectedStatuses = new Set<string>();
                    state.forEach((s: any) => {
                        if (s.selected) {
                            selectedStatuses.add(s.value.toLowerCase());
                        }
                    });
                    // Grey status includes missing/null - so includeMissing is true when grey is selected
                    const includeMissing = state.find((s: any) => s.value === 'grey')?.selected ?? false;

                    pillarFilters.set(pillar.key, {
                        pillarKey: pillar.key,
                        displayName: pillar.displayName,
                        selectedStatuses,
                        includeMissing,
                        isApplied: true,
                    });
                }
            });
        }

        const filters: AdvancedFiltersState = {
            starredFilter: { starred: starredSelected, notStarred: notStarredSelected },
            openIssuesRange: { from: openIssuesFrom, to: openIssuesTo },
            criticalIssuesRange: { from: criticalIssuesFrom, to: criticalIssuesTo },
            arrRange: { from: arrFrom, to: arrTo },
            selectedUserIds,
            selectedSegmentIds,
            includeCustomersWithNoSegment,
            includeCustomersWithNoAssignedUser: true, // No longer filtered - removed "Not Selected" option
            isFiltersApplied: true,
            attributeFilters,
            pillarFilters,
            showZeroValues: false, // Not used in sidebar anymore, always default to false
        };

        onApply?.(filters);
        setIsAnyAttributeChanged(false);
        onClose();
    }, [
        isAnyAttributeChanged,
        starredState,
        openIssuesFrom,
        openIssuesTo,
        criticalIssuesFrom,
        criticalIssuesTo,
        arrFrom,
        arrTo,
        checkboxUsers,
        checkboxSegments,
        onApply,
        onClose,
        attributesConfig,
        attributeFilterStates,
        getDefaultAttributeFilterState,
        enabledPillars,
        pillarFilterStates,
    ]);


    return (
        <SideDrawer
            isOpen={isOpen}
            onClose={onClose}
            title="Filters"
            width="w-[520px]"
        >
            <div>
                <div className="pl-5 pr-7 pt-6 space-y-[30px] h-[calc(100vh-130px)] overflow-y-auto box-border overflow-x-hidden scroll">
                    {/* 1. Starred and Unstarred Filter */}
                    <MultiSelectFilter
                        title={"Starred"}
                        attributeId={"starred"}
                        key={"starred"}
                        state={starredState}
                        maxVisibleItems={5}
                        onSelectionChange={(value) => handleStarredChange(value)}
                    />
                    <div className='border-b border-[#E4E7EC]'></div>

                    {/* 2. Segments Filter - Only show if segments are defined */}
                    {allCustomerSegments?.data?.data && allCustomerSegments?.data?.data?.length > 0 && (
                        <>
                            <MultiSelectDropDown
                                filteredItems={filteredSegments}
                                dataFieldToUseForSelection="segment_name"
                                uniqueIdFieldToUseForSelection="_id"
                                checkboxItems={checkboxSegments}
                                setCheckboxItems={handleSegmentsChange}
                                typeOfData="Segment"
                                wantToShowSearchBox={true}
                                setSearchText={setSearchTextSegments}
                                searchText={searchTextSegments}
                                triggerTextCss="h-[32px] text-nowrap border-none"
                                dropDownContentCss="w-full border-none shadow-none"
                                dropDownContentTitleCss="text-[16px] leading-6 font-medium text-[#202B37]"
                                alwaysOpen={true}
                                hideTrigger={true}
                            />
                            <div className='border-b border-[#E4E7EC]'></div>
                        </>
                    )}

                    {/* 3. Financial Metric Range Filter (ARR/NRR/etc.) */}
                    <div className="mb-4">
                        <div className={shouldDisableFinancialFilter ? 'opacity-50 pointer-events-none' : ''}>
                            <RangeSlider
                                key={`arr-${localResetKey}`}
                                title={sortMetricDisplayName}
                                fixStart={financialFilterRange.min}
                                fixEnd={financialFilterRange.max}
                                mobileStart={arrFrom}
                                mobileEnd={arrTo}
                                step={0}
                                onChange={shouldDisableFinancialFilter ? () => {} : handleArrChange}
                            />
                        </div>
                    </div>
                    <div className='border-b border-[#E4E7EC]'></div>

                    {/* 4. Assigned To Filter */}
                    <MultiSelectDropDown
                        filteredItems={filteredUsers}
                        dataFieldToUseForSelection="first_name"
                        extraDataFieldToUseForSelection="last_name"
                        uniqueIdFieldToUseForSelection="_id"
                        checkboxItems={checkboxUsers}
                        setCheckboxItems={handleUsersChange}
                        typeOfData="Assigned to"
                        wantToShowSearchBox={true}
                        setSearchText={setSearchTextUsers}
                        searchText={searchTextUsers}
                        triggerTextCss="h-[32px] text-nowrap border-none"
                        dropDownContentCss="w-full border-none shadow-none"
                        dropDownContentTitleCss="text-[16px] leading-6 font-medium text-[#202B37]"
                        alwaysOpen={true}
                        hideTrigger={true}
                    />
                    <div className='border-b border-[#E4E7EC]'></div>

                    {/* 5. Status Related Parameters */}
                    {/* Pillar Status Filters - Dynamic based on enabled pillars */}
                    {enabledPillars && enabledPillars.length > 0 && (
                        <div className='w-full flex flex-col justify-start space-y-[15px]'>
                            <div>
                                <span className='text-[16px] leading-6 font-medium text-[#202B37]'>Status</span>
                            </div>
                            {enabledPillars.map((pillar, index) => {
                                const state = pillarFilterStates.get(pillar.key);
                                if (!state) return null;
                                return (
                                    <div key={pillar.key} className='w-full'>
                                        <MultiSelectFilter
                                            title={pillar.displayName}
                                            attributeId={`pillar-${pillar.key}`}
                                            state={state}
                                            maxVisibleItems={5}
                                            onSelectionChange={(value) => handlePillarStatusChange(pillar.key, value)}
                                            className="h-fit !gap-2 font-normal !text-[14px]"
                                            gridColumns={4}
                                            minColumnWidth={60}
                                        />
                                        {/* {index < enabledPillars.length - 1 && ( */}
                                            <div className='border-b border-[#E4E7EC] mt-[15px]'></div>
                                        {/* )} */}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Open Issues Range - Only show if OpenIssues pillar is enabled */}
                    {isOpenIssuesEnabled && (
                        <>
                            <div className="mb-4">
                                <RangeSlider
                                    key={`open-issues-${localResetKey}`}
                                    title="Open issues"
                                    fixStart={0}
                                    fixEnd={highestOpenSignal}
                                    mobileStart={openIssuesFrom}
                                    mobileEnd={openIssuesTo}
                                    step={0}
                                    onChange={handleOpenIssues}
                                />
                            </div>
                            <div className='border-b border-[#E4E7EC]'></div>
                            <div className="mb-4">
                                <RangeSlider
                                    key={`critical-issues-${localResetKey}`}
                                    title="Critical issues"
                                    fixStart={0}
                                    fixEnd={highestCriticalSignal}
                                    mobileStart={criticalIssuesFrom}
                                    mobileEnd={criticalIssuesTo}
                                    step={0}
                                    onChange={handleCriticalIssues}
                                />
                            </div>
                            <div className='border-b border-[#E4E7EC]'></div>
                        </>
                    )}
                    {/* {enabledPillars && enabledPillars.length > 0 && (
                        <div className='border-b border-[#E4E7EC]'></div>
                    )} */}

                    {/* 6. Customer Parameters (Attributes) */}

                    {attributesConfig && attributesConfig.length > 0 && (
                        <>
                            <div className='border-b border-[#E4E7EC]'></div>
                            {attributesConfig
                                .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                                .map((attribute) => {
                                    const state = attributeFilterStates.get(attribute._id);
                                    if (!state) return null;
                                    return (
                                        <React.Fragment key={attribute._id}>
                                            {/* Integer/Float - Range Slider */}
                                            {(attribute.data_type === 'integer' || attribute.data_type === 'float') && (
                                                <>
                                                    <div className="mb-4">
                                                        <RangeSlider
                                                            key={`attr-${attribute._id}-${localResetKey}`}
                                                            title={attribute.name}
                                                            fixStart={attribute.min_value ?? 0}
                                                            fixEnd={attribute.max_value ?? 100}
                                                            mobileStart={state.from}
                                                            mobileEnd={state.to}
                                                            step={attribute.data_type === 'float' ? 0.1 : 1}
                                                            onChange={(values) => handleAttributeRangeChange(attribute._id, values)}
                                                        />
                                                    </div>
                                                    <div className='border-b border-[#E4E7EC]'></div>
                                                </>
                                            )}

                                            {/* List - MultiSelectDropDown */}
                                            {attribute.data_type === 'list' && (
                                                <>
                                                    <MultiSelectDropDown
                                                        key={`attr-list-${attribute._id}-${localResetKey}`}
                                                        filteredItems={state.filteredOptions ?? state.options ?? []}
                                                        dataFieldToUseForSelection="name"
                                                        uniqueIdFieldToUseForSelection="_id"
                                                        checkboxItems={state.options ?? []}
                                                        setCheckboxItems={(items) => handleAttributeListChange(attribute._id, items)}
                                                        typeOfData={attribute.name}
                                                        wantToShowSearchBox={true}
                                                        setSearchText={(text) => handleAttributeListSearchChange(attribute._id, text)}
                                                        searchText={state.searchText ?? ''}
                                                        triggerTextCss="h-[32px] text-nowrap border-none"
                                                        dropDownContentCss="w-full border-none shadow-none"
                                                        dropDownContentTitleCss="text-[16px] leading-6 font-medium text-[#202B37]"
                                                        alwaysOpen={true}
                                                        hideTrigger={true}
                                                    />
                                                    <div className='border-b border-[#E4E7EC]'></div>
                                                </>
                                            )}

                                            {/* Boolean - MultiSelectFilter */}
                                            {attribute.data_type === 'boolean' && (
                                                <>
                                                    <MultiSelectFilter
                                                        title={attribute.name}
                                                        attributeId={attribute._id}
                                                        key={`attr-bool-${attribute._id}-${localResetKey}`}
                                                        state={state.options ?? []}
                                                        maxVisibleItems={3}
                                                        onSelectionChange={(value) => handleAttributeListChange(attribute._id, value)}
                                                        className="h-fit"
                                                    />
                                                    <div className='border-b border-[#E4E7EC]'></div>
                                                </>
                                            )}

                                            {/* String - Search Box */}
                                            {attribute.data_type === 'string' && (
                                                <>
                                                    <div className="w-full flex justify-start items-center gap-10 h-8">
                                                        <label className="block text-[16px] leading-6 font-medium text-[#202B37]">
                                                            {attribute.name}
                                                        </label>
                                                        <SearchBox
                                                            searchText={state.searchText ?? ''}
                                                            setSearchText={(value) => handleAttributeStringChange(attribute._id, value)}
                                                            dataType={"Enter keyword"}
                                                            needBorder={true}
                                                            needSearchIcon={false}
                                                        />
                                                    </div>
                                                    <div className='border-b border-[#E4E7EC]'></div>
                                                </>
                                            )}

                                            {/* Date - Date Range Filter */}
                                            {attribute.data_type === 'date' && (
                                                <>
                                                    <DateRangeFilter
                                                        title={attribute.name}
                                                        startDate={state.dateFrom}
                                                        setStartDate={(date) => handleAttributeDateFromChange(attribute._id, date)}
                                                        endDate={state.dateTo}
                                                        setEndDate={(date) => handleAttributeDateToChange(attribute._id, date)}
                                                        isDataChanged={setIsAnyAttributeChanged}
                                                    />
                                                    <div className='border-b border-[#E4E7EC]'></div>
                                                </>
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                        </>
                    )}

                </div>
                {/* Action Buttons */}
                <div className="h-18 bottom-0 left-0 w-full py-4 px-4 border-t border-gray-200 flex justify-end gap-2 box-border bg-white rounded-b-[12px]">
                    <button
                        onClick={handleReset}
                        disabled={isAtDefaultState}
                        className={`w-fit font-medium py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-0 border ${isAtDefaultState
                            ? 'text-gray-400 border-gray-200 cursor-not-allowed bg-gray-50'
                            : 'text-[#202B37] border-gray-300 hover:bg-gray-50'
                            }`}
                    >
                        Reset
                    </button>
                    <button
                        onClick={handleApply}
                        disabled={!isAnyAttributeChanged}
                        className={`${isAnyAttributeChanged ? 'bg-blue-600 hover:bg-blue-700' : 'bg-[#CCE0FF] cursor-not-allowed'} w-fit text-white font-medium py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-0`}
                    >
                        Apply filter
                    </button>
                </div>
            </div>

        </SideDrawer>
    );
};

export default CustomersAdvancedFilter;

