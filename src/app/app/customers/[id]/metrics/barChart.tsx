'use client';
import { formatNumber } from '../../../../../app/utils/formatNumber';
import React, { Suspense, lazy, useEffect, useState } from 'react';

const ReactApexChartLazy = lazy(() => import('react-apexcharts'));

interface BarChartProps {
  data: any;
  metric_name: string;
  metric_display_str: string;
  chartId: string;
  filterType: string;
}

const BarChart: React.FC<BarChartProps> = ({
  data,
  metric_name,
  metric_display_str,
  chartId,
  filterType,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const computeCategoriesSeries = (data: any) => {
    const categoriesSet = new Set<string>(); // set of all dates

    for (const metricData of data ?? []) {
      metricData.dataMap = {};
      if (metricData?.l3_data && metricData?.l3_data.length > 0) {
        for (const item of metricData.l3_data) {
          categoriesSet.add(item.date);
          metricData.dataMap[item.date] = formatNumber(item.metric_value);
        }
      }
    }

    const categories = Array.from(categoriesSet)?.sort();
    const series = data?.map((metricData: any) => {
      return {
        name: metricData?.metric_display_str ?? metricData?.metric_name,
        data: categories?.map(
          (category: string) => metricData?.dataMap[category] ?? 0
        ),
      };
    });

    return {
      categories,
      series,
    };
  };

  const result = computeCategoriesSeries(data);

  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'June',
    'July',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  const convertDatesToMonthNames = (data: any) => {
    return data.map((item: any) => {
      const date = new Date(item);
      const month = date.getMonth(); // Get month index (0-11)
      return monthNames[month];
    });
  };
  if (filterType === 'monthly') {
    result.categories = convertDatesToMonthNames(result?.categories);
  }

  const series = result?.series;

  let options: any = {
    chart: {
      type: 'bar',
      height: 350,
      stacked: true,
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 0,
        dataLabels: {
          // total: {
          //   enabled: false,
          //   style: {
          //     fontSize: '13px',
          //     fontWeight: 900,
          //   },
          // },
        },
      },
    },
    xaxis: {
      type: filterType === 'monthly' ? 'category' : 'datetime',
      categories: result?.categories,
      labels: {
        style: {
          colors: ['#414E62'],
          fontSize: '12px',
          fontWeight: 400,
        },
      },
    },
    colors: ['#3B82F6', '#EAB308', '#A855F7'],
    legend: {
      position: 'top',
      fontSize: '12px',
      fontWeight: 400,
      showForSingleSeries: true,
    },
    fill: {
      opacity: 1,
    },
    yaxis: {
      // labels: {
      //   style: {
      //     colors: '#414E62',
      //   },
      // },
    },
    noData: {
      text: 'No data available',
      align: 'center',
      verticalAlign: 'middle',
      offsetX: 0,
      offsetY: 10, // Increase this value to move the text down
      style: {
        color: undefined,
        fontSize: '14px',
        fontFamily: undefined,
      },
    },
  };

  if (data?.map((item: any) => item?.l3_data?.length).includes(0)) {
    options.plotOptions = {};
    options.legend = {};
    options.xaxis = {
      labels: {
        show: false, // Hides x-axis labels
      },
    };
    options.yaxis = {
      labels: {
        show: false, // Hides y-axis labels
      },
    };
  }
  if (data.length === 0) {
    options.xaxis = {
      labels: {
        show: false, // Hides x-axis labels
      },
    };
    options.yaxis = {
      labels: {
        show: false, // Hides y-axis labels
      },
    };
  }

  return isLoaded ? (
    <div className="bg-[#FFFFFF] shadow-[0px_0.73px_36.69px_0px_rgba(172,172,172,0.149)] border-[#ACACAC26]/15% pl-[20.68px] pr-[20.18px] pt-[23.36px] pb-[20.68px] rounded-xl">
      <Suspense>
        <ReactApexChartLazy
          dir="ltr"
          options={options}
          series={series || []}
          data-chart-colors={['#3B82F6', '#EAB308', '#A855F7']}
          id={chartId}
          className="apex-charts"
          type="bar"
        />
      </Suspense>
    </div>
  ) : null;
};

export default BarChart;
