import ReactMarkdown from 'react-markdown';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { getColorForExpressionAndIntensity, getExpressionSvgIcon } from '../../customers/[id]/journey/signalCard';
import { CustomerStarredFillIcon, CustomerStarredUnFilledIcon } from '../../../assests/icons/icons';

interface ItemProps {
    item: any;
    setDraggedItemData?: any;
}

export const PrioritySignalCard: React.FC<ItemProps> = ({
    item,
    setDraggedItemData,
}) => {
    dayjs.extend(relativeTime);
    return (
        <div className="flex justify-between gap-[20px] p-[20px] text-[#97A1AF] border-b border-[#F2F4F7] cursor-pointer"
        // draggable={true}
        // onDragStart={(e) => {
        //     setDraggedItemData({
        //         ref_type: 'insight',
        //         ref_id: insight?._id,
        //         title: insight?.metric_name,
        //     });
        // }}
        // onDragEnd={(e) => {
        //     setDraggedItemData(null);
        // }}
        >
            <div className="flex w-[138px] justify-start">
                {/* {item?.is_starred && ( */}
                <div className='w-fit flex-shrink-0'>
                    <span>
                        {item?.is_starred ? (<CustomerStarredFillIcon className="inline-block mr-1 mb-1 text-[#3B82F6]" />) : (<CustomerStarredUnFilledIcon className="inline-block mr-1 mb-1 opacity-0" />)}
                    </span>
                </div>
                {/* )} */}
                <div className="flex-1 min-w-0 flex flex-col justify-start gap-2">
                    <div
                        className="w-full text-[14px] text-[#202b37] truncate"
                        title={item?.customer_name}
                    >
                        {item?.customer_name}
                    </div>
                    <div className="text-[12px]">
                        {item?.segment?.segment_name ?? 'N/A'}
                    </div>
                </div>
            </div>
            {item?.collection_type === 'signal' ? (<div
                className="w-[355px] flex-1 min-w-0 overflow-hidden"
            >
                <ReactMarkdown
                    className="w-full text-[#202B37] text-[14px] font-normal mb-2
             [&>p]:truncate [&>p]:m-0"
                    components={{
                        p: ({ children }) => (
                            <p className="truncate m-0" title={typeof children === 'string' ? children : undefined}
                            >
                                {children}
                            </p>
                        )
                    }}
                >
                    {item?.title}
                </ReactMarkdown>
                {/* <div className='flex items-center justify-start mb-1 gap-2'> */}
                <div className='flex items-center justify-start gap-2'>
                    <div className='flex items-center justify-start gap-2'>
                        {item?.signal_types?.map((type: any, index: number) => {
                            const defaultColor = getColorForExpressionAndIntensity(type, item.intensity);
                            return (
                                <span
                                    key={index}
                                    className="flex items-center text-xs font-medium"
                                    style={{ color: defaultColor }}
                                >
                                    {getExpressionSvgIcon(type, defaultColor)}
                                    &nbsp;
                                    {/* here if the signal_type is fact then i want to show information */}
                                    {type === 'fact' ? 'Information' : type.replace('_', ' ').charAt(0).toUpperCase() + type.slice(1)}
                                </span>
                            );
                        })}
                    </div>
                    {item?.other_signals_count > 0 && (<div className='text-[#202B37] text-xs font-semibold'>
                        +&nbsp;{item?.other_signals_count} more
                    </div>)}
                </div>
            </div>) : (<div className="w-[355px] flex-1 min-w-0 flex flex-col overflow-hidden">
                <span className="w-full mb-[9px] text-[14px] text-[#202b37] font-normal truncate">
                    {item?.title || item?.insight_name}
                </span>
                <div className="flex gap-[10px]">
                    <span
                        className={
                            item?.status == 'green'
                                ? 'px-[10px] py-1 text-xs inline-block font-semibold rounded-[4px]  bg-green-light border-green-200 text-green-text dark:bg-green-500/20 dark:border-green-500/20'
                                : item?.status == 'yellow'
                                    ? 'px-[10px] py-1 inline-block text-xs font-semibold rounded-[4px]  bg-orange-light border-[#EAB308] text-orange-text dark:bg-yellow-500/20 dark:border-transparent'
                                    : 'px-[10px] py-1 text-xs font-semibold inline-block rounded-[4px] border transition-all duration-200 ease-linear bg-red-light border-transparent text-red-text hover:bg-red-200 dark:bg-red-400/20 dark:hover:bg-red-400/30 dark:border-transparent'
                        }
                    >
                        {item?.insight_type}
                    </span>
                    {item?.insight_name && (<span
                        className={
                            item?.status == 'green'
                                ? 'px-[10px] py-1 text-xs inline-block font-semibold rounded-[4px]  bg-green-light border-green-200 text-green-text dark:bg-green-500/20 dark:border-green-500/20'
                                : item?.status == 'yellow'
                                    ? 'px-[10px] py-1 inline-block text-xs font-semibold rounded-[4px]  bg-orange-light border-[#EAB308] text-orange-text dark:bg-yellow-500/20 dark:border-transparent'
                                    : 'px-[10px] py-1 text-xs font-semibold inline-block rounded-[4px] border transition-all duration-200 ease-linear bg-red-light border-transparent text-red-text hover:bg-red-200 dark:bg-red-400/20 dark:hover:bg-red-400/30 dark:border-transparent'
                        }
                    >
                        {item?.insight_name}
                    </span>)}
                </div>
            </div>)}
            <div className="w-[110px] text-[#637083] text-[14px] font-normal justify-start pl-1">
                {item?.collection_type === 'signal' ? dayjs().to(dayjs(item?.signal_created_at)) : dayjs().to(dayjs(item?.created_at))}
            </div>
        </div>
    );
};