import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { toast } from 'react-toastify';
import Modal from '../../../../../common/components/Modal';

const schema = yup.object({
  ticket_type: yup
    .string()
    .required('Ticket type is required')
    .matches(/^(?!^\d+$)[a-zA-Z0-9 ]+$/),
  time_to_complete: yup
    .number()
    .nullable()
    .transform((value, originalValue) => {
      return originalValue === '' ? null : value;
    })
    .required('Number of days are required')
    .typeError('Must be a number'),
  units_of_time: yup.string().required('Units of time is required'),
});

interface IFormInputs {
  ticket_type: string;
  time_to_complete: number;
  units_of_time: string;
}

interface FormProps {
  editData?: IFormInputs;
  setAddModal?: (open: boolean) => void;
  setEditModal?: (open: boolean) => void;
  onSubmit: (data: IFormInputs) => void;
}

export default function SLAMasterForm(props: FormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    clearErrors,
  } = useForm<IFormInputs>({
    resolver: yupResolver(schema),
    defaultValues: props.editData,
  });

  const onSubmitHandler = (data: IFormInputs) => {
    try {
      props.onSubmit(data);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (props.editData) {
      clearErrors();
      setValue('ticket_type', props.editData.ticket_type);
      setValue('time_to_complete', props.editData.time_to_complete);
      setValue('units_of_time', props.editData.units_of_time);
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
                  {props.editData ? 'Edit ticket SLA' : 'Add ticket SLA'}
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
                      Ticket type <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register('ticket_type')}
                      type="text"
                      name="ticket_type"
                      id="ticket_type"
                      className="form-input border-slate-200 dark:border-zink-500 focus:outline-none focus:border-custom-500 disabled:bg-slate-100 dark:disabled:bg-zink-600 disabled:border-slate-300 dark:disabled:border-zink-500 dark:disabled:text-zink-200 disabled:text-slate-500 dark:text-zink-100 dark:bg-zink-700 dark:focus:border-custom-800 placeholder:text-slate-400 dark:placeholder:text-zink-200"
                      placeholder="Enter ticket type"
                      // value={validation.values.ticket_type}
                      // onChange={validation.handleChange}
                      // onBlur={validation.handleBlur}
                    />
                    <p className="mt-1 text-sm text-red-500">
                      {errors.ticket_type?.message}
                    </p>
                  </div>
                  <div className="mb-4">
                    <label
                      htmlFor="lastNameInput"
                      className="inline-block mb-2 text-base font-medium"
                    >
                      Time to complete
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register('time_to_complete')}
                      type="number"
                      step="1"
                      name="time_to_complete"
                      id="time_to_complete"
                      className="form-input border-slate-200 dark:border-zink-500 focus:outline-none focus:border-custom-500 disabled:bg-slate-100 dark:disabled:bg-zink-600 disabled:border-slate-300 dark:disabled:border-zink-500 dark:disabled:text-zink-200 disabled:text-slate-500 dark:text-zink-100 dark:bg-zink-700 dark:focus:border-custom-800 placeholder:text-slate-400 dark:placeholder:text-zink-200"
                      placeholder="Enter time to complete"
                      min="1"
                    />
                    <p className="mt-1 text-sm text-red-500">
                      {errors.time_to_complete?.message}
                    </p>
                  </div>
                  <div className="mb-4">
                    <label
                      htmlFor="lastNameInput"
                      className="inline-block mb-2 text-base font-medium"
                    >
                      Units of time
                      <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...register('units_of_time')}
                      name="units_of_time"
                      id="units_of_time"
                      className="form-input border-slate-200 dark:border-zink-500 focus:outline-none focus:border-custom-500 disabled:bg-slate-100 dark:disabled:bg-zink-600 disabled:border-slate-300 dark:disabled:border-zink-500 dark:disabled:text-zink-200 disabled:text-slate-500 dark:text-zink-100 dark:bg-zink-700 dark:focus:border-custom-800 placeholder:text-slate-400 dark:placeholder:text-zink-200"
                    >
                      <option value="hours">Hours</option>
                      <option value="days">Days</option>
                    </select>
                    <p className="mt-1 text-sm text-red-500">
                      {errors.units_of_time?.message}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <div className="mx-3">
                  <button
                    id="cancel_button"
                    // title="Click to cancel"
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
                    // title={`Click to ${
                    //   props.editData ? 'update' : 'add'
                    // } information`}
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
