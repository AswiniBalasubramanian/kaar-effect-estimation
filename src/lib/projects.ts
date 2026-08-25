export type ProjectStatus =
  | "draft"
  | "submitted"
  | "in-estimate"
  | "won"
  | "archived";

export type ProjectType = "greenfield" | "brownfield" | "rollout";

// Flat, borderless pastel fills in the style of Notion's select/tag colors.
export const projectTypeBadgeClass: Record<ProjectType, string> = {
  greenfield: "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300",
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

export const projectStatusBadgeClass: Record<ProjectStatus, string> = {
  draft: "bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-300",
  submitted: "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300",
  "in-estimate": "bg-indigo-100 text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-300",
  won: "bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300",
  archived: "bg-stone-200 text-stone-600 dark:bg-stone-500/20 dark:text-stone-400",
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
