"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowClockwise as RefreshCw,
  ArrowRight,
  LockSimple,
  Plus,
} from "@phosphor-icons/react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SidebarInset } from "@/components/ui/sidebar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/page-header";
import { masterDataCategories } from "@/lib/master-data";
import { cn } from "@/lib/utils";
import { useSetTopBar } from "@/lib/top-bar-context";
import { createConfigSet, deleteConfigSet, useConfigSets } from "@/lib/config-sets-store";

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
  const router = useRouter();
  const [seeding, setSeeding] = useState(false);
  const [seededAt, setSeededAt] = useState<Date | null>(null);
  const [statusDismissed, setStatusDismissed] = useState(false);
  const [view, setView] = useState<"golden" | "configSets">("golden");
  const configSets = useConfigSets();

  const [newSetDialogOpen, setNewSetDialogOpen] = useState(false);
  const [newSetName, setNewSetName] = useState("");
  const [newSetDescription, setNewSetDescription] = useState("");
  const [newSetCloneFrom, setNewSetCloneFrom] = useState("golden");

  const crumbs = useMemo(() => [{ label: "Configuration" }], []);
  useSetTopBar(crumbs);

  function handleReseed() {
    setSeeding(true);
    window.setTimeout(() => {
      setSeeding(false);
      setSeededAt(new Date());
    }, 600);
  }

  function resetNewSetForm() {
    setNewSetName("");
    setNewSetDescription("");
    setNewSetCloneFrom("golden");
  }

  function handleCreateConfigSet() {
    if (!newSetName.trim()) return;
    const clonedFromSet = configSets.find((s) => s.id === newSetCloneFrom);
    const newSet = createConfigSet({
      name: newSetName.trim(),
      description: newSetDescription.trim(),
      clonedFrom:
        newSetCloneFrom === "golden" ? "Golden Masters" : clonedFromSet?.name ?? "Golden Masters",
    });
    setNewSetDialogOpen(false);
    resetNewSetForm();
    router.push(`/configuration/config-sets/${newSet.id}`);
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
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

      <div className="min-h-0 flex-1 overflow-y-auto bg-muted/25">
        <div className="mx-auto w-full max-w-[1400px] px-2 pt-3 pb-6 sm:px-3 sm:pt-4 sm:pb-8">
        <Tabs value={view} onValueChange={(v) => setView(v as "golden" | "configSets")}>
          <TabsList className="grid w-full grid-cols-2 sm:w-[360px]">
            <TabsTrigger value="golden">Golden Masters</TabsTrigger>
            <TabsTrigger value="configSets">
              Config Sets{configSets.length > 0 ? ` (${configSets.length})` : ""}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {!statusDismissed && (
          <div className="relative mt-4 flex items-center gap-3 overflow-hidden rounded-xl border border-orange-200 bg-orange-50 px-5 py-3 dark:border-orange-900 dark:bg-orange-950/40">
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

        {view === "golden" ? (
          <div className="mt-4 rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-1.5">
              <LockSimple className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-base font-semibold text-card-foreground">Golden Masters</h2>
              <Badge variant="outline" className="rounded-md border-border text-muted-foreground">
                Immutable
              </Badge>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              The baseline configuration seeded from v18 defaults. Read-only for everyone — clone
              to edit.
            </p>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="flex flex-wrap items-center gap-2 text-base font-semibold text-card-foreground">
                        {category.title}
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                          {category.rowCount.toLocaleString()} row
                          {category.rowCount === 1 ? "" : "s"}
                        </span>
                      </h3>
                      <span className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary">
                        View <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {category.description}
                    </p>
                  </CardContent>
                </Card>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-border bg-card p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-card-foreground">Config Sets</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Editable copies of the golden masters. Assign a config set to a project during
                  creation.
                </p>
              </div>
              <Button type="button" size="sm" className="gap-1.5" onClick={() => setNewSetDialogOpen(true)}>
                <Plus className="h-4 w-4" />
                New Config Set
              </Button>
            </div>

            {configSets.length === 0 ? (
              <p className="mt-4 rounded-md bg-muted/50 px-3 py-6 text-center text-sm text-muted-foreground">
                No config sets yet. Create one to customize master data per project without
                touching the Golden Masters.
              </p>
            ) : (
              <div className="mt-4 divide-y divide-border rounded-lg border border-border">
                {configSets.map((set) => (
                  <div
                    key={set.id}
                    className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        <p className="font-medium text-foreground">{set.name}</p>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Cloned from <span className="font-medium">{set.clonedFrom}</span> ·
                        Created {formatDate(set.createdAt)}{" "}
                        <Link
                          href={`/configuration/config-sets/${set.id}`}
                          className="font-medium text-primary hover:underline"
                        >
                          here
                        </Link>
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setNewSetName(`${set.name} (copy)`);
                          setNewSetDescription(set.description);
                          setNewSetCloneFrom(set.id);
                          setNewSetDialogOpen(true);
                        }}
                      >
                        Clone
                      </Button>
                      <Button type="button" variant="outline" size="sm" asChild>
                        <Link href={`/configuration/config-sets/${set.id}`}>Edit</Link>
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="border-destructive text-destructive hover:bg-destructive/10"
                        onClick={() => deleteConfigSet(set.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        </div>
      </div>

      <Dialog
        open={newSetDialogOpen}
        onOpenChange={(open) => {
          setNewSetDialogOpen(open);
          if (!open) resetNewSetForm();
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New Config Set</DialogTitle>
            <DialogDescription>
              Editable copies of the golden masters. Assign a config set to a project during
              creation.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Name</Label>
              <Input
                value={newSetName}
                onChange={(e) => setNewSetName(e.target.value)}
                placeholder="e.g. GCC High-Touch"
                autoComplete="off"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Description</Label>
              <Input
                value={newSetDescription}
                onChange={(e) => setNewSetDescription(e.target.value)}
                placeholder="Optional notes about this configuration variant"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Clone from</Label>
              <Select value={newSetCloneFrom} onValueChange={setNewSetCloneFrom}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="golden">Golden Masters (default)</SelectItem>
                  {configSets.map((set) => (
                    <SelectItem key={set.id} value={set.id}>
                      {set.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                All master rows from the selected source will be copied into the new set.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setNewSetDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleCreateConfigSet} disabled={!newSetName.trim()}>
              Create &amp; Edit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarInset>
  );
}
