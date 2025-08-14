
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Clock, Users, Droplets, Leaf, ShoppingCart, Eye, Play, CheckCircle2, Circle, Maximize, X, Plus } from "lucide-react";
import { ApiDrink } from "@/services/drinkService";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";
import DrinkShoppingModal from "./DrinkShoppingModal";
import OrderOnlineModal from "./OrderOnlineModal";
import { useLanguage } from "@/contexts/LanguageContext";

interface DrinkDetailViewProps {
  drink: ApiDrink;
  onBack: () => void;
}

const DrinkDetailView = ({ drink, onBack }: DrinkDetailViewProps) => {
  const { t } = useLanguage();
  const { addShoppingItem, addPantryItem } = useUser();
  const { toast } = useToast();
  const [showIngredients, setShowIngredients] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [showShoppingModal, setShowShoppingModal] = useState(false);
  const [showOrderOnlineModal, setShowOrderOnlineModal] = useState(false);
  const [showIngredientsSelector, setShowIngredientsSelector] = useState(false);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
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
        title: t("drinkDetailView.shoppingListCreated") || "Shopping List Created!",
        description:
          `${t("drinkDetailView.added") || 'Added'} ${drink.drinkPlan.ingredientsList.length} ${t("drinkDetailView.toShoppingList") || 'ingredients to your shopping list'}`,
      });
    } catch (error) {
      console.error('Error creating shopping list:', error);
      toast({
        title: t("drinkDetailView.error") || "Error",
        description: t("drinkDetailView.shoppingListFailed") || "Failed to create shopping list. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleIngredientSelection = (ingredientId: string, checked: boolean) => {
    if (checked) {
      setSelectedIngredients(prev => [...prev, ingredientId]);
    } else {
      setSelectedIngredients(prev => prev.filter(id => id !== ingredientId));
    }
  };

  const handleAddToPantry = () => {
    const selectedIngredientsData = drink.drinkPlan.ingredientsList.filter(
      ingredient => selectedIngredients.includes(ingredient.name)
    );

    try {
      selectedIngredientsData.forEach((ingredient) => {
        addPantryItem({
          name: ingredient.name,
          quantity: ingredient.quantity,
          unit: ingredient.unit,
          category: ingredient.classification || 'other',
          expiryDate: new Date(Date.now() + ingredient.daysToExpire * 24 * 60 * 60 * 1000),
          purchaseDate: new Date(),
          notes: `From drink: ${drink.drink_name}`,
          location: 'Pantry'
        });
      });

      toast({
        title: t("drinkDetailView.addedToPantry") || "Added to Pantry!",
        description: `${t("drinkDetailView.added") || 'Added'} ${selectedIngredientsData.length} ${t("drinkDetailView.ingredientsToPantry") || 'ingredients to your pantry'}`,
      });

      setSelectedIngredients([]);
    } catch (error) {
      console.error('Error adding to pantry:', error);
      toast({
        title: t("drinkDetailView.error") || "Error",
        description: t("drinkDetailView.pantryFailed") || "Failed to add ingredients to pantry. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleOrderOnline = () => {
    const selectedIngredientsData = drink.drinkPlan.ingredientsList
      .filter(ingredient => selectedIngredients.includes(ingredient.name))
      .map(ingredient => ({
        id: ingredient.name,
        name: ingredient.name,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
        category: ingredient.classification || 'other',
        priority: 'medium',
        purchased: false,
        notes: `From drink: ${drink.drink_name}`,
        estimatedPrice: Math.random() * 10 + 1, // Mock price
        mealName: drink.drink_name
      }));

    if (selectedIngredientsData.length === 0) {
      toast({
        title: t("drinkDetailView.noIngredientsSelected") || "No ingredients selected",
        description: t("drinkDetailView.selectIngredientsFirst") || "Please select ingredients first.",
        variant: "destructive"
      });
      return;
    }

    setShowOrderOnlineModal(true);
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
                <p className="text-xs text-gray-600">{t("drinkDetailView.min") || "min"}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/70 backdrop-blur-sm">
            <CardContent className="flex flex-col items-center justify-center p-3 sm:p-4">
              <Users className="h-5 w-5 sm:h-6 sm:w-6 text-green-500 mb-1 sm:mb-2" />
              <div className="text-center">
                <p className="text-sm sm:text-lg font-bold">{drink.numberPeople}</p>
                <p className="text-xs text-gray-600">{t("drinkDetailView.servings") || "Servings"}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/70 backdrop-blur-sm">
            <CardContent className="flex flex-col items-center justify-center p-3 sm:p-4">
              <Droplets className="h-5 w-5 sm:h-6 sm:w-6 text-orange-500 mb-1 sm:mb-2" />
              <div className="text-center">
                <p className="text-sm sm:text-lg font-bold">{healthyDrink.calories}</p>
                <p className="text-xs text-gray-600">{t("drinkDetailView.cal") || "Cal"}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/70 backdrop-blur-sm">
            <CardContent className="flex flex-col items-center justify-center p-3 sm:p-4">
              <Leaf className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 mb-1 sm:mb-2" />
              <div className="text-center">
                <p className="text-sm sm:text-lg font-bold">{drink.drinkPlan.totalCarbonFootprint}</p>
                <p className="text-xs text-gray-600">{t("drinkDetailView.co2") || "kg CO₂"}</p>
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
                <CardTitle className="text-green-800">{t("drinkDetailView.descBenefits") || "Description & Benefits"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-green-700 mb-2">{t("drinkDetailView.description") || "Description"}</h4>
                  <p className="text-gray-700">{healthyDrink.description}</p>
                </div>
                <div>
                  <h4 className="font-medium text-green-700 mb-2">{t("drinkDetailView.healthBenefits") || "Health Benefits"}</h4>
                  <p className="text-gray-700">{healthyDrink.benefits}</p>
                </div>
                <div>
                  <h4 className="font-medium text-green-700 mb-2">{t("drinkDetailView.instructions") || "Instructions"}</h4>
                  <p className="text-gray-700">{healthyDrink.instructions}</p>
                </div>
              </CardContent>
            </Card>

            {/* Recipe and Video Tabs */}
            <Tabs defaultValue="recipe" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="recipe">{t("drinkDetailView.recipeTab") || "Recipe"}</TabsTrigger>
                <TabsTrigger value="video">{t("drinkDetailView.videoTab") || "Video Tutorial"}</TabsTrigger>
              </TabsList>
              
              <TabsContent value="recipe" className="space-y-6">
                {/* Preparation Steps Card */}
                <Card>
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <CardTitle className="text-green-800">{t("drinkDetailView.prepSteps") || "Preparation Steps"}</CardTitle>
                      <span className="text-sm text-gray-500 self-center">
                        {completedSteps.length}/{healthyDrink.steps.length} {t("drinkDetailView.stepsCompleted") || 'completed'}
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
                            <span className="font-medium text-green-600 mr-2">{t("drinkDetailView.step") || "Step"} {index + 1}:</span>
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
                      <span>{t("drinkDetailView.videoTutorial") || "Video Tutorial"}</span>
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
                            {t("drinkDetailView.playVideo") || "Play Video"}
                          </Button>
                          <Button
                            onClick={openFullscreenVideo}
                            variant="outline"
                            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                          >
                            <Maximize className="h-4 w-4 mr-2" />
                            {t("drinkDetailView.fullscreen") || "Fullscreen"}
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
                              {t("drinkDetailView.closeVideo") || "Close Video"}
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
                  <span>{t("drinkDetailView.drinkInfo") || "Drink Info"}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-green-700 mb-2">{t("drinkDetailView.drinkType") || "Drink Type"}</p>
                  <Badge variant="secondary" className="capitalize">{healthyDrink.drinkType}</Badge>
                </div>
                <Separator />
                <div className="space-y-2">
                  {drink.healthGoals && drink.healthGoals.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-green-700 mb-2">{t("drinkDetailView.healthGoals") || "Health Goals"}</p>
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
                      <p className="text-sm font-medium text-green-700 mb-2">{t("drinkDetailView.dietary") || "Dietary"}</p>
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
                <CardTitle className="text-green-800">{t("drinkDetailView.nutritionalInfo") || "Nutritional Info"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t("drinkDetailView.protein") || "Protein"}</span>
                    <span className="font-medium">{healthyDrink.nutritionalInfo.protein}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t("drinkDetailView.fat") || "Fat"}</span>
                    <span className="font-medium">{healthyDrink.nutritionalInfo.fat}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t("drinkDetailView.carbs") || "Carbs"}</span>
                    <span className="font-medium">{healthyDrink.nutritionalInfo.carbohydrates}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t("drinkDetailView.fiber") || "Fiber"}</span>
                    <span className="font-medium">{healthyDrink.nutritionalInfo.fiber}g</span>
                  </div>
                </div>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-green-700 mb-2">{t("drinkDetailView.vitamins") || "Vitamins"}</p>
                  <div className="flex flex-wrap gap-1">
                    {healthyDrink.nutritionalInfo.vitamins.map((vitamin, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {t("drinkDetailView.vitamin") || "Vitamin"} {vitamin}
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
                  <span>{t("drinkDetailView.ingredients") || "Ingredients"}</span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowIngredients(!showIngredients)}
                  >
                    {showIngredients ? t("drinkDetailView.hide") || "Hide" : t("drinkDetailView.show") || "Show"} ({healthyDrink.ingredients.length})
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

            {/* Ingredients Selector Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-green-800 flex items-center justify-between">
                  <span>{t("drinkDetailView.createShoppingList") || "Create Shopping List"}</span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowIngredientsSelector(!showIngredientsSelector)}
                  >
                    {showIngredientsSelector ? t("drinkDetailView.hide") || "Hide" : t("drinkDetailView.show") || "Show"}
                  </Button>
                </CardTitle>
              </CardHeader>
              {showIngredientsSelector && (
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {drink.drinkPlan.ingredientsList.map((ingredient, index) => (
                      <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                        <Checkbox
                          id={`ingredient-${index}`}
                          checked={selectedIngredients.includes(ingredient.name)}
                          onCheckedChange={(checked) => handleIngredientSelection(ingredient.name, checked as boolean)}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-700 capitalize truncate">
                              {ingredient.name}
                            </span>
                            <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                              {ingredient.quantity} {ingredient.unit}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {t("drinkDetailView.expires") || "Expires in"} {ingredient.daysToExpire} {t("drinkDetailView.days") || "days"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {selectedIngredients.length > 0 && (
                    <div className="flex flex-col gap-2 pt-3 border-t">
                      <p className="text-sm text-gray-600 mb-2">
                        {selectedIngredients.length} {t("drinkDetailView.ingredientsSelected") || "ingredients selected"}
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
                        onClick={handleOrderOnline}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        size="sm"
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        {t("drinkDetailView.orderOnline") || "Order Online"}
                      </Button>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>

            
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
                  <h4 className="font-medium text-blue-800 mb-1">{t("drinkDetailView.proTip") || "Pro Tip"}</h4>
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

        <OrderOnlineModal
          isOpen={showOrderOnlineModal}
          onClose={() => setShowOrderOnlineModal(false)}
          items={drink.drinkPlan.ingredientsList
            .filter(ingredient => selectedIngredients.includes(ingredient.name))
            .map(ingredient => ({
              id: ingredient.name,
              name: ingredient.name,
              quantity: ingredient.quantity,
              unit: ingredient.unit,
              category: ingredient.classification || 'other',
              priority: 'medium',
              purchased: false,
              notes: `From drink: ${drink.drink_name}`,
              estimatedPrice: Math.random() * 10 + 1,
              mealName: drink.drink_name
            }))}
          mealPlanName={drink.drink_name}
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
              title={t("drinkDetailView.videoTitleFullscreen") || "Drink Video Tutorial - Fullscreen"}
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
