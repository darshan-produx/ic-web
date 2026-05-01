import { yupResolver } from '@hookform/resolvers/yup';
import Modal from '../../../../common/components/Modal';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import Flatpickr from 'react-flatpickr';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AddNewProjectCalenderIcon } from '../../../assests/icons/icons';
import { getCustomerProjectConfig } from '../../../api/config/customer_project_config';
import { useCreateCustomerProjectPlan } from '../../../../services/mutations/customer360StakeholderMutations';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);
dayjs.extend(customParseFormat);
dayjs.extend(relativeTime);
const schema = yup.object({
  project_name: yup.string().required('Requires project name title'),
});

export default function AddNewProjectModal({
  addNewProjectModal,
  setAddNewProjectModal,
  customerId,
  setSelectedProject,
}: any) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm({
    resolver: yupResolver(schema),
  });
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [date, setdate] = useState<Date | null>();
  const { data: customerProjectConfig } = useQuery({
    queryKey: ['customer-project-config'],
    queryFn: () => getCustomerProjectConfig(),
  });
  function capitalizeFirstLetter(name: string): string {
    if (!name) return '';
    return name
      .trim()
      .split(/\s+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
  const handleDateChange = (selectedDates: Date[]) => {
    if (selectedDates.length > 0) {
      const picked = dayjs(selectedDates[0]);
      const utcMidnight = dayjs
        .utc(`${picked.format('YYYY-MM-DD')}T00:00:00.000Z`)
        .toDate();
      setdate(utcMidnight);
    }
  };
  const createCustomerProjectPlan = useCreateCustomerProjectPlan();
  const onSubmitHandler = async (data: any) => {
    if (!customerId) return;
    const payload =
      selectedProjectId !== 'blankproject'
        ? {
          ...data,
          start_date: dayjs(date).utc().startOf('day').toISOString(),
          project_config_id: selectedProjectId,
          customerId,
        }
        : {
          ...data,
          start_date: dayjs(date).utc().startOf('day').toISOString(),
          customerId,
        };
    try {
      const response = await createCustomerProjectPlan.mutateAsync(payload);
      if (response.status === 200 || response.status === 201) {
        toast.success('Customer project plan created successfully.');
        setSelectedProject('');
        setAddNewProjectModal(false);
        reset();
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message);
      setAddNewProjectModal(false);
    }
  };
  const project_name = watch('project_name');
  const enable = selectedProjectId && date && project_name;
  const handleIconClick = () => {
    const input: any = document.querySelector('.flatpickr-input1');
    if (input) {
      input?.focus();
    }
  };
  const checkProjectDate = (date: Date): string => {
    const today = dayjs().startOf('day');
    const target = dayjs(date).startOf('day');
    const diffDays = target.diff(today, 'day');

    const messages = {
      0: 'Today',
      1: '1 day to go',
      2: '2 days to go',
      [-1]: 'Yesterday',
      [-2]: '2 days ago',
    } as { [key: number]: string };

    return messages[diffDays] ?? dayjs().to(date);
  };

  return (
    <form className="p-2" onSubmit={handleSubmit(onSubmitHandler)}>
      <Modal
        show={addNewProjectModal}
        onHide={() => setAddNewProjectModal(false)}
        id="defaultModal"
        modal-center="true"
        className="fixed flex flex-col transition-all duration-300 ease-in-out left-2/4 z-drawer -translate-x-2/4 -translate-y-2/4"
        dialogClassName="w-screen md:w-[720px] overflow-hidden bg-white shadow rounded-[12px] dark:bg-zink-600"
      >
        <Modal.Body className="custom-modal-body scroll max-h-[calc(theme('height.screen')_-_200px)] pt-[16px] px-[24px] overflow-y-auto">
          <div className="mb-[24px]">
            <div className="flex  items-center justify-between">
              <input
                {...register('project_name')}
                type="text"
                name="project_name"
                placeholder="Enter a project name"
                className="py-[8px] w-full text-[#202B37]  text-[18px] font-medium outline-none bg-white placeholder:text-[18px] placeholder:text-[#97A1AF]"
              />
            </div>{' '}
            <span className="text-[14px] text-[#F64C4C]">
              {errors?.project_name?.message}
            </span>
          </div>
          <div
            className="mb-[24px] min-w-[241px] w-fit border-[1px] border-[#E4E7EC] rounded-md px-4 py-2 cursor-pointer"
            onClick={handleIconClick}
            aria-label="Open date picker"
          >
            <div className="flex gap-[6px] items-center flex-auto min-w-0">
              <AddNewProjectCalenderIcon />
              {date && dayjs(date).isAfter(dayjs(), 'day') ? (
                <span className="text-[14px] text-[#141C24]">
                  Project starts on
                </span>
              ) : date && dayjs(date).isBefore(dayjs(), 'day') ? (
                <span className="text-[14px] text-[#141C24]">
                  Project started on
                </span>
              ) : null}
              <Flatpickr
                options={{
                  dateFormat: 'M d, Y',
                  disable: [
                    function (date) {
                      return date.getDay() === 0 || date.getDay() === 6;
                    },],
                }}
                onChange={handleDateChange}
                // name=""
                value={date ?? ''}
                placeholder={`Select project starting date`}
                className={`form-input !text-[14px] !m-0 p-0 border-none !font-[400] w-fit !text-[#141C24]  placeholder:text-[14px] placeholder:text-[#97A1AF] dark:border-zinc-500  focus:outline-none focus:border-gray-500 disabled:bg-slate-100 dark:disabled:bg-zinc-600 disabled:border-slate-300 dark:disabled:border-zinc-500 dark:disabled:text-zinc-200 disabled:text-slate-500 dark:text-zinc-100 dark:bg-zinc-700 dark:focus:border-custom-800 dark:placeholder:text-zinc-200 flatpickr-input1`}
                style={{
                  width: date ? '11ch' : '100%',
                }}
              />
              {date ? (
                <span className="text-[14px] text-[#141C24]">
                  | {checkProjectDate(date)}
                </span>
              ) : null}
            </div>
          </div>
          <div className="mb-[24px] flex flex-col">
            <span className="text-[14px] text-[#202B37] font-normal mb-2">
              Select playbook
            </span>
            <ul className="flex gap-4 flex-wrap">
              <li
                key={'blankproject'}
                className={`font-semibold text-16 px-6 py-3 rounded-lg cursor-pointer ${selectedProjectId === 'blankproject'
                  ? 'border-[1px] border-[#1A75FF] text-[#1A75FF] '
                  : 'border-[1px] border-[#CED2DA] text-[#344051] '
                  }`}
                onClick={() => {
                  setSelectedProjectId('blankproject');
                }}
              >
                {'Blank Project'}
              </li>
              {customerProjectConfig?.data?.data.map(
                (config: any, i: number) => (
                  <li
                    key={config?._id}
                    className={`font-semibold text-16 px-6 py-3 rounded-lg cursor-pointer ${selectedProjectId === config?._id
                      ? 'border-[1px] border-[#1A75FF] text-[#1A75FF] '
                      : 'border-[1px] border-[#CED2DA] text-[#344051] '
                      }`}
                    onClick={() => {
                      setSelectedProjectId(config?._id);
                    }}
                  >
                    {capitalizeFirstLetter(config?.name)}
                  </li>
                )
              )}
            </ul>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <div className="flex justify-end border-t-[1px] border-[#E4E7EC] gap-2 p-5">
            <button
              className="py-[10px] px-3 border-[1px] border-[#637083] text-[14px] font-semibold text-[#637083] rounded-md"
              onClick={() => {
                reset();
                setSelectedProjectId('');
                setdate(null);
                setAddNewProjectModal(false);
              }}
            >
              Cancel
            </button>
            <button
              className={`py-[10px] text-[#FFFFFF] px-5 text-[14px] font-semibold  rounded-md ${enable
                ? 'bg-[#1A75FF] cursor-pointer'
                : 'bg-[#CCE0FF] cursor-not-allowed'
                }`}
              type="submit"
              disabled={!enable || isSubmitting}
            >
              Add Project
            </button>
          </div>
        </Modal.Footer>
      </Modal>
    </form>
  );
}
