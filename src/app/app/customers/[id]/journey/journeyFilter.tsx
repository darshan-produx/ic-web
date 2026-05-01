import React from 'react';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/light.css';
import { ReactivateSvgIcon } from '../../../../../app/assests/icons/icons';
import SearchBox from '../../../../../common/components/SearchBox';
import SingleSelectDropDown from '../../../../../common/components/SingleSelectDropDown';
import IconButton from '../../../../../common/components/IconButton';
import OutlineButton from '../../../../../common/components/OutlineButton';
import { SortByItem } from '../filters/filterTypes';

interface JourneyFilterProps {
  searchText: string;
  setSearchText: (text: string) => void;
  selectedSortBy: SortByItem[];
  setSelectedSortBy: (items: SortByItem[] | ((prev: SortByItem[]) => SortByItem[])) => void;
  createEventType: any;
  setCreateEventType: (type: any) => void;
  createEventTypeOptions: { label: string; value: string }[];
  onResetFilters: () => void;
  isFiltersInDefaultState: boolean;
  onOpenFilterSidebar: () => void;
}

export const JourneyFilter: React.FC<JourneyFilterProps> = ({
  searchText,
  setSearchText,
  selectedSortBy,
  setSelectedSortBy,
  createEventType,
  setCreateEventType,
  createEventTypeOptions,
  onResetFilters,
  isFiltersInDefaultState = true,
  onOpenFilterSidebar,
}) => {
  const handleSortBySelection = (item: any) => {
    setSelectedSortBy((prev: SortByItem[]) =>
      prev.map((unit) =>
        unit.id === item.id
          ? { ...unit, selected: true, sortOrder: unit.sortOrder === 'asc' ? 'desc' : 'asc' as const }
          : { ...unit, selected: false },
      ),
    );
  };

  return (
    <div className="fixed h-fit w-full py-5 flex items-center justify-center box-border border-b border-[#E4E7EC] bg-white z-10">
      <div className="w-[679px] h-fit flex items-center justify-between gap-[60px]">
        {/* Left: create-event + search */}
        <div className="flex items-center justify-between gap-7">
          <span className="pl-0 w-8 h-8 relative">
            <span className="absolute">
              <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect x="0.5" y="0.5" width="31" height="31" rx="15.5" stroke="#1A75FF" />
                <path
                  d="M11.2012 15.9992L16.0012 15.9992M16.0012 15.9992L20.8012 15.9992M16.0012 15.9992V11.1992M16.0012 15.9992L16.0012 20.7992"
                  stroke="#1A75FF"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <SingleSelectDropDown
              filteredArr={createEventTypeOptions}
              dataFieldToUseForSelection="label"
              wantToShowSearchBox={false}
              triggerTextCss="opacity-0 absolute inset-0 w-8 h-8 "
              contentCss="!min-w-[100px] rounded-[12px] z-[99] top-[-7px]"
              handleSelection={(value) => setCreateEventType(value)}
            />
          </span>

          <span className="w-[260px] h-8">
            <SearchBox
              needBorder={true}
              searchText={searchText}
              dataType="Search"
              setSearchText={setSearchText}
            />
          </span>
        </div>

        {/* Right: sort + filter + reset */}
        <div className="h-8 flex items-center justify-between gap-3">
          <SingleSelectDropDown
            filteredArr={selectedSortBy}
            dataFieldToUseForSelection="label"
            uniqueIdFieldToUseForSelection="value"
            handleSelection={handleSortBySelection}
            typeOfData="Sort by"
            needOfSortOrder={true}
            contentCss="!min-w-[170px] rounded-[12px] z-[99] top-[-7px]"
            disabled={false}
          />

          <OutlineButton onClick={onOpenFilterSidebar} >
            {isFiltersInDefaultState ? 'Filters' : 'Filters applied'}
          </OutlineButton>

          <Tippy
            key="filter-reset-tooltip"
            content={
              <div className="text-[12px]">
                Reset filters
              </div>
            }
            className="!rounded-[6px]"
            theme="dark !rounded-[6px] !no-shadow"
            placement="top"
            maxWidth={600}
            arrow={true}
            offset={[0, 6]}
            followCursor={true}
            interactive={false}
            animation="scale"
            duration={0}
          >
            <IconButton
              icon={
                <ReactivateSvgIcon
                  className="w-4 h-4"
                  stroke={isFiltersInDefaultState ? '#97A1AF' : '#202B37'}
                />
              }
              onClick={() => onResetFilters()}
              disabled={isFiltersInDefaultState}
              className={isFiltersInDefaultState ? 'opacity-70 cursor-not-allowed' : 'hover:bg-gray-50'}
            />
          </Tippy>
        </div>
      </div>
    </div>
  );
};