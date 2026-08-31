"use client";

import { useMemo, useState } from "react";
import { Plus, MagnifyingGlass as Search, FolderOpen } from "@phosphor-icons/react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarInset } from "@/components/ui/sidebar";
import { PageHeader } from "@/components/page-header";
import { ProjectCard } from "@/components/project-card";
import { CreateProjectDialog } from "@/components/create-project-dialog";
import { useProjects } from "@/lib/projects-context";
import { useSetTopBar } from "@/lib/top-bar-context";

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

  const crumbs = useMemo(() => [{ label: "Projects" }], []);
  useSetTopBar(crumbs);

  return (
    <SidebarInset>
      <PageHeader
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
            <Button onClick={() => setCreateOpen(true)} className="h-9 gap-1.5 px-4">
              <Plus className="h-4 w-4" />
              Create Project
            </Button>
          </div>
        }
      />

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8">
          {filteredProjects.length > 0 ? (
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
