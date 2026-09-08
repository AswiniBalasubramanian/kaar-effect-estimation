"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
  Plus,
  MagnifyingGlass as Search,
  FolderOpen,
  Table as TableIcon,
  SquaresFour,
  Funnel,
  SlidersHorizontal,
} from "@phosphor-icons/react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarInset } from "@/components/ui/sidebar";
import { PageHeader } from "@/components/page-header";
import { ProjectCard } from "@/components/project-card";
import { ProjectsTable } from "@/components/projects-table";
import { CreateProjectDialog } from "@/components/create-project-dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useProjects } from "@/lib/projects-context";
import { useSetTopBar } from "@/lib/top-bar-context";

type ProjectsView = "table" | "card";

export default function ProjectsPage() {
  const {
    searchQuery,
    setSearchQuery,
    filteredProjects,
    addProject,
    cloneProject,
    deleteProject,
  } = useProjects();

  const [createOpen, setCreateOpen] = useState(false);
  const [view, setView] = useState<ProjectsView>("table");

  const crumbs = useMemo(() => [{ label: "Projects" }], []);
  useSetTopBar(crumbs);

  return (
    <SidebarInset>
      <PageHeader
        icon={
          <Image
            src="/projectillustration.svg"
            alt=""
            aria-hidden="true"
            width={56}
            height={56}
            className="h-14 w-14 shrink-0"
          />
        }
        title={
          <span className="inline-flex items-center gap-2">
            Projects
            <Badge variant="secondary" className="rounded-full px-2 font-medium">
              {filteredProjects.length}
            </Badge>
          </span>
        }
        description="SAP S/4HANA pre-sales engagements estimated with the Kaar Delivery Methodology"
        actions={
          <div className="flex flex-col flex-wrap gap-2.5 sm:flex-row sm:items-center">
            <div className="relative min-w-0">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects"
                aria-label="Search projects"
                name="search"
                autoComplete="off"
                className="h-9 w-full min-w-0 pl-8 sm:w-48"
              />
            </div>
            <div
              role="group"
              aria-label="Switch project view"
              className="inline-flex h-9 shrink-0 items-center gap-0.5 rounded-lg border border-border bg-muted/40 p-0.5"
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => setView("table")}
                    aria-pressed={view === "table"}
                    aria-label="Table view"
                    className={cn(
                      "inline-flex h-8 items-center justify-center rounded-md px-2 transition-colors",
                      view === "table"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <TableIcon className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top">Table view</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => setView("card")}
                    aria-pressed={view === "card"}
                    aria-label="Card view"
                    className={cn(
                      "inline-flex h-8 items-center justify-center rounded-md px-2 transition-colors",
                      view === "card"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <SquaresFour className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top">Card view</TooltipContent>
              </Tooltip>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  aria-label="Filter projects"
                  className="inline-flex h-9 shrink-0 items-center justify-center rounded-lg border border-border px-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Funnel className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">Filter</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  aria-label="Customize columns"
                  className="inline-flex h-9 shrink-0 items-center justify-center rounded-lg border border-border px-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">Customize columns</TooltipContent>
            </Tooltip>
            <Button
              onClick={() => setCreateOpen(true)}
              className="h-9 gap-1.5 bg-gradient-to-r from-[#9E1B20] to-[#380A0B] px-4 text-primary-foreground hover:opacity-90"
            >
              <Plus className="h-4 w-4" />
              Create Project
            </Button>
          </div>
        }
      />

      <div className="min-h-0 flex-1 overflow-y-auto bg-muted/50">
        <div className="mx-auto w-full max-w-[1400px] px-3 py-6 sm:px-4 sm:py-8">
          {filteredProjects.length > 0 ? (
            view === "table" ? (
              <ProjectsTable
                projects={filteredProjects}
                onClone={cloneProject}
                onDelete={deleteProject}
              />
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filteredProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onClone={cloneProject}
                    onDelete={deleteProject}
                  />
                ))}
              </div>
            )
          ) : (
            <div className="mt-3 flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border py-20 text-center">
              <FolderOpen className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">No projects found</p>
                <p className="text-sm text-muted-foreground">
                  Try a different search, or create a new project.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <CreateProjectDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreate={addProject}
      />
    </SidebarInset>
  );
}
