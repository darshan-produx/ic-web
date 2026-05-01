import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  addPerformanceDefectsKpi,
  deletePerformanceDefectKpi,
  editPerformanceDefectsKpi,
  uploadPerformanceDefectKpi,
} from '../../app/api/config/performance_defect_kpi';
import {
  addAdoptionBusinessKpi,
  deleteAdoptionBusinessKpi,
  editAdoptionBusinessKpi,
  uploadAdoptionBusinessKpi,
} from '../../app/api/config/adoptoin_business_kpi';
import {
  deleteUsecaseConfig,
  uploadUsecaseConfig,
} from '../../app/api/config/usecase_config';
import {
  addNpsMetric,
  deleteNpsMetric,
  editNpsMetric,
} from '../../app/api/config/nps_metric';
import {
  deleteRecipeConfig,
  uploadRecipeConfig,
} from '../../app/api/config/recipe_config';
import {
  addRecipeInsightSegment,
  deleteRecipeInsightSegment,
  editRecipeInsightSegment,
} from '../../app/api/config/recipe_insight_segment';
import {
  addSLAMaster,
  deleteSLAMaster,
  editSLAMaster,
} from '../../app/api/config/sla_master';
import {
  deleteInsightMaster,
  uploadInsightMaster,
} from '../../app/api/config/insight_master';
import {
  deleteCustomerProjectConfig,
  uploadCustomerProjectConfig,
} from '../../app/api/config/customer_project_config';

export function useUploadAdoptionBusinessKpi() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => uploadAdoptionBusinessKpi(data),
    onSuccess: (data, variables, context) => {
      // Invalidate the queries related to 'adoption-business-kpis' to refresh the list
      queryClient.invalidateQueries({
        queryKey: ['adoption-business-kpis'],
        exact: true,
      });

      queryClient.invalidateQueries({
        queryKey: ['template-adoption-business-kpis'],
        exact: true,
      });
    },
    onError: (error) => {
      // Handle the error
      console.log(error);
    },
    onSettled: (data, error) => {
      // Optionally handle settled state, you might not need to invalidate a specific query here
      queryClient.invalidateQueries({
        queryKey: ['upload-adoption-business-kpi'],
      });
    },
  });
}

export function useUploadPerformanceDefectKpi() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => uploadPerformanceDefectKpi(data),
    onSuccess: (data, variables, context) => {
      // Invalidate the queries related to 'adoption-business-kpis' to refresh the list
      queryClient.invalidateQueries({
        queryKey: ['performance-defect-kpis'],
        exact: true,
      });

      queryClient.invalidateQueries({
        queryKey: ['template-performance-defect-kpis'],
        exact: true,
      });
    },
    onError: (error) => {
      // Handle the error
      console.log(error);
    },
    onSettled: (data, error) => {
      // Optionally handle settled state, you might not need to invalidate a specific query here
      queryClient.invalidateQueries({
        queryKey: ['upload-performance-defect-kpi'],
      });
    },
  });
}

export function useUploadUsecaseConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => uploadUsecaseConfig(data),
    onSuccess: (data, variables, context) => {
      // Invalidate the queries related to 'adoption-business-kpis' to refresh the list
      queryClient.invalidateQueries({
        queryKey: ['usecase-configs'],
        exact: true,
      });

      queryClient.invalidateQueries({
        queryKey: ['template-usecase-configs'],
        exact: true,
      });
    },
    onError: (error) => {
      // Handle the error
      console.log(error);
    },
    onSettled: (data, error) => {
      // Optionally handle settled state, you might not need to invalidate a specific query here
      queryClient.invalidateQueries({
        queryKey: ['upload-usecase-config'],
      });
    },
  });
}

export function useUploadRecipeConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => uploadRecipeConfig(data),
    onSuccess: (data, variables, context) => {
      // Invalidate the queries related to 'adoption-business-kpis' to refresh the list
      queryClient.invalidateQueries({
        queryKey: ['recipe-configs'],
        exact: true,
      });

      queryClient.invalidateQueries({
        queryKey: ['template-recipe-configs'],
        exact: true,
      });
    },
    onError: (error) => {
      // Handle the error
      console.log(error);
    },
    onSettled: (data, error) => {
      // Optionally handle settled state, you might not need to invalidate a specific query here
      queryClient.invalidateQueries({
        queryKey: ['upload-recipe-config'],
      });
    },
  });
}

export function useUploadCustomerProjectConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => uploadCustomerProjectConfig(data),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ['customer-project-config'],
        exact: true,
      });

      queryClient.invalidateQueries({
        queryKey: ['template-customer-project-configs'],
        exact: true,
      });
    },
    onError: (error) => {
      console.log(error);
    },
    onSettled: (data, error) => {
      queryClient.invalidateQueries({
        queryKey: ['upload-customer-project-config'],
      });
    },
  });
}

export function useUploadInsightMaster() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => uploadInsightMaster(data),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ['insight-master'],
        exact: true,
      });

      queryClient.invalidateQueries({
        queryKey: ['insight-master'],
        exact: true,
      });
    },
    onError: (error) => {
      console.log(error);
    },
    onSettled: (data, error) => {
      queryClient.invalidateQueries({
        queryKey: ['insight-master'],
      });
    },
  });
}

export function useAddNpsMetric() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => addNpsMetric(data),
    onSuccess: (data, variables, context) => {
      // Invalidate the queries related to 'adoption-business-kpis' to refresh the list
      queryClient.invalidateQueries({
        queryKey: ['nps-metrics'],
        exact: true,
      });
    },
    onError: (error) => {
      // Handle the error
      console.log(error);
    },
    onSettled: (data, error) => {
      // Optionally handle settled state, you might not need to invalidate a specific query here
      queryClient.invalidateQueries({
        queryKey: ['nps-metric'],
      });
    },
  });
}

export function useAddSLAMaster() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => addSLAMaster(data),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ['sla-master'],
        exact: true,
      });
    },
    onError: (error) => {
      console.log(error);
    },
    onSettled: (data, error) => {
      queryClient.invalidateQueries({
        queryKey: ['sla-master'],
      });
    },
  });
}

export function useEditNpsMetric() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await editNpsMetric(data);
      return response;
    },
    onSuccess: (data, variables, context) => {
      // Invalidate the queries related to 'adoption-business-kpis' to refresh the list
      queryClient.invalidateQueries({
        queryKey: ['nps-metrics'],
        exact: true,
      });
    },
    onError: (error) => {
      // Handle the error
      console.log(error);
    },
    onSettled: (data, error) => {
      // Optionally handle settled state, you might not need to invalidate a specific query here
      queryClient.invalidateQueries({
        queryKey: ['nps-metric'],
      });
    },
  });
}

export function useEditSLAMaster() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await editSLAMaster(data);
      return response;
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ['sla-master'],
        exact: true,
      });
    },
    onError: (error) => {
      console.log(error);
    },
    onSettled: (data, error) => {
      queryClient.invalidateQueries({
        queryKey: ['sla-master'],
      });
    },
  });
}

export function useDeleteAdoptionBusinessKpi() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      return deleteAdoptionBusinessKpi(id);
    },
    onSuccess: (data, variables, context) => {
      // Invalidate the queries related to 'adoption-business-kpis' to refresh the list
      queryClient.invalidateQueries({
        queryKey: ['adoption-business-kpis'],
        exact: true,
      });
    },
    onError: (error) => {
      // Handle the error
      console.log(error);
    },
    onSettled: (data, error) => {
      // Optionally handle settled state, you might not need to invalidate a specific query here
      queryClient.invalidateQueries({
        queryKey: ['delete-adoption-business-kpi'],
      });
    },
  });
}

export function useDeleteInsightMaster() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      return deleteInsightMaster(id);
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ['insight-master'],
        exact: true,
      });
    },
    onError: (error) => {
      console.log(error);
    },
    onSettled: (data, error) => {
      queryClient.invalidateQueries({
        queryKey: ['insight-master'],
      });
    },
  });
}

export function useDeletePerformanceDefectKpi() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      return deletePerformanceDefectKpi(id);
    },
    onSuccess: (data, variables, context) => {
      // Invalidate the queries related to 'adoption-business-kpis' to refresh the list
      queryClient.invalidateQueries({
        queryKey: ['performance-defect-kpis'],
        exact: true,
      });
    },
    onError: (error) => {
      // Handle the error
      console.log(error);
    },
    onSettled: (data, error) => {
      // Optionally handle settled state, you might not need to invalidate a specific query here
      queryClient.invalidateQueries({
        queryKey: ['delete-performance-defect-kpi'],
      });
    },
  });
}

export function useDeleteUsecaseConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      return deleteUsecaseConfig(id);
    },
    onSuccess: (data, variables, context) => {
      // Invalidate the queries related to 'adoption-business-kpis' to refresh the list
      queryClient.invalidateQueries({
        queryKey: ['usecase-configs'],
        exact: true,
      });
    },
    onError: (error) => {
      // Handle the error
      console.log(error);
    },
    onSettled: (data, error) => {
      // Optionally handle settled state, you might not need to invalidate a specific query here
      queryClient.invalidateQueries({
        queryKey: ['delete-usecase-config'],
      });
    },
  });
}

export function useDeleteRecipeConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      return deleteRecipeConfig(id);
    },
    onSuccess: (data, variables, context) => {
      // Invalidate the queries related to 'adoption-business-kpis' to refresh the list
      queryClient.invalidateQueries({
        queryKey: ['recipe-configs'],
        exact: true,
      });
    },
    onError: (error) => {
      // Handle the error
      console.log(error);
    },
    onSettled: (data, error) => {
      // Optionally handle settled state, you might not need to invalidate a specific query here
      queryClient.invalidateQueries({
        queryKey: ['delete-recipe-config'],
      });
    },
  });
}

export function useDeleteCustomerProjectConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      return deleteCustomerProjectConfig(id);
    },
    onSuccess: (data, variables, context) => {
      // Invalidate the queries related to 'adoption-business-kpis' to refresh the list
      queryClient.invalidateQueries({
        queryKey: ['customer-project-config'],
        exact: true,
      });
    },
    onError: (error) => {
      // Handle the error
      console.log(error);
    },
    onSettled: (data, error) => {
      // Optionally handle settled state, you might not need to invalidate a specific query here
      queryClient.invalidateQueries({
        queryKey: ['delete-customer-project-config'],
      });
    },
  });
}

export function useDeleteNpsMetric() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      return deleteNpsMetric(id);
    },
    onSuccess: (data, variables, context) => {
      // Invalidate the queries related to 'adoption-business-kpis' to refresh the list
      queryClient.invalidateQueries({
        queryKey: ['nps-metrics'],
        exact: true,
      });
    },
    onError: (error) => {
      // Handle the error
      console.log(error);
    },
    onSettled: (data, error) => {
      // Optionally handle settled state, you might not need to invalidate a specific query here
      queryClient.invalidateQueries({
        queryKey: ['delete-nps-metric'],
      });
    },
  });
}

export function useDeleteSLAMaster() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      return deleteSLAMaster(id);
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ['sla-master'],
        exact: true,
      });
    },
    onError: (error) => {
      console.log(error);
    },
    onSettled: (data, error) => {
      queryClient.invalidateQueries({
        queryKey: ['sla-master'],
      });
    },
  });
}

export function useAddRecipeInsightSegment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => addRecipeInsightSegment(data),
    onSuccess: (data, variables, context) => {
      // Invalidate the queries related to 'adoption-business-kpis' to refresh the list
      queryClient.invalidateQueries({
        queryKey: ['recipe-insight-segments'],
        exact: true,
      });
    },
    onError: (error) => {
      // Handle the error
      console.log(error);
    },
    onSettled: (data, error) => {
      // Optionally handle settled state, you might not need to invalidate a specific query here
      queryClient.invalidateQueries({
        queryKey: ['recipe-insight-segment'],
      });
    },
  });
}

export function useEditRecipeInsightSegment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await editRecipeInsightSegment(data);
      return response;
    },
    onSuccess: (data, variables, context) => {
      // Invalidate the queries related to 'adoption-business-kpis' to refresh the list
      queryClient.invalidateQueries({
        queryKey: ['recipe-insight-segments'],
        exact: true,
      });
    },
    onError: (error) => {
      // Handle the error
      console.log(error);
    },
    onSettled: (data, error) => {
      // Optionally handle settled state, you might not need to invalidate a specific query here
      queryClient.invalidateQueries({
        queryKey: ['recipe-insight-segment'],
      });
    },
  });
}

export function useDeleteRecipeInsightSegment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      return deleteRecipeInsightSegment(id);
    },
    onSuccess: (data, variables, context) => {
      // Invalidate the queries related to 'adoption-business-kpis' to refresh the list
      queryClient.invalidateQueries({
        queryKey: ['recipe-insight-segments'],
        exact: true,
      });
    },
    onError: (error) => {
      // Handle the error
      console.log(error);
    },
    onSettled: (data, error) => {
      // Optionally handle settled state, you might not need to invalidate a specific query here
      queryClient.invalidateQueries({
        queryKey: ['delete-recipe-insight-segment'],
      });
    },
  });
}

export function useAddAdoptionBusinessKPI() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => addAdoptionBusinessKpi(data),
    onSettled: async (data, error) => {
      if (error) console.log(error);
      else {
        //
      }
    },
    onSuccess(data, variables, context) {
      queryClient.invalidateQueries({
        queryKey: ['adoption-business-kpis'],
        exact: true,
      });
    },
  });
}

export function useEditAdoptionBusinessKPI() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => {
      const id: any = data?.id;
      delete data.id;
      return editAdoptionBusinessKpi(id, data?.body);
    },
    onSettled: async (data, error) => {
      if (error) console.log(error);
      else {
        await queryClient.invalidateQueries({
          queryKey: ['adoption-business-kpis'],
        });
      }
    },
    onSuccess(data, variables, context) {
      queryClient.invalidateQueries({
        queryKey: ['adoption-business-kpis'],
        exact: true,
      });
    },
  });
}

export function useAddPerformanceDefectsKPI() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => addPerformanceDefectsKpi(data),
    onSettled: async (data, error) => {
      if (error) console.log(error);
      else {
        //
      }
    },
    onSuccess(data, variables, context) {
      queryClient.invalidateQueries({
        queryKey: ['performance-defect-kpis'],
        exact: true,
      });
    },
  });
}

export function useEditPerformanceDefectsKPI() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => {
      const id: any = data?.id;
      delete data.id;
      return editPerformanceDefectsKpi(id, data?.body);
    },
    onSettled: async (data, error) => {
      if (error) console.log(error);
      else {
        await queryClient.invalidateQueries({
          queryKey: ['performance-defect-kpis'],
        });
      }
    },
    onSuccess(data, variables, context) {
      queryClient.invalidateQueries({
        queryKey: ['adoption-business-kpis'],
        exact: true,
      });
    },
  });
}