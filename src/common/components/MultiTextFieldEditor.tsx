import React, { useEffect, useState } from 'react';

interface MultiTextFieldEditorProps {
  title: string;
  description: string;
  onSave: (title?: string, description?: string, isTitleEdited?: boolean, isDescriptionEdited?: boolean) => void;
  onCancel: () => void;
}

const MultiTextFieldEditor: React.FC<MultiTextFieldEditorProps> = ({
  title,
  description,
  onSave,
  onCancel,
}) => {
  const [editedTitle, setEditedTitle] = useState(title);
  const [editedDescription, setEditedDescription] = useState(description);
  const [isTitleEdited, setIsTitleEdited] = useState(false);
  const [isDescriptionEdited, setIsDescriptionEdited] = useState(false);

  useEffect(() => {
    if (editedTitle !== title) {
      setIsTitleEdited(true);
    } else {
      setIsTitleEdited(false);
    }
  }, [editedTitle, title]);

  useEffect(() => {
    if (editedDescription !== description) {
      setIsDescriptionEdited(true);
    } else {
      setIsDescriptionEdited(false);
    }
  }, [editedDescription, description]);
  // const handleSave = () => {
  //   onSave(editedTitle, editedDescription, isTitleEdited, isDescriptionEdited);
  // };

  return (
    <div className="space-y-3">
      {/* Title Input */}
      <div className="border border-[#CED2DA] rounded-md py-[6px] px-[10px]">
        {/* <label className="text-xs text-[#97A1AF] mb-1 block">Title</label> */}
        <input
          type="text"
          value={editedTitle}
          onChange={(e) => {
            setEditedTitle(e.target.value);
          }}
          className="w-full text-[14px] text-[#202B37] outline-none border-none bg-transparent"
          placeholder="Enter title"
        />
      </div>

      {/* Description Input */}
      <div className="border border-[#CED2DA] rounded-md py-[6px] px-[10px]">
        {/* <label className="text-xs text-[#97A1AF] mb-1 block">Description</label> */}
        <textarea
          value={editedDescription}
          onChange={(e) => {
            setEditedDescription(e.target.value);
          }}
          rows={4}
          className="w-full text-[14px] text-[#202B37] outline-none border-none bg-transparent resize-none overflow-y-auto scroll"
          placeholder="Enter description"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-2">
        <button
          onClick={onCancel}
          className="px-3 py-2 text-xs font-medium text-[#202B37] border border-[#E4E7EC] rounded-md hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            if (isTitleEdited || isDescriptionEdited) {
              onSave(editedTitle, editedDescription);
            } else {
              return;
            }
          }}
          className={`px-3 py-2 text-xs font-medium text-white bg-[#1A75FF] rounded-md hover:bg-[#1557C0] transition-colors ${!(isTitleEdited || isDescriptionEdited) ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={!(isTitleEdited || isDescriptionEdited)}
        >
          Update
        </button>
      </div>
    </div>
  );
};

export default MultiTextFieldEditor;
