"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

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

interface Phase {
  key: string;
  label: string;
  pct: number;
  hasDelivery: boolean;
  deliveryPerGsi: number;
}

const PHASES: Phase[] = [
  { key: "discover", label: "1. Discover", pct: 0.06, hasDelivery: false, deliveryPerGsi: 0 },
  { key: "prepare", label: "2. Prepare", pct: 0.1, hasDelivery: false, deliveryPerGsi: 0 },
  { key: "explore", label: "3. Explore", pct: 0.18, hasDelivery: true, deliveryPerGsi: 40 },
  { key: "realize", label: "4. Realize", pct: 0.4, hasDelivery: true, deliveryPerGsi: 140 },
  { key: "deploy", label: "5. Deploy", pct: 0.18, hasDelivery: true, deliveryPerGsi: 25 },
  { key: "run", label: "6. Run", pct: 0.08, hasDelivery: false, deliveryPerGsi: 0 },
];

const PMO_UTILIZATION = 0.5;
const PEAK_FTE_UTILIZATION = 0.75;
const WORK_DAYS_PER_WEEK = 5;

function ceilToHalf(value: number) {
  if (!Number.isFinite(value) || value <= 0) return 0;
  return Math.ceil(value * 2) / 2;
}

export function EffortEstimateStep({
  inScopeGsis,
  driversProvided,
  driversTotal,
  durationWeeks,
  hoursPerDay,
  industry,
  orgMultiplier,
}: {
  inScopeGsis: number;
  driversProvided: number;
  driversTotal: number;
  durationWeeks: number;
  hoursPerDay: number;
  industry: string;
  orgMultiplier: number;
}) {
  const [mode, setMode] = useState<"formula" | "ml" | "compare">("formula");
  const [showAudit, setShowAudit] = useState(false);

  const rows = useMemo(() => {
    return PHASES.map((phase) => {
      const weeks = Math.round(durationWeeks * phase.pct * 10) / 10;
      const pmoHrs =
        Math.round(weeks * WORK_DAYS_PER_WEEK * hoursPerDay * PMO_UTILIZATION * 100) / 100;
      const deliveryHrs = phase.hasDelivery
        ? Math.round(inScopeGsis * orgMultiplier * phase.deliveryPerGsi * 100) / 100
        : 0;
      const totalHrs = Math.round((pmoHrs + deliveryHrs) * 100) / 100;
      const peakFte = ceilToHalf(
        totalHrs / (weeks * WORK_DAYS_PER_WEEK * hoursPerDay * PEAK_FTE_UTILIZATION || 1)
      );
      return { ...phase, weeks, pmoHrs, deliveryHrs, totalHrs, peakFte };
    });
  }, [durationWeeks, hoursPerDay, inScopeGsis, orgMultiplier]);

  const totalPmo = rows.reduce((sum, r) => sum + r.pmoHrs, 0);
  const totalDelivery = rows.reduce((sum, r) => sum + r.deliveryHrs, 0);
  const totalEffort = totalPmo + totalDelivery;
  const peakFte = Math.max(...rows.map((r) => r.peakFte));
  const maxPhaseHrs = Math.max(...rows.map((r) => r.totalHrs), 1);

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-border bg-card px-5 py-4">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-card-foreground">Estimation Mode</h2>
          <span className="rounded-md border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[11px] font-medium text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400">
            ML ready
          </span>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => setMode("formula")}
            className={cn(
              "rounded-md px-4 py-2 text-sm font-medium transition-colors",
              mode === "formula"
                ? "bg-primary text-primary-foreground"
                : "border border-input text-foreground hover:bg-muted"
            )}
          >
            Formula (KDM)
          </button>
          <button
            type="button"
            onClick={() => setMode("ml")}
            className={cn(
              "rounded-md px-4 py-2 text-sm font-medium transition-colors",
              mode === "ml"
                ? "bg-primary text-primary-foreground"
                : "border border-input text-muted-foreground hover:bg-muted"
            )}
          >
            ML Prediction
          </button>
          <button
            type="button"
            onClick={() => setMode("compare")}
            className={cn(
              "rounded-md px-4 py-2 text-sm font-medium transition-colors",
              mode === "compare"
                ? "bg-primary text-primary-foreground"
                : "border border-input text-muted-foreground hover:bg-muted"
            )}
          >
            Compare Both
          </button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {mode === "formula" &&
            "Using the deterministic KDM formula engine. All effort values are reproducible from the frozen master snapshot."}
          {mode === "ml" && "ML Prediction isn't connected yet — no trained model is wired up."}
          {mode === "compare" && "Compare Both isn't available until ML Prediction is connected."}
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card px-5 py-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <h2 className="text-base font-semibold text-card-foreground">Effort Estimation</h2>
            <FieldHelp text="Baseline KDM formula built from Steps A–D: org multiplier × in-scope GSIs feeds Delivery hours, duration × hours/day feeds PMO governance hours. Uses a representative phase/hours model since the full Activity Effort master isn't loaded yet — swap in real master data to replace these baseline rates." />
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm">
              Reset to Defaults
            </Button>
            <Button type="button" variant="outline" size="sm">
              Export Effort
            </Button>
            <Button type="button" size="sm">
              Compute Estimate
            </Button>
          </div>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Compute runs anytime — missing inputs are defaulted and listed in the Assumptions
          appendix. Effort is reported in man-hours.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg border border-border bg-background px-4 py-3">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              In-Scope GSIs
            </p>
            <p className="mt-1 text-sm font-semibold tabular-nums text-foreground">
              {inScopeGsis}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-background px-4 py-3">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Drivers Provided
            </p>
            <p className="mt-1 text-sm font-semibold tabular-nums text-foreground">
              {driversProvided} / {driversTotal}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-background px-4 py-3">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Duration (wks)
            </p>
            <p className="mt-1 text-sm font-semibold tabular-nums text-foreground">
              {durationWeeks}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-background px-4 py-3">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Industry
            </p>
            <p className="mt-1 text-sm font-semibold text-foreground">{industry || "—"}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowAudit((v) => !v)}
          className="mt-3 flex w-full items-center justify-between rounded-md border border-border px-3 py-2 text-sm text-foreground hover:bg-muted"
        >
          Advanced audit controls
          <span className="text-xs text-muted-foreground">{showAudit ? "Hide" : "Show"}</span>
        </button>
        {showAudit && (
          <p className="mt-2 rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
            Org Multiplier: <span className="tabular-nums text-foreground">{orgMultiplier.toFixed(4)}</span>{" "}
            · Hours/Day: <span className="tabular-nums text-foreground">{hoursPerDay}</span> ·
            PMO utilization: {Math.round(PMO_UTILIZATION * 100)}% · Peak FTE utilization:{" "}
            {Math.round(PEAK_FTE_UTILIZATION * 100)}%
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="h-1 bg-primary" />
          <div className="px-5 py-4">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Total Effort
              </p>
              <FieldHelp text="Total Effort = sum of PMO hours + Delivery hours across all six phases." />
            </div>
            <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">
              {totalEffort.toLocaleString(undefined, { maximumFractionDigits: 0 })} hrs
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              man-hours · org mult {orgMultiplier.toFixed(4)}
            </p>
          </div>
        </div>
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="h-1 bg-primary" />
          <div className="px-5 py-4">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Delivery vs PMO
              </p>
              <FieldHelp text="Delivery hours come from in-scope GSI work in Explore/Realize/Deploy. PMO hours are governance overhead spread across all six phases." />
            </div>
            <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">
              {totalDelivery.toLocaleString(undefined, { maximumFractionDigits: 0 })} /{" "}
              {totalPmo.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">Delivery / PMO man-hours</p>
          </div>
        </div>
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="h-1 bg-primary" />
          <div className="px-5 py-4">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Peak FTE
              </p>
              <FieldHelp text="Peak FTE is each phase's own FTE = CEILING(phase hrs / (phase weeks × 5 × hrs/day × 0.75), 0.5). Peak FTE shown is the max across all phases." />
            </div>
            <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">{peakFte}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              at {rows.find((r) => r.peakFte === peakFte)?.label ?? "—"}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card px-5 py-5">
        <div className="flex items-center gap-1.5">
          <h2 className="text-base font-semibold text-card-foreground">Effort by Phase</h2>
          <FieldHelp text="Bar length is based on total man-hours per phase (PMO in gray, Delivery in primary red)." />
        </div>
        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-muted-foreground/40" /> PMO
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-primary" /> Delivery
          </span>
        </div>

        <div className="mt-3 overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-xs text-muted-foreground">
                <th className="px-3 py-2 text-left font-medium">Phase</th>
                <th className="px-3 py-2 text-left font-medium">Effort Mix</th>
                <th className="px-3 py-2 text-right font-medium">Man-Hours</th>
                <th className="px-3 py-2 text-right font-medium">Peak FTE</th>
                <th className="px-3 py-2 text-right font-medium">Weeks</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.key} className="border-b border-border last:border-b-0">
                  <td className="px-3 py-2.5 font-medium text-foreground">{row.label}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex h-2 w-full max-w-40 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-muted-foreground/40"
                        style={{ width: `${(row.pmoHrs / maxPhaseHrs) * 100}%` }}
                      />
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${(row.deliveryHrs / maxPhaseHrs) * 100}%` }}
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      PMO {row.pmoHrs.toFixed(2)} / Delivery {row.deliveryHrs.toFixed(2)}
                    </p>
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-foreground">
                    {row.totalHrs.toFixed(2)}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-foreground">
                    {row.peakFte}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-foreground">
                    {row.weeks}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
