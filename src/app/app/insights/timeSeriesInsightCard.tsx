import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import {
  CrossIcon,
  GrayDownArrow,
  GrayUpArrow,
  GreenCheckIcon,
} from '../../assests/icons/icons';
import { formatNumber } from '../../utils/formatNumber';

interface props {
  insight: any;
  selectedInsightCardId?: any;
  handleCardSelection?: any;
  type?: any;
  isDetail?: any;
  customer360?: boolean;
  isOnInsightDetailPage?: boolean;
  setCustomerAttributesModal?: (value: boolean) => void;
}
export default function TimeSeriesInsightCard({
  insight,
  selectedInsightCardId,
  handleCardSelection,
  type,
  isDetail,
  customer360,
  isOnInsightDetailPage,
  setCustomerAttributesModal,
}: props) {
  dayjs.extend(relativeTime);

  // Define your dates
  const actionDate = dayjs(insight?.alerted_at);

  // Calculate the relative time
  const difference = dayjs().to(dayjs(actionDate));

  return (
    <div
      className={
        selectedInsightCardId === insight?._id
          ? 'card !mb-0 shadow-none !border border-[#CED2DA] rounded-[12px] bg-white dark:bg-slate-400/20 dark:border-slate-600 !pt-[8px]'
          : `${
              type !== 'insigthDetails' && isDetail
                ? ' cursor-pointer card  !mb-0  shadow-none dark:bg-slate-400/20 dark:border-slate-600 !pt-[4px]'
                : type !== 'insigthDetails' && !isDetail
                ? ' cursor-pointer card  !mb-0  shadow-none dark:bg-slate-400/20 dark:border-slate-600 !border border-[#E4E7EC] rounded-[12px] bg-[#F2F4F7] !pt-[8px]'
                : ''
            } `
      }
      id={insight?.insight_id}
      key={insight?.insight_id}
      onClick={() => {
        if (type !== 'insigthDetails') {
          handleCardSelection(insight?._id);
        }
      }}
    >
      {isDetail ? (
        type !== 'insigthDetails' && !insight?.is_viewed ? (
          <span className="flex rounded-full w-2 h-2  bg-[#0EA5E9] relative top-[12px] right-3"></span>
        ) : type !== 'insigthDetails' &&
          insight?.action_status === 'completed' ? (
          <span className="flex rounded-full w-[20px] relative top-[14px] right-3.5">
            <GreenCheckIcon className="h- w-3 text-[#249782] font-bold" />
          </span>
        ) : type !== 'insigthDetails' && insight.action_statu === 'ignored' ? (
          <span className="flex rounded-full w-[20px] relative top-[14px] right-3.5">
            <CrossIcon className="h-2.5 w-3 text-[#E11D48] font-bold" />
          </span>
        ) : null
      ) : type !== 'insigthDetails' && !insight?.is_viewed ? (
        <span className="flex rounded-full w-2 h-2  bg-[#0EA5E9] relative top-[12px] left-4"></span>
      ) : type !== 'insigthDetails' &&
        insight?.action_status === 'completed' ? (
        <span className="flex rounded-full w-[20px] relative top-[14px] left-4">
          <GreenCheckIcon className="h- w-3 text-[#249782] font-bold" />
        </span>
      ) : type !== 'insigthDetails' && insight.action_statu === 'ignored' ? (
        <span className="flex rounded-full w-[20px] relative top-[14px] left-4">
          <CrossIcon className="h-2.5 w-3 text-[#E11D48] font-bold" />
        </span>
      ) : null}
      <div
        className={`card-body${
          !insight?.is_viewed ? '!pt-[4px] !pb-[12px]' : ''
        }  ${
          customer360
            ? '!pl-[0px] !pr-[0px] !pt-[0px] !pb-[12px]'
            : type === 'insigthDetails' || isDetail
            ? '!pl-[0px] !pr-[0px] !pt-[12px] !pb-[24px]'
            : '!pl-[32px] !pr-[12px] !pt-[0px] !pb-[12px]'
        } `}
      >
        <div className="dark:text-slate-200 flex justify-between items-center text-center">
          <div className="flex gap-2 text-[12px] text-gray-800 font-normal items-center text-start">
            <span>{insight?.customer_name}</span>
          </div>
          <div className="flex items-center">
            <div className="text-[12px] font-normal text-[#637083] pr-2">
              {difference}
            </div>
            {isOnInsightDetailPage && setCustomerAttributesModal && (
              <div
                className="text-[12px] font-normal text-[#202B37] leading-4 pl-3 border-l border-[#E4E7EC] cursor-pointer"
                onClick={() =>
                  setCustomerAttributesModal && setCustomerAttributesModal(true)
                }
              >
                Attributes
              </div>
            )}
          </div>
        </div>
        <div className="py-2">
          <span className={'text-[14px] text-[#202B37] font-normal'}>
            {insight?.metric_display_str ?? insight?.metric_name}
          </span>
        </div>
        <div className="flex items-center text-center gap-2 pb-3">
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

        <div className="flex gap-[10px]">
          <span
            className={
              insight?.status == 'green'
                ? 'px-2.5 py-0.5 text-xs inline-block font-normal rounded-[4px] bg-white border-green-200 text-green-text dark:bg-green-500/20 dark:border-green-500/20'
                : insight?.status == 'yellow'
                ? 'px-2.5 py-0.5 inline-block text-xs font-normal rounded-[4px] bg-white border border-[#EAB308] text-orange-text dark:bg-yellow-500/20 dark:border-transparent'
                : 'px-2.5 py-0.5 text-xs font-normal inline-block rounded-[4px] bg-white border transition-all duration-200 ease-linear !border-[#FCCFCF] border-transparent text-red-text'
            }
          >
            {' '}
            {insight?.insight_type}
          </span>
          <span
            className={
              insight?.status == 'green'
                ? 'px-2.5 py-0.5 text-xs inline-block font-normal rounded-[4px] bg-white border-green-200 text-green-text dark:bg-green-500/20 dark:border-green-500/20'
                : insight?.status == 'yellow'
                ? 'px-2.5 py-0.5 inline-block text-xs font-normal rounded-[4px] bg-white border border-[#EAB308] text-orange-text dark:bg-yellow-500/20 dark:border-transparent'
                : 'px-2.5 py-0.5 text-xs font-normal inline-block rounded-[4px] bg-white border transition-all duration-200 ease-linear !border-[#FCCFCF] border-transparent text-red-text'
            }
          >
            {insight?.insight_name}
          </span>
        </div>
      </div>
    </div>
  );
}
