import { Dropdown, DropDownContext } from '../../../../../common/Dropdown';
import { ChevronDown } from 'lucide-react';
import { useState, useMemo, useContext } from 'react';
import { SearchIconMyTeamSearchPage } from '../../../../assests/icons/icons';

export const RenderDropdown = ({
  customerData = [],
  opportunityData = [],
  selectedCustomer,
  setSelectedCustomer,
  selectedOpportunityType,
  setSelectedOpportunityType,
  useCaseDetails = [],
  selectedOpportunityUseCase,
  setSelectedOpportunityUseCase,
  onAddProspect,
}: any) => {
  const [searchText, setSearchText] = useState<string>('');

  // Determine dropdown type based on which setter is provided
  const dropdownType = useMemo(() => {
    if (setSelectedCustomer) return 'customer';
    if (setSelectedOpportunityType) return 'opportunity';
    if (setSelectedOpportunityUseCase) return 'usecase';
    return null;
  }, [
    setSelectedCustomer,
    setSelectedOpportunityType,
    setSelectedOpportunityUseCase,
  ]);

  // Memoized filtered and deduplicated data
  const filteredData = useMemo(() => {
    const searchLower = searchText.toLowerCase();

    switch (dropdownType) {
      case 'customer': {
        if (!customerData || customerData.length === 0) return [];

        // Remove duplicates based on customer_name and filter by search
        const uniqueCustomers = customerData.reduce(
          (acc: any[], current: any) => {
            const exists = acc.find(
              (item: any) => item.customer_name === current.customer_name
            );
            if (
              !exists &&
              current.customer_name?.toLowerCase().includes(searchLower)
            ) {
              acc.push(current);
            }
            return acc;
          },
          []
        );
        return uniqueCustomers;
      }

      case 'opportunity': {
        if (!opportunityData || opportunityData.length === 0) return [];

        // Filter opportunity items by search
        return opportunityData.filter((item: any) =>
          item.insight_name?.toLowerCase().includes(searchLower)
        );
      }

      case 'usecase': {
        if (!useCaseDetails || useCaseDetails.length === 0) return [];

        // Flatten usecase details from all opportunity items and filter
        // const allUseCases = opportunityData.flatMap((item: any) => item.usecase_details || []);

        // Remove duplicates based on name and filter by search
        const uniqueUseCases = useCaseDetails?.reduce(
          (acc: any[], current: any) => {
            const exists = acc.find((item: any) => item.name === current.name);
            if (!exists && current.name?.toLowerCase().includes(searchLower)) {
              acc.push(current);
            }
            return acc;
          },
          []
        );

        return uniqueUseCases;
      }

      default:
        return [];
    }
  }, [customerData, opportunityData, useCaseDetails, searchText, dropdownType]);

  const handleSelect = (item: any) => {
    // Clear search text after selection
    setSearchText('');

    switch (dropdownType) {
      case 'customer':
        setSelectedCustomer?.({
          name: item.customer_name,
          id: item.customer_id,
        });
        break;
      case 'opportunity':
        setSelectedOpportunityType?.({
          insight_id: item.insight_id || item.id,
          insight_name: item.insight_name,
          insight_type: item.insight_type || item.type,
          data_type: item.data_type || item.insight_data_type,
          pillar: item.pillar,
          usecase_details: item.usecase_details || [],
          name: item.insight_name, // for backward compatibility
        });
        break;
      case 'usecase':
        setSelectedOpportunityUseCase?.({
          name: item.name,
          id: item.usecase_id || item.id,
          title: item.title,
          description: item.description,
        });
        break;
    }
  };

  const getDisplayValue = () => {
    switch (dropdownType) {
      case 'customer':
        return selectedCustomer?.name || 'Select customer*';
      case 'opportunity':
        return (
          selectedOpportunityType?.insight_name ||
          selectedOpportunityType?.name ||
          'Select opportunity Type*'
        );
      case 'usecase':
        return selectedOpportunityUseCase?.name || 'Select Use Case';
      default:
        return 'Select option*';
    }
  };

  const getItemKey = (item: any, index: number) => {
    switch (dropdownType) {
      case 'customer':
        return item.customer_id || index;
      case 'opportunity':
        return item.insight_id || item.id || index;
      case 'usecase':
        return item.usecase_id || item.id || `${item.name}-${index}`;
      default:
        return index;
    }
  };

  const getItemDisplay = (item: any) => {
    switch (dropdownType) {
      case 'customer':
        return item.customer_name || '';
      case 'opportunity':
        return item.insight_name || '';
      case 'usecase':
        return item.name || '';
      default:
        return '';
    }
  };

  const isPlaceholder = () => {
    switch (dropdownType) {
      case 'customer':
        return !selectedCustomer?.name;
      case 'opportunity':
        return (
          !selectedOpportunityType?.insight_name &&
          !selectedOpportunityType?.name
        );
      case 'usecase':
        return !selectedOpportunityUseCase?.name;
      default:
        return true;
    }
  };

  // Don't render if no dropdown type is determined
  if (!dropdownType) {
    // console.warn('RenderDropdown: No valid setter provided');
    return null;
  }

  // Don't render usecase dropdown if no opportunity type is selected
  // if (dropdownType === 'usecase' && (!selectedOpportunityType?.insight_name && !selectedOpportunityType?.name)) {
  //   return null;
  // }

  return (
    <Dropdown className="inline-flex !w-full">
      <Dropdown.Trigger
        type="button"
        className="text-center bg-white text-gray-900 border-[#637083] rounded-[6px] w-[500px]"
      >
        <div className="flex justify-between items-center text-[12px] font-normal px-[16px] py-[12px] text-[#141C24]">
          <span
            className={`text-[14px] ${isPlaceholder() ? 'text-[#637083]' : 'text-[#202B37]'
              }`}
          >
            {getDisplayValue()}
          </span>
          <ChevronDown className="text-[#637083] left-[6px]" size={16} />
        </div>
      </Dropdown.Trigger>

      <Dropdown.Content
        placement="bottom-start"
        className="absolute border border-gray-300 z-50 px-2 py-1 ltr:text-left rtl:text-right bg-white rounded-md w-[499px] max-h-[296px] overflow-auto scroll"
      >
        <DropdownContentInner
          dropdownType={dropdownType}
          searchText={searchText}
          setSearchText={setSearchText}
          filteredData={filteredData}
          handleSelect={handleSelect}
          getItemKey={getItemKey}
          getItemDisplay={getItemDisplay}
          onAddProspect={onAddProspect}
        />
      </Dropdown.Content>
    </Dropdown>
  );
};

const DropdownContentInner = ({
  dropdownType,
  searchText,
  setSearchText,
  filteredData,
  handleSelect,
  getItemKey,
  getItemDisplay,
  onAddProspect,
}: any) => {
  const dropdownContext = useContext(DropDownContext);

  const handleItemClick = (item: any) => {
    handleSelect(item);
    dropdownContext?.setOpen(false); // ✅ Close the dropdown after selection
  };

  const handleAddProspect = () => {
    onAddProspect?.();
    dropdownContext?.setOpen(false);
  };

  return (
    <>
      {dropdownType === 'customer' && (
        <div className="flex justify-start items-center bg-gray-100 mb-2 rounded-[6px]">
          <div className="pl-[14.5px] top-2.5 text-[#97A1AF]">
            <SearchIconMyTeamSearchPage className="text-[#97A1AF]" />
          </div>
          <input
            type="text"
            placeholder="Search customer"
            autoFocus
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full pl-[4px] pr-2 py-2 placeholder:text-[#97A1AF] rounded-[6px] text-[16px] bg-gray-100 outline-none"
            aria-label="Search options"
          />
        </div>
      )}

      {dropdownType === 'customer' && onAddProspect && (
        <div className="mb-2 pb-2 border-b border-gray-200">
          <button
            type="button"
            onClick={handleAddProspect}
            className="w-full text-left py-2 px-2 text-[#1A75FF] text-[14px] font-normal hover:bg-gray-50 rounded"
          >
            Add new prospect
          </button>
        </div>
      )}

      <ul className="text-sm text-gray-700 dark:text-gray-200 " role="listbox">
        {filteredData.length === 0 ? (
          <li className="py-2 px-2 text-gray-500 text-center">
            {dropdownType === 'customer' && searchText
              ? 'No customers found'
              : dropdownType === 'opportunity'
                ? 'No opportunities found'
                : dropdownType === 'usecase'
                  ? 'No use cases found'
                  : 'No options found'}
          </li>
        ) : (
          filteredData.map((item: any, index: number) => (
            <li key={getItemKey(item, index)} role="option">
              <div
                className="py-2 px-2 cursor-pointer text-[#202B37] text-[16px]"
                onClick={() => handleItemClick(item)}
                tabIndex={0}
                role="button"
                aria-label={`Select ${getItemDisplay(item)}`}
              >
                {getItemDisplay(item)}
              </div>
            </li>
          ))
        )}
      </ul>
    </>
  );
};
