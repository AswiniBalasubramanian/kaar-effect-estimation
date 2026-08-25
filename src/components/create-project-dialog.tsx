"use client";

import { useId, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { NewProjectInput } from "@/lib/projects-context";
import type { ProjectType } from "@/lib/projects";

const projectTypeOptions: { value: ProjectType; label: string }[] = [
  { value: "greenfield", label: "Greenfield (New Implementation)" },
  { value: "brownfield", label: "Brownfield (System Conversion)" },
  { value: "rollout", label: "Selective Data Transition" },
];

export function CreateProjectDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (input: NewProjectInput) => void;
}) {
  const nameId = useId();
  const customerId = useId();
  const regionId = useId();
  const typeId = useId();
  const descriptionId = useId();

  const [name, setName] = useState("");
  const [customer, setCustomer] = useState("");
  const [region, setRegion] = useState("");
  const [type, setType] = useState<ProjectType>("greenfield");
  const [description, setDescription] = useState("");

  function resetForm() {
    setName("");
    setCustomer("");
    setRegion("");
    setType("greenfield");
    setDescription("");
  }

  function handleOpenChange(next: boolean) {
    if (!next) resetForm();
    onOpenChange(next);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onCreate({ name, customer, region, type, description });
    resetForm();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>Create Project</DialogTitle>
            <DialogDescription>
              Set up a new SAP S/4HANA engagement to start estimating.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor={nameId}>
              Project Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id={nameId}
              name="projectName"
              autoComplete="off"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. ACME Foods S/4HANA Implementation"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={customerId}>Customer</Label>
              <Input
                id={customerId}
                name="customer"
                autoComplete="organization"
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
                placeholder="Client company"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={regionId}>Region</Label>
              <Input
                id={regionId}
                name="region"
                autoComplete="off"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                placeholder="e.g. India, EMEA"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor={typeId}>Project Type</Label>
            <Select
              value={type}
              onValueChange={(value) => setType(value as ProjectType)}
            >
              <SelectTrigger id={typeId} className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {projectTypeOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor={descriptionId}>Description</Label>
            <Textarea
              id={descriptionId}
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short context for this engagement (optional)"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Create</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
