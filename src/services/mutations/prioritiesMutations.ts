import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createChecklistItem,
  deleteChecklistItem,
  moveChecklistItems,
  updateChecklistItem,
} from '../../app/api/priorities/priorities';
import { error } from 'console';

export function useCreateChecklistItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => {
      return createChecklistItem(data);
    },
    onSettled: async (data, error) => {
      if (error) console.log(error);
    },
    onSuccess(data, variables, context) {
      queryClient.invalidateQueries({
        queryKey: ['checklistItems'],
        exact: false,
      });
    },
  });
}

export function useUpdateChecklistItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => {
      const checklist_item_id: any = data?.checklist_item_id;
      delete data?.checklist_item_id;
      return updateChecklistItem(checklist_item_id, data);
    },
    onSettled: async (data, error) => {
      if (error) console.log(error);
    },
    onSuccess(data, variables, context) {
      queryClient.invalidateQueries({
        queryKey: ['checklistItems'],
        exact: false,
      });
    },
  });
}

export function useDeleteChecklistItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (checklist_item_id: any) => {
      return deleteChecklistItem(checklist_item_id);
    },
    onSettled: async (data, error) => {
      if (error) console.log(error);
    },
    onSuccess(data, variables, context) {
      queryClient.invalidateQueries({
        queryKey: ['checklistItems'],
        exact: false,
      });
    },
  });
}

export function useMoveChecklistItems() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (date?: any) => {
      return moveChecklistItems(date);
    },
    onSettled: async (data, error) => {
      if (error) console.log(error);
    },
    onSuccess(data, variables, context) {
      queryClient.invalidateQueries({
        queryKey: ['checklistItems'],
        exact: false,
      });
    },
  });
}
