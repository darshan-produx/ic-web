import {
  ChartCrossIcon,
  ChartHelp,
  ChartTippyBulb,
  ChartTippyQuestionMark,
} from '../../../../../app/assests/icons/icons';
import { TrendingDownIcon, TrendingUp } from 'lucide-react';
import ChartIcon from './chart-icon';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import { useOnExpandChartModalArray } from '../../../../../services/mutations/customer360ChartMutations';

type metricNameList = {
  chartId: string;
  metricName: string;
};
type MetricPillProps = {
  metric_name: string;
  metric_display_str: string;
  unit: string;
  metric_growth: boolean;
  index: number;
  chartId: string;
  status?: string;
  description?: string;
  dataLength?: number;
};
const ModalMetricPill: React.FC<MetricPillProps> = ({
  metric_name,
  metric_display_str,
  unit,
  metric_growth,
  status,
  description,
  dataLength,
  index,
  chartId,
}) => {
  const { onExpandChartModalArray, setOnExpandChartModalArray } =
    useOnExpandChartModalArray();
  const handleMetricNameList = (chartId: string) => {
    const newArray = onExpandChartModalArray.filter((id) => id !== chartId);
    setOnExpandChartModalArray(newArray);
  };
  return (
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center justify-items-start gap-2.5">
        {dataLength && dataLength > 0 ? (
          <ChartIcon color={status ?? 'gray'} />
        ) : null}

        {unit && unit?.toLowerCase() !== 'number' ? (
          <span className="text-[14px] font-normal text-[#637083] mr-0">
            {metric_display_str
              ? metric_display_str + ' (' + unit + ')'
              : metric_name + ' (' + unit + ')'}
          </span>
        ) : (
          <span className="text-[14px] font-normal text-[#637083]">
            {metric_display_str ?? metric_name}
          </span>
        )}
        {metric_growth && (
          <span
            className={`flex justify-center items-center ml-2.5 w-[44.67px] h-[20.98px] p-[2.1px] pr-[4.2px] pl-[4.2px] text-[#FFFFFF] rounded-[20.98px] ${
              metric_growth ? 'bg-[#309161]' : 'bg-[#EF4444]'
            }`}
          >
            {metric_growth ? (
              <span className="flex items-center w-[11.53px] h-[6.82px] top-[5.16px] left-[1.42px] text-[#FFFFFF]">
                <TrendingUp />
              </span>
            ) : (
              <span className="flex items-center w-[11.53px] h-[6.82px] top-[5.16px] left-[1.42px] text-[#FFFFFF]">
                <TrendingDownIcon />
              </span>
            )}
            <span className="flex items-center ml-[3.15px] text-[#FFFFFF] font-medium text-[12.59px] leading-[16.79px]">
              3%
            </span>
          </span>
        )}

        {description && dataLength && dataLength > 0 ? (
          <Tippy
            content={
              <div className="flex flex-col w-full max-w-[264px] max-h-[202px] top-[6px] left-[-118.5px] p-4 rounded-[8px] overflow-y-auto scroll">
                <div className="flex gap-x-1.5">
                  <ChartTippyQuestionMark />
                  <div className="w-full max-w-[207px] gap-[3px] flex flex-col">
                    <h1 className="w-[207px] font-inter text-[12px] font-normal leading-[16px] text-left text-[#637083] mt-0.5">
                      Problem?
                    </h1>
                    <p
                      className="w-[207px] font-inter text-[12px] font-normal leading-[16px] text-[#202B37] text-justify"
                      // title={description}
                    >
                      {description}
                    </p>
                  </div>
                </div>
                {/* <hr className="mx-3.5 my-3 max-w-[232px] border-[1px] border-[#F2F4F7]" />
                <div className="flex gap-x-1.5">
                  <ChartTippyBulb />
                  <div className="w-full max-w-[207px] gap-[3px] flex flex-col">
                    <h1 className="w-[207px] font-inter text-[12px] font-normal leading-[16px] text-left text-[#637083]">
                      How to fix?
                    </h1>
                    <p className="w-[207px] font-inter text-[12px] font-normal leading-[16px] text-left text-[#202B37]">
                      {description}
                    </p>
                  </div>
                </div> */}
              </div>
            }
            interactive={true}
            placement="bottom"
            theme="transparent"
            key={description}
          >
            <ChartHelp />
          </Tippy>
        ) : null}
      </div>
      {index !== 0 ? (
        <div
          className="mr-1.5 cursor-pointer"
          onClick={() => handleMetricNameList(chartId)}
        >
          <ChartCrossIcon />
        </div>
      ) : null}
    </div>
  );
};

export default ModalMetricPill;
