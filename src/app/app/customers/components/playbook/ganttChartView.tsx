import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/light.css';
import { CheckIcon } from '../../../../../app/assests/icons/icons';
import { useUpdateTask } from '../../../../../services/mutations/tasksMutations';
import dayjs from 'dayjs';
import { useState, useMemo } from 'react';
import { toast } from 'react-toastify';
import { followCursor } from 'tippy.js';
import { toUTCDateOnly, toUTCEndOfDay, normalizeDate } from '../../../../../app/utils/date-util';
interface Task {
  _id: string;
  title: string;
  type: string;
  is_completed: boolean;
  task_status_id: {
    status_name: string;
  };
  planned_start_datetime: string;
  planned_end_datetime: string;
  start_datetime?: string;
  end_datetime?: string;
}

export default function GanttChartView({
  data,
  statusArr,
  toggle,
  setTypeOfModal,
}: any) {
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [showMilestoneModal, setShowMilestoneModal] = useState<boolean>(false);
  const [task, setTask] = useState<any>();
  const updateTask = useUpdateTask();

  // Memoize expensive calculations
  const { startDate, endDate } = useMemo<{
    startDate: Date | null;
    endDate: Date | null;
  }>(() => {
    // Check if we have valid date values
    const hasValidDates =
      data?.customer_project_plan?.min_planned_start_date ||
      data?.customer_project_plan?.min_start_date;
    if (!hasValidDates) {
      return {
        startDate: toUTCDateOnly(data.customer_project_plan.project_start_date),
        endDate: toUTCEndOfDay(data.customer_project_plan.project_start_date),
      };
    }

    // Original logic when dates are available
    const plannedStart = toUTCDateOnly(
      data.customer_project_plan.min_planned_start_date
    );
    const startDateTime = toUTCDateOnly(data.customer_project_plan.min_start_date);
    const plannedEnd = toUTCEndOfDay(
      data.customer_project_plan.max_planned_end_date
    );
    const endDateTime = toUTCEndOfDay(data.customer_project_plan.max_end_date);
    if (!plannedStart || !startDateTime || !plannedEnd || !endDateTime) {
      return { startDate: startDateTime || plannedStart, endDate: endDateTime || plannedEnd };
    }
    const startDate = plannedStart < startDateTime ? plannedStart : startDateTime;
    const endDate = plannedEnd < endDateTime ? endDateTime : plannedEnd;
    endDate.setDate(endDate.getDate() + 2);
    return {
      startDate,
      endDate,
    };
  }, [data?.customer_project_plan]);

  const markAsDone = async (id: any) => {
    const doneStatusId = statusArr?.data?.data?.filter(
      (ele: any) => ele?.status_name == 'Done'
    )[0]?._id;
    const data = {
      _id: id,
      task_status_id: doneStatusId,
      is_completed: true,
    };
    try {
      const res = await updateTask?.mutateAsync(data);
      if (res?.status == 200 || res?.status == 201) {
        toast?.success('Task completed.');
      }
    } catch (err: any) {
      toast?.error(err?.message);
    }
  };

  const generateDateArray = (start: Date | null, end: Date | null): Date[] => {
    const dates: Date[] = [];
    let currentDate = new Date(start || new Date());
    let count = 0;
    let cend = new Date(end || dayjs(start).add(1, 'month').toDate());
    while ((currentDate <= cend || count < 32)) {
      dates.push(new Date(currentDate.getTime()));
      currentDate.setDate(currentDate.getDate() + 1);
      count++;
    }
    return dates;
  };

  const dates = generateDateArray(startDate, endDate);

  const months = Array.from(
    new Set(
      dates.map((date: any) =>
        date.toLocaleString('default', { month: 'long', year: 'numeric' })
      )
    )
  );
  // Get task status and colors
  const getTaskColors = (task: Task) => {
    const isCompleted = task.is_completed;
    const isStarted = task.task_status_id?.status_name !== 'New';
    const isStable =
      task.end_datetime &&
      task.planned_end_datetime &&
      task.start_datetime &&
      task.planned_start_datetime &&
      toUTCDateOnly(task.start_datetime)?.toDateString() ===
      toUTCDateOnly(task.planned_start_datetime)?.toDateString() &&
      toUTCEndOfDay(task.end_datetime)?.toDateString() === toUTCEndOfDay(task.planned_end_datetime)?.toDateString();
    const enddate = normalizeDate(toUTCEndOfDay(task.end_datetime));
    const plannedenddate = normalizeDate(toUTCEndOfDay(task.planned_end_datetime));
    const isDelayed =
      enddate &&
      plannedenddate &&
      enddate > plannedenddate;
    const plannedColor = isCompleted
      ? '#D9F2E5'
      : isDelayed
        ? '#FFEECC'
        : '#F9FAFB';

    const actualColor = isCompleted
      ? '#249782'
      : isDelayed
        ? isStarted
          ? '#EAB308'
          : '#FFEECC'
        : isStarted
          ? '#CED2DA'
          : '#F9FAFB';

    return {
      plannedColor,
      actualColor,
      isStable,
      isCompleted,
      isDelayed,
      isStarted,
    };
  };

  const getTaskPosition = (task: Task, isActual: boolean = false) => {
    const startDateTime =
      isActual && task.start_datetime
        ? toUTCDateOnly(task.start_datetime)
        : toUTCDateOnly(task.planned_start_datetime);
    const endDateTime =
      isActual && task.end_datetime
        ? toUTCEndOfDay(task.end_datetime)
        : toUTCEndOfDay(task.planned_end_datetime);

    // normalize to YYYY-MM-DD (ignore time)
    const start = dayjs(startDateTime).startOf('day');
    const end = dayjs(endDateTime).startOf('day');

    const startIndex = dates.findIndex(
      (date) => dayjs(date).format('YYYY-MM-DD') === start.format('YYYY-MM-DD')
    );

    // ensure at least 1 day duration
    const duration = Math.max(end.diff(start, 'day') + 1, 1);

    const width = duration * 38;
    const left = (startIndex >= 0 ? startIndex : 0) * 38;

    return { left, width, startIndex, duration };
  };

  return (
    <div className="flex">
      <div
        className="w-full"
        style={{
          resize: 'vertical',
          height: data?.tasks?.length <= 3 ? '276px' : '460px',
        }}
      >
        <div className="relative">
          <table className="border-collapse border-gray-400 overflow-y-auto scroll">
            <thead className="sticky top-0 z-20">
              <tr>
                {months.map((month, index) => (
                  <th
                    key={index}
                    colSpan={
                      dates.filter(
                        (date) =>
                          date.toLocaleString('default', {
                            month: 'long',
                            year: 'numeric',
                          }) === month
                      ).length
                    }
                    className="text-start text-[#414E62] sticky top-0 px-3 bg-gray-100 py-2 text-xs font-medium z-30"
                    style={{
                      boxShadow: index === 0 ? 'none' : 'inset 1px 0 0 #CED2DA',
                    }}
                  >
                    {month}
                  </th>
                ))}
              </tr>
              <tr>
                {dates &&
                  dates.map((date: any, index: number) => (
                    <td
                      key={index}
                      className={
                        date.toDateString() === new Date().toDateString()
                          ? 'text-center text-xs font-normal text-white bg-blue-500 border-b border-[#E4E7EC]'
                          : 'text-center text-xs font-normal text-[#414E62] bg-gray-50 border-b border-[#E4E7EC]'
                      }
                    >
                      <div className="relative w-[36px] h-[56px] items-center justify-center flex">
                        <div className="w-full">{date.getDate()}</div>
                        {data?.tasks
                          ?.filter((task: any) => task?.type === 'milestone')
                          .map(
                            (task: any) =>
                              dayjs(toUTCEndOfDay(task?.end_datetime)).toDate().toDateString() ===
                              date.toDateString() && (
                                <Tippy
                                  key={task._id}
                                  content={
                                    <div className="flex flex-col w-fit">
                                      <span className="text-[16px] font-medium text-[#141C24]">
                                        {task?.title}
                                      </span>
                                      <span className="text-xs font-normal text-[#414E62]">
                                        {task?.is_completed
                                          ? 'Completed'
                                          : 'Set for,'}{' '}
                                        {dayjs(toUTCEndOfDay(task?.end_datetime)).format(
                                          'MMM DD, YYYY'
                                        )}{' '}
                                      </span>
                                    </div>
                                  }
                                  className="!rounded-[6px]"
                                  theme="light !rounded-[6px] !no-shadow"
                                  placement="bottom-start"
                                  maxWidth={600}
                                  arrow={true}
                                  offset={[0, 6]}
                                  plugins={[followCursor]}
                                  followCursor={true}
                                  interactive={false}
                                  animation="scale"
                                  duration={0}
                                >
                                  <div
                                    className="absolute -bottom-[2px] left-[29px] cursor-pointer"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setTask(task);
                                      setShowDetailModal(true);
                                      toggle();
                                      setTypeOfModal({
                                        type: 'milestone',
                                        selectedTask: task,
                                      });
                                    }}
                                  >
                                    <svg
                                      width="16"
                                      height="16"
                                      viewBox="0 0 21 20"
                                      fill={
                                        task?.is_completed
                                          ? '#249782'
                                          : `${getTaskColors(task).isDelayed
                                            ? '#EAB308'
                                            : 'none'
                                          }` || 'none'
                                      }
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <rect
                                        x="10.5"
                                        y="0.707107"
                                        width="13.1422"
                                        height="13.1422"
                                        transform="rotate(45 10.5 0.707107)"
                                        stroke={
                                          task?.is_completed
                                            ? '#249782'
                                            : `${getTaskColors(task).isDelayed
                                              ? '#EAB308'
                                              : '#97A1AF'
                                            }`
                                        }
                                      />
                                    </svg>
                                  </div>
                                </Tippy>
                              )
                          )}
                      </div>
                    </td>
                  ))}
              </tr>
            </thead>
            <tbody>
              {data?.tasks?.map(
                (task: Task, taskIndex: number) =>
                  task?.type === 'task' && (
                    <tr
                      key={task._id}
                      className="border-t first:border-0 border-gray-200 bg-white"
                    >
                      <td colSpan={dates.length} className="relative py-1">
                        <div className="relative h-[60px] flex flex-col justify-center">
                          {/* Planned Bar (Light/Transparent) */}
                          {/* Planned Bar (Light/Transparent) - FIXED */}
                          {!getTaskColors(task).isStable && (
                            <Tippy
                              content={
                                <div className="flex flex-col ">
                                  <span className="text-[16px] font-medium text-[#141C24]">
                                    {task.title}
                                  </span>
                                  <div className="flex justify-start items-center gap-2">
                                    <span className="text-xs text-[#414E62]">
                                      Planned
                                    </span>
                                    <span className="text-xs text-[#414E62]">
                                      {dayjs(
                                        toUTCDateOnly(task.planned_start_datetime)
                                      ).format('MMM DD, YYYY')}
                                    </span>
                                    <span className="text-[#E4E7EC]">-</span>
                                    <span className="text-xs text-[#414E62]">
                                      {dayjs(toUTCEndOfDay(task.planned_end_datetime)).format(
                                        'MMM DD, YYYY'
                                      )}
                                    </span>
                                  </div>
                                </div>
                              }
                              theme="light rounded-[6px] no-shadow"
                              className="p-1 max-w-[500px]"
                              placement="top-start"
                              maxWidth={600}
                              arrow={true}
                              offset={[0, 6]}
                              plugins={[followCursor]}
                              followCursor={true}
                              interactive={false}
                              animation="scale"
                              duration={0}
                            >
                              <div
                                className="absolute h-[52px] rounded-[6px]"
                                style={{
                                  left: `${getTaskPosition(task, false).left
                                    }px`,
                                  width: `${getTaskPosition(task, false).width
                                    }px`,
                                  backgroundColor:
                                    getTaskColors(task).plannedColor,
                                }}
                              >
                                {/* Add some content or padding to make it hoverable */}
                                <div className="w-full h-full"></div>
                              </div>
                            </Tippy>
                          )}
                          {/* Actual Bar (Solid) */}
                          {
                            <div
                              className="absolute h-[36px] rounded-[6px] cursor-pointer flex items-center"
                              style={{
                                left: `${getTaskPosition(task, true).left
                                  }px`,
                                width: `${getTaskPosition(task, true).width
                                  }px`,
                                backgroundColor:
                                  getTaskColors(task).actualColor,
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setTask(task);
                                setShowDetailModal(true);
                                toggle();
                                setTypeOfModal({
                                  type: 'task',
                                  selectedTask: task,
                                });
                              }}
                            >
                              <Tippy
                                content={
                                  <div className="flex flex-col w-fit">
                                    <span className="text-[16px] font-medium text-[#141C24]">
                                      {task.title}
                                    </span>
                                    <div className="flex justify-start items-center gap-2">
                                      {!task?.is_completed && (
                                        <span className="text-xs text-[#414E62]">
                                          {getTaskColors(task).isStable
                                            ? 'Planned'
                                            : 'Projected'}
                                        </span>
                                      )}
                                      {task.start_datetime && (
                                        <span className="text-xs text-[#414E62]">
                                          {dayjs(toUTCDateOnly(task.start_datetime)).format(
                                            'MMM DD, YYYY'
                                          )}
                                        </span>
                                      )}
                                      <span className="text-[#E4E7EC]">-</span>
                                      {task.end_datetime && (
                                        <span className="text-xs text-[#414E62]">
                                          {dayjs(toUTCEndOfDay(task.end_datetime)).format(
                                            'MMM DD, YYYY'
                                          )}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                }
                                className="p-1"
                                theme="light rounded-[6px]"
                                placement="top-start"
                                maxWidth={600}
                                arrow={true}
                                offset={[0, 6]}
                                plugins={[followCursor]}
                                followCursor={true}
                                interactive={false}
                                animation="scale"
                                duration={0}
                              >
                                <div
                                  className={`flex items-center gap-2 px-2 h-full w-full rounded-[6px] ${!getTaskColors(task).isDelayed &&
                                    !getTaskColors(task).isCompleted
                                    ? 'border border-[#CED2DA]'
                                    : !getTaskColors(task).isCompleted &&
                                      !getTaskColors(task).isStarted
                                      ? 'border border-[#EAB308]'
                                      : ''
                                    } `}
                                >
                                  {/* Checkbox/Check Icon */}
                                  <div className="flex items-center">
                                    {!task.is_completed ? (
                                      <span
                                        className="flex items-center"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <input
                                          id={`checkbox-${task._id}`}
                                          className="size-4 border rounded appearance-none cursor-pointer bg-white border-[#CED2DA]"
                                          type="checkbox"
                                          checked={task.is_completed}
                                          onChange={(e) => {
                                            markAsDone(task._id);
                                            e.stopPropagation();
                                          }}
                                        />
                                      </span>
                                    ) : (
                                      <span
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <CheckIcon />
                                      </span>
                                    )}
                                  </div>

                                  {/* Task Title in Bar */}
                                  <div className="text-[14px] text-[#202B37] font-[500] truncate">
                                    {task.title}
                                  </div>
                                </div>
                              </Tippy>
                            </div>
                          }
                        </div>
                      </td>
                    </tr>
                  )
              )}

              {/* Empty rows for spacing */}
              {data?.tasks?.length > 0 &&
                [
                  ...Array(
                    Math.max(
                      6 -
                      data?.tasks?.filter(
                        (task: any) => task?.type === 'task'
                      ).length,
                      0
                    )
                  ).keys(),
                ]?.map((_, index) => (
                  <tr
                    key={`empty-${index}`}
                    className="border-t first:border-0 border-gray-200 bg-white"
                  >
                    <td
                      colSpan={dates.length}
                      className="w-full h-[60px] bg-white"
                    >
                      {/* Empty row for spacing */}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          {/* Today Line */}
          {!dayjs().isBefore(startDate, 'day') &&
            !dayjs().isAfter(endDate, 'day') && (
              <div
                className="absolute border-r top-[80px] bottom-0 border-[#3B82F6] border-1"
                style={{
                  left:
                    dayjs().diff(dayjs(startDate).startOf('day'), 'day') * 38 +
                    19 +
                    'px',
                }}
              />
            )}

          {/* Milestone Lines */}
          {data?.tasks
            ?.filter((task: any) => task?.type === 'milestone')
            .map((task: any, index: number) => (
              <div
                key={`milestone-line-${index}`}
                className={`absolute border-r  top-[80px] bottom-0 z-[0] ${task?.is_completed
                  ? 'border-[#249782]'
                  : `${getTaskColors(task).isDelayed
                    ? 'border-[#EAB308]'
                    : 'border-[#97A1AF]'
                  }`
                  }`}
                style={{
                  left: `${dayjs(toUTCEndOfDay(task?.end_datetime)).diff(
                    dayjs(startDate).startOf('day'),
                    'day'
                  ) *
                    38 +
                    38
                    }px`,
                }}
              />
            ))}
        </div>
      </div>
    </div>
  );
}
