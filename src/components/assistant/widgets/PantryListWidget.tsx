import React from "react";
import type { IngredientListItem } from "@/types/assistant";
import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";

interface Props {
  items: IngredientListItem[];
}

const PantryListWidget: React.FC<Props> = ({ items }) => {
  const grouped = items.reduce<Record<string, IngredientListItem[]>>((acc, it) => {
    (acc[it.classification] ||= []).push(it);
    return acc;
  }, {});

  return (
    <div className="space-y-3">
      {Object.entries(grouped).map(([group, arr]) => (
        <div key={group} className="space-y-1.5">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{group}</div>
          <ul className="rounded-lg border border-border divide-y divide-border overflow-hidden">
            {arr.map((it, i) => {
              const expiring = it.daysToExpire > 0 && it.daysToExpire <= 3;
              return (
                <li key={i} className="flex items-center justify-between gap-2 bg-card px-3 py-2 text-sm">
                  <span className="flex-1 truncate">{it.name}</span>
                  <span className="text-xs text-muted-foreground">{it.quantity} {it.unit}</span>
                  <span className={cn("text-[11px] inline-flex items-center gap-1", expiring ? "text-destructive" : "text-muted-foreground")}>
                    {expiring && <AlertTriangle className="h-3 w-3" />}
                    {it.daysToExpire}d
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default PantryListWidget;
