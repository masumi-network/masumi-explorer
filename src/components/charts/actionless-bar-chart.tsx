"use client";

import merge from "lodash.merge";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import { baseChartOptions } from "@/lib/base-chart-options";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface Props {
  height?: number;
  colors?: string[];
  chartSeries: any[];
  chartCategories?: string[];
}

const ActionlessBarChart = ({
  height = 120,
  colors = ["#10B981"],
  chartSeries,
  chartCategories = [],
}: Props) => {
  const options: ApexOptions = merge({}, baseChartOptions, {
    colors,
    chart: { 
      ...baseChartOptions.chart,
      offsetY: 30,
      type: 'bar'
    },
    stroke: { show: false },
    xaxis: {
      ...baseChartOptions.xaxis,
      categories: chartCategories,
    },
  });

  return (
    <Chart
      type="bar"
      height={height}
      series={chartSeries}
      options={options}
    />
  );
};

export default ActionlessBarChart;
