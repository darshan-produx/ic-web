import React, { useState, useEffect } from 'react';
import Select, { StylesConfig } from 'react-select';
import { useRouter, useParams } from 'next/navigation';

// Define the customer option type
interface CustomerOption {
  label: string;
  value: string;
}

interface Customer {
  customer_name: string;
  customer_id: string;
}

interface CustomerSelectProps {
  allAssignedCustomers: {
    data: Customer[];
  };
}

const customStyles: StylesConfig<CustomerOption, false> = {
  control: (provided, state) => ({
    ...provided,
    width: '316px', // Set the width here
    height: '40px',
    border: state.isFocused ? '1px solid #E4E7EC' : '1px solid #E4E7EC',
    boxShadow: state.isFocused ? '0 0 0 1px #E4E7EC' : 'none',
    '&:hover': {
      borderColor: state.isFocused ? '#E4E7EC' : '#E4E7EC',
    },
    borderRadius: '6px',
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
  }),
  placeholder: (provided) => ({
    ...provided,
    color: '#6B7280',
    marginLeft: '0',
  }),
  singleValue: (provided) => ({
    ...provided,
    color: '#141C24',
    fontWeight: 600,
    fontSize: '16px',
    textAlign: 'left',
    marginLeft: '8px',
    marginRight: '8px',
    width: '100%',
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: '#FFFFFF',
    color: '#000000',
  }),
  input: (provided) => ({
    ...provided,
    color: '#000000',
  }),
  indicatorsContainer: (provided) => ({
    ...provided,
    color: '#202B37',
  }),
};
const filterOptions = (option: any, inputValue: any) => {
  return option?.label?.toLowerCase().includes(inputValue.toLowerCase());
};
const CustomerSelect: React.FC<any> = ({ allAssignedCustomers }) => {
  const router = useRouter();
  const [options, setOptions] = useState<CustomerOption[]>([]);
  const [defaultValue, setDefaultValue] = useState<any | null>(null);
  const [lastSelectedOption, setLastSelectedOption] = useState(null);
  const { id } = useParams();
  useEffect(() => {
    if (allAssignedCustomers?.data) {
      const formattedOptions = allAssignedCustomers.data.map(
        (customer: any) => ({
          label: customer.customer_name,
          value: customer.customer_id,
        })
      );
      setOptions(formattedOptions);
      const selectedOption = formattedOptions.find(
        (option: any) => option.value === Number(id)
      );
      setDefaultValue(selectedOption || null);
      setLastSelectedOption(selectedOption || null);
    }
  }, [allAssignedCustomers, id]);

  const handleChange = (selectedOption: CustomerOption | null) => {
    if (selectedOption === null) {
      setDefaultValue(null);
    }
    if (selectedOption && selectedOption.value === defaultValue?.value) {
      return null;
    }
    if (selectedOption) {
      router.push(`/app/customers/${selectedOption.value}`);
    }
  };
  const handleBlur = () => {
    if (defaultValue === null) {
      setDefaultValue(lastSelectedOption);
    }
  };

  return (
    <Select
      styles={customStyles}
      options={options}
      className="mt-[] !border-none "
      placeholder="Select a customer"
      onChange={handleChange}
      value={defaultValue}
      onBlur={handleBlur}
      // isClearable
      filterOption={filterOptions}
    />
  );
};

export default CustomerSelect;
