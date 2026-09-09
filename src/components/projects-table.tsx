"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CopySimple, Trash } from "@phosphor-icons/react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

export function ProjectsTable({
  projects,
  onClone,
  onDelete,
}: {
  projects: Project[];
  onClone: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const router = useRouter();

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Region</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => (
            <TableRow
              key={project.id}
              onClick={() => router.push(`/projects/${project.id}`)}
              className="cursor-pointer bg-white transition-colors hover:bg-muted/50 dark:bg-card"
            >
              <TableCell className="font-medium text-card-foreground">
                <Link
                  href={`/projects/${project.id}`}
                  className="hover:underline"
                >
                  {project.name}
                </Link>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {project.customer ?? "— no customer —"}
              </TableCell>
              <TableCell>
                <Badge
                  className={cn(
                    "rounded-full px-2 font-medium",
                    projectTypeBadgeClass[project.type]
                  )}
                >
                  {typeLabel[project.type]}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {project.region ?? "—"}
              </TableCell>
              <TableCell>
                <Badge
                  className={cn(
                    "rounded-md px-2 font-medium",
                    projectStatusBadgeClass[project.status]
                  )}
                >
                  {projectStatusLabel[project.status]}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {project.date}
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-end gap-1">
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
                        <AlertDialogTitle>
                          Delete &ldquo;{project.name}&rdquo;?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          You&apos;ll permanently remove this project and its
                          estimate. You can&apos;t undo this.
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
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
