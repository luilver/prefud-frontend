import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Clock, Users, Zap, Droplets, RefreshCw, Save } from "lucide-react";
import { toast } from "sonner";

interface AIDrinkGenerationProps {
  data: any;
  onUpdate: (key: string, value: any) => void;
  onDrinkCreated?: (drink: any) => void;
}

const AIDrinkGeneration = ({ data, onDrinkCreated }: AIDrinkGenerationProps) => {
  const [isGenerating, setIsGenerating] = useState(true);
  const [generatedDrink, setGeneratedDrink] = useState<any>(null);

  useEffect(() => {
    generateDrink();
  }, []);

  const generateDrink = () => {
    setIsGenerating(true);
    
    // Simulate AI generation
    setTimeout(() => {
      const drinkTypes = {
        smoothie: "Smoothie",
        juice: "Fresh Juice",
        tea: "Wellness Tea",
        protein: "Protein Shake",
        detox: "Detox Drink",
        energy: "Energy Boost"
      };

      const mockDrink = {
        name: `Healthy ${drinkTypes[data.type as keyof typeof drinkTypes] || 'Drink'}`,
        type: data.type,
        description: "A nutritious and delicious drink crafted specifically for your health goals and ingredient preferences.",
        prepTime: "5-10 minutes",
        servings: 1,
        calories: Math.floor(Math.random() * 200) + 100,
        ingredients: data.ingredients.map((ingredient: string) => ({
          name: ingredient,
          amount: ingredient.includes('Powder') || ingredient.includes('Seeds') ? '1 tbsp' : 
                 ingredient.includes('Milk') || ingredient === 'Water' ? '1 cup' : '1/2 cup'
        })),
        instructions: [
          "Add all ingredients to a blender",
          "Blend on high speed for 60-90 seconds until smooth",
          "Taste and adjust sweetness if needed",
          "Pour into a glass and serve immediately",
          "Garnish with fresh ingredients if desired"
        ],
        nutritionHighlights: data.goals.map((goal: string) => {
          const benefits: Record<string, string> = {
            'weight-loss': 'Low in calories, high in fiber for satiety',
            'energy': 'Natural sugars and B-vitamins for sustained energy',
            'immunity': 'Rich in vitamin C and antioxidants',
            'digestion': 'Contains fiber and digestive enzymes',
            'skin': 'Antioxidants and vitamins for skin health',
            'detox': 'Natural detoxifying compounds',
            'muscle': 'High protein content for muscle support',
            'stress': 'Adaptogens and calming nutrients'
          };
          return benefits[goal] || 'Supports overall health and wellness';
        }),
        tips: [
          "For best results, use fresh ingredients when possible",
          "Adjust liquid amount for desired consistency",
          "Can be stored in refrigerator for up to 24 hours"
        ]
      };

      setGeneratedDrink(mockDrink);
      setIsGenerating(false);
    }, 3000);
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
      <div className="text-center space-y-6">
        <div className="animate-spin mx-auto w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full"></div>
        <div>
          <h2 className="text-2xl font-bold text-green-800 mb-2">AI is Creating Your Drink</h2>
          <p className="text-green-600">Analyzing your preferences and ingredients to create the perfect healthy drink...</p>
        </div>
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
            <p className="text-sm text-green-700 font-medium">{generatedDrink.servings} serving</p>
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

      {/* Ingredients */}
      <Card className="border-green-200">
        <CardHeader>
          <CardTitle className="text-green-800">Ingredients</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {generatedDrink.ingredients.map((ingredient: any, index: number) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-green-700">{ingredient.name}</span>
                <span className="text-green-600 font-medium">{ingredient.amount}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="border-green-200">
        <CardHeader>
          <CardTitle className="text-green-800">Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2">
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

      {/* Nutrition Highlights */}
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

      {/* Tips */}
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
