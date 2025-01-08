interface ShadcnKitProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

export default function ShadcnKit({ className, ...props }: ShadcnKitProps) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        d="M12 2L2 19.7778H22L12 2Z M12 6L6 17H18L12 6Z"
        fill="currentColor"
        fillOpacity="0.2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
} 