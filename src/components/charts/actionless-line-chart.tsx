"use client";

import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { baseChartOptions } from "@/lib/base-chart-options";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface Props {
  height?: number;
  colors?: string[];
  strokeWidth?: number;
  chartSeries: any[];
}

const ActionlessLineChart = ({
  height = 100,
  colors = ["#10B981"],
  strokeWidth = 2,
  chartSeries,
}: Props) => {
  const options: ApexOptions = {
    ...baseChartOptions,
    colors,
    stroke: {
      ...baseChartOptions.stroke,
      width: strokeWidth,
    },
  };

  return (
    <Chart
      type="line"
      height={height}
      series={chartSeries}
      options={options}
    />
  );
};

export default ActionlessLineChart;
