export enum ActivationStatus {
  ACTIVATING = 'activating',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}


// src/lib/agent-types.ts
export enum AgentType {
  DOCUMENT = 'document',
  NEWS = 'news',
  EMAIL = 'email',
  SERVICE_TICKET = 'service_ticket',
}


// <--------------------------------document agent---------------------------------------->//

export enum FolderType {
  KNOWLEDGE = 'knowledge',
  CUSTOMER = 'customer',
  NO_SELECTION = 'no_selection',
}

export enum DocIngestionStatus {
  ACTIVE = 'active',
  DISCONNECTED = 'disconnected',
  DELETED = 'deleted',
  UPDATING = 'updating',
}

export enum DriveType {
  GOOGLE = 'google',
  ONEDRIVE = 'onedrive',
}

export interface RequestAccessFolderPayload {
  drive_type: DriveType;
  folder_loc: string;
}

export interface UpdateDocumentAgentStagingDetails {
  folder_type: FolderType;
  customer_id?: number;
  subfolder_id?: string;
}
export interface UpdateDocumentIngestionPayload {
  status?: DocIngestionStatus;
}


export enum DiscoveryStatus {
  PENDING = 'pending',
  PROCESSED = 'processed',
  REVIEWED = 'reviewed',
}