import Modal from '../../common/components/Modal';

interface DownloadModalProps {
  downloadModalOpen: boolean;
  handleCancel: () => void;
  handleDownload: () => void; // Function to execute on delete
  title?: string;
}

const DownloadModal: React.FC<DownloadModalProps> = ({
  downloadModalOpen,
  handleCancel,
  handleDownload,
  title,
}) => {
  if (!downloadModalOpen) return null;

  return (
    <Modal
      show={downloadModalOpen}
      onHide={handleCancel}
      id="defaultModal"
      modal-center="true"
      className="fixed flex flex-col transition-all duration-300 ease-in-out left-2/4 z-drawer -translate-x-2/4 -translate-y-2/4"
      dialogClassName="w-screen md:w-[30rem] bg-white shadow rounded-md dark:bg-zink-600 flex flex-col h-full"
    >
      <Modal.Header
        className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-zink-500"
        closeButtonClass="transition-all duration-200 ease-linear text-slate-500 hover:text-red-500 dark:text-zink-200 dark:hover:text-red-500"
      >
        <Modal.Title className="text-16">Confirm Download</Modal.Title>
      </Modal.Header>
      <Modal.Body className="max-h-[calc(theme('height.screen')_-_180px)] p-4 overflow-y-auto">
        <p className="text-slate-500 dark:text-zink-200">{title}</p>
      </Modal.Body>
      <Modal.Footer className="p-4 mt-auto border-t border-slate-200 dark:border-zink-500">
        <div className="flex justify-end">
          <button
            type="button"
            className="mx-3 text-slate-500 btn bg-slate-200 border-slate-200 hover:text-slate-600 hover:bg-slate-300 hover:border-slate-300 focus:text-slate-600 focus:bg-slate-300 focus:border-slate-300 focus:ring focus:ring-slate-100 active:text-slate-600 active:bg-slate-300 active:border-slate-300 active:ring active:ring-slate-100 dark:bg-zink-600 dark:hover:bg-zink-500 dark:border-zink-600 dark:hover:border-zink-500 dark:text-zink-200 dark:ring-zink-400/50"
            onClick={handleCancel}
          >
            No
          </button>
          <button
            type="button"
            className="text-white btn bg-custom-500 border-custom-500 hover:text-white hover:bg-custom-600 hover:border-custom-600 focus:text-white focus:bg-custom-600 focus:border-custom-600 focus:ring focus:ring-custom-100 active:text-white active:bg-custom-600 active:border-custom-600 active:ring active:ring-custom-100 dark:ring-custom-400/20"
            onClick={handleDownload}
          >
            Yes
          </button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default DownloadModal;
