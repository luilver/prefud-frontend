import React from "react";
import type { SpecialMealPayload, HealthyDrinkPayload } from "@/types/assistant";
import RecipeDetail from "./RecipeDetail";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { ShoppingCart, PackagePlus } from "lucide-react";

interface Props {
  payload: SpecialMealPayload | HealthyDrinkPayload;
  onAddToCart: () => void;
  onAddToPantry: () => void;
  isDrink?: boolean;
}

const SpecialMealWidget: React.FC<Props> = ({ payload, onAddToCart, onAddToPantry, isDrink }) => {
  const { t } = useLanguage();
  const meal = isDrink
    ? (payload as HealthyDrinkPayload).healthyDrink.healthyDrink
    : (payload as SpecialMealPayload).specialMeal.specialMeal;
  return (
    <div className="space-y-4">
      <RecipeDetail meal={meal} />
      <div className="flex flex-col sm:flex-row gap-2">
        <Button onClick={onAddToCart} className="flex-1">
          <ShoppingCart className="h-4 w-4 mr-2" /> {t("assistant.widgets.addToCart")}
        </Button>
        <Button onClick={onAddToPantry} variant="outline" className="flex-1">
          <PackagePlus className="h-4 w-4 mr-2" /> {t("assistant.widgets.addToPantry")}
        </Button>
      </div>
    </div>
  );
};

export default SpecialMealWidget;
