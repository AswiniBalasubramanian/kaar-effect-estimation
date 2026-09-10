"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Dialog as DialogPrimitive } from "radix-ui";
import {
  ArrowBendUpLeft,
  BookOpen,
  Folder,
  FolderOpen,
  MagnifyingGlass as Search,
  SlidersHorizontal,
  SquaresFour,
  X,
  type IconProps,
} from "@phosphor-icons/react";

import { cn } from "@/lib/utils";
import { useProjects } from "@/lib/projects-context";
import { projectStatusLabel } from "@/lib/projects";

interface SearchItem {
  id: string;
  label: string;
  meta: string;
  icon: React.ComponentType<IconProps>;
  href: string;
}

const PAGE_ITEMS: SearchItem[] = [
  { id: "page-projects", label: "Projects", meta: "Page", icon: Folder, href: "/" },
  { id: "page-configuration", label: "Configuration", meta: "Page", icon: SlidersHorizontal, href: "/configuration" },
  { id: "page-dashboard", label: "Dashboard", meta: "Page", icon: SquaresFour, href: "/dashboard" },
  { id: "page-glossary", label: "Glossary", meta: "Page", icon: BookOpen, href: "/glossary" },
];

interface GlobalSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GlobalSearchDialog({ open, onOpenChange }: GlobalSearchDialogProps) {
  const router = useRouter();
  const { projects } = useProjects();
  const [query, setQuery] = React.useState("");
  const [activeIndex, setActiveIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const projectItems: SearchItem[] = React.useMemo(
    () =>
      projects.map((p) => ({
        id: `project-${p.id}`,
        label: p.name,
        meta: p.customer ?? projectStatusLabel[p.status],
        icon: FolderOpen,
        href: `/projects/${p.id}`,
      })),
    [projects]
  );

  const allItems = React.useMemo(() => [...projectItems, ...PAGE_ITEMS], [projectItems]);

  const results = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allItems;
    return allItems.filter(
      (item) => item.label.toLowerCase().includes(q) || item.meta.toLowerCase().includes(q)
    );
  }, [allItems, query]);

  React.useEffect(() => {
    setActiveIndex(0);
  }, [query, open]);

  React.useEffect(() => {
    if (open) {
      setQuery("");
      const raf = requestAnimationFrame(() => inputRef.current?.focus());
      return () => cancelAnimationFrame(raf);
    }
  }, [open]);

  function go(item: SearchItem) {
    router.push(item.href);
    onOpenChange(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, Math.max(results.length - 1, 0)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = results[activeIndex];
      if (item) go(item);
    }
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] duration-100 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
        <DialogPrimitive.Content
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="fixed top-[14%] left-1/2 z-50 flex w-[min(92vw,560px)] -translate-x-1/2 flex-col overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-2xl ring-1 ring-foreground/5 duration-100 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0"
        >
          <DialogPrimitive.Title className="sr-only">Search projects and pages</DialogPrimitive.Title>

          <div className="flex items-center gap-2.5 border-b border-border px-4 py-3">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search projects and pages"
              aria-label="Search projects and pages"
              autoComplete="off"
              className="h-6 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
            <DialogPrimitive.Close
              aria-label="Close search"
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </DialogPrimitive.Close>
          </div>

          <div className="max-h-80 overflow-y-auto p-1.5">
            {results.length === 0 ? (
              <p className="px-3 py-8 text-center text-sm text-muted-foreground">
                No matches for &ldquo;{query}&rdquo;.
              </p>
            ) : (
              results.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => go(item)}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm transition-colors",
                    index === activeIndex ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"
                  )}
                >
                  <item.icon
                    aria-hidden="true"
                    className={cn(
                      "h-4 w-4 shrink-0",
                      index === activeIndex ? "text-primary" : "text-muted-foreground"
                    )}
                  />
                  <span className="min-w-0 flex-1 truncate font-medium">{item.label}</span>
                  <span className="shrink-0 truncate text-xs text-muted-foreground">{item.meta}</span>
                  {index === activeIndex && (
                    <ArrowBendUpLeft aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-primary/60" />
                  )}
                </button>
              ))
            )}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
