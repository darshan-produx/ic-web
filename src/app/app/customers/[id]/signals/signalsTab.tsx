'use client';

import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/light.css';
import { useMemo, useState } from 'react';
import SignalDetails from '../journey/signalDetails';
import SignalSection from './signalsGroup';
import DeleteModal from '../../../../../common/components/DeleteModal';
import { toast } from 'react-toastify';
import { useQuery } from '@tanstack/react-query';
import { useUpdateEventInEventJourney } from '../../../../../services/mutations/customersMutations';
import { apiRequest } from '../../../../../common/api-request';
import SearchBox from '../../../../../common/components/SearchBox';
import IconButton from '../../../../../common/components/IconButton';
import OutlineButton from '../../../../../common/components/OutlineButton';
import SingleSelectDropDown from '../../../../../common/components/SingleSelectDropDown';
import { ReactivateSvgIcon } from '../../../../../app/assests/icons/icons';
import FilterSidebar from '../filters/FilterSidebar';
import { UseFilterPersistenceReturn } from '../filters/useFilterPersistence';
import { NOT_SELECTED_OFFERING_ID, SortByItem } from '../filters/filterTypes';

type SignalsProps = {
  customerId: number;
  signals: any[];
  userinfo?: any;
  customerName?: string;
  isLoading?: boolean;
  isError?: boolean;
  isMyTeamPage?: boolean;
  /** New: pass the filter-persistence hook return for full filter support */
  filterHook?: UseFilterPersistenceReturn;
};

export default function Signals({
  customerId,
  signals,
  userinfo,
  isLoading,
  isError,
  isMyTeamPage,
  filterHook,
}: SignalsProps) {
  const [isSideDrawerOpen, setIsSideDrawerOpen] = useState(false);
  const [selectedSignalId, setSelectedSignalId] = useState<string>('');
  const [deleteModal, setDeleteModal] = useState(false);
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false);
  const [groupByOptions, setGroupByOptions] = useState([
    { id: 'none', label: 'None', value: 'none', selected: true },
    { id: 'offering', label: 'Offering', value: 'offering', selected: false },
  ]);

  const updateSignalMutation = useUpdateEventInEventJourney();

  const { data: userinfo01 } = useQuery({
    queryKey: ['userDetails'],
    queryFn: () =>
      apiRequest({
        url: '/api/app-service/v1/userinfo?is_email_encrypt=true',
      }),
    refetchOnWindowFocus: false,
    enabled: !userinfo,
  });

  const issueSignals = useMemo(() => {
    if (!signals || !Array.isArray(signals)) return [];
    // Data is pre-sorted by the API; just return as-is
    return signals;
  }, [signals]);

  const deleteToggle = () => {
    setDeleteModal(() => !deleteModal);
  };

  const handleDelete = async () => {
    try {
      const response = await updateSignalMutation.mutateAsync({
        signalId: selectedSignalId,
        data: { is_deleted: true },
        fromPage: 'customer-360',
      });
      if (response && response.status === 200) {
        toast.success('Signal deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting signal:', error);
    }
    setIsSideDrawerOpen(false);
    deleteToggle();
  };

  // Sort by handler
  const handleSortBySelection = (item: any) => {
    filterHook?.setSortBy((prev: SortByItem[]) =>
      prev.map((unit) =>
        unit.id === item.id
          ? {
              ...unit,
              selected: true,
              sortOrder:
                unit.sortOrder === 'asc' ? ('desc' as const) : ('asc' as const),
            }
          : { ...unit, selected: false }
      )
    );
  };

  const handleGroupBySelection = (item: any) => {
    setGroupByOptions((prev) =>
      prev.map((unit) => ({
        ...unit,
        selected: unit.id === item.id,
      }))
    );
  };

  const selectedGroupBy = useMemo(
    () => groupByOptions.find((item) => item.selected)?.value ?? 'none',
    [groupByOptions]
  );

  const groupByOfferingFilterConfig = useMemo(() => {
    const offerings = filterHook?.applied?.offerings ?? [];
    const notSelectedOption = offerings.find(
      (offering) => offering._id === NOT_SELECTED_OFFERING_ID
    );
    const includeUnassignedOffering = notSelectedOption
      ? notSelectedOption.selected
      : true;

    const realOfferings = offerings.filter(
      (offering) => offering._id !== NOT_SELECTED_OFFERING_ID
    );
    const selectedRealOfferingNames = new Set(
      realOfferings
        .filter((offering) => offering.selected)
        .map((offering) => offering.offering_name)
        .filter(
          (name): name is string =>
            typeof name === 'string' && name.trim().length > 0
        )
    );

    const allRealOfferingsSelected =
      selectedRealOfferingNames.size === realOfferings.length;
    const shouldRestrictGroups =
      offerings.length > 0 &&
      (!allRealOfferingsSelected || !includeUnassignedOffering);

    return {
      includeUnassignedOffering,
      selectedRealOfferingNames,
      shouldRestrictGroups,
    };
  }, [filterHook?.applied?.offerings]);

  const groupedByOfferingSignals = useMemo(() => {
    if (selectedGroupBy !== 'offering') return [];

    const groups = new Map<string, any[]>();
    issueSignals.forEach((signal) => {
      const offeringNamesFromObjects = Array.isArray(signal?.offerings)
        ? signal.offerings
            .map((offering: any) => offering?.offering_name)
            .filter(
              (name: any) => typeof name === 'string' && name.trim().length > 0
            )
        : [];
      const offeringNamesFromStrings =
        offeringNamesFromObjects.length > 0
          ? []
          : Array.isArray(signal?.offering_names)
          ? signal.offering_names.filter(
              (name: any) => typeof name === 'string' && name.trim().length > 0
            )
          : [];

      const normalizedOfferingNames: string[] = (
        offeringNamesFromObjects.length > 0
          ? offeringNamesFromObjects
          : offeringNamesFromStrings
      ).map((name: string) => name.trim());

      const uniqueOfferingNames: string[] = Array.from(
        new Set<string>(normalizedOfferingNames)
      );

      let targetGroups: string[] = [];
      if (uniqueOfferingNames.length > 0) {
        targetGroups = groupByOfferingFilterConfig.shouldRestrictGroups
          ? uniqueOfferingNames.filter((name) =>
              groupByOfferingFilterConfig.selectedRealOfferingNames.has(name)
            )
          : uniqueOfferingNames;
      } else if (
        !groupByOfferingFilterConfig.shouldRestrictGroups ||
        groupByOfferingFilterConfig.includeUnassignedOffering
      ) {
        targetGroups = ['Unassigned Offering'];
      }

      targetGroups.forEach((groupName: string) => {
        const existing = groups.get(groupName) ?? [];
        existing.push(signal);
        groups.set(groupName, existing);
      });
    });

    const sortedGroupEntries = Array.from(groups.entries()).sort((a, b) => {
      if (a[0] === 'Unassigned Offering') return 1;
      if (b[0] === 'Unassigned Offering') return -1;
      return a[0].localeCompare(b[0]);
    });

    return sortedGroupEntries.map(([title, groupedSignals]) => ({
      title,
      signals: groupedSignals,
    }));
  }, [groupByOfferingFilterConfig, issueSignals, selectedGroupBy]);

  // Render loading state content
  const renderLoadingState = () => (
    <div className="flex items-center justify-center h-full min-h-[200px] text-gray-300">
      <div className="text-lg">Loading open issues</div>
    </div>
  );

  // Render error state content
  const renderErrorState = () => (
    <div className="flex items-center justify-center h-full min-h-[200px] text-gray-300">
      <div className="text-lg">Error loading open issues</div>
    </div>
  );

  // Render signals content
  const renderContent = () => {
    if (isLoading) return renderLoadingState();
    if (isError) return renderErrorState();

    if (selectedGroupBy === 'offering') {
      if (groupedByOfferingSignals.length === 0) {
        return (
          <SignalSection
            title=""
            signals={[]}
            setIsSideDrawerOpen={setIsSideDrawerOpen}
            setSelectedSignalId={setSelectedSignalId}
            showSeparator={false}
          />
        );
      }
      return (
        <div className="flex flex-col gap-8">
          {groupedByOfferingSignals.map((group) => (
            <SignalSection
              key={group.title}
              title={group.title}
              signals={group.signals}
              setIsSideDrawerOpen={setIsSideDrawerOpen}
              setSelectedSignalId={setSelectedSignalId}
              showSeparator={false}
            />
          ))}
        </div>
      );
    }

    return (
      <SignalSection
        title=""
        signals={issueSignals}
        setIsSideDrawerOpen={setIsSideDrawerOpen}
        setSelectedSignalId={setSelectedSignalId}
        showSeparator={false}
      />
    );
  };

  return (
    <div
      className={`flex flex-col gap-4 pt-4 max-h-[calc(100vh-292px)] ${
        isMyTeamPage ? 'min-h-[calc(100vh-600px)]' : 'min-h-[calc(100vh-242px)]'
      } `}
    >
      {/* ── Toolbar ──────────────────────────────────────────────── */}
      {filterHook && (
        <div className="h-fit">
          <div className="max-w-[1200px] mx-auto flex items-center justify-between gap-4">
            <span className="w-[255px] h-8">
              <SearchBox
                needBorder={true}
                searchText={filterHook.applied.searchText}
                dataType="Search"
                setSearchText={filterHook.setSearchText}
              />
            </span>

            <div className="flex items-center justify-end gap-3">
              <SingleSelectDropDown
                filteredArr={filterHook.applied.sortBy}
                dataFieldToUseForSelection="label"
                uniqueIdFieldToUseForSelection="value"
                handleSelection={handleSortBySelection}
                typeOfData="Sort by"
                needOfSortOrder={true}
                contentCss="!min-w-[170px] rounded-[12px] z-[99] top-[-7px]"
                disabled={false}
              />
              <SingleSelectDropDown
                filteredArr={groupByOptions}
                dataFieldToUseForSelection="label"
                uniqueIdFieldToUseForSelection="value"
                handleSelection={handleGroupBySelection}
                typeOfData="Group by"
                needOfSortOrder={false}
                contentCss="!min-w-[170px] rounded-[12px] z-[99] top-[-7px]"
                disabled={false}
              />

              <OutlineButton onClick={() => setIsFilterSidebarOpen(true)}>
                {filterHook.isAtDefaultState ? 'Filters' : 'Filters applied'}
              </OutlineButton>
              <Tippy
                key="filter-reset-tooltip"
                content={<div className="text-[12px]">Reset filters</div>}
                className="!rounded-[6px]"
                theme="dark !rounded-[6px] !no-shadow"
                placement="top"
                maxWidth={600}
                arrow={true}
                offset={[0, 6]}
                // plugins={[followCursor]}
                followCursor={true}
                interactive={false}
                animation="scale"
                duration={0}
              >
                <IconButton
                  icon={
                    <ReactivateSvgIcon
                      className="w-4 h-4"
                      stroke={
                        filterHook.isAtDefaultState ? '#97A1AF' : '#202B37'
                      }
                    />
                  }
                  onClick={() => filterHook.resetAllFilters()}
                  disabled={filterHook.isAtDefaultState}
                  className={
                    filterHook.isAtDefaultState
                      ? 'opacity-70 cursor-not-allowed'
                      : 'hover:bg-gray-50'
                  }
                />
              </Tippy>
            </div>
          </div>
        </div>
      )}

      {/* ── Scrollable content ───────────────────────────────────── */}
      <div className="flex-1 w-full h-full flex flex-col gap-0 overflow-y-auto scroll mx-auto">
        <div className="max-w-[1200px] w-full mx-auto">{renderContent()}</div>
      </div>

      <SignalDetails
        isOpen={isSideDrawerOpen}
        onClose={() => {
          setIsSideDrawerOpen(false);
          setSelectedSignalId('');
        }}
        signalId={selectedSignalId}
        handleDelete={deleteToggle}
        userInfo={userinfo || userinfo01?.data}
        fromPage={isMyTeamPage ? 'my-team' : 'customer-360'}
      />
      <DeleteModal
        show={deleteModal}
        onHide={deleteToggle}
        onDelete={handleDelete}
        title={'signal'}
      />

      {/* ── Filter sidebar ───────────────────────────────────────── */}
      {filterHook && (
        <FilterSidebar
          isOpen={isFilterSidebarOpen}
          onClose={() => setIsFilterSidebarOpen(false)}
          context="open_issues"
          appliedSidebar={filterHook.appliedSidebar}
          defaultSidebar={filterHook.getDefaultSidebar()}
          onApply={filterHook.applySidebarFilters}
        />
      )}
    </div>
  );
}
