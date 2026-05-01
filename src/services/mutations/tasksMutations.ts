import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTask, deleteTask, updateTask } from '../../app/api/tasks/tasks';

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => createTask(data),
    onSettled: async (data, error) => {
      if (error) console.log(error);
      else {
        //
      }
    },
    onSuccess: async (res) => {
      await queryClient.invalidateQueries({
        queryKey: ['tasks'],
      });
      await queryClient.invalidateQueries({
        queryKey: ['customerProjectPlan'],
      });
      await queryClient.invalidateQueries({
        queryKey: ['getPillarStatus'],
      });
      await queryClient.invalidateQueries({
        queryKey: ['getAllPriorityTasks'],
      });
      await queryClient.invalidateQueries({
        queryKey: ['prioritiesTaskstData'],
      });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: any) => deleteTask(id),
    onSettled: async (data, error) => {
      if (error) console.log(error);
      else {
        //
      }
    },
    onSuccess: async (res) => {
      await queryClient.invalidateQueries({
        queryKey: ['tasks'],
      });
      await queryClient.invalidateQueries({
        queryKey: ['getAllPriorityTasks'],
      });
      await queryClient.invalidateQueries({
        queryKey: ['prioritiesTaskstData'],
      });
      await queryClient.invalidateQueries({
        queryKey: ['customerProjectPlan'],
      });
      await queryClient.invalidateQueries({
        queryKey: ['getPillarStatus'],
      });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => updateTask(data?._id, data),
    onSettled: async (data, error) => {
      if (error) console.log(error);
      else {
        //
      }
    },
    onSuccess: async (res) => {
      await queryClient.invalidateQueries({
        queryKey: ['tasks'],
      });
      await queryClient.invalidateQueries({
        queryKey: ['getAllPriorityTasks'],
      });
      await queryClient.invalidateQueries({
        queryKey: ['customerOnboardingPlan'],
      });
      await queryClient.invalidateQueries({
        queryKey: ['insightDetails'],
      });
      await queryClient.invalidateQueries({
        queryKey: ['prioritiesTaskstData'],
      });
      await queryClient.invalidateQueries({
        queryKey: ['customerProjectPlan'],
      });
      await queryClient.invalidateQueries({
        queryKey: ['getPillarStatus'],
      });
    },
  });
}
