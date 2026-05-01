'use client';

import React, { useState, useEffect } from 'react';
import Modal from '../../../../../common/components/Modal';
import GenericFlatpickr from '../../../../../common/components/Flatpickr';
import SingleSelectDropDown from '../../../../../common/components/SingleSelectDropDown';
import { getCustomerPhases } from '../../../../../app/api/customers/customers';
import { useCreatePhaseChange } from '../../../../../services/mutations/customersMutations';
import { toast } from 'react-toastify';

interface PhaseChangeModalProps {
    show: boolean;
    onHide: () => void;
    customerId: number;
    currentPhase?: string;
    onSuccess?: () => void;
}

interface Phase {
    id: string;
    name: string;
    value: string;
    selected?: boolean;
}

interface FormData {
    phase: Phase | null;
    changeTime: Date | null;
    description: string;
}

const PhaseChangeModal: React.FC<PhaseChangeModalProps> = ({
    show,
    onHide,
    customerId,
    currentPhase = 'Adoption',
    // onSuccess
}) => {
    const [phases, setPhases] = useState<Phase[]>([]);
    const [formData, setFormData] = useState<FormData>({
        phase: null,
        changeTime: null,
        description: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const createPhaseChangeMutation = useCreatePhaseChange();

    // Fetch phases on component mount
    useEffect(() => {
        const fetchPhases = async () => {
            try {
                const response = await getCustomerPhases();
                if (response?.data?.value) {
                    // Transform the phase array to match the expected format
                    const transformedPhases = response.data.value.map((phase: string, index: number) => ({
                        id: index.toString(),
                        name: phase,
                        value: phase,
                        selected: phase === currentPhase
                    }));
                    setPhases(transformedPhases);

                    // Set default selection to current phase
                    const currentPhaseObj = transformedPhases.find((phase: Phase) => phase.value === currentPhase);
                    if (currentPhaseObj) {
                        setFormData(prev => ({ ...prev, phase: currentPhaseObj }));
                    }
                }
            } catch (error) {
                toast.error('Error fetching phases');
            }
        };

        if (show) {
            fetchPhases();
        }
    }, [show, currentPhase]);

    // Reset form when modal opens
    useEffect(() => {
        if (show) {
            setFormData({
                phase: null,
                changeTime: new Date(),
                description: ''
            });
            setErrors({});
        }
    }, [show]);

    const handlePhaseSelection = (selectedPhase: Phase) => {
        setFormData(prev => ({ ...prev, phase: selectedPhase }));
        setPhases(prevPhases => prevPhases.map(phase => ({
            ...phase,
            selected: phase.value === selectedPhase.value
        })));
        if (errors.phase) {
            setErrors(prev => ({ ...prev, phase: '' }));
        }
    };

    const handleDateTimeChange = (date: Date | null) => {
        setFormData(prev => ({ ...prev, changeTime: date }));
        if (errors.changeTime) {
            setErrors(prev => ({ ...prev, changeTime: '' }));
        }
    };

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setFormData(prev => ({ ...prev, description: value }));
    };

    const validateForm = (): boolean => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.phase) {
            newErrors.phase = 'Phase selection is required';
        }

        if (!formData.changeTime) {
            newErrors.changeTime = 'Change time is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const isFormValid = (): boolean => {
        return !!(formData.phase && formData.changeTime && formData.description.trim());
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await createPhaseChangeMutation.mutateAsync({
                data: {
                    title: `Phase changed from **${currentPhase || 'no phase'}** to **${formData.phase?.value}**`,
                    description: formData.description,
                    datetimestamp: formData.changeTime?.toISOString(),
                    source: 'manual',
                    current_phase: formData.phase?.value,
                    previous_phase: currentPhase,
                    customer_id: customerId,
                }
            });

            // Show success message
            if (response?.status === 200 || response?.status === 201) {
                toast.success(`Phase successfully changed to ${formData.phase?.name}`);
            }
            onHide();
        } catch (error: any) {
            // Show error message with appropriate message
            const errorMessage = error?.response?.data?.message ||
                error?.message ||
                'Failed to change phase. Please try again.';
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        onHide();
    };

    return (
        <Modal
            show={show}
            onHide={onHide}
            className="fixed flex flex-col transition-all duration-300 ease-in-out left-2/4 z-drawer -translate-x-2/4 -translate-y-2/4 top-2/4"
            dialogClassName="w-[550px] bg-white shadow-lg rounded-lg dark:bg-zink-600"
        >
            {/* Header without border */}
            <div className="flex items-center justify-between p-6 pb-4">
                <h2 className="text-lg font-medium text-[#202B37]">
                    Current Phase: {currentPhase}
                </h2>
                <button
                    onClick={onHide}
                    className="text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition ease-in-out duration-150"
                    type="button"
                >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="#000000">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Body without top border/padding */}
            <Modal.Body className="px-6 pb-5">
                <div className="box-border h-[192px]">
                    {/* Phase Selection and Change Time - Side by Side */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        {/* Phase Selection */}
                        <div>
                            <label className="block text-[14px] font-medium text-[#344051] mb-[6px]">
                                New phase*
                            </label>
                            <div className="">
                                <SingleSelectDropDown
                                    filteredArr={phases}
                                    dataFieldToUseForSelection="value"
                                    typeOfData={formData.phase?.name || currentPhase || 'Select phase'}
                                    handleSelection={handlePhaseSelection}
                                    triggerTextCss="h-8 text-[14px] text-[#141C24] border border-[#E4E7EC]"
                                    contentCss="w-full min-w-[180px] max-h-[180px] z-[10000] top-[-9px]"
                                />
                            </div>
                            {errors.phase && (
                                <p className="text-red-500 text-xs mt-1">{errors.phase}</p>
                            )}
                        </div>

                        {/* Date and Time Selection */}
                        <div>
                            <label className="block text-[14px] font-medium text-[#344051] mb-[6px]">
                                Change time*
                            </label>
                            <div className="w-full h-8 flex items-center justify-start border border-[#E4E7EC] rounded-[6px] box-border ">
                                <GenericFlatpickr
                                    value={formData.changeTime}
                                    onChange={handleDateTimeChange}
                                    placeholder="Select date and time"
                                    dateFormat="M d, Y, h:i K"
                                    enableTime={true}
                                    className="w-full px-0 pl-[32px] py-2 text-[#141C24] text-[14px]"
                                    showCalendarIcon={true}
                                    showClearIcon={false}
                                />
                            </div>
                            {errors.changeTime && (
                                <p className="text-red-500 text-xs mt-1">{errors.changeTime}</p>
                            )}
                        </div>
                    </div>

                    {/* Description - Full Width */}
                    <div className='box-border'>
                        <label className="block text-[14px] font-medium text-[#344051] mb-[6px]">
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={handleDescriptionChange}
                            placeholder="Add description"
                            rows={3}
                            className="w-full m-0 px-2 py-2 pl-3 border border-gray-200 rounded-[8px] resize-none focus:outline-none text-[16px] placeholder-[#637083] overflow-y-auto scroll box-border"
                        />
                        {errors.description && (
                            <p className="text-red-500 text-xs mt-1">{errors.description}</p>
                        )}
                    </div>
                </div>

                {/* Footer buttons */}
                <div className="flex justify-end gap-4 mt-6">
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="px-4 py-2 text-sm font-medium text-[#202B37] bg-white border border-[#E4E7EC] rounded-lg focus:outline-none box-border"
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={!isFormValid() || isSubmitting}
                        className={`px-3 py-2 text-sm font-medium text-white rounded-lg focus:outline-none  ${isFormValid() && !isSubmitting
                            ? 'bg-blue-600 hover:bg-blue-700'
                            : 'bg-[#CCE0FF] cursor-not-allowed'
                            } box-border`}
                    >
                        {isSubmitting ? 'Adding...' : 'Add'}
                    </button>
                </div>
            </Modal.Body>


        </Modal>
    );
};

export default PhaseChangeModal;