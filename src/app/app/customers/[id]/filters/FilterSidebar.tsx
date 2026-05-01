'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import SideDrawer from '../../../../../common/components/SideDrawer';
import { LevelSelector } from '../../../../../common/components/LevelSelector';
import MultiSelectDropDown from '../../../../../common/components/MultiSelectDropDown';
import DateRangeFilter from '../../../insights/opportunities/components/DateRangeFilter';
import { SidebarFilterState, FilterContext } from './filterTypes';

// ─── Props ──────────────────────────────────────────────────────────

interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  /** Determines which sections to show (e.g. Event Types only for journey) */
  context: FilterContext;
  /** The currently-applied sidebar filter state */
  appliedSidebar: SidebarFilterState;
  /** The default sidebar state (used by the Reset button) */
  defaultSidebar: SidebarFilterState;
  /** Called when the user clicks "Apply filter" */
  onApply: (state: SidebarFilterState) => void;
}

// ─── Component ──────────────────────────────────────────────────────

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  isOpen,
  onClose,
  context,
  appliedSidebar,
  defaultSidebar,
  onApply,
}) => {
  // ── Pending (local) state – edits live here until Apply ───────
  const [pending, setPending] = useState<SidebarFilterState>(() =>
    JSON.parse(JSON.stringify(appliedSidebar)),
  );

  // ── Search state for Users and Stakeholders ───────────────────
  const [usersSearchText, setUsersSearchText] = useState('');
  const [stakeholdersSearchText, setStakeholdersSearchText] = useState('');
  const [offeringsSearchText, setOfferingsSearchText] = useState('');

  // Re-sync whenever the drawer opens
  useEffect(() => {
    if (isOpen) {
      setPending(JSON.parse(JSON.stringify(appliedSidebar)));
      setUsersSearchText('');
      setStakeholdersSearchText('');
      setOfferingsSearchText('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // ── Filtered lists for search ─────────────────────────────────

  const filteredUsers = useMemo(() => {
    if (!usersSearchText.trim()) return pending.users;
    const q = usersSearchText.toLowerCase();
    return pending.users.filter(
      (u) =>
        `${u.first_name} ${u.last_name}`.toLowerCase().includes(q),
    );
  }, [pending.users, usersSearchText]);

  const filteredStakeholders = useMemo(() => {
    if (!stakeholdersSearchText.trim()) return pending.stakeholders;
    const q = stakeholdersSearchText.toLowerCase();
    return pending.stakeholders.filter((s) =>
      s.name.toLowerCase().includes(q),
    );
  }, [pending.stakeholders, stakeholdersSearchText]);

  const filteredOfferings = useMemo(() => {
    if (!offeringsSearchText.trim()) return pending.offerings;
    const q = offeringsSearchText.toLowerCase();
    return pending.offerings.filter((offering) =>
      offering.offering_name.toLowerCase().includes(q),
    );
  }, [pending.offerings, offeringsSearchText]);

  // ── Field updaters ────────────────────────────────────────────

  const setStatuses = useCallback((updater: any) => {
    setPending((prev) => ({
      ...prev,
      statuses: typeof updater === 'function' ? updater(prev.statuses) : updater,
    }));
  }, []);

  const setEventTypes = useCallback((updater: any) => {
    setPending((prev) => ({
      ...prev,
      eventTypes: typeof updater === 'function' ? updater(prev.eventTypes) : updater,
    }));
  }, []);

  const setSignalTypes = useCallback((updater: any) => {
    setPending((prev) => ({
      ...prev,
      signalTypes: typeof updater === 'function' ? updater(prev.signalTypes) : updater,
    }));
  }, []);

  const setOfferings = useCallback((updater: any) => {
    setPending((prev) => ({
      ...prev,
      offerings: typeof updater === 'function' ? updater(prev.offerings) : updater,
    }));
  }, []);

  const setUsers = useCallback((updater: any) => {
    setPending((prev) => ({
      ...prev,
      users: typeof updater === 'function' ? updater(prev.users) : updater,
    }));
  }, []);

  const setStakeholders = useCallback((updater: any) => {
    setPending((prev) => ({
      ...prev,
      stakeholders: typeof updater === 'function' ? updater(prev.stakeholders) : updater,
    }));
  }, []);

  const setIntensityLevels = useCallback((levels: number[]) => {
    setPending((prev) => ({ ...prev, intensityLevels: levels }));
  }, []);

  const setCreatedStartDate = useCallback((date: Date | null) => {
    setPending((prev) => ({ ...prev, createdStartDate: date?.toISOString() ?? null }));
  }, []);

  const setCreatedEndDate = useCallback((date: Date | null) => {
    setPending((prev) => ({ ...prev, createdEndDate: date?.toISOString() ?? null }));
  }, []);

  const setUpdatedStartDate = useCallback((date: Date | null) => {
    setPending((prev) => ({ ...prev, updatedStartDate: date?.toISOString() ?? null }));
  }, []);

  const setUpdatedEndDate = useCallback((date: Date | null) => {
    setPending((prev) => ({ ...prev, updatedEndDate: date?.toISOString() ?? null }));
  }, []);

  // ── Derived booleans ──────────────────────────────────────────

  const isAtDefaultState = useMemo(
    () => JSON.stringify(pending) === JSON.stringify(defaultSidebar),
    [pending, defaultSidebar],
  );

  const isChangedFromApplied = useMemo(
    () => JSON.stringify(pending) !== JSON.stringify(appliedSidebar),
    [pending, appliedSidebar],
  );

  // ── Action handlers ───────────────────────────────────────────

  const handleApply = useCallback(() => {
    onApply(pending);
    onClose();
  }, [pending, onApply, onClose]);

  const handleReset = useCallback(() => {
    setPending(JSON.parse(JSON.stringify(defaultSidebar)));
  }, [defaultSidebar]);

  // ── Date objects for pickers (convert ISO → Date) ─────────────
  const createdStart = pending.createdStartDate ? new Date(pending.createdStartDate) : null;
  const createdEnd = pending.createdEndDate ? new Date(pending.createdEndDate) : null;
  const updatedStart = pending.updatedStartDate ? new Date(pending.updatedStartDate) : null;
  const updatedEnd = pending.updatedEndDate ? new Date(pending.updatedEndDate) : null;

  // ─── Render ───────────────────────────────────────────────────

  return (
    <SideDrawer isOpen={isOpen} onClose={onClose} title="Filters" width="w-[520px]">
      <div className="flex flex-col h-[calc(100vh-56px)]">
        {/* ── Scrollable filter sections ─────────────────────────── */}
        <div className="pl-5 pr-7 pt-6 space-y-[30px] flex-1 overflow-y-auto overflow-x-hidden scroll">
          {/* Status */}
          <MultiSelectDropDown
            filteredItems={pending.statuses}
            dataFieldToUseForSelection="label"
            uniqueIdFieldToUseForSelection="value"
            checkboxItems={pending.statuses}
            setCheckboxItems={setStatuses}
            typeOfData="Status"
            wantToShowSearchBox={false}
            wantToShowSelectedItems={false}
            triggerTextCss="h-[32px] text-nowrap border-none"
            dropDownContentCss="w-full border-none shadow-none"
            dropDownContentTitleCss="text-[16px] leading-6 font-medium text-[#202B37]"
            alwaysOpen={true}
            hideTrigger={true}
          />
          <div className="border-b border-[#E4E7EC]" />

          {context === 'open_issues' && pending.offerings.length > 0 && (
            <>
              <MultiSelectDropDown
                filteredItems={filteredOfferings}
                dataFieldToUseForSelection="offering_name"
                uniqueIdFieldToUseForSelection="_id"
                checkboxItems={pending.offerings}
                setCheckboxItems={setOfferings}
                typeOfData="Offering"
                wantToShowSearchBox={true}
                searchText={offeringsSearchText}
                setSearchText={setOfferingsSearchText}
                wantToShowSelectedItems={false}
                triggerTextCss="h-[32px] text-nowrap border-none"
                dropDownContentCss="w-full border-none shadow-none"
                dropDownContentTitleCss="text-[16px] leading-6 font-medium text-[#202B37]"
                alwaysOpen={true}
                hideTrigger={true}
              />
              <div className="border-b border-[#E4E7EC]" />
            </>
          )}

          {/* Created date range */}
          <DateRangeFilter
            title="Created date"
            startDate={createdStart}
            setStartDate={setCreatedStartDate}
            endDate={createdEnd}
            setEndDate={setCreatedEndDate}
          />
          <div className="border-b border-[#E4E7EC]" />

          {/* Updated date range */}
          <DateRangeFilter
            title="Updated date"
            startDate={updatedStart}
            setStartDate={setUpdatedStartDate}
            endDate={updatedEnd}
            setEndDate={setUpdatedEndDate}
          />
          <div className="border-b border-[#E4E7EC]" />

          {/* Intensity */}
          <div className='text-[#202B37] font-medium text-[16px] leading-6 flex items-center justify-between mb-2'>
            <span>Intensity</span>
            <LevelSelector
              totalLevels={5}
              selectedLevels={pending.intensityLevels}
              onSelectionChange={setIntensityLevels}
              size="md"
              minSelection={1}
              label=""
            />
          </div>
          <div className="border-b border-[#E4E7EC]" />

          {/* Event Types (journey only) */}
          {context === 'journey' && pending.eventTypes.length > 0 && (
            <>
              <MultiSelectDropDown
                filteredItems={pending.eventTypes}
                dataFieldToUseForSelection="label"
                uniqueIdFieldToUseForSelection="value"
                checkboxItems={pending.eventTypes}
                setCheckboxItems={setEventTypes}
                typeOfData="Events"
                wantToShowSearchBox={false}
                wantToShowSelectedItems={false}
                triggerTextCss="h-[32px] text-nowrap border-none"
                dropDownContentCss="w-full border-none shadow-none"
                dropDownContentTitleCss="text-[16px] leading-6 font-medium text-[#202B37]"
                alwaysOpen={true}
                hideTrigger={true}
              />
              <div className="border-b border-[#E4E7EC]" />
            </>
          )}

          {/* Signal Types */}
          <MultiSelectDropDown
            filteredItems={pending.signalTypes}
            dataFieldToUseForSelection="label"
            uniqueIdFieldToUseForSelection="value"
            checkboxItems={pending.signalTypes}
            setCheckboxItems={setSignalTypes}
            typeOfData="Signals"
            wantToShowSearchBox={false}
            wantToShowSelectedItems={false}
            triggerTextCss="h-[32px] text-nowrap border-none"
            dropDownContentCss="w-full border-none shadow-none"
            dropDownContentTitleCss="text-[16px] leading-6 font-medium text-[#202B37]"
            alwaysOpen={true}
            hideTrigger={true}
          />
          <div className="border-b border-[#E4E7EC]" />

          {/* Users */}
          {pending.users.length > 0 && (
            <>
              <MultiSelectDropDown
                filteredItems={filteredUsers}
                dataFieldToUseForSelection="first_name"
                extraDataFieldToUseForSelection="last_name"
                uniqueIdFieldToUseForSelection="_id"
                checkboxItems={pending.users}
                setCheckboxItems={setUsers}
                typeOfData="Users"
                wantToShowSearchBox={true}
                searchText={usersSearchText}
                setSearchText={setUsersSearchText}
                wantToShowSelectedItems={false}
                triggerTextCss="h-[32px] text-nowrap border-none"
                dropDownContentCss="w-full border-none shadow-none"
                dropDownContentTitleCss="text-[16px] leading-6 font-medium text-[#202B37]"
                alwaysOpen={true}
                hideTrigger={true}
              />
              <div className="border-b border-[#E4E7EC]" />
            </>
          )}

          {/* Stakeholders */}
          {pending.stakeholders.length > 0 && (
            <>
              <MultiSelectDropDown
                filteredItems={filteredStakeholders}
                dataFieldToUseForSelection="name"
                uniqueIdFieldToUseForSelection="_id"
                checkboxItems={pending.stakeholders}
                setCheckboxItems={setStakeholders}
                typeOfData="Stakeholders"
                wantToShowSearchBox={true}
                searchText={stakeholdersSearchText}
                setSearchText={setStakeholdersSearchText}
                wantToShowSelectedItems={false}
                triggerTextCss="h-[32px] text-nowrap border-none"
                dropDownContentCss="w-full border-none shadow-none"
                dropDownContentTitleCss="text-[16px] leading-6 font-medium text-[#202B37]"
                alwaysOpen={true}
                hideTrigger={true}
              />
            </>
          )}

          {/* Bottom spacer so last section isn't hidden behind buttons */}
          <div className="h-4" />
        </div>

        {/* ── Sticky action bar ──────────────────────────────────── */}
        <div className="h-18 w-full py-4 px-4 border-t border-gray-200 flex justify-end gap-2 bg-white rounded-b-[12px]">
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
            disabled={!isChangedFromApplied}
            className={`${isChangedFromApplied
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'bg-[#CCE0FF] cursor-not-allowed'
              } w-fit text-white font-medium py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-0`}
          >
            Apply
          </button>
        </div>
      </div>
    </SideDrawer>
  );
};

export default FilterSidebar;
