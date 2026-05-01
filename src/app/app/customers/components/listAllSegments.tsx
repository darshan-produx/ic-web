import React, { useState, useEffect } from 'react';
import Select, { StylesConfig } from 'react-select';
import { getCustomerDetails } from '../../../api/customers/customers';
import { useAssignCustomer } from '../../../../services/mutations/customersMutations';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { toast } from 'react-toastify';
import { getCustomerSegments } from '../../../api/segments/segments';

interface CustomerSegment {
  segment_name: string;
  _id: string;
}

interface SegmentOption {
  label: string;
  value: string;
}

const customStyles: StylesConfig<any, false> = {
  control: (provided, state) => ({
    ...provided,
    width: 'fit-content',
    height: '20px',
    // borderTopLeftRadius: '6px',
    border: state.isFocused ? 'none' : 'none',
    boxShadow: state.isFocused ? 'none' : 'none',
    paddingRight: '8px',
    '&:hover': {
      borderColor: state.isFocused ? '#E4E7EC' : '#E4E7EC',
    },
    backgroundColor: '#F6F7FA',
    textAlign: 'left',
    '@apply form-select placeholder:text-slate-400 border-none focus:ring-0 focus:border-none border-outline-none':
      {},
    // borderRadius: '6px',
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? '#E5EFFF'
      : 'transparent',
    color: state.isSelected ? '#3B82F6' : '#000000',
    '&:hover': {
      backgroundColor: '#E5EFFF',
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
    color: '#202B37',
    fontWeight: 400,
    fontSize: '14px',
    textAlign: 'left',
    marginLeft: '0',
    width: '100%',
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: '#FFFFFF',
    color: '#202B37',
    zIndex: 9999,
  }),
  input: (provided) => ({
    ...provided,
    color: '#202B37',
  }),
};
const filterOptions = (option: any, inputValue: any) => {
  return option?.label?.toLowerCase().includes(inputValue.toLowerCase());
};
const CustomerSegmentSelect: React.FC<any> = () => {
  const { id } = useParams();
  const [options, setOptions] = useState<SegmentOption[]>([]);
  const [defaultValue, setDefaultValue] = useState<any | null>(null);
  const [lastSelectedOption, setLastSelectedOption] = useState(null);
  const updateCustomerData = useAssignCustomer();
  const { data: allCustomerSegments } = useQuery({
    queryKey: ['allCustomerSegments'],
    queryFn: getCustomerSegments,
  });
  const { data: customerDetails } = useQuery({
    queryKey: ['getCustomerDetails'],
    queryFn: () => getCustomerDetails(Number(id)),
  });

  useEffect(() => {
    if (allCustomerSegments?.data?.data) {
      const formattedOptions = allCustomerSegments.data.data.map(
        (segment: any) => ({
          label: segment.segment_name,
          value: segment._id,
        })
      );
      setOptions(formattedOptions);

      const selectedOption = formattedOptions.find(
        (option: any) =>
          option?.label === customerDetails?.data[0]?.segment?.segment_name
      );
      setDefaultValue(selectedOption || null);
      setLastSelectedOption(selectedOption || null);
    }
  }, [allCustomerSegments, customerDetails, id]);

  const onChangeCustomerSegment = async (data: any) => {
    try {
      if (data === null) {
        setDefaultValue(null);
      }
      if (data && data.value === defaultValue?.value) {
        return null;
      }
      if (data) {
        const customerData = {
          segment_id: data.value,
          id,
        };
        const res = await updateCustomerData.mutateAsync(customerData);
        if (res?.status == 200 || res?.status == 201)
          toast.success('Customer Segment updated successfully');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message);
    }
  };

  return (
    <Select
      styles={customStyles}
      options={options}
      className=""
      placeholder="Select a segment"
      onChange={onChangeCustomerSegment}
      value={defaultValue}
      isClearable={false}
      isSearchable={false}
    />
  );
};

export default CustomerSegmentSelect;
