import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadAdoptionBusinessKpi } from '../../app/api/config/adoptoin_business_kpi';
import {
  postIntelligenceChatInsight,
  updateGuidance,
  updateInsightDetails,
  createOpportunity,
  removeOpportunity,
  reRunResearch,
} from '../../app/api/insights/insights';
import { updateUserNotes } from '../../app/api/customers/customers';
import { updateOpportunityFromGrid } from '../../app/api/insights/opportunities';

interface UpdateOpportunityFromGridParams {
  opportunityId: string;
  configId: string;
  data: any;
  fieldPath: string;
  queryKey: any;
}

interface UpdateUserNotesParams {
  user_id: string;
  supervisor_note: string;
  queryKey?: any[];
}

export function useCreateOpportunity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => {
      // const id: any = data?.id;
      const payload: any = data;
      return createOpportunity(payload);
    },
    onSettled: async (data, error) => {
      if (error) console.log(error);
    },
    onSuccess(data, variables, context) {
      queryClient.invalidateQueries({
        queryKey: ['allInsights'],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ['insightDetails'],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ['getAllActiveInsights'],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ['opportunities'],
        exact: false,
      });
    },
  });
}

export function useRemoveOpportunity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      // const id: any = data?.id;
      return removeOpportunity(id);
    },
    onSettled: async (data, error) => {
      if (error) console.log(error);
      queryClient.invalidateQueries({
        queryKey: ['allInsights'],
        exact: false,
      });
    },
    onSuccess(data, variables, context) {
      queryClient.invalidateQueries({
        queryKey: ['allInsights'],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ['insightDetails'],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ['getAllActiveInsights'],
        exact: false,
      });
    },
  });
}

export function useUpdateInsight() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => {
      const id: any = data?.id;
      const payload: any = data.data;
      return updateInsightDetails(id, payload);
    },
    onSettled: async (data, error) => {
      if (error) console.log(error);
    },
    onSuccess(data, variables, context) {
      queryClient.invalidateQueries({
        queryKey: ['allInsights'],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ['insightDetails'],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ['opportunities'],
        exact: false,
      });
    },
  });
}
export function useUpdateOpportunityStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => {
      const id: any = data?.id;
      const payload: any = data.data;
      return updateInsightDetails(id, payload);
    },
    onMutate: async (variables: any) => {
      const { id, data, queryKey } = variables;

      if (!queryKey) {
        return { previousData: null, queryKey: null };
      }
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData(queryKey);
      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old || !old.data) return old;
        if (Array.isArray(old.data)) {
          return {
            ...old,
            data: old.data.map((opportunity: any) =>
              opportunity._id === id
                ? {
                  ...opportunity,
                  ...(data.action_status !== undefined && { action_status: data.action_status }),
                  ...(data.action_sub_status !== undefined && { action_sub_status: data.action_sub_status }),
                  updated_at: new Date().toISOString(), // Optimistically update the updated_at timestamp
                }
                : opportunity
            ),
          };
        }
        if (old.data.data && Array.isArray(old.data.data)) {
          return {
            ...old,
            data: {
              ...old.data,
              data: old.data.data.map((opportunity: any) =>
                opportunity._id === id
                  ? {
                    ...opportunity,
                    ...(data.action_status !== undefined && { action_status: data.action_status }),
                    ...(data.action_sub_status !== undefined && { action_sub_status: data.action_sub_status }),
                    updated_at: new Date().toISOString(), // Optimistically update the updated_at timestamp
                  }
                  : opportunity
              ),
            },
          };
        }

        return old;
      });
      return { previousData, queryKey };
    },
    onError: (err, variables, context) => {
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

    onSuccess(data, variables, context) {
      queryClient.invalidateQueries({
        queryKey: ['insightDetails'],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ['opportunities'],
        exact: false,
      });
    },
  });
}

export function useUpdateGuidance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => {
      const id: string = payload.id;
      const data = payload.data;
      return updateGuidance(id, data);
    },
    onSettled: async (data, error) => {
      if (error) console.log(error);
    },
    // onSuccess(data, variables, context) {
    //   queryClient.invalidateQueries({ queryKey: ['guidance'], exact: false });
    // }
  });
}
export function useIntelligenceChatInsight() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => {
      return postIntelligenceChatInsight(data);
    },
    onSettled: async (data, error) => {
      if (error) console.log(error);
    },
  });
}

export function useUpdateUserNotes() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateUserNotesParams) => {
      const user_id = data?.user_id;
      return updateUserNotes(user_id, {
        supervisor_note: data?.supervisor_note,
      });
    },

    // 🟢 Optimistic Update
    onMutate: async (variables: UpdateUserNotesParams) => {
      const { user_id, supervisor_note, queryKey } = variables;

      if (!queryKey) {
        return { previousData: null, queryKey: null };
      }

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(queryKey);
      // Optimistically update the cache
      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old || !old.data) return old;

        // Helper function to update supervisor_note in user object recursively
        const updateUserInNode = (node: any): any => {
          if (!node) return node;

          const updatedNode = { ...node };

          // Update user's supervisor_note if this is the matching user
          if (updatedNode.user && updatedNode.user._id === user_id) {
            updatedNode.user = {
              ...updatedNode.user,
              supervisor_note: supervisor_note,
            };
          }
          // Recursively update children
          if (updatedNode.children && Array.isArray(updatedNode.children)) {
            updatedNode.children = updatedNode.children.map((child: any) =>
              updateUserInNode(child)
            );
          }
          return updatedNode;
        };

        // Handle array response (data is an array)
        if (Array.isArray(old.data)) {
          return {
            ...old,
            data: old.data.map((item: any) => updateUserInNode(item)),
          };
        }

        // Handle nested data structure (data.data is an array)
        if (old.data.data && Array.isArray(old.data.data)) {
          return {
            ...old,
            data: {
              ...old.data,
              data: old.data.data.map((item: any) => updateUserInNode(item)),
            },
          };
        }
        return old;
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

export function useReRunResearch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { org_id: string; insight_instance_id: string }) => {
      return reRunResearch(data);
    },
    onSettled: async (data, error) => {
      if (error) console.log(error);
    },
    onSuccess(data, variables, context) {
      queryClient.invalidateQueries({
        queryKey: ['allInsights'],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ['insightDetails'],
        exact: false,
      });
    },
  });
}


export function useUpdateOpportunityFromGrid() {
  const queryClient = useQueryClient();

  // Helper to apply field updates to an opportunity row
  const applyUpdate = (opportunity: any, opportunityId: string, data: any) => {
    if (opportunity._id !== opportunityId) return opportunity;
    return {
      ...opportunity,
      ...(data.empty_cell
        ? { [data.empty_cell]: null }
        : Object.keys(data).reduce((acc, key) => {
            if (key !== 'empty_cell') acc[key] = data[key];
            return acc;
          }, {} as any)
      ),
    };
  };

  return useMutation({
    mutationFn: ({ opportunityId, configId, data, fieldPath, queryKey }: UpdateOpportunityFromGridParams) => {
      return updateOpportunityFromGrid(opportunityId, configId, data);
    },

    // 🟢 Optimistic Update — handles both useQuery (flat) and useInfiniteQuery (pages) structures
    onMutate: async ({ opportunityId, data, fieldPath, queryKey }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(queryKey);

      // Optimistically update the cache
      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old) return old;

        // Handle useInfiniteQuery structure: { pages: [...], pageParams: [...] }
        if (old.pages && Array.isArray(old.pages)) {
          return {
            ...old,
            pages: old.pages.map((page: any) => {
              if (!page?.data?.data) return page;
              return {
                ...page,
                data: {
                  ...page.data,
                  data: page.data.data.map((opp: any) =>
                    applyUpdate(opp, opportunityId, data)
                  ),
                },
              };
            }),
          };
        }

        // Handle regular useQuery structure: { data: { data: [...] } }
        if (old.data?.data) {
          return {
            ...old,
            data: {
              ...old.data,
              data: old.data.data.map((opp: any) =>
                applyUpdate(opp, opportunityId, data)
              ),
            },
          };
        }

        return old;
      });

      // Return context for rollback
      return { previousData, queryKey };
    },

    // 🔴 Rollback if failed
    onError: (err, variables, context) => {
      // Restore the previous data on error
      if (context?.previousData) {
        queryClient.setQueryData(variables.queryKey, context.previousData);
      }
    },

    onSuccess: (data, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: ['insightDetails'],
        exact: false,
      });
    },

    // ✅ Cleanup: Explicitly clear context after mutation completes
    onSettled: (data, error, variables, context) => {
      if (error) console.error('Update failed:', error);
      // Explicitly clear previousData to help garbage collection
      if (context) {
        context.previousData = null;
        context.queryKey = null;
      }
    },
  });
}
