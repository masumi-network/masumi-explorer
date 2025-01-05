"use client";

import merge from "lodash.merge";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import { baseChartOptions } from "@/lib/base-chart-options";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface Props {
  height?: number;
  colors?: string[];
  grid?: boolean;
  gridColor?: string;
  legendHorizontalPosition?: string;
  chartSeries: any[];
  chartCategories: string[];
}

const LineChart = ({
  height = 330,
  colors = ["#10B981"],
  grid = true,
  gridColor,
  legendHorizontalPosition = "right",
  chartSeries,
  chartCategories,
}: Props) => {
  const chartOptions: ApexOptions = merge({}, baseChartOptions, {
    colors,
    grid: {
      show: grid,
      borderColor: gridColor,
    },
    xaxis: {
      categories: chartCategories,
    },
  });

  return (
    <Chart
      type="line"
      height={height}
      series={chartSeries}
      options={chartOptions}
    />
  );
};

export default LineChart;
