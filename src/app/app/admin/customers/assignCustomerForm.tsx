import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useQuery } from '@tanstack/react-query';
import { X as CloseIcon } from 'lucide-react';
import { toast } from 'react-toastify';
import Select from 'react-select';
import { useAssignCustomer } from '../../../services/mutations/customersMutations';
import { getUsers } from '../../../api/users/users';
import { getCustomerSegments } from '../../../api/segments/segments';

const schema = yup.object({
  segment_id: yup.string().required('Please select a segment'),
  // user_ids is now an array for multi-select
  user_ids: yup
    .array()
    .of(yup.string())
    .min(1, 'Please select a user')
    .required('Please select a user'),
});

export default function AssignCustomerForm(props: any) {
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
    defaultValues: {
      user_ids: [], // default empty array for multi-select
      segment_id: '',
    },
  });

  const updateCustomerData = useAssignCustomer();

  const onSubmitHandler = async (data: any) => {
    try {
      const segmentVal = String(getValues('segment_id')).trim();
      const userVal = getValues('user_ids');

      const hasValidSegment = segmentVal !== '';
      const hasValidUser = Array.isArray(userVal)
        ? userVal.length > 0
        : String(userVal).trim() !== '';

      if (hasValidSegment && hasValidUser) {
        // normalize to array of strings
        const normalizedUserIds = Array.isArray(userVal)
          ? userVal.map((v: any) => String(v))
          : [String(userVal).trim()];

        data.segment_id = segmentVal;
        data.user_ids = normalizedUserIds;

        if (props?.editData) {
          const customerData = {
            // make sure user_ids is always an array
            user_ids: Array.isArray(data.user_ids)
              ? data.user_ids
              : [data.user_ids],
            segment_id: data.segment_id,
            id: props?.editData?.customer_id,
          };
          const res = await updateCustomerData.mutateAsync(customerData);
          toast.success('Customer updated successfully');
          reset();
          props?.setOpenAssignCustomerForm(false);
        }
      } else {
        toast.error('Please enter valid information');
      }
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const { data: existingUsers } = useQuery({
    queryKey: ['getAllusers'],
    queryFn: getUsers,
  });
  const existingUsersArr = existingUsers?.data?.data
    ?.map((ele: any) => {
      return ele.is_active
        ? {
            label: `${ele?.user.first_name} ${ele?.user.last_name}`,
            value: ele?.user._id,
          }
        : null;
    })
    .filter((ele: any) => ele !== null);
  const { data: allCustomerSegments } = useQuery({
    queryKey: ['getAllCustomerSegments'],
    queryFn: getCustomerSegments,
  });

  const allCustomerSegmentsArr = allCustomerSegments?.data?.data?.map(
    (ele: any) => ({
      label: ele?.segment_name,
      value: ele?._id,
    })
  );

  useEffect(() => {
    if (props.editData) {
      clearErrors();
      setValue('segment_id', props?.editData?.segment?.segment_id);
      // ensure user_ids is set as an array for multi-select
      const initialUsers =
        Array.isArray(props?.editData?.users) &&
        props?.editData?.users.length > 0
          ? props?.editData?.users.map((user: any) => user._id)
          : [];
      setValue('user_ids', initialUsers);
    } else {
      reset();
    }
  }, [props?.editData, reset]);

  const filterOptions = (option: any, inputValue: any) => {
    return option.label.toLowerCase().includes(inputValue.toLowerCase());
  };

  return (
    <div>
      <div className="">
        <div className="flex justify-between mx-4">
          <div className="block">
            <h6 className="font-semibold text-[24px] text-black">
              {props?.editData ? 'Assign Customer' : ''}
            </h6>
          </div>
          <div
            className="mt-1 cursor-pointer"
            onClick={() => props?.setOpenAssignCustomerForm(false)}
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
                      Customer Name
                      <span className="text-red-600 font-medium ml-[1px]">
                        *
                      </span>
                    </span>
                    <p>{props?.editData?.customer_name}</p>
                  </div>
                  <div></div>
                </div>
                <div className="grid grid-cols-[6fr_4fr] py-2">
                  <div className="mx-2">
                    <span className="inline-block mb-2 text-base font-medium">
                      Assign user
                      <span className="text-red-600 font-medium ml-[1px]">
                        *
                      </span>
                    </span>
                    <Controller
                      name="user_ids"
                      control={control}
                      defaultValue={[]}
                      render={({ field }) => (
                        <Select
                          {...field}
                          isMulti
                          menuPortalTarget={document.body}
                          styles={{
                            menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                          }}
                          className="z-60 border-slate-100 dark:border-zinc-500 focus:outline-none focus:border-custom-500 disabled:bg-slate-100 dark:disabled:bg-zinc-600 disabled:border-slate-300 dark:disabled:border-zinc-500 dark:disabled:text-zinc-200 disabled:text-slate-500 dark:text-zinc-100 dark:bg-zinc-700 dark:focus:border-custom-800 placeholder:text-slate-400 dark:placeholder:text-zinc-200"
                          id="choices-remove-button"
                          isClearable={false}
                          closeMenuOnSelect={false}
                          options={existingUsersArr}
                          // field.onChange should be passed an array of values (ids)
                          onChange={(selected) =>
                            field.onChange(
                              selected ? selected.map((s: any) => s.value) : []
                            )
                          }
                          // for isMulti, value must be array of option objects
                          value={
                            Array.isArray(field.value)
                              ? existingUsersArr?.filter((user: any) =>
                                  field.value.includes(user?.value)
                                )
                              : []
                          }
                          filterOption={filterOptions}
                        />
                      )}
                    />
                    <p className="text-start text-xs text-red-500 font-semibold pt-1">
                      {errors.user_ids?.message}
                    </p>
                  </div>
                  <div className="mx-2">
                    <span className="inline-block mb-2 text-base font-medium">
                      Customer segment
                      <span className="text-red-600 font-medium ml-[1px]">
                        *
                      </span>
                    </span>
                    <Controller
                      name="segment_id"
                      control={control}
                      defaultValue=""
                      render={({ field }) => (
                        <Select
                          {...field}
                          styles={{
                            menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                          }}
                          menuPortalTarget={document.body}
                          className="z-60 border-slate-100 dark:border-zinc-500 focus:outline-none focus:border-custom-500 disabled:bg-slate-100 dark:disabled:bg-zinc-600 disabled:border-slate-300 dark:disabled:border-zinc-500 dark:disabled:text-zinc-200 disabled:text-slate-500 dark:text-zinc-100 dark:bg-zinc-700 dark:focus:border-custom-800 placeholder:text-slate-400 dark:placeholder:text-zinc-200"
                          id="choices-remove-button"
                          isClearable
                          options={allCustomerSegmentsArr}
                          onChange={(selected) =>
                            field.onChange(selected?.value)
                          }
                          value={allCustomerSegmentsArr?.find(
                            (segment: any) => segment.value === field.value
                          )}
                          filterOption={filterOptions}
                        />
                      )}
                    />
                    <p className="text-start text-xs text-red-500 font-semibold pt-1">
                      {errors.segment_id?.message}
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 mt-5">
                <div className="mx-3">
                  <button
                    id="cancel_button"
                    title="Click to cancel"
                    onClick={() => {
                      props?.setOpenAssignCustomerForm(false);
                    }}
                    className={`text-black bg-transparent border-[#4AA8FE] border-[1px] hover:border-[#4AA8FE]/75 font-medium rounded-lg text-sm px-10 py-2 text-center h-9 w-full items-center me-2 mb-2 ${
                      props?.editData ? 'px-6' : 'px-4'
                    }`}
                  >
                    Cancel
                  </button>
                </div>
                <div className="mx-3">
                  <button
                    id="create_user"
                    title={
                      !props?.editData
                        ? 'Click to add new user information'
                        : ''
                    }
                    type="submit"
                    disabled={isSubmitting}
                    className={`text-white bg-[#4AA8FE] hover:bg-[#4AA8FE]/75 font-medium rounded-lg text-sm px-8 py-2 text-center h-9 w-full items-center me-2 mb-2 ${
                      props?.editData ? 'px-6' : 'px-4'
                    } ${isSubmitting ? 'cursor-not-allowed' : ''}`}
                  >
                    {props?.editData ? 'Save' : ''}
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
