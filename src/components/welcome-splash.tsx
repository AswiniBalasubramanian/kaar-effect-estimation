"use client";

import { useEffect, useState } from "react";
import { Calculator, ChartLineUp, Sparkle, X } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "kee-welcome-splash-seen";

const FEATURES = [
  {
    icon: Calculator,
    title: "Formula (KDM) + ML Estimation",
    description: "Deterministic KDM formulas alongside ML-backed effort predictions.",
  },
  {
    icon: Sparkle,
    title: "Agent Impact",
    description: "See automation savings, token cost, and margin uplift from AI agents.",
  },
];

const PHASE_BARS = [
  { label: "Discover", width: "35%" },
  { label: "Explore", width: "55%" },
  { label: "Realize", width: "85%" },
  { label: "Deploy", width: "50%" },
];

export function WelcomeSplash() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (!window.localStorage.getItem(STORAGE_KEY)) {
        setOpen(true);
      }
    } catch {
      setOpen(true);
    }
  }, []);

  function dismiss() {
    setOpen(false);
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-black/50 px-4 py-6">
      <div className="relative grid w-full max-w-2xl grid-cols-1 overflow-hidden rounded-2xl border border-border bg-white shadow-2xl md:grid-cols-2 dark:bg-gray-900">
        <button
          type="button"
          onClick={dismiss}
          aria-label="Close"
          className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full text-foreground/60 transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
        {/* Left: copy */}
        <div className="flex flex-col justify-center px-6 py-7 sm:px-7">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
            KaarTech <span className="font-normal text-primary/70">Effort Estimator</span>
          </span>

          <h1 className="mt-3 text-xl leading-tight font-extrabold tracking-tight text-foreground sm:text-2xl">
            Estimate SAP S/4HANA engagements{" "}
            <span className="text-primary">3&times; faster</span> with KDM
          </h1>

          <p className="mt-2 text-xs text-muted-foreground">
            Effort, resources, and a full delivery timeline — powered by the Kaar
            Delivery Methodology, ML predictions, and AI agent impact modeling.
          </p>

          <div className="mt-4 flex flex-col gap-3">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="flex items-start gap-2.5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <feature.icon className="h-3.5 w-3.5" />
                </span>
                <div>
                  <p className="text-xs font-semibold text-foreground">{feature.title}</p>
                  <p className="text-[11px] text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-4 text-[11px] text-muted-foreground">Built for SAP pre-sales teams</p>
          <div className="mt-1 flex items-center gap-3 text-xs font-semibold text-foreground/80">
            <span>SAP S/4HANA</span>
            <span className="h-1 w-1 rounded-full bg-border" />
            <span>Kaar Delivery Methodology</span>
          </div>

          <Button type="button" onClick={dismiss} size="sm" className="mt-5 w-fit px-6">
            Get Started
          </Button>
        </div>

        {/* Right: decorative mock panel */}
        <div className="relative hidden overflow-hidden bg-gradient-to-br from-rose-50 to-amber-50 md:block">
          <div className="absolute top-0 left-0 h-28 w-28 -translate-x-8 -translate-y-8 rotate-45 bg-primary/90" />
          <div className="absolute right-0 bottom-0 h-32 w-32 translate-x-10 translate-y-10 rotate-45 bg-amber-500/80" />

          <div className="relative flex h-full items-center justify-center p-6">
            <div className="w-full max-w-[220px] rounded-xl border border-border bg-white p-3.5 shadow-xl dark:bg-gray-900">
              <p className="text-[10px] font-semibold tracking-wide text-primary/80 uppercase">
                Total Effort
              </p>
              <p className="mt-1 text-xl font-bold tabular-nums text-primary">1,042 hrs</p>
              <p className="text-[10px] text-muted-foreground">org mult 1.0000</p>

              <div className="mt-3 flex flex-col gap-1.5">
                {PHASE_BARS.map((bar) => (
                  <div key={bar.label} className="flex items-center gap-2">
                    <span className="w-12 shrink-0 text-[9px] text-muted-foreground">
                      {bar.label}
                    </span>
                    <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                      <span
                        className={cn("block h-full rounded-full bg-primary")}
                        style={{ width: bar.width }}
                      />
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-1.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                <ChartLineUp className="h-3 w-3" />
                +7.2 pts GMPE with agents
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="max-w-md px-4 text-center text-xs text-foreground/50">
        Your estimates stay on this device until saved to a project.
      </p>
    </div>
  );
}
