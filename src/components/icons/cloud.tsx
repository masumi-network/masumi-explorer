interface CloudProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

export default function Cloud({ className, ...props }: CloudProps) {
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
        d="M17.5 19H6.5C4.01 19 2 16.99 2 14.5C2 12.01 4.01 10 6.5 10H19.5C21.99 10 24 12.01 24 14.5C24 16.99 21.99 19 19.5 19H17.5Z"
        fill="currentColor"
        fillOpacity="0.2"
      />
    </svg>
  );
} 