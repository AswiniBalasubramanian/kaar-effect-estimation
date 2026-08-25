export interface FricewObjectType {
  key: string;
  type: string;
  skill: string;
  lowMd: number;
  mediumMd: number;
  highMd: number;
}

// 3-tier FRICEW man-day master (Low/Medium/High). Man-days convert to hours
// via Step A's Hours/Day (default 8 hrs/day) when computing Dev Hrs.
export const fricewObjectTypes: FricewObjectType[] = [
  { key: "forms", type: "Forms", skill: "ABAP", lowMd: 10, mediumMd: 15, highMd: 27 },
  { key: "reports", type: "Reports", skill: "ABAP", lowMd: 9, mediumMd: 16, highMd: 28 },
  { key: "interfaces", type: "Interfaces", skill: "PI/PO/HCI", lowMd: 10, mediumMd: 16, highMd: 28 },
  { key: "conversions", type: "Conversions", skill: "ABAP", lowMd: 9, mediumMd: 15, highMd: 27 },
  { key: "enhancements", type: "Enhancements", skill: "ABAP", lowMd: 9, mediumMd: 16, highMd: 27 },
  { key: "workflow", type: "Workflow", skill: "ABAP WF", lowMd: 10, mediumMd: 17, highMd: 27 },
  { key: "fiori-custom", type: "Fiori/Custom", skill: "UI5/Fiori", lowMd: 10, mediumMd: 19, highMd: 29 },
  { key: "analytics", type: "Analytics", skill: "BI/BO", lowMd: 10, mediumMd: 19, highMd: 29 },
];
