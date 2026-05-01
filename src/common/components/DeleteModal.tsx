import React from 'react';
import Modal from './Modal';
import { X } from 'lucide-react';
import Image from 'next/image';

import deleteImg from '../../app/assests/images/delete.png';

interface props {
  show: boolean;
  onHide: () => void;
  onDelete: () => void;
  title?: string;
}

const DeleteModal: React.FC<props> = ({ show, onHide, onDelete, title }) => {
  return (
    <React.Fragment>
      <Modal
        show={show}
        onHide={onHide}
        id="deleteModal"
        modal-center="true"
        className="fixed flex flex-col transition-all duration-300 ease-in-out left-2/4 z-drawer -translate-x-2/4 -translate-y-2/4"
        dialogClassName="w-screen md:w-[26rem] bg-white shadow rounded-md dark:bg-zink-600"
      >
        <Modal.Header
          className="flex items-center justify-between p-4  border-slate-200 dark:border-zink-500"
          closeButtonClass="transition-all hidden duration-200 ease-linear text-slate-500 hover:text-red-500 dark:text-zink-200 dark:hover:text-red-500"
        >
          <Modal.Title className="text-lg font-medium text-[#202B37]">
            {title
              ? `Do you want to delete this ${title}?`
              : 'Do you want to delete the task?'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="max-h-[calc(theme('height.screen')_-_180px)] px-4 pb-4 overflow-y-auto">
          <p className="text-base text-[#414E62] font-norm  dark:text-zink-200">
            {title
              ? `You can’t retrieve associated details with this ${title} later`
              : 'You can’t retrieve associated details with this task later.'}
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
              {title?`Yes, Delete ${title}`:'Delete'}
            </button>
          </div>
        </Modal.Footer>
      </Modal>
    </React.Fragment>
  );
};

export default DeleteModal;
