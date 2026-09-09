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

const cardBanners = [
  "from-orange-400 to-rose-500",
  "from-sky-400 to-blue-600",
  "from-emerald-400 to-teal-600",
  "from-violet-400 to-purple-600",
  "from-amber-400 to-orange-600",
  "from-rose-400 to-pink-600",
  "from-slate-500 to-slate-700",
];

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
          <div className="relative flex items-center gap-3 overflow-hidden rounded-xl border border-orange-200 bg-orange-50 px-5 py-3 dark:border-orange-900 dark:bg-orange-950/40">
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
              <div className="mt-1.5 flex items-center gap-2 text-sm">
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
            <Image
              src="/master-data-status-illustration-v2.png"
              alt=""
              aria-hidden="true"
              width={220}
              height={96}
              className="hidden h-[96px] w-[220px] shrink-0 object-contain sm:block"
            />
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 pt-4 sm:grid-cols-2 lg:grid-cols-3">
          {masterDataCategories.map((category, index) => (
            <Link
              key={category.slug}
              href={`/configuration/${category.slug}`}
              aria-label={`Open ${category.title}`}
              className="flex h-full"
            >
            <Card className="w-full gap-0 overflow-hidden rounded-xl py-0 transition-shadow hover:shadow-md h-full">
              <div
                className={cn(
                  "relative flex h-36 items-start overflow-hidden px-3 pt-2.5",
                  !category.image &&
                    cn("bg-gradient-to-br", cardBanners[index % cardBanners.length])
                )}
              >
                {category.image && (
                  <Image
                    src={category.image}
                    alt=""
                    aria-hidden="true"
                    fill
                    className="object-cover"
                  />
                )}
                {category.image && (
                  <div className="absolute inset-0 bg-gradient-to-b from-white/85 via-white/35 to-transparent" />
                )}
                <div className="relative flex flex-1 flex-wrap items-center justify-between gap-1.5">
                  <span className="rounded-full bg-emerald-100/90 px-2.5 py-1 text-xs font-medium text-emerald-700 backdrop-blur-sm">
                    Seeded
                  </span>
                  <span className="rounded-full bg-gray-600/60 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
                    {category.version.toUpperCase()}
                  </span>
                </div>
              </div>
              <CardContent className="flex flex-1 flex-col gap-2 px-4 pt-3 pb-4">
                <h3 className="flex flex-wrap items-center gap-2 text-base font-semibold text-card-foreground">
                  {category.title}
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    {category.rowCount.toLocaleString()} row
                    {category.rowCount === 1 ? "" : "s"}
                  </span>
                </h3>
                <p className="text-sm text-muted-foreground">
                  {category.description}
                </p>
              </CardContent>
            </Card>
            </Link>
          ))}
        </div>
        </div>
      </div>
    </SidebarInset>
  );
}
