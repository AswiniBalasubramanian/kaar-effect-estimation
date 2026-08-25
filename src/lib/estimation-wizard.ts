export interface WizardStep {
  id: string;
  letter: "A" | "B" | "C" | "D" | "E";
  title: string;
  subtitle: string;
}

export const wizardSteps: WizardStep[] = [
  {
    id: "profile-scope",
    letter: "A",
    title: "Profile & Scope",
    subtitle: "Customer profile + org-complexity drivers",
  },
  {
    id: "scope-selection",
    letter: "B",
    title: "Scope Selection",
    subtitle: "In-scope Global Scope Items from the GSI catalog",
  },
  {
    id: "fricew",
    letter: "C",
    title: "FRICEW",
    subtitle: "Custom development objects",
  },
  {
    id: "testing-training",
    letter: "D",
    title: "Testing & Training",
    subtitle: "SIT / UAT / SWT / training",
  },
  {
    id: "effort-estimate",
    letter: "E",
    title: "Effort Estimate",
    subtitle: "Effort dashboard + exports",
  },
];
