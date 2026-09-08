import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  icon,
  actions,
  className,
}: {
  title: ReactNode;
  description?: string;
  icon?: ReactNode;
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
      <div className="mx-auto flex w-full max-w-[1400px] flex-col flex-wrap gap-4 px-2 py-2 sm:flex-row sm:items-start sm:justify-between sm:px-3 sm:py-3">
        <div className="flex min-w-0 items-center gap-1.5">
          {icon}
          <div className="min-w-0">
            <h1 className="text-base font-semibold tracking-tight text-pretty text-foreground sm:text-lg">
              {title}
            </h1>
            {description && (
              <p className="mt-1 text-xs text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
        {actions}
      </div>
    </div>
  );
}
