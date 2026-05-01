'use client';
import React, { Suspense, lazy, useEffect, useState } from 'react';
const ReactApexChartLazy = lazy(() => import('react-apexcharts'));
import { useQuery } from '@tanstack/react-query';
import { getNpsMetric } from '../../../api/config/nps_metric';
const NPSChart = ({ data, chartId }: any) => {
  const [isLoaded, setIsLoaded] = useState(false);

  const { data: existingNpsMetrics } = useQuery({
    queryKey: ['nps-metrics'],
    queryFn: getNpsMetric,
  });
  const target = existingNpsMetrics?.data?.data[0]?.nps_target;
  const threshold = existingNpsMetrics?.data?.data[0]?.nps_threshold;

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const result = {
    nps_score: data?.data?.data.map((item: any) => item.nps_score),
    date: data?.data?.data.map((item: any) => item.date),
  };

  const series = [
    {
      name: 'NPS Score',
      data: result.nps_score,
    },
  ];

  const categories = result.date;

  const dataLabelOptions: any = {
    chart: {
      height: 370,
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
    stroke: {
      curve: 'smooth',
      width: 5,
      colors: '#3B82F6',
    },
    markers: {
      size: 5,
    },
    xaxis: {
      type: 'category',
      categories: categories,
      tickAmount: categories.length,
      labels: {
        show: true,
        rotate: -45,
        formatter: function (val: any) {
          const date = new Date(val);
          return date.toLocaleDateString('en-US', {
            month: 'short',
            year: '2-digit',
          });
        },
      },
    },
    yaxis: {
      type: 'number',
      labels: {
        format: '0,0.0',
      },
      min:
        Math.min(
          ...data?.data?.data.map((item: any) => item.nps_score),
          threshold,
          target
        ) - 1,
      max:
        Math.max(
          ...data?.data?.data.map((item: any) => item.nps_score),
          threshold,
          target
        ) + 1,
      axisBorder: {
        show: true,
        color: '#E4E7EC',
        offsetX: 0,
        offsetY: 0,
      },
      axisTicks: {
        show: true,
        borderType: 'solid',
        color: '#E4E7EC',
        width: 6,
        offsetX: 0,
        offsetY: 0,
      },
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
            text: `Threshold: ${threshold}`,
            offsetY: threshold > target ? -7 : 20,
          },
        },
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
            text: `Target: ${target}`,
            offsetY: threshold > target ? 20 : -7,
          },
        },
      ],
    },
  };

  return isLoaded ? (
    <Suspense>
      <ReactApexChartLazy
        dir="ltr"
        options={dataLabelOptions}
        series={series}
        data-chart-colors='["bg-custom-500", "bg-green-500"]'
        className="apex-charts"
        id={chartId}
        type="line"
        height={370}
      />
    </Suspense>
  ) : null;
};

export default NPSChart;
