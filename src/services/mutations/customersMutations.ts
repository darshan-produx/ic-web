import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  assignCustomer,
  createCustomerEvent,
  createLastQBRDate,
  createUpdateGroupCustomer,
  saveProfilePicture,
  updateCustomerAttributes,
  updateCustomerDescription,
  updateCustomerJourneySignal,
} from '../../app/api/customers/customers';
import { ObjectId } from 'mongoose';
export function useAssignCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => {
      const id: any = data?.id;
      delete data.id;
      return assignCustomer(id, data);
    },
    onSettled: async (data, error) => {
      if (error) console.log(error);
    },
    onSuccess(data, variables, context) {
      queryClient.invalidateQueries({
        queryKey: ['allCustomersAdmin'],
        exact: true,
      });
      queryClient.invalidateQueries({
        queryKey: ['getAllCustomerSegments'],
        exact: true,
      });
      queryClient.invalidateQueries({ queryKey: ['getAllusers'], exact: true });
      queryClient.invalidateQueries({
        queryKey: ['getCustomerDetails'],
        exact: true,
      });
    },
  });
}

interface UpdateCustomerDescriptionParams {
  id: number;
  description: string;
  queryKey?: any[];
}

export function useUpdateCustomerDescription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => {
      const customer_id: number = data?.id;
      delete data.id;
      return updateCustomerDescription(customer_id, data);
    },
    onSettled: async (data, error) => {
      if (error) console.log(error);
    },
    onSuccess(data, variables, context) {
      queryClient.invalidateQueries({
        queryKey: ['getAllAssignedCustomers'],
        exact: true,
      });
      queryClient.invalidateQueries({
        queryKey: ['customer-details'],
        exact: false,
      });
    },
  });
}

export function useUpdateCustomerNotes() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateCustomerDescriptionParams) => {
      const customer_id: number = data?.id;
      const payload = { description: data.description };
      return updateCustomerDescription(customer_id, payload);
    },

    // 🟢 Optimistic Update
    onMutate: async (variables: UpdateCustomerDescriptionParams) => {
      const { id: customer_id, description, queryKey } = variables;

      if (!queryKey) {
        return { previousData: null, queryKey: null };
      }

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(queryKey);

      // Optimistically update the cache
      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old || !old.data || !old.data.data) return old;

        // Helper function to update customer_success_plan in customers array recursively
        const updateCustomersInNode = (node: any): any => {
          if (!node) return node;

          const updatedNode = { ...node };

          // Update customers array if exists
          if (updatedNode.customers && Array.isArray(updatedNode.customers)) {
            updatedNode.customers = updatedNode.customers.map((customer: any) =>
              customer.customer_id === customer_id
                ? { ...customer, customer_success_plan: description }
                : customer
            );
          }

          // Recursively update children
          if (updatedNode.children && Array.isArray(updatedNode.children)) {
            updatedNode.children = updatedNode.children.map((child: any) =>
              updateCustomersInNode(child)
            );
          }

          return updatedNode;
        };

        return {
          ...old,
          data: {
            ...old.data,
            data: old.data.data.map((item: any) => updateCustomersInNode(item)),
          },
        };
      });

      // Return context for rollback
      return { previousData, queryKey };
    },

    // 🔴 Rollback if failed
    onError: (err, variables, context) => {
      // Restore the previous data on error
      if (context?.previousData && context?.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previousData);
      }
    },

    // ✅ Cleanup: Explicitly clear context after mutation completes
    onSettled: async (data, error, variables, context) => {
      if (error) console.error('Update failed:', error);
      // Explicitly clear previousData to help garbage collection
      if (context) {
        context.previousData = null;
        context.queryKey = null;
      }
    },
  });
}

export function useUpdateCustomerDescriptionCustomer360() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => {
      const customer_id: number = data?.id;
      delete data.id;
      return updateCustomerDescription(customer_id, data);
    },
    onSettled: async (data, error) => {
      if (error) console.log(error);
    },
    onSuccess(data, variables, context) {
      queryClient.invalidateQueries({
        queryKey: ['customer-details'],
        exact: false,
      });
    },
  });
}

export function useUpdateCustomerStarred() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => {
      const customer_id: number = data?.id;
      delete data.id;
      return updateCustomerDescription(customer_id, data);
    },
    onSettled: async (data, error) => {
      if (error) console.log(error);
    },
    onSuccess(data, variables, context) {
      queryClient.invalidateQueries({
        queryKey: ['customer-details'],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ['customers-overview-data'],
        exact: false,
      });
    },
  });
}
export function useUpdateCustomerChurn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => {
      const customer_id: number = data?.id;
      delete data.id;
      return updateCustomerDescription(customer_id, data);
    },
    onSettled: async (data, error) => {
      if (error) console.log(error);
    },
    onSuccess(data, variables, context) {
      queryClient.invalidateQueries({
        queryKey: ['customer-details'],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ['customers-overview-data'],
        exact: false,
      });
    },
  });
}

export function useCreateUpdateGroupCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => {
      return createUpdateGroupCustomer(data);
    },
    onSettled: async (data, error) => {
      if (error) console.log(error);
    },
    onSuccess(data, variables, context) {
      queryClient.invalidateQueries({
        queryKey: ['associated-customer'],
        exact: true,
      });
      queryClient.invalidateQueries({
        queryKey: ['groupCustomers'],
        exact: false,
      });
    },
  });
}

export function usecreateLastQBRDate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => {
      const customer_id: number = data?.id;
      delete data.id;

      return createLastQBRDate(customer_id, data);
    },
    onSettled: async (data, error) => {
      if (error) console.log(error);
      else {
        await queryClient.invalidateQueries({
          queryKey: ['getLastQBRDate'],
        });
      }
    },
    onSuccess(data, variables, context) {
      queryClient.invalidateQueries({
        queryKey: ['getLastQBRDate'],
        exact: true,
      });
    },
  });
}

export function useProfilePicture() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => {
      const ref_type: string = data?.ref_type;
      const ref_id: ObjectId = data?.ref_id;

      return saveProfilePicture(ref_type, ref_id, data);
    },
    onSettled: async (data, error) => {
      if (error) console.log(error);
      else {
        await queryClient.invalidateQueries({
          queryKey: ['getProfilePicture'],
        });
      }
    },
    onSuccess(data, variables, context) {
      queryClient.invalidateQueries({
        queryKey: ['getProfilePicture'],
        exact: true,
      });
    },
  });
}

export function useUpdateCustomerAttributes() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const customer_id: number = data?.id;
      delete data.id;
      const payload = data?.data;
      const base_collection = data?.base_collection;
      const base_collection_id = data?.base_collection_id;
      if (data) {
        delete data.base_collection;
        delete data.base_collection_id;
      }
      return updateCustomerAttributes(
        payload,
        customer_id,
        base_collection,
        base_collection_id
      );
    },
    onSuccess(data, variables, context) {
      queryClient.invalidateQueries({
        queryKey: ['opportunities'],
        exact: false,
      });
    },
    onSettled: async (data, error) => {
      if (error) console.log(error);
    },
  });
}

export function useUpdateEventInEventJourney() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ signalId, data, fromPage }: { signalId: string; data: any; fromPage?: string }) => {
      return updateCustomerJourneySignal(signalId, data);
    },
    onSuccess(data, variables, context) {
      if ((variables.data?.update || variables.data?.is_deleted || variables.data?.title || variables.data?.intensity || variables.data?.status)) {
        if (variables?.fromPage === "journey") {
          queryClient.invalidateQueries({
            queryKey: ['customerJourney'],
            exact: false,
          });
        }
        if (variables?.fromPage === "customer-360" || variables.fromPage === 'my-team') {
          queryClient.invalidateQueries({
            queryKey: ['signals'],
            exact: false,
          });
        }
      }
      if (variables.data?.update || variables.data?.status || variables.data?.intensity) {
        queryClient.invalidateQueries({
          queryKey: ['getCustomerJourneySignal', variables.signalId],
          exact: true,
        });
      }
      if ((variables.data?.is_deleted || variables.data?.intensity || variables.data?.status)) {
         queryClient.invalidateQueries({
            queryKey: ['getPillarStatus'],
            exact: true,
          });
        if (variables.fromPage === 'group-customers') {
          queryClient.invalidateQueries({
            queryKey: ['customers-full-overview-data'],
            exact: false,
          });
        }
        if (variables.fromPage === 'customers') {
          queryClient.invalidateQueries({
            queryKey: ['customers-overview-data'],
            exact: true,
          });
        }
      }
    }
  });
}
export function useCreatePhaseChange() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ data }: { data: any }) => {
      return createCustomerEvent(data);
    },
    onSuccess(data, variables, context) {
      queryClient.invalidateQueries({
        queryKey: ['customerJourney'],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ['customer-details'],
        exact: false,
      });
    }
  });
}