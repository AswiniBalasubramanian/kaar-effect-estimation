"use client";

import { createContext, useContext, useMemo, useState } from "react";

import { initialProjects, type Project } from "@/lib/projects";

export interface NewProjectInput {
  name: string;
  customer?: string;
  region?: string;
  type: Project["type"];
  description?: string;
}

interface ProjectsContextValue {
  projects: Project[];
  starredIds: Set<string>;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  starredProjects: Project[];
  filteredProjects: Project[];
  addProject: (input: NewProjectInput) => Project;
  cloneProject: (id: string) => Project | undefined;
  deleteProject: (id: string) => void;
  toggleStar: (id: string) => void;
  updateProjectStatus: (id: string, status: Project["status"]) => void;
  getProject: (id: string) => Project | undefined;
}

const ProjectsContext = createContext<ProjectsContextValue | null>(null);

export function ProjectsProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [starredIds, setStarredIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  function addProject(input: NewProjectInput) {
    const created: Project = {
      id: `draft-${Date.now()}`,
      name: input.name.trim() || "Untitled project",
      customer: input.customer?.trim() || null,
      status: "draft",
      type: input.type,
      region: input.region?.trim() || null,
      date: new Date().toLocaleDateString("en-GB"),
      description: input.description?.trim() || null,
    };
    setProjects((prev) => [created, ...prev]);
    return created;
  }

  function cloneProject(id: string) {
    let created: Project | undefined;
    setProjects((prev) => {
      const source = prev.find((p) => p.id === id);
      if (!source) return prev;
      const clone: Project = {
        ...source,
        id: `${source.id}-copy-${Date.now()}`,
        name: `${source.name} (copy)`,
        status: "draft",
      };
      created = clone;
      const index = prev.findIndex((p) => p.id === id);
      const next = [...prev];
      next.splice(index + 1, 0, clone);
      return next;
    });
    return created;
  }

  function updateProjectStatus(id: string, status: Project["status"]) {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status } : p))
    );
  }

  function getProject(id: string) {
    return projects.find((p) => p.id === id);
  }

  function deleteProject(id: string) {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    setStarredIds((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }

  function toggleStar(id: string) {
    setStarredIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  const starredProjects = useMemo(
    () => projects.filter((p) => starredIds.has(p.id)),
    [projects, starredIds]
  );

  const filteredProjects = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.customer ?? "").toLowerCase().includes(q)
    );
  }, [projects, searchQuery]);

  const value: ProjectsContextValue = {
    projects,
    starredIds,
    searchQuery,
    setSearchQuery,
    starredProjects,
    filteredProjects,
    addProject,
    cloneProject,
    deleteProject,
    toggleStar,
    updateProjectStatus,
    getProject,
  };

  return (
    <ProjectsContext.Provider value={value}>
      {children}
    </ProjectsContext.Provider>
  );
}

export function useProjects() {
  const ctx = useContext(ProjectsContext);
  if (!ctx) {
    throw new Error("useProjects must be used within a ProjectsProvider");
  }
  return ctx;
}
