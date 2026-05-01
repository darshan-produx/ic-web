import Modal from '../../../../common/components/Modal';
import React from 'react';
import { CalendarDays } from 'lucide-react';
import { useState } from 'react';
import Flatpickr from 'react-flatpickr';
import dayjs from 'dayjs';
interface ConfirmationModalProps {
  modalOpen: boolean;
  handleCancel: () => void;
  handleCreatePlan: (date: any) => void; // Function to execute on delete
  planStartDate: string;
}

const CreateOnboardingPlanModal: React.FC<ConfirmationModalProps> = ({
  modalOpen,
  handleCancel,
  handleCreatePlan,
  planStartDate,
}) => {
  if (!modalOpen) return null;

  const [isOpen, setIsOpen] = useState(false);
  const [date, setdate] = useState<Date>();
  const handleDateChange = (selectedDates: Date[]) => {
    setdate(selectedDates[0]);
  };

  const handleIconClick = () => {
    const input: any = document.querySelector('.flatpickr-input');
    if (input) {
      input?.focus();
    }
  };

  return (
    <Modal
      show={modalOpen}
      //   onHide={handleCancel}
      id="defaultModal"
      modal-center="true"
      className="fixed flex flex-col transition-all duration-300 ease-in-out left-2/4 z-drawer -translate-x-2/4 -translate-y-2/4"
      dialogClassName="w-screen md:w-[30rem] bg-white shadow rounded-md dark:bg-zink-600 flex flex-col h-full"
    >
      <Modal.Header
        className="flex items-center justify-between p-4  border-slate-200 dark:border-zink-500"
        closeButtonClass="transition-all hidden duration-200 ease-linear text-slate-500 hover:text-red-500 dark:text-zink-200 dark:hover:text-red-500"
      >
        <Modal.Title className="text-sm font-normal text-[#414E62]">
          Create onboarding plan
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="max-h-[calc(theme('height.screen')_-_180px)] px-4 pb-4 overflow-y-auto">
        <div className="relative w-full">
          <Flatpickr
            onChange={handleDateChange}
            value={planStartDate}
            onOpen={() => setIsOpen(true)}
            onClose={() => setIsOpen(false)}
            options={{
              dateFormat: 'M d, Y',
            }}
            placeholder={'MMM DD,YYYY'}
            className="form-input  !text-[14px] mr-1 !font-[500] !rounded-[6px]  !text-[#141C24] border-slate-200 dark:border-zinc-500 !py-[1.2rem] mt-[2px] pl-[132px] pr-[2px] focus:outline-none focus:border-gray-500 disabled:bg-slate-100 dark:disabled:bg-zinc-600 disabled:border-slate-300 dark:disabled:border-zinc-500 dark:disabled:text-zinc-200 disabled:text-slate-500 dark:text-zinc-100 dark:bg-zinc-700 dark:focus:border-custom-800 placeholder:text-slate-400 dark:placeholder:text-zinc-200 !w-[241px] !h-[4.3vh] flatpickr-input"
          />
          <div
            className="absolute left-2 top-1/2 mt-[3px] transform -translate-y-1/2 flex items-center z-[10] cursor-pointer"
            onClick={handleIconClick}
            aria-label="Open date picker"
          >
            <CalendarDays className="w-[15px] -mt-2 h-[16.67px] text-[#202b37]" />
            <span className="ml-2 -mt-1  text-[14px] font-[400] leading-[20px] text-[#141C24] items-center ">
              Plan start date
            </span>
          </div>
        </div>
        {/* <span className="text-red-500 text-xs">
          {dayjs(date).format('MMM DD,YYYY') <
          dayjs(new Date()).format('MMM DD,YYYY')
            ? 'Start date should be greater than or equal to current date.'
            : ''}
        </span> */}
      </Modal.Body>
      <Modal.Footer className="p-4 mt-auto border-t border-slate-200 dark:border-zink-500">
        <div className="flex justify-end gap-3">
          <button
            type="button"
            className="bg-white px-2 py-0.5 text-gray-500 btn border-gray-500 font-semibold "
            onClick={handleCancel}
          >
            Cancel
          </button>
          {
            <button
              type="button"
              className="text-white btn bg-custom-500 font-semibold border-custom-500 hover:text-white hover:bg-custom-600 hover:border-custom-600 focus:text-white focus:bg-custom-600 focus:border-custom-600 focus:ring focus:ring-custom-100 active:text-white active:bg-custom-600 active:border-custom-600 active:ring active:ring-custom-100 dark:ring-custom-400/20"
              onClick={() => handleCreatePlan(date)}
              // disabled={
              //   dayjs(date).format('MMM DD,YYYY') <
              //   dayjs(new Date()).format('MMM DD,YYYY')
              // }
            >
              Create
            </button>
          }
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default CreateOnboardingPlanModal;
