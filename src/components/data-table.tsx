"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  CaretDown,
  CaretRight,
  Columns as ColumnsIcon,
  FunnelSimple,
  Rows as RowsIcon,
} from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
  /** Raw string value for this cell — required to enable grouping/filtering. */
  getValue?: (row: T) => string;
  /** Offer this column in the "Group by" control. */
  groupable?: boolean;
  /** Offer this column in the "Filters" popover. */
  filterable?: boolean;
}

function ToolbarCountBadge({ count }: { count: number }) {
  return (
    <span className="ml-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold tabular-nums text-primary-foreground">
      {count}
    </span>
  );
}

export function DataTable<T extends { id: string }>({
  columns,
  rows,
  pageSize = 25,
}: {
  columns: DataTableColumn<T>[];
  rows: T[];
  pageSize?: number;
}) {
  const [page, setPage] = useState(0);
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set());
  const [groupBy, setGroupBy] = useState("none");
  const [filters, setFilters] = useState<Record<string, Set<string>>>({});
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  const groupableColumns = useMemo(
    () => columns.filter((c) => c.groupable && c.getValue),
    [columns]
  );
  const filterableColumns = useMemo(
    () => columns.filter((c) => c.filterable && c.getValue),
    [columns]
  );

  const filterDomains = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const col of filterableColumns) {
      map.set(col.key, Array.from(new Set(rows.map((r) => col.getValue!(r)))).sort());
    }
    return map;
  }, [filterableColumns, rows]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    for (const col of filterableColumns) {
      const selected = filters[col.key];
      const domain = filterDomains.get(col.key) ?? [];
      if (selected && selected.size > 0 && selected.size < domain.length) count++;
    }
    return count;
  }, [filters, filterableColumns, filterDomains]);

  const visibleColumns = useMemo(
    () => columns.filter((c) => !hiddenColumns.has(c.key)),
    [columns, hiddenColumns]
  );
  const hiddenCount = columns.length - visibleColumns.length;

  const filteredRows = useMemo(() => {
    if (activeFilterCount === 0) return rows;
    return rows.filter((row) =>
      filterableColumns.every((col) => {
        const selected = filters[col.key];
        const domain = filterDomains.get(col.key) ?? [];
        if (!selected || selected.size === 0 || selected.size === domain.length) return true;
        return selected.has(col.getValue!(row));
      })
    );
  }, [rows, filterableColumns, filters, filterDomains, activeFilterCount]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const currentPage = Math.min(page, totalPages - 1);
  const paged = useMemo(
    () => filteredRows.slice(currentPage * pageSize, currentPage * pageSize + pageSize),
    [filteredRows, currentPage, pageSize]
  );

  const groupColumn = groupableColumns.find((c) => c.key === groupBy) ?? null;
  const isGrouped = groupColumn !== null;

  const grouped = useMemo(() => {
    if (!groupColumn) return null;
    const map = new Map<string, T[]>();
    for (const row of filteredRows) {
      const key = groupColumn.getValue!(row) || "—";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(row);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [groupColumn, filteredRows]);

  function toggleColumn(key: string) {
    setHiddenColumns((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      if (next.size >= columns.length) return prev;
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

  const showToolbar = filterableColumns.length > 0 || groupableColumns.length > 0 || columns.length > 1;

  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
        No rows to display.
      </div>
    );
  }

  return (
    <div>
      {showToolbar && (
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {filterableColumns.length > 0 && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "gap-1.5",
                    activeFilterCount > 0 &&
                      "border-primary/40 bg-primary/5 text-primary hover:bg-primary/10 dark:bg-primary/10"
                  )}
                >
                  <FunnelSimple className="h-3.5 w-3.5" />
                  Filters
                  {activeFilterCount > 0 && <ToolbarCountBadge count={activeFilterCount} />}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-64">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    Filters
                  </span>
                  {activeFilterCount > 0 && (
                    <button
                      type="button"
                      onClick={() => setFilters({})}
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      Reset
                    </button>
                  )}
                </div>
                <div className="flex max-h-72 flex-col gap-3 overflow-y-auto pr-1">
                  {filterableColumns.map((col) => {
                    const domain = filterDomains.get(col.key) ?? [];
                    const selected = filters[col.key] ?? new Set(domain);
                    return (
                      <div key={col.key} className="flex flex-col gap-1.5">
                        <span className="text-xs font-medium text-foreground">
                          {col.header}
                        </span>
                        <div className="flex flex-col gap-1">
                          {domain.map((value) => (
                            <label
                              key={value}
                              className="flex items-center gap-2 text-sm text-foreground"
                            >
                              <Checkbox
                                checked={selected.has(value)}
                                onCheckedChange={(checked) => {
                                  setFilters((prev) => {
                                    const base = prev[col.key] ?? new Set(domain);
                                    const next = new Set(base);
                                    if (checked) next.add(value);
                                    else next.delete(value);
                                    return { ...prev, [col.key]: next };
                                  });
                                }}
                              />
                              {value}
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </PopoverContent>
            </Popover>
          )}

          {groupableColumns.length > 0 && (
            <Select
              value={groupBy}
              onValueChange={(v) => {
                setGroupBy(v);
                setCollapsedGroups(new Set());
              }}
            >
              <SelectTrigger
                size="sm"
                className={cn(
                  isGrouped &&
                    "border-primary/40 bg-primary/5 text-primary dark:bg-primary/10"
                )}
              >
                <RowsIcon className="h-3.5 w-3.5" />
                <SelectValue placeholder="Group by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No grouping</SelectItem>
                {groupableColumns.map((col) => (
                  <SelectItem key={col.key} value={col.key}>
                    Group by {col.header}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {columns.length > 1 && (
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
                  {columns.map((col) => (
                    <label
                      key={col.key}
                      className="flex items-center gap-2 text-sm text-foreground"
                    >
                      <Checkbox
                        checked={!hiddenColumns.has(col.key)}
                        onCheckedChange={() => toggleColumn(col.key)}
                      />
                      {col.header}
                    </label>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              {visibleColumns.map((col) => (
                <TableHead key={col.key} className={col.className}>
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {grouped
              ? grouped.flatMap(([groupKey, groupRows]) => {
                  const collapsed = collapsedGroups.has(groupKey);
                  const rowsForGroup = collapsed
                    ? []
                    : groupRows.map((row) => (
                        <TableRow key={row.id}>
                          {visibleColumns.map((col) => (
                            <TableCell key={col.key} className={col.className}>
                              {col.render(row)}
                            </TableCell>
                          ))}
                        </TableRow>
                      ));
                  return [
                    <TableRow key={`group-${groupKey}`} className="bg-muted/50 hover:bg-muted/50">
                      <TableCell colSpan={visibleColumns.length} className="py-2">
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
                    ...rowsForGroup,
                  ];
                })
              : paged.map((row) => (
                  <TableRow key={row.id}>
                    {visibleColumns.map((col) => (
                      <TableCell key={col.key} className={col.className}>
                        {col.render(row)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>

      {grouped ? (
        <div className="pt-3 text-sm text-muted-foreground">
          {filteredRows.length.toLocaleString()} rows across {grouped.length} group
          {grouped.length === 1 ? "" : "s"}
        </div>
      ) : (
        totalPages > 1 && (
          <div className="flex flex-col gap-2 pt-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <span>
              Page {currentPage + 1} of {totalPages} · {filteredRows.length.toLocaleString()} rows
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
        )
      )}
    </div>
  );
}
