import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Sparkles, Eye } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAIMealJob } from "@/contexts/AIMealJobContext";

const AIMealReadyModal = () => {
  const { t } = useLanguage();
  const { readyMeal, dismissReadyMeal } = useAIMealJob();

  if (!readyMeal) return null;

  const handleView = () => {
    const meal = readyMeal;
    dismissReadyMeal();
    window.dispatchEvent(
      new CustomEvent("open-ai-meal", { detail: { meal } })
    );
  };

  return (
    <Dialog open={!!readyMeal} onOpenChange={(open) => { if (!open) dismissReadyMeal(); }}>
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
            {t("aiMealReady.title") || "Your AI Meal is Ready!"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-center">
          <p className="text-muted-foreground">
            {t("aiMealReady.description") ||
              "Your personalized AI meal has been created and is ready to explore."}
          </p>
          {readyMeal?.name && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
              <p className="font-semibold text-primary truncate">{readyMeal.name}</p>
            </div>
          )}

          <div className="pt-2 space-y-2">
            <Button
              onClick={handleView}
              className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary hover:to-accent text-white"
            >
              <Eye className="h-4 w-4 mr-2" />
              {t("aiMealReady.viewMeal") || "View Meal"}
            </Button>
            <Button onClick={dismissReadyMeal} variant="outline" className="w-full">
              {t("aiMealReady.later") || "Later"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AIMealReadyModal;