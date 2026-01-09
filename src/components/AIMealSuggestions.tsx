import { useState } from "react";
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
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/UserContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { generateMealsFromPantry } from "@/services/pantryService";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCookingLoader } from "@/hooks/useCookingLoader";
import { trackEvent } from "@/services/analytics";

interface AIMealSuggestionsProps {
  ingredients: any[];
  onAddMeal: (meal: any, selectedDate?: Date) => void;
}

const AIMealSuggestions = ({
  ingredients,
  onAddMeal,
}: AIMealSuggestionsProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showServingsModal, setShowServingsModal] = useState(false);
  const [servings, setServings] = useState(4);
  const [selectedMealForDetails, setSelectedMealForDetails] =
    useState<any>(null);
  const { toast } = useToast();
  const {
    updatePantryFromIngredients,
    user,
    addFavoriteMeal,
    removeFavoriteMeal,
    isMealFavorite,
  } = useUser();
  const { language } = useLanguage();
  const { showLoader, hideLoader, LoaderComponent } = useCookingLoader();

  const generateSuggestions = async () => {
    trackEvent("button_click", {
      button_name: "pre_generate_meals_expired_submit",
      screen: "pantry_page",
    });
    if (!user?.id) {
      toast({
        title: "Error",
        description: "User not found. Please sign in again.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setShowServingsModal(false);
    showLoader("Creating delicious meal suggestions from your ingredients...");

    try {
      const today = new Date();
      const startDate = today.toISOString().split("T")[0];

      // Map language context to API language
      const languageMap: Record<string, string> = {
        en: "english",
        es: "spanish",
        pt: "portuguese",
      };
      const apiLanguage = languageMap[language] || "english";

      console.log("Generating AI suggestions with params:", {
        userId: user.id,
        startDate,
        servings,
        language: apiLanguage,
      });

      const response = await generateMealsFromPantry(
        user.id,
        startDate,
        servings,
        apiLanguage
      );

      // Handle error codes
      if (response.code === "03") {
        toast({
          title: "Subscription Limit Reached",
          description:
            response.message ||
            "No generated meals available according to your subscription.",
          variant: "destructive",
        });
        return;
      }

      if (response.code === "02") {
        toast({
          title: "No Ingredients Found",
          description:
            response.message ||
            "No ingredients found in pantry to generate meals.",
          variant: "destructive",
        });
        return;
      }

      // Process successful response
      if (response.generatedMeals && Array.isArray(response.generatedMeals)) {
        const transformedMeals = response.generatedMeals.map((meal: any) => ({
          id: `meal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: meal.name,
          description: meal.description,
          prepTime: meal.cookingTime,
          difficulty: "medium",
          calories: meal.calories,
          type: meal.mealType,
          benefits: meal.benefits,
          prepTip: meal.prepTip,
          carbonFootprint: meal.carbonFootprint,
          ingredients: meal.ingredientsList || [],
          steps: meal.steps || [],
          nutritionalInfo: meal.nutritionalInfo,
          instructions: meal.instructions,
        }));

        setSuggestions(transformedMeals);
        toast({
          title: "AI suggestions ready!",
          description: `Generated ${transformedMeals.length} meal suggestions. Total carbon footprint: ${response.totalCarbonFootprint}kg CO2.`,
        });
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error: any) {
      console.error("Error generating suggestions:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message ||
          "Failed to generate suggestions. Please try again.",
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
        title: "Removed from favorites",
        description: `${meal.name} has been removed from your favorites.`,
      });
    } else {
      addFavoriteMeal(meal);
      toast({
        title: "Added to favorites!",
        description: `${meal.name} has been added to your favorites.`,
      });
    }
  };

  const handleMarkAsConsumed = (meal: any) => {
    // TODO: Implement endpoint integration
    toast({
      title: "Marked as consumed!",
      description: `${meal.name} has been marked as consumed.`,
    });
    setSelectedMealForDetails(null);
  };

  return (
    <>
      <LoaderComponent />
      <Card className="bg-white/70 backdrop-blur-sm border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-green-700">
            <Sparkles className="h-5 w-5" />
            <span>AI Meal Suggestions</span>
          </CardTitle>
          <CardDescription>
            Get personalized meal suggestions based on your expiring ingredients
          </CardDescription>
          {!suggestions.length && (
            <>
              <Button
                onClick={async () => {
                  setShowServingsModal(true);
                  trackEvent("button_click", {
                    button_name: "pre_generate_meals_expired_submit",
                    screen: "pantry_page",
                  });
                }}
                disabled={isGenerating}
                className="bg-gradient-to-r from-green-500 to-orange-500 hover:from-green-600 hover:to-orange-600"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {isGenerating ? "Generating..." : "Generate AI Suggestions"}
              </Button>

              <Dialog
                open={showServingsModal}
                onOpenChange={setShowServingsModal}
              >
                <DialogContent className="w-[95vw] max-w-md mx-auto">
                  <DialogHeader>
                    <DialogTitle className="text-base sm:text-lg">
                      Select Number of Servings
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6 py-4">
                    <div className="space-y-3">
                      <Label htmlFor="servings-slider" className="text-sm">
                        Servings:{" "}
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
                      Cancel
                    </Button>
                    <Button
                      onClick={generateSuggestions}
                      className="bg-gradient-to-r from-green-500 to-orange-500 hover:from-green-600 hover:to-orange-600"
                    >
                      Generate Meals
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}
        </CardHeader>

        {suggestions.length > 0 && (
          <CardContent>
            <div className="space-y-4">
              {suggestions.map((meal) => (
                <Card
                  key={meal.id}
                  className="border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50"
                >
                  <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-base sm:text-lg text-orange-700 break-words">
                          {meal.name}
                        </CardTitle>
                        <CardDescription className="text-orange-600 text-sm break-words">
                          {meal.description}
                        </CardDescription>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-2 shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedMealForDetails(meal)}
                          className="border-orange-300 text-orange-700 hover:bg-orange-50 text-xs sm:text-sm w-full sm:w-auto"
                        >
                          <ChefHat className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          View Details
                        </Button>
                        <Button
                          size="sm"
                          variant={
                            isMealFavorite(meal.id) ? "default" : "outline"
                          }
                          onClick={() => handleAddToFavorites(meal)}
                          className={
                            isMealFavorite(meal.id)
                              ? "bg-red-500 hover:bg-red-600 text-white text-xs sm:text-sm w-full sm:w-auto"
                              : "border-red-300 text-red-700 hover:bg-red-50 text-xs sm:text-sm w-full sm:w-auto"
                          }
                        >
                          <Heart
                            className={`h-3 w-3 sm:h-4 sm:w-4 mr-1 ${
                              isMealFavorite(meal.id) ? "fill-current" : ""
                            }`}
                          />
                          {isMealFavorite(meal.id)
                            ? "Favorited"
                            : "Add to Favorites"}
                        </Button>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{meal.prepTime}min</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="h-3 w-3" />
                        <span className="capitalize">{meal.difficulty}</span>
                      </div>
                      <span>{meal.calories} cal</span>
                      {meal.carbonFootprint && (
                        <div className="flex items-center space-x-1">
                          <Leaf className="h-3 w-3 text-green-600" />
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
                className="w-full border-green-200 text-green-700 hover:bg-green-50 text-sm sm:text-base"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {isGenerating ? "Generating..." : "Generate More Suggestions"}
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
                {/* Description */}
                <div>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    {selectedMealForDetails?.description}
                  </p>
                </div>

                {/* Meal Info */}
                <div className="flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>
                      Prep Time: {selectedMealForDetails?.prepTime} min
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ChefHat className="h-4 w-4 text-primary" />
                    <span>
                      Difficulty: {selectedMealForDetails?.difficulty}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-primary" />
                    <span>Servings: {servings}</span>
                  </div>
                  {selectedMealForDetails?.carbonFootprint && (
                    <div className="flex items-center space-x-2">
                      <Leaf className="h-4 w-4 text-green-600" />
                      <span>
                        {selectedMealForDetails.carbonFootprint}kg CO₂
                      </span>
                    </div>
                  )}
                </div>

                {/* Benefits */}
                {selectedMealForDetails?.benefits && (
                  <div>
                    <h3 className="font-semibold mb-2 text-sm sm:text-base">
                      Health Benefits
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      {selectedMealForDetails.benefits}
                    </p>
                  </div>
                )}

                {/* Prep Tip */}
                {selectedMealForDetails?.prepTip && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 sm:p-4 rounded-lg">
                    <h3 className="font-semibold mb-1 text-xs sm:text-sm text-blue-900 dark:text-blue-100">
                      💡 Pro Tip
                    </h3>
                    <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                      {selectedMealForDetails.prepTip}
                    </p>
                  </div>
                )}

                {/* Ingredients */}
                {selectedMealForDetails?.ingredients &&
                  selectedMealForDetails.ingredients.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3 text-sm sm:text-base">
                        Ingredients
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

                {/* Nutritional Info */}
                {selectedMealForDetails?.nutritionalInfo && (
                  <div>
                    <h3 className="font-semibold mb-3 text-sm sm:text-base">
                      Nutritional Information
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                      <div className="bg-muted p-2 sm:p-3 rounded-lg text-center">
                        <p className="text-xs text-muted-foreground">
                          Calories
                        </p>
                        <p className="text-base sm:text-lg font-bold">
                          {selectedMealForDetails.calories}
                        </p>
                      </div>
                      <div className="bg-muted p-2 sm:p-3 rounded-lg text-center">
                        <p className="text-xs text-muted-foreground">Protein</p>
                        <p className="text-base sm:text-lg font-bold">
                          {selectedMealForDetails.nutritionalInfo.protein}g
                        </p>
                      </div>
                      <div className="bg-muted p-2 sm:p-3 rounded-lg text-center">
                        <p className="text-xs text-muted-foreground">Carbs</p>
                        <p className="text-base sm:text-lg font-bold">
                          {selectedMealForDetails.nutritionalInfo.carbohydrates}
                          g
                        </p>
                      </div>
                      <div className="bg-muted p-2 sm:p-3 rounded-lg text-center">
                        <p className="text-xs text-muted-foreground">Fat</p>
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
                            Rich in vitamins:
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

                {/* Steps */}
                {selectedMealForDetails?.steps &&
                  selectedMealForDetails.steps.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3 text-sm sm:text-base">
                        Cooking Instructions
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
                Close
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
                    ? "bg-red-500 hover:bg-red-600"
                    : "border-red-300 text-red-700 hover:bg-red-50"
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
                  ? "Favorited"
                  : "Add to Favorites"}
              </Button>
              <Button
                onClick={() => {
                  if (selectedMealForDetails) {
                    handleMarkAsConsumed(selectedMealForDetails);
                  }
                }}
                className="bg-green-600 hover:bg-green-700 w-full sm:w-auto order-1 sm:order-3"
              >
                <Check className="h-4 w-4 mr-2" />
                Mark as Consumed
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Card>
    </>
  );
};

export default AIMealSuggestions;
