import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Sparkles, Clock, Users, AlertTriangle, Plus, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/UserContext";

interface AIMealSuggestionsProps {
  ingredients: any[];
  onAddMeal: (meal: any, selectedDate?: Date) => void;
}

const AIMealSuggestions = ({ ingredients, onAddMeal }: AIMealSuggestionsProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [selectedDay, setSelectedDay] = useState<string>("");
  const [selectedMealPlan, setSelectedMealPlan] = useState<string>("");
  const [showDaySelector, setShowDaySelector] = useState<any>(null);
  const [showMealConflictDialog, setShowMealConflictDialog] = useState<any>(null);
  const [conflictResolution, setConflictResolution] = useState<'snack' | 'substitute'>('snack');
  const [mealToSubstitute, setMealToSubstitute] = useState<string>("");
  const { toast } = useToast();
  const { mealPlans, updateMealPlan, updatePantryFromIngredients } = useUser();

  const getDaysUntilExpiry = (expiryDate: Date) => {
    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getAvailableDaysForPlan = (planId: string) => {
    const plan = mealPlans.find(p => p.id === planId);
    if (!plan) return [];

    const startDate = new Date(plan.startDate);
    const endDate = new Date(plan.endDate);
    const days = [];
    
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      days.push({
        value: currentDate.toISOString().split('T')[0],
        label: currentDate.toLocaleDateString('en-US', { 
          weekday: 'long', 
          month: 'short', 
          day: 'numeric' 
        }),
        date: new Date(currentDate)
      });
      currentDate.setDate(currentDate.getDate() + 1);
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
      
      // Mock AI suggestions with proper ingredient quantities
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
            { name: "Chicken Breast", quantity: 2, unit: "lbs" },
            { name: "Mixed Vegetables", quantity: 1, unit: "cup" },
            { name: "Soy Sauce", quantity: 2, unit: "tbsp" },
            { name: "Oil", quantity: 1, unit: "tbsp" }
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
            { name: "Bananas", quantity: 6, unit: "pieces" },
            { name: "Greek Yogurt", quantity: 1, unit: "container" },
            { name: "Milk", quantity: 1, unit: "cup" },
            { name: "Honey", quantity: 1, unit: "tbsp" }
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
            { name: "Pasta", quantity: 8, unit: "oz" },
            { name: "Mixed Vegetables", quantity: 2, unit: "cups" },
            { name: "Olive Oil", quantity: 2, unit: "tbsp" },
            { name: "Garlic", quantity: 1, unit: "clove" }
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

  const getMealsForDate = (planId: string, date: string) => {
    const plan = mealPlans.find(p => p.id === planId);
    if (!plan) return [];
    
    return plan.meals.filter((meal: any) => meal.date === date) || [];
  };

  const handleAddMealWithDay = async (meal: any) => {
    if (!selectedDay || !selectedMealPlan) {
      toast({
        title: "Please select a day and meal plan",
        description: "Choose which meal plan and day to add this meal to.",
        variant: "destructive",
      });
      return;
    }

    const selectedDate = new Date(selectedDay);
    const existingMeals = getMealsForDate(selectedMealPlan, selectedDay);
    
    // Check if there are already 3 meals for this day
    if (existingMeals.length >= 3) {
      setShowMealConflictDialog(meal);
      return;
    }

    // Add meal directly if less than 3 meals
    await handleAddMealToPlan(meal, selectedMealPlan, selectedDate, 'meal');
  };

  const handleConflictResolution = async () => {
    if (!showMealConflictDialog || !selectedDay || !selectedMealPlan) return;

    const selectedDate = new Date(selectedDay);
    
    if (conflictResolution === 'snack') {
      await handleAddMealToPlan(showMealConflictDialog, selectedMealPlan, selectedDate, 'snack');
    } else if (conflictResolution === 'substitute' && mealToSubstitute) {
      await handleSubstituteMeal(showMealConflictDialog, selectedMealPlan, selectedDate, mealToSubstitute);
    }

    setShowMealConflictDialog(null);
    setConflictResolution('snack');
    setMealToSubstitute("");
  };

  const handleAddMealToPlan = async (meal: any, planId: string, date: Date, mealType: 'meal' | 'snack') => {
    console.log('Adding meal to plan:', { meal, planId, date, mealType });
    
    try {
      const dateString = date.toISOString().split('T')[0];
      const newMeal = {
        ...meal,
        id: `meal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        date: dateString,
        planId: planId,
        mealType: mealType,
        // Enhanced description with full date
        description: `${meal.description} - Planned for ${date.toLocaleDateString('en-US', { 
          weekday: 'long', 
          month: 'long', 
          day: 'numeric',
          year: 'numeric'
        })}`
      };

      // Find the current plan and update it
      const currentPlan = mealPlans.find(p => p.id === planId);
      if (!currentPlan) {
        throw new Error('Meal plan not found');
      }

      const updatedMeals = [...(currentPlan.meals || []), newMeal];
      
      // Update the meal plan in context
      updateMealPlan(planId, { meals: updatedMeals });
      
      // Update pantry by removing used ingredients
      if (meal.ingredients && Array.isArray(meal.ingredients)) {
        const ingredientNames = meal.ingredients.map((ing: any) => 
          typeof ing === 'string' ? ing : ing.name
        );
        updatePantryFromIngredients(ingredientNames);
      }
      
      // Also call the original callback
      onAddMeal(newMeal, date);
      
      const formattedDate = date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'short', 
        day: 'numeric' 
      });
      
      toast({
        title: `${mealType === 'snack' ? 'Snack' : 'Meal'} added successfully!`,
        description: `${meal.name} has been added to your meal plan for ${formattedDate}. Pantry ingredients have been updated.`,
      });
      
      setShowDaySelector(null);
      setSelectedDay("");
      setSelectedMealPlan("");
    } catch (error) {
      console.error('Error adding meal:', error);
      toast({
        title: "Error",
        description: "Failed to add meal to plan. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSubstituteMeal = async (newMeal: any, planId: string, date: Date, mealIdToReplace: string) => {
    console.log('Substituting meal:', { newMeal, planId, date, mealIdToReplace });
    
    try {
      const dateString = date.toISOString().split('T')[0];
      const substituteMeal = {
        ...newMeal,
        id: mealIdToReplace,
        date: dateString,
        planId: planId,
        mealType: 'meal',
        // Enhanced description with full date
        description: `${newMeal.description} - Planned for ${date.toLocaleDateString('en-US', { 
          weekday: 'long', 
          month: 'long', 
          day: 'numeric',
          year: 'numeric'
        })}`
      };

      // Find the current plan and update it
      const currentPlan = mealPlans.find(p => p.id === planId);
      if (!currentPlan) {
        throw new Error('Meal plan not found');
      }

      const updatedMeals = (currentPlan.meals || []).map((meal: any) => 
        meal.id === mealIdToReplace ? substituteMeal : meal
      );
      
      // Update the meal plan in context
      updateMealPlan(planId, { meals: updatedMeals });
      
      // Update pantry by removing used ingredients
      if (newMeal.ingredients && Array.isArray(newMeal.ingredients)) {
        const ingredientNames = newMeal.ingredients.map((ing: any) => 
          typeof ing === 'string' ? ing : ing.name
        );
        updatePantryFromIngredients(ingredientNames);
      }
      
      // Also call the original callback
      onAddMeal(substituteMeal, date);
      
      const formattedDate = date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'short', 
        day: 'numeric' 
      });
      
      toast({
        title: "Meal substituted successfully!",
        description: `${newMeal.name} has replaced the selected meal for ${formattedDate}. Pantry ingredients have been updated.`,
      });
      
      setShowDaySelector(null);
      setSelectedDay("");
      setSelectedMealPlan("");
    } catch (error) {
      console.error('Error substituting meal:', error);
      toast({
        title: "Error",
        description: "Failed to substitute meal. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleQuickAdd = (meal: any) => {
    // Update pantry by removing used ingredients
    if (meal.ingredients && Array.isArray(meal.ingredients)) {
      const ingredientNames = meal.ingredients.map((ing: any) => 
        typeof ing === 'string' ? ing : ing.name
      );
      updatePantryFromIngredients(ingredientNames);
    }
    
    onAddMeal(meal);
    toast({
      title: "Meal added!",
      description: `${meal.name} has been added to your meal plan. Pantry ingredients have been updated.`,
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
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-base sm:text-lg text-orange-700 break-words">{meal.name}</CardTitle>
                      <CardDescription className="text-orange-600 text-sm break-words">
                        {meal.description}
                      </CardDescription>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-2 shrink-0">
                      <Button 
                        size="sm"
                        variant="outline"
                        onClick={() => handleQuickAdd(meal)}
                        className="border-orange-300 text-orange-700 hover:bg-orange-50 text-xs sm:text-sm w-full sm:w-auto"
                      >
                        <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        Quick Add
                      </Button>
                      <Dialog open={showDaySelector === meal.id} onOpenChange={(open) => setShowDaySelector(open ? meal.id : null)}>
                        <DialogTrigger asChild>
                          <Button 
                            size="sm"
                            className="bg-gradient-to-r from-green-500 to-orange-500 hover:from-green-600 hover:to-orange-600 text-xs sm:text-sm w-full sm:w-auto"
                          >
                            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            Add to Day
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="w-[95vw] max-w-md mx-auto">
                          <DialogHeader>
                            <DialogTitle className="text-base sm:text-lg">Choose Day for {meal.name}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="meal-plan-select" className="text-sm">Select Meal Plan</Label>
                              <Select value={selectedMealPlan} onValueChange={(value) => {
                                setSelectedMealPlan(value);
                                setSelectedDay(""); // Reset day when plan changes
                              }}>
                                <SelectTrigger className="mt-1">
                                  <SelectValue placeholder="Choose a meal plan..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {mealPlans.map((plan) => (
                                    <SelectItem key={plan.id} value={plan.id}>
                                      {plan.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            {selectedMealPlan && (
                              <div>
                                <Label htmlFor="day-select" className="text-sm">Select Day</Label>
                                <Select value={selectedDay} onValueChange={setSelectedDay}>
                                  <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Choose a day..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {getAvailableDaysForPlan(selectedMealPlan).map((day) => (
                                      <SelectItem key={day.value} value={day.value}>
                                        {day.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
                            <div className="flex flex-col sm:flex-row justify-end gap-2">
                              <Button 
                                variant="outline" 
                                onClick={() => {
                                  setShowDaySelector(null);
                                  setSelectedDay("");
                                  setSelectedMealPlan("");
                                }}
                                className="text-sm w-full sm:w-auto"
                              >
                                Cancel
                              </Button>
                              <Button 
                                onClick={() => handleAddMealWithDay(meal)}
                                disabled={!selectedDay || !selectedMealPlan}
                                className="bg-gradient-to-r from-green-500 to-orange-500 hover:from-green-600 hover:to-orange-600 text-sm w-full sm:w-auto"
                              >
                                Add Meal
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
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
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="flex items-center space-x-2 shrink-0">
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                        <span className="text-sm text-orange-600">Uses expiring:</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {meal.usesExpiringIngredients.map((ing: any, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs border-orange-300 text-orange-700 break-all">
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
              className="w-full border-green-200 text-green-700 hover:bg-green-50 text-sm sm:text-base"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {isGenerating ? 'Generating...' : 'Generate More Suggestions'}
            </Button>
          </div>
        </CardContent>
      )}

      {/* Meal Conflict Resolution Dialog */}
      <Dialog open={!!showMealConflictDialog} onOpenChange={(open) => !open && setShowMealConflictDialog(null)}>
        <DialogContent className="w-[95vw] max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle>Day Already Has 3 Meals</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              This day already has 3 meals planned. How would you like to add "{showMealConflictDialog?.name}"?
            </p>
            
            <RadioGroup value={conflictResolution} onValueChange={(value: 'snack' | 'substitute') => setConflictResolution(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="snack" id="snack" />
                <Label htmlFor="snack">Add as a snack</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="substitute" id="substitute" />
                <Label htmlFor="substitute">Substitute an existing meal</Label>
              </div>
            </RadioGroup>

            {conflictResolution === 'substitute' && (
              <div>
                <Label htmlFor="meal-to-substitute" className="text-sm">Select meal to substitute</Label>
                <Select value={mealToSubstitute} onValueChange={setMealToSubstitute}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Choose a meal to replace..." />
                  </SelectTrigger>
                  <SelectContent>
                    {getMealsForDate(selectedMealPlan, selectedDay).map((meal: any, index: number) => (
                      <SelectItem key={meal.id || index} value={meal.id || `meal-${index}`}>
                        {meal.name || `Meal ${index + 1}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowMealConflictDialog(null)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleConflictResolution}
                disabled={conflictResolution === 'substitute' && !mealToSubstitute}
                className="bg-gradient-to-r from-green-500 to-orange-500 hover:from-green-600 hover:to-orange-600"
              >
                Confirm
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default AIMealSuggestions;
