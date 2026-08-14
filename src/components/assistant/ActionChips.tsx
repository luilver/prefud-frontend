import React from "react";
import type { QuestionChip } from "@/types/assistant";
import { cn } from "@/lib/utils";

interface Props {
  chips: QuestionChip[];
  onPick: (ask: string) => void;
  className?: string;
}

const ActionChips: React.FC<Props> = ({ chips, onPick, className }) => {
  if (!chips?.length) return null;
  return (
    <div className={cn("flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible scrollbar-hide snap-x pb-1", className)}>
      {chips.map((c, i) => (
        <button
          key={i}
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
