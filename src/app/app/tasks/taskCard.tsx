import {
  useDeleteTask,
  useUpdateTask,
} from '../../../services/mutations/tasksMutations';
import { Calendar } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import React from 'react';
import { createPortal } from 'react-dom';
import DeleteModal from '../../../common/components/DeleteModal';
import Modal from '../../../common/components/Modal';
import dayjs from 'dayjs';
import { useQuery } from '@tanstack/react-query';
import { getAllTasksStatus } from '../../api/tasks/tasks';
import CreateNewTask from './createNewTask';
import TaskDetailDrawer from './TaskDetailDrawer';
import { getCustomers } from '../../api/customers/customers';
import { getUsersForTask } from '../../api/users/users';
import { toEndUTC } from '../../utils/date-util';

const TaskCard = (props: any) => {
  const [deleteModal, setDeleteModal] = useState<boolean>(false);
  const [show, setShow] = useState<boolean>(false);
  const [showScheduler, setShowScheduler] = useState<boolean>(false);
  const [showScheduler2, setShowScheduler2] = useState<boolean>(false);
  const [showDetailDrawer, setShowDetailDrawer] = useState<boolean>(false);
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [remindType, setRemindType] = useState('Never');
  const [cssFordraggedItem, setCssFordraggedItem] = useState<string>();
  const [isEditStaskMode, setIsEditStaskMode] = useState<boolean>(false);
  const deleteToggle = () => {
    setDeleteModal(!deleteModal);
  };

  const deleteTask = useDeleteTask();
  const updateTask = useUpdateTask();
  const handleDelete = async () => {
    try {
      const res = await deleteTask.mutateAsync(props?.ele?._id);
      if (res?.status == 200 || res?.status == 201) {
        setDeleteModal(false);
        closeDetailModal();
        toast.success('Task deleted successfully.');
      }
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const { data: allCustomers } = useQuery({
    queryKey: ['allCustomers'],
    queryFn: getCustomers,
    refetchOnWindowFocus: false,
  });
  const { data: existingUsers } = useQuery({
    queryKey: ['users'],
    queryFn: getUsersForTask,
    refetchOnWindowFocus: false,
  });
  const { data: statusArr } = useQuery({
    queryKey: ['statusArr'],
    queryFn: () => getAllTasksStatus(),
    refetchOnWindowFocus: false,
  });
  const toggleScheduler = useCallback(() => {
    setShowScheduler((prevShow) => !prevShow);
  }, []);

  const toggleScheduler2 = useCallback(() => {
    setShowScheduler2((prevShow) => !prevShow);
  }, []);

  const closeDetailDrawer = useCallback(() => {
    setShowDetailDrawer(false);
    props?.onDetailModalVisibilityChange?.(false);
  }, [props?.onDetailModalVisibilityChange]);

  const openDetailDrawer = useCallback(() => {
    setShowDetailDrawer(true);
    props?.onDetailModalVisibilityChange?.(true);
  }, [props?.onDetailModalVisibilityChange]);

  const closeDetailModal = useCallback(() => {
    setShowDetailModal(false);
  }, []);

  const toggleDetailModal = useCallback(() => {
    setShowDetailModal((prevShow) => !prevShow);
  }, []);

  // const ScheduledOnCalender = (props: any) => {
  //   const [startDate, setStartDate] = useState<Date | null>();
  //   const [endDate, setEndDate] = useState<Date | null>();

  //   const onSubmitForm = async () => {
  //     if (startDate && endDate) {
  //       const data = {
  //         _id: props?.ele?._id,
  //         planned_start_datetime: startDate ? startDate : '',
  //         planned_end_datetime: endDate ? endDate : '',
  //       };
  //       try {
  //         const res = await updateTask.mutateAsync(data);
  //         if (res?.status == 201 || res?.status == 200) {
  //           toast.success('Task updated successfully');
  //         }
  //       } catch (err: any) {
  //         toast.error(err?.message);
  //       }
  //     }
  //     props?.onHide();
  //   };

  //   useEffect(() => {
  //     setStartDate(props?.ele?.planned_start_datetime);
  //     setEndDate(props?.ele?.planned_end_datetime);
  //   }, [props?.ele]);
  //   return (
  //     <div className="dropdownClick">
  //       <div className="flex justify-between">
  //         <h6 className="text-[#344051] text-[16px] ">Scheduled on calendar</h6>
  //         <div className="flex justify-between">
  //           <div title="submit">
  //             <svg
  //               width="18"
  //               height="18"
  //               viewBox="0 0 18 18"
  //               fill="none"
  //               xmlns="http://www.w3.org/2000/svg"
  //               className="mx-2 cursor-pointer"
  //               onClick={onSubmitForm}
  //             >
  //               <g clipPath="url(#clip0_337_23219)">
  //                 <rect width="18" height="18" rx="9" fill="#141C24" />
  //                 <path
  //                   d="M5.25 9.75L7.5 12L12.75 6.75"
  //                   stroke="white"
  //                   strokeWidth="1.125"
  //                   strokeLinecap="round"
  //                   strokeLinejoin="round"
  //                 />
  //               </g>
  //               <defs>
  //                 <clipPath id="clip0_337_23219">
  //                   <rect width="18" height="18" rx="9" fill="white" />
  //                 </clipPath>
  //               </defs>
  //             </svg>
  //           </div>
  //           <div title="close">
  //             <X
  //               className="w-[18px] h-[18px] cursor-pointer"
  //               onClick={props?.onHide}
  //             />
  //           </div>
  //         </div>
  //       </div>

  //       <div className="my-2">
  //         <Flatpickr
  //           options={{
  //             enableTime: true,
  //             dateFormat: 'H:i K,   M d',
  //             minDate: 'today',
  //           }}
  //           value={startDate ? startDate : ''}
  //           onChange={(e: any) => setStartDate(e[0])}
  //           placeholder="Planned start date-time "
  //           className="form-input border-slate-200 dark:border-zink-500 focus:outline-none focus:border-custom-500 disabled:bg-slate-100 dark:disabled:bg-zink-600 disabled:border-slate-300 dark:disabled:border-zink-500 dark:disabled:text-zink-200 disabled:text-slate-500 dark:text-zink-100 dark:bg-zink-700 dark:focus:border-custom-800 placeholder:text-slate-400 dark:placeholder:text-zink-200"
  //         />
  //       </div>
  //       <div>
  //         <Flatpickr
  //           options={{
  //             enableTime: true,
  //             dateFormat: 'H:i K, M d',
  //             minDate: 'today',
  //           }}
  //           value={endDate ? endDate : ''}
  //           onChange={(e: any) => setEndDate(e[0])}
  //           placeholder="Planned end date-time"
  //           className="form-input border-slate-200 dark:border-zink-500 focus:outline-none focus:border-custom-500 disabled:bg-slate-100 dark:disabled:bg-zink-600 disabled:border-slate-300 dark:disabled:border-zink-500 dark:disabled:text-zink-200 disabled:text-slate-500 dark:text-zink-100 dark:bg-zink-700 dark:focus:border-custom-800 placeholder:text-slate-400 dark:placeholder:text-zink-200"
  //         />
  //       </div>
  //     </div>
  //   );
  // };

  const markAsDone = async (isProjectTask: boolean,endDate?: Date | null, cascadingDependency?: boolean) => {
    const doneStatusId = statusArr?.data?.data?.filter(
      (ele: any) => ele?.status_name == 'Done'
    )[0]?._id;
    const data: any = {
      _id: props?.ele?._id,
      task_status_id: doneStatusId,
      is_completed: true,
    };
    // Add endDate if provided
    if (endDate) {
      data.end_datetime = toEndUTC(endDate);
      if (!isProjectTask) {
        data.planned_end_datetime = toEndUTC(endDate);
      }
    }

    // Add cascadingDependency if provided
    if (isProjectTask && cascadingDependency !== undefined) {
      data.move_cascading_tasks = cascadingDependency;
    }
    try {
      const res = await updateTask?.mutateAsync(data);
      if (res?.status == 200 || res?.status == 201) {
        toast?.success('Task completed.');
      }
    } catch (err: any) {
      toast?.error(err?.message);
    }
    // toggleDetailModal();
    closeDetailModal();
  };

  useEffect(() => {
    if (show || showScheduler2) {
      closeDetailDrawer();
      closeDetailModal();
    }
  }, [show, showScheduler2, closeDetailDrawer, closeDetailModal]);
  const onDragCapture = (event: any, item: any) => {
    props?.setDraggedItem(item);
    setCssFordraggedItem('text-[#F2F4F7] bg-[#F2F4F7] !border-[#F2F4F7]');
    event.dataTransfer.effectAllowed = 'move';
    // event.dataTransfer.dropEffect = 'move';
  };
  const onDragOver = (event: React.DragEvent<HTMLDivElement>, ele: any) => {
    const status = statusArr?.data?.data?.find(
      (item: any) => item?._id === props?.draggedItem?.task_status_id
    )?.status_name;
    event.preventDefault();
    if (props?.draggedOver !== status) {
      event.currentTarget.classList.remove('border-[#F9FAFB]', 'border-t');
      event.currentTarget.classList.add('border-blue-500', 'border-t');
      props?.setDragOverIndex(props?.ele?._id);
    }
  };
  const onDragEnd = (event: React.DragEvent<HTMLDivElement>) => {
    props?.setDraggedItem(null);
    setCssFordraggedItem('');
    event.currentTarget.classList.remove('border-blue-500');
  };

  return (
    <div
      key={props?.j}
      className={!props?.customer360 && !props?.priorityTask ? '' : ''}
      // style={{
      //   borderBottom: '1px solid #F9FAFB',
      // }}
      onDragLeaveCapture={(e) => {
        e.stopPropagation();
        e.currentTarget.classList.remove('border-blue-500', 'border-t');
        e.currentTarget.classList.add('border-[#F9FAFB]', 'border-t');
        setCssFordraggedItem('');
      }}
      onDragOverCapture={(e) => {
        e.stopPropagation(), onDragOver(e, props?.ele);
      }}
      onDrop={(e) => {
        e.currentTarget.classList.remove('border-blue-500', 'border-t'),
          e.currentTarget.classList.add('border-[#F9FAFB]', 'border-t');
        setCssFordraggedItem('');
      }}
    >
      <div
        draggable={props?.isDraggable}
        // onDrag={(e) => e.currentTarget.classList.add('border-blue-500')}
        // onDragStart={(e) => onDragStart(e, props?.ele)}
        onDragCapture={(e) => onDragCapture(e, props?.ele)}
        onDragEnd={(e) => onDragEnd(e)}
        className={`${props?.priorityTask
          ? 'border-[#E4E7EC] py-[20px]'
          : !props?.customer360
            ? `!my-[8px] rounded-md bg-white shadow-none  ${!cssFordraggedItem
              ? 'border-[#E4E7EC] border-[1px]'
              : 'border-[#F2F4F7] border-[1px]'
            }`
            : 'w-[550px]  mx-5 '
          }  cursor-pointer overflow-hidden`}
      >
        <div
          className={
            props?.priorityTask
              ? 'flex'
              : `flex px-[16px] py-[12px] ${cssFordraggedItem}`
          }
        >
          <div
            className="w-[97%]"
            onClick={(e) => {
              e.stopPropagation();
              openDetailDrawer();
            }}
          >
            <h6
              className={`text-[#141C24] !font-[500]  text-[14px] line-clamp-2 overflow-hidden text-ellipsis ${cssFordraggedItem}`}
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}
              title={props?.ele?.title}
            >
              {props?.ele?.title}
            </h6>
            <div className="mt-[10px]">
              {/* {!props?.customer360 ? ( */}
              <div
                className={`text-[#637083] text-[12px] flex flex-wrap !w-[390]  ${cssFordraggedItem}`}
              >
                {props?.ele?.account && (
                  <div
                    className="my-[0]  last:border-none border-[#CED2DA]"
                    title={`${props?.ele?.account}`}
                  >
                    {props?.ele?.account}
                  </div>
                )}
                {(props?.ele?.assignee_id?.first_name ||
                  props?.ele?.assignee_email) &&
                  props?.ele?.account &&
                  !props?.customer360 && (
                    <div
                      className={`mx-2 border-r last:border-none border-[#CED2DA] ${cssFordraggedItem}`}
                    ></div>
                  )}
                {props?.ele?.assignee_id
                  ? props?.ele?.assignee_id?.first_name &&
                  !props?.customer360 && (
                    <div
                      title={
                        props?.ele?.assignee_id?.first_name +
                        ' ' +
                        props?.ele?.assignee_id?.last_name
                      }
                      className={`  my-[0]  first:pl-0 last:border-none ${cssFordraggedItem} border-[#CED2DA]`}
                    >
                      Assigned to{' '}
                      {props?.ele?.assignee_id?.first_name +
                        ' ' +
                        props?.ele?.assignee_id?.last_name}
                    </div>
                  )
                  : props?.ele?.assignee_email && (
                    <div
                      title={`${props?.ele?.assignee_email}`}
                      className={`my-[0]   last:border-none border-[#CED2DA] first:pl-0  last:pl-0 ${cssFordraggedItem} border-[#CED2DA]`}
                    >
                      Assigned to {props?.ele?.assignee_email}
                    </div>
                  )}
                {(props?.ele?.assignee_id?.first_name ||
                  props?.ele?.assignee_email ||
                  props?.ele?.account) &&
                  props?.ele?.target_date ? (
                  <div
                    className={`mx-2 border-r last:border-none border-[#CED2DA] ${cssFordraggedItem}`}
                  ></div>
                ) : null}
                {props?.ele?.target_date && (
                  <div
                    title={dayjs(props?.ele?.target_date).format(
                      'MMM DD, YYYY'
                    )}
                    className={`my-[0] first:pl-0 ${cssFordraggedItem} `}
                  >
                    {'Due ' +
                      dayjs(props?.ele?.target_date).format('MMM DD, YYYY')}
                  </div>
                )}
                {props?.ele?.task_status_id &&
                  (props?.customer360 || props?.priorityTask) ? (
                  <div
                    className={`mx-2 border-r last:border-none border-[#CED2DA] ${cssFordraggedItem}`}
                  ></div>
                ) : null}
                {props?.ele?.task_status_id &&
                  Array.isArray(statusArr?.data?.data) &&
                  (props?.customer360 || props?.priorityTask) && (
                    <div className={`my-[0] first:pl-0 ${cssFordraggedItem} `}>
                      {Array.isArray(statusArr?.data?.data)
                        ? statusArr.data.data.find(
                          (status: any) =>
                            status._id == props?.ele?.task_status_id
                        )?.status_name
                        : ''}
                    </div>
                  )}
              </div>
              {/* ) : (
                <div
                  className={`text-[#637083] text-[12px] ${cssFordraggedItem}`}
                >
                  {props?.ele?.account}
                  {props?.ele?.target_date
                    ? (props?.ele?.account == '' ? '' : '') +
                      ' Due ' +
                      dayjs(props?.ele?.target_date).format('MMM DD, YYYY')
                    : ''}
                  {<>
                  <div
                        className={`mx-2 border-r last:border-none border-[#CED2DA] ${cssFordraggedItem}`}
                      ></div>
                      {props?.ele?.task_status_id}
                  </>}
                </div>
              )} */}
            </div>
          </div>

          <div className="w-[2%] flex h-[6vh] right-[11px] ">
            <div className="inline-block p-0  transition-all duration-200 ease-linear w-5 rounded-full text-topbar-item dropdown-toggle btn hover:text-topbar-item-hover group-data-[topbar=dark]:text-topbar-item-dark group-data-[topbar=dark]:bg-topbar-dark group-data-[topbar=dark]:hover:bg-topbar-item-bg-hover-dark group-data-[topbar=dark]:hover:text-topbar-item-hover-dark group-data-[topbar=brand]:bg-topbar-brand group-data-[topbar=brand]:hover:bg-topbar-item-bg-hover-brand group-data-[topbar=brand]:hover:text-topbar-item-hover-brand group-data-[topbar=dark]:dark:bg-zink-700 group-data-[topbar=dark]:dark:hover:bg-zink-600 group-data-[topbar=brand]:text-topbar-item-brand group-data-[topbar=dark]:dark:hover:text-zink-50 group-data-[topbar=dark]:dark:text-zink-200">
              {props?.ele?.planned_start_datetime &&
                props?.ele?.planned_end_datetime &&
                !props?.isMyTeamPage ? (
                <Calendar
                  className={`size-5 cursor-auto  text-[#414E62] ${cssFordraggedItem}`}
                  onClick={toggleScheduler}
                />
              ) : (
                ''
              )}
            </div>
            {/* {showScheduler ? (
              <>
                <div className="absolute  z-[1000] p-4 ltr:text-left rtl:text-right bg-white rounded-md shadow-md !top-15 !right-3 dropdown-menu w-[20rem] dark:bg-zink-600">
                  <ScheduledOnCalender
                    onHide={toggleScheduler}
                    ele={props?.ele}
                  />
                </div>
              </>
            ) : (
              <></>
            )} */}
          </div>
        </div>
      </div>
      {typeof window !== 'undefined' && createPortal(
        <TaskDetailDrawer
          ele={props?.ele}
          isOpen={showDetailDrawer}
          onClose={closeDetailDrawer}
          statusArr={statusArr?.data?.data ?? []}
          onEdit={() => {
            setShowDetailDrawer(false);
            setIsEditStaskMode(true);
            setShowDetailModal(true);
          }}
          onDelete={() => {
            setShowDetailDrawer(false);
            setDeleteModal(true);
          }}
          onMarkDone={() => markAsDone(!!props?.ele?.project_id?._id)}
        />,
        document.body,
      )}

      {typeof window !== 'undefined' && createPortal(
        <Modal
          show={showDetailModal}
          onHide={closeDetailModal}
          id="defaultModal"
          modal-center="true"
          className="fixed top-2/4 left-2/4 z-drawer flex flex-col -translate-x-2/4 -translate-y-2/4 transition-all duration-300 ease-in-out"
          dialogClassName="w-screen md:w-[750px] bg-white shadow rounded-md dark:bg-zink-600"
        >
          <Modal.Body className="max-h-[calc(theme('height.screen')_-_61px)] overflow-y-auto barScroll">
            {showDetailModal && (
              <div className="p-4">
                <CreateNewTask
                  onHide={closeDetailModal}
                  allCustomers={allCustomers}
                  ele={props?.ele}
                  existingUsers={existingUsers?.data?.data}
                  remindType={remindType}
                  setRemindType={setRemindType}
                  statusArr={statusArr?.data?.data}
                  userDetails={props?.userDetails}
                  isEditMode={isEditStaskMode}
                  setDeleteModal={setDeleteModal}
                  projectModal={{
                    projectId: props?.ele?.project_id?._id || undefined,
                    projectName: props?.ele?.project_id?.project_name || undefined,
                    tasksDetails: undefined,
                    customerId: props?.ele?.project_id?.customer_id || undefined,
                    type: props?.ele?.type,
                  }}
                  markAsDone={markAsDone}
                  done={props?.done}
                  isCustomerDropDownDisabled={props?.isCustomerDropDownDisabled ?? false}
                />
              </div>
            )}
          </Modal.Body>
        </Modal>,
        document.body,
      )}

      {typeof window !== 'undefined' && createPortal(
        <DeleteModal
          show={deleteModal}
          onHide={deleteToggle}
          onDelete={handleDelete}
        />,
        document.body,
      )}

      {/* <Modal
        show={showScheduler2}
        onHide={toggleScheduler2}
        id="defaultModal3"
        modal-center="true"
        className="fixed flex flex-col transition-all duration-300 ease-in-out left-2/4 z-drawer -translate-x-2/4 -translate-y-2/4"
        dialogClassName="w-screen md:w-[30rem] bg-white shadow rounded-md dark:bg-zink-600"
      >
        <Modal.Body className="max-h-[calc(theme('height.screen')_-_180px)] p-4 overflow-y-auto">
          <ScheduledOnCalender onHide={toggleScheduler2} ele={props?.ele} />
        </Modal.Body>
      </Modal> */}
    </div>
  );
};

export default TaskCard;
