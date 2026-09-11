"use client";

import * as React from "react";
import { Funnel, Plus, Trash, X } from "@phosphor-icons/react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  projectStatusDotClass,
  projectStatusLabel,
  type Project,
  type ProjectStatus,
  type ProjectType,
} from "@/lib/projects";

const STATUS_OPTIONS: ProjectStatus[] = ["draft", "submitted", "in-estimate", "won", "archived"];
const TYPE_OPTIONS: ProjectType[] = ["greenfield", "brownfield", "rollout"];
const TYPE_LABEL: Record<ProjectType, string> = {
  greenfield: "Greenfield",
  brownfield: "Brownfield",
  rollout: "Rollout",
};

export interface ProjectFilters {
  status: ProjectStatus[];
  type: ProjectType[];
  region: string[];
}

export const EMPTY_PROJECT_FILTERS: ProjectFilters = { status: [], type: [], region: [] };

export interface AdvancedFilterRule {
  id: string;
  field: "name" | "customer" | "status" | "type" | "region";
  operator: "contains" | "equals" | "not_contains";
  value: string;
}

const FIELD_LABEL: Record<AdvancedFilterRule["field"], string> = {
  name: "Name",
  customer: "Customer",
  status: "Status",
  type: "Type",
  region: "Region",
};

const OPERATOR_LABEL: Record<AdvancedFilterRule["operator"], string> = {
  contains: "Contains",
  equals: "Is",
  not_contains: "Does not contain",
};

function makeRule(): AdvancedFilterRule {
  return { id: `rule-${Math.random().toString(36).slice(2)}`, field: "name", operator: "contains", value: "" };
}

function ruleValue(project: Project, field: AdvancedFilterRule["field"]): string {
  switch (field) {
    case "name":
      return project.name;
    case "customer":
      return project.customer ?? "";
    case "status":
      return projectStatusLabel[project.status];
    case "type":
      return TYPE_LABEL[project.type];
    case "region":
      return project.region ?? "";
  }
}

function ruleMatches(project: Project, rule: AdvancedFilterRule): boolean {
  const needle = rule.value.trim().toLowerCase();
  if (!needle) return true;
  const haystack = ruleValue(project, rule.field).toLowerCase();
  switch (rule.operator) {
    case "contains":
      return haystack.includes(needle);
    case "not_contains":
      return !haystack.includes(needle);
    case "equals":
      return haystack === needle;
  }
}

export function filterProjects(
  projects: Project[],
  filters: ProjectFilters,
  rules: AdvancedFilterRule[]
): Project[] {
  return projects.filter((p) => {
    if (filters.status.length > 0 && !filters.status.includes(p.status)) return false;
    if (filters.type.length > 0 && !filters.type.includes(p.type)) return false;
    if (filters.region.length > 0 && !(p.region && filters.region.includes(p.region))) return false;
    return rules.every((rule) => ruleMatches(p, rule));
  });
}

interface ProjectFilterPopoverProps {
  projects: Project[];
  shownCount: number;
  totalCount: number;
  filters: ProjectFilters;
  advancedRules: AdvancedFilterRule[];
  onApply: (filters: ProjectFilters, rules: AdvancedFilterRule[]) => void;
  onClear: () => void;
  activeCount: number;
}

export function ProjectFilterPopover({
  projects,
  shownCount,
  totalCount,
  filters,
  advancedRules,
  onApply,
  onClear,
  activeCount,
}: ProjectFilterPopoverProps) {
  const [open, setOpen] = React.useState(false);
  const [mode, setMode] = React.useState<"simple" | "advanced">("simple");
  const [pending, setPending] = React.useState<ProjectFilters>(filters);
  const [pendingRules, setPendingRules] = React.useState<AdvancedFilterRule[]>(advancedRules);

  React.useEffect(() => {
    if (open) {
      setPending(filters);
      setPendingRules(advancedRules);
      setMode("simple");
    }
  }, [open, filters, advancedRules]);

  const statusCounts = React.useMemo(() => {
    const map = new Map<ProjectStatus, number>();
    for (const p of projects) map.set(p.status, (map.get(p.status) ?? 0) + 1);
    return map;
  }, [projects]);

  const typeCounts = React.useMemo(() => {
    const map = new Map<ProjectType, number>();
    for (const p of projects) map.set(p.type, (map.get(p.type) ?? 0) + 1);
    return map;
  }, [projects]);

  const regionCounts = React.useMemo(() => {
    const map = new Map<string, number>();
    for (const p of projects) {
      if (!p.region) continue;
      map.set(p.region, (map.get(p.region) ?? 0) + 1);
    }
    return map;
  }, [projects]);

  function toggleStatus(value: ProjectStatus) {
    setPending((prev) => ({
      ...prev,
      status: prev.status.includes(value) ? prev.status.filter((v) => v !== value) : [...prev.status, value],
    }));
  }

  function toggleType(value: ProjectType) {
    setPending((prev) => ({
      ...prev,
      type: prev.type.includes(value) ? prev.type.filter((v) => v !== value) : [...prev.type, value],
    }));
  }

  function toggleRegion(value: string) {
    setPending((prev) => ({
      ...prev,
      region: prev.region.includes(value) ? prev.region.filter((v) => v !== value) : [...prev.region, value],
    }));
  }

  function handleApply() {
    onApply(pending, pendingRules.filter((r) => r.value.trim().length > 0));
    setOpen(false);
  }

  function handleClearAll() {
    setPending(EMPTY_PROJECT_FILTERS);
    setPendingRules([]);
    onClear();
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Filter projects"
          title="Filter"
          aria-expanded={open}
          className={cn(
            "relative inline-flex h-9 shrink-0 items-center justify-center rounded-lg border px-2 transition-colors",
            activeCount > 0
              ? "border-primary/40 bg-primary/10 text-primary-text hover:bg-primary/15"
              : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <Funnel className="h-4 w-4" />
          {activeCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
              {activeCount}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-[min(92vw,640px)] max-w-none gap-0 p-0">
        {mode === "simple" ? (
          <div className="flex flex-col">
            <div className="flex items-start justify-between gap-3 px-4 pt-3.5">
              <div>
                <p className="text-sm font-semibold text-foreground">Filters</p>
                <p className="text-xs text-muted-foreground">
                  Showing {shownCount} of {totalCount} projects
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  Clear all
                </button>
                <Button size="sm" onClick={handleApply}>
                  Apply
                </Button>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-4 border-b border-border px-4 text-xs font-medium">
              <span className="border-b-2 border-primary pb-2 text-foreground">All columns</span>
              <span className="pb-2 text-muted-foreground/50">My filters</span>
            </div>

            <div className="flex divide-x divide-border overflow-x-auto">
              <FilterColumn title="Status">
                {STATUS_OPTIONS.map((status) => (
                  <FilterChip
                    key={status}
                    selected={pending.status.includes(status)}
                    onClick={() => toggleStatus(status)}
                    count={statusCounts.get(status) ?? 0}
                  >
                    <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", projectStatusDotClass[status])} />
                    {projectStatusLabel[status]}
                  </FilterChip>
                ))}
              </FilterColumn>

              <FilterColumn title="Type">
                {TYPE_OPTIONS.map((type) => (
                  <FilterChip
                    key={type}
                    selected={pending.type.includes(type)}
                    onClick={() => toggleType(type)}
                    count={typeCounts.get(type) ?? 0}
                  >
                    {TYPE_LABEL[type]}
                  </FilterChip>
                ))}
              </FilterColumn>

              <FilterColumn title="Region">
                {regionCounts.size > 0 ? (
                  [...regionCounts.keys()].map((region) => (
                    <FilterChip
                      key={region}
                      selected={pending.region.includes(region)}
                      onClick={() => toggleRegion(region)}
                      count={regionCounts.get(region) ?? 0}
                    >
                      {region}
                    </FilterChip>
                  ))
                ) : (
                  <p className="px-2.5 py-2 text-xs text-muted-foreground">No regions yet</p>
                )}
              </FilterColumn>
            </div>

            <div className="border-t border-border p-3">
              <button
                type="button"
                onClick={() => setMode("advanced")}
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
              >
                Show advanced filters
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col">
            <div className="flex items-start justify-between gap-3 px-4 pt-3.5">
              <div>
                <button
                  type="button"
                  onClick={() => setMode("simple")}
                  className="text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  ← Back to filters
                </button>
                <p className="mt-1 text-sm font-semibold text-foreground">Advanced filters</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  Clear all
                </button>
                <Button size="sm" onClick={handleApply}>
                  Apply
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-2 p-4">
              {pendingRules.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  No advanced rules yet. Add one to match projects by field.
                </p>
              )}
              {pendingRules.map((rule, index) => (
                <div key={rule.id} className="flex items-center gap-1.5">
                  <span className="w-10 shrink-0 text-xs font-medium text-muted-foreground">
                    {index === 0 ? "Where" : "And"}
                  </span>
                  <select
                    value={rule.field}
                    onChange={(e) =>
                      setPendingRules((prev) =>
                        prev.map((r) =>
                          r.id === rule.id ? { ...r, field: e.target.value as AdvancedFilterRule["field"] } : r
                        )
                      )
                    }
                    className="h-8 rounded-md border border-border bg-background px-2 text-xs text-foreground"
                  >
                    {Object.entries(FIELD_LABEL).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <select
                    value={rule.operator}
                    onChange={(e) =>
                      setPendingRules((prev) =>
                        prev.map((r) =>
                          r.id === rule.id
                            ? { ...r, operator: e.target.value as AdvancedFilterRule["operator"] }
                            : r
                        )
                      )
                    }
                    className="h-8 rounded-md border border-border bg-background px-2 text-xs text-foreground"
                  >
                    {Object.entries(OPERATOR_LABEL).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <Input
                    value={rule.value}
                    onChange={(e) =>
                      setPendingRules((prev) =>
                        prev.map((r) => (r.id === rule.id ? { ...r, value: e.target.value } : r))
                      )
                    }
                    placeholder="Value"
                    className="h-8 flex-1 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setPendingRules((prev) => prev.filter((r) => r.id !== rule.id))}
                    aria-label="Remove filter rule"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={() => setPendingRules((prev) => [...prev, makeRule()])}
                className="mt-1 inline-flex w-fit items-center gap-1.5 text-xs font-medium text-primary-text hover:underline"
              >
                <Plus className="h-3.5 w-3.5" />
                Add filter rule
              </button>

              {pendingRules.length > 0 && (
                <>
                  <div className="my-1 border-t border-border" />
                  <button
                    type="button"
                    onClick={() => setPendingRules([])}
                    className="inline-flex w-fit items-center gap-1.5 text-xs font-medium text-destructive hover:underline"
                  >
                    <Trash className="h-3.5 w-3.5" />
                    Delete filter
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

function FilterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex min-w-36 flex-1 flex-col gap-1 px-3 py-3">
      <p className="px-1 text-xs font-semibold text-foreground">{title}</p>
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  );
}

function FilterChip({
  selected,
  onClick,
  count,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-xs font-medium transition-colors",
        selected ? "bg-primary/10 text-primary-text ring-1 ring-primary/30" : "text-foreground hover:bg-muted"
      )}
    >
      <span className="flex min-w-0 items-center gap-1.5 truncate">{children}</span>
      <span className={cn("shrink-0 text-[11px]", selected ? "text-primary-text/70" : "text-muted-foreground")}>
        {count}
      </span>
    </button>
  );
}
