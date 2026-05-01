'use client';
import React, { Suspense, lazy, useEffect, useState, useRef } from 'react';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import TabularView from './tabularView';

// Extend dayjs with the customParseFormat plugin to handle custom date formats
dayjs.extend(customParseFormat);

const ReactApexChartLazy = lazy(() => import('react-apexcharts'));

interface TreemapDataPoint {
  x: string;
  y: number;
}

type TreeMapChartProps = {
  data: any[];
  handleSelectedCustomer: (customer: any) => void;
};

const abbreviateNumber = (num: number, digits = 1) => {
  const units = ['K', 'M', 'B', 'T', 'P', 'E'];
  let unitIndex = -1;
  let scaledNum = Math.abs(num);

  while (scaledNum >= 1000 && unitIndex < units.length - 1) {
    scaledNum /= 1000;
    unitIndex++;
  }

  const formattedNum = scaledNum.toFixed(
    scaledNum < 10 && unitIndex >= 0 ? digits : 0
  );

  return `${num < 0 ? '-' : ''}${formattedNum}${
    unitIndex >= 0 ? units[unitIndex] : ''
  }`;
};

function getRenewalMessage(renewalDate: string | null | undefined): string {
  if (!renewalDate) {
    return '';
  }

  // Parse the input date with the custom format "DD-MMM-YY"
  const parsedDate = dayjs(renewalDate, 'DD-MMM-YY');

  // If the parsed date is not valid, return an empty string
  if (!parsedDate.isValid()) {
    return '';
  }

  // Calculate the difference in days from the current date
  const daysUntilRenewal = Math.abs(parsedDate.diff(dayjs(), 'day'));

  // Return the appropriate message
  return daysUntilRenewal ? `Renewal in ${daysUntilRenewal} Days` : '';
}

const TreeMapChart: React.FC<TreeMapChartProps> = ({
  data,
  // handleSelectedCustomer,
}) => {
  const [chartData, setChartData] = useState<any>([]);

  useEffect(() => {
    setChartData(
      data?.map((item) => ({
        x: item?.customer_name,
        y: item?.customer_commercials?.budget_revenue_current_year || 12345,
        renewal_date: item?.renewal_date || '',
        customer_id: item?.customer_id,
      }))
    );
  }, [data]);

  // Define state to hold the selected nodes
  const [selectedNodes, setSelectedNodes] = useState<any[]>([]);

  // Function to handle single clicks
  const handleSingleClick = (nodeData: any) => {
    setSelectedNodes((prevState) => {
      // Update the state with the clicked node data
      return [...prevState, nodeData];
    });
  };

  // Function to handle double clicks
  const handleDoubleClick = (nodeData: any) => {
    setSelectedNodes((prevState) => {
      // Toggle the node in the state array
      const nodeIndex = prevState.findIndex(
        (node) => node.x === nodeData.x && node.y === nodeData.y
      );
      if (nodeIndex > -1) {
        // If the node is already selected, remove it
        const updatedNodes = [...prevState];
        updatedNodes.splice(nodeIndex, 1);
        return updatedNodes;
      } else {
        // If the node is not selected, add it
        return [...prevState, nodeData];
      }
    });
  };

  // Debounce function to differentiate between single and double clicks
  let clickTimeout: NodeJS.Timeout | null = null;
  const handleClick = (
    event: MouseEvent,
    chartContext: any,
    config: { seriesIndex: number; dataPointIndex: number; w: any }
  ) => {
    const { seriesIndex, dataPointIndex, w } = config;
    const nodeData = w.config.series[seriesIndex].data[dataPointIndex];

    if (clickTimeout) {
      clearTimeout(clickTimeout);
      clickTimeout = null;
      handleDoubleClick(nodeData);
    } else {
      clickTimeout = setTimeout(() => {
        handleSingleClick(nodeData);
        clickTimeout = null;
      }, 300); // Adjust the timeout for distinguishing between single and double clicks
    }
  };

  const [tooltip, setTooltip] = useState<{
    show: boolean;
    content: string;
    x: number;
    y: number;
  }>({
    show: false,
    content: '',
    x: 0,
    y: 0,
  });

  const chartRef = useRef<HTMLDivElement>(null);

  const series: { data: TreemapDataPoint[] }[] = [
    {
      // data: [
      //   { x: 'New Delhi', y: 218 },
      //   { x: 'Kolkata', y: 149 },
      //   { x: 'Mumbai', y: 184 },
      //   { x: 'Ahmedabad', y: 55 },
      //   { x: 'Bangaluru', y: 84 },
      //   { x: 'Pune', y: 31 },
      //   { x: 'Chennai', y: 70 },
      //   { x: 'Jaipur', y: 30 },
      //   { x: 'Surat', y: 44 },
      //   { x: 'Hyderabad', y: 68 },
      //   { x: 'Lucknow', y: 28 },
      //   { x: 'Indore', y: 19 },
      //   { x: 'Kanpur', y: 29 },
      // ],
      data: chartData,
    },
  ];

  const options: ApexCharts.ApexOptions = {
    legend: {
      show: false,
    },
    chart: {
      height: 350,
      type: 'treemap',
      toolbar: {
        show: false,
      },
      events: {
        click: handleClick,
      },
    },
    dataLabels: {
      enabled: true,
      style: {
        fontSize: '16px',
        fontWeight: 'medium',
        colors: ['#141C24'], // Label color
      },
      formatter: function (value, { seriesIndex, dataPointIndex, w }) {
        const yValue = w.config.series[seriesIndex].data[dataPointIndex].y;
        const renewalDate =
          w.config.series[seriesIndex].data[dataPointIndex].renewal_date;
        return (
          `${value}:  ` +
          abbreviateNumber(yValue) +
          ` ARR ` +
          getRenewalMessage(renewalDate)
        ); // Display X,Y & renewal_date values
      },
    },
    colors: ['#D9F2E5', '#FCCFCF', '#FFEECC', '#F2F4F7'],
    plotOptions: {
      treemap: {
        distributed: true,
        enableShades: false,
      },
    },
    tooltip: {
      enabled: false, // Disable default ApexCharts tooltip
    },
  };

  return (
    <div ref={chartRef}>
      <div className=" bg-white rounded-lg shadow-md mb-6">
        <h1 className="w-full flex justify-between items-center h-[28px] text-lg font-medium leading-[28px] text-[#141C24]">
          Overview of accounts you manage
        </h1>
        <div className="w-full h-[351px] mt-[20px] ">
          <div className="w-full h-[311px] p-[20px] ">
            <h1 className="w-full h-[20px] text-sm font-normal leading-[20px] text-[#637083]">
              Accounts you manage
            </h1>
            <Suspense fallback={<div>Loading...</div>}>
              <ReactApexChartLazy
                dir="ltr"
                options={options}
                series={series}
                type="treemap"
                height={282}
              />
            </Suspense>
          </div>
        </div>
      </div>
      <div className=" bg-white rounded-lg shadow-md mb-6">
        {/* <TabularView data={data} /> */}
      </div>
    </div>
  );
};

export default TreeMapChart;
