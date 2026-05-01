import React, { useEffect, useRef, useState } from 'react';

type EditableNotesCellProps = {
  value?: string;
  placeholder?: string;
  onSave: (nextValue: string) => Promise<void> | void;
  className?: string;
};

const EditableNotesCell: React.FC<EditableNotesCellProps> = ({
  value = '',
  placeholder = 'Add notes here',
  onSave,
  className = '',
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (!isEditing) {
      setDraft(value);
    }
  }, [value, isEditing]);

  useEffect(() => {
    if (isEditing && textAreaRef.current) {
      const textarea = textAreaRef.current;
      textarea.focus();
      const len = textarea.value.length;
      textarea.setSelectionRange(len, len);
      // Keep the same size when entering edit mode.
      textarea.style.height = '';
    }
  }, [isEditing]);

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
      <textarea
        ref={textAreaRef}
        value={draft}
        onChange={(e) => {
          setDraft(e.target.value);
          // Grow only when text grows.
          e.currentTarget.style.height = 'auto';
          e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
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
        className={`w-full resize-none overflow-hidden bg-transparent text-xs leading-5 text-gray-700 outline-none ${className}`}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setIsEditing(true)}
      disabled={isSaving}
      className={`w-full text-left text-xs leading-5 text-gray-700 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {isSaving ? 'Saving...' : (value?.trim() ? value : placeholder)}
    </button>
  );
};

export default EditableNotesCell;
