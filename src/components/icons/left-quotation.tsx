interface LeftQuotationProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

export default function LeftQuotation({ className, ...props }: LeftQuotationProps) {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        d="M13.3333 13.3333H8.66667C8.66667 10.3867 11.0533 8 14 8V6C9.95333 6 6.66667 9.28667 6.66667 13.3333V22.6667H13.3333V13.3333Z"
        fill="currentColor"
        fillOpacity="0.2"
      />
      <path
        d="M25.3333 13.3333H20.6667C20.6667 10.3867 23.0533 8 26 8V6C21.9533 6 18.6667 9.28667 18.6667 13.3333V22.6667H25.3333V13.3333Z"
        fill="currentColor"
        fillOpacity="0.2"
      />
    </svg>
  );
} 