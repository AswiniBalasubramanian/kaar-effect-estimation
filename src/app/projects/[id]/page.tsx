"use client";

import { use, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Question,
  CopySimple,
  Trash,
  CaretDown,
  CaretLeft,
  CaretRight,
} from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { SidebarInset } from "@/components/ui/sidebar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { ScopeSelectionStep } from "@/components/scope-selection-step";
import type { GsiCatalogItem } from "@/lib/gsi-catalog";
import { FricewStep } from "@/components/fricew-step";
import { TestingTrainingStep } from "@/components/testing-training-step";
import { EffortEstimateStep } from "@/components/effort-estimate-step";
import { useProjects } from "@/lib/projects-context";
import { useSetTopBar } from "@/lib/top-bar-context";
import { wizardSteps } from "@/lib/estimation-wizard";
import {
  defaultOrgComplexityFactors,
  computeOrgMultiplier,
  computeLevelCounts,
  overallLevel,
} from "@/lib/org-complexity";
import { projectStatusDotClass, projectStatusLabel, type Project } from "@/lib/projects";

const typeLabel: Record<Project["type"], string> = {
  greenfield: "Greenfield (New Implementation)",
  brownfield: "Brownfield (System Conversion)",
  rollout: "Selective Data Transition",
};

const sapProductOptions = ["S4H_OnPrem", "S4H_Cloud", "Ariba", "SuccessFactors"];

interface DriverFieldMeta {
  type: "text" | "select";
  placeholder: string;
  help: string;
}

const driverFieldMeta: Record<string, DriverFieldMeta> = {
  "legal-entities": {
    type: "text",
    placeholder: "Enter legal entities",
    help: "Number of legal/company entities in scope.",
  },
  countries: {
    type: "text",
    placeholder: "Enter countries",
    help: "Number of countries in rollout/template scope.",
  },
  plants: {
    type: "text",
    placeholder: "Enter plants",
    help: "Number of plants, sites, or operational locations.",
  },
  "sales-org": {
    type: "text",
    placeholder: "Enter sales org",
    help: "Number of sales organizations requiring setup/validation.",
  },
  "purchase-units": {
    type: "text",
    placeholder: "Enter purchase units",
    help: "Number of procurement organizations or purchasing units.",
  },
  "end-users": {
    type: "text",
    placeholder: "Enter no. of end users",
    help: "Approximate number of business users affected.",
  },
  interfaces: {
    type: "text",
    placeholder: "Enter interfaces to other systems",
    help: "Number of integrations with other systems.",
  },
  "data-migration-objects": {
    type: "text",
    placeholder: "Enter data migration objects",
    help: "Number of data object types to migrate.",
  },
  "data-volume": {
    type: "select",
    placeholder: "Select data volume",
    help: "Expected size/scale of data.",
  },
  "geographic-distribution": {
    type: "text",
    placeholder: "Enter geographic distribution",
    help: "How spread out the business/users are across locations.",
  },
  currencies: {
    type: "text",
    placeholder: "Enter currencies",
    help: "Number of currencies in scope.",
  },
  "customer-erp-readiness": {
    type: "select",
    placeholder: "Select customer erp readiness",
    help: "Maturity/readiness of the customer's current ERP landscape.",
  },
  "current-system": {
    type: "select",
    placeholder: "Select current system",
    help: "Current ERP/system landscape maturity.",
  },
  "data-quality": {
    type: "select",
    placeholder: "Select data quality",
    help: "Expected cleanliness of legacy/master data.",
  },
  "project-driver": {
    type: "select",
    placeholder: "Select project driver",
    help: "Overall project complexity driver selected by the estimator.",
  },
};

function FieldHelp({ text }: { text: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="inline-flex text-muted-foreground hover:text-foreground"
        >
          <Question className="h-3.5 w-3.5" />
          <span className="sr-only">Help</span>
        </button>
      </TooltipTrigger>
      <TooltipContent side="top">{text}</TooltipContent>
    </Tooltip>
  );
}

function levelBadgeClass(level: "L" | "M" | "H") {
  if (level === "H")
    return "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-400";
  if (level === "M")
    return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-400";
  return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400";
}

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { getProject, cloneProject, updateProjectStatus, deleteProject } = useProjects();
  const project = getProject(id);

  const crumbs = useMemo(
    () => [
      { label: "Projects", href: "/" },
      { label: project?.name ?? "Not found" },
    ],
    [project]
  );
  useSetTopBar(crumbs);

  const [activeStep, setActiveStep] = useState("profile-scope");

  const [hqLocation, setHqLocation] = useState("");
  const [industry, setIndustry] = useState("");
  const [goLiveDate, setGoLiveDate] = useState("");
  const [durationWeeks, setDurationWeeks] = useState("52");
  const [hoursPerDay, setHoursPerDay] = useState("8");
  const [trainingType, setTrainingType] = useState("end-user");
  const [maxPersonsPerTraining, setMaxPersonsPerTraining] = useState("");
  const [swtCycles, setSwtCycles] = useState("3");
  const [thirdParty, setThirdParty] = useState(false);
  const [sapProducts, setSapProducts] = useState<Set<string>>(new Set());
  const [driverValues, setDriverValues] = useState<Record<string, string>>({});
  const [scopeCount, setScopeCount] = useState(0);
  const [scopeItems, setScopeItems] = useState<GsiCatalogItem[]>([]);
  const [fricewTotals, setFricewTotals] = useState({ objects: 0, devHours: 0 });
  const [statsExpanded, setStatsExpanded] = useState(false);
  const [profileCollapsed, setProfileCollapsed] = useState(false);
  const [orgReviewOpen, setOrgReviewOpen] = useState(false);
  const [stepsNavCollapsed, setStepsNavCollapsed] = useState(false);
  const [resetSignal, setResetSignal] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  const orgMultiplier = useMemo(
    () => computeOrgMultiplier(defaultOrgComplexityFactors),
    []
  );
  const levelCounts = useMemo(
    () => computeLevelCounts(defaultOrgComplexityFactors),
    []
  );
  const overall = useMemo(
    () => overallLevel(defaultOrgComplexityFactors),
    []
  );
  const pendingCount = useMemo(
    () => defaultOrgComplexityFactors.filter((f) => !driverValues[f.key]).length,
    [driverValues]
  );
  const displayedFactors = useMemo(
    () =>
      defaultOrgComplexityFactors.map((factor) => ({
        ...factor,
        value: driverValues[factor.key] || factor.value,
      })),
    [driverValues]
  );
  const assumptionRows = useMemo(
    () =>
      defaultOrgComplexityFactors
        .filter((f) => !driverValues[f.key])
        .map((f) => ({
          field: `driver:${f.key.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())}`,
          default: "Low",
          reason: `Driver '${f.label}' missing/blank — default → Low (mult 1)`,
        })),
    [driverValues]
  );

  if (!project) notFound();

  function toggleSapProduct(product: string) {
    setSapProducts((prev) => {
      const next = new Set(prev);
      if (next.has(product)) next.delete(product);
      else next.add(product);
      return next;
    });
  }

  function setDriverValue(key: string, value: string) {
    setDriverValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleClone() {
    const clone = cloneProject(project!.id);
    if (clone) router.push(`/projects/${clone.id}`);
  }

  function handleDelete() {
    deleteProject(project!.id);
    router.push("/");
  }

  const currentStepIndex = wizardSteps.findIndex((s) => s.id === activeStep);

  function resetStepOne() {
    setHqLocation("");
    setIndustry("");
    setGoLiveDate("");
    setDurationWeeks("52");
    setHoursPerDay("8");
    setTrainingType("end-user");
    setMaxPersonsPerTraining("");
    setSwtCycles("3");
    setThirdParty(false);
    setSapProducts(new Set());
    setDriverValues({});
  }

  function handleResetCurrentStep() {
    if (activeStep === "profile-scope") {
      resetStepOne();
    } else {
      setResetSignal((s) => s + 1);
    }
  }

  function handleBack() {
    if (currentStepIndex > 0) setActiveStep(wizardSteps[currentStepIndex - 1].id);
  }

  function handleSaveNext() {
    setCompletedSteps((prev) => new Set(prev).add(activeStep));
    if (currentStepIndex < wizardSteps.length - 1) {
      setActiveStep(wizardSteps[currentStepIndex + 1].id);
    }
  }

  return (
    <SidebarInset>
      <div className="shrink-0 border-b border-border bg-background">
        <div className="w-full px-6 py-3">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-2">
              <div>
                <h1 className="text-base font-semibold tracking-tight text-pretty text-foreground sm:text-lg">
                  {project.name}
                </h1>
                <div className="mt-0.5 flex items-center gap-2">
                  <p className="text-xs text-muted-foreground">
                    {project.customer ?? "— no customer —"}
                  </p>
                  {!statsExpanded && (
                    <button
                      type="button"
                      onClick={() => setStatsExpanded(true)}
                      className="text-xs font-medium text-primary-text hover:underline"
                    >
                      View more
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Label htmlFor="projectStatus" className="text-xs font-medium tracking-wide text-muted-foreground">
                  Status
                </Label>
                <Select
                  value={project.status}
                  onValueChange={(value) =>
                    updateProjectStatus(project.id, value as Project["status"])
                  }
                >
                  <SelectTrigger id="projectStatus" className="h-8 w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(projectStatusLabel) as Project["status"][]).map((status) => (
                      <SelectItem key={status} value={status}>
                        <span className="flex items-center gap-2">
                          <span
                            aria-hidden="true"
                            className={cn("h-2 w-2 shrink-0 rounded-full", projectStatusDotClass[status])}
                          />
                          {projectStatusLabel[status]}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash className="h-4 w-4" />
                    <span className="sr-only">Delete project</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete &ldquo;{project.name}&rdquo;?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently remove the project and its estimate. This action
                      cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction variant="destructive" onClick={handleDelete}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Button variant="secondary" onClick={handleClone} className="h-8 gap-1.5">
                <CopySimple className="h-4 w-4" />
                Clone
              </Button>
            </div>
          </div>

          {statsExpanded && (
            <div className="mt-3 flex flex-wrap items-center gap-x-8 gap-y-1.5 text-sm">
              <span className="inline-flex items-center gap-4">
                <span className="text-muted-foreground">Solution</span>
                <span className="font-medium text-foreground">SAP S/4HANA</span>
              </span>
              <span className="inline-flex items-center gap-4">
                <span className="text-muted-foreground">Project Type</span>
                <span className="font-medium text-foreground">{typeLabel[project.type]}</span>
              </span>
              <span className="inline-flex items-center gap-4">
                <span className="text-muted-foreground">Region</span>
                <span className="font-medium text-foreground">{project.region ?? "—"}</span>
              </span>
              <span className="inline-flex items-center gap-4">
                <span className="text-muted-foreground">Created</span>
                <span className="font-medium text-foreground">{project.date}</span>
              </span>
              <button
                type="button"
                onClick={() => setStatsExpanded(false)}
                className="text-sm font-medium text-primary-text hover:underline"
              >
                View less
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex min-h-0 w-full flex-1 flex-col sm:flex-row">
            <nav
              aria-label="Estimation wizard steps"
              className={cn(
                "w-full shrink-0 bg-gradient-to-b from-background from-70% to-muted/60 sm:border-r sm:border-border",
                stepsNavCollapsed ? "sm:w-16 sm:px-2" : "sm:w-52 sm:pr-4 sm:pl-2"
              )}
            >
              <div className="flex items-center justify-between gap-2 pt-6">
                {!stepsNavCollapsed && (
                  <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    Estimation Steps
                  </h2>
                )}
                <button
                  type="button"
                  onClick={() => setStepsNavCollapsed((v) => !v)}
                  aria-label={stepsNavCollapsed ? "Expand steps" : "Collapse steps"}
                  className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {stepsNavCollapsed ? (
                    <CaretRight className="h-3.5 w-3.5" />
                  ) : (
                    <CaretLeft className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
              <ul className="relative flex flex-col gap-1 py-6">
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute top-11 bottom-11 w-px bg-border",
                    stepsNavCollapsed ? "left-1/2" : "left-[22px]"
                  )}
                />
                {wizardSteps.map((step, index) => {
                  const active = step.id === activeStep;
                  const completed = completedSteps.has(step.id);
                  const circle = (
                    <span
                      className={cn(
                        "relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                        active || completed
                          ? "bg-gradient-to-br from-primary to-rose-600 text-primary-foreground shadow-sm"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {completed && !active ? (
                        <Check className="h-3.5 w-3.5" weight="bold" />
                      ) : (
                        index + 1
                      )}
                    </span>
                  );
                  return (
                    <li key={step.id}>
                      {stepsNavCollapsed ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              onClick={() => setActiveStep(step.id)}
                              className={cn(
                                "flex w-full flex-col items-center gap-2 rounded-lg py-2 transition-colors",
                                active ? "bg-primary/5" : "hover:bg-muted"
                              )}
                            >
                              {circle}
                              {active && (
                                <span className="[text-orientation:sideways] [writing-mode:vertical-rl] rotate-180 py-1 text-xs font-semibold whitespace-nowrap text-primary-text">
                                  {step.title}
                                </span>
                              )}
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="right">{step.title}</TooltipContent>
                        </Tooltip>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setActiveStep(step.id)}
                          className={cn(
                            "flex w-full items-start gap-2 rounded-lg px-2.5 py-2 text-left transition-colors",
                            active ? "bg-primary/5" : "hover:bg-muted"
                          )}
                        >
                          {circle}
                          <span className="min-w-0">
                            <span className="block text-sm font-medium text-foreground">
                              {step.title}
                            </span>
                            <span className="block text-xs text-muted-foreground">
                              {step.subtitle}
                            </span>
                          </span>
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="min-h-0 min-w-0 flex-1 overflow-y-auto bg-white py-6 pr-6 pl-6 dark:bg-neutral-900">
              {activeStep === "profile-scope" ? (
                <div className="flex flex-col gap-4">
              <div
                className={cn(
                  "rounded-lg border border-border bg-card shadow-sm",
                  profileCollapsed ? "p-0" : "p-6"
                )}
              >
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setProfileCollapsed((v) => !v)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setProfileCollapsed((v) => !v);
                    }
                  }}
                  aria-expanded={!profileCollapsed}
                  className={cn(
                    "cursor-pointer bg-muted/50 px-6 py-4 text-left transition-colors hover:bg-muted/70",
                    profileCollapsed
                      ? "rounded-lg"
                      : "-mx-6 -mt-6 mb-4 w-[calc(100%+3rem)] rounded-t-lg border-b border-border"
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5">
                      <h2 className="bg-gradient-to-r from-primary to-neutral-900 bg-clip-text text-base font-semibold text-transparent dark:to-neutral-100">
                        Customer &amp; project profile
                      </h2>
                      <FieldHelp text="Basic customer context and delivery parameters used across every estimation step." />
                    </div>
                    <CaretDown
                      aria-hidden="true"
                      className={cn(
                        "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                        profileCollapsed && "-rotate-90"
                      )}
                    />
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Core details used throughout this estimate.
                  </p>
                </div>
                {!profileCollapsed && (
                <>
                <div className="mt-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="hqLocation" className="flex items-center gap-1.5 text-sm">
                        HQ Location
                      </Label>
                      <Input
                        id="hqLocation"
                        value={hqLocation}
                        onChange={(e) => setHqLocation(e.target.value)}
                        placeholder="Enter headquarters"
                        name="hqLocation"
                        autoComplete="off"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="industry" className="flex items-center gap-1.5 text-sm">
                        Industry
                      </Label>
                      <Input
                        id="industry"
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        placeholder="Enter industry"
                        name="industry"
                        autoComplete="off"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="goLiveDate" className="flex items-center gap-1.5 text-sm">
                        Go-Live Target
                      </Label>
                      <Input
                        id="goLiveDate"
                        type="date"
                        value={goLiveDate}
                        onChange={(e) => setGoLiveDate(e.target.value)}
                        name="goLiveDate"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="durationWeeks" className="flex items-center gap-1.5 text-sm">
                        Duration (weeks)
                      </Label>
                      <Input
                        id="durationWeeks"
                        type="number"
                        min={1}
                        value={durationWeeks}
                        onChange={(e) => setDurationWeeks(e.target.value)}
                        name="durationWeeks"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="hoursPerDay" className="flex items-center gap-1.5 text-sm">
                        Hours / Day
                      </Label>
                      <Input
                        id="hoursPerDay"
                        type="number"
                        min={1}
                        max={24}
                        value={hoursPerDay}
                        onChange={(e) => setHoursPerDay(e.target.value)}
                        name="hoursPerDay"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="trainingType" className="flex items-center gap-1.5 text-sm">
                        Training Type
                      </Label>
                      <Select value={trainingType} onValueChange={setTrainingType}>
                        <SelectTrigger id="trainingType" className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="end-user">End User</SelectItem>
                          <SelectItem value="train-the-trainer">
                            Train-the-Trainer
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="maxPersonsPerTraining" className="flex items-center gap-1.5 text-sm">
                        Max Persons / Training
                      </Label>
                      <Input
                        id="maxPersonsPerTraining"
                        type="number"
                        min={1}
                        value={maxPersonsPerTraining}
                        onChange={(e) => setMaxPersonsPerTraining(e.target.value)}
                        placeholder="Enter max persons per training"
                        name="maxPersonsPerTraining"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="swtCycles" className="flex items-center gap-1.5 text-sm">
                        SWT Cycles (1–3)
                        <FieldHelp text="Number of Solution Walkthrough cycles." />
                      </Label>
                      <Input
                        id="swtCycles"
                        type="number"
                        min={1}
                        max={3}
                        value={swtCycles}
                        onChange={(e) => setSwtCycles(e.target.value)}
                        name="swtCycles"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="flex items-center gap-2 text-sm text-foreground">
                      <Checkbox
                        checked={thirdParty}
                        onCheckedChange={(checked) => setThirdParty(checked === true)}
                      />
                      3rd-party PMO / audit involved
                    </label>
                  </div>
                </div>

                <div className="mt-5">
                  <div className="flex items-center gap-1.5">
                    <h2 className="text-sm font-semibold text-foreground">
                      SAP products
                    </h2>
                    <span className="text-xs font-medium text-muted-foreground">
                      {sapProducts.size} selected
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {sapProductOptions.map((product) => {
                      const selected = sapProducts.has(product);
                      return (
                        <button
                          key={product}
                          type="button"
                          onClick={() => toggleSapProduct(product)}
                          className={cn(
                            "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                            selected
                              ? "border-primary bg-primary/10 text-primary-text"
                              : "border-transparent bg-muted text-foreground hover:bg-muted/70"
                          )}
                        >
                          {product}
                        </button>
                      );
                    })}
                  </div>
                </div>
                </>
                )}
              </div>

              <div className="mt-5 rounded-lg border border-border bg-card p-6 shadow-sm">
                <div className="-mx-6 -mt-6 mb-4 w-[calc(100%+3rem)] rounded-t-lg border-b border-border bg-muted/50 px-6 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h2 className="bg-gradient-to-r from-primary to-neutral-900 bg-clip-text text-base font-semibold text-transparent dark:to-neutral-100">
                          Org-Complexity Drivers ({defaultOrgComplexityFactors.length})
                        </h2>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Default Low is taken for computation if a driver is not provided as input.
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-7 gap-1.5"
                        onClick={() => setOrgReviewOpen(true)}
                      >
                        Review inputs
                        <Badge
                          variant="outline"
                          className="rounded-md border-amber-200 bg-amber-50 px-1.5 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-400"
                        >
                          {pendingCount}
                        </Badge>
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      {defaultOrgComplexityFactors.map((factor) => {
                        const meta = driverFieldMeta[factor.key];
                        const value = driverValues[factor.key] ?? "";
                        return (
                          <div key={factor.key} className="flex flex-col gap-1.5">
                            <Label htmlFor={`driver-${factor.key}`} className="flex items-center gap-1.5 text-sm">
                              {factor.label}
                            </Label>
                            {meta.type === "select" ? (
                              <Select
                                value={value || undefined}
                                onValueChange={(v) => setDriverValue(factor.key, v)}
                              >
                                <SelectTrigger id={`driver-${factor.key}`} className="w-full">
                                  <SelectValue placeholder={meta.placeholder} />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Low">Low</SelectItem>
                                  <SelectItem value="Medium">Medium</SelectItem>
                                  <SelectItem value="High">High</SelectItem>
                                </SelectContent>
                              </Select>
                            ) : (
                              <Input
                                id={`driver-${factor.key}`}
                                value={value}
                                onChange={(e) => setDriverValue(factor.key, e.target.value)}
                                placeholder={meta.placeholder}
                                name={factor.key}
                                autoComplete="off"
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
                </div>
              ) : activeStep === "scope-selection" ? (
                <ScopeSelectionStep
                  key={`scope-selection-${resetSignal}`}
                  onInScopeChange={setScopeCount}
                  onSelectedItemsChange={setScopeItems}
                  selectedProducts={Array.from(sapProducts)}
                />
              ) : activeStep === "fricew" ? (
                <FricewStep key={`fricew-${resetSignal}`} onTotalsChange={setFricewTotals} />
              ) : activeStep === "testing-training" ? (
                <TestingTrainingStep
                  key={`testing-training-${resetSignal}`}
                  wricefObjects={fricewTotals.objects}
                  endUsers={Number(driverValues["end-users"]) || 0}
                  inScopeCount={scopeCount}
                  swtCyclesFromStepA={Number(swtCycles) || 0}
                  maxPersonsPerTraining={Number(maxPersonsPerTraining) || 0}
                />
              ) : activeStep === "effort-estimate" ? (
                <EffortEstimateStep
                  inScopeGsis={scopeCount}
                  driversProvided={defaultOrgComplexityFactors.length - pendingCount}
                  driversTotal={defaultOrgComplexityFactors.length}
                  durationWeeks={Number(durationWeeks) || 52}
                  hoursPerDay={Number(hoursPerDay) || 8}
                  industry={industry}
                  orgMultiplier={orgMultiplier}
                  selectedGsis={scopeItems}
                  assumptions={assumptionRows}
                />
              ) : (
                <ComingSoonStep title={wizardSteps[currentStepIndex]?.title ?? ""} />
              )}
            </div>
      </div>

      <div className="shrink-0 border-t border-border bg-background">
        <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Button
            type="button"
            variant="outline"
            className="gap-1.5"
            onClick={handleBack}
            disabled={currentStepIndex === 0}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={handleResetCurrentStep}>
              Reset to Defaults
            </Button>
            <Button type="button" onClick={handleSaveNext} disabled={currentStepIndex === wizardSteps.length - 1}>
              {currentStepIndex === wizardSteps.length - 1 ? "Save" : "Save & Next"}
            </Button>
          </div>
        </div>
      </div>

      <Sheet open={orgReviewOpen} onOpenChange={setOrgReviewOpen}>
        <SheetContent side="right" className="w-full sm:max-w-2xl!">
          <SheetHeader>
            <SheetTitle>Org Complexity Multiplier</SheetTitle>
            <SheetDescription>
              The overall complexity score, averaged across all drivers below. It scales
              Delivery and PMO effort estimates up or down.
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-foreground tabular-nums">
                {orgMultiplier.toFixed(4)}
              </span>
              <span className="text-sm text-muted-foreground">Overall</span>
              <Badge
                variant="outline"
                className={cn("rounded-md px-1.5", levelBadgeClass(overall))}
              >
                {overall}
              </Badge>
            </div>

            <div className="mt-2 flex items-center gap-3 text-xs font-medium">
              <span className="text-rose-600 dark:text-rose-400">{levelCounts.H} H</span>
              <span className="text-amber-600 dark:text-amber-400">{levelCounts.M} M</span>
              <span className="text-emerald-600 dark:text-emerald-400">
                {levelCounts.L} L
              </span>
            </div>

            <div className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold">Factor</TableHead>
                    <TableHead className="font-semibold">Value</TableHead>
                    <TableHead className="font-semibold">Lvl</TableHead>
                    <TableHead className="text-right font-semibold">Mult</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayedFactors.map((factor) => (
                    <TableRow key={factor.key}>
                      <TableCell className="text-primary-text">{factor.label}</TableCell>
                      <TableCell className="text-muted-foreground italic">
                        {factor.value}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn("rounded-md px-1.5", levelBadgeClass(factor.level))}
                        >
                          {factor.level}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {factor.multiplier.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </SidebarInset>
  );
}

function ComingSoonStep({ title }: { title: string }): ReactNode {
  return (
    <div className="mt-4 flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border py-20 text-center">
      <p className="text-sm font-medium text-foreground">{title} isn&rsquo;t built yet</p>
      <p className="max-w-sm text-sm text-muted-foreground">
        This step of the Estimation Wizard is still in progress. Start with
        Step A — Profile &amp; Scope, which is fully wired up.
      </p>
    </div>
  );
}
