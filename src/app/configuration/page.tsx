"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowClockwise as RefreshCw, ArrowRight } from "@phosphor-icons/react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SidebarInset } from "@/components/ui/sidebar";
import { PageHeader } from "@/components/page-header";
import { masterDataCategories } from "@/lib/master-data";
import { cn } from "@/lib/utils";
import { useSetTopBar } from "@/lib/top-bar-context";

export default function ConfigurationPage() {
  const [seeding, setSeeding] = useState(false);
  const [seededAt, setSeededAt] = useState<Date | null>(null);

  const crumbs = useMemo(() => [{ label: "Configuration" }], []);
  useSetTopBar(crumbs);

  function handleReseed() {
    setSeeding(true);
    window.setTimeout(() => {
      setSeeding(false);
      setSeededAt(new Date());
    }, 600);
  }

  return (
    <SidebarInset>
      <PageHeader
        title="Configuration"
        description="Org-level master data that drives every estimate. Maintained centrally, versioned, and applied across all projects."
      />

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8">
        <Card className="gap-0 py-0">
          <CardContent className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-card-foreground">
                  Master Data Status
                </h2>
                <Badge className="rounded-md border-emerald-200 bg-emerald-50 px-2 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400">
                  Seeded
                </Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                All masters are populated from the v18 defaults baseline.
                {seededAt && (
                  <span className="ml-1">
                    Last re-seeded {seededAt.toLocaleTimeString(undefined, {
                      hour: "numeric",
                      minute: "2-digit",
                    })}.
                  </span>
                )}
              </p>
            </div>
            <Button
              onClick={handleReseed}
              disabled={seeding}
              className="h-9 gap-1.5 px-4 sm:shrink-0"
            >
              <RefreshCw
                aria-hidden="true"
                className={cn("h-4 w-4", seeding && "animate-spin")}
              />
              {seeding ? "Seeding…" : "Re-seed (idempotent)"}
            </Button>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-4 pt-4 sm:grid-cols-2 xl:grid-cols-3">
          {masterDataCategories.map((category) => (
            <Card key={category.slug} className="gap-0 py-0">
              <CardHeader className="gap-2 px-5 pt-5">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-base font-semibold text-card-foreground">
                    {category.title}
                  </h3>
                  <Badge className="shrink-0 rounded-md border-emerald-200 bg-emerald-50 px-2 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400">
                    Seeded
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {category.description}
                </p>
              </CardHeader>

              <CardContent className="flex flex-col gap-3 px-5 pt-3 pb-5">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <Badge
                    variant="secondary"
                    className="rounded-md bg-accent px-2 font-medium text-accent-foreground"
                  >
                    {category.rowCount.toLocaleString()} row
                    {category.rowCount === 1 ? "" : "s"}
                  </Badge>
                  <span className="text-muted-foreground">{category.version}</span>
                </div>

                {category.breakdown && (
                  <div className="flex flex-wrap gap-1.5">
                    {category.breakdown.map((b) => (
                      <Badge
                        key={b.label}
                        variant="secondary"
                        className="rounded-md px-2 font-medium"
                      >
                        {b.label}: {b.count}
                      </Badge>
                    ))}
                  </div>
                )}

                <Link
                  href={`/configuration/${category.slug}`}
                  className="group inline-flex w-fit items-center gap-1 text-sm font-semibold text-primary hover:underline"
                >
                  Open
                  <ArrowRight
                    aria-hidden="true"
                    className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                  />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
        </div>
      </div>
    </SidebarInset>
  );
}
