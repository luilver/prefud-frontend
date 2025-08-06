import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Users, ChefHat, Play, BookOpen, Check, Timer, Flame, Maximize, X, ShoppingCart } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { toast } from "sonner";
import MealShoppingModal from "./MealShoppingModal";

interface AIMealViewProps {
  meal: any;
  onBack: () => void;
}

const AIMealView = ({ meal, onBack }: AIMealViewProps) => {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showShoppingModal, setShowShoppingModal] = useState(false);
  const { deleteAIMeal, addShoppingItem } = useUser();

  const toggleStep = (stepIndex: number) => {
    if (completedSteps.includes(stepIndex)) {
      setCompletedSteps(completedSteps.filter(i => i !== stepIndex));
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
          category: ingredient.classification || 'ingredient',
          priority: 'medium',
          purchased: false,
          notes: `From AI meal: ${meal.name}`
        });
      });

      toast.success(`Shopping List Created! Added ${ingredients.length} ingredients to your shopping list.`);
    } catch (error) {
      console.error('Error creating shopping list:', error);
      toast.error("Failed to create shopping list. Please try again.");
    }
  };

  const getIngredientsForShopping = () => {
    if (meal.ingredients && Array.isArray(meal.ingredients)) {
      return meal.ingredients.map((ingredient: any) => {
        if (typeof ingredient === 'object' && ingredient.name) {
          return {
            name: ingredient.name,
            quantity: ingredient.quantity || 1,
            unit: ingredient.unit || 'unit',
            classification: ingredient.classification || 'ingredient'
          };
        }
        
        const ingredientStr = String(ingredient);
        const match = ingredientStr.match(/^(\d+(?:\.\d+)?)\s*(\w+)\s+(.+)$/);
        if (match) {
          return {
            name: match[3],
            quantity: parseFloat(match[1]),
            unit: match[2],
            classification: 'ingredient'
          };
        }
        return {
          name: ingredientStr,
          quantity: 1,
          unit: 'unit',
          classification: 'ingredient'
        };
      });
    }
    
    return [];
  };

  const nutrition = useMemo(() => ({
    calories: meal.calories || 300,
    protein: Math.floor((meal.calories || 300) * 0.2 / 4),
    carbs: Math.floor((meal.calories || 300) * 0.5 / 4),
    fat: Math.floor((meal.calories || 300) * 0.3 / 9),
    fiber: Math.floor(Math.random() * 8) + 3,
    sodium: Math.floor(Math.random() * 800) + 200
  }), [meal.calories]);

  const getIngredientsWithQuantities = (ingredients: any[]) => {
    return ingredients.map(ingredient => {
      // Ensure ingredient is a string, handle objects or other types
      const ingredientStr = typeof ingredient === 'string' ? ingredient : 
                           typeof ingredient === 'object' && ingredient?.name ? ingredient.name :
                           String(ingredient);
      
      if (/^\d/.test(ingredientStr)) {
        return ingredientStr;
      }
      
      const quantities = {
        'chicken': '2 lbs',
        'vegetables': '1 cup',
        'oil': '2 tbsp',
        'salt': '1 tsp',
        'pepper': '1/2 tsp',
        'garlic': '2 cloves',
        'onion': '1 medium',
        'tomato': '2 medium',
        'rice': '1 cup',
        'pasta': '8 oz',
        'cheese': '1/2 cup',
        'milk': '1 cup',
        'flour': '2 cups',
        'sugar': '1/4 cup',
        'butter': '2 tbsp'
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

  const enhancedIngredients = useMemo(() => getIngredientsWithQuantities(meal.ingredients || []), [meal.ingredients]);

  const enhancedInstructions = useMemo(() => {
    const cookingTips = [
      "🔥 Heat your pan to medium-high heat",
      "⏱️ Don't rush this step - patience makes perfect!",
      "👨‍🍳 Pro tip: Taste as you go",
      "🌟 This is where the magic happens",
      "💡 Keep stirring to prevent sticking",
      "🎯 Almost there - you're doing great!",
      "✨ The aroma should be amazing now",
      "🏆 Final stretch - you've got this!"
    ];
    
    return (meal.instructions || []).map((instruction: string, index: number) => ({
      text: instruction,
      tip: cookingTips[index % cookingTips.length],
      estimatedTime: 2 + (index % 5) // Fixed time based on step index instead of random
    }));
  }, [meal.instructions]);

  return (
    <>
      <div className="max-w-4xl mx-auto space-y-6 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Button variant="ghost" onClick={onBack} className="self-start">
            ← Back to AI Meals
          </Button>
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={openShoppingModal}
              className="bg-orange-600 hover:bg-orange-700 text-white flex-shrink-0"
              size="sm"
            >
              <ShoppingCart className="h-4 w-4 mr-1" />
              Shopping List
            </Button>
          </div>
        </div>

        <Card className="bg-white/70 backdrop-blur-sm border-purple-200">
          <CardHeader>
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 break-words">
                  {meal.name}
                </CardTitle>
                <CardDescription className="text-base sm:text-lg break-words">
                  {meal.description}
                </CardDescription>
                
                <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 flex-shrink-0" />
                    <span className="font-medium text-sm sm:text-base">{meal.cookingTime || meal.prepTime} minutes</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
                    <span className="font-medium text-sm sm:text-base">2 servings</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ChefHat className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600 flex-shrink-0" />
                    <span className="font-medium capitalize text-sm sm:text-base">{meal.difficulty}</span>
                  </div>
                </div>
              </div>
              
              <div className="w-full sm:w-48 h-32 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <ChefHat className="h-12 w-12 sm:h-16 sm:w-16 text-purple-600 opacity-50" />
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="recipe" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="recipe">Recipe</TabsTrigger>
                <TabsTrigger value="video">Video Tutorial</TabsTrigger>
              </TabsList>
              
              <TabsContent value="recipe" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BookOpen className="h-5 w-5 text-purple-600" />
                      <span>Ingredients</span>
                    </CardTitle>
                    <CardDescription>Everything you need for this recipe</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3">
                      {enhancedIngredients.map((ingredient: string, index: number) => (
                        <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0"></div>
                          <span className="flex-1 break-words">{ingredient}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Flame className="h-5 w-5 text-orange-600" />
                      <span>Cooking Instructions</span>
                    </CardTitle>
                    <CardDescription>Follow these steps for the perfect result</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {enhancedInstructions.map((instruction, index) => (
                        <div
                          key={index}
                          className={`relative p-4 rounded-lg border transition-all duration-300 cursor-pointer transform hover:scale-[1.02] ${
                            completedSteps.includes(index)
                              ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 shadow-md'
                              : 'bg-gradient-to-r from-gray-50 to-blue-50 border-gray-200 hover:border-purple-200 hover:shadow-lg'
                          }`}
                          onClick={() => toggleStep(index)}
                        >
                          <div className="flex items-start space-x-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 flex-shrink-0 ${
                              completedSteps.includes(index)
                                ? 'bg-purple-500 text-white shadow-lg scale-110'
                                : 'bg-gradient-to-br from-purple-400 to-pink-400 text-white shadow-md'
                            }`}>
                              {completedSteps.includes(index) ? (
                                <Check className="h-4 w-4" />
                              ) : (
                                index + 1
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <p className={`text-base leading-relaxed transition-all duration-300 break-words ${
                                completedSteps.includes(index) 
                                  ? 'line-through text-gray-500' 
                                  : 'text-gray-800'
                              }`}>
                                {instruction.text}
                              </p>
                              
                              {!completedSteps.includes(index) && (
                                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
                                  <span className="inline-flex items-center px-2 py-1 rounded-full bg-purple-100 text-purple-700">
                                    <Timer className="h-3 w-3 mr-1" />
                                    ~{instruction.estimatedTime} min
                                  </span>
                                  <span className="text-gray-600 italic">
                                    {instruction.tip}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {completedSteps.includes(index) && (
                            <div className="absolute top-2 right-2">
                              <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center animate-pulse">
                                <Check className="h-3 w-3 text-white" />
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="video">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Play className="h-5 w-5 text-red-600" />
                      <span>Video Tutorial</span>
                    </CardTitle>
                    <CardDescription>
                      Watch step-by-step preparation
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video bg-gradient-to-br from-gray-900 to-gray-700 rounded-lg flex items-center justify-center relative">
                      {!isVideoPlaying ? (
                        <div className="text-center space-y-4">
                          <Button
                            onClick={() => setIsVideoPlaying(true)}
                            size="lg"
                            className="bg-red-600 hover:bg-red-700 rounded-full"
                          >
                            <Play className="h-6 w-6 mr-2" />
                            Play Video
                          </Button>
                          <Button
                            onClick={openFullscreenVideo}
                            variant="outline"
                            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                          >
                            <Maximize className="h-4 w-4 mr-2" />
                            Fullscreen
                          </Button>
                        </div>
                      ) : (
                        <div className="text-white text-center space-y-4">
                          <iframe
                            width="100%"
                            height="315"
                            src="https://www.youtube.com/embed/ixpYIgHlU60"
                            title="Recipe Video Tutorial"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="rounded-lg"
                          ></iframe>
                          <div className="flex justify-center gap-2">
                            <Button
                              onClick={() => setIsVideoPlaying(false)}
                              variant="ghost"
                              className="text-white hover:bg-white/20"
                            >
                              Close Video
                            </Button>
                            <Button
                              onClick={openFullscreenVideo}
                              variant="ghost"
                              className="text-white hover:bg-white/20"
                            >
                              <Maximize className="h-4 w-4 mr-2" />
                              Fullscreen
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Nutrition Facts</CardTitle>
                <CardDescription>Per serving</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium">Calories</span>
                    <span>{nutrition.calories}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Protein</span>
                    <span>{nutrition.protein}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Carbs</span>
                    <span>{nutrition.carbs}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fat</span>
                    <span>{nutrition.fat}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fiber</span>
                    <span>{nutrition.fiber}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sodium</span>
                    <span>{nutrition.sodium}mg</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={handleCreateShoppingList}
                  className="w-full justify-start" 
                  variant="outline"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Quick Shopping
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Mark as Favorite
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <ChefHat className="h-4 w-4 mr-2" />
                  Mark as Cooked
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Cooking Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round((completedSteps.length / enhancedInstructions.length) * 100)}%
                  </div>
                  <p className="text-sm text-gray-600">
                    {completedSteps.length} of {enhancedInstructions.length} steps completed
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(completedSteps.length / enhancedInstructions.length) * 100}%` }}
                    ></div>
                  </div>
                  {completedSteps.length === enhancedInstructions.length && enhancedInstructions.length > 0 && (
                    <div className="mt-3 p-2 bg-purple-100 rounded-lg">
                      <p className="text-sm text-purple-700 font-medium">🎉 Congratulations! Recipe completed!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {isFullscreen && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          <div className="relative w-full h-full">
            <Button
              onClick={closeFullscreenVideo}
              className="absolute top-4 right-4 z-10 bg-red-600 hover:bg-red-700 rounded-full p-2"
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

      <MealShoppingModal
        meal={meal}
        isOpen={showShoppingModal}
        onClose={() => setShowShoppingModal(false)}
      />
    </>
  );
};

export default AIMealView;
