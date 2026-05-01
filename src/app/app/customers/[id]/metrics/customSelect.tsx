import { SearchFilterIcon } from '../../../../../app/assests/icons/icons';
import { Dropdown } from '../../../../../common/components/dropdown-components';
import { ChevronDown, ChevronUp } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import Select, {
  components,
  OptionProps,
  PlaceholderProps,
  MultiValueRemoveProps,
  SingleValueProps,
  MultiValue,
} from 'react-select';

type customSelectProps = {
  handleTags: (tags: string[]) => void;
  tags: string[];
};

// Custom DropdownIndicator to position the icon on the left
const DropdownIndicator = (props: any) => {
  return (
    <components.DropdownIndicator {...props}>
      <div className="absolute left-3.5 top-2.5 bottom-2.5">
        <SearchFilterIcon />
      </div>
    </components.DropdownIndicator>
  );
};

// Custom Placeholder to ensure proper alignment
const CustomPlaceholder = (props: PlaceholderProps<any>) => {
  return (
    <components.Placeholder {...props}>
      <div className="flex items-center mr-2">{props.children}</div>
    </components.Placeholder>
  );
};

const customStyles = {
  control: (provided: any) => ({
    ...provided,
    minWidth: '10rem',
    width: '167px',
    height: '32px',
    borderColor: 'rgb(203 213 225)', // Slate-200
    '&:hover': {
      borderColor: 'rgb(107 114 128)', // Slate-500
    },
    boxShadow: 'none', // Remove the focus shadow
    display: 'flex',
    borderTopLeftRadius: '6px', // Top-left border radius
    borderTopRightRadius: '6px',
    borderBottomLeftRadius: '0px', // Bottom-left border radius
    borderBottomRightRadius: '0px',
    alignItems: 'center',
  }),
  input: (provided: any) => ({
    ...provided,
    marginLeft: '25px', // Add margin to create space between icon and text
  }),
  placeholder: (provided: any) => ({
    ...provided,
    color: '#97A1AF', // Slate-400 for placeholder
    display: 'flex',
    alignItems: 'center',
    fontWeight: '400',
    fontSize: '12px',
    lineHeight: '16px',
    marginLeft: '25px',
  }),
  menu: (provided: any) => ({
    ...provided,
    // zIndex: 9999,
    marginTop: 0,
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  }),
  menuList: (provided: any) => ({
    ...provided,
    borderLeft: '1px solid rgb(203 213 225)', // Left border
    borderRight: '1px solid rgb(203 213 225)', // Right border
    borderBottom: '1px solid rgb(203 213 225)',
    borderRadius: '0px 0px 8px 8px',
    // zIndex: 9999,
  }),
  option: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: state.isSelected ? 'white' : 'white', // Slate-200 or white
    color: state.isSelected ? '#202B37' : '#202B37', // Slate-800 for selected text
    '&:hover': {
      backgroundColor: '#E4E7EC', // Slate-300
    },
    display: 'flex',
    alignItems: 'center',
    padding: '8px 12px',
    fontWeight: '400',
    fontSize: '14px',
    lineHeight: '20px',
  }),
};

const CustomOption = (props: OptionProps<any>) => {
  return (
    <components.Option {...props} className="flex items-center scroll">
      <input
        type="checkbox"
        checked={props.isSelected}
        onChange={() => null}
        className={`mr-2 w-4 h-4 border-1 border-[#E2E8F0] ${
          props.isSelected
            ? 'bg-[#3B82F6] border-[#3B82F6]'
            : 'bg-[#E2E8F0] border-[#E2E8F0]'
        }`}
      />
      <label>{props.label}</label>
    </components.Option>
  );
};
const MultiValueRemove = (props: MultiValueRemoveProps<any>) => null;
const SingleValue = (props: SingleValueProps<any>) => null;

const CustomSelect: React.FC<customSelectProps> = ({ handleTags, tags }) => {
  const MultipleOptions = tags?.map((tag) => ({
    value: tag,
    label: tag,
  }));

  const [filterIsOpen, setFilterIsOpen] = useState(false);

  const [selectedOptions, setSelectedOptions] = React.useState<
    { value: string; label: string }[]
  >([]);

  const handleFilterSelectChange = (
    selectedOptions: MultiValue<{ value: string; label: string }>
  ) => {
    setSelectedOptions([...selectedOptions]);
    // handleTags(selectedOptions?.map((option) => option.value));
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      handleTags(selectedOptions?.map((option) => option.value));
    }, 500);

    return () => {
      clearTimeout(debounceTimer);
    };
  }, [selectedOptions, handleTags]);

  useEffect(() => {
    const filterDivs = document.getElementsByClassName('closeFilter');

    Array.from(filterDivs).forEach((filterDiv) => {
      filterDiv.addEventListener('click', handleFilterClose);
    });

    return () => {
      Array.from(filterDivs).forEach((filterDiv) => {
        filterDiv.removeEventListener('click', handleFilterClose);
      });
    };
  }, []);

  const handleFilterClose = () => {
    setFilterIsOpen(false);
  };

  return (
    <Dropdown
      isOpen={filterIsOpen}
      onClose={() => setFilterIsOpen(false)}
      target={
        <button
          className="flex items-center justify-between w-[117px] h-[32px]  rounded-[4px] border border-[#E4E7EC] bg-[#FFFFFF] px-3 py-1.5 text-sm text-[#202B37]  focus:outline-none focus:ring-2 focus:ring-indigo-500"
          onClick={() => setFilterIsOpen((prev) => !prev)}
        >
          <div className="w-[93px] flex  items-center flex-1">
            <span className="w-[34px] h-5 text-[14px] font-medium !text-[#202B37]">
              Filter
            </span>
            {selectedOptions?.length > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center rounded-full bg-[#F2F4F7] text-[#202B37] px-1.5 py-0.5 text-xs font-medium">
                {selectedOptions.length}
              </span>
            )}
          </div>
          <div className="flex-shrink-0">
            {filterIsOpen ? (
              <ChevronUp className="h-5 w-5 pt-0.5 text-[#202B37]" />
            ) : (
              <ChevronDown className="h-5 w-5 pt-0.5  text-[#202B37]" />
            )}
          </div>
        </button>
      }
    >
      <Select
        autoFocus
        isMulti
        closeMenuOnSelect={false}
        backspaceRemovesValue={false}
        controlShouldRenderValue={false}
        hideSelectedOptions={false}
        isClearable={false}
        menuIsOpen
        onChange={handleFilterSelectChange}
        options={MultipleOptions}
        placeholder="Search filter"
        styles={customStyles}
        tabSelectsValue={false}
        value={selectedOptions}
        className="-mt-1 barScroll"
        components={{
          DropdownIndicator,
          IndicatorSeparator: null,
          Option: CustomOption,
          Placeholder: CustomPlaceholder,
          MultiValueRemove,
          SingleValue,
        }}
      />
    </Dropdown>
  );
};

export default CustomSelect;
