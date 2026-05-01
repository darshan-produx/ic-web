import React from 'react';
import { CalendarDays } from 'lucide-react';
import { useState } from 'react';
import Flatpickr from 'react-flatpickr';
function LastQBRdatepicker(props: any) {
  const { QBRDate, handleCreateLastQBRDate } = props;
  const [isOpen, setIsOpen] = useState(false);
  const handleDateChange = (selectedDates: Date[]) => {
    handleCreateLastQBRDate(selectedDates[0]);
    setIsOpen(false);
  };

  const handleIconClick = () => {
    const input: any = document.querySelector('.flatpickr-input');
    if (input) {
      input?.focus(); // Focus the input field to open the Flatpickr calendar
    }
  };
  return (
    <div
      className="flex items-center gap-[12px]text-nowrap gap-2 bg-white !w-[251px] border rounded-md border-[#E4E7EC] py-[10px] px-[12px] h-[40px] cursor-pointer"
      onClick={handleIconClick}
    >
      <span className="flex items-center gap-[7px]">
        <span className="flex items-center">
          <CalendarDays className="w-[15px] h-[16px] text-[#202b37]" />
        </span>
        <div className="text-[14px] text-[#141C24] flex text-nowrap">
          Last QBR Date
        </div>
      </span>
      <span className="text-[14px]">
        <Flatpickr
          onChange={handleDateChange}
          value={QBRDate || null}
          onOpen={() => setIsOpen(true)}
          onClose={() => setIsOpen(false)}
          options={{
            dateFormat: 'M d, Y',
            disableMobile: true,
          }}
          placeholder="MMM DD, YYYY"
          className="form-input placeholder:text-[14px] !text-[14px] !m-0 p-0 border-none !font-[500] !rounded-[6px]  !text-[#141C24] border-slate-200 dark:border-zinc-500 !w-full pr-[2px] focus:outline-none focus:border-gray-500 disabled:bg-slate-100 dark:disabled:bg-zinc-600 disabled:border-slate-300 dark:disabled:border-zinc-500 dark:disabled:text-zinc-200 disabled:text-slate-500 dark:text-zinc-100 dark:bg-zinc-700 dark:focus:border-custom-800 placeholder:text-slate-400 dark:placeholder:text-zinc-200"
        />
      </span>
    </div>
  );
}

export default LastQBRdatepicker;
