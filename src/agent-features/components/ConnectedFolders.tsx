'use client';
import React from 'react';
import { DocIngestionStatus } from '../../app/api/agents/agent-types';
import { LoadingSpinnerIcon } from '../../app/assests/icons/icons';

interface ConnectedFolderIngestion {
  _id: string;
  folder_name: string;
  drive_type: string;
  formatted_status: 'Active' | 'Disconnect' | 'Deleted' | 'Processing' | '';
  status: DocIngestionStatus;
  [key: string]: any;
}

interface ConnectedFoldersProps {
  connectedFolders: ConnectedFolderIngestion[];
  onConnectMore: () => void;
  onStatusUpdate: (
    folderId: string,
    newStatus: DocIngestionStatus,
    prevStatus: DocIngestionStatus
  ) => void;
  showLinkMore?: boolean;
  hasProcessing?: boolean;
}

const ConnectedFolders: React.FC<ConnectedFoldersProps> = ({
  connectedFolders,
  onConnectMore,
  onStatusUpdate,
  showLinkMore = false,
  hasProcessing,
}) => {
  return (
    <div className="rounded-2xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-inter font-semibold text-sm text-gray-900">
          {showLinkMore ? 'Linked folders' : 'Connected folders'}
        </h2>
        {hasProcessing ? (
          <div className="px-3 py-1.5">
            <LoadingSpinnerIcon className="h-5 w-5 text-blue-500" />
          </div>
        ) : (
          <button
            onClick={onConnectMore}
            className="px-3 py-1.5 font-inter text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            {showLinkMore ? 'Link more' : 'Connect more'}
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed">
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
                  Drive type
                </th>
                <th
                  className="text-left text-[14px] font-medium text-gray-500 border-b border-r border-gray-200"
                  style={{ height: '36px', padding: '8px 12px' }}
                >
                  Status
                </th>
                <th
                  className="text-left text-[14px] font-medium text-gray-500 border-b border-gray-200 w-40"
                  style={{ height: '36px', padding: '8px 12px' }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {connectedFolders.map(
                (folder: ConnectedFolderIngestion, index: number) => {
                  const isLastRow = index === connectedFolders.length - 1;
                  const isProcessing =
                    folder.status === DocIngestionStatus.UPDATING;
                  const isDisabled = hasProcessing && !isProcessing;

                  return (
                    <tr
                      key={folder._id}
                      className={isDisabled ? 'opacity-50' : ''}
                    >
                      <td
                        className={`text-[14px] text-blue-600 font-normal border-r border-gray-200 ${
                          !isLastRow ? 'border-b border-gray-100' : ''
                        }`}
                        style={{ height: '36px', padding: '8px 12px' }}
                      >
                        {folder.folder_name}
                      </td>
                      <td
                        className={`text-[14px] text-gray-900 font-normal border-r border-gray-200 ${
                          !isLastRow ? 'border-b border-gray-100' : ''
                        }`}
                        style={{ height: '36px', padding: '8px 12px' }}
                      >
                        {folder.drive_type}
                      </td>
                      <td
                        className={`text-[14px] font-normal border-r border-gray-200 ${
                          !isLastRow ? 'border-b border-gray-100' : ''
                        } ${
                          folder.status === DocIngestionStatus.ACTIVE
                            ? 'text-gray-900'
                            : 'text-gray-500'
                        }`}
                        style={{ height: '36px', padding: '8px 12px' }}
                      >
                        {folder.formatted_status}
                      </td>
                      <td
                        className={`border-r border-gray-200 ${
                          !isLastRow ? 'border-b border-gray-100' : ''
                        }`}
                        style={{ height: '36px', padding: '8px 12px' }}
                      >
                        {folder.status === DocIngestionStatus.ACTIVE ? (
                          <button
                            onClick={() =>
                              onStatusUpdate(
                                folder._id,
                                DocIngestionStatus.DISCONNECTED,
                                folder.status
                              )
                            }
                            disabled={isDisabled}
                            className="flex text-[14px] text-blue-600 hover:text-blue-700 transition-colors disabled:cursor-not-allowed disabled:hover:text-blue-600"
                          >
                            Disconnect
                          </button>
                        ) : folder.status === DocIngestionStatus.UPDATING ? (
                          <span className="text-[14px] text-gray-500">—</span>
                        ) : (
                          <div className="flex gap-3 items-center">
                            <button
                              onClick={() =>
                                onStatusUpdate(
                                  folder._id,
                                  DocIngestionStatus.ACTIVE,
                                  folder.status
                                )
                              }
                              disabled={isDisabled}
                              className="text-[14px] text-blue-600 hover:text-blue-700 transition-colors disabled:cursor-not-allowed disabled:hover:text-blue-600"
                            >
                              Activate
                            </button>
                            <span className="text-gray-300">|</span>
                            <button
                              onClick={() =>
                                onStatusUpdate(
                                  folder._id,
                                  DocIngestionStatus.DELETED,
                                  folder.status
                                )
                              }
                              disabled={isDisabled}
                              className="text-[14px] text-blue-600 hover:text-blue-700 transition-colors disabled:cursor-not-allowed disabled:hover:text-blue-600"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                }
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ConnectedFolders;
