import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { CrossIcon, GreenCheckIcon } from '../../assests/icons/icons';
export default function TaskInsightCrad({
  insight,
  selectedInsightCardId,
  handleCardSelection,
  type,
  isDetail,
  customer360,
  isOnInsightDetailPage,
  setCustomerAttributesModal,
}: any) {
  dayjs.extend(relativeTime);

  // Define your dates
  const actionDate = dayjs(insight?.alerted_at);

  // Calculate the relative time
  const difference = dayjs().to(dayjs(actionDate));

  return (
    <div>
      <div
        className={
          selectedInsightCardId === insight?._id
            ? ' card  !mb-0  shadow-none !border border-[#CED2DA] rounded-[12px] bg-white dark:bg-slate-400/20 dark:border-slate-600'
            : `${
                type !== 'insigthDetails' && isDetail
                  ? ' cursor-pointer card  !mb-0  shadow-none dark:bg-slate-400/20 dark:border-slate-600'
                  : type !== 'insigthDetails' && !isDetail
                  ? ' cursor-pointer card  !mb-0  shadow-none dark:bg-slate-400/20 dark:border-slate-600 !border border-[#E4E7EC] rounded-[12px] bg-[#F2F4F7]'
                  : ''
              } `
        }
        onClick={() => {
          if (type !== 'insigthDetails') {
            handleCardSelection(insight?._id);
          }
        }}
      >
        {isDetail ? (
          !insight?.is_viewed ? (
            <span className="flex rounded-full h-2 w-2 bg-[#0EA5E9] relative top-[16px] right-3"></span>
          ) : insight?.action_status === 'completed' ? (
            <span className="flex relative w-[20px] top-[16px] right-4">
              <GreenCheckIcon className="h- w-3 text-[#249782] font-bold" />
            </span>
          ) : insight.action_status === 'ignored' ? (
            <span className="flex  relative w-[20px] top-[16px] right-4">
              <CrossIcon className="h-2.5 w-3 text-[#E11D48] font-bold" />
            </span>
          ) : insight.action_status !== 'ignored' &&
            insight?.action_status !== 'completed' ? (
            <span className="flex  relative w-[20px] top-[16px] right-4 opacity-0">
              <CrossIcon className="h-2.5 w-3 text-[#E11D48] font-bold" />
            </span>
          ) : null
        ) : type !== 'insigthDetails' && !insight?.is_viewed ? (
          <span className="flex rounded-full h-2 w-2 bg-[#0EA5E9] relative top-[16px] left-4"></span>
        ) : type !== 'insigthDetails' &&
          insight?.action_status === 'completed' ? (
          <span className="flex relative w-[20px] top-[14px] left-4">
            <GreenCheckIcon className="h- w-3 text-[#249782] font-bold" />
          </span>
        ) : type !== 'insigthDetails' && insight.action_status === 'ignored' ? (
          <span className="flex  relative w-[20px] top-[14px] left-4">
            <CrossIcon className="h-2.5 w-3 text-[#E11D48] font-bold" />
          </span>
        ) : type !== 'insigthDetails' &&
          insight.action_status !== 'ignored' &&
          insight?.action_status !== 'completed' ? (
          <span className="flex  relative w-[20px] top-[14px] left-4 opacity-0">
            <CrossIcon className="h-2.5 w-3 text-[#E11D48] font-bold" />
          </span>
        ) : null}
        <div
          className={`card-body ${
            !insight?.is_viewed ? '!pt-[4px] !pb-[12px]' : ''
          }  ${
            customer360
              ? '!pl-[0px] !pr-[0px] !pt-[0px] !pb-[12px]'
              : type === 'insigthDetails' || isDetail
              ? '!pl-[0px] !pr-[0px] !pt-[12px] !pb-[24px]'
              : '!pl-[32px] !pr-[12px] !pt-[0px] !pb-[12px]'
          } `}
        >
          <div className="dark:text-slate-200 flex justify-between">
            <div className="text-[12px] text-gray-950 font-normal flex items-center text-start">
              {insight?.customer_name}
            </div>
            <div className="flex items-center">
              <div className="text-[12px] font-normal text-[#637083] pr-2">
                {difference}
              </div>
              {isOnInsightDetailPage && setCustomerAttributesModal && (
                <div
                  className="text-[12px] font-normal text-[#202B37] leading-4 pl-3 border-l border-[#E4E7EC] cursor-pointer"
                  onClick={() =>
                    setCustomerAttributesModal &&
                    setCustomerAttributesModal(true)
                  }
                >
                  Attributes
                </div>
              )}
            </div>
          </div>
          <div className="py-2 text-[14px] text-gray-700 font-[500]">
            {insight?.title ?? insight.insight_name}
          </div>

          <div className="flex gap-[10px]">
            <span
              className={
                insight?.status == 'green'
                  ? 'px-2.5 py-0.5 text-xs inline-block font-normal rounded-[4px] bg-white border-green-200 text-green-text dark:bg-green-500/20 dark:border-green-500/20'
                  : insight?.status == 'yellow'
                  ? 'px-2.5 py-0.5 inline-block text-xs font-normal rounded-[4px] bg-white border-[#EAB308] text-orange-text dark:bg-yellow-500/20 dark:border-transparent'
                  : 'px-2.5 py-0.5 text-xs font-normal inline-block rounded-[4px] bg-white border transition-all duration-200 ease-linear !border-[#FCCFCF] border-transparent text-red-text'
              }
            >
              {insight?.insight_type}
            </span>
            <span
              className={
                insight?.status == 'green'
                  ? 'px-2.5 py-0.5 text-xs inline-block font-normal rounded-[4px] bg-white border-green-200 text-green-text dark:bg-green-500/20 dark:border-green-500/20'
                  : insight?.status == 'yellow'
                  ? 'px-2.5 py-0.5 inline-block text-xs font-normal rounded-[4px] bg-white border-[#EAB308] text-orange-text dark:bg-yellow-500/20 dark:border-transparent'
                  : 'px-2.5 py-0.5 text-xs font-normal inline-block rounded-[4px] bg-white border transition-all duration-200 ease-linear !border-[#FCCFCF] border-transparent text-red-text'
              }
            >
              {insight?.insight_name}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
