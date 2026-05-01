import {
  GrayDownArrow,
  GrayUpArrow,
} from '../../../../../app/assests/icons/icons';
import { formatNumber } from '../../../../../app/utils/formatNumber';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { X } from 'lucide-react';

export default function MeetingInsights({
  insight,
  deleteInsight,
  insightData,
  setInsightMeetingModalOpen,
}: any) {
  dayjs.extend(relativeTime);
  return insight?.insight_data?.insight_data_type === 'data' ? (
    <div
      className="flex justify-between gap-[10px] p-[20px] text-[#97A1AF] text-xs border-b border-[#F2F4F7] cursor-pointer"
      // draggable={true}
      // onDragStart={(e) => {
      //   setDraggedItemData({
      //     ref_type: 'insight',
      //     ref_id: insight?.insight_data?._id,
      //     title: insight?.insight_data?.metric_name,
      //   });
      // }}
      // onDragEnd={(e) => {
      //   setDraggedItemData(null);
      // }}
      onClick={() =>
        setInsightMeetingModalOpen({ insight: insightData, status: true })
      }
    >
      <div className=" flex w-[305px]  flex-col">
        <span className="mb-[9px] text-[14px] text-[#202b37] font-normal">
          {insight.metric_display_str ?? insight?.insight_data?.metric_name}
          <div className="flex items-center text-center gap-2">
            <span className="text-lg  font-semibold">
              {formatNumber(insight?.insight_data?.metric_value)}
            </span>
            <span className="flex text-sm text-gray-800">
              {Number.isFinite(insight?.insight_data?.metric_growth) ? (
                <>
                  {Math.round(insight.metric_growth * 10000) / 100}%{' '}
                  {insight?.insight_data?.metric_growth < 0 ? (
                    <GrayDownArrow className="mt-[2px]" />
                  ) : insight?.insight_data?.metric_growth > 0 ? (
                    <GrayUpArrow className="mt-[2px]" />
                  ) : null}
                </>
              ) : null}
            </span>
          </div>
        </span>
        <div className="flex  gap-[10px]">
          <span
            className={
              insight?.insight_data?.status == 'green'
                ? 'px-[10px] py-1 text-xs inline-block font-semibold rounded-[4px]  bg-green-light border-green-200 text-green-text dark:bg-green-500/20 dark:border-green-500/20'
                : insight?.insight_data?.status == 'yellow'
                ? 'px-[10px] py-1 inline-block text-xs font-semibold rounded-[4px]  bg-orange-light border-[#EAB308] text-orange-text dark:bg-yellow-500/20 dark:border-transparent'
                : 'px-[10px] py-1 text-xs font-semibold inline-block rounded-[4px] border transition-all duration-200 ease-linear bg-red-light border-transparent text-red-text hover:bg-red-200 dark:bg-red-400/20 dark:hover:bg-red-400/30 dark:border-transparent'
            }
          >
            {insight?.insight_data?.insight_type}
          </span>
          <span
            className={
              insight?.insight_data?.status == 'green'
                ? 'px-[10px] py-1 text-xs inline-block font-semibold rounded-[4px]  bg-green-light border-green-200 text-green-text dark:bg-green-500/20 dark:border-green-500/20'
                : insight?.insight_data?.status == 'yellow'
                ? 'px-[10px] py-1 inline-block text-xs font-semibold rounded-[4px]  bg-orange-light border-[#EAB308] text-orange-text dark:bg-yellow-500/20 dark:border-transparent'
                : 'px-[10px] py-1 text-xs font-semibold inline-block rounded-[4px] border transition-all duration-200 ease-linear bg-red-light border-transparent text-red-text hover:bg-red-200 dark:bg-red-400/20 dark:hover:bg-red-400/30 dark:border-transparent'
            }
          >
            {insight?.insight_data?.insight_name}
          </span>
        </div>
      </div>
      <div className="w-[128px] pl-[12px] justify-start">
        <div className=" flex w-[330px]  flex-col">
          <span className="mb-[8px] text-[12px] text-[#202b37]">
            {insight?.insight_data?.customer_name}
          </span>
          <div className="flex gap-[10px]">
            {insight?.insight_data?.customer_type?.type_name}
          </div>
        </div>
      </div>
      <div className="w-[93px] text-[#637083] justify-start">
        {insight?.insight_data?.alerted_at &&
          dayjs().to(dayjs(insight?.insight_data?.alerted_at))}
      </div>
    </div>
  ) : (
    <div
      className="flex justify-between gap-[10px] p-[20px] text-[#97A1AF] text-xs border-b border-[#F2F4F7] cursor-pointer"
      // draggable={true}
      // onDragStart={(e) => {
      //   setDraggedItemData({
      //     ref_type: 'insight',
      //     ref_id: insight?.insight_data?._id,
      //     title: insight?.title ?? insight?.insight_name,
      //   });
      // }}
      // onDragEnd={(e) => {
      //   setDraggedItemData(null);
      // }}
      onClick={() =>
        setInsightMeetingModalOpen({
          insight: insight?.insight_data,
          status: true,
        })
      }
    >
      <div className=" flex w-full  flex-col">
        <span className="mb-[9px] text-[14px] text-[#202b37] font-normal">
          {insight?.insight_data?.title ?? insight?.insight_data?.insight_name}
        </span>
        <div className="flex  gap-[10px]">
          <span
            className={
              insight?.insight_data?.status == 'green'
                ? 'px-[10px] py-1 text-xs inline-block font-semibold rounded-[4px]  bg-green-light border-green-200 text-green-text dark:bg-green-500/20 dark:border-green-500/20'
                : insight?.status == 'yellow'
                ? 'px-[10px] py-1 inline-block text-xs font-semibold rounded-[4px]  bg-orange-light border-[#EAB308] text-orange-text dark:bg-yellow-500/20 dark:border-transparent'
                : 'px-[10px] py-1 text-xs font-semibold inline-block rounded-[4px] border transition-all duration-200 ease-linear bg-red-light border-transparent text-red-text hover:bg-red-200 dark:bg-red-400/20 dark:hover:bg-red-400/30 dark:border-transparent'
            }
          >
            {insight?.insight_data?.insight_type}
          </span>
          <span
            className={
              insight?.insight_data?.status == 'green'
                ? 'px-[10px] py-1 text-xs inline-block font-semibold rounded-[4px]  bg-green-light border-green-200 text-green-text dark:bg-green-500/20 dark:border-green-500/20'
                : insight?.insight_data?.status == 'yellow'
                ? 'px-[10px] py-1 inline-block text-xs font-semibold rounded-[4px]  bg-orange-light border-[#EAB308] text-orange-text dark:bg-yellow-500/20 dark:border-transparent'
                : 'px-[10px] py-1 text-xs font-semibold inline-block rounded-[4px] border transition-all duration-200 ease-linear bg-red-light border-transparent text-red-text hover:bg-red-200 dark:bg-red-400/20 dark:hover:bg-red-400/30 dark:border-transparent'
            }
          >
            {insight?.insight_data?.insight_name}
          </span>
        </div>
      </div>
      <div className="w-[128px] pl-[12px] justify-start">
        <div className=" flex w-[330px]  flex-col">
          {/* <span className="mb-[8px] text-[12px] text-[#202b37]">
                    {insight?.insight_data?.customer_name}
                  </span> */}
          <div className="flex gap-[10px]">
            {insight?.insight_data?.customer_type?.type_name}
          </div>
        </div>
      </div>
      {/* <div className="w-[93px] text-[#637083] justify-start pl-2">
                {insight.insight_data.alerted_at &&
                  dayjs()?.to(dayjs(insight?.insight_data?.alerted_at))}
              </div> */}
      <div className="w-[93px] text-[#637083] flex justify-end pl-2">
        <span
          className="cusor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            deleteInsight(insight?._id, 'Ignored');
          }}
        >
          <X size={20} />
        </span>
      </div>
    </div>
  );
}
