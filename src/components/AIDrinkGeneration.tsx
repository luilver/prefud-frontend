
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Clock, Users, Zap, Droplets, RefreshCw, Save, ShoppingCart, Check, Package, Truck } from "lucide-react";
import { toast } from "sonner";
import CocktailAnimation from "./CocktailAnimation";
import OrderOnlineModal from "./OrderOnlineModal";
import SubscriptionUpgradeModal from "./SubscriptionUpgradeModal";
import { createHealthyDrink, ApiDrinkPlan } from "@/services/drinkService";
import { addIngredientsToPantry } from "@/services/pantryService";
import { useUser } from "@/contexts/UserContext";
import { useLanguage } from "@/contexts/LanguageContext";

interface AIDrinkGenerationProps {
  data: any;
  onUpdate: (key: string, value: any) => void;
  onDrinkCreated?: (drink: any) => void;
}

const AIDrinkGeneration = ({ data, onDrinkCreated }: AIDrinkGenerationProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDrink, setGeneratedDrink] = useState<any>(null);
  const [shoppingList, setShoppingList] = useState<any[]>([]);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  const { user, addPantryItem } = useUser();
  const { language } = useLanguage();
  const { t } = useLanguage();

  useEffect(() => {
    // Don't auto-generate on mount, wait for user to trigger
  }, []);

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

  const generateDrink = async () => {
    if (!user?.id) {
      toast.error("Please log in to generate a drink");
      return;
    }

    setIsGenerating(true);
    
    try {
      const requestData = {
        user_id: user.id,
        drink_name: data.drink_name || `Healthy ${data.type || 'Drink'}`,
        numberPeople: data.numberPeople || 1,
        dietaryRestrictions: data.dietaryRestrictions || [],
        cuisinePreferences: data.cuisinePreferences || [],
        allergiesIntolerance: data.allergiesIntolerance || [],
        dislikes: data.dislikes || "",
        maxCookingTime: data.maxCookingTime || 30,
        cookingSkillLevel: data.cookingSkillLevel || "intermediate",
        budgetRange: data.budgetRange || "medium",
        drinkType: data.type || "smoothie",
        language: getLanguageName(language),
        healthGoals: data.healthGoals || []
      };

      console.log('Generating drink with request data:', requestData);
      
      const apiResponse = await createHealthyDrink(requestData);
      
      // Transform API response to match our local format
      const transformedDrink = {
        name: apiResponse.healthyDrink.name,
        type: apiResponse.healthyDrink.drinkType,
        description: apiResponse.healthyDrink.description,
        prepTime: `${apiResponse.healthyDrink.cookingTime} minutes`,
        servings: data.numberPeople || 1,
        calories: apiResponse.healthyDrink.calories,
        ingredients: apiResponse.healthyDrink.ingredients.map(ing => ({
          name: ing.name,
          amount: `${ing.quantity} ${ing.unit}`,
          category: apiResponse.ingredientsList.find(item => item.name === ing.name)?.classification || 'Other',
          price: `$${(Math.random() * 5 + 1).toFixed(2)}` // Mock price for shopping list
        })),
        instructions: apiResponse.healthyDrink.steps,
        nutritionHighlights: [
          apiResponse.healthyDrink.benefits,
          `Rich in vitamins: ${apiResponse.healthyDrink.nutritionalInfo.vitamins.join(', ')}`,
          `${apiResponse.healthyDrink.nutritionalInfo.protein}g protein, ${apiResponse.healthyDrink.nutritionalInfo.fiber}g fiber`
        ],
        tips: [
          apiResponse.healthyDrink.prepTip,
          apiResponse.healthyDrink.instructions,
          "Store in refrigerator and consume within 24 hours",
          "Add ice for a refreshing cold drink"
        ],
        healthGoals: data.healthGoals || [],
        dietaryRestrictions: data.dietaryRestrictions || [],
        servingSize: data.numberPeople || 1,
        apiData: apiResponse // Store original API data
      };

      setGeneratedDrink(transformedDrink);
      setShoppingList(transformedDrink.ingredients);
      setIsGenerating(false);
      
      toast.success("Healthy drink was created successfully!");
      
    } catch (error: any) {
      console.error('Error generating drink:', error);
      console.log('Error code:', error.code);
      setIsGenerating(false);
      
      // Handle specific subscription error
      if (
        error?.code === "03" ||
        error?.response?.data?.code === "03" ||
        (typeof error?.message === "string" && error.message.includes("No healthy drinks available according to your subscription"))
      ) {
        console.log('Showing upgrade modal for code 03');
        setShowUpgradeModal(true);
      } else {
        toast.error("Failed to generate drink. Please try again.");
      }
    }
  };

  const toggleShoppingItem = (ingredientName: string) => {
    setCheckedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(ingredientName)) {
        newSet.delete(ingredientName);
      } else {
        newSet.add(ingredientName);
      }
      return newSet;
    });
  };

  const selectAllItems = () => {
    setCheckedItems(new Set(shoppingList.map(item => item.name)));
  };

  const clearAllItems = () => {
    setCheckedItems(new Set());
  };

  const handleAddToPantry = async () => {
    const selectedItems = shoppingList.filter(item => checkedItems.has(item.name));
    
    if (selectedItems.length === 0) {
      toast.error("Please select ingredients to add to pantry");
      return;
    }

    if (!user?.id) {
      toast.error("Please log in to add ingredients to pantry");
      return;
    }

    try {
      // Transform selected items to match the required pantry structure
      const newPantryItems = selectedItems.map((item) => ({
        id: `pantry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: item.name,
        quantity: parseFloat(item.amount.split(' ')[0]) || 1,
        unit: item.amount.split(' ')[1] || 'piece',
        category: item.category || 'drink-ingredient',
        purchased: true,
        purchaseDate: new Date().toISOString(),
        carbonFootPrintToWaste: 0.1,
        daysToExpire: 7,
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        notes: `Carbon footprint:: 0.1`
      }));

      console.log('Adding ingredients to pantry:', newPantryItems);
      
      // Use the new endpoint to add ingredients
      const response = await addIngredientsToPantry(user.id, newPantryItems);
      
      if (response.success) {
        toast.success(`${selectedItems.length} ingredients added to pantry!`);
        setCheckedItems(new Set());
        
        // Update local pantry state
        newPantryItems.forEach(item => {
          addPantryItem({
            name: item.name,
            quantity: item.quantity,
            unit: item.unit,
            category: item.category,
            expiryDate: new Date(item.expiryDate),
            purchaseDate: new Date(item.purchaseDate),
            notes: item.notes
          });
        });
      } else {
        throw new Error('Failed to add ingredients to pantry');
      }
    } catch (error) {
      console.error("Error adding to pantry:", error);
      toast.error("Failed to add ingredients to pantry. Please try again.");
    }
  };

  const handleOrderOnline = () => {
    const selectedItems = shoppingList.filter(item => checkedItems.has(item.name));
    
    if (selectedItems.length === 0) {
      toast.error("Please select ingredients to order online");
      return;
    }

    // Transform ingredients for the order modal
    const orderItems = selectedItems.map((item, index) => ({
      id: `drink-ingredient-${index}`,
      name: item.name,
      quantity: parseFloat(item.amount.split(' ')[0]) || 1,
      unit: item.amount.split(' ')[1] || 'piece',
      category: item.category || 'drink-ingredient',
      estimatedPrice: parseFloat(item.price.replace('$', '')) || 0,
      notes: `From ${generatedDrink?.name || 'Healthy Drink'} recipe`
    }));

    setShowOrderModal(true);
  };

  const saveDrink = () => {
    if (generatedDrink && onDrinkCreated) {
      onDrinkCreated(generatedDrink);
      toast.success("Drink recipe saved successfully!");
    } else {
      toast.success("Drink recipe saved to your collection!");
    }
  };

  // Show generation interface if no drink has been generated yet
  if (!isGenerating && !generatedDrink) {
    return (
      <div className="text-center space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-green-800 mb-2">
            {t("aiDrinkGeneration.readyTitle") || "Ready to Generate Your Drink"}
          </h2>
          <p className="text-green-600">
            {t("aiDrinkGeneration.readyDesc") || "Click below to create your personalized healthy drink"}
          </p>
        </div>
        <Button
          onClick={generateDrink}
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
        >
          <Zap className="h-5 w-5 mr-2" />
          {t("aiDrinkGeneration.generateBtn") || "Generate AI Drink"}
        </Button>
      </div>
    );
  }

  if (isGenerating) {
    return (
      <div className="text-center space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-green-800 mb-2">
            {t("aiDrinkGeneration.creatingTitle") || "AI is Creating Your Drink"}
          </h2>
          <p className="text-green-600">
            {t("aiDrinkGeneration.creatingDesc") || "Analyzing your preferences to create the perfect healthy drink..."}
          </p>
        </div>
        <CocktailAnimation />
      </div>
    );
  }

  if (!generatedDrink) {
    return (
      <div className="text-center">
        <p className="text-red-600">
          {t("aiDrinkGeneration.failed") || "Failed to generate drink. Please try again."}
        </p>
        <Button onClick={generateDrink} className="mt-4">
          {t("aiDrinkGeneration.retry") || "Retry Generation"}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-green-800 mb-2">{generatedDrink.name}</h2>
        <p className="text-green-600">{generatedDrink.description}</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-green-200 text-center">
          <CardContent className="p-4">
            <Clock className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <p className="text-sm text-green-700 font-medium">{generatedDrink.prepTime}</p>
            <p className="text-xs text-green-600">{t("aiDrinkGeneration.prepTime") || "Prep Time"}</p>
          </CardContent>
        </Card>
        <Card className="border-green-200 text-center">
          <CardContent className="p-4">
            <Users className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <p className="text-sm text-green-700 font-medium">
              {generatedDrink.servings} {t("aiDrinkGeneration.serving") || 'serving'}{generatedDrink.servings > 1 ? 's' : ''}
            </p>
            <p className="text-xs text-green-600">{t("aiDrinkGeneration.servings") || "Servings"}</p>
          </CardContent>
        </Card>
        <Card className="border-green-200 text-center">
          <CardContent className="p-4">
            <Zap className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <p className="text-sm text-green-700 font-medium">{generatedDrink.calories} {t("aiDrinkGeneration.cal") || "cal"}</p>
            <p className="text-xs text-green-600">{t("aiDrinkGeneration.calories") || "Calories"}</p>
          </CardContent>
        </Card>
        <Card className="border-green-200 text-center">
          <CardContent className="p-4">
            <Droplets className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <p className="text-sm text-green-700 font-medium">{t("aiDrinkGeneration.fresh") || "Fresh"}</p>
            <p className="text-xs text-green-600">{t("aiDrinkGeneration.bestServed") || "Best Served"}</p>
          </CardContent>
        </Card>
      </div>

      {/* Shopping List */}
      <Card className="border-green-200">
        <CardHeader>
          <CardTitle className="text-green-800 flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            {t("aiDrinkGeneration.shoppingList") || "Shopping List"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-600">
              Select ingredients to add to pantry or order online
            </p>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={selectAllItems}>
                Select All
              </Button>
              <Button variant="outline" size="sm" onClick={clearAllItems}>
                Clear All
              </Button>
            </div>
          </div>
          
          <div className="space-y-3">
            {shoppingList.map((ingredient, index) => (
              <div 
                key={index} 
                className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${
                  checkedItems.has(ingredient.name)
                    ? 'bg-green-50 border-green-200 text-green-700'
                    : 'bg-white border-gray-200 hover:border-green-300'
                }`}
                onClick={() => toggleShoppingItem(ingredient.name)}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    checkedItems.has(ingredient.name)
                      ? 'bg-green-500 border-green-500'
                      : 'border-gray-300'
                  }`}>
                    {checkedItems.has(ingredient.name) && (
                      <Check className="h-3 w-3 text-white" />
                    )}
                  </div>
                  <div>
                    <span className={`font-medium ${
                      checkedItems.has(ingredient.name) ? 'line-through text-green-600' : 'text-green-700'
                    }`}>
                      {ingredient.name}
                    </span>
                    <p className="text-sm text-gray-500">{ingredient.amount} • {ingredient.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-green-600 font-medium">{ingredient.price}</span>
                </div>
              </div>
            ))}
          </div>
          
          <Separator className="my-4" />
          
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-semibold text-green-800">
              {t("aiDrinkGeneration.totalCost") || "Total Estimated Cost:"}
            </span>
            <span className="text-lg font-bold text-green-600">
              ${shoppingList.reduce((total, item) => total + parseFloat(item.price.replace('$', '')), 0).toFixed(2)}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              onClick={handleAddToPantry}
              disabled={checkedItems.size === 0}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <Package className="h-4 w-4 mr-2" />
              Add to Pantry ({checkedItems.size})
            </Button>
            <Button
              onClick={handleOrderOnline}
              disabled={checkedItems.size === 0}
              variant="outline"
              className="flex-1"
            >
              <Truck className="h-4 w-4 mr-2" />
              Order Online ({checkedItems.size})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="border-green-200">
        <CardHeader>
          <CardTitle className="text-green-800">
            {t("aiDrinkGeneration.instructions") || "Instructions"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3">
            {generatedDrink.instructions.map((step: string, index: number) => (
              <li key={index} className="flex items-start space-x-3">
                <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                  {index + 1}
                </span>
                <span className="text-green-700">{step}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* Health Benefits */}
      <Card className="border-green-200">
        <CardHeader>
          <CardTitle className="text-green-800">
            {t("aiDrinkGeneration.healthBenefits") || "Health Benefits"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {generatedDrink.nutritionHighlights.map((benefit: string, index: number) => (
              <div key={index} className="flex items-start space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                <span className="text-green-700">{benefit}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pro Tips */}
      <Card className="border-green-200">
        <CardHeader>
          <CardTitle className="text-green-800">
            {t("aiDrinkGeneration.proTips") || "Pro Tips"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {generatedDrink.tips.map((tip: string, index: number) => (
              <div key={index} className="flex items-start space-x-2">
                <span className="text-green-500 mt-1">💡</span>
                <span className="text-green-700 text-sm">{tip}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button 
          onClick={saveDrink}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Save className="h-4 w-4 mr-2" />
          {t("aiDrinkGeneration.saveRecipe") || "Save Recipe"}
        </Button>
        <Button 
          onClick={generateDrink}
          variant="outline"
          className="border-green-300 text-green-700 hover:bg-green-50"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          {t("aiDrinkGeneration.generateNew") || "Generate New Version"}
        </Button>
      </div>

      {/* Order Online Modal */}
      {showOrderModal && (
        <OrderOnlineModal
          isOpen={showOrderModal}
          onClose={() => setShowOrderModal(false)}
          items={shoppingList.filter(item => checkedItems.has(item.name)).map((item, index) => ({
            id: `drink-ingredient-${index}`,
            name: item.name,
            quantity: parseFloat(item.amount.split(' ')[0]) || 1,
            unit: item.amount.split(' ')[1] || 'piece',
            category: item.category || 'drink-ingredient',
            estimatedPrice: parseFloat(item.price.replace('$', '')) || 0,
            notes: `From ${generatedDrink?.name || 'Healthy Drink'} recipe`
          }))}
          mealPlanName={generatedDrink?.name || 'Healthy Drink Recipe'}
        />
      )}

      <SubscriptionUpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        featureType="drinks"
      />
    </div>
  );
};

export default AIDrinkGeneration;
