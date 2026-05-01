import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { emailRegEx } from '../../../utils/constant';
import { X as CloseIcon } from 'lucide-react';
import { toast } from 'react-toastify';
import {
  useAddUser,
  useEditUser,
} from '../../../../services/mutations/usersMutations';
import Select from 'react-select';
import AsyncSelect from 'react-select/async';
import { useQuery } from '@tanstack/react-query';
import { getOfferings } from '../../../api/offerings/offerings';

const schema = yup.object({
  firstName: yup
    .string()
    .max(20, 'First name should not exceed 20 characters.')
    .required('Please enter first name'),
  lastName: yup
    .string()
    .max(20, 'Last name should not exceed 20 characters.')
    .required('Please enter last name'),
  email: yup.string().required('Please enter email address'),
  role: yup
    .array()
    .of(yup.string())
    .min(1, 'Please select at least one role')
    .required('Please select role'),
  supervisors: yup.array().of(yup.string()).default([]),
  offerings: yup.array().of(yup.string()).default([]),
});

export default function AddUserForm(props: any) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    control,
    reset,
    getValues,
    setError,
    clearErrors,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const rolesArr = props?.roles?.data?.data?.map((ele: any) => {
    return { label: ele?.name, value: ele?._id };
  });
  const supervisorArr = props?.existingUsers
    ?.map((ele: any) => {
      return ele.user?._id
        ? {
            label: ele.user?.first_name + ' ' + ele.user?.last_name,
            value: ele.user?._id,
          }
        : {};
    })
    ?.filter((item: any) => Object.keys(item).length != 0);
  const addUserData = useAddUser();
  const updateUserData = useEditUser();

  const { data: offeringsData } = useQuery({
    queryKey: ['offerings'],
    queryFn: getOfferings,
    refetchOnWindowFocus: false,
  });

  const offeringOptions = (offeringsData ?? []).map((offering: any) => ({
    label: offering?.offering_name,
    value: offering?._id,
  }));

  const onSubmitHandler = async (data: any) => {
    if (!emailRegEx.test(data.email)) {
      setError('email', {
        type: 'manual',
        message: 'Please enter valid email address',
      });
    } else {
      try {
        if (
          String(getValues('firstName')).trim() !== '' &&
          String(getValues('lastName')).trim() !== '' &&
          String(getValues('email')).trim() !== ''
        ) {
          data.firstName = String(getValues('firstName')).trim();
          data.lastName = String(getValues('lastName')).trim();
          data.email = String(getValues('email')).trim();
          const selectedOfferings: string[] = Array.isArray(data?.offerings)
            ? data.offerings
            : [];

          if (props?.editData && props?.approveUser != 'Approve') {
            const userData = {
              user: {
                first_name: data.firstName,
                last_name: data.lastName,
              },
              role_ids: data.role,
              supervisor_ids: data.supervisors || [],
              offering_ids: selectedOfferings,
              id: props?.editData?.user?._id,
            };
            await updateUserData.mutateAsync(userData);
            toast.success('User updated successfully');
            reset();
            props?.setOpenAddUserFrom(false);
          } else {
            const userData = {
              user: {
                first_name: data.firstName,
                last_name: data.lastName,
                email: data.email,
              },
              role_ids: data.role,
              supervisor_ids: data.supervisors || [],
              offering_ids: selectedOfferings,
            };

            await addUserData.mutateAsync(userData);

            const filterExistingUser = await props.existingUsers.filter(
              (ele: any) => ele?.user?.email == data.email
            );
            if (filterExistingUser?.length > 0) {
              toast.success('Existing user activated successfully');
            } else if (
              filterExistingUser?.length == 0 &&
              props?.approveUser != 'Approve'
            ) {
              toast.success('User added successfully');
            } else if (
              filterExistingUser?.length == 0 &&
              props?.approveUser == 'Approve'
            ) {
              toast.success(
                'User added and pending request approved successfully'
              );
            }

            reset();
            props?.setOpenAddUserFrom(false);
          }
        } else {
          toast.error('please enter valid information');
        }
      } catch (err: any) {
        toast.error(err?.response?.data?.message);
      }
    }
  };

  useEffect(() => {
    if (props.editData) {
      clearErrors();
      setValue('email', props?.editData?.user?.email);
      setValue('firstName', props?.editData?.user?.first_name);
      setValue('lastName', props?.editData?.user?.last_name);

      if (props?.approveUser == 'Approve') {
        setValue('role', [
          rolesArr?.filter((ele: any) => ele?.label == 'USER')[0]?.value,
        ]);
      } else {
        setValue(
          'role',
          props?.editData?.roles?.map((ele: any) => ele?._id)
        );
      }

      setValue(
        'supervisors',
        props.editData?.supervisors && props.editData.supervisors.length > 0
          ? props.editData.supervisors.map((sup: any) => sup.supervisor_id)
          : []
      );
      const selectedOfferings = (
        props?.editData?.offerings ||
        props?.editData?.user?.offerings ||
        []
      )
        .map((offering: any) =>
          typeof offering === 'string' ? offering : offering?._id
        )
        .filter(Boolean);
      setValue('offerings', selectedOfferings);
    } else {
      reset();
    }
  }, [props?.editData, reset]);

  const fetchOptions = async (inputValue: any) => {
    if (inputValue.length < 3) {
      return [];
    }
    return supervisorArr?.filter((item: any) =>
      item.label.toLowerCase().includes(inputValue.toLowerCase())
    );
  };

  const loadOptions = (inputValue: any, callback: any) => {
    fetchOptions(inputValue).then((options: any) => callback(options));
  };

  return (
    <div>
      <div className="">
        <div className="flex justify-between mx-4">
          <div className="block">
            <h6 className="font-semibold text-[24px] text-black">
              {props?.approveUser != 'Approve'
                ? props?.editData
                  ? 'Edit  user'
                  : 'Add new user'
                : 'Approve user'}
            </h6>
            <p className="font-normal my-1 text-[16px] tracking-normal leading-5 text-slate-500 ">
              {!props?.editData
                ? 'Enter all of the required information to add a new user to the platform.'
                : ``}
            </p>
          </div>
          <div
            className="mt-1 cursor-pointer"
            onClick={() => {
              props?.setOpenAddUserFrom(false);
            }}
          >
            <CloseIcon />
          </div>
        </div>
        <div className="">
          <form onSubmit={handleSubmit(onSubmitHandler)}>
            <div className="rounded pt-3">
              <div className="m-2">
                <div className="grid grid-cols-2">
                  <div className="mx-2">
                    <span className="inline-block mb-2 text-base font-medium">
                      Email address
                      <span className="text-red-600 font-medium ml-[1px]">
                        *
                      </span>
                    </span>
                    <input
                      {...register('email')}
                      type="text"
                      name="email"
                      id="email"
                      className={
                        'form-input border-slate-200 dark:border-zink-500 focus:outline-none focus:border-custom-500 disabled:bg-slate-100 dark:disabled:bg-zink-600 disabled:border-slate-300 dark:disabled:border-zink-500 dark:disabled:text-zink-200 disabled:text-slate-500 dark:text-zink-100 dark:bg-zink-700 dark:focus:border-custom-800 placeholder:text-slate-400 dark:placeholder:text-zink-200'
                      }
                      placeholder="Enter email address"
                      disabled={props?.editData ? true : false}
                    />
                    <p className="text-start text-xs text-red-500 font-semibold pt-1">
                      {errors.email?.message}
                    </p>
                  </div>
                  <div></div>
                </div>

                <div className="grid grid-cols-2 py-2">
                  <div className="mx-2">
                    <span className="inline-block mb-2 text-base font-medium">
                      First name
                      <span className="text-red-600 font-medium ml-[1px]">
                        *
                      </span>
                    </span>
                    <input
                      {...register('firstName')}
                      type="text"
                      name="firstName"
                      id="firstName"
                      className="form-input border-slate-200 dark:border-zink-500 focus:outline-none focus:border-custom-500 disabled:bg-slate-100 dark:disabled:bg-zink-600 disabled:border-slate-300 dark:disabled:border-zink-500 dark:disabled:text-zink-200 disabled:text-slate-500 dark:text-zink-100 dark:bg-zink-700 dark:focus:border-custom-800 placeholder:text-slate-400 dark:placeholder:text-zink-200"
                      placeholder="Enter first name"
                    />
                    <p className="text-start text-xs text-red-500 font-semibold pt-1">
                      {errors.firstName?.message}
                    </p>
                  </div>
                  <div className="mx-2">
                    <span className="inline-block mb-2 text-base font-medium">
                      Last name
                      <span className="text-red-600 font-medium ml-[1px]">
                        *
                      </span>
                    </span>
                    <input
                      {...register('lastName')}
                      type="text"
                      name="lastName"
                      id="lastName"
                      className="form-input border-slate-200 dark:border-zink-500 focus:outline-none focus:border-custom-500 disabled:bg-slate-100 dark:disabled:bg-zink-600 disabled:border-slate-300 dark:disabled:border-zink-500 dark:disabled:text-zink-200 disabled:text-slate-500 dark:text-zink-100 dark:bg-zink-700 dark:focus:border-custom-800 placeholder:text-slate-400 dark:placeholder:text-zink-200"
                      placeholder="Enter last name"
                    />
                    <p className="text-start text-xs text-red-500 font-semibold pt-1">
                      {errors.lastName?.message}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 py-2 ">
                  <div className="mx-2">
                    <span className="inline-block mb-2 text-base font-medium">
                      Role
                      <span className="text-red-600 font-medium ml-[1px]">
                        *
                      </span>
                    </span>
                    <Controller
                      name="role"
                      control={control}
                      defaultValue={[]}
                      render={({ field }) => (
                        <Select
                          {...field}
                          className="border-slate-100 dark:border-zinc-500 focus:outline-none focus:border-custom-500 disabled:bg-slate-100 dark:disabled:bg-zinc-600 disabled:border-slate-300 dark:disabled:border-zinc-500 dark:disabled:text-zinc-200 disabled:text-slate-500 dark:text-zinc-100 dark:bg-zinc-700 dark:focus:border-custom-800 placeholder:text-slate-400 dark:placeholder:text-zinc-200 z-[9999]"
                          id="choices-multiple-remove-button"
                          placeholder="Select role"
                          isClearable
                          isMulti
                          options={rolesArr}
                          onChange={(selected) =>
                            field.onChange(
                              selected
                                ? selected?.map((option) => option?.value)
                                : []
                            )
                          }
                          value={field?.value?.map((value) =>
                            rolesArr?.find((role: any) => role?.value === value)
                          )}
                          menuPlacement="top"
                        />
                      )}
                    />
                    <p className="text-start text-xs text-red-500 font-semibold pt-1">
                      {errors.role?.message}
                    </p>
                  </div>
                  <div className="mx-2">
                    <span className="inline-block mb-2 text-base font-medium">
                      Supervisors
                    </span>
                    <Controller
                      name="supervisors"
                      control={control}
                      defaultValue={[]}
                      render={({ field }) => (
                        <AsyncSelect
                          {...field}
                          className="border-slate-100 dark:border-zinc-500 focus:outline-none focus:border-custom-500 disabled:bg-slate-100 dark:disabled:bg-zinc-600 disabled:border-slate-300 dark:disabled:border-zinc-500 dark:disabled:text-zinc-200 disabled:text-slate-500 dark:text-zinc-100 dark:bg-zinc-700 dark:focus:border-custom-800 placeholder:text-slate-400 dark:placeholder:text-zinc-200 z-[9999]"
                          id="choices-multiple-supervisors"
                          placeholder="Select supervisors"
                          loadOptions={loadOptions}
                          isClearable
                          isMulti
                          onChange={(selected) =>
                            field.onChange(
                              selected
                                ? selected.map((option: any) => option.value)
                                : []
                            )
                          }
                          value={
                            field.value
                              ? field.value.map((value: any) =>
                                  supervisorArr.find(
                                    (supervisor: any) =>
                                      supervisor.value === value
                                  )
                                )
                              : []
                          }
                          noOptionsMessage={({ inputValue }) =>
                            inputValue.length < 3
                              ? 'Type at least 3 characters to see options'
                              : 'No options'
                          }
                          menuPlacement="top"
                        />
                      )}
                    />

                    <p className="text-start text-xs text-red-500 font-semibold pt-1">
                      {errors.supervisors?.message}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 py-2">
                  <div className="mx-2">
                    <span className="inline-block mb-2 text-base font-medium">
                      Offering
                    </span>
                    <Controller
                      name="offerings"
                      control={control}
                      defaultValue={[]}
                      render={({ field }) => (
                        <Select
                          {...field}
                          className="border-slate-100 dark:border-zinc-500 focus:outline-none focus:border-custom-500 disabled:bg-slate-100 dark:disabled:bg-zinc-600 disabled:border-slate-300 dark:disabled:border-zinc-500 dark:disabled:text-zinc-200 disabled:text-slate-500 dark:text-zink-100 dark:bg-zink-700 dark:focus:border-custom-800 placeholder:text-slate-400 dark:placeholder:text-zink-200 z-[9999]"
                          id="choices-multiple-offerings"
                          placeholder="Select offering(s)"
                          isClearable
                          isMulti
                          options={offeringOptions}
                          onChange={(selected) =>
                            field.onChange(
                              selected
                                ? selected.map((option: any) => option.value)
                                : []
                            )
                          }
                          value={
                            field.value
                              ? field.value.map((value: any) =>
                                  offeringOptions.find(
                                    (offering: any) => offering.value === value
                                  )
                                )
                              : []
                          }
                          menuPlacement="top"
                        />
                      )}
                    />
                  </div>
                  <div className="mx-2"></div>
                </div>
              </div>
              <div className="grid grid-cols-2 mt-5">
                <div className="mx-3">
                  <button
                    id="cancel_button"
                    title="Click to cancel"
                    onClick={() => {
                      props?.setOpenAddUserFrom(false);
                    }}
                    className={`text-black bg-transparent border-[#4AA8FE] border-[1px] hover:border-[#4AA8FE]/75 font-medium rounded-lg text-sm px-10 py-2 text-center h-9 w-full items-center  me-2 mb-2 ${
                      props?.editData ? 'px-6' : 'px-4'
                    }`}
                  >
                    {'Cancel'}
                  </button>
                </div>
                <div className="mx-3">
                  <button
                    id="create_user"
                    title={
                      !props?.editData
                        ? 'Click to add new user information'
                        : 'Click to save user information'
                    }
                    type="submit"
                    disabled={isSubmitting}
                    className={`text-white bg-[#4AA8FE]  hover:bg-[#4AA8FE]/75 font-medium rounded-lg text-sm px-8 py-2 text-center h-9 w-full items-center  me-2 mb-2 ${
                      props?.editData ? 'px-6' : 'px-4'
                    } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {props?.approveUser != 'Approve'
                      ? props?.editData
                        ? 'Save'
                        : 'Add'
                      : 'Approve'}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
