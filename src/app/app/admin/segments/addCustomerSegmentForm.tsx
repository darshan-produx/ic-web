import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useQuery } from '@tanstack/react-query';
import { X as CloseIcon } from 'lucide-react';
import { toast } from 'react-toastify';
import {
  useAddCustomerSegment,
  useEditCustomerSegment,
} from '../../../../services/mutations/customerSegmentMutations';

const schema = yup.object({
  segment_name: yup.string().required('Please enter segment name'),
  description: yup.string(),
});

export default function AddCustomerSegmentForm(props: any) {
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

  const AddCustomerSegmentData = useAddCustomerSegment();
  const updateCustomerSegmentData = useEditCustomerSegment();

  const onSubmitHandler = async (data: any) => {
    try {
      if (String(getValues('segment_name')).trim() !== '') {
        data.segment_name = String(getValues('segment_name')).trim();
        data.description = String(getValues('description')).trim();
        if (props?.editData) {
          const customerSegmentData = {
            segment_name: data.segment_name,
            description: data.description,
            id: props?.editData?._id,
          };
          const res = await updateCustomerSegmentData.mutateAsync(
            customerSegmentData
          );
          toast.success('Customer Segment updated successfully');
          reset();
          props?.setOpenAddCustomerSegmentForm(false);
        } else {
          const customerSegmentData = {
            segment_name: data.segment_name,
            description: data.description,
          };
          const res = await AddCustomerSegmentData.mutateAsync(
            customerSegmentData
          );
          toast.success('Customer Segment added successfully');
          reset();
          props?.setOpenAddCustomerSegmentForm(false);
        }
      } else {
        toast.error('please enter valid information');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message);
    }
  };

  useEffect(() => {
    if (props.editData) {
      clearErrors();
      setValue('segment_name', props?.editData?.segment_name);
      setValue('description', props?.editData?.description);
    } else {
      reset();
    }
  }, [props?.editData, reset]);

  return (
    <div>
      <div className="">
        <div className="flex justify-between mx-4">
          <div className="block">
            <h6 className="font-semibold text-[24px] text-black">
              {'customer segment'}
            </h6>
            <p className="font-normal my-1 text-[16px] tracking-normal leading-5 text-[#cccccc] ">
              {!props?.editData
                ? 'Enter all of the required information to add a new customer segment to the platform.'
                : ``}
            </p>
          </div>
          <div
            className="mt-1 cursor-pointer"
            onClick={() => {
              props?.setOpenAddCustomerSegmentForm(false);
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
                      Segment name
                      <span className="text-red-600 font-medium ml-[1px]">
                        *
                      </span>
                    </span>
                    <input
                      {...register('segment_name')}
                      type="text"
                      name="segment_name"
                      id="segment_name"
                      className="form-input border-slate-200 dark:border-zink-500 focus:outline-none focus:border-custom-500 disabled:bg-slate-100 dark:disabled:bg-zink-600 disabled:border-slate-300 dark:disabled:border-zink-500 dark:disabled:text-zink-200 disabled:text-slate-500 dark:text-zink-100 dark:bg-zink-700 dark:focus:border-custom-800 placeholder:text-slate-400 dark:placeholder:text-zink-200"
                      placeholder="Enter segment name"
                    />
                    <p className="text-start text-xs text-red-500 font-semibold pt-1">
                      {errors.segment_name?.message}
                    </p>
                  </div>
                  <div className="mx-2">
                    <span className="inline-block mb-2 text-base font-medium">
                      Description
                      <span className="text-red-600 font-medium ml-[1px]">
                        *
                      </span>
                    </span>
                    <textarea
                      {...register('description')}
                      name="description"
                      id="description"
                      className={
                        'form-input border-slate-200 dark:border-zink-500 focus:outline-none focus:border-custom-500 disabled:bg-slate-100 dark:disabled:bg-zink-600 disabled:border-slate-300 dark:disabled:border-zink-500 dark:disabled:text-zink-200 disabled:text-slate-500 dark:text-zink-100 dark:bg-zink-700 dark:focus:border-custom-800 placeholder:text-slate-400 dark:placeholder:text-zink-200'
                      }
                      placeholder="Enter description"
                    />
                    <p className="text-start text-xs text-red-500 font-semibold pt-1">
                      {errors.description?.message}
                    </p>
                  </div>
                  <div></div>
                </div>
              </div>
              <div className="grid grid-cols-2 mt-5">
                <div className="mx-3">
                  <button
                    id="cancel_button"
                    title="Click to cancel"
                    onClick={() => {
                      props?.setOpenAddCustomerSegmentForm(false);
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
                    id="create_customer_segment"
                    title={
                      !props?.editData
                        ? 'Click to add new customer segment information'
                        : 'Click to save customer segment information'
                    }
                    type="submit"
                    disabled={isSubmitting}
                    className={`text-white bg-[#4AA8FE]  hover:bg-[#4AA8FE]/75 font-medium rounded-lg text-sm px-8 py-2 text-center h-9 w-full items-center  me-2 mb-2 ${
                      props?.editData ? 'px-6' : 'px-4'
                    } ${isSubmitting ? 'cursor-not-allowed' : ''}`}
                  >
                    {props?.editData ? 'Save' : 'Add'}
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
