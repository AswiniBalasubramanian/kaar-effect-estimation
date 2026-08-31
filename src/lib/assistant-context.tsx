"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface AssistantContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
}

const AssistantContext = createContext<AssistantContextValue | null>(null);

export function AssistantProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <AssistantContext.Provider
      value={{ open, setOpen, toggle: () => setOpen((v) => !v) }}
    >
      {children}
    </AssistantContext.Provider>
  );
}

export function useAssistant() {
  const ctx = useContext(AssistantContext);
  if (!ctx) {
    throw new Error("useAssistant must be used within an AssistantProvider");
  }
  return ctx;
}
