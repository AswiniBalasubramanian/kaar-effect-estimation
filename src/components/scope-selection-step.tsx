"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { CaretDown, CaretRight, MagnifyingGlass, Plus, X } from "@phosphor-icons/react";

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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
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
      <TooltipContent side="top">{text}</TooltipContent>
    </Tooltip>
  );
}

function complexityBadgeClass(level: GsiComplexity) {
  if (level === "H")
    return "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-400";
  if (level === "M")
    return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-400";
  return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400";
}

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-background px-4 py-3">
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold tabular-nums text-foreground">{value}</p>
    </div>
  );
}

let customGsiCounter = 0;

export function ScopeSelectionStep({
  onInScopeChange,
}: {
  onInScopeChange?: (count: number) => void;
}) {
  const nameId = useId();

  const [customItems, setCustomItems] = useState<GsiCatalogItem[]>([]);
  const [selected, setSelected] = useState<Record<string, GsiComplexity>>({});
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const [activeProduct, setActiveProduct] = useState<SapProduct>("S4H_OnPrem");
  const [businessAreaFilter, setBusinessAreaFilter] = useState("all");
  const [processGroupFilter, setProcessGroupFilter] = useState("all");
  const [search, setSearch] = useState("");

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

  const groupedCatalog = useMemo(() => {
    const areas = new Map<string, Map<string, GsiCatalogItem[]>>();
    for (const item of filteredCatalog) {
      if (!areas.has(item.businessArea)) areas.set(item.businessArea, new Map());
      const groups = areas.get(item.businessArea)!;
      if (!groups.has(item.processGroup)) groups.set(item.processGroup, []);
      groups.get(item.processGroup)!.push(item);
    }
    return areas;
  }, [filteredCatalog]);

  const selectedItems = useMemo(
    () => allItems.filter((item) => selected[item.id] !== undefined),
    [allItems, selected]
  );

  const inScope = selectedItems.length;
  const high = selectedItems.filter((i) => selected[i.id] === "H").length;
  const medium = selectedItems.filter((i) => selected[i.id] === "M").length;
  const low = selectedItems.filter((i) => selected[i.id] === "L").length;
  const custom = customItems.filter((i) => selected[i.id] !== undefined).length;
  const autoDefaulted = selectedItems.filter(
    (i) => !customItems.includes(i) && selected[i.id] === i.defaultComplexity
  ).length;

  useEffect(() => {
    onInScopeChange?.(inScope);
  }, [inScope, onInScopeChange]);

  const selectedAreaChips = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of selectedItems) {
      counts.set(item.businessArea, (counts.get(item.businessArea) ?? 0) + 1);
    }
    return Array.from(counts.entries());
  }, [selectedItems]);

  function toggleItem(item: GsiCatalogItem) {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[item.id] !== undefined) {
        delete next[item.id];
      } else {
        next[item.id] = item.defaultComplexity;
      }
      return next;
    });
  }

  function setItemComplexity(id: string, complexity: GsiComplexity) {
    setSelected((prev) => ({ ...prev, [id]: complexity }));
  }

  function removeItem(id: string) {
    setSelected((prev) => {
      const next = { ...prev };
      delete next[id];
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

  function toggleArea(area: string, items: GsiCatalogItem[]) {
    const allSelected = items.every((i) => selected[i.id] !== undefined);
    setSelected((prev) => {
      const next = { ...prev };
      for (const item of items) {
        if (allSelected) delete next[item.id];
        else next[item.id] = item.defaultComplexity;
      }
      return next;
    });
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
    setSelected((prev) => ({ ...prev, [id]: customComplexity }));
    resetCustomGsiForm();
    setAddDialogOpen(false);
  }

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

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-border bg-card px-5 py-5">
        <div className="flex items-center gap-1.5">
          <h2 className="text-base font-semibold text-card-foreground">Scope Summary</h2>
          <FieldHelp text="In-scope Global Scope Items selected from the GSI catalog, grouped by complexity." />
        </div>
        <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-6">
          <StatBox label="In Scope" value={inScope} />
          <StatBox label="High" value={high} />
          <StatBox label="Medium" value={medium} />
          <StatBox label="Low" value={low} />
          <StatBox label="Custom" value={custom} />
          <StatBox label="Auto-Defaulted" value={autoDefaulted} />
        </div>
        {selectedAreaChips.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {selectedAreaChips.map(([area, count]) => (
              <span
                key={area}
                className="rounded-md bg-muted px-2 py-1 text-xs font-medium text-foreground"
              >
                {area} {count}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card px-5 py-5 lg:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-card-foreground">GSI Catalog Browser</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Browse by product and business area, then add individual scope items or a
                visible set.
              </p>
            </div>
            <Button type="button" size="sm" className="gap-1.5" onClick={() => setAddDialogOpen(true)}>
              <Plus className="h-4 w-4" />
              Add Custom GSI
            </Button>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {sapProducts.map((product) => (
              <button
                key={product}
                type="button"
                onClick={() => {
                  setActiveProduct(product);
                  setBusinessAreaFilter("all");
                  setProcessGroupFilter("all");
                }}
                className={cn(
                  "rounded-md border px-3 py-1.5 text-sm font-medium transition-colors",
                  activeProduct === product
                    ? "border-primary text-primary"
                    : "border-input bg-transparent text-foreground hover:bg-muted"
                )}
              >
                {product}
              </button>
            ))}
            <span className="ml-auto shrink-0 text-xs text-muted-foreground">
              {filteredCatalog.length} matches
            </span>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Select
              value={businessAreaFilter}
              onValueChange={(v) => {
                setBusinessAreaFilter(v);
                setProcessGroupFilter("all");
              }}
            >
              <SelectTrigger className="w-full">
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
              <SelectTrigger className="w-full">
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
          </div>

          <div className="relative mt-2">
            <MagnifyingGlass className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search process, scope item ID, module, group, or keyword"
              className="pl-9"
              autoComplete="off"
            />
          </div>

          <div className="mt-3 max-h-96 overflow-y-auto rounded-lg border border-border">
            {groupedCatalog.size === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                No scope items match this filter.
              </p>
            ) : (
              Array.from(groupedCatalog.entries()).map(([area, groups]) => {
                const areaItems = Array.from(groups.values()).flat();
                const areaSelectedCount = areaItems.filter(
                  (i) => selected[i.id] !== undefined
                ).length;
                const areaKey = `area:${area}`;
                const areaExpanded = !expandedGroups.has(areaKey);
                return (
                  <div key={area} className="border-b border-border last:border-b-0">
                    <div className="flex items-center gap-2 bg-muted/50 px-3 py-2">
                      <button
                        type="button"
                        onClick={() => toggleGroup(areaKey)}
                        className="flex items-center gap-1.5 text-left"
                      >
                        {areaExpanded ? (
                          <CaretDown className="h-3.5 w-3.5 text-muted-foreground" />
                        ) : (
                          <CaretRight className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                        <span className="text-sm font-medium text-foreground">{area}</span>
                      </button>
                      <span className="text-xs text-muted-foreground">
                        {areaItems.length} GSIs | {areaSelectedCount} selected
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="ml-auto h-7"
                        onClick={() => toggleArea(area, areaItems)}
                      >
                        {areaSelectedCount === areaItems.length ? "Remove area" : "Add area"}
                      </Button>
                    </div>

                    {areaExpanded &&
                      Array.from(groups.entries()).map(([group, items]) => {
                        const groupSelectedCount = items.filter(
                          (i) => selected[i.id] !== undefined
                        ).length;
                        const groupKey = `group:${area}:${group}`;
                        const groupExpanded = !expandedGroups.has(groupKey);
                        return (
                          <div key={group}>
                            <div className="flex items-center gap-2 px-3 py-2 pl-8">
                              <button
                                type="button"
                                onClick={() => toggleGroup(groupKey)}
                                className="flex items-center gap-1.5 text-left"
                              >
                                {groupExpanded ? (
                                  <CaretDown className="h-3.5 w-3.5 text-muted-foreground" />
                                ) : (
                                  <CaretRight className="h-3.5 w-3.5 text-muted-foreground" />
                                )}
                                <span className="text-sm text-foreground">{group}</span>
                              </button>
                              <span className="text-xs text-muted-foreground">
                                {items.length} GSIs | {groupSelectedCount} selected
                              </span>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="ml-auto h-7"
                                onClick={() => toggleArea(group, items)}
                              >
                                {groupSelectedCount === items.length ? "Remove group" : "Add group"}
                              </Button>
                            </div>

                            {groupExpanded &&
                              items.map((item) => (
                                <label
                                  key={item.id}
                                  className="flex cursor-pointer items-center gap-2.5 px-3 py-2 pl-12 hover:bg-muted"
                                >
                                  <Checkbox
                                    checked={selected[item.id] !== undefined}
                                    onCheckedChange={() => toggleItem(item)}
                                  />
                                  <span className="rounded-md bg-primary px-1.5 py-0.5 text-[11px] font-semibold text-primary-foreground">
                                    {item.id}
                                  </span>
                                  <span
                                    className={cn(
                                      "rounded-md border px-1.5 py-0.5 text-[11px] font-medium",
                                      complexityBadgeClass(item.defaultComplexity)
                                    )}
                                  >
                                    {item.defaultComplexity}
                                  </span>
                                  <span className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
                                    {item.defaultLevel}
                                  </span>
                                  <span className="min-w-0 flex-1 truncate text-sm text-foreground">
                                    {item.title}
                                  </span>
                                </label>
                              ))}
                          </div>
                        );
                      })}
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card px-5 py-5">
          <h2 className="text-base font-semibold text-card-foreground">
            Selected Scope Cart ({inScope})
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Review the values that will be saved and used by the estimate.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Complexity is a per-project judgment.</span>{" "}
            Each GSI is pre-filled with the catalog&rsquo;s suggested default, but you set the
            complexity that applies to <span className="italic">this</span> project here.
          </p>
          <p className="mt-2 rounded-md bg-muted/50 px-2.5 py-2 text-xs text-muted-foreground">
            Instance drivers read Step A values. LegalEntities repeats once per legal entity,
            Countries repeats once per country, and Fixed1 means exactly one instance.
          </p>

          {selectedByProductThenArea.size === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">No scope items selected yet.</p>
          ) : (
            <div className="mt-3 flex flex-col gap-3">
              {Array.from(selectedByProductThenArea.entries()).map(([product, areas]) => {
                const productKey = `cart-product:${product}`;
                const productExpanded = !expandedGroups.has(productKey);
                const productCount = Array.from(areas.values()).flat().length;
                return (
                  <div key={product} className="rounded-lg border border-border">
                    <button
                      type="button"
                      onClick={() => toggleGroup(productKey)}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left"
                    >
                      {productExpanded ? (
                        <CaretDown className="h-3.5 w-3.5 text-muted-foreground" />
                      ) : (
                        <CaretRight className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                      <span className="text-sm font-semibold text-foreground">{product}</span>
                      <span className="ml-auto text-xs text-muted-foreground">
                        {productCount} selected GSIs
                      </span>
                    </button>

                    {productExpanded &&
                      Array.from(areas.entries()).map(([area, items]) => {
                        const areaKey = `cart-area:${product}:${area}`;
                        const areaExpanded = !expandedGroups.has(areaKey);
                        return (
                          <div key={area} className="border-t border-border">
                            <button
                              type="button"
                              onClick={() => toggleGroup(areaKey)}
                              className="flex w-full items-center gap-2 px-3 py-2 pl-6 text-left"
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

                            {areaExpanded && (
                              <div className="flex flex-col gap-2 px-3 pb-3 pl-6">
                                {items.map((item) => (
                                  <div
                                    key={item.id}
                                    className="flex items-center gap-2 rounded-md border border-border px-2.5 py-2"
                                  >
                                    <span className="min-w-0 flex-1 truncate text-sm text-foreground">
                                      {item.title}
                                    </span>
                                    <Select
                                      value={selected[item.id]}
                                      onValueChange={(v) =>
                                        setItemComplexity(item.id, v as GsiComplexity)
                                      }
                                    >
                                      <SelectTrigger className="h-7 w-24 shrink-0">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="L">Low</SelectItem>
                                        <SelectItem value="M">Medium</SelectItem>
                                        <SelectItem value="H">High</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <button
                                      type="button"
                                      onClick={() => removeItem(item.id)}
                                      className="shrink-0 text-muted-foreground hover:text-destructive"
                                    >
                                      <X className="h-4 w-4" />
                                      <span className="sr-only">Remove {item.title}</span>
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                );
              })}
            </div>
          )}
        </div>
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
