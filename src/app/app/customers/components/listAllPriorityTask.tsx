import React from 'react';
import TaskCard from '../../tasks/taskCard';
// import { useQuery } from '@tanstack/react-query';
// import { getAllTasksStatus } from '../../../api/tasks/tasks';
// import { getUsers } from '../../../api/users/users';

function ListAllPriorityTasks(props: any) {
  const { allPriorityTasks, isMyTeamPage} = props;
  // const { data: statusArr } = useQuery({
  //   queryKey: ['statusArr'],
  //   queryFn: () => getAllTasksStatus(),
  // });
  // const { data: existingUsers, isLoading } = useQuery({
  //   queryKey: ['users'],
  //   queryFn: getUsers,
  // });
  return (
    <div className={`${isMyTeamPage?'h-fit':'min-h-[calc(100vh-12.9rem)]'} rounded-[12px]  pb-[22px] border-[#E4E7EC] overflow-hidden pt-[24px]`}>
      <div className={`${isMyTeamPage?'w-[1068px]':'w-[1200px]'} mx-auto grid grid-cols-1 xl:grid-cols-2 gap-6`}>
        {allPriorityTasks?.map((task: any, index: number) => {
          return (
            <div key={index} className="border-[#E4E7EC] border rounded-md">
              <TaskCard
                ele={task}
                customer360={true}
                // taskStatus={statusArr?.data?.data}
                // existingUsers={existingUsers?.data?.data}
                isMyTeamPage={isMyTeamPage}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ListAllPriorityTasks;
