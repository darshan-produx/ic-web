import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  RequestAccessFolderPayload,
  UpdateDocumentAgentStagingDetails,
  UpdateDocumentIngestionPayload,
} from '../../app/api/agents/agent-types';
import {
  activateAgent,
  updateActivationMetadata,
  updateActivationStep,
} from '../../app/api/agents/agents';
import {
  analyzeFolder,
  checkAccessToFolder,
  createIngestFoldersFromAgentStaging,
  updateDocumentAgentStagingDetails,
  updateDocumentIngestion,
  updateDocumentIngestionPrevStatus,
} from '../../app/api/agents/document-agent';
import {
  regenerateUsecaseWithoutContext,
  regenerateUsecaseWithContext,
  updateUsecase,
  createUseCaseConfigAndInsightUseCaseMapFromAgentStaging,
} from '../../app/api/agents/usecase-agent';
import {
  addProspectiveDomainStakeholders,
  updateProspectiveDomainStakeholders,
} from '../../app/api/agents/email-agent';

// <--------------------------------agent activation---------------------------------------->//

export function useUpdateActivationStepMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      activation_id: string;
      action: string;
      target_step?: string;
    }) => {
      const { activation_id, ...body } = payload;

      if (!activation_id) throw new Error('activation_id is required');

      const response = await updateActivationStep(activation_id, body);
      return response?.data ?? response;
    },

    onSuccess: (data: any, variables: any) => {
      const activation_id = variables.activation_id;
      qc.invalidateQueries({ queryKey: ['activations', activation_id] });
    },

    onError: (err: Error) => {
      console.error('Failed to update activation step:', err.message);
    },
  });
}

export function useUpdateActivationMetadataMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      activation_id: string;
      metadata: Record<string, any>;
    }) => {
      const { activation_id, ...body } = payload;

      if (!activation_id) throw new Error('activation_id is required');

      const response = await updateActivationMetadata(activation_id, body);
      return response?.data ?? response;
    },

    // onSuccess: () => {
    //   qc.invalidateQueries({ queryKey: ['agents'] });
    //   qc.invalidateQueries({ queryKey: ['agent-instances'] });
    // },

    onError: (err: Error) => {
      console.error('Failed to update activation metadata:', err.message);
    },
  });
}

export function useActivateAgentMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (agentType: string) => {
      if (!agentType) throw new Error('agentType is required');

      const response = await activateAgent(agentType);
      return response?.data ?? response;
    },

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['agent-master'] });
    },

    onError: (err: Error) => {
      console.error('Failed to update activation metadata:', err.message);
    },
  });
}

// <--------------------------------document agent---------------------------------------->//

export function useCheckAccessMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      activation_id: string;
      requestAccessFolderPayload: RequestAccessFolderPayload;
    }) => {
      const { activation_id, ...body } = payload;

      if (!activation_id) throw new Error('activation_id is required');

      const response = await checkAccessToFolder(
        activation_id,
        body?.requestAccessFolderPayload
      );
      return response?.data ?? response;
    },

    onError: (err: Error) => {
      console.error('Failed to submit folder:', err.message);
    },
  });
}

export function useAnalyzeFolderMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      activation_id: string;
      requestAccessFolderPayload: RequestAccessFolderPayload;
    }) => {
      const { activation_id, ...body } = payload;

      if (!activation_id) throw new Error('activation_id is required');

      const response = await analyzeFolder(
        activation_id,
        body?.requestAccessFolderPayload
      );
      return response?.data ?? response;
    },
    onSuccess: (data: any, variables: any) => {
      const activation_id = variables?.activation_id;
      qc.invalidateQueries({ queryKey: ['activations', activation_id] });
    },

    onError: (err: Error) => {
      console.error('Failed to submit folder:', err.message);
    },
  });
}

export function useUpdateDocumentAgentStagingDetailsMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      agent_staging_id: string;
      updateDocumentAgentStagingDetailsPayload: UpdateDocumentAgentStagingDetails;
    }) => {
      const { agent_staging_id, ...body } = payload;

      if (!agent_staging_id) throw new Error('agent_staging_id is required');

      const response = await updateDocumentAgentStagingDetails(
        agent_staging_id,
        body?.updateDocumentAgentStagingDetailsPayload
      );
      return response?.data ?? response;
    },
    onSuccess: (data: any, variables: any) => {
      const agent_staging_id = variables?.agent_staging_id;
      qc.invalidateQueries({
        queryKey: ['document-agent-staging-details', agent_staging_id],
      });
    },

    onError: (err: Error) => {
      console.error('Failed to submit folder:', err.message);
    },
  });
}

export function useCreateIngestFoldersFromAgentStagingMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      agent_staging_id: string;
      activation_id: string;
    }) => {
      const { agent_staging_id, activation_id } = payload;
      if (!agent_staging_id) throw new Error('agent_staging_id is required');
      if (!activation_id) throw new Error('activation_id is required');
      const response = await createIngestFoldersFromAgentStaging(
        agent_staging_id,
        activation_id
      );
      return response?.data ?? response;
    },
    onSuccess: (data: any, variables: any) => {
      const agent_staging_id = variables?.agent_staging_id;
      const activation_id = variables?.activation_id;
      qc.invalidateQueries({
        queryKey: ['activations', activation_id],
      });
      qc.invalidateQueries({
        queryKey: ['get-document-ingestion-details', activation_id],
      });
    },

    onError: (err: Error) => {
      console.error('Failed to submit folder:', err.message);
    },
  });
}

export function useUpdateDocumentIngestionMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      doc_ingestion_id: string;
      activation_id: string;
      updateDocumentIngestionPayload: UpdateDocumentIngestionPayload;
    }) => {
      const { doc_ingestion_id, activation_id, ...body } = payload;
      if (!doc_ingestion_id) throw new Error('doc_ingestion_id is required');
      if (!activation_id) throw new Error('activation_id is required');
      const response = await updateDocumentIngestion(
        doc_ingestion_id,
        body?.updateDocumentIngestionPayload
      );
      return response?.data ?? response;
    },
    onSuccess: (data: any, variables: any) => {
      const agent_staging_id = variables?.agent_staging_id;
      const activation_id = variables?.activation_id;
      qc.invalidateQueries({
        queryKey: ['get-document-ingestion-details', activation_id],
      });
    },

    onError: (err: Error) => {
      console.error('Failed to submit folder:', err.message);
    },
  });
}

export function useUpdateDocumentIngestionPrevStatusMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      doc_ingestion_id: string;
      activation_id: string;
      updateDocumentIngestionPayload: UpdateDocumentIngestionPayload;
    }) => {
      const { doc_ingestion_id, activation_id, ...body } = payload;
      if (!doc_ingestion_id) throw new Error('doc_ingestion_id is required');
      if (!activation_id) throw new Error('activation_id is required');
      const response = await updateDocumentIngestionPrevStatus(
        doc_ingestion_id,
        body?.updateDocumentIngestionPayload
      );
      return response?.data ?? response;
    },
    onSuccess: (data: any, variables: any) => {
      const agent_staging_id = variables?.agent_staging_id;
      const activation_id = variables?.activation_id;
      qc.invalidateQueries({
        queryKey: ['get-document-ingestion-details', activation_id],
      });
    },

    onError: (err: Error) => {
      console.error('Failed to submit folder:', err.message);
    },
  });
}

// <-----------------------------usecase agent------------------------------------------->//

export function useRegenerateUsecaseWithoutContextMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { activation_id: string }) => {
      if (Object.keys(payload).length === 0)
        throw new Error('payload is required');
      if (!payload?.activation_id) throw new Error('activation_id is required');
      const response = await regenerateUsecaseWithoutContext(
        payload?.activation_id
      );
      return response;
    },

    onSuccess: (data: any, variables: any) => {
      const activation_id = variables?.activation_id;
      qc.invalidateQueries({
        queryKey: ['get-all-usecase-suggestions', activation_id],
      });
    },

    onError: (err: Error) => {
      console.error('Failed to regenerate usecase:', err.message);
    },
  });
}

export function useRegenerateUsecaseWithContextMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { activation_id: string; context: string }) => {
      if (Object.keys(payload).length === 0)
        throw new Error('payload is required');
      const { activation_id, ...body } = payload;
      if (!activation_id) throw new Error('activation_id is required');
      const response = await regenerateUsecaseWithContext(activation_id, body);
      return response;
    },

    onSuccess: (data: any, variables: any) => {
      const activation_id = variables?.activation_id;
      qc.invalidateQueries({
        queryKey: ['get-all-usecase-suggestions', activation_id],
      });
    },

    onError: (err: Error) => {
      console.error('Failed to regenerate specific usecase:', err.message);
    },
  });
}

export function useUpdateUsecaseMutation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      activation_id: string;
      agent_staging_id: string;
      [key: string]: any;
    }) => {
      if (!payload) throw new Error('payload is required');

      const { activation_id, agent_staging_id, ...body } = payload;

      if (!activation_id) throw new Error('activation_id is required');
      if (!agent_staging_id) throw new Error('agent_staging_id is required');
      const response = await updateUsecase(
        activation_id,
        agent_staging_id,
        body
      );
      return response;
    },

    onSuccess: (data: any, variables: any) => {
      const activation_id = variables?.activation_id;
      qc.invalidateQueries({
        queryKey: ['get-all-usecase-suggestions', activation_id],
      });
    },

    onError: (err: Error) => {
      console.error('Failed to update usecase:', err.message);
    },
  });
}

export function useCreateUseCaseConfigAndInsightUseCaseMapFromAgentStagingMutation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      activation_id: string;
      agent_staging_id: string;
      [key: string]: any;
    }) => {
      if (!payload) throw new Error('payload is required');

      const { activation_id, agent_staging_id } = payload;

      if (!activation_id) throw new Error('activation_id is required');
      if (!agent_staging_id) throw new Error('agent_staging_id is required');
      const response =
        await createUseCaseConfigAndInsightUseCaseMapFromAgentStaging(
          activation_id,
          agent_staging_id
        );
      return response;
    },

    onSuccess: (data: any, variables: any) => {
      const activation_id = variables?.activation_id;
      qc.invalidateQueries({
        queryKey: ['get-all-usecase-suggestions', activation_id],
      });
    },

    onError: (err: Error) => {
      console.error('Failed to update usecase:', err.message);
    },
  });
}




// <-----------------------------email agent------------------------------------------->//

export function useUpdateProspectiveDomainStakeholders() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      discovery_customer_id?: string;
      activation_id: string;
      status?: string;
      primary_domain?: string;
      customer_id: number;
      customer_name?: string;
      prospective_domains?: string[];
      prospective_stakeholders?: { name: string; email: string }[];
    }) => {
      const { customer_id, activation_id, ...body } = payload;

      if (!customer_id) throw new Error('customer_id is required');
      if (!activation_id) throw new Error('activation_id is required');

      const response = await updateProspectiveDomainStakeholders(
        activation_id,
        customer_id,
        body
      );
      return response?.data ?? response;
    },

    onSuccess: (data: any, variables: any) => {
      const activation_id = variables.activation_id;
      qc.invalidateQueries({
        queryKey: [
          'email-agent-get-all-customer-prospective-domain-stakeholders',
          activation_id,
        ],
      });
    },

    onError: (err: Error) => {
      console.error(
        'Failed to update prospective domain stakeholders:',
        err.message
      );
    },
  });
}

export function useAddProspectiveDomainStakeholders() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (activation_id: string) => {
      if (!activation_id) throw new Error('activation_id is required');
      const response = await addProspectiveDomainStakeholders(activation_id);
      return response?.data ?? response;
    },

    onSuccess: (data: any, variables: any) => {
      const activation_id = variables.activation_id;
      qc.invalidateQueries({
        queryKey: ['activations', activation_id],
      });
    },

    onError: (err: Error) => {
      console.error(
        'Failed to add prospective domain stakeholders:',
        err.message
      );
    },
  });
}