import { yupResolver } from '@hookform/resolvers/yup';
import {
  useAddStakeholder,
  useUpdateStakeholder,
} from '../../../../../services/mutations/customer360StakeholderMutations';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import PhoneInput from 'react-phone-input-2';
import { useParams } from 'next/navigation';
import 'react-phone-input-2/lib/style.css';
import { toast } from 'react-toastify';
import Flatpickr from 'react-flatpickr';
import * as yup from 'yup';
import { localToUtc, utcToLocal } from '../../../../../app/utils/date-util';
import {
  defaultImage,
  ToolTipIcon,
} from '../../../../../app/assests/icons/icons';
import Modal from '../../../../../common/components/Modal';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Select from 'react-select';
import { getOfferings } from '../../../../../app/api/offerings/offerings';

function AddStakeholder(props: any) {
  const [isCancelHovered, setIsCancelHovered] = useState(false);
  const [disabledButton, setDisabledButton] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [isCheckedForWk, setIsCheckedForWk] = useState(false);
  const [phone, setPhone] = useState('');
  const [profileImage, setProfileImage] = useState<any>(null);
  const [anniversaryDate, setAnniversaryDate] = useState<any>(null);
  const [dobDate, setDobDate] = useState<any>(null);
  const [fileSizeError, setFileSizeError] = useState<boolean>(false);
  const { id } = useParams();

  const addStakeholder = useAddStakeholder();
  const updateStakeHolder = useUpdateStakeholder();
  const queryClient = useQueryClient();
  const { data: offeringsData } = useQuery({
    queryKey: ['offerings'],
    queryFn: getOfferings,
    refetchOnWindowFocus: false,
  });

  const offeringOptions = (offeringsData ?? []).map((offering: any) => ({
    label: offering?.offering_name,
    value: offering?._id,
  }));
  const schema = yup.object({
    name: yup.string().required('Please enter name'),
    designation: yup.string(),
    email: yup.string().required('Please enter email address'),
    // support_level: yup?.string(),
    offerings: yup.array().of(yup.string()).default([]),
    linkedin_url: yup?.string().url('Invalid URL'),
    x_url: yup?.string().url('Invalid URL'),
    dob: yup.string(),
    workAnniversary: yup.string(),
    crm_id: yup.string(),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    control,
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmitHandler = async (data: any) => {
    const personalEvents = [];
    const dob = dobDate ? dobDate : '';
    const workAnniversary = anniversaryDate ? anniversaryDate : '';
    const selectedOfferings: string[] = Array.isArray(data?.offerings)
      ? data.offerings
      : [];
    const { offerings, ...stakeholderData } = data;
    setDisabledButton(true);

    if (dob) {
      personalEvents.push({
        type: 'dob',
        name: 'Birthday!',
        description: `${data?.name} birthday`,
        date: dob,
        created_at: new Date(),
      });
    }

    if (workAnniversary) {
      personalEvents.push({
        type: 'work_anniversary',
        name: 'Work Anniversary!',
        description: `${data?.name} work anniversary`,
        date: workAnniversary,
        created_at: new Date(),
      });
    }
    const payload = {
      ...stakeholderData,
      customer_id: id,
      phone: phone,
      picture_base64: profileImage?.includes('data:image/jpeg;base64')
        ? profileImage?.replace(/^data:image\/jpeg;base64,/, '')
        : '',
      personal_events: personalEvents,
      offering_ids: selectedOfferings,
    };
    try {
      if (!props?.editData) {
        const res = await addStakeholder?.mutateAsync(payload);
        if (res?.status == 200 || res?.status == 201) {
          toast?.success('Stakeholder added successfully.');
          setDisabledButton(false);
          queryClient.invalidateQueries({
            queryKey: ['allCustomersStakeholders', 'getstakeholder'],
          });
        }
      } else {
        payload.stakeholder_id = props?.editData?._id;
        const res = await updateStakeHolder?.mutateAsync(payload);
        if (res?.status == 200 || res?.status == 201) {
          toast?.success('Stakeholder updated successfully.');
          setDisabledButton(false);
          queryClient.invalidateQueries({
            queryKey: ['allCustomersStakeholders', 'getstakeholder'],
          });
        }
      }
    } catch (err: any) {
      toast?.error(err?.response?.data?.message);
      setDisabledButton(false);
    }

    props?.setAddStakeholderForm(false);
    reset();
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsChecked(e.target.checked);
  };

  const handleCheckboxChangeWk = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsCheckedForWk(e.target.checked);
  };

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
      setProfileImage(reader.result as string);
    };

    reader.onerror = (error) => {
      console.error('File reading error:', error);
    };

    reader.readAsDataURL(file);
  };

  function getInitials(name: string): string {
    const nameArray = name?.trim()?.split(' ');
    const initials = nameArray?.map((word) => word[0]?.toUpperCase());
    return initials?.join('');
  }

  useEffect(() => {
    if (props?.editData) {
      setValue('name', props?.editData?.name);
      setValue('designation', props?.editData?.designation);
      setValue('crm_id', props?.editData?.crm_id);
      setValue('linkedin_url', props?.editData?.linkedin_url);
      setValue('x_url', props?.editData?.x_url);
      setValue('email', props?.editData?.email);
      // setValue('support_level', props?.editData?.support_level);
      setPhone(props?.editData?.phone ?? '');
      setProfileImage(
        `/api/app-service/v1/picture/customer_stakeholder_master/${
          props?.editData?._id
        }?org_id=${localStorage?.getItem('org_id')}&initials=${getInitials(
          props?.editData?.name
        )}&ts=${props?.editData?.updated_at}`
      );
      props?.editData?.personal_events?.map((ele: any) => {
        if (ele?.type == 'dob') {
          setDobDate(new Date(ele?.date));
        } else if (ele?.type == 'work_anniversary') {
          setAnniversaryDate(new Date(ele?.date));
        } else {
          //
        }
      });
      const selectedOfferings = (props?.editData?.offerings || [])
        .map((offering: any) =>
          typeof offering === 'string' ? offering : offering?._id
        )
        .filter(Boolean);
      setValue('offerings', selectedOfferings);
    } else {
      reset();
      setPhone('');
      setProfileImage(null);
      setValue('offerings', []);
    }
  }, [props?.editData]);

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
    <form className="p-2" onSubmit={handleSubmit(onSubmitHandler)}>
      <Modal
        show={props?.addStakeholderForm}
        onHide={() => props?.setAddStakeholderForm(false)}
        id="defaultModal"
        modal-center="true"
        className="fixed flex flex-col transition-all duration-300 ease-in-out left-2/4 z-drawer -translate-x-2/4 -translate-y-2/4"
        dialogClassName="w-screen md:w-[614px] overflow-hidden bg-white shadow rounded-[12px] dark:bg-zink-600"
      >
        <Modal.Body className="custom-modal-body scroll max-h-[calc(theme('height.screen')_-_190px)] py-5 pl-5 overflow-y-auto">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <img
                src={profileImage ? profileImage : defaultImage}
                alt="Profile"
                className={`rounded-full w-24 h-24 object-cover ${
                  !profileImage ? 'border border-gray-300' : ''
                } `}
              />

              <label
                htmlFor="uploadInput"
                className="absolute bottom-0 right-0 bg-[#3B82F6] p-2 rounded-full cursor-pointer"
              >
                {/* <Pencil className="text-white h-4 w-4" /> */}
                <ToolTipIcon />
              </label>

              <input
                type="file"
                id="uploadInput"
                accept=".jpeg,.jpg"
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>
            <span className="text-red-500 text-xs mt-[10px] ">
              {!fileSizeError ? ' ' : 'File size should not exceed 1 MB.'}{' '}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[16px]  text-[#637083]">Name</label>
              <input
                {...register('name')}
                type="text"
                name="name"
                autoFocus
                placeholder="Enter name"
                className="mt-[10px] block w-full border border-gray-200 focus:border-gray-500 rounded-md shadow-sm py-1 px-2 outline-none"
              />
              <p className="text-start text-xs text-red-500 font-semibold pt-1">
                {errors.name?.message}
              </p>
            </div>
            <div>
              <label className="block text-[16px]  text-[#637083]">
                Designation
              </label>
              <input
                {...register('designation')}
                type="text"
                name="designation"
                placeholder="Enter designation"
                className="mt-[10px] block w-full border border-gray-200 rounded-md shadow-sm py-1 px-2 outline-none focus:border-gray-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-[16px]  text-[#637083]">
                Email ID
              </label>
              <input
                {...register('email')}
                type="email"
                name="email"
                placeholder="Enter email"
                className="mt-[10px] block w-full border border-gray-200 rounded-md shadow-sm py-1 px-2 outline-none focus:border-gray-500"
              />
              <p className="text-start text-xs text-red-500 font-semibold pt-1">
                {errors.email?.message}
              </p>
            </div>
            <div>
              <label className="block text-[16px]  text-[#637083] mb-[10px] ">
                Phone Number
              </label>
              <PhoneInput
                country={'in'}
                value={phone}
                onChange={(
                  value: any,
                  country: any,
                  e: any,
                  formattedValue: any
                ) => setPhone(formattedValue)}
                inputClass="mt-[10px] block !w-full border !border-gray-200 !rounded-md !shadow-sm p-1.5"
                inputProps={{
                  name: 'phone',
                  required: true,
                  // autoFocus: true,
                }}
                disableDropdown={false}
                countryCodeEditable={false}
              />
            </div>
          </div>
          {/* <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-[16px]  text-[#637083]">
                Support Level
              </label>
              <div className=" mt-[10px] pl-1 pr-2 py-[5px] border border-[#E4E7EC] rounded-md shadow-sm flex items-center">
                <select
                  {...register('support_level')}
                  name="support_level"
                  className=" bg-white block border-[#E4E7EC] w-full border-none outline-none focus:border-gray-500 "
                >
                  <option value="" hidden className="text-[#637083]">
                    Select support level
                  </option>
                  <option value="">None</option>
                  <option value="Strong Promoter">Strong Promoter</option>
                  <option value="Promoter">Promoter</option>
                  <option value="Neutral">Neutral</option>
                  <option value="Detractor">Detractor</option>
                  <option value="Strong Detractor">Strong Detractor</option>
                </select>
              </div>
            </div>
          </div> */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-[16px]  text-[#637083]">
                Offering
              </label>
              <div className="mt-[10px]">
                <Controller
                  name="offerings"
                  control={control}
                  defaultValue={[]}
                  render={({ field }) => (
                    <Select
                      {...field}
                      isMulti
                      isClearable
                      options={offeringOptions}
                      placeholder="Select offering(s)"
                      className="text-[14px]"
                      onChange={(selected) =>
                        field.onChange(
                          selected
                            ? selected.map((option: any) => option.value)
                            : []
                        )
                      }
                      value={offeringOptions.filter((option: any) =>
                        (field.value ?? []).includes(option.value)
                      )}
                      menuPlacement="auto"
                    />
                  )}
                />
              </div>
            </div>
            <div>
              <div>
                <label className="block text-[16px]  text-[#637083]">
                  <span className="mr-2">Birth Date</span>
                  {/* <label className="inline-flex items-center  float-end">
                <input
                  type="checkbox"
                  className="form-checkbox"
                  checked={isChecked}
                  onChange={handleCheckboxChange}
                />
                <span className="ml-1 text-[10px] font-medium text-gray-700">
                  Don't know year?jh
                </span>
              </label> */}
                </label>
                <Flatpickr
                  options={{
                    dateFormat: !isChecked ? 'M d, Y' : 'd F', // Toggle between formats
                  }}
                  onChange={(value: any) => setDobDate(localToUtc(value[0]))}
                  name="dob"
                  value={dobDate}
                  placeholder={`${!isChecked ? 'MMM DD, YYYY' : 'DD MMM'}`}
                  className="form-input border-slate-200 dark:border-zinc-500 !py-[0.332rem] mt-[10px] focus:outline-none focus:border-gray-500 disabled:bg-slate-100 dark:disabled:bg-zinc-600 disabled:border-slate-300 dark:disabled:border-zinc-500 dark:disabled:text-zinc-200 disabled:text-slate-500 dark:text-zinc-100 dark:bg-zinc-700 dark:focus:border-custom-800 placeholder:text-slate-400 dark:placeholder:text-zinc-200"
                />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <div>
                <label className="block text-[16px]  text-[#637083]">
                  <span className="mr-2">Work Anniversary on</span>
                  {/* <label className="inline-flex items-center float-end">
                <input
                  type="checkbox"
                  className="form-checkbox"
                  checked={isCheckedForWk}
                  onChange={handleCheckboxChangeWk}
                />
                <span className="ml-1 text-[10px] font-medium text-gray-700">
                  Don't know year?
                </span>
              </label> */}
                </label>
                <Flatpickr
                  options={{
                    dateFormat: !isCheckedForWk ? 'M d, Y' : 'd F', // Toggle between formats
                  }}
                  onChange={(value: any) =>
                    setAnniversaryDate(localToUtc(value[0]))
                  }
                  name="workAnniversary"
                  value={anniversaryDate}
                  placeholder={`${!isCheckedForWk ? 'MMM DD, YYYY' : 'DD MMM'}`}
                  className="form-input border-slate-200 dark:border-zinc-500 !py-[0.332rem] mt-[10px] focus:outline-none focus:border-gray-500 disabled:bg-slate-100 dark:disabled:bg-zinc-600 disabled:border-slate-300 dark:disabled:border-zinc-500 dark:disabled:text-zinc-200 disabled:text-slate-500 dark:text-zinc-100 dark:bg-zinc-700 dark:focus:border-custom-800 placeholder:text-slate-400 dark:placeholder:text-zinc-200"
                />
              </div>
            </div>
            <div>
              <label className="block text-[16px]  text-[#637083]">
                LinkedIn Handle
              </label>
              <div className="relative mt-[10px]">
                <input
                  {...register('linkedin_url')}
                  type="url"
                  name="linkedin_url"
                  placeholder="Enter linkedin URL"
                  className="block w-full border border-gray-200 rounded-md shadow-sm py-1 px-2 outline-none focus:border-gray-500 pr-10"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg
                    width="16"
                    height="8"
                    viewBox="0 0 16 8"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M4 8C2.89333 8 1.95 7.60951 1.17 6.82854C0.39 6.04771 0 5.10326 0 3.99521C0 2.88729 0.39 1.94444 1.17 1.16667C1.95 0.388889 2.89333 0 4 0H6.25C6.4625 0 6.64062 0.0714579 6.78438 0.214375C6.92813 0.357291 7 0.534375 7 0.745625C7 0.956875 6.92813 1.13542 6.78438 1.28125C6.64062 1.42708 6.4625 1.5 6.25 1.5H4C3.30556 1.5 2.71528 1.74306 2.22917 2.22917C1.74306 2.71528 1.5 3.30556 1.5 4C1.5 4.69444 1.74306 5.28472 2.22917 5.77083C2.71528 6.25694 3.30556 6.5 4 6.5H6.25C6.4625 6.5 6.64062 6.57146 6.78438 6.71438C6.92813 6.85729 7 7.03438 7 7.24563C7 7.45688 6.92813 7.63542 6.78438 7.78125C6.64062 7.92708 6.4625 8 6.25 8H4ZM5.75583 4.75C5.54361 4.75 5.36458 4.67854 5.21875 4.53562C5.07292 4.39271 5 4.21562 5 4.00437C5 3.79312 5.07181 3.61458 5.21542 3.46875C5.35903 3.32292 5.53694 3.25 5.74917 3.25H10.2442C10.4564 3.25 10.6354 3.32146 10.7812 3.46438C10.9271 3.60729 11 3.78438 11 3.99563C11 4.20688 10.9282 4.38542 10.7846 4.53125C10.641 4.67708 10.4631 4.75 10.2508 4.75H5.75583ZM9.75 8C9.5375 8 9.35938 7.92854 9.21562 7.78562C9.07187 7.64271 9 7.46562 9 7.25437C9 7.04313 9.07187 6.86458 9.21562 6.71875C9.35938 6.57292 9.5375 6.5 9.75 6.5H12C12.6944 6.5 13.2847 6.25694 13.7708 5.77083C14.2569 5.28472 14.5 4.69444 14.5 4C14.5 3.30556 14.2569 2.71528 13.7708 2.22917C13.2847 1.74306 12.6944 1.5 12 1.5H9.75C9.5375 1.5 9.35938 1.42854 9.21562 1.28563C9.07187 1.14271 9 0.965625 9 0.754375C9 0.543125 9.07187 0.364583 9.21562 0.21875C9.35938 0.0729167 9.5375 0 9.75 0H12C13.1067 0 14.05 0.390486 14.83 1.17146C15.61 1.95229 16 2.89674 16 4.00479C16 5.11271 15.61 6.05556 14.83 6.83333C14.05 7.61111 13.1067 8 12 8H9.75Z"
                      fill="#141C24"
                    />
                  </svg>
                </div>
              </div>
              <p className="text-start text-xs text-red-500 font-semibold pt-1">
                {errors.linkedin_url?.message}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-[16px]  text-[#637083]">
                X Handle
              </label>
              <div className="relative mt-[10px]">
                <input
                  {...register('x_url')}
                  type="url"
                  name="x_url"
                  placeholder="Enter X URL"
                  className="block w-full border border-gray-200 rounded-md shadow-sm py-1 px-2 outline-none focus:border-gray-500 pr-10"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg
                    width="16"
                    height="8"
                    viewBox="0 0 16 8"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M4 8C2.89333 8 1.95 7.60951 1.17 6.82854C0.39 6.04771 0 5.10326 0 3.99521C0 2.88729 0.39 1.94444 1.17 1.16667C1.95 0.388889 2.89333 0 4 0H6.25C6.4625 0 6.64062 0.0714579 6.78438 0.214375C6.92813 0.357291 7 0.534375 7 0.745625C7 0.956875 6.92813 1.13542 6.78438 1.28125C6.64062 1.42708 6.4625 1.5 6.25 1.5H4C3.30556 1.5 2.71528 1.74306 2.22917 2.22917C1.74306 2.71528 1.5 3.30556 1.5 4C1.5 4.69444 1.74306 5.28472 2.22917 5.77083C2.71528 6.25694 3.30556 6.5 4 6.5H6.25C6.4625 6.5 6.64062 6.57146 6.78438 6.71438C6.92813 6.85729 7 7.03438 7 7.24563C7 7.45688 6.92813 7.63542 6.78438 7.78125C6.64062 7.92708 6.4625 8 6.25 8H4ZM5.75583 4.75C5.54361 4.75 5.36458 4.67854 5.21875 4.53562C5.07292 4.39271 5 4.21562 5 4.00437C5 3.79312 5.07181 3.61458 5.21542 3.46875C5.35903 3.32292 5.53694 3.25 5.74917 3.25H10.2442C10.4564 3.25 10.6354 3.32146 10.7812 3.46438C10.9271 3.60729 11 3.78438 11 3.99563C11 4.20688 10.9282 4.38542 10.7846 4.53125C10.641 4.67708 10.4631 4.75 10.2508 4.75H5.75583ZM9.75 8C9.5375 8 9.35938 7.92854 9.21562 7.78562C9.07187 7.64271 9 7.46562 9 7.25437C9 7.04313 9.07187 6.86458 9.21562 6.71875C9.35938 6.57292 9.5375 6.5 9.75 6.5H12C12.6944 6.5 13.2847 6.25694 13.7708 5.77083C14.2569 5.28472 14.5 4.69444 14.5 4C14.5 3.30556 14.2569 2.71528 13.7708 2.22917C13.2847 1.74306 12.6944 1.5 12 1.5H9.75C9.5375 1.5 9.35938 1.42854 9.21562 1.28563C9.07187 1.14271 9 0.965625 9 0.754375C9 0.543125 9.07187 0.364583 9.21562 0.21875C9.35938 0.0729167 9.5375 0 9.75 0H12C13.1067 0 14.05 0.390486 14.83 1.17146C15.61 1.95229 16 2.89674 16 4.00479C16 5.11271 15.61 6.05556 14.83 6.83333C14.05 7.61111 13.1067 8 12 8H9.75Z"
                      fill="#141C24"
                    />
                  </svg>
                </div>
              </div>
              <p className="text-start text-xs text-red-500 font-semibold pt-1">
                {errors.x_url?.message}
              </p>
            </div>
            <div>
              <label className="block text-[16px]  text-[#637083]">
                CRM ID
              </label>
              <input
                {...register('crm_id')}
                type="text"
                name="crm_id"
                placeholder="Enter CRM ID"
                className="mt-[10px] block w-full border border-gray-200 rounded-md shadow-sm py-1 px-2 outline-none focus:border-gray-500"
              />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className="flex justify-end p-5 gap-2 border-t border-[#E4E7EC]">
          <button
            type="button"
            onMouseEnter={() => setIsCancelHovered(true)}
            onMouseLeave={() => setIsCancelHovered(false)}
            onClick={() => {
              props?.setAddStakeholderForm(false);
              reset();
            }}
            className={`btn border-gray-500 bg-white text-gray-500`}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={disabledButton}
            className={`btn border-custom-500  ${'bg-custom-600 text-white'} disabled:opacity-50`}
          >
            Done
          </button>
        </Modal.Footer>
      </Modal>
    </form>
  );
}

export default AddStakeholder;
