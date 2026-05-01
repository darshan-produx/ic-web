import React, { useEffect, useState } from 'react';
import CreatableSelect from 'react-select/creatable';
import {
  UseFormSetValue,
  UseFormClearErrors,
  UseFormSetError,
} from 'react-hook-form';

interface CreatableInputProps {
  label: string;
  placeholder: string;
  name: string;
  value: string[];
  setValue: UseFormSetValue<any>;
  clearErrors: UseFormClearErrors<any>;
  setError: UseFormSetError<any>;
  error?: any;
  width?: string;
  onChange: (value: any) => void; // Expect this to be a function that handles the value change
  onBlur: () => void; // Expect this to be a function that handles blur events
}

const domainRegex = /^(?!:\/\/)([a-zA-Z0-9-_]+\.)+[a-zA-Z]{2,}$/;

const CreatableInput: React.FC<CreatableInputProps> = ({
  label,
  placeholder,
  name,
  value,
  setValue,
  clearErrors,
  setError,
  error,
  width,
  onChange,
  onBlur,
}) => {
  const [inputValue, setInputValue] = useState<string>('');
  const [selectedOptions, setSelectedOptions] = useState<
    { label: string; value: string }[]
  >((value || []).map((domain) => ({ label: domain, value: domain })));

  useEffect(() => {
    if (value && Array.isArray(value)) {
      const initialOptions = value.map((domain) => ({
        label: domain,
        value: domain,
      }));
      setSelectedOptions(initialOptions);
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === ',' || e.key === 'Enter') && inputValue) {
      e.preventDefault();
      if (name === 'approved_domains' && domainRegex.test(inputValue)) {
        const newOption = { label: inputValue, value: inputValue };
        const updatedOptions = [...selectedOptions, newOption];
        setSelectedOptions(updatedOptions);
        setValue(
          name,
          updatedOptions.map((opt) => opt.value)
        );
        onChange(updatedOptions.map((opt) => opt.value)); // Call onChange
        setInputValue('');
        clearErrors(name);
      } else {
        setError(name, {
          type: 'manual',
          message: 'Invalid domain format',
        });
      }

      if (name === 'products_offered' || name === 'aliases') {
        const newOption = { label: inputValue, value: inputValue };
        const updatedOptions = [...selectedOptions, newOption];
        setSelectedOptions(updatedOptions);
        setValue(
          name,
          updatedOptions.map((opt) => opt.value)
        );
        onChange(updatedOptions.map((opt) => opt.value)); // Call onChange
        setInputValue('');
        clearErrors(name);
      }
    }
  };

  return (
    <div>
      <label className="block mb-1.5 text-[14px] leading-[20px] font-medium text-[#344051]">
        {label}
      </label>
      <CreatableSelect
        inputValue={inputValue}
        isClearable
        isMulti
        menuIsOpen={false}
        placeholder={placeholder}
        onInputChange={setInputValue}
        onKeyDown={handleKeyDown}
        onChange={(newValue) => {
          const updatedOptions = newValue as { label: string; value: string }[];
          setSelectedOptions(updatedOptions);
          setValue(
            name,
            updatedOptions.map((opt) => opt.value)
          );
          onChange(updatedOptions.map((opt) => opt.value)); // Call onChange
          clearErrors(name);
        }}
        onBlur={onBlur} // Call onBlur
        value={selectedOptions}
        className={`${width} text-base font-normal text-[#637083] bg-white border border-[#CED2DA] rounded-[6px] focus:border-[#4C94FF] focus:shadow-md transition-all duration-200`}
        styles={{
          control: (base, state) => ({
            ...base,
            border: state.isFocused ? '1px solid #4C94FF' : '#CED2DA',
            boxShadow: state.isFocused ? '0 0 0 2px #99C2FF' : 'none',
            borderRadius: '8px',
            backgroundColor: 'white',
            transition:
              'border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
            '&:hover': {
              border: '1px solid #4C94FF',
              boxShadow: '0 0 0 2px #99C2FF',
            },
          }),
          multiValue: (base) => ({
            ...base,
            backgroundColor: '#F2F4F7',
            borderRadius: '150px',
          }),
          multiValueLabel: (base) => ({
            ...base,
            color: '#344051',
            fontWeight: '500',
            fontSize: '14px',
            lineHeight: '20px',
            height: '20px',
            marginLeft: '10px',
            alignItems: 'center',
            textAlign: 'center',
            display: 'flex',
          }),
          multiValueRemove: (base) => ({
            ...base,
            color: '#637083',
            cursor: 'pointer',
            ':hover': {
              backgroundColor: '#CBD2DC',
              color: '#637083',
            },
          }),
          indicatorSeparator: (base) => ({
            ...base,
            display: 'none',
          }),
          dropdownIndicator: (base) => ({
            ...base,
            display: 'none',
          }),
          clearIndicator: (base) => ({
            ...base,
            display: 'none',
          }),

          placeholder: (base) => ({
            ...base,
            color: '#637083',
            fontWeight: '400',
            fontSize: '16px',
            lineHeight: '24px',
            height: '24px',
            alignItems: 'center',
            textAlign: 'center',
            display: 'flex',
          }),
        }}
      />
      {error && <p className="mt-1 text-[14px] text-red-600">{error}</p>}
    </div>
  );
};

export default CreatableInput;
