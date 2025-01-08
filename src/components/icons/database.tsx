interface DatabaseProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

export default function Database({ className, ...props }: DatabaseProps) {
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
        d="M12 3C7.58 3 4 4.79 4 7V17C4 19.21 7.58 21 12 21C16.42 21 20 19.21 20 17V7C20 4.79 16.42 3 12 3ZM18 17C18 17.5 15.87 19 12 19C8.13 19 6 17.5 6 17V13.87C7.72 14.97 9.97 15.5 12 15.5C14.03 15.5 16.28 14.97 18 13.87V17ZM18 12C18 12.5 15.87 14 12 14C8.13 14 6 12.5 6 12V8.87C7.72 9.97 9.97 10.5 12 10.5C14.03 10.5 16.28 9.97 18 8.87V12ZM12 8.5C8.13 8.5 6 7 6 6.5C6 6 8.13 4.5 12 4.5C15.87 4.5 18 6 18 6.5C18 7 15.87 8.5 12 8.5Z"
        fill="currentColor"
        fillOpacity="0.2"
      />
    </svg>
  );
} 