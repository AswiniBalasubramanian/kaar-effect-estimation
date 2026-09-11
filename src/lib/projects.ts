export type ProjectStatus =
  | "draft"
  | "submitted"
  | "in-estimate"
  | "won"
  | "archived";

export type ProjectType = "greenfield" | "brownfield" | "rollout";

// Flat, borderless pastel fills in the style of Notion's select/tag colors.
export const projectTypeBadgeClass: Record<ProjectType, string> = {
  greenfield: "bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-300",
  brownfield: "bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-300",
  rollout: "bg-teal-100 text-teal-800 dark:bg-teal-500/20 dark:text-teal-300",
};

export const projectStatusLabel: Record<ProjectStatus, string> = {
  draft: "Draft",
  submitted: "Submitted",
  "in-estimate": "In Estimate",
  won: "Won",
  archived: "Archived",
};

// Bordered pastel style matching the "Seeded" master-data badge (border-{c}-200
// bg-{c}-50 text-{c}-700 / dark:border-{c}-900 dark:bg-{c}-950 dark:text-{c}-400).
export const projectStatusBadgeClass: Record<ProjectStatus, string> = {
  draft: "border-gray-200 bg-gray-50 text-gray-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400",
  submitted: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-400",
  "in-estimate": "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-400",
  won: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400",
  archived:
    "border-[#6F4E37]/25 bg-[#6F4E37]/10 text-[#6F4E37] dark:border-[#6F4E37]/50 dark:bg-[#6F4E37]/25 dark:text-[#D2B48C]",
};

// Solid dot colors matching each status's badge hue, for use in the Status
// select trigger/menu items.
export const projectStatusDotClass: Record<ProjectStatus, string> = {
  draft: "bg-gray-400 dark:bg-neutral-500",
  submitted: "bg-amber-500",
  "in-estimate": "bg-blue-500",
  won: "bg-emerald-500",
  archived: "bg-[#6F4E37]",
};

export interface Project {
  id: string;
  name: string;
  customer: string | null;
  status: ProjectStatus;
  type: ProjectType;
  region: string | null;
  date: string;
  description?: string | null;
}

export const initialProjects: Project[] = [
  {
    id: "acme-1",
    name: "Acme",
    customer: "Aramco",
    status: "draft",
    type: "greenfield",
    region: "India",
    date: "24/08/2026",
  },
  {
    id: "test-1",
    name: "test",
    customer: null,
    status: "draft",
    type: "greenfield",
    region: null,
    date: "03/08/2026",
  },
  {
    id: "test-2",
    name: "test",
    customer: null,
    status: "draft",
    type: "greenfield",
    region: null,
    date: "03/08/2026",
  },
  {
    id: "acme-s4-1",
    name: "Acme s/4hana implemtation",
    customer: "swa",
    status: "draft",
    type: "greenfield",
    region: "india",
    date: "30/07/2026",
  },
  {
    id: "acme-s4-2",
    name: "ACME S/4HANA Implementation",
    customer: "ACME Foods",
    status: "submitted",
    type: "greenfield",
    region: "India",
    date: "22/07/2026",
  },
];
