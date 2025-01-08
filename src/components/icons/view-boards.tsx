interface ViewBoardsProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

export default function ViewBoards({ className, ...props }: ViewBoardsProps) {
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
        d="M4 18V13H9V18H4ZM4 11V6H9V11H4ZM11 18V13H16V18H11ZM11 11V6H16V11H11ZM18 18V13H23V18H18ZM18 11V6H23V11H18Z"
        fill="currentColor"
        fillOpacity="0.2"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
} 