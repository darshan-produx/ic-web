import {
  useDeleteTask,
  useUpdateTask,
} from '../../../../services/mutations/tasksMutations';
import { X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import React from 'react';
import DeleteModal from '../../../../common/components/DeleteModal';
import Modal from '../../../../common/components/Modal';
import dayjs from 'dayjs';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { localToUtc, utcToLocal } from '../../../utils/date-util';
import Flatpickr from 'react-flatpickr';
import { getAllTasksStatus } from '../../../api/tasks/tasks';
import { useQuery } from '@tanstack/react-query';
import ButtonLoader from '../../../../common/components/buttonloader';
const schema = yup.object({
  title: yup.string().required('Please enter title'),
  notes: yup.string(),
});
const EditMilestone = (props: any) => {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
    getValues,
    watch,
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
  });
  const [isDataChanged, setIsDataChanged] = useState(false);
  const [updateStatus, setUpdateStatus] = useState(false);
  const [dueDateError, setDueDateError] = useState('');
  const [selectedDueDate, setSelectedDueDate] = useState<Date | null>(null);
  const [deleteModal, setDeleteModal] = useState<boolean>(false);
  const [closeConfirmationModal, setCloseConfirmationModal] = useState(false);
  const [isMarkAsDone, setIsMarkAsDone] = useState(false);
  const deleteToggle = () => {
    setDeleteModal(!deleteModal);
  };
  const { data: statusArr } = useQuery({
    queryKey: ['getstatusArr'],
    queryFn: () => getAllTasksStatus(),
  });
  const deleteTask = useDeleteTask();
  const updateTask = useUpdateTask();
  const handleDelete = async () => {
    try {
      const res = await deleteTask.mutateAsync(props?.ele?._id);
      if (res?.status == 200 || res?.status == 201) {
        setDeleteModal(false);
        props?.setShowDetailModal(false);
        toast.success('Milestone deleted successfully.');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message);
    }
  };
  const markAsDone = async () => {
    setIsMarkAsDone(true);
    const doneStatusId = statusArr?.data?.data?.filter(
      (ele: any) => ele?.status_name == 'Done'
    )[0]?._id;
    const data = {
      _id: props?.ele?._id,
      task_status_id: doneStatusId,
      is_completed: true,
    };
    try {
      const res = await updateTask?.mutateAsync(data);
      if (res?.status == 200 || res?.status == 201) {
        toast?.success('Milestone completed.');
      }
      setIsMarkAsDone(false);
    } catch (err: any) {
      toast?.error(err?.response?.data?.message);
      setIsMarkAsDone(false);
    }
    props?.setShowDetailModal(false);
  };

  useEffect(() => {
    if (props.ele) {
      props.ele?.title
        ? setValue('title', props.ele?.title)
        : setValue('title', '');
      props.ele?.notes
        ? setValue('notes', props.ele?.notes)
        : setValue('notes', '');
      props.ele?.planned_start_datetime
        ? setSelectedDueDate(new Date(props.ele?.planned_start_datetime))
        : setSelectedDueDate(null);
    } else {
      reset();
    }
  }, [props.ele]);

  function getFormattedDate(selectedDueDate: Date | null): string {
    if (!selectedDueDate) return '';

    const formattedDate: any = utcToLocal(selectedDueDate);

    if (isNaN(new Date(formattedDate).getTime())) {
      return '';
    }

    return String(formattedDate);
  }
  const updateTaskDetails = async (data: any) => {
    setUpdateStatus(true);
    const selectedStartDate = dayjs(selectedDueDate).startOf('day').toDate();
    const selectedEndDate = dayjs(selectedDueDate).endOf('day').toDate();
    data = {
      _id: props?.ele?._id,
      title: data?.title,
      notes: data?.notes,
      planned_start_datetime: selectedStartDate,
      planned_end_datetime: selectedEndDate,
    };
    try {
      const res = await updateTask.mutateAsync(data);
      if (res?.status == 200 || res?.status == 201) {
        toast?.success('Milestone status updated successfully.');
        setUpdateStatus(false);
        setIsDataChanged(false);
        props?.setShowDetailModal(false);
      }
    } catch (err: any) {
      setUpdateStatus(false);
      toast.error(err.response?.data?.message);
      setIsDataChanged(false);
      props?.setShowDetailModal(false);
    }
  };
  const toggle = useCallback(() => {
    setCloseConfirmationModal((prevShow) => !prevShow);
  }, []);
  return (
    <div>
      <form
        onSubmit={handleSubmit(updateTaskDetails)}
        onChange={() => {
          if (!props?.ele?.is_completed) {
            setIsDataChanged(true);
          }
        }}
      >
        <Modal
          show={props?.showDetailModal}
          onHide={() => props?.setShowDetailModal(false)}
          id="defaultModal"
          modal-center="true"
          className="fixed flex flex-col transition-all duration-300 ease-in-out left-2/4 z-drawer -translate-x-2/4 -translate-y-2/4"
          dialogClassName="w-screen md:w-[750px] bg-white shadow rounded-md dark:bg-zink-600"
        >
          <Modal.Body className="max-h-[calc(theme('height.screen')_-_61px)] overflow-y-auto barScroll">
            <div className="p-5">
              <div className="flex flex-col">
                <div className="flex mb-6 justify-between">
                  <textarea
                    {...register('title')}
                    rows={getValues('title')?.length < 100 ? 1 : 2}
                    style={{
                      resize: 'none',
                    }}
                    id="title"
                    disabled={props?.ele?.is_completed}
                    className="outline-none text-[18px] disabled:bg-white w-full break-words scroll font-semibold text-[#202B37] !border-none placeholder:text-[#97A1AF]"
                    placeholder="Add milestone title"
                  />
                  <X
                    className="w-[22px] h-[22px] cursor-pointer"
                    onClick={() => {
                      if (isDataChanged) {
                        setCloseConfirmationModal(true);
                      } else {
                        props?.setShowDetailModal(false);
                        setIsDataChanged(false);
                        setValue('title', props?.ele?.title);
                        setValue('notes', props?.ele?.notes);
                        setSelectedDueDate(
                          props?.ele?.planned_start_datetime
                            ? new Date(props?.ele?.planned_start_datetime)
                            : null
                        );
                      }
                    }}
                  />
                </div>
                <div className="mb-3">
                  <textarea
                    {...register('notes')}
                    id="notes"
                    // cols={}
                    rows={3}
                    disabled={props?.ele?.is_completed}
                    className="outline-none max-h-[300px] min-h-[50px] text-[16px] py-3 pl-3 font-normal  bg-[#F9FAFB] rounded-[10px] w-full text-[#141C24] !border-none placeholder:text-[#97A1AF]"
                    placeholder="Add description"
                  ></textarea>
                </div>
                <div className="flex justify-between">
                  <div className="flex items-center w-1/2">
                    <div className="text-[#97A1AF] text-base">Set for</div>
                    {
                      <span className="flex pl-[8px] text-[#414E62] w-36">
                        <Flatpickr
                          options={{
                            dateFormat: 'M d, Y',
                            minDate: 'today',
                          }}
                          onChange={(value) => {
                            setSelectedDueDate(
                              value[0] ? localToUtc(value[0]) || null : null
                            ),
                              setDueDateError('');
                            setIsDataChanged(true);
                          }}
                          name="target_date"
                          disabled={props?.ele?.is_completed}
                          value={selectedDueDate ? selectedDueDate : ''}
                          placeholder={
                            selectedDueDate
                              ? dayjs(selectedDueDate).format('MMM DD, YYYY')
                              : 'Add due date'
                          }
                          className="form-input !border-none p-0 !border-0 w-full dark:border-zinc-500 focus:outline-none focus:border-custom-500 disabled:bg-white dark:disabled:bg-zinc-600 disabled:border-slate-300 dark:disabled:border-zinc-500 dark:disabled:text-zinc-200 disabled:text-slate-500 dark:text-zinc-100 dark:bg-zinc-700 dark:focus:border-custom-800 placeholder:text-[#414E62] dark:placeholder:text-zinc-200"
                          style={{
                            width: selectedDueDate ? '11ch' : '100%',
                          }}
                        />
                        {getFormattedDate(selectedDueDate as Date) &&
                          selectedDueDate &&
                          !props?.ele?.is_completed && (
                            <span className="flex items-center">
                              <X
                                className="w-[18px] h-[18px] cursor-pointer text-black "
                                onClick={() => {
                                  setSelectedDueDate(null);
                                }}
                              />
                            </span>
                          )}
                      </span>
                    }
                  </div>
                </div>
              </div>
              {dueDateError && (
                <p className="text-start text-[14px] text-[#EF4444] font-normal  pt-[12px]">
                  {dueDateError}
                </p>
              )}
              {errors?.title?.message && (
                <p className="text-start  text-[14px] text-[#EF4444] pt-[12px]">
                  {errors?.title?.message}
                </p>
              )}
            </div>
          </Modal.Body>
          <Modal.Footer>
            <div className="flex justify-between w-full p-5 border-t-[1px] border-[#CED2DA] items-center">
              <div className="flex gap-6">
                <button
                  type="button"
                  onClick={() => {
                    setDeleteModal(true);
                  }}
                  className={`btn py-[9.5px] px-5 border-[#FCCFCF] hover:text-[#EF4444] text-[#EF4444] font-semibold text-base `}
                >
                  Delete
                </button>
                <span className="text-[#637083] text-sm font-normal">
                  <p>
                    Last modified:{' '}
                    {dayjs(props?.ele?.updated_at).format(
                      'MMM DD, YYYY hh:mm A'
                    )}
                  </p>
                  <p>
                    Created by you on:{' '}
                    {dayjs(props?.ele?.created_at).format(
                      'MMM DD, YYYY hh:mm A'
                    )}
                  </p>
                </span>
              </div>
              <div className="flex gap-4 items-center">
                {isDataChanged && (
                  <button
                    type="submit"
                    className={`bg-[#3B82F6] px-[16px]  font-semibold  text-white btn !border-[#3B82F6]  dark:ring-custom-400/20`}
                    // onClick={handleSubmit(updateTaskDetails)}
                    disabled={updateStatus}
                  >
                    <span className="text-nowrap flex flex-nowrap">
                      Save
                      {updateStatus && (
                        <>
                          &nbsp;
                          <ButtonLoader />
                        </>
                      )}
                    </span>
                  </button>
                )}
                {!props?.ele?.is_completed ? (
                  <button
                    // type="submit"
                    disabled={isMarkAsDone}
                    onClick={(e) => {
                      e.preventDefault();
                      markAsDone();
                    }}
                    className={`btn border-[#249782] disabled:opacity-50 focus:ring focus:ring-custom-100 active:ring active:ring-custom-100 dark:ring-custom-400/20 ${'bg-[#249782] text-white font-semibold hover:text-white hover:bg-[#249782] hover:border-[#249782] focus:text-white focus:bg-[#249782] focus:border-[#249782] active:text-white active:bg-[#249782] active:border-[#249782] dark:bg-zink-700 dark:hover:bg-[#249782] dark:focus:bg-[#249782]'}  ${
                      isMarkAsDone ? 'cursor-not-allowed' : ''
                    }`}
                  >
                    Mark done
                  </button>
                ) : (
                  <span className="text-[#249782] text-base font-semibold ">
                    Marked as done
                  </span>
                )}
              </div>
            </div>
          </Modal.Footer>
        </Modal>
        <Modal
          show={closeConfirmationModal}
          onHide={toggle}
          id="defaultModal"
          modal-center="true"
          className="fixed flex flex-col transition-all duration-300 ease-in-out left-2/4 z-drawer -translate-x-2/4 -translate-y-2/4"
          dialogClassName="w-[418px] bg-white shadow rounded-md dark:bg-zink-600 flex flex-col h-full"
        >
          <Modal.Header
            className="flex items-center justify-between p-4  border-slate-200 dark:border-zink-500"
            closeButtonClass="transition-all hidden duration-200 ease-linear text-slate-500 hover:text-red-500 dark:text-zink-200 dark:hover:text-red-500"
          >
            <Modal.Title className="text-lg font-medium text-[#202B37]">
              There are unsaved milestone details
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="max-h-[calc(theme('height.screen')_-_180px)] px-4 pb-4 overflow-y-auto">
            <p className="text-base text-[#414E62] font-norm  dark:text-zink-200">
              You will lose the changes if you close
            </p>
          </Modal.Body>
          <Modal.Footer className="p-4 mt-auto border-t border-slate-200 dark:border-zink-500">
            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="bg-white px-2 py-0.5 text-gray-500 btn border-gray-500 font-semibold "
                onClick={() => {
                  setIsDataChanged(false);
                  setValue('title', props?.ele?.title);
                  setValue('notes', props?.ele?.notes);
                  setSelectedDueDate(
                    props?.ele?.planned_start_datetime
                      ? new Date(props?.ele?.planned_start_datetime)
                      : null
                  );
                  toggle();
                  props?.setShowDetailModal(false);
                }}
              >
                Close milestone
              </button>
              <button
                type="submit"
                className={`btn border-[#249782] focus:ring focus:ring-custom-100 active:ring active:ring-custom-100 dark:ring-custom-400/20 ${'bg-[#249782] text-white font-semibold hover:text-white hover:bg-[#249782] hover:border-[#249782] focus:text-white focus:bg-[#249782] focus:border-[#249782] active:text-white active:bg-[#249782] active:border-[#249782] dark:bg-zink-700 dark:hover:bg-[#249782] dark:focus:bg-[#249782]'}`}
                onClick={toggle}
                disabled={updateTask?.isPending}
              >
                Save changes
              </button>
            </div>
          </Modal.Footer>
        </Modal>
      </form>
      <DeleteModal
        show={deleteModal}
        onHide={deleteToggle}
        onDelete={handleDelete}
        title="milestone"
      />
    </div>
  );
};

export default EditMilestone;
