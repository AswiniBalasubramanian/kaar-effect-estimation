"use client";

import { use, useMemo, useState } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "@phosphor-icons/react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/page-header";
import { SidebarInset } from "@/components/ui/sidebar";
import { masterDataCategories } from "@/lib/master-data";
import { cn } from "@/lib/utils";
import { useSetTopBar } from "@/lib/top-bar-context";
import { renameConfigSet, useConfigSets } from "@/lib/config-sets-store";

const cardBanners = [
  "from-orange-400 to-rose-500",
  "from-sky-400 to-blue-600",
  "from-emerald-400 to-teal-600",
  "from-violet-400 to-purple-600",
  "from-amber-400 to-orange-600",
  "from-rose-400 to-pink-600",
  "from-slate-500 to-slate-700",
];

export default function ConfigSetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const configSets = useConfigSets();
  const configSet = configSets.find((s) => s.id === id);

  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [renameValue, setRenameValue] = useState("");

  const crumbs = useMemo(
    () => [
      { label: "Configuration", href: "/configuration" },
      { label: configSet?.name ?? "Config set" },
    ],
    [configSet]
  );
  useSetTopBar(crumbs);

  if (!configSet) notFound();

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function openRenameDialog() {
    setRenameValue(configSet!.name);
    setRenameDialogOpen(true);
  }

  function applyRename() {
    if (!renameValue.trim()) return;
    renameConfigSet(configSet!.id, renameValue.trim());
    setRenameDialogOpen(false);
  }

  return (
    <SidebarInset>
      <PageHeader
        icon={
          <Button
            asChild
            size="icon-sm"
            variant="outline"
            className="mt-0.5 shrink-0 self-start"
            aria-label="Back to Configuration"
          >
            <Link href="/configuration">
              <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            </Link>
          </Button>
        }
        title={
          <span className="inline-flex items-center gap-2">
            {configSet.name}
            <Badge className="rounded-md border-emerald-200 bg-emerald-50 px-1.5 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400">
              Editable
            </Badge>
          </span>
        }
        description={`Cloned from ${configSet.clonedFrom} · Created ${formatDate(configSet.createdAt)}`}
        actions={
          <div className="flex shrink-0 items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={openRenameDialog}>
              Rename
            </Button>
            <Button type="button" variant="outline" size="sm" asChild>
              <Link href="/configuration">Back to Configuration</Link>
            </Button>
          </div>
        }
      />

      <div className="min-h-0 flex-1 overflow-y-auto bg-muted/25">
        <div className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {masterDataCategories.map((category, index) => (
              <Link
                key={category.slug}
                href={`/configuration/${category.slug}?set=${configSet.id}`}
                aria-label={`Edit ${category.title}`}
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
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="rounded-full bg-gray-100/90 px-2.5 py-1 text-xs font-medium text-gray-700 backdrop-blur-sm">
                          Seeded
                        </span>
                        <span className="rounded-full bg-blue-100/90 px-2.5 py-1 text-xs font-medium text-blue-700 backdrop-blur-sm">
                          Editable
                        </span>
                      </div>
                      <span className="rounded-full bg-gray-600/60 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
                        {category.version.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <CardContent className="flex flex-1 flex-col gap-2 px-4 pt-3 pb-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="flex flex-wrap items-center gap-2 text-base font-semibold text-card-foreground">
                        {category.title}
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                          {category.rowCount.toLocaleString()} row
                          {category.rowCount === 1 ? "" : "s"}
                        </span>
                      </h3>
                      <span className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary-text">
                        Edit <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Rename Config Set</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-1.5">
            <Label>Name</Label>
            <Input
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              autoComplete="off"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setRenameDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={applyRename} disabled={!renameValue.trim()}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarInset>
  );
}
