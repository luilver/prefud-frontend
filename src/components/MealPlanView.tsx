
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, ChefHat, ArrowLeft, ShoppingCart, ChevronLeft, ChevronRight } from "lucide-react";

interface MealPlanViewProps {
  plan: any;
  onBack: () => void;
  onSelectMeal: (meal: any) => void;
  onGenerateShoppingList: (meals: any[]) => void;
}

const MealPlanView = ({ plan, onBack, onSelectMeal, onGenerateShoppingList }: MealPlanViewProps) => {
  const [currentWeek, setCurrentWeek] = useState(1);

  if (!plan) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">No meal plan selected</p>
      </div>
    );
  }

  const meals = plan.meals || [];
  const weekMeals = meals.filter((meal: any) => meal.week === currentWeek);
  
  // Group meals by day
  const mealsByDay = weekMeals.reduce((acc: any, meal: any) => {
    if (!acc[meal.day]) {
      acc[meal.day] = [];
    }
    acc[meal.day].push(meal);
    return acc;
  }, {});

  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleGenerateShoppingList = () => {
    onGenerateShoppingList(meals);
  };

  const goToPreviousWeek = () => {
    if (currentWeek > 1) {
      setCurrentWeek(currentWeek - 1);
    }
  };

  const goToNextWeek = () => {
    if (currentWeek < plan.numberOfWeeks) {
      setCurrentWeek(currentWeek + 1);
    }
  };

  const getCurrentWeekDateRange = () => {
    const startDate = new Date(plan.startDate);
    const weekStart = new Date(startDate);
    weekStart.setDate(startDate.getDate() + (currentWeek - 1) * 7);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    return {
      start: weekStart.toLocaleDateString(),
      end: weekEnd.toLocaleDateString()
    };
  };

  const weekDateRange = getCurrentWeekDateRange();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Meal Planner
        </Button>
        <h2 className="text-2xl font-bold text-gray-800">{plan.name}</h2>
        <Button 
          onClick={handleGenerateShoppingList}
          className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          Generate Shopping List
        </Button>
      </div>

      <Card className="bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Plan Overview
          </CardTitle>
          <CardDescription>
            {new Date(plan.startDate).toLocaleDateString()} - {new Date(plan.endDate).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{plan.numberOfWeeks}</div>
              <div className="text-sm text-gray-600">Weeks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{plan.numberOfPersons}</div>
              <div className="text-sm text-gray-600">Persons</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{plan.mealsPerDay}</div>
              <div className="text-sm text-gray-600">Meals/Day</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{meals.length}</div>
              <div className="text-sm text-gray-600">Total Meals</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Week Navigation */}
      <Card className="bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Week {currentWeek} of {plan.numberOfWeeks}</CardTitle>
              <CardDescription>
                {weekDateRange.start} - {weekDateRange.end}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPreviousWeek}
                disabled={currentWeek === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={goToNextWeek}
                disabled={currentWeek === plan.numberOfWeeks}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            {dayNames.map((dayName, dayIndex) => {
              const dayNumber = dayIndex + 1;
              const dayMeals = mealsByDay[dayNumber] || [];
              
              return (
                <div key={dayNumber} className="space-y-3">
                  <h3 className="font-semibold text-lg text-gray-800 border-b border-gray-200 pb-2">
                    {dayName}
                  </h3>
                  
                  {dayMeals.length > 0 ? (
                    <div className="grid gap-3">
                      {dayMeals.map((meal: any) => (
                        <div
                          key={meal.id}
                          className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors bg-white/50"
                          onClick={() => onSelectMeal(meal)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className="text-xs">
                                  {meal.type?.charAt(0).toUpperCase() + meal.type?.slice(1)}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {meal.difficulty}
                                </Badge>
                              </div>
                              <h4 className="font-semibold text-gray-800">{meal.name}</h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {meal.calories} cal
                              </p>
                              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {meal.prepTime}min
                                </div>
                                <div className="flex items-center gap-1">
                                  <Users className="h-4 w-4" />
                                  {meal.servings} serving{meal.servings > 1 ? 's' : ''}
                                </div>
                              </div>
                            </div>
                            <ChefHat className="h-5 w-5 text-gray-400" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-lg">
                      <p className="text-sm">No meals planned for this day</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {weekMeals.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No meals planned for this week</p>
        </div>
      )}
    </div>
  );
};

export default MealPlanView;
