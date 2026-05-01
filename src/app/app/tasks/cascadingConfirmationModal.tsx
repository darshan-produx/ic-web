import React, { useState, useRef, useEffect } from 'react';
import Modal from '../../../common/components/Modal';

interface CascadingConfirmationModalProps {
  cascadingConfirmationModal: boolean;
  setCascadingConfirmationModal: (value: boolean) => void;
  setCascadingDependency: (value: boolean) => void;
  setCascadingConfirmationModal1: (value: boolean) => void;
  setIsDataChanged: (value: boolean) => void;
  isBreakDependencyModal?: boolean;
  handleBreakDependency?: any;
  isEditMode?: boolean;
}

export const CascadingConfirmationModal: React.FC<
  CascadingConfirmationModalProps
> = ({
  cascadingConfirmationModal,
  setCascadingConfirmationModal,
  setCascadingDependency,
  setIsDataChanged,
  isBreakDependencyModal,
  handleBreakDependency,
  isEditMode,
  setCascadingConfirmationModal1,
}) => {
  const [cascadingDependencyLocal, setCascadingDependencyLocal] = useState(true);
  return (
    <Modal
      show={cascadingConfirmationModal}
      onHide={() => {}}
      id="cascadingConfirmationModal"
      modal-center="true"
      className="fixed flex flex-col transition-all duration-300 ease-in-out left-2/4 z-drawer -translate-x-2/4 -translate-y-2/4"
      dialogClassName="w-screen md:w-[28rem] bg-white shadow rounded-md dark:bg-zink-600"
    >
      <div className="p-4">
        <Modal.Title className="font-[500] text-[#202B37] text-[18px]">
          {isBreakDependencyModal
            ? 'Do you want to break dependency for this task?'
            : `Do you want to move cascading tasks too with same dependency?`}
        </Modal.Title>
      </div>

      {isBreakDependencyModal && isEditMode && (<Modal.Body className="px-4 pb-1">
        <div className="space-y-2">
          <label
            className="flex justify-start items-center gap-1 cursor-pointer"
            htmlFor="checkbox"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              id={`checkbox`}
              className="size-4"
              type="checkbox"
              checked={cascadingDependencyLocal}
              onChange={(e) => {
                // markAsDone(task._id);
                e.stopPropagation();
                setCascadingDependencyLocal(e.target.checked);
              }}
            />
            <p className="text-[14px] text-[#344051]">
               Want to move cascading tasks too with same dependency
            </p>
          </label>
        </div>
      </Modal.Body>)}

      <Modal.Footer className="p-4 mt-2 border-t border-slate-200 dark:border-zink-500">
        {isBreakDependencyModal ? (
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-[6px]"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setCascadingDependency(false);
                setCascadingConfirmationModal(false);
                const flag = false;
                handleBreakDependency(flag);
                setIsDataChanged(true);
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-white bg-[#3B82F6] rounded-[6px]"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setCascadingDependency(cascadingDependencyLocal);
                setCascadingConfirmationModal(false);
                const flag = true;
                handleBreakDependency(flag);
                setIsDataChanged(true);
              }}
            >
              Yes, break dependency
            </button>
          </div>
        ) : (
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-[6px]"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setCascadingDependency(false);
                setCascadingConfirmationModal(false);
                setCascadingConfirmationModal1(false);
                setIsDataChanged(true);
              }}
            >
              No
            </button>
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-white bg-[#3B82F6] rounded-[6px]"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setCascadingDependency(true);
                setCascadingConfirmationModal(false);
                setCascadingConfirmationModal1(false);
                setIsDataChanged(true);
              }}
            >
              Yes, move the tasks
            </button>
          </div>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default CascadingConfirmationModal;
