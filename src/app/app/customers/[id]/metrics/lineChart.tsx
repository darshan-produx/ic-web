'use client';
import React, { Suspense, lazy, useEffect, useState } from 'react';
import MetricPill from './metricPill';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { formatChartRevenue } from '../../../../../common/SupportFunctions';
import {
  useOnExpandChartFrequency,
  useOnExpandChartModalArray,
  useOnExpandChartModalOpenState,
  useOnExpandChartSetting,
} from '../../../../../services/mutations/customer360ChartMutations';
const ReactApexChart = lazy(() => import('react-apexcharts'));
dayjs.extend(isSameOrBefore);
interface LineChartProps {
  data: { date: string; metric_value: number }[];
  metric_name: string;
  metric_display_str: string;
  unit: string;
  chartId: string;
  target: number | null;
  threshold: number | null;
  filterType: string;
  chartMongoId: string;
  isChartOnInsight?: boolean;
  trigger?: number | null;
  status?: string;
  description?: string;
  height?: number;
  chartOnInsightType?: string;
  formatKey?: string;
  isGroup_customer?: boolean;
}

const LineChart: React.FC<LineChartProps> = ({
  data,
  metric_name,
  metric_display_str,
  unit,
  chartId,
  target,
  threshold,
  filterType,
  status,
  description,
  trigger,
  height,
  chartMongoId,
  isChartOnInsight = false,
  chartOnInsightType = '',
  formatKey,
  isGroup_customer = false,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const { setOnExpandChartModalOpen } = useOnExpandChartModalOpenState();
  const { setOnExpandChartModalArray } = useOnExpandChartModalArray();
  const { setOnExpandChartFrequency } = useOnExpandChartFrequency();
  const { setOnExpandChartSetting } = useOnExpandChartSetting();
  const today = dayjs().startOf('day');
  const categoryTicks = Array.isArray(data) ? data.map((d) => d.date) : [];
  const actualSeriesData = Array.isArray(data)
    ? data.map((d) => ({
        x: d.date,
        y:
          dayjs(d.date).isValid() && dayjs(d.date).isSameOrBefore(today)
            ? d.metric_value
            : null,
      }))
    : [];

  const futureSeriesData = Array.isArray(data)
    ? data.map((d) => ({
        x: d.date,
        y:
          dayjs(d.date).isValid() && dayjs(d.date).isAfter(today)
            ? d.metric_value
            : null,
      }))
    : [];

  const lastActualPoint = [...actualSeriesData]
    .reverse()
    .find((d) => d.y !== null);
  const firstForecastPoint = futureSeriesData.find((d) => d.y !== null);

  const connectorSeriesData = categoryTicks.map((date) => {
    if (lastActualPoint && date === lastActualPoint.x) {
      return lastActualPoint;
    }
    if (firstForecastPoint && date === firstForecastPoint.x) {
      return firstForecastPoint;
    }
    return { x: date, y: null };
  });

  const connectorSeries =
    lastActualPoint && firstForecastPoint
      ? {
          name: metric_name,
          data: connectorSeriesData,
        }
      : null;
  const series = [
    { name: metric_name, data: actualSeriesData },
    ...(connectorSeries ? [connectorSeries] : []),
    {
      name: metric_name,
      data: futureSeriesData,
    },
  ];

  // Calculate Y-axis limits with 10% extension
  const metricValues = data
    .map((item: any) => item.metric_value)
    .filter(
      (value: any) => value !== null && value !== undefined && !isNaN(value)
    );
  const allValues = [
    ...metricValues,
    ...(!isGroup_customer && threshold !== null && threshold !== undefined && !isNaN(threshold)
      ? [threshold]
      : []),
    ...(!isGroup_customer && target !== null && target !== undefined && !isNaN(target)
      ? [target]
      : []),
    ...(trigger !== null && trigger !== undefined && !isNaN(trigger)
      ? [trigger]
      : []),
  ];
  const M1 = allValues.length > 0 ? Math.min(...allValues) : 0;
  const M2 = allValues.length > 0 ? Math.max(...allValues) : 0;
  const D = M2 - M1;
  const yAxisMin = M1 >= 0 ? Math.max(0, M1 - D * 0.1) : M1 - D * 0.1;
  const yAxisMax = M2 + D * 0.1;

  const options: any = {
    chart: {
      height: '100%',
      type: 'line',
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
    },
    stroke: {
      curve: 'smooth',
      width: [4, 2, futureSeriesData.length > 1 ? 2 : 0],
      dashArray: [0, 6, 6],
    },
    colors: ['#3B82F6', '#3B82F6', '#97A1AF'],
    markers: {
      size: 5,
      discrete: [
        {
          seriesIndex: 1,
          dataPointIndex: -1,
          fillColor: '#ffffff',
          strokeColor: '#10B981',
          size: 6,
        },
      ],
    },
    xaxis: {
      type: 'category',
      categories: categoryTicks,
      tickPlacement: 'on',
      tickAmount: 20,
      labels: {
        datetimeUTC: false,
        datetimeFormatter: {
          year: 'MM-yyyy',
          month: 'DD MMM',
          day: 'DD MMM',
        },
        formatter: function (value: any) {
          if (!dayjs(value).isValid()) return null;
          return dayjs(value).format('DD MMM');
        },
        rotate: -45,
        rotateAlways: true,
        showDuplicates: false,
        hideOverlappingLabels: true,
      },
    },
    dataLabels: {
      enabled: true,
      formatter: function (val: number | null) {
        if (val === null || val === undefined) return '';
        return formatChartRevenue(val, formatKey);
      },
      style: {
        fontFamily: 'Public Sans',
        fontSize: '12px',
        fontWeight: 400,
        lineHeight: '16px',
        textAlign: 'center',
        colors: ['#3B82F6', '#3B82F6', '#97A1AF'],
      },
    },
    legend: {
      show: false,
    },
    tooltip: {
      enabled: true,
      custom: ({ series, seriesIndex, dataPointIndex, w }: any) => {
        const seriesDataPoint =
          w.config.series[seriesIndex].data[dataPointIndex];
        const xVal = seriesDataPoint.x;
        const xLabel = dayjs(xVal).isValid() && dayjs(xVal).format('DD MMM');
        const yVal = series[seriesIndex][dataPointIndex];
        const { name } = w.config.series[seriesIndex];
        const displayYVal =
          yVal !== null && yVal !== undefined
            ? formatChartRevenue(yVal, formatKey)
            : 'N/A';
        const noteLine =
          seriesIndex === 2
            ? `<div style="font-size: 12px; color: #6b7280;">Data point in ongoing period</div>`
            : '';
        return `
                <div style="
              background: #fff;
              padding: 0;
              border: 1px solid #ccc;
              border-radius: 6px;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
              font-family: Arial, sans-serif;
              font-size: 13px;
              color: #333;
              min-width: 220px;
            ">
                  <div style="
                    font-weight: bold;
                    padding: 6px 10px;
                    border-bottom: 1px solid #ccc;
                    background: #f1f3f5;
                    border-top-left-radius: 6px;
                    border-top-right-radius: 6px;
                  ">
                    ${xLabel}
                  </div>
                  <div style="
                    display: flex;
                    align-items: flex-start;
                    gap: 6px;
                    padding: 6px 10px;
                  ">
                    <div style="
                      width: 8px;
                      height: 8px;
                      border-radius: 50%;
                      background: ${w.globals.colors[seriesIndex]};
                      margin-top: 6px;
                    "></div>
                    <div style="
                      display: flex;
                      flex-direction: column;
                      gap: 4px;
                      text-align: left;
                    ">
                      <div>${name}: <strong>${displayYVal}</strong></div>
                      ${noteLine}
                    </div>
                  </div>
            </div>
    `;
      },
    },
    annotations: {
      yaxis: [
        ...(target !== null && Array.isArray(data) && data?.length > 0 && !isGroup_customer
          ? [
              {
                y: threshold,
                borderColor: '#EF4444',
                strokeDashArray: 5,
                label: {
                  borderWidth: 0,
                  style: {
                    color: '#EF4444',
                    background: 'transparent',
                    fontFamily: 'Inter',
                    fontSize: '12px',
                    fontWeight: 400,
                    lineHeight: '16px',
                    textAlign: 'right',
                  },
                  text: `Threshold: ${formatChartRevenue(
                    threshold || 0,
                    formatKey
                  )}`,
                  offsetY: threshold && threshold > target ? -7 : 20,
                },
              },
            ]
          : []),
        ...(threshold !== null && Array.isArray(data) && data?.length > 0 && !isGroup_customer
          ? [
              {
                y: target,
                borderColor: '#249782',
                strokeDashArray: 5,
                label: {
                  borderWidth: 0,
                  style: {
                    color: '#249782',
                    background: 'transparent',
                    fontFamily: 'Inter',
                    fontSize: '12px',
                    fontWeight: 400,
                    lineHeight: '16px',
                    textAlign: 'right',
                  },
                  text: `Target: ${formatChartRevenue(target || 0, formatKey)}`,
                  offsetY: target && threshold > target ? 20 : -7,
                },
              },
            ]
          : []),
        ...(trigger !== null &&
        trigger !== undefined &&
        Array.isArray(data) &&
        data?.length > 0
          ? [
              {
                y: trigger,
                borderColor: '#9CA3AF',
                strokeDashArray: 5,
                label: {
                  borderWidth: 0,
                  style: {
                    color: '#9CA3AF',
                    background: 'transparent',
                    fontFamily: 'Inter',
                    fontSize: '12px',
                    fontWeight: 400,
                    lineHeight: '16px',
                    textAlign: 'right',
                  },
                  text: `Trigger: ${formatChartRevenue(trigger, formatKey)}`,
                  offsetY: -7,
                },
              },
            ]
          : []),
      ],
    },
    yaxis: {
      min: yAxisMin,
      max: yAxisMax,
      labels: {
        formatter: function (val: number) {
          return formatChartRevenue(val, formatKey);
        },
      },
    },
    grid: {
      show: data?.length > 0 ? true : false,
      padding: {
        right: 20,
        bottom: -25,
      },
    },
    noData: {
      text: 'No data available',
      align: 'center',
      verticalAlign: 'middle',
      offsetX: 0,
      offsetY: 0,
      style: {
        color: undefined,
        fontSize: '14px',
        fontFamily: undefined,
      },
    },
  };

  if (data.length === 0) {
    options.annotations = {};
    options.yaxis = { show: false };
    options.xaxis = { show: false };
  }

  return isLoaded ? (
    <div
      className={`bg-[#FFFFFF] shadow-[0px_0.73px_36.69px_0px_rgba(172,172,172,0.149)] pl-[14px] pr-[14px] pt-[22px] pb-[20px] rounded-xl ${
        chartOnInsightType === 'Opportunity'
          ? 'border border-gray-200'
          : 'cursor-pointer'
      }`}
      onClick={() => {
        if (chartOnInsightType !== 'Opportunity') {
          setOnExpandChartModalOpen(true);
          setOnExpandChartModalArray([chartId]);
          setOnExpandChartFrequency(filterType);
        }
      }}
    >
      <MetricPill
        metric_name={metric_name}
        metric_display_str={metric_display_str}
        unit={unit}
        metric_growth={false}
        status={status}
        description={description}
        dataLength={data?.length}
        chartMongoId={chartMongoId}
        setOnExpandChartSetting={setOnExpandChartSetting}
        isChartOnInsight={isChartOnInsight}
        chartOnInsightType={chartOnInsightType}
        isGroup_customer={isGroup_customer}
      />
      <Suspense>
        {height && height > 0 ? (
          <ReactApexChart
            dir="ltr"
            options={options ?? {}}
            series={series ?? []}
            id={chartId}
            className="apex-charts"
            type="line"
            height={height}
          />
        ) : (
          <ReactApexChart
            dir="ltr"
            options={options ?? {}}
            series={series ?? []}
            id={chartId}
            className="apex-charts"
            type="line"
            height={286}
          />
        )}
      </Suspense>
    </div>
  ) : null;
};

export default LineChart;
