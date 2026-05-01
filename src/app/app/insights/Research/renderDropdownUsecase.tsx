import { Dropdown } from '../../../../common/Dropdown';
import { ChevronDown } from 'lucide-react';

export const RenderDropdownUseCase = ({
  useCaseDetails = [],
  selectedOpportunityUseCase,
  setSelectedOpportunityUseCase,
  isResearchRunning,
}: any) => {
  const handleItemClick = (item: any) => {
    setSelectedOpportunityUseCase(item);
  };
  return (
    <Dropdown className="inline-flex border border-gray-300 rounded-lg w-full">
      <Dropdown.Trigger
        type="button"
        className="text-left bg-white text-gray-900 border-gray-300 rounded-lg w-full"
        id="dropdownMenuButton"
        data-bs-toggle="dropdown"
        disabled={isResearchRunning}
      >
        <div className="flex justify-between items-center text-[16px] font-normal px-[12px] py-[8px] text-[#141C24]">
          <span className="truncate flex-1">
            {selectedOpportunityUseCase
              ? selectedOpportunityUseCase.name ||
                'Select a usecase to run research'
              : 'Select a usecase to run research'}
          </span>
          <ChevronDown className="text-[#637083]" size={20} />
        </div>
      </Dropdown.Trigger>

      <Dropdown.Content
        placement="bottom-start"
        className="absolute border border-gray-300 z-50 px-2 py-1 ltr:text-left rtl:text-right bg-white rounded-md max-h-[296px] overflow-scroll scroll w-full dropdown-menu"
        data-bs-toggle="dropdown"
        aria-labelledby="dropdownMenuButton"
      >
        <ul
          className="text-sm text-gray-700 dark:text-gray-200 "
          role="listbox"
        >
          {Array.isArray(useCaseDetails) && useCaseDetails?.length === 0 ? (
            <li className="py-2 px-2 text-gray-500 text-[16px] close-dropdown">
              No use cases found
            </li>
          ) : (
            useCaseDetails.map((item: any, index: number) => (
              <li
                role="option"
                key={index + 'usecase'}
                className={`py-2 px-2 cursor-pointer text-[#202B37] text-[16px] close-dropdown`}
                onClick={() => handleItemClick(item)}
              >
                {item?.name}
              </li>
            ))
          )}
        </ul>
      </Dropdown.Content>
    </Dropdown>
  );
};
