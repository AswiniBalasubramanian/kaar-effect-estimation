"use client";

import { useState } from "react";
import { PaperPlaneTilt, Sparkle, X } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAssistant } from "@/lib/assistant-context";
import { wizardSteps } from "@/lib/estimation-wizard";
import { glossarySections, formulaRows } from "@/lib/glossary-data";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
}

function buildAnswer(query: string): string {
  const q = query.trim().toLowerCase();

  const stepMatches = wizardSteps.filter(
    (s) => s.title.toLowerCase().includes(q) || s.subtitle.toLowerCase().includes(q)
  );

  const rowMatches = glossarySections.flatMap((section) =>
    section.rows
      .filter(
        (r) =>
          r.term.toLowerCase().includes(q) ||
          r.meaning.toLowerCase().includes(q) ||
          r.drives.toLowerCase().includes(q)
      )
      .map((r) => ({ section: section.title, ...r }))
  );

  const formulaMatches = formulaRows.filter(
    (f) =>
      f.computation.toLowerCase().includes(q) ||
      f.formula.toLowerCase().includes(q) ||
      f.why.toLowerCase().includes(q)
  );

  if (stepMatches.length === 0 && rowMatches.length === 0 && formulaMatches.length === 0) {
    return `I couldn't find "${query}" in the wizard steps, field glossary, or formulas. Try a shorter keyword, or check the full Glossary & Formula Guide page.`;
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
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

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
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border px-4 py-3">
        <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
          <Sparkle className="h-4 w-4 text-primary" />
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
            <p className="font-medium text-foreground">Ask me about:</p>
            <ul className="mt-1.5 list-disc space-y-1 pl-4">
              <li>Any of the 5 estimation steps</li>
              <li>Org-complexity drivers, e.g. &ldquo;Legal Entities&rdquo;</li>
              <li>Formulas, e.g. &ldquo;org multiplier&rdquo;</li>
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

      <form
        className="flex shrink-0 items-center gap-2 border-t border-border p-3"
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
