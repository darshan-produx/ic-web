"use client";

import {
  MeetingMembersdividerLineIcon,
  MeetingMembersIcon,
  PowerIcon,
} from '../../../../../app/assests/icons/icons';
import { Dropdown } from '../../../../../common/Dropdown';
import dayjs from 'dayjs';
import { MoreHorizontal } from 'lucide-react';
import { getInitials } from './meetingDetails';
import { useRouter } from 'next/navigation';

export default function MeetingCard({
  meeting,
  index,
  habndelDeleteMeeting,
  setMeetingDetails,
  setUploadTransriptModalOpen,
  toggle,
  setMomMeetingDetails,
}: any) {
  const router = useRouter();
  const pendingTask = meeting?.task?.filter(
    (ele: any) => !ele?.is_completed
  )?.length;
  const pendingInsightCount = meeting.insightInstance?.filter(
    (ele: any) => ele?.action_status?.toLowerCase() === 'active'
  )?.length;

  // Robust processed check: accept boolean true or string 'true'
  const isProcessed =
    meeting?.is_processed === true || meeting?.is_processed === 'true';

  return (
    <div
      className="cursor-pointer w-[283px] h-[136px]"
      onClick={() => {
        if (meeting?._id) {
          router.push(`/app/communication/meetings/${meeting?._id}`);
        }
      }}
    >
      <div
        key={index}
        className={`border border-[#E4E7EC] rounded-[12px] p-[16px] w-full h-full ${isProcessed ? 'hover:shadow-md transition-shadow' : ''
          }`}
      >
        <div className="flex justify-between">
          <span
            className="text-[16px] text-[#414E62] overflow-hidden text-ellipsis text-nowrap"
            title={meeting.meeting_name}
          >
            {meeting.meeting_name}
          </span>
          <div
            className="flex items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <Dropdown className="relative dropdown shrink-0">
              <Dropdown.Trigger
                type="button"
                className="inline-block p-0 transition-all duration-200 ease-linear rounded-full text-topbar-item dropdown-toggle btn hover:text-topbar-item-hover"
                id="dropdownMenuButton"
                data-bs-toggle="dropdown"
              >
                <span className="flex items-center">
                  <MoreHorizontal className="size-5 rotate-[90deg] cursor-pointer text-[#637083] ml-2" />
                </span>
              </Dropdown.Trigger>
              <Dropdown.Content
                placement="bottom"
                data-bs-toggle="dropdown-end"
                className="absolute z-[1000] px-[20px] py-[15px] right-0 ltr:text-left rtl:text-right bg-white rounded-md border-[#CED2DA] border shadow-md dropdown-menu w-[10rem] dark:bg-zink-600"
                aria-labelledby="dropdownMenuButton"
              >
                <div className="w-[140px] flex flex-col">
                  {[
                    {
                      label: 'Edit',
                      onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
                        e.stopPropagation();
                        setUploadTransriptModalOpen({
                          meeting: meeting,
                          status: true,
                          isEdit: true,
                        });
                        (e.currentTarget.closest('.dropdown') as any).click();
                      },
                    },
                    {
                      label: 'Delete',
                      onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
                        e.stopPropagation();
                        habndelDeleteMeeting(meeting);
                        (e.currentTarget.closest('.dropdown') as any).click();
                      },
                    },
                    {
                      label: 'Send email',
                      onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
                        e.stopPropagation();
                        setMomMeetingDetails(meeting);
                        toggle();
                        (e.currentTarget.closest('.dropdown') as any).click();
                      },
                      disabled: !isProcessed,
                    },
                  ].map(({ label, onClick, disabled }) => (
                    <button
                      key={label}
                      onClick={onClick}
                      disabled={disabled}
                      className={`w-full h-9 text-start text-[16px] close-dropdown leading-[24px] font-[400] text-[#344051] bg-transparent rounded-md transition-colors duration-200 ${disabled ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      type="button"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </Dropdown.Content>
            </Dropdown>
          </div>
        </div>
        <div className='flex items-center justify-start text-[12px] text-[#97A1AF] pt-[8px] !pb-[20px] gap-1'>{meeting?.is_internal_meeting && (<><span>Internal</span> <span className='px-1'><MeetingMembersdividerLineIcon /></span></>)}<span>
          {dayjs(meeting.datetime).format('DD MMM, hh:mm A')}
        </span></div>

        <div className="flex justify-between items-center gap-[11px] w-[251px] h-[36px]">
          <div className="flex items-center px-[10px] py-[6px] rounded-[6px] bg-[#F9FAFB] gap-[10px] min-w-0 flex-1 h-[36px] max-w-fit">
            <div className="flex items-center justify-center gap-[5px] shrink-0">
              <span className="text-[#202B37] text-[16px] font-normal leading-6">
                {meeting?.participants?.length}
              </span>
              <span>
                <MeetingMembersIcon />
              </span>
            </div>
            {meeting?.customer && meeting?.customer?.customer_name && (
              <>
                <div className="shrink-0">
                  <MeetingMembersdividerLineIcon />
                </div>
                <div className="text-[#202B37] text-[16px] font-normal leading-6 overflow-hidden text-ellipsis whitespace-nowrap min-w-0 max-w-[120px]">
                  {meeting?.customer?.customer_name || ''}
                </div>
              </>
            )}
          </div>

          {!isProcessed ? (
            <div className="flex px-[10px] py-[6px] gap-[4px] items-center justify-center text-[#202B37] text-[14px] font-medium bg-[#F9FAFB] min-w-[49px] h-[36px] rounded-[6px] shrink-0">
              <span className="text-[#637083] text-nowrap">Processing...</span>
            </div>
          ) : !meeting?.is_pending ? (
            <div className="flex px-[10px] py-[6px] gap-[4px] items-center justify-center text-[#202B37] text-[14px] font-medium bg-[#F9FAFB] min-w-[49px] h-[36px] rounded-[6px] shrink-0">
              {pendingInsightCount > 0 || pendingTask > 0 ? (
                <>
                  <span>{pendingInsightCount + pendingTask}</span>
                  <span className="w-3 h-4 items-center flex">
                    <PowerIcon className="text-[#EAB308]" />
                  </span>
                </>
              ) : (
                <>
                  <span>
                    {meeting?.task?.length + meeting?.insightInstance?.length}
                  </span>
                  <span className="w-3 h-4 items-center flex">
                    <PowerIcon className="text-[#249782]" />
                  </span>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center px-[10px] py-[6px] rounded-[6px] bg-[#F9FAFB] min-w-[49px] h-[36px] shrink-0">
              <span className="text-[12px] text-[#637083] leading-4 text-nowrap">
                To be confirmed
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
