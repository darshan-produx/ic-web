'use client';
import React, { useEffect, useState } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Select, { StylesConfig } from 'react-select';
import CreatableInput from './CreatableInput';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getCustomerDetails,
  getCustomerTypes,
} from '../../../api/customers/customers';
import { useParams } from 'next/navigation';
import {
  useProfilePicture,
  useUpdateCustomerDescription,
} from '../../../../services/mutations/customersMutations';
import { toast } from 'react-toastify';
import Modal from '../../../../common/components/Modal';
import WikipediaModal from './wikipediaModal';
import { CustomerIcon, PencilIcon } from '../../../assests/icons/icons';

// Universal domain regex
const universalDomainRegex =
  /^(?!https?:\/\/)([a-zA-Z0-9-]{1,63}\.)+[a-zA-Z]{2,63}$/;

// Define validation schema
const schema = yup.object().shape({
  customer_type: yup.string().trim(),
  customer_name: yup.string().trim().required('Customer name is required'),
  aliases: yup
    .array()
    .nullable()
    .of(
      yup.string().required('Alias is required') // Ensure each alias is a non-empty string
    )
    .test('unique', 'Duplicate aliases are not allowed', (value) => {
      if (!value || value === null) return true; // Allow null values to bypass the test
      const uniqueAlias = new Set(value);
      return uniqueAlias.size === value.length; // Ensure no duplicates if array is not null
    }),

  primary_location: yup.string().trim(),

  wikipedia_url: yup
    .string()
    .trim()
    .nullable()
    .notRequired() // Ensures the field is optional
    .test(
      'is-valid-wikipedia-url',
      'URL must be a valid Wikipedia URL',
      function (value) {
        if (!value || value.trim() === '') {
          return true; // If the value is null or an empty string, don't apply validation
        }
        const wikipediaUrlRegex =
          /^(https?:\/\/(?:www\.)?([a-z]{2})\.wikipedia\.org\/(?:wiki\/|.*))$/;
        return wikipediaUrlRegex.test(value); // Apply the regex match if the value is present
      }
    )
    .url('Invalid URL'),

  company_website_url: yup.string().trim().nullable().url('Invalid URL'),

  instagram_url: yup
    .string()
    .trim()
    .nullable()
    .notRequired() // Ensures the field is optional
    .test(
      'is-valid-instagram-url',
      'URL must be a valid Instagram URL',
      function (value) {
        if (!value || value.trim() === '') {
          return true; // If the value is null or an empty string, don't apply validation
        }
        const instagramUrlRegex = /^(https?:\/\/(?:www\.)?instagram\.com\/.*)$/;
        return instagramUrlRegex.test(value); // Apply the regex match if the value is present
      }
    )
    .url('Invalid URL'),

  linkedin_url: yup
    .string()
    .trim()
    .nullable()
    .notRequired() // Ensures the field is optional
    .test(
      'is-valid-linkedin-url',
      'URL must be a valid LinkedIn URL',
      function (value) {
        if (!value || value.trim() === '') {
          return true; // If the value is null or an empty string, don't apply validation
        }
        const linkedinUrlRegex =
          /^(https?:\/\/(?:www\.)?(?:in\.)?linkedin\.com\/.*)$/;
        return linkedinUrlRegex.test(value); // Apply the regex match if the value is present
      }
    )
    .url('Invalid URL'),

  x_url: yup
    .string()
    .trim()
    .nullable()
    .notRequired() // Ensures the field is optional
    .test(
      'is-valid-x-url',
      'URL must be a valid Twitter or X.com URL',
      function (value) {
        if (!value || value.trim() === '') {
          return true; // If there's no value, skip validation
        }
        const xUrlRegex = /^(https?:\/\/(?:www\.)?(twitter\.com|x\.com)\/.*)$/;
        return xUrlRegex.test(value); // Check if the value is a valid X.com or Twitter URL
      }
    )
    .url('Invalid URL'),

  approved_domains: yup
    .array()
    .of(
      yup
        .string()
        .matches(universalDomainRegex, 'Invalid domain format') // Ensure it matches the universal domain format
        .required('Domain is required') // Each domain must be present
    )
    .test('unique', 'Duplicate domains are not allowed', (value) => {
      if (!value) return true; // Allow null values
      const uniqueDomains = new Set(value);
      return uniqueDomains.size === value.length; // Ensure no duplicates
    })
    .nullable(), // Allow the entire array to be null

  products_offered: yup
    .array()
    .of(
      yup.string().required('Keyword is required') // Ensure each keyword is a non-empty string
    )
    .test('unique', 'Duplicate keywords are not allowed', (value) => {
      if (!value) return true; // Allow null values
      const uniqueKeywords = new Set(value);
      return uniqueKeywords.size === value.length; // Ensure no duplicates
    })
    .nullable(), // Allow the entire array to be null

  is_active: yup.boolean(),
});

type CustomerDetailFormProps = {
  setCustomerDetailsModal: (value: boolean) => void;
  customer: any;
  customerDetailsModal: boolean;
};

const customerTypescustomStyles: StylesConfig<any, false> = {
  control: (provided, state) => ({
    ...provided,
    width: '120px',
    height: '39px', // Adjusted height to match the Tailwind class height
    border: 'none', // Remove border for the control
    boxShadow: 'none', // Remove any shadow
    borderRadius: '0', // No rounded corners
    backgroundColor: '#FFFFFF', // White background
    padding: '0', // Remove padding from the control
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
    color: '#141C24',
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

interface CustomerDetail {
  customer_name: string;
  customer_type: string;
  aliases: string[];
  primary_location: string;
  wikipedia_url: string;
  company_website_url: string;
  instagram_url: string;
  linkedin_url: string;
  x_url: string;
  approved_domains: string[];
  products_offered: string[];
  is_active: boolean;
}

const CustomerDetailForm: React.FC<CustomerDetailFormProps> = ({
  setCustomerDetailsModal,
  customer,
  customerDetailsModal,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, dirtyFields, isSubmitting },
    setValue,
    control,
    watch,
    clearErrors,
    setError,
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      approved_domains: customer?.approved_domains || [],
    },
  });
  const queryClient = useQueryClient();
  const { id } = useParams<{ id: string }>();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [customerDetail, setCustomerDetail] = useState<CustomerDetail | null>(
    null
  );
  const [confirmationModal, setConfirmationModal] = useState<boolean>(false);
  const [updatedData, setUpdatedData] = useState<Record<string, any> | null>(
    null
  );
  const [profilePictureChanged, setProfilePictureChanged] =
    useState<boolean>(false);

  // const { data: customer } = useQuery({
  //   queryKey: ['customer-details', id],
  //   queryFn: () => getCustomerDetails(Number(id)),
  // });

  const { data: customerTypes } = useQuery({
    queryKey: ['customer-types', id],
    queryFn: () => getCustomerTypes(),
  });

  const customerTypesOptions = customerTypes?.data?.data?.map((type: any) => ({
    value: type.customer_type_id,
    label: type.type_name,
  }));

  const { mutateAsync: updateCustomer } = useUpdateCustomerDescription();
  const { mutateAsync: updateProfilePicture } = useProfilePicture();

  const checkImageExists = async (url: string) => {
    try {
      const response = await fetch(url); // Use HEAD request to check if image exists
      const contentType = response?.headers?.get('content-type');
      if (contentType === 'image/jpeg') {
        setImagePreview(url);
      } else if (contentType === 'image/svg+xml') {
        setImagePreview(null);
      } else {
        setImagePreview(null);
      }
    } catch (error) {
      console.error('Error checking image existence:', error);
      setImagePreview(null);
    }
  };

  useEffect(() => {
    if (customer?.data[0]) {
      const detail = customer.data[0];
      setCustomerDetail(detail);

      // setValue('customer_name', detail.customer_name || '');
      // setValue('customer_type', detail.customer_type?.customer_type_id || '');
      // setValue('aliases', detail.aliases || []);
      // setValue('primary_location', detail.primary_location || '');
      // setValue('wikipedia_url', detail.wikipedia_url || null);
      // setValue('company_website_url', detail.company_website_url || null);
      // setValue('instagram_url', detail.instagram_url || null);
      // setValue('linkedin_url', detail.linkedin_url || null);
      // setValue('x_url', detail.x_url || null);
      // setValue('approved_domains', detail.approved_domains || []);
      // setValue('products_offered', detail.products_offered || []);
      // setValue('is_active', detail.is_active || false);

      // Populate the form with initial data
      reset({
        customer_name: detail.customer_name || '',
        customer_type: detail.customer_type?.customer_type_id || '',
        aliases: detail.aliases || [],
        primary_location: detail.primary_location || '',
        wikipedia_url: detail.wikipedia_url || null,
        company_website_url: detail.company_website_url || null,
        instagram_url: detail.instagram_url || null,
        linkedin_url: detail.linkedin_url || null,
        x_url: detail.x_url || null,
        approved_domains: detail.approved_domains || [],
        products_offered: detail.products_offered || [],
        is_active: detail.is_active || false,
      });

      checkImageExists(
        `/api/app-service/v1/picture/customer_master/${
          detail._id
        }?org_id=${localStorage.getItem('org_id')}&initials=${getInitials(
          detail.customer_name
        )}&ts=${detail.updated_at}`
      );
    }
  }, [customer, reset]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const maxSizeInBytes = 1024 * 1024; // 1MB

    if (!file) {
      console.error('No file selected.');
      return;
    }

    if (file.size > maxSizeInBytes) {
      toast.error('File size exceeds 1MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      if (result.startsWith('data:image/')) {
        setImagePreview(result);
        setBase64Image(result.split(',')[1]);
        setProfilePictureChanged(true);
      } else {
        console.error('File is not a valid image.');
      }
    };

    reader.onerror = (error) => {
      console.error('File reading error:', error);
    };

    reader.readAsDataURL(file);
  };

  const onSubmit = async (data: any) => {
    const updatedData = {
      ...data,
      customer_type_id: Number(data.customer_type),
      id: Number(id),
    };

    delete updatedData.customer_type;
    setUpdatedData(updatedData);

    const enterpriseOrStandard = customerTypesOptions?.some(
      (typeOption: any) =>
        ['IC-Platinum', 'IC-Gold']?.includes(typeOption.label) &&
        typeOption?.value === updatedData?.customer_type_id
    );

    if (enterpriseOrStandard && !updatedData.wikipedia_url) {
      return setConfirmationModal(true);
    }

    try {
      const result = await updateCustomer(updatedData);
      queryClient.invalidateQueries({
        queryKey: ['customer-details', id],
        exact: true,
      });
      if (base64Image) {
        const base64String = base64Image?.startsWith('data:image/')
          ? base64Image.split(',')[1]
          : base64Image;
        const profilePicture = {
          picture_base64: base64String,
          ref_type: 'customer_master',
          ref_id: result.data?._id,
        };

        await updateProfilePicture(profilePicture);
      }

      toast.success('Customer details updated successfully');
      setCustomerDetailsModal(false);
      reset();
    } catch (error) {
      console.error('Update failed:', error);
      toast.error((error as any).message);
      setCustomerDetailsModal(false);
      reset();
    }
  };

  const handleSaveChanges = async (data: any) => {
    try {
      const result = await updateCustomer(data);
      queryClient.invalidateQueries({
        queryKey: ['customer-details', id],
        exact: true,
      });
      if ((result?.status === 200 || result?.status === 201) && base64Image) {
        const base64String = base64Image?.startsWith('data:image/')
          ? base64Image.split(',')[1]
          : base64Image;
        const profilePicture = {
          picture_base64: base64String,
          ref_type: 'customer_master',
          ref_id: result.data?._id,
        };

        await updateProfilePicture(profilePicture);
      }

      toast.success('Customer details updated successfully');
      setCustomerDetailsModal(false);
      reset();
    } catch (error) {
      console.error('Update failed:', error);
      toast.error((error as any).message);
      setCustomerDetailsModal(false);
      reset();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    // Prevent default form submission on Enter key press
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  const methods = useForm();

  const formValues = watch();

  const hasChanged =
    (dirtyFields && Object.keys(dirtyFields).length > 0) || isDirty;

  useEffect(() => {
    const modalBody = document.querySelector(
      '.custom-modal-body'
    ) as HTMLElement | null;

    if (modalBody) {
      const hasScrollbar = modalBody.scrollHeight > modalBody.clientHeight;
      modalBody.style.paddingRight = hasScrollbar ? '16px' : '20px';
    }
  }, []);

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} onKeyDown={handleKeyDown}>
        <Modal
          show={customerDetailsModal}
          onHide={() => setCustomerDetailsModal(false)}
          id="defaultModal"
          modal-center="true"
          className="fixed flex flex-col transition-all duration-300 ease-in-out left-2/4 z-drawer -translate-x-2/4 -translate-y-2/4"
          dialogClassName="bg-white shadow rounded-md dark:bg-zink-600"
        >
          <Modal.Body className="custom-modal-body scroll max-h-[calc(theme('height.screen')_-_180px)] py-5 pl-5 overflow-y-auto">
            <div className="flex bg-white h-[130px]">
              {/* Company Logo */}
              <div className="relative pt-[20px] pb-[20px] rounded-full flex items-center justify-center flex-shrink-0">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Customer"
                    className="rounded-full w-[90px] h-[90px]"
                  />
                ) : (
                  <CustomerIcon className="rounded-full w-[90px] h-[90px]" />
                )}
                <label
                  htmlFor="uploadCustomerLogo"
                  className="absolute top-[8px] left-[76px] w-[28.01px] h-[28.01px] rounded-full border border-[#3B82F6] flex items-center justify-center cursor-pointer"
                >
                  <PencilIcon className="text-[#3B82F6] w-[12.01px] h-[12.01px]" />
                </label>

                <input
                  type="file"
                  id="uploadCustomerLogo"
                  accept=".jpeg,.jpg"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </div>
              {/* Company Info */}
              <div className="ml-9 pt-[33px] pb-[61px] w-[444px]">
                <div
                  title={customerDetail?.customer_name}
                  className="h-9 text-[28px]  overflow-hidden leading-[36px] font-medium text-[#141C24] text-nowrap text-ellipsis whitespace-nowrap"
                >
                  {customerDetail?.customer_name}
                </div>
                <div className="text-[14px] text-[#637083] flex justify-between items-center">
                  <span>{customerDetail?.primary_location}</span>
                  <div className="flex items-center justify-end ">
                    <div className="text-[14px] text-[#637083] mr-2 font-normal leading-5 flex items-center">
                      Type
                    </div>
                    <div className="flex items-center">
                      <Controller
                        name="customer_type"
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <Select
                            styles={customerTypescustomStyles}
                            options={customerTypesOptions}
                            value={
                              customerTypesOptions?.find(
                                (option: any) => option.value === value
                              ) || null
                            }
                            onChange={(selectedOption) =>
                              onChange(selectedOption?.value)
                            }
                            className=""
                            placeholder="Search type"
                            // isLoading={isLoading} // Show loading state if fetching
                            isClearable
                          />
                        )}
                      />
                      {errors.customer_type && (
                        <p className="text-red-600 text-[14px]">
                          {errors.customer_type.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              {/* Company Type */}
            </div>
            {/* Grid container for the first set of fields */}
            <div className="grid grid-cols-2">
              <div className="flex flex-col mt-6">
                <label className="mb-1.5 text-[14px] font-medium leading-5 text-[#344051]">
                  Customer name *
                </label>
                <input
                  {...register('customer_name')}
                  //  className="w-[268px] h-10 px-3 py-2 rounded-[8px] text-[16px] font-normal leading-6 text-[#141C24] bg-white border border-[#CED2DA] focus:border-[#4C94FF] focus:shadow-[0_0_0_2px_#99C2FF] focus:outline-none hover:border-[#4C94FF] hover:shadow-[0_0_0_2px_#99C2FF] transition-all duration-200"
                  className="w-[268px] h-10 px-3 py-2 rounded-[8px] text-[16px] font-normal leading-6 text-[#141C24] bg-white border border-[#CED2DA] focus:border-[#4C94FF] focus:shadow-[0_0_0_2px_#99C2FF] focus:outline-none hover:border-[#4C94FF] hover:shadow-[0_0_0_2px_#99C2FF] transition-all duration-200"
                  placeholder="Enter customer name"
                  autoComplete="off" // Disable autocomplete
                  autoFocus
                />
                {errors.customer_name && (
                  <p className="text-red-600 text-[14px]">
                    {errors.customer_name.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col mt-6 justify-self-end">
                <Controller
                  name="aliases"
                  control={control}
                  render={({ field }) => (
                    <CreatableInput
                      label="Also knows as (alias)"
                      placeholder="Enter aliases"
                      name="aliases"
                      value={field?.value ?? []}
                      setValue={setValue}
                      clearErrors={clearErrors}
                      setError={setError}
                      error={errors?.aliases?.message}
                      width="w-[268px]" // Set the desired width
                      onChange={field?.onChange} // Pass the onChange function
                      onBlur={field?.onBlur} // Pass the onBlur function
                    />
                  )}
                />
              </div>

              <div className="flex flex-col mt-6">
                <label className="mb-1.5 text-[14px] font-medium leading-5 text-[#344051]">
                  Primary location
                </label>
                <input
                  {...register('primary_location')}
                  className="w-[268px] h-10 px-3 py-2 rounded-[8px] text-[16px] font-normal leading-6 text-[#141C24] bg-white border border-[#CED2DA] focus:border-[#4C94FF] focus:shadow-[0_0_0_2px_#99C2FF] focus:outline-none hover:border-[#4C94FF] hover:shadow-[0_0_0_2px_#99C2FF] transition-all duration-200"
                  placeholder="Enter location"
                  autoComplete="off" // Disable autocomplete
                />
                {errors.primary_location && (
                  <p className="text-red-600 text-[14px]">
                    {errors.primary_location.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col mt-6 justify-self-end">
                <label className="mb-1.5 text-[14px] font-medium leading-5 text-[#344051]">
                  Wikipedia page
                </label>
                <input
                  {...register('wikipedia_url')}
                  className="w-[268px] h-10 px-3 py-2 rounded-[8px] text-[16px] font-normal leading-6 text-[#141C24] bg-white border border-[#CED2DA] focus:border-[#4C94FF] focus:shadow-[0_0_0_2px_#99C2FF] focus:outline-none hover:border-[#4C94FF] hover:shadow-[0_0_0_2px_#99C2FF] transition-all duration-200"
                  placeholder="Enter link"
                  autoComplete="off" // Disable autocomplete
                />
                {errors.wikipedia_url && (
                  <p className="text-red-600 text-[14px]">
                    {errors.wikipedia_url.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col mt-6">
                <label className="mb-1.5 text-[14px] font-medium leading-5 text-[#344051]">
                  Company website
                </label>
                <input
                  {...register('company_website_url')}
                  className="w-[268px] h-10 px-3 py-2 rounded-[8px] text-[16px] font-normal leading-6 text-[#141C24] bg-white border border-[#CED2DA] focus:border-[#4C94FF] focus:shadow-[0_0_0_2px_#99C2FF] focus:outline-none hover:border-[#4C94FF] hover:shadow-[0_0_0_2px_#99C2FF] transition-all duration-200"
                  placeholder="Enter link"
                  autoComplete="off" // Disable autocomplete
                />
                {errors.company_website_url && (
                  <p className="text-red-600 text-[14px]">
                    {errors.company_website_url.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col mt-6 justify-self-end">
                <label className="mb-1.5 text-[14px] font-medium leading-5 text-[#344051]">
                  Instagram handle
                </label>
                <input
                  {...register('instagram_url')}
                  className="w-[268px] h-10 px-3 py-2 rounded-[8px] text-[16px] font-normal leading-6 text-[#141C24] bg-white border border-[#CED2DA] focus:border-[#4C94FF] focus:shadow-[0_0_0_2px_#99C2FF] focus:outline-none hover:border-[#4C94FF] hover:shadow-[0_0_0_2px_#99C2FF] transition-all duration-200"
                  placeholder="Enter link"
                  autoComplete="off" // Disable autocomplete
                />
                {errors.instagram_url && (
                  <p className="text-red-600 text-[14px]">
                    {errors.instagram_url.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col mt-6">
                <label className="mb-1.5 text-[14px] font-medium leading-5 text-[#344051]">
                  LinkedIn handle
                </label>
                <input
                  {...register('linkedin_url')}
                  className="w-[268px] h-10 px-3 py-2 rounded-[8px] text-[16px] font-normal leading-6 text-[#141C24] bg-white border border-[#CED2DA] focus:border-[#4C94FF] focus:shadow-[0_0_0_2px_#99C2FF] focus:outline-none hover:border-[#4C94FF] hover:shadow-[0_0_0_2px_#99C2FF] transition-all duration-200"
                  placeholder="Enter link"
                  autoComplete="off" // Disable autocomplete
                />
                {errors.linkedin_url && (
                  <p className="text-red-600 text-[14px]">
                    {errors.linkedin_url.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col mt-6 justify-self-end">
                <label className="mb-1.5 text-[14px] font-medium leading-5 text-[#344051]">
                  X handle
                </label>
                <input
                  {...register('x_url')}
                  className="w-[268px] h-10 px-3 py-2 rounded-[8px] text-[16px] font-normal leading-6 text-[#141C24] bg-white border border-[#CED2DA] focus:border-[#4C94FF] focus:shadow-[0_0_0_2px_#99C2FF] focus:outline-none hover:border-[#4C94FF] hover:shadow-[0_0_0_2px_#99C2FF] transition-all duration-200"
                  placeholder="Enter page link"
                  autoComplete="off" // Disable autocomplete
                />
                {errors.x_url && (
                  <p className="text-red-600 text-[14px]">
                    {errors.x_url.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col mt-6">
              <Controller
                name="approved_domains"
                control={control}
                render={({ field }) => (
                  <CreatableInput
                    label="Email domains list"
                    placeholder="Enter domains"
                    name="approved_domains"
                    value={field?.value ?? []}
                    setValue={setValue}
                    clearErrors={clearErrors}
                    setError={setError}
                    error={errors.approved_domains?.message}
                    width="w-[570px]"
                    onChange={field?.onChange} // Pass the onChange function
                    onBlur={field?.onBlur} // Pass the onBlur function
                  />
                )}
              />
              <p className="h-5 mt-1 text-[#637083] leading-5 font-normal text-[14px]">
                keywords can be separated by commas “,”
              </p>
            </div>

            <div className="flex flex-col mt-6">
              <Controller
                name="products_offered"
                control={control}
                render={({ field }) => (
                  <CreatableInput
                    label="Products and services offered"
                    placeholder="Enter keywords"
                    name="products_offered"
                    value={field?.value ?? []}
                    clearErrors={clearErrors}
                    setError={setError}
                    setValue={setValue}
                    error={errors.products_offered?.message}
                    width="w-[570px]" // Set the desired width
                    onChange={field?.onChange} // Pass the onChange function
                    onBlur={field?.onBlur} // Pass the onBlur function
                  />
                )}
              />
              <p className="h-5 mt-1 text-[#637083] leading-5 font-normal text-[14px]">
                keywords can be separated by commas “,”
              </p>
            </div>
          </Modal.Body>
          <Modal.Footer className="grid grid-cols-2 gap-2 p-5 border-t border-[#E4E7EC]">
            <div className="flex items-center justify-start">
              <Controller
                name="is_active"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center">
                    <label className="relative w-[32px] h-[15px] rounded-full cursor-pointer">
                      <input
                        {...register('is_active')}
                        type="checkbox"
                        className="sr-only peer"
                        onChange={(e) => field.onChange(e.target.checked)} // Ensure field value changes
                        checked={field.value} // Sync field value with the checkbox
                      />
                      <div
                        className={`w-full h-full bg-[#E3EAF2] rounded-full peer-focus:outline-none 
              ${field.value ? 'bg-[#3B82F6] peer-checked:bg-[#3B82F6]' : ''}`}
                      >
                        <div
                          className={`absolute top-[3px] left-[2px] bg-white rounded-full h-[10px] w-[10px] transition-transform 
                ${field.value ? 'translate-x-[16px]' : ''}`}
                        ></div>
                      </div>
                    </label>
                    <label className="ml-2 text-[14px] font-medium text-gray-700">
                      {field.value ? 'Active' : 'Active'}
                    </label>
                  </div>
                )}
              />
            </div>
            <div className="flex justify-end gap-4">
              <button
                className="w-[72px] h-[39px] rounded-md border border-[#637083] bg-[#FFFFFF] text-[14px] font-semibold text-[#637083] leading-5"
                onClick={() => {
                  reset();
                  setCustomerDetailsModal(false);
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={
                  (!hasChanged && !profilePictureChanged) || isSubmitting
                }
                className={`w-[90px] h-[39px] rounded-md text-[14px] font-semibold text-white leading-5 ${
                  hasChanged || profilePictureChanged
                    ? 'bg-[#3B82F6] cursor-pointer'
                    : 'bg-[#CCE0FF] cursor-not-allowed'
                }`}
              >
                Update
              </button>
            </div>
          </Modal.Footer>
        </Modal>
        {/* Confirmation modal */}
        {confirmationModal && (
          <Modal
            show={confirmationModal}
            onHide={() => setConfirmationModal(false)}
            id="defaultModal"
            modal-center="true"
            className="fixed flex flex-col transition-all duration-300 ease-in-out left-2/4 z-drawer -translate-x-2/4 -translate-y-2/4"
            dialogClassName="bg-white shadow rounded-xl dark:bg-zink-600"
          >
            <Modal.Body className="max-h-[calc(theme('height.screen')_-_180px)] overflow-y-auto">
              <WikipediaModal
                onGoBack={setConfirmationModal}
                onSaveChanges={handleSaveChanges}
                data={updatedData}
              />
            </Modal.Body>
          </Modal>
        )}
      </form>
    </FormProvider>
  );
};

export default CustomerDetailForm;

function getInitials(name: string): string {
  const nameArray = name?.trim()?.split(' ');
  const initials = nameArray?.map((word) => word[0]?.toUpperCase());
  const initial = initials?.join('');

  return initial == undefined ||
    (nameArray[0] == 'undefined' && nameArray[1] == 'undefined')
    ? 'NA'
    : initial;
}
