"use client";

import { useMemo } from "react";
import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarInset } from "@/components/ui/sidebar";
import { PageHeader } from "@/components/page-header";
import { useSetTopBar } from "@/lib/top-bar-context";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  dashboardStats,
  usageByUser,
  goldenMasterOverrides,
  recentEstimates,
} from "@/lib/dashboard-data";

const dateTimeFormat = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const numberFormat = new Intl.NumberFormat(undefined);

export default function DashboardPage() {
  const crumbs = useMemo(() => [{ label: "Dashboard" }], []);
  useSetTopBar(crumbs);

  return (
    <SidebarInset>
      <PageHeader
        icon={
          <Image
            src="/widget-illustration.png"
            alt=""
            aria-hidden="true"
            width={56}
            height={56}
            className="h-14 w-14 shrink-0"
          />
        }
        title="Usage Dashboard"
        description="See project activity, estimation volume, and how your organisation overrides golden masters."
      />

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {dashboardStats.map((stat) => (
            <Card key={stat.key} className="gap-1 py-4">
              <CardHeader className="gap-1 px-4">
                <CardDescription>{stat.label}</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums">
                  {numberFormat.format(stat.value)}
                </CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>

        <div className="pt-6">
          <h2 className="text-base font-semibold text-foreground">
            Usage By User
          </h2>
          <div className="mt-3 overflow-x-auto rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead className="text-right">Projects</TableHead>
                  <TableHead className="text-right">Estimates</TableHead>
                  <TableHead>Last Activity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usageByUser.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium text-foreground">
                      {row.email}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {row.projects}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {row.estimates}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {dateTimeFormat.format(new Date(row.lastActivity))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="flex flex-col gap-6 pt-6 pb-2">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Golden Master Overrides
            </h2>
            <div className="mt-3 overflow-x-auto rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project</TableHead>
                    <TableHead>GSI</TableHead>
                    <TableHead>Field</TableHead>
                    <TableHead>Master</TableHead>
                    <TableHead>Selected</TableHead>
                    <TableHead>User</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {goldenMasterOverrides.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="max-w-40 min-w-0 font-medium break-words whitespace-normal text-foreground">
                        {row.project}
                      </TableCell>
                      <TableCell className="max-w-36 min-w-0 break-words whitespace-normal">
                        {row.gsi}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {row.field}
                      </TableCell>
                      <TableCell>{row.master}</TableCell>
                      <TableCell className="font-medium text-primary">
                        {row.selected}
                      </TableCell>
                      <TableCell className="max-w-32 min-w-0 truncate text-muted-foreground">
                        {row.user}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <div>
            <h2 className="text-base font-semibold text-foreground">
              Recent Estimates
            </h2>
            <div className="mt-3 flex max-h-[480px] flex-col gap-3 overflow-y-auto rounded-lg border border-border p-3">
              {recentEstimates.map((row) => (
                <div
                  key={row.id}
                  className="rounded-md border border-border p-3 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="min-w-0 text-sm font-medium break-words text-foreground">
                      {row.project}
                    </p>
                    <Badge
                      variant="secondary"
                      className="shrink-0 rounded-md px-2 font-medium"
                    >
                      {row.overrides} override{row.overrides === 1 ? "" : "s"}
                    </Badge>
                  </div>
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {row.user} · {dateTimeFormat.format(new Date(row.createdAt))}
                  </p>
                  <p className="mt-1 text-sm font-medium tabular-nums text-foreground">
                    {numberFormat.format(row.hours)} hrs
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
        </div>
      </div>
    </SidebarInset>
  );
}
