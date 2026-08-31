"use client";

import { use, useMemo } from "react";
import { notFound } from "next/navigation";

import { SidebarInset } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/data-table";
import { GsiCatalogAdmin } from "@/components/gsi-catalog-admin";
import { PageHeader } from "@/components/page-header";
import { useSetTopBar } from "@/lib/top-bar-context";
import {
  getCategory,
  gsiCatalogRows,
  activityEffortRows,
  fricewObjectRows,
  orgComplexityRows,
  rolesRows,
  thresholdSwitchFields,
  phaseTemplateRows,
  type ActivityEffortRow,
  type FricewObjectRow,
  type OrgComplexityRow,
  type RoleRow,
  type PhaseTemplateRow,
} from "@/lib/master-data";

function renderBody(slug: string) {
  switch (slug) {
    case "gsi-catalog":
      return <GsiCatalogAdmin initialRows={gsiCatalogRows} />;
    case "activity-effort": {
      const columns: DataTableColumn<ActivityEffortRow>[] = [
        { key: "activity", header: "Activity", render: (r) => r.activity },
        { key: "scopeLevel", header: "Scope Level", render: (r) => r.scopeLevel },
        { key: "complexity", header: "Complexity", render: (r) => r.complexity },
        {
          key: "baseHours",
          header: "Base Hours",
          className: "text-right tabular-nums",
          render: (r) => r.baseHours,
        },
      ];
      return <DataTable columns={columns} rows={activityEffortRows} pageSize={25} />;
    }
    case "fricew-objects": {
      const columns: DataTableColumn<FricewObjectRow>[] = [
        { key: "objectType", header: "Object Type", render: (r) => r.objectType },
        { key: "complexity", header: "Complexity", render: (r) => r.complexity },
        {
          key: "effortMd",
          header: "Effort (md)",
          className: "text-right tabular-nums",
          render: (r) => r.effortMd,
        },
      ];
      return <DataTable columns={columns} rows={fricewObjectRows} pageSize={25} />;
    }
    case "org-complexity": {
      const columns: DataTableColumn<OrgComplexityRow>[] = [
        { key: "driver", header: "Driver", render: (r) => r.driver },
        { key: "description", header: "Description", render: (r) => r.description },
        {
          key: "multiplier",
          header: "Multiplier",
          className: "text-right tabular-nums",
          render: (r) => `${r.multiplier.toFixed(2)}×`,
        },
      ];
      return <DataTable columns={columns} rows={orgComplexityRows} pageSize={25} />;
    }
    case "roles": {
      const columns: DataTableColumn<RoleRow>[] = [
        { key: "role", header: "Role", render: (r) => r.role },
        {
          key: "distributionFactorPct",
          header: "Distribution Factor",
          className: "text-right tabular-nums",
          render: (r) => `${r.distributionFactorPct}%`,
        },
      ];
      return <DataTable columns={columns} rows={rolesRows} pageSize={25} />;
    }
    case "phase-template": {
      const columns: DataTableColumn<PhaseTemplateRow>[] = [
        { key: "sequence", header: "#", className: "tabular-nums", render: (r) => r.sequence },
        { key: "phase", header: "Phase", render: (r) => r.phase },
        { key: "deliverable", header: "Deliverable", render: (r) => r.deliverable },
        { key: "activity", header: "Activity", render: (r) => r.activity },
      ];
      return <DataTable columns={columns} rows={phaseTemplateRows} pageSize={25} />;
    }
    case "thresholds-switches":
      return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {thresholdSwitchFields.map((f) => (
            <div key={f.key} className="rounded-lg border border-border p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-foreground">{f.label}</span>
                <span className="text-sm font-semibold text-primary tabular-nums">
                  {f.value}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{f.description}</p>
            </div>
          ))}
        </div>
      );
    default:
      return null;
  }
}

export default function ConfigurationDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const category = getCategory(slug);

  const crumbs = useMemo(
    () => [
      { label: "Configuration", href: "/configuration" },
      { label: category?.title ?? "Not found" },
    ],
    [category]
  );
  useSetTopBar(crumbs);

  if (!category) notFound();

  return (
    <SidebarInset>
      <PageHeader
        title={
          <span className="inline-flex items-center gap-2">
            {category.title}
            <Badge variant="secondary" className="rounded-md px-2 font-medium">
              {category.rowCount.toLocaleString()} row{category.rowCount === 1 ? "" : "s"}
            </Badge>
          </span>
        }
        description={category.description}
        actions={
          <div className="flex shrink-0 items-center gap-2">
            {category.slug === "gsi-catalog" && (
              <Button size="sm" variant="outline">
                Publish version
              </Button>
            )}
            <Badge variant="secondary" className="shrink-0 rounded-md px-2 font-medium">
              {category.version}
            </Badge>
          </div>
        }
      />

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8">
          {renderBody(category.slug)}
        </div>
      </div>
    </SidebarInset>
  );
}
