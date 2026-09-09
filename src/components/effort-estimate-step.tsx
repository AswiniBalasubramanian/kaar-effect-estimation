"use client";

import { useMemo, useState } from "react";

import { CaretDown, SlidersHorizontal } from "@phosphor-icons/react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { GsiCatalogItem } from "@/lib/gsi-catalog";

function FieldHelp({ text }: { text: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="inline-flex shrink-0 text-muted-foreground hover:text-foreground"
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
  barClass: string;
  mlPct: number;
}

const PHASES: Phase[] = [
  { key: "discover", label: "1. Discover", pct: 0.06, hasDelivery: false, deliveryPerGsi: 0, barClass: "bg-muted-foreground/40", mlPct: 0 },
  { key: "prepare", label: "2. Prepare", pct: 0.1, hasDelivery: false, deliveryPerGsi: 0, barClass: "bg-muted-foreground/40", mlPct: 0.07 },
  { key: "explore", label: "3. Explore", pct: 0.18, hasDelivery: true, deliveryPerGsi: 40, barClass: "bg-emerald-500", mlPct: 0.194 },
  { key: "realize", label: "4. Realize", pct: 0.4, hasDelivery: true, deliveryPerGsi: 140, barClass: "bg-blue-500", mlPct: 0.474 },
  { key: "deploy", label: "5. Deploy", pct: 0.18, hasDelivery: true, deliveryPerGsi: 25, barClass: "bg-violet-500", mlPct: 0.134 },
  { key: "run", label: "6. Run", pct: 0.08, hasDelivery: false, deliveryPerGsi: 0, barClass: "bg-muted-foreground/40", mlPct: 0.128 },
];

const PMO_UTILIZATION = 0.5;
const PEAK_FTE_UTILIZATION = 0.75;
const WORK_DAYS_PER_WEEK = 5;

const PMO_ACTIVITIES = [
  { activity: "Daily Scrum", role: "Project Lead", weight: 0.5 },
  { activity: "MOM Generation", role: "Project Lead", weight: 0.1 },
  { activity: "Risk Management", role: "Project Manager", weight: 0.2 },
  { activity: "Steering Committee Meeting", role: "Project Manager", weight: 0.2 },
];

const DELIVERY_ROLE_SPLIT = [
  { role: "Senior Consultant", share: 0.45 },
  { role: "Consultant", share: 0.35 },
  { role: "Senior Architect", share: 0.15 },
  { role: "Associate Consultant", share: 0.05 },
];

const RISK_FACTORS = [
  {
    key: "team-size",
    label: "Team Size",
    weight: 10.0,
    severity: "LOW" as const,
    note: "Large delivery team. More people means more coordination and communication effort — reflect that in the management and PMO allocation.",
  },
  {
    key: "historical-completion",
    label: "Historical Completion Rate",
    weight: 9.7,
    severity: "LOW" as const,
    note: "Similar past projects often ran long. Add schedule contingency and be conservative on the go-live date in the estimate.",
  },
  {
    key: "gsi-count",
    label: "Gsi Count",
    weight: 7.4,
    severity: "LOW" as const,
    note: "Gsi count is a significant driver of effort and risk for this project — review it when shaping the estimate.",
  },
  {
    key: "programme-size",
    label: "Programme Size",
    weight: 7.0,
    severity: "LOW" as const,
    note: "This is a large programme overall. Expect higher coordination and governance overhead than a mid-size project.",
  },
  {
    key: "total-tasks",
    label: "Total Tasks",
    weight: 6.5,
    severity: "LOW" as const,
    note: "A high task count increases planning and tracking overhead — keep the WBS granular but manageable.",
  },
];

const ML_PROJECT_COUNT = 11;
const ML_MODEL_VERSION = "v11.v3";
const ML_CONFIDENCE = 66;

function ceilToHalf(value: number) {
  if (!Number.isFinite(value) || value <= 0) return 0;
  return Math.ceil(value * 2) / 2;
}

function fmt(value: number, digits = 0) {
  if (!Number.isFinite(value)) return "0";
  return value.toLocaleString(undefined, { maximumFractionDigits: digits });
}

function hashKey(input: string) {
  let h1 = 0xdeadbeef ^ input.length;
  let h2 = 0x41c6ce57 ^ input.length;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 =
    Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^
    Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 =
    Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^
    Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const combined = (h2 >>> 0) * 4294967296 + (h1 >>> 0);
  return combined.toString(16).padStart(12, "0").slice(0, 12);
}

function DeltaBadge({ pct, invert = false }: { pct: number; invert?: boolean }) {
  const good = invert ? pct > 0 : pct < 0;
  const neutral = Math.abs(pct) < 0.05;
  return (
    <span
      className={cn(
        "rounded-md px-1.5 py-0.5 text-[11px] font-medium tabular-nums",
        neutral
          ? "bg-muted text-muted-foreground"
          : good
            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
            : "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-400"
      )}
    >
      {pct > 0 ? "+" : ""}
      {pct.toFixed(1)}%
    </span>
  );
}

export function EffortEstimateStep({
  inScopeGsis,
  driversProvided,
  driversTotal,
  durationWeeks,
  hoursPerDay,
  industry,
  orgMultiplier,
  selectedGsis = [],
  assumptions = [],
}: {
  inScopeGsis: number;
  driversProvided: number;
  driversTotal: number;
  durationWeeks: number;
  hoursPerDay: number;
  industry: string;
  orgMultiplier: number;
  selectedGsis?: GsiCatalogItem[];
  assumptions?: { field: string; default: string; reason: string }[];
}) {
  const [mode, setMode] = useState<"formula" | "ml" | "compare">("formula");
  const [showAudit, setShowAudit] = useState(false);
  const [computedSnapshot, setComputedSnapshot] = useState<
    null | { hash: string; inputsKey: string }
  >(null);
  const [locked, setLocked] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState<string | null>(null);
  const [showResourcePrediction, setShowResourcePrediction] = useState(false);
  const [predictionBasis, setPredictionBasis] = useState<"duration" | "team">("duration");
  const [targetDuration, setTargetDuration] = useState(String(durationWeeks));
  const [durationUnit, setDurationUnit] = useState<"weeks" | "months">("weeks");
  const [workingDaysPerWeek, setWorkingDaysPerWeek] = useState(String(WORK_DAYS_PER_WEEK));
  const [predictionHoursPerDay, setPredictionHoursPerDay] = useState(String(hoursPerDay));

  const rows = useMemo(() => {
    let cursor = 0;
    return PHASES.map((phase) => {
      const weeks = Math.round(durationWeeks * phase.pct * 10) / 10;
      const pmoHrs =
        Math.round(weeks * WORK_DAYS_PER_WEEK * hoursPerDay * PMO_UTILIZATION * 100) / 100;
      const deliveryHrs = phase.hasDelivery
        ? Math.round(inScopeGsis * orgMultiplier * phase.deliveryPerGsi * 100) / 100
        : 0;
      const totalHrs = Math.round((pmoHrs + deliveryHrs) * 100) / 100;
      const capacity = weeks * WORK_DAYS_PER_WEEK * hoursPerDay * PEAK_FTE_UTILIZATION || 1;
      const peakFte = ceilToHalf(totalHrs / capacity);
      const start = cursor;
      const end = cursor + weeks;
      cursor = end;
      return { ...phase, weeks, pmoHrs, deliveryHrs, totalHrs, peakFte, capacity, start, end };
    });
  }, [durationWeeks, hoursPerDay, inScopeGsis, orgMultiplier]);

  const totalPmo = rows.reduce((sum, r) => sum + r.pmoHrs, 0);
  const totalDelivery = rows.reduce((sum, r) => sum + r.deliveryHrs, 0);
  const totalEffort = totalPmo + totalDelivery;
  const peakFte = Math.max(...rows.map((r) => r.peakFte));
  const maxPhaseHrs = Math.max(...rows.map((r) => r.totalHrs), 1);
  const personDays = totalEffort / (hoursPerDay || 8);

  const currentInputsKey = JSON.stringify({
    inScopeGsis,
    durationWeeks,
    hoursPerDay,
    orgMultiplier,
    driversProvided,
  });
  const mastersUpdated = computedSnapshot !== null && computedSnapshot.inputsKey !== currentInputsKey;

  function handleCompute() {
    setComputedSnapshot({ hash: hashKey(currentInputsKey), inputsKey: currentInputsKey });
    setVerifyMessage(null);
  }

  function handleVerify() {
    if (!computedSnapshot) return;
    const liveHash = hashKey(currentInputsKey);
    if (liveHash === computedSnapshot.hash) {
      setVerifyMessage("Deterministic — recomputing from the same inputs reproduces this exact hash.");
    } else {
      setVerifyMessage("Inputs changed since this snapshot — hash differs. Recompute to verify.");
    }
  }

  // Role/activity hour allocation, shared by Resource Plan + FTE Loading.
  const roleHourEntries = useMemo(() => {
    const entries: {
      phaseKey: string;
      phaseLabel: string;
      activity: string;
      role: string;
      team: "Delivery" | "PMO";
      hours: number;
      capacity: number;
      sourceItems: number;
    }[] = [];
    for (const r of rows) {
      for (const { activity, role, weight } of PMO_ACTIVITIES) {
        entries.push({
          phaseKey: r.key,
          phaseLabel: r.label,
          activity,
          role,
          team: "PMO",
          hours: r.pmoHrs * weight,
          capacity: r.capacity,
          sourceItems: 1,
        });
      }
      if (r.hasDelivery) {
        for (const { role, share } of DELIVERY_ROLE_SPLIT) {
          entries.push({
            phaseKey: r.key,
            phaseLabel: r.label,
            activity: "GSI Delivery Work",
            role,
            team: "Delivery",
            hours: r.deliveryHrs * share,
            capacity: r.capacity,
            sourceItems: selectedGsis.length || inScopeGsis || 1,
          });
        }
      }
    }
    return entries;
  }, [rows, selectedGsis.length, inScopeGsis]);

  const deliveryTeamSummary = useMemo(() => {
    const roles = Array.from(new Set(DELIVERY_ROLE_SPLIT.map((d) => d.role)));
    return roles.map((role) => {
      const byPhase: Record<string, number> = {};
      let total = 0;
      let peak = 0;
      for (const r of rows.filter((row) => row.hasDelivery)) {
        const hrs = roleHourEntries
          .filter((e) => e.team === "Delivery" && e.role === role && e.phaseKey === r.key)
          .reduce((sum, e) => sum + e.hours, 0);
        byPhase[r.key] = hrs;
        total += hrs;
        peak = Math.max(peak, ceilToHalf(hrs / r.capacity));
      }
      return {
        role,
        explore: byPhase.explore ?? 0,
        realize: byPhase.realize ?? 0,
        deploy: byPhase.deploy ?? 0,
        total,
        peak,
        pctDelivery: totalDelivery > 0 ? (total / totalDelivery) * 100 : 0,
      };
    });
  }, [rows, roleHourEntries, totalDelivery]);

  const pmoTeamSummary = useMemo(() => {
    const roles = Array.from(new Set(PMO_ACTIVITIES.map((p) => p.role)));
    const discover = rows.find((r) => r.key === "discover")!;
    const prepare = rows.find((r) => r.key === "prepare")!;
    const explore = rows.find((r) => r.key === "explore")!;
    const realize = rows.find((r) => r.key === "realize")!;
    const deploy = rows.find((r) => r.key === "deploy")!;
    const run = rows.find((r) => r.key === "run")!;
    return roles.map((role) => {
      const hoursIn = (phaseKey: string) =>
        roleHourEntries
          .filter((e) => e.team === "PMO" && e.role === role && e.phaseKey === phaseKey)
          .reduce((sum, e) => sum + e.hours, 0);
      const discPrep = hoursIn("discover") + hoursIn("prepare");
      const exploreHrs = hoursIn("explore");
      const realizeHrs = hoursIn("realize");
      const deployRun = hoursIn("deploy") + hoursIn("run");
      const total = discPrep + exploreHrs + realizeHrs + deployRun;
      const discPrepCap = discover.capacity + prepare.capacity;
      const deployRunCap = deploy.capacity + run.capacity;
      const peak = Math.max(
        ceilToHalf(discPrep / discPrepCap),
        ceilToHalf(exploreHrs / explore.capacity),
        ceilToHalf(realizeHrs / realize.capacity),
        ceilToHalf(deployRun / deployRunCap)
      );
      return { role, discPrep, explore: exploreHrs, realize: realizeHrs, deployRun, total, peak };
    });
  }, [rows, roleHourEntries]);

  const roleFteByPhase = useMemo(() => {
    const roles = [
      ...DELIVERY_ROLE_SPLIT.map((d) => ({ role: d.role, team: "Delivery" as const })),
      ...Array.from(new Set(PMO_ACTIVITIES.map((p) => p.role))).map((role) => ({
        role,
        team: "PMO" as const,
      })),
    ];
    return roles.map(({ role, team }) => {
      const cells = rows.map((r) => {
        const hrs = roleHourEntries
          .filter((e) => e.role === role && e.team === team && e.phaseKey === r.key)
          .reduce((sum, e) => sum + e.hours, 0);
        return ceilToHalf(hrs / r.capacity);
      });
      return { role, team, cells };
    });
  }, [rows, roleHourEntries]);

  const moduleRows = useMemo(() => {
    const moduleMap = new Map<string, number>();
    for (const item of selectedGsis) {
      moduleMap.set(item.businessArea, (moduleMap.get(item.businessArea) ?? 0) + 1);
    }
    const totalActive = selectedGsis.length;
    const exploreRow = rows.find((r) => r.key === "explore")!;
    const realizeRow = rows.find((r) => r.key === "realize")!;
    const deployRow = rows.find((r) => r.key === "deploy")!;
    return Array.from(moduleMap.entries()).map(([module, count]) => {
      const share = totalActive > 0 ? count / totalActive : 0;
      const explore = exploreRow.deliveryHrs * share;
      const realize = realizeRow.deliveryHrs * share;
      const deploy = deployRow.deliveryHrs * share;
      return { module, count, explore, realize, deploy, total: explore + realize + deploy };
    });
  }, [selectedGsis, rows]);

  const complexityLabel = useMemo(() => {
    if (selectedGsis.length === 0) return "L";
    const order = { L: 0, M: 1, H: 2 } as const;
    const worst = selectedGsis.reduce(
      (acc, item) => (order[item.defaultComplexity] > order[acc] ? item.defaultComplexity : acc),
      "L" as "L" | "M" | "H"
    );
    return worst;
  }, [selectedGsis]);

  // Resource prediction calculator
  const targetWeeks = useMemo(() => {
    const n = Number(targetDuration) || durationWeeks || 1;
    return durationUnit === "weeks" ? n : n * 4.345;
  }, [targetDuration, durationUnit, durationWeeks]);
  const predWorkingDays = Number(workingDaysPerWeek) || WORK_DAYS_PER_WEEK;
  const predHoursPerDay = Number(predictionHoursPerDay) || hoursPerDay || 8;
  const predCapacityPerson = predWorkingDays * predHoursPerDay * targetWeeks;
  const predictionRows = rows.map((r) => {
    const phaseTargetWeeks = durationWeeks > 0 ? (r.weeks / durationWeeks) * targetWeeks : r.pct * targetWeeks;
    const phaseCapacity = predWorkingDays * predHoursPerDay * phaseTargetWeeks || 1;
    return {
      ...r,
      targetWeeks: Math.round(phaseTargetWeeks * 10) / 10,
      capacityPerson: phaseCapacity,
      phasePeakFte: ceilToHalf(r.totalHrs / phaseCapacity),
    };
  });

  // ---- ML Prediction (illustrative model) ----
  const mlP50 = Math.round(Math.max(1200, (inScopeGsis || 1) * 900 + durationWeeks * 180));
  const mlP75 = Math.round(mlP50 * 1.294);
  const mlP90 = Math.round(mlP50 * 2.893);
  const mlPeakTeamP50 = Math.max(2, Math.round(mlP50 / 2600));
  const mlWeeksP50 = Math.round((mlP50 / (mlPeakTeamP50 * hoursPerDay * WORK_DAYS_PER_WEEK)) * 10) / 10;
  const mlWeeksP75 = Math.round(mlWeeksP50 * 1.15 * 10) / 10;
  const mlWeeksP90 = Math.round(mlWeeksP50 * 1.3 * 10) / 10;
  const mlTeamP75 = Math.round(mlPeakTeamP50 * 1.17 * 10) / 10;
  const mlTeamP90 = Math.round(mlPeakTeamP50 * 1.67 * 10) / 10;
  const mlPersonDaysP50 = mlP50 / (hoursPerDay || 8);
  const mlPersonDaysP75 = mlP75 / (hoursPerDay || 8);
  const mlPersonDaysP90 = mlP90 / (hoursPerDay || 8);
  const mlPhaseRows = PHASES.map((p) => {
    const mlHrs = mlP50 * p.mlPct;
    const gsiMh = mlHrs * 0.7;
    const pmoMh = mlHrs * 0.3;
    return {
      key: p.key,
      label: p.label,
      mlPct: p.mlPct * 100,
      mlHrs,
      mlPersonDays: mlHrs / (hoursPerDay || 8),
      gsiMh,
      pmoMh,
    };
  });
  const mlEffortDensity = mlP50 / Math.max(1, inScopeGsis);
  const mlSpreadWeeks = mlWeeksP90 - mlWeeksP50;
  const mlSpreadPct = mlWeeksP50 > 0 ? (mlSpreadWeeks / mlWeeksP50) * 100 : 0;
  const mlRiskLevel = mlSpreadPct > 50 ? "HIGH" : mlSpreadPct > 20 ? "MEDIUM" : "LOW";
  const mlPersonDaysP50Rounded = Math.round(mlPersonDaysP50);
  const waveCount =
    mlPersonDaysP50Rounded < 5000 ? 1 : mlPersonDaysP50Rounded < 20000 ? 2 : mlPersonDaysP50Rounded < 80000 ? 3 : 5;
  const maxMlPhaseHrs = Math.max(...mlPhaseRows.map((r) => r.mlHrs), 1);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="bg-gradient-to-r from-primary to-neutral-900 bg-clip-text text-base font-semibold text-transparent dark:to-neutral-100">Estimation Mode</h2>
            <span className="rounded-md border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[11px] font-medium text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400">
              ML ready
            </span>
          </div>
          <Tabs
            value={mode}
            onValueChange={(value) => setMode(value as "formula" | "ml" | "compare")}
            className="w-full sm:w-auto"
          >
            <TabsList className="grid h-10 w-full grid-cols-1 p-1 sm:w-[440px] sm:grid-cols-3">
              <TabsTrigger value="formula">Formula (KDM)</TabsTrigger>
              <TabsTrigger value="ml">ML Prediction</TabsTrigger>
              <TabsTrigger value="compare">Compare Both</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {mode === "formula" &&
            "Using the deterministic KDM formula engine. All effort values are reproducible from the frozen master snapshot."}
          {mode === "ml" &&
            `Using ML models trained on historical KaarTech projects. Shows P50/P75/P90 ranges.`}
          {mode === "compare" && "Side-by-side comparison · Formula (KDM) vs ML Prediction"}
        </p>
      </div>

      {mode === "formula" && (
        <>
          <div className="border-t border-border pt-6">
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
                <Button type="button" size="sm" onClick={handleCompute}>
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

            {computedSnapshot && mastersUpdated && (
              <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300">
                <span className="font-medium">Inputs updated</span> since this estimate was
                computed. The estimate is frozen against its snapshot — recompute to fold the
                changes in.
              </p>
            )}

            <button
              type="button"
              onClick={() => setShowAudit((v) => !v)}
              className={cn(
                "mt-3 flex w-full items-center justify-between rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted",
                showAudit && "rounded-b-none border-b-0"
              )}
            >
              <span className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
                Advanced audit controls
              </span>
              <CaretDown
                className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform",
                  showAudit && "rotate-180"
                )}
              />
            </button>
            {showAudit && (
              <div className="rounded-b-lg border border-t-0 border-border bg-muted/40 px-3 py-2.5 text-xs text-muted-foreground">
                <p>
                  Org Multiplier:{" "}
                  <span className="tabular-nums text-foreground">{orgMultiplier.toFixed(4)}</span>{" "}
                  · Hours/Day: <span className="tabular-nums text-foreground">{hoursPerDay}</span>{" "}
                  · PMO utilization: {Math.round(PMO_UTILIZATION * 100)}% · Peak FTE utilization:{" "}
                  {Math.round(PEAK_FTE_UTILIZATION * 100)}%
                </p>
                {computedSnapshot && (
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span>
                      Snapshot hash{" "}
                      <span className="rounded bg-background px-1.5 py-0.5 font-mono text-foreground">
                        {computedSnapshot.hash}
                      </span>
                    </span>
                    <Button type="button" size="sm" variant="outline" onClick={handleVerify}>
                      Verify determinism
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={locked ? "secondary" : "outline"}
                      onClick={() => setLocked(true)}
                    >
                      {locked ? "Baseline locked" : "Lock as baseline"}
                    </Button>
                  </div>
                )}
                {verifyMessage && <p className="mt-1.5 text-foreground">{verifyMessage}</p>}
                {!computedSnapshot && (
                  <p className="mt-1.5">Click Compute Estimate to generate a snapshot hash.</p>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 border-t border-border pt-6 sm:grid-cols-3">
            <Card className="gap-1 border-primary/30 bg-gradient-to-br from-primary/10 to-primary/0 py-5 ring-primary/20 sm:col-span-1">
              <CardHeader className="gap-1 px-4">
                <div className="flex items-center gap-1.5">
                  <CardDescription className="text-xs font-semibold tracking-wide text-primary/80 uppercase">
                    Total Effort
                  </CardDescription>
                  <FieldHelp text="Total Effort = sum of PMO hours + Delivery hours across all six phases." />
                </div>
                <CardTitle className="text-4xl font-bold tabular-nums text-primary">
                  {fmt(totalEffort)}
                  <span className="ml-1 text-lg font-medium text-primary/70">hrs</span>
                </CardTitle>
              </CardHeader>
              <p className="px-4 text-xs text-muted-foreground">
                man-hours · org mult {orgMultiplier.toFixed(4)}
              </p>
            </Card>
            <Card className="gap-1 py-4">
              <CardHeader className="gap-1 px-4">
                <div className="flex items-center gap-1.5">
                  <CardDescription className="text-xs font-medium tracking-wide uppercase">
                    Delivery vs PMO
                  </CardDescription>
                  <FieldHelp text="Delivery hours come from in-scope GSI work in Explore/Realize/Deploy. PMO hours are governance overhead spread across all six phases." />
                </div>
                <CardTitle className="text-2xl font-semibold tabular-nums">
                  {fmt(totalDelivery)} / {fmt(totalPmo)}
                </CardTitle>
              </CardHeader>
              <p className="px-4 text-xs text-muted-foreground">Delivery / PMO man-hours</p>
            </Card>
            <Card className="gap-1 py-4">
              <CardHeader className="gap-1 px-4">
                <div className="flex items-center gap-1.5">
                  <CardDescription className="text-xs font-medium tracking-wide uppercase">
                    Peak FTE
                  </CardDescription>
                  <FieldHelp text="Peak FTE is each phase's own FTE = CEILING(phase hrs / (phase weeks × 5 × hrs/day × 0.75), 0.5). Peak FTE shown is the max across all phases." />
                </div>
                <CardTitle className="text-2xl font-semibold tabular-nums">{peakFte}</CardTitle>
              </CardHeader>
              <p className="px-4 text-xs text-muted-foreground">
                at {rows.find((r) => r.peakFte === peakFte)?.label ?? "—"}
              </p>
            </Card>
          </div>

          <div className="border-t border-border pt-6">
            <div className="flex items-center gap-1.5">
              <h2 className="text-base font-semibold text-card-foreground">Effort by Phase</h2>
              <FieldHelp text="Bar length is based on total man-hours per phase (PMO in gray, Delivery colored per phase)." />
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
                            className={cn("h-full", row.barClass)}
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

          <div className="border-t border-border pt-6">
            <div className="flex items-center gap-1.5">
              <h2 className="text-base font-semibold text-card-foreground">
                Module Summary — Scope, Hours
              </h2>
              <FieldHelp text="Delivery man-hours by SAP Activate phase, allocated across in-scope modules by their share of active GSIs." />
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Delivery man-hours by SAP Activate phase · Org Mult {orgMultiplier.toFixed(4)} ·
              Complexity {complexityLabel}
            </p>
            <p className="text-xs text-muted-foreground">
              Module scope is GSI-delivery focused, so it rolls up module effort across Explore,
              Realize, and Deploy rather than the full project timeline.
            </p>

            {moduleRows.length === 0 ? (
              <p className="mt-3 rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                No modules in scope yet — select GSIs in Step 2 to see module-level hours here.
              </p>
            ) : (
              <div className="mt-3 overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50 text-xs text-muted-foreground">
                      <th className="px-3 py-2 text-left font-medium">Module</th>
                      <th className="px-3 py-2 text-left font-medium">In Scope</th>
                      <th className="px-3 py-2 text-right font-medium">Active GSIs</th>
                      <th className="px-3 py-2 text-right font-medium">Explore</th>
                      <th className="px-3 py-2 text-right font-medium">Realize</th>
                      <th className="px-3 py-2 text-right font-medium">Deploy</th>
                      <th className="px-3 py-2 text-right font-medium">Total Hrs</th>
                    </tr>
                  </thead>
                  <tbody>
                    {moduleRows.map((m) => (
                      <tr key={m.module} className="border-b border-border">
                        <td className="px-3 py-2.5 font-medium text-foreground">{m.module}</td>
                        <td className="px-3 py-2.5 text-emerald-600 dark:text-emerald-400">Yes</td>
                        <td className="px-3 py-2.5 text-right tabular-nums text-primary">
                          {m.count}
                        </td>
                        <td className="px-3 py-2.5 text-right tabular-nums text-muted-foreground">
                          {m.explore.toFixed(2)}
                        </td>
                        <td className="px-3 py-2.5 text-right tabular-nums text-muted-foreground">
                          {m.realize.toFixed(2)}
                        </td>
                        <td className="px-3 py-2.5 text-right tabular-nums text-muted-foreground">
                          {m.deploy.toFixed(2)}
                        </td>
                        <td className="px-3 py-2.5 text-right font-medium tabular-nums text-foreground">
                          {m.total.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-emerald-50/50 dark:bg-emerald-950/20">
                      <td colSpan={3} className="px-3 py-2.5 font-semibold text-foreground">
                        Total (All Modules · Delivery)
                      </td>
                      <td className="px-3 py-2.5 text-right font-semibold tabular-nums text-foreground">
                        {moduleRows.reduce((s, m) => s + m.explore, 0).toFixed(2)}
                      </td>
                      <td className="px-3 py-2.5 text-right font-semibold tabular-nums text-foreground">
                        {moduleRows.reduce((s, m) => s + m.realize, 0).toFixed(2)}
                      </td>
                      <td className="px-3 py-2.5 text-right font-semibold tabular-nums text-foreground">
                        {moduleRows.reduce((s, m) => s + m.deploy, 0).toFixed(2)}
                      </td>
                      <td className="px-3 py-2.5 text-right font-semibold tabular-nums text-foreground">
                        {moduleRows.reduce((s, m) => s + m.total, 0).toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {moduleRows.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-medium text-muted-foreground">Module Scope Status</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {moduleRows.map((m) => (
                    <Badge
                      key={m.module}
                      variant="outline"
                      className="rounded-md border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400"
                    >
                      {m.module}: {m.count} active GSI{m.count === 1 ? "" : "s"}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-border pt-6">
            <div className="flex items-center gap-1.5">
              <h2 className="text-base font-semibold text-card-foreground">
                Executive Summary — Phase Breakdown (man-hours)
              </h2>
              <FieldHelp text="PMO Hrs + Delivery Hrs = Total Hrs per phase; % of Total is that phase's share of overall effort." />
            </div>
            <div className="mt-3 overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50 text-xs text-muted-foreground">
                    <th className="px-3 py-2 text-left font-medium">Phase</th>
                    <th className="px-3 py-2 text-right font-medium">PMO Hrs</th>
                    <th className="px-3 py-2 text-right font-medium">Delivery Hrs</th>
                    <th className="px-3 py-2 text-right font-medium">Total Hrs</th>
                    <th className="px-3 py-2 text-right font-medium">% of Total</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    const pct = totalEffort > 0 ? (row.totalHrs / totalEffort) * 100 : 0;
                    return (
                      <tr key={row.key} className="border-b border-border">
                        <td className="px-3 py-2.5 font-medium text-primary">{row.label}</td>
                        <td className="px-3 py-2.5 text-right tabular-nums text-foreground">
                          {row.pmoHrs.toFixed(2)}
                        </td>
                        <td className="px-3 py-2.5 text-right tabular-nums text-foreground">
                          {row.deliveryHrs.toFixed(2)}
                        </td>
                        <td className="px-3 py-2.5 text-right font-medium tabular-nums text-foreground">
                          {row.totalHrs.toFixed(2)}
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center justify-end gap-2">
                            <span className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                              <span
                                className="block h-full bg-primary"
                                style={{ width: `${Math.min(pct, 100)}%` }}
                              />
                            </span>
                            <span className="w-12 text-right tabular-nums text-foreground">
                              {pct.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="bg-emerald-50/50 dark:bg-emerald-950/20">
                    <td className="px-3 py-2.5 font-semibold text-foreground">Total</td>
                    <td className="px-3 py-2.5 text-right font-semibold tabular-nums text-foreground">
                      {totalPmo.toFixed(2)}
                    </td>
                    <td className="px-3 py-2.5 text-right font-semibold tabular-nums text-foreground">
                      {totalDelivery.toFixed(2)}
                    </td>
                    <td className="px-3 py-2.5 text-right font-semibold tabular-nums text-foreground">
                      {totalEffort.toFixed(2)}
                    </td>
                    <td className="px-3 py-2.5 text-right font-semibold tabular-nums text-foreground">
                      100%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="border-t border-border pt-6">
            <div className="flex items-center gap-1.5">
              <h2 className="text-base font-semibold text-card-foreground">
                Phase Timeline &amp; Schedule
              </h2>
              <FieldHelp text="Start/end weeks are cumulative across the six SAP Activate phases based on their share of total duration." />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
              {rows.map((row) => (
                <div key={row.key} className="rounded-lg border border-border px-3 py-2.5">
                  <p className="text-xs font-medium text-foreground">{row.label}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    Wk {row.start.toFixed(1)}-{row.end.toFixed(1)}
                  </p>
                  <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-muted">
                    <span
                      className="block h-full rounded-full bg-primary"
                      style={{ width: durationWeeks > 0 ? `${(row.weeks / durationWeeks) * 100}%` : "0%" }}
                    />
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-3 overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50 text-xs text-muted-foreground">
                    <th className="px-3 py-2 text-left font-medium">Phase</th>
                    <th className="px-3 py-2 text-right font-medium">Start Wk</th>
                    <th className="px-3 py-2 text-right font-medium">End Wk</th>
                    <th className="px-3 py-2 text-right font-medium">Duration</th>
                    <th className="px-3 py-2 text-right font-medium">PMO Hrs</th>
                    <th className="px-3 py-2 text-right font-medium">Delivery Hrs</th>
                    <th className="px-3 py-2 text-right font-medium">Total Hrs</th>
                    <th className="px-3 py-2 text-right font-medium">Peak FTE</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.key} className="border-b border-border">
                      <td className="px-3 py-2.5 font-medium text-primary">{row.label}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-foreground">
                        {row.start.toFixed(1)}
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-foreground">
                        {row.end.toFixed(1)}
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-foreground">
                        {row.weeks}w
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-foreground">
                        {row.pmoHrs.toFixed(2)}
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-foreground">
                        {row.deliveryHrs.toFixed(2)}
                      </td>
                      <td className="px-3 py-2.5 text-right font-medium tabular-nums text-foreground">
                        {row.totalHrs.toFixed(2)}
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-primary">
                        {row.peakFte}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              Peak FTE is each phase&rsquo;s own FTE = CEILING(phase hrs / (phase weeks × 5 ×
              hrs/day × 0.75), 0.5).
            </p>
          </div>

          <div className="border-t border-border pt-6">
            <div className="flex items-center gap-1.5">
              <h2 className="text-base font-semibold text-card-foreground">
                Resource Plan — FTE by Role &amp; Team
              </h2>
              <FieldHelp text="Roles come from a sample Activity → Role mapping (PMO governance activities plus a Delivery role split of GSI work) since the full Activity Effort master isn't loaded yet." />
            </div>

            <div className="mt-3 rounded-lg border border-border">
              <p className="border-b border-border bg-muted/50 px-3 py-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Activity Role Effort
              </p>
              <p className="border-b border-border bg-muted/20 px-3 py-1.5 text-[11px] text-muted-foreground">
                Grouped from estimate detail lines. Role / grade mapping is a sample reference.
              </p>
              <div className="max-h-72 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-white dark:bg-gray-900">
                    <tr className="border-b border-border text-xs text-muted-foreground">
                      <th className="px-3 py-2 text-left font-medium">Phase</th>
                      <th className="px-3 py-2 text-left font-medium">Activity</th>
                      <th className="px-3 py-2 text-left font-medium">Role</th>
                      <th className="px-3 py-2 text-right font-medium">Effort Hrs</th>
                      <th className="px-3 py-2 text-right font-medium">FTE</th>
                      <th className="px-3 py-2 text-right font-medium">Source Items</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roleHourEntries.map((e, i) => (
                      <tr key={`${e.phaseKey}-${e.role}-${e.activity}-${i}`} className="border-b border-border">
                        <td className="px-3 py-2 text-primary">{e.phaseLabel}</td>
                        <td className="px-3 py-2 text-foreground">{e.activity}</td>
                        <td className="px-3 py-2 text-muted-foreground">{e.role}</td>
                        <td className="px-3 py-2 text-right font-medium tabular-nums text-foreground">
                          {e.hours.toFixed(2)}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums text-primary">
                          {ceilToHalf(e.hours / e.capacity)}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums text-primary">
                          {e.sourceItems}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <p className="mt-4 text-xs font-medium text-muted-foreground uppercase">
              Summary — Delivery Team
            </p>
            <div className="mt-1.5 overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50 text-xs text-muted-foreground">
                    <th className="px-3 py-2 text-left font-medium">Role</th>
                    <th className="px-3 py-2 text-right font-medium">Explore</th>
                    <th className="px-3 py-2 text-right font-medium">Realize</th>
                    <th className="px-3 py-2 text-right font-medium">Deploy</th>
                    <th className="px-3 py-2 text-right font-medium">Total Hrs</th>
                    <th className="px-3 py-2 text-right font-medium">Peak FTE</th>
                    <th className="px-3 py-2 text-right font-medium">% Delivery</th>
                  </tr>
                </thead>
                <tbody>
                  {deliveryTeamSummary.map((r) => (
                    <tr key={r.role} className="border-b border-border">
                      <td className="px-3 py-2.5 font-medium text-foreground">{r.role}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-foreground">
                        {r.explore.toFixed(2)}
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-foreground">
                        {r.realize.toFixed(2)}
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-foreground">
                        {r.deploy.toFixed(2)}
                      </td>
                      <td className="px-3 py-2.5 text-right font-medium tabular-nums text-foreground">
                        {r.total.toFixed(2)}
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-primary">{r.peak}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-foreground">
                        {r.pctDelivery.toFixed(0)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mt-4 text-xs font-medium text-muted-foreground uppercase">
              Summary — PMO Team
            </p>
            <div className="mt-1.5 overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50 text-xs text-muted-foreground">
                    <th className="px-3 py-2 text-left font-medium">Role</th>
                    <th className="px-3 py-2 text-right font-medium">Disc+Prep</th>
                    <th className="px-3 py-2 text-right font-medium">Explore</th>
                    <th className="px-3 py-2 text-right font-medium">Realize</th>
                    <th className="px-3 py-2 text-right font-medium">Deploy+Run</th>
                    <th className="px-3 py-2 text-right font-medium">Total Hrs</th>
                    <th className="px-3 py-2 text-right font-medium">Peak FTE</th>
                  </tr>
                </thead>
                <tbody>
                  {pmoTeamSummary.map((r) => (
                    <tr key={r.role} className="border-b border-border">
                      <td className="px-3 py-2.5 font-medium text-foreground">{r.role}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-foreground">
                        {r.discPrep.toFixed(2)}
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-foreground">
                        {r.explore.toFixed(2)}
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-foreground">
                        {r.realize.toFixed(2)}
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-foreground">
                        {r.deployRun.toFixed(2)}
                      </td>
                      <td className="px-3 py-2.5 text-right font-medium tabular-nums text-foreground">
                        {r.total.toFixed(2)}
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-primary">{r.peak}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 rounded-lg border border-border p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-card-foreground">
                    Resource Prediction
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Estimate consultant need for a target duration or available team size.
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  {showResourcePrediction && (
                    <>
                      <Button type="button" variant="outline" size="sm">
                        Export Excel
                      </Button>
                      <Button type="button" variant="outline" size="sm">
                        Export PDF
                      </Button>
                    </>
                  )}
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setShowResourcePrediction((v) => !v)}
                  >
                    {showResourcePrediction ? "Hide Resource Prediction" : "Show Resource Prediction"}
                  </Button>
                </div>
              </div>

              {showResourcePrediction && (
                <div className="mt-4">
                  <p className="text-xs text-muted-foreground">
                    Formula: FTE = Effort hours / (weeks × working days × hrs/day). Phase Peak
                    FTE is the staffing peak inside each phase.
                  </p>

                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-muted-foreground">Prediction basis</label>
                      <Select
                        value={predictionBasis}
                        onValueChange={(v) => setPredictionBasis(v as "duration" | "team")}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="duration">Target duration</SelectItem>
                          <SelectItem value="team">Available team size</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-muted-foreground">Target duration</label>
                      <Input
                        type="number"
                        min={1}
                        value={targetDuration}
                        onChange={(e) => setTargetDuration(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-muted-foreground">Duration unit</label>
                      <Select
                        value={durationUnit}
                        onValueChange={(v) => setDurationUnit(v as "weeks" | "months")}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weeks">Weeks</SelectItem>
                          <SelectItem value="months">Months</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-muted-foreground">Working days/week</label>
                      <Input
                        type="number"
                        min={1}
                        max={7}
                        value={workingDaysPerWeek}
                        onChange={(e) => setWorkingDaysPerWeek(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-muted-foreground">Hours/day</label>
                      <Input
                        type="number"
                        min={1}
                        max={24}
                        value={predictionHoursPerDay}
                        onChange={(e) => setPredictionHoursPerDay(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="rounded-lg border border-border px-4 py-3">
                      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                        Effort Required
                      </p>
                      <p className="mt-1 text-sm font-semibold tabular-nums text-foreground">
                        {fmt(totalEffort)} hrs
                      </p>
                    </div>
                    <div className="rounded-lg border border-border px-4 py-3">
                      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                        Adjusted Duration
                      </p>
                      <p className="mt-1 text-sm font-semibold tabular-nums text-foreground">
                        {targetWeeks.toFixed(1)} weeks
                      </p>
                    </div>
                    <div className="rounded-lg border border-border px-4 py-3">
                      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                        Capacity / Person
                      </p>
                      <p className="mt-1 text-sm font-semibold tabular-nums text-foreground">
                        {fmt(predCapacityPerson)} hrs
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 overflow-x-auto rounded-lg border border-border">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border bg-muted/50 text-xs text-muted-foreground">
                          <th className="px-3 py-2 text-left font-medium">Phase</th>
                          <th className="px-3 py-2 text-right font-medium">Effort Hrs</th>
                          <th className="px-3 py-2 text-right font-medium">Target Weeks</th>
                          <th className="px-3 py-2 text-right font-medium">Capacity / Person</th>
                          <th className="px-3 py-2 text-right font-medium">Phase Peak FTE</th>
                        </tr>
                      </thead>
                      <tbody>
                        {predictionRows.map((row) => (
                          <tr key={row.key} className="border-b border-border">
                            <td className="px-3 py-2.5 font-medium text-primary">{row.label}</td>
                            <td className="px-3 py-2.5 text-right tabular-nums text-foreground">
                              {row.totalHrs.toFixed(2)}
                            </td>
                            <td className="px-3 py-2.5 text-right tabular-nums text-foreground">
                              {row.targetWeeks}
                            </td>
                            <td className="px-3 py-2.5 text-right tabular-nums text-foreground">
                              {fmt(row.capacityPerson)}
                            </td>
                            <td className="px-3 py-2.5 text-right tabular-nums text-primary">
                              {row.phasePeakFte}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <p className="mt-4 text-xs font-medium text-muted-foreground uppercase">
              Phase-wise FTE Loading
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Compact role staffing summary for each predicted phase.
            </p>
            <div className="mt-1.5 overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50 text-xs text-muted-foreground">
                    <th className="px-3 py-2 text-left font-medium">Team</th>
                    <th className="px-3 py-2 text-left font-medium">Role</th>
                    {rows.map((r) => (
                      <th key={r.key} className="px-3 py-2 text-right font-medium">
                        {r.label.replace(/^\d+\.\s*/, "")}
                        <br />
                        <span className="font-normal">
                          Wk{r.start.toFixed(0)}-{r.end.toFixed(0)}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {roleFteByPhase.map((r) => (
                    <tr key={`${r.team}-${r.role}`} className="border-b border-border">
                      <td className="px-3 py-2.5 text-muted-foreground">{r.team}</td>
                      <td className="px-3 py-2.5 font-medium text-foreground">{r.role}</td>
                      {r.cells.map((v, i) => (
                        <td key={i} className="px-3 py-2.5 text-right tabular-nums text-foreground">
                          {v > 0 ? v : "–"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="border-t border-border pt-6">
            <div className="flex items-center gap-1.5">
              <h2 className="text-base font-semibold text-card-foreground">
                Assumptions &amp; Defaults ({assumptions.length})
              </h2>
              <FieldHelp text="Org-Complexity drivers left blank fall back to a Low default (multiplier 1.0) so the estimate can still run end to end." />
            </div>
            {assumptions.length === 0 ? (
              <p className="mt-3 rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                All drivers have been provided — no defaults were applied.
              </p>
            ) : (
              <div className="mt-3 overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50 text-xs text-muted-foreground">
                      <th className="px-3 py-2 text-left font-medium">Field</th>
                      <th className="px-3 py-2 text-left font-medium">Default</th>
                      <th className="px-3 py-2 text-left font-medium">Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assumptions.map((a) => (
                      <tr key={a.field} className="border-b border-border">
                        <td className="px-3 py-2.5 font-mono text-[12px] text-foreground">
                          {a.field}
                        </td>
                        <td className="px-3 py-2.5 text-foreground">{a.default}</td>
                        <td className="px-3 py-2.5 text-muted-foreground">{a.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {mode === "ml" && (
        <div className="border-t border-border pt-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">
              ML Prediction Report · {ML_MODEL_VERSION} · {ML_PROJECT_COUNT} projects
            </p>
            <Button type="button" variant="outline" size="sm">
              Export Excel
            </Button>
          </div>

          <div className="mt-4 rounded-lg border border-border bg-muted/50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-card-foreground">ML Prediction</h3>
              <Badge className="rounded-md border-amber-200 bg-amber-50 px-1.5 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-400">
                {ML_CONFIDENCE}% confidence · MEDIUM
              </Badge>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Trained on {ML_PROJECT_COUNT} projects. Add more project data to improve accuracy.
            </p>

            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-lg border border-border bg-background px-4 py-3">
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Total Effort
                </p>
                <p className="mt-1 text-xl font-semibold tabular-nums text-primary">
                  {fmt(mlP50)} mh
                </p>
                <p className="text-[11px] text-muted-foreground">{fmt(mlPersonDaysP50)} man-days</p>
                <div className="mt-1.5 flex gap-1">
                  <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                    P75 {fmt(mlP75)} mh
                  </span>
                  <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                    P90 {fmt(mlP90)} mh
                  </span>
                </div>
              </div>
              <div className="rounded-lg border border-border bg-background px-4 py-3">
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Duration
                </p>
                <p className="mt-1 text-xl font-semibold tabular-nums text-primary">
                  {mlWeeksP50} weeks
                </p>
                <div className="mt-1.5 flex gap-1">
                  <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                    P75 {mlWeeksP75} weeks
                  </span>
                  <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                    P90 {mlWeeksP90} weeks
                  </span>
                </div>
              </div>
              <div className="rounded-lg border border-border bg-background px-4 py-3">
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Peak Team Size
                </p>
                <p className="mt-1 text-xl font-semibold tabular-nums text-primary">
                  {mlPeakTeamP50.toFixed(1)} FTE
                </p>
                <p className="text-[11px] text-muted-foreground">{mlPeakTeamP50} persons</p>
                <div className="mt-1.5 flex gap-1">
                  <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                    P75 {mlTeamP75.toFixed(1)} FTE
                  </span>
                  <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                    P90 {mlTeamP90.toFixed(1)} FTE
                  </span>
                </div>
              </div>
              <div className="rounded-lg border border-border bg-background px-4 py-3">
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Prediction Confidence
                </p>
                <p className="mt-1 text-xl font-semibold tabular-nums text-primary">
                  {ML_CONFIDENCE}%
                </p>
                <p className="text-[11px] text-muted-foreground">MEDIUM</p>
                <div className="mt-1.5">
                  <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                    MEDIUM
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-lg border border-border p-4">
            <h3 className="text-sm font-semibold text-card-foreground">
              Prediction Range — Effort · Duration · Team
            </h3>
            <div className="mt-4 flex flex-col gap-5">
              {[
                { label: "Effort (MH)", p50: mlP50, p75: mlP75, p90: mlP90, unit: "MH" },
                { label: "Duration (weeks)", p50: mlWeeksP50, p75: mlWeeksP75, p90: mlWeeksP90, unit: "weeks" },
                { label: "Peak team (people)", p50: mlPeakTeamP50, p75: mlTeamP75, p90: mlTeamP90, unit: "" },
              ].map((row) => (
                <div key={row.label} className="grid grid-cols-1 items-center gap-1 sm:grid-cols-[140px_1fr]">
                  <p className="text-xs font-medium text-foreground">{row.label}</p>
                  <div className="relative h-2 rounded-full bg-muted">
                    <div
                      className="absolute inset-y-0 left-0 rounded-full bg-primary"
                      style={{ width: `${(row.p50 / row.p90) * 100}%` }}
                    />
                    <div
                      className="absolute inset-y-0 left-0 rounded-full bg-amber-500"
                      style={{ width: `${(row.p75 / row.p90) * 100}%`, opacity: 0.9 }}
                    />
                    <span
                      className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-primary ring-2 ring-background"
                      style={{ left: `calc(${(row.p50 / row.p90) * 100}% - 6px)` }}
                    />
                    <span
                      className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-amber-500 ring-2 ring-background"
                      style={{ left: `calc(${(row.p75 / row.p90) * 100}% - 6px)` }}
                    />
                    <span className="absolute top-1/2 right-0 h-2.5 w-2.5 -translate-y-1/2 translate-x-1/2 rounded-full bg-muted-foreground/50 ring-2 ring-background" />
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[11px] text-muted-foreground">
              Red = P50 (most likely) · Amber = P75 (use for proposals) · Grey = P90 (worst-case)
            </p>
          </div>

          <div className="mt-4 rounded-lg border border-border p-4">
            <h3 className="text-sm font-semibold text-card-foreground">
              Effort Range (person-days)
            </h3>
            <div className="mt-3 flex flex-col gap-2">
              {[
                { label: "P50", value: mlPersonDaysP50, max: mlPersonDaysP90, color: "bg-primary" },
                { label: "P75", value: mlPersonDaysP75, max: mlPersonDaysP90, color: "bg-amber-500" },
                { label: "P90", value: mlPersonDaysP90, max: mlPersonDaysP90, color: "bg-rose-300" },
              ].map((row) => (
                <div key={row.label} className="grid grid-cols-[40px_1fr_80px] items-center gap-2">
                  <span className="text-xs font-medium text-foreground">{row.label}</span>
                  <span className="h-2.5 overflow-hidden rounded-full bg-muted">
                    <span
                      className={cn("block h-full rounded-full", row.color)}
                      style={{ width: `${(row.value / row.max) * 100}%` }}
                    />
                  </span>
                  <span className="text-right text-xs tabular-nums text-foreground">
                    {fmt(row.value)} pd
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              P50 = most likely · P75 = use for proposals · P90 = worst-case
            </p>
          </div>

          <div className="mt-4 rounded-lg border border-border bg-muted/50 p-4">
            <h3 className="border-l-2 border-primary pl-2 text-sm font-semibold text-card-foreground">
              Effort Summary &amp; Phase Details
            </h3>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-border bg-background px-4 py-3">
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  P50 (Most Likely)
                </p>
                <p className="mt-1 text-lg font-semibold tabular-nums text-primary">
                  {fmt(mlP50)} MH
                </p>
                <p className="text-[11px] text-muted-foreground">~{fmt(mlPersonDaysP50)} man-days</p>
              </div>
              <div className="rounded-lg border border-border bg-background px-4 py-3">
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  P75 (Use For Proposals)
                </p>
                <p className="mt-1 text-lg font-semibold tabular-nums text-amber-600 dark:text-amber-400">
                  {fmt(mlP75)} MH
                </p>
                <p className="text-[11px] text-muted-foreground">~{fmt(mlPersonDaysP75)} man-days</p>
              </div>
              <div className="rounded-lg border border-border bg-background px-4 py-3">
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  P90 (Worst-Case)
                </p>
                <p className="mt-1 text-lg font-semibold tabular-nums text-rose-600 dark:text-rose-400">
                  {fmt(mlP90)} MH
                </p>
                <p className="text-[11px] text-muted-foreground">~{fmt(mlPersonDaysP90)} man-days</p>
              </div>
            </div>

            <p className="mt-4 text-xs font-semibold text-foreground">By Phase</p>
            <div className="mt-1.5 overflow-x-auto rounded-lg border border-border bg-background">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50 text-xs text-muted-foreground">
                    <th className="px-3 py-2 text-left font-medium">Phase</th>
                    <th className="px-3 py-2 text-right font-medium">ML %</th>
                    <th className="px-3 py-2 text-right font-medium">ML Hrs</th>
                    <th className="px-3 py-2 text-right font-medium">ML Person-Days</th>
                  </tr>
                </thead>
                <tbody>
                  {mlPhaseRows.map((row) => (
                    <tr key={row.key} className="border-b border-border">
                      <td className="px-3 py-2.5 font-medium text-primary">{row.label}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-muted-foreground">
                        {(row.mlPct).toFixed(1)}%
                      </td>
                      <td className="px-3 py-2.5 text-right font-medium tabular-nums text-foreground">
                        {fmt(row.mlHrs)}
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-muted-foreground">
                        {fmt(row.mlPersonDays)}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-emerald-50/50 dark:bg-emerald-950/20">
                    <td className="px-3 py-2.5 font-semibold text-foreground">Total</td>
                    <td className="px-3 py-2.5 text-right font-semibold tabular-nums text-foreground">
                      100%
                    </td>
                    <td className="px-3 py-2.5 text-right font-semibold tabular-nums text-foreground">
                      {fmt(mlPhaseRows.reduce((s, r) => s + r.mlHrs, 0))}
                    </td>
                    <td className="px-3 py-2.5 text-right font-semibold tabular-nums text-foreground">
                      {fmt(mlPhaseRows.reduce((s, r) => s + r.mlPersonDays, 0))}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="mt-4 text-xs font-semibold text-foreground">Delivery vs PMO Split</p>
            <div className="mt-1.5 overflow-x-auto rounded-lg border border-border bg-background">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50 text-xs text-muted-foreground">
                    <th className="px-3 py-2 text-left font-medium">Phase</th>
                    <th className="px-3 py-2 text-right font-medium">GSI (Delivery) MH</th>
                    <th className="px-3 py-2 text-right font-medium">PMO MH</th>
                    <th className="px-3 py-2 text-right font-medium">Total MH</th>
                  </tr>
                </thead>
                <tbody>
                  {mlPhaseRows.map((row) => (
                    <tr key={row.key} className="border-b border-border">
                      <td className="px-3 py-2.5 font-medium text-primary">{row.label}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-rose-600 dark:text-rose-400">
                        {fmt(row.gsiMh)}
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-amber-600 dark:text-amber-400">
                        {fmt(row.pmoMh)}
                      </td>
                      <td className="px-3 py-2.5 text-right font-medium tabular-nums text-foreground">
                        {fmt(row.gsiMh + row.pmoMh)}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-emerald-50/50 dark:bg-emerald-950/20">
                    <td className="px-3 py-2.5 font-semibold text-foreground">Grand Total</td>
                    <td className="px-3 py-2.5 text-right font-semibold tabular-nums text-rose-600 dark:text-rose-400">
                      {fmt(mlPhaseRows.reduce((s, r) => s + r.gsiMh, 0))}
                    </td>
                    <td className="px-3 py-2.5 text-right font-semibold tabular-nums text-amber-600 dark:text-amber-400">
                      {fmt(mlPhaseRows.reduce((s, r) => s + r.pmoMh, 0))}
                    </td>
                    <td className="px-3 py-2.5 text-right font-semibold tabular-nums text-foreground">
                      {fmt(mlPhaseRows.reduce((s, r) => s + r.gsiMh + r.pmoMh, 0))}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              GSI (Delivery) = development, implementation, testing, deployment. PMO = project
              management and governance. Split based on standard SAP project ratios.
            </p>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-border p-4">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Duration
              </p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-primary">
                {mlWeeksP50} weeks
              </p>
              <div className="mt-1.5 flex gap-2">
                <div className="rounded-md border border-border px-2.5 py-1.5">
                  <p className="text-[10px] text-muted-foreground">P75</p>
                  <p className="text-sm font-medium tabular-nums text-foreground">
                    {mlWeeksP75} weeks
                  </p>
                </div>
                <div className="rounded-md border border-border px-2.5 py-1.5">
                  <p className="text-[10px] text-muted-foreground">P90</p>
                  <p className="text-sm font-medium tabular-nums text-foreground">
                    {mlWeeksP90} weeks
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-border p-4">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Peak Team Size
              </p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-primary">
                {mlPeakTeamP50} FTE
              </p>
              <div className="mt-1.5 flex gap-2">
                <div className="rounded-md border border-border px-2.5 py-1.5">
                  <p className="text-[10px] text-muted-foreground">P75</p>
                  <p className="text-sm font-medium tabular-nums text-foreground">
                    {mlTeamP75.toFixed(1)} FTE
                  </p>
                </div>
                <div className="rounded-md border border-border px-2.5 py-1.5">
                  <p className="text-[10px] text-muted-foreground">P90</p>
                  <p className="text-sm font-medium tabular-nums text-foreground">
                    {mlTeamP90.toFixed(1)} FTE
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-border p-4">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Effort Density
              </p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-primary">
                {fmt(mlEffortDensity)} hrs/GSI
              </p>
              <p className="mt-1.5 text-[11px] text-muted-foreground">
                P50 ML effort ÷ {Math.max(1, inScopeGsis)} GSIs.
              </p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Schedule Risk
                </p>
                <Badge className="rounded-md border-amber-200 bg-amber-50 px-1.5 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-400">
                  {mlRiskLevel}
                </Badge>
              </div>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-primary">
                ±{(mlSpreadWeeks / 2).toFixed(1)} weeks
              </p>
              <p className="mt-1.5 text-[11px] text-muted-foreground">
                P50→P90 spread is {mlSpreadWeeks.toFixed(1)} weeks ({mlSpreadPct.toFixed(0)}% of
                P50). Build at least {(mlSpreadWeeks / 2).toFixed(1)} weeks of buffer into the
                plan.
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-border p-4">
              <p className="text-xs font-medium text-muted-foreground">Wave Count Recommendation</p>
              <p className="mt-1 text-2xl font-semibold text-primary">
                {waveCount} wave{waveCount === 1 ? "" : "s"}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Based on {fmt(mlPersonDaysP50)} pd effort, {mlPeakTeamP50} peak team, {mlWeeksP50}{" "}
                weeks duration.
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                &lt;5K pd → 1 wave · 5-20K → 2 waves · 20-80K → 3 waves · &gt;80K → 5+ waves
              </p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <p className="text-xs font-medium text-muted-foreground">Wave Timeline</p>
              <div className="mt-3">
                <div className="mb-1 flex justify-between text-[10px] text-muted-foreground">
                  <span>W0</span>
                  <span>Wk {mlWeeksP50}</span>
                </div>
                <div className="relative h-8 overflow-hidden rounded-md bg-muted">
                  <div className="absolute inset-y-0 left-0 flex w-full items-center justify-between border-l-2 border-primary bg-primary/10 px-2">
                    <span className="text-[11px] font-medium text-primary">
                      Wave 1 · Wk 0-{mlWeeksP50}
                    </span>
                    <span className="text-[11px] font-semibold text-primary">100%</span>
                  </div>
                </div>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  Discover · Prepare · Explore · Realize · Deploy · Run
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <h3 className="text-sm font-semibold text-card-foreground">Phase &amp; Risk Analysis</h3>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-border p-4">
                <p className="text-xs font-medium text-muted-foreground">Phase Effort</p>
                <div className="mt-3 flex flex-col gap-2">
                  {mlPhaseRows.map((row) => (
                    <div key={row.key} className="grid grid-cols-[70px_1fr_50px] items-center gap-2">
                      <span className="truncate text-[11px] text-foreground">{row.label}</span>
                      <span className="h-2.5 overflow-hidden rounded-full bg-muted">
                        <span
                          className="block h-full rounded-full bg-primary"
                          style={{ width: `${(row.mlHrs / maxMlPhaseHrs) * 100}%` }}
                        />
                      </span>
                      <span className="text-right text-[11px] tabular-nums text-foreground">
                        {fmt(row.mlHrs)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-lg border border-border p-4">
                <p className="text-xs font-medium text-muted-foreground">Risk Factor Weights</p>
                <div className="mt-3 flex flex-col gap-2">
                  {RISK_FACTORS.map((risk) => (
                    <div key={risk.key} className="grid grid-cols-[110px_1fr_50px] items-center gap-2">
                      <span className="truncate text-[11px] text-foreground">{risk.label}</span>
                      <span className="h-2.5 overflow-hidden rounded-full bg-muted">
                        <span
                          className="block h-full rounded-full bg-emerald-500"
                          style={{ width: `${(risk.weight / RISK_FACTORS[0].weight) * 100}%` }}
                        />
                      </span>
                      <span className="text-right text-[11px] tabular-nums text-foreground">
                        {risk.weight.toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <h3 className="text-sm font-semibold text-card-foreground">
              Risk Flags ({RISK_FACTORS.length})
            </h3>
            <div className="mt-3 flex flex-col gap-2">
              {RISK_FACTORS.map((risk) => (
                <div
                  key={risk.key}
                  className="flex items-start justify-between gap-3 rounded-lg border border-border px-4 py-3"
                >
                  <div className="flex items-start gap-2">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground">{risk.label}</p>
                        <Badge
                          variant="outline"
                          className="rounded-md border-emerald-200 bg-emerald-50 px-1.5 text-[10px] text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400"
                        >
                          {risk.severity}
                        </Badge>
                      </div>
                      <p className="mt-0.5 max-w-xl text-xs text-muted-foreground">{risk.note}</p>
                    </div>
                  </div>
                  <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                    {risk.weight.toFixed(1)}% weight
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {mode === "compare" && (
        <div className="border-t border-border pt-6">
          <p className="rounded-md border border-sky-200 bg-sky-50 px-3 py-2 text-xs text-sky-800 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-300">
            Side-by-side comparison · Formula (KDM) vs ML Prediction
          </p>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">
              ML Prediction Report · {ML_MODEL_VERSION} · {ML_PROJECT_COUNT} projects
            </p>
            <Button type="button" variant="outline" size="sm">
              Export Excel
            </Button>
          </div>

          <div className="mt-4">
            <h3 className="text-base font-semibold text-card-foreground">
              Formula vs ML Comparison
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              The same project scope compared across the deterministic formula and ML prediction.
            </p>

            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <p className="text-xs font-semibold text-foreground uppercase">Formula (KDM)</p>
                <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">
                  {fmt(totalEffort)} hrs
                </p>
                <p className="text-xs text-muted-foreground">Deterministic baseline</p>
                <p className="mt-2 rounded-md border border-border bg-background px-2.5 py-2 text-[11px] text-muted-foreground">
                  One reproducible estimate based on the formula inputs and active master data.
                </p>
              </div>
              <div className="rounded-lg border border-rose-200 bg-rose-50/40 p-4 dark:border-rose-900 dark:bg-rose-950/20">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-rose-700 uppercase dark:text-rose-400">
                    ML Prediction
                  </p>
                  <Badge className="rounded-md border-amber-200 bg-amber-50 px-1.5 text-[10px] text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-400">
                    {ML_CONFIDENCE}% confidence · MEDIUM
                  </Badge>
                </div>
                <p className="mt-1 text-2xl font-semibold tabular-nums text-rose-700 dark:text-rose-400">
                  {fmt(mlP50)} hrs
                </p>
                <p className="text-xs text-muted-foreground">P50 most-likely prediction</p>
                <div className="mt-2 flex gap-2">
                  <div className="rounded-md border border-border bg-background px-2.5 py-1.5">
                    <p className="text-[10px] text-muted-foreground">P50</p>
                    <p className="text-sm font-medium tabular-nums text-foreground">{fmt(mlP50)}</p>
                  </div>
                  <div className="rounded-md border border-border bg-background px-2.5 py-1.5">
                    <p className="text-[10px] text-muted-foreground">P75</p>
                    <p className="text-sm font-medium tabular-nums text-amber-600 dark:text-amber-400">
                      {fmt(mlP75)}
                    </p>
                  </div>
                  <div className="rounded-md border border-border bg-background px-2.5 py-1.5">
                    <p className="text-[10px] text-muted-foreground">P90</p>
                    <p className="text-sm font-medium tabular-nums text-rose-600 dark:text-rose-400">
                      {fmt(mlP90)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {(() => {
              const diff = mlP50 - totalEffort;
              const pct = totalEffort > 0 ? (diff / totalEffort) * 100 : 0;
              return (
                <p className="mt-3 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-400">
                  <span className="font-semibold">
                    ML P50 is {pct >= 0 ? "+" : ""}
                    {pct.toFixed(1)}% {pct >= 0 ? "higher" : "lower"} than Formula
                  </span>{" "}
                  ({fmt(Math.abs(diff))} hrs difference)
                </p>
              );
            })()}

            <p className="mt-4 text-xs font-semibold text-foreground uppercase">KPI Comparison</p>
            <div className="mt-1.5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                {
                  label: "Person-Days",
                  formula: personDays,
                  ml: mlPersonDaysP50,
                  digits: 0,
                  suffix: " pd",
                },
                {
                  label: "Duration",
                  formula: durationWeeks,
                  ml: mlWeeksP50,
                  digits: 1,
                  suffix: " weeks",
                },
                {
                  label: "Peak Team Size",
                  formula: peakFte,
                  ml: mlPeakTeamP50,
                  digits: 1,
                  suffix: " FTE",
                },
              ].map((kpi) => {
                const pct = kpi.formula > 0 ? ((kpi.ml - kpi.formula) / kpi.formula) * 100 : 0;
                return (
                  <div key={kpi.label} className="rounded-lg border border-border p-4">
                    <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                      {kpi.label}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-muted-foreground">Formula</p>
                        <p className="text-sm font-semibold tabular-nums text-foreground">
                          {kpi.formula.toFixed(kpi.digits)}
                          {kpi.suffix}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-muted-foreground">ML P50</p>
                        <p className="text-sm font-semibold tabular-nums text-rose-600 dark:text-rose-400">
                          {kpi.ml.toFixed(kpi.digits)}
                          {kpi.suffix}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 flex justify-center">
                      <DeltaBadge pct={pct} invert />
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="mt-4 text-xs font-semibold text-foreground uppercase">
              ML Prediction Ranges
            </p>
            <div className="mt-1.5 overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50 text-xs text-muted-foreground">
                    <th className="px-3 py-2 text-left font-medium">Metric</th>
                    <th className="px-3 py-2 text-right font-medium">Formula</th>
                    <th className="px-3 py-2 text-right font-medium">ML P50</th>
                    <th className="px-3 py-2 text-right font-medium">ML P75</th>
                    <th className="px-3 py-2 text-right font-medium">ML P90</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border">
                    <td className="px-3 py-2.5 font-medium text-foreground">Effort</td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-foreground">
                      {fmt(totalEffort)} hrs
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-primary">
                      {fmt(mlP50)} hrs
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-amber-600 dark:text-amber-400">
                      {fmt(mlP75)} hrs
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-rose-600 dark:text-rose-400">
                      {fmt(mlP90)} hrs
                    </td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="px-3 py-2.5 font-medium text-foreground">Duration</td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-foreground">
                      {durationWeeks.toFixed(1)} weeks
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-primary">
                      {mlWeeksP50} weeks
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-amber-600 dark:text-amber-400">
                      {mlWeeksP75} weeks
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-rose-600 dark:text-rose-400">
                      {mlWeeksP90} weeks
                    </td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2.5 font-medium text-foreground">Peak Team</td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-foreground">
                      {peakFte.toFixed(1)} FTE
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-primary">
                      {mlPeakTeamP50.toFixed(1)} FTE
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-amber-600 dark:text-amber-400">
                      {mlTeamP75.toFixed(1)} FTE
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-rose-600 dark:text-rose-400">
                      {mlTeamP90.toFixed(1)} FTE
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="mt-4 text-sm font-semibold text-card-foreground">
              Phase Effort — Formula vs ML
            </p>
            <div className="mt-1.5 rounded-lg border border-border p-4">
              <div className="flex flex-col gap-3">
                {rows.map((row, i) => {
                  const mlRow = mlPhaseRows[i];
                  const maxBar = Math.max(mlP50, maxPhaseHrs * 6, 1);
                  return (
                    <div key={row.key}>
                      <p className="text-xs text-muted-foreground">{row.label}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="h-3 flex-1 overflow-hidden rounded bg-muted">
                          <span
                            className="block h-full rounded bg-primary"
                            style={{ width: `${(mlRow.mlHrs / maxBar) * 100}%` }}
                          />
                        </span>
                        <span className="w-14 text-right text-xs font-medium tabular-nums text-foreground">
                          {fmt(mlRow.mlHrs)}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="h-2 flex-1 overflow-hidden rounded bg-muted">
                          <span
                            className="block h-full rounded bg-muted-foreground/40"
                            style={{ width: `${(row.totalHrs / maxBar) * 100}%` }}
                          />
                        </span>
                        <span className="w-14 text-right text-xs tabular-nums text-muted-foreground">
                          {fmt(row.totalHrs)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 flex items-center gap-4 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-primary" /> ML (P50)
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-muted-foreground/40" /> Formula (KDM)
                </span>
              </div>
            </div>

            <p className="mt-4 text-sm font-semibold text-card-foreground">
              Phase-by-Phase Comparison
            </p>
            <div className="mt-1.5 overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50 text-xs text-muted-foreground">
                    <th className="px-3 py-2 text-left font-medium">Phase</th>
                    <th className="px-3 py-2 text-right font-medium">ML %</th>
                    <th className="px-3 py-2 text-right font-medium">ML Hrs</th>
                    <th className="px-3 py-2 text-right font-medium">ML Person-Days</th>
                    <th className="px-3 py-2 text-right font-medium">Formula Hrs</th>
                    <th className="px-3 py-2 text-right font-medium">Δ</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => {
                    const mlRow = mlPhaseRows[i];
                    const delta =
                      row.totalHrs > 0
                        ? ((mlRow.mlHrs - row.totalHrs) / row.totalHrs) * 100
                        : mlRow.mlHrs > 0
                          ? 100
                          : 0;
                    return (
                      <tr key={row.key} className="border-b border-border">
                        <td className="px-3 py-2.5 font-medium text-primary">{row.label}</td>
                        <td className="px-3 py-2.5 text-right tabular-nums text-muted-foreground">
                          {mlRow.mlPct.toFixed(1)}%
                        </td>
                        <td className="px-3 py-2.5 text-right tabular-nums text-foreground">
                          {fmt(mlRow.mlHrs)}
                        </td>
                        <td className="px-3 py-2.5 text-right tabular-nums text-muted-foreground">
                          {fmt(mlRow.mlPersonDays)}
                        </td>
                        <td className="px-3 py-2.5 text-right tabular-nums text-foreground">
                          {fmt(row.totalHrs)}
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          <DeltaBadge pct={delta} />
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="bg-emerald-50/50 dark:bg-emerald-950/20">
                    <td className="px-3 py-2.5 font-semibold text-foreground">Total</td>
                    <td className="px-3 py-2.5 text-right font-semibold tabular-nums text-foreground">
                      100%
                    </td>
                    <td className="px-3 py-2.5 text-right font-semibold tabular-nums text-foreground">
                      {fmt(mlPhaseRows.reduce((s, r) => s + r.mlHrs, 0))}
                    </td>
                    <td className="px-3 py-2.5 text-right font-semibold tabular-nums text-foreground">
                      {fmt(mlPhaseRows.reduce((s, r) => s + r.mlPersonDays, 0))}
                    </td>
                    <td className="px-3 py-2.5 text-right font-semibold tabular-nums text-foreground">
                      {fmt(totalEffort)}
                    </td>
                    <td className="px-3 py-2.5" />
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
