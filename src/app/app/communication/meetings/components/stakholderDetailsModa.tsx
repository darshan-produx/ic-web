import Modal from '../../../../../common/components/Modal';
import { getInitials } from './meetingDetails';
import { X } from 'lucide-react';
import { useAddStakeholder } from '../../../../../services/mutations/customer360StakeholderMutations';
import { toast } from 'react-toastify';
import { UserIcon2 } from '../../../../../app/assests/icons/icons';

export default function StakholderDetailsModal({
  stakeholdertailModalOpen,
  setStakeholdertailModalOpen,
}: any) {
  const addStakeholder = useAddStakeholder();
  const handleAddStakeholder = async () => {
    try {
      const response = await addStakeholder.mutateAsync({
        customer_id: stakeholdertailModalOpen?.stakeHolder?.customer_id,
        name: stakeholdertailModalOpen?.stakeHolder?.name,
        email: stakeholdertailModalOpen?.stakeHolder?.email,
      });
      if (response?.status === 200 || response?.status === 201) {
        toast?.success('Stakeholder added successfully.');
      }
    } catch (e: any) {
      toast?.error(e?.response?.error?.message);
    }
  };
  return (
    <Modal
      show={stakeholdertailModalOpen?.status}
      onHide={() =>
        setStakeholdertailModalOpen({
          stakeholder: {},
          status: false,
          customer_id: null,
        })
      }
      id="defaultModal"
      modal-center="true"
      className="fixed flex flex-col transition-all duration-300 ease-in-out left-2/4 z-drawer -translate-x-2/4 -translate-y-2/4"
      dialogClassName="w-screen md:w-[614px] overflow-hidden bg-white shadow rounded-[12px] dark:bg-zink-600"
    >
      <Modal.Body className="custom-modal-body scroll max-h-[calc(theme('height.screen')_-_90px)] pt-[16px] px-[20px] pb-[20px] overflow-y-auto">
        <div style={{ fontWeight: 400 }}>
          <div className="flex justify-between">
            <a
              href={`/app/customers/${stakeholdertailModalOpen?.customer_id}?meeting_stakeholder_id=${stakeholdertailModalOpen?.stakeHolder?.stakeholder_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block"
            >
              <div className="flex items-center h-[60px]  pl-[6px] pr-[18px]">
                {stakeholdertailModalOpen?.stakeHolder?.stakeholder_id ? (
                  <img
                    // src={`https://picsum.photos/512/512?random=${index + 1}`}
                    src={`/api/app-service/v1/picture/customer_stakeholder_master/${
                      stakeholdertailModalOpen?.stakeHolder?.stakeholder_id
                    }?org_id=${localStorage?.getItem(
                      'org_id'
                    )}&initials=${getInitials(
                      stakeholdertailModalOpen?.stakeHolder?.name
                        ? stakeholdertailModalOpen?.stakeHolder?.name
                        : stakeholdertailModalOpen?.stakeHolder?.email
                    )}`}
                    alt={``}
                    className="w-[60px] h-[60px] rounded-full "
                  />
                ) : (
                  <div className="w-[60px] h-[60px] mb-1  rounded-full items-center justify-center ">
                    <UserIcon2 />
                  </div>
                )}
                {/* src={`/api/app-service/v1/picture/customer_stakeholder_master/${
                          selectedStakeholder?._id
                        }?org_id=${localStorage?.getItem(
                          'org_id'
                        )}&initials=${getInitials(
                          selectedStakeholder?.name
                        )}&ts=${selectedStakeholder?.updated_at}`} */}
                <span className="text-[14px] text-[#637083] landscape:ml-2  ">
                  <span className="text-[24px] font-medium  text-[#344051]">
                    {stakeholdertailModalOpen?.stakeHolder?.name
                      ? stakeholdertailModalOpen?.stakeHolder?.name
                      : stakeholdertailModalOpen?.stakeHolder?.email}
                  </span>
                  <br />
                  <span className="text-[14px] text-[#637083] flex">
                    {stakeholdertailModalOpen?.stakeHolder?.stance && (
                      <span className="pr-[20px]">
                        {stakeholdertailModalOpen?.stakeHolder?.stance}
                      </span>
                    )}
                    {stakeholdertailModalOpen?.stakeHolder?.stance && (
                      <span className="">|</span>
                    )}
                    {/* {!stakeholdertailModalOpen?.stakeHolder?.stakeholder_id ? (
                    <span
                      className="text-[14px] font-medium text-[#3B82F6] cursor-pointer"
                      onClick={() => handleAddStakeholder()}
                    >
                      Add as stakeholder
                    </span>
                  ) : (
                    <span className="text-[14px] font-medium text-[#637083]">
                      {
                        stakeholdertailModalOpen?.stakeHolder?.stakeholder
                          ?.designation
                      }
                    </span>
                  )} */}
                    <span className="text-[14px] font-medium text-[#637083] pl-[20px] first:pl-0">
                      {
                        stakeholdertailModalOpen?.stakeHolder?.stakeholder
                          ?.designation
                      }
                    </span>
                  </span>
                </span>
              </div>
            </a>
            <span className="cursor-pointer">
              <X
                size={24}
                onClick={() =>
                  setStakeholdertailModalOpen({
                    stakeholder: {},
                    status: false,
                    customer_id: null,
                  })
                }
              />
            </span>
          </div>
          {stakeholdertailModalOpen?.stakeHolder?.participant_summary && (
            <div className="pt-[20px]">
              <span className="text-[14px] text-[#637083] font-medium pb-[12px]">
                Summary
              </span>
              <p className="text-[16px] text-[#202B37] !font-normal">
                {stakeholdertailModalOpen?.stakeHolder?.participant_summary}
              </p>
            </div>
          )}
        </div>
      </Modal.Body>
    </Modal>
  );
}
