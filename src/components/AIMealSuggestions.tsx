
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Sparkles, Clock, Users, AlertTriangle, Plus, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/UserContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { generateMealsFromPantry } from "@/services/pantryService";
import { Slider } from "@/components/ui/slider";

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
  const [showServingsModal, setShowServingsModal] = useState(false);
  const [servings, setServings] = useState(4);
  const { toast } = useToast();
  const { mealPlans, updateMealPlan, updatePantryFromIngredients, user } = useUser();
  const { language } = useLanguage();

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
          day: 'numeric',
          year: 'numeric'
        }),
        date: new Date(currentDate)
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  };

  // Reset day when meal plan changes
  useEffect(() => {
    if (selectedMealPlan) {
      setSelectedDay("");
    }
  }, [selectedMealPlan]);

  const generateSuggestions = async () => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "User not found. Please sign in again.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setShowServingsModal(false);
    
    try {
      const today = new Date();
      const startDate = today.toISOString().split('T')[0];
      
      // Map language context to API language
      const languageMap: Record<string, string> = {
        en: "english",
        es: "spanish",
        pt: "portuguese"
      };
      const apiLanguage = languageMap[language] || "english";

      console.log('Generating AI suggestions with params:', {
        userId: user.id,
        startDate,
        servings,
        language: apiLanguage
      });

      const response = await generateMealsFromPantry(
        user.id,
        startDate,
        servings,
        apiLanguage
      );

      // Handle error codes
      if (response.code === "03") {
        toast({
          title: "Subscription Limit Reached",
          description: response.message || "No generated meals available according to your subscription.",
          variant: "destructive",
        });
        return;
      }

      if (response.code === "02") {
        toast({
          title: "No Ingredients Found",
          description: response.message || "No ingredients found in pantry to generate meals.",
          variant: "destructive",
        });
        return;
      }

      // Process successful response
      if (response.generatedMeals && Array.isArray(response.generatedMeals)) {
        const transformedMeals = response.generatedMeals.map((meal: any) => ({
          id: `meal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: meal.name,
          description: meal.description,
          prepTime: meal.cookingTime,
          difficulty: "medium",
          calories: meal.calories,
          type: meal.mealType,
          benefits: meal.benefits,
          prepTip: meal.prepTip,
          carbonFootprint: meal.carbonFootprint,
          ingredients: meal.ingredientsList || [],
          steps: meal.steps || [],
          nutritionalInfo: meal.nutritionalInfo
        }));

        setSuggestions(transformedMeals);
        toast({
          title: "AI suggestions ready!",
          description: `Generated ${transformedMeals.length} meal suggestions. Total carbon footprint: ${response.totalCarbonFootprint}kg CO2.`,
        });
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error: any) {
      console.error('Error generating suggestions:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to generate suggestions. Please try again.",
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
        completed: false,
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
        completed: false,
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
          <>
            <Button 
              onClick={() => setShowServingsModal(true)}
              disabled={isGenerating}
              className="bg-gradient-to-r from-green-500 to-orange-500 hover:from-green-600 hover:to-orange-600"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {isGenerating ? 'Generating...' : 'Generate AI Suggestions'}
            </Button>

            <Dialog open={showServingsModal} onOpenChange={setShowServingsModal}>
              <DialogContent className="w-[95vw] max-w-md mx-auto">
                <DialogHeader>
                  <DialogTitle className="text-base sm:text-lg">Select Number of Servings</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <div className="space-y-3">
                    <Label htmlFor="servings-slider" className="text-sm">
                      Servings: <span className="font-bold text-primary">{servings}</span>
                    </Label>
                    <Slider
                      id="servings-slider"
                      min={1}
                      max={20}
                      step={1}
                      value={[servings]}
                      onValueChange={(value) => setServings(value[0])}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>1</span>
                      <span>20</span>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowServingsModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={generateSuggestions}
                    className="bg-gradient-to-r from-green-500 to-orange-500 hover:from-green-600 hover:to-orange-600"
                  >
                    Generate Meals
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
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
                              <Select value={selectedMealPlan} onValueChange={setSelectedMealPlan}>
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
