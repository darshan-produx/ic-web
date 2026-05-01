import React, { useState } from 'react';
import Modal from '../../../../common/components/Modal';
import dayjs from 'dayjs';
import { useQuery } from '@tanstack/react-query';
import { getCustomerChurnStepsConfig } from '../../../../app/api/customers/customers';
import ReactMarkdown from 'react-markdown';

interface CustomerChurnModalProps {
    customerName: string;
    modalOpen: boolean;
    handleCancel: () => void;
    handleChurn: () => void;
}

const CustomerChurnModal: React.FC<CustomerChurnModalProps> = ({
    customerName,
    modalOpen,
    handleCancel,
    handleChurn,
}) => {
    const [isCompleted, setIsCompleted] = useState(false);

    const { data: customerChurnStepsConfig } = useQuery({
        queryKey: ['getCustomerChurnStepsConfig'],
        queryFn: () => getCustomerChurnStepsConfig(),
        refetchOnWindowFocus: false,
    });

    if (!modalOpen) return null;
    const handleChurnClick = () => {
        if (isCompleted) {
            handleChurn();
        }
    };

    return (
        <Modal
            show={modalOpen}
            onHide={handleCancel}
            id="customerChurnModal"
            className="fixed flex flex-col transition-all duration-300 ease-in-out left-2/4 z-drawer -translate-x-2/4 -translate-y-2/4 top-2/4"
            dialogClassName="w-screen md:w-[480px] pt-2 bg-white shadow rounded-lg dark:bg-zink-600 flex flex-col"
        >
            <Modal.Header
                className="flex items-center justify-between px-5 py-3"
                closeButtonClass="transition-all duration-200 ease-linear text-slate-500 hover:text-red-500 dark:text-zink-200 dark:hover:text-red-500"
            >
                <Modal.Title className="text-lg font-semibold text-slate-800">
                    Marking {customerName} as churned
                </Modal.Title>
            </Modal.Header>

            <Modal.Body className="px-5 py-2 overflow-y-auto">
                <div className="mb-4">
                    <p className="text-sm text-[#637083] text-[500] mb-3">
                        Steps to follow,
                    </p>
                    <ReactMarkdown
                        className="max-w-full"
                        components={{
                            ol: ({ children }) => (
                                <ol className="list-decimal pl-5">
                                    {children}
                                </ol>
                            ),
                            li: ({ children }) => (
                                <li className="text-[16px] text-[#202B37] font-normal leading-relaxed list-item">
                                    <div className="flex justify-start gap-1 truncate">{children}</div>
                                </li>
                            ),
                            p: ({ children }) => (
                                <p className="text-[16px] text-[#202B37] m-0 font-normal truncate">
                                    {children}
                                </p>
                            ),
                            a: ({ href, children }) => (
                                <div className="inline-block text-blue-600 truncate">
                                    <a
                                        href={href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-700 transition-colors duration-200"
                                        title={href}
                                    >
                                        {children}
                                    </a>
                                </div>
                            )
                        }}
                    >
                        {customerChurnStepsConfig?.data?.value}
                    </ReactMarkdown>
                </div>
            </Modal.Body>

            <Modal.Footer className="px-5 py-4 border-t border-slate-300 flex justify-between items-center">
                <div>
                    <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={isCompleted}
                            onChange={(e) => setIsCompleted(e.target.checked)}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-none"
                        />
                        <span className="text-[14px] text-[#202B37]">
                            I've completed churn process steps
                        </span>
                    </label>
                    <p className="text-sm text-[#637083] ml-7">
                        {`On the date: ${dayjs(new Date()).format('MMM D, YYYY')}`}
                    </p>
                </div>
                <div>
                    <button
                        type="button"
                        className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-none ${isCompleted
                            ? 'bg-red-500 hover:bg-red-600 focus:ring-none cursor-pointer'
                            : 'bg-red-300 cursor-not-allowed'
                            }`}
                        onClick={handleChurnClick}
                        disabled={!isCompleted}
                    >
                        Mark as churned
                    </button>
                </div>
            </Modal.Footer>
        </Modal>
    );
};

export default CustomerChurnModal;
