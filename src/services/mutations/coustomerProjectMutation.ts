import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  addTaskMilestone,
  editProject,
} from '../../app/api/customer-360/customerProjects/customerProjects';
addTaskMilestone;
export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => {
      const project_plan_id = data?.id;
      delete data.id;
      if (data?.overridden_status_color) {
        delete data?.status;
      }
      return editProject(project_plan_id, data);
    },
    onSuccess: (data, variables, context) => {
      // Invalidate the queries related to 'adoption-business-kpis' to refresh the list
      //   queryClient.invalidateQueries({
      //     queryKey: [''],
      //     exact: true,
      //   });
    },
    onError: (error) => {
      // Handle the error
      console.log(error);
    },
    onSettled: (data, error) => {
      queryClient.invalidateQueries({
        queryKey: ['customerProjectPlan'],
      });
      queryClient.invalidateQueries({
        queryKey: ['getPillarStatus'],
      });
    },
  });
}

export function useAddTaskMilestone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => {
      const project_plan_id = data?.id;
      delete data.id;
      return addTaskMilestone(project_plan_id, data);
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ['customerProjectPlan'],
      });
      queryClient.invalidateQueries({
        queryKey: ['getPillarStatus'],
      });
      queryClient.invalidateQueries({
        queryKey: ['getAllPriorityTasks'],
        exact: false,
      });
    },
    onError: (error) => {
      // Handle the error
      console.log(error);
    },
    onSettled: (data, error) => {
      // Optionally handle settled state, you might not need to invalidate a specific query here
    },
  });
}
