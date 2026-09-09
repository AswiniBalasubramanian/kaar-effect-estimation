"use client";

import Image from "next/image";
import Link from "next/link";
import { Sparkle } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { BreadcrumbTrail } from "@/components/breadcrumb-trail";
import { useTopBarContent } from "@/lib/top-bar-context";
import { useAssistant } from "@/lib/assistant-context";

export function TopBar() {
  const { crumbs } = useTopBarContent();
  const { toggle } = useAssistant();

  return (
    <header className="sticky top-0 z-40 flex h-12 shrink-0 items-center gap-3 overflow-hidden border-b border-sidebar-border bg-gradient-to-l from-gray-200 via-gray-100 to-sidebar relative dark:from-gray-800 dark:via-gray-900">
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
        <span className="hidden text-sm font-semibold tracking-tight text-primary sm:inline">
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

      <div className="ml-auto flex h-12 shrink-0 items-center pr-3">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="gradient-border-spin gap-1.5"
          onClick={toggle}
        >
          <Sparkle className="h-4 w-4 text-orange-500" />
          Assistant
        </Button>
      </div>
    </header>
  );
}
