import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import {
  updateAdoptionBusinessKPIParameters,
  updatePerformanceDefectsKPIParameters,
} from '../../app/api/customer-360/customer360GraphData';
type ModalState = boolean;

export const useOnExpandChartModalOpenState = () => {
  const queryClient = useQueryClient();
  const { data: onExpandChartModalOpen = false } = useQuery<ModalState>({
    queryKey: ['onExpandChartModalOpenQuery'],
    queryFn: () => false,
    staleTime: Infinity,
  });
  const { mutate: setOnExpandChartModalOpen } = useMutation<
    ModalState,
    Error,
    ModalState
  >({
    onMutate: (newState: ModalState) => {
      queryClient.setQueryData(['onExpandChartModalOpenQuery'], newState);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['onExpandChartModalOpenQuery'],
        exact: true,
      });
    },
  });

  return { onExpandChartModalOpen, setOnExpandChartModalOpen };
};

type ModalStateArray = string[];
export const useOnExpandChartModalArray = () => {
  const queryClient = useQueryClient();
  const { data: onExpandChartModalArray = [] } = useQuery<ModalStateArray>({
    queryKey: ['onExpandChartModalArrayQuery'],
    queryFn: () => [],
    staleTime: Infinity,
  });
  const { mutate: setOnExpandChartModalArray } = useMutation<
    ModalStateArray,
    Error,
    ModalStateArray
  >({
    onMutate: (newState: ModalStateArray) => {
      queryClient.setQueryData(['onExpandChartModalArrayQuery'], newState);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['onExpandChartModalArrayQuery'],
        exact: true,
      });
    },
  });

  return { onExpandChartModalArray, setOnExpandChartModalArray };
};

type ModalStateFrequency = string;
export const useOnExpandChartFrequency = () => {
  const queryClient = useQueryClient();
  const { data: onExpandChartFrequency = '' } = useQuery<ModalStateFrequency>({
    queryKey: ['onExpandChartFrequencyQuery'],
    queryFn: () => '',
    staleTime: Infinity,
  });
  const { mutate: setOnExpandChartFrequency } = useMutation<
    ModalStateFrequency,
    Error,
    ModalStateFrequency
  >({
    onMutate: (newState: ModalStateFrequency) => {
      queryClient.setQueryData(['onExpandChartFrequencyQuery'], newState);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['onExpandChartFrequencyQuery'],
        exact: true,
      });
    },
  });
  return { onExpandChartFrequency, setOnExpandChartFrequency };
};

type ModalChartSettingId = string;
export const useOnExpandChartSetting = () => {
  const queryClient = useQueryClient();
  const { data: onExpandChartSetting = '' } = useQuery<ModalChartSettingId>({
    queryKey: ['onExpandChartSettingQuery'],
    queryFn: () => '',
    staleTime: Infinity,
  });
  const { mutate: setOnExpandChartSetting } = useMutation<
    ModalChartSettingId,
    Error,
    ModalChartSettingId
  >({
    onMutate: (newState: ModalChartSettingId) => {
      queryClient.setQueryData(['onExpandChartSettingQuery'], newState);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['onExpandChartSettingQuery'],
        exact: true,
      });
    },
  });
  return { onExpandChartSetting, setOnExpandChartSetting };
};

export function useAdoptionBusinessKPIParametersMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => {
      const id: string = data?.id;
      delete data.id;
      return updateAdoptionBusinessKPIParameters(id, data);
    },
    onSettled: async (data, error, variables) => {
      if (error) console.log(error);
    },
    onSuccess(data, variables, context) {
      const pillar = data?.data?.metric_type;
      queryClient.invalidateQueries({
        queryKey: [`customer360-default-${pillar}-graph-data`],
        exact: false,
      });
    },
  });
}

export function usePerformanceDefectKPIParametersMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => {
      const id: string = data?.id;
      delete data.id;
      return updatePerformanceDefectsKPIParameters(id, data);
    },
    onSettled: async (data, error) => {
      if (error) console.log(error);
    },
    onSuccess(data, variables, context) {
      const pillar = data?.data?.metric_type;
      queryClient.invalidateQueries({
        queryKey: [`customer360-default-${pillar}-graph-data`],
        exact: false,
      });
    },
  });
}