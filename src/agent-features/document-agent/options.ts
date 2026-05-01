// /constants/options.ts
import { FolderType } from '../../app/api/agents/agent-types';

// 1. Define the Labels in one place
const LABELS = {
  KNOWLEDGE: 'Knowledge',
  CUSTOMER: 'Customer',
} as const;

// 2. Helper to generate options using FolderType enum
const createOption = (key: keyof typeof LABELS, folderType: FolderType) => ({
  value: folderType,
  label: LABELS[key],
});

// 3. Export the specific lists - only knowledge and customer
export const folderTypeOptions = [
  createOption('KNOWLEDGE', FolderType.KNOWLEDGE),
  createOption('CUSTOMER', FolderType.CUSTOMER),
];

export const rootFolderTypeOptions = [
  createOption('KNOWLEDGE', FolderType.KNOWLEDGE),
  createOption('CUSTOMER', FolderType.CUSTOMER),
];

export const fileTypeOptions = [
  createOption('KNOWLEDGE', FolderType.KNOWLEDGE),
  createOption('CUSTOMER', FolderType.CUSTOMER),
];
