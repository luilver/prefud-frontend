
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Coffee, Sparkles, X, Plus, Target, ShoppingCart, AlertTriangle } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";

interface DrinkCreatorProps {
  onDrinkCreated: (drink: any) => void;
  onBack: () => void;
}

const DrinkCreator = ({ onDrinkCreated, onBack }: DrinkCreatorProps) => {
  const [drinkName, setDrinkName] = useState("");
  const [drinkGoal, setDrinkGoal] = useState("");
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);
  const [allergiesIntolerances, setAllergiesIntolerances] = useState<string[]>([]);
  const [additionalAllergies, setAdditionalAllergies] = useState("");
  const [flavorPreferences, setFlavorPreferences] = useState<string[]>([]);
  const [newFlavor, setNewFlavor] = useState("");
  const [servings, setServings] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDrink, setGeneratedDrink] = useState<any>(null);
  
  const { ingredients } = useUser();
  const { toast } = useToast();

  const availableDiets = [
    "vegan", "vegetarian", "keto", "paleo", "low-carb", 
    "gluten-free", "dairy-free", "sugar-free", "organic"
  ];

  const availableAllergies = [
    "nuts", "peanuts", "dairy", "soy", "gluten", "citrus", 
    "berries", "coconut", "caffeine", "artificial sweeteners"
  ];

  const drinkGoals = [
    "weight-loss", "energy-boost", "muscle-recovery", "detox", 
    "immunity-boost", "hydration", "focus-concentration", "sleep-aid",
    "digestive-health", "anti-inflammatory"
  ];

  const addFlavor = () => {
    if (newFlavor.trim() && !flavorPreferences.includes(newFlavor.trim().toLowerCase())) {
      setFlavorPreferences([...flavorPreferences, newFlavor.trim().toLowerCase()]);
      setNewFlavor("");
    }
  };

  const removeFlavor = (flavor: string) => {
    setFlavorPreferences(flavorPreferences.filter(f => f !== flavor));
  };

  const toggleDiet = (diet: string) => {
    setDietaryRestrictions(prev =>
      prev.includes(diet) 
        ? prev.filter(d => d !== diet)
        : [...prev, diet]
    );
  };

  const toggleAllergy = (allergy: string) => {
    setAllergiesIntolerances(prev =>
      prev.includes(allergy) 
        ? prev.filter(a => a !== allergy)
        : [...prev, allergy]
    );
  };

  const toggleGoal = (goal: string) => {
    setDrinkGoal(goal);
  };

  const checkIngredientAvailability = (drinkIngredients: string[]) => {
    const userIngredients = ingredients.map(ing => ing.name.toLowerCase());
    const available = [];
    const needed = [];
    const duplicates = [];

    drinkIngredients.forEach(ingredient => {
      const ingredientLower = ingredient.toLowerCase();
      if (userIngredients.includes(ingredientLower)) {
        available.push(ingredient);
        // Check if user might buy duplicates
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

  const generateDrink = async () => {
    if (!drinkName || !drinkGoal || servings < 1) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      console.log('Generating healthy drink with preferences:', {
        drinkName,
        drinkGoal,
        dietaryRestrictions,
        allergiesIntolerances,
        additionalAllergies,
        flavorPreferences,
        servings,
        availableIngredients: ingredients
      });

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock generated drink based on goal
      const sampleDrinks = {
        "weight-loss": {
          name: drinkName || "Green Fat-Burner Smoothie",
          ingredients: ["spinach", "green apple", "cucumber", "lemon", "ginger", "coconut water"],
          instructions: [
            "Wash all fresh ingredients thoroughly",
            "Add spinach and coconut water to blender first",
            "Add chopped apple and cucumber",
            "Add fresh ginger and lemon juice",
            "Blend until smooth and creamy",
            "Serve immediately over ice"
          ],
          calories: 120,
          prepTime: 5,
          benefits: ["Boosts metabolism", "High in fiber", "Natural detox", "Low calorie"]
        },
        "energy-boost": {
          name: drinkName || "Power Green Energy Drink",
          ingredients: ["banana", "spinach", "matcha powder", "almond milk", "dates", "chia seeds"],
          instructions: [
            "Soak chia seeds for 10 minutes",
            "Add almond milk and spinach to blender",
            "Add banana and pitted dates",
            "Add matcha powder and soaked chia seeds",
            "Blend until smooth",
            "Enjoy immediately"
          ],
          calories: 180,
          prepTime: 15,
          benefits: ["Natural caffeine", "Sustained energy", "Rich in antioxidants", "Protein boost"]
        },
        "detox": {
          name: drinkName || "Ultimate Detox Elixir",
          ingredients: ["cucumber", "celery", "lemon", "ginger", "parsley", "coconut water"],
          instructions: [
            "Juice cucumber and celery first",
            "Add fresh lemon juice",
            "Grate fresh ginger and add",
            "Blend with parsley and coconut water",
            "Strain if desired",
            "Drink on empty stomach"
          ],
          calories: 45,
          prepTime: 10,
          benefits: ["Liver support", "Anti-inflammatory", "Hydrating", "Alkalizing"]
        }
      };

      const mockDrink = sampleDrinks[drinkGoal as keyof typeof sampleDrinks] || sampleDrinks["energy-boost"];
      
      // Check ingredient availability first
      const availability = checkIngredientAvailability(mockDrink.ingredients);
      
      const drinkData = {
        id: Date.now().toString(),
        ...mockDrink,
        goal: drinkGoal,
        servings,
        dietaryRestrictions,
        allergiesIntolerances,
        flavorPreferences,
        createdAt: new Date().toISOString(),
        availability
      };

      setGeneratedDrink(drinkData);

      toast({
        title: "Healthy Drink Generated!",
        description: `Your ${drinkGoal} drink "${drinkData.name}" is ready!`,
      });

    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate drink. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOrderIngredients = () => {
    toast({
      title: "Order Ingredients",
      description: "Redirecting to grocery delivery service...",
    });
    // Here you would integrate with grocery delivery APIs
  };

  const handleShopInStore = () => {
    toast({
      title: "Shopping List Created",
      description: "Your shopping list has been prepared for in-store shopping.",
    });
    // Here you would create a shopping list
  };

  if (generatedDrink) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={onBack}>
            ← Back to Meal Planner
          </Button>
          <h2 className="text-2xl font-bold text-gray-800">Your Healthy Drink</h2>
          <div></div>
        </div>

        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <Coffee className="h-6 w-6" />
              {generatedDrink.name}
            </CardTitle>
            <CardDescription>
              Goal: {generatedDrink.goal} • {generatedDrink.calories} calories • {generatedDrink.prepTime} min prep
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold mb-2">Ingredients:</h4>
              <div className="flex flex-wrap gap-2">
                {generatedDrink.ingredients.map((ingredient: string, index: number) => (
                  <Badge key={index} variant="outline" className="border-blue-300">
                    {ingredient}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Instructions:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                {generatedDrink.instructions.map((step: string, index: number) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Benefits:</h4>
              <div className="flex flex-wrap gap-2">
                {generatedDrink.benefits.map((benefit: string, index: number) => (
                  <Badge key={index} className="bg-green-100 text-green-800">
                    {benefit}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Ingredient Availability */}
            <div className="space-y-3">
              <h4 className="font-semibold">Ingredient Availability:</h4>
              
              {generatedDrink.availability.available.length > 0 && (
                <div>
                  <p className="text-sm text-green-600 font-medium mb-1">✓ You have these ingredients:</p>
                  <div className="flex flex-wrap gap-1">
                    {generatedDrink.availability.available.map((ingredient: string, index: number) => (
                      <Badge key={index} className="bg-green-100 text-green-800 text-xs">
                        {ingredient}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {generatedDrink.availability.needed.length > 0 && (
                <div>
                  <p className="text-sm text-orange-600 font-medium mb-1">○ You need to buy:</p>
                  <div className="flex flex-wrap gap-1">
                    {generatedDrink.availability.needed.map((ingredient: string, index: number) => (
                      <Badge key={index} className="bg-orange-100 text-orange-800 text-xs">
                        {ingredient}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {generatedDrink.availability.duplicates.length > 0 && (
                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-yellow-800 font-medium">Duplicate Alert:</p>
                      <p className="text-xs text-yellow-700">
                        You already have these ingredients. You might be buying them twice:
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {generatedDrink.availability.duplicates.map((ingredient: string, index: number) => (
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
                className="bg-blue-500 hover:bg-blue-600 text-white flex-1"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Order Ingredients Online
              </Button>
              <Button 
                onClick={handleShopInStore}
                variant="outline" 
                className="border-blue-300 text-blue-700 hover:bg-blue-50 flex-1"
              >
                Create Shopping List
              </Button>
              <Button 
                onClick={() => onDrinkCreated(generatedDrink)}
                className="bg-green-500 hover:bg-green-600 text-white flex-1"
              >
                Save Drink Recipe
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
        <h2 className="text-2xl font-bold text-gray-800">Create Healthy Drink</h2>
        <div></div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Drink Details */}
        <Card className="bg-white/70 backdrop-blur-sm border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-700">Drink Details</CardTitle>
            <CardDescription>
              Set up your healthy drink preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="drinkName">Drink Name (Optional)</Label>
              <Input
                id="drinkName"
                placeholder="e.g., My Morning Energy Boost"
                value={drinkName}
                onChange={(e) => setDrinkName(e.target.value)}
                className="border-blue-200 focus:border-blue-400"
              />
            </div>

            <div>
              <Label>Drink Goal</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {drinkGoals.map((goal) => (
                  <Badge
                    key={goal}
                    variant={drinkGoal === goal ? "default" : "outline"}
                    className={`cursor-pointer ${
                      drinkGoal === goal
                        ? 'bg-blue-500 text-white'
                        : 'border-blue-300 text-blue-700 hover:bg-blue-50'
                    }`}
                    onClick={() => toggleGoal(goal)}
                  >
                    <Target className="h-3 w-3 mr-1" />
                    {goal.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="servings">Number of Servings</Label>
              <Input
                id="servings"
                type="number"
                min="1"
                max="10"
                value={servings}
                onChange={(e) => setServings(parseInt(e.target.value) || 1)}
                className="border-blue-200 focus:border-blue-400"
              />
            </div>
          </CardContent>
        </Card>

        {/* Dietary Preferences */}
        <Card className="bg-white/70 backdrop-blur-sm border-green-200">
          <CardHeader>
            <CardTitle className="text-green-700">Dietary Preferences</CardTitle>
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
                        ? 'bg-green-500 text-white'
                        : 'border-green-300 text-green-700 hover:bg-green-50'
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
                placeholder="Please specify any other allergies or intolerances..."
                value={additionalAllergies}
                onChange={(e) => setAdditionalAllergies(e.target.value)}
                className="border-red-200 focus:border-red-400 mt-2"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Flavor Preferences */}
        <Card className="bg-white/70 backdrop-blur-sm border-orange-200">
          <CardHeader>
            <CardTitle className="text-orange-700">Flavor Preferences</CardTitle>
            <CardDescription>
              Add your favorite flavors
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Input
                placeholder="e.g., vanilla, chocolate, berry..."
                value={newFlavor}
                onChange={(e) => setNewFlavor(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addFlavor()}
                className="border-orange-200 focus:border-orange-400"
              />
              <Button
                onClick={addFlavor}
                size="sm"
                className="bg-orange-500 hover:bg-orange-600"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {flavorPreferences.length > 0 && (
              <div>
                <Label className="text-sm text-gray-600">Your flavor preferences:</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {flavorPreferences.map((flavor) => (
                    <Badge
                      key={flavor}
                      className="bg-orange-100 text-orange-800 cursor-pointer"
                      onClick={() => removeFlavor(flavor)}
                    >
                      {flavor}
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Click on any flavor to remove it
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Generate Button */}
        <Card className="bg-white/70 backdrop-blur-sm border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-700">Generate Your Drink</CardTitle>
            <CardDescription>
              Create a personalized healthy drink with AI
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={generateDrink}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-lg py-6"
            >
              <Sparkles className="h-5 w-5 mr-2" />
              {isGenerating ? "Generating Your Drink..." : "Generate Healthy Drink"}
            </Button>
            
            {isGenerating && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  <span>Creating your perfect healthy drink...</span>
                </div>
                <div className="text-xs text-gray-500">
                  Analyzing your goals and preferences to create the perfect recipe.
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DrinkCreator;
