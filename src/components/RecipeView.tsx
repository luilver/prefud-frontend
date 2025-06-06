
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Users, ChefHat, Play, BookOpen, Heart, Share2, Check } from "lucide-react";

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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          ← Back to Plan
        </Button>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Heart className="h-4 w-4 mr-1" />
            Save
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-1" />
            Share
          </Button>
        </div>
      </div>

      {/* Recipe Header */}
      <Card className="bg-white/70 backdrop-blur-sm border-green-200">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-3xl font-bold text-gray-800 mb-2">
                {meal.name}
              </CardTitle>
              <CardDescription className="text-lg">
                A delicious {meal.type} perfect for any time of day
              </CardDescription>
              
              <div className="flex items-center space-x-6 mt-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-green-600" />
                  <span className="font-medium">{meal.prepTime} minutes</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">2 servings</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ChefHat className="h-5 w-5 text-orange-600" />
                  <span className="font-medium capitalize">{meal.difficulty}</span>
                </div>
              </div>
            </div>
            
            <div className="w-48 h-32 bg-gradient-to-br from-green-100 to-orange-100 rounded-lg flex items-center justify-center">
              <ChefHat className="h-16 w-16 text-green-600 opacity-50" />
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
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {meal.ingredients.map((ingredient: string, index: number) => (
                      <li key={index} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>{ingredient}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Instructions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <ChefHat className="h-5 w-5 text-orange-600" />
                    <span>Instructions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {meal.instructions.map((instruction: string, index: number) => (
                      <div
                        key={index}
                        className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                          completedSteps.includes(index)
                            ? 'bg-green-50 border-green-200'
                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                        }`}
                        onClick={() => toggleStep(index)}
                      >
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                          completedSteps.includes(index)
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-300 text-gray-700'
                        }`}>
                          {completedSteps.includes(index) ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            index + 1
                          )}
                        </div>
                        <p className={`flex-1 ${
                          completedSteps.includes(index) ? 'line-through text-gray-500' : ''
                        }`}>
                          {instruction}
                        </p>
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
                  {Math.round((completedSteps.length / meal.instructions.length) * 100)}%
                </div>
                <p className="text-sm text-gray-600">
                  {completedSteps.length} of {meal.instructions.length} steps completed
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(completedSteps.length / meal.instructions.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RecipeView;
