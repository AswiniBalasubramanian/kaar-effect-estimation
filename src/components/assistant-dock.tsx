"use client";

import { useState } from "react";
import Image from "next/image";
import { FileText, PaperPlaneTilt, Plus, X } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAssistant } from "@/lib/assistant-context";
import { useTopBarContent } from "@/lib/top-bar-context";
import { wizardSteps } from "@/lib/estimation-wizard";
import { glossarySections, formulaRows } from "@/lib/glossary-data";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
}

const STOPWORDS = new Set([
  "a", "an", "the", "is", "are", "was", "were", "what", "whats", "who", "whom", "which",
  "how", "do", "does", "did", "can", "could", "should", "would", "will", "i", "you", "we",
  "they", "it", "this", "that", "these", "those", "of", "in", "on", "at", "to", "for",
  "with", "about", "tell", "me", "explain", "define", "meaning", "mean", "please", "and",
  "or", "if", "as", "by", "from", "be", "been", "being", "there", "here",
]);

function extractKeywords(query: string): string[] {
  return query
    .toLowerCase()
    .replace(/[?.,!;:"'()]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 0 && !STOPWORDS.has(w));
}

function scoreText(text: string, keywords: string[], fullPhrase: string): number {
  const lower = text.toLowerCase();
  let score = 0;
  for (const kw of keywords) {
    if (lower.includes(kw)) score += 1;
  }
  if (fullPhrase.length > 0 && lower.includes(fullPhrase)) score += keywords.length;
  return score;
}

function buildAnswer(query: string): string {
  const notFound = `I couldn't find "${query}" in the wizard steps, field glossary, or formulas. Try a shorter keyword, or check the full Glossary & Formula Guide page.`;

  const keywords = extractKeywords(query);
  if (keywords.length === 0) return notFound;

  const fullPhrase = query.trim().toLowerCase().replace(/[?.,!;:"'()]/g, "").trim();

  const stepMatches = wizardSteps
    .map((s) => ({ s, score: scoreText(`${s.title} ${s.subtitle}`, keywords, fullPhrase) }))
    .filter((m) => m.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((m) => m.s);

  const rowMatches = glossarySections
    .flatMap((section) =>
      section.rows.map((r) => ({
        section: section.title,
        row: r,
        score: scoreText(`${r.term} ${r.meaning} ${r.drives}`, keywords, fullPhrase),
      }))
    )
    .filter((m) => m.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((m) => ({ section: m.section, ...m.row }));

  const formulaMatches = formulaRows
    .map((f) => ({ f, score: scoreText(`${f.computation} ${f.formula} ${f.why}`, keywords, fullPhrase) }))
    .filter((m) => m.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((m) => m.f);

  if (stepMatches.length === 0 && rowMatches.length === 0 && formulaMatches.length === 0) {
    return notFound;
  }

  const parts: string[] = [];
  for (const s of stepMatches.slice(0, 2)) {
    parts.push(`Step — ${s.title}: ${s.subtitle}`);
  }
  for (const r of rowMatches.slice(0, 4)) {
    parts.push(`${r.term} (${r.section}) — ${r.meaning} ${r.drives}`);
  }
  for (const f of formulaMatches.slice(0, 3)) {
    parts.push(`${f.computation} — ${f.formula} ${f.why}`);
  }
  return parts.join("\n\n");
}

export function AssistantDock() {
  const { open, setOpen } = useAssistant();
  const { crumbs } = useTopBarContent();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [pageContextEnabled, setPageContextEnabled] = useState(true);

  const pageLabel = crumbs.length > 0 ? crumbs.map((c) => c.label).join(" › ") : "Home";

  function handleSend() {
    const query = input.trim();
    if (!query) return;
    const userMessage: Message = { id: crypto.randomUUID(), role: "user", text: query };
    const assistantMessage: Message = {
      id: crypto.randomUUID(),
      role: "assistant",
      text: buildAnswer(query),
    };
    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setInput("");
  }

  if (!open) return null;

  return (
    <aside className="flex h-full w-full shrink-0 flex-col border-l border-border bg-background sm:w-96">
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border bg-gradient-to-l from-orange-100 to-white px-4 py-3 dark:from-orange-950/40 dark:to-neutral-900">
        <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
          <Image src="/ai-logo.svg" alt="" aria-hidden="true" width={16} height={16} className="h-4 w-4" />
          Assistant
        </span>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close Assistant"
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
            <div
              aria-hidden="true"
              className="mx-auto aspect-square w-2/3 bg-gradient-to-br from-orange-400 to-red-950 dark:bg-white dark:bg-none"
              style={{
                maskImage: "url(/assistant-illustration.png)",
                maskSize: "contain",
                maskRepeat: "no-repeat",
                maskPosition: "center",
                WebkitMaskImage: "url(/assistant-illustration.png)",
                WebkitMaskSize: "contain",
                WebkitMaskRepeat: "no-repeat",
                WebkitMaskPosition: "center",
              }}
            />
            <p className="mt-2 font-medium text-foreground">Ask about steps, drivers, or formulas</p>
            <p className="mt-1">
              Get a quick answer here, or explore the full Glossary for more detail. For example:
            </p>
            <ul className="mt-1.5 list-disc space-y-1 pl-4">
              <li>The five estimation steps</li>
              <li>Org-complexity drivers, like &ldquo;Legal Entities&rdquo;</li>
              <li>Formulas, like &ldquo;org multiplier&rdquo;</li>
              <li>Fields like &ldquo;SWT cycles&rdquo; or &ldquo;instance driver&rdquo;</li>
            </ul>
          </div>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={cn(
              "max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-line",
              m.role === "user"
                ? "ml-auto bg-primary text-primary-foreground"
                : "mr-auto bg-muted text-foreground"
            )}
          >
            {m.text}
          </div>
        ))}
      </div>

      <div className="flex shrink-0 items-center gap-1.5 border-t border-border px-3 pt-2.5">
        {pageContextEnabled ? (
          <span
            title={`I can see this page: ${pageLabel}`}
            className="group flex max-w-full items-center gap-1.5 rounded-full border border-border bg-muted/60 px-2.5 py-1 text-xs font-medium text-foreground"
          >
            <FileText className="h-3.5 w-3.5 shrink-0 text-primary-text" aria-hidden="true" />
            <span className="truncate">{pageLabel}</span>
            <button
              type="button"
              onClick={() => setPageContextEnabled(false)}
              aria-label="Remove this page as context"
              className="ml-0.5 shrink-0 rounded-full text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ) : (
          <button
            type="button"
            onClick={() => setPageContextEnabled(true)}
            className="flex items-center gap-1 rounded-full border border-dashed border-border px-2.5 py-1 text-xs font-medium text-muted-foreground hover:border-border hover:bg-muted/60 hover:text-foreground"
          >
            <Plus className="h-3 w-3" />
            Use this page as context
          </button>
        )}
      </div>

      <form
        className="flex shrink-0 items-center gap-2 p-3"
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about a field, step, or formula..."
          autoComplete="off"
        />
        <Button type="submit" size="icon-sm" aria-label="Send">
          <PaperPlaneTilt className="h-4 w-4" />
        </Button>
      </form>
    </aside>
  );
}
