"use client";

import { useMemo } from "react";

import { SidebarInset } from "@/components/ui/sidebar";
import { PageHeader } from "@/components/page-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  glossarySections,
  formulaSection,
  formulaRows,
} from "@/lib/glossary-data";
import { useSetTopBar } from "@/lib/top-bar-context";

const navItems = [
  ...glossarySections.map((s) => ({ id: s.id, label: s.navLabel })),
  { id: formulaSection.id, label: formulaSection.navLabel },
];

export default function GlossaryPage() {
  const crumbs = useMemo(() => [{ label: "Glossary" }], []);
  useSetTopBar(crumbs);

  return (
    <SidebarInset>
      <PageHeader
        title="Glossary & Formula Guide"
        description="Plain-English reference for estimator inputs, configuration fields, calculations, and how each item contributes to the final effort and resource outputs."
      />

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6 px-4 py-6 sm:flex-row sm:items-start sm:px-6 sm:py-8">
          <nav
            aria-label="Glossary sections"
            className="w-full shrink-0 rounded-xl border border-border bg-card sm:sticky sm:top-6 sm:w-56"
          >
            <p className="px-4 pt-3 pb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Sections
            </p>
            <ul className="flex flex-row flex-wrap gap-1 px-2 pb-3 sm:flex-col">
              {navItems.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className="block rounded-md px-2.5 py-1.5 text-sm text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="min-w-0 flex-1">
            {glossarySections.map((section) => (
              <section
                key={section.id}
                id={section.id}
                className="scroll-mt-6 pb-10"
              >
                <h2 className="text-lg font-semibold tracking-tight text-foreground">
                  {section.title}
                </h2>
                {section.note && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {section.note}
                  </p>
                )}
                <div className="mt-3 overflow-x-auto rounded-lg border border-border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-52">Input / Term</TableHead>
                        <TableHead>Meaning</TableHead>
                        <TableHead>How It Drives Estimation</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {section.rows.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell className="align-top font-medium whitespace-normal text-foreground">
                            {row.term}
                          </TableCell>
                          <TableCell className="align-top whitespace-normal text-muted-foreground">
                            {row.meaning}
                          </TableCell>
                          <TableCell className="align-top whitespace-normal text-foreground">
                            {row.drives}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </section>
            ))}

            <section
              id={formulaSection.id}
              className="scroll-mt-6 pb-4"
            >
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                {formulaSection.title}
              </h2>
              <div className="mt-3 overflow-x-auto rounded-lg border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-48">Computation</TableHead>
                      <TableHead className="w-96">Formula</TableHead>
                      <TableHead>Why It Is Done</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {formulaRows.map((row) => (
                      <TableRow
                        key={row.id}
                        className="bg-rose-50/50 dark:bg-rose-950/10"
                      >
                        <TableCell className="align-top font-medium whitespace-normal text-foreground">
                          {row.computation}
                        </TableCell>
                        <TableCell className="align-top whitespace-normal">
                          <code className="font-mono text-xs text-rose-900 dark:text-rose-300">
                            {row.formula}
                          </code>
                        </TableCell>
                        <TableCell className="align-top whitespace-normal text-foreground">
                          {row.why}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </section>
          </div>
        </div>
      </div>
    </SidebarInset>
  );
}
