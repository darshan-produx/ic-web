import { formatNumber } from '../../../../../app/utils/formatNumber';
// import BarChart from './barChart';
import LineChart from './lineChart';
import Synthesis from './synthesis';
import { useOnExpandChartSetting } from '../../../../../services/mutations/customer360ChartMutations';
import EditKPICardModal from './editKPICardModal';
import FlipCard from './flipcard';
type PerformanceAndErrorMetricProps = {
  customer360PerformanceGraphData: any;
  // customer360DefectsGraphData: any;
  synthesisData: any;
  isTargetThresholdEditEnabled: boolean;
  allowStatusInsightsToggle: boolean;
  displayName?: string;
  formatKey?: string;
  isGroup_customer?: boolean;
};

const PerformanceAndErrorMetric: React.FC<PerformanceAndErrorMetricProps> = ({
  customer360PerformanceGraphData,
  // customer360DefectsGraphData,
  synthesisData,
  isTargetThresholdEditEnabled,
  allowStatusInsightsToggle,
  displayName,
  formatKey,
  isGroup_customer = false,
}) => {
  const options = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
  ];
  const isL3DataAvailable: boolean =
    (Array.isArray(customer360PerformanceGraphData?.data?.data) &&
      customer360PerformanceGraphData?.data?.data?.some(
        (item: any) => item?.l3_data?.length > 0
      )) ||
    false;
  const { onExpandChartSetting, setOnExpandChartSetting } =
    useOnExpandChartSetting();
  return customer360PerformanceGraphData?.data?.data?.length > 0 ? (
    <div className="mx-auto">
      <div className="flex justify-between items-center py-[10px]">
        <p className="h-8 text-[16px] font-medium text-[#141C24] flex justify-center items-center">
          {displayName + ' Report' || 'Performance Report'}
        </p>
      </div>
      {synthesisData?.map((ele: any) => {
        if (
          ele?.type?.toLowerCase() == 'pillar' &&
          ele?.subtype?.toLowerCase() == 'performance'
        ) {
          return <Synthesis synthesisData={ele?.synthesis} />;
        }
      })}
      {isL3DataAvailable && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-[22px] gap-y-[22px] pb-[30px] min-h-[320px] ">
          {customer360PerformanceGraphData?.data?.data
            ?.filter((item: any) => item?.l3_data?.length > 0)
            .filter((item: any) => !item?.secondary_kpi)
            .map((item: any) => {
              const isFlipped = onExpandChartSetting === item._id;
              const front = (
                <LineChart
                  key={item?.chartId}
                  data={
                    item?.l3_data?.map((data: any) => ({
                      ...data,
                      metric_value: formatNumber(data?.metric_value),
                    })) || []
                  }
                  metric_name={item?.metric_name}
                  metric_display_str={item?.metric_display_str}
                  unit={item?.unit}
                  chartId={item?.chartId}
                  target={item?.target}
                  threshold={item?.threshold}
                  filterType={item?.status_aggregation_level}
                  status={item?.status}
                  description={item?.description}
                  chartMongoId={item?._id}
                  formatKey={formatKey}
                  isGroup_customer={isGroup_customer}
                />
              );
              const back = (
                <EditKPICardModal
                  id={item._id}
                  pillar={item.metric_type || ''}
                  frequency={item.frequency || ''}
                  target={item.target}
                  threshold={item.threshold}
                  status_flag={item.status_flag}
                  insight_flag={item.insight_flag}
                  history={item.history}
                  setOnExpandChartSetting={setOnExpandChartSetting}
                  isTargetThresholdEditEnabled={isTargetThresholdEditEnabled}
                  allowStatusInsightsToggle={allowStatusInsightsToggle}
                  kpiSnoozeTill={item.kpi_snooze_till}
                />
              );
              return (
                <div className="w-full max-w-[590px] aspect-[590/360]">
                  <FlipCard isFlipped={isFlipped} front={front} back={back} />
                </div>
              );
            })}
          {/* {customer360DefectsGraphData?.data?.data &&
          customer360DefectsGraphData?.data?.data?.length > 0 ? (
            <BarChart
              data={customer360DefectsGraphData?.data?.data || []}
              metric_name={customer360DefectsGraphData?.data?.metric_name}
              metric_display_str={
                customer360DefectsGraphData?.data?.metric_display_str
              }
              chartId={customer360DefectsGraphData?.data?.chartId}
              filterType={
                customer360DefectsGraphData?.data?.status_aggregation_level
              }
            />
          ) : null} */}
        </div>
      )}
    </div>
  ) : (
    <div className="mx-auto ">
      <div className="pt-[20px] pb-[51.88px] border-b border-[#E4E7EC]">
        <p className=" text-[16px] font-medium text-[#97A1AF] leading-[24px] font-inter">
          {displayName + ' Report' || 'Performance Report'}
        </p>
        <p className=" text-[14px] font-normal text-[#97A1AF] leading-[20px] font-inter">
          Information to track the metric is unavailable
        </p>
      </div>
    </div>
  );
};

export default PerformanceAndErrorMetric;
