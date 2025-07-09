import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Users, ChefHat, Play, BookOpen, Heart, Share2, Check, Timer, Flame } from "lucide-react";

interface RecipeViewProps {
  meal: any;
  onBack: () => void;
}

const RecipeView = ({ meal, onBack }: RecipeViewProps) => {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const toggleStep = (stepIndex: number) => {
    if (completedSteps.includes(stepIndex)) {
      setCompletedSteps(completedSteps.filter(i => i !== stepIndex));
    } else {
      setCompletedSteps([...completedSteps, stepIndex]);
    }
  };

  const nutrition = {
    calories: meal.calories,
    protein: Math.floor(meal.calories * 0.2 / 4),
    carbs: Math.floor(meal.calories * 0.5 / 4),
    fat: Math.floor(meal.calories * 0.3 / 9),
    fiber: Math.floor(Math.random() * 8) + 3,
    sodium: Math.floor(Math.random() * 800) + 200
  };

  // Enhanced ingredients with quantities
  const getIngredientsWithQuantities = (ingredients: string[]) => {
    return ingredients.map(ingredient => {
      // If ingredient already has quantity, return as is
      if (/^\d/.test(ingredient)) {
        return ingredient;
      }
      
      // Add realistic quantities based on ingredient type
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
      
      const ingredientLower = ingredient.toLowerCase();
      for (const [key, quantity] of Object.entries(quantities)) {
        if (ingredientLower.includes(key)) {
          return `${quantity} ${ingredient}`;
        }
      }
      
      return `1 unit ${ingredient}`;
    });
  };

  const enhancedIngredients = getIngredientsWithQuantities(meal.ingredients);

  // Enhanced instructions with cooking tips
  const getEnhancedInstructions = (instructions: string[]) => {
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
    
    return instructions.map((instruction, index) => ({
      text: instruction,
      tip: cookingTips[index % cookingTips.length],
      estimatedTime: Math.floor(Math.random() * 5) + 2 // 2-6 minutes per step
    }));
  };

  const enhancedInstructions = getEnhancedInstructions(meal.instructions);

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Button variant="ghost" onClick={onBack} className="self-start">
          ← Back to Plan
        </Button>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="flex-shrink-0">
            <Heart className="h-4 w-4 mr-1" />
            Save
          </Button>
          <Button variant="outline" size="sm" className="flex-shrink-0">
            <Share2 className="h-4 w-4 mr-1" />
            Share
          </Button>
        </div>
      </div>

      {/* Recipe Header */}
      <Card className="bg-white/70 backdrop-blur-sm border-green-200">
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 break-words">
                {meal.name}
              </CardTitle>
              <CardDescription className="text-base sm:text-lg break-words">
                A delicious {meal.type} perfect for any time of day
              </CardDescription>
              
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0" />
                  <span className="font-medium text-sm sm:text-base">{meal.prepTime} minutes</span>
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
            
            <div className="w-full sm:w-48 h-32 bg-gradient-to-br from-green-100 to-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <ChefHat className="h-12 w-12 sm:h-16 sm:w-16 text-green-600 opacity-50" />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recipe Content */}
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
                    <BookOpen className="h-5 w-5 text-green-600" />
                    <span>Ingredients</span>
                  </CardTitle>
                  <CardDescription>Everything you need for this recipe</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {enhancedIngredients.map((ingredient: string, index: number) => (
                      <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                        <span className="flex-1 break-words">{ingredient}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Enhanced Instructions */}
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
                            ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-md'
                            : 'bg-gradient-to-r from-gray-50 to-blue-50 border-gray-200 hover:border-orange-200 hover:shadow-lg'
                        }`}
                        onClick={() => toggleStep(index)}
                      >
                        <div className="flex items-start space-x-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 flex-shrink-0 ${
                            completedSteps.includes(index)
                              ? 'bg-green-500 text-white shadow-lg scale-110'
                              : 'bg-gradient-to-br from-orange-400 to-red-400 text-white shadow-md'
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
                                <span className="inline-flex items-center px-2 py-1 rounded-full bg-orange-100 text-orange-700">
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
                            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                              <Check className="h-3 w-3 text-white" />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {enhancedInstructions.length > 0 && (
                    <div className="mt-6 p-4 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg">
                      <p className="text-sm text-gray-700 text-center">
                        💡 <strong>Cooking Tip:</strong> Click on each step to mark it as completed. 
                        Take your time and enjoy the process!
                      </p>
                    </div>
                  )}
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
                      <Button
                        onClick={() => setIsVideoPlaying(true)}
                        size="lg"
                        className="bg-red-600 hover:bg-red-700 rounded-full"
                      >
                        <Play className="h-6 w-6 mr-2" />
                        Play Video
                      </Button>
                    ) : (
                      <div className="text-white text-center">
                        <p className="mb-2">Video Player</p>
                        <p className="text-sm text-gray-300">
                          In a real app, this would show the cooking video
                        </p>
                        <Button
                          onClick={() => setIsVideoPlaying(false)}
                          variant="ghost"
                          className="mt-4 text-white hover:bg-white/20"
                        >
                          Close Video
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 text-center text-sm text-gray-600">
                    <p>Duration: 8:30 | Difficulty: {meal.difficulty}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Nutrition Facts */}
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

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <BookOpen className="h-4 w-4 mr-2" />
                Add to Shopping List
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Heart className="h-4 w-4 mr-2" />
                Mark as Favorite
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <ChefHat className="h-4 w-4 mr-2" />
                Mark as Cooked
              </Button>
            </CardContent>
          </Card>

          {/* Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Cooking Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {Math.round((completedSteps.length / enhancedInstructions.length) * 100)}%
                </div>
                <p className="text-sm text-gray-600">
                  {completedSteps.length} of {enhancedInstructions.length} steps completed
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(completedSteps.length / enhancedInstructions.length) * 100}%` }}
                  ></div>
                </div>
                {completedSteps.length === enhancedInstructions.length && enhancedInstructions.length > 0 && (
                  <div className="mt-3 p-2 bg-green-100 rounded-lg">
                    <p className="text-sm text-green-700 font-medium">🎉 Congratulations! Recipe completed!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RecipeView;
