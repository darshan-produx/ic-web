'use client';
import React, { Suspense, lazy } from 'react';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import ModalMetricPill from './ModalmetricPill';
import { formatChartRevenue } from '../../../../../common/SupportFunctions';

dayjs.extend(isSameOrBefore);

const ReactApexChart = lazy(() => import('react-apexcharts'));

interface LineChartProps {
  data: { date: string; metric_value: number }[];
  metric_name: string;
  metric_display_str: string;
  unit: string;
  chartId: string;
  target: number | null;
  threshold: number | null;
  filterType: string;
  status?: string;
  description?: string;
  index: number;
  lenghtOfChartData: number;
  formatKey?: string;
}

const ModalLineChart: React.FC<LineChartProps> = ({
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
  index,
  lenghtOfChartData,
  formatKey,
}) => {
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
    ...(threshold !== null && threshold !== undefined && !isNaN(threshold)
      ? [threshold]
      : []),
    ...(target !== null && target !== undefined && !isNaN(target)
      ? [target]
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
      toolbar: { show: false },
      zoom: { enabled: false },
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
        ...(target !== null &&
        target !== undefined &&
        Array.isArray(data) &&
        data?.length > 0
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
        ...(threshold !== null &&
        threshold !== undefined &&
        Array.isArray(data) &&
        data?.length > 0
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

  return (
    <div className="mx-5 my-2">
      <div className="mb-2.5">
        <ModalMetricPill
          metric_name={metric_name}
          metric_display_str={metric_display_str}
          unit={unit}
          metric_growth={false}
          status={status}
          description={description}
          dataLength={data.length}
          index={index}
          chartId={chartId}
        />
        <div className="max-h-auto border border-[#E4E7EC] rounded-[10px] bg-white">
          <Suspense>
            <ReactApexChart
              dir="ltr"
              options={options ?? {}}
              series={series ?? []}
              data-chart-colors='["bg-custom-500", "bg-green-500"]'
              id={chartId}
              className="apex-charts"
              type="line"
              height={lenghtOfChartData === 1 ? 276 : 204}
              width="100%"
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default ModalLineChart;
