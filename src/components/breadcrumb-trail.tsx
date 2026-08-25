import Link from "next/link";
import { CaretRight } from "@phosphor-icons/react";

import { cn } from "@/lib/utils";
import type { Crumb } from "@/lib/top-bar-context";

export function BreadcrumbTrail({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex min-w-0 items-center gap-1 text-sm"
    >
      {crumbs.map((crumb, index) => {
        const isLast = index === crumbs.length - 1;
        return (
          <span key={`${crumb.label}-${index}`} className="flex min-w-0 items-center gap-1">
            {index > 0 && (
              <CaretRight
                aria-hidden="true"
                className="h-3 w-3 shrink-0 text-muted-foreground"
              />
            )}
            {crumb.href && !isLast ? (
              <Link
                href={crumb.href}
                className="truncate text-muted-foreground hover:text-foreground"
              >
                {crumb.label}
              </Link>
            ) : (
              <span
                className={cn(
                  "truncate",
                  isLast ? "font-medium text-foreground" : "text-muted-foreground"
                )}
              >
                {crumb.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
