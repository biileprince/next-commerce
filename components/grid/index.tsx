import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GridProps {
  className?: string;
  children: ReactNode;
}

export function Grid({ className, children }: GridProps) {
  return (
    <ul className={cn("grid grid-flow-row gap-3 md:gap-4", className)}>
      {children}
    </ul>
  );
}

interface GridItemProps {
  className?: string;
  children: ReactNode;
}

export function GridItem({ className, children }: GridItemProps) {
  return (
    <li className={cn("aspect-[3/4] transition-opacity", className)}>
      {children}
    </li>
  );
}
