import Modal from '../../../../../common/components/Modal';
import InsightDeatils from '../../../insights/insightDetails';

export default function InstightDetailsModal({
  insightMeetingModalOpen,
  setInsightMeetingModalOpen,
}: any) {
  return (
    <Modal
      show={insightMeetingModalOpen?.status}
      onHide={() => setInsightMeetingModalOpen({ insight: {}, status: false })}
      id="defaultModal"
      modal-center="true"
      className="fixed flex flex-col transition-all duration-300 ease-in-out left-2/4 z-drawer -translate-x-2/4 -translate-y-2/4"
      dialogClassName="w-screen md:w-[614px] overflow-hidden bg-white shadow rounded-[12px] dark:bg-zink-600"
    >
      <Modal.Body className="custom-modal-body scroll max-h-[calc(theme('height.screen')_-_190px)] pt-[16px] px-[24px] overflow-y-auto">
        <div>
          <InsightDeatils
            insightDetails={{
              insight_instance: insightMeetingModalOpen?.insight,
            }}
            insightSuggetion={true}
            // insights={insights?.data.data}
            // dummy={dummy}
            // setIsGuidaceSectionOpen={setIsGuidaceSectionOpen}
            // isGuidaceSectionOpen={isGuidaceSectionOpen}
            // setIsCollapsed={setIsCollapsed}
            // setIgnoredMessages={setIgnoredMessages}
            // ignoredMessages={ignoredMessages}
          />
        </div>
      </Modal.Body>
    </Modal>
  );
}
