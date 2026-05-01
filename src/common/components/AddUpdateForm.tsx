import React, { useState, useEffect, useRef, useCallback } from 'react';
import ButtonLoader from './buttonloader';

interface AddUpdateFormProps {
  /** Initial value for edit mode, undefined for create mode */
  initialValue?: string;
  /** Callback when save/create is triggered. For create mode, generates unique ID automatically */
  onSave: (value: string, id?: string) => Promise<void> | void;
  /** Callback when cancel is triggered */
  onCancel?: () => void;
  /** Text for the submit button. Defaults to 'Create' if no initialValue, 'Update' otherwise */
  submitButtonText?: string;
  /** Placeholder text for the textarea */
  placeholder?: string;
  /** Number of rows for the textarea (only used when autoGrow is false) */
  rows?: number;
  /** Whether the textarea should auto-grow with content */
  autoGrow?: boolean;
  /** Fixed height for textarea when not using autoGrow (e.g., "200px") */
  fixedHeight?: string;
  /** Additional CSS classes for the container */
  className?: string;
  /** ARIA label for the textarea */
  ariaLabel?: string;
  /** Width of the textarea container */
  width?: string;
  /** When true, button is enabled if there's content, even if unchanged from initialValue */
  enableWithInitialValue?: boolean;
}

const AddUpdateForm: React.FC<AddUpdateFormProps> = ({
  initialValue,
  onSave,
  onCancel,
  submitButtonText,
  placeholder = 'Enter description',
  rows = 4,
  autoGrow = false,
  fixedHeight,
  className = '',
  ariaLabel = 'Description editor',
  width = 'w-full',
  enableWithInitialValue = false,
}) => {
  const [localValue, setLocalValue] = useState(initialValue ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Determine if this is create or update mode
  const isCreateMode = initialValue === undefined;
  const defaultButtonText = isCreateMode ? 'Create' : 'Update';
  const buttonText = submitButtonText ?? defaultButtonText;

  // Check if content has changed (for update mode) or if there's content (for create mode)
  // When enableWithInitialValue is true, button is enabled if there's any content
  const hasChanges = isCreateMode || enableWithInitialValue
    ? localValue.trim().length > 0
    : localValue.trim() !== (initialValue ?? '').trim();

  // Button should be disabled if no changes or if saving
  const isButtonDisabled = !hasChanges || isSaving;

  useEffect(() => {
    setLocalValue(initialValue ?? '');
  }, [initialValue]);

  useEffect(() => {
    // Focus textarea when mounted and place cursor at the end of text
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        // Move cursor to the end of the text
        const length = textareaRef.current.value.length;
        textareaRef.current.setSelectionRange(length, length);
      }
    }, 0);
  }, []);

  useEffect(() => {
    // Auto-grow textarea if enabled
    if (autoGrow && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [localValue, autoGrow]);

  const handleSave = useCallback(async () => {
    if (!hasChanges) return;

    setIsSaving(true);
    try {
      if (isCreateMode) {
        // const uniqueId = generateUniqueId();
        await onSave(localValue.trim());
      } else {
        await onSave(localValue.trim());
      }
    } finally {
      setIsSaving(false);
    }
  }, [localValue, onSave, hasChanges, isCreateMode]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onCancel?.();
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (!isButtonDisabled) {
        void handleSave();
      }
    }
  };

  const textareaStyles: React.CSSProperties = {
    whiteSpace: 'pre-wrap',
    ...(fixedHeight && !autoGrow ? { height: fixedHeight } : {}),
  };

  const textareaClasses = `rounded-[8px] mb-3 p-[6px] ${width} outline-none border-[1px] border-gray-300 ${autoGrow ? 'resize-none' : fixedHeight ? 'resize-none overflow-y-auto scroll' : 'resize-none hide-scrollbar'
    } text-[#141C24] text-[14px] font-normal leading-6 placeholder:text-[#637083] bg-white`;

  return (
    <div className={`flex flex-col ${className}`}>
      <textarea
        ref={textareaRef}
        className={textareaClasses}
        value={localValue}
        onChange={(e) => setLocalValue(e.currentTarget.value)}
        rows={autoGrow ? 1 : rows}
        onKeyDown={handleKeyDown}
        style={textareaStyles}
        aria-label={ariaLabel}
        placeholder={placeholder}
      />
      <div className="flex justify-end gap-[10px]">
        <button
          type="button"
          className="w-fit px-3 py-2 rounded-[6px] border bg-white btn border-[#E4E7EC] font-medium leading-[16px] text-[12px] text-center text-[#202B37] "
          onClick={() => onCancel?.()}
          disabled={isSaving}
        >
          Cancel
        </button>
        <button
          type="button" //p-[10px_20px]
          className={`inline-flex items-center w-fit px-3 py-2 gap-[8px] rounded-[6px] text-white btn border text-xs ${isButtonDisabled
              ? 'bg-custom-300 border-custom-300 opacity-50 cursor-not-allowed'
              : 'bg-custom-500 border-custom-500 hover:bg-custom-600 hover:border-custom-600 focus:bg-custom-600 focus:border-custom-600 focus:ring focus:ring-custom-100 active:bg-custom-600 active:border-custom-600 active:ring active:ring-custom-100 dark:ring-custom-400/20'
            }`}
          onClick={() => void handleSave()}
          disabled={isButtonDisabled}
        >
          <span className="w-fit text-nowrap flex items-center">
            {buttonText}
            {isSaving && (
              <span
                className="ml-2 inline-flex items-center"
                aria-hidden={!isSaving}
              >
                <ButtonLoader />
              </span>
            )}
          </span>
        </button>
      </div>
    </div>
  );
};

export default AddUpdateForm;
