import React from "react";
import type { AssistantPayload, MealBase, IngredientListItem } from "@/types/assistant";
import MealPlanWidget from "./widgets/MealPlanWidget";
import SpecialMealWidget from "./widgets/SpecialMealWidget";
import GeneratedMealsWidget from "./widgets/GeneratedMealsWidget";
import PantryListWidget from "./widgets/PantryListWidget";
import CartSummaryWidget from "./widgets/CartSummaryWidget";

interface Props {
  payload: AssistantPayload;
  onOpenMeal: (meal: MealBase) => void;
  onAddToCart: (items: IngredientListItem[]) => void;
  onAddToPantry: (items: IngredientListItem[]) => void;
}

const PayloadRenderer: React.FC<Props> = ({ payload, onOpenMeal, onAddToCart, onAddToPantry }) => {
  switch (payload.type) {
    case "mealPlan":
      return (
        <MealPlanWidget
          data={payload.data as any}
          onOpenMeal={onOpenMeal!}
          onAddToCart={(items) => onAddToCart(items ?? (payload.data as any).ingredientsList)}
          onAddToPantry={(items) => onAddToPantry(items ?? (payload.data as any).ingredientsList)}
        />
      );
    case "specialMeal":
      return (
        <SpecialMealWidget
          payload={payload.data as any}
          onAddToCart={(items) => onAddToCart(items ?? (payload.data as any).ingredientsList)}
          onAddToPantry={(items) => onAddToPantry(items ?? (payload.data as any).ingredientsList)}
        />
      );
    case "healthyDrink":
      return (
        <SpecialMealWidget
          payload={payload.data as any}
          onAddToCart={(items) => onAddToCart(items ?? (payload.data as any).ingredientsList)}
          onAddToPantry={(items) => onAddToPantry(items ?? (payload.data as any).ingredientsList)}
          isDrink
        />
      );
    case "generatedMeals":
      return <GeneratedMealsWidget data={payload.data} onOpenMeal={onOpenMeal} />;
    case "pantry":
      return <PantryListWidget items={payload.data.ingredientsList} />;
    case "cart":
      return <CartSummaryWidget items={payload.data.ingredientsList} />;
    default:
      return null;
  }
};

export default PayloadRenderer;
