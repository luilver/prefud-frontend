import React, { useState } from "react";
import type { GeneratedMealsPayload, MealBase } from "@/types/assistant";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Flame, Leaf } from "lucide-react";
import RecipeDetail from "./RecipeDetail";

interface Props {
  data: GeneratedMealsPayload;
  onOpenMeal: (meal: MealBase) => void;
}

const GeneratedMealsWidget: React.FC<Props> = ({ data, onOpenMeal }) => {
  const { t } = useLanguage();
  const meals = data.generatedMeals.generatedMeals;
  const [expanded, setExpanded] = useState<number | null>(null);
  return (
    <div className="space-y-2">
      <div className="text-[11px] text-muted-foreground">
        {t("assistant.widgets.ideasPantry")} {data.totalCarbonFootprint}
      </div>
      {meals.map((m, i) => (
        <Card key={i} className="p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="text-[10px] uppercase tracking-wide text-primary">{m.mealType}</div>
              <div className="font-semibold text-sm">{m.name}</div>
              <div className="mt-1 flex flex-wrap gap-x-3 text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1"><Flame className="h-3 w-3" />{m.calories} kcal</span>
                <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{m.cookingTime} min</span>
                <span className="inline-flex items-center gap-1"><Leaf className="h-3 w-3" />CO2 {m.carbonFootprint}</span>
              </div>
            </div>
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" onClick={() => setExpanded(expanded === i ? null : i)}>
                {expanded === i ? t("assistant.widgets.hide") : t("assistant.widgets.details")}
              </Button>
              <Button size="sm" variant="outline" onClick={() => onOpenMeal(m)}>{t("assistant.widgets.open")}</Button>
            </div>
          </div>
          {expanded === i && (
            <div className="mt-3 pt-3 border-t border-border">
              <RecipeDetail meal={m} />
            </div>
          )}
        </Card>
      ))}
    </div>
  );
};

export default GeneratedMealsWidget;
