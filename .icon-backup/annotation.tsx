import { SVGProps as ReactSVGProps } from "react";

const Annotation = (props: ReactSVGProps<SVGSVGElement>) => {
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
        id="Icon"
        d="M10.5 12H25.5M10.5 18H16.5M18 30L12 24H7.5C5.84315 24 4.5 22.6569 4.5 21V9C4.5 7.34315 5.84315 6 7.5 6H28.5C30.1569 6 31.5 7.34315 31.5 9V21C31.5 22.6569 30.1569 24 28.5 24H24L18 30Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default Annotation;
