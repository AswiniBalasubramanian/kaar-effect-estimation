"use client";

import { useEffect, useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fricewObjectTypes } from "@/lib/fricew-catalog";

const HOURS_PER_DAY = 8;

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

type Tier = "low" | "medium" | "high";
type Counts = Record<string, Record<Tier, string>>;

function emptyCounts(): Counts {
  const counts: Counts = {};
  for (const obj of fricewObjectTypes) {
    counts[obj.key] = { low: "", medium: "", high: "" };
  }
  return counts;
}

function toNumber(value: string) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export function FricewStep({
  onTotalsChange,
}: {
  onTotalsChange?: (totals: { objects: number; devHours: number }) => void;
}) {
  const [objectMode, setObjectMode] = useState(false);
  const [counts, setCounts] = useState<Counts>(emptyCounts);

  function setCount(key: string, tier: Tier, value: string) {
    setCounts((prev) => ({ ...prev, [key]: { ...prev[key], [tier]: value } }));
  }

  const rows = useMemo(
    () =>
      fricewObjectTypes.map((obj) => {
        const rowCounts = counts[obj.key];
        const low = toNumber(rowCounts.low);
        const medium = toNumber(rowCounts.medium);
        const high = toNumber(rowCounts.high);
        const objects = low + medium + high;
        const devHrs = (low * obj.lowMd + medium * obj.mediumMd + high * obj.highMd) * HOURS_PER_DAY;
        return { ...obj, low, medium, high, objects, devHrs };
      }),
    [counts]
  );

  const totalObjects = rows.reduce((sum, r) => sum + r.objects, 0);
  const totalDevHrs = rows.reduce((sum, r) => sum + r.devHrs, 0);

  useEffect(() => {
    onTotalsChange?.({ objects: totalObjects, devHours: totalDevHrs });
  }, [totalObjects, totalDevHrs, onTotalsChange]);

  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5">
            <h2 className="text-base font-semibold text-card-foreground">
              FRICEW — Custom Development Objects
            </h2>
            <FieldHelp text="Forms, Reports, Interfaces, Conversions, Enhancements, Workflow, Fiori/Custom, and Analytics objects, sized by a Low/Medium/High man-day master." />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Effort uses the man-day master × {HOURS_PER_DAY} hrs/day. Partial info is fine —
            blanks count as zero.
          </p>
        </div>
        <label className="flex shrink-0 items-center gap-2 rounded-md border border-input px-3 py-1.5 text-sm text-foreground">
          <Checkbox
            checked={objectMode}
            onCheckedChange={(checked) => setObjectMode(checked === true)}
          />
          Object mode
        </label>
      </div>

      <p className="mt-3 rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
        {objectMode ? (
          <>
            <span className="font-medium text-foreground">Object mode ON.</span> Development
            effort is driven by these structured WRICEF object counts instead of per-GSI
            Customization activities.
          </>
        ) : (
          <>
            <span className="font-medium text-foreground">Object mode OFF (per-GSI).</span>{" "}
            Development stays inside the per-GSI Customization activities (the v18 gate mode).
            Turn on Object mode to drive dev effort from these structured counts instead.
          </>
        )}
      </p>

      <div className="mt-4 overflow-x-auto">
        <Table>
          <TableHeader className="bg-white dark:bg-gray-900">
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-muted-foreground">Type</TableHead>
              <TableHead className="text-muted-foreground">Skill</TableHead>
              <TableHead className="text-muted-foreground">Low</TableHead>
              <TableHead className="text-muted-foreground">Medium</TableHead>
              <TableHead className="text-muted-foreground">High</TableHead>
              <TableHead className="text-right text-muted-foreground">Objects</TableHead>
              <TableHead className="text-right text-muted-foreground">Dev Hrs</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.key}>
                <TableCell className="font-medium text-foreground">{row.type}</TableCell>
                <TableCell className="text-muted-foreground">{row.skill}</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min={0}
                    value={counts[row.key].low}
                    onChange={(e) => setCount(row.key, "low", e.target.value)}
                    placeholder="0"
                    className="h-8 w-20"
                  />
                  <span className="mt-1 block text-[11px] text-muted-foreground">
                    {row.lowMd} md
                  </span>
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min={0}
                    value={counts[row.key].medium}
                    onChange={(e) => setCount(row.key, "medium", e.target.value)}
                    placeholder="0"
                    className="h-8 w-20"
                  />
                  <span className="mt-1 block text-[11px] text-muted-foreground">
                    {row.mediumMd} md
                  </span>
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min={0}
                    value={counts[row.key].high}
                    onChange={(e) => setCount(row.key, "high", e.target.value)}
                    placeholder="0"
                    className="h-8 w-20"
                  />
                  <span className="mt-1 block text-[11px] text-muted-foreground">
                    {row.highMd} md
                  </span>
                </TableCell>
                <TableCell className="text-right font-medium tabular-nums text-foreground">
                  {row.objects}
                </TableCell>
                <TableCell className="text-right font-medium tabular-nums text-primary">
                  {row.devHrs}
                </TableCell>
              </TableRow>
            ))}
            <TableRow className="bg-muted/50">
              <TableCell colSpan={5} className="font-semibold text-foreground">
                Total WRICEF Objects
              </TableCell>
              <TableCell className="text-right font-semibold tabular-nums text-foreground">
                {totalObjects}
              </TableCell>
              <TableCell className="text-right font-semibold tabular-nums text-primary">
                {totalDevHrs}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
