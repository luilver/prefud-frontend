import React from "react";
import type { MealBase } from "@/types/assistant";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Clock, Leaf, Info } from "lucide-react";
import MacrosBar from "./MacrosBar";

interface Props {
  meal: MealBase;
  extra?: React.ReactNode;
  selectedIngredients?: boolean[];
  onToggleIngredient?: (index: number) => void;
}

const RecipeDetail: React.FC<Props> = ({ meal, extra, selectedIngredients, onToggleIngredient }) => {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-foreground">{meal.name}</h2>
        <p className="text-sm text-muted-foreground mt-1">{meal.description}</p>
      </div>

      {meal.benefits && (
        <div className="flex gap-2 rounded-lg border border-border bg-muted/40 p-3 text-sm">
          <Info className="h-4 w-4 text-primary flex-none mt-0.5" />
          <p className="text-foreground/90">{meal.benefits}</p>
        </div>
      )}

      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {meal.cookingTime} min</span>
        <span className="inline-flex items-center gap-1"><Leaf className="h-3.5 w-3.5" /> CO2 {meal.carbonFootprint}</span>
        {meal.mealType && <span className="uppercase tracking-wide">{meal.mealType}</span>}
      </div>

      <MacrosBar info={meal.nutritionalInfo} calories={meal.calories} carbon={meal.carbonFootprint} />

      <Accordion type="multiple" defaultValue={["ingredients","steps"]}>
        <AccordionItem value="ingredients">
          <AccordionTrigger>Ingredientes</AccordionTrigger>
          <AccordionContent>
            <ul className="space-y-1.5">
              {(meal.ingredients ?? meal.ingredientsList ?? []).map((ing, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <Checkbox 
                    id={`ing-${i}`} 
                    checked={selectedIngredients ? selectedIngredients[i] : true}
                    onCheckedChange={() => onToggleIngredient?.(i)}
                  />
                  <label htmlFor={`ing-${i}`} className="flex-1 flex justify-between">
                    <span className="text-foreground">{ing.name}</span>
                    <span className="text-muted-foreground">{ing.quantity} {ing.unit}</span>
                  </label>
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="steps">
          <AccordionTrigger>Preparacion</AccordionTrigger>
          <AccordionContent>
            <ol className="space-y-2 list-decimal pl-5 text-sm text-foreground/90">
              {meal.steps.map((s, i) => <li key={i}>{s}</li>)}
            </ol>
          </AccordionContent>
        </AccordionItem>
        {meal.prepTip && (
          <AccordionItem value="tip">
            <AccordionTrigger>Tip</AccordionTrigger>
            <AccordionContent><p className="text-sm text-foreground/90">{meal.prepTip}</p></AccordionContent>
          </AccordionItem>
        )}
      </Accordion>

      {extra}
    </div>
  );
};

export default RecipeDetail;
