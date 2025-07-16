
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Clock, Users, ChefHat, Utensils, RefreshCw, Heart } from "lucide-react";

interface AIMealGenerationProps {
  mealData: any;
  onMealCreated: (meal: any) => void;
}

const AIMealGeneration = ({ mealData, onMealCreated }: AIMealGenerationProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedMeal, setGeneratedMeal] = useState<any>(null);

  const generateMeal = async () => {
    setIsGenerating(true);
    
    // Simulate AI generation with realistic delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Mock AI-generated meal based on user preferences
    const mockMeal = {
      id: Date.now().toString(),
      name: generateMealName(),
      description: generateDescription(),
      cuisine: mealData.cuisinePreference || "Fusion",
      cookingTime: mealData.cookingTime || 30,
      servings: mealData.servings || 2,
      difficulty: "Medium",
      ingredients: mealData.ingredients?.slice(0, 8) || [],
      instructions: generateInstructions(),
      nutritionInfo: {
        calories: Math.floor(Math.random() * 400) + 300,
        protein: Math.floor(Math.random() * 30) + 15,
        carbs: Math.floor(Math.random() * 40) + 20,
        fat: Math.floor(Math.random() * 20) + 10
      },
      tags: generateTags(),
      createdAt: new Date().toISOString()
    };
    
    setGeneratedMeal(mockMeal);
    setIsGenerating(false);
  };

  const generateMealName = () => {
    const adjectives = ["Crispy", "Savory", "Delicious", "Spiced", "Fresh", "Hearty", "Zesty"];
    const proteins = mealData.ingredients?.find((ing: string) => 
      ["Chicken", "Beef", "Fish", "Tofu", "Eggs"].some(p => ing.includes(p))
    ) || "Veggie";
    const styles = ["Bowl", "Stir-fry", "Salad", "Pasta", "Curry", "Soup"];
    
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const style = styles[Math.floor(Math.random() * styles.length)];
    
    return `${adj} ${proteins} ${style}`;
  };

  const generateDescription = () => {
    const descriptions = [
      "A perfectly balanced meal combining fresh ingredients with aromatic spices.",
      "A delightful fusion of flavors that will satisfy your taste buds.",
      "A nutritious and delicious meal that's perfect for any occasion.",
      "A creative combination of ingredients that creates a memorable dining experience.",
      "A wholesome meal that brings together the best of comfort and nutrition."
    ];
    return descriptions[Math.floor(Math.random() * descriptions.length)];
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

  const generateTags = () => {
    const allTags = ["Quick", "Healthy", "Comfort Food", "One-Pan", "High Protein", "Low Carb", "Spicy", "Mild"];
    const tags = [];
    
    if (mealData.cookingTime <= 20) tags.push("Quick");
    if (mealData.dietaryRestrictions?.includes("vegetarian")) tags.push("Vegetarian");
    if (mealData.dietaryRestrictions?.includes("vegan")) tags.push("Vegan");
    if (mealData.dietaryRestrictions?.includes("gluten-free")) tags.push("Gluten-Free");
    
    // Add random tags
    const remainingTags = allTags.filter(tag => !tags.includes(tag));
    const additionalTags = remainingTags.slice(0, 3 - tags.length);
    
    return [...tags, ...additionalTags];
  };

  const handleSaveMeal = () => {
    if (generatedMeal) {
      onMealCreated(generatedMeal);
    }
  };

  useEffect(() => {
    generateMeal();
  }, []);

  if (isGenerating) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <div className="space-y-6">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-purple-600 animate-pulse" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">AI is Creating Your Meal</h3>
              <p className="text-gray-600 mb-4">
                Analyzing your preferences and ingredients to create the perfect meal...
              </p>
              <div className="w-64 h-2 bg-gray-200 rounded-full mx-auto overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!generatedMeal) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Generated Meal Card */}
      <Card className="border-2 border-purple-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                <ChefHat className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">{generatedMeal.name}</CardTitle>
                <CardDescription className="text-lg">
                  {generatedMeal.description}
                </CardDescription>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={generateMeal}
              disabled={isGenerating}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Regenerate
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Meal Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2 text-sm">
              <Clock className="h-4 w-4 text-gray-500" />
              <span>{generatedMeal.cookingTime} mins</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Users className="h-4 w-4 text-gray-500" />
              <span>{generatedMeal.servings} servings</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Utensils className="h-4 w-4 text-gray-500" />
              <span>{generatedMeal.cuisine}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <ChefHat className="h-4 w-4 text-gray-500" />
              <span>{generatedMeal.difficulty}</span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {generatedMeal.tags.map((tag: string, index: number) => (
              <Badge key={index} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>

          {/* Nutrition Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-3">Nutrition (per serving)</h4>
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="font-semibold text-lg">{generatedMeal.nutritionInfo.calories}</div>
                <div className="text-gray-600">Calories</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-lg">{generatedMeal.nutritionInfo.protein}g</div>
                <div className="text-gray-600">Protein</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-lg">{generatedMeal.nutritionInfo.carbs}g</div>
                <div className="text-gray-600">Carbs</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-lg">{generatedMeal.nutritionInfo.fat}g</div>
                <div className="text-gray-600">Fat</div>
              </div>
            </div>
          </div>

          {/* Ingredients */}
          <div>
            <h4 className="font-semibold mb-3">Ingredients</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {generatedMeal.ingredients.map((ingredient: string, index: number) => (
                <div key={index} className="bg-white border rounded-lg p-2 text-sm">
                  {ingredient}
                </div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div>
            <h4 className="font-semibold mb-3">Instructions</h4>
            <ol className="space-y-2">
              {generatedMeal.instructions.map((step: string, index: number) => (
                <li key={index} className="flex space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white text-sm rounded-full flex items-center justify-center">
                    {index + 1}
                  </span>
                  <span className="text-sm">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        <Button
          onClick={handleSaveMeal}
          size="lg"
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          <Heart className="mr-2 h-5 w-5" />
          Save This Meal
        </Button>
        <Button variant="outline" size="lg" onClick={generateMeal}>
          <RefreshCw className="mr-2 h-5 w-5" />
          Try Again
        </Button>
      </div>
    </div>
  );
};

export default AIMealGeneration;
