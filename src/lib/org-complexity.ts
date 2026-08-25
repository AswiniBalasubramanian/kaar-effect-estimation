export type ComplexityLevel = "L" | "M" | "H";

export interface OrgComplexityFactor {
  key: string;
  label: string;
  value: string;
  level: ComplexityLevel;
  multiplier: number;
}

// Matches the 15-factor model documented in the Glossary's "Org Complexity
// Level Per Driver" / "Org Complexity Multiplier" formulas. Every driver
// defaults to blank -> Low -> 1.00x until Step B/C capture real counts.
export const defaultOrgComplexityFactors: OrgComplexityFactor[] = [
  { key: "legal-entities", label: "Legal Entities", value: "default", level: "L", multiplier: 1.0 },
  { key: "countries", label: "Countries", value: "default", level: "L", multiplier: 1.0 },
  { key: "plants", label: "Plants", value: "default", level: "L", multiplier: 1.0 },
  { key: "sales-org", label: "Sales Org", value: "default", level: "L", multiplier: 1.0 },
  { key: "purchase-units", label: "Purchase Units", value: "default", level: "L", multiplier: 1.0 },
  { key: "end-users", label: "No. of End Users", value: "default", level: "L", multiplier: 1.0 },
  { key: "interfaces", label: "Interfaces to Other Systems", value: "default", level: "L", multiplier: 1.0 },
  { key: "data-migration-objects", label: "Data Migration Objects", value: "default", level: "L", multiplier: 1.0 },
  { key: "data-volume", label: "Data Volume", value: "default", level: "L", multiplier: 1.0 },
  { key: "geographic-distribution", label: "Geographic Distribution", value: "default", level: "L", multiplier: 1.0 },
  { key: "currencies", label: "Currencies", value: "default", level: "L", multiplier: 1.0 },
  { key: "customer-erp-readiness", label: "Customer ERP Readiness", value: "default", level: "L", multiplier: 1.0 },
  { key: "current-system", label: "Current System", value: "default", level: "L", multiplier: 1.0 },
  { key: "data-quality", label: "Data Quality", value: "default", level: "L", multiplier: 1.0 },
  { key: "project-driver", label: "Project Driver", value: "default", level: "L", multiplier: 1.0 },
];

export function computeOrgMultiplier(factors: OrgComplexityFactor[]) {
  if (factors.length === 0) return 1;
  const sum = factors.reduce((acc, f) => acc + f.multiplier, 0);
  return Math.round((sum / factors.length) * 10000) / 10000;
}

export function computeLevelCounts(factors: OrgComplexityFactor[]) {
  return {
    H: factors.filter((f) => f.level === "H").length,
    M: factors.filter((f) => f.level === "M").length,
    L: factors.filter((f) => f.level === "L").length,
  };
}

export function overallLevel(factors: OrgComplexityFactor[]): ComplexityLevel {
  const counts = computeLevelCounts(factors);
  if (counts.H >= counts.M && counts.H >= counts.L) return "H";
  if (counts.M >= counts.L) return "M";
  return "L";
}
