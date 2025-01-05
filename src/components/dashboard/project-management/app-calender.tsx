"use client";

import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { HTMLAttributes } from "react";

type Props = HTMLAttributes<HTMLDivElement>;

const AppCalender = ({ className, ...props }: Props) => {
  return (
    <Card className={cn("h-[500px] overflow-hidden p-6", className)} {...props}>
      <div>Calendar Component (Coming Soon)</div>
    </Card>
  );
};

export default AppCalender;
