import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { CheckCircle, Sparkles, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAnalyzeImageJob } from "@/contexts/AnalyzeImageJobContext";
import { useUser } from "@/contexts/UserContext";
import { addIngredientsToPantry, type PantryIngredient } from "@/services/pantryService";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const toDateInputValue = (iso: string) => {
  try {
    return format(new Date(iso), "yyyy-MM-dd");
  } catch {
    return "";
  }
};

const AnalyzeImageReadyModal = () => {
  const { t } = useLanguage();
  const { readyIngredients, dismissReadyIngredients } = useAnalyzeImageJob();
  const { user } = useUser();
  const { toast } = useToast();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [items, setItems] = useState<PantryIngredient[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (readyIngredients) {
      setSelected(new Set(readyIngredients.map((i) => i.id)));
      setItems(readyIngredients.map((i) => ({ ...i })));
    } else {
      setSelected(new Set());
      setItems([]);
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

  const updateItem = (id: string, patch: Partial<PantryIngredient>) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
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
    const chosen = items.filter((i) => selected.has(i.id));
    if (chosen.length === 0) {
      dismissReadyIngredients();
      return;
    }
    const invalid = chosen.find(
      (i) => !i.name.trim() || !(Number(i.quantity) > 0)
    );
    if (invalid) {
      toast({
        title: t("addIngredient.error") || "Error",
        description: "Each selected ingredient needs a name and quantity greater than 0.",
        variant: "destructive",
      });
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
      <DialogContent className="sm:max-w-md max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <CheckCircle className="h-14 w-14 text-primary" />
              <div className="absolute -top-2 -right-2 bg-gradient-to-r from-primary to-accent rounded-full p-1">
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
            {items.length} {t("analyzeImageReady.description") || "ingredients detected. Edit and select which to add to your pantry."}
          </p>

          <div className="space-y-2 max-h-72 overflow-y-auto rounded-lg border border-primary/20 p-2">
            {items.map((ing) => {
              const checked = selected.has(ing.id);
              return (
                <div
                  key={ing.id}
                  className="flex items-start gap-3 rounded-md p-2 hover:bg-primary/5"
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() => toggle(ing.id)}
                    className="mt-3"
                  />
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <Input
                      value={ing.name}
                      onChange={(e) => updateItem(ing.id, { name: e.target.value })}
                      placeholder="Name"
                      aria-label={`Ingredient ${ing.name || 'unnamed'} — name`}
                      className="h-9 text-sm capitalize"
                      disabled={!checked}
                    />
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        min={0}
                        step={0.1}
                        value={ing.quantity}
                        onChange={(e) =>
                          updateItem(ing.id, { quantity: parseFloat(e.target.value) || 0 })
                        }
                        aria-label={`Quantity for ${ing.name || 'ingredient'}`}
                        className="h-9 text-sm w-24"
                        disabled={!checked}
                      />
                      <Input
                        value={ing.unit}
                        onChange={(e) => updateItem(ing.id, { unit: e.target.value })}
                        placeholder="unit"
                        aria-label={`Unit for ${ing.name || 'ingredient'}`}
                        className="h-9 text-sm w-24"
                        disabled={!checked}
                      />
                      <span className="flex-1 text-xs text-muted-foreground self-center capitalize truncate">
                        {ing.category}
                      </span>
                    </div>
                    {ing.expiryDate && (
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-muted-foreground shrink-0">
                          Expires
                        </label>
                        <Input
                          type="date"
                          value={toDateInputValue(ing.expiryDate)}
                          onChange={(e) => {
                            const v = e.target.value;
                            if (!v) return;
                            const d = new Date(v);
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            const daysToExpire = Math.round(
                              (d.getTime() - today.getTime()) / 86400000
                            );
                            updateItem(ing.id, {
                              expiryDate: d.toISOString(),
                              daysToExpire,
                            });
                          }}
                          aria-label={`Expiration date for ${ing.name || 'ingredient'}`}
                          className="h-9 text-sm"
                          disabled={!checked}
                        />
                      </div>
                    )}
                  </div>
                </div>
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
              className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary hover:to-accent text-white"
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