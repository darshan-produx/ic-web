'use client';
import Flatpickr from 'react-flatpickr';
import RemindMe from './remindMe';
import * as yup from 'yup';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useState } from 'react';
import { useCreateTask } from '../../../services/mutations/tasksMutations';
import AsyncSelect from 'react-select/async';
import { toast } from 'react-toastify';
import { useCheckDomain } from '../../../services/mutations/usersMutations';
import { emailRegEx } from '../../utils/constant';
import { localToUtc, utcToLocal } from '../../utils/date-util';

const AddNewTask = (props: any) => {
  const [showAssignee, setShowAssignee] = useState(false);
  const [selectedValue, setSelectedValue] = useState(0);
  const [isCancelHovered, setIsCancelHovered] = useState(false);
  const [reminderObj, setReminderObj] = useState<any>('');
  const [noOptionsMessage, setNoOptionsMessage] = useState(
    'Type at least 3 characters to see options'
  );

  const schema = yup.object({
    title: yup.string().required('Please enter title'),
    notes: yup.string(),
    assigneMail: yup.string().nullable(),
    customer_id: yup.number(),
    is_critical: yup.boolean().default(false),
  });

  const allCustomers = props?.allCustomers;
  const addTask = useCreateTask();
  const checkDomain = useCheckDomain();

  const newTaskStatusId = props?.statusArr?.find(
    (item: any) => item?.status_name === 'New'
  )?._id;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedValue(Number(e.target.value));
  };

  const assigneArr = props?.existingUsers
    ?.map((ele: any) =>
      ele.user?._id
        ? {
            name: `${ele.user?.first_name} ${ele.user?.last_name}`,
            value: ele.user?._id,
            label: ele?.user?.email,
          }
        : null
    )
    ?.filter(Boolean);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmitHandler = async (data: any) => {
    const assigneeMail = data?.assigneMail;
    delete data?.assigneMail;

    data = {
      ...data,
      reminders: reminderObj,
      target_date: props?.selectDate,
      task_status_id: newTaskStatusId,
      assignee_id:
        showAssignee && !emailRegEx.test(assigneeMail)
          ? assigneeMail
          : props?.userDetails?.id,
      assignee_email:
        showAssignee && emailRegEx.test(assigneeMail)
          ? assigneeMail
          : props?.userDetails?.id,
      guidance_id: props.guidanceId,
      recipe_tree_node_id: props.recipeTreeNodeId,
    };

    if (!data?.assignee_id) delete data?.assignee_id;
    if (!data?.assignee_email) delete data?.assignee_email;

    try {
      const res = await addTask?.mutateAsync(data);
      if (res.status === 200 || res.status === 201) {
        toast.success('Task added successfully.');
      }
    } catch (err: any) {
      toast.error(err?.message);
    }
    props?.onHide();
    reset();
    props?.setSelectedDate(null);
  };

  const fetchOptions = async (inputValue: string) => {
    if (inputValue.length < 3) {
      setNoOptionsMessage('Type at least 3 characters to see options');
      return [];
    } else {
      const filteredAssignees = assigneArr?.filter((item: any) =>
        item?.label?.includes(inputValue)
      );
      if (filteredAssignees?.length > 0) {
        return filteredAssignees;
      } else {
        if (!emailRegEx.test(inputValue)) {
          setNoOptionsMessage('');
          return [];
        }
        try {
          const res = await checkDomain.mutateAsync({ email: inputValue });
          if (res?.data && (res?.status === 201 || res?.status === 200)) {
            setNoOptionsMessage('');
            return [
              { value: inputValue, label: `invite ${inputValue}`, name: '' },
            ];
          } else {
            setNoOptionsMessage(
              `Assignment to users in ${inputValue.split('@')[1]} not allowed`
            );
            return [];
          }
        } catch (err) {
          setNoOptionsMessage('Error fetching options');
          return [];
        }
      }
    }
  };

  const loadOptions = (
    inputValue: string,
    callback: (options: any[]) => void
  ) => {
    fetchOptions(inputValue).then(callback);
  };

  const CustomOption = ({ innerRef, innerProps, data }: any) => (
    <div
      ref={innerRef}
      {...innerProps}
      className="custom-option p-1 hover:bg-[#F2F4F7] hover:text-[#202B37]"
    >
      <div className="custom-option-content flex">
        <div className="relative inline-block shrink-0">
          <div className="flex items-center justify-center w-8 h-8 bg-[#F2F4F7] text-[#202B37] rounded-full font-bold text-[10px]">
            {`${data?.name?.split(' ')[0]?.charAt(0).toUpperCase()}${data?.name
              ?.split(' ')[1]
              ?.charAt(0)
              .toUpperCase()}`}
          </div>
        </div>
        <div className="ml-2">
          <h6 className="text-12">{data?.name}</h6>
          <p className="text-slate-500 dark:text-zinc-300">{data?.label}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-2 ">
      <form onSubmit={handleSubmit(onSubmitHandler)}>
        <div className="mt-[-3px]">
          <input
            {...register('title')}
            type="text"
            id="title"
            className="outline-none text-[18px] text-[#141C24] !border-none placeholder:text-[#97A1AF]"
            placeholder="Add task name"
          />
          <p className="text-start text-xs text-red-500 font-semibold pt-1">
            {errors?.title?.message}
          </p>
        </div>
        <div className="my-2">
          <select
            {...register('customer_id')}
            id="customer_id"
            onChange={handleChange}
            className={`border-none outline-none text-[12px] w-1/3 ${
              selectedValue === 0 ? 'text-[#97A1AF]' : 'text-[#141C24]'
            }`}
          >
            <option className="hidden" value={0}>
              Select customer
            </option>
            {allCustomers?.data?.data?.map((ele: any, index: number) => (
              <option
                key={index}
                value={ele?.customer_id}
                className="text-black p-3 text-[12px]"
              >
                {ele?.customer_name?.charAt(0)?.toUpperCase() +
                  ele?.customer_name?.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div className="my-2">
          <textarea
            {...register('notes')}
            id="notes"
            rows={2}
            className="outline-none text-[16px] text-[#141C24] !border-none placeholder:text-[#97A1AF]"
            placeholder="Add description"
          ></textarea>
        </div>
        <div className="flex flex-wrap justify-between gap-2 my-2">
          <div>Create task</div>
          <div className="group flex flex-wrap">
            <button
              type="button"
              onClick={() => setShowAssignee(false)}
              className={`${
                showAssignee
                  ? 'bg-white text-[#202B37] btn border-[#E2E8F0]'
                  : 'bg-[#F2F4F7] text-[#202B37] btn border-[#E2E8F0]'
              } !outline-none rounded-r-none`}
            >
              For me
            </button>
            <button
              type="button"
              onClick={() => setShowAssignee(true)}
              className={`${
                !showAssignee
                  ? 'bg-white text-[#202B37] btn border-[#E2E8F0]'
                  : 'bg-[#F2F4F7] text-[#202B37] btn border-[#E2E8F0]'
              } !outline-none rounded-l-none`}
            >
              For someone
            </button>
          </div>
        </div>
        {showAssignee && (
          <div className="flex flex-wrap justify-between gap-2">
            <div>Assigned to</div>
            <div className="w-[50%]">
              <Controller
                name="assigneMail"
                control={control}
                render={({ field }) => (
                  <AsyncSelect
                    {...field}
                    className="border-slate-100 dark:border-zinc-500 w-full focus:outline-none focus:border-custom-500 disabled:bg-slate-100 dark:disabled:bg-zinc-600 disabled:border-slate-300 dark:disabled:border-zinc-500 dark:disabled:text-zinc-200 disabled:text-slate-500 dark:text-zinc-100 dark:bg-zinc-700 dark:focus:border-custom-800 placeholder:text-slate-400 dark:placeholder:text-zinc-200 z-[9999]"
                    placeholder="Enter name or email"
                    loadOptions={loadOptions}
                    isClearable
                    onChange={(selected: any) =>
                      field.onChange(selected ? selected.value : null)
                    }
                    value={assigneArr?.find(
                      (assignee: any) => assignee.value === field.value
                    )}
                    noOptionsMessage={() => (
                      <span className="text-red-500">{noOptionsMessage}</span>
                    )}
                    menuPlacement="top"
                    components={{ Option: CustomOption }}
                  />
                )}
              />
              <p className="text-start text-xs text-red-500 font-semibold pt-1">
                {errors?.assigneMail?.message}
              </p>
            </div>
          </div>
        )}
        <RemindMe
          setReminderObj={setReminderObj}
          reminderObj={reminderObj}
          remindType={props?.remindType}
          setRemindType={props?.setRemindType}
        />
        <div className="flex flex-wrap justify-between gap-2 my-2">
          <div>Critical</div>
          <div className="w-[50%]">
            <Controller
              name="is_critical"
              control={control}
              render={({ field }) => (
                <div className="relative w-[32px] h-[16px] rounded-full cursor-pointer float-start">
                  <label className="cursor-pointer">
                    <input
                      {...register('is_critical')}
                      type="checkbox"
                      className="sr-only peer"
                    />
                    <div
                      className={`w-full h-full bg-gray-500 border-[0.5px] border-gray-500 rounded-full peer-focus:outline-none 
                      ${
                        field.value
                          ? 'bg-green-500 peer-checked:bg-green-500'
                          : ''
                      }`}
                    >
                      <div
                        className={`absolute top-[3px] left-[2px] bg-white rounded-full h-[10px] w-[10px] transition-transform 
                        ${field.value ? 'translate-x-[16px]' : ''}`}
                      ></div>
                    </div>
                  </label>
                </div>
              )}
            />
          </div>
        </div>
        <div className="flex flex-wrap justify-between gap-2">
          <div>Due on</div>
          <div>
            <Flatpickr
              options={{
                dateFormat: 'd-M-y',
                minDate: 'today',
              }}
              onChange={(value) => props?.setSelectedDate(localToUtc(value[0]))}
              name="target_date"
              value={utcToLocal(props?.selectDate)}
              placeholder="DD-MMM-YY"
              className="form-input border-slate-200 dark:border-zinc-500 focus:outline-none focus:border-custom-500 disabled:bg-slate-100 dark:disabled:bg-zinc-600 disabled:border-slate-300 dark:disabled:border-zinc-500 dark:disabled:text-zinc-200 disabled:text-slate-500 dark:text-zinc-100 dark:bg-zinc-700 dark:focus:border-custom-800 placeholder:text-slate-400 dark:placeholder:text-zinc-200"
            />
          </div>
        </div>
        <div className="h-[8vh]">
          <div className="border-t-[1px] border-[#97A1AF] my-2">
            <div className="flex flex-wrap gap-2 my-2 float-end">
              <button
                type="button"
                onClick={() => {
                  props?.onHide();
                  reset();
                }}
                onMouseEnter={() => setIsCancelHovered(true)}
                onMouseLeave={() => setIsCancelHovered(false)}
                className={`btn border-custom-500 hover:text-white hover:bg-custom-600 hover:border-custom-600 focus:text-white focus:bg-custom-600 focus:border-custom-600 dark:bg-zinc-700 dark:hover:bg-custom-500 ${
                  isCancelHovered
                    ? 'bg-custom-600 text-white'
                    : 'bg-white text-custom-500'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`btn border-custom-500 focus:ring focus:ring-custom-100 dark:ring-custom-400/20 ${
                  isCancelHovered
                    ? 'bg-white text-custom-500 hover:text-white hover:bg-custom-600'
                    : 'bg-custom-600 text-white'
                }`}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddNewTask;
