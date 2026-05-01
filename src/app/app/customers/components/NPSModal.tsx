import { X } from 'lucide-react';

const NPSModal = (props: {
  title?: string;
  size?: string;
  noScroll?: boolean;
  setModelOpen?: (flag: boolean) => void;
  Content: JSX.Element;
  ShowPDFButton?: boolean;
  backBg?: string;
  onClose?: () => void; // Add this line
}) => {
  const handleClose = () => {
    if (props.onClose) {
      props.onClose(); // Call the onClose prop function
    }
    if (props.setModelOpen) {
      props.setModelOpen(false); // Optionally close the modal
    }
  };
  return (
    <div
      className="fixed z-[999] inset-0 overflow-hidden bg-slate-900/40 dark:bg-zink-800/70 "
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
      onClick={handleClose}
    >
      <div className="flex items-end justify-center min-h-screen pt-2 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          className={`fixed inset-0 bg-opacity-75 transition-opacity`}
          aria-hidden="true"
        ></div>

        <span
          className="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >
          &#8203;
        </span>
        <div
          className={`inline-block align-bottom text-left overflow-hidden shadow-lg border border-slate-200  ${
            props?.backBg ? props?.backBg : ''
          }  ${props?.backBg} transform   sm:my-8 sm:align-middle ${
            props?.size
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-white border-slate-200 px-4 py-3 flex justify-between items-center relative">
            {props.title && (
              <h3 className="font-inter text-[16px] font-medium leading-[24px] text-[#141C24]">
                {props.title}
              </h3>
            )}
            <X
              size={6}
              strokeWidth={3}
              onClick={handleClose}
              className="ml-2 w-[25px] h-[25px] top-[2.5px] left-[81.5px]  rounded-full text-[#97A1AF] font-bold p-0.5 cursor-pointer"
            />
          </div>

          <div className="py-4 px-3">
            <div
              className={!props?.noScroll ? 'overflow-y-auto' : 'overflow-none'}
              style={{ maxHeight: `calc(100vh - 2rem)` }}
            >
              <div>{props?.Content}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default NPSModal;
