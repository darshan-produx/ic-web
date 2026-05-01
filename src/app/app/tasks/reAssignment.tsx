import { yupResolver } from '@hookform/resolvers/yup';
import { useState } from 'react';
import Flatpickr from 'react-flatpickr';
import { Controller, useForm } from 'react-hook-form';
import AsyncSelect from 'react-select/async';
import * as yup from 'yup';
import { emailRegEx } from '../../utils/constant';
import { useCheckDomain } from '../../../services/mutations/usersMutations';
import { useUpdateTask } from '../../../services/mutations/tasksMutations';
import { toast } from 'react-toastify';
const ReAssignment = (props: any) => {
  const [noOptionsMessage, setNoOptionsMessage] = useState(
    'Type at least 3 characters to see options'
  );
  const schema = yup.object({
    notes: yup.string(),
    assigneMail: yup.string().nullable(),
  });
  const checkDomain = useCheckDomain();
  const assigneArr = props?.existingUsers
    ?.map((ele: any) => {
      return ele.user?._id
        ? {
            name: ele.user?.first_name + ' ' + ele.user?.last_name,
            value: ele.user?._id,
            label: ele?.user?.email,
          }
        : {};
    })
    ?.filter((item: any) => Object.keys(item).length != 0);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });
  const [isCancelHovered, setIsCancelHovered] = useState(false);
  const updateTask = useUpdateTask();

  const fetchOptions = async (inputValue: any) => {
    if (inputValue.length < 3) {
      setNoOptionsMessage(`Type at least 3 characters to see options`);
      return [];
    } else {
      const assigneeArr2 = assigneArr?.filter((item: any) =>
        item?.label?.includes(inputValue)
      );
      if (assigneeArr2?.length > 0) {
        return assigneeArr2;
      } else {
        if (!emailRegEx.test(inputValue)) {
          setNoOptionsMessage('');
          return [];
        }
        try {
          const res = await checkDomain.mutateAsync({ email: inputValue });
          if (res?.data && (res?.status == 201 || res?.status == 200)) {
            setNoOptionsMessage('');
            return [
              { value: inputValue, label: 'invite ' + inputValue, name: '' },
            ];
          } else {
            setNoOptionsMessage(
              `Assignment to users in ${inputValue?.split('@')[1]} not allowed`
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
  const loadOptions = (inputValue: any, callback: any) => {
    fetchOptions(inputValue).then((options: any) => callback(options));
  };

  const onSubmitHandler = async (data: any) => {
    const assigneeMail = data?.assigneMail;
    delete data?.assigneMail;
    if (!emailRegEx.test(assigneeMail)) {
      data.assignee_id = assigneeMail;
    } else {
      data.assignee_email = assigneeMail;
    }
    if (props?.selectDate) {
      data.target_date = props?.selectDate;
    }
    data = {
      ...data,
      _id: props?.ele?._id,
    };
    try {
      const res = await updateTask?.mutateAsync(data);
      if (res?.status == 200 || res?.status == 201) {
        toast?.success('Task updated successfully.');
        props?.onHide();
        reset();
        props?.setSelectDate(null);
      }
    } catch (err: any) {
      toast?.error(err?.message);
      props?.onHide();
      reset();
      props?.setSelectDate(null);
    }
  };

  const CustomOption = ({ innerRef, innerProps, data }: any) => (
    <div
      ref={innerRef}
      {...innerProps}
      className="custom-option p-1 hover:bg-[#F2F4F7] hover:text-[#202B37]"
    >
      <div className="custom-option-content">
        <div className="flex ">
          <div className="relative inline-block shrink-0">
            <div className="">
              {data?.name != '' ? (
                <div className="flex">
                  <div className="flex items-center justify-center w-8 h-8 my-auto mr-2 bg-[#F2F4F7] text-[#202B37] rounded-full font-bold text-[10px]">
                    {`${data?.name
                      ?.split(' ')[0]
                      ?.charAt(0)
                      ?.toUpperCase()}${data?.name
                      ?.split(' ')[1]
                      ?.charAt(0)
                      ?.toUpperCase()}`}
                  </div>
                </div>
              ) : (
                ''
              )}
            </div>
            {/* <span className="-top-1 ltr:-right-1 rtl:-left-1 absolute size-2.5 bg-green-400 border-2 border-white rounded-full dark:border-zink-600"></span> */}
          </div>
          <div>
            <h6 className="text-12">{data?.name}</h6>
            <p className="text-slate-500 dark:text-zink-300">{data?.label}</p>
          </div>
        </div>
      </div>
    </div>
  );
  return (
    <div className="">
      <form onSubmit={handleSubmit(onSubmitHandler)}>
        <div className="mt-[-3px]">
          <h2>{props?.ele?.title}</h2>
          <p>{props?.ele?.account}</p>
        </div>
        <div className="my-2">
          <textarea
            {...register('notes')}
            name="notes"
            id="notes"
            rows={2}
            cols={40}
            className="outline-none  text-[16px] text-[#141C24]  !border-none  placeholder:text-[#97A1AF]"
            placeholder="Add notes"
          ></textarea>
        </div>
        <div className="flex flex-wrap justify-between gap-2 my-2">
          <div>Assigned to</div>
          <div className="w-[50%]">
            <Controller
              name="assigneMail"
              control={control}
              render={({ field }) => (
                <AsyncSelect
                  {...field}
                  className="border-slate-100 dark:border-zinc-500 w-full focus:outline-none focus:border-custom-500 disabled:bg-slate-100 dark:disabled:bg-zinc-600 disabled:border-slate-300 dark:disabled:border-zinc-500 dark:disabled:text-zinc-200 disabled:text-slate-500 dark:text-zinc-100 dark:bg-zinc-700 dark:focus:border-custom-800 placeholder:text-slate-400 dark:placeholder:text-zinc-200 z-[9999]"
                  id="choices-multiple-remove-button"
                  placeholder="Enter name or email"
                  loadOptions={loadOptions}
                  isClearable
                  onChange={(selected: any) =>
                    field.onChange(selected ? selected?.value : null)
                  }
                  value={assigneArr?.find(
                    (supervisor: any) => supervisor.value === field.value
                  )}
                  noOptionsMessage={() => (
                    <span className="text-red-500">{noOptionsMessage}</span>
                  )}
                  menuPlacement="top"
                  components={{ Option: CustomOption }}
                />
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
              value={props?.selectDate}
              onChange={(e: any) => props?.setSelectDate(e[0])}
              placeholder="DD-MMM-YY"
              className="form-input border-slate-200 dark:border-zink-500 focus:outline-none focus:border-custom-500 disabled:bg-slate-100 dark:disabled:bg-zink-600 disabled:border-slate-300 dark:disabled:border-zink-500 dark:disabled:text-zink-200 disabled:text-slate-500 dark:text-zink-100 dark:bg-zink-700 dark:focus:border-custom-800 placeholder:text-slate-400 dark:placeholder:text-zink-200"
            />
          </div>
        </div>
        <div className="border-t-[1px] border-[#97A1AF] my-2">
          <div className="flex flex-wrap gap-2 my-2 float-end">
            <button
              type="button"
              onClick={() => {
                props?.onHide();
                props?.setSelectDate(null);
              }}
              onMouseEnter={() => setIsCancelHovered(true)}
              onMouseLeave={() => setIsCancelHovered(false)}
              className={`btn border-custom-500 hover:text-white hover:bg-custom-600 hover:border-custom-600 focus:text-white focus:bg-custom-600 focus:border-custom-600 focus:ring focus:ring-custom-100 active:text-white active:bg-custom-600 active:border-custom-600 active:ring active:ring-custom-100 dark:bg-zink-700 dark:hover:bg-custom-500 dark:ring-custom-400/20 dark:focus:bg-custom-500 ${
                isCancelHovered
                  ? 'bg-custom-600 text-white'
                  : 'bg-white text-custom-500'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`btn border-custom-500 focus:ring focus:ring-custom-100 active:ring active:ring-custom-100 dark:ring-custom-400/20 ${
                isCancelHovered
                  ? 'bg-white text-custom-500 hover:text-white hover:bg-custom-600 hover:border-custom-600 focus:text-white focus:bg-custom-600 focus:border-custom-600 active:text-white active:bg-custom-600 active:border-custom-600 dark:bg-zink-700 dark:hover:bg-custom-500 dark:focus:bg-custom-500'
                  : 'bg-custom-600 text-white hover:text-white hover:bg-custom-600 hover:border-custom-600 focus:text-white focus:bg-custom-600 focus:border-custom-600 active:text-white active:bg-custom-600 active:border-custom-600 dark:bg-zink-700 dark:hover:bg-custom-500 dark:focus:bg-custom-500'
              }`}
            >
              Done
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ReAssignment;
