//1
'use client';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { ProgressDots } from '../components/ProgressDots';
import { ActionButtons } from '../components/ActionButtons';
import {
  GoogleDriveIcon,
  OneDriveIcon,
  LoadingSpinnerIcon,
  CheckMarkIcon,
  ChevronDownIcon,
} from '../../app/assests/icons/icons';
import { useCheckAccessMutation } from '../../services/mutations/agents';
import {
  DriveType,
  RequestAccessFolderPayload,
} from '../../app/api/agents/agent-types';
import { OnboardingLayoutApp } from '../components/OnboardingLayoutApp';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getDocumentAgentStagingDetails } from '../../app/api/agents/document-agent';
import { usePollingTimeout } from '../hooks/usePollingTimeout';

interface ConnectRepositoryProps {
  activation_id: string;
  onBack: () => void;
  onConnect: (requestAccessFolderPayload: RequestAccessFolderPayload) => void;
  hasConnectedFolders?: boolean;
}

const ConnectRepository: React.FC<ConnectRepositoryProps> = ({
  activation_id,
  onBack = () => console.log('Back clicked'),
  onConnect = () => console.log('Connect clicked'),
  hasConnectedFolders,
}) => {
  const [driveType, setSelectedDriveType] = useState(DriveType.GOOGLE);
  const [folderLink, setFolderLink] = useState('');
  const [showInstructions, setShowInstructions] = useState(false);
  const [isCheckingAccess, setIsCheckingAccess] = useState(false);
  const [linkError, setLinkError] = useState('');
  const [accessChecked, setAccessChecked] = useState(false);
  const [checkAccessAgentStagingId, setCheckAccessAgentStagingId] = useState<
    string | null
  >(null);
  const queryClient = useQueryClient();
  const copyAccountLink = () => {
    navigator.clipboard.writeText(
      'impactcraft-server@impactcraft.iam.gserviceaccount.com'
    );
  };
  const checkAccess = useCheckAccessMutation();
  const handleCheckAccess = async () => {
    setIsCheckingAccess(true);
    setLinkError('');
    setAccessChecked(false);
    setCheckAccessAgentStagingId(null);

    try {
      const requestAccessFolderPayload = {
        drive_type: driveType,
        folder_loc: folderLink,
      };

      const response = await checkAccess.mutateAsync({
        activation_id,
        requestAccessFolderPayload,
      });

      const stagingId = response?._id?.toString?.() ?? response?._id;

      if (!stagingId) {
        setLinkError('Invalid response from server.');
        setIsCheckingAccess(false);
        return;
      }

      setCheckAccessAgentStagingId(stagingId);
    } catch (error: any) {
      console.error('Error checking access:', error);
      setAccessChecked(false);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'The folder link is not correct.';
      setLinkError(errorMessage);
      toast.error(errorMessage);
      setIsCheckingAccess(false);
    }
  };

  const { data: checkAccessActivationDetailsData, isError } = useQuery({
    queryKey: [
      'check_access',
      'document-agent-staging-details',
      checkAccessAgentStagingId,
    ],
    queryFn: () => getDocumentAgentStagingDetails(checkAccessAgentStagingId!),
    enabled: Boolean(checkAccessAgentStagingId),
    refetchOnWindowFocus: false,
    retry: false,

    refetchInterval: (query) => {
      const folder_access = query.state.data?.data?.folder_access;

      if (!folder_access) return 5_000;

      // Stop polling when status is 200 (success) or 400 (error)
      if (
        folder_access.status === 200 ||
        folder_access.status === 400 ||
        folder_access.has_access === true ||
        folder_access.has_access === false
      ) {
        return false;
      }

      return 5_000;
    },
  });

  const isCheckingAccessDetailsDataSuccessful =
    checkAccessActivationDetailsData?.data?.folder_access &&
    (checkAccessActivationDetailsData.data.folder_access.status === 200 ||
      checkAccessActivationDetailsData.data.folder_access.status === 400) &&
    checkAccessActivationDetailsData.data.folder_access.has_access !==
      undefined;

  usePollingTimeout({
    isRunning: Boolean(checkAccessAgentStagingId),
    isSuccessful: isCheckingAccessDetailsDataSuccessful,
    timeoutMs: 60000 * 2,
    resetKey: activation_id, // Resets timer if ID changes
    onTimeout: () => {
      console.warn('Check access polling timed out');
      toast.error('Timed out. Please try again.');
      setAccessChecked(false);
      setIsCheckingAccess(false);
      queryClient.removeQueries({
        queryKey: [
          'check_access',
          'document-agent-staging-details',
          checkAccessAgentStagingId,
        ],
      });
      setCheckAccessAgentStagingId(null);
    },
  });

  useEffect(() => {
    if (!checkAccessActivationDetailsData) return;

    const folder_access = checkAccessActivationDetailsData?.data?.folder_access;

    if (!folder_access) return;

    // Check for successful access (status 200)
    if (folder_access.has_access && folder_access.status === 200) {
      setAccessChecked(true);
      setLinkError('');
      setIsCheckingAccess(false);
      setCheckAccessAgentStagingId(null);
      toast.success('Folder access verified successfully');
      queryClient.removeQueries({
        queryKey: [
          'check_access',
          'document-agent-staging-details',
          checkAccessAgentStagingId,
        ],
      });
      return;
    }

    // Check for error status (status 400)
    if (folder_access.status === 400) {
      const errorMessage =
        folder_access.message || 'The folder link is not correct.';
      setLinkError(errorMessage);
      toast.error(errorMessage);
      setAccessChecked(false);
      setIsCheckingAccess(false);
      queryClient.removeQueries({
        queryKey: [
          'check_access',
          'document-agent-staging-details',
          checkAccessAgentStagingId,
        ],
      });
      setCheckAccessAgentStagingId(null);
    }
  }, [checkAccessActivationDetailsData]);

  useEffect(() => {
    if (!isError) return;

    const errorMessage = 'Failed to fetch access status.';
    setLinkError(errorMessage);
    toast.error(errorMessage);
    setIsCheckingAccess(false);
    setCheckAccessAgentStagingId(null);
  }, [isError]);

  const handleConnect = () => {
    if (folderLink && !linkError && accessChecked) {
      const requestAccessFolderPayload = {
        drive_type: driveType,
        folder_loc: folderLink,
      };
      onConnect && onConnect(requestAccessFolderPayload);
    }
  };

  return (
    <OnboardingLayoutApp>
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-xl font-semibold text-gray-900 mb-4">
          Connect your folders
          <br />
          so that I can analyze them for you
        </h1>
        <ProgressDots totalSteps={3} currentStep={1} />
      </div>

      {/* Content Section */}
      <div className="flex flex-col gap-6">
        {/* Question */}
        <h2 className="font-inter font-normal text-base leading-6 text-gray-900">
          Where your repository is located?
        </h2>

        {/* Options - No separate containers */}
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Google Drive Option */}
          <button
            onClick={() => setSelectedDriveType(DriveType.GOOGLE)}
            className="flex items-center gap-2 bg-transparent border-0 p-0 cursor-pointer"
          >
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                driveType === DriveType.GOOGLE
                  ? 'border-blue-600'
                  : 'border-gray-300'
              }`}
            >
              {driveType === DriveType.GOOGLE && (
                <div className="w-2.5 h-2.5 bg-blue-600 rounded-full"></div>
              )}
            </div>

            <GoogleDriveIcon className="w-5 h-5 flex-shrink-0" />

            <span className="font-inter text-base text-gray-900 font-normal">
              Google drive
            </span>
          </button>

          {/* OneDrive Option */}
          <button
            onClick={() => setSelectedDriveType(DriveType.ONEDRIVE)}
            disabled
            className="flex items-center gap-2 bg-transparent border-0 p-0 cursor-not-allowed opacity-50"
          >
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                driveType === DriveType.ONEDRIVE
                  ? 'border-blue-600'
                  : 'border-gray-300'
              }`}
            >
              {driveType === DriveType.ONEDRIVE && (
                <div className="w-2.5 h-2.5 bg-blue-600 rounded-full"></div>
              )}
            </div>

            <OneDriveIcon className="w-5 h-5 flex-shrink-0" />

            <span className="font-inter text-base text-gray-900 font-normal">
              OneDrive
            </span>
          </button>
        </div>

        {/* Folder link section */}
        <div className="w-full flex flex-col gap-3">
          <label className="font-inter text-sm font-normal text-gray-900">
            Folder link
          </label>

          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <input
              type="text"
              value={folderLink}
              onChange={(e) => {
                setFolderLink(e.target.value);
                setLinkError('');
                setAccessChecked(false);
              }}
              placeholder="Enter google drive folder link"
              className={`w-full px-3 py-2.5 border rounded-lg font-inter text-sm outline-none transition-all ${
                linkError
                  ? 'border-red-400 focus:ring-2 focus:ring-red-500 focus:border-red-400'
                  : accessChecked
                  ? 'border-green-400 focus:ring-2 focus:ring-green-500 focus:border-green-400'
                  : 'border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              }`}
            />
            {!accessChecked && (
              <button
                onClick={handleCheckAccess}
                disabled={!folderLink || isCheckingAccess}
                className="px-5 py-2.5 bg-white text-gray-900 border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-normal font-inter whitespace-nowrap transition-all flex items-center justify-center min-w-[120px]"
              >
                {isCheckingAccess ? (
                  <LoadingSpinnerIcon className="h-5 w-5 text-blue-500" />
                ) : (
                  'Check access'
                )}
              </button>
            )}
            {accessChecked && (
              <div className="flex items-center justify-center px-2">
                <CheckMarkIcon className="w-5 h-5" />
              </div>
            )}
          </div>

          {linkError && (
            <p className="font-inter text-sm text-red-600">{linkError}</p>
          )}
        </div>

        {/* Collapsible Instructions */}
        <div>
          <button
            onClick={() => setShowInstructions(!showInstructions)}
            className="flex items-center gap-2 text-sm font-normal font-inter text-gray-900 hover:text-gray-700 transition-colors bg-transparent border-0 p-0 cursor-pointer"
          >
            <ChevronDownIcon
              className={`w-4 h-4 transition-transform ${
                showInstructions ? 'rotate-180' : ''
              }`}
            />
            How to get the link and grant access to ImpactCraft agent
          </button>

          {showInstructions && (
            <div className="mt-5 flex flex-col gap-5">
              <div>
                <h4 className="font-inter text-sm font-semibold text-gray-900 mb-3">
                  How to get access link
                </h4>
                <ol className="font-inter text-sm text-gray-700 leading-5 list-decimal list-inside space-y-1">
                  <li>Go to google drive</li>
                  <li>Open the required folder</li>
                  <li>Copy the link in the url</li>
                  <li>Paste it in the above box</li>
                </ol>
              </div>

              <div>
                <h4 className="font-inter text-sm font-semibold text-gray-900 mb-3">
                  Grant access
                </h4>
                <p className="font-inter text-sm text-gray-700 mb-3 leading-5">
                  You'll need to share folder access with our system account.
                </p>
                <ol className="font-inter text-sm text-gray-700 leading-5 list-decimal list-inside space-y-1 mb-3">
                  <li>Go to google drive</li>
                  <li>Find the folder you have shared the link for</li>
                  <li>Click on the three dots (more actions) and share</li>
                  <li>
                    Copy the account link below and paste it in the textbox and
                    change the access to viewer before sharing
                  </li>
                </ol>

                <button
                  onClick={copyAccountLink}
                  className="font-inter text-sm text-blue-600 hover:text-blue-700 font-normal bg-transparent border-0 p-0 cursor-pointer"
                >
                  Copy ImpactCraft account link
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6">
        <ActionButtons
          onBack={onBack}
          onContinue={handleConnect}
          backLabel="Back"
          continueLabel="Connect"
          continueDisabled={!folderLink || !!linkError || !accessChecked}
          backDisabled={!hasConnectedFolders}
        />
      </div>
    </OnboardingLayoutApp>
  );
};

export default ConnectRepository;
