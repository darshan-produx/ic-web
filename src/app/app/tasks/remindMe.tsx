'use client';
import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import Flatpickr from 'react-flatpickr';
import { compare2Objects } from '../../utils/constant';

const RemindMe = (props: any) => {
  const [RepeatedlyType, setRepeatedlyType] = useState('Daily');
  const [weeklyDay, setWeeklyDay] = useState<string[]>([]);
  const [date, setDate] = useState<number[]>([]);
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedDateTime, setSelectedDateTime] = useState<Date | null>();

  const toggleDay = useCallback((day: string) => {
    setWeeklyDay((prevSelectedDays: any) =>
      prevSelectedDays.includes(day)
        ? prevSelectedDays.filter((d: any) => d !== day)
        : [...prevSelectedDays, day]
    );
  }, []);

  const toggleDate = useCallback((day: number) => {
    setDate((prevSelectedDays: any) =>
      prevSelectedDays.includes(day)
        ? prevSelectedDays.filter((d: any) => d !== day)
        : [...prevSelectedDays, day]
    );
  }, []);

  const weekArr = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];

  const handleTimeChange = useCallback((selectedDates: any) => {
    if (selectedDates.length > 0) {
      const selectedTime = selectedDates[0]?.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
      setSelectedTime(selectedTime);
    }
  }, []);

  useEffect(() => {
    let response: any = '';

    if (props?.remindType === 'Never') {
      setRepeatedlyType('Daily');
      setSelectedDateTime(null);
      setSelectedTime('');
      if (date.length > 0) setDate([]);
      if (weeklyDay.length > 0) setWeeklyDay([]);
      response = '';
    } else if (props?.remindType === 'Once') {
      response = {
        type: 'Once',
        date: selectedDateTime,
      };
    } else if (props?.remindType === 'Repeatedly') {
      if (RepeatedlyType === 'Daily') {
        response = {
          type: 'Daily',
          time: selectedTime,
        };
      } else if (RepeatedlyType === 'Weekly') {
        response = {
          type: 'Weekly',
          days: weeklyDay,
          time: selectedTime,
        };
      } else if (RepeatedlyType === 'Monthly') {
        response = {
          type: 'Monthly',
          days: date,
          time: selectedTime,
        };
      }
    }

    if (
      response !== undefined &&
      !compare2Objects(response, props.reminderObj)
    ) {
      props?.setReminderObj(response);
    }
  }, [
    props?.remindType,
    RepeatedlyType,
    weeklyDay,
    date,
    selectedDateTime,
    selectedTime,
    props?.reminderObj,
    props?.setReminderObj,
  ]);

  useEffect(() => {
    if (props?.ele?.reminders) {
      if (props?.ele?.reminders?.type === 'Daily') {
        props?.setRemindType('Repeatedly');
        setRepeatedlyType('Daily');
        setSelectedTime(props?.ele?.reminders?.time || '');
      } else if (props?.ele?.reminders?.type === 'Weekly') {
        props?.setRemindType('Repeatedly');
        setRepeatedlyType('Weekly');
        setWeeklyDay(props?.ele?.reminders?.days || []);
        setSelectedTime(props?.ele?.reminders?.time || '');
      } else if (props?.ele?.reminders?.type === 'Monthly') {
        props?.setRemindType('Repeatedly');
        setRepeatedlyType('Monthly');
        setDate(props?.ele?.reminders?.days || []);
        setSelectedTime(props?.ele?.reminders?.time || '');
      } else if (props?.ele?.reminders?.type === 'Once') {
        setSelectedDateTime(props?.ele?.reminders?.date || null);
        props?.setRemindType('Once');
      }
    }
  }, [props?.ele?.reminders]);
  return (
    <div>
      <div className="flex flex-wrap justify-between my-2">
        <h6 className="text-[16px] text-[#344051] font-[400] my-1">
          Remind me,
        </h6>
        <div>
          <div className="flex flex-wrap my-2">
            <Link
              href={'#'}
              onClick={() => props?.setRemindType('Never')}
              className={`!outline-none rounded-r-none btn !py-[0.3rem] text-[14px]  hover:text-[#202B37] hover:bg-[#F2F4F7] ${
                props?.remindType === 'Never'
                  ? 'bg-[#F2F4F7] text-[#202B37] btn border-[#E2E8F0]'
                  : 'bg-white text-[#202B37] btn border-[#E2E8F0]'
              }`}
            >
              Never
            </Link>
            <button
              type="button"
              onClick={() => {
                setSelectedDateTime(null);
                props?.setRemindType('Once');
              }}
              className={`!outline-none rounded-none btn !py-[0.3rem] text-[14px]  hover:text-[#202B37] hover:bg-[#F2F4F7] ${
                props?.remindType === 'Once'
                  ? 'bg-[#F2F4F7] text-[#202B37] btn border-[#E2E8F0]'
                  : 'bg-white text-[#202B37] btn border-[#E2E8F0]'
              }`}
            >
              Once
            </button>
            <button
              type="button"
              onClick={() => props?.setRemindType('Repeatedly')}
              className={`!outline-none rounded-l-none btn !py-[0.3rem] text-[14px]  hover:text-[#202B37] hover:bg-[#F2F4F7] ${
                props?.remindType === 'Repeatedly'
                  ? 'bg-[#F2F4F7] text-[#202B37] btn border-[#E2E8F0]'
                  : 'bg-white text-[#202B37] btn border-[#E2E8F0]'
              }`}
            >
              Repeatedly
            </button>
          </div>
        </div>
      </div>
      <div className="my-2">
        {props?.remindType === 'Once' && (
          <Flatpickr
            options={{
              enableTime: true,
              dateFormat: ' H:i K, d M, y ',
              minDate: 'today',
            }}
            value={selectedDateTime ? selectedDateTime : ''}
            onChange={(e: any) => setSelectedDateTime(e[0])}
            placeholder="Select date-time"
            className="form-input border-slate-200 dark:border-zinc-500 focus:outline-none focus:border-custom-500 disabled:bg-slate-100 dark:disabled:bg-zinc-600 disabled:border-slate-300 dark:disabled:border-zinc-500 dark:disabled:text-zinc-200 disabled:text-slate-500 dark:text-zinc-100 dark:bg-zinc-700 dark:focus:border-custom-800 placeholder:text-slate-400 dark:placeholder:text-zinc-200"
          />
        )}
        {props?.remindType === 'Repeatedly' && (
          <>
            <div
              className={`flex flex-wrap ${
                props?.alignment === 'update' ? '' : 'justify-center'
              } my-2`}
            >
              <button
                type="button"
                onClick={() => {
                  setRepeatedlyType('Daily');
                  setSelectedTime('');
                }}
                className={`!outline-none rounded-r-none btn !py-[0.3rem] text-[14px]  hover:text-[#202B37] hover:bg-[#F2F4F7] ${
                  RepeatedlyType === 'Daily'
                    ? 'bg-[#F2F4F7] text-[#202B37] btn border-[#E2E8F0]'
                    : 'bg-white text-[#202B37] btn border-[#E2E8F0]'
                }`}
              >
                Daily
              </button>
              <button
                type="button"
                onClick={() => {
                  setRepeatedlyType('Weekly');
                  setSelectedTime('');
                }}
                className={`!outline-none rounded-none btn !py-[0.3rem] text-[14px]  hover:text-[#202B37] hover:bg-[#F2F4F7] ${
                  RepeatedlyType === 'Weekly'
                    ? 'bg-[#F2F4F7] text-[#202B37] btn border-[#E2E8F0]'
                    : 'bg-white text-[#202B37] btn border-[#E2E8F0]'
                }`}
              >
                Weekly
              </button>
              <button
                type="button"
                onClick={() => {
                  setRepeatedlyType('Monthly');
                  setSelectedTime('');
                }}
                className={`!outline-none rounded-l-none btn !py-[0.3rem] text-[14px]  hover:text-[#202B37] hover:bg-[#F2F4F7] ${
                  RepeatedlyType === 'Monthly'
                    ? 'bg-[#F2F4F7] text-[#202B37] btn border-[#E2E8F0]'
                    : 'bg-white text-[#202B37] btn border-[#E2E8F0]'
                }`}
              >
                Monthly
              </button>
            </div>
            {RepeatedlyType === 'Weekly' && (
              <div className="flex justify-center my-2 w-full">
                {weekArr.map((ele: any, i) => (
                  <button
                    type="button"
                    key={ele}
                    onClick={() => toggleDay(ele)}
                    className={`!outline-none ${
                      i === 0
                        ? 'rounded-r-none'
                        : i === 6
                        ? 'rounded-l-none'
                        : 'rounded-none'
                    } btn !py-[0.3rem] !px-[0.9rem] text-[14px]  hover:text-[#202B37] hover:bg-[#F2F4F7] ${
                      weeklyDay.includes(ele)
                        ? 'bg-[#F2F4F7] text-[#202B37] btn border-[#E2E8F0]'
                        : 'bg-white text-[#202B37] btn border-[#E2E8F0]'
                    }`}
                  >
                    {ele.charAt(0)}
                  </button>
                ))}
              </div>
            )}
            {RepeatedlyType === 'Monthly' && (
              <div className="p-4">
                <div className="grid grid-cols-7">
                  {[...Array.from({ length: 31 }, (_, i) => i + 1)].map(
                    (date1: number, index: number) => (
                      <div
                        key={index}
                        onClick={() => toggleDate(date1)}
                        className={`!outline-none rounded-none cursor-pointer !text-center !border-[1px] p-1  hover:text-[#202B37] hover:bg-[#F2F4F7] ${
                          date.includes(date1)
                            ? 'bg-[#F2F4F7] text-[#202B37] btn border-[#E2E8F0]'
                            : 'bg-white text-[#202B37] btn border-[#E2E8F0]'
                        }`}
                      >
                        {date1}
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
            <div>
              <Flatpickr
                options={{
                  enableTime: true,
                  noCalendar: true,
                  dateFormat: 'H:i K',
                }}
                value={selectedTime}
                onChange={handleTimeChange}
                placeholder="Select Time"
                className="form-input border-slate-200 dark:border-zinc-500 focus:outline-none focus:border-custom-500 disabled:bg-slate-100 dark:disabled:bg-zinc-600 disabled:border-slate-300 dark:disabled:border-zinc-500 dark:disabled:text-zinc-200 disabled:text-slate-500 dark:text-zinc-100 dark:bg-zinc-700 dark:focus:border-custom-800 placeholder:text-slate-400 dark:placeholder:text-zinc-200"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RemindMe;
