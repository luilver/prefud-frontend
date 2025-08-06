import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Clock, Users, Zap, ChefHat, Save, ShoppingCart, Check, CheckSquare, Store, Package, Plus, MapPin, CreditCard } from "lucide-react";
import { toast } from "sonner";
import CocktailAnimation from "./CocktailAnimation";
import { createMealPlan, ApiMealPlan } from "@/services/mealPlanService";
import { useUser } from "@/contexts/UserContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCookingLoader } from "@/hooks/useCookingLoader";
import OrderOnlineModal from "./OrderOnlineModal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AIMealGenerationProps {
  mealData: any;
  onMealCreated?: (meal: any) => void;
}

const AIMealGeneration = ({ mealData, onMealCreated }: AIMealGenerationProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedMeal, setGeneratedMeal] = useState<any>(null);
  const [showShoppingList, setShowShoppingList] = useState(false);
  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>({});
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [showOrderOnlineModal, setShowOrderOnlineModal] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});
  const [cookingProgress, setCookingProgress] = useState(0);
  
  const { user, addPantryItem, paymentMethods, getPaymentMethods } = useUser();
  const { language } = useLanguage();
  const { showLoader, hideLoader, isLoading } = useCookingLoader();

  useEffect(() => {
    if (mealData && user?.id && !generatedMeal) {
      generateMeal();
    }
  }, [mealData, user, language, generatedMeal]);

  const getLanguageName = (languageCode: string) => {
    const languageMap: { [key: string]: string } = {
      'en': 'english',
      'es': 'spanish',
      'pt': 'portuguese',
      'fr': 'french',
      'de': 'german',
      'it': 'italian'
    };
    return languageMap[languageCode.toLowerCase()] || 'english';
  };

  const generateMeal = async () => {
    if (!user?.id) {
      toast.error("Please log in to generate a meal plan");
      return;
    }

    setIsGenerating(true);
    showLoader("Generating your personalized meal plan...");

    try {
      const requestData = {
        user_id: user.id,
        mealName: mealData.mealName || `Healthy ${mealData.type || 'Meal'}`,
        numberPeople: mealData.numberPeople || 1,
        dietaryRestrictions: mealData.dietaryRestrictions || [],
        cuisinePreferences: mealData.cuisinePreferences || [],
        allergiesIntolerance: mealData.allergiesIntolerance || [],
        dislikes: mealData.dislikes || "",
        maxCookingTime: mealData.maxCookingTime || 30,
        cookingSkillLevel: mealData.cookingSkillLevel || "intermediate",
        budgetRange: mealData.budgetRange || "medium",
        mealType: mealData.type || "dinner",
        language: getLanguageName(language),
        healthGoals: mealData.healthGoals || []
      };

      console.log('Generating meal with request data:', requestData);

      const apiResponse = await createMealPlan(requestData);

      // Transform API response to match our local format
      const transformedMeal = {
        name: apiResponse.mealPlan.name,
        type: apiResponse.mealPlan.mealType,
        description: apiResponse.mealPlan.description,
        cookingTime: `${apiResponse.mealPlan.cookingTime} minutes`,
        servings: mealData.numberPeople || 1,
        calories: apiResponse.mealPlan.calories,
        difficulty: apiResponse.mealPlan.difficulty,
        ingredients: apiResponse.mealPlan.ingredients.map(ing => ({
          name: ing.name,
          amount: `${ing.quantity} ${ing.unit}`,
          category: apiResponse.ingredientsList.find(item => item.name === ing.name)?.classification || 'Other'
        })),
        instructions: apiResponse.mealPlan.steps,
        nutritionHighlights: [
          apiResponse.mealPlan.benefits,
          `Rich in vitamins: ${apiResponse.mealPlan.nutritionalInfo.vitamins.join(', ')}`,
          `${apiResponse.mealPlan.nutritionalInfo.protein}g protein, ${apiResponse.mealPlan.nutritionalInfo.fiber}g fiber`
        ],
        videoTutorials: [
          "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          "https://www.youtube.com/watch?v=SBmSRK3feww"
        ],
        healthGoals: mealData.healthGoals || [],
        dietaryRestrictions: mealData.dietaryRestrictions || [],
        servingSize: mealData.numberPeople || 1,
        apiData: apiResponse // Store original API data
      };

      setGeneratedMeal(transformedMeal);
      setIsGenerating(false);
      hideLoader();
      toast.success("Healthy meal plan was created successfully!");

    } catch (error) {
      console.error('Error generating meal:', error);
      setIsGenerating(false);
      hideLoader();
      toast.error("Failed to generate meal. Please try again.");
    }
  };

  const toggleIngredientCheck = (ingredientName: string, checked: boolean) => {
    setCheckedIngredients(prev => ({
      ...prev,
      [ingredientName]: checked
    }));
  };

  const handleSelectAll = () => {
    if (!generatedMeal?.ingredients) return;
    
    const allChecked = generatedMeal.ingredients.every((ing: any) => checkedIngredients[ing.name]);
    const newCheckedItems: Record<string, boolean> = {};
    
    if (!allChecked) {
      // Select all items
      generatedMeal.ingredients.forEach((ing: any) => {
        newCheckedItems[ing.name] = true;
      });
    }
    // If all are checked, uncheck all (empty object)
    
    setCheckedIngredients(newCheckedItems);
  };

  const getSelectedIngredients = () => {
    if (!generatedMeal?.ingredients) return [];
    
    return generatedMeal.ingredients
      .filter((ing: any) => checkedIngredients[ing.name])
      .map((ing: any) => ({
        id: `ingredient-${ing.name}`,
        name: ing.name,
        quantity: ing.amount.split(' ')[0] || '1',
        unit: ing.amount.split(' ').slice(1).join(' ') || 'item',
        category: ing.category || 'Other',
        mealName: generatedMeal.name,
        estimatedPrice: parseFloat((Math.random() * 5 + 1).toFixed(2)),
        notes: `From AI meal: ${generatedMeal.name}`
      }));
  };

  const handleAddToPantry = () => {
    const selectedIngredients = getSelectedIngredients();
    
    if (selectedIngredients.length === 0) {
      toast.error("Please select ingredients to add to your pantry.");
      return;
    }

    selectedIngredients.forEach(ingredient => {
      addPantryItem({
        name: ingredient.name,
        quantity: parseInt(ingredient.quantity) || 1,
        unit: ingredient.unit,
        category: 'meal-ingredient',
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        purchaseDate: new Date(),
        notes: ingredient.notes
      });
    });

    setCheckedIngredients({});
    setShowActionDialog(false);
    toast.success(`${selectedIngredients.length} ingredients added to your pantry!`);
  };

  const handleOrderOnline = () => {
    const selectedIngredients = getSelectedIngredients();
    
    if (selectedIngredients.length === 0) {
      toast.error("Please select ingredients to order online.");
      return;
    }

    setShowActionDialog(false);
    setShowOrderOnlineModal(true);
  };

  const toggleStep = (stepIndex: number) => {
    setCompletedSteps(prev => {
      const newState = { ...prev, [stepIndex]: !prev[stepIndex] };
      const completedCount = Object.values(newState).filter(Boolean).length;
      const totalSteps = generatedMeal?.instructions?.length || 0;
      setCookingProgress((completedCount / totalSteps) * 100);
      return newState;
    });
  };

  const saveMeal = () => {
    if (generatedMeal && onMealCreated) {
      onMealCreated(generatedMeal);
      toast.success("Meal recipe saved successfully!");
    } else {
      toast.success("Meal recipe saved to your collection!");
    }
  };

  if (isGenerating) {
    return (
      <div className="text-center space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-green-800 mb-2">AI is Creating Your Meal Plan</h2>
          <p className="text-green-600">Analyzing your preferences to create the perfect healthy meal...</p>
        </div>
        <CocktailAnimation />
      </div>
    );
  }

  if (!mealData) {
    return (
      <div className="text-center space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-green-800 mb-2">Ready to Generate Your Meal Plan</h2>
          <p className="text-green-600">Click below to create your personalized healthy meal plan</p>
        </div>
        <Button
          onClick={generateMeal}
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
        >
          <Zap className="h-5 w-5 mr-2" />
          Generate AI Meal
        </Button>
      </div>
    );
  }

  if (!generatedMeal) {
    return (
      <div className="text-center">
        <p className="text-red-600">Failed to generate meal. Please try again.</p>
        <Button onClick={generateMeal} className="mt-4">
          Retry Generation
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-green-800 mb-2">{generatedMeal.name}</h2>
        <p className="text-green-600">{generatedMeal.description}</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-green-200 text-center">
          <CardContent className="p-4">
            <Clock className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <p className="text-sm text-green-700 font-medium">{generatedMeal.cookingTime}</p>
            <p className="text-xs text-green-600">Cooking Time</p>
          </CardContent>
        </Card>
        <Card className="border-green-200 text-center">
          <CardContent className="p-4">
            <Users className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <p className="text-sm text-green-700 font-medium">{generatedMeal.servings} serving{generatedMeal.servings > 1 ? 's' : ''}</p>
            <p className="text-xs text-green-600">Servings</p>
          </CardContent>
        </Card>
        <Card className="border-green-200 text-center">
          <CardContent className="p-4">
            <Zap className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <p className="text-sm text-green-700 font-medium">{generatedMeal.calories} cal</p>
            <p className="text-xs text-green-600">Calories</p>
          </CardContent>
        </Card>
        <Card className="border-green-200 text-center">
          <CardContent className="p-4">
            <ChefHat className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <p className="text-sm text-green-700 font-medium">{generatedMeal.difficulty}</p>
            <p className="text-xs text-green-600">Difficulty</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="ingredients" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
          <TabsTrigger value="video">Video Tutorial</TabsTrigger>
          <TabsTrigger value="steps">Cooking Steps</TabsTrigger>
          <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
        </TabsList>

        <TabsContent value="ingredients" className="space-y-4">
          <Card className="border-green-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-green-800 flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Ingredients ({generatedMeal.ingredients?.length || 0})
                  </CardTitle>
                  <p className="text-sm text-green-600 mt-1">
                    Select ingredients you need and choose your preferred action
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={handleSelectAll}
                  className="flex items-center gap-2"
                >
                  <CheckSquare className="h-4 w-4" />
                  {generatedMeal.ingredients?.every((ing: any) => checkedIngredients[ing.name]) ? 'Unselect All' : 'Select All'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {generatedMeal.ingredients?.map((ingredient: any, index: number) => (
                <div 
                  key={index} 
                  className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                    checkedIngredients[ingredient.name]
                      ? 'bg-green-50 border-green-200'
                      : 'bg-white border-gray-200 hover:border-green-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id={`ingredient-${index}`}
                      checked={checkedIngredients[ingredient.name] || false}
                      onCheckedChange={(checked) => toggleIngredientCheck(ingredient.name, checked as boolean)}
                      className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                    />
                    <div>
                      <span className={`font-medium ${
                        checkedIngredients[ingredient.name] ? 'text-green-700' : 'text-gray-700'
                      }`}>
                        {ingredient.name}
                      </span>
                      <p className="text-sm text-gray-500">{ingredient.amount} • {ingredient.category}</p>
                    </div>
                  </div>
                  <Badge 
                    variant={checkedIngredients[ingredient.name] ? "default" : "secondary"}
                    className={checkedIngredients[ingredient.name] ? "bg-green-500" : ""}
                  >
                    {ingredient.category}
                  </Badge>
                </div>
              ))}
              
              <Separator className="my-4" />
              
              <div className="flex justify-center">
                <Button
                  onClick={() => setShowActionDialog(true)}
                  disabled={Object.values(checkedIngredients).filter(Boolean).length === 0}
                  className="bg-green-600 hover:bg-green-700 text-white px-8"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Pantry or Order Online ({Object.values(checkedIngredients).filter(Boolean).length})
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="video">
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="text-green-800">Video Tutorial</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {generatedMeal.videoTutorials?.map((video: string, index: number) => (
                  <div key={index} className="relative aspect-w-16 aspect-h-9">
                    <iframe
                      src={video}
                      title={`Video Tutorial ${index + 1}`}
                      allowFullScreen
                      className="rounded-md"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="steps">
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="text-green-800">Cooking Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {generatedMeal.instructions?.map((step: string, index: number) => (
                  <div
                    key={index}
                    className={`flex items-start p-4 rounded-lg border transition-all ${completedSteps[index] ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200 hover:border-green-300'}`}
                    onClick={() => toggleStep(index)}
                  >
                    <div className="mr-3">
                      <Checkbox
                        id={`step-${index}`}
                        checked={completedSteps[index] || false}
                        onCheckedChange={() => toggleStep(index)}
                        className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                      />
                    </div>
                    <div className="flex-1">
                      <p className={`text-green-700 ${completedSteps[index] ? 'line-through text-green-500' : ''}`}>
                        {step}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <Separator className="my-4" />
              <progress value={cookingProgress} max="100" className="w-full h-2 rounded-full bg-gray-200 appearance-none">
                {cookingProgress}%
              </progress>
              <div className="text-center text-sm text-gray-500 mt-2">
                {cookingProgress.toFixed(0)}% Complete
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nutrition">
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="text-green-800">Nutrition Facts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {generatedMeal.nutritionHighlights?.map((benefit: string, index: number) => (
                  <div key={index} className="flex items-start space-x-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span className="text-green-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Selection Dialog */}
      <Dialog open={showActionDialog} onOpenChange={setShowActionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Choose Action for Selected Ingredients</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">
              You have selected {Object.values(checkedIngredients).filter(Boolean).length} ingredients. 
              What would you like to do with them?
            </p>
            
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-sm font-medium mb-2">Selected ingredients:</p>
              <div className="text-sm text-gray-600">
                {generatedMeal.ingredients
                  ?.filter((ing: any) => checkedIngredients[ing.name])
                  .slice(0, 3)
                  .map((ing: any) => ing.name)
                  .join(', ')}
                {Object.values(checkedIngredients).filter(Boolean).length > 3 && 
                  ` +${Object.values(checkedIngredients).filter(Boolean).length - 3} more`}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <Button 
                onClick={handleAddToPantry}
                variant="outline"
                className="flex flex-col items-center gap-2 h-auto py-4 border-green-300 text-green-700 hover:bg-green-50"
              >
                <Store className="h-6 w-6" />
                <span>Add to Pantry</span>
                <span className="text-xs text-gray-500">For items you have</span>
              </Button>
              
              <Button 
                onClick={handleOrderOnline}
                variant="outline"
                className="flex flex-col items-center gap-2 h-auto py-4 border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                <Package className="h-6 w-6" />
                <span>Order Online</span>
                <span className="text-xs text-gray-500">Get them delivered</span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Order Online Modal */}
      <OrderOnlineModal
        isOpen={showOrderOnlineModal}
        onClose={() => setShowOrderOnlineModal(false)}
        items={getSelectedIngredients()}
        mealPlanName={generatedMeal.name}
      />

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button 
          onClick={saveMeal}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Recipe
        </Button>
        <Button 
          onClick={generateMeal}
          variant="outline"
          className="border-green-300 text-green-700 hover:bg-green-50"
        >
          <Zap className="h-4 w-4 mr-2" />
          Generate New Version
        </Button>
      </div>
    </div>
  );
};

export default AIMealGeneration;
