import { StylesConfig } from 'react-select';
export const customerTypescustomStyles: StylesConfig<any, false> = {
  control: (provided, state) => ({
    ...provided,
    width: '268px',
    height: '40px', // h-10
    paddingLeft: '12px', // px-3
    paddingRight: '12px',
    paddingTop: '8px', // py-2
    paddingBottom: '8px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 400,
    lineHeight: '24px',
    color: '#141C24',
    backgroundColor: '#FFFFFF',
    border: `1px solid ${state.isFocused ? '#4C94FF' : '#CED2DA'}`,
    boxShadow: state.isFocused ? '0 0 0 2px #99C2FF' : 'none',
    outline: 'none',
    transition: 'all 0.2s ease',
    // Pseudo-class for hover
    '&:hover': {
      borderColor: '#4C94FF',
      boxShadow: '0 0 0 2px #99C2FF',
    },
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? '#F0F0F0'
      : state.isFocused
      ? '#F0F0F0'
      : 'transparent',
    color: state.isSelected ? '#000000' : '#000000',
    '&:hover': {
      backgroundColor: '#F0F0F0',
      color: '#000000',
    },
    // padding: '4px 8px', // You can adjust padding for the options here
  }),
  placeholder: (provided) => ({
    ...provided,
    color: '#A0AEC0',
    marginLeft: '0',
    padding: '0', // Remove padding from the placeholder
  }),
  singleValue: (provided) => ({
    ...provided,
    color: '#141C24',
    fontWeight: 400,
    fontSize: '16px',
    lineHeight: '20px',
    textAlign: 'left',
    width: '100%',
    padding: '0', // Remove padding from the single value
    marginRight: '4px',
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: '#FFFFFF',
    color: '#000000',
    padding: '0', // Remove padding from the menu
  }),
  menuList: (provided) => ({
    ...provided,
    backgroundColor: '#FFFFFF',
    color: '#344051',
    fontWeight: 400,
    fontSize: '16px',
    lineHeight: '20px',
    textAlign: 'left',
    maxHeight: '132px', // Set the max height for the options list
    overflowY: 'auto', // Enable vertical scrolling
    overflowX: 'auto', // Enable horizontal scrolling
    padding: '0', // Remove padding from the list

    // Custom scrollbar styles directly in the StylesConfig
    '&::-webkit-scrollbar': {
      width: '4px',
      height: '4px',
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: 'lightgray',
      visibility: 'hidden',
    },
    '&:hover::-webkit-scrollbar-thumb, &:focus::-webkit-scrollbar-thumb, &:active::-webkit-scrollbar-thumb':
      {
        visibility: 'visible',
      },
  }),
  input: (provided) => ({
    ...provided,
    color: '#000000',
    padding: '0', // Remove padding from the input field
    margin: '0',
    lineHeight: '20px',
  }),
  indicatorSeparator: (base) => ({
    ...base,
    display: 'none',
  }),
  clearIndicator: (base) => ({
    ...base,
    display: 'none',
  }),
  dropdownIndicator: (base) => ({
    ...base,
    padding: '0',
    margin: '0',
  }),
  valueContainer: (provided) => ({
    ...provided,
    padding: '0',
    margin: '0',
  }),
};

export const associatedCustomerscustomStyles: StylesConfig<any, true> = {
  control: (provided, state) => ({
    ...provided,
    width: '580px',
    paddingLeft: '12px', // px-3
    paddingRight: '12px',
    paddingTop: '8px', // py-2
    paddingBottom: '8px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 400,
    lineHeight: '24px',
    color: '#141C24',
    backgroundColor: '#FFFFFF',
    border: `1px solid ${state.isFocused ? '#4C94FF' : '#CED2DA'}`,
    boxShadow: state.isFocused ? '0 0 0 2px #99C2FF' : 'none',
    outline: 'none',
    transition: 'all 0.2s ease',
    // Pseudo-class for hover
    '&:hover': {
      borderColor: '#4C94FF',
      boxShadow: '0 0 0 2px #99C2FF',
    },
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? '#F0F0F0'
      : state.isFocused
      ? '#F0F0F0'
      : 'transparent',
    color: state.isSelected ? '#000000' : '#000000',
    '&:hover': {
      backgroundColor: '#F0F0F0',
      color: '#000000',
    },
    // padding: '4px 8px', // You can adjust padding for the options here
  }),
  placeholder: (provided) => ({
    ...provided,
    color: '#A0AEC0',
    marginLeft: '0',
    padding: '0', // Remove padding from the placeholder
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: '#FFFFFF',
    color: '#000000',
    padding: '0', // Remove padding from the menu
  }),
  multiValue: (provided) => ({
    ...provided,
    backgroundColor: '#F2F4F7', // light blue background for chips
    borderRadius: '6px',
    padding: '2px 4px',
    marginRight: '6px',
    marginTop: '0px',
    display: 'flex',
  }),

  multiValueLabel: (provided) => ({
    ...provided,
    color: '#344051', // dark label
    fontWeight: '500',
    fontSize: '14px',
    lineHeight: '20px',
    height: '20px',
    padding: '0 6px',
    alignItems: 'center',
    textAlign: 'center',
    display: 'flex',
  }),

  multiValueRemove: (provided) => ({
    ...provided,
    cursor: 'pointer',
    color: '#637083',
    ':hover': {
      backgroundColor: '#CBD2DC', 
      color: '#637083', 
    },
  }),

  menuList: (provided) => ({
    ...provided,
    backgroundColor: '#FFFFFF',
    color: '#344051',
    fontWeight: 400,
    fontSize: '16px',
    lineHeight: '20px',
    textAlign: 'left',
    maxHeight: '132px', // Set the max height for the options list
    overflowY: 'auto', // Enable vertical scrolling
    overflowX: 'auto', // Enable horizontal scrolling
    padding: '0', // Remove padding from the list

    // Custom scrollbar styles directly in the StylesConfig
    '&::-webkit-scrollbar': {
      width: '4px',
      height: '4px',
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: 'lightgray',
      visibility: 'hidden',
    },
    '&:hover::-webkit-scrollbar-thumb, &:focus::-webkit-scrollbar-thumb, &:active::-webkit-scrollbar-thumb':
      {
        visibility: 'visible',
      },
  }),
  input: (provided) => ({
    ...provided,
    color: '#000000',
    padding: '0', // Remove padding from the input field
    margin: '0',
    lineHeight: '20px',
  }),
  indicatorSeparator: (base) => ({
    ...base,
    display: 'none',
  }),
  clearIndicator: (base) => ({
    ...base,
    display: 'none',
  }),
  dropdownIndicator: (base) => ({
    ...base,
    padding: '0',
    margin: '0',
  }),
  valueContainer: (provided) => ({
    ...provided,
    padding: '0',
    margin: '0',
  }),
};