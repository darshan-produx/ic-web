import { Dropdown } from '../../../../common/Dropdown';
import { ChevronDown, PlusIcon } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import GanttChartView from './playbook/ganttChartView';
import { useQuery } from '@tanstack/react-query';
import NormalView from './playbook/normalView';
import dayjs from 'dayjs';
import { useUpdateProject } from '../../../../services/mutations/coustomerProjectMutation';
import { toast } from 'react-toastify';
import AddNewProjectModal from './addNewProjectModal';
import Modal from '../../../../common/components/Modal';
import CreateNewTask from '../../tasks/createNewTask';
import { getCustomers } from '../../../api/customers/customers';
import { getUsersForTask } from '../../../api/users/users';
import { apiRequest } from '../../../../common/api-request';
import { getAllTasksStatus } from '../../../api/tasks/tasks';
import {
  useDeleteTask,
  useUpdateTask,
} from '../../../../services/mutations/tasksMutations';
import ConfirmationModalForEmail from '../../../../common/components/Modal/confirmationModalForEmail';
import ConfirmationPopUp from '../../communication/meetings/components/confirmationPopUp';
import DeleteModal from '../../../../common/components/DeleteModal';
import EmptyState from './playbook/emptyState';
import { toEndUTC } from '../../../utils/date-util';
export default function Playbook({
  customerProjectPlanData,
  setProjectStatus,
  customerId,
  selectedProject,
  setSelectedProject,
  displayName,
}: any) {
  const [customerDropdown, setCustomerDropdown] = useState<{
    label: string;
    value: string;
  }>({ label: 'Active projects', value: 'active_projects' });
  const [isGantt, setIsGantt] = useState(false);
  const updateTask = useUpdateTask();
  const [addNewProjectModal, setAddNewProjectModal] = useState(false);
  const [DeleteConfirmationModalOpen, setDeleteConfirmationModalOpen] =
    useState({ status: false, data: {} });
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [deleteModal, setDeleteModal] = useState<boolean>(false);
  const [disableOverrideStatus, setDisableOverrideStatus] = useState(false);
  const [
    markCompleteConfirmationModalOpen,
    setMarkCompleteConfirmationModalOpen,
  ] = useState(false);
  const [taskCompleteFlag, setTaskCompleteFlag] = useState(false);
  const [
    statusOverrideConfirmationModalOpen,
    setstatusOverrideConfirmationModalOpen,
  ] = useState({
    status: false,
    data: { statusType: '', type: '', currentType: '' },
  });
  const [typeOfModal, setTypeOfModal] = useState<any>({
    type: '',
    position: 0,
    selectedTask: null,
  });
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
  const [show, setShow] = useState<boolean>(false);
  const updateProject = useUpdateProject();
  const projectDetails = useMemo(() => {
    if (customerProjectPlanData?.length > 0) {
      const data = customerProjectPlanData.find(
        (ele: any) => ele?.customer_project_plan?._id === selectedProject
      );
      if (data) {
        return data;
      } else {
        setSelectedProject(
          customerProjectPlanData[0]?.customer_project_plan?._id
        );
        return customerProjectPlanData[0];
      }
    } else {
      return {};
    }
  }, [customerProjectPlanData, selectedProject, customerDropdown]);

  const deleteToggle = () => {
    setDeleteModal(!deleteModal);
  };
  useEffect(() => {
    if (customerProjectPlanData?.length > 0 && !selectedProject) {
      setSelectedProject(
        customerProjectPlanData[0]?.customer_project_plan?._id
      );
    } else if (customerProjectPlanData?.length === 0 && selectedProject) {
      setSelectedProject('');
    }
  }, [customerProjectPlanData]);
  const deleteTask = useDeleteTask();
  const handleDelete = async () => {
    try {
      const res = await deleteTask.mutateAsync(typeOfModal?.selectedTask?._id);
      if (res?.status == 200 || res?.status == 201) {
        setDeleteModal(false);
        setShowDetailModal(false);
        toast.success(
          `${
            typeOfModal?.type === 'milestone'
              ? 'Milestone deleted successfully.'
              : 'Task deleted successfully.'
          }`
        );
        setTypeOfModal({ type: '', selectedTask: null, position: null });
        setShow(false);
      }
    } catch (err: any) {
      toast.error(err.message);
    }
  };
  const updateProjectStatus = async (
    status: string,
    overridden_status_color?: string,
    is_status_overridden?: boolean
  ) => {
    const data = status
      ? {
          id: projectDetails?.customer_project_plan?._id,
          status,
          mark_task_completed: taskCompleteFlag,
        }
      : overridden_status_color
      ? {
          id: projectDetails?.customer_project_plan?._id,
          overridden_status_color,
        }
      : {
          id: projectDetails?.customer_project_plan?._id,
          is_status_overridden,
        };
    try {
      status === 'Deleted' && setSelectedProject('');
      const response = await updateProject.mutateAsync(data);
      if (response?.status === 200 || response?.status === 201) {
        toast?.success('Project updated successfully');
      }
    } catch (e: any) {
      toast.error(e?.response?.message);
    }
  };

  // function getColor(color: string) {
  //   if (color === 'red') {
  //     return '#EF4444';
  //   } else if (color === 'yellow') {
  //     return '#EAB308';
  //   } else if (color === 'green') {
  //     return '#249782';
  //   } else {
  //     return '#CED2DA';
  //   }
  // }

  const toggle = useCallback(() => {
    setShow((prev) => !prev);
  }, []);

  // const markAsDone = async (id: any) => {
  //   const doneStatusId = statusArr?.data?.data?.filter(
  //     (ele: any) => ele?.status_name == 'Done'
  //   )[0]?._id;
  //   const data = {
  //     _id: id,
  //     task_status_id: doneStatusId,
  //     is_completed: true,
  //   };
  const markAsDone = async (
    isProjectTask: boolean,
    endDate?: Date | null,
    cascadingDependency?: boolean,
    id?: any,
    position?: number
  ) => {
    const doneStatusId = statusArr?.data?.data?.filter(
      (ele: any) => ele?.status_name == 'Done'
    )[0]?._id;

    // Base object (always required fields)
    const data: any = {
      _id: id ? id : typeOfModal?.selectedTask?._id,
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
        toast?.success(
          `${
            typeOfModal?.type === 'milestone'
              ? 'Milestone completed successfully.'
              : 'Task completed successfully.'
          }`
        );
        setTypeOfModal({ type: '', selectedTask: null, position: null });
        setShow(false);
      }
    } catch (err: any) {
      toast?.error(err?.message);
    }
  };

  const handleCancel = () => {
    setDeleteConfirmationModalOpen({ status: false, data: {} });
  };

  const handleYes = () => {
    updateProjectStatus('Deleted');
    setDeleteConfirmationModalOpen({ status: false, data: {} });
  };

  const statusUpdateHandleYes = () => {
    updateProjectStatus(
      '',
      statusOverrideConfirmationModalOpen?.data?.statusType
    );
    setstatusOverrideConfirmationModalOpen({
      status: false,
      data: { statusType: '', type: '', currentType: '' },
    });
  };
  const statusUpdateHandleCancel = () => {
    setstatusOverrideConfirmationModalOpen({
      status: false,
      data: { statusType: '', type: '', currentType: '' },
    });
  };

  const handleMarkComplete = () => {
    updateProjectStatus('Completed');
    setMarkCompleteConfirmationModalOpen(false);
  };

  useEffect(() => {
    if (
      projectDetails?.customer_project_plan?.status?.toLowerCase() ===
      'completed'
    ) {
      setDisableOverrideStatus(true);
    } else {
      setDisableOverrideStatus(false);
    }
  }, [projectDetails, customerProjectPlanData, selectedProject]);
  function getWorkingDaysDiff(start: dayjs.Dayjs, end: dayjs.Dayjs): string {
    let count = 0;
    let current = start.startOf('day');
    const endDay = end.startOf('day');

    // If end is before start, we're calculating early days
    if (end.isBefore(start, 'day')) {
      current = endDay;
      while (current.isBefore(start, 'day')) {
        const day = current.day(); // 0 = Sun, 6 = Sat
        if (day !== 0 && day !== 6) {
          count++;
        }
        current = current.add(1, 'day');
      }
      return count > 0 ? `(${count} days early)` : '';
    }

    // If end is after start, we're calculating delay days
    while (current.isBefore(endDay, 'day')) {
      const day = current.day(); // 0 = Sun, 6 = Sat
      if (day !== 0 && day !== 6) {
        count++;
      }
      current = current.add(1, 'day');
    }

    return count > 0 ? `(with ${count} days delay)` : '';
  }
  const projectEndAndDelay = () => {
    const maxPlannedEndDate =
      projectDetails?.customer_project_plan?.max_planned_end_date;
    const maxEndDate = projectDetails?.customer_project_plan?.max_end_date;
    if (maxEndDate || maxPlannedEndDate) {
      const delay = getWorkingDaysDiff(
        dayjs(maxPlannedEndDate),
        dayjs(maxEndDate)
      );
      return `${
        dayjs(maxEndDate).format('MMM DD') ||
        dayjs(maxPlannedEndDate).format('MMM DD')
      } ${delay}`;
    } else {
      return '';
    }
  };
  return (
    <div className="relative">
      <div className='mt-6'>
        <Dropdown className="inline-flex z-[50]">
          <Dropdown.Trigger
            type="button"
            className="bg-white btn w-full !py-1.5 !px-0"
            id="dropdownMenuButton"
            data-bs-toggle="dropdown"
          >
            <div className="flex items-center justify-between w-full text-[16px] text-[#141C24] font-medium">
              <span>{customerDropdown?.label}</span>
              <span className=" ">
                <ChevronDown className="relative !pt-1 !text-[#344051] " />
              </span>
            </div>
          </Dropdown.Trigger>
          <Dropdown.Content
            placement="bottom-end"
            className="absolute z-50 p-2 ltr:text-left rtl:text-right max-h-[300px] scroll overflow-auto  bg-white border-[1px] border-[#CED2DA] rounded-lg shadow-md dropdown-menu  dark:bg-zink-600"
            aria-labelledby="dropdownMenuButton"
          >
            <ul
              className="text-sm text-gray-700 dark:text-gray-200 dropdownClick"
              aria-labelledby="dropdownMenuIconButton"
            >
              {
                <li>
                  <div
                    className="flex items-center after:rounded dark:hover:bg-gray-600 cursor-pointer "
                    onClick={() => {
                      setCustomerDropdown({
                        label: 'Active projects',
                        value: 'active_projects',
                      });
                      setProjectStatus('In-progress');
                      setSelectedProject('');
                    }}
                  >
                    <label
                      htmlFor={`checkbox-item-${999}`}
                      className={`w-full py-1.5 px-2 text-[16px] cursor-pointer ${
                        customerDropdown?.value === 'active_projects'
                          ? 'text-[#3B82F6]'
                          : 'text-[#344051]'
                      } rounded dark:text-gray-300 close-dropdown hover:text-[#3B82F6]`}
                    >
                      Active projects
                    </label>
                  </div>
                </li>
              }{' '}
              <li>
                <div
                  className="flex items-center after:rounded dark:hover:bg-gray-600 cursor-pointer "
                  onClick={() => {
                    setCustomerDropdown({
                      label: 'Completed projects',
                      value: 'completed_projects',
                    });
                    setProjectStatus('Completed');
                    setSelectedProject('');
                  }}
                >
                  <label
                    htmlFor={`checkbox-item-${999}`}
                    className={`w-full py-1.5 px-2 text-[16px] cursor-pointer ${
                      customerDropdown?.value === 'completed_projects'
                        ? 'text-[#3B82F6]'
                        : 'text-[#344051]'
                    } rounded dark:text-gray-300 close-dropdown hover:text-[#3B82F6]`}
                  >
                    Completed projects
                  </label>
                </div>
              </li>
            </ul>
          </Dropdown.Content>
        </Dropdown>
      </div>

      {customerProjectPlanData[0]?.customer_project_plan !== null ? (
        <div className="py-[24px] w-full flex gap-[12px] justify-between ">
          <div className="flex flex-wrap gap-[12px]">
            {customerProjectPlanData?.length > 0 &&
              selectedProject &&
              customerProjectPlanData?.map(
                (item: any, index: number) =>
                  item?.customer_project_plan?.project_name && (
                    <span
                      className={
                        selectedProject === item?.customer_project_plan?._id
                          ? 'border-[1px] border-[#1A75FF] rounded-[8px] text-[14px] font-semibold px-[20px] items-center flex text-[#1A75FF] cursor-pointer h-[40px]'
                          : 'border-[1px] border-[#CED2DA] rounded-[8px] text-[14px] font-semibold px-[20px] items-center flex text-[#344051] cursor-pointer h-[40px]'
                      }
                      onClick={() =>
                        setSelectedProject(item?.customer_project_plan?._id)
                      }
                      key={index}
                    >
                      {item?.customer_project_plan?.project_name}
                    </span>
                  )
              )}
            {customerDropdown?.value === 'active_projects' && (
              <button
                className="border-[1px] flex items-center gap-[8px] border-[#CED2DA] rounded-[8px] text-[14px] font-semibold px-[20px] text-[#344051]"
                onClick={() => setAddNewProjectModal(true)}
              >
                <PlusIcon /> Add new
              </button>
            )}
          </div>
          <div className="h-[40px] py-[2px]">
            <div className="flex items-center border  border-[#CED2DA] rounded-[8px] overflow-hidden h-[36px] !min-w-[104px]">
              <div
                className={
                  isGantt
                    ? 'bg-whitec px-[16px] border-r-[1px] h-full items-center flex border-[#CED2DA] cursor-pointer'
                    : 'px-[16px] border-r-[1px] h-full items-center flex border-[#CED2DA] bg-[#F2F4F7] cursor-pointer'
                }
                onClick={() => setIsGantt(false)}
              >
                <svg
                  width="18"
                  height="13"
                  viewBox="0 0 18 13"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1.5 6.61035H16.5M1.5 1.61035H16.5M1.5 11.6104H16.5"
                    stroke="black"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div
                className={
                  !isGantt
                    ? 'bg-whitec px-[16px] h-full items-center flex border-[#CED2DA] cursor-pointer'
                    : 'px-[16px] h-full items-center flex border-[#CED2DA] bg-[#F2F4F7] cursor-pointer'
                }
                onClick={() => setIsGantt(true)}
              >
                <svg
                  width="18"
                  height="17"
                  viewBox="0 0 18 17"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M1.49935 0.277344C1.95958 0.277344 2.33268 0.650444 2.33268 1.11068V12.1107C2.33268 12.8245 2.33333 13.3098 2.36397 13.6848C2.39382 14.0502 2.44793 14.237 2.51434 14.3673C2.67412 14.6809 2.92909 14.9359 3.2427 15.0957C3.37303 15.1621 3.55987 15.2162 3.92522 15.246C4.30029 15.2767 4.78553 15.2773 5.49935 15.2773H16.4994C16.9596 15.2773 17.3327 15.6504 17.3327 16.1107C17.3327 16.5709 16.9596 16.944 16.4994 16.944H5.46491C4.79412 16.944 4.24048 16.944 3.78949 16.9072C3.32108 16.8689 2.89049 16.7868 2.48605 16.5807C1.85884 16.2611 1.34891 15.7512 1.02932 15.124C0.823249 14.7195 0.741116 14.2889 0.702841 13.8205C0.665991 13.3695 0.666008 12.8159 0.666016 12.1451V1.11068C0.666016 0.650444 1.03911 0.277344 1.49935 0.277344ZM3.99998 4.44403C3.99998 3.98379 4.37308 3.61069 4.83332 3.61069H9.83329C10.2935 3.61069 10.6666 3.98379 10.6666 4.44403C10.6666 4.90427 10.2935 5.27736 9.83329 5.27736H4.83332C4.37308 5.27736 3.99998 4.90427 3.99998 4.44403ZM7.66665 7.77734C7.66665 7.31709 8.03974 6.94401 8.49998 6.94401H12C12.4602 6.94401 12.8333 7.31709 12.8333 7.77734C12.8333 8.23759 12.4602 8.61068 12 8.61068H8.49998C8.03974 8.61068 7.66665 8.23759 7.66665 7.77734ZM11.5 11.1107C11.5 10.6504 11.873 10.2773 12.3333 10.2773H15.6666C16.1269 10.2773 16.5 10.6504 16.5 11.1107C16.5 11.5709 16.1269 11.944 15.6666 11.944H12.3333C11.873 11.944 11.5 11.5709 11.5 11.1107Z"
                    fill="black"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <EmptyState
          setAddNewProjectModal={setAddNewProjectModal}
          customerDropdown={customerDropdown}
        />
      )}
      {projectDetails?.customer_project_plan?.project_name && (
        <div className="border-[#E4E7EC] border  rounded-[10px] overflow-hidden">
          <div className="flex justify-between items-center p-[20px]">
            <div className="flex gap-[10px]">
              <div className="flex flex-col">
                <span className="text-[18px] font-medium text-[#202B37] flex text-nowrap">
                  {projectDetails?.customer_project_plan?.project_name}
                </span>
                <span className="flex gap-2 pt-2 text-[12px] font-medium text-[#637083] ">
                  <span>
                    {
                      projectDetails?.tasks?.filter(
                        (item: any) =>
                          item.is_completed === true && item?.type === 'task'
                      ).length
                    }{' '}
                    out of{' '}
                    {
                      projectDetails?.tasks?.filter(
                        (item: any) => item?.type === 'task'
                      ).length
                    }{' '}
                    done
                  </span>
                  |
                  <span>
                    Started on{' '}
                    {dayjs(
                      projectDetails?.customer_project_plan?.min_start_date ||
                        projectDetails?.customer_project_plan
                          ?.min_planned_start_date ||
                        projectDetails?.customer_project_plan
                          ?.project_start_date
                    ).format('MMM DD')}
                  </span>
                  {projectDetails?.tasks?.length > 0 && '|'}
                  {projectDetails?.tasks?.length > 0 ? (
                    <span>Ends on {projectEndAndDelay()}</span>
                  ) : null}
                </span>
              </div>
            </div>

            <div className="flex gap-[12px] h-[40px]">
              <Dropdown className="relative dropdown shrink-0">
                <Dropdown.Trigger
                  type="button"
                  className=" !p-0 ease-linear rounded-full text-topbar-item"
                  id="dropdownMenuButton"
                  data-bs-toggle="dropdown"
                  disabled={disableOverrideStatus}
                >
                  <div
                    className={`gap-2 border items-center justify-center h-[40px] px-[16px] w-[194px] flex rounded-lg cursor-pointer overflow-hidden close-dropdown ${
                      projectDetails?.customer_project_plan
                        ?.is_status_overridden
                        ? projectDetails?.customer_project_plan
                            ?.overridden_status_color === 'red'
                          ? 'border-[#EF4444] bg-[#FEE7E7] text-[#EF4444]'
                          : projectDetails?.customer_project_plan
                              ?.overridden_status_color === 'yellow'
                          ? 'border-[#EAB308] bg-[#FFF9EB] text-[#EAB308]'
                          : projectDetails?.customer_project_plan
                              ?.overridden_status_color === 'green'
                          ? 'border-[#249782] bg-[#ECF9F2] text-[#249782]'
                          : 'border-[#249782] bg-[#ECF9F2] text-[#249782]'
                        : projectDetails?.customer_project_plan
                            ?.project_status_color === 'red'
                        ? 'border-[#EF4444] bg-[#FEE7E7] text-[#EF4444]'
                        : projectDetails?.customer_project_plan
                            ?.project_status_color === 'yellow'
                        ? 'border-[#EAB308] bg-[#FFF9EB] text-[#EAB308]'
                        : projectDetails?.customer_project_plan
                            ?.project_status_color === 'green'
                        ? 'border-[#249782] bg-[#ECF9F2] text-[#249782]'
                        : 'border-gray-400 bg-[white] text-gray-800'
                    }`}
                    // onClick={() => setModal(!modal)}
                  >
                    <span className="flex items-center justify-center align-center text-[14px] font-semibold">
                      {projectDetails?.customer_project_plan
                        ?.is_status_overridden && (
                        <span>
                          <svg
                            width="14"
                            height="15"
                            viewBox="0 0 14 15"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <g clipPath="url(#clip0_9382_54023)">
                              <path
                                d="M6.86836 10.6406C5.96737 10.6406 5.23438 11.3736 5.23438 12.2746C5.31651 14.4393 8.42055 14.4388 8.50235 12.2746C8.50235 11.3736 7.76933 10.6406 6.86836 10.6406Z"
                                fill={`${
                                  projectDetails?.customer_project_plan
                                    ?.overridden_status_color === 'red'
                                    ? '#EF4444'
                                    : projectDetails?.customer_project_plan
                                        ?.overridden_status_color === 'yellow'
                                    ? '#EAB308'
                                    : projectDetails?.customer_project_plan
                                        ?.overridden_status_color === 'green'
                                    ? '#249782'
                                    : '#249782'
                                }`}
                              />
                              <path
                                d="M8.50065 1.43424C7.68981 0.428407 6.04556 0.427916 5.23438 1.43429C4.82819 1.91787 4.65765 2.55187 4.76652 3.17371C5.09118 5.02863 5.54934 7.6466 5.75496 8.82235C5.98534 10.0599 7.74979 10.0596 7.9799 8.8224L8.96854 3.17371C9.07741 2.55189 8.90688 1.91787 8.50065 1.43424Z"
                                fill={`${
                                  projectDetails?.customer_project_plan
                                    ?.overridden_status_color === 'red'
                                    ? '#EF4444'
                                    : projectDetails?.customer_project_plan
                                        ?.overridden_status_color === 'yellow'
                                    ? '#EAB308'
                                    : projectDetails?.customer_project_plan
                                        ?.overridden_status_color === 'green'
                                    ? '#249782'
                                    : '#249782'
                                }`}
                              />
                            </g>
                            <defs>
                              <clipPath id="clip0_9382_54023">
                                <rect
                                  width="13.2207"
                                  height="13.2207"
                                  fill="white"
                                  transform="translate(0.257812 0.679688)"
                                />
                              </clipPath>
                            </defs>
                          </svg>
                        </span>
                      )}
                      <span>
                        Status:{' '}
                        {projectDetails?.customer_project_plan
                          ?.is_status_overridden
                          ? projectDetails?.customer_project_plan
                              ?.overridden_status_color === 'red'
                            ? 'Overdue'
                            : projectDetails?.customer_project_plan
                                ?.overridden_status_color === 'yellow'
                            ? 'Delayed'
                            : projectDetails?.customer_project_plan
                                ?.overridden_status_color === 'green'
                            ? 'On track'
                            : 'In Progress'
                          : projectDetails?.customer_project_plan
                              ?.project_status_color === 'red'
                          ? 'Overdue'
                          : projectDetails?.customer_project_plan
                              ?.project_status_color === 'yellow'
                          ? 'Delayed'
                          : projectDetails?.customer_project_plan
                              ?.project_status_color === 'green'
                          ? 'On track'
                          : 'NA'}
                      </span>
                      {!disableOverrideStatus && (
                        <span className="flex items-center">
                          <ChevronDown className="h-5 w-7" />
                        </span>
                      )}
                    </span>
                  </div>
                </Dropdown.Trigger>
                <Dropdown.Content
                  placement="bottom-end"
                  data-bs-toggle="dropdown"
                  className="absolute z-[1000] px-[20px] !top-0 right-0 py-[15px] ltr:text-left rtl:text-right bg-white rounded-md border-[#CED2DA] border shadow-md dropdown-menu w-[194px] dark:bg-zink-600"
                  aria-labelledby="dropdownMenuButton"
                >
                  <div className="flex flex-col w-full text-[16px] text-[#141C24] gap-2">
                    {!projectDetails?.customer_project_plan
                      ?.is_status_overridden &&
                      projectDetails?.customer_project_plan
                        ?.project_status_color !== 'gray' && (
                        <div className="flex flex-col gap-2 border-b border-[#CED2DA] pb-[10px]">
                          <span className="text-[12px] text-[#202B37]">
                            System status
                          </span>
                          <button
                            className={`flex text-[14px] w-[152px] font-normal items-center gap-1.5 ] rounded-[12px]  border px-3 py-2 ${
                              projectDetails?.customer_project_plan
                                ?.project_status_color === 'green'
                                ? 'bg-[#ECF9F2] text-[#309161] border-[#249782]'
                                : projectDetails?.customer_project_plan
                                    ?.project_status_color === 'yellow'
                                ? 'bg-[#FFF9EB] text-[#CC8800] border-[#EAB308]'
                                : 'bg-[#FEE7E7] text-[#C20A0A] border-[#EF4444]'
                            }`}
                          >
                            <div className="">
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 14 14"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M7 0.333008C10.6819 0.333008 13.667 3.3181 13.667 7C13.667 10.6819 10.6819 13.667 7 13.667C3.3181 13.667 0.333008 10.6819 0.333008 7C0.333008 3.3181 3.3181 0.333008 7 0.333008ZM10.0938 4.48828C9.8109 4.25257 9.39001 4.29039 9.1543 4.57324L6.28809 8.0127L4.80469 6.52832C4.54443 6.26824 4.12263 6.26835 3.8623 6.52832C3.60196 6.78867 3.60196 7.21133 3.8623 7.47168L5.73242 9.34277C6.07892 9.68927 6.64821 9.66258 6.96191 9.28613L10.1787 5.42676C10.4143 5.14404 10.3763 4.72405 10.0938 4.48828Z"
                                  fill={`${
                                    projectDetails?.customer_project_plan
                                      ?.project_status_color === 'green'
                                      ? '#249782'
                                      : projectDetails?.customer_project_plan
                                          ?.project_status_color === 'yellow'
                                      ? '#EAB308'
                                      : projectDetails?.customer_project_plan
                                          ?.project_status_color === 'red'
                                      ? '#EF4444'
                                      : ''
                                  }`}
                                />
                              </svg>
                            </div>
                            <span>
                              {projectDetails?.customer_project_plan
                                ?.project_status_color === 'green'
                                ? 'On track'
                                : projectDetails?.customer_project_plan
                                    ?.project_status_color === 'yellow'
                                ? 'Delayed'
                                : projectDetails?.customer_project_plan
                                    ?.project_status_color === 'red'
                                ? 'Overdue'
                                : 'NA'}
                            </span>
                          </button>
                        </div>
                      )}
                    <span className="text-[12px] text-nowrap pb-[4px]">
                      {projectDetails?.customer_project_plan
                        ?.is_status_overridden
                        ? 'Overridden status'
                        : 'Override to'}
                    </span>
                    {
                      <button
                        className={
                          projectDetails?.customer_project_plan
                            ?.overridden_status_color === 'green'
                            ? `flex text-[14px] w-[152px] font-normal items-center gap-1.5 bg-[#ECF9F2] text-[#309161] rounded-[12px] border-[#249782] border px-3 py-2`
                            : `flex text-[14px] w-[152px] font-normal items-center gap-1.5 bg-[#ECF9F2] text-[#309161] rounded-[12px] px-3 py-2 border-[#ECF9F2] border`
                        }
                        onClick={
                          () =>
                            setstatusOverrideConfirmationModalOpen({
                              status: true,
                              data: {
                                statusType: 'green',
                                type: 'On track',
                                currentType:
                                  projectDetails?.customer_project_plan
                                    ?.overridden_status_color === 'green'
                                    ? 'On track'
                                    : projectDetails?.customer_project_plan
                                        ?.overridden_status_color === 'yellow'
                                    ? 'Delayed'
                                    : 'Overdue',
                              },
                            })
                          // updateProjectStatus('', 'green')
                        }
                      >
                        <div className="">
                          {projectDetails?.customer_project_plan
                            ?.overridden_status_color === 'green' ? (
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 14 14"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M7 0.333008C10.6819 0.333008 13.667 3.3181 13.667 7C13.667 10.6819 10.6819 13.667 7 13.667C3.3181 13.667 0.333008 10.6819 0.333008 7C0.333008 3.3181 3.3181 0.333008 7 0.333008ZM10.0938 4.48828C9.8109 4.25257 9.39001 4.29039 9.1543 4.57324L6.28809 8.0127L4.80469 6.52832C4.54443 6.26824 4.12263 6.26835 3.8623 6.52832C3.60196 6.78867 3.60196 7.21133 3.8623 7.47168L5.73242 9.34277C6.07892 9.68927 6.64821 9.66258 6.96191 9.28613L10.1787 5.42676C10.4143 5.14404 10.3763 4.72405 10.0938 4.48828Z"
                                fill={`${
                                  projectDetails?.customer_project_plan
                                    ?.overridden_status_color === 'green'
                                    ? '#249782'
                                    : projectDetails?.customer_project_plan
                                        ?.overridden_status_color === 'yellow'
                                    ? '#EAB308'
                                    : '#EF4444'
                                }`}
                              />
                            </svg>
                          ) : (
                            <div className="bg-white border-2 w-4 h-4 border-[#309161] rounded-full close-dropdown "></div>
                          )}
                        </div>
                        <span>On track</span>
                      </button>
                    }
                    {
                      <button
                        className={
                          projectDetails?.customer_project_plan
                            ?.overridden_status_color === 'yellow'
                            ? 'flex text-[14px] w-[152px] font-normal items-center gap-1.5 bg-[#FFF9EB] text-[#CC8800] rounded-[12px] border-[#EAB308] border px-3 py-2'
                            : 'flex text-[14px] w-[152px] font-normal items-center gap-1.5 bg-[#FFF9EB] text-[#CC8800] rounded-[12px] border-[#FFF9EB] border px-3 py-2'
                        }
                        onClick={() =>
                          setstatusOverrideConfirmationModalOpen({
                            status: true,
                            data: {
                              statusType: 'yellow',
                              type: 'Delayed',
                              currentType:
                                projectDetails?.customer_project_plan
                                  ?.overridden_status_color === 'green'
                                  ? 'On track'
                                  : projectDetails?.customer_project_plan
                                      ?.overridden_status_color === 'yellow'
                                  ? 'Delayed'
                                  : 'Overdue',
                            },
                          })
                        }
                      >
                        <div className="">
                          {projectDetails?.customer_project_plan
                            ?.overridden_status_color === 'yellow' ? (
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 14 14"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M7 0.333008C10.6819 0.333008 13.667 3.3181 13.667 7C13.667 10.6819 10.6819 13.667 7 13.667C3.3181 13.667 0.333008 10.6819 0.333008 7C0.333008 3.3181 3.3181 0.333008 7 0.333008ZM10.0938 4.48828C9.8109 4.25257 9.39001 4.29039 9.1543 4.57324L6.28809 8.0127L4.80469 6.52832C4.54443 6.26824 4.12263 6.26835 3.8623 6.52832C3.60196 6.78867 3.60196 7.21133 3.8623 7.47168L5.73242 9.34277C6.07892 9.68927 6.64821 9.66258 6.96191 9.28613L10.1787 5.42676C10.4143 5.14404 10.3763 4.72405 10.0938 4.48828Z"
                                fill={`${
                                  projectDetails?.customer_project_plan
                                    ?.overridden_status_color === 'green'
                                    ? '#249782'
                                    : projectDetails?.customer_project_plan
                                        ?.overridden_status_color === 'yellow'
                                    ? '#EAB308'
                                    : '#EF4444'
                                }`}
                              />
                            </svg>
                          ) : (
                            <div className="bg-white border-2 w-4 h-4 border-[#CC8800] rounded-full close-dropdown "></div>
                          )}
                        </div>
                        <span>Delayed</span>
                      </button>
                    }
                    {
                      <button
                        className={
                          projectDetails?.customer_project_plan
                            ?.overridden_status_color === 'red'
                            ? 'flex text-[14px] w-[152px] font-normal items-center gap-1.5 bg-[#FEE7E7] text-[#C20A0A] rounded-[12px] border-[#EF4444] border px-3 py-2'
                            : 'flex text-[14px] w-[152px] font-normal items-center gap-1.5 bg-[#FEE7E7] text-[#C20A0A] rounded-[12px] border-[#FEE7E7] border px-3 py-2'
                        }
                        onClick={() =>
                          setstatusOverrideConfirmationModalOpen({
                            status: true,
                            data: {
                              statusType: 'red',
                              type: 'Overdue',
                              currentType:
                                projectDetails?.customer_project_plan
                                  ?.overridden_status_color === 'green'
                                  ? 'On track'
                                  : projectDetails?.customer_project_plan
                                      ?.overridden_status_color === 'yellow'
                                  ? 'Delayed'
                                  : 'Overdue',
                            },
                          })
                        }
                      >
                        <div className=" ">
                          {projectDetails?.customer_project_plan
                            ?.overridden_status_color === 'red' ? (
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 14 14"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M7 0.333008C10.6819 0.333008 13.667 3.3181 13.667 7C13.667 10.6819 10.6819 13.667 7 13.667C3.3181 13.667 0.333008 10.6819 0.333008 7C0.333008 3.3181 3.3181 0.333008 7 0.333008ZM10.0938 4.48828C9.8109 4.25257 9.39001 4.29039 9.1543 4.57324L6.28809 8.0127L4.80469 6.52832C4.54443 6.26824 4.12263 6.26835 3.8623 6.52832C3.60196 6.78867 3.60196 7.21133 3.8623 7.47168L5.73242 9.34277C6.07892 9.68927 6.64821 9.66258 6.96191 9.28613L10.1787 5.42676C10.4143 5.14404 10.3763 4.72405 10.0938 4.48828Z"
                                fill={`${
                                  projectDetails?.customer_project_plan
                                    ?.overridden_status_color === 'green'
                                    ? '#249782'
                                    : projectDetails?.customer_project_plan
                                        ?.project_status_color === 'yellow'
                                    ? '#EAB308'
                                    : '#EF4444'
                                }`}
                              />
                            </svg>
                          ) : (
                            <div className="bg-white border-2 w-4 h-4 border-[#EF4444] rounded-full close-dropdown "></div>
                          )}
                        </div>
                        <span>Overdue</span>
                      </button>
                    }

                    {projectDetails?.customer_project_plan
                      ?.is_status_overridden && (
                      <div className="border-t border-[#E4E7EC] -mx-3 px-3">
                        <span className="text-[12px] text-[#202B37] ">
                          Reset to system status
                        </span>
                        <button
                          className={`flex text-[14px] w-[152px] font-normal items-center gap-1.5 ] rounded-[12px]  border px-3 py-2 mt-2 ${
                            projectDetails?.customer_project_plan
                              ?.project_status_color === 'green'
                              ? 'bg-[#ECF9F2] text-[#309161] border-[#ECF9F2]'
                              : projectDetails?.customer_project_plan
                                  ?.project_status_color === 'yellow'
                              ? 'bg-[#FFF9EB] text-[#CC8800] border-[#FFF9EB]'
                              : 'bg-[#FEE7E7] text-[#C20A0A] border-[#FEE7E7]'
                          }`}
                          onClick={() => updateProjectStatus('', '', false)}
                        >
                          <div className="">
                            {projectDetails?.customer_project_plan
                              ?.project_status_color ? (
                              <div
                                className={`bg-white border-2 w-4 h-4 rounded-full close-dropdown ${
                                  projectDetails?.customer_project_plan
                                    ?.project_status_color === 'green'
                                    ? 'border-[#249782]'
                                    : projectDetails?.customer_project_plan
                                        ?.project_status_color === 'yellow'
                                    ? 'border-[#CC8800]'
                                    : 'border-[#EF4444]'
                                }`}
                              ></div>
                            ) : (
                              <div
                                className={`bg-white border-2 w-4 h-4 rounded-full  ${
                                  projectDetails?.customer_project_plan
                                    ?.project_status_color === 'green'
                                    ? 'bg-[#249782]'
                                    : projectDetails?.customer_project_plan
                                        ?.project_status_color === 'yellow'
                                    ? 'bg-[#EAB308]'
                                    : 'bg-[#EF4444]'
                                }`}
                                // onClick={() => updateProjectStatus('green')}
                              ></div>
                            )}
                          </div>
                          <span>
                            {projectDetails?.customer_project_plan
                              ?.project_status_color === 'green'
                              ? 'On track'
                              : projectDetails?.customer_project_plan
                                  ?.project_status_color === 'yellow'
                              ? 'Delayed'
                              : 'Overdue'}
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                </Dropdown.Content>
              </Dropdown>
              {projectDetails?.tasks?.length > 0 &&
                customerDropdown?.value === 'active_projects' && (
                  <button
                    className="border rounded-lg text-[14px] font-semibold px-[20px] flex items-center border-[#CED2DA] text-[#344051]"
                    onClick={() => setMarkCompleteConfirmationModalOpen(true)}
                  >
                    Mark completed
                  </button>
                )}
              {customerDropdown?.value === 'active_projects' && (
                <button
                  className="border rounded-lg text-[14px] font-semibold px-[20px] flex items-center border-[#CED2DA] text-[#344051]"
                  onClick={() =>
                    setDeleteConfirmationModalOpen({ status: true, data: {} })
                  }
                >
                  Delete
                </button>
              )}
            </div>
          </div>
          <div className="border-t border-[#E4E7EC] bg-[#F9FAFB] flex max-h-[610px]">
            {!isGantt ? (
              <NormalView
                data={projectDetails}
                toggle={toggle}
                markAsDone={markAsDone}
                setTypeOfModal={setTypeOfModal}
                customerDropdown={customerDropdown}
              />
            ) : (
              <div className="overflow-auto scroll bg-white">
                <GanttChartView
                  data={projectDetails ?? { tasks: [] }}
                  toggle={toggle}
                  setTypeOfModal={setTypeOfModal}
                  // projectDetails={projectDetails}
                />
              </div>
            )}
          </div>
        </div>
      )}
      {addNewProjectModal && (
        <AddNewProjectModal
          addNewProjectModal={addNewProjectModal}
          setAddNewProjectModal={setAddNewProjectModal}
          customerId={customerId}
          setSelectedProject={setSelectedProject}
        />
      )}
      {markCompleteConfirmationModalOpen && (
        <ConfirmationModalForEmail
          header={`Do you want to mark ${projectDetails?.customer_project_plan?.project_name} customers project as completed??`}
          handleCancel={() => setMarkCompleteConfirmationModalOpen(false)}
          handleYes={() => handleMarkComplete()}
          setTaskCompleteFlag={setTaskCompleteFlag}
          confirmWith={
            projectDetails?.tasks?.filter(
              (ele: any) => ele?.is_completed === false
            )?.length > 0
              ? projectDetails?.tasks?.filter(
                  (ele: any) => ele?.is_completed === false
                )?.length
              : null
          }
          yesText="Mark completed"
          modalOpen={markCompleteConfirmationModalOpen}
        />
      )}
      {statusOverrideConfirmationModalOpen?.status && (
        <ConfirmationModalForEmail
          header={`Override status: ${statusOverrideConfirmationModalOpen?.data?.currentType} to ${statusOverrideConfirmationModalOpen?.data?.type}?`}
          modalOpen={statusOverrideConfirmationModalOpen?.status}
          handleCancel={statusUpdateHandleCancel}
          handleYes={statusUpdateHandleYes}
          yesText={'Yes, override it'}
          title={'You can reset the status to system later if you want.'}
        />
      )}
      {DeleteConfirmationModalOpen?.status && (
        <ConfirmationPopUp
          header={`Do you want to delete ${projectDetails?.customer_project_plan?.project_name} customers project?`}
          modalOpen={DeleteConfirmationModalOpen?.status}
          handleCancel={handleCancel}
          handleYes={handleYes}
          yesText={'Delete'}
          title={'You can’t retrieve associated project details later.'}
        />
      )}
      <Modal
        show={show}
        onHide={toggle}
        id="defaultModal"
        modal-center="true"
        className="fixed flex flex-col transition-all duration-300 ease-in-out left-2/4 z-drawer -translate-x-2/4 -translate-y-2/4"
        dialogClassName="w-screen md:w-[750px] bg-white shadow rounded-md dark:bg-zink-600"
      >
        <Modal.Body className="max-h-[calc(theme('height.screen')_-_61px)] p-4 overflow-y-auto barScroll">
          {show && (
            <>
              <CreateNewTask
                onHide={toggle}
                allCustomers={allCustomers ?? []}
                existingUsers={existingUsers?.data?.data}
                statusArr={statusArr?.data?.data}
                userDetails={userinfo?.data}
                isEditMode={typeOfModal?.selectedTask ? true : false}
                customerId={customerId}
                setDeleteModal={setDeleteModal}
                projectModal={{
                  projectId: projectDetails?.customer_project_plan?._id,
                  projectName:
                    projectDetails?.customer_project_plan?.project_name,
                  tasksDetails: projectDetails?.tasks || [],
                  customerId:
                    projectDetails?.customer_project_plan?.customer_id,
                  type: typeOfModal?.type,
                  position: typeOfModal?.position,
                }}
                markAsDone={markAsDone}
                ele={typeOfModal?.selectedTask ?? ''}
              />
              <DeleteModal
                show={deleteModal}
                onHide={deleteToggle}
                onDelete={handleDelete}
                title={typeOfModal?.type === 'milestone' ? 'milestone' : ''}
              />
            </>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
}
