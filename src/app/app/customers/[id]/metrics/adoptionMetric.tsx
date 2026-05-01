import React from 'react';
import LineChart from './lineChart';
import { formatNumber } from '../../../../../app/utils/formatNumber';
import Synthesis from './synthesis';
import EditKPICardModal from './editKPICardModal';
import { useOnExpandChartSetting } from '../../../../../services/mutations/customer360ChartMutations';
import FlipCard from './flipcard';

type AdoptionMetricProps = {
  customer360AdoptionGraphData: any;
  synthesisData: any;
  isTargetThresholdEditEnabled: boolean;
  allowStatusInsightsToggle: boolean;
  displayName?: string;
  formatKey?: string;
  isGroup_customer?: boolean;
};

const AdoptionMetric: React.FC<AdoptionMetricProps> = ({
  customer360AdoptionGraphData,
  synthesisData,
  isTargetThresholdEditEnabled,
  allowStatusInsightsToggle,
  displayName,
  formatKey,
  isGroup_customer = false,
}) => {
  const isL3DataAvailable: boolean =
    (Array.isArray(customer360AdoptionGraphData?.data?.data) &&
      customer360AdoptionGraphData?.data?.data?.some(
        (item: any) => item?.l3_data?.length > 0
      )) ||
    false;
  const { onExpandChartSetting, setOnExpandChartSetting } =
    useOnExpandChartSetting();
  return customer360AdoptionGraphData?.data?.data?.length > 0 ? (
    <div className="mx-auto">
      <div className="flex justify-between items-center pt-[20px] pb-[10px]">
        <p className="h-8 text-[16px] font-medium text-[#141C24] flex justify-center items-center">
          {displayName + ' Metrics' || 'Adoption Metrics'}
        </p>
      </div>
      {synthesisData?.map((ele: any) => {
        if (
          ele?.type?.toLowerCase() == 'pillar' &&
          ele?.subtype?.toLowerCase() == 'adoption'
        ) {
          return <Synthesis synthesisData={ele?.synthesis} />;
        }
      })}
      {isL3DataAvailable && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-[22px] gap-y-[22px] pb-[30px] border-b border-[#E4E7EC] min-h-[320px]">
          {customer360AdoptionGraphData?.data?.data?.length > 0
            ? customer360AdoptionGraphData?.data?.data
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
                      isTargetThresholdEditEnabled={
                        isTargetThresholdEditEnabled
                      }
                      allowStatusInsightsToggle={allowStatusInsightsToggle}
                      kpiSnoozeTill={item.kpi_snooze_till}
                    />
                  );
                  return (
                    <div className="w-full max-w-[590px] aspect-[590/360]">
                      <FlipCard
                        isFlipped={isFlipped}
                        front={front}
                        back={back}
                      />
                    </div>
                  );
                })
            : null}
        </div>
      )}
    </div>
  ) : (
    <div className="mx-auto ">
      <div className="pt-[20px] pb-[51.88px] border-b border-[#E4E7EC]">
        <p className=" text-[16px] font-medium text-[#97A1AF] leading-[24px] font-inter">
          {displayName + ' Metrics' || 'Adoption Metrics'}
        </p>
        <p className=" text-[14px] font-normal text-[#97A1AF] leading-[20px] font-inter">
          Information to track the metric is unavailable
        </p>
      </div>
    </div>
  );
};

export default AdoptionMetric;
