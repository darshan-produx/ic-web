'use client';
import { useQuery } from '@tanstack/react-query';
import KanBanView from './kanbanView';
import { getAllTasksStatus, getBYFilter } from '../../api/tasks/tasks';
import { getUsersForTask } from '../../api/users/users';
import { apiRequest } from '../../../common/api-request';
import { useMemo, useState } from 'react';

const Tasks = () => {
  const { data: statusArr } = useQuery({
    queryKey: ['getstatusArr'],
    queryFn: () => getAllTasksStatus(),
    refetchOnWindowFocus: false,
  });

  const [checkboxItemStatus, setCheckboxItemStatus] = useState<any[]>([]);
  const [checkboxItemsCustomer, setCheckboxItemsCustomer] = useState<any[]>([]);
  const [assignedToMe, setAssignedToMe] = useState<boolean>(true);
  const [assignedToOthers, setAssignedToOthers] = useState<boolean>(true);
  const [searchText, setSearchText] = useState<string>('');

  const getFilters = () => {
    return {
      status: checkboxItemStatus
        ?.filter((item) => item.selected)
        ?.map((item) => item._id),
      company: checkboxItemsCustomer
        ?.filter((item) => item.selected)
        ?.map((item) => item.customer_id),
      assigned_to_me: assignedToMe,
      assigned_to_others: assignedToOthers,
    };
  };

  const queryKey = useMemo(() => {
    return ['tasks', JSON.stringify(getFilters())];
  }, [
    checkboxItemStatus,
    checkboxItemsCustomer,
    assignedToMe,
    assignedToOthers,
  ]);
  const { data: tasksData, isLoading } = useQuery({
    queryKey: queryKey,
    queryFn: () => {
      return getBYFilter({
        status: (checkboxItemStatus ?? [])
          .filter((ele) => ele.selected)
          .map((ele) => ele._id),
        company: (checkboxItemsCustomer ?? [])
          .filter((ele) => ele.selected)
          .map((ele) => ele.customer_id),
        assigned_to_me: assignedToMe,
        assigned_to_others: assignedToOthers,
      });
    },
    refetchOnWindowFocus: false,
  });

  const tasks = useMemo(
    () =>
      searchText
        ? tasksData?.data?.data.filter(
            (task: any) =>
              task?.title?.toLowerCase().includes(searchText.toLowerCase()) ||
              task?.notes?.toLowerCase().includes(searchText.toLowerCase())
          )
        : tasksData?.data?.data,
    [searchText, tasksData]
  );

  const { data: existingUsers } = useQuery({
    queryKey: ['users'],
    queryFn: getUsersForTask,
    refetchOnWindowFocus: false,
  });

  const { data: userinfo } = useQuery({
    queryKey: ['userDetails'],
    queryFn: () =>
      apiRequest({
        url: '/api/app-service/v1/userinfo?is_email_encrypt=true',
      }),
    refetchOnWindowFocus: false,
  });

  return (
    <KanBanView
      statusArr={statusArr?.data?.data}
      tasksData={tasks ?? []}
      existingUsers={existingUsers?.data?.data}
      userDetails={userinfo?.data}
      assignedToOthers={assignedToOthers}
      setAssignedToOthers={setAssignedToOthers}
      assignedToMe={assignedToMe}
      setAssignedToMe={setAssignedToMe}
      checkboxItemsCustomer={checkboxItemsCustomer}
      setCheckboxItemsCustomer={setCheckboxItemsCustomer}
      checkboxItemStatus={checkboxItemStatus}
      setCheckboxItemStatus={setCheckboxItemStatus}
      setSearchText={setSearchText}
      searchText={searchText}
      isLoading={isLoading}
    />
  );
};

export default Tasks;
