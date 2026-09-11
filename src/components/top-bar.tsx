"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MagnifyingGlass as Search } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { BreadcrumbTrail } from "@/components/breadcrumb-trail";
import { GlobalSearchDialog } from "@/components/global-search-dialog";
import { useTopBarContent } from "@/lib/top-bar-context";
import { useAssistant } from "@/lib/assistant-context";

export function TopBar() {
  const { crumbs } = useTopBarContent();
  const { toggle } = useAssistant();
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-40 flex h-12 shrink-0 items-center gap-3 overflow-hidden border-b border-sidebar-border bg-gradient-to-r from-white via-white to-gray-100 relative dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-800">
      <Image
        src="/kaar-pattern.svg"
        alt=""
        aria-hidden="true"
        width={458}
        height={56}
        className="pointer-events-none absolute top-0 right-0 -z-10 h-full w-auto select-none"
      />

      <div className="flex h-12 w-12 shrink-0 items-center justify-center">
        <SidebarTrigger className="text-foreground" />
      </div>

      <Link href="/" className="flex shrink-0 items-center gap-2">
        <Image
          src="/kaar-logo.svg"
          alt="Kaar"
          width={39}
          height={29}
          className="h-7 w-auto"
          priority
        />
        <span className="hidden text-sm font-semibold tracking-tight text-primary-text sm:inline">
          KaarTech Effort Estimator
        </span>
      </Link>

      {crumbs.length > 0 && (
        <>
          <Separator orientation="vertical" className="hidden h-5 self-center! sm:block" />
          <div className="hidden min-w-0 sm:block">
            <BreadcrumbTrail crumbs={crumbs} />
          </div>
        </>
      )}

      <div className="ml-auto flex h-12 shrink-0 items-center gap-2 pr-3">
        <button
          type="button"
          aria-label="Search projects and pages"
          onClick={() => setSearchOpen(true)}
          className="flex h-8 items-center gap-1.5 rounded-lg border border-border bg-white px-2.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground dark:bg-neutral-900"
        >
          <Search className="h-4 w-4" />
          <span className="hidden text-xs text-muted-foreground sm:inline">⌘K</span>
        </button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="gradient-border-spin gap-1.5 bg-white hover:bg-white dark:bg-neutral-900 dark:hover:bg-neutral-900"
          onClick={toggle}
        >
          <Image src="/ai-logo.svg" alt="" aria-hidden="true" width={16} height={16} className="h-4 w-4" />
          Assistant
        </Button>
      </div>

      <GlobalSearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  );
}
