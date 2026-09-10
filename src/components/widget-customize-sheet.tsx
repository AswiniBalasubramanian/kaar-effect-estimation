"use client";

import * as React from "react";
import { Dialog as SheetPrimitive } from "radix-ui";
import {
  ChartBar,
  ClipboardText,
  ListChecks,
  MagnifyingGlass as Search,
  Sliders,
  Stack,
  Timer,
  UsersThree,
  X,
  type IconProps,
} from "@phosphor-icons/react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

export interface EffortWidgetVisibility {
  effortByPhase: boolean;
  moduleSummary: boolean;
  executiveSummary: boolean;
  phaseTimeline: boolean;
  resourcePlan: boolean;
  assumptions: boolean;
}

export const DEFAULT_WIDGET_VISIBILITY: EffortWidgetVisibility = {
  effortByPhase: true,
  moduleSummary: true,
  executiveSummary: true,
  phaseTimeline: true,
  resourcePlan: true,
  assumptions: true,
};

const ALL_WIDGETS: Array<{
  key: keyof EffortWidgetVisibility;
  label: string;
  description: string;
  icon: React.ComponentType<IconProps>;
  iconClass: string;
}> = [
  {
    key: "effortByPhase",
    label: "Effort by Phase",
    description: "Man-hours and Peak FTE per SAP Activate phase.",
    icon: ChartBar,
    iconClass: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  },
  {
    key: "moduleSummary",
    label: "Module Summary — Scope, Hours",
    description: "Delivery hours rolled up by in-scope module.",
    icon: Stack,
    iconClass: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  },
  {
    key: "executiveSummary",
    label: "Executive Summary — Phase Breakdown",
    description: "PMO + Delivery hours breakdown by phase.",
    icon: ClipboardText,
    iconClass: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-400",
  },
  {
    key: "phaseTimeline",
    label: "Phase Timeline & Schedule",
    description: "Cumulative week ranges per phase.",
    icon: Timer,
    iconClass: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400",
  },
  {
    key: "resourcePlan",
    label: "Resource Plan — FTE by Role & Team",
    description: "FTE staffing by role and team.",
    icon: UsersThree,
    iconClass: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400",
  },
  {
    key: "assumptions",
    label: "Assumptions & Defaults",
    description: "Fields that fell back to default values.",
    icon: ListChecks,
    iconClass: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-400",
  },
];

interface WidgetCustomizeSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  visibility: EffortWidgetVisibility;
  onVisibilityChange: (next: EffortWidgetVisibility) => void;
}

export function WidgetCustomizeSheet({
  open,
  onOpenChange,
  visibility,
  onVisibilityChange,
}: WidgetCustomizeSheetProps) {
  const [search, setSearch] = React.useState("");

  const widgets = ALL_WIDGETS.filter((w) =>
    w.label.toLowerCase().includes(search.trim().toLowerCase())
  );
  const visibleCount = Object.values(visibility).filter(Boolean).length;

  return (
    <SheetPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <SheetPrimitive.Portal>
        <SheetPrimitive.Content
          className="fixed top-12 right-0 bottom-0 z-40 flex w-full flex-col gap-0 border-l border-border bg-popover text-sm text-popover-foreground shadow-lg transition duration-200 ease-in-out outline-none sm:max-w-sm data-open:animate-in data-open:slide-in-from-right-10 data-closed:animate-out data-closed:slide-out-to-right-10"
        >
          <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3.5">
            <div className="flex items-start gap-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
                <Sliders className="h-4 w-4" />
              </span>
              <div>
                <SheetPrimitive.Title className="font-heading text-base font-semibold text-foreground">
                  Customize widgets
                </SheetPrimitive.Title>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Choose which widgets appear on this estimate.
                </p>
              </div>
            </div>
            <SheetPrimitive.Close asChild>
              <button
                type="button"
                aria-label="Close"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </SheetPrimitive.Close>
          </div>

          <div className="px-4 pt-3">
            <div className="relative">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search widgets"
                aria-label="Search widgets"
                autoComplete="off"
                className="h-9 pl-8"
              />
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-2 py-3">
            <div className="flex items-center justify-between px-2 pb-1.5">
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Effort Estimate Widgets{" "}
                <span className="text-primary">
                  {visibleCount}/{ALL_WIDGETS.length}
                </span>
              </p>
              <button
                type="button"
                onClick={() => onVisibilityChange(DEFAULT_WIDGET_VISIBILITY)}
                className="text-xs font-medium text-primary hover:underline"
              >
                Reset
              </button>
            </div>
            <div className="flex flex-col divide-y divide-border">
              {widgets.map((widget) => (
                <div key={widget.key} className="flex items-center gap-2.5 px-2 py-2.5">
                  <span
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                      widget.iconClass
                    )}
                  >
                    <widget.icon aria-hidden="true" className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{widget.label}</p>
                    <p className="truncate text-xs text-muted-foreground">{widget.description}</p>
                  </div>
                  <Switch
                    checked={visibility[widget.key]}
                    onCheckedChange={(value) =>
                      onVisibilityChange({ ...visibility, [widget.key]: value })
                    }
                    aria-label={`Toggle ${widget.label} widget`}
                  />
                </div>
              ))}
              {widgets.length === 0 && (
                <p className="px-2 py-4 text-center text-xs text-muted-foreground">
                  No widgets match your search.
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-border px-4 py-3">
            <SheetPrimitive.Close asChild>
              <button
                type="button"
                className="inline-flex h-8 items-center justify-center rounded-md border border-border px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                Done
              </button>
            </SheetPrimitive.Close>
          </div>
        </SheetPrimitive.Content>
      </SheetPrimitive.Portal>
    </SheetPrimitive.Root>
  );
}
