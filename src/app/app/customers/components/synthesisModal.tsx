import Modal from '../../../../common/components/Modal';
import { ChevronRight, X } from 'lucide-react';
import Link from 'next/link';
import { formatRevenue } from '../../../../common/SupportFunctions';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function SynthasisModal({
  synthesisData,
  isSynthesisModalOpen,
  toggle,
}: {
  synthesisData: any;
  isSynthesisModalOpen: boolean;
  toggle: any;
}) {
  const getHealthStatus = (statuses: any) => {
    let hasRed = false;
    let hasYellow = false;
    let allGreen = true;

    statuses.forEach((item: any) => {
      if (item.status === 'red') {
        hasRed = true;
      } else if (item.status === 'yellow') {
        hasYellow = true;
      }
    });

    if (hasRed) {
      return 'Poor';
    } else if (hasYellow || !allGreen) {
      return 'Average';
    } else {
      return 'Good';
    }
  };

  const statusText = getHealthStatus(synthesisData?.pillar_statuses);

  return (
    <div>
      <Modal
        show={isSynthesisModalOpen}
        onHide={toggle}
        id="defaultModal"
        modal-center="true"
        className="fixed flex flex-col transition-all duration-300 ease-in-out left-2/4 z-drawer -translate-x-2/4 -translate-y-2/4"
        dialogClassName="w-[418px] bg-white shadow rounded-md dark:bg-zink-600 flex flex-col h-full"
      >
        <Modal.Header
          className="flex items-center justify-between px-5 pt-5  border-slate-200 dark:border-zink-500"
          closeButtonClass="transition-all hidden duration-200 ease-linear text-slate-500 hover:text-red-500 dark:text-zink-200 dark:hover:text-red-500"
        >
          <Modal.Title className="text-[20px] font-medium text-[#3B82F6] flex w-full  justify-between items-center">
            <Link
              href={`/app/customers/${synthesisData?.customer_id}?activeTab=view`}
              className="flex items-center gap-1"
              target="_blank"
            >
              {synthesisData?.customer_name}
              <ChevronRight className="font-normal " />
            </Link>{' '}
            <span className="flex items-center gap-1"></span>
            <span className="text-[#000000] cursor-pointer">
              <X className="h-5 w-5" />
            </span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="mx-5 pt-3 pb-[18px] overflow-y-auto border-b-[1px] border-[#E4E7EC] ">
          <div className="flex justify-start items-center w-full text-[#414E62] text-[14px] gap-3">
            <span
              className={`${statusText === 'Good'
                  ? 'bg-[#D9F2E5] text-[#249782]'
                  : statusText === 'Average'
                    ? 'bg-[#FFEECC] text-[#EAB308]'
                    : 'bg-[#FCCFCF] text-[#EF4444]'
                } h-[24px] items-center flex px-2 py-0.5 text-xs font-medium rounded-sm text-nowrap`}
            >
              {statusText}
            </span>
            <span className="text-xs text-[#CED2DA] font-normal">|</span>
            <span className="text-nowrap">
              {formatRevenue(
                synthesisData?.customer_commercials?.arr,
                synthesisData?.client_currency?.currency
              )}{' '}
              ARR
            </span>
            <span className="text-xs text-[#CED2DA] font-normal">|</span>
            <span className="text-nowrap overflow-hidden overflow-ellipsis">
              {synthesisData?.users?.[0]?.user_first_name +
                ' ' +
                synthesisData?.users?.[0]?.user_last_name}
              's account
            </span>
          </div>
        </Modal.Body>
        <Modal.Footer className="max-h-[calc(theme('height.screen')_-_300px)] px-5 mb-5 pt-[18px] text-[16px] text-[#202B37] dark:border-zink-500 overflow-y-auto scroll">
          <div className="flex gap-3">
            <p>
              {synthesisData?.customer_synthesis ? (
                <ReactMarkdown
                  children={synthesisData?.customer_synthesis}
                  remarkPlugins={[remarkGfm]}
                  className={'markdown list-disc list-inside'}
                />
              ) : (
                'No synthesis available'
              )}
            </p>
          </div>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
export default SynthasisModal;
