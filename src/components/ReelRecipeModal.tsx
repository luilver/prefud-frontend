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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span className="text-xl font-bold">{recipe.title}</span>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Recipe Header */}
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <p className="text-muted-foreground mb-4">{recipe.description}</p>
                
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-purple-600" />
                    <span className="font-medium">{recipe.duration}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">{recipe.servings || 2} servings</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ChefHat className="h-4 w-4 text-orange-600" />
                    <Badge className={getDifficultyColor(recipe.difficulty)}>
                      {recipe.difficulty}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="w-full lg:w-48 h-32 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
                <img 
                  src={recipe.thumbnail} 
                  alt={recipe.title}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            </div>

            <Tabs defaultValue="ingredients" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
                <TabsTrigger value="instructions">Instructions</TabsTrigger>
                <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
              </TabsList>

              <TabsContent value="ingredients" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Package className="h-5 w-5 text-blue-600" />
                        <span>Recipe Ingredients</span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {selectedIngredients.length} selected
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-3">
                      {recipeIngredients.length > 0 ? (
                        recipeIngredients.map((ingredient, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <Checkbox
                              id={`ingredient-${index}`}
                              checked={selectedIngredients.includes(ingredient.name)}
                              onCheckedChange={() => handleIngredientToggle(ingredient.name)}
                            />
                            <label
                              htmlFor={`ingredient-${index}`}
                              className="flex-1 cursor-pointer"
                            >
                              <div className="font-medium">{ingredient.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {ingredient.quantity} {ingredient.unit}
                              </div>
                            </label>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted-foreground text-center py-4">No ingredients available</p>
                      )}
                    </div>

                    {selectedIngredients.length > 0 && (
                      <div className="flex gap-3 pt-4 border-t">
                        <Button
                          onClick={handleAddToPantry}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          <Package className="h-4 w-4 mr-2" />
                          Add to Pantry ({selectedIngredients.length})
                        </Button>
                        <Button
                          onClick={handleOrderOnline}
                          className="flex-1 bg-blue-600 hover:bg-blue-700"
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Order Online ({selectedIngredients.length})
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="instructions">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Flame className="h-5 w-5 text-orange-600" />
                      <span>Cooking Instructions</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recipeSteps.length > 0 ? (
                        recipeSteps.map((instruction, index) => (
                          <div
                            key={index}
                            className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold flex-shrink-0">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <p className="text-foreground">{instruction}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted-foreground text-center py-4">No instructions available</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="nutrition">
                <Card>
                  <CardHeader>
                    <CardTitle>Nutrition Facts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex justify-between p-3 bg-muted/50 rounded-lg">
                        <span className="font-medium">Calories</span>
                        <span className="text-primary font-bold">{recipe.calories || 0}</span>
                      </div>
                      <div className="flex justify-between p-3 bg-muted/50 rounded-lg">
                        <span>Protein</span>
                        <span className="font-medium">{recipeNutrition.protein}g</span>
                      </div>
                      <div className="flex justify-between p-3 bg-muted/50 rounded-lg">
                        <span>Carbs</span>
                        <span className="font-medium">{recipeNutrition.carbohydrates}g</span>
                      </div>
                      <div className="flex justify-between p-3 bg-muted/50 rounded-lg">
                        <span>Fat</span>
                        <span className="font-medium">{recipeNutrition.fat}g</span>
                      </div>
                      <div className="flex justify-between p-3 bg-muted/50 rounded-lg">
                        <span>Fiber</span>
                        <span className="font-medium">{recipeNutrition.fiber}g</span>
                      </div>
                      {recipeNutrition.vitamins && recipeNutrition.vitamins.length > 0 && (
                        <div className="flex justify-between p-3 bg-muted/50 rounded-lg col-span-2">
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
