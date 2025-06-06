import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, Users, Utensils, Plus, ChefHat, Sparkles } from "lucide-react";
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
  image?: string;
  ingredients: string[];
}

const MealPlanner = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState<"planner" | "creator" | "plan" | "recipe">("planner");
  const [currentPlan, setCurrentPlan] = useState<any>(null);
  const [selectedMeal, setSelectedMeal] = useState<any>(null);
  
  const [meals] = useState<Meal[]>([
    {
      id: "1",
      name: "Avocado Toast with Eggs",
      type: "breakfast",
      calories: 350,
      prepTime: 10,
      servings: 1,
      ingredients: ["Whole grain bread", "Avocado", "Eggs", "Salt", "Pepper"]
    },
    {
      id: "2",
      name: "Grilled Chicken Salad",
      type: "lunch",
      calories: 420,
      prepTime: 25,
      servings: 1,
      ingredients: ["Chicken breast", "Mixed greens", "Cherry tomatoes", "Cucumber", "Olive oil"]
    },
    {
      id: "3",
      name: "Salmon with Quinoa",
      type: "dinner",
      calories: 580,
      prepTime: 30,
      servings: 2,
      ingredients: ["Salmon fillet", "Quinoa", "Broccoli", "Lemon", "Garlic"]
    }
  ]);

  const weekDays = [];
  const startOfWeek = new Date(selectedDate);
  startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());

  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    weekDays.push(day);
  }

  const getMealsForDay = (date: Date) => {
    return meals;
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
    setCurrentPlan(plan);
    setView("plan");
  };

  const handleMealSelected = (meal: any) => {
    setSelectedMeal(meal);
    setView("recipe");
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

      {/* Week Navigator */}
      <Card className="bg-white/70 backdrop-blur-sm border-green-200">
        <CardContent className="p-6">
          <div className="grid grid-cols-7 gap-4">
            {weekDays.map((day, index) => (
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
              </div>
            ))}
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
              {getMealsForDay(selectedDate).map((meal) => (
                <div key={meal.id} className="p-4 bg-white/50 rounded-lg border border-green-100 hover:bg-white/70 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getMealTypeColor(meal.type)}`}>
                          {meal.type.charAt(0).toUpperCase() + meal.type.slice(1)}
                        </span>
                        <span className="text-sm text-gray-500">{meal.calories} cal</span>
                      </div>
                      <h4 className="font-semibold text-gray-800 mb-2">{meal.name}</h4>
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
                    <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700">
                      <ChefHat className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="mt-3 pt-3 border-t border-green-100">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Ingredients:</span> {meal.ingredients.join(', ')}
                    </p>
                  </div>
                </div>
              ))}

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
