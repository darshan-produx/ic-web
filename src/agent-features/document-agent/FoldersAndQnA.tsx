'use client';
import React, { useMemo, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { OnboardingLayoutApp } from '../components/OnboardingLayoutApp';
import {
  DocIngestionStatus,
  DriveType,
} from '../../app/api/agents/agent-types';
import {
  useUpdateDocumentIngestionMutation,
  useUpdateDocumentIngestionPrevStatusMutation,
} from '../../services/mutations/agents';
import QnAResults, { QnAItem } from '../components/QnAResults';
import ConnectedFolders from '../components/ConnectedFolders';
import ScanningFolders from '../components/ScanningFolders';
import { useQuery } from '@tanstack/react-query';
import { getDocumentIngestion } from '../../app/api/agents/document-agent';
import { usePollingTimeout } from '../hooks/usePollingTimeout';

interface ConnectedFolderIngestion {
  _id: string;
  folder_name: string;
  drive_type: string;
  formatted_status: 'Active' | 'Disconnect' | 'Deleted' | 'Processing' | '';
  status: DocIngestionStatus;
  [key: string]: any;
}

interface FoldersAndQnAProps {
  activation_id: string;
  qnaData: any;
  isQnALoading?: boolean;
  onConnectMore: () => void;
  onDone: () => void;
  jumpToStep: (targetStep: string) => void;
  firstStep?: string;
}

const FoldersAndQnA: React.FC<FoldersAndQnAProps> = ({
  activation_id,
  qnaData,
  isQnALoading = false,
  onConnectMore = () => console.log('Connect more clicked'),
  onDone = () => console.log('Done clicked'),
  jumpToStep,
  firstStep,
}) => {
  const [isTimedOut, setIsTimedOut] = useState(false);
  const [prevStatusState, setPrevStatusState] = useState<{
    folderId: string;
    newStatus: DocIngestionStatus | '';
    prevStatus: DocIngestionStatus | '';
  }>({
    folderId: '',
    newStatus: '',
    prevStatus: '',
  });
  // Check if we have QnA data already (returning to activated agent)
  const hasExistingQnA =
    qnaData?.data?.docs &&
    Array.isArray(qnaData.data?.docs) &&
    qnaData.data?.docs.length > 0;

  // Start with scanning page hidden if we already have QnA data
  const [showScanning, setShowScanning] = useState(!hasExistingQnA);

  const {
    data: docIngestionDetailsData,
    isError: isDocIngestionError,
    error: docIngestionError,
  } = useQuery({
    queryKey: ['get-document-ingestion-details', activation_id],
    queryFn: () => getDocumentIngestion(activation_id!),
    enabled: Boolean(activation_id),
    refetchOnWindowFocus: false,
    refetchInterval: (queryData) => {
      if (isTimedOut) {
        return false;
      }
      const data = queryData?.state?.data?.data;
      const isPendingIngest =
        data && data?.pendingIngest && data.pendingIngest > 0;
      const isUpdating =
        (data && data?.pendingUpdates && data.pendingUpdates > 0) ||
        (data && data?.pendingUpdates && data.pendingUpdates > 0);
      const shouldRefetch = isPendingIngest || isUpdating;
      if (shouldRefetch) {
        return 10_000;
      }
      return false;
    },
  });

  const isDocIngestionDetailsDataRunning =
    docIngestionDetailsData?.data?.pendingIngest > 0 ||
    docIngestionDetailsData?.data?.pendingUpdates > 0;

  const docIngestionDetailsDataSuccessful =
    docIngestionDetailsData?.data?.pendingIngest === 0 &&
    docIngestionDetailsData?.data?.pendingUpdates === 0;

  usePollingTimeout({
    isRunning: isDocIngestionDetailsDataRunning,
    isSuccessful: docIngestionDetailsDataSuccessful,
    timeoutMs: 60000 * 3,
    resetKey: activation_id, // Resets timer if ID changes
    onTimeout: () => {
      console.warn('Document ingestion polling timed out');
      toast.error('Timed out. Please try again.');
      setIsTimedOut(true);
    },
  });

  const docIngestionDetails = docIngestionDetailsData?.data;

  const connectedFolders = useMemo(() => {
    if (
      !docIngestionDetails ||
      (Array.isArray(docIngestionDetails?.docs) &&
        docIngestionDetails?.docs.length === 0)
    )
      return [];

    return (docIngestionDetails.docs || [])?.map(
      (folder: any): ConnectedFolderIngestion => {
        const formattedDriveType =
          folder.drive_type === DriveType.GOOGLE
            ? 'Google Drive'
            : folder.drive_type === DriveType.ONEDRIVE
            ? 'OneDrive'
            : '';

        const formattedStatus =
          folder.status === DocIngestionStatus.ACTIVE
            ? 'Active'
            : folder.status === DocIngestionStatus.DISCONNECTED
            ? 'Disconnect'
            : folder.status === DocIngestionStatus.DELETED
            ? 'Deleted'
            : folder.status === DocIngestionStatus.UPDATING
            ? 'Processing'
            : '';

        return {
          _id: folder._id,
          folder_name: folder.folder_name,
          drive_type: formattedDriveType,
          formatted_status: formattedStatus,
          status: folder.status,
        };
      }
    );
  }, [docIngestionDetailsData]);

  // Check if any folder is currently processing
  const hasProcessing = useMemo(() => {
    return connectedFolders.some(
      (folder: ConnectedFolderIngestion) =>
        folder.status === DocIngestionStatus.UPDATING
    );
  }, [connectedFolders]);
  // Handle query errors with toast messages
  useEffect(() => {
    if (isDocIngestionError && docIngestionError) {
      const errorMessage =
        (docIngestionError as any)?.response?.data?.message ||
        (docIngestionError as any)?.message ||
        'Failed to load connected folders';
      toast.error(errorMessage);
    }
  }, [isDocIngestionError, docIngestionError]);

  const updateDocumentIngestion = useUpdateDocumentIngestionMutation();
  const updateDocumentIngestionPrevStatus =
    useUpdateDocumentIngestionPrevStatusMutation();

  const handleStatusUpdate = async (
    folderId: string,
    newStatus: DocIngestionStatus,
    prevStatus: DocIngestionStatus
  ) => {
    setPrevStatusState({
      folderId,
      newStatus,
      prevStatus,
    });
    try {
      // FIX: Corrected syntax errors in the mutate call
      await updateDocumentIngestion.mutateAsync({
        activation_id: activation_id!,
        doc_ingestion_id: folderId,
        updateDocumentIngestionPayload: { status: newStatus },
      });
      // toast.success('Folder status updated successfully');
    } catch (error: any) {
      console.error('Failed to update status', error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to update folder status';
      toast.error(errorMessage);
    }
  };

  useEffect(() => {
    const updatePrevStatus = async () => {
      if (
        prevStatusState &&
        prevStatusState.folderId &&
        activation_id !== null &&
        prevStatusState?.prevStatus
      ) {
        await updateDocumentIngestionPrevStatus.mutateAsync({
          activation_id: activation_id!,
          doc_ingestion_id: prevStatusState?.folderId,
          updateDocumentIngestionPayload: {
            status: prevStatusState.prevStatus,
          },
        });
      }
    };
    if (isTimedOut && prevStatusState) {
      updatePrevStatus();
    }
    return () => {};
  }, [isTimedOut, setIsTimedOut, prevStatusState]);

  const qnaItems: QnAItem[] = useMemo(() => {
    if (
      !qnaData?.data?.docs ||
      !Array.isArray(qnaData.data?.docs) ||
      qnaData.data?.docs.length === 0
    )
      return [];
    return qnaData.data?.docs;
  }, [qnaData?.data]);

  // If QnA data loads while on scanning page, hide scanning automatically
  useEffect(() => {
    if (hasExistingQnA && showScanning) {
      setShowScanning(false);
    }
  }, [hasExistingQnA, showScanning]);

  const handleScanningDone = () => {
    setShowScanning(false);
  };

  // Determine what to show based on state
  const showQnAResults = !showScanning && connectedFolders.length > 0;

  return (
    <OnboardingLayoutApp>
      {showQnAResults ? (
        // QnA Results View with Linked Folders (only show folders when ALL QnA are fetched)
        <>
          <QnAResults
            qnaItems={qnaItems}
            isLoading={isQnALoading}
            hideFooter={true}
          />
          {!isQnALoading && (
            <div className="animate-[fadeIn_0.2s_ease-out] mt-6">
              <ConnectedFolders
                connectedFolders={connectedFolders}
                onConnectMore={onConnectMore}
                onStatusUpdate={handleStatusUpdate}
                showLinkMore={true}
                hasProcessing={hasProcessing}
              />
            </div>
          )}
        </>
      ) : (
        // Scanning Folders with Connected Folders
        <>
          <ScanningFolders
            onDone={handleScanningDone}
            hasQnAData={hasExistingQnA}
          />
          <div className="flex flex-col gap-6">
            <ConnectedFolders
              connectedFolders={connectedFolders}
              onConnectMore={onConnectMore}
              onStatusUpdate={handleStatusUpdate}
              showLinkMore={false}
              hasProcessing={hasProcessing}
            />
          </div>
        </>
      )}
    </OnboardingLayoutApp>
  );
};

export default FoldersAndQnA;
