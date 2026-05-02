'use client';

import dayjs from 'dayjs';
import SideDrawer from '../../../../common/components/SideDrawer';
import { CalendarClock, Mail } from 'lucide-react';

interface TimeSensitiveTrayProps {
  isOpen: boolean;
  onClose: () => void;
  emails: any[];
  tasks: any[];
}

export const TimeSensitiveTray = ({
  isOpen,
  onClose,
  emails,
  tasks,
}: TimeSensitiveTrayProps) => {
  const isEmpty = !tasks?.length && !emails?.length;

  return (
    <SideDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Time-sensitive actions"
      width="w-[420px]"
      zIndex={1050}
    >
      <div className="flex flex-col h-[calc(100vh-56px)] overflow-y-auto">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center flex-1 gap-3 text-[#97A1AF] px-6 py-20">
            <CalendarClock className="w-10 h-10 opacity-40" />
            <p className="text-[14px]">No time-sensitive actions right now</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {/* Tasks section */}
            {tasks?.length > 0 && (
              <div className="px-6 py-5">
                <div className="flex items-center gap-2 mb-3">
                  <CalendarClock className="w-[14px] h-[14px] text-[#637083]" />
                  <span className="text-[11px] font-semibold text-[#637083] uppercase tracking-wider">
                    Tasks · {tasks.length}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  {tasks.map((task: any) => {
                    const isDue = task.planned_end_datetime
                      ? dayjs(task.planned_end_datetime).isBefore(dayjs().add(3, 'day'))
                      : false;
                    return (
                      <div
                        key={task._id}
                        className="p-3 rounded-xl border border-[#E4E7EC] bg-white hover:border-[#C1C9D4] transition-colors"
                      >
                        <p className="text-[13px] font-medium text-[#202B37] leading-snug">
                          {task.title}
                        </p>
                        <div className="flex items-center justify-between mt-1.5">
                          {(task.account || task.customer_name) && (
                            <span className="text-[11px] text-[#637083]">
                              {task.account || task.customer_name}
                            </span>
                          )}
                          {task.planned_end_datetime && (
                            <span
                              className={`text-[11px] font-medium ${
                                isDue ? 'text-[#EF4444]' : 'text-[#637083]'
                              }`}
                            >
                              Due {dayjs(task.planned_end_datetime).format('MMM D')}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Emails section */}
            {emails?.length > 0 && (
              <div
                className={`px-6 py-5 ${tasks?.length > 0 ? 'border-t border-[#E4E7EC]' : ''}`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Mail className="w-[14px] h-[14px] text-[#637083]" />
                  <span className="text-[11px] font-semibold text-[#637083] uppercase tracking-wider">
                    Priority Emails · {emails.length}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  {emails.map((email: any) => (
                    <div
                      key={email._id}
                      className="p-3 rounded-xl border border-[#E4E7EC] bg-white hover:border-[#C1C9D4] transition-colors"
                    >
                      <p className="text-[13px] font-medium text-[#202B37] truncate leading-snug">
                        {email.subject || email.email_subject || '(No subject)'}
                      </p>
                      <p className="text-[11px] text-[#637083] mt-1 truncate">
                        {email.sender_name || email.from_name || email.from_email || ''}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </SideDrawer>
  );
};
