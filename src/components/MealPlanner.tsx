import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, Users, Utensils, Plus, ChefHat, Sparkles, Check, Play, Trash2, CalendarDays } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import MealPlanCreator from "./MealPlanCreator";
import MealPlanView from "./MealPlanView";
import RecipeView from "./RecipeView";

interface Meal {
  id: string;
  name: string;
  type: "breakfast" | "lunch" | "dinner" | "snack";
  calories: number;
  prepTime: number;
  servings: number;
  difficulty: "easy" | "medium" | "hard";
  image?: string;
  ingredients: string[];
  instructions: string[];
}

const MealPlanner = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState<"planner" | "creator" | "plan" | "recipe">("planner");
  const [currentPlan, setCurrentPlan] = useState<any>(null);
  const [selectedMeal, setSelectedMeal] = useState<any>(null);
  const [activePlanId, setActivePlanId] = useState<string | null>(null);
  const { 
    toggleMealCompletion, 
    isMealCompleted, 
    updatePantryFromMeal,
    mealPlans = [],
    deleteMealPlan,
    deleteMealFromPlan,
    addMealPlan,
    setActiveShoppingList,
    updateMealPlanShoppingList,
    activeMealPlan,
    setActiveMealPlan
  } = useUser();
  
  const [meals] = useState<Meal[]>([
    {
      id: "1",
      name: "Avocado Toast with Eggs",
      type: "breakfast",
      calories: 350,
      prepTime: 10,
      servings: 1,
      difficulty: "easy",
      ingredients: ["2 slices whole grain bread", "1 ripe avocado", "2 eggs", "Salt to taste", "Black pepper", "Olive oil"],
      instructions: [
        "Toast the bread slices until golden brown",
        "Mash the avocado in a bowl with salt and pepper",
        "Heat olive oil in a pan and fry the eggs",
        "Spread mashed avocado on toast",
        "Top with fried eggs and serve immediately"
      ]
    },
    {
      id: "2",
      name: "Grilled Chicken Salad",
      type: "lunch",
      calories: 420,
      prepTime: 25,
      servings: 1,
      difficulty: "medium",
      ingredients: ["1 chicken breast", "2 cups mixed greens", "1 cup cherry tomatoes", "1/2 cucumber", "2 tbsp olive oil", "1 tbsp lemon juice"],
      instructions: [
        "Season chicken breast with salt and pepper",
        "Grill chicken for 6-7 minutes each side until cooked through",
        "Wash and prepare the vegetables",
        "Mix olive oil and lemon juice for dressing",
        "Slice chicken and serve over greens with dressing"
      ]
    },
    {
      id: "3",
      name: "Salmon with Quinoa",
      type: "dinner",
      calories: 580,
      prepTime: 30,
      servings: 2,
      difficulty: "medium",
      ingredients: ["2 salmon fillets", "1 cup quinoa", "2 cups broccoli florets", "1 lemon", "2 cloves garlic", "Olive oil"],
      instructions: [
        "Cook quinoa according to package instructions",
        "Steam broccoli until tender",
        "Season salmon with salt, pepper, and lemon juice",
        "Heat olive oil in a pan and cook salmon 4-5 minutes each side",
        "Serve salmon over quinoa with steamed broccoli"
      ]
    }
  ]);

  // Set default active plan on component mount
  useEffect(() => {
    if (mealPlans.length > 0 && !activePlanId) {
      const defaultPlan = mealPlans[0];
      setActivePlanId(defaultPlan.id);
      setActiveMealPlan(defaultPlan);
    }
  }, [mealPlans, activePlanId, setActiveMealPlan]);

  const weekDays = [];
  const startOfWeek = new Date(selectedDate);
  startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());

  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    weekDays.push(day);
  }

  const getMealsForDay = (date: Date) => {
    // Get meals from currently active meal plan for this date
    const activePlan = mealPlans.find(plan => plan.id === activePlanId);
    if (!activePlan) return meals;

    const planStart = new Date(activePlan.startDate);
    const planEnd = new Date(activePlan.endDate);
    
    if (date >= planStart && date <= planEnd) {
      return activePlan.meals || [];
    }
    
    return meals;
  };

  const handlePlanSelection = (planId: string) => {
    const selectedPlan = mealPlans.find(plan => plan.id === planId);
    if (selectedPlan) {
      setActivePlanId(planId);
      setActiveMealPlan(selectedPlan);
      console.log('Selected meal plan:', selectedPlan);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getMealTypeColor = (type: Meal['type']) => {
    switch (type) {
      case 'breakfast': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'lunch': return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'dinner': return 'bg-purple-100 border-purple-300 text-purple-800';
      case 'snack': return 'bg-green-100 border-green-300 text-green-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const handlePlanCreated = (plan: any) => {
    addMealPlan(plan);
    setCurrentPlan(plan);
    setActivePlanId(plan.id);
    setActiveMealPlan(plan);
    setView("plan");
  };

  const handleMealSelected = (meal: any) => {
    setSelectedMeal(meal);
    setView("recipe");
  };

  const handleGenerateShoppingList = (meals: any[]) => {
    console.log('Generating shopping list for meals:', meals);
    
    // Generate shopping list from meals
    const shoppingListItems = meals.reduce((acc: any[], meal: any) => {
      if (meal.ingredients && Array.isArray(meal.ingredients)) {
        const mealItems = meal.ingredients.map((ingredient: string) => ({
          id: `${meal.id}_${ingredient.replace(/\s+/g, '_')}`,
          name: ingredient,
          quantity: 1,
          unit: 'item',
          category: 'meal-ingredient',
          priority: 'medium' as const,
          purchased: false,
          mealId: meal.id,
          mealName: meal.name
        }));
        acc.push(...mealItems);
      }
      return acc;
    }, []);
    
    // Remove duplicates based on ingredient name
    const uniqueItems = shoppingListItems.filter((item, index, self) => 
      index === self.findIndex(t => t.name === item.name)
    );
    
    console.log('Generated shopping list items:', uniqueItems);
    
    // Update the current meal plan with the shopping list
    if (currentPlan) {
      updateMealPlanShoppingList(currentPlan.id, uniqueItems);
      const updatedPlan = {
        ...currentPlan,
        shoppingList: uniqueItems
      };
      setCurrentPlan(updatedPlan);
    }
  };

  const handleMealCompletion = (mealId: string, date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const wasCompleted = isMealCompleted(mealId, dateStr);
    
    toggleMealCompletion(mealId, dateStr);
    
    // If meal is being completed (not uncompleted), update pantry
    if (!wasCompleted) {
      const dayMeals = getMealsForDay(date);
      const meal = dayMeals.find(m => m.id === mealId);
      if (meal && meal.ingredients) {
        updatePantryFromMeal(meal.ingredients);
      }
    }
  };

  const checkMealCompletion = (mealId: string, date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return isMealCompleted(mealId, dateStr);
  };

  const getCompletedMealsForDay = (date: Date) => {
    const dayMeals = getMealsForDay(date);
    return (dayMeals || []).filter(meal => checkMealCompletion(meal.id, date)).length;
  };

  const handleDeleteMeal = (mealId: string) => {
    const activePlan = mealPlans.find(plan => plan.id === activePlanId);
    if (activePlan) {
      deleteMealFromPlan(activePlan.id, mealId);
    }
  };

  if (view === "creator") {
    return (
      <MealPlanCreator
        onPlanCreated={handlePlanCreated}
        onBack={() => setView("planner")}
      />
    );
  }

  if (view === "plan" && currentPlan) {
    return (
      <MealPlanView
        plan={currentPlan}
        onBack={() => setView("planner")}
        onSelectMeal={handleMealSelected}
        onGenerateShoppingList={handleGenerateShoppingList}
      />
    );
  }

  if (view === "recipe" && selectedMeal) {
    return (
      <RecipeView
        meal={selectedMeal}
        onBack={() => setView("plan")}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Weekly Meal Planner</h2>
          <p className="text-gray-600">Plan your meals for a healthier week</p>
        </div>
        <div className="flex space-x-3">
          <Button 
            onClick={() => setView("creator")}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            AI Meal Plan
          </Button>
          <Button className="bg-gradient-to-r from-green-500 to-orange-500 hover:from-green-600 hover:to-orange-600">
            <Plus className="h-4 w-4 mr-2" />
            Add Meal
          </Button>
        </div>
      </div>

      {/* Meal Plans List */}
      {mealPlans && mealPlans.length > 0 && (
        <Card className="bg-white/70 backdrop-blur-sm border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CalendarDays className="h-5 w-5 text-purple-600" />
              <span>Your Meal Plans</span>
            </CardTitle>
            <CardDescription>
              Select a meal plan to view and manage its shopping list. The selected plan's shopping list will be synchronized with the main shopping section.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(mealPlans || []).map((plan) => (
                <Card 
                  key={plan.id} 
                  className={`border-purple-100 hover:shadow-md transition-shadow cursor-pointer ${
                    activePlanId === plan.id ? 'ring-2 ring-purple-500 bg-purple-50' : ''
                  }`}
                  onClick={() => handlePlanSelection(plan.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{plan.name}</CardTitle>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteMealPlan(plan.id);
                        }}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="text-sm text-gray-600">
                      {new Date(plan.startDate).toLocaleDateString()} - {new Date(plan.endDate).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-purple-600">
                      {(plan.meals || []).length} meals planned
                      {activePlanId === plan.id && <span className="ml-2 text-green-600 font-semibold">(Active)</span>}
                    </div>
                    <div className="text-xs text-gray-500">
                      Shopping list: {(plan.shoppingList || []).length} items
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentPlan(plan);
                          setView("plan");
                        }}
                        className="flex-1"
                      >
                        View Plan
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Week Navigator */}
      <Card className="bg-white/70 backdrop-blur-sm border-green-200">
        <CardContent className="p-6">
          <div className="grid grid-cols-7 gap-4">
            {weekDays.map((day, index) => {
              const completedMeals = getCompletedMealsForDay(day);
              const totalMeals = getMealsForDay(day).length;
              
              return (
                <div
                  key={index}
                  className={`text-center p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                    isToday(day)
                      ? 'bg-gradient-to-r from-green-500 to-orange-500 text-white shadow-lg'
                      : 'bg-white/50 hover:bg-white/70 border border-green-100'
                  }`}
                  onClick={() => setSelectedDate(day)}
                >
                  <div className="font-semibold">{day.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                  <div className="text-sm">{day.getDate()}</div>
                  {/* Completion indicator */}
                  <div className="flex justify-center mt-1">
                    {completedMeals > 0 && (
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-xs">{completedMeals}/{totalMeals}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected Day Meals */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-white/70 backdrop-blur-sm border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-green-600" />
              <span>Meals for {formatDate(selectedDate)}</span>
            </CardTitle>
            <CardDescription>
              Your planned meals for the selected day
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(getMealsForDay(selectedDate) || []).map((meal) => {
                const isCompleted = checkMealCompletion(meal.id, selectedDate);
                return (
                  <div 
                    key={meal.id} 
                    className={`p-4 rounded-lg border transition-colors ${
                      isCompleted 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-white/50 border-green-100 hover:bg-white/70'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getMealTypeColor(meal.type)}`}>
                            {meal.type.charAt(0).toUpperCase() + meal.type.slice(1)}
                          </span>
                          <span className="text-sm text-gray-500">{meal.calories} cal</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleMealCompletion(meal.id, selectedDate)}
                            className={`h-6 w-6 p-0 rounded-full ${
                              isCompleted 
                                ? 'bg-green-500 text-white hover:bg-green-600' 
                                : 'border-2 border-green-300 hover:bg-green-50'
                            }`}
                          >
                            {isCompleted && <Check className="h-3 w-3" />}
                          </Button>
                        </div>
                        <h4 className={`font-semibold mb-2 ${isCompleted ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                          {meal.name}
                        </h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{meal.prepTime}min</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>{meal.servings} serving{meal.servings > 1 ? 's' : ''}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col space-y-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-green-600 hover:text-green-700 h-8"
                          onClick={() => handleMealSelected(meal)}
                        >
                          <ChefHat className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-blue-600 hover:text-blue-700 h-8"
                          onClick={() => handleMealSelected(meal)}
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700 h-8"
                          onClick={() => handleDeleteMeal(meal.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-green-100">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Ingredients:</span> {(meal.ingredients || []).slice(0, 3).join(', ')}
                        {(meal.ingredients || []).length > 3 && '...'}
                      </p>
                    </div>
                  </div>
                );
              })}

              {getMealsForDay(selectedDate).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Utensils className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No meals planned for this day</p>
                  <p className="text-sm">Add some meals to get started</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* AI Suggestions */}
        <Card className="bg-white/70 backdrop-blur-sm border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ChefHat className="h-5 w-5 text-orange-600" />
              <span>AI Meal Suggestions</span>
            </CardTitle>
            <CardDescription>
              Personalized recommendations based on your preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  name: "Mediterranean Bowl",
                  type: "lunch",
                  calories: 380,
                  tags: ["Heart-healthy", "High protein"]
                },
                {
                  name: "Overnight Oats",
                  type: "breakfast",
                  calories: 290,
                  tags: ["Quick", "Fiber-rich"]
                },
                {
                  name: "Veggie Stir-fry",
                  type: "dinner",
                  calories: 340,
                  tags: ["Vegetarian", "Low-calorie"]
                }
              ].map((suggestion, index) => (
                <div key={index} className="p-4 bg-white/50 rounded-lg border border-orange-100 hover:bg-white/70 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800">{suggestion.name}</h4>
                      <p className="text-sm text-gray-600">{suggestion.calories} calories</p>
                      <div className="flex space-x-2 mt-2">
                        {suggestion.tags.map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded-full border border-orange-200"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-50">
                      Add
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MealPlanner;
