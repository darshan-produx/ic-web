'use client';
import dayjs from 'dayjs';
import { Link } from 'lucide-react';
import SideDrawer from '../../../common/components/SideDrawer';

interface TaskDetailDrawerProps {
  ele: any;
  isOpen: boolean;
  onClose: () => void;
  statusArr: any[];
  onEdit: () => void;
  onDelete: () => void;
  onMarkDone: () => void;
}

const TaskDetailDrawer = ({
  ele,
  isOpen,
  onClose,
  statusArr,
  onEdit,
  onDelete,
  onMarkDone,
}: TaskDetailDrawerProps) => {
  const statusName =
    statusArr?.find((s: any) => s._id === ele?.task_status_id)?.status_name ??
    ele?.status;

  const assigneeObj = ele?.assignee_id ?? ele?.assigned_to;
  const assigneeName = assigneeObj
    ? (assigneeObj.name ?? `${assigneeObj.first_name ?? ''} ${assigneeObj.last_name ?? ''}`.trim())
    : ele?.assignee_email ?? '';

  const customerName = ele?.account || ele?.customer_name || '';

  const hasMeta = customerName || statusName || assigneeName;

  return (
    <SideDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={ele?.title ?? 'Task details'}
      width="w-[560px]"
    >
      <div className="flex flex-col h-[calc(100vh-56px)]">
        {/* Metadata row */}
        {hasMeta && (
          <div className="px-6 py-4 flex items-center justify-between border-b border-[#E4E7EC] flex-shrink-0">
            <div className="flex items-center gap-2 text-[13px] flex-wrap">
              {customerName && (
                <span className="px-[8px] py-[3px] bg-[#F2F4F7] rounded text-[#344051]">
                  {customerName}
                </span>
              )}
              {statusName && customerName && (
                <span className="text-[#CED2DA]">|</span>
              )}
              {statusName && (
                <span className="px-[8px] py-[3px] bg-[#F2F4F7] rounded text-[#344051]">
                  {statusName}
                </span>
              )}
              {assigneeName && (statusName || customerName) && (
                <span className="text-[#CED2DA]">|</span>
              )}
              {assigneeName && (
                <span className="text-[#344051]">Assigned to {assigneeName}</span>
              )}
            </div>
            <div className="flex items-center gap-4 flex-shrink-0 ml-4">
              <button
                onClick={onEdit}
                className="text-[13px] font-medium text-[#637083] hover:text-[#344051] cursor-pointer"
              >
                Edit
              </button>
              <button
                onClick={onDelete}
                className="text-[13px] font-medium text-[#EF4444] hover:text-[#DC2626] cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        )}

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
          {/* From (project source) */}
          {ele?.project_id?.project_name && (
            <div className="flex items-center gap-2 text-[13px]">
              <span className="text-[#637083] font-medium w-[60px]">From</span>
              <span className="flex items-center gap-1 text-[#3B82F6]">
                <Link className="w-[13px] h-[13px]" />
                {ele.project_id.project_name}
              </span>
            </div>
          )}

          {/* Begins after (dependency) */}
          {ele?.depends_on?.title && (
            <div className="text-[13px] text-[#637083]">
              <span className="font-medium">Begins after:</span>{' '}
              {ele.depends_on.title}
            </div>
          )}

          {/* Description */}
          <div className="text-[14px] text-[#344051] leading-relaxed min-h-[120px]">
            {ele?.notes || ele?.description ? (
              <p className="whitespace-pre-wrap">{ele?.notes ?? ele?.description}</p>
            ) : (
              <span className="text-[#97A1AF]">No description added.</span>
            )}
          </div>
        </div>

        {/* Sticky footer */}
        <div className="border-t border-[#E4E7EC] px-6 py-4 flex flex-col gap-2 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-[13px] text-[#637083]">
              <span>Committed date</span>
              <div className="w-8 h-4 rounded-full bg-[#CED2DA]" />
              {ele?.planned_start_datetime && ele?.planned_end_datetime && (
                <span>
                  Started {dayjs(ele.planned_start_datetime).format('MMM DD')}{' '}
                  &mdash; End {dayjs(ele.planned_end_datetime).format('MMM DD')}
                </span>
              )}
            </div>
            <button
              onClick={onMarkDone}
              className="px-4 py-[6px] bg-[#22C55E] hover:bg-[#16A34A] text-white text-[13px] font-medium rounded-md cursor-pointer transition-colors"
            >
              Mark done
            </button>
          </div>
          <div className="flex items-center gap-4 text-[12px] text-[#97A1AF]">
            {ele?.updated_at && (
              <span>Last modified: {dayjs(ele.updated_at).format('DD-MMM-YY h:mmA')}</span>
            )}
            {ele?.created_at && (
              <span>Created by You on: {dayjs(ele.created_at).format('DD-MMM-YY h:mmA')}</span>
            )}
          </div>
        </div>
      </div>
    </SideDrawer>
  );
};

export default TaskDetailDrawer;
