import React from "react";
import type { QuestionChip } from "@/types/assistant";
import { cn } from "@/lib/utils";

interface Props {
  chips: QuestionChip[];
  onPick: (ask: string) => void;
  className?: string;
  variant?: "dots" | "buttons";
}

const ActionChips: React.FC<Props> = ({
  chips,
  onPick,
  className,
  variant = "dots",
}) => {
  if (!chips?.length) return null;

  if (variant === "dots") {
    return (
      <div className={cn("flex flex-col space-y-1 py-0.5", className)}>
        {chips.map((c, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onPick(c.ask)}
            className="group flex items-start gap-2.5 text-left text-sm text-foreground/85 hover:text-primary transition-colors py-1.5 px-2 -mx-2 rounded-lg hover:bg-muted/40 w-full"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-primary/70 shrink-0 mt-1.5 group-hover:bg-primary group-hover:scale-125 transition-all" />
            <span className="leading-snug">
              {c.ask}
            </span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible scrollbar-hide snap-x pb-1", className)}>
      {chips.map((c, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onPick(c.ask)}
          className="snap-start whitespace-nowrap md:whitespace-normal md:w-full text-left rounded-full md:rounded-xl border border-border bg-background px-3 py-1.5 md:py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          {c.ask}
        </button>
      ))}
    </div>
  );
};

export default ActionChips;
