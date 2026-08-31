"use client";

import Link from "next/link";
import { ArrowRight, CopySimple, Trash } from "@phosphor-icons/react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  projectStatusBadgeClass,
  projectStatusLabel,
  projectTypeBadgeClass,
  type Project,
} from "@/lib/projects";

const typeLabel: Record<Project["type"], string> = {
  greenfield: "Greenfield",
  brownfield: "Brownfield",
  rollout: "Rollout",
};

export function ProjectCard({
  project,
  onClone,
  onDelete,
}: {
  project: Project;
  onClone: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <Card className="gap-0 rounded-lg py-0">
      <CardHeader className="gap-2 px-5 pt-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="min-w-0 text-base font-semibold break-words text-card-foreground">
            {project.name}
          </h3>
          <div className="flex shrink-0 items-center gap-1">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  type="button"
                  aria-label="Delete project"
                  className="rounded p-1 text-muted-foreground transition-colors hover:text-destructive"
                >
                  <Trash aria-hidden="true" className="h-4 w-4" />
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete &ldquo;{project.name}&rdquo;?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently remove the project and its estimate.
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    variant="destructive"
                    onClick={() => onDelete(project.id)}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <button
              type="button"
              onClick={() => onClone(project.id)}
              aria-label="Clone project"
              className="rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
            >
              <CopySimple aria-hidden="true" className="h-4 w-4" />
            </button>

            <Badge
              className={cn(
                "shrink-0 rounded-md px-2 font-medium",
                projectStatusBadgeClass[project.status]
              )}
            >
              {projectStatusLabel[project.status]}
            </Badge>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          {project.customer ?? "— no customer —"}
        </p>
      </CardHeader>

      <CardContent className="px-5 pt-3 pb-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-xs">
            <Badge
              className={cn(
                "rounded-full px-2 font-medium",
                projectTypeBadgeClass[project.type]
              )}
            >
              {typeLabel[project.type]}
            </Badge>
            {project.region && (
              <Badge
                variant="secondary"
                className="rounded-md px-2 font-medium"
              >
                {project.region}
              </Badge>
            )}
            <span className="text-muted-foreground">· {project.date}</span>
          </div>
          <Link
            href={`/projects/${project.id}`}
            aria-label={`Open ${project.name}`}
            className="group shrink-0 text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowRight
              aria-hidden="true"
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
