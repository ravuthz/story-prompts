import * as React from "react";

import { cn } from "@/lib/utils";

type HighlightMode = "json" | "prompt";

interface HighlightedTextareaProps extends Omit<React.ComponentProps<"textarea">, "value"> {
  value: string;
  mode: HighlightMode;
}

const highlightJson = (value: string) => {
  const tokenPattern = /("(?:\\.|[^"\\])*")(?=\s*:)|("(?:\\.|[^"\\])*")|\b(true|false|null)\b|-?\b\d+(?:\.\d+)?\b/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  for (const match of value.matchAll(tokenPattern)) {
    const index = match.index ?? 0;
    parts.push(value.slice(lastIndex, index));
    const token = match[0];
    const className = match[1]
      ? "text-primary"
      : match[2]
        ? "text-green-700 dark:text-green-400"
        : /true|false|null/.test(token)
          ? "text-amber-700 dark:text-amber-400"
          : "text-blue-700 dark:text-blue-400";
    parts.push(<span className={className} key={`${index}-${token}`}>{token}</span>);
    lastIndex = index + token.length;
  }
  parts.push(value.slice(lastIndex));
  return parts;
};

const highlightPrompt = (value: string) => {
  const tokenPattern = /(\{\{\w+\}\})|(^[^\n:]{1,40}:)/gm;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  for (const match of value.matchAll(tokenPattern)) {
    const index = match.index ?? 0;
    parts.push(value.slice(lastIndex, index));
    parts.push(
      <span className={match[1] ? "text-primary font-semibold" : "text-amber-700 dark:text-amber-400 font-semibold"} key={`${index}-${match[0]}`}>
        {match[0]}
      </span>
    );
    lastIndex = index + match[0].length;
  }
  parts.push(value.slice(lastIndex));
  return parts;
};

export function HighlightedTextarea({ value, mode, className, onScroll, ...props }: HighlightedTextareaProps) {
  const highlightRef = React.useRef<HTMLPreElement>(null);

  return (
    <div className={cn("relative overflow-hidden rounded-lg border border-input bg-transparent focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50", className)}>
      <pre
        ref={highlightRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-auto whitespace-pre-wrap break-words p-3 font-mono text-xs leading-relaxed text-foreground"
      >
        {mode === "json" ? highlightJson(value) : highlightPrompt(value)}
        {"\n"}
      </pre>
      <textarea
        {...props}
        value={value}
        spellCheck={false}
        onScroll={(event) => {
          if (highlightRef.current) {
            highlightRef.current.scrollTop = event.currentTarget.scrollTop;
            highlightRef.current.scrollLeft = event.currentTarget.scrollLeft;
          }
          onScroll?.(event);
        }}
        className="relative block h-full min-h-full w-full resize-none overflow-auto bg-transparent p-3 font-mono text-xs leading-relaxed text-transparent caret-foreground outline-none selection:bg-primary/25"
      />
    </div>
  );
}
