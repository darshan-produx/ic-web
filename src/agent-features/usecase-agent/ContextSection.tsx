'use client';
import { useQueryClient } from '@tanstack/react-query';
import React from 'react';

interface ContextSectionProps {
  activation_id: string;
  context: string;
  onContextChange: (value: string) => void;
  onBack: () => void;
  onSubmitWithContext: () => void;
  onSubmitWithoutContext: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export const ContextSection: React.FC<ContextSectionProps> = ({
  activation_id,
  context,
  onContextChange,
  onBack,
  onSubmitWithContext,
  onSubmitWithoutContext,
  disabled = false,
  placeholder = 'e.g. Reliance digital prefers...',
}) => {
  const queryClient = useQueryClient();
  const handleSubmitWithContext = () => {
    queryClient.removeQueries({
      queryKey: ['get-all-usecase-suggestions-status', activation_id],
    });
    onSubmitWithContext();
  };

  const handleSubmitWithoutContext = () => {
    queryClient.removeQueries({
      queryKey: ['get-all-usecase-suggestions-status', activation_id],
    });
    onSubmitWithoutContext();
  };
  return (
    <div className="mb-6 w-full max-w-[600px] mx-auto">
      <div className="w-[600px] min-h-[224px] rounded-[24px] border border-gray-200 p-[24px] bg-white/90 backdrop-blur-sm shadow-sm flex flex-col gap-[40px]">
        <div className="flex flex-col gap-3">
          <label className="block text-sm font-medium text-gray-700">
            Context
          </label>
          <textarea
            value={context}
            onChange={(e) => onContextChange(e.target.value)}
            disabled={disabled}
            placeholder={placeholder}
            className={`w-full h-[68px] px-4 py-3 border rounded-lg resize-none text-sm ${
              disabled
                ? 'border-[#CED2DA] text-gray-600 placeholder-gray-400 bg-[#F9FAFB] cursor-not-allowed'
                : 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 bg-white'
            }`}
          />
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className={`w-[53px] h-[32px] px-3 py-2 rounded-[6px] border transition-colors duration-200 font-medium text-sm shadow-sm flex items-center justify-center ${
              disabled
                ? 'bg-[#F2F4F7] text-[#98A2B3] border-[#E4E7EC]'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            Back
          </button>
          <div className="flex gap-3">
            <button
              onClick={handleSubmitWithoutContext}
              disabled={disabled}
              className={`min-w-[171px] h-[32px] px-3 py-2 rounded-[6px] border transition-colors duration-200 font-medium text-sm flex items-center justify-center whitespace-nowrap ${
                disabled
                  ? 'bg-[#F2F4F7] text-[#98A2B3] border-[#E4E7EC]'
                  : 'text-gray-700 bg-white border-gray-200 hover:bg-gray-50'
              }`}
            >
              Generate without context
            </button>
            <button
              onClick={handleSubmitWithContext}
              disabled={!context || !context.trim() || disabled}
              className={`px-3 py-2 h-[32px] rounded-[6px] font-medium text-[12px] transition-colors duration-200 flex items-center justify-center whitespace-nowrap ${
                context && context.trim() && !disabled
                  ? 'bg-[#3B82F6] text-white hover:bg-[#2563EB] shadow-lg'
                  : 'bg-[#CCE0FF] text-white cursor-not-allowed'
              }`}
            >
              Generate with context
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
