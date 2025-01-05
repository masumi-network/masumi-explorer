"use client";

import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { baseChartOptions } from "@/lib/base-chart-options";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface Props {
  height?: number;
  colors?: string[];
  labels?: string[];
  chartSeries: number[];
}

const ActionlessDonutChart = ({
  height = 100,
  colors = ["#10B981"],
  labels = [],
  chartSeries,
}: Props) => {
  const options: ApexOptions = {
    ...baseChartOptions,
    colors,
    labels,
    legend: {
      show: false,
    },
    plotOptions: {
      pie: {
        donut: {
          size: '75%',
        },
      },
    },
  };

  return (
    <Chart
      type="donut"
      height={height}
      series={chartSeries}
      options={options}
    />
  );
};

export default ActionlessDonutChart;
