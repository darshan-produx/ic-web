import dayjs from 'dayjs';
import React, { useState } from 'react';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/light.css';
import {
  useCreateCustomerOnboardingPlan,
  useUpdateCustomerOnboardingPlan,
} from '../../../../services/mutations/customer360StakeholderMutations';
import ConfirmationModal from '../../../../common/components/Modal/confirmationModal';
import { useQuery } from '@tanstack/react-query';
import { getAllTasksStatus } from '../../../api/tasks/tasks';
import TaskDetailedmodal from '../taskDetailedModal';
import { useUpdateTask } from '../../../../services/mutations/tasksMutations';
import { toast } from 'react-toastify';
import { CheckIcon } from '../../../assests/icons/icons';
import CreateOnboardingPlanModal from './createOnboardingPlanModal';
interface props {
  data: {
    customer_project_plan: CustomerProjectPlan;
    tasks: any;
  };
  customer_id: any;
  onboardingStatus: any;
  allAssignedCustomers: any;
}
interface CustomerProjectPlan {
  customer_id: number;
  project_type: string;
  status: string;
  task_ids: string[];
}

const OnboardingInProgress = ({
  data,
  customer_id,
  onboardingStatus,
  allAssignedCustomers,
}: props) => {
  const updateCustomerOnboardingPlan = useUpdateCustomerOnboardingPlan();
  const [ConfirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [planStartDate, setPlanStartDate] = useState('');
  const createCustomerOnboardingPlan = useCreateCustomerOnboardingPlan();
  const [createOnboardingPlanModal, setCreateOnboardingPlanModal] =
    useState<boolean>(false);
  const [
    skipOnboardingCirmationModalOpen,
    setSkipOnboardingCirmationModalOpen,
  ] = useState(false);
  const [task, setTask] = useState<any>();
  const handleCancel = () => {
    setConfirmationModalOpen(false);
  };
  const handleSkipOnboardingCancel = () => {
    setSkipOnboardingCirmationModalOpen(false);
  };
  const handleSubmit = async () => {
    const response = await updateCustomerOnboardingPlan.mutateAsync({
      customer_id: customer_id,
      status: 'Completed',
      completion_date: new Date(),
    });
    if (response?.status == 200 || response?.status == 201) {
      setConfirmationModalOpen(false);
      setSkipOnboardingCirmationModalOpen(false);
      toast.success('Onboarding completed.');
    }
  };

  const { data: statusArr } = useQuery({
    queryKey: ['statusArr'],
    queryFn: () => getAllTasksStatus(),
  });
  const startDate = new Date(
    Math.min(
      ...data?.tasks?.map((task: any) => new Date(task.planned_start_datetime))
    )
  );
  const endDate = new Date(
    Math.max(
      ...data?.tasks?.map((task: any) => new Date(task.planned_end_datetime))
    )
  );

  const generateDateArray = (start: Date, end: Date): Date[] => {
    const dates: Date[] = [];
    let currentDate = new Date(start);
    let count = 0;
    while (currentDate <= end || count < 32) {
      dates.push(new Date(currentDate.getTime()));
      currentDate.setDate(currentDate.getDate() + 1);
      count++;
    }
    return dates;
  };

  const dates = generateDateArray(startDate, endDate);

  // Get unique months with year (e.g., "February 2024")
  const months = Array.from(
    new Set(
      dates.map((date) =>
        date.toLocaleString('default', { month: 'long', year: 'numeric' })
      )
    )
  );

  const updateTask = useUpdateTask();
  const markAsDone = async (id: any) => {
    const doneStatusId = statusArr?.data?.data?.filter(
      (ele: any) => ele?.status_name == 'Done'
    )[0]?._id;
    const data = {
      _id: id,
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
  };

  const handleCreatePlanCancel = () => {
    setCreateOnboardingPlanModal(false);
  };

  const handleCreatePlanDate = async (startDate: any) => {
    if (startDate) {
      try {
        const payload = {
          customer_id: customer_id,
          startDate: startDate,
        };
        const res = await createCustomerOnboardingPlan.mutateAsync(payload);
        if (res?.status == 200 || res?.status == 201) {
          toast.success('Plan created successfully.');
          setCreateOnboardingPlanModal(false);
        }
      } catch (err: any) {
        toast.error(err?.response?.data?.message);
      }
    } else {
      toast.error('Please select start date.');
    }
  };
  const customerName = allAssignedCustomers?.data?.find(
    (customer: any) => customer?.customer_id == customer_id
  )?.customer_name;
  return (
    <>
      {!onboardingStatus?.customer_project_plan &&
      !onboardingStatus?.onboarding_done ? (
        <div className="border w-[1200px] border-gray-200 bg-[#F9FAFB] rounded-[12px] px-[20px] pt-[20px] pb-[16px]">
          <div
            // contentEditable={}
            // onClick={toggleExpand}
            className={`flex flex-col gap-[40px] py-[30px]  w-full justify-center items-center bg-[#F9FAFB]`}
            // style={{ minHeight: '400px', maxHeight: 'auto', resize: 'vertical' }}
          >
            <div className="flex flex-col gap-[12px] justify-center items-center">
              <span className="text-[20px] font-medium text-[#141C24]">
                Onboarding plan is not set for{' '}
                <span className="font-bold">{customerName}</span>
              </span>
              <span className="text-[14px] text-[#637083]">
                A step by step guide to onboard your customer
              </span>
            </div>
            <div className="flex gap-[20px]">
              <button
                className={
                  'text-[#141C24] text-[14px] font-semibold px-4 btn bg-white border-[#637083] '
                }
                onClick={(e) => {
                  e.stopPropagation();
                  setCreateOnboardingPlanModal(true);
                }}
              >
                Create onboarding plan
              </button>
              <button
                className={
                  'text-white text-[14px] font-medium px-4 btn bg-[#3B82F6] '
                }
                onClick={(e) => {
                  e.stopPropagation();
                  setSkipOnboardingCirmationModalOpen(true);
                }}
              >
                Skip onboarding
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg">
          <div
            // contentEditable={}
            // onClick={toggleExpand}
            className={`pt-4 rounded-xl w-full bg-white border-gray-300 overflow-hidden`}
            style={{
              minHeight: '100px',
              maxHeight: 'auto',
              resize: 'vertical',
            }}
          >
            <div className="flex justify-between px-4 pb-4">
              <div className="flex flex-col">
                <span className="text-[16px] text-gray-900 font-medium ">
                  Onboarding progress
                </span>
                <span className="text-xs text-gray-500 font-normal">
                  A step by step guide to onboard your customer
                </span>
              </div>
              <div>
                <button
                  className={
                    'text-white text-sm font-medium px-4 btn bg-custom-500 border-custom-500 hover:text-white hover:bg-custom-600 hover:border-custom-600 focus:text-white focus:bg-custom-600 focus:border-custom-600 focus:ring-custom-100 active:text-white active:bg-custom-600 active:border-custom-600  active:ring-custom-100 dark:ring-custom-400/20'
                  }
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmationModalOpen(true);
                  }}
                >
                  Mark onboarding complete
                </button>
              </div>
            </div>
            {/* Row for months */}
            <div className="flex" style={{}}>
              <div
                className="overflow-auto scroll w-full"
                style={{
                  resize: 'vertical',
                  height: data?.tasks.length <= 3 ? '276px' : '460px',
                }}
              >
                <div className="relative">
                  <table className=" border-collapse border-gray-400 overflow-y-auto">
                    <thead className="sticky top-0 z-20">
                      <tr className="">
                        {months.map((month, index) => (
                          <th
                            key={index}
                            colSpan={
                              dates.filter(
                                (date) =>
                                  date.toLocaleString('default', {
                                    month: 'long',
                                    year: 'numeric',
                                  }) === month
                              ).length
                            }
                            className=" border-[#CED2DA] text-start text-[#414E62] sticky top-0 first:border-0 border-l px-3 bg-gray-100 py-2 text-xs font-medium"
                          >
                            {month}
                          </th>
                        ))}
                      </tr>
                      <tr className="">
                        {dates &&
                          dates.map((date, index) => (
                            <td
                              key={index}
                              className={
                                date.toDateString() ===
                                new Date().toDateString()
                                  ? 'text-center text-xs font-normal text-white  bg-blue-500  mb-2'
                                  : 'text-center text-xs font-normal text-[#414E62] bg-gray-50  mb-2'
                              }
                            >
                              <div className="w-[36px] h-[56px] items-center justify-center flex">
                                {date.getDate()}
                              </div>
                            </td>
                          ))}
                      </tr>
                    </thead>
                    <tbody className="">
                      {data?.tasks?.map((task: any) => (
                        <tr className="border-t first:border-0 border-gray-200">
                          <td
                            colSpan={dates.findIndex(
                              (date) =>
                                date.toISOString() >=
                                task?.planned_start_datetime
                            )}
                            className={
                              dates.findIndex(
                                (date) =>
                                  date.toISOString() >=
                                  task?.planned_start_datetime
                              ) > 0
                                ? ' border-gray-400 py-2 text-center'
                                : 'hidden'
                            }
                          ></td>
                          <td
                            colSpan={
                              dates.length -
                              dates.findIndex(
                                (date) => date >= task?.planned_start_datetime
                              )
                            }
                            className=" border-gray-400 py-2 text-left "
                          >
                            <Tippy
                              content={<span className="">{task?.title}</span>}
                              className="p-1"
                              theme="light rounded-full"
                              placement="top-start"
                              arrow={true}
                              offset={[0, 6]}
                              followCursor={true}
                              interactive={false}
                              animation="scale"
                              duration={0}
                            >
                              <div
                                className={
                                  task?.is_completed === true
                                    ? 'flex relative z-10 cursor-pointer whitespace-nowrap text-nowrap text-sm text-white font-medium items-center gap-[6px] bg-[#249782] rounded-lg h-[44px] z-100 px-[10px] '
                                    : task?.task_status_id?.status_name !==
                                      'New'
                                    ? 'flex relative z-10 cursor-pointer overflow-hidden whitespace-nowrap text-sm text-white font-medium items-center gap-[6px]  bg-[#3B82F6] rounded-lg h-[44px] z-100 px-[10px]'
                                    : new Date(task?.planned_end_datetime) <
                                        new Date() &&
                                      task?.is_completed !== true
                                    ? 'flex relative z-10 cursor-pointer overflow-hidden whitespace-nowrap text-sm text-gray-800 font-medium items-center gap-[6px] border border-gray-200 bg-[#FFEECC] rounded-lg h-[44px] z-100 px-[10px]'
                                    : 'flex relative z-10 cursor-pointer overflow-hidden whitespace-nowrap text-sm text-gray-800 font-medium items-center gap-[6px] border border-gray-200 bg-gray-100 rounded-lg h-[44px] z-100 px-[10px]'
                                }
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setTask(task);
                                  setShowDetailModal(true);
                                }}
                                style={{
                                  width: `${
                                    dayjs(task?.planned_end_datetime).diff(
                                      task?.planned_start_datetime,
                                      'day'
                                    ) * 38
                                  }px`,
                                }}
                              >
                                <div className="flex items-center gap-1 text-ellipsis overflow-hidden">
                                  <div className="flex items-center">
                                    {task?.is_completed !== true ? (
                                      <span
                                        className="flex items-center"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <input
                                          id="checkboxCircle1"
                                          className="size-4 p-1 border rounded-full appearance-none cursor-pointer bg-white border-gray-200"
                                          type="checkbox"
                                          value=""
                                          checked={task?.is_completed}
                                          onChange={(e) => {
                                            markAsDone(task._id),
                                              e.stopPropagation();
                                          }}
                                        />
                                      </span>
                                    ) : (
                                      <span
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <CheckIcon />
                                      </span>
                                    )}
                                  </div>

                                  {/* <div className="size-2 ltr:mr-1 rtl:ml-1 rounded-full inline-block bg-white "></div>{' '} */}
                                  <div className="text-ellipsis overflow-hidden">
                                    {task?.title}
                                  </div>
                                </div>
                              </div>
                            </Tippy>
                          </td>
                        </tr>
                      ))}
                      {[
                        ...Array(Math.max(6 - data?.tasks?.length, 0)).keys(),
                      ].map(() => (
                        <tr className="border-t first:border-0 border-gray-200">
                          <td>
                            <div className=" w-full h-[59px] "></div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {!dayjs().isBefore(startDate, 'day') &&
                    !dayjs().isAfter(endDate, 'day') && (
                      <div
                        className="absolute border-r top-[80px] left-[130px] bottom-0 z-[0] border-[#3B82F6]"
                        style={{
                          left: dayjs().diff(startDate, 'day') * 38 + 19 + 'px',
                        }}
                        // dayjs(startDate).diff(new Date(), 'day') * 40 + 20 + 'px',
                      ></div>
                    )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {ConfirmationModalOpen && (
        <ConfirmationModal
          header={
            data.tasks.filter((task: any) => task.is_completed === false)
              .length +
            ' ' +
            'tasks are pending'
          }
          modalOpen={ConfirmationModalOpen}
          handleCancel={handleCancel}
          handleYes={handleSubmit}
          yesText="Yes, mark completed"
          title="Do you want to mark all onboarding tasks as completed?"
        />
      )}
      {skipOnboardingCirmationModalOpen && (
        <ConfirmationModal
          header="Skip onboarding"
          modalOpen={skipOnboardingCirmationModalOpen}
          handleCancel={handleSkipOnboardingCancel}
          handleYes={handleSubmit}
          yesText="Yes, skip onboarding"
          title="Once you skip onboarding, you won't be able to start onboarding again. Do you want to skip onboarding?"
        />
      )}
      {createOnboardingPlanModal && (
        <CreateOnboardingPlanModal
          modalOpen={createOnboardingPlanModal}
          handleCreatePlan={handleCreatePlanDate}
          handleCancel={handleCreatePlanCancel}
          planStartDate={planStartDate}
        />
      )}

      {statusArr && (
        <TaskDetailedmodal
          taskStatus={statusArr?.data?.data}
          ele={task}
          setShowDetailModal={setShowDetailModal}
          showDetailModal={showDetailModal}
          done={task?.is_completed}
          isCustomerDropDownDisabled={true}
        />
      )}
    </>
  );
};

export default OnboardingInProgress;
