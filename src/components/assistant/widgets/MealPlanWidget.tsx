import React, { useState } from "react";
import type { MealPlanPayload, MealBase, IngredientListItem } from "@/types/assistant";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Clock, Flame, ShoppingCart, PackagePlus, Leaf } from "lucide-react";

interface Props {
  data: MealPlanPayload;
  onOpenMeal: (meal: MealBase) => void;
  onAddToCart: (items?: IngredientListItem[]) => void;
  onAddToPantry: (items?: IngredientListItem[]) => void;
  compact?: boolean;
}

const MealPlanWidget: React.FC<Props> = ({ data, onOpenMeal, onAddToCart, onAddToPantry, compact }) => {
  const days = data.mealPlan.mealPlan;
  const [activeDay, setActiveDay] = useState(0);
  const { t, language } = useLanguage();
  const day = days[activeDay];
  
  const ingredientsList = data.ingredientsList || [];
  const [selected, setSelected] = useState<boolean[]>(ingredientsList.map(() => true));

  const handleToggle = (i: number) => {
    const newSel = [...selected];
    newSel[i] = !newSel[i];
    setSelected(newSel);
  };

  const getSelectedItems = () => {
    return ingredientsList.filter((_, i) => selected[i]);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">{t("assistant.widgets.mealPlanTitle")}</h3>
        <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
          <Leaf className="h-3 w-3" /> CO2 total {data.totalCarbonFootprint}
        </span>
      </div>

      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
        {days.map((d, i) => (
          <button
            key={d.date}
            onClick={() => setActiveDay(i)}
            className={
              "shrink-0 rounded-full border px-3 py-1 text-xs transition-colors " +
              (i === activeDay
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border bg-background text-muted-foreground hover:bg-accent")
            }
          >
            {d.dayOfWeek} · {language === "en" ? "Day" : language === "pt" ? "Dia" : "Día"} {d.day}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {day.meals.map((m) => (
          <Card key={m.id} className="p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="text-[10px] uppercase tracking-wide text-primary">{m.mealType}</div>
                <div className="font-semibold text-sm truncate">{m.name}</div>
                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><Flame className="h-3 w-3" />{m.calories} kcal</span>
                  <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{m.cookingTime} min</span>
                  <span className="inline-flex items-center gap-1"><Leaf className="h-3 w-3" />CO2 {m.carbonFootprint}</span>
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={() => onOpenMeal(m)}>{t("assistant.widgets.viewRecipe")}</Button>
            </div>
          </Card>
        ))}
      </div>

      {!compact && ingredientsList.length > 0 && (
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="ingredients" className="border-b-0">
            <AccordionTrigger className="text-sm font-semibold py-2">
              {t("aiMealView.ingredientsSelector") || "Lista de compras"} ({ingredientsList.length})
            </AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-1.5 max-h-48 overflow-y-auto mb-2 pr-1">
                {ingredientsList.map((ing, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm bg-muted/40 p-2 rounded-md">
                    <Checkbox 
                      id={`mp-ing-${i}`} 
                      checked={selected[i]}
                      onCheckedChange={() => handleToggle(i)}
                    />
                    <label htmlFor={`mp-ing-${i}`} className="flex-1 flex justify-between cursor-pointer">
                      <span className="text-foreground">{ing.name}</span>
                      <span className="text-muted-foreground text-xs">{ing.quantity} {ing.unit}</span>
                    </label>
                  </li>
                ))}
              </ul>
              <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-border">
                <Button onClick={() => onAddToCart(getSelectedItems())} className="flex-1">
                  <ShoppingCart className="h-4 w-4 mr-2" /> {t("assistant.widgets.addToCart")}
                </Button>
                <Button onClick={() => onAddToPantry(getSelectedItems())} variant="outline" className="flex-1">
                  <PackagePlus className="h-4 w-4 mr-2" /> {t("assistant.widgets.addToPantry")}
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}

      {!compact && ingredientsList.length === 0 && (
        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          <Button onClick={() => onAddToCart()} className="flex-1">
            <ShoppingCart className="h-4 w-4 mr-2" /> {t("assistant.widgets.addToCart")}
          </Button>
          <Button onClick={() => onAddToPantry()} variant="outline" className="flex-1">
            <PackagePlus className="h-4 w-4 mr-2" /> {t("assistant.widgets.addToPantry")}
          </Button>
        </div>
      )}
    </div>
  );
};

export default MealPlanWidget;
