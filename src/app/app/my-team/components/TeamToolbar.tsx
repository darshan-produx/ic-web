'use client';

import React from 'react';
import { Dropdown } from '../../../../common/Dropdown';
import { ChevronDown, Search } from 'lucide-react';
import { DurationOption } from '../types';
import { DURATION_OPTIONS } from '../constants';

type TeamToolbarProps = {
  duration: DurationOption;
  onDurationChange: (value: DurationOption) => void;
  userFirstName?: string;
  searchText?: string;
  onSearchChange?: (value: string) => void;
};

const TeamToolbar: React.FC<TeamToolbarProps> = ({
  duration,
  onDurationChange,
  userFirstName,
  searchText,
  onSearchChange,
}) => {
  return (
    <div className="mb-[24px] mt-[15px] flex flex-wrap items-center justify-between gap-3 pr-4">
      <div className="inline-flex h-9 items-center px-1 text-lg font-semibold text-[#202B37]">
        {(userFirstName || 'My') + "'s Portfolio"}
      </div>

      <div className="ml-auto flex items-center gap-2">
        <div className="relative flex items-center">
          <Search className="absolute left-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search..."
            value={searchText || ''}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="h-9 w-[300px] rounded-[6px] border border-slate-300 bg-white pl-8 pr-3 text-[12px] text-slate-700 shadow-sm placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
            style={{ fontFamily: 'Inter' }}
          />
        </div>

        <Dropdown className="inline-flex z-[100]">
          <Dropdown.Trigger
            type="button"
            className="bg-white btn w-[140px] !py-1.5 rounded-[6px] border border-slate-300 shadow-sm hover:border-slate-400"
            id="newTeamDurationDropdown"
          >
            <div className="flex items-center justify-between w-full text-[12px] leading-4 font-medium text-slate-700" style={{ fontFamily: 'Inter' }}>
              <p>
                {DURATION_OPTIONS.find((option) => option.value === duration)?.label || 'TTM'}
              </p>
              <span className="flex items-center">
                <ChevronDown className="relative left-[4px] text-slate-600" />
              </span>
            </div>
          </Dropdown.Trigger>

          <Dropdown.Content
            placement="bottom-end"
            className="absolute z-[100] mt-8 p-1.5 ltr:text-left rtl:text-right !w-[170px] bg-white border border-slate-300 rounded-md shadow-md dropdown-menu top-[-4px]"
            aria-labelledby="newTeamDurationDropdown"
          >
            <ul className="text-slate-700 dropdownClick" aria-labelledby="newTeamDurationDropdown">
              {DURATION_OPTIONS.map((option) => (
                <li key={option.value}>
                  <button
                    type="button"
                    className={`close-dropdown w-full rounded px-2 py-1.5 text-left text-[12px] leading-4 font-medium transition-colors ${option.value === duration ? 'text-[#2563EB]' : 'hover:text-[#2563EB]'}`}
                    style={{ fontFamily: 'Inter' }}
                    onClick={() => onDurationChange(option.value)}
                  >
                    {option.label}
                  </button>
                </li>
              ))}
            </ul>
          </Dropdown.Content>
        </Dropdown>
      </div>
    </div>
  );
};

export default TeamToolbar;
