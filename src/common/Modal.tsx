const Modal = (props: {
  title?: string;
  size?: string;
  noScroll?: boolean;
  setModelOpen?: (flag: boolean) => void;
  Content: JSX.Element;
  ShowPDFButton?: boolean;
  backBg?: string;
  composeEmail?: boolean;
}) => {
  return (
    <div
      className={`fixed z-[500] ${
        props?.composeEmail ? '' : 'inset-0'
      }  overflow-hidden`}
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex items-end justify-center min-h-screen pt-2 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          className={`fixed  ${
            props?.composeEmail
              ? ``
              : `${
                  props?.backBg ? 'backdrop-blur-sm' : ''
                } bg-opacity-75 transition-opacity inset-0`
          }   `}
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
          }  ${props?.backBg} transform    ${props?.size} ${
            props?.composeEmail
              ? 'fixed !right-[calc((100vw-1292px)/2)] bottom-0'
              : 'sm:my-8 sm:align-middle'
          }`}
        >
          <div className={` ${props?.composeEmail ? 'px-3' : 'py-4 px-3'}`}>
            <div
              className={
                !props?.noScroll ? 'overflow-y-auto scroll' : 'overflow-none'
              }
              style={{
                maxHeight: props?.composeEmail
                  ? `101vh`
                  : `calc(100vh - 10rem)`,
              }}
            >
              <div>{props?.Content}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Modal;
