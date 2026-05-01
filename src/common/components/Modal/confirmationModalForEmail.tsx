import Modal from '../../../common/components/Modal';

interface ConfirmationModalProps {
  header: string;
  modalOpen: boolean;
  handleCancel: () => void;
  handleYes: () => void; // Function to execute on delete
  title?: string;
  yesText?: string;
  setTaskCompleteFlag?: any;
  confirmWith?: number;
}

const ConfirmationModalForEmail: React.FC<ConfirmationModalProps> = ({
  header,
  modalOpen,
  handleCancel,
  handleYes,
  yesText,
  title,
  setTaskCompleteFlag,
  confirmWith,
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
      <Modal.Body className="flex flex-col justify-between p-[20px]  border-slate-200 dark:border-zink-500">
        <Modal.Title className="text-[18px] font-[500] text-gray-800">
          {header}
        </Modal.Title>
        {title && (
          <Modal.Body className="max-h-[calc(theme('height.screen')_-_180px)] pt-[14px] overflow-y-auto">
            <span className="text-[14px] text-[#414E62]  dark:text-zink-200">
              {title}
            </span>
          </Modal.Body>
        )}
        {confirmWith && confirmWith > 0 && (
          <span className="flex items-center  pt-[10px]">
            <input
              type="checkbox"
              onChange={(e) => {
                setTaskCompleteFlag(e.target.checked);
              }}
            />
            &nbsp;
            <span className="text-[14px] text-[#202B37]">
              Also mark
              <strong> {confirmWith} open tasks</strong> as completed
            </span>
          </span>
        )}
      </Modal.Body>
      <Modal.Footer className="p-4 mt-auto border-t border-slate-200 dark:border-zink-500">
        <div className="flex justify-end gap-3">
          <button
            type="button"
            className={`bg-white btn text-gray-500  border-gray-500 font-semibold ${
              yesText == 'OK' ? 'invisible' : 'visible'
            }`}
            onClick={handleCancel}
          >
            Cancel
          </button>

          <button
            type="button"
            className="text-white btn bg-custom-500 font-semibold border-custom-500 hover:text-white hover:bg-custom-600 hover:border-custom-600 focus:text-white focus:bg-custom-600 focus:border-custom-600 focus:ring focus:ring-custom-100 active:text-white active:bg-custom-600 active:border-custom-600 active:ring active:ring-custom-100 dark:ring-custom-400/20"
            onClick={handleYes}
          >
            {yesText}
          </button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmationModalForEmail;
