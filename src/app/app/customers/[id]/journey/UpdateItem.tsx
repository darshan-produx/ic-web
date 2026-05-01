import React, { useState } from 'react';
import { CheckBoxIcon, EmailBoxIcon, InformationSvgIcon, MeetingBoxIcon, MeetingMembersdividerLineIcon, OpportunitiesCreatedBySvgIcon, OpportunitySvgIcon, UserBoxIcon } from '../../../../assests/icons/icons';
import AddUpdateForm from '../../../../../common/components/AddUpdateForm';
import { getTimeAgo } from '../../../../../common/SupportFunctions';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';

interface UpdateItemProps {
  update: {
    description: string;
    timestamp: string;
    source?: 'manual' | 'system' | 'email' | 'meeting' | 'opportunity' | 'task';
    update_id: string;
    ticket_status?: string;
    is_deleted?: boolean;
    created_by?: string;
    created_by_name?: string;
    update_reference_ids?: any[];
  };
  onEdit: (updateId: string, newDescription: string) => void;
  onDelete: (updateId: string) => void;
}

const UpdateItem: React.FC<UpdateItemProps> = ({
  update,
  onEdit,
  onDelete,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDescriptionHovered, setIsDescriptionHovered] = useState(false);
  const [editedDescription, setEditedDescription] = useState(
    update.description
  );

  const getSvgIconsForUpdates = (source: string | undefined, css?: string, color?: string) => {
    switch (source) {
      case 'manual':
        return <UserBoxIcon className={"h-[16px] w-[16px]"} stroke={color} />;
      case 'system':
        return <InformationSvgIcon className={"h-[17px] w-[17px]"} stroke={color} />;
      case 'email':
        return <EmailBoxIcon className={"h-[19.35px] w-[19.35px]"} stroke={color} />;
      case 'meeting':
        return <MeetingBoxIcon className={"h-[19.35px] w-[19.35px]"} stroke={color} />;
      case 'opportunity':
        return <OpportunitySvgIcon className={"h-[19.35px] w-[19.35px]"} stroke={color} />;
      case 'task':
        return <CheckBoxIcon className={"h-[19.35px] w-[19.35px]"} stroke={color} />;
      default:
        return <InformationSvgIcon className={"h-[17px] w-[17px]"} stroke={color} />;
    }
  }

  const handleSave = (value: string) => {
    onEdit(update.update_id, value);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedDescription(update.description);
    setIsEditing(false);
  };

  const showEditDelete = update.source === 'manual' && update.created_by && isHovered;
  // update.source === 'manual' && update.created_by && isHovered;

  if (isEditing) {
    return (
      <>
        <div className='border-t border-[#F2F4F7] my-6'></div>
        <AddUpdateForm
          initialValue={update.description}
          placeholder="Add update details"
          onSave={(value) => handleSave(value)}
          onCancel={handleCancel}
          submitButtonText="Update"
          className='my-0'
          // autoGrow={true}
          fixedHeight="100px"
        /></>
    );
  }

  const isUpdateRedirectable = (update?.update_reference_ids && update?.update_reference_ids.length > 0) && (update?.source === 'meeting' || update?.source === 'email' || update?.source === 'task' || update?.source === 'opportunity');
  const getRedirectableString = () => {
    if (update?.source === 'meeting' && update?.update_reference_ids && update?.update_reference_ids.length > 0) {
      return `/app/communication/meetings/${update?.update_reference_ids[0]}`;
    } else if (update?.source === 'email' && update?.update_reference_ids && update?.update_reference_ids.length > 0) {
      return `/app/emails?email_message_id=${update?.update_reference_ids[0]}`;
    } else if (update?.source === 'task' && update?.update_reference_ids && update?.update_reference_ids.length > 0) {
      return `/app/tasks/${update?.update_reference_ids[0]}`;
    } else if (update?.source === 'opportunity' && update?.update_reference_ids && update?.update_reference_ids.length > 0) {
      return `/app/insights/opportunities?selected=${update?.update_reference_ids[0]}`;
    }
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className='border-t border-[#F2F4F7] my-6'></div>
      {/* Icon */}

      <div className='flex items-start justify-start gap-2'>
        <span className='flex-shrink-0 mt-[1px]'>{getSvgIconsForUpdates(update?.source, "h-[19.35px] w-[19.35px]", `${isUpdateRedirectable && isDescriptionHovered ? "#3B82F6" : "#637083"}`)}</span>
        <div className="w-full flex flex-col items-start gap-2">
          <div className="flex-1">
            {isUpdateRedirectable
              ? (
                <Link
                  key={`signal-${update.update_id}`}
                  href={`${getRedirectableString()}`}
                  onMouseEnter={() => setIsDescriptionHovered(true)}
                  onMouseLeave={() => setIsDescriptionHovered(false)}
                >
                  <ReactMarkdown className="text-[14px] text-[#202B37] hover:text-[#3B82F6] cursor-pointer">
                    {update.description}
                  </ReactMarkdown>
                </Link>
              )
              :
              (<ReactMarkdown className="text-[14px] text-[#202B37]">
                {update.description}
              </ReactMarkdown>
              )}
          </div>
          <div className="w-full flex items-center justify-between text-[#637083] text-xs font-normal">
            <div className='flex items-center gap-4 justify-start'>
              <span>{getTimeAgo(update.timestamp)}</span>
              {(update?.created_by && update?.source === 'manual') && (<div className="flex items-center gap-3 text-xs text-[#202B37] font-normal">
                <span><MeetingMembersdividerLineIcon /></span>
                <span className='flex items-center gap-1'><OpportunitiesCreatedBySvgIcon /><span>{update?.created_by_name}</span></span>
              </div>
              )}
            </div>
            {/* Edit and Delete buttons */}
            {(showEditDelete) && (
              <div className="flex items-center gap-4 justify-end">
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-xs font-normal text-[#202B37]"
                >
                  Edit
                </button>
                <span className="h-[10px] border-l border-[#E4E7EC]"></span>
                <button
                  onClick={() => onDelete(update.update_id)}
                  className="text-xs font-normal text-[#202B37]"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>


    </div>
  );
};

export default UpdateItem;
