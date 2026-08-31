"use client";

import { use, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CaretLineLeft,
  CaretLineRight,
  Check,
  Question,
  CopySimple,
  Trash,
} from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
import { cn } from "@/lib/utils";
import { ScopeSelectionStep } from "@/components/scope-selection-step";
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
  const [fricewTotals, setFricewTotals] = useState({ objects: 0, devHours: 0 });
  const [statsExpanded, setStatsExpanded] = useState(true);
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
        <div className="mx-auto w-full max-w-[1400px] px-6 py-3">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
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
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    View more
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Label className="text-xs font-medium tracking-wide text-muted-foreground">
                  Status
                </Label>
                <Select
                  value={project.status}
                  onValueChange={(value) =>
                    updateProjectStatus(project.id, value as Project["status"])
                  }
                >
                  <SelectTrigger className="h-8 w-36">
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
              <Button variant="outline" onClick={handleClone} className="h-8 gap-1.5">
                <CopySimple className="h-4 w-4" />
                Clone
              </Button>
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
                className="text-sm font-medium text-primary hover:underline"
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
                "w-full shrink-0 bg-background sm:border-r sm:border-border",
                stepsNavCollapsed ? "sm:w-16 sm:px-2" : "sm:w-64 sm:pr-4 sm:pl-2"
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
                    <CaretLineRight className="h-3.5 w-3.5" />
                  ) : (
                    <CaretLineLeft className="h-3.5 w-3.5" />
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
                          ? "bg-primary text-primary-foreground"
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
                                <span className="[text-orientation:sideways] [writing-mode:vertical-rl] rotate-180 py-1 text-xs font-semibold whitespace-nowrap text-primary">
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

            <div className="min-h-0 min-w-0 flex-1 overflow-y-auto bg-sidebar py-6 pr-3 pl-4">
              {activeStep === "profile-scope" ? (
                <div className="flex flex-col gap-4">
              <Card className="gap-0 overflow-hidden rounded-lg py-0">
                <div className="flex items-center gap-1.5 border-b border-border bg-muted/40 px-5 py-4">
                  <h2 className="text-base font-semibold text-card-foreground">
                    Customer &amp; Project Profile
                  </h2>
                  <FieldHelp text="Basic customer context and delivery parameters used across every estimation step." />
                </div>
                <CardContent className="px-5 py-5">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="flex flex-col gap-1.5">
                      <Label className="flex items-center gap-1.5 text-sm">
                        HQ Location
                        <FieldHelp text="Customer's primary location or headquarters." />
                      </Label>
                      <Input
                        value={hqLocation}
                        onChange={(e) => setHqLocation(e.target.value)}
                        placeholder="Enter headquarters"
                        name="hqLocation"
                        autoComplete="off"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label className="flex items-center gap-1.5 text-sm">
                        Industry
                        <FieldHelp text="Customer industry, such as SAP, Manufacturing, Retail, or Services." />
                      </Label>
                      <Input
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        placeholder="Enter industry"
                        name="industry"
                        autoComplete="off"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Label className="flex items-center gap-1.5 text-sm">
                        Go-Live Target
                        <FieldHelp text="Expected production go-live date." />
                      </Label>
                      <Input
                        type="date"
                        value={goLiveDate}
                        onChange={(e) => setGoLiveDate(e.target.value)}
                        name="goLiveDate"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label className="flex items-center gap-1.5 text-sm">
                        Duration (weeks)
                        <FieldHelp text="Total planned project duration in weeks." />
                      </Label>
                      <Input
                        type="number"
                        min={1}
                        value={durationWeeks}
                        onChange={(e) => setDurationWeeks(e.target.value)}
                        name="durationWeeks"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Label className="flex items-center gap-1.5 text-sm">
                        Hours / Day
                        <FieldHelp text="Working hours in one person-day." />
                      </Label>
                      <Input
                        type="number"
                        min={1}
                        max={24}
                        value={hoursPerDay}
                        onChange={(e) => setHoursPerDay(e.target.value)}
                        name="hoursPerDay"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label className="flex items-center gap-1.5 text-sm">
                        Training Type
                        <FieldHelp text="Training approach such as End User or Train-the-Trainer." />
                      </Label>
                      <Select value={trainingType} onValueChange={setTrainingType}>
                        <SelectTrigger className="w-full">
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
                      <Label className="flex items-center gap-1.5 text-sm">
                        Max Persons / Training
                        <FieldHelp text="Maximum participants per training session." />
                      </Label>
                      <Input
                        type="number"
                        min={1}
                        value={maxPersonsPerTraining}
                        onChange={(e) => setMaxPersonsPerTraining(e.target.value)}
                        placeholder="Enter max persons per training"
                        name="maxPersonsPerTraining"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label className="flex items-center gap-1.5 text-sm">
                        SWT Cycles (1–3)
                        <FieldHelp text="Number of Solution Walkthrough cycles." />
                      </Label>
                      <Input
                        type="number"
                        min={1}
                        max={3}
                        value={swtCycles}
                        onChange={(e) => setSwtCycles(e.target.value)}
                        name="swtCycles"
                      />
                    </div>
                  </div>

                  <label className="mt-4 flex items-center gap-2 text-sm text-foreground">
                    <Checkbox
                      checked={thirdParty}
                      onCheckedChange={(checked) => setThirdParty(checked === true)}
                    />
                    3rd-party PMO / audit involved
                    <FieldHelp text="Review overhead when an external PMO/audit party is involved." />
                  </label>

                  <div className="mt-4">
                    <Label className="flex items-center gap-1.5 text-sm">
                      SAP Products
                      <FieldHelp text="SAP product family, such as S/4HANA On-Prem or S/4HANA Cloud." />
                    </Label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {sapProductOptions.map((product) => {
                        const selected = sapProducts.has(product);
                        return (
                          <button
                            key={product}
                            type="button"
                            onClick={() => toggleSapProduct(product)}
                            className={cn(
                              "rounded-md border px-3 py-1.5 text-sm font-medium transition-colors",
                              selected
                                ? "border-primary bg-primary/5 text-primary"
                                : "border-input bg-transparent text-foreground hover:bg-muted"
                            )}
                          >
                            {product}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="gap-0 overflow-hidden rounded-lg py-0">
                <div className="flex items-center justify-between gap-3 border-b border-border bg-muted/40 px-5 py-4">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h2 className="text-base font-semibold text-card-foreground">
                        Org-Complexity Drivers ({defaultOrgComplexityFactors.length})
                      </h2>
                      <FieldHelp text="Numeric drivers compare against Low/Medium thresholds; picklist drivers map directly to a level. Blank stays Low." />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Default Low is taken for computation if a driver is not provided as input.
                    </p>
                  </div>
                  <span className="shrink-0 text-xs font-medium text-amber-600 dark:text-amber-400">
                    {pendingCount} fields pending
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px]">
                  <div className="border-border p-5 lg:border-r">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {defaultOrgComplexityFactors.map((factor) => {
                        const meta = driverFieldMeta[factor.key];
                        const value = driverValues[factor.key] ?? "";
                        return (
                          <div key={factor.key} className="flex flex-col gap-1.5">
                            <Label className="flex items-center gap-1.5 text-sm">
                              {factor.label}
                              <FieldHelp text={meta.help} />
                            </Label>
                            {meta.type === "select" ? (
                              <Select
                                value={value || undefined}
                                onValueChange={(v) => setDriverValue(factor.key, v)}
                              >
                                <SelectTrigger className="w-full">
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

                  <div className="p-5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium text-muted-foreground">
                        Org Complexity Multiplier
                      </span>
                      <FieldHelp text="orgMultiplier = round(average(all mapped factor multipliers), 4). Applies one overall complexity adjustment to Delivery and PMO effort." />
                    </div>

                    <div className="mt-1 flex items-center gap-2">
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
                      <span className="text-rose-600 dark:text-rose-400">
                        {levelCounts.H} H
                      </span>
                      <span className="text-amber-600 dark:text-amber-400">
                        {levelCounts.M} M
                      </span>
                      <span className="text-emerald-600 dark:text-emerald-400">
                        {levelCounts.L} L
                      </span>
                    </div>

                    <div className="mt-3">
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
                              <TableCell className="text-primary">
                                {factor.label}
                              </TableCell>
                              <TableCell className="text-muted-foreground italic">
                                {factor.value}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "rounded-md px-1.5",
                                    levelBadgeClass(factor.level)
                                  )}
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
                </div>
              </Card>
                </div>
              ) : activeStep === "scope-selection" ? (
                <ScopeSelectionStep
                  key={`scope-selection-${resetSignal}`}
                  onInScopeChange={setScopeCount}
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
