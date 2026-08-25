import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  actions,
  className,
}: {
  title: ReactNode;
  description?: string;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "shrink-0 border-b border-border bg-background",
        className
      )}
    >
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-4 px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-6 sm:py-5">
        <div>
          <h1 className="text-base font-semibold tracking-tight text-pretty text-foreground sm:text-lg">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        {actions}
      </div>
    </div>
  );
}
