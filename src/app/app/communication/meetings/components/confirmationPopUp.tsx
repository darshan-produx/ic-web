import Modal from '../../../../../common/components/Modal';

interface ConfirmationModalProps {
  header: string;
  modalOpen: boolean;
  handleCancel: () => void;
  handleYes: () => void; // Function to execute on delete
  title?: string;
  yesText?: string;
  setConfirmWith?: any;
  confirmWith?: any;
  data?: any;
  noText?: string;
}

const ConfirmationPopUp: React.FC<ConfirmationModalProps> = ({
  header,
  modalOpen,
  handleCancel,
  handleYes,
  yesText,
  title,
  setConfirmWith,
  confirmWith,
  data,
  noText,
}) => {
  if (!modalOpen) return null;

  return (
    <Modal
      show={modalOpen}
      onHide={handleCancel}
      id="defaultModal"
      modal-center="true"
      className="fixed flex flex-col transition-all duration-300 ease-in-out left-2/4 z-drawer -translate-x-2/4 -translate-y-2/4"
      dialogClassName="w-screen md:w-[418px] bg-white shadow rounded-[12px] dark:bg-zink-600 flex flex-col h-full"
    >
      <Modal.Header
        className="flex items-center justify-between py-[20px] border-slate-200 dark:border-zink-500"
        closeButtonClass="transition-all hidden duration-200 ease-linear text-slate-500 hover:text-red-500 dark:text-zink-200 dark:hover:text-red-500"
      >
        {header && (
          <Modal.Title className="text-[#202B37] font-medium px-[20px]  dark:text-zink-200">
            {header}
          </Modal.Title>
        )}
      </Modal.Header>
      <Modal.Body className="max-h-[calc(theme('height.screen')_-_180px)] px-[20px] pb-4 overflow-y-auto">
        <p className="text-sm font-normal text-[#414E62] text-lg">{title}</p>
        {(data?.task?.length > 0 || data?.insight?.length > 0) && (
          <span className="flex items-center ">
            <input
              type="checkbox"
              onChange={(e) => setConfirmWith(e.target.checked)}
              checked={confirmWith}
            />
            &nbsp;
            <span className="text-[14px] text-[#202B37]">
              Keep the <strong>{data?.insight?.length} insights </strong>and{' '}
              <strong>{data?.task?.length} tasks</strong> from this meeting
            </span>
          </span>
        )}
      </Modal.Body>
      <Modal.Footer className="px-[16px] py-[16px] mt-auto border-t border-slate-200 dark:border-zink-500">
        <div className="flex justify-end gap-3">
          <button
            type="button"
            className="bg-white text-gray-500 btn border-gray-500 font-semibold "
            onClick={handleCancel}
          >
            {noText || 'Cancel'}
          </button>
          <button
            type="button"
            className="text-white btn bg-red-500 font-semibold  hover:text-white  hover:bg-red-600 focus:text-white focus:bg-red-600 focus:ring focus:ring-custom-100 active:text-white active:bg-red-600  active:ring active:ring-custom-100 dark:ring-custom-400/20"
            onClick={handleYes}
          >
            {yesText}
          </button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmationPopUp;
