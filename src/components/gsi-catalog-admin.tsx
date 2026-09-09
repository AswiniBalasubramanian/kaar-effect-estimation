"use client";

import { useMemo, useState } from "react";
import {
  CaretDown,
  CaretRight,
  Columns as ColumnsIcon,
  FunnelSimple,
  MagnifyingGlass as Search,
  PencilSimple,
  Plus,
  Stack,
} from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { GsiCatalogRow, GsiInstanceDriver } from "@/lib/master-data";

const PRODUCTS = ["Ariba", "S4H_OnPrem", "S4H_Cloud", "SuccessFactors"];
const LEVELS: GsiCatalogRow["defaultLevel"][] = ["L3", "L4", "L5"];
const COMPLEXITIES: GsiCatalogRow["defaultComplexity"][] = ["L", "M", "H"];
const STATUSES: GsiCatalogRow["status"][] = ["Active", "Inactive"];
const INSTANCE_DRIVERS: GsiInstanceDriver[] = [
  "Fixed1",
  "LegalEntities",
  "Countries",
  "Plants",
  "SalesOrg",
  "PurchaseUnits",
  "Currencies",
];

const PAGE_SIZE = 25;

type FilterKey = "product" | "status" | "defaultLevel" | "defaultComplexity";

const FILTER_DEFS: { key: FilterKey; label: string; domain: string[] }[] = [
  { key: "product", label: "Product", domain: PRODUCTS },
  { key: "status", label: "Status", domain: STATUSES },
  { key: "defaultLevel", label: "Default Level", domain: LEVELS },
  { key: "defaultComplexity", label: "Default Complexity", domain: COMPLEXITIES },
];

type ColumnKey =
  | "product"
  | "l1BusinessArea"
  | "l2ProcessGroup"
  | "processId"
  | "defaultLevel"
  | "defaultComplexity"
  | "defaultInstanceDriver"
  | "status";

const COLUMN_DEFS: { key: ColumnKey; label: string }[] = [
  { key: "product", label: "Product" },
  { key: "l1BusinessArea", label: "L1 Business Area" },
  { key: "l2ProcessGroup", label: "L2 Process Group" },
  { key: "processId", label: "Process ID" },
  { key: "defaultLevel", label: "Default Level" },
  { key: "defaultComplexity", label: "Default Complexity" },
  { key: "defaultInstanceDriver", label: "Default Instance Driver" },
  { key: "status", label: "Status" },
];

const GROUP_OPTIONS: { key: ColumnKey; label: string }[] = [
  { key: "product", label: "Product" },
  { key: "l1BusinessArea", label: "L1 Business Area" },
  { key: "l2ProcessGroup", label: "L2 Process Group" },
  { key: "status", label: "Status" },
];

function getFieldValue(row: GsiCatalogRow, key: ColumnKey): string {
  switch (key) {
    case "product":
      return row.product;
    case "l1BusinessArea":
      return row.l1BusinessArea;
    case "l2ProcessGroup":
      return row.l2ProcessGroup;
    case "processId":
      return row.processId;
    case "defaultLevel":
      return row.defaultLevel;
    case "defaultComplexity":
      return row.defaultComplexity;
    case "defaultInstanceDriver":
      return row.defaultInstanceDriver;
    case "status":
      return row.status;
  }
}

function ToolbarCountBadge({ count }: { count: number }) {
  return (
    <span className="ml-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold tabular-nums text-primary-foreground">
      {count}
    </span>
  );
}

function FieldHelp({ text }: { text: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="inline-flex text-muted-foreground hover:text-foreground"
        >
          <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full border border-current text-[10px] leading-none">
            ?
          </span>
          <span className="sr-only">Help</span>
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        {text}
      </TooltipContent>
    </Tooltip>
  );
}

interface FormState {
  product: string;
  l1BusinessArea: string;
  l2ProcessGroup: string;
  l3BusinessProcess: string;
  processId: string;
  description: string;
  defaultComplexity: string;
  defaultLevel: string;
  defaultInstanceDriver: string;
}

const emptyForm: FormState = {
  product: "",
  l1BusinessArea: "",
  l2ProcessGroup: "",
  l3BusinessProcess: "",
  processId: "",
  description: "",
  defaultComplexity: "",
  defaultLevel: "",
  defaultInstanceDriver: "",
};

function statusBadgeClass(status: GsiCatalogRow["status"]) {
  return status === "Active"
    ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400"
    : "border-gray-200 bg-gray-50 text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400";
}

export function GsiCatalogAdmin({
  initialRows,
  readOnly = false,
}: {
  initialRows: GsiCatalogRow[];
  readOnly?: boolean;
}) {
  const [rows, setRows] = useState(initialRows);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  const [filters, setFilters] = useState<Partial<Record<FilterKey, Set<string>>>>({});
  const [groupBy, setGroupBy] = useState<"none" | ColumnKey>("none");
  const [hiddenColumns, setHiddenColumns] = useState<Set<ColumnKey>>(new Set());
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    for (const def of FILTER_DEFS) {
      const selected = filters[def.key];
      if (selected && selected.size > 0 && selected.size < def.domain.length) count++;
    }
    return count;
  }, [filters]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      for (const def of FILTER_DEFS) {
        const selected = filters[def.key];
        if (selected && selected.size > 0 && selected.size < def.domain.length) {
          if (!selected.has(getFieldValue(r, def.key))) return false;
        }
      }
      if (
        q &&
        !r.l3BusinessProcess.toLowerCase().includes(q) &&
        !r.l1BusinessArea.toLowerCase().includes(q) &&
        !r.l2ProcessGroup.toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [rows, filters, search]);

  const visibleColumns = useMemo(
    () => COLUMN_DEFS.filter((c) => !hiddenColumns.has(c.key)),
    [hiddenColumns]
  );
  const hiddenCount = COLUMN_DEFS.length - visibleColumns.length;
  const colSpan = visibleColumns.length + 2; // + L3 Business Process + Actions

  const isGrouped = groupBy !== "none";

  const grouped = useMemo(() => {
    if (!isGrouped) return null;
    const map = new Map<string, GsiCatalogRow[]>();
    for (const row of filtered) {
      const key = getFieldValue(row, groupBy as ColumnKey) || "—";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(row);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [isGrouped, groupBy, filtered]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages - 1);
  const paged = useMemo(
    () => filtered.slice(currentPage * PAGE_SIZE, currentPage * PAGE_SIZE + PAGE_SIZE),
    [filtered, currentPage]
  );

  function toggleColumn(key: ColumnKey) {
    setHiddenColumns((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      if (next.size >= COLUMN_DEFS.length) return prev;
      return next;
    });
  }

  function toggleGroupCollapsed(key: string) {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function openAdd() {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEdit(row: GsiCatalogRow) {
    setEditingId(row.id);
    setForm({
      product: row.product,
      l1BusinessArea: row.l1BusinessArea,
      l2ProcessGroup: row.l2ProcessGroup,
      l3BusinessProcess: row.l3BusinessProcess,
      processId: row.processId === "—" ? "" : row.processId,
      description: row.description ?? "",
      defaultComplexity: row.defaultComplexity,
      defaultLevel: row.defaultLevel,
      defaultInstanceDriver: row.defaultInstanceDriver,
    });
    setDialogOpen(true);
  }

  function handleSubmit() {
    if (!form.product || !form.l3BusinessProcess.trim()) return;

    if (editingId) {
      setRows((prev) =>
        prev.map((r) =>
          r.id === editingId
            ? {
                ...r,
                product: form.product,
                l1BusinessArea: form.l1BusinessArea,
                l2ProcessGroup: form.l2ProcessGroup,
                l3BusinessProcess: form.l3BusinessProcess.trim(),
                processId: form.processId.trim() || "—",
                description: form.description.trim() || undefined,
                defaultComplexity:
                  (form.defaultComplexity as GsiCatalogRow["defaultComplexity"]) ||
                  r.defaultComplexity,
                defaultLevel:
                  (form.defaultLevel as GsiCatalogRow["defaultLevel"]) || r.defaultLevel,
                defaultInstanceDriver:
                  (form.defaultInstanceDriver as GsiInstanceDriver) ||
                  r.defaultInstanceDriver,
              }
            : r
        )
      );
    } else {
      const id = `custom-${Date.now()}`;
      const newRow: GsiCatalogRow = {
        id,
        product: form.product,
        l1BusinessArea: form.l1BusinessArea,
        l2ProcessGroup: form.l2ProcessGroup,
        l3BusinessProcess: form.l3BusinessProcess.trim(),
        processId: form.processId.trim() || "—",
        description: form.description.trim() || undefined,
        defaultComplexity:
          (form.defaultComplexity as GsiCatalogRow["defaultComplexity"]) || "L",
        defaultLevel: (form.defaultLevel as GsiCatalogRow["defaultLevel"]) || "L3",
        defaultInstanceDriver:
          (form.defaultInstanceDriver as GsiInstanceDriver) || "Fixed1",
        status: "Active",
      };
      setRows((prev) => [newRow, ...prev]);
    }
    setDialogOpen(false);
  }

  function toggleStatus(id: string) {
    setRows((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: r.status === "Active" ? "Inactive" : "Active" } : r
      )
    );
  }

  function renderCell(row: GsiCatalogRow, key: ColumnKey) {
    switch (key) {
      case "product":
        return <TableCell key={key} className="whitespace-nowrap">{row.product}</TableCell>;
      case "l1BusinessArea":
        return (
          <TableCell key={key} className="whitespace-nowrap">
            {row.l1BusinessArea}
          </TableCell>
        );
      case "l2ProcessGroup":
        return (
          <TableCell key={key} className="whitespace-nowrap">
            {row.l2ProcessGroup}
          </TableCell>
        );
      case "processId":
        return (
          <TableCell key={key} className="text-muted-foreground">
            {row.processId}
          </TableCell>
        );
      case "defaultLevel":
        return <TableCell key={key}>{row.defaultLevel}</TableCell>;
      case "defaultComplexity":
        return <TableCell key={key}>{row.defaultComplexity}</TableCell>;
      case "defaultInstanceDriver":
        return (
          <TableCell key={key} className="whitespace-nowrap">
            {row.defaultInstanceDriver}
          </TableCell>
        );
      case "status":
        return (
          <TableCell key={key}>
            <Badge
              variant="outline"
              className={cn("rounded-md px-2", statusBadgeClass(row.status))}
            >
              {row.status}
            </Badge>
          </TableCell>
        );
    }
  }

  function renderRow(row: GsiCatalogRow) {
    return (
      <TableRow key={row.id}>
        <TableCell className="whitespace-normal">{row.l3BusinessProcess}</TableCell>
        {visibleColumns.map((col) => renderCell(row, col.key))}
        {!readOnly && (
          <TableCell className="sticky right-0 z-10 border-l-2 border-border bg-background text-right shadow-[-4px_0_6px_-2px_rgb(0_0_0_/_0.08)]">
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="outline" onClick={() => toggleStatus(row.id)}>
                {row.status === "Active" ? "Deactivate" : "Activate"}
              </Button>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon-sm"
                    variant="outline"
                    onClick={() => openEdit(row)}
                    aria-label="Edit"
                  >
                    <PencilSimple className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">Edit</TooltipContent>
              </Tooltip>
            </div>
          </TableCell>
        )}
      </TableRow>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
      <div className="flex min-w-0 flex-1 flex-nowrap items-center gap-2 overflow-x-auto pb-1">
        <FunnelSimple className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        {FILTER_DEFS.map((def) => {
          const selected = filters[def.key] ?? new Set(def.domain);
          const isActive = selected.size > 0 && selected.size < def.domain.length;
          return (
            <Popover key={def.key}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "gap-1.5 rounded-full",
                    isActive &&
                      "border-primary/40 bg-primary/5 text-primary hover:bg-primary/10 dark:bg-primary/10"
                  )}
                >
                  {def.label}
                  {isActive && <ToolbarCountBadge count={selected.size} />}
                  <CaretDown className="h-3 w-3" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-56">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    {def.label}
                  </span>
                  {isActive && (
                    <button
                      type="button"
                      onClick={() =>
                        setFilters((prev) => {
                          const next = { ...prev };
                          delete next[def.key];
                          return next;
                        })
                      }
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      Reset
                    </button>
                  )}
                </div>
                <div className="mt-1 flex flex-col gap-1">
                  {def.domain.map((value) => (
                    <label
                      key={value}
                      className="flex items-center gap-2 text-sm text-foreground"
                    >
                      <Checkbox
                        checked={selected.has(value)}
                        onCheckedChange={(checked) => {
                          setFilters((prev) => {
                            const base = prev[def.key] ?? new Set(def.domain);
                            const next = new Set(base);
                            if (checked) next.add(value);
                            else next.delete(value);
                            return { ...prev, [def.key]: next };
                          });
                          setPage(0);
                        }}
                      />
                      {value}
                    </label>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          );
        })}

        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <Plus className="h-3.5 w-3.5" />
          Filter
        </button>

        <div className="mx-1 h-4 w-px bg-border" />

        <Select
          value={groupBy}
          onValueChange={(v) => {
            setGroupBy(v as "none" | ColumnKey);
            setCollapsedGroups(new Set());
          }}
        >
          <SelectTrigger
            size="sm"
            className={cn(
              isGrouped && "border-primary/40 bg-primary/5 text-primary dark:bg-primary/10"
            )}
          >
            <Stack className="h-3.5 w-3.5" />
            <SelectValue placeholder="Group by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No grouping</SelectItem>
            {GROUP_OPTIONS.map((opt) => (
              <SelectItem key={opt.key} value={opt.key}>
                Group by {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "gap-1.5",
                hiddenCount > 0 &&
                  "border-primary/40 bg-primary/5 text-primary hover:bg-primary/10 dark:bg-primary/10"
              )}
            >
              <ColumnsIcon className="h-3.5 w-3.5" />
              Columns
              {hiddenCount > 0 && <ToolbarCountBadge count={hiddenCount} />}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-56">
            <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Visible columns
            </span>
            <div className="flex flex-col gap-1.5">
              {COLUMN_DEFS.map((col) => (
                <label
                  key={col.key}
                  className="flex items-center gap-2 text-sm text-foreground"
                >
                  <Checkbox
                    checked={!hiddenColumns.has(col.key)}
                    onCheckedChange={() => toggleColumn(col.key)}
                  />
                  {col.label}
                </label>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={() => setFilters({})}
            className="shrink-0 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Reset
          </button>
        )}
      </div>

        <div className="relative w-56 shrink-0">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            placeholder="Search process / area"
            className="pl-8"
            autoComplete="off"
          />
        </div>
        {!readOnly && (
          <Button size="sm" className="gap-1.5 sm:shrink-0" onClick={openAdd}>
            <Plus className="h-4 w-4" />
            Add
          </Button>
        )}
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>L3 Business Process</TableHead>
              {visibleColumns.map((col) => (
                <TableHead key={col.key}>{col.label}</TableHead>
              ))}
              {!readOnly && (
                <TableHead className="sticky right-0 z-10 border-l-2 border-border bg-muted text-right shadow-[-4px_0_6px_-2px_rgb(0_0_0_/_0.08)]">
                  Actions
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {grouped
              ? grouped.flatMap(([groupKey, groupRows]) => {
                  const collapsed = collapsedGroups.has(groupKey);
                  return [
                    <TableRow key={`group-${groupKey}`} className="bg-muted/50 hover:bg-muted/50">
                      <TableCell colSpan={colSpan} className="py-2">
                        <button
                          type="button"
                          onClick={() => toggleGroupCollapsed(groupKey)}
                          className="flex items-center gap-1.5 font-medium text-foreground"
                        >
                          {collapsed ? (
                            <CaretRight className="h-3.5 w-3.5" />
                          ) : (
                            <CaretDown className="h-3.5 w-3.5" />
                          )}
                          {groupKey}
                          <span className="rounded-md bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
                            {groupRows.length}
                          </span>
                        </button>
                      </TableCell>
                    </TableRow>,
                    ...(collapsed ? [] : groupRows.map((row) => renderRow(row))),
                  ];
                })
              : paged.map((row) => renderRow(row))}
          </TableBody>
        </Table>
      </div>

      {grouped ? (
        <div className="text-sm text-muted-foreground">
          {filtered.length.toLocaleString()} rows across {grouped.length} group
          {grouped.length === 1 ? "" : "s"}
        </div>
      ) : (
        <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>
            Page {currentPage + 1} of {totalPages} · {filtered.length.toLocaleString()} rows
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages - 1}
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit" : "Add"} — GSI Catalog</DialogTitle>
          </DialogHeader>

          <div className="grid max-h-[60vh] grid-cols-1 gap-4 overflow-y-auto pr-1 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label className="flex items-center gap-1.5 text-sm">
                <span className="text-destructive">*</span> Product
                <FieldHelp text="SAP product family this GSI belongs to." />
              </Label>
              <Select
                value={form.product || undefined}
                onValueChange={(v) => setForm((f) => ({ ...f, product: v }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCTS.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="flex items-center gap-1.5 text-sm">
                L1 Business Area
                <FieldHelp text="Top-level business area, e.g. Buy & Receive." />
              </Label>
              <Input
                value={form.l1BusinessArea}
                onChange={(e) => setForm((f) => ({ ...f, l1BusinessArea: e.target.value }))}
                autoComplete="off"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="flex items-center gap-1.5 text-sm">
                L2 Process Group
                <FieldHelp text="Mid-level process grouping under the business area." />
              </Label>
              <Input
                value={form.l2ProcessGroup}
                onChange={(e) => setForm((f) => ({ ...f, l2ProcessGroup: e.target.value }))}
                autoComplete="off"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="flex items-center gap-1.5 text-sm">
                <span className="text-destructive">*</span> L3 Business Process (GSI name)
                <FieldHelp text="The specific Global Scope Item name shown in Scope Selection." />
              </Label>
              <Input
                value={form.l3BusinessProcess}
                onChange={(e) =>
                  setForm((f) => ({ ...f, l3BusinessProcess: e.target.value }))
                }
                autoComplete="off"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="flex items-center gap-1.5 text-sm">
                Process ID
                <FieldHelp text="Optional external process reference ID." />
              </Label>
              <Input
                value={form.processId}
                onChange={(e) => setForm((f) => ({ ...f, processId: e.target.value }))}
                autoComplete="off"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="flex items-center gap-1.5 text-sm">
                Default Complexity
                <FieldHelp text="Suggested Low/Medium/High complexity; overridable per project in Scope Selection." />
              </Label>
              <Select
                value={form.defaultComplexity || undefined}
                onValueChange={(v) => setForm((f) => ({ ...f, defaultComplexity: v }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {COMPLEXITIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="flex items-center gap-1.5 text-sm">
                Default Level
                <FieldHelp text="Suggested scope-detail level (L3/L4/L5)." />
              </Label>
              <Select
                value={form.defaultLevel || undefined}
                onValueChange={(v) => setForm((f) => ({ ...f, defaultLevel: v }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {LEVELS.map((l) => (
                    <SelectItem key={l} value={l}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="flex items-center gap-1.5 text-sm">
                Default Instance Driver
                <FieldHelp text="How this GSI repeats across the project, e.g. once per Legal Entity." />
              </Label>
              <Select
                value={form.defaultInstanceDriver || undefined}
                onValueChange={(v) => setForm((f) => ({ ...f, defaultInstanceDriver: v }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {INSTANCE_DRIVERS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label className="flex items-center gap-1.5 text-sm">
                Description
                <FieldHelp text="Optional notes shown to estimators in Scope Selection." />
              </Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={!form.product || !form.l3BusinessProcess.trim()}
            >
              {editingId ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
