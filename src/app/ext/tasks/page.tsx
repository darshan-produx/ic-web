'use client';
import { useQuery } from '@tanstack/react-query';
import { getAllTasksStatus, getBYFilter } from '../../api/tasks/tasks';
import KanBanView from '../../app/tasks/kanbanView';
import { useState } from 'react';
import { getUsersForTask } from '../../api/users/users';

export default function Tasks() {
  const [checkboxItemStatus, setCheckboxItemStatus] = useState<any[]>([]);

  const { data: statusArr } = useQuery({
    queryKey: ['statusArr1'],
    queryFn: () => getAllTasksStatus(),
  });

  const { data: existingUsers, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: getUsersForTask,
  });

  const { data: tasksData } = useQuery({
    queryKey: ['tasks', checkboxItemStatus],
    queryFn: () =>
      getBYFilter({
        status:
          checkboxItemStatus
            ?.map((ele: any) => {
              if (ele?.selected) {
                return ele?._id;
              }
            })
            .filter((ele: any) => ele != undefined)?.length > 0
            ? checkboxItemStatus
                ?.map((ele: any) => {
                  if (ele?.selected) {
                    return ele?._id;
                  }
                })
                .filter((ele: any) => ele != undefined)
            : [],
      }),
  });
  return (
    <KanBanView
      statusArr={statusArr?.data?.data}
      tasksData={tasksData?.data?.data}
      existingUsers={existingUsers?.data?.data}
      external={true}
      checkboxItemStatus={checkboxItemStatus}
      setCheckboxItemStatus={setCheckboxItemStatus}
    />
  );
}
