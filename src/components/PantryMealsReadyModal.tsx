import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Sparkles, Eye } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePantryMealsJob } from "@/contexts/PantryMealsJobContext";

const PantryMealsReadyModal = () => {
  const { t } = useLanguage();
  const { readyMeals, dismissReadyMeals } = usePantryMealsJob();

  if (!readyMeals) return null;

  const handleView = () => {
    const meals = readyMeals.meals;
    dismissReadyMeals();
    window.dispatchEvent(
      new CustomEvent("open-pantry-meals", { detail: { meals } })
    );
  };

  return (
    <Dialog open={!!readyMeals} onOpenChange={(open) => { if (!open) dismissReadyMeals(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <CheckCircle className="h-16 w-16 text-primary" />
              <div className="absolute -top-2 -right-2 bg-gradient-to-r from-primary to-accent rounded-full p-1">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>
          <DialogTitle className="text-center text-2xl font-bold">
            {t("pantryMealsReady.title") || "Your Pantry Meals are Ready!"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-center">
          <p className="text-muted-foreground">
            {t("pantryMealsReady.description") ||
              "Fresh AI meal ideas based on your pantry are ready to explore."}
          </p>
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
            <p className="font-semibold text-primary">
              {readyMeals.meals.length} {t("pantryMealsReady.mealsGenerated") || "meals generated"}
            </p>
          </div>

          <div className="pt-2 space-y-2">
            <Button
              onClick={handleView}
              className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary hover:to-accent text-white"
            >
              <Eye className="h-4 w-4 mr-2" />
              {t("pantryMealsReady.viewMeals") || "View Meals"}
            </Button>
            <Button onClick={dismissReadyMeals} variant="outline" className="w-full">
              {t("pantryMealsReady.later") || "Later"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PantryMealsReadyModal;