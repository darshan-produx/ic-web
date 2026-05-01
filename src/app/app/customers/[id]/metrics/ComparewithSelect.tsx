import { CompareWithSearchIcon } from '../../../../../app/assests/icons/icons';
import { Dropdown } from '../../../../../common/Dropdown';
import { ChevronDown } from 'lucide-react';
import React, { useState } from 'react';
type metricNameList = {
  chartId: string;
  metricName: string;
  metric_display_str: string;
  metric_type: string;
};
type ComparewithSelectProps = {
  handleMetricNameList: (metricNameList: metricNameList) => void;
  metricNameList: metricNameList[];
};

const ComparewithSelect: React.FC<ComparewithSelectProps> = ({
  handleMetricNameList,
  metricNameList,
}) => {
  const [searchText, setSearchText] = useState('');
  const regex = new RegExp(`(${escapeRegExp(searchText)})`, 'i');
  const newMetricNameList = metricNameList?.filter((item) =>
    regex.test(item.metric_display_str ?? item?.metricName)
  );
  function escapeRegExp(string: string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
  return (
    <Dropdown className="inline-flex !w-full">
      <Dropdown.Trigger
        type="button"
        className={
          'mt-3 mb-3 mr-5 ml-5 p-2 border border-dashed min-w-[810px] max-h-[64px] border-[#CED2DA] rounded-[12px] flex items-center justify-center '
        }
        id="dropdownMenuButton"
        data-bs-toggle="dropdown"
      >
        <div className="flex items-center">
          <span className="text-[16px] text-[#637083]">Compare with</span>
          <ChevronDown className="relative left-[6px] h-[20px] w-[20px] text-[#637083]" />
        </div>
      </Dropdown.Trigger>
      <Dropdown.Content
        placement="top-center"
        className={`absolute border border-gray-300 z-50 ltr:text-left rtl:text-right bg-white rounded-md dropdown-menu max-w-[280px]}
       dark:bg-zink-600`}
        aria-labelledby="dropdownMenuButton"
      >
        <ul aria-labelledby="dropdownMenuIconButton">
          <li className="p-[8px] mx-[6px] my-[8px] pl-[12px] rounded-[8px] border border-[#CED2DA]">
            <div className="flex items-center text-gray-400 max-w-[268px] max-h-[40px]">
              <CompareWithSearchIcon />
              <input
                type="text"
                placeholder="Search Metric"
                className="ml-1 outline-none bg-transparent placeholder-[#637083] text-gray-900 text-[16px]"
                value={searchText}
                onChange={(e: any) => setSearchText(e?.target?.value)}
              />
            </div>
          </li>
          <div className="max-h-[290px] max-w-[268px] overflow-auto scroll">
            {newMetricNameList?.filter(
              (item) => item?.metric_type?.toLowerCase() === 'adoption'
            ).length > 0 && (
              <div>
                <h2 className="text-[14px] font-semibold px-[8px]">Adoption</h2>
                {newMetricNameList
                  ?.filter(
                    (item) => item?.metric_type?.toLowerCase() === 'adoption'
                  )
                  ?.map((item) => (
                    <li
                      key={item?.chartId}
                      className="relative mx-[6px] my-[4px]"
                    >
                      <div
                        onClick={() => handleMetricNameList(item)}
                        className="px-[8px] py-[6px] cursor-pointer"
                      >
                        <span className="text-[16px] font-400 text-[#344051] close-dropdown">
                          {item?.metric_display_str ?? item?.metricName}
                        </span>
                      </div>
                    </li>
                  ))}
              </div>
            )}
            {newMetricNameList?.filter(
              (item) => item?.metric_type?.toLowerCase() === 'business'
            ).length > 0 && (
              <div>
                <h2 className="text-[14px] font-semibold px-[8px]">Impact</h2>
                {newMetricNameList
                  ?.filter(
                    (item) => item?.metric_type?.toLowerCase() === 'business'
                  )
                  ?.map((item) => (
                    <li
                      key={item?.chartId}
                      className="relative mx-[6px] my-[4px]"
                    >
                      <div
                        onClick={() => handleMetricNameList(item)}
                        className="px-[8px] py-[6px] cursor-pointer"
                      >
                        <span className="text-[16px] font-400 text-[#344051] close-dropdown">
                          {item?.metric_display_str ?? item?.metricName}
                        </span>
                      </div>
                    </li>
                  ))}
              </div>
            )}
            {newMetricNameList?.filter(
              (item) => item?.metric_type?.toLowerCase() === 'performance'
            ).length > 0 && (
              <div>
                <h2 className="text-[14px] font-semibold px-[8px]">
                  Performance
                </h2>
                {newMetricNameList
                  ?.filter(
                    (item) => item?.metric_type?.toLowerCase() === 'performance'
                  )
                  ?.map((item) => (
                    <li
                      key={item?.chartId}
                      className="relative mx-[6px] my-[4px]"
                    >
                      <div
                        onClick={() => handleMetricNameList(item)}
                        className="px-[8px] py-[6px] cursor-pointer"
                      >
                        <span className="text-[16px] font-400 text-[#344051] close-dropdown">
                          {item?.metric_display_str ?? item?.metricName}
                        </span>
                      </div>
                    </li>
                  ))}
              </div>
            )}
          </div>
        </ul>
      </Dropdown.Content>
    </Dropdown>
  );
};

export default ComparewithSelect;
