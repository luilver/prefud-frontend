import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Clock,
  Users,
  ChefHat,
  Play,
  BookOpen,
  Check,
  Timer,
  Flame,
  Maximize,
  X,
  ShoppingCart,
  Package,
} from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { toast } from "sonner";
import MealShoppingModal from "./MealShoppingModal";
import { useLanguage } from "@/contexts/LanguageContext";
import { Checkbox } from "@/components/ui/checkbox";
import { addIngredientsToPantry, updatePantry } from "@/services/pantryService";
import { useCart } from "@/contexts/CartContext";
import AddToCartButton from "./AddToCartButton";
import { useAddToCart } from "@/hooks/useAddToCart";

interface AIMealViewProps {
  meal: any;
  onBack: () => void;
}

const AIMealView = ({ meal, onBack }: AIMealViewProps) => {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showShoppingModal, setShowShoppingModal] = useState(false);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const { deleteAIMeal, addShoppingItem, pantryItems, setPantryItems, user } =
    useUser();
  const { t } = useLanguage();
  const { addItem } = useCart();

  const toggleStep = (stepIndex: number) => {
    if (completedSteps.includes(stepIndex)) {
      setCompletedSteps(completedSteps.filter((i) => i !== stepIndex));
    } else {
      setCompletedSteps([...completedSteps, stepIndex]);
    }
  };

  const openFullscreenVideo = () => {
    setIsFullscreen(true);
    setIsVideoPlaying(true);
  };

  const closeFullscreenVideo = () => {
    setIsFullscreen(false);
    setIsVideoPlaying(false);
  };

  const handleDelete = () => {
    deleteAIMeal(meal.id);
    toast.success("AI meal deleted successfully!");
    onBack();
  };

  const openShoppingModal = () => {
    setShowShoppingModal(true);
  };

  const handleCreateShoppingList = () => {
    try {
      const ingredients = getIngredientsForShopping();
      ingredients.forEach((ingredient) => {
        addShoppingItem({
          name: ingredient.name,
          quantity: ingredient.quantity,
          unit: ingredient.unit,
          category: ingredient.category || "ingredient aqui",
          priority: "medium",
          purchased: false,
          notes: `From AI meal: ${meal.name}`,
        });
      });

      toast.success(
        `Shopping List Created! Added ${ingredients.length} ingredients to your shopping list.`
      );
    } catch (error) {
      console.error("Error creating shopping list:", error);
      toast.error("Failed to create shopping list. Please try again.");
    }
  };

  const getIngredientsForShopping = () => {
    console.log("get infredients for shopping", meal.ingredientsList);
    if (meal.ingredientsList && Array.isArray(meal.ingredientsList)) {
      return meal.ingredientsList.map((ingredient: any) => {
        if (typeof ingredient === "object" && ingredient.name) {
          return {
            name: ingredient.name,
            quantity: ingredient.quantity || 1,
            unit: ingredient.unit || "unit",
            classification: ingredient.classification || "ingredient",
            carbonFootPrintToWaste: ingredient.carbonFootPrintToWaste,
            daysToExpire: ingredient.daysToExpire || 7,
          };
        }

        const ingredientStr = String(ingredient);
        const match = ingredientStr.match(/^(\d+(?:\.\d+)?)\s*(\w+)\s+(.+)$/);
        if (match) {
          return {
            name: match[3],
            quantity: parseFloat(match[1]),
            unit: match[2],
            classification: "ingredient",
          };
        }
        return {
          name: ingredientStr,
          quantity: 1,
          unit: "unit",
          classification: "ingredient",
        };
      });
    }

    return [];
  };

  const handleIngredientToggle = (ingredientName: string) => {
    setSelectedIngredients((prev) =>
      prev.includes(ingredientName)
        ? prev.filter((name) => name !== ingredientName)
        : [...prev, ingredientName]
    );
  };

  const handleAddToPantry = async () => {
    try {
      console.log("get ingredients for shopping", getIngredientsForShopping());
      const ingredientsToAdd = getIngredientsForShopping().filter(
        (ingredient) => selectedIngredients.includes(ingredient.name)
      );
      console.log("items to add to pantry", ingredientsToAdd);
      const newPantryItems = [];
      ingredientsToAdd.forEach((ingredient) => {
        const newPantryItem = {
          id: `pantry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: ingredient.name,
          quantity: ingredient.quantity,
          unit: ingredient.unit,
          category: ingredient.classification || "ingredient",
          purchased: true,
          purchaseDate: new Date().toISOString(),
          carbonFootPrintToWaste: ingredient.carbonFootPrintToWaste || 0,
          daysToExpire: ingredient.daysToExpire || 7,
          expiryDate: new Date(
            Date.now() + ingredient.daysToExpire * 24 * 60 * 60 * 1000
          ).toISOString(),
          notes: `Carbon footprint:: ${ingredient.carbonFootPrintToWaste}`,
        };
        newPantryItems.push(newPantryItem);
        // setPantryItems(prev => [...prev, newPantryItem]);
        // console.log('pantry items after adding', [...pantryItems, newPantryItem]);
      });
      console.log(
        "get ingredients prevously added to pantry uptaded",
        newPantryItems
      );
      try {
        

        const responseUpdatePantry = await addIngredientsToPantry(user.id, [
         ...newPantryItems
        ]);
        console.log("response from update pantry", responseUpdatePantry);
        if (responseUpdatePantry.success) {
          console.log('todo sin novedad')
          throw new Error("Failed to update pantry");
        }
      } catch (error) {
        console.log("error updating pantry", error);
      }
      toast.success(`Added ${ingredientsToAdd.length} ingredients to pantry!`);
      setSelectedIngredients([]);
    } catch (error) {
      console.error("Error adding to pantry:", error);
      toast.error("Failed to add ingredients to pantry. Please try again.");
    }
  };

  const { handleAddToCart } = useAddToCart({
    ingredients: getIngredientsForShopping().map(ingredient => ({
      ...ingredient,
      category: ingredient.classification || "ingredient"
    })),
    selectedIngredients,
    onSuccess: () => setSelectedIngredients([])
  });

  const handleSelectAllIngredients = () => {
    const allIngredients = getIngredientsForShopping();
    if (selectedIngredients.length === allIngredients.length) {
      setSelectedIngredients([]);
    } else {
      setSelectedIngredients(allIngredients.map(ingredient => ingredient.name));
    }
  };

  const getSelectedIngredientsForOrder = () => {
    return getIngredientsForShopping()
      .filter((ingredient) => selectedIngredients.includes(ingredient.name))
      .map((ingredient) => ({
        id: `ingredient-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}`,
        name: ingredient.name,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
        category: ingredient.classification || "ingredient",
        estimatedPrice: Math.floor(Math.random() * 10) + 2,
        mealName: meal.name,
      }));
  };

  const nutrition = useMemo(
    () => ({
      calories: meal.calories || 300,
      protein: Math.floor(((meal.calories || 300) * 0.2) / 4),
      carbs: Math.floor(((meal.calories || 300) * 0.5) / 4),
      fat: Math.floor(((meal.calories || 300) * 0.3) / 9),
      fiber: Math.floor(Math.random() * 8) + 3,
      sodium: Math.floor(Math.random() * 800) + 200,
    }),
    [meal.calories]
  );

  const getIngredientsWithQuantities = (ingredients: any[]) => {
    return ingredients.map((ingredient) => {
      // Ensure ingredient is a string, handle objects or other types
      const ingredientStr =
        typeof ingredient === "string"
          ? ingredient
          : typeof ingredient === "object" && ingredient?.name
          ? ingredient.name
          : String(ingredient);

      if (/^\d/.test(ingredientStr)) {
        return ingredientStr;
      }

      const quantities = {
        chicken: "2 lbs",
        vegetables: "1 cup",
        oil: "2 tbsp",
        salt: "1 tsp",
        pepper: "1/2 tsp",
        garlic: "2 cloves",
        onion: "1 medium",
        tomato: "2 medium",
        rice: "1 cup",
        pasta: "8 oz",
        cheese: "1/2 cup",
        milk: "1 cup",
        flour: "2 cups",
        sugar: "1/4 cup",
        butter: "2 tbsp",
      };

      const ingredientLower = ingredientStr.toLowerCase();
      for (const [key, quantity] of Object.entries(quantities)) {
        if (ingredientLower.includes(key)) {
          return `${quantity} ${ingredientStr}`;
        }
      }

      return `1 unit ${ingredientStr}`;
    });
  };

  const enhancedIngredients = useMemo(
    () => getIngredientsWithQuantities(meal.ingredients || []),
    [meal.ingredients]
  );

  const enhancedInstructions = useMemo(() => {
    const cookingTips = [
      t("aiMealGenerator.heatPan") || "🔥 Heat your pan to medium-high heat",
      t("aiMealGenerator.patience") ||
        "⏱️ Don't rush this step - patience makes perfect!",
      t("aiMealGenerator.taste") || "👨‍🍳 Pro tip: Taste as you go",
      t("aiMealGenerator.magic") || "🌟 This is where the magic happens",
      t("aiMealGenerator.stir") || "💡 Keep stirring to prevent sticking",
      t("aiMealGenerator.almost") || "🎯 Almost there - you're doing great!",
      t("aiMealGenerator.aroma") || "✨ The aroma should be amazing now",
      t("aiMealGenerator.final") || "🏆 Final stretch - you've got this!",
    ];

    return (meal.instructions || []).map(
      (instruction: string, index: number) => ({
        text: instruction,
        tip: cookingTips[index % cookingTips.length],
        estimatedTime: 2 + (index % 5), // Fixed time based on step index instead of random
      })
    );
  }, [meal.instructions]);

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        {/* Mobile-first header with sticky positioning */}
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b">
          <div className="flex items-center justify-between px-4 py-3">
            <Button variant="ghost" onClick={onBack} size="sm" className="p-2">
              ← {t("aiMealView.backToAiMeals") || "Back"}
            </Button>
            <Button
              onClick={openShoppingModal}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              size="sm"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              {t("aiMealView.shoppingList") || "Shop"}
            </Button>
          </div>
        </div>

        <div className="px-4 py-6 space-y-6 max-w-4xl mx-auto">
          {/* Hero Card - Mobile Optimized */}
          <Card className="overflow-hidden border-0 shadow-lg">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10" />
              <CardHeader className="relative pb-4">
                <CardTitle className="text-xl md:text-3xl font-bold mb-2 leading-tight">
                  {meal.name}
                </CardTitle>
                <CardDescription className="text-base md:text-lg mb-4">
                  {meal.description}
                </CardDescription>

                {/* Stats - Mobile Grid */}
                <div className="grid grid-cols-3 gap-3 mt-4">
                  <div className="flex flex-col items-center p-3 bg-background/60 rounded-lg backdrop-blur-sm">
                    <Clock className="h-5 w-5 text-primary mb-1" />
                    <span className="text-xs font-medium text-center">
                      {meal.cookingTime || meal.prepTime}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {t("aiMealView.minutes") || "min"}
                    </span>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-background/60 rounded-lg backdrop-blur-sm">
                    <Users className="h-5 w-5 text-primary mb-1" />
                    <span className="text-xs font-medium text-center">2</span>
                    <span className="text-xs text-muted-foreground">
                      {t("aiMealView.servings") || "servings"}
                    </span>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-background/60 rounded-lg backdrop-blur-sm">
                    <ChefHat className="h-5 w-5 text-primary mb-1" />
                    <span className="text-xs font-medium text-center capitalize">
                      {meal.difficulty}
                    </span>
                    <span className="text-xs text-muted-foreground">level</span>
                  </div>
                </div>
              </CardHeader>
            </div>
          </Card>
          {/* Mobile-first Tabs */}
          <Tabs defaultValue="recipe" className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-12 mb-6">
              <TabsTrigger value="recipe" className="text-sm">
                <BookOpen className="h-4 w-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">
                  {t("aiMealView.recipeTab") || "Recipe"}
                </span>
                <span className="sm:hidden">Recipe</span>
              </TabsTrigger>
              <TabsTrigger value="ingredients" className="text-sm">
                <Package className="h-4 w-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">
                  {t("aiMealView.ingredientsSelector") || "Ingredients"}
                </span>
                <span className="sm:hidden">Items</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="recipe" className="space-y-6">
              {/* Ingredients Card - Mobile Optimized */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <span>{t("aiMealView.ingredientsTitle") || "Ingredients"}</span>
                  </CardTitle>
                  <CardDescription>
                    {t("aiMealView.ingredientsDesc") || "Everything you need for this recipe"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {enhancedIngredients.map((ingredient: string, index: number) => (
                      <div
                        key={index}
                        className="flex items-start space-x-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <span className="flex-1 text-sm md:text-base leading-relaxed">
                          {ingredient}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Instructions Card - Mobile Optimized */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-2">
                    <Flame className="h-5 w-5 text-orange-600" />
                    <span>{t("aiMealView.instructionsTitle") || "Cooking Steps"}</span>
                  </CardTitle>
                  <CardDescription>
                    {t("aiMealView.instructionsDesc") || "Tap each step when completed"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {enhancedInstructions.map((instruction, index) => (
                      <div
                        key={index}
                        className={`relative p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer active:scale-95 ${
                          completedSteps.includes(index)
                            ? "bg-primary/10 border-primary shadow-md"
                            : "bg-background border-border hover:border-primary/50 hover:shadow-lg"
                        }`}
                        onClick={() => toggleStep(index)}
                      >
                        <div className="flex items-start space-x-4">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 flex-shrink-0 ${
                              completedSteps.includes(index)
                                ? "bg-primary text-primary-foreground shadow-lg scale-110"
                                : "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-md"
                            }`}
                          >
                            {completedSteps.includes(index) ? (
                              <Check className="h-5 w-5" />
                            ) : (
                              index + 1
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-sm md:text-base leading-relaxed transition-all duration-300 ${
                                completedSteps.includes(index)
                                  ? "line-through text-muted-foreground"
                                  : "text-foreground"
                              }`}
                            >
                              {instruction.text}
                            </p>

                            {!completedSteps.includes(index) && (
                              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                                <span className="inline-flex items-center px-2 py-1 rounded-full bg-primary/10 text-primary">
                                  <Timer className="h-3 w-3 mr-1" />~
                                  {instruction.estimatedTime} min
                                </span>
                                <span className="text-muted-foreground italic">
                                  {instruction.tip}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {completedSteps.includes(index) && (
                          <div className="absolute top-3 right-3">
                            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center animate-pulse">
                              <Check className="h-3 w-3 text-primary-foreground" />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ingredients" className="space-y-4">
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Package className="h-5 w-5 text-primary" />
                      <span>Ingredients Selector</span>
                    </div>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                      {selectedIngredients.length} selected
                    </span>
                  </CardTitle>
                  <CardDescription>
                    Select ingredients to add to your pantry or order online
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {getIngredientsForShopping().map((ingredient, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-3 p-4 border-2 rounded-xl hover:bg-muted/30 transition-colors active:scale-95"
                      >
                        <Checkbox
                          id={`ingredient-${index}`}
                          checked={selectedIngredients.includes(ingredient.name)}
                          onCheckedChange={() => handleIngredientToggle(ingredient.name)}
                          className="w-5 h-5"
                        />
                        <label
                          htmlFor={`ingredient-${index}`}
                          className="flex-1 cursor-pointer"
                        >
                          <div className="font-medium text-sm md:text-base">{ingredient.name}</div>
                          <div className="text-xs md:text-sm text-muted-foreground">
                            {ingredient.quantity} {ingredient.unit}
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>

                  {selectedIngredients.length > 0 && (
                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                      <Button
                        onClick={handleAddToPantry}
                        className="flex-1 bg-green-600 hover:bg-green-700 h-12"
                        size="lg"
                      >
                        <Package className="h-5 w-5 mr-2" />
                        Add to Pantry ({selectedIngredients.length})
                      </Button>
                      <Button
                        onClick={() => handleAddToCart()}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 h-12"
                        size="lg"
                      >
                        <ShoppingCart className="h-5 w-5 mr-2" />
                        Add to Cart ({selectedIngredients.length})
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

          </Tabs>

          {/* Mobile-optimized Info Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Nutrition Facts */}
            <Card className="md:col-span-1">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Flame className="h-5 w-5 text-orange-500" />
                  <span>{t("aiMealView.nutritionFacts") || "Nutrition Facts"}</span>
                </CardTitle>
                <CardDescription>
                  {t("aiMealView.perServing") || "Per serving"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col items-center p-3 bg-muted/30 rounded-lg">
                    <span className="text-lg font-bold text-primary">{nutrition.calories}</span>
                    <span className="text-xs text-muted-foreground">{t("aiMealView.calories") || "Calories"}</span>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-muted/30 rounded-lg">
                    <span className="text-lg font-bold text-primary">{nutrition.protein}g</span>
                    <span className="text-xs text-muted-foreground">{t("aiMealView.protein") || "Protein"}</span>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-muted/30 rounded-lg">
                    <span className="text-lg font-bold text-primary">{nutrition.carbs}g</span>
                    <span className="text-xs text-muted-foreground">{t("aiMealView.carbs") || "Carbs"}</span>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-muted/30 rounded-lg">
                    <span className="text-lg font-bold text-primary">{nutrition.fat}g</span>
                    <span className="text-xs text-muted-foreground">{t("aiMealView.fat") || "Fat"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="md:col-span-1">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-blue-500" />
                  <span>{t("aiMealView.quickActions") || "Quick Actions"}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={handleCreateShoppingList}
                  className="w-full h-12 justify-start"
                  variant="outline"
                >
                  <ShoppingCart className="h-5 w-5 mr-3" />
                  <span className="text-sm">{t("aiMealView.addToQuickShopping") || "Add to Shopping"}</span>
                </Button>
                <Button className="w-full h-12 justify-start" variant="outline">
                  <BookOpen className="h-5 w-5 mr-3" />
                  <span className="text-sm">{t("aiMealView.markAsFavorite") || "Mark Favorite"}</span>
                </Button>
                <Button className="w-full h-12 justify-start" variant="outline">
                  <ChefHat className="h-5 w-5 mr-3" />
                  <span className="text-sm">{t("aiMealView.markAsCooked") || "Mark Cooked"}</span>
                </Button>
              </CardContent>
            </Card>

            {/* Cooking Progress */}
            <Card className="md:col-span-2 lg:col-span-1">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Timer className="h-5 w-5 text-green-500" />
                  <span>{t("aiMealView.cookingProgress") || "Progress"}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className="relative w-24 h-24 mx-auto">
                    <div className="absolute inset-0 rounded-full border-8 border-muted"></div>
                    <div 
                      className="absolute inset-0 rounded-full border-8 border-primary border-t-transparent transform -rotate-90 transition-all duration-500"
                      style={{
                        background: `conic-gradient(from 0deg, hsl(var(--primary)) ${(completedSteps.length / enhancedInstructions.length) * 100}%, transparent 0%)`
                      }}
                    ></div>
                    <div className="absolute inset-2 bg-background rounded-full flex items-center justify-center">
                      <span className="text-lg font-bold text-primary">
                        {Math.round((completedSteps.length / enhancedInstructions.length) * 100)}%
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {completedSteps.length} {t("aiMealView.of") || "of"} {enhancedInstructions.length}{" "}
                    {t("aiMealView.stepsCompleted") || "steps completed"}
                  </p>
                  {completedSteps.length === enhancedInstructions.length && enhancedInstructions.length > 0 && (
                    <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                      <p className="text-sm text-primary font-medium">
                        🎉 {t("aiMealView.recipeCompleted") || "Congratulations! Recipe completed!"}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Fullscreen Video Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          <div className="relative w-full h-full">
            <Button
              onClick={closeFullscreenVideo}
              className="absolute top-4 right-4 z-10 bg-red-600 hover:bg-red-700 rounded-full p-3"
              size="sm"
            >
              <X className="h-6 w-6" />
            </Button>
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/ixpYIgHlU60?autoplay=1"
              title="Recipe Video Tutorial - Fullscreen"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          </div>
        </div>
      )}

      {/* Modals */}
      <MealShoppingModal
        meal={meal}
        isOpen={showShoppingModal}
        onClose={() => setShowShoppingModal(false)}
      />
    </>
  );
};

export default AIMealView;
