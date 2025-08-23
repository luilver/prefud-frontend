
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
import { updatePantry, type Ingredient } from "@/services/pantryService";
import MealShoppingModal from "./MealShoppingModal";
import OrderOnlineModal from "./OrderOnlineModal";

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

  // Mock recipe data based on the recipe
  const mockRecipeData = {
    ingredients: [
      { name: "Olive Oil", quantity: 2, unit: "tbsp", classification: "oil" },
      { name: "Garlic", quantity: 3, unit: "cloves", classification: "vegetable" },
      { name: "Onion", quantity: 1, unit: "medium", classification: "vegetable" },
      { name: "Salt", quantity: 1, unit: "tsp", classification: "seasoning" },
      { name: "Black Pepper", quantity: 0.5, unit: "tsp", classification: "seasoning" },
    ],
    instructions: [
      "Heat olive oil in a large pan over medium heat",
      "Add minced garlic and diced onion, cook until fragrant",
      "Season with salt and pepper to taste",
      "Continue cooking until ingredients are well combined",
      "Serve hot and enjoy your delicious meal"
    ],
    nutrition: {
      calories: 250,
      protein: 8,
      carbs: 15,
      fat: 12,
      fiber: 3,
      sodium: 450
    }
  };

  const handleIngredientToggle = (ingredientName: string) => {
    setSelectedIngredients(prev => 
      prev.includes(ingredientName)
        ? prev.filter(name => name !== ingredientName)
        : [...prev, ingredientName]
    );
  };

  const handleAddToPantry = async () => {
    try {
      const ingredientsToAdd = mockRecipeData.ingredients.filter(
        ingredient => selectedIngredients.includes(ingredient.name)
      );

      // Build client-side pantry items to reflect in UI immediately
      const newPantryItems = ingredientsToAdd.map(ingredient => ({
        id: `pantry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: ingredient.name,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
        category: ingredient.classification || "ingredient",
        purchased: true,
        purchaseDate: new Date().toISOString(),
        carbonFootPrintToWaste: 0,
        daysToExpire: 7,
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        notes: `From recipe: ${recipe.title}`,
      }));

      // Convert existing pantry items to Ingredient[] for the service call
      const existingAsIngredients: Ingredient[] = (pantryItems || []).map((item: any) => ({
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        classification: item.category || "ingredient",
        carbonFootPrintToWaste: item.carbonFootPrintToWaste ?? 0,
        daysToExpire: item.daysToExpire ?? 7,
        dayAdded: item.purchaseDate || new Date().toISOString(),
      }));

      // Convert new items to Ingredient[] for the service call
      const newAsIngredients: Ingredient[] = newPantryItems.map(item => ({
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        classification: item.category || "ingredient",
        carbonFootPrintToWaste: item.carbonFootPrintToWaste ?? 0,
        daysToExpire: item.daysToExpire ?? 7,
        dayAdded: item.purchaseDate || new Date().toISOString(),
      }));

      // Call the service with the combined Ingredient[] payload (existing + new)
      await updatePantry(user.id, [...existingAsIngredients, ...newAsIngredients]);

      // Update local state (context) with the combined pantry items
      setPantryItems([...(pantryItems || []), ...newPantryItems]);
      
      toast.success(`Added ${ingredientsToAdd.length} ingredients to pantry!`);
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
    return mockRecipeData.ingredients
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
                    <span className="font-medium">2 servings</span>
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
                      {mockRecipeData.ingredients.map((ingredient, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
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
                            <div className="text-sm text-gray-600">
                              {ingredient.quantity} {ingredient.unit}
                            </div>
                          </label>
                        </div>
                      ))}
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
                      {mockRecipeData.instructions.map((instruction, index) => (
                        <div
                          key={index}
                          className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <p className="text-gray-800">{instruction}</p>
                            <div className="mt-2 flex items-center gap-3 text-xs">
                              <span className="inline-flex items-center px-2 py-1 rounded-full bg-purple-100 text-purple-700">
                                <Timer className="h-3 w-3 mr-1" />
                                ~{2 + (index % 5)} min
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
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
                      <div className="flex justify-between">
                        <span className="font-medium">Calories</span>
                        <span>{mockRecipeData.nutrition.calories}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Protein</span>
                        <span>{mockRecipeData.nutrition.protein}g</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Carbs</span>
                        <span>{mockRecipeData.nutrition.carbs}g</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Fat</span>
                        <span>{mockRecipeData.nutrition.fat}g</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Fiber</span>
                        <span>{mockRecipeData.nutrition.fiber}g</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sodium</span>
                        <span>{mockRecipeData.nutrition.sodium}mg</span>
                      </div>
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
          ingredientsList: mockRecipeData.ingredients 
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
