import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Sparkles, Eye } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useDrinkJob } from "@/contexts/DrinkJobContext";

const DrinkReadyModal = () => {
  const { t } = useLanguage();
  const { readyDrink, dismissReadyDrink } = useDrinkJob();

  if (!readyDrink) return null;

  const handleView = () => {
    const drink = readyDrink;
    dismissReadyDrink();
    window.dispatchEvent(
      new CustomEvent("open-drink", { detail: { drink } })
    );
  };

  return (
    <Dialog open={!!readyDrink} onOpenChange={(open) => { if (!open) dismissReadyDrink(); }}>
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
            {t("drinkReady.title") || "Your Healthy Drink is Ready!"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-center">
          <p className="text-muted-foreground">
            {t("drinkReady.description") ||
              "Your personalized healthy drink has been mixed and is ready to enjoy."}
          </p>
          {readyDrink?.name && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
              <p className="font-semibold text-primary truncate">{readyDrink.name}</p>
            </div>
          )}

          <div className="pt-2 space-y-2">
            <Button
              onClick={handleView}
              className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary hover:to-accent text-white"
            >
              <Eye className="h-4 w-4 mr-2" />
              {t("drinkReady.viewDrink") || "View Drink"}
            </Button>
            <Button onClick={dismissReadyDrink} variant="outline" className="w-full">
              {t("drinkReady.later") || "Later"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DrinkReadyModal;