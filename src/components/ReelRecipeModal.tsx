import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Clock, 
  Users, 
  ChefHat, 
  Package, 
  ShoppingCart, 
  X,
  Flame,
  Timer
} from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { toast } from "sonner";
import { addIngredientsToPantry, type PantryIngredient } from "@/services/pantryService";
import MealShoppingModal from "./MealShoppingModal";
import OrderOnlineModal from "./OrderOnlineModal";

interface RecipeIngredient {
  name: string;
  quantity: number;
  unit: string;
  classification?: string;
  carbonFootPrintToWaste?: number;
  daysToExpire?: number;
}

interface Recipe {
  id: string;
  title: string;
  chef: string;
  duration: string;
  difficulty: string;
  videoUrl: string;
  thumbnail: string;
  likes: number;
  isLiked: boolean;
  isSaved: boolean;
  description: string;
  steps?: string[];
  ingredients?: RecipeIngredient[];
  calories?: number;
  nutritionalInfo?: {
    protein: number;
    fat: number;
    carbohydrates: number;
    fiber: number;
    vitamins?: string[];
  };
  prepTip?: string;
  benefits?: string[];
  mealType?: string;
  servings?: number;
}

interface ReelRecipeModalProps {
  recipe: Recipe | null;
  isOpen: boolean;
  onClose: () => void;
}

const ReelRecipeModal = ({ recipe, isOpen, onClose }: ReelRecipeModalProps) => {
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [showShoppingModal, setShowShoppingModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const { user, pantryItems, setPantryItems } = useUser();

  if (!recipe) return null;

  // Use actual recipe data from API
  const recipeIngredients = recipe.ingredients || [];
  const recipeSteps = recipe.steps || [];
  const recipeNutrition = recipe.nutritionalInfo || { protein: 0, fat: 0, carbohydrates: 0, fiber: 0 };

  const handleIngredientToggle = (ingredientName: string) => {
    setSelectedIngredients(prev => 
      prev.includes(ingredientName)
        ? prev.filter(name => name !== ingredientName)
        : [...prev, ingredientName]
    );
  };

  const handleAddToPantry = async () => {
    try {
      console.log('Selected ingredients:', selectedIngredients);
      console.log('All available ingredients:', recipeIngredients);

      // Filter ingredients based on selection
      const ingredientsToAdd = recipeIngredients.filter(
        ingredient => selectedIngredients.includes(ingredient.name)
      );

      console.log('Ingredients to add:', ingredientsToAdd);

      if (ingredientsToAdd.length === 0) {
        toast.error("No ingredients selected to add to pantry.");
        return;
      }

      // Create new pantry items with the EXACT structure for the new endpoint
      const currentTime = new Date().toISOString();
      const newPantryItems: PantryIngredient[] = ingredientsToAdd.map(ingredient => {
        const daysToExpire = ingredient.daysToExpire || 30;
        const expiryDate = new Date(Date.now() + daysToExpire * 24 * 60 * 60 * 1000).toISOString();
        
        return {
          id: `pantry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: ingredient.name,
          quantity: ingredient.quantity,
          unit: ingredient.unit,
          category: ingredient.classification || 'other',
          purchased: true,
          purchaseDate: currentTime,
          carbonFootPrintToWaste: ingredient.carbonFootPrintToWaste || 0.1,
          daysToExpire: daysToExpire,
          expiryDate: expiryDate,
          notes: `Carbon footprint: ${ingredient.carbonFootPrintToWaste || 0.1}`
        };
      });

      console.log('New pantry items to add:', newPantryItems);

      // Call the new add-ingredients endpoint if user is available
      if (user?.id) {
        console.log('Calling addIngredientsToPantry with:', newPantryItems);
        await addIngredientsToPantry(user.id, newPantryItems);
      }

      // Convert new pantry items to match the PantryItem interface for local state
      const newPantryItemsForState = newPantryItems.map(item => ({
        ...item,
        purchaseDate: new Date(item.purchaseDate),
        expiryDate: new Date(item.expiryDate),
      }));

      console.log('Updating local state with:', newPantryItemsForState);

      // Update local state (context) with the combined pantry items
      setPantryItems([...(pantryItems || []), ...newPantryItemsForState]);
      
      toast.success(`Successfully added ${ingredientsToAdd.length} ingredients to pantry!`);
      setSelectedIngredients([]);
    } catch (error) {
      console.error("Error adding to pantry:", error);
      toast.error("Failed to add ingredients to pantry. Please try again.");
    }
  };

  const handleOrderOnline = () => {
    setShowOrderModal(true);
  };

  const getSelectedIngredientsForOrder = () => {
    return recipeIngredients
      .filter(ingredient => selectedIngredients.includes(ingredient.name))
      .map(ingredient => ({
        id: `ingredient-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: ingredient.name,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
        category: ingredient.classification || "ingredient",
        estimatedPrice: Math.floor(Math.random() * 10) + 2,
        mealName: recipe.title,
      }));
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-orange-600 bg-orange-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="w-[95vw] max-w-4xl max-h-[85vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="pb-2">
            <DialogTitle className="flex items-center justify-between gap-2">
              <span className="text-base sm:text-xl font-bold line-clamp-2 pr-2">{recipe.title}</span>
              <Button variant="ghost" size="sm" onClick={onClose} className="flex-shrink-0">
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 sm:space-y-6">
            {/* Recipe Header */}
            <div className="flex flex-col gap-3">
              <p className="text-sm sm:text-base text-muted-foreground line-clamp-3">{recipe.description}</p>
              
              <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                <div className="flex items-center space-x-1 sm:space-x-2 text-sm">
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600" />
                  <span className="font-medium">{recipe.duration}</span>
                </div>
                <div className="flex items-center space-x-1 sm:space-x-2 text-sm">
                  <Users className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                  <span className="font-medium">{recipe.servings || 2} servings</span>
                </div>
                <div className="flex items-center space-x-1 sm:space-x-2 text-sm">
                  <ChefHat className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600" />
                  <Badge className={`text-xs ${getDifficultyColor(recipe.difficulty)}`}>
                    {recipe.difficulty}
                  </Badge>
                </div>
                {recipe.calories && (
                  <div className="flex items-center space-x-1 sm:space-x-2 text-sm">
                    <Flame className="h-3 w-3 sm:h-4 sm:w-4 text-orange-500" />
                    <span className="font-medium">{recipe.calories} cal</span>
                  </div>
                )}
              </div>
            </div>

            <Tabs defaultValue="ingredients" className="w-full">
              <TabsList className="grid w-full grid-cols-3 h-auto">
                <TabsTrigger value="ingredients" className="text-xs sm:text-sm py-2 px-1 sm:px-3">Ingredients</TabsTrigger>
                <TabsTrigger value="instructions" className="text-xs sm:text-sm py-2 px-1 sm:px-3">Instructions</TabsTrigger>
                <TabsTrigger value="nutrition" className="text-xs sm:text-sm py-2 px-1 sm:px-3">Nutrition</TabsTrigger>
              </TabsList>

              <TabsContent value="ingredients" className="space-y-3 mt-3">
                <Card className="border-0 shadow-none sm:border sm:shadow-sm">
                  <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-4">
                    <CardTitle className="flex items-center justify-between text-sm sm:text-base">
                      <div className="flex items-center space-x-2">
                        <Package className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                        <span>Recipe Ingredients</span>
                      </div>
                      <span className="text-xs sm:text-sm text-muted-foreground">
                        {selectedIngredients.length} selected
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0 space-y-3">
                    <div className="grid gap-2 max-h-[30vh] overflow-y-auto">
                      {recipeIngredients.length > 0 ? (
                        recipeIngredients.map((ingredient, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <Checkbox
                              id={`ingredient-${index}`}
                              checked={selectedIngredients.includes(ingredient.name)}
                              onCheckedChange={() => handleIngredientToggle(ingredient.name)}
                            />
                            <label
                              htmlFor={`ingredient-${index}`}
                              className="flex-1 cursor-pointer min-w-0"
                            >
                              <div className="font-medium text-sm truncate">{ingredient.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {ingredient.quantity} {ingredient.unit}
                              </div>
                            </label>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted-foreground text-center py-4 text-sm">No ingredients available</p>
                      )}
                    </div>

                    {selectedIngredients.length > 0 && (
                      <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t">
                        <Button
                          onClick={handleAddToPantry}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-xs sm:text-sm h-9 sm:h-10"
                        >
                          <Package className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          Add to Pantry ({selectedIngredients.length})
                        </Button>
                        <Button
                          onClick={handleOrderOnline}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm h-9 sm:h-10"
                        >
                          <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          Order Online ({selectedIngredients.length})
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="instructions" className="mt-3">
                <Card className="border-0 shadow-none sm:border sm:shadow-sm">
                  <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-4">
                    <CardTitle className="flex items-center space-x-2 text-sm sm:text-base">
                      <Flame className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
                      <span>Cooking Instructions</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
                    <div className="space-y-2 sm:space-y-3 max-h-[40vh] overflow-y-auto">
                      {recipeSteps.length > 0 ? (
                        recipeSteps.map((instruction, index) => (
                          <div
                            key={index}
                            className="flex items-start space-x-2 sm:space-x-3 p-2 sm:p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0">
                              {index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-foreground text-xs sm:text-sm">{instruction}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted-foreground text-center py-4 text-sm">No instructions available</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="nutrition" className="mt-3">
                <Card className="border-0 shadow-none sm:border sm:shadow-sm">
                  <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-4">
                    <CardTitle className="text-sm sm:text-base">Nutrition Facts</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                      <div className="flex justify-between p-2 sm:p-3 bg-muted/50 rounded-lg text-xs sm:text-sm">
                        <span className="font-medium">Calories</span>
                        <span className="text-primary font-bold">{recipe.calories || 0}</span>
                      </div>
                      <div className="flex justify-between p-2 sm:p-3 bg-muted/50 rounded-lg text-xs sm:text-sm">
                        <span>Protein</span>
                        <span className="font-medium">{recipeNutrition.protein}g</span>
                      </div>
                      <div className="flex justify-between p-2 sm:p-3 bg-muted/50 rounded-lg text-xs sm:text-sm">
                        <span>Carbs</span>
                        <span className="font-medium">{recipeNutrition.carbohydrates}g</span>
                      </div>
                      <div className="flex justify-between p-2 sm:p-3 bg-muted/50 rounded-lg text-xs sm:text-sm">
                        <span>Fat</span>
                        <span className="font-medium">{recipeNutrition.fat}g</span>
                      </div>
                      <div className="flex justify-between p-2 sm:p-3 bg-muted/50 rounded-lg text-xs sm:text-sm">
                        <span>Fiber</span>
                        <span className="font-medium">{recipeNutrition.fiber}g</span>
                      </div>
                      {recipeNutrition.vitamins && recipeNutrition.vitamins.length > 0 && (
                        <div className="flex justify-between p-2 sm:p-3 bg-muted/50 rounded-lg col-span-2 text-xs sm:text-sm">
                          <span>Vitamins</span>
                          <span className="font-medium">{recipeNutrition.vitamins.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      <MealShoppingModal
        meal={{ 
          name: recipe.title, 
          ingredientsList: recipeIngredients.map(ing => ({
            ...ing,
            classification: ing.classification || 'other',
            carbonFootPrintToWaste: ing.carbonFootPrintToWaste || 0.1,
            daysToExpire: ing.daysToExpire || 30
          }))
        }}
        isOpen={showShoppingModal}
        onClose={() => setShowShoppingModal(false)}
      />

      <OrderOnlineModal
        isOpen={showOrderModal}
        onClose={() => setShowOrderModal(false)}
        items={getSelectedIngredientsForOrder()}
        mealPlanName={recipe.title}
      />
    </>
  );
};

export default ReelRecipeModal;
