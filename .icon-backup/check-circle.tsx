import { SVGProps as ReactSVGProps } from "react";

const CheckCircle = (props: ReactSVGProps<SVGSVGElement>) => {
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
        d="M9 12.5L11 14.5L15 10.5M21 12.5C21 17.4706 16.9706 21.5 12 21.5C7.02944 21.5 3 17.4706 3 12.5C3 7.52944 7.02944 3.5 12 3.5C16.9706 3.5 21 7.52944 21 12.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default CheckCircle;
