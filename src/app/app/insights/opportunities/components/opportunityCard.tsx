import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { getCurrencySymbol } from '../../../../api/config/insight';
import { formatRevenue } from '../../../../../common/SupportFunctions';
import { CrossIcon, GreenCheckIcon } from '../../../../assests/icons/icons';

import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/light.css';
import { getTimeAgo } from '../../../../../common/SupportFunctions';

dayjs.extend(relativeTime);

export default function OpportunityCard({
    ele,
}: any) {

    const [targetClosureDate, setTargetClosureDate] = useState<any>('');
    const [opportunityValueString, setOpportunityValueString] = useState<any>('NA');
    const [title, setTitle] = useState('');

    const { data: currencySymbol } = useQuery({
        queryKey: ['getCurrencySymbol'],
        queryFn: () => getCurrencySymbol(),
        refetchOnWindowFocus: false,
    });

    useEffect(() => {
        setTitle(ele?.title || ele?.insight_name || '');
    }, [ele?.title, ele?.insight_name]);

    useEffect(() => {
        if ((ele?.insight_type)?.toLowerCase() === 'opportunity') {
            setTargetClosureDate(ele?.target_closure_date);
            setOpportunityValueString(
                typeof ele?.opportunity_value === 'number'
                    ? formatRevenue(ele?.opportunity_value)
                    : 'NA'
            );
        }
    }, [ele]);

    return (
        <div className="flex gap-0 w-full my-4 ml-2 mr-4">
            {/* Status indicator */}
            {!ele?.is_viewed ? (
                <span className="flex w-[32px] top-[10px] justify-around py-1"> <span className="rounded-full h-2 w-2 bg-[#0EA5E9]"></span></span>
            ) : ele?.action_status?.toLowerCase() === 'completed' ? (
                <span className="flex w-[32px] top-[10px] justify-around py-[2px]">
                    <GreenCheckIcon className="h-3 w-3 text-[#249782] font-bold" />
                </span>
            ) : ele?.action_status?.toLowerCase() === 'ignored' ? (
                <span className="flex w-[32px] top-[10px] justify-around py-[2px]">
                    <CrossIcon className="h-3 w-3 text-[#E11D48] font-bold" />
                </span>
            ) : (<span className="flex w-[32px] top-[10px] justify-around py-1"> <span className="rounded-full h-2 w-2"></span></span>)
            }

            {/* Card Body */}
            <div className="w-full">
                {/* Header with customer name and timestamp */}
                <div className="h-4 flex items-center justify-between">
                    <div className="text-[12px] text-[#202B37] font-normal flex items-center text-start gap-2">
                        {ele?.customer_name}
                    </div>
                    <div className="text-[12px] text-[#637083] font-normal flex items-center gap-2">
                        <div className="text-[12px] font-normal text-[#637083] w-fit">
                            Updated {getTimeAgo(ele?.updated_at)}
                        </div>
                        <span className='h-[10px] border-l border-[#E4E7EC]'></span>
                        <div className="h-4 w-fit flex items-center justify-center">
                            <Tippy
                                content={
                                    <div className="flex flex-col w-fit py-1">
                                        <span className="text-[12px] font-semibold text-[#FFFFFF] whitespace-nowrap">
                                            Created by{' '}{ele?.opportunity_created_by && ele?.opportunity_created_by.trim() !== ''
                                                ? `${ele.opportunity_created_by}`
                                                : 'AI Agent'
                                            }
                                        </span>
                                        <span className="text-[12px] font-semibold text-[#FFFFFF] whitespace-nowrap">on {' '}{ele?.created_at && dayjs(ele?.created_at).isValid() ? dayjs(ele?.created_at).format('MMM D, YYYY') : ''}</span>
                                        {ele?.assignee_user && (
                                            <span className="text-[12px] font-semibold text-[#FFFFFF] whitespace-nowrap">
                                                Assigned to{' '}{ele?.assignee_user ? ele?.assignee_user?.first_name + ' ' + ele?.assignee_user?.last_name : 'Unassigned'}
                                            </span>
                                        )}
                                    </div>
                                }
                                placement="top"
                                maxWidth={600}
                                arrow={true}
                                offset={[0, 8]}
                                interactive={false}
                                animation="scale"
                                duration={200}
                                theme="dark"
                                className="h-fit !rounded-[10px] flex justify-center items-center px-1"
                            >
                                {ele?.created_by ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="11" viewBox="0 0 12 13" fill="none">
                                        <path d="M1.33203 12.3333V11.6667C1.33203 9.82572 2.82442 8.33333 4.66536 8.33333H7.33203C9.17298 8.33333 10.6654 9.82572 10.6654 11.6667V12.3333M8.66536 3.66667C8.66536 5.13943 7.47146 6.33333 5.9987 6.33333C4.52594 6.33333 3.33203 5.13943 3.33203 3.66667C3.33203 2.19391 4.52594 1 5.9987 1C7.47146 1 8.66536 2.19391 8.66536 3.66667Z" stroke="#97A1AF" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 16 16" fill="none">
                                        <path d="M7.9987 1.33203L9.34 4.81942C9.52801 5.30824 9.62201 5.55265 9.7682 5.75824C9.89776 5.94044 10.057 6.09964 10.2392 6.2292C10.4447 6.37538 10.6892 6.46939 11.178 6.65739L14.6654 7.9987L11.178 9.34C10.6892 9.52801 10.4447 9.62201 10.2392 9.7682C10.057 9.89776 9.89776 10.057 9.7682 10.2392C9.62201 10.4447 9.52801 10.6892 9.34 11.178L7.9987 14.6654L6.65739 11.178C6.46939 10.6892 6.37538 10.4447 6.2292 10.2392C6.09964 10.057 5.94044 9.89776 5.75824 9.7682C5.55265 9.62201 5.30824 9.52801 4.81942 9.34L1.33203 7.9987L4.81942 6.65739C5.30824 6.46939 5.55265 6.37538 5.75824 6.2292C5.94044 6.09964 6.09964 5.94044 6.2292 5.75824C6.37538 5.55265 6.46939 5.30824 6.65739 4.81942L7.9987 1.33203Z" stroke="#97A1AF" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                )}
                            </Tippy>
                        </div>
                    </div>
                </div>

                {/* Title */}
                <div className="text-[#344051] text-[14px] text-[400] flex justify-between items-start group">
                    <span
                        className="py-3 break-words"
                        style={{ whiteSpace: 'pre-wrap' }}
                    >
                        {title || ele?.insight_name || 'Opportunity'}
                    </span>
                </div>

                {/* Opportunity Value and Target Closure Date */}
                {((opportunityValueString && opportunityValueString !== 'NA') || targetClosureDate || ele?.action_sub_status) && (
                    <div className="h-4 flex justify-start items-center gap-2 mb-2 text-[#97A1AF] text-[12px] text-[400]">
                        {opportunityValueString && opportunityValueString !== 'NA' && (
                            <span>
                                {currencySymbol?.data?.value || ""} {opportunityValueString}
                            </span>
                        )}

                        {targetClosureDate && dayjs(targetClosureDate).isValid() && (
                            <span
                                className={`${(opportunityValueString && opportunityValueString !== 'NA') ? "pl-2 relative before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-3 before:w-px before:bg-[#97A1AF]" : ""} text-center text-[400]`}
                            >
                                {dayjs(targetClosureDate).format("MMM DD, YYYY")}
                            </span>
                        )}
                        {ele?.action_sub_status && (
                            <span
                                className={`${targetClosureDate || (opportunityValueString && opportunityValueString !== 'NA') ? "pl-2 relative before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-3 before:w-px before:bg-[#97A1AF]" : ""} text-center max-w-[150px] truncate text-[400]`}
                            >
                                {ele?.action_sub_status}
                            </span>
                        )}
                    </div>
                )}

                {/* Tags - Insight Type and Insight Name */}
                <div className="h-6 flex w-[100%] justify-start items-center gap-[16px]">
                    <span
                        className={
                            ele?.status == 'green'
                                ? 'px-2.5 py-0.5 text-xs inline-block font-normal rounded-[4px] bg-white border border-green-200 text-green-text dark:bg-green-500/20 dark:border-green-500/20'
                                : ele?.status == 'yellow'
                                    ? 'px-2.5 py-0.5 inline-block text-xs font-normal rounded-[4px] bg-white border border-[#EAB308] text-orange-text dark:bg-yellow-500/20 dark:border-transparent'
                                    : 'px-2.5 py-0.5 text-xs font-normal inline-block rounded-[4px] bg-white border transition-all duration-200 ease-linear !border-[#FCCFCF] border-transparent text-red-text'
                        }
                    >
                        {ele?.insight_type}
                    </span>
                    {ele?.insight_name && (<span
                        className={
                            ele?.status == 'green'
                                ? 'px-2.5 py-0.5 text-xs inline-block font-normal rounded-[4px] bg-white border border-green-200 text-green-text dark:bg-green-500/20 dark:border-green-500/20 max-w-[150px] truncate hide-scrollbar'
                                : ele?.status == 'yellow'
                                    ? 'px-2.5 py-0.5 inline-block text-xs font-normal rounded-[4px] bg-white border border-[#EAB308] text-orange-text dark:bg-yellow-500/20 dark:border-transparent max-w-[150px] truncate hide-scrollbar'
                                    : 'px-2.5 py-0.5 text-xs font-normal inline-block rounded-[4px] bg-white border transition-all duration-200 ease-linear !border-[#FCCFCF] border-transparent text-red-text max-w-[150px] truncate hide-scrollbar'
                        }
                    >
                        {ele?.insight_name}
                    </span>)}
                </div>
            </div>
        </div>
    );
}
