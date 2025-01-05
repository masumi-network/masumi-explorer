"use client";

import merge from "lodash.merge";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import { baseChartOptions } from "@/lib/base-chart-options";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface AreaChartProps {
  options?: ApexOptions;
  series?: ApexAxisChartSeries;
  type?: "area";
  height?: number | string;
  colors?: string[];
  chartSeries: { name: string; data: number[] }[];
  chartCategories: string[];
}

export default function AreaChart({
  options = {},
  series = [],
  type = "area",
  height = 350,
  colors = [],
  chartSeries,
  chartCategories,
}: AreaChartProps) {
  const areaChartOptions = merge({}, baseChartOptions, {
    grid: {
      show: true,
      strokeDashArray: 3,
      padding: {
        left: 0,
        right: 0,
        top: -20,
        bottom: -8,
      },
    },
    stroke: {
      width: 2,
      curve: 'smooth',
    },
    ...options
  });

  return (
    <Chart
      options={areaChartOptions}
      series={series}
      type={type}
      height={height}
    />
  );
}
