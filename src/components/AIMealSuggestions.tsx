
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Sparkles, Clock, Users, AlertTriangle, Plus, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AIMealSuggestionsProps {
  ingredients: any[];
  onAddMeal: (meal: any, selectedDate?: Date) => void;
}

const AIMealSuggestions = ({ ingredients, onAddMeal }: AIMealSuggestionsProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [selectedDay, setSelectedDay] = useState<string>("");
  const [showDaySelector, setShowDaySelector] = useState<any>(null);
  const { toast } = useToast();

  const getDaysUntilExpiry = (expiryDate: Date) => {
    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getNextSevenDays = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push({
        value: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('en-US', { 
          weekday: 'long', 
          month: 'short', 
          day: 'numeric' 
        }),
        date: date
      });
    }
    
    return days;
  };

  const generateSuggestions = async () => {
    setIsGenerating(true);
    
    try {
      // Get ingredients expiring soon (prioritize within 7 days)
      const expiringSoon = ingredients
        .filter(ing => getDaysUntilExpiry(ing.expiryDate) <= 7)
        .sort((a, b) => getDaysUntilExpiry(a.expiryDate) - getDaysUntilExpiry(b.expiryDate));

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
        },
        {
          id: (Date.now() + 2).toString(),
          name: "Veggie Pasta Bowl",
          description: "Fresh pasta with your seasonal vegetables",
          prepTime: 20,
          difficulty: "easy",
          calories: 350,
          type: "lunch",
          usesExpiringIngredients: expiringSoon.slice(0, 2),
          ingredients: [
            "8 oz Pasta",
            "2 cups Mixed Vegetables",
            "2 tbsp Olive Oil",
            "1 clove Garlic"
          ],
          steps: [
            "Cook pasta according to package directions",
            "Sauté vegetables with garlic in olive oil",
            "Combine pasta and vegetables",
            "Season with herbs and serve"
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

  const handleAddMealWithDay = (meal: any) => {
    if (!selectedDay) {
      toast({
        title: "Please select a day",
        description: "Choose which day to add this meal to your plan.",
        variant: "destructive",
      });
      return;
    }

    const selectedDate = new Date(selectedDay);
    onAddMeal(meal, selectedDate);
    
    toast({
      title: "Meal added!",
      description: `${meal.name} has been added to your meal plan for ${selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}.`,
    });
    
    setShowDaySelector(null);
    setSelectedDay("");
  };

  const handleQuickAdd = (meal: any) => {
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
                    <div className="flex space-x-2">
                      <Button 
                        size="sm"
                        variant="outline"
                        onClick={() => handleQuickAdd(meal)}
                        className="border-orange-300 text-orange-700 hover:bg-orange-50"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Quick Add
                      </Button>
                      <Dialog open={showDaySelector === meal.id} onOpenChange={(open) => setShowDaySelector(open ? meal.id : null)}>
                        <DialogTrigger asChild>
                          <Button 
                            size="sm"
                            className="bg-gradient-to-r from-green-500 to-orange-500 hover:from-green-600 hover:to-orange-600"
                          >
                            <Calendar className="h-4 w-4 mr-1" />
                            Add to Day
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Choose Day for {meal.name}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="day-select">Select Day</Label>
                              <Select value={selectedDay} onValueChange={setSelectedDay}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Choose a day..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {getNextSevenDays().map((day) => (
                                    <SelectItem key={day.value} value={day.value}>
                                      {day.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex justify-end space-x-2">
                              <Button 
                                variant="outline" 
                                onClick={() => {
                                  setShowDaySelector(null);
                                  setSelectedDay("");
                                }}
                              >
                                Cancel
                              </Button>
                              <Button 
                                onClick={() => handleAddMealWithDay(meal)}
                                className="bg-gradient-to-r from-green-500 to-orange-500 hover:from-green-600 hover:to-orange-600"
                              >
                                Add Meal
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
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
