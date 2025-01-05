"use client";

import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { baseChartOptions } from "@/lib/base-chart-options";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface Props {
  height?: number;
  colors?: string[];
  chartSeries: any[];
  chartCategories?: string[];
}

const ActionlessAreaChart = ({
  height = 100,
  colors = ["#10B981"],
  chartSeries,
  chartCategories = [],
}: Props) => {
  const options: ApexOptions = {
    ...baseChartOptions,
    colors,
    chart: {
      ...baseChartOptions.chart,
      type: "area",
    },
    xaxis: {
      ...baseChartOptions.xaxis,
      categories: chartCategories,
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [50, 100, 100],
      },
    },
  };

  return (
    <Chart
      type="area"
      height={height}
      series={chartSeries}
      options={options}
    />
  );
};

export default ActionlessAreaChart;
