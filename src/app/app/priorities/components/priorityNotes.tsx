import { useState, useRef, useEffect, ChangeEvent } from 'react';
import { toast } from 'react-toastify';
import { updateUserNotes } from '../../../api/customers/customers';

export function Notes({ userId, content }: any) {
  const [notes, setNotes] = useState(content || '');
  const [isEditable, setIsEditable] = useState(false);
  const [originalNotes, setOriginalNotes] = useState(content || '');
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setNotes(content || '');
    setOriginalNotes(content || '');
  }, [content]);

  useEffect(() => {
    if (isEditable && textAreaRef.current) {
      const textarea = textAreaRef.current;
      textarea.focus();
      const length = textarea.value.length;
      textarea.setSelectionRange(length, length);
    }
  }, [isEditable]);

  const handleNoteSubmit = async () => {
    // if (!notes.trim()) {
    //   toast.error('Note cannot be empty', {
    //     position: 'top-right',
    //     autoClose: 2000,
    //   });
    //   return;
    // }

    try {
      const response = await updateUserNotes(userId, {
        supervisor_note: notes,
      });
      toast.success('Notes saved!', {
        position: 'top-right',
        autoClose: 2000,
      });
      setOriginalNotes(notes);
      setIsEditable(false);
    } catch (error) {
      toast.error('Failed to save notes. Please try again.', {
        position: 'top-right',
        autoClose: 2000,
      });
    }
  };

  const handleCancel = () => {
    setNotes(originalNotes);
    setIsEditable(false);
  };
  return (
    <div className="w-[749px] h-[496px] h-lt-900:h-[364px] bg-white rounded-[12px] p-[22px] flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-[18px]">
        <h2 className="text-[14px] font-medium text-[#202B37]">Notes</h2>
        {!isEditable ? (
          <button
            className="text-[14px] text-[#202B37] font-normal"
            onClick={() => setIsEditable(true)}
          >
            Edit
          </button>
        ) : (
          <div className="flex gap-4">
            <button
              className="text-[14px] text-[#202B37] font-normal"
              onClick={handleNoteSubmit}
            >
              Save
            </button>
            <button
              className="text-[14px] text-[#202B37] font-normal"
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="-mx-[22px] border-t border-[#E4E7EC] mb-[18px]" />
      {/* Notes content box */}
      <div className="h-lt-900:h-[306px] flex-grow">
        {isEditable ? (
          <textarea
            ref={textAreaRef}
            className="w-full h-full text-[14px] text-black leading-[20px] resize-none outline-none bg-white font-normal whitespace-pre-wrap p-2 overflow-y-auto scroll"
            value={notes}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
              setNotes(e.target.value)
            }
            placeholder="Add notes here"
          />
        ) : (
          <div className={`text-[14px]  leading-[20px] font-normal whitespace-pre-wrap p-2 cursor-pointer ${notes?'text-black':'text-gray-300'}`} onClick={()=>setIsEditable(true)}>
            {notes || "Add notes here"}
          </div>
        )}
      </div>
    </div>
  );
}
