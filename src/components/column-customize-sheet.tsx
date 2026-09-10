"use client";

import * as React from "react";
import { Dialog as SheetPrimitive } from "radix-ui";
import {
  Buildings,
  CalendarBlank,
  CircleDashed,
  DotsSixVertical,
  GearSix,
  MagnifyingGlass as Search,
  MapPin,
  Tag,
  TextAa,
  X,
  type IconProps,
} from "@phosphor-icons/react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

export interface ProjectColumnVisibility {
  customer: boolean;
  type: boolean;
  region: boolean;
  status: boolean;
  date: boolean;
}

export const DEFAULT_COLUMN_VISIBILITY: ProjectColumnVisibility = {
  customer: true,
  type: true,
  region: true,
  status: true,
  date: true,
};

type FieldKey = "name" | keyof ProjectColumnVisibility;

const ALL_FIELDS: Array<{
  key: FieldKey;
  label: string;
  icon: React.ComponentType<IconProps>;
  locked?: boolean;
}> = [
  { key: "name", label: "Name", icon: TextAa, locked: true },
  { key: "customer", label: "Customer", icon: Buildings },
  { key: "type", label: "Type", icon: Tag },
  { key: "region", label: "Region", icon: MapPin },
  { key: "status", label: "Status", icon: CircleDashed },
  { key: "date", label: "Date", icon: CalendarBlank },
];

interface ColumnCustomizeSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  visibility: ProjectColumnVisibility;
  onVisibilityChange: (next: ProjectColumnVisibility) => void;
}

export function ColumnCustomizeSheet({
  open,
  onOpenChange,
  visibility,
  onVisibilityChange,
}: ColumnCustomizeSheetProps) {
  const [search, setSearch] = React.useState("");

  const fields = ALL_FIELDS.filter((f) => f.label.toLowerCase().includes(search.trim().toLowerCase()));
  const visibleCount = 1 + Object.values(visibility).filter(Boolean).length;

  return (
    <SheetPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <SheetPrimitive.Portal>
        <SheetPrimitive.Content
          className="fixed inset-y-12 right-0 z-30 flex w-full flex-col gap-0 border-l border-border bg-popover text-sm text-popover-foreground shadow-lg transition duration-200 ease-in-out outline-none sm:max-w-sm data-open:animate-in data-open:slide-in-from-right-10 data-closed:animate-out data-closed:slide-out-to-right-10"
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-3.5">
            <SheetPrimitive.Title className="font-heading text-base font-semibold text-foreground">
              Fields
            </SheetPrimitive.Title>
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="Field settings"
                className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <GearSix className="h-4 w-4" />
              </button>
              <SheetPrimitive.Close asChild>
                <button
                  type="button"
                  aria-label="Close"
                  className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </SheetPrimitive.Close>
            </div>
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
                placeholder="Search all fields"
                aria-label="Search all fields"
                autoComplete="off"
                className="h-9 pl-8"
              />
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-2 py-3">
            <p className="px-2 pb-1.5 text-xs font-semibold text-muted-foreground">
              Fields in this view ({visibleCount})
            </p>
            <div className="flex flex-col">
              {fields.map((field) => {
                const checked = field.locked ? true : visibility[field.key as keyof ProjectColumnVisibility];
                return (
                  <div
                    key={field.key}
                    className="group flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted"
                  >
                    <DotsSixVertical
                      aria-hidden="true"
                      className={cn(
                        "h-4 w-4 shrink-0 cursor-grab text-muted-foreground/40",
                        field.locked && "opacity-30"
                      )}
                    />
                    <field.icon aria-hidden="true" className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="flex-1 truncate text-sm text-foreground">{field.label}</span>
                    <Switch
                      checked={checked}
                      disabled={field.locked}
                      onCheckedChange={(value) => {
                        if (field.locked) return;
                        onVisibilityChange({
                          ...visibility,
                          [field.key as keyof ProjectColumnVisibility]: value,
                        });
                      }}
                      aria-label={`Toggle ${field.label} column`}
                    />
                  </div>
                );
              })}
              {fields.length === 0 && (
                <p className="px-2 py-4 text-center text-xs text-muted-foreground">No fields match your search.</p>
              )}
            </div>
          </div>
        </SheetPrimitive.Content>
      </SheetPrimitive.Portal>
    </SheetPrimitive.Root>
  );
}
