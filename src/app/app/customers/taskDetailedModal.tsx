import Modal from '../../../../../common/components/Modal';
import dayjs from 'dayjs';
import { useCallback, useState } from 'react';
import {
  useDeleteTask,
  useUpdateTask,
} from '../../../services/mutations/tasksMutations';
import { toast } from 'react-toastify';
import CreateNewTask from '../tasks/createNewTask';
import DeleteModal from '../../../common/components/DeleteModal';
import { useQuery } from '@tanstack/react-query';
import { getCustomers } from '../../api/customers/customers';
import { getUsersForTask } from '../../api/users/users';
import { apiRequest } from '../../../common/api-request';

const TaskDetailedmodal = (props: any) => {
  const [showScheduler2, setShowScheduler2] = useState<boolean>(false);
  const [isCancelHovered, setIsCancelHovered] = useState(false);
  const [reminderObj, setReminderObj] = useState<any>('');
  const [remindType, setRemindType] = useState('Never');
  const [show, setShow] = useState<boolean>(false);
  const [deleteModal, setDeleteModal] = useState<boolean>(false);
  const deleteTask = useDeleteTask();
  const { data: allCustomers } = useQuery({
    queryKey: ['allCustomers'],
    queryFn: getCustomers,
  });
  const { data: existingUsers } = useQuery({
    queryKey: ['users'],
    queryFn: getUsersForTask,
  });
  const { data: userinfo } = useQuery({
    queryKey: ['userDetails'],
    queryFn: () =>
      apiRequest({
        url: '/api/app-service/v1/userinfo?is_email_encrypt=true',
      }),
    refetchOnWindowFocus: false,
  });

  const toggleDetailModal = useCallback(() => {
    props?.setShowDetailModal((prevShow: any) => !prevShow);
  }, []);
  const toggle = useCallback(() => {
    setShow((prevShow) => !prevShow);
  }, []);
  const toggleScheduler2 = useCallback(() => {
    setShowScheduler2((prevShow) => !prevShow);
  }, []);
  const updateTask = useUpdateTask();
  const markAsDone = async () => {
    const doneStatusId = props?.taskStatus?.filter(
      (ele: any) => ele?.status_name == 'Done'
    )[0]?._id;
    const data = {
      _id: props?.ele?._id,
      task_status_id: doneStatusId,
      is_completed: true,
    };
    try {
      const res = await updateTask?.mutateAsync(data);
      if (res?.status == 200 || res?.status == 201) {
        toast?.success('Task completed.');
      }
    } catch (err: any) {
      toast?.error(err?.message);
    }
    toggleDetailModal();
  };

  const handleDelete = async () => {
    try {
      const res = await deleteTask.mutateAsync(props?.ele?._id);
      if (res?.status == 200 || res?.status == 201) {
        setDeleteModal(false);
        props?.setShowDetailModal(false);
        toast.success('Task deleted successfully.');
      }
    } catch (err: any) {
      toast.error(err.message);
    }
  };
  const deleteToggle = () => {
    setDeleteModal(!deleteModal);
  };

  return (
    <div>
      <Modal
        show={props?.showDetailModal}
        onHide={toggleDetailModal}
        id="defaultModal"
        modal-center="true"
        className="fixed flex flex-col transition-all duration-300 ease-in-out left-2/4 z-drawer -translate-x-2/4 -translate-y-2/4"
        dialogClassName="w-screen md:w-[750px] bg-white shadow rounded-md dark:bg-zink-600"
      >
        <Modal.Body className="max-h-[calc(theme('height.screen')_-_61px)] overflow-y-auto barScroll">
          <div className="px-4 py-4">
            <CreateNewTask
              onHide={toggleDetailModal}
              allCustomers={allCustomers ?? []}
              ele={props?.ele}
              existingUsers={existingUsers?.data?.data}
              remindType={remindType}
              setRemindType={setRemindType}
              statusArr={props?.taskStatus}
              userDetails={userinfo?.data}
              isEditMode={true}
              setDeleteModal={setDeleteModal}
              markAsDone={markAsDone}
              done={props?.done}
              isCustomerDropDownDisabled={
                props?.isCustomerDropDownDisabled ?? false
              }
            />
          </div>

          <DeleteModal
            show={deleteModal}
            onHide={deleteToggle}
            onDelete={handleDelete}
          />
        </Modal.Body>
      </Modal>
    </div>
  );
};
export default TaskDetailedmodal;
