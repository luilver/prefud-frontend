import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Sparkles,
  Clock,
  Users,
  Heart,
  ChefHat,
  Leaf,
  Check,
  AlertTriangle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/UserContext";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  generateMealsFromPantryJob,
  PantryMealsNoIngredientsError,
  PantryMealsSubscriptionLimitError,
} from "@/services/pantryService";
import { usePantryMealsJob } from "@/contexts/PantryMealsJobContext";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCookingLoader } from "@/hooks/useCookingLoader";
import { trackEvent } from "@/services/analytics";

interface AIMealSuggestionsProps {
  ingredients: any[];
  onAddMeal: (meal: any, selectedDate?: Date) => void;
}

// Recipe suggestions mapped to ingredient categories
const RECIPE_SUGGESTIONS: Record<string, { name: string; emoji: string }[]> = {
  Meat: [{ name: "Garlic Herb Steak", emoji: "🥩" }, { name: "Chicken Stir Fry", emoji: "🍗" }],
  Dairy: [{ name: "Creamy Pasta Alfredo", emoji: "🧀" }, { name: "Cheese Omelette", emoji: "🥚" }],
  Vegetables: [{ name: "Garden Veggie Bowl", emoji: "🥗" }, { name: "Roasted Veggie Medley", emoji: "🥕" }],
  Fruits: [{ name: "Fresh Fruit Smoothie", emoji: "🍹" }, { name: "Fruit Salad", emoji: "🍎" }],
  Grains: [{ name: "Fried Rice", emoji: "🍚" }, { name: "Grain Bowl", emoji: "🌾" }],
  Pantry: [{ name: "Pasta al Ajillo", emoji: "🍝" }, { name: "Quick Bean Soup", emoji: "🍲" }],
};

const AIMealSuggestions = ({
  ingredients,
  onAddMeal,
}: AIMealSuggestionsProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showServingsModal, setShowServingsModal] = useState(false);
  const [servings, setServings] = useState(4);
  const [selectedMealForDetails, setSelectedMealForDetails] = useState<any>(null);
  const { toast } = useToast();
  const {
    updatePantryFromIngredients,
    user,
    addFavoriteMeal,
    removeFavoriteMeal,
    isMealFavorite,
  } = useUser();
  const { language, t } = useLanguage();
  const { showLoader, hideLoader, LoaderComponent } = useCookingLoader();
  const { startJob } = usePantryMealsJob();

  // Render suggestions inline when the global ready modal dispatches the event
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.meals && Array.isArray(detail.meals)) {
        setSuggestions(detail.meals);
      }
    };
    window.addEventListener("open-pantry-meals", handler);
    return () => window.removeEventListener("open-pantry-meals", handler);
  }, []);

  // Find expiring ingredients (<=3 days)
  const expiringItems = useMemo(() => {
    return ingredients.filter((ing) => {
      if (!ing.expiryDate) return false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const expiry = new Date(ing.expiryDate);
      expiry.setHours(0, 0, 0, 0);
      const diff = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return diff <= 3;
    });
  }, [ingredients]);

  // Build a smart suggestion based on expiring items
  const insightData = useMemo(() => {
    if (expiringItems.length === 0) return null;
    const names = expiringItems.slice(0, 2).map((i) => i.name);
    // Pick a recipe suggestion based on the first expiring item's category
    const cat = expiringItems[0]?.category || "Pantry";
    const recipes = RECIPE_SUGGESTIONS[cat] || RECIPE_SUGGESTIONS["Pantry"];
    const recipe = recipes[Math.floor(Math.random() * recipes.length)];
    return { names, recipe };
  }, [expiringItems]);

  const generateSuggestions = async () => {
    trackEvent("button_click", {
      button_name: "pre_generate_meals_expired_submit",
      screen: "pantry_page",
    });
    if (!user?.id) {
      toast({
        title: t("aiSuggestions.error"),
        description: t("aiSuggestions.userNotFound"),
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setShowServingsModal(false);
    showLoader(t("aiSuggestions.loaderMessage"));

    try {
      const today = new Date();
      const startDate = today.toISOString().split("T")[0];

      const languageMap: Record<string, string> = {
        en: "english",
        es: "spanish",
        pt: "portuguese",
      };
      const apiLanguage = languageMap[language] || "english";

      const { jobId } = await generateMealsFromPantryJob(
        user.id,
        startDate,
        servings,
        apiLanguage
      );

      startJob(jobId, {
        userId: user.id,
        startDate,
        servings,
        language: apiLanguage,
      });

      toast({
        title: t("pantryMealsStarted.title") || "Meal Generation Started",
        description:
          t("pantryMealsStarted.description") ||
          "We'll notify you when your pantry meal ideas are ready.",
        duration: 5000,
      });
    } catch (error: any) {
      if (error instanceof PantryMealsSubscriptionLimitError) {
        toast({
          title: t("aiSuggestions.subscriptionLimit"),
          description: error.apiMessage || t("aiSuggestions.subscriptionLimit"),
          variant: "destructive",
        });
        return;
      }
      if (error instanceof PantryMealsNoIngredientsError) {
        toast({
          title: t("aiSuggestions.noIngredients"),
          description: error.apiMessage || t("aiSuggestions.noIngredients"),
          variant: "destructive",
        });
        return;
      }
      console.error("Error generating suggestions:", error);
      toast({
        title: t("aiSuggestions.error"),
        description:
          error.response?.data?.message ||
          t("aiSuggestions.failedToGenerate"),
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
      hideLoader();
    }
  };

  const handleAddToFavorites = (meal: any) => {
    if (isMealFavorite(meal.id)) {
      removeFavoriteMeal(meal.id);
      toast({
        title: t("aiSuggestions.removedFromFavorites"),
        description: `${meal.name} ${t("aiSuggestions.removedFromFavoritesDesc")}`,
      });
    } else {
      addFavoriteMeal(meal);
      toast({
        title: t("aiSuggestions.addedToFavorites"),
        description: `${meal.name} ${t("aiSuggestions.addedToFavoritesDesc")}`,
      });
    }
  };

  const handleMarkAsConsumed = (meal: any) => {
    toast({
      title: t("aiSuggestions.markedAsConsumed"),
      description: `${meal.name} ${t("aiSuggestions.markedAsConsumedDesc")}`,
    });
    setSelectedMealForDetails(null);
  };

  return (
    <>
      <LoaderComponent />
      <Card className="bg-card/70 backdrop-blur-sm border-primary/20 overflow-hidden">
        {/* AI Insight Card */}
        {!suggestions.length && (
          <div
            className="cursor-pointer"
            onClick={() => setShowServingsModal(true)}
          >
            {insightData ? (
              <div className="relative bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-b border-amber-200/50 p-4 sm:p-5">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-500 to-orange-500" />
                <div className="flex items-start gap-3 ml-2">
                  <div className="p-2 rounded-lg bg-amber-500/15 shrink-0">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-amber-800 mb-1 flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5" />
                      AI Insight
                    </p>
                    <p className="text-sm text-amber-700 leading-relaxed">
                      You have {insightData.names.map((name, i) => (
                        <span key={i}>{i > 0 && " and "}<span className="font-bold">{name}</span></span>
                      ))} expiring soon.
                      How about a <span className="font-semibold">{insightData.recipe.emoji} {insightData.recipe.name}</span>?
                    </p>
                    <p className="text-xs text-amber-600/80 mt-1.5">Tap to generate meals →</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative bg-gradient-to-r from-primary/10 to-accent/10 border-b border-primary/20/50 p-4 sm:p-5">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-accent" />
                <div className="flex items-start gap-3 ml-2">
                  <div className="p-2 rounded-lg bg-primary/15 shrink-0">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-primary mb-0.5">Your pantry is looking fresh! 🌿</p>
                    <p className="text-xs text-primary/80">Generate AI meals anytime. Tap to get started →</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Servings modal - triggered from insight card */}
        {!suggestions.length && (
          <Dialog
            open={showServingsModal}
            onOpenChange={setShowServingsModal}
          >
            <DialogContent className="w-[95vw] max-w-md mx-auto">
              <DialogHeader>
                <DialogTitle className="text-base sm:text-lg">
                  {t("aiSuggestions.selectServings")}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="space-y-3">
                  <Label htmlFor="servings-slider" className="text-sm">
                    {t("aiSuggestions.servings")}:{" "}
                    <span className="font-bold text-primary">
                      {servings}
                    </span>
                  </Label>
                  <Slider
                    id="servings-slider"
                    min={1}
                    max={20}
                    step={1}
                    value={[servings]}
                    onValueChange={(value) => setServings(value[0])}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>1</span>
                    <span>20</span>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowServingsModal(false)}
                >
                  {t("aiSuggestions.cancel")}
                </Button>
                <Button
                  onClick={generateSuggestions}
                  className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                >
                  {t("aiSuggestions.generateMeals")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {suggestions.length > 0 && (
          <CardContent>
            <div className="space-y-4">
              {suggestions.map((meal) => (
                <Card
                  key={meal.id}
                  className="border-accent/30 bg-gradient-to-r from-accent/10 to-accent/5"
                >
                  <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-base sm:text-lg text-accent-foreground break-words">
                          {meal.name}
                        </CardTitle>
                        <CardDescription className="text-muted-foreground text-sm break-words">
                          {meal.description}
                        </CardDescription>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-2 shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedMealForDetails(meal)}
                          className="border-accent/40 text-accent-foreground hover:bg-accent/10 text-xs sm:text-sm w-full sm:w-auto"
                        >
                          <ChefHat className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          {t("aiSuggestions.viewDetails")}
                        </Button>
                        <Button
                          size="sm"
                          variant={
                            isMealFavorite(meal.id) ? "default" : "outline"
                          }
                          onClick={() => handleAddToFavorites(meal)}
                          className={
                            isMealFavorite(meal.id)
                              ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground text-xs sm:text-sm w-full sm:w-auto"
                              : "border-destructive/40 text-destructive hover:bg-destructive/10 text-xs sm:text-sm w-full sm:w-auto"
                          }
                        >
                          <Heart
                            className={`h-3 w-3 sm:h-4 sm:w-4 mr-1 ${
                              isMealFavorite(meal.id) ? "fill-current" : ""
                            }`}
                          />
                          {isMealFavorite(meal.id)
                            ? t("aiSuggestions.favorited")
                            : t("aiSuggestions.addToFavorites")}
                        </Button>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{meal.prepTime}{t("aiSuggestions.min")}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="h-3 w-3" />
                        <span className="capitalize">{meal.difficulty}</span>
                      </div>
                      <span>{meal.calories} {t("aiSuggestions.cal")}</span>
                      {meal.carbonFootprint && (
                        <div className="flex items-center space-x-1">
                          <Leaf className="h-3 w-3 text-primary" />
                          <span>{meal.carbonFootprint}kg CO₂</span>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                </Card>
              ))}

              <Button
                onClick={generateSuggestions}
                variant="outline"
                disabled={isGenerating}
                className="w-full border-primary/30 text-primary hover:bg-primary/10 text-sm sm:text-base"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {isGenerating ? t("aiSuggestions.generating") : t("aiSuggestions.generateMore")}
              </Button>
            </div>
          </CardContent>
        )}

        {/* Meal Details Dialog */}
        <Dialog
          open={!!selectedMealForDetails}
          onOpenChange={(open) => !open && setSelectedMealForDetails(null)}
        >
          <DialogContent className="w-[95vw] max-w-4xl mx-auto max-h-[95vh] overflow-hidden flex flex-col">
            <DialogHeader className="shrink-0 pb-4">
              <DialogTitle className="text-lg sm:text-xl md:text-2xl pr-8">
                {selectedMealForDetails?.name}
              </DialogTitle>
            </DialogHeader>
            <ScrollArea className="flex-1 pr-2 sm:pr-4 -mr-2 sm:-mr-4">
              <div className="space-y-6">
                <div>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    {selectedMealForDetails?.description}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>
                      {t("aiSuggestions.prepTime")}: {selectedMealForDetails?.prepTime} {t("aiSuggestions.min")}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ChefHat className="h-4 w-4 text-primary" />
                    <span>
                      {t("aiSuggestions.difficulty")}: {selectedMealForDetails?.difficulty}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-primary" />
                    <span>{t("aiSuggestions.servingsLabel")}: {servings}</span>
                  </div>
                  {selectedMealForDetails?.carbonFootprint && (
                    <div className="flex items-center space-x-2">
                      <Leaf className="h-4 w-4 text-primary" />
                      <span>
                        {selectedMealForDetails.carbonFootprint}kg CO₂
                      </span>
                    </div>
                  )}
                </div>

                {selectedMealForDetails?.benefits && (
                  <div>
                    <h3 className="font-semibold mb-2 text-sm sm:text-base">
                      {t("aiSuggestions.healthBenefits")}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      {selectedMealForDetails.benefits}
                    </p>
                  </div>
                )}

                {selectedMealForDetails?.prepTip && (
                  <div className="bg-primary/10 p-3 sm:p-4 rounded-lg">
                    <h3 className="font-semibold mb-1 text-xs sm:text-sm text-primary">
                      💡 {t("aiSuggestions.proTip")}
                    </h3>
                    <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed">
                      {selectedMealForDetails.prepTip}
                    </p>
                  </div>
                )}

                {selectedMealForDetails?.ingredients &&
                  selectedMealForDetails.ingredients.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3 text-sm sm:text-base">
                        {t("aiSuggestions.ingredients")}
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                        {selectedMealForDetails.ingredients.map(
                          (ing: any, index: number) => (
                            <div
                              key={index}
                              className="flex items-center space-x-2 text-xs sm:text-sm"
                            >
                              <Badge
                                variant="outline"
                                className="shrink-0 text-xs"
                              >
                                {ing.quantity} {ing.unit}
                              </Badge>
                              <span className="capitalize truncate">
                                {ing.name}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {selectedMealForDetails?.nutritionalInfo && (
                  <div>
                    <h3 className="font-semibold mb-3 text-sm sm:text-base">
                      {t("aiSuggestions.nutritionalInfo")}
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                      <div className="bg-muted p-2 sm:p-3 rounded-lg text-center">
                        <p className="text-xs text-muted-foreground">
                          {t("aiSuggestions.calories")}
                        </p>
                        <p className="text-base sm:text-lg font-bold">
                          {selectedMealForDetails.calories}
                        </p>
                      </div>
                      <div className="bg-muted p-2 sm:p-3 rounded-lg text-center">
                        <p className="text-xs text-muted-foreground">{t("aiSuggestions.protein")}</p>
                        <p className="text-base sm:text-lg font-bold">
                          {selectedMealForDetails.nutritionalInfo.protein}g
                        </p>
                      </div>
                      <div className="bg-muted p-2 sm:p-3 rounded-lg text-center">
                        <p className="text-xs text-muted-foreground">{t("aiSuggestions.carbs")}</p>
                        <p className="text-base sm:text-lg font-bold">
                          {selectedMealForDetails.nutritionalInfo.carbohydrates}
                          g
                        </p>
                      </div>
                      <div className="bg-muted p-2 sm:p-3 rounded-lg text-center">
                        <p className="text-xs text-muted-foreground">{t("aiSuggestions.fat")}</p>
                        <p className="text-base sm:text-lg font-bold">
                          {selectedMealForDetails.nutritionalInfo.fat}g
                        </p>
                      </div>
                    </div>
                    {selectedMealForDetails.nutritionalInfo.vitamins &&
                      selectedMealForDetails.nutritionalInfo.vitamins.length >
                        0 && (
                        <div className="mt-3">
                          <p className="text-xs text-muted-foreground mb-2">
                            {t("aiSuggestions.richInVitamins")}:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {selectedMealForDetails.nutritionalInfo.vitamins.map(
                              (vitamin: string, index: number) => (
                                <Badge
                                  key={index}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  Vitamin {vitamin}
                                </Badge>
                              )
                            )}
                          </div>
                        </div>
                      )}
                  </div>
                )}

                {selectedMealForDetails?.steps &&
                  selectedMealForDetails.steps.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3 text-sm sm:text-base">
                        {t("aiSuggestions.cookingInstructions")}
                      </h3>
                      <ol className="space-y-3 sm:space-y-4">
                        {selectedMealForDetails.steps.map(
                          (step: string, index: number) => (
                            <li key={index} className="flex gap-3">
                              <span className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs sm:text-sm font-bold">
                                {index + 1}
                              </span>
                              <span className="text-xs sm:text-sm pt-0.5 sm:pt-1 leading-relaxed">
                                {step}
                              </span>
                            </li>
                          )
                        )}
                      </ol>
                    </div>
                  )}
              </div>
            </ScrollArea>
            <DialogFooter className="shrink-0 pt-4 gap-2 flex-col sm:flex-row">
              <Button
                variant="outline"
                onClick={() => setSelectedMealForDetails(null)}
                className="w-full sm:w-auto order-3 sm:order-1"
              >
                {t("aiSuggestions.close")}
              </Button>
              <Button
                variant={
                  isMealFavorite(selectedMealForDetails?.id)
                    ? "default"
                    : "outline"
                }
                onClick={() => {
                  if (selectedMealForDetails) {
                    handleAddToFavorites(selectedMealForDetails);
                  }
                }}
                className={`w-full sm:w-auto order-2 ${
                  isMealFavorite(selectedMealForDetails?.id)
                    ? "bg-destructive hover:bg-destructive/90"
                    : "border-destructive/40 text-destructive hover:bg-destructive/10"
                }`}
              >
                <Heart
                  className={`h-4 w-4 mr-2 ${
                    isMealFavorite(selectedMealForDetails?.id)
                      ? "fill-current"
                      : ""
                  }`}
                />
                {isMealFavorite(selectedMealForDetails?.id)
                  ? t("aiSuggestions.favorited")
                  : t("aiSuggestions.addToFavorites")}
              </Button>
              <Button
                onClick={() => {
                  if (selectedMealForDetails) {
                    handleMarkAsConsumed(selectedMealForDetails);
                  }
                }}
                className="bg-primary hover:bg-primary/90 w-full sm:w-auto order-1 sm:order-3"
              >
                <Check className="h-4 w-4 mr-2" />
                {t("aiSuggestions.markAsConsumed")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Card>
    </>
  );
};

export default AIMealSuggestions;
