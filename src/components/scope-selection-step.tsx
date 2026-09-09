"use client";

import {
  Fragment,
  useEffect,
  useId,
  useMemo,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
} from "react";
import {
  ArrowsDownUp,
  CaretDown,
  CaretRight,
  FunnelSimple,
  MagnifyingGlass,
  Plus,
  ShoppingCartSimple,
  Sliders,
  Stack,
  X,
} from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  gsiCatalog,
  gsiLevels,
  instanceDrivers,
  sapProducts,
  type GsiCatalogItem,
  type GsiComplexity,
  type GsiLevel,
  type InstanceDriver,
  type SapProduct,
} from "@/lib/gsi-catalog";

function complexityBadgeClass(level: GsiComplexity) {
  if (level === "H")
    return "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-400";
  if (level === "M")
    return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-400";
  return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400";
}

interface SelectionOverrides {
  complexity: GsiComplexity;
  level: GsiLevel;
  driver: InstanceDriver;
  instances?: number;
}

let customGsiCounter = 0;

export function ScopeSelectionStep({
  onInScopeChange,
  onSelectedItemsChange,
  selectedProducts,
}: {
  onInScopeChange?: (count: number) => void;
  onSelectedItemsChange?: (items: GsiCatalogItem[]) => void;
  selectedProducts?: string[];
}) {
  const nameId = useId();

  const [customItems, setCustomItems] = useState<GsiCatalogItem[]>([]);
  const [selected, setSelected] = useState<Record<string, SelectionOverrides>>({});
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const visibleProducts = useMemo(
    () =>
      selectedProducts && selectedProducts.length > 0
        ? sapProducts.filter((p) => selectedProducts.includes(p))
        : sapProducts,
    [selectedProducts]
  );

  const [activeProduct, setActiveProduct] = useState<SapProduct>("S4H_OnPrem");
  const [cartCollapsed, setCartCollapsed] = useState(true);

  if (!visibleProducts.includes(activeProduct) && visibleProducts.length > 0) {
    setActiveProduct(visibleProducts[0]);
  }
  const [businessAreaFilter, setBusinessAreaFilter] = useState("all");
  const [processGroupFilter, setProcessGroupFilter] = useState("all");
  const [visibleColumns, setVisibleColumns] = useState({
    id: true,
    name: true,
    cplx: true,
    level: true,
    driver: true,
    instances: true,
  });
  const [sortColumn, setSortColumn] = useState<"id" | "name" | "cplx" | "level" | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  function toggleSort(column: "id" | "name" | "cplx" | "level") {
    if (sortColumn === column) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  }
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<GsiCatalogItem | null>(null);
  const [editingInstancesId, setEditingInstancesId] = useState<string | null>(null);
  const [cartWidth, setCartWidth] = useState(760);

  function startCartResize(e: ReactMouseEvent) {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = cartWidth;
    function onMove(moveEvent: MouseEvent) {
      const next = startWidth - (moveEvent.clientX - startX);
      setCartWidth(Math.min(Math.max(next, 420), 960));
    }
    function onUp() {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    }
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  }

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customModule, setCustomModule] = useState("");
  const [customComplexity, setCustomComplexity] = useState<GsiComplexity>("M");
  const [customLevel, setCustomLevel] = useState<GsiLevel>("L3");
  const [customInstanceDriver, setCustomInstanceDriver] = useState<InstanceDriver>("Fixed1");
  const [customInstances, setCustomInstances] = useState("");
  const [customStdHrs, setCustomStdHrs] = useState("");

  const allItems = useMemo(() => [...gsiCatalog, ...customItems], [customItems]);

  const businessAreas = useMemo(
    () =>
      Array.from(
        new Set(gsiCatalog.filter((i) => i.product === activeProduct).map((i) => i.businessArea))
      ),
    [activeProduct]
  );
  const processGroups = useMemo(
    () =>
      Array.from(
        new Set(
          gsiCatalog
            .filter(
              (i) =>
                i.product === activeProduct &&
                (businessAreaFilter === "all" || i.businessArea === businessAreaFilter)
            )
            .map((i) => i.processGroup)
        )
      ),
    [activeProduct, businessAreaFilter]
  );

  const filteredCatalog = useMemo(() => {
    const q = search.trim().toLowerCase();
    return gsiCatalog.filter((item) => {
      if (item.product !== activeProduct) return false;
      if (businessAreaFilter !== "all" && item.businessArea !== businessAreaFilter) return false;
      if (processGroupFilter !== "all" && item.processGroup !== processGroupFilter) return false;
      if (q && !item.title.toLowerCase().includes(q) && !item.id.toLowerCase().includes(q))
        return false;
      return true;
    });
  }, [activeProduct, businessAreaFilter, processGroupFilter, search]);

  const sortedFilteredCatalog = useMemo(() => {
    function columnValue(item: GsiCatalogItem) {
      switch (sortColumn) {
        case "name":
          return item.title;
        case "cplx":
          return item.defaultComplexity;
        case "level":
          return item.defaultLevel;
        default:
          return item.id;
      }
    }
    return [...filteredCatalog].sort((a, b) => {
      if (a.businessArea !== b.businessArea) return a.businessArea.localeCompare(b.businessArea);
      if (a.processGroup !== b.processGroup) return a.processGroup.localeCompare(b.processGroup);
      const cmp = columnValue(a).localeCompare(columnValue(b));
      return sortDirection === "asc" ? cmp : -cmp;
    });
  }, [filteredCatalog, sortColumn, sortDirection]);

  const groupedCatalog = useMemo(() => {
    const areas = new Map<string, Map<string, GsiCatalogItem[]>>();
    for (const item of sortedFilteredCatalog) {
      if (!areas.has(item.businessArea)) areas.set(item.businessArea, new Map());
      const groups = areas.get(item.businessArea)!;
      if (!groups.has(item.processGroup)) groups.set(item.processGroup, []);
      groups.get(item.processGroup)!.push(item);
    }
    return areas;
  }, [sortedFilteredCatalog]);

  const selectedItems = useMemo(
    () => allItems.filter((item) => selected[item.id] !== undefined),
    [allItems, selected]
  );

  const selectedByProductThenArea = useMemo(() => {
    const products = new Map<string, Map<string, GsiCatalogItem[]>>();
    for (const item of selectedItems) {
      if (!products.has(item.product)) products.set(item.product, new Map());
      const areas = products.get(item.product)!;
      if (!areas.has(item.businessArea)) areas.set(item.businessArea, []);
      areas.get(item.businessArea)!.push(item);
    }
    return products;
  }, [selectedItems]);

  const visibleColumnCount = 1 + Object.values(visibleColumns).filter(Boolean).length;

  const inScope = selectedItems.length;

  useEffect(() => {
    onInScopeChange?.(inScope);
  }, [inScope, onInScopeChange]);

  useEffect(() => {
    onSelectedItemsChange?.(selectedItems);
  }, [selectedItems, onSelectedItemsChange]);

  function defaultOverrides(item: GsiCatalogItem): SelectionOverrides {
    return {
      complexity: item.defaultComplexity,
      level: item.defaultLevel,
      driver: item.defaultInstanceDriver,
      instances: item.instances,
    };
  }

  function toggleItem(item: GsiCatalogItem) {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[item.id] !== undefined) {
        delete next[item.id];
      } else {
        next[item.id] = defaultOverrides(item);
      }
      return next;
    });
  }

  function updateSelection(item: GsiCatalogItem, patch: Partial<SelectionOverrides>) {
    setSelected((prev) => ({
      ...prev,
      [item.id]: { ...(prev[item.id] ?? defaultOverrides(item)), ...patch },
    }));
  }

  function removeItem(id: string) {
    setSelected((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  function toggleAllFiltered() {
    const allSelected = sortedFilteredCatalog.every((i) => selected[i.id] !== undefined);
    setSelected((prev) => {
      const next = { ...prev };
      for (const item of sortedFilteredCatalog) {
        if (allSelected) delete next[item.id];
        else next[item.id] = defaultOverrides(item);
      }
      return next;
    });
  }

  function toggleGroup(key: string) {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function toggleItems(items: GsiCatalogItem[]) {
    const allSelected = items.every((i) => selected[i.id] !== undefined);
    setSelected((prev) => {
      const next = { ...prev };
      for (const item of items) {
        if (allSelected) delete next[item.id];
        else next[item.id] = defaultOverrides(item);
      }
      return next;
    });
  }

  function toggleExpandAll() {
    const allKeys: string[] = [];
    for (const [area, groups] of groupedCatalog.entries()) {
      allKeys.push(`area:${area}`);
      for (const group of groups.keys()) {
        allKeys.push(`group:${area}:${group}`);
      }
    }
    const allCollapsed = allKeys.length > 0 && allKeys.every((key) => expandedGroups.has(key));
    setExpandedGroups(allCollapsed ? new Set() : new Set(allKeys));
  }

  function resetCustomGsiForm() {
    setCustomName("");
    setCustomModule("");
    setCustomComplexity("M");
    setCustomLevel("L3");
    setCustomInstanceDriver("Fixed1");
    setCustomInstances("");
    setCustomStdHrs("");
  }

  function addCustomGsi() {
    if (!customName.trim()) return;
    customGsiCounter += 1;
    const id = `CUSTOM-${customGsiCounter}`;
    const item: GsiCatalogItem = {
      id,
      title: customName.trim(),
      product: activeProduct,
      businessArea: "Custom",
      processGroup: customModule.trim() || "Custom",
      defaultComplexity: customComplexity,
      defaultLevel: customLevel,
      defaultInstanceDriver: customInstanceDriver,
      module: customModule.trim() || undefined,
      instances: customInstances ? Number(customInstances) : undefined,
      stdHrs: customStdHrs ? Number(customStdHrs) : undefined,
    };
    setCustomItems((prev) => [...prev, item]);
    setSelected((prev) => ({ ...prev, [id]: defaultOverrides(item) }));
    resetCustomGsiForm();
    setAddDialogOpen(false);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="bg-gradient-to-r from-primary to-neutral-900 bg-clip-text text-base font-semibold text-transparent dark:to-neutral-100">Scope Selection</h2>
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-xs font-medium text-muted-foreground">
              {inScope}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Browse by product and business area, then add individual scope items or a visible
            set.
          </p>

          {visibleProducts.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2 border-b border-border pb-3">
              <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
                {visibleProducts.map((product) => (
                  <button
                    key={product}
                    type="button"
                    onClick={() => setActiveProduct(product)}
                    className={cn(
                      "rounded-md px-3 py-1 text-sm font-medium transition-colors",
                      product === activeProduct
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {product}
                  </button>
                ))}
              </div>

              <div className="ml-auto flex items-center gap-1">
                <button
                  type="button"
                  aria-label="Filter"
                  className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <FunnelSimple className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="Sort"
                  className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <ArrowsDownUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="Group"
                  className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <Stack className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="Search"
                  onClick={() => setSearchOpen((v) => !v)}
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground",
                    searchOpen && "bg-muted text-foreground"
                  )}
                >
                  <MagnifyingGlass className="h-4 w-4" />
                </button>
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      aria-label="Customize columns"
                      className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <Sliders className="h-4 w-4" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-48">
                    <p className="px-1 text-xs font-medium text-muted-foreground">
                      Visible columns
                    </p>
                    {(
                      [
                        ["id", "ID"],
                        ["name", "Name"],
                        ["cplx", "Cplx"],
                        ["level", "Level"],
                        ["driver", "Driver"],
                        ["instances", "#Inst"],
                      ] as const
                    ).map(([key, label]) => (
                      <label
                        key={key}
                        className="flex items-center gap-2 rounded-md px-1 py-1.5 text-sm text-foreground hover:bg-muted"
                      >
                        <Checkbox
                          checked={visibleColumns[key]}
                          onCheckedChange={(checked) =>
                            setVisibleColumns((prev) => ({ ...prev, [key]: checked === true }))
                          }
                        />
                        {label}
                      </label>
                    ))}
                  </PopoverContent>
                </Popover>
                {searchOpen && (
                  <div className="relative">
                    <MagnifyingGlass className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      autoFocus
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search process, scope item ID, module, group, or keyword"
                      className={cn("h-8 w-64 rounded-full pl-9", search && "pr-8")}
                      autoComplete="off"
                    />
                    {search && (
                      <button
                        type="button"
                        onClick={() => setSearch("")}
                        aria-label="Clear search"
                        className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                )}
                <Button
                  type="button"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => setAddDialogOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                  Add Custom GSI
                </Button>
              </div>
            </div>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Select
              value={businessAreaFilter}
              onValueChange={(v) => {
                setBusinessAreaFilter(v);
                setProcessGroupFilter("all");
              }}
            >
              <SelectTrigger className="h-8 w-auto rounded-full border-input bg-transparent px-3 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Business Areas (L1)</SelectItem>
                {businessAreas.map((area) => (
                  <SelectItem key={area} value={area}>
                    {area}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={processGroupFilter} onValueChange={setProcessGroupFilter}>
              <SelectTrigger className="h-8 w-auto rounded-full border-input bg-transparent px-3 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Process Groups (L2)</SelectItem>
                {processGroups.map((group) => (
                  <SelectItem key={group} value={group}>
                    {group}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {cartCollapsed && (
              <button
                type="button"
                onClick={() => setCartCollapsed(false)}
                aria-label={`Expand selected scope cart (${inScope} selected)`}
                className="ml-auto flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-sm text-foreground shadow-sm transition-colors hover:bg-muted/50"
              >
                <span className="relative">
                  <ShoppingCartSimple className="h-4 w-4" />
                  {inScope > 0 && (
                    <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                      {inScope}
                    </span>
                  )}
                </span>
                Selected Scope Cart ({inScope})
              </button>
            )}
          </div>

          <div className="mt-4 max-h-96 overflow-y-auto">
            {groupedCatalog.size === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                No scope items match this filter.
              </p>
            ) : (
              <Table containerClassName="overflow-x-visible">
                <TableHeader className="sticky top-0 z-10 bg-white dark:bg-gray-900">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-16">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={toggleExpandAll}
                          aria-label="Expand or collapse all groups"
                          className="flex items-center text-muted-foreground hover:text-foreground"
                        >
                          {Array.from(groupedCatalog.entries()).every(([area, groups]) =>
                            [`area:${area}`, ...Array.from(groups.keys()).map((g) => `group:${area}:${g}`)].every(
                              (key) => expandedGroups.has(key)
                            )
                          ) ? (
                            <CaretRight className="h-3.5 w-3.5" />
                          ) : (
                            <CaretDown className="h-3.5 w-3.5" />
                          )}
                        </button>
                        <Checkbox
                          checked={sortedFilteredCatalog.every((i) => selected[i.id] !== undefined)}
                          onCheckedChange={() => toggleAllFiltered()}
                          aria-label="Select all filtered GSIs"
                        />
                      </div>
                    </TableHead>
                    {visibleColumns.id && (
                      <TableHead className="group text-muted-foreground">
                        <button
                          type="button"
                          onClick={() => toggleSort("id")}
                          className="flex items-center gap-1 hover:text-foreground"
                        >
                          ID
                          <ArrowsDownUp
                            className={cn(
                              "h-3 w-3 opacity-0 group-hover:opacity-100",
                              sortColumn === "id" && "opacity-100"
                            )}
                          />
                        </button>
                      </TableHead>
                    )}
                    {visibleColumns.name && (
                      <TableHead className="group text-muted-foreground">
                        <button
                          type="button"
                          onClick={() => toggleSort("name")}
                          className="flex items-center gap-1 hover:text-foreground"
                        >
                          Name
                          <ArrowsDownUp
                            className={cn(
                              "h-3 w-3 opacity-0 group-hover:opacity-100",
                              sortColumn === "name" && "opacity-100"
                            )}
                          />
                        </button>
                      </TableHead>
                    )}
                    {visibleColumns.cplx && (
                      <TableHead className="group text-muted-foreground">
                        <button
                          type="button"
                          onClick={() => toggleSort("cplx")}
                          className="flex items-center gap-1 hover:text-foreground"
                        >
                          Cplx
                          <ArrowsDownUp
                            className={cn(
                              "h-3 w-3 opacity-0 group-hover:opacity-100",
                              sortColumn === "cplx" && "opacity-100"
                            )}
                          />
                        </button>
                      </TableHead>
                    )}
                    {visibleColumns.level && (
                      <TableHead className="group text-muted-foreground">
                        <button
                          type="button"
                          onClick={() => toggleSort("level")}
                          className="flex items-center gap-1 hover:text-foreground"
                        >
                          Level
                          <ArrowsDownUp
                            className={cn(
                              "h-3 w-3 opacity-0 group-hover:opacity-100",
                              sortColumn === "level" && "opacity-100"
                            )}
                          />
                        </button>
                      </TableHead>
                    )}
                    {visibleColumns.driver && (
                      <TableHead className="text-muted-foreground">Driver</TableHead>
                    )}
                    {visibleColumns.instances && (
                      <TableHead className="text-muted-foreground">#Inst</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from(groupedCatalog.entries()).map(([area, groups]) => {
                    const areaItems = Array.from(groups.values()).flat();
                    const areaSelectedCount = areaItems.filter(
                      (i) => selected[i.id] !== undefined
                    ).length;
                    const areaKey = `area:${area}`;
                    const areaExpanded = !expandedGroups.has(areaKey);
                    return (
                      <Fragment key={area}>
                        <TableRow className="bg-muted/50 hover:bg-muted/50">
                          <TableCell colSpan={visibleColumnCount} className="py-2">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => toggleGroup(areaKey)}
                                className="flex items-center"
                                aria-label={areaExpanded ? `Collapse ${area}` : `Expand ${area}`}
                              >
                                {areaExpanded ? (
                                  <CaretDown className="h-3.5 w-3.5 text-muted-foreground" />
                                ) : (
                                  <CaretRight className="h-3.5 w-3.5 text-muted-foreground" />
                                )}
                              </button>
                              <Checkbox
                                checked={areaSelectedCount === areaItems.length}
                                onCheckedChange={() => toggleItems(areaItems)}
                                aria-label={`Select all in ${area}`}
                              />
                              <span
                                className="cursor-pointer text-sm font-medium text-foreground"
                                onClick={() => toggleGroup(areaKey)}
                              >
                                {area}
                              </span>
                              <span className="ml-auto text-xs text-muted-foreground">
                                {areaItems.length} GSIs | {areaSelectedCount} selected
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>

                        {areaExpanded &&
                          Array.from(groups.entries()).map(([group, items]) => {
                            const groupSelectedCount = items.filter(
                              (i) => selected[i.id] !== undefined
                            ).length;
                            const groupKey = `group:${area}:${group}`;
                            const groupExpanded = !expandedGroups.has(groupKey);
                            return (
                              <Fragment key={group}>
                                <TableRow className="hover:bg-transparent">
                                  <TableCell colSpan={visibleColumnCount} className="py-2 pl-8">
                                    <div className="flex items-center gap-2">
                                      <button
                                        type="button"
                                        onClick={() => toggleGroup(groupKey)}
                                        className="flex items-center"
                                        aria-label={
                                          groupExpanded ? `Collapse ${group}` : `Expand ${group}`
                                        }
                                      >
                                        {groupExpanded ? (
                                          <CaretDown className="h-3.5 w-3.5 text-muted-foreground" />
                                        ) : (
                                          <CaretRight className="h-3.5 w-3.5 text-muted-foreground" />
                                        )}
                                      </button>
                                      <Checkbox
                                        checked={groupSelectedCount === items.length}
                                        onCheckedChange={() => toggleItems(items)}
                                        aria-label={`Select all in ${group}`}
                                      />
                                      <span
                                        className="cursor-pointer text-sm text-foreground"
                                        onClick={() => toggleGroup(groupKey)}
                                      >
                                        {group}
                                      </span>
                                      <span className="ml-auto text-xs text-muted-foreground">
                                        {items.length} GSIs | {groupSelectedCount} selected
                                      </span>
                                    </div>
                                  </TableCell>
                                </TableRow>

                                {groupExpanded &&
                                  items.map((item) => (
                                    <TableRow
                                      key={item.id}
                                      className="group cursor-pointer divide-x divide-border data-[state=selected]:bg-orange-50/50! data-[state=selected]:hover:bg-orange-50/50! dark:data-[state=selected]:bg-orange-950/15! dark:data-[state=selected]:hover:bg-orange-950/15!"
                                      onClick={() => toggleItem(item)}
                                      data-state={
                                        selected[item.id] !== undefined ? "selected" : undefined
                                      }
                                    >
                                      <TableCell
                                        className="pl-16"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <Checkbox
                                          checked={selected[item.id] !== undefined}
                                          onCheckedChange={() => toggleItem(item)}
                                        />
                                      </TableCell>
                                      {visibleColumns.id && (
                                        <TableCell className="border-l-0">
                                          <span className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
                                            {item.id}
                                          </span>
                                        </TableCell>
                                      )}
                                      {visibleColumns.name && (
                                        <TableCell className="max-w-[220px] truncate text-sm text-foreground">
                                          <div className="flex items-center justify-between gap-2">
                                            <span className="truncate">{item.title}</span>
                                            <button
                                              type="button"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setDetailItem(item);
                                              }}
                                              className="shrink-0 rounded-md border border-border px-2 py-0.5 text-[11px] font-medium text-muted-foreground opacity-0 hover:bg-muted hover:text-foreground group-hover:opacity-100"
                                            >
                                              Details
                                            </button>
                                          </div>
                                        </TableCell>
                                      )}
                                      {visibleColumns.cplx && (
                                        <TableCell onClick={(e) => e.stopPropagation()}>
                                          <Select
                                            value={
                                              selected[item.id]?.complexity ??
                                              item.defaultComplexity
                                            }
                                            onValueChange={(v) =>
                                              updateSelection(item, {
                                                complexity: v as GsiComplexity,
                                              })
                                            }
                                          >
                                            <SelectTrigger
                                              className={cn(
                                                "h-6 w-auto gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-medium [&_svg]:size-3",
                                                complexityBadgeClass(
                                                  selected[item.id]?.complexity ??
                                                    item.defaultComplexity
                                                )
                                              )}
                                            >
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="L">L</SelectItem>
                                              <SelectItem value="M">M</SelectItem>
                                              <SelectItem value="H">H</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </TableCell>
                                      )}
                                      {visibleColumns.level && (
                                        <TableCell onClick={(e) => e.stopPropagation()}>
                                          <Select
                                            value={selected[item.id]?.level ?? item.defaultLevel}
                                            onValueChange={(v) =>
                                              updateSelection(item, { level: v as GsiLevel })
                                            }
                                          >
                                            <SelectTrigger className="h-6 w-auto gap-1 rounded-md border border-transparent bg-transparent px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground hover:bg-muted data-[state=open]:border-border data-[state=open]:bg-card [&_svg]:size-3">
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              {gsiLevels.map((level) => (
                                                <SelectItem key={level} value={level}>
                                                  {level}
                                                </SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                        </TableCell>
                                      )}
                                      {visibleColumns.driver && (
                                        <TableCell onClick={(e) => e.stopPropagation()}>
                                          <Select
                                            value={
                                              selected[item.id]?.driver ??
                                              item.defaultInstanceDriver
                                            }
                                            onValueChange={(v) =>
                                              updateSelection(item, {
                                                driver: v as InstanceDriver,
                                              })
                                            }
                                          >
                                            <SelectTrigger className="h-6 w-auto gap-1 rounded-md border border-transparent bg-transparent px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground hover:bg-muted data-[state=open]:border-border data-[state=open]:bg-card [&_svg]:size-3">
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              {instanceDrivers.map((driver) => (
                                                <SelectItem key={driver} value={driver}>
                                                  {driver}
                                                </SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                        </TableCell>
                                      )}
                                      {visibleColumns.instances && (
                                        <TableCell onClick={(e) => e.stopPropagation()}>
                                          {editingInstancesId === item.id ? (
                                            <Input
                                              autoFocus
                                              type="number"
                                              min={1}
                                              value={
                                                (selected[item.id]?.instances ??
                                                  item.instances) ??
                                                ""
                                              }
                                              onChange={(e) =>
                                                updateSelection(item, {
                                                  instances: e.target.value
                                                    ? Number(e.target.value)
                                                    : undefined,
                                                })
                                              }
                                              onBlur={() => setEditingInstancesId(null)}
                                              onKeyDown={(e) => {
                                                if (e.key === "Enter" || e.key === "Escape")
                                                  setEditingInstancesId(null);
                                              }}
                                              placeholder="auto"
                                              className="h-6 w-14 px-1.5 text-[11px]"
                                            />
                                          ) : (
                                            <button
                                              type="button"
                                              onClick={() => setEditingInstancesId(item.id)}
                                              className="rounded-md px-1.5 py-0.5 text-[11px] text-muted-foreground hover:bg-muted"
                                            >
                                              {selected[item.id]?.instances ??
                                                item.instances ??
                                                "auto"}
                                            </button>
                                          )}
                                        </TableCell>
                                      )}
                                    </TableRow>
                                  ))}
                              </Fragment>
                            );
                          })}
                      </Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>
        </div>

        {detailItem ? (
          <div className="fixed top-12 right-0 bottom-0 z-30 w-full max-w-[380px] overflow-y-auto border-l border-border bg-card px-5 py-5 shadow-xl">
            <div className="flex items-start justify-between gap-2">
              <span className="rounded-md bg-primary px-1.5 py-0.5 text-[11px] font-semibold text-primary-foreground">
                {detailItem.id}
              </span>
              <button
                type="button"
                onClick={() => setDetailItem(null)}
                aria-label="Close details"
                className="shrink-0 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <h2 className="mt-2 text-base font-semibold text-card-foreground">
              {detailItem.title}
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {detailItem.businessArea} / {detailItem.processGroup}
            </p>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-border p-3">
                <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                  Product
                </p>
                <p className="mt-1 text-sm font-semibold text-foreground">{detailItem.product}</p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                  Process ID
                </p>
                <p className="mt-1 text-sm font-semibold text-foreground">{detailItem.id}</p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                  Default Cplx
                </p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  {detailItem.defaultComplexity}
                </p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                  Default Level
                </p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  {detailItem.defaultLevel}
                </p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                  Inst. Driver
                </p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  {detailItem.defaultInstanceDriver}
                </p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                  Derived Inst.
                </p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  {detailItem.instances ?? 1}
                </p>
              </div>
            </div>

            <p className="mt-3 rounded-md bg-muted/50 px-2.5 py-2 text-xs text-muted-foreground">
              Catalog defaults are starting points. After adding this item, you can still adjust
              complexity, level, instance driver, and instances in the Selected Scope Cart before
              saving.
            </p>

            <Button
              type="button"
              className="mt-4 w-full"
              onClick={() => {
                toggleItem(detailItem);
                setDetailItem(null);
              }}
            >
              {selected[detailItem.id] !== undefined ? "Remove from Scope" : "Add to Scope"}
            </Button>
          </div>
        ) : cartCollapsed ? null : (
        <div
          style={{ "--cart-width": `${cartWidth}px` } as CSSProperties}
          className="relative sticky top-4 max-h-[calc(100vh-6rem)] w-full shrink-0 self-start overflow-y-auto rounded-xl bg-white p-5 pl-6 shadow-sm dark:bg-gray-900 lg:w-[var(--cart-width)]"
        >
          <div
            role="separator"
            aria-orientation="vertical"
            onMouseDown={startCartResize}
            className="absolute top-0 left-0 hidden h-full w-1.5 cursor-col-resize touch-none hover:bg-primary/30 lg:block"
          />
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-card-foreground">
              Selected Scope Cart
            </h2>
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-xs font-medium text-muted-foreground">
              {inScope}
            </span>
            <button
              type="button"
              onClick={() => setCartCollapsed(true)}
              aria-label="Collapse selected scope cart"
              className="ml-auto shrink-0 text-muted-foreground hover:text-foreground"
            >
              <CaretRight className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Review and adjust the complexity that applies to this project before saving.
          </p>

          {selectedByProductThenArea.size === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">No scope items selected yet.</p>
          ) : (
            <div className="mt-4">
              <Table containerClassName="overflow-x-visible">
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-muted-foreground">Name</TableHead>
                    <TableHead className="text-muted-foreground">Cplx</TableHead>
                    <TableHead className="text-muted-foreground">Lvl</TableHead>
                    <TableHead className="text-muted-foreground">Driver</TableHead>
                    <TableHead className="text-muted-foreground">#Inst</TableHead>
                    <TableHead className="w-8" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from(selectedByProductThenArea.entries()).map(([product, areas]) => {
                    const productKey = `cart-product:${product}`;
                    const productExpanded = !expandedGroups.has(productKey);
                    const productCount = Array.from(areas.values()).flat().length;
                    return (
                      <Fragment key={product}>
                        <TableRow className="bg-muted/50 hover:bg-muted/50">
                          <TableCell colSpan={6} className="py-2">
                            <button
                              type="button"
                              onClick={() => toggleGroup(productKey)}
                              className="flex w-full items-center gap-2 text-left"
                            >
                              {productExpanded ? (
                                <CaretDown className="h-3.5 w-3.5 text-muted-foreground" />
                              ) : (
                                <CaretRight className="h-3.5 w-3.5 text-muted-foreground" />
                              )}
                              <span className="text-sm font-semibold text-foreground">
                                {product}
                              </span>
                              <span className="ml-auto text-xs text-muted-foreground">
                                {productCount} selected GSIs
                              </span>
                            </button>
                          </TableCell>
                        </TableRow>

                        {productExpanded &&
                          Array.from(areas.entries()).map(([area, items]) => {
                            const areaKey = `cart-area:${product}:${area}`;
                            const areaExpanded = !expandedGroups.has(areaKey);
                            return (
                              <Fragment key={area}>
                                <TableRow className="hover:bg-transparent">
                                  <TableCell colSpan={6} className="py-2 pl-8">
                                    <button
                                      type="button"
                                      onClick={() => toggleGroup(areaKey)}
                                      className="flex w-full items-center gap-2 text-left"
                                    >
                                      {areaExpanded ? (
                                        <CaretDown className="h-3.5 w-3.5 text-muted-foreground" />
                                      ) : (
                                        <CaretRight className="h-3.5 w-3.5 text-muted-foreground" />
                                      )}
                                      <span className="text-sm text-foreground">{area}</span>
                                      <span className="ml-auto text-xs text-muted-foreground">
                                        {items.length} selected GSIs
                                      </span>
                                    </button>
                                  </TableCell>
                                </TableRow>

                                {areaExpanded &&
                                  items.map((item) => {
                                    const overrides = selected[item.id] ?? defaultOverrides(item);
                                    return (
                                      <TableRow key={item.id}>
                                        <TableCell className="max-w-[140px] truncate pl-12 text-sm text-foreground">
                                          {item.title}
                                        </TableCell>
                                        <TableCell>
                                          <Select
                                            value={overrides.complexity}
                                            onValueChange={(v) =>
                                              updateSelection(item, {
                                                complexity: v as GsiComplexity,
                                              })
                                            }
                                          >
                                            <SelectTrigger className="h-7 w-16 shrink-0">
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="L">L</SelectItem>
                                              <SelectItem value="M">M</SelectItem>
                                              <SelectItem value="H">H</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </TableCell>
                                        <TableCell>
                                          <Select
                                            value={overrides.level}
                                            onValueChange={(v) =>
                                              updateSelection(item, { level: v as GsiLevel })
                                            }
                                          >
                                            <SelectTrigger className="h-7 w-16 shrink-0">
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              {gsiLevels.map((level) => (
                                                <SelectItem key={level} value={level}>
                                                  {level}
                                                </SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                        </TableCell>
                                        <TableCell>
                                          <Select
                                            value={overrides.driver}
                                            onValueChange={(v) =>
                                              updateSelection(item, {
                                                driver: v as InstanceDriver,
                                              })
                                            }
                                          >
                                            <SelectTrigger className="h-7 w-28 shrink-0">
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              {instanceDrivers.map((driver) => (
                                                <SelectItem key={driver} value={driver}>
                                                  {driver}
                                                </SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                        </TableCell>
                                        <TableCell>
                                          <Input
                                            type="number"
                                            min={1}
                                            value={overrides.instances ?? ""}
                                            onChange={(e) =>
                                              updateSelection(item, {
                                                instances: e.target.value
                                                  ? Number(e.target.value)
                                                  : undefined,
                                              })
                                            }
                                            placeholder="auto"
                                            className="h-7 w-16 shrink-0"
                                          />
                                        </TableCell>
                                        <TableCell>
                                          <button
                                            type="button"
                                            onClick={() => removeItem(item.id)}
                                            className="text-muted-foreground hover:text-destructive"
                                          >
                                            <X className="h-4 w-4" />
                                            <span className="sr-only">Remove {item.title}</span>
                                          </button>
                                        </TableCell>
                                      </TableRow>
                                    );
                                  })}
                              </Fragment>
                            );
                          })}
                      </Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
        )}
      </div>

      <Dialog
        open={addDialogOpen}
        onOpenChange={(open) => {
          setAddDialogOpen(open);
          if (!open) resetCustomGsiForm();
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Custom GSI</DialogTitle>
            <DialogDescription>
              Use this when the required scope is not available in the catalog.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={nameId}>Name</Label>
              <Input
                id={nameId}
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Enter custom GSI name"
                autoComplete="off"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Module</Label>
              <Input
                value={customModule}
                onChange={(e) => setCustomModule(e.target.value)}
                placeholder="Enter module"
                autoComplete="off"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Complexity</Label>
              <Select
                value={customComplexity}
                onValueChange={(v) => setCustomComplexity(v as GsiComplexity)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="L">L</SelectItem>
                  <SelectItem value="M">M</SelectItem>
                  <SelectItem value="H">H</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Level</Label>
              <Select value={customLevel} onValueChange={(v) => setCustomLevel(v as GsiLevel)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {gsiLevels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Instance Driver</Label>
              <Select
                value={customInstanceDriver}
                onValueChange={(v) => setCustomInstanceDriver(v as InstanceDriver)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {instanceDrivers.map((driver) => (
                    <SelectItem key={driver} value={driver}>
                      {driver}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Instances</Label>
              <Input
                type="number"
                min={1}
                value={customInstances}
                onChange={(e) => setCustomInstances(e.target.value)}
                placeholder="#instances (auto)"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Std Hrs</Label>
              <Input
                type="number"
                min={0}
                value={customStdHrs}
                onChange={(e) => setCustomStdHrs(e.target.value)}
                placeholder="Std Hrs (optional)"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={addCustomGsi} disabled={!customName.trim()}>
              Create Custom GSI
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
