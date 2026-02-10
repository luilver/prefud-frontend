import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowLeft,
  Clock,
  Users,
  Droplets,
  Leaf,
  ShoppingCart,
  Eye,
  CheckCircle2,
  Circle,
  Plus,
} from "lucide-react";
import { ApiDrink } from "@/services/drinkService";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";
import DrinkShoppingModal from "./DrinkShoppingModal";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { useAddToCart } from "@/hooks/useAddToCart";
import { addIngredientsToPantry, updatePantry } from "@/services/pantryService";

interface DrinkDetailViewProps {
  drink: ApiDrink;
  onBack: () => void;
}

const DrinkDetailView = ({ drink, onBack }: DrinkDetailViewProps) => {
  const { t } = useLanguage();
  const { addShoppingItem, addPantryItem, pantryItems, user } = useUser();
  const { toast } = useToast();
  const { addItem } = useCart();
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [showShoppingModal, setShowShoppingModal] = useState(false);

  const handleCreateShoppingList = () => {
    try {
      drink.drinkPlan.ingredientsList.forEach((ingredient) => {
        addShoppingItem({
          name: ingredient.name,
          quantity: ingredient.quantity,
          unit: ingredient.unit,
          category: ingredient.classification || "drink-ingredient",
          priority: "medium",
          purchased: false,
          notes: `From drink: ${drink.drink_name}`,
        });
      });

      toast({
        title:
          t("drinkDetailView.shoppingListCreated") || "Shopping List Created!",
        description: `${t("drinkDetailView.added") || "Added"} ${
          drink.drinkPlan.ingredientsList.length
        } ${
          t("drinkDetailView.toShoppingList") ||
          "ingredients to your shopping list"
        }`,
      });
    } catch (error) {
      console.error("Error creating shopping list:", error);
      toast({
        title: t("drinkDetailView.error") || "Error",
        description:
          t("drinkDetailView.shoppingListFailed") ||
          "Failed to create shopping list. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleIngredientSelection = (
    ingredientId: string,
    checked: boolean
  ) => {
    if (checked) {
      setSelectedIngredients((prev) => [...prev, ingredientId]);
    } else {
      setSelectedIngredients((prev) =>
        prev.filter((id) => id !== ingredientId)
      );
    }
  };

  const handleAddToPantry = async () => {
    const selectedIngredientsData = drink.drinkPlan.ingredientsList.filter(
      (ingredient) => selectedIngredients.includes(ingredient.name)
    );

    try {
      selectedIngredientsData.forEach((ingredient) => {
        addPantryItem({
          name: ingredient.name,
          quantity: ingredient.quantity,
          unit: ingredient.unit,
          category: ingredient.classification || "other",
          expiryDate: new Date(
            Date.now() + ingredient.daysToExpire * 24 * 60 * 60 * 1000
          ),
          purchaseDate: new Date(),
          notes: `From drink: ${drink.drink_name}`,
          location: "Pantry",
        });
      });

      ///here the same process to add to pantry
      const newPantryItems = [];
      selectedIngredientsData.forEach((ingredient) => {
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

      try {
        const responseUpdatePantry = await addIngredientsToPantry(user.id, [
          ...newPantryItems,
        ]);

        console.log("first response from update pantry:", responseUpdatePantry);
      } catch (error) {
        console.log("error updating pantry:", error);
      }

      toast({
        title: t("drinkDetailView.addedToPantry") || "Added to Pantry!",
        description: `${t("drinkDetailView.added") || "Added"} ${
          selectedIngredientsData.length
        } ${
          t("drinkDetailView.ingredientsToPantry") ||
          "ingredients to your pantry"
        }`,
      });

      setSelectedIngredients([]);
    } catch (error) {
      console.error("Error adding to pantry:", error);
      toast({
        title: t("drinkDetailView.error") || "Error",
        description:
          t("drinkDetailView.pantryFailed") ||
          "Failed to add ingredients to pantry. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddToCart = () => {
    const selectedIngredientsData = drink.drinkPlan.ingredientsList
      .filter((ingredient) => selectedIngredients.includes(ingredient.name));

    if (selectedIngredientsData.length === 0) {
      toast({
        title:
          t("drinkDetailView.noIngredientsSelected") ||
          "No ingredients selected",
        description:
          t("drinkDetailView.selectIngredientsFirst") ||
          "Please select ingredients first.",
        variant: "destructive",
      });
      return;
    }

    selectedIngredientsData.forEach((ingredient) => {
      addItem({
        name: ingredient.name,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
        category: ingredient.classification || "drink-ingredient"
      });
    });

    toast({
      title: t("drinkDetailView.addedToCart") || "Added to Cart",
      description: `${selectedIngredientsData.length} ${
        t("drinkDetailView.itemsAddedToCart") || "items added to your shopping cart"
      }.`,
      duration: 2000,
    });

    setSelectedIngredients([]);
  };

  const toggleStepCompletion = (stepIndex: number) => {
    setCompletedSteps((prev) =>
      prev.includes(stepIndex)
        ? prev.filter((index) => index !== stepIndex)
        : [...prev, stepIndex]
    );
  };


  const healthyDrink = drink.drinkPlan.healthyDrink;

  return (
    <>
      <div className="space-y-6">
        {/* Header - Made responsive */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Button variant="ghost" onClick={onBack} className="p-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">
              {drink.drink_name}
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              {healthyDrink.name}
            </p>
          </div>
        </div>

        {/* Quick Stats Cards - Made more compact for mobile */}
        <div className="flex overflow-x-auto gap-2 sm:grid sm:grid-cols-4 sm:gap-4 pb-2 sm:pb-0 snap-x snap-mandatory">
          <Card className="bg-card/70 backdrop-blur-sm min-w-[5rem] snap-start flex-shrink-0 sm:min-w-0">
            <CardContent className="flex items-center gap-2 p-2.5 sm:flex-col sm:items-center sm:p-4">
              <Clock className="h-4 w-4 sm:h-6 sm:w-6 text-primary sm:mb-2" />
              <div className="sm:text-center">
                <p className="text-sm font-bold leading-tight">{healthyDrink.cookingTime}</p>
                <p className="text-xs text-muted-foreground">{t("drinkDetailView.min") || "min"}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/70 backdrop-blur-sm min-w-[5rem] snap-start flex-shrink-0 sm:min-w-0">
            <CardContent className="flex items-center gap-2 p-2.5 sm:flex-col sm:items-center sm:p-4">
              <Users className="h-4 w-4 sm:h-6 sm:w-6 text-primary sm:mb-2" />
              <div className="sm:text-center">
                <p className="text-sm font-bold leading-tight">{drink.numberPeople}</p>
                <p className="text-xs text-muted-foreground">{t("drinkDetailView.servings") || "Servings"}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/70 backdrop-blur-sm min-w-[5rem] snap-start flex-shrink-0 sm:min-w-0">
            <CardContent className="flex items-center gap-2 p-2.5 sm:flex-col sm:items-center sm:p-4">
              <Droplets className="h-4 w-4 sm:h-6 sm:w-6 text-accent-foreground sm:mb-2" />
              <div className="sm:text-center">
                <p className="text-sm font-bold leading-tight">{healthyDrink.calories}</p>
                <p className="text-xs text-muted-foreground">{t("drinkDetailView.cal") || "Cal"}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/70 backdrop-blur-sm min-w-[5rem] snap-start flex-shrink-0 sm:min-w-0">
            <CardContent className="flex items-center gap-2 p-2.5 sm:flex-col sm:items-center sm:p-4">
              <Leaf className="h-4 w-4 sm:h-6 sm:w-6 text-primary sm:mb-2" />
              <div className="sm:text-center">
                <p className="text-sm font-bold leading-tight">{drink.drinkPlan.totalCarbonFootprint}</p>
                <p className="text-xs text-muted-foreground">{t("drinkDetailView.co2") || "kg CO₂"}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content - Responsive Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description & Benefits Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-green-800">
                  {t("drinkDetailView.descBenefits") ||
                    "Description & Benefits"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-green-700 mb-2">
                    {t("drinkDetailView.description") || "Description"}
                  </h4>
                  <p className="text-gray-700">{healthyDrink.description}</p>
                </div>
                <div>
                  <h4 className="font-medium text-green-700 mb-2">
                    {t("drinkDetailView.healthBenefits") || "Health Benefits"}
                  </h4>
                  <p className="text-gray-700">{healthyDrink.benefits}</p>
                </div>
                <div>
                  <h4 className="font-medium text-green-700 mb-2">
                    {t("drinkDetailView.instructions") || "Instructions"}
                  </h4>
                  <p className="text-gray-700">{healthyDrink.instructions}</p>
                </div>
              </CardContent>
            </Card>

            {/* Recipe and Shopping List Tabs */}
            <Tabs defaultValue="recipe" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="recipe">
                  {t("drinkDetailView.recipeTab") || "Recipe"}
                </TabsTrigger>
                <TabsTrigger value="shopping">
                  <ShoppingCart className="h-4 w-4 mr-1" />
                  {t("drinkDetailView.shoppingList") || "Shopping List"}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="recipe" className="space-y-6">
                {/* Ingredients Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-primary">
                      {t("drinkDetailView.ingredients") || "Ingredients"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {healthyDrink.ingredients.map((ingredient, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center py-2 border-b border-border last:border-b-0"
                        >
                          <span className="text-sm sm:text-base text-foreground capitalize">
                            {ingredient.name}
                          </span>
                          <span className="text-xs sm:text-sm text-muted-foreground font-medium">
                            {ingredient.quantity} {ingredient.unit}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Preparation Steps Card */}
                <Card>
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <CardTitle className="text-primary">
                        {t("drinkDetailView.prepSteps") || "Preparation Steps"}
                      </CardTitle>
                      <span className="text-sm text-muted-foreground self-center">
                        {completedSteps.length}/{healthyDrink.steps.length}{" "}
                        {t("drinkDetailView.stepsCompleted") || "completed"}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {healthyDrink.steps.map((step, index) => (
                        <div key={index} className="flex space-x-3">
                          <div
                            className="flex-shrink-0 cursor-pointer mt-1"
                            onClick={() => toggleStepCompletion(index)}
                          >
                            {completedSteps.includes(index) ? (
                              <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                            ) : (
                              <Circle className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground hover:text-primary" />
                            )}
                          </div>
                          <p
                            className={`text-sm sm:text-base text-foreground ${
                              completedSteps.includes(index)
                                ? "line-through text-muted-foreground"
                                : ""
                            }`}
                          >
                            <span className="font-medium text-primary mr-2">
                              {t("drinkDetailView.step") || "Step"} {index + 1}:
                            </span>
                            {step}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="shopping" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-primary flex items-center justify-between">
                      <span>
                        {t("drinkDetailView.shoppingList") || "Shopping List"}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const allIngredientNames = drink.drinkPlan.ingredientsList.map(ing => ing.name);
                          setSelectedIngredients(
                            selectedIngredients.length === allIngredientNames.length 
                              ? [] 
                              : allIngredientNames
                          );
                        }}
                      >
                        {selectedIngredients.length === drink.drinkPlan.ingredientsList.length 
                          ? (t("drinkDetailView.deselectAll") || "Deselect All")
                          : (t("drinkDetailView.selectAll") || "Select All")
                        }
                      </Button>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {t("drinkDetailView.selectIngredients") || "Select ingredients to add to cart"}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      {drink.drinkPlan.ingredientsList.map(
                        (ingredient, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50"
                          >
                            <Checkbox
                              id={`shopping-ingredient-${index}`}
                              checked={selectedIngredients.includes(ingredient.name)}
                              onCheckedChange={(checked) =>
                                handleIngredientSelection(ingredient.name, checked as boolean)
                              }
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-foreground capitalize truncate">
                                  {ingredient.name}
                                </span>
                                <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                                  {ingredient.quantity} {ingredient.unit}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {t("drinkDetailView.expires") || "Expires in"}{" "}
                                {ingredient.daysToExpire}{" "}
                                {t("drinkDetailView.days") || "days"}
                              </p>
                            </div>
                          </div>
                        )
                      )}
                    </div>

                    {selectedIngredients.length > 0 && (
                      <div className="flex flex-col gap-2 pt-3 border-t">
                        <p className="text-sm text-muted-foreground mb-2">
                          {selectedIngredients.length}{" "}
                          {t("drinkDetailView.ingredientsSelected") || "ingredients selected"}
                        </p>
                        <Button
                          onClick={handleAddToPantry}
                          variant="outline"
                          className="w-full"
                          size="sm"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          {t("drinkDetailView.addToPantry") || "Add to Pantry"}
                        </Button>
                        <Button
                          onClick={() => handleAddToCart()}
                          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                          size="sm"
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          {t("drinkDetailView.addToCart") || "Add to Cart"}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar - Right Side */}
          <div className="space-y-6">
            {/* Drink Type & Quick Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-green-800 flex items-center space-x-2">
                  <Eye className="h-5 w-5" />
                  <span>{t("drinkDetailView.drinkInfo") || "Drink Info"}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-green-700 mb-2">
                    {t("drinkDetailView.drinkType") || "Drink Type"}
                  </p>
                  <Badge variant="secondary" className="capitalize">
                    {healthyDrink.drinkType}
                  </Badge>
                </div>
                <Separator />
                <div className="space-y-2">
                  {drink.healthGoals && drink.healthGoals.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-green-700 mb-2">
                        {t("drinkDetailView.healthGoals") || "Health Goals"}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {drink.healthGoals.map((goal, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs capitalize"
                          >
                            {goal}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {drink.dietaryRestrictions &&
                    drink.dietaryRestrictions.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-green-700 mb-2">
                          {t("drinkDetailView.dietary") || "Dietary"}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {drink.dietaryRestrictions.map(
                            (restriction, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="text-xs capitalize"
                              >
                                {restriction}
                              </Badge>
                            )
                          )}
                        </div>
                      </div>
                    )}
                </div>
              </CardContent>
            </Card>

            {/* Nutritional Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-green-800">
                  {t("drinkDetailView.nutritionalInfo") || "Nutritional Info"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      {t("drinkDetailView.protein") || "Protein"}
                    </span>
                    <span className="font-medium">
                      {healthyDrink.nutritionalInfo.protein}g
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      {t("drinkDetailView.fat") || "Fat"}
                    </span>
                    <span className="font-medium">
                      {healthyDrink.nutritionalInfo.fat}g
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      {t("drinkDetailView.carbs") || "Carbs"}
                    </span>
                    <span className="font-medium">
                      {healthyDrink.nutritionalInfo.carbohydrates}g
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      {t("drinkDetailView.fiber") || "Fiber"}
                    </span>
                    <span className="font-medium">
                      {healthyDrink.nutritionalInfo.fiber}g
                    </span>
                  </div>
                </div>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-green-700 mb-2">
                    {t("drinkDetailView.vitamins") || "Vitamins"}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {healthyDrink.nutritionalInfo.vitamins.map(
                      (vitamin, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs"
                        >
                          {t("drinkDetailView.vitamin") || "Vitamin"} {vitamin}
                        </Badge>
                      )
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>

        {/* Pro Tip */}
        {healthyDrink.prepTip && (
          <Card className="border-primary/30 bg-primary/10">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row items-start space-y-3 sm:space-y-0 sm:space-x-3">
                <div className="p-2 bg-primary rounded-full flex-shrink-0">
                  <Droplets className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground mb-1">
                    {t("drinkDetailView.proTip") || "Pro Tip"}
                  </h4>
                  <p className="text-sm sm:text-base text-foreground/90">
                    {healthyDrink.prepTip}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <DrinkShoppingModal
          drink={drink}
          isOpen={showShoppingModal}
          onClose={() => setShowShoppingModal(false)}
        />

      </div>
    </>
  );
};

export default DrinkDetailView;
