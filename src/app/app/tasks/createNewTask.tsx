'use client';
import Flatpickr from 'react-flatpickr';
import * as yup from 'yup';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  useCreateTask,
  useUpdateTask,
} from '../../../services/mutations/tasksMutations';
import AsyncSelect from 'react-select/async';
import Select from 'react-select';
import { StylesConfig } from 'react-select';
import { toast } from 'react-toastify';
import { useCheckDomain } from '../../../services/mutations/usersMutations';
import { emailRegEx } from '../../utils/constant';
import { localToUtc, utcToLocal, toStartUTC, toEndUTC, toUTCDateOnly, toUTCEndOfDay, normalizeDate, moveTodayToMonday } from '../../utils/date-util';
import { Dropdown } from '../../../common/Dropdown';
import { ChevronDown, Tag, UserRoundPlus, X } from 'lucide-react';
import Modal from '../../../common/components/Modal';
import dayjs from 'dayjs';
import ButtonLoader from '../../../common/components/buttonloader';
import { useAddTaskMilestone } from '../../../services/mutations/coustomerProjectMutation';
import { useMixpanel } from '../../../common/mixpanel/useMixpanel';
import DependentTaskModal from './dependentTaskModal';
import CascadingConfirmationModal from './cascadingConfirmationModal';
import { getProjectPlan } from '../../api/customer-360/customerProjects/customerProjects';
import { useQuery } from '@tanstack/react-query';
import { findAllTaskToAddDependency } from '../../api/tasks/tasks';

interface props {
  onHide: any;
  allCustomers: any;
  existingUsers: any;
  remindType?: string;
  setRemindType?: any;
  statusArr: any;
  userDetails: any;
  ele?: any;
  done?: any;
  isEditMode?: boolean | undefined;
  guidanceId?: any;
  recipeTreeNodeId?: any;
  setDeleteModal?: any;
  markAsDone?: any;
  isCustomerDropDownDisabled?: boolean;
  customerId?: any;
  isEditMeetingSuggestions?: boolean;
  handleUpdateMeetingTask?: any;
  projectModal?: {
    projectId: any;
    projectName?: any;
    tasksDetails?: any;
    type?: any;
    position?: any;
    customerId?: any;
  };
}

const CreateNewTask = ({
  onHide,
  allCustomers,
  existingUsers,
  statusArr,
  userDetails,
  ele,
  done,
  isEditMode,
  guidanceId,
  setDeleteModal,
  recipeTreeNodeId,
  markAsDone,
  isCustomerDropDownDisabled = false,
  customerId,
  isEditMeetingSuggestions,
  handleUpdateMeetingTask,
  projectModal,
}: props) => {
  const [dependentTasksList, setDependentTasksList] = useState<any[]>([]);
  const [dependencySelectionList, setDependencySelectionList] = useState<any[]>(
    []
  );
  const [delayAfterDependentTask, setDelayAfterDependentTask] = useState(0);
  const [dependentTaskModal, setDependentTaskModal] = useState(false);
  const [isDelayDropdownOpen, setIsDelayDropdownOpen] = useState(false);
  const [markDoneClick, setMarkDoneClick] = useState(false);
  // const [dummy, setDummy] = useState(0);
  const [selectedCustomer, setSelectedCustomer] = useState<{value: string | number, label: string} | null>(null);
  const [selectedStatusName, setSelectedStatusName] = useState('New');
  const [isDelay, setIsDelay] = useState(false);
  const [isLate, setIsLate] = useState(false);
  const [isDataChanged, setIsDataChanged] = useState(false);
  const [selectedStatusId, setSelectedStatusId] = useState(
    statusArr?.find((element: any) => element?.status_name === 'New')?._id
  );
  const [scheduleTask, setScheduleTask] = useState(false);
  const [updateStatus, setUpdateStatus] = useState(false);
  const [noOptionsMessage, setNoOptionsMessage] = useState(
    'Type at least 3 characters to see options'
  );
  const [dueDateError, setDueDateError] = useState('');
  const [selectedDueDate, setSelectedDueDate] = useState<Date | null>(null);
  const [selectedSetForDate, setSelectedSetForDate] = useState<
    Date | null | undefined
  >(null);
  const [projectedSelectedSetForDate, setProjectedSelectedSetForDate] =
    useState<Date | null>(null);
  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>();
  const [previousStartDate, setPreviousStartDate] = useState<Date | null>();
  const [selectedPlannedStartDate, setSelectedPlannedStartDate] =
    useState<Date | null>();
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>();
  const [previousEndDate, setPreviousEndDate] = useState<Date | null>();
  const [selectedPlannedEndDate, setSelectedPlannedEndDate] =
    useState<Date | null>();
  const [delayDropdownTitle, setDelayDropdownTitle] = useState<string>('Delay');
  const [closeConfirmationModal, setCloseConfirmationModal] = useState(false);
  const [isThisTaskClicked, setIsThisTaskClicked] = useState(false);
  const [isDependentTaskClicked, setIsDependentTaskClicked] = useState(false);
  const [cascadingConfirmationModal, setCascadingConfirmationModal] =
    useState(false);
  const [cascadingDependency, setCascadingDependency] = useState(false);
  const [breakDependencyModal, setBreakDependencyModal] = useState(false);
  const [breakDependencyAllowed, setBreakDependencyAllowed] = useState(false);
  const [breakDependencyCancelled, setBreakDependencyCancelled] = useState(false);
  const [isOnThisTaskDependent, setIsOnThisTaskDependent] = useState(false);
  const isFirstRender = useRef(true);
  // const previousDates = useRef<Date | null>();
  const isFirstEndDateChange = useRef(true);
  const isDateErrorOccur = useRef(false);
  const updateTask = useUpdateTask();
  const { trackEvent, MIXPANEL_EVENTS } = useMixpanel();
  const schema = yup.object({
    title: yup.string().required('Please enter title'),
    notes: yup.string(),
    assigneMail: yup.string().nullable(),
    customer_id: yup.number(),
    is_critical: yup.boolean().default(false),
  });

  const addTask = useCreateTask();
  const addTaskMilstone = useAddTaskMilestone();
  const checkDomain = useCheckDomain();
  const flatpickrRef: any = useRef(null);

  const { data: projectPlan } = useQuery({
    queryKey: ['projectPlan', projectModal?.projectId],
    queryFn: () => getProjectPlan(projectModal?.projectId),
    refetchOnWindowFocus: false,
    enabled: !projectModal?.tasksDetails && !!projectModal?.projectId,
  });
  const { data: dependencySelectionData } = useQuery({
    queryKey: ['dependencySelectionData', ele?._id],
    queryFn: () => findAllTaskToAddDependency(ele?._id),
    refetchOnWindowFocus: false,
    enabled: !!projectModal?.projectId && isEditMode === true,
  });
  if (
    projectModal?.projectId &&
    !projectModal?.tasksDetails &&
    projectPlan?.data
  ) {
    projectModal.tasksDetails = projectPlan?.data[0]?.tasks || [];
  }
  // const newTaskStatusId = statusArr?.find(
  //   (item: any) => item?.status_name === 'New'
  // )?._id;
  // useEffect(() => {

  // },[onHide, ele, isEditMode, isEditMeetingSuggestions]);

  // Customer options for searchable dropdown
  const customerOptions = useMemo(
    () => {
      const options = allCustomers?.data?.data?.map((ele: any) => ({
        value: ele.customer_id,
        label: ele.customer_name,
      })) || [];
      // Add "Personal Task" option at the beginning
      return [{ value: 0, label: 'Personal Task' }, ...options];
    },
    [allCustomers]
  );

  // Custom styles for customer Select component
  const customStyles: StylesConfig<any> = {
    control: (provided, state) => ({
      ...provided,
      width: '224px',
      minHeight: '40px',
      borderColor: '#E4E7EC',
      boxShadow: 'none',
      borderRadius: '6px',
      fontFamily: 'Inter',
      fontSize: '14px',
      fontWeight: 400,
      lineHeight: '24px',
      color: '#414E62',
      backgroundColor: '#FFFFFF',
      '&:hover': {
        borderColor: '#E4E7EC',
      },
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      color: '#637083',
      padding: '8px',
      '&:hover': {
        color: '#637083',
      },
    }),
    indicatorSeparator: () => ({
      display: 'none',
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? '#F3F4F6'
        : state.isFocused
          ? '#F9FAFB'
          : 'transparent',
      color: '#111827',
      fontFamily: 'Inter',
      fontWeight: '400',
      fontSize: '14px',
      lineHeight: '24px',
      '&:hover': {
        backgroundColor: '#F9FAFB',
      },
    }),
    placeholder: (provided) => ({
      ...provided,
      color: '#637083',
      fontFamily: 'Inter',
      fontWeight: '400',
      fontSize: '14px',
      lineHeight: '24px',
    }),
    singleValue: (provided) => ({
      ...provided,
      color: '#414E62',
      fontFamily: 'Inter',
      fontWeight: 400,
      fontSize: '14px',
      lineHeight: '24px',
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: '#FFFFFF',
      boxShadow:
        '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      borderRadius: '8px',
      zIndex: 9999,
    }),
    menuPortal: (provided) => ({
      ...provided,
      zIndex: 9999,
    }),
    input: (provided) => ({
      ...provided,
      color: '#637083',
      fontFamily: 'Inter',
      fontSize: '14px',
      lineHeight: '24px',
    }),
  };

  const assigneArr = existingUsers
    ?.map((ele: any) =>
      ele.user?._id
        ? {
          email: ele?.user?.email,
          value: ele.user?._id,
          label: `${ele.user?.first_name} ${ele.user?.last_name}`,
          name: `${ele.user?.first_name} ${ele.user?.last_name}`,
        }
        : null
    )
    ?.filter(Boolean);
  function addWeekdays(date: Date, offset: number, type: 'task' | 'milestone'): Date {
    let result = new Date(date);

    if (offset === 0) {
      if (type === 'milestone') {
        return result;
      } else {
        result.setDate(result.getDate() + 1);
        while (result.getDay() === 0 || result.getDay() === 6) {
          result.setDate(result.getDate() + 1);
        }
        return result;
      }
    }

    let daysToShift = Math.abs(offset);
    let direction = offset > 0 ? 1 : -1;

    if (type === 'task') {
      result.setDate(result.getDate() + 1);
      while (result.getDay() === 0 || result.getDay() === 6) {
        result.setDate(result.getDate() + 1);
      }
    }

    while (daysToShift > 0) {
      result.setDate(result.getDate() + direction);
      const day = result.getDay(); // 0 = Sunday, 6 = Saturday
      if (day !== 0 && day !== 6) {
        daysToShift--;
      }
    }
    return result;
  }

  function addWeekdaysForDuration(startDate: Date, duration: number): Date {
    let result = new Date(startDate);
    let daysAdded = 1;
    while (daysAdded < duration) {
      result.setDate(result.getDate() + 1);
      // Check if it's weekday (Mon–Fri)
      const day = result.getDay(); // 0 = Sun, 6 = Sat
      if (day !== 0 && day !== 6) {
        daysAdded++;
      }
    }
    // result.setHours(0, 0, 0, 0); // ensure midnight
    return result;
  }

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
  const computeDurationDaysFromRange = (
    start: dayjs.Dayjs | Date | string | null | undefined,
    end: dayjs.Dayjs | Date | string | null | undefined
  ) => {
    const s = dayjs(start);
    const e = dayjs(end);
    if (!s.isValid() || !e.isValid() || e.isBefore(s)) return 1;
    let cur = s.clone().startOf('day');
    const last = e.clone().startOf('day');
    let count = 0;
    // use !cur.isAfter(last) instead of cur.isSameOrBefore(last)
    while (!cur.isAfter(last)) {
      const dow = cur.day();
      if (dow !== 0 && dow !== 6) count++;
      cur = cur.add(1, 'day');
    }
    return Math.max(1, count);
  };
  const onSubmitHandler = async (data: any) => {
    setUpdateStatus(true);
    const assigneeMail = data?.assigneMail;
    delete data?.assigneMail;
    if (
      data.is_critical &&
      (selectedDueDate == null || String(selectedDueDate) == 'Invalid Date')
    ) {
      setDueDateError('Please add due date');
      setUpdateStatus(false);
      return;
    }
    if (
      (selectedPlannedStartDate == null ||
        String(selectedPlannedStartDate) == 'Invalid Date') &&
      scheduleTask
    ) {
      setDueDateError('Please select a valid start date');
      setUpdateStatus(false);
      return;
    }

    if (
      (selectedPlannedEndDate == null ||
        String(selectedPlannedEndDate) == 'Invalid Date') &&
      scheduleTask
    ) {
      setDueDateError('Please select a valid end date.');
      setUpdateStatus(false);
      return;
    }
    if (
      projectModal?.type === 'milestone' &&
      (String(selectedSetForDate) === 'Invalid Date' || !selectedSetForDate)
    ) {
      setDueDateError('Please add set for date.');
      setUpdateStatus(false);
      return;
    }
    if (
      projectModal?.type == 'task' &&
      (String(selectedPlannedStartDate) === 'Invalid Date' ||
        (!selectedPlannedStartDate &&
          String(selectedPlannedEndDate) === 'Invalid Date') ||
        !selectedPlannedEndDate)
    ) {
      setDueDateError('Please select schedule task dates.');
      setUpdateStatus(false);
      return;
    }
    const start = normalizeDate(selectedPlannedStartDate);
    const end = normalizeDate(selectedPlannedEndDate);
    if (end && start && end < start) {
      setDueDateError('The end date cannot be earlier than the start date');
      setUpdateStatus(false);
      return;
    }

    // if (
    //   scheduleTask &&
    //   projectModal?.type !== 'milestone' &&
    //   end.getTime() == start.getTime()
    // ) {
    //   setDueDateError('Please select different start and end time');
    //   setUpdateStatus(false);
    //   return;
    // }
    setDueDateError('');

    const duration = computeDurationDaysFromRange(
      selectedPlannedStartDate,
      selectedPlannedEndDate
    );

    const objectIdRegex = /^[a-fA-F0-9]{24}$/;
    const prevIds = dependentTasksList?.map((item) => item._id);
    data = {
      ...data,
      target_date: selectedDueDate,
      customer_id: selectedCustomer?.value,
      planned_start_datetime: toStartUTC(selectedPlannedStartDate),
      planned_end_datetime: toEndUTC(selectedPlannedEndDate),
      start_datetime: toStartUTC(selectedPlannedStartDate),
      end_datetime: toEndUTC(selectedPlannedEndDate),
      task_status_id: statusArr?.find(
        (element: any) => element?.status_name === selectedStatusName
      )?._id,
      is_completed: selectedStatusName.toLowerCase() === 'done' ? true : false,
      assignee_id:
        assigneeMail &&
          objectIdRegex.test(assigneeMail) &&
          !emailRegEx.test(assigneeMail)
          ? assigneeMail
          : !assigneeMail
            ? userDetails?.id
            : undefined,
      assignee_email:
        assigneeMail && emailRegEx.test(assigneeMail) ? assigneeMail : null,
      guidance_id: guidanceId,
      recipe_tree_node_id: recipeTreeNodeId,
      duration_days: duration,
      project_id: projectModal?.projectId,
      prev_task_ids: prevIds || [],
      offset: delayAfterDependentTask || 0,
    };

    if (!data?.assignee_id) delete data?.assignee_id;
    if (!data?.assignee_email) delete data?.assignee_email;

    try {
      if (projectModal?.type === 'task') {
        const response = await addTaskMilstone?.mutateAsync({
          task: {
            ...data,
          },
          id: projectModal?.projectId,
          position: projectModal?.position,
        });
        if (response.status === 200 || response.status === 201) {
          trackTaskEvent(MIXPANEL_EVENTS.TASK_CREATED, data);
          setUpdateStatus(false);
          toast.success('Project task added successfully.');
          allReset();
        }
      } else if (projectModal?.type === 'milestone') {
        const response = await addTaskMilstone?.mutateAsync({
          milestone: {
            ...data,
            planned_start_datetime: toStartUTC(selectedSetForDate),
            planned_end_datetime: toEndUTC(selectedSetForDate),
          },
          id: projectModal?.projectId,
          position: projectModal?.position,
        });
        if (response.status === 200 || response.status === 201) {
          trackTaskEvent(MIXPANEL_EVENTS.TASK_CREATED, data);
          setUpdateStatus(false);
          toast.success('Milestone added successfully.');
          allReset();
        }
      } else {
        const res = await addTask?.mutateAsync(data);
        if (res.status === 200 || res.status === 201) {
          trackTaskEvent(MIXPANEL_EVENTS.TASK_CREATED, data);
          setUpdateStatus(false);
          toast.success('Task added successfully.');
          allReset();
        }
      }
    } catch (err: any) {
      trackEvent(MIXPANEL_EVENTS.TASK_CREATED, {
        success: false,
        error: err?.toString(),
        message: err?.message,
        environment: process.env.NODE_ENV,
        org_id: localStorage.getItem('org_id'),
      });
      setUpdateStatus(false);
      toast.error(err?.message);
    }
    onHide();
    allReset();
  };
  const updateSuggtionTask = (data: any) => {
    const assigneeMail = data?.assigneMail;
    delete data?.assigneMail;
    const objectIdRegex = /^[a-fA-F0-9]{24}$/;
    const payload = {
      ...data,
      _id: ele?._id,
      target_date: toUTCEndOfDay(selectedDueDate),
      customer_id: selectedCustomer?.value,
      planned_start_datetime: toStartUTC(selectedPlannedStartDate),
      planned_end_datetime: toEndUTC(selectedPlannedEndDate),
      start_datetime: toStartUTC(selectedStartDate),
      end_datetime: toEndUTC(selectedEndDate),
      task_status_id: statusArr?.find(
        (element: any) => element?.status_name === selectedStatusName
      )?._id,
      assignee_id:
        assigneeMail &&
          objectIdRegex.test(assigneeMail) &&
          !emailRegEx.test(assigneeMail)
          ? assigneeMail
          : !assigneeMail
            ? userDetails?.id
            : undefined,
      assignee_email:
        assigneeMail && emailRegEx.test(assigneeMail) ? assigneeMail : null,
      guidance_id: guidanceId,
      recipe_tree_node_id: recipeTreeNodeId,
    };
    handleUpdateMeetingTask(payload);
  };
  const updateMilestoneDetails = async (data: any) => {
    setUpdateStatus(true);
    const prevIds = dependentTasksList?.map((item) => item._id);
    data = {
      _id: ele?._id,
      title: data?.title,
      notes: data?.notes,
      start_datetime: toStartUTC(selectedStartDate),
      end_datetime: toEndUTC(selectedEndDate),
      move_cascading_tasks: cascadingDependency ? true : false,
      prev_task_ids: prevIds || [],
      offset: delayAfterDependentTask || 0,
    };
    try {
      const res = await updateTask.mutateAsync(data);
      if (res?.status == 200 || res?.status == 201) {
        toast?.success('Milestone status updated successfully.');
        setUpdateStatus(false);
        setIsDataChanged(false);
        allReset();
        onHide();
      }
    } catch (err: any) {
      setUpdateStatus(false);
      toast.error(err.response?.data?.message);
      setIsDataChanged(false);
    }
    allReset();
  };
  const updateTaskDetails = async (data: any) => {
    setUpdateStatus(true);
    const assigneeMail = data?.assigneMail;
    delete data?.assigneMail;
    if (
      data.is_critical &&
      (String(selectedDueDate) === 'Invalid Date' || !selectedDueDate)
    ) {
      setDueDateError('Please add due date');
      setUpdateStatus(false);
      return;
    }
    let duration = 0;
    if (projectModal?.projectId) {
      if (
        selectedStartDate == null ||
        String(selectedStartDate) == 'Invalid Date'
      ) {
        setDueDateError('Please select a valid start date');
        setUpdateStatus(false);
        return;
      }

      if (
        selectedEndDate == null ||
        String(selectedEndDate) == 'Invalid Date'
      ) {
        setDueDateError('Please select a valid end date');
        setUpdateStatus(false);
        return;
      }
      const start = normalizeDate(selectedStartDate);
      const end = normalizeDate(selectedEndDate);

      if (end && start && end < start) {
        setDueDateError('The end date cannot be earlier than the start date');
        setUpdateStatus(false);
        return;
      }
      duration = computeDurationDaysFromRange(
        selectedStartDate,
        selectedEndDate
      );
    } else {
      const start = normalizeDate(selectedPlannedStartDate);
      const end = normalizeDate(selectedPlannedEndDate);

      if (end && start && end < start) {
        setDueDateError('The end date cannot be earlier than the start date');
        setUpdateStatus(false);
        return;
      }
      // if (scheduleTask && end.getTime() == start.getTime()) {
      //   setDueDateError('Please select valid time');
      //   setUpdateStatus(false);
      //   return;
      // }

      if (selectedPlannedStartDate && selectedPlannedEndDate) {
        duration = computeDurationDaysFromRange(
          selectedPlannedStartDate,
          selectedPlannedEndDate
        );
      }
    }
    const objectIdRegex = /^[a-fA-F0-9]{24}$/;
    const prevIds = dependentTasksList?.map((item) => item._id);
    data = {
      ...data,
      _id: ele?._id,
      target_date: selectedDueDate,
      customer_id: selectedCustomer?.value,
      planned_start_datetime: selectedPlannedStartDate ? toStartUTC(selectedPlannedStartDate) : null,
      planned_end_datetime: selectedPlannedEndDate ? toEndUTC(selectedPlannedEndDate) : null,
      start_datetime: selectedStartDate ? toStartUTC(selectedStartDate) : null,
      end_datetime: selectedEndDate ? toEndUTC(selectedEndDate) : null,
      task_status_id: statusArr?.find(
        (element: any) => element?.status_name === selectedStatusName
      )?._id,
      assignee_id:
        assigneeMail &&
          objectIdRegex.test(assigneeMail) &&
          !emailRegEx.test(assigneeMail)
          ? assigneeMail
          : !assigneeMail
            ? userDetails?.id
            : undefined,
      assignee_email:
        assigneeMail && emailRegEx.test(assigneeMail) ? assigneeMail : null,
      guidance_id: guidanceId,
      recipe_tree_node_id: recipeTreeNodeId,
      sync_dates_this_task:
        isThisTaskClicked && !isDependentTaskClicked ? true : false,
      sync_dates_dependent_task: isDependentTaskClicked ? true : false,
      prev_task_ids: prevIds || [],
      offset: delayAfterDependentTask || 0,
      duration_days: duration,
      move_cascading_tasks: cascadingDependency ? true : false,
    };

    if (!data?.assignee_id) delete data?.assignee_id;
    if (!data?.assignee_email) delete data?.assignee_email;
    if (emailRegEx.test(data?.assignee_email) && data?.assignee_email) {
      delete data?.assignee_id;
    }
    if (projectModal?.projectId) {
      delete data?.planned_start_datetime;
      delete data?.planned_end_datetime;
    } else {
      delete data?.start_datetime;
      delete data?.end_datetime;
    }
    try {
      const res = await updateTask.mutateAsync(data);
      if (res?.status == 200 || res?.status == 201) {
        trackTaskEvent(MIXPANEL_EVENTS.TASK_UPDATED, data);
        toast?.success('Task status updated successfully.');
        allReset();
        onHide();
        // setUpdateStatus(false);
        // setCloseConfirmationModal(false);
        // setIsDataChanged(false);
      }
    } catch (err: any) {
      trackEvent(MIXPANEL_EVENTS.TASK_UPDATED, {
        id: data?._id,
        success: false,
        error: err?.toString(),
        message: err?.message,
        environment: process.env.NODE_ENV,
        org_id: localStorage.getItem('org_id'),
      });
      setUpdateStatus(false);
      toast.error(err.message);
      setCloseConfirmationModal(false);
      setIsDataChanged(false);
    }
    allReset();
    // onHide();
    // reset();
  };
  const fetchOptions = async (inputValue: string) => {
    if (inputValue.length < 3) {
      setNoOptionsMessage('Type at least 3 characters to see options');
      return [];
    } else {
      const filteredAssignees = assigneArr?.filter((item: any) =>
        item?.email.toLowerCase()?.includes(inputValue.toLowerCase())
      );
      if (filteredAssignees?.length > 0) {
        return filteredAssignees;
      } else {
        if (!emailRegEx.test(inputValue)) {
          setNoOptionsMessage('');
          return '';
        }
        try {
          const res = await checkDomain.mutateAsync({ email: inputValue });
          if (res?.data && (res?.status === 201 || res?.status === 200)) {
            setNoOptionsMessage('');
            return [{ value: inputValue, label: inputValue, name: '' }];
          } else {
            setNoOptionsMessage(
              `Assignment to users in ${inputValue.split('@')[1]} not allowed`
            );
            return [];
          }
        } catch (err) {
          setNoOptionsMessage('Error fetching options');
          return [];
        }
      }
    }
  };
  const handleCustomerSelect = (selected: any) => {
    setSelectedCustomer(selected);
    setIsDataChanged(true);
  };


  const handleStatusSelect = (data: any) => {
    setSelectedStatusName(data?.status_name);
    setSelectedStatusId(data?._id);
    setIsDataChanged(true);
    if (ele?.is_completed) return;
    const today = moveTodayToMonday();

    if (data?.status_name?.toLowerCase() === 'in-progress') {
      if (projectModal?.projectId && isEditMode) {
        setSelectedStartDate(today);
      } else {
        setSelectedPlannedStartDate(today);
        setScheduleTask(true);
      }
    } else if (data?.status_name?.toLowerCase() === 'done') {
      if (projectModal?.projectId && isEditMode) {
        setPreviousEndDate(selectedEndDate);
        setSelectedEndDate(today);
      } else {
        setSelectedPlannedEndDate(today);
        setScheduleTask(true);
      }
    }
  };
  const loadOptions = (
    inputValue: string,
    callback: (options: any[]) => void
  ) => {
    fetchOptions(inputValue).then(callback);
  };
  const CustomOption = ({ innerRef, innerProps, data }: any) => {
    const renderInitials = () => {
      if (data?.name) {
        const names = data.name.split(' ');
        const initials =
          names.length > 1
            ? `${names[0]?.charAt(0).toUpperCase()}${names[1]
              ?.charAt(0)
              .toUpperCase()}`
            : `${names[0]?.charAt(0).toUpperCase()}`;
        return initials;
      }
      return null;
    };
    return (
      <div
        ref={innerRef}
        {...innerProps}
        className="custom-option p-1 hover:bg-[#F2F4F7] hover:text-[#202B37]"
      >
        <div className="custom-option-content flex">
          {data?.name && (
            <div className="relative inline-block shrink-0">
              <div className="flex items-center justify-center w-8 h-8 bg-[#F2F4F7] text-[#202B37] rounded-full font-bold text-[10px]">
                {renderInitials()}
              </div>
            </div>
          )}
          <div className="ml-2 flex items-center">
            <span className="text-12 text-left w-[222px] overflow-hidden text-ellipsis whitespace-nowrap cursor-pointer">
              {emailRegEx.test(data?.label) ? (
                <span>
                  <span className="text-gray-400">invite</span> {data?.label}
                </span>
              ) : (
                data?.name || data?.label
              )}
            </span>
          </div>
        </div>
      </div>
    );
  };
  const toggle = useCallback(() => {
    setCloseConfirmationModal((prevShow) => !prevShow);
  }, []);
  useEffect(() => {
    if (customerId) {
      allCustomers?.data?.data.map((element: any) => {
        if (Number(element?.customer_id) === Number(customerId)) {
          setSelectedCustomer({
            value: element?.customer_id,
            label: element?.customer_name,
          });
        }
      });
    }
  }, [allCustomers?.data?.data, customerId, projectModal]);

  useEffect(() => {
    if (projectModal?.projectId) {
      const tasks =
        projectModal?.tasksDetails?.filter((task: any) =>
          ele?.prev_task_ids?.includes(task._id)
        ) || [];
      if (isEditMode) {
        setDependencySelectionList([
          ...new Set([...(dependencySelectionData?.data || []), ...tasks]),
        ]);
      } else {
        setDependencySelectionList(projectModal?.tasksDetails || []);
      }
    }
  }, [dependencySelectionData, projectModal?.tasksDetails, isEditMode]);
  useEffect(() => {
    const tasks =
      projectModal?.tasksDetails?.filter((task: any) =>
        ele?.prev_task_ids?.includes(task._id)
      ) || [];
    setDependentTasksList(tasks);
    setDelayAfterDependentTask(ele?.offset || 0);
  }, [ele?.prev_task_ids, ele?.offset]);
  useEffect(() => {
    if ((ele && isEditMode) || (ele && isEditMeetingSuggestions)) {
      setValue('title', ele?.title);
      setValue('notes', ele?.notes);
      setValue(
        'assigneMail',
        ele?.assignee_id ? ele?.assignee_id?._id : ele?.assignee_email
      );
      setValue('is_critical', ele?.is_critical);
      const customer = allCustomers?.data?.data?.find(
        (element: any) => element?.customer_id === ele?.customer_id
      );
      const taskStatus = statusArr?.find(
        (element: any) =>
          element?._id === ele?.task_status_id?._id ||
          element?._id === ele?.task_status_id
      );
      if (customer) {
        setSelectedCustomer({
          value: customer?.customer_id,
          label: customer?.customer_name,
        });
      } else {
        if (Number(ele?.customer_id) === 0) {
          setSelectedCustomer({ value: 0, label: 'Personal Task' });
        } else {
          setSelectedCustomer(null);
        }
      }
      setSelectedStatusName(taskStatus?.status_name);
      setSelectedStatusId(taskStatus?._id);
      ele?.target_date
        ? setSelectedDueDate(toUTCEndOfDay(ele?.target_date))
        : setSelectedDueDate(null);
      ele?.planned_end_datetime
        ? setSelectedPlannedEndDate(toUTCEndOfDay(ele?.planned_end_datetime))
        : setSelectedPlannedEndDate(null);
      ele?.planned_start_datetime
        ? setSelectedPlannedStartDate(
          toUTCDateOnly(ele?.planned_start_datetime)
        )
        : setSelectedPlannedStartDate(null);
      if (ele?.end_datetime) {
        setSelectedEndDate(toUTCEndOfDay(ele?.end_datetime));
        setPreviousEndDate(toUTCEndOfDay(ele?.end_datetime));
      } else {
        setSelectedEndDate(null);
      }
      if (ele?.start_datetime) {
        setSelectedStartDate(toUTCDateOnly(ele?.start_datetime));
        setPreviousStartDate(toUTCDateOnly(ele?.start_datetime));
      } else {
        setSelectedStartDate(null);
      }
      setIsDelayDropdownOpen(false);
      setDependentTaskModal(false);
      setCascadingConfirmationModal(false);
      if (ele?.planned_end_datetime && ele?.type !== 'milestone') {
        setScheduleTask(true);
      }
      if (ele?.type === 'milestone') {
        setSelectedSetForDate(
          ele?.planned_start_datetime
            ? toUTCEndOfDay(ele?.planned_end_datetime)
            : null
        );
        setProjectedSelectedSetForDate(
          ele?.end_datetime ? toUTCEndOfDay(ele?.end_datetime) : null
        );
      }
    } else {
      reset();
    }
  }, [isEditMode, isEditMeetingSuggestions]);

  // [ele, isEditMode, dummy, isEditMeetingSuggestions]
  useEffect(() => {
    const flag = projectModal?.tasksDetails
      ?.map((task: any) =>
        task?.prev_task_ids?.some((id: any) => id === ele?._id)
      )
      ?.includes(true);
    setIsOnThisTaskDependent(flag);
  }, [projectModal?.tasksDetails]);
  useEffect(() => {
    if (isFirstRender.current) {
      if (!isEditMode) {
        isFirstRender.current = false;
        // setPreviousStartDate(selectedStartDate);
      }
      return;
    } else {
      if (
        selectedStartDate?.toDateString() !== previousStartDate?.toDateString()
      ) {
        const newEndDate = addWeekdaysForDuration(dayjs(selectedStartDate).toDate(), ele?.duration_days || 1);
        if (projectModal?.type !== 'milestone') {
          if (breakDependencyCancelled) {
            setPreviousEndDate(new Date(newEndDate));
            setSelectedEndDate(new Date(newEndDate));
          } else {
            setPreviousEndDate(selectedEndDate);
            setSelectedEndDate(new Date(newEndDate));
          }
        } else if (selectedStartDate) {
          if (breakDependencyCancelled) {
            setPreviousEndDate(new Date(selectedStartDate));
            setSelectedEndDate(new Date(selectedStartDate));
          } else {
            setPreviousEndDate(selectedEndDate);
            setSelectedEndDate(new Date(selectedStartDate));
          }

        }
        setBreakDependencyCancelled(false);
      }
      const prevStart = normalizeDate(previousStartDate);
      const currStart = normalizeDate(selectedStartDate);
      if (currStart && prevStart && currStart < prevStart) {
        let breakDependencyModalFlag = false;
        if (delayAfterDependentTask < 0) {
          breakDependencyModalFlag = dependentTasksList?.some((task: any) =>
            dayjs(addWeekdays(
              dayjs(toUTCDateOnly(task?.end_datetime)).toDate(), delayAfterDependentTask, projectModal?.type
            )).isAfter(dayjs(selectedStartDate))
          );
        } else {
          breakDependencyModalFlag = dependentTasksList?.some((task: any) =>
            dayjs(toUTCDateOnly(task?.end_datetime)).isAfter(dayjs(selectedStartDate))
          );
        }
        if (breakDependencyModalFlag) {
          setBreakDependencyModal(true);
        }
      }
    }
  }, [selectedStartDate]);
  const handleBreakDependency = (flag: boolean) => {
    if (flag) {
      const tasks = dependentTasksList?.filter(
        (task: any) =>
          !dayjs(
            addWeekdays(dayjs(toUTCEndOfDay(task?.end_datetime)).toDate(), delayAfterDependentTask, projectModal?.type)
          ).isAfter(dayjs(selectedStartDate))
      );
      setDependentTasksList(tasks);
      setBreakDependencyAllowed(true);
      setCascadingConfirmationModal(false);
      setBreakDependencyCancelled(false);
    } else {
      if (!isEditMode) {
        setSelectedPlannedStartDate(previousStartDate);
        if (projectModal?.type === 'milestone') {
          setSelectedSetForDate(previousStartDate);
        }
      }
      setPreviousStartDate(selectedStartDate);
      setSelectedStartDate(previousStartDate);
      setBreakDependencyAllowed(false);
      setBreakDependencyCancelled(true);
      setCascadingConfirmationModal(false);
    }
  };
  const getWorkingDaysDiff = (start: Date, end: Date) => {
    let count = 0;
    let current = dayjs(start);

    while (current.isBefore(end, 'day') || current.isSame(end, 'day')) {
      const day = current.day(); // 0 = Sunday, 6 = Saturday
      if (day !== 0 && day !== 6) {
        count++;
      }
      current = current.add(1, 'day');
    }

    return count - 1; // subtract 1 because diff usually excludes start
  };
  useEffect(() => {
    let late = 0;
    if (
      selectedEndDate &&
      selectedPlannedEndDate &&
      projectModal?.projectId &&
      isEditMode
    ) {
      const endDate = dayjs(dayjs(selectedEndDate).endOf('day').toDate());
      const plannedEndDate = dayjs(
        dayjs(selectedPlannedEndDate).endOf('day').toDate()
      );
      if (endDate.isAfter(plannedEndDate)) {
        late = getWorkingDaysDiff(plannedEndDate.toDate(), endDate.toDate());
      }
    }
    if (late > 0) {
      if (selectedStatusName.toLowerCase() === 'done') {
        setDelayDropdownTitle(`${late} days late`);
      } else {
        setDelayDropdownTitle(`${late} days delay`);
      }
      setIsLate(true);
    } else {
      setDelayDropdownTitle('');
      setIsDelayDropdownOpen(false);
      setIsDelay(false);
      setIsLate(false);
    }
  }, [
    selectedEndDate,
    selectedStatusName,
    selectedPlannedEndDate,
    selectedSetForDate,
    projectedSelectedSetForDate,
  ]);

  useEffect(() => {
    if (breakDependencyAllowed) {
      setBreakDependencyAllowed(false);
      return;
    }
    if (dependentTasksList && dependentTasksList.length > 0) {
      if (isFirstRender.current && isEditMode) {
        isFirstRender.current = false;
        return;
      }
      let latestEndDate = dependentTasksList?.reduce(
        (prev: any, current: any) =>
          dayjs(toUTCEndOfDay(current?.end_datetime)).isAfter(dayjs(toUTCEndOfDay(prev?.end_datetime)))
            ? current
            : prev
      )?.end_datetime;
      latestEndDate = toUTCDateOnly(latestEndDate);
      if (latestEndDate) {
        let newStartDate = dayjs(addWeekdays(
          dayjs(latestEndDate).toDate(),
          delayAfterDependentTask, projectModal?.type
        ));

        let newEndDate =
          projectModal?.type !== 'milestone'
            ? dayjs(addWeekdaysForDuration(dayjs(newStartDate).toDate(), ele?.duration_days || 1))
            : dayjs(newStartDate);
        if (projectModal?.projectId && projectModal?.type === 'milestone') {
          if (isEditMode) {
            setProjectedSelectedSetForDate(newEndDate.toDate());
            setPreviousStartDate(selectedStartDate);
            setSelectedStartDate(newStartDate.toDate());
            // setSelectedEndDate(newEndDate.toDate());
          } else {
            setSelectedSetForDate(newEndDate.toDate());
            setSelectedPlannedStartDate(newStartDate.toDate());
            // setSelectedPlannedEndDate(newEndDate.toDate());
          }
          return;
        }
        setPreviousStartDate(selectedStartDate);
        setSelectedStartDate(new Date(newStartDate.toDate()));

        if (projectModal?.projectId && !isEditMode) {
          setSelectedPlannedStartDate(new Date(newStartDate.toDate()));
          setSelectedPlannedEndDate(new Date(newEndDate.toDate()));
          setScheduleTask(true);
        }
      }
    }
  }, [dependentTasksList, delayAfterDependentTask, ele?.duration]);
  useEffect(() => {
    // if (isFirstRender.current) return;
    if (!projectModal?.projectId && isEditMode && selectedPlannedStartDate) {
      let newEndDate = dayjs(addWeekdaysForDuration(dayjs(selectedPlannedStartDate).toDate(),
        ele?.duration_days || 1
      ));
      setSelectedPlannedEndDate(newEndDate.toDate());
    }
  }, [selectedPlannedStartDate]);
  const handleThisTaskClick = () => {
    if (ele?.is_completed) {
      return;
    }
    setIsThisTaskClicked((prev) => !prev);
    setIsDependentTaskClicked(false);
    setIsDataChanged(true);
  };
  const handleDependentTaskClick = () => {
    if (ele?.is_completed) {
      return;
    }
    setIsDependentTaskClicked((prev) => !prev);
    setIsThisTaskClicked(false);
    setIsDataChanged(true);
  };
  function getFormattedDate(selectedDueDate: Date | null): string {
    if (!selectedDueDate) return '';

    const formattedDate: any = utcToLocal(selectedDueDate);

    if (isNaN(new Date(formattedDate).getTime())) {
      return '';
    }

    return String(formattedDate);
  }
  function handleClose() {
    if (updateStatus) {
      return;
    }
    if (isEditMeetingSuggestions && isDataChanged) {
      updateSuggtionTask(getValues());
    } else {
      // onHide();
    }
    setScheduleTask(false);
    if (isDataChanged && isEditMode) {
      if (projectModal?.type) {
        setIsDataChanged(false);
      } else {
        setCloseConfirmationModal(true);
      }
    }
    if (isDataChanged && !isEditMode && !isEditMeetingSuggestions) {
      allReset();
      onHide();
    }
    allReset();
    // onHide();
  }
  const allReset = () => {
    reset();
    onHide();
    setSelectedStatusName('New');
    setSelectedStatusId(undefined);
    setSelectedCustomer(null);
    setSelectedDueDate(null);
    setSelectedSetForDate(null);
    setDueDateError('');
    setIsDataChanged(false);
    setSelectedStartDate(null);
    setPreviousStartDate(null);
    setSelectedPlannedStartDate(null);
    setSelectedEndDate(null);
    setSelectedPlannedEndDate(null);
    setIsThisTaskClicked(false);
    setIsDependentTaskClicked(false);
    setScheduleTask(false);
    setIsDelayDropdownOpen(false);
    setDelayDropdownTitle('Delay');
    setIsDelay(false);
    setIsLate(false);
    setDependentTaskModal(false);
    setCascadingConfirmationModal(false);
    setBreakDependencyAllowed(false);
    setBreakDependencyModal(false);
    setUpdateStatus(false);
    setMarkDoneClick(false);
    setIsOnThisTaskDependent(false);
    setCascadingDependency(false);
    setBreakDependencyCancelled(false);
    errors.title = undefined;
    errors.notes = undefined;
    errors.assigneMail = undefined;
    errors.customer_id = undefined;
    errors.is_critical = undefined;
    // setDummy((prev) => prev + 1);
  };
  const trackTaskEvent = (event: string, data: any) => {
    trackEvent(event, {
      id: data?._id,
      title: data?.title,
      notes: data?.notes,
      task_type: data?.type,
      customer_id: data?.customer_id,
      task_status_id: data?.task_status_id,
      target_date: data?.target_date?.toISOString(),
      planned_start_datetime: data?.planned_start_datetime?.toISOString(),
      planned_end_datetime: data?.planned_end_datetime?.toISOString(),
      assignee_id: data?.assignee_id,
      is_critical: data?.is_critical,
      environment: process.env.NODE_ENV,
      org_id: localStorage.getItem('org_id'),
    });
  };
  useEffect(() => {
    if (isFirstRender.current) {
      if (ele?.prev_task_ids?.length === 0) {
        isFirstRender.current = false;
      }
      return;
    }
    if (isFirstEndDateChange.current) {
      isFirstEndDateChange.current = false;
      return;
    }
    const start = normalizeDate(selectedStartDate);
    const end = normalizeDate(selectedEndDate);
    if (start && end && end < start) {
      if (markDoneClick) {
        isDateErrorOccur.current = true;
      }
      setDueDateError(`${projectModal?.type === 'milestone' ? "The due date cannot be earlier than the current due date" : "The end date cannot be earlier than the start date"}`);
      return;
    }
    const datesChanged =
      (previousEndDate?.toDateString()) !==
      (selectedEndDate?.toDateString());
    if (
      selectedEndDate &&
      datesChanged &&
      !breakDependencyModal &&
      !dueDateError &&
      projectModal?.projectId &&
      isEditMode &&
      isOnThisTaskDependent
    ) {
      setCascadingConfirmationModal(true);
    }
    setDueDateError('');
  }, [selectedEndDate]);
  const callMarkDone = async () => {
    setIsDataChanged(false);
    if (
      markDoneClick &&
      !cascadingConfirmationModal &&
      projectModal?.projectId &&
      isEditMode &&
      !dueDateError
    ) {
      const today = moveTodayToMonday();
      await markAsDone(true, today, cascadingDependency);
      setMarkDoneClick(false);
      setUpdateStatus(false);
      isDateErrorOccur.current = false;
    }
  };
  useEffect(() => {
    if (!markDoneClick) return;
    callMarkDone();
  }, [cascadingConfirmationModal]);
  useEffect(() => {
    if (dueDateError && markDoneClick) {
      const timeoutId = setTimeout(() => {
        if (!projectModal?.projectId) {
          setSelectedPlannedEndDate(previousEndDate);
        } else {
          setSelectedEndDate(previousEndDate);
        }
        setDueDateError('');
        setMarkDoneClick(false);
      }, 3000);
      return () => clearTimeout(timeoutId);
    }
    if (
      !dueDateError &&
      markDoneClick &&
      !isOnThisTaskDependent &&
      !isDateErrorOccur.current
    ) {
      callMarkDone();
      return;
    }
  }, [dueDateError, markDoneClick]);
  useEffect(() => {
    return () => {
      isFirstRender.current = true;
      isFirstEndDateChange.current = true;
      setPreviousEndDate(null);
      setCascadingConfirmationModal(false);
      setMarkDoneClick(false);
    };
  }, []);

  const handleFormKeyDown = (event: React.KeyboardEvent<HTMLFormElement>) => {
    if (event.key !== 'Enter') return;

    const target = event.target as HTMLElement | null;
    if (!target) return;

    // Prevent accidental form submit when using dropdown/combobox controls.
    const isComboboxInput =
      target instanceof HTMLInputElement &&
      target.getAttribute('aria-autocomplete') === 'list';
    const isDropdownSearchInput =
      target instanceof HTMLInputElement &&
      Boolean(target.closest('.dropdown-menu, [role="listbox"], [role="combobox"]'));

    if (isComboboxInput || isDropdownSearchInput) {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  return (
    <div className=" p-[4px]">
      <form
        onSubmit={handleSubmit(onSubmitHandler)}
        onKeyDown={handleFormKeyDown}
        onChange={() => {
          if (!ele?.is_completed) {
            setIsDataChanged(true);
          }
        }}
      >
        <div className="flex flex-col gap-3">
          <div className="flex mt-[-3px]">
            <div className="w-full pr-3">
              <textarea
                {...register('title')}
                // rows={getValues('title')?.length < 100 ? 1 : 2}
                rows={1}
                style={{
                  resize: 'none',
                }}
                id="title"
                disabled={ele?.is_completed}
                // onChange={() => setIsDataChanged(true)}
                className="outline-none text-[18px] disabled:bg-white w-full break-words font-semibold text-[#202B37] !border-none placeholder:text-[#97A1AF] text-nowrap truncate "
                placeholder="Add title"
              />
            </div>
            <div className="flex justify-end">
              <X
                className="w-[22px] h-[22px] cursor-pointer "
                onClick={() => handleClose()}
              />
            </div>
          </div>
          {projectModal?.projectId && (
            <div className="!mt-[-3px] h-[20px] text-[#414E62] text-[14px] flex items-center">
              <div className="flex gap-2 items-center flex-wrap">
                <div className="flex items-center gap-1">
                  <span>From:</span>
                  <span
                    className="cursor-pointer text-[#3B82F6] font-[400] max-w-[220px] overflow-hidden text-nowrap truncate"
                    onClick={(e: any) => {
                      e.stopPropagation();
                      handleClose();
                    }}
                  >
                    <Link
                      href={`/app/customers/${projectModal?.customerId}?selected=ProjectsRef&project_id=${projectModal?.projectId}`}
                    >
                      {projectModal?.projectName}
                    </Link>
                  </span>
                </div>
                <span className="text-[#C0C6CC]">|</span>
                <div className="flex items-center gap-1">
                  <span>{`Begins after:`}</span>
                  <span
                    className="text-[#3B82F6] font-[400] cursor-pointer max-w-[330px] overflow-hidden text-nowrap truncate"
                    onClick={(e: any) => {
                      e.stopPropagation();
                      setDependentTaskModal(true);
                    }}
                  >
                    {dependentTasksList?.length > 0
                      ? dependentTasksList?.length === 1
                        ? dependentTasksList?.[0]?.title
                        : `${dependentTasksList?.length} tasks end`
                      : 'No dependency'}{' '}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="my-2">
            <textarea
              {...register('notes')}
              id="notes"
              // cols={}
              rows={3}
              disabled={ele?.is_completed}
              className="outline-none max-h-[300px] text-[16px] py-3 pl-3 font-normal  bg-[#F9FAFB] rounded-[10px] w-full text-[#141C24] !border-none placeholder:text-[#97A1AF]"
              placeholder="Add description"
            ></textarea>
          </div>
        </div>
        <div>
          {projectModal?.type !== 'milestone' && (
            <div
              className="my-2 flex gap-5 "
              onClick={(e) => e.preventDefault()}
            >
              <Select
                styles={customStyles}
                options={customerOptions}
                isSearchable={true}
                isDisabled={ele?.is_completed || isCustomerDropDownDisabled || !!guidanceId}
                isMulti={false}
                placeholder="Select customer"
                value={selectedCustomer}
                onChange={handleCustomerSelect}
                noOptionsMessage={() => 'No customer found'}
                menuPortalTarget={document.body}
                menuPosition="fixed"
                menuPlacement="auto"
              />
              <Dropdown className={`inline-flex !w-full `}>
                <Dropdown.Trigger
                  type="button"
                  className="text-center bg-white text-gray-900 border-[#E4E7EC] w-[224px] border-[1px] rounded-[6px]"
                  id="dropdownMenuButton"
                  data-bs-toggle="dropdown"
                >
                  <div className="flex justify-between text-[#414E62] px-[12px]  py-[8px] text-[14px]">
                    <span className="flex gap-1.5 items-center">
                      {' '}
                      <span className="items-center">
                        <Tag className="text-[#414E62] w-[16px] h-[16px] " />
                      </span>
                      <p>{selectedStatusName}</p>
                    </span>
                    <ChevronDown className="relative left-[6px] text-[#637083] " />
                  </div>
                </Dropdown.Trigger>
                <Dropdown.Content
                  placement="bottom-start"
                  className={`absolute h-[170px] border border-gray-300 z-50 px-[20px] ltr:text-left rtl:text-right bg-white rounded-md shadow-md  dropdown-menu w-[13rem] dark:bg-zink-600 overflow-y-auto scroll-container`}
                  aria-labelledby="dropdownMenuButton"
                >
                  <ul
                    className="text-sm text-gray-700 dark:text-gray-200 dropdownClick"
                    aria-labelledby="dropdownMenuIconButton"
                  >
                    {statusArr?.map((item: any, i: any) => (
                      <li key={i}>
                        <div className="flex items-center rounded dark:hover:bg-gray-600 close-dropdown cursor-pointer">
                          <label
                            htmlFor={`checkbox-item-${i}`}
                            className={
                              item.status_name === selectedStatusName
                                ? 'w-full pt-[15px] close-dropdown cursor-pointer text-[16px] text-[#3B82F6] rounded dark:text-gray-300'
                                : 'w-full  pt-[15px] close-dropdown cursor-pointer text-[16px] text-[#344051] rounded dark:text-gray-300'
                            }
                            onClick={(e) => {
                              e.preventDefault(), handleStatusSelect(item);
                            }}
                          >
                            {item.status_name}
                          </label>
                        </div>
                      </li>
                    ))}
                  </ul>
                </Dropdown.Content>
              </Dropdown>
              {ele?.is_completed && (
                <div className="flex items-center border w-[224px] px-2 border-[#E4E7EC] rounded-md opacity-50 cursor-not-allowed gap-1">
                  <span className="items-center">
                    <UserRoundPlus className="text-[#414E62] h-[20px] w-[20px]" />
                  </span>
                  <span className="text-[#414E62] text-[14px] w-[190px] text-left items-center overflow-hidden text-ellipsis whitespace-nowrap">
                    {ele?.assignee_id
                      ? `${ele?.assignee_id?.first_name} ${ele?.assignee_id?.last_name}`
                      : 'Assign to'}
                  </span>
                </div>
              )}
              {!ele?.is_completed && (
                <div
                  className={`${ele?.is_completed ? 'invisible' : 'visible'
                    } flex items-center border w-[224px] px-2 border-[#E4E7EC] rounded-md `}
                >
                  <span className="items-center">
                    <UserRoundPlus className="text-[#414E62] h-[20px] w-[20px]" />
                  </span>
                  <Controller
                    name="assigneMail"
                    control={control}
                    render={({ field }) => (
                      <AsyncSelect
                        {...field}
                        className={`!border-none !border-0 w-[184px] text-[14px] ${ele?.is_completed ? 'invisible' : 'visible'
                          }`}
                        id="choices-multiple-remove-button"
                        placeholder="Assign to"
                        loadOptions={loadOptions}
                        isClearable
                        onChange={(selected: any) => {
                          if (selected == null) {
                            setIsDataChanged(true);
                            setValue('assigneMail', null);
                          }
                          field.onChange(selected ? selected?.value : null);
                        }}
                        // value={assigneArr?.find(
                        //   (supervisor: any) => supervisor.value === field.value
                        // )}
                        value={
                          assigneArr?.find(
                            (supervisor: any) =>
                              supervisor.value === field.value
                          ) ||
                          (field.value
                            ? {
                              label: field.value,
                              value: field.value,
                              email: field.value,
                            }
                            : null)
                        }
                        noOptionsMessage={() => (
                          <span
                            className={`${noOptionsMessage?.includes('Type at least 3')
                              ? 'text-gray-500'
                              : 'text-red-500 '
                              } text-left flex`}
                          >
                            {noOptionsMessage}
                          </span>
                        )}
                        menuPlacement="bottom"
                        components={{ Option: CustomOption }}
                        styles={{
                          menu(base, props) {
                            return {
                              ...base,
                              marginLeft: '-25px',
                              width: `${base.width}px`,
                              minWidth: 'calc(100% + 10px)',
                            };
                          },
                          indicatorSeparator: (base) => ({
                            ...base,
                            display: 'none',
                          }),
                          dropdownIndicator: (base) => ({
                            ...base,
                            display: 'none',
                          }),
                          control: (base) => ({
                            ...base,
                            ':active': {
                              border: 'none',
                            },
                            padding: '0px 0px',
                            boxShadow: 'none',
                            ring: 'none',
                            border: 'none',
                          }),
                          clearIndicator: (base) => ({
                            ...base,
                            padding: '0px',
                          }),
                          valueContainer: (base) => ({
                            ...base,
                            padding: '2px 0px 2px 3px',
                          }),
                        }}
                      />
                    )}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {projectModal?.type !== 'milestone' ? (
          <div className="flex justify-between mt-[20px]">
            <div className="flex items-center w-[full] text-[#97A1AF]">
              <Controller
                name="is_critical"
                control={control}
                render={({ field }) => (
                  <div className="relative w-[32px] h-[15px] rounded-full cursor-pointer float-start ">
                    <label className="cursor-pointer items-center">
                      <input
                        {...register('is_critical')}
                        type="checkbox"
                        className="sr-only peer"
                        disabled={ele?.is_completed}
                        onClick={() => {
                          setValue('is_critical', !getValues('is_critical'));
                        }}
                      />
                      <div
                        className={`w-full h-full bg-[#E3EAF2]  rounded-full peer-focus:outline-none 
                      ${field.value
                            ? 'bg-[#3B82F6] peer-checked:bg-[#3B82F6]'
                            : ''
                          }`}
                      >
                        <div
                          className={`absolute top-[3px] left-[2px] bg-white rounded-full h-[10px] w-[10px] transition-transform 
                        ${field.value ? 'translate-x-[16px]' : ''}`}
                        ></div>
                      </div>
                    </label>
                  </div>
                )}
              />
              {!projectModal?.projectId ? (
                <>
                  <div
                    className="text-[#414E62] text-base mx-[20px] cursor-pointer"
                    onClick={() => {
                      !ele?.is_completed
                        ? setValue('is_critical', !getValues('is_critical'))
                        : null;
                    }}
                  >
                    Critical
                  </div>
                  {watch('is_critical') && (
                    <span className="flex border-l border-[#E4E7EC] pl-[20px] text-[#414E62] w-36">
                      <Flatpickr
                        options={{
                          dateFormat: 'M d, Y',
                          // minDate: 'today',
                          disable: [
                            function (date) {
                              // disable weekends: Sunday = 0, Saturday = 6
                              return date.getDay() === 0 || date.getDay() === 6;
                            },
                          ],
                        }}
                        onChange={(value) => {
                          setSelectedDueDate(
                            value[0] ? localToUtc(value[0]) || null : null
                          ),
                            setDueDateError('');
                          if (isEditMode) {
                            setIsDataChanged(true);
                          }
                        }}
                        name="target_date"
                        disabled={ele?.is_completed}
                        value={selectedDueDate ? selectedDueDate : ''}
                        placeholder={
                          selectedDueDate
                            ? dayjs(selectedDueDate).format('MMM DD, YYYY')
                            : 'Add due date'
                        }
                        className="form-input !border-none p-0 !border-0 w-full disabled:bg-white dark:border-zinc-500 focus:outline-none focus:border-custom-500 dark:disabled:bg-zinc-600 disabled:border-slate-300 dark:disabled:border-zinc-500 dark:disabled:text-zinc-200 disabled:text-slate-500 dark:text-zinc-100 dark:bg-zinc-700 dark:focus:border-custom-800 placeholder:text-[#414E62] dark:placeholder:text-zinc-200"
                      />
                      {getFormattedDate(selectedDueDate as Date) &&
                        selectedDueDate && (
                          <span className="flex items-center">
                            <X
                              className="w-[18px] h-[18px] cursor-pointer text-black "
                              onClick={() => {
                                setSelectedDueDate(null);
                                if (isEditMode) {
                                  setIsDataChanged(true);
                                }
                              }}
                            />
                          </span>
                        )}
                    </span>
                  )}
                </>
              ) : (
                <>
                  {!watch('is_critical') && (
                    <div
                      className="text-[#97A1AF] text-base ml-[10px] cursor-pointer"
                      onClick={() => {
                        !ele?.is_completed
                          ? setValue('is_critical', !getValues('is_critical'))
                          : null;
                      }}
                    >
                      Committed date
                    </div>
                  )}
                  {watch('is_critical') && (
                    <span className="text-[#414E62] text-base cursor-pointer ml-[10px] flex items-center align-center">
                      {selectedDueDate && (
                        <span className="text-[#97A1AF] mr-1">
                          Committed on
                        </span>
                      )}
                      <Flatpickr
                        options={{
                          dateFormat: 'M d',
                          // minDate: 'today',
                          disable: [
                            function (date) {
                              // disable weekends: Sunday = 0, Saturday = 6
                              return date.getDay() === 0 || date.getDay() === 6;
                            },
                          ],
                        }}
                        onChange={(value) => {
                          setSelectedDueDate(
                            value[0] ? localToUtc(value[0]) || null : null
                          ),
                            setDueDateError('');
                          if (isEditMode) {
                            setIsDataChanged(true);
                          }
                        }}
                        name="target_date"
                        disabled={ele?.is_completed}
                        value={selectedDueDate ? selectedDueDate : ''}
                        placeholder={
                          selectedDueDate
                            ? dayjs(selectedDueDate).format('MMM DD')
                            : 'Committed date'
                        }
                        className="form-input w-[105px] !border-none p-0 !border-0  focus:outline-none disabled:bg-white  disabled:text-slate-500  placeholder:text-[#414E62] outline-none"
                      />
                    </span>
                  )}
                </>
              )}
            </div>
            {(!projectModal?.projectId || !isEditMode) && (
              <div className="h-[24px] w-7/12">
                {!scheduleTask ? (
                  <span
                    onClick={() => {
                      !ele?.is_completed ? setScheduleTask(true) : null;
                    }}
                    className="text-[#414E62] text-base cursor-pointer justify-end flex"
                  >
                    Schedule task
                  </span>
                ) : (
                  <div className="flex text-[#414E62] text-base justify-end items-center gap-3">
                    <span className="flex items-end border-r border-[#E4E7EC] ">
                      <Flatpickr
                        options={{
                          dateFormat: 'M d, Y ',
                          // enableTime: true,
                          // minDate: 'today',
                          disable: [
                            function (date) {
                              // disable weekends: Sunday = 0, Saturday = 6
                              return date.getDay() === 0 || date.getDay() === 6;
                            },
                          ],
                        }}
                        // data-enable-time
                        disabled={ele?.is_completed}
                        onChange={(value) => {
                          setPreviousStartDate(selectedPlannedStartDate);
                          setSelectedPlannedStartDate(value[0]);
                          setSelectedStartDate(value[0]);
                          // if (isEditMode) {
                          //   setIsDataChanged(true);
                          // }
                        }}
                        name="planned_start_datetime"
                        value={
                          selectedPlannedStartDate
                            ? selectedPlannedStartDate
                            : ''
                        }
                        placeholder={selectedPlannedStartDate ? `${dayjs(selectedPlannedStartDate).format('MMM DD, YYYY')}` : "Starts at"}
                        className="form-input !today border-none p-0 disabled:bg-white !border-r items-end w-full !ring-0 dark:border-zinc-500 focus:outline-none  dark:text-zinc-100 dark:bg-zinc-700 dark:focus:border-custom-800 placeholder:text-[#414E62] dark:placeholder:text-zinc-200"
                      />
                    </span>

                    <span className="">
                      <Flatpickr
                        options={{
                          dateFormat: 'M d, Y ',
                          // enableTime: true,
                          minDate: selectedPlannedStartDate || undefined,
                          disable: [
                            function (date) {
                              // disable weekends: Sunday = 0, Saturday = 6
                              return date.getDay() === 0 || date.getDay() === 6;
                            },
                          ],
                        }}
                        ref={flatpickrRef}
                        disabled={ele?.is_completed}
                        onChange={(value) => {
                          setSelectedPlannedEndDate(value[0]);
                          if (isEditMode) {
                            setIsDataChanged(true);
                          }
                        }}
                        name="planned_end_datetime"
                        value={
                          selectedPlannedEndDate ? selectedPlannedEndDate : ''
                        }
                        placeholder={selectedPlannedEndDate ? `${dayjs(selectedPlannedEndDate).format('MMM DD, YYYY')}` : "Ends at"}
                        className="form-input !today border-none p-0 !border-r disabled:bg-white items-end w-full !ring-0 dark:border-zinc-500 focus:outline-none focus:border-custom-500 dark:text-zinc-100 dark:bg-zinc-700 dark:focus:border-custom-800 placeholder:text-[#414E62] dark:placeholder:text-zinc-200"
                      />
                    </span>
                    <span
                      className="cursor-pointer"
                      onClick={() => {
                        setScheduleTask(false);
                        setSelectedPlannedEndDate(null);
                        setSelectedPlannedStartDate(null);
                        setSelectedStartDate(null);
                        if (isEditMode) {
                          setIsDataChanged(true);
                        }
                      }}
                    >
                      <X className="w-[18px] h-[18px] text-black " />
                    </span>
                  </div>
                )}
              </div>
            )}
            {projectModal?.projectId && isEditMode && (
              <div className="flex justify-end items-center text-nowrap">
                {projectModal?.projectId && !isDelayDropdownOpen && (
                  <div className="flex justify-end items-center py-2">
                    {(selectedStatusName.toLowerCase() === 'new' ||
                      selectedStatusName.toLowerCase() === 'in-progress') &&
                      isDelay && (
                        <span className="font-normal text-[14px] text-[#97A1AF] pr-2">
                          Projected
                        </span>
                      )}
                    <span className="flex items-center gap-1 text-[14px] text-[#202B37]">
                      <span className="text-[#97A1AF]">
                        {selectedStatusName.toLowerCase() === 'done'
                          ? 'Started'
                          : 'Start'}
                      </span>
                      <Flatpickr
                        options={{
                          dateFormat: 'M d',
                          // minDate: 'today',
                          // enableTime: true,
                          disable: [
                            function (date) {
                              // disable weekends: Sunday = 0, Saturday = 6
                              return date.getDay() === 0 || date.getDay() === 6;
                            },
                          ],
                        }}
                        disabled={ele?.is_completed}
                        onChange={(value) => {
                          setPreviousStartDate(selectedStartDate);
                          setSelectedStartDate(value[0]);
                          if (isEditMode) setIsDataChanged(true);
                        }}
                        name="start_datetime"
                        value={selectedStartDate ? selectedStartDate : ''}
                        placeholder={
                          selectedEndDate
                            ? dayjs(selectedStartDate).format('MMM DD')
                            : 'MMM DD'
                        }
                        className="!text-[14px] form-input !today border-none p-0 !border-r disabled:bg-white !ring-0 focus:outline-none placeholder:text-[#414E62] w-[55px] cursor-pointer"
                      />
                    </span>
                    <span className="pr-2 text-[#97A1AF]">&ndash;</span>
                    <span className="flex items-center gap-1 text-[14px] text-[#202B37]">
                      <span className="text-[#97A1AF]">
                        {selectedStatusName.toLowerCase() === 'done'
                          ? 'Completed'
                          : 'End'}
                      </span>
                      <Flatpickr
                        options={{
                          dateFormat: 'M d',
                          // enableTime: true,
                          minDate: selectedStartDate || undefined,

                          disable: [
                            function (date) {
                              // disable weekends: Sunday = 0, Saturday = 6
                              return date.getDay() === 0 || date.getDay() === 6;
                            },
                          ],
                        }}
                        ref={flatpickrRef}
                        disabled={ele?.is_completed}
                        onChange={(value) => {
                          setPreviousEndDate(selectedEndDate);
                          setSelectedEndDate(value[0]);
                          if (isEditMode) setIsDataChanged(true);
                        }}
                        name="end_datetime"
                        value={selectedEndDate ? selectedEndDate : ''}
                        placeholder={
                          selectedEndDate
                            ? dayjs(selectedEndDate).format('MMM DD')
                            : 'MMM DD'
                        }
                        className="!text-[14px] form-input !today border-none p-0 !border-r disabled:bg-white !ring-0 focus:outline-none placeholder:text-[#414E62] w-[55px] cursor-pointer"
                      />
                    </span>
                  </div>
                )}
                {(isDelay || isLate) && (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsDelayDropdownOpen(!isDelayDropdownOpen);
                    }}
                  >
                    <div
                      // type="button"
                      className="min-w-[110px] px-1 py-1 text-center flex justify-center items-center bg-[#FFEECC] text-[#344051] font-normal rounded-[150px] text-[12px] cursor-pointer"
                    >
                      <span>{delayDropdownTitle}</span>
                      <span>
                        {' '}
                        <ChevronDown className="text-[#344051] w-5 h-5 ml-1" />
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center pt-2 justify-between">
            <div className="flex items-center pt-2 justify-start">
              <span className=" text-[14px] text-[#414E62]">Set for </span>
              <span className="flex border-[#E4E7EC] pl-[5px] text-[#414E62] w-fit">
                <Flatpickr
                  options={{
                    dateFormat: 'M d, Y',
                    // minDate: 'today',
                    disable: [
                      function (date) {
                        // disable weekends: Sunday = 0, Saturday = 6
                        return date.getDay() === 0 || date.getDay() === 6;
                      },
                    ],
                  }}
                  onChange={(value) => {
                    setSelectedSetForDate(value[0]),
                      setPreviousStartDate(selectedStartDate),
                      setSelectedStartDate(value[0]),
                      setSelectedEndDate(value[0]),
                      setDueDateError('');
                    if (isEditMode) {
                      setIsDataChanged(true);
                    }
                  }}
                  // name="target_date"
                  disabled={ele?.is_completed || isEditMode}
                  value={selectedSetForDate ? selectedSetForDate : ''}
                  placeholder={
                    selectedSetForDate
                      ? dayjs(selectedSetForDate).format('MMM DD, YYYY')
                      : 'MMM DD, YYYY'
                  }
                  className="!w-[110px] form-input placeholder:text-[#202B37] text-[14px] !border-none p-0 !border-0 disabled:bg-white  focus:outline-none   disabled:border-slate-300   disabled:text-slate-500"
                />
              </span>
            </div>
            {projectModal?.projectId &&
              isEditMode &&
              projectModal?.type === 'milestone' && (
                <div className="flex items-center pt-2 justify-end">
                  <span className=" text-[14px] text-[#414E62]">
                    {ele?.is_completed ? 'Completed' : 'Projected'}{' '}
                  </span>
                  <span className="flex border-[#E4E7EC] text-[#202B37] w-fit pl-[5px] cursor-pointer">
                    <Flatpickr
                      options={{
                        dateFormat: 'M d, Y',
                        // minDate: 'today',
                        disable: [
                          function (date) {
                            // disable weekends: Sunday = 0, Saturday = 6
                            return date.getDay() === 0 || date.getDay() === 6;
                          },
                        ],
                      }}
                      onChange={(value) => {
                        // setProjectedSelectedSetForDate(
                        //   value[0]
                        // ),
                        setPreviousStartDate(selectedStartDate),
                          setSelectedStartDate(value[0]);
                        setPreviousEndDate(selectedEndDate);
                        setSelectedEndDate(value[0]);
                        setDueDateError('');
                        if (isEditMode) {
                          setIsDataChanged(true);
                        }
                      }}
                      // name="target_date"
                      disabled={ele?.is_completed}
                      value={selectedEndDate ? selectedEndDate : ''}
                      placeholder={
                        selectedEndDate
                          ? dayjs(selectedEndDate).format('MMM DD, YYYY')
                          : 'MMM DD, YYYY'
                      }
                      className="!w-[100px] form-input placeholder:text-[#202B37] text-[14px]  !border-none p-0 !border-0 disabled:bg-white  focus:outline-none disabled:border-slate-300   disabled:text-slate-500 "
                    />
                  </span>
                  {(isDelay || isLate) && (
                    <div
                      // type="button"
                      className="min-w-[110px] px-1 py-1 text-center flex justify-center items-center bg-[#FFEECC] text-[#344051] font-normal rounded-[150px] text-[12px]"
                    >
                      <span>{delayDropdownTitle}</span>
                    </div>
                  )}
                </div>
              )}
          </div>
        )}
        {(isDelay || isLate) &&
          isDelayDropdownOpen &&
          projectModal?.projectId &&
          isEditMode &&
          projectModal?.type !== 'milestone' && (
            <div className="border-[1px] border-[#CED2DA] z-100 text-left bg-white rounded-[12px] w-[710px] h-[96px] my-2">
              <div className="flex text-[13px] text-[#344051] w-full">
                {/* Planned & Projected Dates */}
                <div className="flex flex-col py-3 h-[96px] w-1/2 px-4 border-r-[1px] border-[#CED2DA]">
                  {/* Planned Row */}
                  <div className="flex justify-between items-center py-2">
                    <span className="font-medium w-[90px]">Planned</span>
                    <span className="flex justify-around items-center text-[14px] text-[#5E6C84] w-full">
                      <span className="w-[100px] text-[14px]">
                        {dayjs(selectedPlannedStartDate).format('MMM D, YYYY')}
                      </span>
                      <span>&ndash;</span>
                      <span className="w-[100px] text-[14px]">
                        {dayjs(selectedPlannedEndDate).format('MMM D, YYYY')}
                      </span>
                    </span>
                  </div>
                  {/* Projected Row */}
                  <div className="flex justify-between items-center py-2">
                    <span className="font-medium  w-[90px]">Projected</span>
                    <span className="flex justify-around items-center text-[14px] text-[#202B37] w-full">
                      <span>
                        <Flatpickr
                          options={{
                            dateFormat: 'M d, Y ',
                            // minDate: 'today',
                            // enableTime: true,
                            disable: [
                              function (date) {
                                // disable weekends: Sunday = 0, Saturday = 6
                                return (
                                  date.getDay() === 0 || date.getDay() === 6
                                );
                              },
                            ],
                          }}
                          // data-enable-time
                          disabled={ele?.is_completed}
                          onChange={(value) => {
                            setPreviousStartDate(selectedStartDate);
                            setSelectedStartDate(value[0]);
                            if (isEditMode) {
                              setIsDataChanged(true);
                            }
                          }}
                          name="start_datetime"
                          value={selectedStartDate ? selectedStartDate : ''}
                          placeholder="Starts at"
                          className="!w-[100px] !text-[14px] form-input !today border-none p-0 disabled:bg-white !border-r items-end !ring-0 dark:border-zinc-500 focus:outline-none  dark:text-zinc-100 dark:bg-zinc-700 dark:focus:border-custom-800 placeholder:text-[#202B37] dark:placeholder:text-zinc-200"
                        />
                      </span>
                      <span>&ndash;</span>
                      <span>
                        <Flatpickr
                          options={{
                            dateFormat: 'M d, Y ',
                            // enableTime: true,
                            minDate: selectedStartDate || undefined,
                            disable: [
                              function (date) {
                                // disable weekends: Sunday = 0, Saturday = 6
                                return (
                                  date.getDay() === 0 || date.getDay() === 6
                                );
                              },
                            ],
                          }}
                          ref={flatpickrRef}
                          disabled={ele?.is_completed}
                          onChange={(value) => {
                            setPreviousEndDate(selectedEndDate);
                            setSelectedEndDate(value[0]);
                            if (isEditMode) {
                              setIsDataChanged(true);
                            }
                          }}
                          name="end_datetime"
                          value={selectedEndDate ? selectedEndDate : ''}
                          placeholder="Ends at"
                          className="!w-[100px] !text-[14px] form-input !today border-none p-0 !border-r disabled:bg-white items-end !ring-0 dark:border-zinc-500 focus:outline-none focus:border-custom-500 dark:text-zinc-100 dark:bg-zinc-700 dark:focus:border-custom-800 placeholder:text-[#202B37] dark:placeholder:text-zinc-200"
                        />
                      </span>
                    </span>
                  </div>
                </div>

                {/* Sync Prompt */}
                <div className="flex flex-col py-3 h-[96px] w-1/2 px-4">
                  <div className="text-sm py-2 text-[#202B37]">
                    Sync planned dates with projected for
                  </div>
                  <div className="flex gap-2 ">
                    <button
                      type="button"
                      className={`text-[14px] font-medium px-[16px] py-[8px]  rounded-md ${isThisTaskClicked
                        ? 'border border-blue-400 text-blue-400'
                        : 'border border-[#CED2DA]'
                        }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();

                        handleThisTaskClick();
                      }}
                    >
                      This task
                    </button>
                    <button
                      type="button"
                      className={`text-[14px] font-medium px-[16px] py-[8px]  rounded-md ${isDependentTaskClicked
                        ? 'border border-blue-400 text-blue-400'
                        : 'border border-[#CED2DA]'
                        }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleDependentTaskClick();
                      }}
                    >
                      This and dependent tasks
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        {dueDateError && (
          <p className="text-start text-[14px] text-[#EF4444] font-normal  pt-[2px]">
            {dueDateError}
          </p>
        )}
        {errors?.title?.message && (
          <p className="text-start  text-[14px] text-[#EF4444] pt-[2px]">
            {errors?.title?.message}
          </p>
        )}
        {!isEditMeetingSuggestions && (
          <div className="flex flex-wrap justify-between gap-2 border-t border-[#CED2DA]  mx-[-20px]  mt-[20px]">
            {/* <div>Due on</div>
          <div>
            <Flatpickr
              options={{
                dateFormat: 'd-M-y',
                minDate: 'today',
              }}
              onChange={(value) => setSelectedDate(localToUtc(value[0]))}
              name="target_date"
              value={utcToLocal(selectDate)}
              placeholder="DD-MMM-YY"
              className="form-input border-slate-200 dark:border-zinc-500 focus:outline-none focus:border-custom-500 disabled:bg-slate-100 dark:disabled:bg-zinc-600 disabled:border-slate-300 dark:disabled:border-zinc-500 dark:disabled:text-zinc-200 disabled:text-slate-500 dark:text-zinc-100 dark:bg-zinc-700 dark:focus:border-custom-800 placeholder:text-slate-400 dark:placeholder:text-zinc-200"
            />
          </div> */}
          </div>
        )}
        {!isEditMode ? (
          !isEditMeetingSuggestions && (
            <div className="">
              <div className="pl-4">
                <div className="flex flex-wrap gap-2  pt-[20px] float-end">
                  <button
                    type="submit"
                    className={
                      watch('title') === ''
                        ? `bg-[#3B82F6] px-[20px] py-[10px] font-semibold text-center text-[14px]  rounded-md text-white btn border-[#3B82F6]`
                        : `bg-[#3B82F6] px-[20px] py-[10px] font-semibold text-center text-[14px] rounded-md text-white btn !border-[#3B82F6]`

                      //      ${
                      //   isCancelHovered
                      //     ? 'bg-white text-custom-500 hover:text-white hover:bg-custom-600'
                      //     : 'bg-custom-600 text-white'
                      // }`
                    }
                    disabled={updateStatus}
                  >
                    <span className="flex items-center justify-center flex-nowrap ">
                      {projectModal?.type === 'milestone'
                        ? 'Create milestone'
                        : 'Create task'}{' '}
                      &nbsp;{updateStatus && <ButtonLoader />}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )
        ) : (
          <div className="flex justify-between gap-2   w-full pt-[20px]  items-center">
            <div className="flex gap-6">
              {' '}
              <button
                type="button"
                onClick={() => {
                  setDeleteModal(true);
                }}
                className={`btn border-[#FCCFCF] hover:text-[#EF4444] text-[#EF4444] font-semibold text-base `}
              >
                Delete
              </button>
              <span className="text-[#637083] text-sm">
                <p>
                  Last modified:{' '}
                  {dayjs(ele?.updated_at).format('MMM DD, YYYY hh:mm A')}
                </p>
                <p>
                  Created by you on:{' '}
                  {dayjs(ele?.created_at).format('MMM DD, YYYY hh:mm A')}
                </p>
              </span>
            </div>
            <div className="flex gap-4 items-center">
              {isDataChanged && !markDoneClick && (
                <button
                  type="button"
                  className={`bg-[#3B82F6] px-[16px]  font-semibold  text-white btn !border-[#3B82F6]  dark:ring-custom-400/20`}
                  onClick={
                    projectModal?.type === 'milestone'
                      ? handleSubmit(updateMilestoneDetails)
                      : handleSubmit(updateTaskDetails)
                  }
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
              {!ele?.is_completed ? (
                <button
                  type="button"
                  disabled={isDataChanged}
                  onClick={async (e) => {
                    e.preventDefault();
                    setMarkDoneClick(true);
                    const today = moveTodayToMonday();
                    if (!projectModal?.projectId && isEditMode) {
                      setPreviousStartDate(selectedPlannedStartDate);
                      setSelectedPlannedEndDate(
                        today
                      );
                      const start = normalizeDate(selectedPlannedStartDate);
                      const end = normalizeDate(
                        today
                      );
                      if (start && end && start > end) {
                        setDueDateError(
                          'The end date cannot be earlier than the start date'
                        );
                        return;
                      }

                      await markAsDone(false, today);
                      setMarkDoneClick(false);
                      return;
                    }
                    setPreviousEndDate(selectedEndDate);
                    setSelectedEndDate(today);
                  }}
                  className={`btn border-[#249782] disabled:opacity-50  ${'bg-[#249782] text-white font-semibold hover:text-white hover:bg-[#249782] hover:border-[#249782] focus:text-white focus:bg-[#249782] focus:border-[#249782] active:text-white active:bg-[#249782] dark:bg-zink-700 dark:hover:bg-[#249782] dark:focus:bg-[#249782]'} ${isDataChanged ? 'cursor-not-allowed' : ''
                    } `}
                >
                  <span className="text-nowrap flex flex-nowrap gap-1">
                    Mark done
                    {markDoneClick && (
                      <>
                        &nbsp;
                        <ButtonLoader />
                      </>
                    )}
                  </span>
                </button>
              ) : (
                <span className="text-[#249782] text-base font-semibold ">
                  Marked as done
                </span>
              )}
            </div>
          </div>
        )}

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
              `There are unsaved $
              {projectModal?.type === 'milestone' ? 'milestone' : 'task'}{' '}
              details`
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
                  onHide(), toggle();
                  setIsDataChanged(false);
                  // setDummy(Math.random());
                  setScheduleTask(false);
                }}
              >
                Close task
              </button>
              <button
                type="button"
                className={`btn border-[#249782] focus:ring focus:ring-custom-100 active:ring active:ring-custom-100 dark:ring-custom-400/20 ${'bg-[#249782] text-white font-semibold hover:text-white hover:bg-[#249782] hover:border-[#249782] focus:text-white focus:bg-[#249782] focus:border-[#249782] active:text-white active:bg-[#249782] active:border-[#249782] dark:bg-zink-700 dark:hover:bg-[#249782] dark:focus:bg-[#249782]'}`}
                onClick={
                  projectModal?.type === 'milestone'
                    ? handleSubmit(updateMilestoneDetails)
                    : handleSubmit(updateTaskDetails)
                }
                disabled={updateTask?.isPending}
              >
                Save changes
              </button>
            </div>
          </Modal.Footer>
        </Modal>

        {dependentTaskModal && (
          <DependentTaskModal
            dependentTaskModal={dependentTaskModal}
            setDependentTaskModal={setDependentTaskModal}
            ele={ele || {}}
            tasksDetails={projectModal?.tasksDetails || []}
            dependentTasksList={dependentTasksList}
            setDependentTasksList={setDependentTasksList}
            delayAfterDependentTask={delayAfterDependentTask}
            setDelayAfterDependentTask={setDelayAfterDependentTask}
            setIsDataChanged={setIsDataChanged}
            isTaskDone={ele?.is_completed}
            dependencySelectionList={dependencySelectionList || []}
          />
        )}
        {cascadingConfirmationModal &&
          projectModal?.projectId &&
          isEditMode &&
          !breakDependencyModal &&
          isOnThisTaskDependent && (
            <CascadingConfirmationModal
              cascadingConfirmationModal={cascadingConfirmationModal}
              setCascadingConfirmationModal={setCascadingConfirmationModal}
              setCascadingDependency={setCascadingDependency}
              setCascadingConfirmationModal1={setBreakDependencyModal}
              setIsDataChanged={setIsDataChanged}
              isBreakDependencyModal={false}
            />
          )}
        {breakDependencyModal && projectModal?.projectId && (
          <CascadingConfirmationModal
            cascadingConfirmationModal={breakDependencyModal}
            setCascadingConfirmationModal={setBreakDependencyModal}
            setCascadingDependency={setCascadingDependency}
            setCascadingConfirmationModal1={setCascadingConfirmationModal}
            setIsDataChanged={setIsDataChanged}
            isBreakDependencyModal={true}
            handleBreakDependency={handleBreakDependency}
            isEditMode={isEditMode}
          />
        )}
      </form>
    </div>
  );
};

export default CreateNewTask;
