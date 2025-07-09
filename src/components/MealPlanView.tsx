
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Calendar, Clock, Users, Utensils, Trash2, Edit, ShoppingCart, CheckCircle, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/UserContext";
import RecipeView from "./RecipeView";

interface MealPlanViewProps {
  plan: any;
  onBack: () => void;
  onEdit: () => void;
}

const MealPlanView = ({ plan: initialPlan, onBack, onEdit }: MealPlanViewProps) => {
  const [selectedMeal, setSelectedMeal] = useState<any>(null);
  const [currentPlan, setCurrentPlan] = useState(initialPlan);
  const [viewingRecipe, setViewingRecipe] = useState<any>(null);
  const { deleteMealFromPlan, toggleMealCompletion, isMealCompleted, getMealPlanById } = useUser();
  const { toast } = useToast();

  // Refresh plan data when component mounts or when meal plans change
  useEffect(() => {
    const updatedPlan = getMealPlanById(initialPlan.id);
    if (updatedPlan) {
      console.log('Updated plan found:', updatedPlan);
      setCurrentPlan(updatedPlan);
    }
  }, [initialPlan.id, getMealPlanById]);

  // Listen for meal plan updates
  useEffect(() => {
    const handleStorageChange = () => {
      const updatedPlan = getMealPlanById(initialPlan.id);
      if (updatedPlan) {
        console.log('Plan updated from storage:', updatedPlan);
        setCurrentPlan(updatedPlan);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [initialPlan.id, getMealPlanById]);

  const plan = currentPlan;

  const getDaysInPlan = () => {
    const startDate = new Date(plan.startDate);
    const endDate = new Date(plan.endDate);
    const days = [];
    
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      days.push({
        date: currentDate.toISOString().split('T')[0],
        displayDate: new Date(currentDate),
        dayName: currentDate.toLocaleDateString('en-US', { weekday: 'long' }),
        dayNumber: currentDate.getDate(),
        month: currentDate.toLocaleDateString('en-US', { month: 'short' })
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  };

  const getMealsForDay = (date: string) => {
    if (!plan.meals || !Array.isArray(plan.meals)) {
      return [];
    }
    return plan.meals.filter((meal: any) => meal.date === date);
  };

  const handleDeleteMeal = (mealId: string) => {
    deleteMealFromPlan(plan.id, mealId);
    
    // Update local state immediately
    setCurrentPlan(prev => ({
      ...prev,
      meals: prev.meals.filter((meal: any) => meal.id !== mealId)
    }));
    
    toast({
      title: "Meal deleted",
      description: "The meal has been removed from your plan.",
    });
  };

  const handleToggleCompletion = (mealId: string, date: string) => {
    toggleMealCompletion(mealId, date);
    toast({
      title: isMealCompleted(mealId, date) ? "Meal marked as incomplete" : "Meal completed!",
      description: isMealCompleted(mealId, date) ? "Meal has been marked as not completed." : "Great job on completing your meal!",
    });
  };

  const handleViewRecipe = (meal: any) => {
    setViewingRecipe(meal);
  };

  const totalMeals = plan.meals?.length || 0;
  const completedMeals = plan.meals?.filter((meal: any) => 
    isMealCompleted(meal.id, meal.date)
  ).length || 0;

  const days = getDaysInPlan();

  if (viewingRecipe) {
    return <RecipeView meal={viewingRecipe} onBack={() => setViewingRecipe(null)} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Plans
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{plan.name}</h1>
            <p className="text-gray-600 mt-1">
              {new Date(plan.startDate).toLocaleDateString()} - {new Date(plan.endDate).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Plan
          </Button>
        </div>
      </div>

      {/* Plan Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Duration</p>
                <p className="font-semibold">{plan.duration || 'Custom'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Utensils className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Total Meals</p>
                <p className="font-semibold">{totalMeals}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="font-semibold">{completedMeals}/{totalMeals}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Meal Plan */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-800">Daily Meal Plan</h2>
        
        {days.map((day) => {
          const dayMeals = getMealsForDay(day.date);
          
          return (
            <Card key={day.date} className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <CardTitle className="text-lg text-purple-700">
                      {day.dayName}, {day.month} {day.dayNumber}
                    </CardTitle>
                    <CardDescription className="text-purple-600">
                      {dayMeals.length} meal{dayMeals.length !== 1 ? 's' : ''} planned
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="border-purple-200 text-purple-700">
                    {day.displayDate.toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {dayMeals.length > 0 ? (
                  <div className="space-y-4">
                    {dayMeals.map((meal: any, index: number) => (
                      <div key={meal.id || index}>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 rounded-lg border hover:border-purple-200 transition-colors">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 
                                className="font-medium text-gray-800 cursor-pointer hover:text-purple-600 break-words"
                                onClick={() => setSelectedMeal(meal)}
                              >
                                {meal.name}
                              </h3>
                              {meal.mealType === 'snack' && (
                                <Badge variant="secondary" className="text-xs">Snack</Badge>
                              )}
                              {isMealCompleted(meal.id, meal.date) && (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              )}
                            </div>
                            <p className="text-sm text-gray-600 break-words">{meal.description}</p>
                            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-gray-500">
                              {meal.prepTime && (
                                <div className="flex items-center space-x-1">
                                  <Clock className="h-3 w-3" />
                                  <span>{meal.prepTime}min</span>
                                </div>
                              )}
                              {meal.calories && <span>{meal.calories} cal</span>}
                              {meal.difficulty && <span className="capitalize">{meal.difficulty}</span>}
                            </div>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <Button
                              size="sm"
                              variant={isMealCompleted(meal.id, meal.date) ? "default" : "outline"}
                              onClick={() => handleToggleCompletion(meal.id, meal.date)}
                              className="text-xs"
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              {isMealCompleted(meal.id, meal.date) ? 'Done' : 'Mark Done'}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewRecipe(meal)}
                              className="text-xs"
                            >
                              Recipe
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedMeal(meal)}
                              className="text-xs"
                            >
                              View
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteMeal(meal.id)}
                              className="text-xs text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        {index < dayMeals.length - 1 && <Separator className="my-2" />}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Utensils className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No meals planned for this day</p>
                    <p className="text-sm">Add meals to your plan to get started</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Shopping List Section */}
      {plan.shoppingList && plan.shoppingList.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Shopping List
            </CardTitle>
            <CardDescription>
              Items needed for this meal plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {plan.shoppingList.map((item: any, index: number) => (
                <div key={item.id || index} className="flex items-center justify-between p-2 rounded border">
                  <span className="text-sm">{item.name}</span>
                  <span className="text-xs text-gray-500">{item.quantity} {item.unit}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Meal Detail Dialog */}
      <Dialog open={!!selectedMeal} onOpenChange={() => setSelectedMeal(null)}>
        <DialogContent className="w-[95vw] max-w-2xl mx-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="break-words">{selectedMeal?.name}</DialogTitle>
            <DialogDescription className="break-words">
              {selectedMeal?.description}
            </DialogDescription>
          </DialogHeader>
          
          {selectedMeal && (
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-4">
                {/* Meal Info */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  {selectedMeal.prepTime && (
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{selectedMeal.prepTime} minutes</span>
                    </div>
                  )}
                  {selectedMeal.calories && (
                    <div className="flex items-center space-x-1">
                      <Utensils className="h-4 w-4" />
                      <span>{selectedMeal.calories} calories</span>
                    </div>
                  )}
                  {selectedMeal.difficulty && (
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span className="capitalize">{selectedMeal.difficulty}</span>
                    </div>
                  )}
                </div>

                {/* Ingredients */}
                {selectedMeal.ingredients && selectedMeal.ingredients.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Ingredients</h4>
                    <div className="space-y-1">
                      {selectedMeal.ingredients.map((ingredient: any, index: number) => (
                        <div key={index} className="text-sm text-gray-600">
                          {typeof ingredient === 'string' ? ingredient : `${ingredient.quantity} ${ingredient.unit} ${ingredient.name}`}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Instructions */}
                {selectedMeal.instructions && selectedMeal.instructions.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Instructions</h4>
                    <ol className="space-y-2">
                      {selectedMeal.instructions.map((step: string, index: number) => (
                        <li key={index} className="text-sm text-gray-600">
                          <span className="font-medium text-purple-600">{index + 1}.</span> {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MealPlanView;
