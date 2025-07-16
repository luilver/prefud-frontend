import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Utensils, Sparkles, X, Plus, Clock, DollarSign, ShoppingCart, AlertTriangle, Users } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";

interface SpecialMealCreatorProps {
  onMealCreated: (meal: any) => void;
  onBack: () => void;
}

const SpecialMealCreator = ({ onMealCreated, onBack }: SpecialMealCreatorProps) => {
  const [mealName, setMealName] = useState("");
  const [mealType, setMealType] = useState("");
  const [occasion, setOccasion] = useState("");
  const [numberOfPersons, setNumberOfPersons] = useState(2);
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);
  const [cuisinePreferences, setCuisinePreferences] = useState<string[]>([]);
  const [allergiesIntolerances, setAllergiesIntolerances] = useState<string[]>([]);
  const [additionalAllergies, setAdditionalAllergies] = useState("");
  const [maxCookTime, setMaxCookTime] = useState(60);
  const [cookingSkillLevel, setCookingSkillLevel] = useState("");
  const [budgetRange, setBudgetRange] = useState("");
  const [dislikes, setDislikes] = useState<string[]>([]);
  const [newDislike, setNewDislike] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedMeal, setGeneratedMeal] = useState<any>(null);
  
  const { ingredients } = useUser();
  const { toast } = useToast();

  const availableDiets = [
    "vegetarian", "vegan", "keto", "paleo", "mediterranean", 
    "low-carb", "gluten-free", "dairy-free", "pescatarian"
  ];

  const availableCuisines = [
    "italian", "mexican", "asian", "indian", "mediterranean", 
    "american", "french", "thai", "japanese", "chinese", "korean", "greek"
  ];

  const availableAllergies = [
    "nuts", "peanuts", "shellfish", "fish", "eggs", "dairy", 
    "soy", "gluten", "sesame", "sulfites"
  ];

  const mealTypes = ["breakfast", "brunch", "lunch", "dinner", "appetizer", "dessert", "snack"];
  const occasions = ["romantic dinner", "birthday", "anniversary", "date night", "family gathering", "celebration", "comfort food", "healthy meal", "weekend treat"];
  const cookTimesOptions = [30, 45, 60, 90, 120];
  const cookingSkillLevels = ["beginner", "intermediate", "advanced", "expert"];
  const budgetRanges = ["low", "medium", "high", "luxury"];

  const addDislike = () => {
    if (newDislike.trim() && !dislikes.includes(newDislike.trim().toLowerCase())) {
      setDislikes([...dislikes, newDislike.trim().toLowerCase()]);
      setNewDislike("");
    }
  };

  const removeDislike = (dislike: string) => {
    setDislikes(dislikes.filter(d => d !== dislike));
  };

  const toggleDiet = (diet: string) => {
    setDietaryRestrictions(prev =>
      prev.includes(diet) 
        ? prev.filter(d => d !== diet)
        : [...prev, diet]
    );
  };

  const toggleCuisine = (cuisine: string) => {
    setCuisinePreferences(prev =>
      prev.includes(cuisine) 
        ? prev.filter(c => c !== cuisine)
        : [...prev, cuisine]
    );
  };

  const toggleAllergy = (allergy: string) => {
    setAllergiesIntolerances(prev =>
      prev.includes(allergy) 
        ? prev.filter(a => a !== allergy)
        : [...prev, allergy]
    );
  };

  const checkIngredientAvailability = (mealIngredients: string[]) => {
    const userIngredients = ingredients.map(ing => ing.name.toLowerCase());
    const available = [];
    const needed = [];
    const duplicates = [];

    mealIngredients.forEach(ingredient => {
      const ingredientLower = ingredient.toLowerCase();
      if (userIngredients.includes(ingredientLower)) {
        available.push(ingredient);
        const userIngredient = ingredients.find(ing => ing.name.toLowerCase() === ingredientLower);
        if (userIngredient && userIngredient.quantity > 1) {
          duplicates.push(ingredient);
        }
      } else {
        needed.push(ingredient);
      }
    });

    return { available, needed, duplicates };
  };

  const generateMeal = async () => {
    if (!mealType || !occasion || numberOfPersons < 1 || !cookingSkillLevel || !budgetRange) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      console.log('Generating special meal with preferences:', {
        mealName,
        mealType,
        occasion,
        numberOfPersons,
        dietaryRestrictions,
        cuisinePreferences,
        allergiesIntolerances,
        additionalAllergies,
        maxCookTime,
        cookingSkillLevel,
        budgetRange,
        dislikes,
        specialRequests,
        availableIngredients: ingredients
      });

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Mock generated meal based on preferences
      const sampleMeals = {
        "romantic dinner": {
          name: mealName || "Romantic Candlelight Dinner",
          ingredients: ["salmon fillets", "asparagus", "garlic", "white wine", "butter", "lemon", "cherry tomatoes", "fresh herbs"],
          instructions: [
            "Season salmon fillets with salt and pepper",
            "Heat butter in a large skillet over medium-high heat",
            "Sear salmon skin-side up for 4-5 minutes",
            "Flip and cook for another 3-4 minutes",
            "Remove salmon and sauté asparagus with garlic",
            "Deglaze pan with white wine",
            "Add cherry tomatoes and fresh herbs",
            "Serve salmon over asparagus with pan sauce"
          ],
          calories: 420,
          prepTime: 35,
          servings: numberOfPersons,
          difficulty: cookingSkillLevel,
          course: mealType
        },
        "birthday": {
          name: mealName || "Birthday Celebration Feast",
          ingredients: ["chicken breast", "birthday cake mix", "seasonal vegetables", "olive oil", "herbs", "candles"],
          instructions: [
            "Prepare and season chicken breast",
            "Grill chicken until cooked through",
            "Roast seasonal vegetables with herbs",
            "Prepare birthday cake according to package",
            "Decorate cake with candles",
            "Arrange everything beautifully for celebration"
          ],
          calories: 580,
          prepTime: 90,
          servings: numberOfPersons,
          difficulty: cookingSkillLevel,
          course: mealType
        }
      };

      const selectedMeal = sampleMeals[occasion as keyof typeof sampleMeals] || sampleMeals["romantic dinner"];
      
      // Check ingredient availability first
      const availability = checkIngredientAvailability(selectedMeal.ingredients);
      
      const mealData = {
        id: Date.now().toString(),
        ...selectedMeal,
        type: mealType,
        occasion,
        dietaryRestrictions,
        allergiesIntolerances,
        cuisinePreferences,
        budgetRange,
        dislikes,
        specialRequests,
        createdAt: new Date().toISOString(),
        availability
      };

      setGeneratedMeal(mealData);

      toast({
        title: "Special Meal Generated!",
        description: `Your ${occasion} meal "${mealData.name}" is ready for ${numberOfPersons} people!`,
      });

    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate meal. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOrderIngredients = () => {
    if (!generatedMeal || !generatedMeal.availability.needed.length) {
      toast({
        title: "No Ingredients Needed",
        description: "You already have all the required ingredients!",
      });
      return;
    }

    // Create shopping list for online ordering
    const shoppingList = generatedMeal.availability.needed.join(', ');
    toast({
      title: "Order Ingredients",
      description: `Redirecting to grocery delivery service with: ${shoppingList}`,
    });
    // Here you would integrate with grocery delivery APIs
  };

  const handleShopInStore = () => {
    if (!generatedMeal || !generatedMeal.availability.needed.length) {
      toast({
        title: "No Shopping List Needed",
        description: "You already have all the required ingredients!",
      });
      return;
    }

    // Generate downloadable shopping list
    const shoppingListText = `Shopping List for ${generatedMeal.name}\n\nIngredients to buy:\n${generatedMeal.availability.needed.map((item: string) => `• ${item}`).join('\n')}\n\nYou already have:\n${generatedMeal.availability.available.map((item: string) => `• ${item}`).join('\n')}\n\nServes: ${generatedMeal.servings} people\nOccasion: ${generatedMeal.occasion}`;
    
    // Create and download text file
    const blob = new Blob([shoppingListText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${generatedMeal.name.replace(/\s+/g, '_')}_shopping_list.txt`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Shopping List Created",
      description: "Your shopping list has been downloaded for in-store shopping.",
    });
  };

  if (generatedMeal) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={onBack}>
            ← Back to Meal Planner
          </Button>
          <h2 className="text-2xl font-bold text-gray-800">Your Special Meal</h2>
          <div></div>
        </div>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <Utensils className="h-6 w-6" />
              {generatedMeal.name}
            </CardTitle>
            <CardDescription>
              {generatedMeal.occasion} • {generatedMeal.type} • {generatedMeal.calories} calories • {generatedMeal.prepTime} min • Serves {generatedMeal.servings}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold mb-2">Ingredients:</h4>
              <div className="flex flex-wrap gap-2">
                {generatedMeal.ingredients.map((ingredient: string, index: number) => (
                  <Badge key={index} variant="outline" className="border-green-300">
                    {ingredient}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Instructions:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                {generatedMeal.instructions.map((step: string, index: number) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </div>

            {/* Ingredient Availability */}
            <div className="space-y-3">
              <h4 className="font-semibold">Ingredient Availability:</h4>
              
              {generatedMeal.availability.available.length > 0 && (
                <div>
                  <p className="text-sm text-green-600 font-medium mb-1">✓ You have these ingredients:</p>
                  <div className="flex flex-wrap gap-1">
                    {generatedMeal.availability.available.map((ingredient: string, index: number) => (
                      <Badge key={index} className="bg-green-100 text-green-800 text-xs">
                        {ingredient}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {generatedMeal.availability.needed.length > 0 && (
                <div>
                  <p className="text-sm text-orange-600 font-medium mb-1">○ You need to buy:</p>
                  <div className="flex flex-wrap gap-1">
                    {generatedMeal.availability.needed.map((ingredient: string, index: number) => (
                      <Badge key={index} className="bg-orange-100 text-orange-800 text-xs">
                        {ingredient}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {generatedMeal.availability.duplicates.length > 0 && (
                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-yellow-800 font-medium">Duplicate Alert:</p>
                      <p className="text-xs text-yellow-700">
                        You already have these ingredients. You might be buying them twice:
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {generatedMeal.availability.duplicates.map((ingredient: string, index: number) => (
                          <Badge key={index} className="bg-yellow-100 text-yellow-800 text-xs">
                            {ingredient}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Shopping Options */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
              <Button 
                onClick={handleOrderIngredients}
                className="bg-green-500 hover:bg-green-600 text-white flex-1"
                disabled={!generatedMeal.availability.needed.length}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Order Ingredients Online
              </Button>
              <Button 
                onClick={handleShopInStore}
                variant="outline" 
                className="border-green-300 text-green-700 hover:bg-green-50 flex-1"
                disabled={!generatedMeal.availability.needed.length}
              >
                Create Shopping List
              </Button>
              <Button 
                onClick={() => onMealCreated(generatedMeal)}
                className="bg-emerald-500 hover:bg-emerald-600 text-white flex-1"
              >
                Save Recipe
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          ← Back to Meal Planner
        </Button>
        <h2 className="text-2xl font-bold text-gray-800">Create Special Meal</h2>
        <div></div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Meal Details */}
        <Card className="bg-white/70 backdrop-blur-sm border-green-200">
          <CardHeader>
            <CardTitle className="text-green-700">Meal Details</CardTitle>
            <CardDescription>
              Set up your special meal preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="mealName">Meal Name (Optional)</Label>
              <Input
                id="mealName"
                placeholder="e.g., Anniversary Dinner"
                value={mealName}
                onChange={(e) => setMealName(e.target.value)}
                className="border-green-200 focus:border-green-400"
              />
            </div>

            <div>
              <Label>Meal Type</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {mealTypes.map((type) => (
                  <Badge
                    key={type}
                    variant={mealType === type ? "default" : "outline"}
                    className={`cursor-pointer ${
                      mealType === type
                        ? 'bg-green-500 text-white'
                        : 'border-green-300 text-green-700 hover:bg-green-50'
                    }`}
                    onClick={() => setMealType(type)}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label>Occasion</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {occasions.map((occ) => (
                  <Badge
                    key={occ}
                    variant={occasion === occ ? "default" : "outline"}
                    className={`cursor-pointer ${
                      occasion === occ
                        ? 'bg-green-500 text-white'
                        : 'border-green-300 text-green-700 hover:bg-green-50'
                    }`}
                    onClick={() => setOccasion(occ)}
                  >
                    {occ.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="numberOfPersons">Number of People</Label>
              <Input
                id="numberOfPersons"
                type="number"
                min="1"
                max="20"
                value={numberOfPersons}
                onChange={(e) => setNumberOfPersons(parseInt(e.target.value) || 2)}
                className="border-green-200 focus:border-green-400"
              />
            </div>

            <div>
              <Label htmlFor="specialRequests">Special Requests</Label>
              <Textarea
                id="specialRequests"
                placeholder="Any special requests or modifications..."
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                className="border-green-200 focus:border-green-400"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        
        {/* Dietary Preferences */}
        <Card className="bg-white/70 backdrop-blur-sm border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-700">Dietary Preferences</CardTitle>
            <CardDescription>
              Tell us about your dietary needs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Dietary Restrictions</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {availableDiets.map((diet) => (
                  <Badge
                    key={diet}
                    variant={dietaryRestrictions.includes(diet) ? "default" : "outline"}
                    className={`cursor-pointer ${
                      dietaryRestrictions.includes(diet)
                        ? 'bg-blue-500 text-white'
                        : 'border-blue-300 text-blue-700 hover:bg-blue-50'
                    }`}
                    onClick={() => toggleDiet(diet)}
                  >
                    {diet.charAt(0).toUpperCase() + diet.slice(1)}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label>Allergies & Intolerances</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {availableAllergies.map((allergy) => (
                  <Badge
                    key={allergy}
                    variant={allergiesIntolerances.includes(allergy) ? "default" : "outline"}
                    className={`cursor-pointer ${
                      allergiesIntolerances.includes(allergy)
                        ? 'bg-red-500 text-white'
                        : 'border-red-300 text-red-700 hover:bg-red-50'
                    }`}
                    onClick={() => toggleAllergy(allergy)}
                  >
                    {allergy.charAt(0).toUpperCase() + allergy.slice(1)}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="additionalAllergies">Additional Allergies</Label>
              <Textarea
                id="additionalAllergies"
                placeholder="Please specify any other allergies..."
                value={additionalAllergies}
                onChange={(e) => setAdditionalAllergies(e.target.value)}
                className="border-red-200 focus:border-red-400 mt-2"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Cuisine Preferences */}
        <Card className="bg-white/70 backdrop-blur-sm border-orange-200">
          <CardHeader>
            <CardTitle className="text-orange-700">Cuisine Preferences</CardTitle>
            <CardDescription>
              Select your favorite cuisines
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {availableCuisines.map((cuisine) => (
                <Badge
                  key={cuisine}
                  variant={cuisinePreferences.includes(cuisine) ? "default" : "outline"}
                  className={`cursor-pointer ${
                    cuisinePreferences.includes(cuisine)
                      ? 'bg-orange-500 text-white'
                      : 'border-orange-300 text-orange-700 hover:bg-orange-50'
                  }`}
                  onClick={() => toggleCuisine(cuisine)}
                >
                  {cuisine.charAt(0).toUpperCase() + cuisine.slice(1)}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Cooking Preferences */}
        <Card className="bg-white/70 backdrop-blur-sm border-purple-200">
          <CardHeader>
            <CardTitle className="text-purple-700 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Cooking Preferences
            </CardTitle>
            <CardDescription>
              Set your cooking constraints and skill level
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Max Cook Time</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {cookTimesOptions.map((time) => (
                  <Badge
                    key={time}
                    variant={maxCookTime === time ? "default" : "outline"}
                    className={`cursor-pointer ${
                      maxCookTime === time
                        ? 'bg-purple-500 text-white'
                        : 'border-purple-300 text-purple-700 hover:bg-purple-50'
                    }`}
                    onClick={() => setMaxCookTime(time)}
                  >
                    {time} min
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label>Cooking Skill Level</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {cookingSkillLevels.map((level) => (
                  <Badge
                    key={level}
                    variant={cookingSkillLevel === level ? "default" : "outline"}
                    className={`cursor-pointer ${
                      cookingSkillLevel === level
                        ? 'bg-purple-500 text-white'
                        : 'border-purple-300 text-purple-700 hover:bg-purple-50'
                    }`}
                    onClick={() => setCookingSkillLevel(level)}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Budget Range
              </Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {budgetRanges.map((range) => (
                  <Badge
                    key={range}
                    variant={budgetRange === range ? "default" : "outline"}
                    className={`cursor-pointer ${
                      budgetRange === range
                        ? 'bg-purple-500 text-white'
                        : 'border-purple-300 text-purple-700 hover:bg-purple-50'
                    }`}
                    onClick={() => setBudgetRange(range)}
                  >
                    {range.charAt(0).toUpperCase() + range.slice(1)}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Food Dislikes */}
        <Card className="bg-white/70 backdrop-blur-sm border-red-200">
          <CardHeader>
            <CardTitle className="text-red-700">Food Dislikes</CardTitle>
            <CardDescription>
              Add foods you want to avoid
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Input
                placeholder="e.g., mushrooms, cilantro..."
                value={newDislike}
                onChange={(e) => setNewDislike(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addDislike()}
                className="border-red-200 focus:border-red-400"
              />
              <Button
                onClick={addDislike}
                size="sm"
                className="bg-red-500 hover:bg-red-600"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {dislikes.length > 0 && (
              <div>
                <Label className="text-sm text-gray-600">Your dislikes:</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {dislikes.map((dislike) => (
                    <Badge
                      key={dislike}
                      variant="destructive"
                      className="cursor-pointer"
                      onClick={() => removeDislike(dislike)}
                    >
                      {dislike}
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Click on any item to remove it
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Generate Button */}
        <Card className="bg-white/70 backdrop-blur-sm border-green-200">
          <CardHeader>
            <CardTitle className="text-green-700">Generate Your Special Meal</CardTitle>
            <CardDescription>
              Create a personalized meal with AI
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={generateMeal}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-lg py-6"
            >
              <Sparkles className="h-5 w-5 mr-2" />
              {isGenerating ? "Generating Your Special Meal..." : "Generate Special Meal"}
            </Button>
            
            {isGenerating && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>
                  <span>Creating your special meal...</span>
                </div>
                <div className="text-xs text-gray-500">
                  Analyzing your preferences to create the perfect recipe for your occasion.
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SpecialMealCreator;
