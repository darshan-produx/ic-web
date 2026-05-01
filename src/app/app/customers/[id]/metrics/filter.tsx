import dayjs from 'dayjs';
import React, { useEffect, useState, useRef } from 'react';
import { computeStartAndEndDate } from '../../../../utils/computeStartAndEndDate';
import { ChartModalCalenderIcon } from '../../../../../app/assests/icons/icons';
import Flatpickr from 'react-flatpickr';
import { Instance } from 'flatpickr/dist/types/instance';
interface FilterProps {
  filterType: 'daily' | 'weekly' | 'monthly';
  options: string[];
  onSelect: (startDate: string, endDate: string) => void;
}

const defaultOptions = {
  daily: '30D',
  weekly: '12W',
  monthly: '6M',
};

const Filter: React.FC<FilterProps> = ({ filterType, options, onSelect }) => {
  const [selectedOption, setSelectedOption] = useState(
    defaultOptions[filterType]
  );
  const [isPickerVisible, setPickerVisible] = useState(false);
  const flatpickrInstanceRef = useRef<Instance | null>(null);
  useEffect(() => {
    const defaultOption = defaultOptions[filterType];
    setSelectedOption(defaultOption);
  }, [filterType]);

  const handleSelect = (option: string) => {
    flatpickrInstanceRef.current?.clear();
    setSelectedOption(option);
    const { startDate, endDate } = computeStartAndEndDate(filterType, option);
    onSelect(startDate, endDate);
  };
  const handleIconClick = () => {
    setPickerVisible(!isPickerVisible);
    if (!isPickerVisible && flatpickrInstanceRef.current) {
      flatpickrInstanceRef.current.open();
      setSelectedOption('custom');
    } else if (isPickerVisible && flatpickrInstanceRef.current) {
      flatpickrInstanceRef.current?.close();
    }
  };
  return (
    <div className="flex justify-center items-center rounded-md">
      <div className="rounded-md flex flex-row justify-center items-center bg-[#FFFFFF] border border-[#D1CEDA] overflow-hidden">
        {options &&
          options.map((option) => (
            <button
              key={option}
              className={`w-[44px] h-8 flex flex-row justify-center items-center px-[11px] py-[6px] text-[14px] font-semibold text-[#344051] ${
                selectedOption === option
                  ? 'bg-[#E4E7EC] text-[#202B37]'
                  : 'bg-[#FFFFFF]'
              } border-r border-[#E4E7EC]`}
              onClick={() => handleSelect(option)}
            >
              {option}
            </button>
          ))}
        {
          <div
            id="flatpickr-input-chart"
            className={`relative min-w-[44px] max-w-[130px] justify-center items-center h-8 px-[11px] py-[6px] text-[14px] font-semibold text-[#344051] ${
              selectedOption === 'custom' ? 'bg-[#E4E7EC]' : 'bg-[#FFFFFF]'
            } border-r last:border-none border-[#E4E7EC]`}
            title="Start Date"
            onClick={handleIconClick}
          >
            {
              <Flatpickr
                options={{
                  dateFormat: 'M d, Y',
                  onOpen: () => setPickerVisible(true),
                  onClose: () => setPickerVisible(false),
                  positionElement: document.getElementById(
                    'flatpickr-input-chart'
                  ) as HTMLElement,
                  position: 'below center',
                  maxDate: dayjs().toDate(),
                }}
                onChange={(selectedDates: Date[]) => {
                  const endDate = dayjs().format('YYYY-MM-DD');
                  onSelect(
                    dayjs(selectedDates[0]).format('YYYY-MM-DD'),
                    endDate
                  );
                }}
                placeholder={'MMM DD, YYYY'}
                className={` ${
                  selectedOption === 'custom' ? 'bg-[#E4E7EC]' : 'null'
                }  ${
                  !isPickerVisible ? 'hidden' : 'null'
                } focus:outline-none focus:border-none focus:ring-0`}
                onReady={(selectedDates, dateStr, instance) => {
                  flatpickrInstanceRef.current = instance;
                }}
              />
            }
            {!isPickerVisible && (
              <button type="button" className="mx-1 my-0.5">
                <ChartModalCalenderIcon />
              </button>
            )}
          </div>
        }
      </div>
    </div>
  );
};

export default Filter;
