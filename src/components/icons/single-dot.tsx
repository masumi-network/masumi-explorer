interface SingleDotProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

export default function SingleDot({ className, ...props }: SingleDotProps) {
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
      <circle
        cx="12"
        cy="12"
        r="4"
        fill="currentColor"
        fillOpacity="0.2"
      />
    </svg>
  );
} 