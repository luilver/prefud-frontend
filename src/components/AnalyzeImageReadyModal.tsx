import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle, Sparkles, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAnalyzeImageJob } from "@/contexts/AnalyzeImageJobContext";
import { useUser } from "@/contexts/UserContext";
import { addIngredientsToPantry } from "@/services/pantryService";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const AnalyzeImageReadyModal = () => {
  const { t } = useLanguage();
  const { readyIngredients, dismissReadyIngredients } = useAnalyzeImageJob();
  const { user } = useUser();
  const { toast } = useToast();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (readyIngredients) {
      setSelected(new Set(readyIngredients.map((i) => i.id)));
    } else {
      setSelected(new Set());
    }
  }, [readyIngredients]);

  if (!readyIngredients) return null;

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAdd = async () => {
    if (!user?.id) {
      toast({
        title: t("addIngredient.error") || "Error",
        description: t("addIngredient.userNotFound") || "User not found",
        variant: "destructive",
      });
      return;
    }
    const chosen = readyIngredients.filter((i) => selected.has(i.id));
    if (chosen.length === 0) {
      dismissReadyIngredients();
      return;
    }
    setIsSaving(true);
    try {
      await addIngredientsToPantry(user.id, chosen);
      toast({
        title: t("addIngredient.allIngredientsAdded") || "Ingredients added",
        description: `${chosen.length} ${t("addIngredient.allIngredientsAddedDesc") || "ingredients added to your pantry"}`,
      });
      window.dispatchEvent(
        new CustomEvent("pantry:ingredients-added", { detail: { ingredients: chosen } })
      );
      dismissReadyIngredients();
    } catch (err: any) {
      console.error("Error adding detected ingredients:", err);
      toast({
        title: t("addIngredient.error") || "Error",
        description: err?.response?.data?.message || t("addIngredient.errorDesc") || "Failed to add ingredients",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={!!readyIngredients} onOpenChange={(open) => { if (!open && !isSaving) dismissReadyIngredients(); }}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <CheckCircle className="h-14 w-14 text-emerald-500" />
              <div className="absolute -top-2 -right-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full p-1">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>
          <DialogTitle className="text-center text-xl font-bold">
            {t("analyzeImageReady.title") || "Ingredients Detected"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <p className="text-sm text-muted-foreground text-center">
            {readyIngredients.length} {t("analyzeImageReady.description") || "ingredients detected. Select which to add to your pantry."}
          </p>

          <div className="space-y-2 max-h-72 overflow-y-auto rounded-lg border border-emerald-100 p-2">
            {readyIngredients.map((ing) => {
              const checked = selected.has(ing.id);
              return (
                <label
                  key={ing.id}
                  className="flex items-start gap-3 rounded-md p-2 hover:bg-emerald-50 cursor-pointer"
                >
                  <Checkbox checked={checked} onCheckedChange={() => toggle(ing.id)} className="mt-1" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm capitalize truncate">{ing.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {ing.quantity} {ing.unit} · <span className="capitalize">{ing.category}</span>
                    </p>
                    {ing.expiryDate && (
                      <p className="text-xs text-muted-foreground">
                        Expires {format(new Date(ing.expiryDate), "MMM d, yyyy")}
                      </p>
                    )}
                  </div>
                </label>
              );
            })}
          </div>

          <p className="text-xs text-center text-muted-foreground">
            {selected.size} {t("analyzeImageReady.selectedCount") || "selected"}
          </p>

          <div className="pt-2 space-y-2">
            <Button
              onClick={handleAdd}
              disabled={isSaving || selected.size === 0}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t("analyzeImageReady.adding") || "Adding…"}
                </>
              ) : (
                t("analyzeImageReady.addSelected") || "Add Selected to Pantry"
              )}
            </Button>
            <Button
              onClick={dismissReadyIngredients}
              variant="outline"
              className="w-full"
              disabled={isSaving}
            >
              {t("analyzeImageReady.cancel") || "Cancel"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AnalyzeImageReadyModal;