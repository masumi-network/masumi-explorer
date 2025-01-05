import { cn } from "@/lib/utils";
import React, { HTMLAttributes } from "react";

const Footer = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => {
  return (
    <footer
      className={cn(
        "flex items-center justify-between border-t bg-background p-4",
        className
      )}
      {...props}
    >
      <p className="text-sm text-muted-foreground">
        Built by{" "}
        <a
          href="https://twitter.com/shadcn"
          target="_blank"
          rel="noreferrer"
          className="font-medium underline underline-offset-4"
        >
          shadcn
        </a>
        . The source code is available on{" "}
        <a
          href="https://github.com/shadcn/ui"
          target="_blank"
          rel="noreferrer"
          className="font-medium underline underline-offset-4"
        >
          GitHub
        </a>
        .
      </p>
    </footer>
  );
};

export default Footer;
