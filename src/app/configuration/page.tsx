"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowClockwise as RefreshCw,
  ArrowRight,
} from "@phosphor-icons/react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SidebarInset } from "@/components/ui/sidebar";
import { PageHeader } from "@/components/page-header";
import { masterDataCategories } from "@/lib/master-data";
import { cn } from "@/lib/utils";
import { useSetTopBar } from "@/lib/top-bar-context";

export default function ConfigurationPage() {
  const [seeding, setSeeding] = useState(false);
  const [seededAt, setSeededAt] = useState<Date | null>(null);
  const [statusDismissed, setStatusDismissed] = useState(false);

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
        icon={
          <Image
            src="/config-illustration.svg"
            alt=""
            aria-hidden="true"
            width={56}
            height={56}
            className="h-14 w-14 shrink-0"
          />
        }
        title="Configuration"
        description="Manage the org-level master data that drives every estimate — maintained centrally and applied across all your projects."
      />

      <div className="min-h-0 flex-1 overflow-y-auto bg-muted/50">
        <div className="mx-auto w-full max-w-[1400px] px-2 pt-3 pb-6 sm:px-3 sm:pt-4 sm:pb-8">
        {!statusDismissed && (
          <div className="relative flex items-start gap-3 overflow-hidden rounded-xl bg-orange-50 px-5 py-4 dark:bg-orange-950/40">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-foreground">
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
              <div className="mt-2 flex items-center gap-2 text-sm">
                <button
                  type="button"
                  onClick={handleReseed}
                  disabled={seeding}
                  className="inline-flex items-center gap-1 font-medium text-orange-700 underline-offset-2 hover:underline disabled:opacity-60 dark:text-orange-400"
                >
                  <RefreshCw
                    aria-hidden="true"
                    className={cn("h-3.5 w-3.5", seeding && "animate-spin")}
                  />
                  {seeding ? "Seeding…" : "Re-seed (idempotent)"}
                </button>
                <span className="text-muted-foreground">·</span>
                <button
                  type="button"
                  onClick={() => setStatusDismissed(true)}
                  className="font-medium text-orange-700 underline-offset-2 hover:underline dark:text-orange-400"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 pt-4 sm:grid-cols-2 xl:grid-cols-3">
          {masterDataCategories.map((category) => (
            <Card key={category.slug} className="gap-0 rounded-lg py-0">
              <CardContent className="flex flex-col gap-3 px-5 py-5">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-semibold text-card-foreground">
                    {category.title}
                  </h3>
                  <Badge
                    variant="secondary"
                    className="rounded-md bg-accent px-2 font-medium text-accent-foreground"
                  >
                    {category.rowCount.toLocaleString()} row
                    {category.rowCount === 1 ? "" : "s"}
                  </Badge>
                  <Badge className="shrink-0 rounded-md border-emerald-200 bg-emerald-50 px-2 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400">
                    Seeded
                  </Badge>
                  <Link
                    href={`/configuration/${category.slug}`}
                    aria-label={`Open ${category.title}`}
                    className="group ml-auto shrink-0 text-muted-foreground transition-colors hover:text-primary"
                  >
                    <ArrowRight
                      aria-hidden="true"
                      className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                    />
                  </Link>
                </div>

                <p className="text-sm text-muted-foreground">
                  {category.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
        </div>
      </div>
    </SidebarInset>
  );
}
