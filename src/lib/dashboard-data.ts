export interface DashboardStat {
  key: string;
  label: string;
  value: number;
}

export const dashboardStats: DashboardStat[] = [
  { key: "users", label: "Users", value: 3 },
  { key: "projects", label: "Projects", value: 9 },
  { key: "estimates", label: "Estimates", value: 12 },
  { key: "draft", label: "Draft", value: 7 },
  { key: "inEstimation", label: "In Estimation", value: 1 },
  { key: "won", label: "Won", value: 0 },
  { key: "overrides", label: "Overrides", value: 52 },
];

export interface UsageByUserRow {
  id: string;
  email: string;
  projects: number;
  estimates: number;
  lastActivity: string;
}

export const usageByUser: UsageByUserRow[] = [
  {
    id: "u1",
    email: "gswathi@kaartech.com",
    projects: 3,
    estimates: 9,
    lastActivity: "2026-08-21T13:53:00",
  },
  {
    id: "u2",
    email: "admin@kaartech.com",
    projects: 4,
    estimates: 1,
    lastActivity: "2026-08-18T17:14:00",
  },
  {
    id: "u3",
    email: "demo@kaartech.com",
    projects: 2,
    estimates: 2,
    lastActivity: "2026-08-07T15:41:00",
  },
];

export interface ProjectStatusRow {
  id: string;
  label: string;
  count: number;
}

export const projectStatusRows: ProjectStatusRow[] = [
  { id: "submitted", label: "Submitted", count: 1 },
  { id: "draft", label: "Draft", count: 7 },
  { id: "in-estimation", label: "In Estimation", count: 1 },
];

export interface GoldenMasterOverrideRow {
  id: string;
  project: string;
  gsi: string;
  field: string;
  master: string;
  selected: string;
  user: string;
}

export const goldenMasterOverrides: GoldenMasterOverrideRow[] = [
  {
    id: "gmo-1",
    project: "Riddell S/4HANA Global ERP Transformation",
    gsi: "Advanced Financial Closing",
    field: "instanceDriver",
    master: "Fixed1",
    selected: "LegalEntities",
    user: "gswathi@kaartech.com",
  },
  {
    id: "gmo-2",
    project: "Riddell S/4HANA Global ERP Transformation",
    gsi: "Advanced Financial Closing",
    field: "instanceDriver",
    master: "Fixed1",
    selected: "CostCenters",
    user: "gswathi@kaartech.com",
  },
  {
    id: "gmo-3",
    project: "Riddell S/4HANA Global ERP Transformation",
    gsi: "Intercompany Reconciliation",
    field: "postingFrequency",
    master: "Monthly",
    selected: "Weekly",
    user: "admin@kaartech.com",
  },
  {
    id: "gmo-4",
    project: "Riddell S/4HANA Global ERP Transformation",
    gsi: "Group Reporting Consolidation",
    field: "consolidationUnit",
    master: "Fixed1",
    selected: "MultiUnit",
    user: "gswathi@kaartech.com",
  },
  {
    id: "gmo-5",
    project: "Riddell S/4HANA Global ERP Transformation",
    gsi: "Central Finance Replication",
    field: "replicationScope",
    master: "FullLoad",
    selected: "DeltaOnly",
    user: "demo@kaartech.com",
  },
];

export interface RecentEstimateRow {
  id: string;
  project: string;
  user: string;
  createdAt: string;
  overrides: number;
  hours: number;
}

export const recentEstimates: RecentEstimateRow[] = [
  {
    id: "est-1",
    project: "Riddell S/4HANA Global ERP Transformation",
    user: "gswathi@kaartech.com",
    createdAt: "2026-08-21T12:37:00",
    overrides: 52,
    hours: 169837,
  },
  {
    id: "est-2",
    project: "Riddell S/4HANA Global ERP Transformation",
    user: "gswathi@kaartech.com",
    createdAt: "2026-08-21T12:29:00",
    overrides: 0,
    hours: 37363,
  },
  {
    id: "est-3",
    project: "ACME Foods",
    user: "gswathi@kaartech.com",
    createdAt: "2026-08-20T18:16:00",
    overrides: 0,
    hours: 16910,
  },
  {
    id: "est-4",
    project: "ACME Foods",
    user: "gswathi@kaartech.com",
    createdAt: "2026-08-20T18:15:00",
    overrides: 0,
    hours: 16808,
  },
  {
    id: "est-5",
    project: "ACME Foods",
    user: "gswathi@kaartech.com",
    createdAt: "2026-08-20T18:14:00",
    overrides: 0,
    hours: 3514,
  },
  {
    id: "est-6",
    project: "Test",
    user: "gswathi@kaartech.com",
    createdAt: "2026-08-20T14:01:00",
    overrides: 0,
    hours: 148213,
  },
  {
    id: "est-7",
    project: "Test",
    user: "gswathi@kaartech.com",
    createdAt: "2026-08-19T18:30:00",
    overrides: 0,
    hours: 1266,
  },
  {
    id: "est-8",
    project: "test",
    user: "admin@kaartech.com",
    createdAt: "2026-08-18T17:14:00",
    overrides: 0,
    hours: 1266,
  },
  {
    id: "est-9",
    project: "Test",
    user: "gswathi@kaartech.com",
    createdAt: "2026-08-13T17:19:00",
    overrides: 0,
    hours: 1266,
  },
];
