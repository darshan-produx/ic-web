import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { toast } from 'react-toastify';
import Modal from '../../../../common/components/Modal';

const schema = yup.object({
  nps_target: yup.number().required('Target is required'),
  nps_threshold: yup.number().required('Threshold is required'),
});

interface IFormInputs {
  nps_target: number;
  nps_threshold: number;
}

interface FormProps {
  editData?: IFormInputs;
  setAddModal?: (open: boolean) => void;
  setEditModal?: (open: boolean) => void;
  onSubmit: (data: IFormInputs) => void;
}

export default function TargetThresholdForm(props: FormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    clearErrors,
  } = useForm<IFormInputs>({
    resolver: yupResolver(schema),
    defaultValues: props.editData, // || { nps_target: 0, nps_threshold: 0 },
  });

  const onSubmitHandler = (data: IFormInputs) => {
    try {
      props.onSubmit(data);
      toast.success(
        `${
          props.editData ? 'NPS metric updated' : 'NPS metric added'
        } successfully`
      );
      reset();
      if (props && props.setAddModal) {
        props.setAddModal(false);
      } else if (props && props.setEditModal) {
        props.setEditModal(false);
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (props.editData) {
      clearErrors();
      setValue('nps_target', props.editData.nps_target);
      setValue('nps_threshold', props.editData.nps_threshold);
    } else {
      reset();
    }
  }, [props.editData, reset, setValue, clearErrors]);

  return (
    <div>
      <Modal
        show={true}
        onHide={() => {
          if (props && props.setAddModal) {
            props.setAddModal(false);
          } else if (props && props.setEditModal) {
            props.setEditModal(false);
          }
        }}
        id="largeModal"
        modal-center="true"
        className="fixed flex flex-col transition-all duration-300 ease-in-out left-2/4 z-drawer -translate-x-2/4 -translate-y-2/4"
        dialogClassName="w-screen md:w-[40rem] bg-white shadow rounded-md dark:bg-zink-600 flex flex-col h-full"
      >
        <Modal.Header
          className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-zink-500"
          closeButtonClass="transition-all duration-200 ease-linear text-slate-500 hover:text-red-500 dark:text-zink-200 dark:hover:text-red-500"
        >
          <Modal.Title className="text-16">
            {' '}
            <div className="flex justify-between mx-4">
              <div className="block">
                <h6 className="font-semibold text-[24px] text-black">
                  {props.editData
                    ? 'Edit NPS target and NPS threshold'
                    : 'Add NPS target and NPS threshold'}
                </h6>
                <p className="font-normal my-1 text-[16px] tracking-normal leading-5 text-[#cccccc] ">
                  {!props.editData ? 'Enter the required information.' : ''}
                </p>
              </div>
              <div
                className="mt-1 cursor-pointer"
                onClick={() => {
                  if (props && props.setAddModal) {
                    props.setAddModal(false);
                  } else if (props && props.setEditModal) {
                    props.setEditModal(false);
                  }
                }}
              ></div>
            </div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="max-h-[calc(theme('height.screen')_-_180px)] p-4 overflow-y-auto">
          <div className="">
            <form onSubmit={handleSubmit(onSubmitHandler)}>
              <div className="rounded pt-3">
                <div className="grid grid-cols-1 gap-x-5 xl:grid-cols-2">
                  <div className="mb-4">
                    <label
                      htmlFor="firstNameInput"
                      className="inline-block mb-2 text-base font-medium"
                    >
                      NPS target <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register('nps_target')}
                      type="number"
                      step="any" // This allows for decimal values
                      name="nps_target"
                      id="nps_target"
                      className="form-input border-slate-200 dark:border-zink-500 focus:outline-none focus:border-custom-500 disabled:bg-slate-100 dark:disabled:bg-zink-600 disabled:border-slate-300 dark:disabled:border-zink-500 dark:disabled:text-zink-200 disabled:text-slate-500 dark:text-zink-100 dark:bg-zink-700 dark:focus:border-custom-800 placeholder:text-slate-400 dark:placeholder:text-zink-200"
                      placeholder="Enter NPS target"
                      // value={validation.values.firstName}
                      // onChange={validation.handleChange}
                      // onBlur={validation.handleBlur}
                    />
                    <p className="mt-1 text-sm text-red-500">
                      {errors.nps_target?.message}
                    </p>
                  </div>
                  <div className="mb-4">
                    <label
                      htmlFor="lastNameInput"
                      className="inline-block mb-2 text-base font-medium"
                    >
                      NPS threshold<span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register('nps_threshold')}
                      type="number"
                      step="any" // This allows for decimal values
                      name="nps_threshold"
                      id="nps_threshold"
                      className="form-input border-slate-200 dark:border-zink-500 focus:outline-none focus:border-custom-500 disabled:bg-slate-100 dark:disabled:bg-zink-600 disabled:border-slate-300 dark:disabled:border-zink-500 dark:disabled:text-zink-200 disabled:text-slate-500 dark:text-zink-100 dark:bg-zink-700 dark:focus:border-custom-800 placeholder:text-slate-400 dark:placeholder:text-zink-200"
                      placeholder="Enter NPS threshold"
                      // value={validation.values.lastName}
                      // onChange={validation.handleChange}
                      // onBlur={validation.handleBlur}
                    />
                    <p className="mt-1 text-sm text-red-500">
                      {errors.nps_threshold?.message}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <div className="mx-3">
                  <button
                    id="cancel_button"
                    title="Click to cancel"
                    onClick={() => {
                      if (props && props.setAddModal) {
                        props.setAddModal(false);
                      } else if (props && props.setEditModal) {
                        props.setEditModal(false);
                      }
                    }}
                    type="button"
                    className="text-gray-500 bg-white border border-gray-500 btn hover:text-gray-500 hover:bg-gray-100 focus:text-gray-500 focus:bg-gray-100 active:text-gray-500 active:bg-gray-100 dark:bg-zinc-700 dark:hover:bg-gray-500/10 dark:focus:bg-gray-500/10 dark:active:bg-gray-500/10"
                  >
                    Cancel
                  </button>
                </div>
                <div className="mx-3">
                  <button
                    id="submit_button"
                    title={`Click to ${
                      props.editData ? 'update' : 'add'
                    } information`}
                    type="submit"
                    className="text-white btn bg-custom-500 border-custom-500 hover:text-white hover:bg-custom-600 hover:border-custom-600 focus:text-white focus:bg-custom-600 focus:border-custom-600 focus:ring focus:ring-custom-100 active:text-white active:bg-custom-600 active:border-custom-600 active:ring active:ring-custom-100 dark:ring-custom-400/20"
                  >
                    {props.editData ? 'Update' : 'Add'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
