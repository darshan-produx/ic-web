import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';

type EditableCellProps = {
  value?: string;
  placeholder?: string;
  onSave: (nextValue: string) => Promise<void> | void;
  className?: string;
};

const EditableCell: React.FC<EditableCellProps> = ({
  value = '',
  placeholder = '',
  onSave,
  className = '',
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const [minEditorHeight, setMinEditorHeight] = useState(40);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);

  const resizeTextarea = (textarea: HTMLTextAreaElement, minHeight: number) => {
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.max(textarea.scrollHeight, minHeight)}px`;
  };

  useEffect(() => {
    if (!isEditing) {
      setDraft(value);
    }
  }, [value, isEditing]);

  useLayoutEffect(() => {
    if (isEditing && textAreaRef.current) {
      const textarea = textAreaRef.current;
      textarea.focus();
      const len = textarea.value.length;
      textarea.setSelectionRange(len, len);
      resizeTextarea(textarea, minEditorHeight);
    }
  }, [isEditing, draft, minEditorHeight]);

  const startEditing = () => {
    const nextMinHeight = Math.ceil(buttonRef.current?.getBoundingClientRect().height || 40);
    setMinEditorHeight(nextMinHeight);
    setIsEditing(true);
  };

  const save = async () => {
    if (isSaving) return;

    setIsEditing(false);
    if (draft === value) return;

    setIsSaving(true);
    try {
      await onSave(draft);
    } finally {
      setIsSaving(false);
    }
  };

  const cancel = () => {
    setDraft(value);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div
        className={`w-full ${className}`}
        style={{ minHeight: `${minEditorHeight}px` }}
      >
        <textarea
          ref={textAreaRef}
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            resizeTextarea(e.currentTarget, minEditorHeight);
          }}
          onBlur={() => {
            void save();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              e.preventDefault();
              cancel();
              return;
            }

            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              void save();
            }
          }}
          rows={1}
          style={{ minHeight: `${minEditorHeight}px` }}
          className="w-full resize-none overflow-hidden bg-transparent px-3 py-2 text-xs leading-5 text-gray-700 outline-none whitespace-pre-wrap break-words"
        />
      </div>
    );
  }

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={startEditing}
      disabled={isSaving}
      className={`h-full min-h-10 w-full px-3 py-2 text-left text-xs leading-5 text-gray-700 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {isSaving ? 'Saving...' : value || placeholder}
    </button>
  );
};

const areEqual = (prevProps: EditableCellProps, nextProps: EditableCellProps) => (
  prevProps.value === nextProps.value
  && prevProps.placeholder === nextProps.placeholder
  && prevProps.className === nextProps.className
);

const MemoizedEditableCell = React.memo(EditableCell, areEqual);

MemoizedEditableCell.displayName = 'EditableCell';

export default MemoizedEditableCell;
