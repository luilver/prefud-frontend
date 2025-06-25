
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Clock, Users, AlertTriangle, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AIMealSuggestionsProps {
  ingredients: any[];
  onAddMeal: (meal: any) => void;
}

const AIMealSuggestions = ({ ingredients, onAddMeal }: AIMealSuggestionsProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const { toast } = useToast();

  const getDaysUntilExpiry = (expiryDate: Date) => {
    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const generateSuggestions = async () => {
    setIsGenerating(true);
    
    try {
      // Get ingredients expiring soon (prioritize within 7 days)
      const expiringSoon = ingredients
        .filter(ing => getDaysUntilExpiry(ing.expiryDate) <= 7)
        .sort((a, b) => getDaysUntilExpiry(a.expiryDate) - getDaysUntilExpiry(b.expiryDate));

      // TODO: Replace with your AI service call
      console.log('Generating AI suggestions with ingredients:', expiringSoon);
      
      // Mock AI suggestions
      const mockSuggestions = [
        {
          id: Date.now().toString(),
          name: "Quick Chicken Stir Fry",
          description: "Use your expiring chicken breast and vegetables",
          prepTime: 15,
          difficulty: "easy",
          calories: 420,
          type: "dinner",
          usesExpiringIngredients: expiringSoon.slice(0, 3),
          ingredients: [
            "2 lbs Chicken Breast",
            "1 cup Mixed Vegetables",
            "2 tbsp Soy Sauce",
            "1 tbsp Oil"
          ],
          steps: [
            "Cut chicken into bite-sized pieces",
            "Heat oil in a large pan",
            "Add chicken and cook for 5-7 minutes",
            "Add vegetables and stir fry for 3-4 minutes",
            "Add soy sauce and serve"
          ]
        },
        {
          id: (Date.now() + 1).toString(),
          name: "Fresh Fruit Smoothie",
          description: "Perfect way to use bananas before they expire",
          prepTime: 5,
          difficulty: "easy",
          calories: 180,
          type: "breakfast",
          usesExpiringIngredients: expiringSoon.slice(1, 2),
          ingredients: [
            "6 pieces Bananas",
            "1 container Greek Yogurt",
            "1 cup Milk",
            "1 tbsp Honey"
          ],
          steps: [
            "Add all ingredients to blender",
            "Blend until smooth",
            "Serve immediately"
          ]
        }
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSuggestions(mockSuggestions);
      toast({
        title: "AI suggestions ready!",
        description: `Generated ${mockSuggestions.length} meal suggestions using your expiring ingredients.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate suggestions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddMeal = (meal: any) => {
    onAddMeal(meal);
    toast({
      title: "Meal added!",
      description: `${meal.name} has been added to your meal plan.`,
    });
  };

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-green-200">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-green-700">
          <Sparkles className="h-5 w-5" />
          <span>AI Meal Suggestions</span>
        </CardTitle>
        <CardDescription>
          Get personalized meal suggestions based on your expiring ingredients
        </CardDescription>
        {!suggestions.length && (
          <Button 
            onClick={generateSuggestions}
            disabled={isGenerating}
            className="bg-gradient-to-r from-green-500 to-orange-500 hover:from-green-600 hover:to-orange-600"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            {isGenerating ? 'Generating...' : 'Generate AI Suggestions'}
          </Button>
        )}
      </CardHeader>
      
      {suggestions.length > 0 && (
        <CardContent>
          <div className="space-y-4">
            {suggestions.map((meal) => (
              <Card key={meal.id} className="border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg text-orange-700">{meal.name}</CardTitle>
                      <CardDescription className="text-orange-600">
                        {meal.description}
                      </CardDescription>
                    </div>
                    <Button 
                      size="sm"
                      onClick={() => handleAddMeal(meal)}
                      className="bg-gradient-to-r from-green-500 to-orange-500 hover:from-green-600 hover:to-orange-600"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{meal.prepTime}min</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-3 w-3" />
                      <span className="capitalize">{meal.difficulty}</span>
                    </div>
                    <span>{meal.calories} cal</span>
                  </div>

                  {meal.usesExpiringIngredients?.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                      <span className="text-sm text-orange-600">Uses expiring:</span>
                      <div className="flex flex-wrap gap-1">
                        {meal.usesExpiringIngredients.map((ing: any, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs border-orange-300 text-orange-700">
                            {ing.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardHeader>
              </Card>
            ))}
            
            <Button 
              onClick={generateSuggestions}
              variant="outline"
              disabled={isGenerating}
              className="w-full border-green-200 text-green-700 hover:bg-green-50"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {isGenerating ? 'Generating...' : 'Generate More Suggestions'}
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default AIMealSuggestions;
