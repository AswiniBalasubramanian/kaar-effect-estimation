"use client";

import { useMemo, useState } from "react";
import { MagnifyingGlass as Search, PencilSimple, Plus } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
}: {
  initialRows: GsiCatalogRow[];
}) {
  const [rows, setRows] = useState(initialRows);
  const [productFilter, setProductFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (productFilter !== "all" && r.product !== productFilter) return false;
      if (
        q &&
        !r.l3BusinessProcess.toLowerCase().includes(q) &&
        !r.l1BusinessArea.toLowerCase().includes(q) &&
        !r.l2ProcessGroup.toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [rows, productFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages - 1);
  const paged = useMemo(
    () => filtered.slice(currentPage * PAGE_SIZE, currentPage * PAGE_SIZE + PAGE_SIZE),
    [filtered, currentPage]
  );

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

  return (
    <div className="flex flex-col gap-4">

      <div className="flex flex-col gap-2 sm:flex-row">
        <Select
          value={productFilter}
          onValueChange={(v) => {
            setProductFilter(v);
            setPage(0);
          }}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All products</SelectItem>
            {PRODUCTS.map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="relative flex-1">
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
        <Button size="sm" className="gap-1.5 sm:shrink-0" onClick={openAdd}>
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>L1 Business Area</TableHead>
              <TableHead>L2 Process Group</TableHead>
              <TableHead>L3 Business Process</TableHead>
              <TableHead>Process ID</TableHead>
              <TableHead>Default Level</TableHead>
              <TableHead>Default Complexity</TableHead>
              <TableHead>Default Instance Driver</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="sticky right-0 z-10 border-l-2 border-border bg-muted text-right shadow-[-4px_0_6px_-2px_rgb(0_0_0_/_0.08)]">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paged.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="whitespace-nowrap">{row.product}</TableCell>
                <TableCell className="whitespace-nowrap">{row.l1BusinessArea}</TableCell>
                <TableCell className="whitespace-nowrap">{row.l2ProcessGroup}</TableCell>
                <TableCell className="whitespace-normal">{row.l3BusinessProcess}</TableCell>
                <TableCell className="text-muted-foreground">{row.processId}</TableCell>
                <TableCell>{row.defaultLevel}</TableCell>
                <TableCell>{row.defaultComplexity}</TableCell>
                <TableCell className="whitespace-nowrap">
                  {row.defaultInstanceDriver}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn("rounded-md px-2", statusBadgeClass(row.status))}
                  >
                    {row.status}
                  </Badge>
                </TableCell>
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

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
