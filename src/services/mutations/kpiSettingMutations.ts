import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateGlobalKPISettings } from '../../app/api/globalconfig/globalconfig';


export function useEditKPISettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => {
      return updateGlobalKPISettings(data);
    },
    onSettled: async (data, error) => {
      if (error) console.log(error);
    },
    onSuccess(data, variables, context) {
      queryClient.invalidateQueries({
        queryKey: ['getAllKPISettings'],
        exact: true,
      });
    },
  });
}

