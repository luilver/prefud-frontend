
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Clock, Users, Zap, Droplets, RefreshCw, Save, ShoppingCart, Check } from "lucide-react";
import { toast } from "sonner";
import CocktailAnimation from "./CocktailAnimation";

interface AIDrinkGenerationProps {
  data: any;
  onUpdate: (key: string, value: any) => void;
  onDrinkCreated?: (drink: any) => void;
}

const AIDrinkGeneration = ({ data, onDrinkCreated }: AIDrinkGenerationProps) => {
  const [isGenerating, setIsGenerating] = useState(true);
  const [generatedDrink, setGeneratedDrink] = useState<any>(null);
  const [shoppingList, setShoppingList] = useState<any[]>([]);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    generateDrink();
  }, []);

  const generateDrink = () => {
    setIsGenerating(true);
    
    // Simulate AI generation with cocktail animation
    setTimeout(() => {
      const drinkTypes = {
        smoothie: "Smoothie",
        juice: "Fresh Juice",
        tea: "Wellness Tea",
        protein: "Protein Shake",
        detox: "Detox Drink",
        energy: "Energy Boost"
      };

      // Generate ingredients based on preferences
      const baseIngredients = [
        { name: "Fresh Spinach", amount: "2 cups", category: "Vegetables", price: "$3.50" },
        { name: "Banana", amount: "1 large", category: "Fruits", price: "$0.75" },
        { name: "Mango", amount: "1/2 cup", category: "Fruits", price: "$2.00" },
        { name: "Coconut Water", amount: "1 cup", category: "Liquids", price: "$1.25" },
        { name: "Chia Seeds", amount: "1 tbsp", category: "Superfoods", price: "$4.00" },
        { name: "Fresh Ginger", amount: "1 inch", category: "Spices", price: "$0.50" },
        { name: "Lemon", amount: "1/2 fruit", category: "Fruits", price: "$0.50" },
        { name: "Honey", amount: "1 tsp", category: "Sweeteners", price: "$2.00" }
      ];

      const mockDrink = {
        name: data.drink_name || `Healthy ${drinkTypes[data.type as keyof typeof drinkTypes] || 'Drink'}`,
        type: data.type,
        description: "A nutritious and delicious drink crafted specifically for your health goals and preferences.",
        prepTime: "5-10 minutes",
        servings: data.numberPeople || 1,
        calories: Math.floor(Math.random() * 200) + 150,
        ingredients: baseIngredients,
        instructions: [
          "Wash all fresh ingredients thoroughly",
          "Add liquids to blender first",
          "Add soft fruits and vegetables",
          "Add superfoods and spices",
          "Blend on high speed for 60-90 seconds until smooth",
          "Taste and adjust sweetness if needed",
          "Pour into glasses and serve immediately",
          "Garnish with fresh ingredients if desired"
        ],
        nutritionHighlights: data.healthGoals?.map((goal: string) => {
          const benefits: Record<string, string> = {
            'energy-boost': 'Natural sugars and B-vitamins for sustained energy',
            'weight-loss': 'Low in calories, high in fiber for satiety',
            'digestive-health': 'Contains fiber and digestive enzymes',
            'immunity-boost': 'Rich in vitamin C and antioxidants',
            'skin-health': 'Antioxidants and vitamins for glowing skin',
            'detox': 'Natural detoxifying compounds',
            'muscle-gain': 'High protein content for muscle support',
            'stress-relief': 'Adaptogens and calming nutrients'
          };
          return benefits[goal] || 'Supports overall health and wellness';
        }) || ['Supports overall health and wellness'],
        tips: [
          "For best results, use fresh ingredients when possible",
          "Adjust liquid amount for desired consistency",
          "Can be stored in refrigerator for up to 24 hours",
          "Add ice for a refreshing cold drink"
        ],
        healthGoals: data.healthGoals || [],
        dietaryRestrictions: data.dietaryRestrictions || [],
        servingSize: data.numberPeople || 1
      };

      setGeneratedDrink(mockDrink);
      setShoppingList(baseIngredients);
      setIsGenerating(false);
    }, 4000); // 4 seconds for animation
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

  const saveDrink = () => {
    if (generatedDrink && onDrinkCreated) {
      onDrinkCreated(generatedDrink);
      toast.success("Drink recipe saved successfully!");
    } else {
      toast.success("Drink recipe saved to your collection!");
    }
  };

  if (isGenerating) {
    return (
      <div className="text-center space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-green-800 mb-2">AI is Creating Your Drink</h2>
          <p className="text-green-600">Analyzing your preferences to create the perfect healthy drink...</p>
        </div>
        <CocktailAnimation />
      </div>
    );
  }

  if (!generatedDrink) {
    return (
      <div className="text-center">
        <p className="text-red-600">Failed to generate drink. Please try again.</p>
        <Button onClick={generateDrink} className="mt-4">
          Retry Generation
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
            <p className="text-xs text-green-600">Prep Time</p>
          </CardContent>
        </Card>
        <Card className="border-green-200 text-center">
          <CardContent className="p-4">
            <Users className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <p className="text-sm text-green-700 font-medium">{generatedDrink.servings} serving{generatedDrink.servings > 1 ? 's' : ''}</p>
            <p className="text-xs text-green-600">Servings</p>
          </CardContent>
        </Card>
        <Card className="border-green-200 text-center">
          <CardContent className="p-4">
            <Zap className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <p className="text-sm text-green-700 font-medium">{generatedDrink.calories} cal</p>
            <p className="text-xs text-green-600">Calories</p>
          </CardContent>
        </Card>
        <Card className="border-green-200 text-center">
          <CardContent className="p-4">
            <Droplets className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <p className="text-sm text-green-700 font-medium">Fresh</p>
            <p className="text-xs text-green-600">Best Served</p>
          </CardContent>
        </Card>
      </div>

      {/* Shopping List */}
      <Card className="border-green-200">
        <CardHeader>
          <CardTitle className="text-green-800 flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Shopping List
          </CardTitle>
        </CardHeader>
        <CardContent>
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
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-green-800">Total Estimated Cost:</span>
            <span className="text-lg font-bold text-green-600">
              ${shoppingList.reduce((total, item) => total + parseFloat(item.price.replace('$', '')), 0).toFixed(2)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="border-green-200">
        <CardHeader>
          <CardTitle className="text-green-800">Instructions</CardTitle>
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
          <CardTitle className="text-green-800">Health Benefits</CardTitle>
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
          <CardTitle className="text-green-800">Pro Tips</CardTitle>
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
          Save Recipe
        </Button>
        <Button 
          onClick={generateDrink}
          variant="outline"
          className="border-green-300 text-green-700 hover:bg-green-50"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Generate New Version
        </Button>
      </div>
    </div>
  );
};

export default AIDrinkGeneration;
