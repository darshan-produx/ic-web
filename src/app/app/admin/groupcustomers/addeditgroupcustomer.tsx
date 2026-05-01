'use client';
import React, { useEffect, useState } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Select from 'react-select';
import CreatableInput from '../../customers/components/CreatableInput';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getAllAssociatedCustomers,
  getCustomerTypes,
} from '../../../api/customers/customers';
import {
  useCreateUpdateGroupCustomer,
  useProfilePicture,
} from '../../../../services/mutations/customersMutations';
import { toast } from 'react-toastify';
import Modal from '../../../../common/components/Modal';
import WikipediaModal from '../../customers/components/wikipediaModal';
import { CustomerIcon, PencilIcon } from '../../../assests/icons/icons';
import {
  associatedCustomerscustomStyles,
  customerTypescustomStyles,
} from './customstyles';

// Universal domain regex
const universalDomainRegex =
  /^(?!https?:\/\/)([a-zA-Z0-9-]{1,63}\.)+[a-zA-Z]{2,63}$/;

// Define validation schema
const schema = yup.object().shape({
  customer_type_id: yup
    .number()
    .nullable()
    .transform((value, originalValue) => (originalValue === '' ? null : value)),
  customer_name: yup.string().trim(),
  crm_id: yup.string().trim().required('crm id is required'),

  aliases: yup
    .array()
    .nullable()
    .of(yup.string().required('Alias is required'))
    .test('unique', 'Duplicate aliases are not allowed', (value) => {
      if (!value || value === null) return true;
      const uniqueAlias = new Set(value);
      return uniqueAlias.size === value.length;
    }),

  primary_location: yup.string().trim(),

  wikipedia_url: yup
    .string()
    .trim()
    .nullable()
    .notRequired()
    .test(
      'is-valid-wikipedia-url',
      'URL must be a valid Wikipedia URL',
      function (value) {
        if (!value || value.trim() === '') {
          return true;
        }
        const wikipediaUrlRegex =
          /^(https?:\/\/(?:www\.)?([a-z]{2})\.wikipedia\.org\/(?:wiki\/|.*))$/;
        return wikipediaUrlRegex.test(value);
      }
    )
    .url('Invalid URL'),

  company_website_url: yup.string().trim().nullable().url('Invalid URL'),

  instagram_url: yup
    .string()
    .trim()
    .nullable()
    .notRequired()
    .test(
      'is-valid-instagram-url',
      'URL must be a valid Instagram URL',
      function (value) {
        if (!value || value.trim() === '') {
          return true;
        }
        const instagramUrlRegex = /^(https?:\/\/(?:www\.)?instagram\.com\/.*)$/;
        return instagramUrlRegex.test(value);
      }
    )
    .url('Invalid URL'),

  linkedin_url: yup
    .string()
    .trim()
    .nullable()
    .notRequired()
    .test(
      'is-valid-linkedin-url',
      'URL must be a valid LinkedIn URL',
      function (value) {
        if (!value || value.trim() === '') {
          return true;
        }
        const linkedinUrlRegex =
          /^(https?:\/\/(?:www\.)?(?:in\.)?linkedin\.com\/.*)$/;
        return linkedinUrlRegex.test(value);
      }
    )
    .url('Invalid URL'),

  x_url: yup
    .string()
    .trim()
    .nullable()
    .notRequired()
    .test(
      'is-valid-x-url',
      'URL must be a valid Twitter or X.com URL',
      function (value) {
        if (!value || value.trim() === '') {
          return true;
        }
        const xUrlRegex = /^(https?:\/\/(?:www\.)?(twitter\.com|x\.com)\/.*)$/;
        return xUrlRegex.test(value);
      }
    )
    .url('Invalid URL'),

  approved_domains: yup
    .array()
    .of(
      yup
        .string()
        .matches(universalDomainRegex, 'Invalid domain format')
        .required('Domain is required')
    )
    .test('unique', 'Duplicate domains are not allowed', (value) => {
      if (!value) return true;
      const uniqueDomains = new Set(value);
      return uniqueDomains.size === value.length;
    })
    .nullable(),

  products_offered: yup
    .array()
    .of(yup.string().required('Keyword is required'))
    .test('unique', 'Duplicate keywords are not allowed', (value) => {
      if (!value) return true;
      const uniqueKeywords = new Set(value);
      return uniqueKeywords.size === value.length;
    })
    .nullable(),

  associated_customer_ids: yup
    .array()
    .of(yup.number().required('customer is required'))
    .test('unique', 'Duplicate customers are not allowed', (value) => {
      if (!value) return true;
      const uniqueCustomers = new Set(value);
      return uniqueCustomers.size === value.length;
    })
    .nullable(),

  is_active: yup.boolean().default(true),
});

type CustomerDetailFormProps = {
  customer: any;
  openAddEditGroupCustomerForm: boolean;
  setOpenAddEditGroupCustomerForm: (value: boolean) => void;
};

const AddEditGroupCustomerForm: React.FC<CustomerDetailFormProps> = ({
  setOpenAddEditGroupCustomerForm,
  customer,
  openAddEditGroupCustomerForm,
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
      is_active: true, 
      approved_domains: customer?.approved_domains || [],
      associated_customer_ids:
        customer?.associated_customers?.map((c: any) => c.customer_id) || [],
    },
  });
  const queryClient = useQueryClient();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [confirmationModal, setConfirmationModal] = useState<boolean>(false);
  const [updatedData, setUpdatedData] = useState<Record<string, any> | null>(
    null
  );
  const [profilePictureChanged, setProfilePictureChanged] =
    useState<boolean>(false);

  const { data: customerTypes } = useQuery({
    queryKey: ['customer-types'],
    queryFn: () => getCustomerTypes(),
    refetchOnWindowFocus: false,
  });

  const { data: associatedCustomers } = useQuery({
    queryKey: ['associated-customer'],
    queryFn: () => getAllAssociatedCustomers(),
    refetchOnWindowFocus: false,
  });

  const customerTypesOptions = customerTypes?.data?.data?.map((type: any) => ({
    value: type.customer_type_id,
    label: type.type_name,
  }));

  const [associatedCustomersOptions, setAssociatedCustomersOptions] = useState<
    { value: string; label: string }[]
  >([]);

  useEffect(() => {
    const prepareOptions = async () => {
      const ungrouped =
        associatedCustomers?.data?.map((cust: any) => ({
          value: cust.customer_id,
          label: cust.customer_name,
        })) || [];

      const currentlyAssociated =
        customer?.associated_customers?.map((cust: any) => ({
          value: cust.customer_id,
          label: cust.customer_name,
        })) || [];

      const map = new Map<string, { value: string; label: string }>();

      [...ungrouped, ...currentlyAssociated].forEach((item) => {
        map.set(item.value, item);
      });

      setAssociatedCustomersOptions(Array.from(map.values()));
    };

    prepareOptions();
  }, [associatedCustomers, customer]);

  const { mutateAsync: createUpdateGroupCustomer } =
    useCreateUpdateGroupCustomer();
  const { mutateAsync: updateProfilePicture } = useProfilePicture();

  const checkImageExists = async (url: string) => {
    try {
      const response = await fetch(url);
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
    if (!customer) return;
    const {
      crm_id = '',
      customer_name = '',
      customer_type_id,
      aliases = [],
      primary_location = '',
      wikipedia_url = null,
      company_website_url = null,
      instagram_url = null,
      linkedin_url = null,
      x_url = null,
      approved_domains = [],
      products_offered = [],
      associated_customer_ids = [],
      is_active = true,
      _id,
      updated_at,
    } = customer;

    reset({
      crm_id,
      customer_name,
      customer_type_id: customer?.customer_type?.customer_type_id || '',
      aliases,
      primary_location,
      wikipedia_url,
      company_website_url,
      instagram_url,
      linkedin_url,
      x_url,
      approved_domains,
      products_offered,
      associated_customer_ids: customer?.associated_customers.map(
        (cust: any) => cust.customer_id
      ),
      is_active,
    });

    checkImageExists(
      `/api/app-service/v1/picture/customer_master/${_id}?org_id=${localStorage.getItem(
        'org_id'
      )}&initials=${getInitials(customer_name)}&ts=${updated_at}`
    );
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
      is_group: true,
    };
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
      const result = await createUpdateGroupCustomer(updatedData);
      queryClient.invalidateQueries({
        queryKey: ['groupCustomers'],
        exact: true,
      });
      if (base64Image) {
        const base64String = base64Image?.startsWith('data:image/')
          ? base64Image.split(',')[1]
          : base64Image;
        const profilePicture = {
          picture_base64: base64String,
          ref_type: 'customer_master',
          ref_id: result.data?.data[0]?._id,
        };

        await updateProfilePicture(profilePicture);
      }

      toast.success(
        `Group customer ${customer ? 'updated' : 'added'} successfully`
      );
      setOpenAddEditGroupCustomerForm(false);
      reset();
    } catch (error) {
      console.error('Update failed:', error);
      toast.error((error as any).message);
      setOpenAddEditGroupCustomerForm(false);
      reset();
    }
  };

  const handleSaveChanges = async (data: any) => {
    try {
      const result = await createUpdateGroupCustomer(data);
      queryClient.invalidateQueries({
        queryKey: ['groupCustomers'],
        exact: true,
      });
      if ((result?.status === 200 || result?.status === 201) && base64Image) {
        const base64String = base64Image?.startsWith('data:image/')
          ? base64Image.split(',')[1]
          : base64Image;
        const profilePicture = {
          picture_base64: base64String,
          ref_type: 'customer_master',
          ref_id: result.data?.data[0]?._id,
        };

        await updateProfilePicture(profilePicture);
      }
      toast.success(
        `Group customer ${customer ? 'updated' : 'added'} successfully`
      );
      setOpenAddEditGroupCustomerForm(false);
      reset();
    } catch (error) {
      console.error('Update failed:', error);
      toast.error((error as any).message);
      setOpenAddEditGroupCustomerForm(false);
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
          show={openAddEditGroupCustomerForm}
          onHide={() => setOpenAddEditGroupCustomerForm(false)}
          id="defaultModal"
          modal-center="true"
          className="fixed flex flex-col transition-all duration-300 ease-in-out left-2/4 z-drawer -translate-x-2/4 -translate-y-2/4 max-w-[620px]"
          dialogClassName="bg-white shadow rounded-md dark:bg-zink-600"
        >
          <Modal.Body className="custom-modal-body scroll max-h-[calc(theme('height.screen')_-_180px)] py-5 pl-5 overflow-y-auto">
            <div className="flex justify-between mr-[20px]">
              <h6 className="font-semibold text-[24px] text-black">
                {customer ? 'Edit  group customer' : 'Add new group customer'}
              </h6>
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
            </div>
            {/* Grid container for the first set of fields */}
            <div className="flex justify-between flex-wrap">
              <div className="flex flex-col">
                <label className="mb-1.5 text-[14px] font-medium leading-5 text-[#344051]">
                  Customer name
                </label>
                <input
                  {...register('customer_name')}
                  className="w-[268px] h-10 px-3 py-2 rounded-[8px] text-[16px] font-normal leading-6 text-[#141C24] bg-white border border-[#CED2DA] focus:border-[#4C94FF] focus:shadow-[0_0_0_2px_#99C2FF] focus:outline-none hover:border-[#4C94FF] hover:shadow-[0_0_0_2px_#99C2FF] transition-all duration-200"
                  placeholder="Enter customer name"
                  autoComplete="off"
                  autoFocus
                />
                {errors.customer_name && (
                  <p className="text-red-600 text-[14px]">
                    {errors.customer_name.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col">
                <label className="mb-1.5 text-[14px] font-medium leading-5 text-[#344051]">
                  CRM ID *
                </label>
                <input
                  {...register('crm_id')}
                  className="w-[268px] h-10 px-3 py-2 rounded-[8px] text-[16px] font-normal leading-6 text-[#141C24] bg-white border border-[#CED2DA] focus:border-[#4C94FF] focus:shadow-[0_0_0_2px_#99C2FF] focus:outline-none hover:border-[#4C94FF] hover:shadow-[0_0_0_2px_#99C2FF] transition-all duration-200"
                  placeholder="Enter crm id"
                  autoComplete="off"
                  autoFocus
                />
                {errors.crm_id && (
                  <p className="text-red-600 text-[14px]">
                    {errors.crm_id.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col mt-6">
                <label className="mb-1.5 text-[14px] font-medium leading-5 text-[#344051]">
                  Associated customers
                </label>
                <Controller
                  name="associated_customer_ids"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <Select
                      styles={associatedCustomerscustomStyles}
                      options={associatedCustomersOptions}
                      value={associatedCustomersOptions?.filter((option: any) =>
                        value?.includes(option.value)
                      )}
                      onChange={(selectedOptions) =>
                        onChange(
                          selectedOptions
                            ? selectedOptions.map((opt) => opt.value)
                            : []
                        )
                      }
                      className=""
                      placeholder="associated customers"
                      isClearable
                      isMulti
                    />
                  )}
                />
                {errors.associated_customer_ids && (
                  <p className="text-red-600 text-[14px]">
                    {errors.associated_customer_ids.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col mt-6">
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

              <div className="flex flex-col mt-6">
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

              <div className="flex flex-col mt-6">
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

              <div className="flex flex-col mt-6">
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

              <div className="flex flex-col mt-6">
                <label className="mb-1.5 text-[14px] font-medium leading-5 text-[#344051]">
                  Type
                </label>
                <Controller
                  name="customer_type_id"
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
                {errors.customer_type_id && (
                  <p className="text-red-600 text-[14px]">
                    {errors.customer_type_id.message}
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
                        onChange={(e) => field.onChange(e.target.checked)}
                        checked={field.value} 
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
                  setOpenAddEditGroupCustomerForm(false);
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={
                  (!hasChanged && !profilePictureChanged) || isSubmitting
                }
                className={`w-[72px] h-[39px] rounded-md text-[14px] font-semibold text-white leading-5 ${
                  hasChanged || profilePictureChanged
                    ? 'bg-[#3B82F6] cursor-pointer'
                    : 'bg-[#CCE0FF] cursor-not-allowed'
                }`}
              >
                {customer ? 'Save' : 'Add'}
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

export default AddEditGroupCustomerForm;

function getInitials(name: string): string {
  const nameArray = name?.trim()?.split(' ');
  const initials = nameArray?.map((word) => word[0]?.toUpperCase());
  const initial = initials?.join('');

  return initial == undefined ||
    (nameArray[0] == 'undefined' && nameArray[1] == 'undefined')
    ? 'NA'
    : initial;
}
