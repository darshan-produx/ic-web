import React from 'react';
import Modal from '../../../../../common/components/Modal';

interface props {
  show: boolean;
  onHide: () => void;
  onDelete: () => void;
  selectedStakeholder?: any;
}

const DeleteStakeholderModal: React.FC<props> = ({
  show,
  onHide,
  onDelete,
  selectedStakeholder,
}) => {
  return (
    <React.Fragment>
      <Modal
        show={show}
        onHide={onHide}
        id="deleteModal"
        modal-center="true"
        className="fixed flex flex-col transition-all duration-300 ease-in-out left-2/4 z-drawer -translate-x-2/4 -translate-y-2/4"
        dialogClassName="w-screen md:w-[25rem] bg-white shadow rounded-md dark:bg-zink-600"
      >
        <Modal.Header
          className="flex items-center justify-between p-4  border-slate-200 dark:border-zink-500"
          closeButtonClass="transition-all hidden duration-200 ease-linear text-slate-500 hover:text-red-500 dark:text-zink-200 dark:hover:text-red-500"
        >
          <Modal.Title className="text-lg font-medium text-[#202B37]">
            Are you sure to delete {selectedStakeholder?.name}?
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="max-h-[calc(theme('height.screen')_-_180px)] px-4 pb-4 overflow-y-auto">
          <p className="text-base text-[#414E62] font-norm  dark:text-zink-200">
            Details associated to {selectedStakeholder?.name} can not be
            retrieve later
          </p>
        </Modal.Body>

        <Modal.Footer className="p-4 mt-auto border-t border-slate-200 dark:border-zink-500">
          <div className="flex justify-end gap-3">
            <button
              type="button"
              className="bg-white px-4 py-0.5 text-gray-500 btn border-gray-500 font-semibold "
              onClick={onHide}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="text-white bg-red-500 font-semibold border-red-500 btn hover:text-white hover:bg-red-600 hover:border-red-600 focus:text-white focus:bg-red-600 focus:border-red-600 focus:ring focus:ring-red-100 active:text-white active:bg-red-600 active:border-red-600 active:ring active:ring-red-100 dark:ring-custom-400/20"
              onClick={onDelete}
            >
              Delete
            </button>
          </div>
        </Modal.Footer>
      </Modal>
    </React.Fragment>
  );
};

export default DeleteStakeholderModal;
