import React, { useState } from "react";
import type { SpecialMealPayload, HealthyDrinkPayload, IngredientListItem } from "@/types/assistant";
import RecipeDetail from "./RecipeDetail";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { ShoppingCart, PackagePlus } from "lucide-react";

interface Props {
  payload: SpecialMealPayload | HealthyDrinkPayload;
  onAddToCart: (items?: IngredientListItem[]) => void;
  onAddToPantry: (items?: IngredientListItem[]) => void;
  isDrink?: boolean;
}

const SpecialMealWidget: React.FC<Props> = ({ payload, onAddToCart, onAddToPantry, isDrink }) => {
  const { t } = useLanguage();
  const meal = isDrink
    ? (payload as HealthyDrinkPayload).healthyDrink.healthyDrink
    : (payload as SpecialMealPayload).specialMeal.specialMeal;

  const ingredients = meal.ingredients ?? meal.ingredientsList ?? [];
  const [selected, setSelected] = useState<boolean[]>(ingredients.map(() => true));

  const handleToggle = (i: number) => {
    const newSel = [...selected];
    newSel[i] = !newSel[i];
    setSelected(newSel);
  };

  const getSelectedItems = () => {
    return ingredients.filter((_, i) => selected[i]).map(ing => {
      const fullIng = payload.ingredientsList?.find(p => p.name.toLowerCase() === ing.name.toLowerCase());
      return { ...ing, ...fullIng };
    }) as IngredientListItem[];
  };

  return (
    <div className="space-y-4">
      <RecipeDetail meal={meal} selectedIngredients={selected} onToggleIngredient={handleToggle} />
      <div className="flex flex-col sm:flex-row gap-2">
        <Button onClick={() => onAddToCart(getSelectedItems())} className="flex-1">
          <ShoppingCart className="h-4 w-4 mr-2" /> {t("assistant.widgets.addToCart")}
        </Button>
        <Button onClick={() => onAddToPantry(getSelectedItems())} variant="outline" className="flex-1">
          <PackagePlus className="h-4 w-4 mr-2" /> {t("assistant.widgets.addToPantry")}
        </Button>
      </div>
    </div>
  );
};

export default SpecialMealWidget;
