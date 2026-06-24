import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Sparkles, Eye } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useMealPlanJob } from "@/contexts/MealPlanJobContext";

const MealPlanReadyModal = () => {
  const { t } = useLanguage();
  const { readyPlan, dismissReadyPlan } = useMealPlanJob();

  if (!readyPlan) return null;

  const handleView = () => {
    const plan = readyPlan;
    dismissReadyPlan();
    window.dispatchEvent(
      new CustomEvent("open-meal-plan", { detail: { plan } })
    );
  };

  return (
    <Dialog open={!!readyPlan} onOpenChange={(open) => { if (!open) dismissReadyPlan(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <CheckCircle className="h-16 w-16 text-emerald-500" />
              <div className="absolute -top-2 -right-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full p-1">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>
          <DialogTitle className="text-center text-2xl font-bold">
            {t("mealPlanReady.title") || "Your Meal Plan is Ready!"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-center">
          <p className="text-muted-foreground">
            {t("mealPlanReady.description") ||
              "Your personalized meal plan has been generated and is ready to explore."}
          </p>
          {readyPlan?.name && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
              <p className="font-semibold text-emerald-800 truncate">{readyPlan.name}</p>
            </div>
          )}

          <div className="pt-2 space-y-2">
            <Button
              onClick={handleView}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
            >
              <Eye className="h-4 w-4 mr-2" />
              {t("mealPlanReady.viewPlan") || "View Meal Plan"}
            </Button>
            <Button onClick={dismissReadyPlan} variant="outline" className="w-full">
              {t("mealPlanReady.later") || "Later"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MealPlanReadyModal;