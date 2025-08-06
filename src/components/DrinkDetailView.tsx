
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Clock, Users, Droplets, Leaf, ShoppingCart, Eye, Play, CheckCircle2, Circle, Maximize, X } from "lucide-react";
import { ApiDrink } from "@/services/drinkService";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";
import DrinkShoppingModal from "./DrinkShoppingModal";

interface DrinkDetailViewProps {
  drink: ApiDrink;
  onBack: () => void;
}

const DrinkDetailView = ({ drink, onBack }: DrinkDetailViewProps) => {
  const { addShoppingItem } = useUser();
  const { toast } = useToast();
  const [showIngredients, setShowIngredients] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [showShoppingModal, setShowShoppingModal] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleCreateShoppingList = () => {
    try {
      drink.drinkPlan.ingredientsList.forEach((ingredient) => {
        addShoppingItem({
          name: ingredient.name,
          quantity: ingredient.quantity,
          unit: ingredient.unit,
          category: ingredient.classification || 'drink-ingredient',
          priority: 'medium',
          purchased: false,
          notes: `From drink: ${drink.drink_name}`
        });
      });

      toast({
        title: "Shopping List Created!",
        description: `Added ${drink.drinkPlan.ingredientsList.length} ingredients to your shopping list.`,
      });
    } catch (error) {
      console.error('Error creating shopping list:', error);
      toast({
        title: "Error",
        description: "Failed to create shopping list. Please try again.",
        variant: "destructive"
      });
    }
  };

  const toggleStepCompletion = (stepIndex: number) => {
    setCompletedSteps(prev => 
      prev.includes(stepIndex)
        ? prev.filter(index => index !== stepIndex)
        : [...prev, stepIndex]
    );
  };

  const openFullscreenVideo = () => {
    setIsFullscreen(true);
    setIsVideoPlaying(true);
  };

  const closeFullscreenVideo = () => {
    setIsFullscreen(false);
    setIsVideoPlaying(false);
  };

  const openShoppingModal = () => {
    setShowShoppingModal(true);
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
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">{drink.drink_name}</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">{healthyDrink.name}</p>
          </div>
        </div>

        {/* Quick Stats Cards - Made more compact for mobile */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
          <Card className="bg-white/70 backdrop-blur-sm">
            <CardContent className="flex flex-col items-center justify-center p-3 sm:p-4">
              <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500 mb-1 sm:mb-2" />
              <div className="text-center">
                <p className="text-sm sm:text-lg font-bold">{healthyDrink.cookingTime}</p>
                <p className="text-xs text-gray-600">min</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/70 backdrop-blur-sm">
            <CardContent className="flex flex-col items-center justify-center p-3 sm:p-4">
              <Users className="h-5 w-5 sm:h-6 sm:w-6 text-green-500 mb-1 sm:mb-2" />
              <div className="text-center">
                <p className="text-sm sm:text-lg font-bold">{drink.numberPeople}</p>
                <p className="text-xs text-gray-600">Servings</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/70 backdrop-blur-sm">
            <CardContent className="flex flex-col items-center justify-center p-3 sm:p-4">
              <Droplets className="h-5 w-5 sm:h-6 sm:w-6 text-orange-500 mb-1 sm:mb-2" />
              <div className="text-center">
                <p className="text-sm sm:text-lg font-bold">{healthyDrink.calories}</p>
                <p className="text-xs text-gray-600">Cal</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/70 backdrop-blur-sm">
            <CardContent className="flex flex-col items-center justify-center p-3 sm:p-4">
              <Leaf className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 mb-1 sm:mb-2" />
              <div className="text-center">
                <p className="text-sm sm:text-lg font-bold">{drink.drinkPlan.totalCarbonFootprint}</p>
                <p className="text-xs text-gray-600">kg CO₂</p>
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
                <CardTitle className="text-green-800">Description & Benefits</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-green-700 mb-2">Description</h4>
                  <p className="text-gray-700">{healthyDrink.description}</p>
                </div>
                <div>
                  <h4 className="font-medium text-green-700 mb-2">Health Benefits</h4>
                  <p className="text-gray-700">{healthyDrink.benefits}</p>
                </div>
                <div>
                  <h4 className="font-medium text-green-700 mb-2">Instructions</h4>
                  <p className="text-gray-700">{healthyDrink.instructions}</p>
                </div>
              </CardContent>
            </Card>

            {/* Recipe and Video Tabs */}
            <Tabs defaultValue="recipe" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="recipe">Recipe</TabsTrigger>
                <TabsTrigger value="video">Video Tutorial</TabsTrigger>
              </TabsList>
              
              <TabsContent value="recipe" className="space-y-6">
                {/* Preparation Steps Card */}
                <Card>
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <CardTitle className="text-green-800">Preparation Steps</CardTitle>
                      <span className="text-sm text-gray-500 self-center">
                        {completedSteps.length}/{healthyDrink.steps.length} completed
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
                              <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-green-500" />
                            ) : (
                              <Circle className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400 hover:text-green-500" />
                            )}
                          </div>
                          <p className={`text-sm sm:text-base text-gray-700 ${
                            completedSteps.includes(index) ? 'line-through text-gray-400' : ''
                          }`}>
                            <span className="font-medium text-green-600 mr-2">Step {index + 1}:</span>
                            {step}
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
                            src={`https://www.youtube.com/embed/results?search_query=${encodeURIComponent(drink.drink_name + ' recipe')}`}
                            title="Drink Video Tutorial"
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

          {/* Sidebar - Right Side */}
          <div className="space-y-6">
            {/* Drink Type & Quick Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-green-800 flex items-center space-x-2">
                  <Eye className="h-5 w-5" />
                  <span>Drink Info</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-green-700 mb-2">Drink Type</p>
                  <Badge variant="secondary" className="capitalize">{healthyDrink.drinkType}</Badge>
                </div>
                <Separator />
                <div className="space-y-2">
                  {drink.healthGoals && drink.healthGoals.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-green-700 mb-2">Health Goals</p>
                      <div className="flex flex-wrap gap-1">
                        {drink.healthGoals.map((goal, index) => (
                          <Badge key={index} variant="outline" className="text-xs capitalize">
                            {goal}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {drink.dietaryRestrictions && drink.dietaryRestrictions.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-green-700 mb-2">Dietary</p>
                      <div className="flex flex-wrap gap-1">
                        {drink.dietaryRestrictions.map((restriction, index) => (
                          <Badge key={index} variant="outline" className="text-xs capitalize">
                            {restriction}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Nutritional Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-green-800">Nutritional Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Protein</span>
                    <span className="font-medium">{healthyDrink.nutritionalInfo.protein}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fat</span>
                    <span className="font-medium">{healthyDrink.nutritionalInfo.fat}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Carbs</span>
                    <span className="font-medium">{healthyDrink.nutritionalInfo.carbohydrates}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fiber</span>
                    <span className="font-medium">{healthyDrink.nutritionalInfo.fiber}g</span>
                  </div>
                </div>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-green-700 mb-2">Vitamins</p>
                  <div className="flex flex-wrap gap-1">
                    {healthyDrink.nutritionalInfo.vitamins.map((vitamin, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        Vitamin {vitamin}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ingredients */}
            <Card>
              <CardHeader>
                <CardTitle className="text-green-800 flex items-center justify-between">
                  <span>Ingredients</span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowIngredients(!showIngredients)}
                  >
                    {showIngredients ? 'Hide' : 'Show'} ({healthyDrink.ingredients.length})
                  </Button>
                </CardTitle>
              </CardHeader>
              {showIngredients && (
                <CardContent>
                  <div className="space-y-2">
                    {healthyDrink.ingredients.map((ingredient, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                        <span className="text-sm sm:text-base text-gray-700 capitalize">{ingredient.name}</span>
                        <span className="text-xs sm:text-sm text-gray-500 font-medium">
                          {ingredient.quantity} {ingredient.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Action Buttons - Made responsive */}
            <div className="space-y-3">
              <Button 
                onClick={openShoppingModal}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Create Shopping List
              </Button>
              <Button 
                onClick={handleCreateShoppingList}
                variant="outline"
                className="w-full"
              >
                Add to Quick Shopping
              </Button>
            </div>
          </div>
        </div>

        {/* Pro Tip - Made responsive */}
        {healthyDrink.prepTip && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row items-start space-y-3 sm:space-y-0 sm:space-x-3">
                <div className="p-2 bg-blue-500 rounded-full flex-shrink-0">
                  <Droplets className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-blue-800 mb-1">Pro Tip</h4>
                  <p className="text-sm sm:text-base text-blue-700">{healthyDrink.prepTip}</p>
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
              src={`https://www.youtube.com/embed/results?search_query=${encodeURIComponent(drink.drink_name + ' recipe')}&autoplay=1`}
              title="Drink Video Tutorial - Fullscreen"
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

export default DrinkDetailView;
