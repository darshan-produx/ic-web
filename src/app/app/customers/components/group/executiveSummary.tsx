'use client';

import React, { useState, useMemo, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { toast } from 'react-toastify';
import { useUpdateCustomerDescriptionCustomer360 } from '../../../../../services/mutations/customersMutations';
import AddUpdateForm from '../../../../../common/components/AddUpdateForm';

interface ExecutiveSummaryProps {
    id: string | string[] | number | undefined;
    customerDetailSynthesis: any;
    customerSuccessPlan: string;
}

export default function ExecutiveSummary({
    id,
    customerDetailSynthesis,
    customerSuccessPlan
}: ExecutiveSummaryProps) {
    const [isEditingNotes, setIsEditingNotes] = useState(false);

    const updateCustomerDescription = useUpdateCustomerDescriptionCustomer360();

    const accountSynthesis = useMemo(() => {
        const synthesisItems = customerDetailSynthesis?.data?.data?.filter(
            (ele: any) =>
                ele?.type?.toLowerCase() === 'customer' &&
                ele?.subtype?.toLowerCase() === 'customer'
        );
        return synthesisItems?.[0]?.synthesis || '';
    }, [customerDetailSynthesis]);

    const handleUpdateDescription = useCallback(async (description: string) => {
        try {
            const data = {
                id,
                description,
            };
            const res = await updateCustomerDescription.mutateAsync(data);
            if (res?.status === 200 || res?.status === 201) {
                toast.success('Account notes added successfully');
                setIsEditingNotes(false);
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Failed to update');
        }
    }, [id, updateCustomerDescription]);

    return (
        <div className="mt-[20px]">
            <div className="w-full max-w-[1200px] mx-auto flex flex-col gap-6">
                {/* Account Summary Section */}
                {accountSynthesis && (
                    <div>
                        <h4 className="text-[16px] font-medium text-[#141C24] mb-2">
                            Account summary
                        </h4>
                        <div className="bg-white rounded-[12px] border border-[#E4E7EC] p-6">
                            <div className="text-[#141C24] text-[14px] font-normal leading-6">
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    className={'markdown list-disc list-inside'}
                                >
                                    {accountSynthesis}
                                </ReactMarkdown>
                            </div>
                        </div>
                    </div>
                )}

                {/* Account Notes Section */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="text-[16px] font-medium text-[#141C24]">
                            Account notes
                        </h4>
                        {!isEditingNotes && (
                            <button
                                type="button"
                                className="text-[#202B37] font-semibold text-[14px] cursor-pointer hover:text-custom-500 transition-colors"
                                onClick={() => setIsEditingNotes(true)}
                            >
                                Edit
                            </button>
                        )}
                    </div>
                    <div className="bg-white rounded-[12px] border border-[#E4E7EC] p-4 overflow-hidden mb-2">
                        {isEditingNotes ? (
                            <AddUpdateForm
                                initialValue={customerSuccessPlan}
                                onCancel={() => setIsEditingNotes(false)}
                                onSave={handleUpdateDescription}
                                placeholder="Enter account notes"
                                // autoGrow
                                ariaLabel="Account notes editor"
                                fixedHeight='180px'
                            />
                        ) : (
                            <div className="text-[#141C24] text-[14px] font-normal leading-6">
                                {customerSuccessPlan ? (
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        className="markdown prose prose-sm max-w-none"
                                    >
                                        {customerSuccessPlan}
                                    </ReactMarkdown>
                                ) : (
                                    <p className="text-[#97A1AF] italic">No account notes available</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}