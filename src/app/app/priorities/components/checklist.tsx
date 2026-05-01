import dayjs from 'dayjs';
import {
  CalenderMenuIcon,
  CircleCheckIcon,
  CircleFilledCheckIcon,
  HoverIcon,
  TodaysCalender,
  XIcon,
} from '../../../assests/icons/icons';
import { Calendar, Check, ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
import { Dropdown } from '../../../../common/Dropdown';
import Flatpickr from 'react-flatpickr';
import { useCallback, useRef, useState } from 'react';
import ConfirmationModal from '../../../../common/components/Modal/confirmationModal';
import CreateNewTask from '../../tasks/createNewTask';
import { getAllTasksStatus, getTaskById } from '../../../api/tasks/tasks';
import { apiRequest } from '../../../../common/api-request';
import { getCustomers } from '../../../api/customers/customers';
import { getUsersForTask } from '../../../api/users/users';
import { useQuery } from '@tanstack/react-query';
import Modal from '../../../../common/components/Modal';
import AddNewProjectModal from '../../customers/components/addNewProjectModal';
import DeleteModal from '../../../../common/components/DeleteModal';
import { useDeleteTask, useUpdateTask } from '../../../../services/mutations/tasksMutations';
import { toEndUTC } from '../../../utils/date-util';
import { toast } from 'react-toastify';

interface props {
  setCheckListDate: any;
  checkListDate: any;
  drop: any;
  checklistItems: any;
  handleMovechecklistItem: any;
  addChecklist: any;
  setAddChecklist: any;
  checkListTitle: any;
  setCheckListTitle: any;
  createCheklistItem: any;
  setDraggedChecklistItemData: any;
  setDragOverItemData: any;
  handleCheckList: any;
  setHoverId: any;
  hoverId: any;
  deleteChecklistItem: any;
  visibleId: any;
  setPickDate: any;
  setVisibleId: any;
  titleErrorMes: string;
  setTitleErrorMsg: any;
  onHover: string;
  setOnHover: any;
}

export default function CheckList({
  setCheckListDate,
  checkListDate,
  drop,
  checklistItems,
  handleMovechecklistItem,
  addChecklist,
  setAddChecklist,
  checkListTitle,
  setCheckListTitle,
  createCheklistItem,
  setTitleErrorMsg,
  titleErrorMes,
  setDraggedChecklistItemData,
  setDragOverItemData,
  handleCheckList,
  setHoverId,
  hoverId,
  deleteChecklistItem,
  visibleId,
  setPickDate,
  setVisibleId,
  onHover,
  setOnHover,
}: props) {
  const headerFlatpickrRef = useRef<Flatpickr>(null);
  const [confirmationModal, setConfirmationModalOpen] = useState({
    modalOpen: false,
    id: '',
  });
  const [customrIdOfItem, setCustomrIdOfItem] = useState(null);
  const [createTaskModalOpen, setCreateTaskModalOpen] = useState(false);
  const [addNewProjectModal, setAddNewProjectModal] = useState(false);

  const [showTaskDetailModal, setShowTaskDetailModal] = useState(false);
  const [taskDeleteModal, setTaskDeleteModal] = useState(false);
  const [selectedTaskItem, setSelectedTaskItem] = useState<any>(null);
  const [remindType, setRemindType] = useState<any>(null);

  const deleteTask = useDeleteTask();
  const updateTask = useUpdateTask();

  const toggle = useCallback(() => {
    setCreateTaskModalOpen((prev) => !prev);
  }, []);

  const toggleTaskDetailModal = useCallback(() => {
    setShowTaskDetailModal((prev) => !prev);
  }, []);

  const taskDeleteToggle = useCallback(() => {
    setTaskDeleteModal((prev) => !prev);
  }, []);

  const { data: taskDetailData } = useQuery({
    queryKey: ['taskDetail', selectedTaskItem?.ref_id],
    queryFn: () => getTaskById(selectedTaskItem?.ref_id),
    enabled: !!selectedTaskItem?.ref_id && showTaskDetailModal,
  });

  const handleTaskDelete = async () => {
    try {
      const res = await deleteTask.mutateAsync(selectedTaskItem?.ref_id);
      if (res?.status === 200 || res?.status === 201) {
        toast.success('Task deleted successfully');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete task');
    }
    setTaskDeleteModal(false);
    setShowTaskDetailModal(false);
    setSelectedTaskItem(null);
  };

  const markAsDone = async (
    isProjectTask: boolean,
    endDate?: Date | null,
    cascadingDependency?: boolean
  ) => {
    const doneStatusId = statusArr?.data?.data?.filter(
      (ele: any) => ele?.status_name === 'Done'
    )[0]?._id;
    const data: any = {
      _id: selectedTaskItem?.ref_id,
      task_status_id: doneStatusId,
      is_completed: true,
    };
    if (endDate) {
      data.end_datetime = toEndUTC(endDate);
      if (!isProjectTask) {
        data.planned_end_datetime = toEndUTC(endDate);
      }
    }
    if (isProjectTask && cascadingDependency !== undefined) {
      data.move_cascading_tasks = cascadingDependency;
    }
    try {
      const res = await updateTask.mutateAsync(data);
      if (res?.status === 200 || res?.status === 201) {
        toast.success('Task completed.');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to complete task');
    }
    setShowTaskDetailModal(false);
  };

  const openTaskDetailModal = (item: any) => {
    if (item?.ref_type === 'task' && item?.ref_id) {
      setSelectedTaskItem(item);
      setShowTaskDetailModal(true);
    }
  };

  const { data: allCustomers } = useQuery({
    queryKey: ['allCustomers'],
    queryFn: getCustomers,
  });

  const { data: existingUsers, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: getUsersForTask,
  });
  const { data: userinfo } = useQuery({
    queryKey: ['userDetails'],
    queryFn: () =>
      apiRequest({
        url: '/api/app-service/v1/userinfo?is_email_encrypt=true',
      }),
  });
  const { data: statusArr } = useQuery({
    queryKey: ['statusArr'],
    queryFn: () => getAllTasksStatus(),
  });

  const handleCancel = () => {
    setConfirmationModalOpen({
      modalOpen: false,
      id: '',
    });
  };

  const handleYes = () => {
    deleteChecklistItem(confirmationModal?.id);
    setConfirmationModalOpen({
      modalOpen: false,
      id: '',
    });
  };
  return (
    <>
      <div>
        <div
          className={
            'w-full border-b flex rounded-t-xl border-[#E4E7EC] bg-white h-[72px]'
          }
        >
          <div className="flex w-full items-center justify-between text-[14px] text-[#202B37] gap-[10px] px-[20px] font-normal">
            <span className="flex gap-[10px]">
              <TodaysCalender className="" />{' '}
              {checkListDate === dayjs().format('YYYY-MM-DD')
                ? 'Today’s checklist'
                : 'Checklist'}
            </span>
            <span className="flex items-center border rounded-[4px] border-[#E4E7EC] h-[32px]">
              <div
                className="border-r border-[#E4E7EC] h-[32px] items-center flex px-[1px] cursor-pointer"
                onClick={() =>
                  setCheckListDate(
                    dayjs(checkListDate).subtract(1, 'day').format('YYYY-MM-DD')
                  )
                }
              >
                <ChevronLeft className="text-[#414E62]" />
              </div>
              <span
                className="w-[140px] flex justify-center gap-[10px] text-xs text-[#1E293B] cursor-pointer items-center"
                onClick={() => headerFlatpickrRef.current?.flatpickr?.open()}
              >
                {/* <Calendar className="w-[14px] h-[14px] text-[#414E62]" /> */}
                {dayjs(checkListDate).format('MMM DD, YYYY')}
                <Flatpickr
                  ref={headerFlatpickrRef}
                  options={{
                    dateFormat: 'Y-m-d',
                  }}
                  value={checkListDate}
                  onChange={([date]: Date[]) => {
                    if (date) {
                      setCheckListDate(dayjs(date).format('YYYY-MM-DD'));
                    }
                  }}
                  className=" opacity-0 w-0 h-0 pointer-events-none"
                />
              </span>
              <div
                className="border-l border-[#E4E7EC] h-[32px] items-center flex px-[1px] cursor-pointer"
                onClick={() =>
                  setCheckListDate(
                    dayjs(checkListDate).add(1, 'day').format('YYYY-MM-DD')
                  )
                }
              >
                <ChevronRight className="text-[#414E62]" />
              </div>
            </span>

          </div>
        </div>

        <div
          className="h-[480px] h-lt-900:h-[318px] pb-4 overflow-y-auto scroll"
          onDrop={(e) => {
            e.preventDefault(), drop(e);
          }}
          onDragOver={(e) => {
            {
              e.preventDefault();
              e.currentTarget.classList.add('border-white', 'border');
              // setDropAreaCss('border-[#637083]');
            }
          }}
        >
          {checklistItems?.data?.previousDataCount > 0 && (
            <div
              className="px-[20px] py-[6px] bg-[#F9FAFB] text-xs text-[#3B82F6] cursor-pointer sticky top-0 z-[10]"
              onClick={() => handleMovechecklistItem()}
            >
              {checklistItems?.data?.previousDataCount} items from the past,
              move them to today
            </div>
          )}
          {checklistItems?.data?.data?.length > 0 &&
            checkListDate < dayjs().format('YYYY-MM-DD') && (
              <div
                className="px-[20px] py-[6px] bg-[#F9FAFB] text-xs text-[#3B82F6] cursor-pointer sticky top-0"
                onClick={() =>
                  handleMovechecklistItem(
                    dayjs(checkListDate).format('YYYY-MM-DD')
                  )
                }
              >
                Move all to today
              </div>
            )}
          {checkListDate >= dayjs().format('YYYY-MM-DD') ? (
            !addChecklist ? (
              <div
                className="flex item-center text-[14px] gap-[8px] p-[20px] h-[77px] text-[#637083] cursor-pointer w-full"
                onClick={(e) => (e.stopPropagation(), setAddChecklist(true))}
              >
                <span className="flex items-center gap-[8px]">
                  <Plus className="w-[20px] h-[20px]" /> Add new
                </span>
              </div>
            ) : (
              <div className="px-[20px] flex gap-[8px] pb-[16px] pt-[20px]">
                <div className="w-[20px] h-[20px] my-[10px] ">
                  <input
                    id="checkboxCircle2"
                    className="size-5 border rounded-full appearance-none cursor-pointer bg-white border-[#E4E7EC] dark:bg-zink-600 dark:border-zink-500 checked:bg-green-500 checked:border-green-500 dark:checked:bg-green-500 dark:checked:border-green-500 checked:disabled:bg-green-400 checked:disabled:border-green-400"
                    type="checkbox"
                    value=""
                    disabled
                    content="white"
                  />
                </div>
                <div className=" w-full">
                  <div className="flex justify-between w-full bg-[#F9FAFB] rounded-md py-[10px] px-[12px] text-[14px] text-[#202B37]">
                    <input
                      type="text"
                      autoFocus
                      className={
                        ' bg-[#F9FAFB] border-[#E4E7EC] w-full dark:border-zink-500 focus:outline-none pl-1 text-[14px] disabled:bg-slate-100 dark:disabled:bg-zink-600 disabled:border-slate-300 dark:disabled:border-zink-500 dark:disabled:text-zink-200 disabled:text-slate-500 dark:text-zink-100 dark:bg-zink-700 dark:focus:border-custom-800 placeholder:text-slate-400 dark:placeholder:text-zink-200'
                      }
                      placeholder="Enter title"
                      value={checkListTitle}
                      onChange={(e) => (
                        setCheckListTitle(e.target.value), setTitleErrorMsg('')
                      )}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && checkListTitle) {
                          createCheklistItem();
                        }
                      }}
                    />
                    <div className="flex gap-[12px]">
                      <span
                        className="cursor-pointer"
                        onClick={createCheklistItem}
                      >
                        <Check className="w-[20px] h-[20px] hover:text-green-500" />
                      </span>
                      <span className="cursor-pointer">
                        <X
                          className="w-[20px] h-[20px] text-[#637083]"
                          onClick={(e) => (
                            setCheckListTitle(''),
                            setAddChecklist(false),
                            setTitleErrorMsg('')
                          )}
                        />
                      </span>
                    </div>
                  </div>
                  {titleErrorMes && (
                    <span className="text-[12px] text-red-500">
                      {titleErrorMes}
                    </span>
                  )}
                </div>
              </div>
            )
          ) : null}
          <div className=" flex flex-col" id="checklistItems">
            {checklistItems?.data?.data?.map((item: any, index: number) => (
              <div
                className="px-[20px] flex gap-[8px] py-[8px] relative"
                key={item?._id}
                draggable={true}
                onMouseEnter={() => setOnHover(item._id)}
                onMouseLeave={() => setOnHover('')}
                onDrag={(e) => {
                  setDraggedChecklistItemData(item);
                }}
                onDragLeaveCapture={(e) => {
                  e.preventDefault(),
                    e.currentTarget.classList.add(
                      'border-blue-500',
                      'border-t'
                    );
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.add('border-blue-500', 'border-t');
                  setDragOverItemData({
                    upper: checklistItems?.data?.data[index - 1]?.seq_num,
                    lower: item?.seq_num,
                  });
                }}
                onDrop={(e) => {
                  e.currentTarget.classList.remove(
                    'border-blue-500',
                    'border-t'
                  );
                }}
                onDragLeave={(e) => {
                  e.currentTarget.classList.remove(
                    'border-blue-500',
                    'border-t'
                  );
                }}
              >
                <div className="w-[20px] h-[20px] my-[10px]">
                  {!item.is_completed ? (
                    <div className="relative cursor-pointer">
                      <div>
                        <input
                          id="checkboxCircle2"
                          className="size-5 border rounded-full appearance-none cursor-pointer bg-white border-gray-300 dark:bg-zink-600 dark:border-zink-500 checked:bg-green-500 checked:border-green-500 dark:checked:bg-green-500 dark:checked:border-green-500 checked:disabled:bg-green-400 checked:disabled:border-green-400"
                          type="checkbox"
                          checked={item.is_completed}
                          content="white"
                          onChange={(e) => handleCheckList(item)}
                        />
                      </div>
                      <div
                        className={`absolute top-0 hover:opacity-100 opacity-0 ${onHover === item._id ? '!opacity-100' : ''}`}
                        onClick={() => {
                          handleCheckList(item);
                        }}
                      >
                        <CircleCheckIcon className="text-green-500 h-[20px] w-[20px]" />
                      </div>
                    </div>
                  ) : (
                    <span
                      className="cursor-pointer"
                      onClick={() => {
                        handleCheckList(item);
                      }}
                    >
                      <CircleFilledCheckIcon className="text-green-500 h-[20px] w-[20px]" />
                    </span>
                  )}
                </div>
                {(item?.ref_type === 'openissues' ||
                  item?.ref_type === 'customer' ||
                  item?.ref_type === 'opportunity' ||
                  item?.ref_type === 'email' ||
                  // item?.ref_type === 'task' ||
                  item?.metadata?.url) ? (
                  <a
                    // href={`/app/insights/${insight._id}`}
                    href={
                      item?.ref_type === 'openissues'
                        ? `/app/customers/${item?.customer_id}?activeTab=open_issues`
                        : item?.ref_type === 'opportunity'
                          ? `/app/insights/opportunities?selected=${item?.ref_id}`
                          : item?.ref_type === 'customer'
                            ? `/app/customers/${item?.ref_id}`
                            : item?.ref_type === 'email'
                              ? `/app/emails?email_message_id=${item?.ref_id}`
                              // : item?.ref_type === 'task'
                              //   ? `#`
                              : item?.metadata?.url
                                ? item?.metadata?.url
                                : '#'
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative block w-full"
                  >
                    <span
                      className="bg-[#F9FAFB] w-full item-center flex justify-between rounded-md py-[10px] px-[12px] text-[14px] text-[#202B37]"
                      onMouseOver={() => setHoverId(item?._id)}
                      onMouseOut={() => setHoverId('')}
                    >
                      {item?.title}
                      {(hoverId === item?._id || visibleId === item?._id) && (
                        <div
                          className="top-2 right-2 bg-[#F9FAFB] flex items-center gap-[12px]"
                          onClick={(e) => {
                            e.stopPropagation(), e.preventDefault();
                          }}
                        >
                          {/* {checkListDate === dayjs().format('YYYY-MM-DD') && ( */}
                          <div className="flex items-center">
                            <Dropdown className="relative dropdown shrink-0 ">
                              <Dropdown.Trigger
                                type="button"
                                className="flex items-center p-0 transition-all duration-200 ease-linear rounded-full text-topbar-item dropdown-toggle btn hover:text-topbar-item-hover group-data-[topbar=dark]:text-topbar-item-dark group-data-[topbar=dark]:bg-topbar-dark group-data-[topbar=dark]:hover:bg-topbar-item-bg-hover-dark group-data-[topbar=dark]:hover:text-topbar-item-hover-dark group-data-[topbar=brand]:bg-topbar-brand group-data-[topbar=brand]:hover:bg-topbar-item-bg-hover-brand group-data-[topbar=brand]:hover:text-topbar-item-hover-brand group-data-[topbar=dark]:dark:bg-zink-700 group-data-[topbar=dark]:dark:hover:bg-zink-600 group-data-[topbar=brand]:text-topbar-item-brand group-data-[topbar=dark]:dark:hover:text-zink-50 group-data-[topbar=dark]:dark:text-zink-200"
                                id="dropdownMenuButton"
                                data-bs-toggle="dropdown"
                              >
                                <span onClick={() => setVisibleId(item?._id)}>
                                  <CalenderMenuIcon className="size-5 items-center cursor-pointer text-[#414E62] ml-2" />
                                </span>
                              </Dropdown.Trigger>
                              <Dropdown.Content
                                // placement="top-start"
                                className="absolute border bg-white border-[#CED2DA] z-[999] ltr:text-left rtl:text-right rounded-lg dropdown-menu w-[246px] dark:bg-zink-600 !top-9 !right-[25px]"
                                aria-labelledby="dropdownMenuButton"
                              >
                                <div className="px-3 flex gap-2 py-[8px] flex-col text-[16px] font-normal text-[#202B37] cursor-default" onClick={(e: any) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  e.nativeEvent.stopImmediatePropagation();
                                }}>
                                  <span
                                    className="cursor-pointer hover:text-blue-500"
                                    onClick={(e) => {
                                      e.preventDefault(),
                                        e.stopPropagation(),
                                        handleCheckList(item, 'next_day');
                                    }}
                                  >
                                    Move to the next day
                                  </span>
                                  <span
                                    className="cursor-pointer hover:text-blue-500"
                                    onClick={(e) => {
                                      e.preventDefault(),
                                        e.stopPropagation(),
                                        handleCheckList(
                                          item,
                                          'day_after_next_day'
                                        );
                                    }}
                                  >
                                    Move to day after the next day
                                  </span>
                                  <span
                                    onClick={(e: any) => {
                                      e.stopPropagation();
                                      e.preventDefault();
                                      e.nativeEvent.stopImmediatePropagation();
                                      setVisibleId(item?._id);
                                    }}
                                    className="cursor-pointer"
                                  >
                                    <Flatpickr
                                      options={{
                                        dateFormat: 'H:i K,   M d',
                                        minDate: 'today',
                                      }}
                                      onChange={(e: any) => {
                                        setPickDate(e[0]);
                                      }}
                                      placeholder="Pick a date"
                                      className="z-[1000] border-slate-200 placeholder:text-[#202B37] placeholder:hover:text-blue-500 placeholder:hover:cursor-pointer dark:border-zink-500 focus:outline-none focus:border-custom-500 disabled:bg-slate-100 dark:disabled:bg-zink-600 disabled:border-slate-300 dark:disabled:border-zink-500 dark:disabled:text-zink-200 disabled:text-slate-500 dark:text-zink-100 dark:bg-zink-700 dark:focus:border-custom-800 dark:placeholder:text-zink-200"
                                    />
                                  </span>
                                  {!(item?.ref_type === 'task') && (<span onClick={(e: any) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    e.nativeEvent.stopImmediatePropagation();
                                    setAddNewProjectModal(true);
                                    setCustomrIdOfItem(item?.customer_id);
                                  }} className='cursor-pointer hover:text-blue-500'>
                                    Create new Project
                                  </span>)}
                                  {!(item?.ref_type === 'task') && (<span onClick={(e: any) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    e.nativeEvent.stopImmediatePropagation();
                                    setCustomrIdOfItem(item?.customer_id);
                                    toggle();
                                  }} className='cursor-pointer hover:text-blue-500'>
                                    Create new task
                                  </span>)}
                                </div>
                              </Dropdown.Content>
                            </Dropdown>
                          </div>
                          {/* )} */}
                          <span
                            className="cursor-pointer flex items-center"
                            onClick={() =>
                              setConfirmationModalOpen({
                                modalOpen: true,
                                id: item?._id,
                              })
                            }
                          >
                            <XIcon className="w-[15px] h-[13px] font-semibold" />
                          </span>
                        </div>
                      )}
                    </span>
                  </a>
                ) : (
                  <>
                    <span
                      className={`relative block bg-[#F9FAFB] w-full item-center flex justify-between rounded-md py-[10px] px-[12px] text-[14px] text-[#202B37] ${item?.ref_type === 'task' ? 'cursor-pointer' : ''}`}
                      onMouseOver={() => setHoverId(item?._id)}
                      onMouseOut={() => setHoverId('')}
                      onClick={() => openTaskDetailModal(item)}
                    >
                      {item?.title}
                      {(hoverId === item?._id || visibleId === item?._id) && (
                        <div
                          className="absolute top-2 right-2 z-20 bg-[#F9FAFB] flex items-center gap-[12px]"
                          onClick={(e) => {
                            e.stopPropagation(), e.preventDefault();
                          }}
                        >
                          {/* {checkListDate === dayjs().format('YYYY-MM-DD') && ( */}
                          <div className="flex items-center">
                            <Dropdown className="relative dropdown shrink-0 ">
                              <Dropdown.Trigger
                                type="button"
                                className="flex items-center p-0 transition-all duration-200 ease-linear rounded-full text-topbar-item dropdown-toggle btn hover:text-topbar-item-hover group-data-[topbar=dark]:text-topbar-item-dark group-data-[topbar=dark]:bg-topbar-dark group-data-[topbar=dark]:hover:bg-topbar-item-bg-hover-dark group-data-[topbar=dark]:hover:text-topbar-item-hover-dark group-data-[topbar=brand]:bg-topbar-brand group-data-[topbar=brand]:hover:bg-topbar-item-bg-hover-brand group-data-[topbar=brand]:hover:text-topbar-item-hover-brand group-data-[topbar=dark]:dark:bg-zink-700 group-data-[topbar=dark]:dark:hover:bg-zink-600 group-data-[topbar=brand]:text-topbar-item-brand group-data-[topbar=dark]:dark:hover:text-zink-50 group-data-[topbar=dark]:dark:text-zink-200"
                                id="dropdownMenuButton"
                                data-bs-toggle="dropdown"
                              >
                                <span onClick={() => setVisibleId(item?._id)}>
                                  <CalenderMenuIcon className="size-5 items-center cursor-pointer text-[#414E62] ml-2" />
                                </span>
                              </Dropdown.Trigger>
                              <Dropdown.Content
                                // placement="top-start"
                                className="absolute border bg-white border-[#CED2DA] z-[999] ltr:text-left rtl:text-right rounded-lg dropdown-menu w-[246px] dark:bg-zink-600 !top-9 !right-[25px]"
                                aria-labelledby="dropdownMenuButton"
                              >
                                <div className="px-3 flex gap-2 py-[8px] flex-col text-[16px] font-normal text-[#202B37] cursor-default" onClick={(e: any) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  e.nativeEvent.stopImmediatePropagation();
                                }}>
                                  <span
                                    className="cursor-pointer hover:text-blue-500"
                                    onClick={(e) => {
                                      e.preventDefault(),
                                        e.stopPropagation(),
                                        handleCheckList(item, 'next_day');
                                    }}
                                  >
                                    Move to the next day
                                  </span>
                                  <span
                                    className="cursor-pointer hover:text-blue-500"
                                    onClick={(e) => {
                                      e.preventDefault(),
                                        e.stopPropagation(),
                                        handleCheckList(
                                          item,
                                          'day_after_next_day'
                                        );
                                    }}
                                  >
                                    Move to day after the next day
                                  </span>
                                  <span
                                    onClick={(e: any) => {
                                      e.stopPropagation();
                                      e.preventDefault();
                                      e.nativeEvent.stopImmediatePropagation();
                                      setVisibleId(item?._id);
                                    }}
                                    className="cursor-pointer"
                                  >
                                    <Flatpickr
                                      options={{
                                        dateFormat: 'H:i K,   M d',
                                        minDate: 'today',
                                      }}
                                      onChange={(e: any) => {
                                        setPickDate(e[0]);
                                      }}
                                      placeholder="Pick a date"
                                      className="z-[1000] border-slate-200 placeholder:text-[#202B37] placeholder:hover:text-blue-500 placeholder:hover:cursor-pointer dark:border-zink-500 focus:outline-none focus:border-custom-500 disabled:bg-slate-100 dark:disabled:bg-zink-600 disabled:border-slate-300 dark:disabled:border-zink-500 dark:disabled:text-zink-200 disabled:text-slate-500 dark:text-zink-100 dark:bg-zink-700 dark:focus:border-custom-800 dark:placeholder:text-zink-200"
                                    />
                                  </span>
                                  {!(item?.ref_type === 'task') && (<span onClick={(e: any) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    e.nativeEvent.stopImmediatePropagation();
                                    setAddNewProjectModal(true);
                                    setCustomrIdOfItem(item?.customer_id);
                                  }} className='cursor-pointer hover:text-blue-500'>
                                    Create new Project
                                  </span>)}
                                  {!(item?.ref_type === 'task') && (<span onClick={(e: any) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    e.nativeEvent.stopImmediatePropagation();
                                    setCustomrIdOfItem(item?.customer_id);
                                    toggle();
                                  }} className='cursor-pointer hover:text-blue-500'>
                                    Create new task
                                  </span>)}
                                </div>
                              </Dropdown.Content>
                            </Dropdown>
                          </div>
                          {/* )} */}
                          <span
                            className="cursor-pointer flex items-center"
                            onClick={() =>
                              setConfirmationModalOpen({
                                modalOpen: true,
                                id: item?._id,
                              })
                            }
                          >
                            <XIcon className="w-[15px] h-[13px] font-semibold" />
                          </span>
                        </div>
                      )}
                    </span>
                  </>
                )}
                {onHover === item._id && (
                  <span className="absolute top-1/2 left-0 -translate-y-1/2">
                    <HoverIcon />
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="text-xs text-[#97A1AF] border-t border-[#E4E7EC] bg-[#F9FAFB] rounded-b-[10px] px-[20px] py-[6px]">
        Drag and drop any item here
      </div>
      <ConfirmationModal
        header=""
        title="Are you sure you want to delete this checklist item?"
        modalOpen={confirmationModal?.modalOpen}
        handleCancel={handleCancel}
        handleYes={handleYes}
        yesText="Delete"
      />
      <Modal
        show={createTaskModalOpen}
        onHide={toggle}
        id="defaultModal"
        modal-center="true"
        className="fixed flex flex-col transition-all duration-300 ease-in-out left-2/4 z-drawer -translate-x-2/4 -translate-y-2/4"
        dialogClassName="w-screen md:w-[750px] bg-white shadow rounded-md dark:bg-zink-600"
      >
        <Modal.Body className="max-h-[calc(theme('height.screen')_-_61px)] p-4 overflow-y-auto barScroll">
          {createTaskModalOpen && (
            <CreateNewTask
              onHide={toggle}
              allCustomers={allCustomers}
              existingUsers={existingUsers?.data?.data}
              statusArr={statusArr?.data?.data}
              userDetails={userinfo?.data}
              isEditMode={false}
              isCustomerDropDownDisabled={true}
              customerId={customrIdOfItem}
            />
          )}
        </Modal.Body>
      </Modal>
      <Modal
        show={showTaskDetailModal}
        onHide={() => {
          setShowTaskDetailModal(false);
          setSelectedTaskItem(null);
        }}
        id="taskDetailModal"
        modal-center="true"
        className="fixed flex flex-col transition-all duration-300 ease-in-out left-2/4 z-drawer -translate-x-2/4 -translate-y-2/4"
        dialogClassName="w-screen md:w-[750px] bg-white shadow rounded-md dark:bg-zink-600"
      >
        <Modal.Body className="max-h-[calc(theme('height.screen')_-_61px)] overflow-y-auto barScroll">
          {showTaskDetailModal && taskDetailData?.data && (
            <>
              <div className="p-4">
                <CreateNewTask
                  onHide={toggleTaskDetailModal}
                  allCustomers={allCustomers}
                  ele={taskDetailData?.data}
                  existingUsers={existingUsers?.data?.data}
                  remindType={remindType}
                  setRemindType={setRemindType}
                  statusArr={statusArr?.data?.data}
                  userDetails={userinfo?.data}
                  isEditMode={true}
                  setDeleteModal={setTaskDeleteModal}
                  projectModal={{
                    projectId: taskDetailData?.data?.project_id?._id || undefined,
                    projectName:
                      taskDetailData?.data?.project_id?.project_name || undefined,
                    tasksDetails: undefined,
                    customerId:
                      taskDetailData?.data?.project_id?.customer_id || undefined,
                    type: taskDetailData?.data?.type,
                  }}
                  markAsDone={markAsDone}
                  done={taskDetailData?.data?.is_completed}
                  isCustomerDropDownDisabled={false}
                />
              </div>

              <DeleteModal
                show={taskDeleteModal}
                onHide={taskDeleteToggle}
                onDelete={handleTaskDelete}
              />
            </>
          )}
        </Modal.Body>
      </Modal>
      {addNewProjectModal && (
        <AddNewProjectModal
          addNewProjectModal={addNewProjectModal}
          setAddNewProjectModal={setAddNewProjectModal}
          customerId={customrIdOfItem}
        // setSelectedProject={setSelectedProject}
        />
      )}
    </>
  );
}
