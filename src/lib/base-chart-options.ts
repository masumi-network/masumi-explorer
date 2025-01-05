import { ApexOptions } from "apexcharts";

export const baseChartOptions: ApexOptions = {
  chart: {
    toolbar: {
      show: false,
    },
    zoom: {
      enabled: false,
    }
  },
  colors: ['#2563eb'],
  dataLabels: {
    enabled: false,
  },
  grid: {
    show: false,
  },
  stroke: {
    width: 2,
    curve: 'smooth',
  },
  tooltip: {
    enabled: true,
  },
  xaxis: {
    labels: {
      show: true,
    },
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
  },
  yaxis: {
    labels: {
      show: true,
    }
  }
}; 