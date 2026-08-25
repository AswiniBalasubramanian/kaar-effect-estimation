"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export interface Crumb {
  label: string;
  href?: string;
}

interface TopBarContextValue {
  crumbs: Crumb[];
  setCrumbs: (crumbs: Crumb[] | null) => void;
}

const TopBarContext = createContext<TopBarContextValue | null>(null);

export function TopBarContentProvider({ children }: { children: ReactNode }) {
  const [crumbs, setCrumbsState] = useState<Crumb[]>([]);

  function setCrumbs(next: Crumb[] | null) {
    setCrumbsState(next ?? []);
  }

  return (
    <TopBarContext.Provider value={{ crumbs, setCrumbs }}>
      {children}
    </TopBarContext.Provider>
  );
}

export function useTopBarContent() {
  const ctx = useContext(TopBarContext);
  if (!ctx) {
    throw new Error("useTopBarContent must be used within a TopBarContentProvider");
  }
  return ctx;
}

export function useSetTopBar(crumbs: Crumb[]) {
  const { setCrumbs } = useTopBarContent();

  useEffect(() => {
    setCrumbs(crumbs);
    return () => setCrumbs(null);
  }, [setCrumbs, crumbs]);
}
