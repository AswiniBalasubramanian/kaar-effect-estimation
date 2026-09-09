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
    subtitle: "Customer and timeline",
  },
  {
    id: "scope-selection",
    letter: "B",
    title: "Scope Selection",
    subtitle: "Global scope items",
  },
  {
    id: "fricew",
    letter: "C",
    title: "FRICEW",
    subtitle: "Development objects",
  },
  {
    id: "testing-training",
    letter: "D",
    title: "Testing & Training",
    subtitle: "SIT, UAT and enablement",
  },
  {
    id: "effort-estimate",
    letter: "E",
    title: "Effort Estimate",
    subtitle: "Review and export",
  },
];
