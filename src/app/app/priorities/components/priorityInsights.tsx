import dayjs from 'dayjs';
import React from 'react';
import relativeTime from 'dayjs/plugin/relativeTime';
import { formatNumber } from '../../../utils/formatNumber';
import { GrayDownArrow, GrayUpArrow } from '../../../assests/icons/icons';

interface props {
  insight: any;
  setDraggedItemData: any;
}
function PriorityInsights({ insight, setDraggedItemData }: props) {
  dayjs.extend(relativeTime);

  return insight?.insight_data_type === 'data' ? (
    <div
      className="flex justify-between gap-[10px] p-[20px] text-[#97A1AF] text-xs border-b border-[#F2F4F7] cursor-pointer"
    // draggable={true}
    // onDragStart={(e) => {
    //   setDraggedItemData({
    //     ref_type: 'insight',
    //     ref_id: insight?._id,
    //     title: insight?.metric_name,
    //   });
    // }}
    // onDragEnd={(e) => {
    //   setDraggedItemData(null);
    // }}
    >
      <div className="w-[128px] justify-start">
        <div className=" flex w-full flex-col">
          <div
            className="w-full mb-[8px] text-[12px] text-[#202b37] w-[200px] overflow-hidden text-nowrap text-ellipsis whitespace-nowrap"
            title={insight?.customer_name}
          >
            {insight?.customer_name}
          </div>
          <div className="flex gap-[10px]">
            {insight?.segment?.segment_name ?? ''}
          </div>
        </div>
      </div>
      <div className=" flex w-[350px] flex-col">
        <span className="w-full mb-[9px] text-[14px] text-[#202b37] font-normal truncate">
          {insight.metric_display_str ?? insight?.metric_name}
          <div className="flex items-center text-center gap-2">
            <span className="text-lg  font-semibold">
              {formatNumber(insight?.metric_value)}
            </span>
            <span className="flex text-sm text-gray-800">
              {Number.isFinite(insight?.metric_growth) ? (
                <>
                  {Math.round(insight.metric_growth * 10000) / 100}%{' '}
                  {insight?.metric_growth < 0 ? (
                    <GrayDownArrow className="mt-[2px]" />
                  ) : insight?.metric_growth > 0 ? (
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
              insight?.status == 'green'
                ? 'px-[10px] py-1 text-xs inline-block font-semibold rounded-[4px]  bg-green-light border-green-200 text-green-text dark:bg-green-500/20 dark:border-green-500/20'
                : insight?.status == 'yellow'
                  ? 'px-[10px] py-1 inline-block text-xs font-semibold rounded-[4px]  bg-orange-light border-[#EAB308] text-orange-text dark:bg-yellow-500/20 dark:border-transparent'
                  : 'px-[10px] py-1 text-xs font-semibold inline-block rounded-[4px] border transition-all duration-200 ease-linear bg-red-light border-transparent text-red-text hover:bg-red-200 dark:bg-red-400/20 dark:hover:bg-red-400/30 dark:border-transparent'
            }
          >
            {insight?.insight_type}
          </span>
          {insight?.insight_name && (<span
            className={
              insight?.status == 'green'
                ? 'px-[10px] py-1 text-xs inline-block font-semibold rounded-[4px]  bg-green-light border-green-200 text-green-text dark:bg-green-500/20 dark:border-green-500/20'
                : insight?.status == 'yellow'
                  ? 'px-[10px] py-1 inline-block text-xs font-semibold rounded-[4px]  bg-orange-light border-[#EAB308] text-orange-text dark:bg-yellow-500/20 dark:border-transparent'
                  : 'px-[10px] py-1 text-xs font-semibold inline-block rounded-[4px] border transition-all duration-200 ease-linear bg-red-light border-transparent text-red-text hover:bg-red-200 dark:bg-red-400/20 dark:hover:bg-red-400/30 dark:border-transparent'
            }
          >
            {insight?.insight_name}
          </span>)}
        </div>
      </div>

      <div className="w-[95px] text-[#637083] justify-start pl-1">
        {insight?.alerted_at && dayjs().to(dayjs(insight?.alerted_at))}
      </div>
    </div>
  ) : (
    <div
      className="flex justify-between gap-[10px] p-[20px] text-[#97A1AF] text-[14px] border-b border-[#F2F4F7] cursor-pointer"
    // draggable={true}
    // onDragStart={(e) => {
    //   setDraggedItemData({
    //     ref_type: 'insight',
    //     ref_id: insight?._id,
    //     title: insight?.title ?? insight?.insight_name,
    //   });
    // }}
    // onDragEnd={(e) => {
    //   setDraggedItemData(null);
    // }}
    >
      <div className="w-[128px] justify-start">
        <div className=" flex w-full flex-col justify-start gap-2">
          <div
            className="w-full text-[#202b37] truncate"
            title={insight?.customer_name}
          >
            {insight?.customer_name}
          </div>
          <div className="flex gap-[10px] text-[12px]">
            {insight?.segment?.segment_name ?? ''}
          </div>
        </div>
      </div>
      <div className=" flex w-[350px] flex-col">
        <span className="w-full mb-[9px] text-[14px] text-[#202b37] font-normal truncate">
          {insight?.title ?? insight.insight_name}fufyejdhfdrukjghigkuyergkudrygherimtyrhtierhdytro8trkydh
        </span>
        <div className="flex gap-[10px]">
          <span
            className={
              insight?.status == 'green'
                ? 'px-[10px] py-1 text-xs inline-block font-semibold rounded-[4px]  bg-green-light border-green-200 text-green-text dark:bg-green-500/20 dark:border-green-500/20'
                : insight?.status == 'yellow'
                  ? 'px-[10px] py-1 inline-block text-xs font-semibold rounded-[4px]  bg-orange-light border-[#EAB308] text-orange-text dark:bg-yellow-500/20 dark:border-transparent'
                  : 'px-[10px] py-1 text-xs font-semibold inline-block rounded-[4px] border transition-all duration-200 ease-linear bg-red-light border-transparent text-red-text hover:bg-red-200 dark:bg-red-400/20 dark:hover:bg-red-400/30 dark:border-transparent'
            }
          >
            {insight?.insight_type}
          </span>
          <span
            className={
              insight?.status == 'green'
                ? 'px-[10px] py-1 text-xs inline-block font-semibold rounded-[4px]  bg-green-light border-green-200 text-green-text dark:bg-green-500/20 dark:border-green-500/20'
                : insight?.status == 'yellow'
                  ? 'px-[10px] py-1 inline-block text-xs font-semibold rounded-[4px]  bg-orange-light border-[#EAB308] text-orange-text dark:bg-yellow-500/20 dark:border-transparent'
                  : 'px-[10px] py-1 text-xs font-semibold inline-block rounded-[4px] border transition-all duration-200 ease-linear bg-red-light border-transparent text-red-text hover:bg-red-200 dark:bg-red-400/20 dark:hover:bg-red-400/30 dark:border-transparent'
            }
          >
            {insight?.insight_name}
          </span>
        </div>
      </div>

      <div className="w-[95px] text-[#637083] justify-start pl-1">
        {insight?.alerted_at && dayjs().to(dayjs(insight?.alerted_at))}
      </div>
    </div>
  );
}
export default PriorityInsights;
