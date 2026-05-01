// import useChartColors from '../../../component/insights/useChartColors';
'use client';
import React, { Suspense, lazy, useEffect, useState } from 'react';
import { formatNumber } from '../../utils/formatNumber';
// import ReactApexChart from 'react-apexcharts';
const ReactApexChartLazy = lazy(() => import('react-apexcharts'));

const TimeSeriesChart = ({ data, metric_name, chartId }: any) => {
  // const chartColors = useChartColors(chartId);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const result = {
    metric_value: data?.data?.map((item: any) =>
      formatNumber(item.metric_value)
    ),
    date: data?.data?.map((item: any) => item.date),
  };
  const series = [
    {
      name: metric_name,
      data: result.metric_value,
    },
  ];
  const categories = result.date;
  var dataLabelOptions: any = {
    chart: {
      height: 350,
      type: 'line',
      dropShadow: {
        enabled: true,
        top: 14,
        left: 0,
        blur: 4,
        opacity: 0.251,
        color: '#9F9F9F',
      },
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
    },
    dataLabels: {
      enabled: true,
    },
    // label: { enabled: false },
    title: {
      text: metric_name,
      align: 'left',
      style: {
        fontSize: '14px',
        fontWeight: 'normal',
        fontFamily: undefined,
        color: '#637083',
      },
    },
    stroke: {
      curve: 'smooth',
      width: 5,
      colors: '#3B82F6',
    },
    markers: {
      size: 1,
    },
    xaxis: {
      type: 'category',
      categories: categories,
      tickAmount: categories.length > 10 ? 10 : categories.length,
      labels: {
        show: true,
        rotate: -45,
        formatter: function (val: any) {
          const date = new Date(val);
          return date.toLocaleDateString('en-US', {
            day: '2-digit',
            month: 'short',
            // year: '2-digit',
          });
        },
      },
    },
    yaxis: {
      // type: 'number',
      // labels: {
      //   format: '0,0.0',
      // },
      min:
        Math.min(
          ...data?.data?.map((item: any) => item.metric_value),
          data?.threshold ? data?.threshold : data?.data[0]?.threshold,
          data?.target ? data?.target : data?.data[0]?.target
        ) - 1,
      max:
        Math.max(
          ...data?.data?.map((item: any) => item.metric_value),
          data?.threshold ? data?.threshold : data?.data[0]?.threshold,
          data?.target ? data?.target : data?.data[0]?.target
        ) + 1,
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      floating: true,
      offsetY: -25,
      offsetX: -5,
    },
    annotations: {
      yaxis: [
        {
          y: data?.threshold ? data?.threshold : data?.data[0]?.threshold,
          borderColor: '#EF4444',
          strokeDashArray: 5,
          label: {
            borderWidth: 0,
            style: {
              color: '#EF4444',
              // background: '#FF4560',
              background: 'transparent',
              fontFamily: 'Inter',
              fontSize: '12px',
              fontWeight: 400,
              lineHeight: '16px',
              textAlign: 'right',
            },
            text: 'Threshold',
            offsetY: data?.threshold > data?.target ? -7 : 20,
          },
        },
        {
          y: data?.target ? data?.target : data?.data[0]?.target,
          borderColor: '#249782',
          strokeDashArray: 5,
          label: {
            borderWidth: 0,
            style: {
              color: '#249782',
              // background: '#00E396',
              background: 'transparent',
              fontFamily: 'Inter',
              fontSize: '12px',
              fontWeight: 400,
              lineHeight: '16px',
              textAlign: 'right',
            },
            text: 'Target',
            offsetY: data?.threshold > data?.target ? 20 : -7,
          },
        },
      ],
    },
    noData: {
      text: 'No data available',
      align: 'center',
      verticalAlign: 'middle',
      offsetX: 0,
      offsetY: 10,
      style: {
        color: undefined,
        fontSize: '14px',
        fontFamily: undefined,
      },
    },
  };

  if (data?.data?.length === 0) {
    dataLabelOptions.annotations = {};
    dataLabelOptions.yaxis = { show: false };
    dataLabelOptions.xaxis = { show: false };
  }

  return isLoaded ? (
    <Suspense>
      <ReactApexChartLazy
        dir="ltr"
        options={dataLabelOptions}
        series={series || []}
        data-chart-colors='["bg-custom-500", "bg-green-500"]'
        id={chartId}
        className="apex-charts"
        type="line"
        height={270}
      />
    </Suspense>
  ) : null;
};

export default TimeSeriesChart;
