import { X } from 'lucide-react';
import MeetingInsights from './meetingInsights';
import { use, useCallback, useState } from 'react';
import InstightDetailsModal from './insightDetailsModal';
import Modal from '../../../../../common/components/Modal';
import CreateNewTask from '../../../tasks/createNewTask';
import { useQuery } from '@tanstack/react-query';
import { getAllTasksStatus } from '../../../../../app/api/tasks/tasks';
import { getUsersForTask } from '../../../../../app/api/users/users';
import { toast } from 'react-toastify';
import { useUpdateSingleSuggestionMeeting } from '../../../../../services/mutations/communicationMutations';
import { getCustomers } from '../../../../../app/api/customers/customers';

export default function UnsavedDetails({
  data,
  setDummy,
  deleteInsight,
  handleAction,
  deleteTask,
}: any) {
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const toggleDetailModal = useCallback(() => {
    setShowDetailModal((prevShow) => !prevShow);
  }, []);
  const updateMeetingSuggetion = useUpdateSingleSuggestionMeeting();
  const [taskData, setTaskData] = useState({ task: {}, id: '' });
  const [insightMeetingModalOpen, setInsightMeetingModalOpen] = useState<{
    insight: any;
    status: boolean;
  }>();
  const { data: statusArr } = useQuery({
    queryKey: ['statusArr'],
    queryFn: () => getAllTasksStatus(),
  });
  const { data: existingUsers } = useQuery({
    queryKey: ['users'],
    queryFn: getUsersForTask,
  });
  const { data: allCustomers } = useQuery({
    queryKey: ['allCustomers'],
    queryFn: getCustomers,
  });
  const handleUpdateMeetingTask = async (data: any) => {
    try {
      const response = await updateMeetingSuggetion.mutateAsync({
        ...data,
        id: taskData?.id,
        action: '',
      });
      if (response?.status == 200 || response?.status == 201) {
        toast.success(response?.data?.message);
        toggleDetailModal();
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message[0]);
    }
  };

  return (
    <>
      <div className="bg-[#FFEECC] border-b border-[#EAB308] p-[24px] flex justify-between items-center">
        Review suggestions
        <span className=" flex gap-[24px] items-center">
          <span
            className="text-[16px] text-[#202B37] cursor-pointer"
            onClick={() => handleAction('ignore_all')}
          >
            Ignore all
          </span>
          <span>
            <button
              className="btn bg-[#1A75FF] text-white rounded-[8px] !px-[18px] !py-[8px]"
              onClick={() => handleAction('save_all')}
            >
              Save
            </button>
          </span>
        </span>
      </div>
      <div className="overflow-hidden">
        <div className="flex">
          <div className="w-[50%]">
            <div className="text-[14px] bg-[#FFF8EB] text-[#414E62] px-[24px] py-[8px]">
              Risk and opportunities
            </div>
            <div className=" px-[24px]">
              {data?.insightData
                ?.filter((ele: any) => !ele.is_deleted)
                .map((insight: any, i: number) => (
                  // <div
                  //   key={i}
                  //   className="border-b border-[#F2F4F7] py-[24px] last:border-b-0"
                  // >
                  //   <div className="flex justify-between items-center">
                  //     <span className="text-[#202B37] text-[14px]">
                  //       {insight?.title}
                  //     </span>
                  //     <span className="flex items-center">
                  //       <X size={20} />
                  //     </span>
                  //   </div>
                  //   <div className="flex gap-[10px] pt-[8px]">
                  //     <span className="text-[#249782] bg-[#D9F2E5] px-[10px] py-[4px] rounded-[4px]  text-[12px] font-bold">
                  //       Opportunity
                  //     </span>
                  //     <span className="text-[#EF4444] bg-[#FEE7E7] px-[10px] py-[4px] rounded-[4px]  text-[12px] font-bold">
                  //       Use case match
                  //     </span>
                  //   </div>
                  // </div>
                  <MeetingInsights
                    insight={insight}
                    setDummy={setDummy}
                    deleteInsight={deleteInsight}
                    insightData={data?.insightData}
                    setInsightMeetingModalOpen={setInsightMeetingModalOpen}
                  />
                ))}
            </div>
          </div>
          <div className=" w-[50%] border-l border-[#EAB308]">
            <div className="text-[14px] bg-[#FFF8EB] text-[#414E62] px-[24px] py-[8px]">
              Tasks
            </div>
            <div className="px-[24px] cursor-pointer">
              {data?.taskData
                ?.filter((ele: any) => !ele?.is_deleted)
                .map((task: any, i: number) => (
                  <div
                    key={i}
                    className="border-b border-[#F2F4F7] py-[24px] last:border-b-0"
                    onClick={() => {
                      setTaskData({ task: task?.task_data, id: task?._id });
                      toggleDetailModal();
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-[#202B37] text-[14px]">
                        {task?.task_data?.title}
                      </span>
                      <span
                        className="flex items-center cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteTask(task?._id, 'Ignored');
                        }}
                      >
                        <X size={20} />
                      </span>
                    </div>
                    <div className="flex gap-[10px] pt-[8px]">
                      <span className=" text-[12px] text-[#637083]">
                        {task?.task_data?.customer_name}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
        <Modal
          show={showDetailModal}
          // onHide={toggle}
          id="defaultModal"
          modal-center="true"
          className="fixed flex flex-col transition-all duration-300 ease-in-out left-2/4 z-drawer -translate-x-2/4 -translate-y-2/4"
          dialogClassName="w-screen md:w-[750px] bg-white shadow rounded-md dark:bg-zink-600"
        >
          <Modal.Body className="max-h-[calc(theme('height.screen')_-_61px)] overflow-y-auto barScroll">
            <div className="p-4">
              <CreateNewTask
                onHide={toggleDetailModal}
                allCustomers={allCustomers}
                ele={taskData?.task}
                existingUsers={existingUsers?.data?.data}
                statusArr={statusArr?.data?.data}
                userDetails={{}}
                isEditMode={false}
                isEditMeetingSuggestions={true}
                // setDeleteModal={setDeleteModal}
                // markAsDone={markAsDone}
                // done={props?.done}
                handleUpdateMeetingTask={handleUpdateMeetingTask}
                isCustomerDropDownDisabled={true}
              />
            </div>
          </Modal.Body>
        </Modal>
        {insightMeetingModalOpen?.status && (
          <InstightDetailsModal
            insightMeetingModalOpen={insightMeetingModalOpen}
            setInsightMeetingModalOpen={setInsightMeetingModalOpen}
          />
        )}
      </div>
    </>
  );
}
