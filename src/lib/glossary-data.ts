export interface GlossaryRow {
  id: string;
  term: string;
  meaning: string;
  drives: string;
}

export interface GlossarySection {
  id: string;
  navLabel: string;
  title: string;
  note?: string;
  rows: GlossaryRow[];
}

export const glossarySections: GlossarySection[] = [
  {
    id: "project-inputs",
    navLabel: "Project Inputs",
    title: "Project Profile Inputs",
    rows: [
      {
        id: "headquarters",
        term: "Headquarters",
        meaning: "Customer's primary location or headquarters.",
        drives: "Used for project context and exports; it does not directly change effort.",
      },
      {
        id: "industry",
        term: "Industry / Vertical",
        meaning: "Customer industry, such as SAP, Manufacturing, Retail, or Services.",
        drives: "Used to narrow catalog/search context and describe the estimate.",
      },
      {
        id: "go-live",
        term: "Target Go-Live Date",
        meaning: "Expected production go-live date.",
        drives: "Used for project planning context; duration weeks is the value used in calculations.",
      },
      {
        id: "duration-weeks",
        term: "Duration Weeks",
        meaning: "Total planned project duration in weeks.",
        drives: "Splits effort into phase capacity and timeline views.",
      },
      {
        id: "hours-per-day",
        term: "Hours / Day",
        meaning: "Working hours in one person-day.",
        drives: "Converts man-days to man-hours and supports FTE/resource capacity.",
      },
      {
        id: "training-type-profile",
        term: "Training Type",
        meaning: "Training approach such as End User or Train-the-Trainer.",
        drives: "Affects training effort and training session assumptions.",
      },
      {
        id: "max-persons-training",
        term: "Max Persons / Training",
        meaning: "Maximum participants per training session.",
        drives: "Training sessions = ceil(end users / max persons per training).",
      },
      {
        id: "swt-cycles",
        term: "SWT Cycles",
        meaning: "Number of Solution Walkthrough cycles.",
        drives: "Multiplies SWT effort by configured cycle count and coverage.",
      },
    ],
  },
  {
    id: "org-drivers",
    navLabel: "Org Drivers",
    title: "Org Complexity Driver Inputs",
    note: "If a driver is left blank, the app treats it as default Low for computation.",
    rows: [
      {
        id: "legal-entities",
        term: "Legal Entities",
        meaning: "Number of legal/company entities in scope.",
        drives: "Used as an org-complexity driver and can repeat GSIs when instance driver is LegalEntities.",
      },
      {
        id: "countries",
        term: "Countries",
        meaning: "Number of countries in rollout/template scope.",
        drives: "Used for complexity and for repeating GSIs with Countries instance driver.",
      },
      {
        id: "plants",
        term: "Plants",
        meaning: "Number of plants, sites, or operational locations.",
        drives: "Used for complexity and for repeating plant-driven scope items.",
      },
      {
        id: "sales-org",
        term: "Sales Org",
        meaning: "Number of sales organizations requiring setup/validation.",
        drives: "Used as an org-complexity driver and possible GSI instance driver.",
      },
      {
        id: "purchase-units",
        term: "Purchase Units",
        meaning: "Number of procurement organizations or purchasing units.",
        drives: "Used as an org-complexity driver and possible GSI instance driver.",
      },
      {
        id: "end-users",
        term: "End Users",
        meaning: "Approximate number of business users affected.",
        drives: "Drives OCM and training-related effort.",
      },
      {
        id: "interfaces",
        term: "Interfaces",
        meaning: "Number of integrations with other systems.",
        drives: "Used as an org-complexity driver.",
      },
      {
        id: "data-migration-objects",
        term: "Data Migration Objects",
        meaning: "Number of data object types to migrate.",
        drives: "Used as an org-complexity driver and data migration sizing input.",
      },
      {
        id: "data-volume",
        term: "Data Volume",
        meaning: "Expected size/scale of data.",
        drives: "Maps to Low/Medium/High complexity through org-complexity rules.",
      },
      {
        id: "geographic-distribution",
        term: "Geographic Distribution",
        meaning: "How spread out the business/users are across locations.",
        drives: "Maps to org complexity and affects the org multiplier.",
      },
      {
        id: "current-system",
        term: "Current System",
        meaning: "Current ERP/system landscape maturity.",
        drives: "Maps to org complexity.",
      },
      {
        id: "data-quality",
        term: "Data Quality",
        meaning: "Expected cleanliness of legacy/master data.",
        drives: "Maps to org complexity and helps reflect migration/testing burden.",
      },
      {
        id: "project-driver",
        term: "Project Driver",
        meaning: "Overall project complexity driver selected by the estimator.",
        drives: "Included in the org-complexity multiplier average.",
      },
    ],
  },
  {
    id: "scope",
    navLabel: "Scope",
    title: "Scope Selection Inputs",
    rows: [
      {
        id: "product",
        term: "Product",
        meaning: "SAP product family, such as S/4HANA On-Prem or S/4HANA Cloud.",
        drives: "Filters the GSI catalog and groups selected scope.",
      },
      {
        id: "business-area",
        term: "Business Area / Process Group",
        meaning: "L1/L2 process hierarchy in the GSI catalog.",
        drives: "Helps users select scope; selected GSIs drive delivery effort.",
      },
      {
        id: "gsi-scope-item",
        term: "GSI / Scope Item",
        meaning: "Business process selected into project scope.",
        drives: "Each selected GSI creates delivery activity effort lines.",
      },
      {
        id: "scope-complexity",
        term: "Complexity",
        meaning: "Project-specific complexity for the selected GSI: Low, Medium, or High.",
        drives: "Picks the correct H/M/L value from the Activity Effort hour grid.",
      },
      {
        id: "scope-level",
        term: "Level",
        meaning: "Scope detail level, such as L3, L4, or L5.",
        drives: "Picks the correct L3/L4/L5 row from the Activity Effort hour grid.",
      },
      {
        id: "instance-driver",
        term: "Instance Driver",
        meaning: "How many times a GSI repeats, such as Fixed1, Countries, Plants, or LegalEntities.",
        drives: "Instances = matching project driver count; effort repeats per instance.",
      },
      {
        id: "sit-uat-fut-flags",
        term: "SIT / UAT / FUT Flags",
        meaning: "Testing applicability for each selected GSI.",
        drives: "Controls whether testing effort is added for that GSI.",
      },
    ],
  },
  {
    id: "fricew",
    navLabel: "FRICEW",
    title: "FRICEW Inputs",
    rows: [
      {
        id: "fricew-object-mode",
        term: "FRICEW Object Mode",
        meaning: "When enabled, object counts replace per-GSI customization activities.",
        drives: "Uses object-type man-days instead of generic customization rows.",
      },
      {
        id: "object-type",
        term: "Object Type",
        meaning: "Custom object category such as Form, Report, Interface, Conversion, Enhancement, or Workflow.",
        drives: "Selects the matching FRICEW master effort row.",
      },
      {
        id: "complexity-counts",
        term: "Low / Medium / High / Very High Counts",
        meaning: "Number of custom objects by complexity.",
        drives: "Multiplied by FRICEW man-days and hours/day.",
      },
    ],
  },
  {
    id: "testing-training",
    navLabel: "Testing & Training",
    title: "Testing & Training Inputs",
    rows: [
      {
        id: "base-sit-uat",
        term: "Base SIT / UAT / Unit Test",
        meaning: "Core testing activities already stored in Activity Effort and counted per in-scope GSI.",
        drives: "Included in the base estimate without Step D toggles. Hours use each GSI's level, complexity, instances, and org multiplier.",
      },
      {
        id: "fut-enabled",
        term: "FUT Enabled",
        meaning: "Turns on the additional Functional User Test cycle.",
        drives: "Adds one FUT line per applicable GSI: FUT std hours x GSI instances x org multiplier.",
      },
      {
        id: "swt-enabled",
        term: "SWT Enabled / Cycles",
        meaning: "Turns on additional Solution Walkthrough cycles, usually 1 to 3 cycles.",
        drives: "Adds cycle-based walkthrough hours using coverage percentages, variants/GSI basis, and WRICEF coverage by cycle.",
      },
      {
        id: "swt-basis",
        term: "SWT Basis",
        meaning: "Quantity basis for SWT sizing: Variant or GSI.",
        drives: "Variant uses each scoped GSI's variant count; GSI counts each selected scope item once.",
      },
      {
        id: "ftg-enabled",
        term: "FTG Enabled / WRICEF per FTG",
        meaning: "Fit-to-Gap workshop sizing for custom objects.",
        drives: "FTG count = ceil(total WRICEF objects / WRICEF per FTG), then workshop hours are added in Explore.",
      },
      {
        id: "sdd-threshold",
        term: "SDD Customization Threshold",
        meaning: "Phase relocation rule for SDD when customization is high.",
        drives: "If customization adjusted hours exceed the configured percentage of Delivery hours, SDD moves from Explore to Realize.",
      },
      {
        id: "ocm-enabled",
        term: "OCM Enabled / Users per Unit",
        meaning: "Organizational Change Management effort based on impacted end users.",
        drives: "OCM units = ceil(end users / users per unit); OCM hours = std hours x units x scaling x org multiplier.",
      },
      {
        id: "third-party-audit",
        term: "3rd-Party Audit Uplift",
        meaning: "Review overhead when an external PMO/audit party is involved.",
        drives: "Adds uplift % on Explore and Realize adjusted hours only when the project profile marks third-party involvement.",
      },
      {
        id: "training-delivery-enabled",
        term: "Training Delivery Enabled",
        meaning: "Turns on training delivery effort in Deploy.",
        drives: "Sessions = ceil(end users / max persons per training); effort uses the training activity used for delivery hours.",
      },
      {
        id: "training-type-testing",
        term: "Training Type",
        meaning: "Training mode: End User or Train-the-Trainer.",
        drives: "Selects the training activity used for delivery hours when training delivery is enabled.",
      },
      {
        id: "training-simulation",
        term: "Training Simulation",
        meaning: "Optional simulation build effort for training content.",
        drives: "Simulation hours = simulation hours per GSI x scoped GSI count x org multiplier.",
      },
    ],
  },
  {
    id: "configuration-masters",
    navLabel: "Configuration",
    title: "Configuration Masters",
    rows: [
      {
        id: "gsi-catalog-master",
        term: "GSI Catalog",
        meaning: "Selectable SAP scope catalog by product, business area, process group, and L3 business process.",
        drives: "Provides suggested default complexity, level, and instance driver when a GSI is added to Step B. Project-level values then drive effort.",
      },
      {
        id: "activity-effort-master",
        term: "Activity Effort",
        meaning: "Base hours by activity, phase, level, and complexity.",
        drives: "Core delivery/PMO effort source used to create estimate lines.",
      },
      {
        id: "org-complexity-master",
        term: "Org Complexity",
        meaning: "Rules and multipliers that convert project drivers to Low/Medium/High.",
        drives: "Creates the org multiplier that adjusts effort.",
      },
      {
        id: "fricew-master",
        term: "FRICEW Master",
        meaning: "Man-days per custom object type and complexity.",
        drives: "Used when FRICEW Object Mode is enabled.",
      },
      {
        id: "phase-template-master",
        term: "Phase Template",
        meaning: "Phase, deliverable, activity, team, and responsible role skeleton.",
        drives: "Supports activity/role planning and fallback role mapping.",
      },
    ],
  },
];

export interface FormulaRow {
  id: string;
  computation: string;
  formula: string;
  why: string;
}

export const formulaSection = {
  id: "formulas",
  navLabel: "Formulas",
  title: "Formula Computations",
};

export const formulaRows: FormulaRow[] = [
  {
    id: "org-level-per-driver",
    computation: "Org Complexity Level Per Driver",
    formula:
      "Numeric: <= lowMax -> L; <= medMax -> M; else H. Picklist/inverse: selected value -> mapped level. Blank/invalid -> L.",
    why: "Turns raw project driver inputs into Low, Medium, or High complexity for each mapped factor.",
  },
  {
    id: "org-multiplier",
    computation: "Org Complexity Multiplier",
    formula: "orgMultiplier = round(average(all mapped factor multipliers), 4)",
    why: "Applies one overall complexity adjustment to Delivery and PMO effort. Current mapped denominator is 15 factors.",
  },
  {
    id: "overall-complexity",
    computation: "Overall Project Complexity",
    formula: "overallLevel = modal level among H/M/L; tie-break: H, then M, then L",
    why: "Chooses the project-level complexity used for PMO and calibration rows.",
  },
  {
    id: "gsi-instance-derivation",
    computation: "GSI Instance Derivation",
    formula:
      "LegalEntities/Countries/Plants/SalesOrg/PurchaseUnits/Currencies -> matching Step A driver; Fixed1 -> 1; blank/non-positive -> 1",
    why: "Repeats a scoped GSI when the process applies across multiple entities, countries, plants, or similar units.",
  },
  {
    id: "gsi-delivery-detail-lines",
    computation: "GSI Delivery Detail Lines",
    formula:
      "stdHrs = activity.hours[gsi.level][gsi.complexity]; baseHrs = stdHrs x instances; adjHrs = baseHrs x orgMultiplier",
    why: "Creates the main Delivery estimate lines for every in-scope GSI and applicable Explore/Realize/Deploy activity.",
  },
  {
    id: "pmo-detail-lines",
    computation: "PMO Detail Lines",
    formula:
      "instances: Daily = weeks x 5, Weekly = weeks, Monthly = round(weeks / 4.33); adjHrs = activity.hours.L3[overallLevel] x instances x orgMultiplier",
    why: "Adds project-management cadence work across phases.",
  },
  {
    id: "fricew-total-count",
    computation: "FRICEW Total Count",
    formula: "wricefTotal = sum(low + medium + high + veryHigh counts for all FRICEW object rows)",
    why: "Provides the total custom-object volume used by FRICEW, FTG, and SWT WRICEF coverage calculations.",
  },
  {
    id: "fricew-object-mode-formula",
    computation: "FRICEW Object Mode",
    formula: "hours = count x tierManDays x hoursPerDay",
    why: "Sizes custom development from counted objects. Object-mode hours are not multiplied by orgMultiplier because man-day tiers already carry sizing.",
  },
  {
    id: "ftg-additive-calibration",
    computation: "FTG Additive Calibration",
    formula: "ftgCount = ceil(wricefTotal / wricefPerFtg); adjHrs = FTG stdHrs x ftgCount x orgMultiplier",
    why: "Adds Fit Gap Analysis workshop effort in Explore when FTG is enabled and WRICEF objects exist.",
  },
  {
    id: "swt-additive-calibration",
    computation: "SWT Additive Calibration",
    formula:
      "gsiCoverHrs = sum(baseSwt(gsi) x variants x coveragePct) x orgMultiplier; wricefHrs = wricefTotal x SWT unit hrs x WRICEF coveragePct x orgMultiplier",
    why: "Adds Solution Walkthrough cycle effort in Realize, including GSI coverage and WRICEF coverage by cycle.",
  },
  {
    id: "fut-additive-calibration",
    computation: "FUT Additive Calibration",
    formula:
      "adjHrs = FUT stdHrs x GSI instances x orgMultiplier for each scoped GSI whose FUT flag is not false",
    why: "Adds the optional extra Functional User Test cycle in Realize. SIT and UAT remain part of the base estimate.",
  },
  {
    id: "ocm-additive-calibration",
    computation: "OCM Additive Calibration",
    formula:
      "ocmUnits = max(1, ceil(endUsers / ocmUsersPerUnit)); adjHrs = OCM stdHrs x ocmUnits x pmChangeMgmtScaling x orgMultiplier",
    why: "Adds Organizational Change Management effort in Deploy based on impacted user count.",
  },
  {
    id: "training-delivery-calibration",
    computation: "Training Delivery Calibration",
    formula:
      "sessions = max(1, ceil(endUsers / maxPersonsPerTraining)); adjHrs = training stdHrs x sessions x orgMultiplier",
    why: "Adds Deploy-phase training effort using End User Training or Train-the-Trainer activity hours.",
  },
  {
    id: "training-simulation-formula",
    computation: "Training Simulation",
    formula: "simulationHrs = simulationHrsPerGsi x scopedGsiCount x orgMultiplier",
    why: "Adds optional training simulation build effort when simulation is enabled.",
  },
  {
    id: "sdd-phase-relocation",
    computation: "SDD Phase Relocation",
    formula:
      "customizationPct = sum(Customization adjusted hours) / sum(all Delivery adjusted hours) x 100; if above threshold, move SDD Explore -> Realize",
    why: "Changes where SDD appears in the phase plan when customization is high. It does not change total hours.",
  },
  {
    id: "third-party-audit-uplift",
    computation: "Third-Party Audit Uplift",
    formula: "upliftHrs = sum(adjusted hours already in Explore/Realize phase) x auditUpliftPct / 100",
    why: "Adds audit/review overhead only when the audit switch is enabled and Step A marks third-party involvement.",
  },
  {
    id: "totals",
    computation: "Totals",
    formula: "gsiHours = sum(non-PMO adjHrs); pmoHours = sum(PMO adjHrs); totalHours = gsiHours + pmoHours",
    why: "Builds the headline effort numbers from detail lines only.",
  },
  {
    id: "phase-rollups",
    computation: "Phase Rollups",
    formula:
      "phaseHours = sum(adjHrs in phase); phaseWeeks = phaseWeight% x durationWeeks; fte = ceil((phaseHours / capacity) x 2) / 2",
    why: "Builds phase effort, duration, and FTE. Peak FTE is the maximum phase FTE.",
  },
  {
    id: "module-rollups",
    computation: "Module Rollups",
    formula: "module hours = sum(Delivery lines by module); activeGsis = distinct real GSI names in that module",
    why: "Shows Delivery effort by business module. FRICEW rows do not increase active GSI count.",
  },
  {
    id: "resource-plan",
    computation: "Resource Plan",
    formula:
      "Consultant gets all Delivery hours; Project Manager gets all PMO hours; role FTE = role hours / relevant phase or project capacity",
    why: "Predicts staffing using the current blended-role model.",
  },
];
