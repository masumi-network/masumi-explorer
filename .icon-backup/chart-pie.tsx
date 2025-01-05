import { SVGProps as ReactSVGProps } from "react";

const ChartPie = (props: ReactSVGProps<SVGSVGElement>) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path
        d="M17 4.58203C10.2501 5.3282 5 11.0508 5 17.9996C5 25.4555 11.0442 31.4996 18.5 31.4996C25.4488 31.4996 31.1714 26.2496 31.9176 19.4996H17V4.58203Z"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M31.2317 13.4996H23V5.26809C26.8358 6.62384 29.8759 9.66391 31.2317 13.4996Z"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default ChartPie;
