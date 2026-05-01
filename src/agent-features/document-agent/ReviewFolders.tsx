'use client';
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ProgressDots } from '../components/ProgressDots';
import { ActionButtons } from '../components/ActionButtons';
import { OnboardingLayoutApp } from '../components/OnboardingLayoutApp';
import { FolderType } from '../../app/api/agents/agent-types';
import { getAllCustomersDocumentsAgentFlow } from '../../app/api/customers/customers';
import { useQuery } from '@tanstack/react-query';
import FolderRow from './FolderRow';
import { useUpdateDocumentAgentStagingDetailsMutation } from '../../services/mutations/agents';
import ConfirmationModal from '../../common/components/Modal/confirmationModal';

export interface SubFolder {
  id: string;
  folder_name: string;
  folder_type: FolderType;
  folder_loc: string;
  customer_id?: number;
  sub_folders: SubFolder[];
}

export interface FolderDataResponse {
  _id: string;
  org_id: string;
  activation_id: string;
  agent_type: string;
  created_by: string;
  created_at: string;
  customer_id?: number;
  // status: string;
  is_mapped: boolean;
  drive_type: string;
  folder_name: string;
  folder_loc: string;
  folder_type: FolderType;
  sub_folders: SubFolder[];
  updated_at: { $date: string };
  [key: string]: any;
}

export interface FolderNode {
  id: string;
  name: string;
  path: string;
  type?: FolderType;
  customerId?: number;
  children?: FolderNode[];
  isFolder: boolean;
  isExpanded: boolean;
  isRoot: boolean;
  indent: number;
}

export interface ReviewFoldersProps {
  activation_id: string;
  agentStagingId: string | null;
  onBack?: () => void;
  onActivate?: () => void;
  folderData?: FolderDataResponse;
}

const ReviewFolders: React.FC<ReviewFoldersProps> = ({
  activation_id,
  agentStagingId,
  onBack = () => console.log('Back clicked'),
  onActivate = () => console.log('Activate clicked'),
  folderData,
}) => {
  const [folderTree, setFolderTree] = useState<FolderNode | null>(null);
  const [customerOptions, setCustomerOptions] = useState<
    { label: string; value: number }[]
  >([]);
  const [isActivating, setIsActivating] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingTypeChange, setPendingTypeChange] = useState<{
    nodeId: string;
    newType: FolderType;
    isRootFolder: boolean;
    node: FolderNode | null;
  } | null>(null);
  const [showCustomerConfirmModal, setShowCustomerConfirmModal] = useState(false);
  const [pendingCustomerChange, setPendingCustomerChange] = useState<{
    nodeId: string;
    customerId: number;
    isRootFolder: boolean;
    node: FolderNode | null;
  } | null>(null);
  const [showExpandConfirmModal, setShowExpandConfirmModal] = useState(false);
  const [pendingExpandAction, setPendingExpandAction] = useState<{
    nodeId: string;
    node: FolderNode | null;
  } | null>(null);

  // Ref to store expanded states - persists across re-renders without causing them
  const expandedStatesRef = useRef<Record<string, boolean>>({});

  const { data: getAllCustomersDocumentsAgentFlowData } = useQuery({
    queryKey: ['get-all-customers-documents-agent-flow'],
    queryFn: getAllCustomersDocumentsAgentFlow,
    refetchOnWindowFocus: false,
  });
  const { mutate: updateStagingDetails } =
    useUpdateDocumentAgentStagingDetailsMutation();
  useEffect(() => {
    if (getAllCustomersDocumentsAgentFlowData) {
      setCustomerOptions(getAllCustomersDocumentsAgentFlowData?.data);
    }
  }, [getAllCustomersDocumentsAgentFlowData]);

  useEffect(() => {
    // Helper to check if node or any descendant is mapped (knowledge or customer)
    const hasAnyMappedDescendant = (subFolder: SubFolder): boolean => {
      if (
        subFolder.folder_type === FolderType.KNOWLEDGE ||
        subFolder.folder_type === FolderType.CUSTOMER
      ) {
        return true;
      }
      if (subFolder.sub_folders && subFolder.sub_folders.length > 0) {
        return subFolder.sub_folders.some(hasAnyMappedDescendant);
      }
      return false;
    };

    const convertSubFolderToNode = (
      subFolder: SubFolder,
      indent: number,
      parentPath: string,
      parentType?: FolderType,
      parentCustomerId?: number
    ): FolderNode => {
      const currentPath = `${parentPath}/${subFolder.folder_name}`;
      const hasSubFolders =
        subFolder.sub_folders && subFolder.sub_folders.length > 0;

      // If parent has knowledge/customer type, children inherit it
      const effectiveType =
        parentType === FolderType.KNOWLEDGE ||
        parentType === FolderType.CUSTOMER
          ? parentType
          : subFolder.folder_type;
      const effectiveCustomerId =
        parentType === FolderType.CUSTOMER
          ? parentCustomerId || subFolder.customer_id
          : subFolder.customer_id;

      // Auto-expand logic:
      // - If this folder itself is mapped (knowledge/customer), keep it COLLAPSED (don't show subfolders)
      // - Otherwise, auto-expand if any descendants are mapped
      const isThisFolderMapped =
        subFolder.folder_type === FolderType.KNOWLEDGE ||
        subFolder.folder_type === FolderType.CUSTOMER;
      const hasChildrenMapped =
        hasSubFolders && subFolder.sub_folders.some(hasAnyMappedDescendant);
      
      // Only auto-expand if children are mapped AND this folder itself is NOT mapped
      const shouldAutoExpand = hasSubFolders && hasChildrenMapped && !isThisFolderMapped;

      // Preserve existing expanded state if available, otherwise use auto-expand logic
      const wasExpanded = expandedStatesRef.current[subFolder.id];
      const newExpandedState =
        wasExpanded !== undefined ? wasExpanded : shouldAutoExpand;

      // Update the ref with this node's expanded state
      expandedStatesRef.current[subFolder.id] = newExpandedState;

      return {
        id: subFolder.id,
        name: subFolder.folder_name,
        path: currentPath,
        type: effectiveType,
        customerId: effectiveCustomerId,
        isFolder: hasSubFolders,
        isExpanded: newExpandedState,
        indent: indent,
        isRoot: false,
        children: hasSubFolders
          ? subFolder.sub_folders.map((child) =>
              convertSubFolderToNode(
                child,
                indent + 1,
                currentPath,
                effectiveType,
                effectiveCustomerId
              )
            )
          : undefined,
      };
    };

    if (!folderData) {
      setFolderTree({
        id: '',
        name: '',
        path: '',
        type: undefined,
        customerId: 0,
        isFolder: false,
        isExpanded: false,
        indent: 0,
        isRoot: true,
        children: [],
      });
      return;
    }

    const hasSubFolders =
      folderData.sub_folders && folderData.sub_folders.length > 0;

    // Check if root or any descendants are mapped
    const isRootMapped =
      folderData.folder_type === FolderType.KNOWLEDGE ||
      folderData.folder_type === FolderType.CUSTOMER;
    const hasChildrenWithMappedDescendants =
      hasSubFolders &&
      folderData.sub_folders.some((subFolder) => {
        if (hasAnyMappedDescendant(subFolder)) return true;
        if (subFolder.sub_folders && subFolder.sub_folders.length > 0) {
          return subFolder.sub_folders.some(hasAnyMappedDescendant);
        }
        return false;
      });

    // Preserve existing expanded state for root if available
    // Default to true if root has subfolders and (root is mapped OR children have mapped descendants)
    const rootWasExpanded = expandedStatesRef.current[folderData.activation_id];
    const rootExpandedState =
      rootWasExpanded !== undefined
        ? rootWasExpanded
        : hasSubFolders && (isRootMapped || hasChildrenWithMappedDescendants);

    // Update the ref with root's expanded state
    expandedStatesRef.current[folderData.activation_id] = rootExpandedState;

    const root: FolderNode = {
      id: folderData._id,
      name: folderData.folder_name,
      path: folderData.folder_name,
      type: folderData.folder_type,
      customerId: folderData.customer_id,
      children: hasSubFolders
        ? folderData.sub_folders.map((subFolder) =>
            convertSubFolderToNode(
              subFolder,
              1,
              folderData.folder_name,
              folderData.folder_type,
              folderData.customer_id
            )
          )
        : undefined,
      isFolder: hasSubFolders,
      isRoot: true,
      isExpanded: rootExpandedState,
      indent: 0,
    };

    setFolderTree(root);
  }, [folderData]); // Only rebuild tree when folder ID changes (initial load), not on every data update

  // --- Handlers ---

  // Helper function to count all subfolders recursively
  const countSubfolders = (node: FolderNode): number => {
    if (!node.children || node.children.length === 0) return 0;
    let count = node.children.length;
    node.children.forEach((child) => {
      count += countSubfolders(child);
    });
    return count;
  };

  // Helper function to find a node by ID
  const findNodeById = (
    tree: FolderNode,
    targetId: string
  ): FolderNode | null => {
    if (tree.id === targetId) return tree;
    if (tree.children) {
      for (const child of tree.children) {
        const found = findNodeById(child, targetId);
        if (found) return found;
      }
    }
    return null;
  };

  // Helper function to find parent of a node
  const findParentById = (
    tree: FolderNode,
    targetId: string,
    parent: FolderNode | null = null
  ): FolderNode | null => {
    if (tree.id === targetId) return parent;
    if (tree.children) {
      for (const child of tree.children) {
        const found = findParentById(child, targetId, tree);
        if (found !== null) return found;
      }
    }
    return null;
  };

  const handleUpdateType = (
    nodeId: string,
    newType: FolderType | undefined,
    isRootFolder: boolean
  ) => {
    if (!folderTree) return;

    // If clearing type (undefined), just do it without confirmation
    if (!newType) {
      performTypeUpdate(nodeId, newType, isRootFolder);
      return;
    }

    // Find the node being updated
    const nodeToCheck = findNodeById(folderTree, nodeId);

    // Check if this folder has subfolders and the new type is knowledge or customer
    const hasSubfolders =
      nodeToCheck?.children && nodeToCheck.children.length > 0;
    const isSettingMappedType =
      newType === FolderType.KNOWLEDGE || newType === FolderType.CUSTOMER;

    if (hasSubfolders && isSettingMappedType) {
      // Show confirmation popup
      setPendingTypeChange({
        nodeId,
        newType,
        isRootFolder,
        node: nodeToCheck,
      });
      setShowConfirmModal(true);
      return;
    }

    // If no confirmation needed, proceed with update
    performTypeUpdate(nodeId, newType, isRootFolder);
  };

  const performTypeUpdate = (
    nodeId: string,
    newType: FolderType | undefined,
    isRootFolder: boolean
  ) => {
    if (!folderTree) return;
    let nodeToUpdate: FolderNode | undefined;
    let oldNodeType: FolderType | undefined = undefined;

    // Helper to recursively update node and all its children
    const updateNodeAndChildren = (
      node: FolderNode,
      type: FolderType | undefined,
      parentCustomerId?: number,
      shouldClearChildren: boolean = false
    ): FolderNode => {
      const updatedNode = {
        ...node,
        type: type,
        customerId:
          type === FolderType.CUSTOMER
            ? parentCustomerId || node.customerId
            : undefined,
      };

      // Recursively update children if:
      // 1. We're SETTING a type (not clearing it) - cascade the type down
      // 2. OR we're clearing the root folder type - also clear all children
      if (updatedNode.children && updatedNode.children.length > 0) {
        if (type !== undefined) {
          // Setting a type - cascade to children
          // When setting customer type, clear customerId for all children (reset to Select)
          updatedNode.children = updatedNode.children.map((child) =>
            updateNodeAndChildren(
              child,
              type,
              type === FolderType.CUSTOMER
                ? undefined  // Clear customerId for children
                : undefined,
              false
            )
          );
        } else if (shouldClearChildren) {
          // Clearing type on root - also clear all children
          updatedNode.children = updatedNode.children.map((child) =>
            updateNodeAndChildren(child, undefined, undefined, true)
          );
          // Update backend for children
          const clearChildrenInBackend = (child: FolderNode) => {
            if (agentStagingId) {
              updateStagingDetails({
                agent_staging_id: agentStagingId,
                updateDocumentAgentStagingDetailsPayload: {
                  subfolder_id: child.id,
                  folder_type: FolderType.NO_SELECTION,
                },
              });
            }
            if (child.children) {
              child.children.forEach(clearChildrenInBackend);
            }
          };
          updatedNode.children.forEach(clearChildrenInBackend);
        }
      }

      return updatedNode;
    };

    // Helper to find all ancestor IDs of a node
    const findAllAncestors = (
      tree: FolderNode,
      targetId: string,
      ancestors: string[] = []
    ): string[] => {
      if (tree.id === targetId) {
        return ancestors;
      }
      if (tree.children) {
        for (const child of tree.children) {
          const result = findAllAncestors(child, targetId, [
            ...ancestors,
            tree.id,
          ]);
          if (result.length > 0 || child.id === targetId) {
            return result.length > 0 ? result : [...ancestors, tree.id];
          }
        }
      }
      return [];
    };

    // Get all ancestor IDs
    const ancestorIds = findAllAncestors(folderTree, nodeId);

    // Helper to clear all ancestor types
    const clearAncestorTypes = (tree: FolderNode): FolderNode => {
      const shouldClear = ancestorIds.includes(tree.id) && tree.type;

      if (shouldClear) {
        // Clear type in backend
        if (agentStagingId) {
          updateStagingDetails({
            agent_staging_id: agentStagingId,
            updateDocumentAgentStagingDetailsPayload: tree.isRoot
              ? { folder_type: FolderType.NO_SELECTION }
              : {
                  subfolder_id: tree.id,
                  folder_type: FolderType.NO_SELECTION,
                },
          });
        }

        return {
          ...tree,
          type: undefined,
          customerId: undefined,
          children: tree.children
            ? tree.children.map(clearAncestorTypes)
            : undefined,
        };
      }

      if (tree.children) {
        return {
          ...tree,
          children: tree.children.map(clearAncestorTypes),
        };
      }

      return tree;
    };

    // 1. Update UI State
    const updateNode = (node: FolderNode): FolderNode => {
      if (node.id === nodeId) {
        oldNodeType = node.type; // Store old type
        nodeToUpdate = node;
        
        // Check if we're clearing the type on a root folder
        const isClearingRootType = isRootFolder && newType === undefined && oldNodeType !== undefined;
        
        // Update this node and cascade to all children
        const updatedNode = updateNodeAndChildren(
          node, 
          newType, 
          node.customerId,
          isClearingRootType // Pass true to also clear children when clearing root
        );
        
        // If setting a mapped type (knowledge/customer) on any folder with subfolders, collapse it
        const isSettingMappedType = 
          newType === FolderType.KNOWLEDGE || newType === FolderType.CUSTOMER;
        if (isSettingMappedType && node.children && node.children.length > 0) {
          expandedStatesRef.current[nodeId] = false;
          return { ...updatedNode, isExpanded: false };
        }
        
        return updatedNode;
      }
      if (node.children) {
        return {
          ...node,
          children: node.children.map(updateNode),
        };
      }
      return node;
    };

    // First update the node
    let newTree = updateNode(folderTree);

    // Helper to check if all children have the same type (knowledge or customer)
    const allChildrenHaveSameType = (
      node: FolderNode
    ): { same: boolean; type?: FolderType; customerId?: number } => {
      if (!node.children || node.children.length === 0) {
        return { same: false };
      }

      // Check if ANY child has no type set (Select)
      const hasUntypedChild = node.children.some(
        (child) => !child.type || child.type === undefined
      );
      if (hasUntypedChild) {
        return { same: false };
      }

      const typedChildren = node.children.filter(
        (child) =>
          child.type === FolderType.KNOWLEDGE ||
          child.type === FolderType.CUSTOMER
      );
      if (
        typedChildren.length === 0 ||
        typedChildren.length !== node.children.length
      ) {
        return { same: false };
      }

      const firstType = typedChildren[0].type;
      const firstCustomerId = typedChildren[0].customerId;

      // All children must have same type
      const allSameType = typedChildren.every(
        (child) => child.type === firstType
      );

      if (!allSameType) {
        return { same: false };
      }

      // If type is customer, all must have same customerId
      if (firstType === FolderType.CUSTOMER) {
        const allSameCustomer = typedChildren.every(
          (child) => child.customerId === firstCustomerId
        );
        return {
          same: allSameCustomer && firstCustomerId !== undefined,
          type: firstType,
          customerId: firstCustomerId,
        };
      }

      // If type is knowledge, just need same type
      return { same: true, type: firstType };
    };

    // Helper to propagate type setting upward to ancestors
    const propagateTypeUpward = (tree: FolderNode): FolderNode => {
      // First, recursively process children
      let updatedNode = tree;
      if (tree.children) {
        updatedNode = {
          ...tree,
          children: tree.children.map(propagateTypeUpward),
        };
      }

      // Then check if this node should inherit from its children
      const {
        same,
        type: childType,
        customerId: childCustomerId,
      } = allChildrenHaveSameType(updatedNode);

      if (same && childType) {
        // Update this node to match its children
        const needsUpdate =
          updatedNode.type !== childType ||
          (childType === FolderType.CUSTOMER &&
            updatedNode.customerId !== childCustomerId);

        if (agentStagingId && needsUpdate) {
          updateStagingDetails({
            agent_staging_id: agentStagingId,
            updateDocumentAgentStagingDetailsPayload: updatedNode.isRoot
              ? {
                  folder_type: childType,
                  ...(childType === FolderType.CUSTOMER && {
                    customer_id: childCustomerId,
                  }),
                }
              : {
                  subfolder_id: updatedNode.id,
                  folder_type: childType,
                  ...(childType === FolderType.CUSTOMER && {
                    customer_id: childCustomerId,
                  }),
                },
          });
        }

        return {
          ...updatedNode,
          type: childType,
          customerId:
            childType === FolderType.CUSTOMER ? childCustomerId : undefined,
        };
      }

      return updatedNode;
    };

    // Clear all ancestor types if:
    // 1. This is a child node (not root)
    // 2. The type is actually changing (whether setting OR clearing)
    const isTypeActuallyChanging = oldNodeType !== newType;
    if (!isRootFolder && isTypeActuallyChanging) {
      newTree = clearAncestorTypes(newTree);
    }

    // DO NOT propagate type settings upward automatically
    // Parents should only get a type when:
    // 1. User explicitly sets it on the parent
    // 2. User sets a type on a parent folder (which cascades down)
    // A child having a type should NOT auto-set the parent's type

    setFolderTree(newTree);

    // Call API directly without triggering query invalidation
    if (agentStagingId) {
      if (newType === FolderType.CUSTOMER) {
        if (nodeToUpdate?.customerId) {
          updateStagingDetails({
            agent_staging_id: agentStagingId,
            updateDocumentAgentStagingDetailsPayload: isRootFolder
              ? {
                  folder_type: newType,
                  customer_id: nodeToUpdate.customerId,
                }
              : {
                  subfolder_id: nodeId,
                  folder_type: newType,
                  customer_id: nodeToUpdate.customerId,
                },
          });
        }
      } else {
        updateStagingDetails({
          agent_staging_id: agentStagingId,
          updateDocumentAgentStagingDetailsPayload: isRootFolder
            ? { folder_type: newType ?? FolderType.NO_SELECTION }
            : {
                subfolder_id: nodeId,
                folder_type: newType ?? FolderType.NO_SELECTION,
              },
        });
      }
    }
  };

  const handleConfirmTypeChange = () => {
    if (pendingTypeChange) {
      performTypeUpdate(
        pendingTypeChange.nodeId,
        pendingTypeChange.newType,
        pendingTypeChange.isRootFolder
      );
    }
    setShowConfirmModal(false);
    setPendingTypeChange(null);
  };

  const handleCancelTypeChange = () => {
    setShowConfirmModal(false);
    setPendingTypeChange(null);
  };

  const handleUpdateCustomer = (
    nodeId: string,
    customerId: number,
    isRootFolder: boolean
  ) => {
    if (!folderTree) return;

    // Find the node being updated
    const nodeToCheck = findNodeById(folderTree, nodeId);
    const hasSubfolders =
      nodeToCheck?.children && nodeToCheck.children.length > 0;

    // Show confirmation for any folder with subfolders
    if (hasSubfolders) {
      setPendingCustomerChange({
        nodeId,
        customerId,
        isRootFolder,
        node: nodeToCheck,
      });
      setShowCustomerConfirmModal(true);
      return;
    }

    // Otherwise proceed with update
    performCustomerUpdate(nodeId, customerId, isRootFolder);
  };

  const performCustomerUpdate = (
    nodeId: string,
    customerId: number,
    isRootFolder: boolean
  ) => {
    if (!folderTree) return;

    let nodeToUpdate: FolderNode | undefined;

    // Helper to recursively update node and all its children with the same customer
    const updateNodeAndChildren = (
      node: FolderNode,
      custId: number
    ): FolderNode => {
      const updatedNode = {
        ...node,
        customerId: custId,
      };

      // Recursively update all children that have type 'customer'
      if (updatedNode.children && updatedNode.children.length > 0) {
        updatedNode.children = updatedNode.children.map((child) => {
          if (child.type === FolderType.CUSTOMER) {
            return updateNodeAndChildren(child, custId);
          }
          return child;
        });
      }

      return updatedNode;
    };

    // Helper to find all ancestor IDs of a node
    const findAllAncestors = (
      tree: FolderNode,
      targetId: string,
      ancestors: string[] = []
    ): string[] => {
      if (tree.id === targetId) {
        return ancestors;
      }
      if (tree.children) {
        for (const child of tree.children) {
          const result = findAllAncestors(child, targetId, [
            ...ancestors,
            tree.id,
          ]);
          if (result.length > 0 || child.id === targetId) {
            return result.length > 0 ? result : [...ancestors, tree.id];
          }
        }
      }
      return [];
    };

    // Get all ancestor IDs
    const ancestorIds = findAllAncestors(folderTree, nodeId);

    // Helper to clear all ancestor customer types
    const clearAncestorCustomers = (tree: FolderNode): FolderNode => {
      const shouldClear =
        ancestorIds.includes(tree.id) && tree.type === FolderType.CUSTOMER;

      if (shouldClear) {
        // Clear customer and type in backend
        if (agentStagingId) {
          updateStagingDetails({
            agent_staging_id: agentStagingId,
            updateDocumentAgentStagingDetailsPayload: tree.isRoot
              ? {
                  folder_type: FolderType.NO_SELECTION,
                }
              : {
                  subfolder_id: tree.id,
                  folder_type: FolderType.NO_SELECTION,
                },
          });
        }

        return {
          ...tree,
          type: undefined,
          customerId: undefined,
          children: tree.children
            ? tree.children.map(clearAncestorCustomers)
            : undefined,
        };
      }

      if (tree.children) {
        return {
          ...tree,
          children: tree.children.map(clearAncestorCustomers),
        };
      }

      return tree;
    };

    // Update the node (and its children if it's a parent folder)
    const updateNode = (node: FolderNode): FolderNode => {
      if (node.id === nodeId) {
        nodeToUpdate = node;
        // Update this node and cascade to all customer-type children
        return updateNodeAndChildren(node, customerId);
      }
      if (node.children) {
        return {
          ...node,
          children: node.children.map(updateNode),
        };
      }
      return node;
    };

    let newTree = updateNode(folderTree);

    // Helper to check if all children have the same customer
    const allChildrenHaveSameCustomer = (
      node: FolderNode
    ): { same: boolean; customerId?: number } => {
      if (!node.children || node.children.length === 0) {
        return { same: false };
      }

      // Check if ANY child has no type set (Select) or is not customer type
      const hasNonCustomerChild = node.children.some(
        (child) => !child.type || child.type !== 'customer'
      );
      if (hasNonCustomerChild) {
        return { same: false };
      }

      const customerChildren = node.children.filter(
        (child) => child.type === FolderType.CUSTOMER
      );
      if (
        customerChildren.length === 0 ||
        customerChildren.length !== node.children.length
      ) {
        return { same: false };
      }

      // Check if all customer-type children have the same customerId
      const firstCustomerId = customerChildren[0].customerId;
      const allSame = customerChildren.every(
        (child) => child.customerId === firstCustomerId
      );

      return {
        same: allSame && firstCustomerId !== undefined,
        customerId: firstCustomerId,
      };
    };

    // Helper to propagate customer setting upward to ancestors
    const propagateCustomerUpward = (tree: FolderNode): FolderNode => {
      // First, recursively process children
      let updatedNode = tree;
      if (tree.children) {
        updatedNode = {
          ...tree,
          children: tree.children.map(propagateCustomerUpward),
        };
      }

      // Then check if this node should inherit from its children
      const { same, customerId: childCustomerId } =
        allChildrenHaveSameCustomer(updatedNode);

      if (same && childCustomerId) {
        // Update this node to match its children
        if (
          agentStagingId &&
          (updatedNode.type !== 'customer' ||
            updatedNode.customerId !== childCustomerId)
        ) {
          updateStagingDetails({
            agent_staging_id: agentStagingId,
            updateDocumentAgentStagingDetailsPayload: updatedNode.isRoot
              ? {
                  folder_type: 'customer' as FolderType,
                  customer_id: childCustomerId,
                }
              : {
                  subfolder_id: updatedNode.id,
                  folder_type: 'customer' as FolderType,
                  customer_id: childCustomerId,
                },
          });
        }

        return {
          ...updatedNode,
          type: 'customer' as FolderType,
          customerId: childCustomerId,
        };
      }

      return updatedNode;
    };

    // If this is a subfolder being changed, reset all ancestor customers first
    if (!isRootFolder) {
      newTree = clearAncestorCustomers(newTree);
    }

    // DO NOT propagate customer settings upward automatically
    // Parents should only get a type when user explicitly sets it
    // A child having a customer should NOT auto-set the parent's type/customer

    setFolderTree(newTree);

    // Call API directly without triggering query invalidation
    if (agentStagingId) {
      updateStagingDetails({
        agent_staging_id: agentStagingId,
        updateDocumentAgentStagingDetailsPayload: isRootFolder
          ? {
              folder_type: 'customer' as FolderType,
              customer_id: customerId,
            }
          : {
              subfolder_id: nodeId,
              folder_type: 'customer' as FolderType,
              customer_id: customerId,
            },
      });
    }
  };

  const handleToggleExpand = (nodeId: string) => {
    if (!folderTree) return;

    const nodeToCheck = findNodeById(folderTree, nodeId);
    if (!nodeToCheck) return;

    // Check if expanding (currently collapsed)
    const isExpanding = !nodeToCheck.isExpanded;
    
    // Check if any children have knowledge/customer type
    const hasChildrenWithMappedType = nodeToCheck.children?.some(
      (child) =>
        child.type === FolderType.KNOWLEDGE ||
        child.type === FolderType.CUSTOMER
    );

    // Only show confirmation if:
    // 1. We're expanding AND
    // 2. Children have mapped types AND
    // 3. The parent itself has a type set (knowledge/customer)
    // This prevents the modal from appearing when just toggling expand/collapse
    // on folders where only children are mapped
    if (isExpanding && hasChildrenWithMappedType && nodeToCheck.type && 
        (nodeToCheck.type === FolderType.KNOWLEDGE || nodeToCheck.type === FolderType.CUSTOMER)) {
      // Show confirmation modal only when parent has a type that would conflict
      setPendingExpandAction({ nodeId, node: nodeToCheck });
      setShowExpandConfirmModal(true);
      return;
    }

    // Otherwise proceed with normal toggle (preserves child selections)
    performToggleExpand(nodeId);
  };

  const performToggleExpand = (nodeId: string) => {
    if (!folderTree) return;

    // Update the ref to track the new expanded state
    const currentState = expandedStatesRef.current[nodeId];
    expandedStatesRef.current[nodeId] =
      currentState === undefined ? false : !currentState;

    const updateNode = (node: FolderNode): FolderNode => {
      if (node.id === nodeId) {
        const newExpanded = !node.isExpanded;
        // Also update the ref here with the actual value
        expandedStatesRef.current[nodeId] = newExpanded;
        return { ...node, isExpanded: newExpanded };
      }
      if (node.children) {
        return {
          ...node,
          children: node.children.map(updateNode),
        };
      }
      return node;
    };
    setFolderTree(updateNode(folderTree));
  };

  const handleConfirmExpand = () => {
    if (!pendingExpandAction || !folderTree || !agentStagingId) return;
    
    // Find the node to clear
    const nodeToClear = findNodeById(folderTree, pendingExpandAction.nodeId);
    if (!nodeToClear) return;
    
    // Helper to recursively clear all types for a node and its children
    const clearAllTypes = (node: FolderNode): FolderNode => {
      // Update backend for this node
      updateStagingDetails({
        agent_staging_id: agentStagingId,
        updateDocumentAgentStagingDetailsPayload: node.isRoot
          ? { folder_type: FolderType.NO_SELECTION }
          : {
              subfolder_id: node.id,
              folder_type: FolderType.NO_SELECTION,
            },
      });
      
      const clearedNode = {
        ...node,
        type: undefined,
        customerId: undefined,
      };
      
      // Recursively clear children
      if (clearedNode.children && clearedNode.children.length > 0) {
        clearedNode.children = clearedNode.children.map(clearAllTypes);
      }
      
      return clearedNode;
    };
    
    // Update tree by recursively clearing types AND expanding the node
    const updateTree = (node: FolderNode): FolderNode => {
      if (node.id === pendingExpandAction.nodeId) {
        const clearedNode = clearAllTypes(node);
        // Also update expanded state
        expandedStatesRef.current[node.id] = true;
        return {
          ...clearedNode,
          isExpanded: true,
        };
      }
      if (node.children) {
        return {
          ...node,
          children: node.children.map(updateTree),
        };
      }
      return node;
    };
    
    setFolderTree(updateTree(folderTree));
    
    setShowExpandConfirmModal(false);
    setPendingExpandAction(null);
  };

  const handleCancelExpand = () => {
    setShowExpandConfirmModal(false);
    setPendingExpandAction(null);
  };

  const handleConfirmCustomerChange = () => {
    if (pendingCustomerChange) {
      performCustomerUpdate(
        pendingCustomerChange.nodeId,
        pendingCustomerChange.customerId,
        pendingCustomerChange.isRootFolder
      );
    }
    setShowCustomerConfirmModal(false);
    setPendingCustomerChange(null);
  };

  const handleCancelCustomerChange = () => {
    setShowCustomerConfirmModal(false);
    setPendingCustomerChange(null);
  };

  // Helper to check if any folder has customer type but no customer assigned
  const hasInvalidCustomerSelection = (node: FolderNode | null): boolean => {
    if (!node) return false;
    
    // Check this node
    if (node.type === FolderType.CUSTOMER && !node.customerId) {
      return true;
    }
    
    // Check children
    if (node.children) {
      return node.children.some(child => hasInvalidCustomerSelection(child));
    }
    
    return false;
  };

  // Helper to check if any folder is mapped (knowledge or customer)
  const hasAnyMappedFolder = (node: FolderNode | null): boolean => {
    if (!node) return false;
    
    // Check this node - ensure type is actually set to a valid mapped type
    if (node.type && (node.type === FolderType.KNOWLEDGE || node.type === FolderType.CUSTOMER)) {
      return true;
    }
    
    // Check children
    if (node.children) {
      return node.children.some(child => hasAnyMappedFolder(child));
    }
    
    return false;
  };

  const isActivateDisabled = isActivating || hasInvalidCustomerSelection(folderTree) || !hasAnyMappedFolder(folderTree);

  return (
    <>
      <OnboardingLayoutApp>
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Review folders that the agent have identified
          </h1>
          <p className="font-inter font-normal text-sm leading-5 text-gray-600 mb-4">
            Folder that have your company reports, internal documents, etc. are marked as 'Knowledge'. Folders with customer or client files are marked as 'Customer' and mapped accordingly. 

          </p>
          <p className="font-inter font-medium text-sm leading-5 text-gray-600 mb-4">
          Please review the mapping and make changes as per your requirement.

          </p>
          <ProgressDots totalSteps={3} currentStep={2} />
        </div>

        {/* Folders Section - Outer container with border */}
        <div className="mb-8 rounded-2xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">
            Folders identified
          </h3>

          {/* Inner container for table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr>
                  <th
                    className="text-left text-[14px] font-medium text-gray-500 border-b border-r border-gray-200 w-[200px]"
                    style={{ height: '36px', padding: '8px 12px' }}
                  >
                    Folder name
                  </th>
                  <th
                    className="text-left text-[14px] font-medium text-gray-500 border-b border-r border-gray-200 w-[150px]"
                    style={{ height: '36px', padding: '8px 12px' }}
                  >
                    Type
                  </th>
                  <th
                    className="text-left text-[14px] font-medium text-gray-500 border-b border-gray-200"
                    style={{ height: '36px', padding: '8px 12px' }}
                  >
                    Customer
                  </th>
                </tr>
              </thead>
              <tbody>
                {folderTree && (
                  <FolderRow
                    node={folderTree}
                    customerOptions={customerOptions}
                    onToggleExpand={handleToggleExpand}
                    onUpdateType={handleUpdateType}
                    onUpdateCustomer={handleUpdateCustomer}
                    isLastRow={true}
                  />
                )}
              </tbody>
            </table>
          </div>
        </div>

        <ActionButtons
          onBack={onBack}
          onContinue={async () => {
            setIsActivating(true);
            try {
              await onActivate();
            } catch (error) {
              console.error('Activation failed:', error);
              setIsActivating(false);
            }
            // Keep loading state until page changes (don't set to false here)
          }}
          backLabel="Back"
          continueLabel={isActivating ? 'Loading...' : 'Activate'}
          continueDisabled={isActivateDisabled}
        />
      </OnboardingLayoutApp>
      {/* Confirmation Modal for Type Change */}
      {pendingTypeChange &&
        typeof document !== 'undefined' &&
        createPortal(
          <ConfirmationModal
            header=""
            title={`All ${countSubfolders(pendingTypeChange.node!)} subfolder${
              countSubfolders(pendingTypeChange.node!) !== 1 ? 's' : ''
            } below will now be set to ${pendingTypeChange.newType}.`}
            modalOpen={showConfirmModal}
            handleCancel={handleCancelTypeChange}
            handleYes={handleConfirmTypeChange}
            yesText="Confirm"
          />,
          document.body
        )}
      
      {/* Confirmation Modal for Expand */}
      {pendingExpandAction &&
        typeof document !== 'undefined' &&
        (() => {
          const hasKnowledge = pendingExpandAction.node?.children?.some(
            (child) => child.type === FolderType.KNOWLEDGE
          );
          const hasCustomer = pendingExpandAction.node?.children?.some(
            (child) => child.type === FolderType.CUSTOMER
          );
          
          let message = 'All the folders are ingested as ';
          if (hasKnowledge && hasCustomer) {
            message += 'knowledge and customer';
          } else if (hasKnowledge) {
            message += 'knowledge';
          } else if (hasCustomer) {
            message += 'customer';
          }
          message += '. If opened, mapping will be removed.';
          
          return createPortal(
            <ConfirmationModal
              header=""
              title={message}
              modalOpen={showExpandConfirmModal}
              handleCancel={handleCancelExpand}
              handleYes={handleConfirmExpand}
              yesText="Okay"
            />,
            document.body
          );
        })()}
      
      {/* Confirmation Modal for Customer Change */}
      {pendingCustomerChange &&
        typeof document !== 'undefined' &&
        createPortal(
          <ConfirmationModal
            header=""
            title={`All ${countSubfolders(pendingCustomerChange.node!)} subfolder${
              countSubfolders(pendingCustomerChange.node!) !== 1 ? 's' : ''
            } below will be mapped to the same ${customerOptions.find(opt => opt.value === pendingCustomerChange.customerId)?.label || 'customer'}.`}
            modalOpen={showCustomerConfirmModal}
            handleCancel={handleCancelCustomerChange}
            handleYes={handleConfirmCustomerChange}
            yesText="Okay"
          />,
          document.body
        )}
    </>
  );
};

export default ReviewFolders;
