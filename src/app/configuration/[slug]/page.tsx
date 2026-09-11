"use client";

import { use, useMemo } from "react";
import { notFound, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react";

import { SidebarInset } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/data-table";
import { GsiCatalogAdmin } from "@/components/gsi-catalog-admin";
import { PageHeader } from "@/components/page-header";
import { useSetTopBar } from "@/lib/top-bar-context";
import { getConfigSet } from "@/lib/config-sets-store";
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

function renderBody(slug: string, readOnly: boolean) {
  switch (slug) {
    case "gsi-catalog":
      return <GsiCatalogAdmin initialRows={gsiCatalogRows} readOnly={readOnly} />;
    case "activity-effort": {
      const columns: DataTableColumn<ActivityEffortRow>[] = [
        { key: "activity", header: "Activity", render: (r) => r.activity, getValue: (r) => r.activity },
        {
          key: "scopeLevel",
          header: "Scope Level",
          render: (r) => r.scopeLevel,
          getValue: (r) => r.scopeLevel,
          groupable: true,
          filterable: true,
        },
        {
          key: "complexity",
          header: "Complexity",
          render: (r) => r.complexity,
          getValue: (r) => r.complexity,
          groupable: true,
          filterable: true,
        },
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
        { key: "objectType", header: "Object Type", render: (r) => r.objectType, getValue: (r) => r.objectType },
        {
          key: "complexity",
          header: "Complexity",
          render: (r) => r.complexity,
          getValue: (r) => r.complexity,
          groupable: true,
          filterable: true,
        },
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
        {
          key: "driver",
          header: "Driver",
          render: (r) => r.driver,
          getValue: (r) => r.driver,
          groupable: true,
          filterable: true,
        },
        { key: "description", header: "Description", render: (r) => r.description, getValue: (r) => r.description },
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
        { key: "role", header: "Role", render: (r) => r.role, getValue: (r) => r.role },
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
        {
          key: "phase",
          header: "Phase",
          render: (r) => r.phase,
          getValue: (r) => r.phase,
          groupable: true,
          filterable: true,
        },
        { key: "deliverable", header: "Deliverable", render: (r) => r.deliverable, getValue: (r) => r.deliverable },
        { key: "activity", header: "Activity", render: (r) => r.activity, getValue: (r) => r.activity },
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
                <span className="text-sm font-semibold text-primary-text tabular-nums">
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
  const searchParams = useSearchParams();
  const configSetId = searchParams.get("set");
  const configSet = configSetId ? getConfigSet(configSetId) : undefined;
  const isConfigSetContext = Boolean(configSetId && configSet);
  const backHref = isConfigSetContext ? `/configuration/config-sets/${configSetId}` : "/configuration";

  const crumbs = useMemo(
    () => [
      { label: "Configuration", href: "/configuration" },
      ...(isConfigSetContext && configSet
        ? [{ label: configSet.name, href: `/configuration/config-sets/${configSetId}` }]
        : []),
      { label: category?.title ?? "Not found" },
    ],
    [category, isConfigSetContext, configSet, configSetId]
  );
  useSetTopBar(crumbs);

  if (!category) notFound();

  return (
    <SidebarInset>
      <PageHeader
        icon={
          <Button
            asChild
            size="icon-sm"
            variant="outline"
            className="mt-0.5 shrink-0 self-start"
            aria-label="Back"
          >
            <Link href={backHref}>
              <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            </Link>
          </Button>
        }
        title={
          <span className="inline-flex items-center gap-2">
            {category.title}
            <Badge variant="secondary" className="rounded-md px-2 font-medium">
              {category.rowCount.toLocaleString()} row{category.rowCount === 1 ? "" : "s"}
            </Badge>
            {isConfigSetContext && (
              <Badge className="rounded-md border-emerald-200 bg-emerald-50 px-1.5 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400">
                Editing: {configSet?.name}
              </Badge>
            )}
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
          {renderBody(category.slug, !isConfigSetContext)}
        </div>
      </div>
    </SidebarInset>
  );
}
