export interface MasterDataCategory {
  slug: string;
  title: string;
  description: string;
  rowCount: number;
  version: string;
  image?: string;
  breakdown?: { label: string; count: number }[];
}

export const masterDataCategories: MasterDataCategory[] = [
  {
    slug: "gsi-catalog",
    title: "GSI Catalog",
    description:
      "Global Scope Items by product, business area, and process. Complexity and level shown are defaults — set your project's actual values in Scope Selection.",
    rowCount: 1335,
    version: "v2",
    image: "/gsi-catalog-illustration-v3.png",
    breakdown: [
      { label: "Ariba", count: 125 },
      { label: "S4H_OnPrem", count: 372 },
      { label: "S4H_Cloud", count: 718 },
      { label: "SuccessFactors", count: 120 },
    ],
  },
  {
    slug: "activity-effort",
    title: "Activity Effort",
    description: "Base hours per activity by scope level and complexity",
    rowCount: 38,
    version: "v1",
    image: "/activity-effort-illustration-v2.png",
  },
  {
    slug: "fricew-objects",
    title: "FRICEW Objects",
    description: "Effort (md) per custom object type and complexity",
    rowCount: 8,
    version: "v1",
    image: "/fricew-objects-illustration-v3.png",
  },
  {
    slug: "org-complexity",
    title: "Org Complexity",
    description: "Organisational drivers and their effort multipliers",
    rowCount: 15,
    version: "v1",
    image: "/org-complexity-illustration-v2.png",
  },
  {
    slug: "roles",
    title: "Roles",
    description: "Delivery roles and their effort-distribution factors",
    rowCount: 12,
    version: "v1",
    image: "/roles-illustration-v2.png",
  },
  {
    slug: "thresholds-switches",
    title: "Thresholds & Switches",
    description: "Global calculation parameters and feature switches",
    rowCount: 1,
    version: "v1",
    image: "/thresholds-switches-illustration-v2.png",
  },
  {
    slug: "phase-template",
    title: "Phase Template",
    description: "KDM phase / deliverable / activity plan skeleton",
    rowCount: 10,
    version: "v1",
    image: "/phase-template-illustration-v2.png",
  },
];

export function getCategory(slug: string) {
  return masterDataCategories.find((c) => c.slug === slug);
}

// ---------------------------------------------------------------------------
// GSI Catalog
// ---------------------------------------------------------------------------

export type GsiInstanceDriver =
  | "Fixed1"
  | "LegalEntities"
  | "Countries"
  | "Plants"
  | "SalesOrg"
  | "PurchaseUnits"
  | "Currencies";

export interface GsiCatalogRow {
  id: string;
  product: string;
  l1BusinessArea: string;
  l2ProcessGroup: string;
  l3BusinessProcess: string;
  processId: string;
  description?: string;
  defaultLevel: "L3" | "L4" | "L5";
  defaultComplexity: "L" | "M" | "H";
  defaultInstanceDriver: GsiInstanceDriver;
  status: "Active" | "Inactive";
}

const GSI_BUSINESS_AREAS = [
  "Buy & Receive",
  "Finance",
  "Supply Chain",
  "Sales",
  "HR",
  "Manufacturing",
  "Logistics",
  "Master Data",
  "Compliance",
  "Reporting",
];

const GSI_PROCESS_GROUPS = [
  "Admin",
  "Business Network",
  "Content Management",
  "Approval Workflow",
  "Data Migration",
  "Integration",
  "Reporting",
  "Testing",
  "Cutover",
  "Enhancement",
];

const GSI_PROCESS_NAMES = [
  "Setup & Configuration",
  "Approval Workflow",
  "Data Load",
  "Validation & Approval",
  "Notification & Activation",
  "Monitoring & Reporting",
  "Catalog Management",
  "Contract Management",
  "Spot Buy Management",
  "Guided Buying",
  "Release Management",
  "Change Request Handling",
];

const GSI_LEVELS = ["L3", "L4", "L5"] as const;
const GSI_COMPLEXITIES = ["L", "M", "H"] as const;
const GSI_INSTANCE_DRIVERS: GsiInstanceDriver[] = [
  "Fixed1",
  "LegalEntities",
  "Countries",
  "Plants",
  "SalesOrg",
  "PurchaseUnits",
  "Currencies",
];

function generateGsiRows(product: string, count: number): GsiCatalogRow[] {
  const rows: GsiCatalogRow[] = [];
  for (let i = 0; i < count; i++) {
    const area = GSI_BUSINESS_AREAS[i % GSI_BUSINESS_AREAS.length];
    const group =
      GSI_PROCESS_GROUPS[Math.floor(i / GSI_BUSINESS_AREAS.length) % GSI_PROCESS_GROUPS.length];
    const process = GSI_PROCESS_NAMES[i % GSI_PROCESS_NAMES.length];
    const level = GSI_LEVELS[i % GSI_LEVELS.length];
    const complexity = GSI_COMPLEXITIES[(i + Math.floor(i / 3)) % GSI_COMPLEXITIES.length];
    const driver = GSI_INSTANCE_DRIVERS[i % GSI_INSTANCE_DRIVERS.length];
    rows.push({
      id: `${product}-${i + 1}`,
      product,
      l1BusinessArea: area,
      l2ProcessGroup: group,
      l3BusinessProcess: process,
      processId: "—",
      defaultLevel: level,
      defaultComplexity: complexity,
      defaultInstanceDriver: driver,
      status: i % 47 === 0 ? "Inactive" : "Active",
    });
  }
  return rows;
}

export const gsiCatalogRows: GsiCatalogRow[] = [
  ...generateGsiRows("Ariba", 125),
  ...generateGsiRows("S4H_OnPrem", 372),
  ...generateGsiRows("S4H_Cloud", 718),
  ...generateGsiRows("SuccessFactors", 120),
];

// ---------------------------------------------------------------------------
// Activity Effort
// ---------------------------------------------------------------------------

export interface ActivityEffortRow {
  id: string;
  activity: string;
  scopeLevel: "L1" | "L2" | "L3";
  complexity: "Standard" | "Complex";
  baseHours: number;
}

const ACTIVITIES: { name: string; standardHours: number; complexHours: number }[] = [
  { name: "Requirements Workshop", standardHours: 8, complexHours: 16 },
  { name: "Fit-Gap Analysis", standardHours: 6, complexHours: 14 },
  { name: "Configuration", standardHours: 12, complexHours: 28 },
  { name: "Unit Testing", standardHours: 4, complexHours: 10 },
  { name: "Integration Testing", standardHours: 8, complexHours: 20 },
  { name: "UAT Support", standardHours: 6, complexHours: 12 },
  { name: "Data Migration Mapping", standardHours: 10, complexHours: 24 },
  { name: "Data Migration Load", standardHours: 8, complexHours: 18 },
  { name: "Interface Build", standardHours: 16, complexHours: 40 },
  { name: "Custom Development", standardHours: 20, complexHours: 48 },
  { name: "Security & Authorizations", standardHours: 8, complexHours: 18 },
  { name: "Training Material", standardHours: 6, complexHours: 12 },
  { name: "End-User Training", standardHours: 4, complexHours: 8 },
  { name: "Cutover Planning", standardHours: 8, complexHours: 16 },
  { name: "Cutover Execution", standardHours: 10, complexHours: 22 },
  { name: "Hypercare Support", standardHours: 12, complexHours: 24 },
  { name: "Documentation", standardHours: 4, complexHours: 8 },
  { name: "Change Impact Assessment", standardHours: 5, complexHours: 10 },
  { name: "Go-Live Readiness Review", standardHours: 6, complexHours: 12 },
];

export const activityEffortRows: ActivityEffortRow[] = ACTIVITIES.flatMap((a, i) => [
  {
    id: `activity-${i}-standard`,
    activity: a.name,
    scopeLevel: (["L1", "L2", "L3"] as const)[i % 3],
    complexity: "Standard" as const,
    baseHours: a.standardHours,
  },
  {
    id: `activity-${i}-complex`,
    activity: a.name,
    scopeLevel: (["L1", "L2", "L3"] as const)[i % 3],
    complexity: "Complex" as const,
    baseHours: a.complexHours,
  },
]);

// ---------------------------------------------------------------------------
// FRICEW Objects
// ---------------------------------------------------------------------------

export interface FricewObjectRow {
  id: string;
  objectType: "Form" | "Report" | "Interface" | "Conversion" | "Enhancement" | "Workflow";
  complexity: "Simple" | "Medium" | "Complex" | "Very Complex";
  effortMd: number;
}

export const fricewObjectRows: FricewObjectRow[] = [
  { id: "fricew-1", objectType: "Form", complexity: "Simple", effortMd: 2 },
  { id: "fricew-2", objectType: "Form", complexity: "Complex", effortMd: 6 },
  { id: "fricew-3", objectType: "Report", complexity: "Simple", effortMd: 3 },
  { id: "fricew-4", objectType: "Report", complexity: "Complex", effortMd: 8 },
  { id: "fricew-5", objectType: "Interface", complexity: "Medium", effortMd: 10 },
  { id: "fricew-6", objectType: "Interface", complexity: "Very Complex", effortMd: 20 },
  { id: "fricew-7", objectType: "Conversion", complexity: "Medium", effortMd: 5 },
  { id: "fricew-8", objectType: "Enhancement", complexity: "Complex", effortMd: 12 },
];

// ---------------------------------------------------------------------------
// Org Complexity
// ---------------------------------------------------------------------------

export interface OrgComplexityRow {
  id: string;
  driver: string;
  description: string;
  multiplier: number;
}

export const orgComplexityRows: OrgComplexityRow[] = [
  { id: "org-1", driver: "Number of Legal Entities", description: "Per legal entity beyond the first", multiplier: 1.05 },
  { id: "org-2", driver: "Number of Countries", description: "Per country beyond the first (localization)", multiplier: 1.08 },
  { id: "org-3", driver: "Number of Languages", description: "Per additional language for UI/output", multiplier: 1.03 },
  { id: "org-4", driver: "Multi-Currency", description: "Enabled at any legal entity", multiplier: 1.1 },
  { id: "org-5", driver: "Number of Plants", description: "Per manufacturing plant beyond the first", multiplier: 1.04 },
  { id: "org-6", driver: "Custom Chart of Accounts", description: "Non-standard COA structure", multiplier: 1.12 },
  { id: "org-7", driver: "Shared Services Model", description: "Centralized finance / HR operations", multiplier: 1.07 },
  { id: "org-8", driver: "Existing System Landscape Complexity", description: "Number of systems to integrate with", multiplier: 1.15 },
  { id: "org-9", driver: "Regulatory / Compliance Scope", description: "Industry-specific compliance requirements", multiplier: 1.1 },
  { id: "org-10", driver: "Data Volume", description: "High-volume master or transactional data", multiplier: 1.06 },
  { id: "org-11", driver: "Custom Approval Hierarchies", description: "Non-standard workflow approval chains", multiplier: 1.08 },
  { id: "org-12", driver: "M&A / Carve-Out Activity", description: "Concurrent merger, acquisition, or divestiture", multiplier: 1.2 },
  { id: "org-13", driver: "Parallel Accounting Ledgers", description: "Statutory + group + tax ledgers", multiplier: 1.09 },
  { id: "org-14", driver: "Business Unit Autonomy", description: "Decentralized decision-making across BUs", multiplier: 1.05 },
  { id: "org-15", driver: "Change Management Readiness", description: "Low organizational readiness for change", multiplier: 1.1 },
];

// ---------------------------------------------------------------------------
// Roles
// ---------------------------------------------------------------------------

export interface RoleRow {
  id: string;
  role: string;
  distributionFactorPct: number;
}

export const rolesRows: RoleRow[] = [
  { id: "role-1", role: "Project Manager", distributionFactorPct: 10 },
  { id: "role-2", role: "Solution Architect", distributionFactorPct: 8 },
  { id: "role-3", role: "Functional Consultant (Finance)", distributionFactorPct: 14 },
  { id: "role-4", role: "Functional Consultant (Procurement)", distributionFactorPct: 12 },
  { id: "role-5", role: "Functional Consultant (Sales)", distributionFactorPct: 12 },
  { id: "role-6", role: "Technical Consultant / ABAP", distributionFactorPct: 15 },
  { id: "role-7", role: "Integration Specialist", distributionFactorPct: 8 },
  { id: "role-8", role: "Data Migration Lead", distributionFactorPct: 7 },
  { id: "role-9", role: "Basis / Security Consultant", distributionFactorPct: 5 },
  { id: "role-10", role: "Quality Assurance Lead", distributionFactorPct: 4 },
  { id: "role-11", role: "Change Management Lead", distributionFactorPct: 3 },
  { id: "role-12", role: "Training Lead", distributionFactorPct: 2 },
];

// ---------------------------------------------------------------------------
// Thresholds & Switches (single settings record)
// ---------------------------------------------------------------------------

export interface ThresholdSwitchField {
  key: string;
  label: string;
  value: string;
  description: string;
}

export const thresholdSwitchFields: ThresholdSwitchField[] = [
  { key: "contingency_pct", label: "Contingency", value: "12%", description: "Applied on top of the calculated base effort" },
  { key: "pm_overhead_pct", label: "PM & Governance Overhead", value: "10%", description: "Project management and governance overhead" },
  { key: "travel_multiplier", label: "Travel Multiplier", value: "1.05×", description: "Applied when onsite travel is required" },
  { key: "offshore_ratio", label: "Onsite / Offshore Ratio", value: "40 / 60", description: "Default delivery split used in staffing plans" },
  { key: "working_hours_per_day", label: "Working Hours per Day", value: "8", description: "Used to convert man-days to hours" },
  { key: "working_days_per_month", label: "Working Days per Month", value: "20", description: "Used to convert man-days to duration" },
  { key: "enable_fricew_switch", label: "Enable FRICEW Effort", value: "On", description: "Include custom-object effort in the estimate" },
  { key: "enable_org_complexity_switch", label: "Enable Org Complexity Multipliers", value: "On", description: "Apply organisational-driver multipliers" },
];

// ---------------------------------------------------------------------------
// Phase Template (KDM)
// ---------------------------------------------------------------------------

export interface PhaseTemplateRow {
  id: string;
  sequence: number;
  phase: "Prepare" | "Explore" | "Realize" | "Deploy" | "Run";
  deliverable: string;
  activity: string;
}

export const phaseTemplateRows: PhaseTemplateRow[] = [
  { id: "phase-1", sequence: 1, phase: "Prepare", deliverable: "Project Charter", activity: "Kickoff & Governance Setup" },
  { id: "phase-2", sequence: 2, phase: "Prepare", deliverable: "Project Plan", activity: "Scope & Timeline Confirmation" },
  { id: "phase-3", sequence: 3, phase: "Explore", deliverable: "Fit-Gap Register", activity: "Requirements Workshops" },
  { id: "phase-4", sequence: 4, phase: "Explore", deliverable: "Solution Design", activity: "Business Process Design" },
  { id: "phase-5", sequence: 5, phase: "Realize", deliverable: "Configured System", activity: "Configuration & Build" },
  { id: "phase-6", sequence: 6, phase: "Realize", deliverable: "Test Scripts & Results", activity: "Unit / Integration Testing" },
  { id: "phase-7", sequence: 7, phase: "Realize", deliverable: "Migrated Data", activity: "Data Migration Execution" },
  { id: "phase-8", sequence: 8, phase: "Deploy", deliverable: "Cutover Plan", activity: "Cutover Rehearsal & Execution" },
  { id: "phase-9", sequence: 9, phase: "Deploy", deliverable: "Go-Live Sign-off", activity: "Go-Live & Hypercare" },
  { id: "phase-10", sequence: 10, phase: "Run", deliverable: "Transition Report", activity: "Handover to Support" },
];
