import React from 'react';
import Modal from './Modal';
import { X } from 'lucide-react';
import Image from 'next/image';
import { LockIcon } from '../../app/assests/icons/icons';

// import resetPassImg from '../../app/assests/images/resetPass.png';

interface props {
  show: boolean;
  onHide: () => void;
  onResetPassowrd: () => void;
}

const ResetPassword: React.FC<props> = ({ show, onHide, onResetPassowrd }) => {
  return (
    <React.Fragment>
      <Modal
        show={show}
        onHide={onHide}
        id="resetPassModal"
        modal-center="true"
        className="fixed flex flex-col transition-all duration-300 ease-in-out left-2/4 z-drawer -translate-x-2/4 -translate-y-2/4"
        dialogClassName="w-screen md:w-[25rem] bg-white shadow rounded-md dark:bg-zink-600"
      >
        <Modal.Body className="max-h-[calc(theme('height.screen')_-_180px)] overflow-y-auto px-6 py-8">
          <div className="float-right">
            <button
              data-modal-close="ResetPassModal"
              className="transition-all duration-200 ease-linear text-slate-500 hover:text-red-500"
            >
              <X className="size-5" onClick={onHide} />
            </button>
          </div>
          <LockIcon className="h-12 w-20 mx-auto" />
          <div className="mt-5 text-center">
            <h5 className="mb-1">Are you sure?</h5>
            <p className="text-slate-500 dark:text-zink-200">
              A reset password link will be emailed to the user.
            </p>
            <div className="flex justify-center gap-2 mt-6">
              <button
                type="reset"
                className="bg-white text-slate-500 btn hover:text-slate-500 hover:bg-slate-100 focus:text-slate-500 focus:bg-slate-100 active:text-slate-500 active:bg-slate-100 dark:bg-zink-600 dark:hover:bg-slate-500/10 dark:focus:bg-slate-500/10 dark:active:bg-slate-500/10"
                onClick={onHide}
              >
                Cancel
              </button>
              <button
                type="submit"
                id="resetPass"
                data-modal-close="ResetPassModal"
                className="text-white bg-red-500 border-red-500 btn hover:text-white hover:bg-red-600 hover:border-red-600 focus:text-white focus:bg-red-600 focus:border-red-600 focus:ring focus:ring-red-100 active:text-white active:bg-red-600 active:border-red-600 active:ring active:ring-red-100 dark:ring-custom-400/20"
                onClick={onResetPassowrd}
              >
                Yes, Reset Password
              </button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </React.Fragment>
  );
};

export default ResetPassword;
