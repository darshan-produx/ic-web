import Modal from '../../../../../common/components/Modal';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import Filter from './filter';
import Select from 'react-select';
import CustomSelect from './customSelect';
import { formatNumber } from '../../../../../app/utils/formatNumber';
import ModalLineChart from './ModalLineChart';
import ComparewithSelect from './ComparewithSelect';
import { useOnExpandChartModalArray } from '../../../../../services/mutations/customer360ChartMutations';
import ModalLoading from '../../../../../common/components/Modalloading';
import { useQuery } from '@tanstack/react-query';
import { getGraphTags } from '../../../../../app/api/customer-360/customer360GraphData';
import { computeStartAndEndDate } from '../../../../../app/utils/computeStartAndEndDate';
import { useGraphDataQuery } from '../../../../../services/queries/graphChartQuery';

interface ExpandChartModalProps {
  modalOpen: boolean;
  handleCancel: () => void;
  id: number;
  customerName: string;
  is_group?: boolean;
  chartFrequency: string;
  formatKey?: string;
  defaultGraphData?: {
    adoption?: any; // expect full query result (AxiosResponse)
    business?: any;
    performance?: any;
    defects?: any;
  };
}
const customStyles = {
  control: (provided: any) => ({
    ...provided,
    width: '100%',
    height: '32px', // Fixed height of 34px
    padding: '6px 10px', // Adjust padding to fit the height
    borderRadius: '4px', // Rounded corners
    borderColor: '#D1D5DB', // Light gray border
    backgroundColor: '#FFFFFF', // White background
    fontSize: '14px', // Font size
    fontWeight: '600', // Bold font weight
    color: '#344051', // Dark gray text color
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between', // Justify content between text and dropdown indicator
    boxShadow: 'none', // Remove box shadow
    lineHeight: '20px', // Ensure no extra line-height is adding height
    minHeight: '32px', // Ensure minimum height is 34px
    '&:hover': {
      borderColor: '#D1D5DB', // Same border color on hover
    },
    cursor: 'pointer',
  }),
  valueContainer: (provided: any) => ({
    ...provided,
    padding: '0', // Remove padding inside the value container to control height
  }),
  singleValue: (provided: any) => ({
    ...provided,
    color: '#374151', // Dark gray text color
    overflow: 'visible', // Ensure no text truncation
    margin: '0', // Remove any margin that might increase height
  }),
  indicatorSeparator: () => ({
    display: 'none', // Remove the separator line
  }),
  dropdownIndicator: (provided: any) => ({
    ...provided,
    color: '#374151', // Dark gray dropdown indicator
    padding: '0', // Adjust padding for alignment
    '&:hover': {
      color: '#374151', // Keep hover color consistent
    },
  }),
  option: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: state.isSelected ? '#E4E7EC' : '#FFFFFF', // Light gray background for selected option
    color: '#374151', // Dark gray text color
    '&:hover': {
      backgroundColor: '#F2F4F7', // Light gray background on hover
      cursor: 'pointer',
    },
    padding: '8px 12px', // Ensure options are properly padded
  }),
  menu: (provided: any) => ({
    ...provided,
    borderRadius: '0.375rem',
  }),
};
type metricNameList = {
  chartId: string;
  metricName: string;
  metric_display_str: string;
  metric_type: string;
};

const frequencyOptions = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

const filterOptions = {
  daily: ['5D', '15D', '30D'],
  weekly: ['4W', '8W', '12W'],
  monthly: ['1M', '3M', '6M'],
};
const ExpandChartModal: React.FC<ExpandChartModalProps> = ({
  modalOpen,
  handleCancel,
  id,
  customerName,
  is_group,
  chartFrequency,
  formatKey,
  defaultGraphData,
}) => {
  if (!modalOpen) return null;
  const { onExpandChartModalArray, setOnExpandChartModalArray } =
    useOnExpandChartModalArray();
  const match = onExpandChartModalArray[0]?.match(/^\d+/);
  const kpi_id = match ? parseInt(match[0], 10) : null;

  const { selectedMetricIdsByPillar, pillarsNeeded } = useMemo(() => {
    const map: Record<string, number[]> = {
      adoption: [],
      business: [],
      performance: [],
    };
    const set = new Set<string>();
    onExpandChartModalArray.forEach((chartId) => {
      const [idPart, pillarPart] = chartId?.split('_') ?? [];
      if (!pillarPart) return;
      const pid = pillarPart.toLowerCase();
      const idNum = parseInt(idPart, 10);
      set.add(pid);
      if (!isNaN(idNum) && map[pid]) {
        map[pid].push(idNum);
      }
    });

    return {
      selectedMetricIdsByPillar: map,
      pillarsNeeded: set,
    };
  }, [onExpandChartModalArray]);

  const [FilterType, setFilterType] = useState<'daily' | 'weekly' | 'monthly'>(
    chartFrequency as 'daily' | 'weekly' | 'monthly'
  );

  const option =
    chartFrequency === 'daily'
      ? '30D'
      : chartFrequency === 'weekly'
      ? '12W'
      : chartFrequency === 'monthly'
      ? '6M'
      : '';

  const intialDates = computeStartAndEndDate(
    chartFrequency as 'daily' | 'weekly' | 'monthly',
    option
  );

  const [StartDate, setStartDate] = useState(intialDates?.startDate);
  const [EndDate, setEndDate] = useState(intialDates?.endDate);
  const [Tags, setTags] = useState<string[]>([]);
  const [debouncedStartDate, setDebouncedStartDate] = useState(
    intialDates?.startDate
  );
  const [debouncedEndDate, setDebouncedEndDate] = useState(
    intialDates?.endDate
  );
  const [debouncedTags, setDebouncedTags] = useState<string[]>([]);
  // Only fetch pillars being viewed; compare list will use cached defaults

  const adoptionNeeded = modalOpen && pillarsNeeded.has('adoption');
  const businessNeeded = modalOpen && pillarsNeeded.has('business');
  const performanceNeeded = modalOpen && pillarsNeeded.has('performance');

  const getInitialDataForPillar = (
    pillar: 'adoption' | 'business' | 'performance'
  ) => {
    if (!defaultGraphData) return undefined;
    if (chartFrequency?.toLowerCase() !== 'default') return undefined;
    if (debouncedTags.length > 0) return undefined;
    if (FilterType !== chartFrequency) return undefined;
    return defaultGraphData[pillar];
  };

  const adoptionQuery = useGraphDataQuery(
    id,
    'adoption',
    FilterType,
    debouncedStartDate,
    debouncedEndDate,
    debouncedTags,
    adoptionNeeded,
    undefined,
    selectedMetricIdsByPillar.adoption,
    getInitialDataForPillar('adoption')
  );
  const BusinesImpactGraphQuery = useGraphDataQuery(
    id,
    'business',
    FilterType,
    debouncedStartDate,
    debouncedEndDate,
    debouncedTags,
    businessNeeded,
    undefined,
    selectedMetricIdsByPillar.business,
    getInitialDataForPillar('business')
  );
  const PerformanceGraphQuery = useGraphDataQuery(
    id,
    'performance',
    FilterType,
    debouncedStartDate,
    debouncedEndDate,
    debouncedTags,
    performanceNeeded,
    undefined,
    selectedMetricIdsByPillar.performance,
    getInitialDataForPillar('performance')
  );
  const AdoptionGraphData = adoptionQuery?.data;
  const BusinesImpactGraphData = BusinesImpactGraphQuery?.data;
  const PerformanceGraphData = PerformanceGraphQuery?.data;
  const { data: GraphTags } = useQuery({
    queryKey: ['graph-tags', { id, kpi_id }],
    queryFn: () =>
      getGraphTags({ customer_id: id, kpi_id: kpi_id ? kpi_id : 0 }),
    staleTime: 60 * 60 * 1000, // 1h cache for tags
    refetchOnMount: false,
    refetchOnReconnect: false,
    enabled: modalOpen && Boolean(kpi_id),
  });

  const handleFilterChange = (
    newFilterType: 'daily' | 'weekly' | 'monthly',
    option: string
  ) => {
    setFilterType(newFilterType);
    const dates = computeStartAndEndDate(newFilterType, option);
    handleSelect(dates.startDate, dates.endDate);
  };

  const handleSelect = (start_date: string, end_date: string) => {
    setStartDate(start_date);
    setEndDate(end_date);
  };

  const handleTags = useCallback((tags: string[]) => {
    setTags(tags);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedStartDate(StartDate);
      setDebouncedEndDate(EndDate);
      setDebouncedTags(Tags);
    }, 300);
    return () => clearTimeout(timer);
  }, [StartDate, EndDate, Tags]);

  useEffect(() => {
    if (!modalOpen) return;
    if (!chartFrequency) return;
    const defaultOption =
      chartFrequency === 'daily'
        ? '30D'
        : chartFrequency === 'weekly'
        ? '12W'
        : '6M';
    setFilterType(chartFrequency as 'daily' | 'weekly' | 'monthly');
    const dates = computeStartAndEndDate(
      chartFrequency as 'daily' | 'weekly' | 'monthly',
      defaultOption
    );
    setStartDate(dates.startDate);
    setEndDate(dates.endDate);
    setTags([]);
  }, [chartFrequency, modalOpen]); // Data used for the currently selected charts (may be metric_ids-scoped)

  const adoptionSeries =
    AdoptionGraphData?.data?.data ??
    defaultGraphData?.adoption?.data?.data ??
    [];
  const businessSeries =
    BusinesImpactGraphData?.data?.data ??
    defaultGraphData?.business?.data?.data ??
    [];
  const performanceSeries =
    PerformanceGraphData?.data?.data ??
    defaultGraphData?.performance?.data?.data ??
    []; // Data used to populate the compare dropdown (always include full default sets)

  const allAdoptionSeries =
    defaultGraphData?.adoption?.data?.data ??
    AdoptionGraphData?.data?.data ??
    [];
  const allBusinessSeries =
    defaultGraphData?.business?.data?.data ??
    BusinesImpactGraphData?.data?.data ??
    [];
  const allPerformanceSeries =
    defaultGraphData?.performance?.data?.data ??
    PerformanceGraphData?.data?.data ??
    [];

  const chartData = useMemo(
    () => [
      ...(Array.isArray(adoptionSeries) ? adoptionSeries : []),
      ...(Array.isArray(businessSeries) ? businessSeries : []),
      ...(Array.isArray(performanceSeries) ? performanceSeries : []),
    ],
    [adoptionSeries, businessSeries, performanceSeries]
  );

  const modalChartData = useMemo(
    () =>
      chartData
        .filter((item: any) => onExpandChartModalArray.includes(item.chartId))
        .sort(
          (a: any, b: any) =>
            onExpandChartModalArray.indexOf(a.chartId) -
            onExpandChartModalArray.indexOf(b.chartId)
        ),
    [chartData, onExpandChartModalArray]
  );

  const allSeriesForCompare = useMemo(
    () => [
      ...(Array.isArray(allAdoptionSeries) ? allAdoptionSeries : []),
      ...(Array.isArray(allBusinessSeries) ? allBusinessSeries : []),
      ...(Array.isArray(allPerformanceSeries) ? allPerformanceSeries : []),
    ],
    [allAdoptionSeries, allBusinessSeries, allPerformanceSeries]
  );

  const metricNameList: metricNameList[] = useMemo(
    () =>
      allSeriesForCompare
        ?.filter(
          (item: any) =>
            !onExpandChartModalArray.includes(item.chartId) &&
            item?.l3_data?.length > 0
        )
        ?.map((item: any) => {
          return {
            chartId: item?.chartId as string,
            metricName: item?.metric_name as string,
            metric_display_str: item?.metric_display_str as string,
            metric_type: item?.metric_type,
          };
        }),
    [allSeriesForCompare, onExpandChartModalArray]
  );

  const handleMetricNameList = (metricNameList: metricNameList) => {
    const newArray = [...onExpandChartModalArray, metricNameList?.chartId];
    setOnExpandChartModalArray(newArray);
  };

  return (
    <Modal
      show={modalOpen}
      onHide={handleCancel}
      id="defaultModal"
      modal-center="true"
      className="fixed flex flex-col transition-all duration-300 ease-in-out left-2/4 z-drawer -translate-x-2/4 -translate-y-2/4"
      dialogClassName="w-screen md:w-[850px] overflow-hidden max-h-[calc(theme('height.screen')_-_20px)] 2xl:max-h-[calc(theme('height.screen')_-_100px)] bg-white shadow rounded-[20px] dark:bg-zink-600 flex flex-col h-full"
      chartModalOpacity={true}
    >
      <Modal.Body className="flex items-center justify-between border-b border-[#CED2DA] dark:border-zink-500 p-[12px]">
        <Modal.Title className="text-[16px] font-normal text-[#202B37]">
          {customerName}
        </Modal.Title>
        <div className="h-8 flex justify-end items-center space-x-4">
          <CustomSelect handleTags={handleTags} tags={GraphTags?.data?.data} />
          <div className="h-8 border-r border-[#D9D9D9] justify-center items-center"></div>
          <div className="relative w-[101px]">
            <Select
              value={frequencyOptions.find((option) => {
                return option.value === FilterType;
              })}
              onChange={(selectedOption: any) => {
                const selectedValue = selectedOption?.value as
                  | 'daily'
                  | 'weekly'
                  | 'monthly';
                let defaultOption;
                if (selectedValue === 'daily') {
                  defaultOption = '30D';
                } else if (selectedValue === 'weekly') {
                  defaultOption = '12W';
                } else if (selectedValue === 'monthly') {
                  defaultOption = '6M';
                } else {
                  defaultOption = filterOptions[selectedValue][0];
                }

                handleFilterChange(selectedValue, defaultOption);
              }}
              options={frequencyOptions}
              styles={customStyles}
              classNamePrefix="custom-select"
              isSearchable={false}
              className="appearance-none closeFilter !text-[14px] !font-semibold"
            />
          </div>
          <Filter
            filterType={FilterType}
            options={filterOptions[FilterType]}
            onSelect={(startDate: string, endDate: string) =>
              handleSelect(startDate, endDate)
            }
          />
          <span onClick={handleCancel}>
            <X className="text-[#97A1AF] hi-[20px] w-[20px] cursor-pointer" />
          </span>
        </div>
      </Modal.Body>
      <Modal.Body className="overflow-y-auto max-w-[850px] scroll">
        {modalChartData && modalChartData?.length > 0 ? (
          modalChartData.map((item: any, index) => {
            return (
              <ModalLineChart
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
                target={
                  FilterType === item?.status_aggregation_level &&
                  Array.isArray(Tags) &&
                  Tags?.length === 0 &&
                  !is_group
                    ? item?.target
                    : null
                }
                threshold={
                  FilterType === item?.status_aggregation_level &&
                  Array.isArray(Tags) &&
                  Tags?.length === 0 &&
                  !is_group
                    ? item?.threshold
                    : null
                }
                filterType={FilterType}
                status={item?.status}
                description={item?.description}
                index={index}
                lenghtOfChartData={modalChartData?.length}
                formatKey={formatKey}
              />
            );
          })
        ) : (
          <ModalLoading />
        )}
      </Modal.Body>
      {modalChartData.length < 3 ? (
        <Modal.Footer>
          <div className=" flex items-center justify-center">
            <div>
              <ComparewithSelect
                handleMetricNameList={handleMetricNameList}
                metricNameList={metricNameList}
              />
            </div>
          </div>
        </Modal.Footer>
      ) : null}
    </Modal>
  );
};

export default ExpandChartModal;
