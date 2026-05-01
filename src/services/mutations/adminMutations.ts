import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateFeedData } from '../../app/api/admin/admin';

interface UpdateFeedDataProps {
    data: Record<string, any>;
    queryKey: any[];
    action:any[];
}

export function useUpdateFeedData() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ data, action }: UpdateFeedDataProps ) => {
            return updateFeedData(data, action);
        },

        // Optimistic update: apply changes to the cache immediately
        onMutate: async ({ data, queryKey }) => {
            // Cancel in-flight refetches so they don't overwrite our optimistic update
            await queryClient.cancelQueries({ queryKey, exact: false });

            // Snapshot the current cache for rollback
            const previousData = queryClient.getQueryData(queryKey);

            // Optimistically update the cached feed data
            // Supports both useInfiniteQuery ({ pages, pageParams }) and useQuery formats
            queryClient.setQueryData(queryKey, (old: any) => {
                if (!old) return old;

                const updatedIds = new Set<string>(data.ids || []);
                // Build a patch object from all fields except 'ids' and 'actions'
                const patch: Record<string, any> = {};
                for (const key of Object.keys(data)) {
                    if (key === 'ids' || key === 'actions') continue;
                    patch[key] = data[key];
                }

                // Handle useInfiniteQuery paginated structure
                if (old.pages && Array.isArray(old.pages)) {
                    // For delete / deny actions, remove matched rows
                    if (data.actions === 'delete' || data.actions === 'deny_user') {
                        return {
                            ...old,
                            pages: old.pages.map((page: any) => ({
                                ...page,
                                data: {
                                    ...page.data,
                                    data: (page.data?.data ?? []).filter(
                                        (row: any) => !updatedIds.has(row._id)
                                    ),
                                    total: Math.max((page.data?.total || 0) - updatedIds.size, 0),
                                },
                            })),
                        };
                    }

                    return {
                        ...old,
                        pages: old.pages.map((page: any) => ({
                            ...page,
                            data: {
                                ...page.data,
                                data: (page.data?.data ?? []).map((row: any) =>
                                    updatedIds.has(row._id)
                                        ? { ...row, ...patch }
                                        : row
                                ),
                            },
                        })),
                    };
                }

                // Fallback: handle legacy useQuery flat structure
                if (!old?.data?.data) return old;

                // For delete / deny actions, remove matched rows from the list
                if (data.actions === 'delete' || data.actions === 'deny_user') {
                    return {
                        ...old,
                        data: {
                            ...old.data,
                            data: old.data.data.filter(
                                (row: any) => !updatedIds.has(row._id)
                            ),
                            total: Math.max((old.data.total || 0) - updatedIds.size, 0),
                        },
                    };
                }

                return {
                    ...old,
                    data: {
                        ...old.data,
                        data: old.data.data.map((row: any) =>
                            updatedIds.has(row._id)
                                ? { ...row, ...patch }
                                : row
                        ),
                    },
                };
            });

            return { previousData, queryKey };
        },

        // Rollback on error
        onError: (_err, variables, context) => {
            if (context?.previousData) {
                queryClient.setQueryData(context.queryKey, context.previousData);
            }
        },

        // Refetch after success to ensure server state is in sync
        onSettled: (data, _error, variables, context) => {
            if (context?.queryKey) {
                queryClient.invalidateQueries({
                    queryKey: context.queryKey,
                    exact: true,
                });
            } else {
                queryClient.invalidateQueries({
                    queryKey: ['adminFeedData'],
                    exact: false,
                });
            }
            // Help GC
            if (context) {
                context.previousData = null;
                (context as any).queryKey = null;
            }
        },
    });
}