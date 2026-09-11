"use client";

import { useState, type ReactNode } from "react";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

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
      <TooltipContent side="top">{text}</TooltipContent>
    </Tooltip>
  );
}

interface MasterRow {
  activity: string;
  phase: string;
  h: number;
  m: number;
  l: number;
}

const testingMaster: MasterRow[] = [
  { activity: "UT (Unit Test)", phase: "Realize", h: 40, m: 24, l: 8 },
  { activity: "SWT (Solution Walkthrough)", phase: "Realize", h: 16, m: 8, l: 4 },
  { activity: "SIT (System Integration Test)", phase: "Realize", h: 64, m: 40, l: 16 },
  { activity: "UAT (User Acceptance Test)", phase: "Deploy", h: 48, m: 32, l: 16 },
];

const dataMigrationMaster: MasterRow[] = [
  { activity: "Data Migration / Data Load", phase: "Realize", h: 80, m: 48, l: 24 },
];

function MasterTable({ title, rows }: { title: string; rows: MasterRow[] }) {
  return (
    <div className="rounded-lg border border-border">
      <p className="border-b border-border bg-muted/50 px-3 py-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {title}
      </p>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-muted-foreground">
            <th className="px-3 py-2 text-left font-medium">Activity</th>
            <th className="px-3 py-2 text-left font-medium">Phase</th>
            <th className="px-3 py-2 text-right font-medium text-rose-600 dark:text-rose-400">H</th>
            <th className="px-3 py-2 text-right font-medium text-amber-600 dark:text-amber-400">M</th>
            <th className="px-3 py-2 text-right font-medium text-emerald-600 dark:text-emerald-400">L</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.activity} className="border-t border-border">
              <td className="px-3 py-2 font-medium text-foreground">{row.activity}</td>
              <td className="px-3 py-2 text-muted-foreground">{row.phase}</td>
              <td className="px-3 py-2 text-right tabular-nums text-foreground">{row.h}</td>
              <td className="px-3 py-2 text-right tabular-nums text-foreground">{row.m}</td>
              <td className="px-3 py-2 text-right tabular-nums text-foreground">{row.l}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ToggleRow({
  title,
  help,
  enabled,
  onToggle,
  children,
}: {
  title: string;
  help: string;
  enabled: boolean;
  onToggle: () => void;
  children?: ReactNode;
}) {
  return (
    <div className="rounded-xl bg-muted/60 px-5 py-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-1.5">
          <span className="text-sm font-semibold text-card-foreground">{title}</span>
          <FieldHelp text={help} />
        </div>
        <Switch checked={enabled} onCheckedChange={onToggle} className="shrink-0" />
      </div>
      {enabled && children && (
        <div className="mt-3 border-t border-border pt-3">{children}</div>
      )}
    </div>
  );
}

export function TestingTrainingStep({
  wricefObjects,
  endUsers,
  inScopeCount,
  swtCyclesFromStepA,
  maxPersonsPerTraining,
}: {
  wricefObjects: number;
  endUsers: number;
  inScopeCount: number;
  swtCyclesFromStepA: number;
  maxPersonsPerTraining: number;
}) {
  const [ftgEnabled, setFtgEnabled] = useState(false);
  const [wricefPerFtg, setWricefPerFtg] = useState("5");

  const [swtEnabled, setSwtEnabled] = useState(false);
  const [futEnabled, setFutEnabled] = useState(false);

  const [sddEnabled, setSddEnabled] = useState(false);
  const [sddThreshold, setSddThreshold] = useState("30");

  const [ocmEnabled, setOcmEnabled] = useState(false);
  const [usersPerUnit, setUsersPerUnit] = useState("50");

  const [thirdPartyEnabled, setThirdPartyEnabled] = useState(false);

  const [trainingEnabled, setTrainingEnabled] = useState(false);
  const [trainingSimulation, setTrainingSimulation] = useState(false);

  const wricefPerFtgNum = Number(wricefPerFtg) || 1;
  const ftgCount = Math.ceil(wricefObjects / wricefPerFtgNum);

  const usersPerUnitNum = Number(usersPerUnit) || 1;
  const ocmUnits = Math.ceil(endUsers / usersPerUnitNum);

  const trainingSessions =
    maxPersonsPerTraining > 0 ? Math.ceil(endUsers / maxPersonsPerTraining) : 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="-mx-5 -mt-5 mb-4 w-[calc(100%+2.5rem)] rounded-t-xl border-b border-border bg-muted/50 px-5 py-4">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="bg-gradient-to-r from-primary to-neutral-900 bg-clip-text text-base font-semibold text-transparent dark:to-neutral-100">
              Already in the base estimate - Testing &amp; Data
            </h2>
            <Badge className="rounded-md border-emerald-200 bg-emerald-50 px-1.5 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400">
              Counted Per In-Scope Global Scope Item
            </Badge>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          System Integration Test, User Acceptance Test, unit testing, Solution Walkthrough,
          and data migration run <span className="font-medium text-foreground">per in-scope Global Scope Item</span> ({inScopeCount} selected)
          at each Global Scope Item&rsquo;s own complexity. They are{" "}
          <span className="font-medium text-foreground">already included</span> in the computed
          effort, so no extra toggle is needed here. Hours shown are per-Global Scope Item base
          L3 H/M/L values from Activity Master.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <MasterTable title="Testing" rows={testingMaster} />
          <MasterTable title="Data Migration" rows={dataMigrationMaster} />
        </div>
      </div>

      <ToggleRow
        title="Fit Gap Analysis Workshop"
        help="Fit-to-Gap workshop sizing for custom objects. FTG count = ceil(total WRICEF objects / WRICEF per FTG), then workshop hours are added in Explore."
        enabled={ftgEnabled}
        onToggle={() => setFtgEnabled((v) => !v)}
      >
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted-foreground">WRICEF per FTG</label>
            <Input
              type="number"
              min={1}
              value={wricefPerFtg}
              onChange={(e) => setWricefPerFtg(e.target.value)}
              className="h-8 w-24"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            FTG count = ceil({wricefObjects} / {wricefPerFtgNum}) ={" "}
            <span className="font-medium tabular-nums text-primary-text">{ftgCount}</span>
          </p>
        </div>
      </ToggleRow>

      <ToggleRow
        title="SWT — Solution Walkthrough cycles"
        help="Turns on additional Solution Walkthrough cycles, usually 1 to 3 cycles. Adds cycle-based walkthrough hours using coverage percentages, variants/GSI basis, and WRICEF coverage by cycle."
        enabled={swtEnabled}
        onToggle={() => setSwtEnabled((v) => !v)}
      >
        <p className="text-xs text-muted-foreground">
          Uses Step A&rsquo;s SWT Cycles value:{" "}
          <span className="font-medium tabular-nums text-primary-text">{swtCyclesFromStepA}</span>
        </p>
      </ToggleRow>

      <ToggleRow
        title="FUT — Functional User Test (extra cycle)"
        help="Turns on the additional Functional User Test cycle. Adds one FUT line per applicable GSI: FUT std hours x GSI instances x org multiplier."
        enabled={futEnabled}
        onToggle={() => setFutEnabled((v) => !v)}
      />

      <ToggleRow
        title="SDD P3→P5 relocation by customization %"
        help="Phase relocation rule for SDD when customization is high. If customization adjusted hours exceed the configured percentage of Delivery hours, SDD moves from Explore to Realize."
        enabled={sddEnabled}
        onToggle={() => setSddEnabled((v) => !v)}
      >
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-muted-foreground">Threshold %</label>
          <Input
            type="number"
            min={0}
            max={100}
            value={sddThreshold}
            onChange={(e) => setSddThreshold(e.target.value)}
            className="h-8 w-24"
          />
        </div>
      </ToggleRow>

      <ToggleRow
        title="OCM — Organisational Change Management"
        help="Organizational Change Management effort based on impacted end users. OCM units = ceil(end users / users per unit); OCM hours = std hours x units x scaling x org multiplier."
        enabled={ocmEnabled}
        onToggle={() => setOcmEnabled((v) => !v)}
      >
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted-foreground">Users per Unit</label>
            <Input
              type="number"
              min={1}
              value={usersPerUnit}
              onChange={(e) => setUsersPerUnit(e.target.value)}
              className="h-8 w-24"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            OCM units = ceil({endUsers} / {usersPerUnitNum}) ={" "}
            <span className="font-medium tabular-nums text-primary-text">{ocmUnits}</span>
          </p>
        </div>
      </ToggleRow>

      <ToggleRow
        title="3rd-party audit uplift"
        help="Review overhead when an external PMO/audit party is involved. Adds uplift % on Explore and Realize adjusted hours only when the project profile marks third-party involvement."
        enabled={thirdPartyEnabled}
        onToggle={() => setThirdPartyEnabled((v) => !v)}
      />

      <ToggleRow
        title="Training delivery (sessions / TTT / simulation)"
        help="Turns on training delivery effort in Deploy. Sessions = ceil(end users / max persons per training); effort uses the training activity used for delivery hours."
        enabled={trainingEnabled}
        onToggle={() => setTrainingEnabled((v) => !v)}
      >
        <div className="flex flex-col gap-3">
          <p className="text-xs text-muted-foreground">
            Sessions = ceil({endUsers} / {maxPersonsPerTraining || "—"}) ={" "}
            <span className="font-medium tabular-nums text-primary-text">{trainingSessions}</span>
          </p>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={trainingSimulation}
              onChange={(e) => setTrainingSimulation(e.target.checked)}
              className="h-4 w-4 rounded border-input"
            />
            Include training simulation build effort
          </label>
        </div>
      </ToggleRow>
    </div>
  );
}
