import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Clock, Users, ChefHat, Play, BookOpen, Heart, Share2, Check, Timer, Flame, Maximize, X, ShoppingCart, Package, Plus, CheckSquare, CreditCard, MapPin } from "lucide-react";
import { useCookingLoader } from "@/hooks/useCookingLoader";
import { useUser } from "@/contexts/UserContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { addIngredientsToPantry } from "@/services/pantryService";

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
  const [checkedIngredients, setCheckedIngredients] = useState<Set<string>>(new Set());
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("");
  const [deliveryAddress, setDeliveryAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  });
  
  const { showLoader, hideLoader, isLoading, LoaderComponent } = useCookingLoader();
  const { user, addPantryItem, paymentMethods, getPaymentMethods } = useUser();
  const { language, t } = useLanguage();

  useEffect(() => {
    generateMeal();
  }, []);

  const generateMeal = async () => {
    showLoader(t("aiMealGenerator.loaderMessage") || "Creating your personalized meal with AI...");
    try {
      // Map the mealData to match the API expected format
      const apiPayload = {
        dislikes: mealData.dislikes || "",
        cookingSkillLevel: mealData.cookingSkillLevel || "intermediate",
        budgetRange: mealData.budgetRange || "medium",
        healthGoals: mealData.healthGoals || [],
        language: language, // Use the current language from context
        user_id: user?.id || "687e6b38bc111405da8cb671", // Use actual user ID
        plan_name: mealData.mealName || "AI Generated Meal",
        mealType: mealData.mealType?.toLowerCase() || "dinner",
        numberPeople: mealData.servings || 2,
        maxCookingTime: mealData.cookingTime || 30,
        specialRequest: mealData.specialRequests || "",
        dietaryRestrictions: mealData.dietaryRestrictions?.map((r: string) => r.toLowerCase().replace("-", " ")) || [],
        cuisinePreferences: mealData.cuisinePreferences?.map((c: string) => c.toLowerCase()) || [],
        allergiesIntolerance: mealData.allergiesIntolerances?.map((a: string) => a.toLowerCase()) || [],
        customIntolerance: mealData.customAllergies || "",
        nameOfMeal: mealData.nameOfMeal || "",

      };

      console.log("Sending API request with payload:", apiPayload);

      const response = await fetch('https://pantry-ms-brain.onrender.com/meal-plan/special', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(apiPayload)
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      console.log("API response:", data);

      // Transform the API response to match our expected meal format
      const generatedMeal = {
        id: Date.now().toString(),
        name: data.specialMeal.name,
        description: data.specialMeal.description,
        cookingTime: data.specialMeal.cookingTime,
        servings: apiPayload.numberPeople,
        difficulty: apiPayload.cookingSkillLevel,
        cuisine: apiPayload.cuisinePreferences?.[0] || "Fusion",
        calories: data.specialMeal.calories,
        ingredients: data.specialMeal.ingredients,
        instructions: data.specialMeal.steps,
        nutritionalInfo: data.specialMeal.nutritionalInfo,
        tags: generateTags(mealData),
        benefits: data.specialMeal.benefits,
        prepTip: data.specialMeal.prepTip,
        carbonFootprint: data.totalCarbonFootprint,
        ingredientsList: data.ingredientsList
      };

      setMeal(generatedMeal);
      hideLoader();
      toast.success(t("aiMealGenerator.createAIMealTitle") || "Your AI-generated meal is ready!");
    } catch (error) {
      console.error("Error generating meal:", error);
      hideLoader();
      toast.error(t("aiMealGenerator.error") || "Failed to generate meal. Please try again.");
      const fallbackMeal = {
        id: Date.now().toString(),
        name: t("aiMealGenerator.mealNamePlaceholder") || "Healthy Veggie Bowl",
        description: t("aiMealGenerator.mealDetailsDesc") || "A delightful fusion of flavors that will satisfy your taste buds.",
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
      setMeal(fallbackMeal);
    }
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
      { name: t("aiMealGenerator.quinoa") || "quinoa", quantity: "1", unit: "cup" },
      { name: t("aiMealGenerator.mixedVegetables") || "mixed vegetables", quantity: "2", unit: "cups" },
      { name: t("aiMealGenerator.oliveOil") || "olive oil", quantity: "2", unit: "tbsp" },
      { name: t("aiMealGenerator.garlic") || "garlic", quantity: "2", unit: "cloves" },
      { name: t("aiMealGenerator.onion") || "onion", quantity: "1", unit: "medium" },
      { name: t("aiMealGenerator.bellPepper") || "bell pepper", quantity: "1", unit: "large" },
      { name: t("aiMealGenerator.salt") || "salt", quantity: "1", unit: "tsp" },
      { name: t("aiMealGenerator.blackPepper") || "black pepper", quantity: "1/2", unit: "tsp" }
    ];
    return baseIngredients.slice(0, Math.floor(Math.random() * 3) + 6);
  };

  const generateInstructions = () => [
    t("aiMealGenerator.prepareIngredients") || "Prepare all ingredients by washing and chopping as needed.",
    t("aiMealGenerator.heatOil") || "Heat oil in a large pan over medium-high heat.",
    t("aiMealGenerator.addAromatics") || "Add aromatics and cook until fragrant, about 2-3 minutes.",
    t("aiMealGenerator.addMainIngredients") || "Add main ingredients and cook according to type and preference.",
    t("aiMealGenerator.season") || "Season with salt, pepper, and selected spices.",
    t("aiMealGenerator.combine") || "Combine all elements and cook until heated through.",
    t("aiMealGenerator.tasteAdjust") || "Taste and adjust seasoning as needed.",
    t("aiMealGenerator.serve") || "Serve hot and enjoy!"
  ];

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
    tags.push(t("aiMealGenerator.review.specialRequests") || "AI Generated", t("aiMealGenerator.review.healthGoals") || "Healthy");
    return [...new Set(tags)].slice(0, 4);
  };

  const generateShoppingList = () => {
    if (!meal) return;
    showLoader(t("aiMealGenerator.shoppingListTitle") || "Generating your shopping list...");
    setTimeout(() => {
      // Use the actual ingredients from the API response if available
      const ingredientsToUse = meal.ingredientsList || meal.ingredients;
      
      const list = ingredientsToUse.map((ingredient: any, index: number) => ({
        id: `${meal.id}-ingredient-${index}`,
        name: ingredient.name,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
        category: ingredient.classification || getCategoryForIngredient(ingredient.name),
        estimatedPrice: Math.floor(Math.random() * 800) + 200, // $2-10
        mealName: meal.name,
        notes: `For ${meal.name} recipe`
      }));
      
      setShoppingList(list);
      setShowShoppingList(true);
      setCheckedIngredients(new Set());
      hideLoader();
      toast.success(t("aiMealGenerator.shoppingListTitle") || "Shopping list generated!");
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
      'bell peppers': 'produce',
      'chicken breast': 'protein',
      'avocado': 'produce',
      'cilantro': 'produce',
      'lime': 'produce',
      'salt': 'spices',
      'black pepper': 'spices',
      'cumin': 'spices',
      'chili powder': 'spices',
      'garlic powder': 'spices'
    };
    return categories[ingredientName.toLowerCase()] || 'other';
  };

  const toggleIngredientCheck = (ingredientId: string) => {
    setCheckedIngredients(prev => {
      const newSet = new Set(prev);
      if (newSet.has(ingredientId)) {
        newSet.delete(ingredientId);
      } else {
        newSet.add(ingredientId);
      }
      return newSet;
    });
  };

  const handleSelectAllIngredients = () => {
    if (checkedIngredients.size === shoppingList.length) {
      setCheckedIngredients(new Set());
    } else {
      setCheckedIngredients(new Set(shoppingList.map(item => item.id)));
    }
  };

  const handleAddToPantry = async () => {
    const selectedItems = shoppingList.filter(item => checkedIngredients.has(item.id));
    
    if (selectedItems.length === 0) {
      toast.error(t("aiMealGenerator.selectIngredients") || "Please select ingredients to add to pantry");
      return;
    }

    try {
      // Transform selected items to match the required pantry structure
      const newPantryItems = selectedItems.map((item) => ({
        id: `pantry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: item.name,
        quantity: parseFloat(item.quantity) || 1,
        unit: item.unit || 'piece',
        category: item.category || 'other',
        purchased: true,
        purchaseDate: new Date().toISOString(),
        carbonFootPrintToWaste: 0.1, // Default value, could be enhanced based on ingredient type
        daysToExpire: 7, // Default value, could be enhanced based on ingredient type
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        notes: `Carbon footprint:: 0.1`
      }));

      console.log('Adding ingredients to pantry:', newPantryItems);
      
      // Use the new endpoint to add ingredients
      const response = await addIngredientsToPantry(user.id, newPantryItems);
      
      if (response.success) {
        toast.success(`${selectedItems.length} ingredients added to pantry!`);
        setCheckedIngredients(new Set());
        
        // Update local pantry state if needed
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
    const selectedItems = shoppingList.filter(item => checkedIngredients.has(item.id));
    
    if (selectedItems.length === 0) {
      toast.error(t("aiMealGenerator.selectIngredients") || "Please select ingredients to order online");
      return;
    }

    getPaymentMethods();
    setShowOrderDialog(true);
  };

  const handleCompleteOrder = () => {
    const selectedItems = shoppingList.filter(item => checkedIngredients.has(item.id));
    
    if (!deliveryAddress.street || !deliveryAddress.city || !deliveryAddress.state || !deliveryAddress.zipCode) {
      toast.error(t("aiMealGenerator.deliveryPrompt") || "Please fill in all delivery address fields");
      return;
    }

    if (!selectedPaymentMethod) {
      toast.error(t("aiMealGenerator.chooseDeliveryTime") || "Please select a payment method");
      return;
    }

    // Simulate order processing
    const totalCost = selectedItems.reduce((total, item) => total + (item.estimatedPrice || 0), 0) / 100;
    
    toast.success(`Order placed successfully! ${selectedItems.length} items ordered for $${totalCost.toFixed(2)}`);
    
    // Reset state
    setCheckedIngredients(new Set());
    setShowOrderDialog(false);
    setSelectedPaymentMethod("");
    setDeliveryAddress({ street: '', city: '', state: '', zipCode: '', country: '' });
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
      onMealCreated(meal);
      toast.success(t("aiMealGenerator.save") || "Meal saved successfully!");
    }
  };

  const enhancedInstructions = useMemo(() => {
    if (!meal) return [];
    
    const cookingTips = [
      t("aiMealGenerator.heatPan") || "🔥 Heat your pan to medium-high heat",
      t("aiMealGenerator.patience") || "⏱️ Don't rush this step - patience makes perfect!",
      t("aiMealGenerator.taste") || "👨‍🍳 Pro tip: Taste as you go",
      t("aiMealGenerator.magic") || "🌟 This is where the magic happens",
      t("aiMealGenerator.stir") || "💡 Keep stirring to prevent sticking",
      t("aiMealGenerator.almost") || "🎯 Almost there - you're doing great!",
      t("aiMealGenerator.aroma") || "✨ The aroma should be amazing now",
      t("aiMealGenerator.final") || "🏆 Final stretch - you've got this!"
    ];
    
    return meal.instructions.map((instruction: string, index: number) => ({
      text: instruction,
      tip: cookingTips[index % cookingTips.length],
      estimatedTime: 2 + (index % 5)
    }));
  }, [meal?.instructions]);

  const nutrition = useMemo(() => {
    if (!meal) return null;
    // Use nutritional info from API response if available, otherwise generate
    return meal.nutritionalInfo || generateNutritionalInfo();
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
    const selectedCount = checkedIngredients.size;
    const totalCost = shoppingList
      .filter(item => checkedIngredients.has(item.id))
      .reduce((total, item) => total + (item.estimatedPrice || 0), 0) / 100;

    return (
      <div className="max-w-4xl mx-auto space-y-6 p-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => setShowShoppingList(false)} className="p-2">
              ← {t("aiMealGenerator.back") || "Back to Recipe"}
            </Button>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">{t("aiMealGenerator.shoppingListTitle") || "Shopping List"}</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                {t("aiMealGenerator.for") || "For"} {meal.name} • {shoppingList.length} {t("aiMealGenerator.ingredientCount") || "items"}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={handleSelectAllIngredients}
            className="flex items-center gap-2"
          >
            <CheckSquare className="h-4 w-4" />
            {checkedIngredients.size === shoppingList.length ? 'Unselect All' : 'Select All'}
          </Button>
        </div>

        {/* Shopping List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{t("aiMealGenerator.ingredientsTitle") || "Ingredients"}</span>
              <Badge variant="secondary">{selectedCount} {t("aiMealGenerator.of") || "seleofcted"} {shoppingList.length} {t("aiMealGenerator.selected") || "selected"}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {shoppingList.map((item: any) => (
                <div 
                  key={item.id} 
                  className="flex items-center gap-4 p-4 rounded-lg border bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <Checkbox
                    id={item.id}
                    checked={checkedIngredients.has(item.id)}
                    onCheckedChange={() => toggleIngredientCheck(item.id)}
                    className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium capitalize">{item.name}</p>
                      <Badge variant="outline" className="text-xs">
                        {item.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      {item.quantity} {item.unit}
                    </p>
                  </div>
                  <div className="text-sm font-medium text-green-600">
                    ${(item.estimatedPrice / 100).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Card className="flex-1">
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="font-semibold">{t('mealShopping.selectedItems') || 'Selected Items'}: {selectedCount}</p>
                  
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleAddToPantry}
                  disabled={selectedCount === 0}
                  className="flex-1"
                >
                  <Package className="h-4 w-4 mr-2" />
                  {t("aiMealGenerator.addToPantry") || "Add to Pantry"}
                </Button>
                <Button
                  onClick={handleOrderOnline}
                  disabled={selectedCount === 0}
                  className="flex-1"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {t("aiMealGenerator.orderOnline") || "Order Online"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Online Dialog */}
        <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t("aiMealGenerator.completeOrder") || "Complete Your Order"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Selected Items */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">{t('mealShopping.selectedItems') || 'Selected Items'} ({selectedCount})</h3>
                <div className="text-sm text-gray-600">
                  {shoppingList
                    .filter(item => checkedIngredients.has(item.id))
                    .map(item => item.name)
                    .join(', ')}
                </div>
                <div className="text-lg font-semibold text-green-600 mt-2">
                  {t('mealShopping.total') || 'Total'}: ${totalCost.toFixed(2)}
                </div>
              </div>

              {/* Payment Method Section */}
              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  {t("aiMealGenerator.paymentMethod") || "Payment Method"}
                </h3>
                <Select value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("aiMealGenerator.choosePaymentMethod") || "Choose a payment method..."} />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map((method) => (
                      <SelectItem key={method.id} value={method.id}>
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          <span className="capitalize">{method.brand}</span>
                          <span>****{method.last4}</span>
                          {method.isDefault && <Badge variant="secondary" className="text-xs">{t("aiMealGenerator.default") || "Default"}</Badge>}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Delivery Address */}
              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {t("aiMealGenerator.deliveryAddress") || "Delivery Address"}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="street">{t("aiMealGenerator.street") || "Street Address"}</Label>
                    <Input
                      id="street"
                      value={deliveryAddress.street}
                      onChange={(e) => setDeliveryAddress(prev => ({ ...prev, street: e.target.value }))}
                      placeholder={t("aiMealGenerator.streetPlaceholder") || "123 Main Street"}
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">{t("aiMealGenerator.city") || "City"}</Label>
                    <Input
                      id="city"
                      value={deliveryAddress.city}
                      onChange={(e) => setDeliveryAddress(prev => ({ ...prev, city: e.target.value }))}
                      placeholder={t("aiMealGenerator.cityPlaceholder") || "New York"}
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">{t("aiMealGenerator.state") || "State"}</Label>
                    <Input
                      id="state"
                      value={deliveryAddress.state}
                      onChange={(e) => setDeliveryAddress(prev => ({ ...prev, state: e.target.value }))}
                      placeholder={t("aiMealGenerator.statePlaceholder") || "NY"}
                    />
                  </div>
                  <div>
                    <Label htmlFor="zipCode">{t("aiMealGenerator.zipCode") || "ZIP Code"}</Label>
                    <Input
                      id="zipCode"
                      value={deliveryAddress.zipCode}
                      onChange={(e) => setDeliveryAddress(prev => ({ ...prev, zipCode: e.target.value }))}
                      placeholder="10001"
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">{t("aiMealGenerator.country") || "Country"}</Label>
                    <Input
                      id="country"
                      value={deliveryAddress.country}
                      onChange={(e) => setDeliveryAddress(prev => ({ ...prev, country: e.target.value }))}
                      placeholder={t("aiMealGenerator.countryPlaceholder") || "United States"}
                    />
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button 
                  onClick={handleCompleteOrder}
                  className="flex-1 bg-blue-500 hover:bg-blue-600"
                >
                  <Package className="h-4 w-4 mr-2" />
                  {t("aiMealGenerator.placeOrder") || "Place Order"}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowOrderDialog(false)}
                  className="flex-1"
                >
                  {t("aiMealGenerator.cancel") || "Cancel"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-4xl mx-auto space-y-6 p-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={generateShoppingList}
              className="flex-shrink-0"
            >
              <ShoppingCart className="h-4 w-4 mr-1" />
              {t("aiMealGenerator.generateShoppingList") || "Generate Shopping List"}
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
                
                {/* Benefits and Prep Tip from API */}
                {meal.benefits && (
                  <div className="mb-4 p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-700">
                      <strong>{t("aiMealGenerator.benefits") || "Benefits"}:</strong> {meal.benefits}
                    </p>
                  </div>
                )}
                
                {meal.prepTip && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700">
                      <strong>{t("aiMealGenerator.prepTip") || "Prep Tip"}:</strong> {meal.prepTip}
                    </p>
                  </div>
                )}
                
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
                    <span className="font-medium text-sm sm:text-base">{meal.cookingTime} {t("aiMealGenerator.review.minutes") || "mins"}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
                    <span className="font-medium text-sm sm:text-base">{meal.servings} {t("aiMealGenerator.review.servings") || "servings"}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ChefHat className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600 flex-shrink-0" />
                    <span className="font-medium capitalize text-sm sm:text-base">{meal.difficulty}</span>
                  </div>
                  {meal.carbonFootprint && (
                    <div className="flex items-center space-x-2">
                      <span className="text-green-600 text-xs">🌱 {meal.carbonFootprint} kg CO2</span>
                    </div>
                  )}
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
                <TabsTrigger value="recipe">{t("mealTabs.recipe") || "Recipe"}</TabsTrigger>
                <TabsTrigger value="video">{t("mealTabs.video") || "Video Tutorial"}</TabsTrigger>
              </TabsList>
              
              <TabsContent value="recipe" className="space-y-6">
                {/* Ingredients */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BookOpen className="h-5 w-5 text-purple-600" />
                      <span>{t("aiMealGenerator.ingredientsTitle") || "Ingredients"}</span>
                    </CardTitle>
                    <CardDescription>{t("aiMealGenerator.ingredientsDesc") || "Everything you need for this recipe"}</CardDescription>
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
                      <span>{t("mealTabs.instructions") || "Cooking Instructions"}</span>
                    </CardTitle>
                    <CardDescription>{t("mealTabs.instructionsDesc") || "Follow these steps for the perfect result"}</CardDescription>
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
                      <span>{t("mealTabs.video") || "Video Tutorial"}</span>
                    </CardTitle>
                    <CardDescription>
                      {t("mealTabs.videoDesc") || "Watch step-by-step preparation for"} {meal.name}
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
                            {t("mealTabs.playVideo") || "Play Video"}
                          </Button>
                          <Button
                            onClick={openFullscreenVideo}
                            variant="outline"
                            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                          >
                            <Maximize className="h-4 w-4 mr-2" />
                            {t("mealTabs.fullscreen") || "Fullscreen"}
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
                              {t("mealTabs.closeVideo") || "Close Video"}
                            </Button>
                            <Button
                              onClick={openFullscreenVideo}
                              variant="ghost"
                              className="text-white hover:bg-white/20"
                            >
                              <Maximize className="h-4 w-4 mr-2" />
                              {t("mealTabs.fullscreen") || "Fullscreen"}
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
                <CardTitle className="text-lg">{t("mealSidebar.nutrition") || "Nutrition (per serving)"}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium">{t("mealSidebar.calories") || "Calories"}</span>
                    <span>{nutrition?.calories}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t("mealSidebar.protein") || "Protein"}</span>
                    <span>{nutrition?.protein}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t("mealSidebar.carbs") || "Carbs"}</span>
                    <span>{nutrition?.carbohydrates || nutrition?.carbs}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t("mealSidebar.fat") || "Fat"}</span>
                    <span>{nutrition?.fat}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t("mealSidebar.fiber") || "Fiber"}</span>
                    <span>{nutrition?.fiber}g</span>
                  </div>
                  {nutrition?.vitamins && (
                    <div className="pt-2 border-t">
                      <p className="text-sm font-medium mb-1">{t("mealSidebar.vitamins") || "Vitamins"}:</p>
                      <p className="text-xs text-gray-600">{nutrition.vitamins.join(', ')}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Cooking Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t("mealSidebar.progress") || "Cooking Progress"}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round((completedSteps.length / enhancedInstructions.length) * 100)}%
                  </div>
                  <p className="text-sm text-gray-600">
                    {completedSteps.length} {t("mealSidebar.of") || "of"} {enhancedInstructions.length} {t("mealSidebar.stepsCompleted") || "steps completed"}
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(completedSteps.length / enhancedInstructions.length) * 100}%` }}
                    ></div>
                  </div>
                  {completedSteps.length === enhancedInstructions.length && enhancedInstructions.length > 0 && (
                    <div className="mt-3 p-2 bg-purple-100 rounded-lg">
                      <p className="text-sm text-purple-700 font-medium">🎉 {t("mealSidebar.recipeCompleted") || "Recipe completed!"}</p>
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
              {t("mealSidebar.saveMeal") || "Save This Meal"}
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
