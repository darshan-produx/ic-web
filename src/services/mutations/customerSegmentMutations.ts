import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addCustomerSegment, deleteCustomerSegment, editCustomerSegment } from '../../app/api/segments/segments';



export function useAddCustomerSegment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => addCustomerSegment(data),
    onSettled: async (data, error) => {
      if (error) console.log(error);
      else {
        await queryClient.invalidateQueries({ queryKey: ['add-customer-segment'] });
      }
    },
    onSuccess(data, variables, context) {
      queryClient.invalidateQueries({ queryKey: ['allCustomerSegments'], exact: true });
    },
  });
}

export function useEditCustomerSegment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => {
      const id: any = data?.id;
      delete data.id;
      return editCustomerSegment(id, data);
    },
    onSettled: async (data, error) => {
      if (error) console.log(error);
      else {
        await queryClient.invalidateQueries({ queryKey: ['edit-customer-segment'] });
      }
    },
    onSuccess(data, variables, context) {
      queryClient.invalidateQueries({ queryKey: ['allCustomerSegments'], exact: true });
    },
  });
}

export function useDeleteCustomerSegment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => {
      return deleteCustomerSegment(id);
    },
    onSettled: async (data, error) => {
      if (error) console.log(error);
      else {
        await queryClient.invalidateQueries({ queryKey: ['delete-customer-segment'] });
      }
    },
    onSuccess(data, variables, context) {
      queryClient.invalidateQueries({ queryKey: ['allCustomerSegments'], exact: true });
    },
  });
}
