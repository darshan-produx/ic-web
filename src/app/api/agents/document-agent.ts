import { apiRequest } from '../../../common/api-request';
import {
  RequestAccessFolderPayload,
  UpdateDocumentAgentStagingDetails,
  UpdateDocumentIngestionPayload,
} from './agent-types';


export const checkAccessToFolder = (
  activation_id: string,
  payload: RequestAccessFolderPayload
) => {
  return apiRequest({
    url: `/api/app-service/v1/documents-agent/${activation_id}/check-folder-access`,
    method: 'POST',
    data: payload,
    timeout: 120000, // 120 seconds (2 minutes)

  });
};

export const analyzeFolder = (
  activation_id: string,
  payload: RequestAccessFolderPayload
) => {
  return apiRequest({
    url: `/api/app-service/v1/documents-agent/${activation_id}/analyze-folder`,
    method: 'POST',
    data: payload,
  });
};

export const getDocumentAgentStagingDetails = (
  agent_staging_id: string | null
) => {
  if (!agent_staging_id) return;
  return apiRequest({
    url: `/api/app-service/v1/documents-agent/${agent_staging_id}/get-staging-details`,
    method: 'GET',
  });
};

export const updateDocumentAgentStagingDetails = (
  agent_staging_id: string,
  payload: UpdateDocumentAgentStagingDetails
) => {
  return apiRequest({
    url: `/api/app-service/v1/documents-agent/${agent_staging_id}/update-staging-details`,
    method: 'PATCH',
    data: payload,
  });
};

export const createIngestFoldersFromAgentStaging = (
  agent_staging_id: string,
  activation_id: string
) => {
  return apiRequest({
    url: `/api/app-service/v1/documents-agent/${activation_id}/ingest-folders/${agent_staging_id}`,
    method: 'POST',
  });
};

export const getDocumentIngestion = (activation_id: string) => {
  return apiRequest({
    url: `/api/app-service/v1/documents-agent/${activation_id}/get-ingest`,
    method: 'GET',
  });
};

export const getDocumentIngestionQna = (activation_id: string) => {
  return apiRequest({
    url: `/api/app-service/v1/documents-agent/${activation_id}/get-qna`,
    method: 'GET',
  });
};

export const updateDocumentIngestion = (
  doc_ingest_id: string,
  payload: UpdateDocumentIngestionPayload
) => {
  return apiRequest({
    url: `/api/app-service/v1/documents-agent/${doc_ingest_id}/update-document-ingest`,
    method: 'PATCH',
    data: payload,
  });
};

export const updateDocumentIngestionPrevStatus = (
  doc_ingest_id: string,
  payload: UpdateDocumentIngestionPayload
) => {
  return apiRequest({
    url: `/api/app-service/v1/documents-agent/${doc_ingest_id}/update-document-ingest-prev-status`,
    method: 'PATCH',
    data: payload,
  });
};