import dayjs from 'dayjs';
import { Dayjs } from 'dayjs';
import { Calendar, ChevronDown, PlusIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Dropdown } from '../../../../../common/Dropdown';
import {
  CriticalTaskIcon,
  MilestoneIcon,
  ProjectTaskCompletedIcon,
  TaskCompleteIcon,
  ProjectTaskDelayedOrLate,
} from '../../../../../app/assests/icons/icons';
import { toast } from 'react-toastify';
import { useUpdateProject } from '../../../../../services/mutations/coustomerProjectMutation';
import { toUTCEndOfDay } from '../../../../../app/utils/date-util';
export default function NormalView({
  data,
  toggle,
  markAsDone,
  setTypeOfModal,
  customerDropdown,
}: any) {
  const [filterType, setFilterType] = useState('all_tasks');
  const [showMilestoneModal, setShowMilestoneModal] = useState<boolean>(false);
  const [draggedItem, setDraggedItem] = useState<any>(null);
  const [draggedOverId, setDraggedOverId] = useState<any>(null);
  const filteredData = useMemo(() => {
    if (filterType === 'all_tasks') return data?.tasks;
    if (filterType === 'open') {
      return data?.tasks?.filter((item: any) => item.is_completed === false);
    } else if (filterType === 'critical') {
      return data?.tasks?.filter((item: any) => item.is_critical);
    }
  }, [data, filterType]);
  const updateProject = useUpdateProject();
  const handleDrop = async (e: any, position: number) => {
    e.preventDefault();
    setDraggedItem(null);
    const payload = {
      id: data?.customer_project_plan?._id,
      task_id: draggedItem?._id,
      position: position,
    };
    try {
      const res = await updateProject.mutateAsync(payload);
      if (res?.status == 200 || res?.status == 201) {
        toast?.success('Task moved successfully.');
      }
    } catch (err: any) {
      toast?.error(err?.message);
    }
  };

  type TaskStatus = 'new' | 'in-progress' | 'in-review' | 'done' | string;

  // helper: difference in working days (ignores Sat & Sun)
  function getWorkingDaysDiff(start: Dayjs, end: Dayjs): number {
    let count = 0;
    let current = start.startOf('day');

    while (current.isBefore(end, 'day') || current.isSame(end, 'day')) {
      const day = current.day(); // 0 = Sun, 6 = Sat
      if (day !== 0 && day !== 6) {
        count++;
      }
      current = current.add(1, 'day');
    }

    return count - 1; // subtract 1 so it's like normal diff()
  }

  function delayOrLate(
    status: TaskStatus,
    plannedEndDate?: string | Date,
    endDate?: string | Date
  ): string {
    let late = 0;

    // Calculate late (end date after planned end date)
    if (endDate && plannedEndDate) {
      const actualEnd = dayjs(endDate).endOf('day');
      const plannedEnd = dayjs(plannedEndDate).endOf('day');

      if (actualEnd.isAfter(plannedEnd)) {
        late = getWorkingDaysDiff(plannedEnd, actualEnd);
      }
    }

    if (late > 0) {
      if (status.toLowerCase() === 'done') {
        return `${late} days late`;
      } else {
        return `${late} days delay`;
      }
    }
    return '';
  }
  return (
    <div className="flex">
      {' '}
      <div className="w-[780px] border-r border-[#E4E7EC] pt-[20px]">
        <div className="flex justify-between px-[20px] pb-[20px]">
          <div className="flex gap-[8px]">
            <button
              className={
                filterType === 'all_tasks'
                  ? 'rounded-[150px] border-[#3B82F6] text-[14px] font-medium text-[#3B82F6] bg-white border py-[4px] px-[12px]'
                  : 'rounded-[150px] bg-[#F2F4F7] text-[14px] font-medium text-[#344051] py-[4px] px-[12px] border border-[#F2F4F7]'
              }
              onClick={() => setFilterType('all_tasks')}
            >
              All tasks
            </button>
            {customerDropdown?.value === 'active_projects' && (
              <button
                className={
                  filterType === 'open'
                    ? 'rounded-[150px] border-[#3B82F6]  text-[14px] font-medium text-[#3B82F6] bg-white border  py-[4px] px-[12px]'
                    : 'rounded-[150px] bg-[#F2F4F7] text-[14px] font-medium text-[#344051] py-[4px] px-[12px] border border-[#F2F4F7]'
                }
                onClick={() => setFilterType('open')}
              >
                Open
              </button>
            )}
            <button
              className={
                filterType === 'critical'
                  ? 'rounded-[150px] border-[#3B82F6]  text-[14px] font-medium text-[#3B82F6] bg-white border  py-[4px] px-[12px]'
                  : 'rounded-[150px] bg-[#F2F4F7] text-[14px] font-medium text-[#344051] py-[4px] px-[12px] border border-[#F2F4F7]'
              }
              onClick={() => setFilterType('critical')}
            >
              Critical
            </button>
          </div>
          {filteredData?.length > 0 &&
            customerDropdown?.value === 'active_projects' && (
              <div className="flex items-center">
                <span
                  className="flex cursor-pointer items-center gap-[8px] text-[14px] font-medium pl-[20px] pr-1  text-[#202B37]"
                  onClick={() => {
                    toggle(), setTypeOfModal({ type: 'task', position: null });
                  }}
                >
                  <PlusIcon className="w-5 h-5 text-[#000000]" /> Add new
                </span>
              </div>
            )}
        </div>
        {filteredData?.length === 0 &&
          customerDropdown?.value === 'active_projects' && (
            <div className="flex items-center w-full px-[20px] ">
              <div
                className="flex cursor-pointer items-center w-full py-2 rounded-[6px] border border-[#E4E7EC] gap-[8px] text-[14px] font-medium pl-[20px] pr-1  text-[#202B37]"
                onClick={() => {
                  toggle(), setTypeOfModal({ type: 'task', position: null });
                }}
              >
                <PlusIcon className="w-5 h-5 text-[#000000]" /> Add new task
              </div>
            </div>
          )}
        <div
          className=" px-[20px] flex flex-col h-[410px] overflow-auto scroll"
          id="task-colomn"
        >
          {filteredData?.map((task: any, index: number) =>
            task?.type === 'task' ? (
              <div>
                <div
                  className={`relative flex bg-white border border-[#E4E7EC] rounded-md radius-[6px] p-[16px] gap-4 cursor-pointer ${draggedOverId === index ? 'shadow-md ' : ''
                    }`}
                  key={index}
                  onClick={() => {
                    toggle(),
                      setTypeOfModal({ type: 'task', selectedTask: task });
                  }}
                  draggable={filterType === 'all_tasks' ? true : false}
                  onDragStart={(e) => {
                    e.stopPropagation();
                    setDraggedItem(task);
                  }}
                  onDragEnd={(e) => {
                    e.stopPropagation();
                    setDraggedOverId(null);
                  }}
                  onDragOver={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setDraggedOverId(index);
                  }}
                  onDrop={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    handleDrop(e, index);
                  }}
                >
                  <div className="pt-0.5">
                    {!task?.is_completed ? (
                      delayOrLate(
                        task?.task_status_id?.status_name,
                        toUTCEndOfDay(task?.planned_end_datetime) || undefined,
                        toUTCEndOfDay(task?.end_datetime) || undefined
                      ) ? (
                        <span>
                          <ProjectTaskDelayedOrLate />
                        </span>
                      ) : (
                        // <input
                        //   type="radio"
                        //   className="rounded-full w-4 h-4"
                        //   onChange={() => markAsDone(task?._id)}
                        // />
                        <div
                          className="w-4 h-4 rounded-full border-[1.7px] border-[#97A1AF] cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation(),
                              markAsDone(true, undefined, undefined, task?._id);
                          }}
                        ></div>
                      )
                    ) : (
                      <span>
                        <ProjectTaskCompletedIcon />
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col w-full">
                    <div className="flex w-full">
                      <div className="text-[14px] text-[#141C24] font-medium w-full">
                        {task?.title}
                      </div>
                      {task?.is_critical && (
                        <div className="flex justify-end">
                          <CriticalTaskIcon />
                        </div>
                      )}
                    </div>
                    <div className="text-[12px] font-normal text-[#637083] pt-[6px]">
                      {task?.notes}
                    </div>
                    <div className="flex text-[14px] font-normal text-[#202B37] items-center pt-[16px]">
                      <div className="flex items-center gap-2 pr-[16px] w-fit">
                        {/* <Calendar className="w-[15px] h-[15px]" /> */}
                        {task?.is_completed ? 'Completed on ' : 'Ends on '}
                        {dayjs(toUTCEndOfDay(task?.end_datetime)).format('MMM DD, YYYY')}
                        {/* {task?.is_critical
                          ? dayjs(task?.target_date).format('MMM DD, YYYY')
                          : dayjs(task?.end_datetime).format('MMM DD, YYYY')} */}
                        {delayOrLate(
                          task?.task_status_id?.status_name,
                          toUTCEndOfDay(task?.planned_end_datetime) || undefined,
                          toUTCEndOfDay(task?.end_datetime) || undefined
                        ) && (
                            <div
                              // type="button"
                              className="min-w-[110px] px-1 py-1 text-center flex justify-center items-center bg-[#FFEECC] text-[#344051] font-normal rounded-[150px] text-[12px] cursor-pointer"
                            >
                              <span>
                                {delayOrLate(
                                  task?.task_status_id?.status_name,
                                  toUTCEndOfDay(task?.planned_end_datetime) || undefined,
                                  toUTCEndOfDay(task?.end_datetime) || undefined
                                )}
                              </span>
                            </div>
                          )}
                      </div>
                      {task?.assignee_id?.first_name && (
                        <div className="border-l h-[12px] mt-[2px] border-[#CED2DA]"></div>
                      )}
                      {task?.assignee_id?.first_name && (
                        <span className="pr-[16px]  px-[16px]">
                          {task?.assignee_id?.first_name +
                            ' ' +
                            task?.assignee_id?.last_name}
                        </span>
                      )}
                      {task?.task_status_id?.status_name && (
                        <div className="border-l h-[12px] mt-[2px] border-[#CED2DA]"></div>
                      )}
                      {task?.task_status_id?.status_name && (
                        <span className="pl-[16px]">
                          {task?.task_status_id?.status_name}
                        </span>
                      )}
                    </div>
                  </div>
                  <div
                    className={`absolute -top-[12px] right-[0px] w-full items-center`}
                  >
                    <hr
                      className={`${draggedOverId === index ? 'border-[#7FB2FF] ' : 'hidden'
                        }`}
                    />
                  </div>
                </div>
                {filterType === 'all_tasks' &&
                  customerDropdown?.value === 'active_projects' ? (
                  <div
                    className={`flex w-full items-center opacity-0 hover:opacity-100 transition-opacity duration-300`}
                  >
                    <Dropdown className="relative dropdown shrink-0">
                      <Dropdown.Trigger
                        type="button"
                        className=" !p-0 ease-linear rounded-full text-topbar-item"
                        id="dropdownMenuButton"
                        data-bs-toggle="dropdown"
                      >
                        <span className="text-[14px] font-medium text-[#3B82F6]  flex items-center cursor-pointer">
                          Add
                          <ChevronDown className="w-[20px] h-[20px]" />
                        </span>
                      </Dropdown.Trigger>
                      <Dropdown.Content
                        placement="start-end"
                        data-bs-toggle="dropdown"
                        className="absolute z-[1000] px-[20px] !top-[4px] py-[15px] ltr:text-left rtl:text-right bg-white rounded-md border-[#CED2DA] border shadow-md dropdown-menu w-[8.5rem] dark:bg-zink-600"
                        aria-labelledby="dropdownMenuButton"
                      >
                        <div className="flex flex-col w-full text-[16px] text-[#141C24] space-y-2">
                          <button
                            className="flex text-[14px] items-start font-normal close-dropdown "
                            onClick={() => {
                              toggle(),
                                setTypeOfModal({
                                  type: 'task',
                                  position: index + 1,
                                });
                            }}
                          >
                            New task
                          </button>
                          <button
                            className="flex text-[14px] text-nowrap items-start font-normal close-dropdown "
                            onClick={() => {
                              toggle(),
                                setTypeOfModal({
                                  type: 'milestone',
                                  position: index + 1,
                                });
                            }}
                          >
                            New milestone
                          </button>
                        </div>
                      </Dropdown.Content>
                    </Dropdown>
                    <div className="w-full items-center">
                      <hr className="border-[#7FB2FF]" />
                    </div>
                  </div>
                ) : (
                  <div className="flex w-full items-center opacity-0 hover:opacity-100 transition-opacity duration-300 h-[24px]"></div>
                )}
              </div>
            ) : (
              <div>
                <div
                  className={`relative flex border bg-[#F9FAFB] border-[#E4E7EC] rounded-md radius-[6px] p-[16px] gap-4 cursor-pointer ${draggedOverId === index ? 'shadow-md' : ''
                    }`}
                  id={`milestone-${task?._id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggle();
                    setTypeOfModal({
                      type: 'milestone',
                      selectedTask: task,
                    });
                  }}

                  //   () => {
                  //   setSelectedMileStone(task);
                  //   setShowMilestoneModal(true);
                  // }}
                  draggable={filterType === 'all_tasks' ? true : false}
                  onDragEnd={(e) => {
                    e.stopPropagation();
                    setDraggedOverId(null);
                  }}
                  onDragStart={(e) => {
                    e.stopPropagation();
                    setDraggedItem(task);
                  }}
                  onDragOver={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setDraggedOverId(index);
                  }}
                  onDrop={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    handleDrop(e, index);
                  }}
                  key={index}
                >
                  <div>
                    {task?.is_completed ? (
                      <TaskCompleteIcon />
                    ) : (
                      <MilestoneIcon className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex flex-col w-full">
                    <div className="text-[14px] text-[#141C24] font-medium w-full">
                      {task?.title}
                    </div>
                    <div className="text-[12px] font-normal text-[#637083] pt-[6px]">
                      {task?.notes}
                    </div>
                    <div className="flex text-[14px] font-normal text-[#202B37] items-center pt-[16px]">
                      <div className="flex items-center gap-2 pr-[16px] w-fit">
                        {/* <Calendar className="w-[15px] h-[15px]" /> */}
                        {task?.is_completed ? 'Completed on ' : 'Ends on '}
                        {dayjs(toUTCEndOfDay(task?.end_datetime)).format('MMM DD, YYYY')}
                        {/* {task?.is_critical
                          ? dayjs(task?.target_date).format('MMM DD, YYYY')
                          : dayjs(task?.end_datetime).format('MMM DD, YYYY')} */}
                        {delayOrLate(
                          task?.task_status_id?.status_name,
                          toUTCEndOfDay(task?.planned_end_datetime) || undefined,
                          toUTCEndOfDay(task?.end_datetime) || undefined
                        ) && (
                            <div
                              // type="button"
                              className="min-w-[110px] px-1 py-1 text-center flex justify-center items-center bg-[#FFEECC] text-[#344051] font-normal rounded-[150px] text-[12px] cursor-pointer"
                            >
                              <span>
                                {delayOrLate(
                                  task?.task_status_id?.status_name,
                                  toUTCEndOfDay(task?.planned_end_datetime) || undefined,
                                  toUTCEndOfDay(task?.end_datetime) || undefined
                                )}
                              </span>
                            </div>
                          )}
                      </div>
                      {task?.assignee_id?.first_name && (
                        <div className="border-l h-[12px] mt-[2px] border-[#CED2DA]">
                          {' '}
                        </div>
                      )}
                      {task?.assignee_id?.first_name && (
                        <span className="pr-[16px]  px-[16px]">
                          {task?.assignee_id?.first_name +
                            ' ' +
                            task?.assignee_id?.last_name}
                        </span>
                      )}
                      {task?.task_status_id?.status_name && (
                        <div className="border-l h-[12px] mt-[2px] border-[#CED2DA]"></div>
                      )}
                      {task?.task_status_id?.status_name && (
                        <span className="pl-[16px]">
                          {task?.task_status_id?.status_name === 'New'
                            ? 'Open'
                            : 'Completed'}
                        </span>
                      )}
                    </div>
                  </div>
                  <div
                    className={`absolute -top-[12px] right-[0px] w-full items-center`}
                  >
                    <hr
                      className={`${draggedOverId === index ? 'border-[#7FB2FF] ' : 'hidden'
                        }`}
                    />
                  </div>
                </div>
                {filterType === 'all_tasks' &&
                  customerDropdown?.value === 'active_projects' ? (
                  <div className="flex w-full items-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                    <Dropdown className="relative dropdown shrink-0">
                      <Dropdown.Trigger
                        type="button"
                        className=" !p-0 ease-linear rounded-full text-topbar-item"
                        id="dropdownMenuButton"
                        data-bs-toggle="dropdown"
                      >
                        <span className="text-[14px] font-medium text-[#3B82F6]  flex items-center cursor-pointer">
                          Add
                          <ChevronDown className="w-[20px] h-[20px]" />
                        </span>
                      </Dropdown.Trigger>
                      <Dropdown.Content
                        placement="start-end"
                        data-bs-toggle="dropdown"
                        className="absolute z-[1000] px-[20px] !top-[4px] py-[15px] ltr:text-left rtl:text-right bg-white rounded-md border-[#CED2DA] border shadow-md dropdown-menu w-[8.5rem] dark:bg-zink-600"
                        aria-labelledby="dropdownMenuButton"
                      >
                        <div className="flex flex-col w-full text-[16px] text-[#141C24] space-y-2">
                          <button
                            className="flex text-[14px] items-start font-normal close-dropdown "
                            onClick={() => {
                              toggle(),
                                setTypeOfModal({
                                  type: 'task',
                                  position: index + 1,
                                });
                            }}
                          >
                            New task
                          </button>
                          <button
                            className="flex text-[14px] text-nowrap items-start font-normal close-dropdown "
                            onClick={() => {
                              toggle(),
                                setTypeOfModal({
                                  type: 'milestone',
                                  position: index + 1,
                                });
                            }}
                          >
                            New milestone
                          </button>
                        </div>
                      </Dropdown.Content>
                    </Dropdown>
                    <div className="w-full items-center">
                      <hr className="border-[#7FB2FF]" />
                    </div>
                  </div>
                ) : (
                  <div className="flex w-full items-center opacity-0 hover:opacity-100 transition-opacity duration-300 h-[24px]"></div>
                )}
              </div>
            )
          )}
        </div>
      </div>
      <div className="p-[20px] w-[420px] h-[480px] overflow-auto scroll">
        {data?.customer_project_plan?.summary && (
          <div className="flex flex-col gap-2 pb-[9px]">
            <span className="text-[14px] font-medium text-[#202B37]">
              Summary
            </span>
            <p className="text-[12px] font-normal text-[#000000]">
              {data?.customer_project_plan?.summary}
            </p>
          </div>
        )}
        <div className="pt-[3px]">
          <span className="text-[14px] font-medium text-[#202B37]">
            Milestones
          </span>
          {data?.tasks
            ?.filter((task: any) => task?.type === 'milestone')
            ?.map(
              (task: any, index: number) =>
                task?.type === 'milestone' && (
                  <div
                    className="pt-[12px] flex cursor-pointer"
                    key={index}
                    onClick={() => {
                      const container = document.getElementById('task-colomn');
                      const target = document.getElementById(
                        `milestone-${task?._id}`
                      );
                      if (container && target) {
                        const offsetTop =
                          target.offsetTop - container.offsetTop;
                        container.scrollTo({
                          top: offsetTop,
                          behavior: 'smooth',
                        });
                      }
                    }}
                  >
                    <div
                      className={`text-[14px] font-medium text-[#202B37] bg-[#F2F4F7] w-[32px] h-[36px] flex items-center justify-center rounded-md border ${task?.is_completed
                          ? 'border-[#249782]'
                          : 'border-transparent'
                        }`}
                    >
                      {index + 1}
                    </div>
                    <div className="flex flex-col pl-[8px]">
                      <span className="text-[14px] font-medium text-[#202B37] leading-5">
                        {task?.title}
                      </span>
                      <span className="text-[12px] font-normal text-[#637083]">
                        {dayjs(toUTCEndOfDay(task?.end_datetime)).format("MMM DD, YYYY")}
                        {!dayjs(toUTCEndOfDay(task?.planned_end_datetime)).isSame(
                          dayjs(toUTCEndOfDay(task?.end_datetime))
                        ) && (
                            <> | {`Planned: ${dayjs(toUTCEndOfDay(task?.planned_end_datetime)).format("MMM DD, YYYY")}`}</>
                          )
                        }
                      </span>

                    </div>
                  </div>
                )
            )}
        </div>
        {customerDropdown?.value === 'active_projects' && (
          <div className="pt-[12px] flex">
            <button
              className="flex items-center gap-[8px] text-[14px] font-medium text-[#202B37]"
              onClick={() => {
                toggle(),
                  setTypeOfModal({
                    type: 'milestone',
                    position: null,
                  });
              }}
            >
              <PlusIcon className="w-5 h-5 text-[#000000]" /> Add new
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
