import { useQuery } from '@tanstack/react-query';
import { getTaskById } from '../../api/tasks/tasks';
import TaskCard from '../tasks/taskCard';
// import { getUsers } from '../../api/users/users';

interface props {
  taskId: string;
}

const TaskCardGuidance = ({ taskId }: props) => {
  const { data: taskDataById, isLoading } = useQuery({
    queryKey: ['getTaskById'],
    queryFn: () => getTaskById(taskId),
  });

  // const { data: existingUsers } = useQuery({
  //   queryKey: ['users'],
  //   queryFn: getUsers,
  // });

  // const { data: statusArr } = useQuery({
  //   queryKey: ['statusArr'],
  //   queryFn: () => getAllTasksStatus(),
  // });

  return (
    <div>
      <TaskCard
        ele={taskDataById?.data}
        // existingUsers={existingUsers?.data?.data}
        // taskStatus={statusArr?.data?.data}
        done={taskDataById?.data?.is_completed}
        customer360={false}
      />
    </div>
  );
};
export default TaskCardGuidance;
