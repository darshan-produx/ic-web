import { useQuery } from '@tanstack/react-query';
import ListAllPriorityTasks from '../listAllPriorityTask';
import { getAllPriorityTasks } from '../../../../../app/api/tasks/tasks';
import { useState, useCallback } from 'react';
import Modal from '../../../../../common/components/Modal';
import CreateNewTask from '../../../tasks/createNewTask';
import { getCustomers } from '../../../../api/customers/customers';
import { getUsersForTask } from '../../../../api/users/users';
import { apiRequest } from '../../../../../common/api-request';
import { getAllTasksStatus } from '../../../../api/tasks/tasks';
export default function Tasks360({ id, isMyTeamPage }: any) {
  const [createTaskModalOpen, setCreateTaskModalOpen] = useState(false);
  const { data: allPriorityTasks } = useQuery({
    queryKey: ['getAllPriorityTasks', id],
    queryFn: () => getAllPriorityTasks(Number(id)),
    refetchOnWindowFocus: false,
  });
  const { data: allCustomers } = useQuery({
    queryKey: ['allCustomers'],
    queryFn: getCustomers,
  });
  const { data: existingUsers, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: getUsersForTask,
  });
  const { data: userinfo } = useQuery({
    queryKey: ['userDetails'],
    queryFn: () =>
      apiRequest({
        url: '/api/app-service/v1/userinfo?is_email_encrypt=true',
      }),
  });
  const { data: statusArr } = useQuery({
    queryKey: ['statusArr'],
    queryFn: () => getAllTasksStatus(),
  });
  const toggle = useCallback(() => {
    setCreateTaskModalOpen((prev) => !prev);
  }, []);
  return (
    <div className="mt-[20px]">
      <div className={isMyTeamPage ? '' : 'w-[1200px] mx-auto'}>
        {' '}
        <span
          className={`text-[14px] text-[#3B82F6] font-[400] ${isMyTeamPage ? 'pl-[18px]' : 'pl-[0px]'
            } cursor-pointer`}
          onClick={() => setCreateTaskModalOpen((prev) => !prev)}
        >
          <span className="text-[18px]">+</span> &nbsp;Create new
        </span>
        {allPriorityTasks?.data?.length > 0 ? (
          <ListAllPriorityTasks
            allPriorityTasks={allPriorityTasks?.data}
            isMyTeamPage={isMyTeamPage}
          />
        ) : (
          <div
            className={
              isMyTeamPage
                ? 'mx-auto h-fit text-gray-400 text-center border-[#E4E7EC] pt-1'
                : 'w-[1200px] mx-auto h-[430px] text-center pt-[146px]  gap-[10px]  border-[#E4E7EC] overflow-y-auto'
            }
          >
            No tasks
          </div>
        )}
      </div>

      <Modal
        show={createTaskModalOpen}
        onHide={toggle}
        id="defaultModal"
        modal-center="true"
        className="fixed flex flex-col transition-all duration-300 ease-in-out left-2/4 z-drawer -translate-x-2/4 -translate-y-2/4"
        dialogClassName="w-screen md:w-[750px] bg-white shadow rounded-md dark:bg-zink-600"
      >
        <Modal.Body className="max-h-[calc(theme('height.screen')_-_61px)] p-4 overflow-y-auto barScroll">
          {createTaskModalOpen && (
            <CreateNewTask
              onHide={toggle}
              allCustomers={allCustomers}
              existingUsers={existingUsers?.data?.data}
              statusArr={statusArr?.data?.data}
              userDetails={userinfo?.data}
              isEditMode={false}
              // isCustomerDropDownDisabled={true}
              customerId={id}
            />
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
}
