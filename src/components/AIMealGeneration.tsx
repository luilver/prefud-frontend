
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, ChefHat, Play, BookOpen, Heart, Share2, Check, Timer, Flame, Maximize, X, ShoppingCart, Package, Plus } from "lucide-react";
import { useCookingLoader } from "@/hooks/useCookingLoader";
import { useUser } from "@/contexts/UserContext";
import { toast } from "sonner";

interface AIMealGenerationProps {
  mealData: any;
  onMealCreated: (meal: any) => void;
}

const AIMealGeneration = ({ mealData, onMealCreated }: AIMealGenerationProps) => {
  const [meal, setMeal] = useState<any>(null);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showShoppingList, setShowShoppingList] = useState(false);
  const [shoppingList, setShoppingList] = useState<any[]>([]);
  const { showLoader, hideLoader, isLoading, LoaderComponent } = useCookingLoader();
  const { user, addPantryItem } = useUser();

  useEffect(() => {
    generateMeal();
  }, []);

  const generateMeal = async () => {
    showLoader("Analyzing your preferences and creating the perfect meal...");
    
    // Simulate API call with realistic data
    setTimeout(() => {
      const generatedMeal = {
        id: Date.now().toString(),
        name: getRandomMealName(),
        description: "A delightful fusion of flavors that will satisfy your taste buds.",
        cookingTime: Math.floor(Math.random() * 40) + 20,
        servings: mealData.servings || 2,
        difficulty: mealData.cookingSkillLevel || "Medium",
        cuisine: mealData.cuisinePreferences?.[0] || "Fusion",
        calories: Math.floor(Math.random() * 300) + 300,
        ingredients: generateIngredients(),
        instructions: generateInstructions(),
        nutritionalInfo: generateNutritionalInfo(),
        tags: generateTags(mealData)
      };
      setMeal(generatedMeal);
      hideLoader();
    }, 3000);
  };

  const getRandomMealName = () => {
    const names = [
      "Hearty Veggie Bowl",
      "Mediterranean Delight", 
      "Asian Fusion Stir-fry",
      "Protein Power Plate",
      "Garden Fresh Salad",
      "Spiced Comfort Bowl",
      "Healthy Harvest Mix",
      "Savory Quinoa Bowl"
    ];
    return names[Math.floor(Math.random() * names.length)];
  };

  const generateIngredients = () => {
    const baseIngredients = [
      { name: "quinoa", quantity: "1", unit: "cup" },
      { name: "mixed vegetables", quantity: "2", unit: "cups" },
      { name: "olive oil", quantity: "2", unit: "tbsp" },
      { name: "garlic", quantity: "2", unit: "cloves" },
      { name: "onion", quantity: "1", unit: "medium" },
      { name: "bell pepper", quantity: "1", unit: "large" },
      { name: "salt", quantity: "1", unit: "tsp" },
      { name: "black pepper", quantity: "1/2", unit: "tsp" }
    ];
    return baseIngredients.slice(0, Math.floor(Math.random() * 3) + 6);
  };

  const generateInstructions = () => {
    return [
      "Prepare all ingredients by washing and chopping as needed.",
      "Heat oil in a large pan over medium-high heat.",
      "Add aromatics and cook until fragrant, about 2-3 minutes.",
      "Add main ingredients and cook according to type and preference.",
      "Season with salt, pepper, and selected spices.",
      "Combine all elements and cook until heated through.",
      "Taste and adjust seasoning as needed.",
      "Serve hot and enjoy!"
    ];
  };

  const generateNutritionalInfo = () => {
    const calories = meal?.calories || 400;
    return {
      calories,
      protein: Math.floor(calories * 0.25 / 4),
      carbs: Math.floor(calories * 0.45 / 4),
      fat: Math.floor(calories * 0.30 / 9),
      fiber: Math.floor(Math.random() * 8) + 5
    };
  };

  const generateTags = (prefs: any) => {
    const tags = [];
    if (prefs.healthGoals) tags.push(...prefs.healthGoals.slice(0, 2));
    if (prefs.dietaryRestrictions) tags.push(...prefs.dietaryRestrictions.slice(0, 2));
    tags.push("Quick", "Healthy", "Comfort Food");
    return [...new Set(tags)].slice(0, 4);
  };

  const generateShoppingList = () => {
    if (!meal) return;
    
    showLoader("Generating your shopping list...");
    
    setTimeout(() => {
      const list = meal.ingredients.map((ingredient: any, index: number) => ({
        id: `${meal.id}-ingredient-${index}`,
        name: ingredient.name,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
        category: getCategoryForIngredient(ingredient.name),
        estimatedPrice: Math.floor(Math.random() * 800) + 200, // $2-10
        mealName: meal.name,
        notes: `For ${meal.name} recipe`
      }));
      
      setShoppingList(list);
      setShowShoppingList(true);
      hideLoader();
      toast.success("Shopping list generated!");
    }, 1500);
  };

  const getCategoryForIngredient = (ingredientName: string) => {
    const categories: { [key: string]: string } = {
      'quinoa': 'grains',
      'mixed vegetables': 'produce',
      'olive oil': 'condiments',
      'garlic': 'produce',
      'onion': 'produce',
      'bell pepper': 'produce',
      'salt': 'spices',
      'black pepper': 'spices'
    };
    return categories[ingredientName.toLowerCase()] || 'other';
  };

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

  const handleSaveMeal = () => {
    if (meal) {
      // Save meal logic here - for now just show success and call parent
      onMealCreated(meal);
      toast.success("Meal saved successfully!");
    }
  };

  const handleAddToPantry = (item: any) => {
    addPantryItem({
      name: item.name,
      quantity: parseFloat(item.quantity) || 1,
      unit: item.unit || 'piece',
      category: item.category || 'other',
      expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      purchaseDate: new Date(),
      notes: item.notes || `Added from ${item.mealName}`
    });
    toast.success(`${item.name} added to pantry!`);
  };

  const handleOrderOnline = (item: any) => {
    // Simulate online ordering
    toast.success(`${item.name} added to online cart!`);
  };

  const enhancedInstructions = useMemo(() => {
    if (!meal) return [];
    
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
    
    return meal.instructions.map((instruction: string, index: number) => ({
      text: instruction,
      tip: cookingTips[index % cookingTips.length],
      estimatedTime: 2 + (index % 5)
    }));
  }, [meal?.instructions]);

  const nutrition = useMemo(() => {
    if (!meal) return null;
    return generateNutritionalInfo();
  }, [meal]);

  if (isLoading || !meal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center">
        <LoaderComponent />
      </div>
    );
  }

  // Shopping List View
  if (showShoppingList) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 p-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => setShowShoppingList(false)} className="p-2">
              ← Back to Recipe
            </Button>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">Shopping List</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                For {meal.name} • {shoppingList.length} items
              </p>
            </div>
          </div>
        </div>

        {/* Shopping List */}
        <div className="space-y-4">
          {Object.entries(
            shoppingList.reduce((acc: any, item: any) => {
              const category = item.category || 'other';
              if (!acc[category]) acc[category] = [];
              acc[category].push(item);
              return acc;
            }, {})
          ).map(([category, items]: [string, any]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="text-lg capitalize flex items-center justify-between">
                  <span>{category}</span>
                  <Badge variant="secondary">{items.length} items</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {items.map((item: any) => (
                    <div 
                      key={item.id} 
                      className="flex items-center justify-between p-4 rounded-lg border bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium capitalize">{item.name}</p>
                          <Badge variant="outline" className="text-xs">
                            {item.mealName}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          {item.quantity} {item.unit}
                          {item.notes && ` • ${item.notes}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.estimatedPrice && (
                          <div className="text-sm font-medium text-green-600">
                            ${(item.estimatedPrice / 100).toFixed(2)}
                          </div>
                        )}
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddToPantry(item)}
                            className="h-8"
                          >
                            <Package className="h-4 w-4 mr-1" />
                            Add to Pantry
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleOrderOnline(item)}
                            className="h-8"
                          >
                            <ShoppingCart className="h-4 w-4 mr-1" />
                            Order Online
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Total Summary */}
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold">Total Items: {shoppingList.length}</p>
                <p className="text-sm text-gray-600">
                  Estimated Total: ${(shoppingList.reduce((total, item) => total + (item.estimatedPrice || 0), 0) / 100).toFixed(2)}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    shoppingList.forEach(item => handleAddToPantry(item));
                  }}
                >
                  <Package className="h-4 w-4 mr-2" />
                  Add All to Pantry
                </Button>
                <Button
                  onClick={() => {
                    shoppingList.forEach(item => handleOrderOnline(item));
                  }}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Order All Online
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-4xl mx-auto space-y-6 p-4">
        {/* Header - Removed Try Again, Favorite, and Share buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={generateShoppingList}
              className="flex-shrink-0"
            >
              <ShoppingCart className="h-4 w-4 mr-1" />
              Generate Shopping List
            </Button>
          </div>
        </div>

        {/* Meal Header Card */}
        <Card className="bg-white/70 backdrop-blur-sm border-purple-200">
          <CardHeader>
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 break-words">
                  {meal.name}
                </CardTitle>
                <CardDescription className="text-base sm:text-lg break-words mb-4">
                  {meal.description}
                </CardDescription>
                
                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {meal.tags.map((tag: string, index: number) => (
                    <Badge key={index} variant="secondary" className="capitalize">
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                {/* Quick Stats */}
                <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 flex-shrink-0" />
                    <span className="font-medium text-sm sm:text-base">{meal.cookingTime} mins</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
                    <span className="font-medium text-sm sm:text-base">{meal.servings} servings</span>
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

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="recipe" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="recipe">Recipe</TabsTrigger>
                <TabsTrigger value="video">Video Tutorial</TabsTrigger>
              </TabsList>
              
              <TabsContent value="recipe" className="space-y-6">
                {/* Ingredients */}
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
                      {meal.ingredients.map((ingredient: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors border">
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0"></div>
                            <span className="flex-1 break-words capitalize">{ingredient.name}</span>
                          </div>
                          <span className="text-sm text-gray-600 font-medium">
                            {ingredient.quantity} {ingredient.unit}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Instructions */}
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
                      Watch step-by-step preparation for {meal.name}
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

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Nutrition */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Nutrition (per serving)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium">Calories</span>
                    <span>{nutrition?.calories}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Protein</span>
                    <span>{nutrition?.protein}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Carbs</span>
                    <span>{nutrition?.carbs}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fat</span>
                    <span>{nutrition?.fat}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fiber</span>
                    <span>{nutrition?.fiber}g</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cooking Progress */}
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
                      <p className="text-sm text-purple-700 font-medium">🎉 Recipe completed!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Action Button */}
            <Button 
              onClick={handleSaveMeal}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              size="lg"
            >
              Save This Meal
            </Button>
          </div>
        </div>
      </div>

      {/* Fullscreen Video Modal */}
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
    </>
  );
};

export default AIMealGeneration;
