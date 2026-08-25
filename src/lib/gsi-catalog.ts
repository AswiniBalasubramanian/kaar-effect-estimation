export type GsiComplexity = "L" | "M" | "H";
export type GsiLevel = "L3" | "L4" | "L5";

export type InstanceDriver =
  | "Fixed1"
  | "LegalEntities"
  | "Countries"
  | "Plants"
  | "SalesOrg"
  | "PurchaseUnits"
  | "Currencies";

export type SapProduct = "S4H_OnPrem" | "S4H_Cloud" | "Ariba" | "SuccessFactors";

export interface GsiCatalogItem {
  id: string;
  title: string;
  product: SapProduct;
  businessArea: string;
  processGroup: string;
  defaultComplexity: GsiComplexity;
  defaultLevel: GsiLevel;
  defaultInstanceDriver: InstanceDriver;
  module?: string;
  instances?: number;
  stdHrs?: number;
}

export const instanceDrivers: InstanceDriver[] = [
  "Fixed1",
  "LegalEntities",
  "Countries",
  "Plants",
  "SalesOrg",
  "PurchaseUnits",
  "Currencies",
];

export const gsiLevels: GsiLevel[] = ["L3", "L4", "L5"];

export const sapProducts: SapProduct[] = [
  "S4H_OnPrem",
  "S4H_Cloud",
  "Ariba",
  "SuccessFactors",
];

// Representative sample of the GSI catalog (not SAP's full published catalog,
// which runs into the hundreds) — enough to exercise every interaction in the
// Scope Selection step: product tabs, business area/process group filters,
// search, bulk area/group selection, and per-project complexity overrides.
export const gsiCatalog: GsiCatalogItem[] = [
  { id: "1NN", title: "Business Event Handling", product: "S4H_OnPrem", businessArea: "Application Platform and Infrastructure", processGroup: "Process Management and Integration", defaultComplexity: "M", defaultLevel: "L3", defaultInstanceDriver: "Fixed1" },
  { id: "30K", title: "Predictive Analytics Model Training - Finance", product: "S4H_OnPrem", businessArea: "Application Platform and Infrastructure", processGroup: "Process Management and Integration", defaultComplexity: "M", defaultLevel: "L3", defaultInstanceDriver: "Fixed1" },
  { id: "1NJ", title: "Responsibility Management", product: "S4H_OnPrem", businessArea: "Application Platform and Infrastructure", processGroup: "Process Management and Integration", defaultComplexity: "M", defaultLevel: "L3", defaultInstanceDriver: "Fixed1" },
  { id: "31N", title: "Situation Handling", product: "S4H_OnPrem", businessArea: "Application Platform and Infrastructure", processGroup: "Process Management and Integration", defaultComplexity: "M", defaultLevel: "L3", defaultInstanceDriver: "Fixed1" },

  { id: "2QN", title: "Maintenance Order Processing", product: "S4H_OnPrem", businessArea: "Asset Management", processGroup: "Maintenance Management", defaultComplexity: "M", defaultLevel: "L3", defaultInstanceDriver: "Plants" },
  { id: "2QP", title: "Preventive Maintenance Planning", product: "S4H_OnPrem", businessArea: "Asset Management", processGroup: "Maintenance Management", defaultComplexity: "H", defaultLevel: "L3", defaultInstanceDriver: "Plants" },
  { id: "2QR", title: "Breakdown Maintenance", product: "S4H_OnPrem", businessArea: "Asset Management", processGroup: "Maintenance Management", defaultComplexity: "L", defaultLevel: "L4", defaultInstanceDriver: "Plants" },
  { id: "2QS", title: "Refurbishment Processing", product: "S4H_OnPrem", businessArea: "Asset Management", processGroup: "Maintenance Management", defaultComplexity: "M", defaultLevel: "L3", defaultInstanceDriver: "Fixed1" },

  { id: "3DA", title: "Master Data Governance - Material", product: "S4H_OnPrem", businessArea: "Database and Data Management", processGroup: "Master Data Governance", defaultComplexity: "H", defaultLevel: "L3", defaultInstanceDriver: "LegalEntities" },
  { id: "3DB", title: "Master Data Governance - Customer", product: "S4H_OnPrem", businessArea: "Database and Data Management", processGroup: "Master Data Governance", defaultComplexity: "M", defaultLevel: "L3", defaultInstanceDriver: "LegalEntities" },
  { id: "3DC", title: "Master Data Governance - Vendor", product: "S4H_OnPrem", businessArea: "Database and Data Management", processGroup: "Master Data Governance", defaultComplexity: "M", defaultLevel: "L3", defaultInstanceDriver: "LegalEntities" },
  { id: "3DD", title: "Data Archiving", product: "S4H_OnPrem", businessArea: "Database and Data Management", processGroup: "Data Lifecycle", defaultComplexity: "L", defaultLevel: "L4", defaultInstanceDriver: "Fixed1" },
  { id: "3DE", title: "Data Quality Remediation", product: "S4H_OnPrem", businessArea: "Database and Data Management", processGroup: "Data Lifecycle", defaultComplexity: "H", defaultLevel: "L3", defaultInstanceDriver: "Fixed1" },
  { id: "3DF", title: "Legacy Data Migration Cockpit", product: "S4H_OnPrem", businessArea: "Database and Data Management", processGroup: "Data Lifecycle", defaultComplexity: "M", defaultLevel: "L3", defaultInstanceDriver: "Fixed1" },

  { id: "1J2", title: "Accounting and Financial Close", product: "S4H_OnPrem", businessArea: "Finance", processGroup: "General Ledger", defaultComplexity: "M", defaultLevel: "L3", defaultInstanceDriver: "LegalEntities" },
  { id: "19O", title: "Accounts Payable", product: "S4H_OnPrem", businessArea: "Finance", processGroup: "Accounts Payable", defaultComplexity: "M", defaultLevel: "L3", defaultInstanceDriver: "LegalEntities" },
  { id: "19Q", title: "Accounts Receivable", product: "S4H_OnPrem", businessArea: "Finance", processGroup: "Accounts Receivable", defaultComplexity: "M", defaultLevel: "L3", defaultInstanceDriver: "LegalEntities" },
  { id: "1J3", title: "Asset Accounting", product: "S4H_OnPrem", businessArea: "Finance", processGroup: "Asset Accounting", defaultComplexity: "H", defaultLevel: "L3", defaultInstanceDriver: "LegalEntities" },
  { id: "19R", title: "Cost Center Accounting", product: "S4H_OnPrem", businessArea: "Finance", processGroup: "Controlling", defaultComplexity: "M", defaultLevel: "L3", defaultInstanceDriver: "LegalEntities" },
  { id: "19S", title: "Profit Center Accounting", product: "S4H_OnPrem", businessArea: "Finance", processGroup: "Controlling", defaultComplexity: "M", defaultLevel: "L3", defaultInstanceDriver: "LegalEntities" },
  { id: "1J8", title: "Cash Management", product: "S4H_OnPrem", businessArea: "Finance", processGroup: "Treasury", defaultComplexity: "H", defaultLevel: "L3", defaultInstanceDriver: "Currencies" },
  { id: "1EM", title: "Foreign Currency Valuation", product: "S4H_OnPrem", businessArea: "Finance", processGroup: "Treasury", defaultComplexity: "L", defaultLevel: "L4", defaultInstanceDriver: "Currencies" },

  { id: "4HR", title: "Core HR and Payroll Integration", product: "S4H_OnPrem", businessArea: "Human Resources", processGroup: "Core HR", defaultComplexity: "M", defaultLevel: "L3", defaultInstanceDriver: "Countries" },

  { id: "C1NN", title: "Business Event Handling", product: "S4H_Cloud", businessArea: "Application Platform and Infrastructure", processGroup: "Process Management and Integration", defaultComplexity: "M", defaultLevel: "L3", defaultInstanceDriver: "Fixed1" },
  { id: "C19O", title: "Accounts Payable", product: "S4H_Cloud", businessArea: "Finance", processGroup: "Accounts Payable", defaultComplexity: "L", defaultLevel: "L3", defaultInstanceDriver: "LegalEntities" },
  { id: "C19Q", title: "Accounts Receivable", product: "S4H_Cloud", businessArea: "Finance", processGroup: "Accounts Receivable", defaultComplexity: "L", defaultLevel: "L3", defaultInstanceDriver: "LegalEntities" },

  { id: "A101", title: "Sourcing and Supplier Discovery", product: "Ariba", businessArea: "Procurement", processGroup: "Sourcing", defaultComplexity: "M", defaultLevel: "L3", defaultInstanceDriver: "PurchaseUnits" },
  { id: "A102", title: "Contract Management", product: "Ariba", businessArea: "Procurement", processGroup: "Contracts", defaultComplexity: "M", defaultLevel: "L3", defaultInstanceDriver: "PurchaseUnits" },

  { id: "S201", title: "Employee Central Core", product: "SuccessFactors", businessArea: "Human Resources", processGroup: "Employee Central", defaultComplexity: "H", defaultLevel: "L3", defaultInstanceDriver: "Countries" },
];
