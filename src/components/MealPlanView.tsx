
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Calendar, Users, ChefHat, Clock, Trash2, CheckCircle, Circle, Edit, ShoppingCart } from "lucide-react";
import { useUser } from "@/contexts/UserContext";

interface MealPlanViewProps {
  plan: any;
  onBack: () => void;
  onEdit: () => void;
}

const MealPlanView = ({ plan, onBack, onEdit }: MealPlanViewProps) => {
  const { deleteMealFromPlan, toggleMealCompletion, isMealCompleted } = useUser();
  const [activeTab, setActiveTab] = useState("overview");

  const handleDeleteMeal = (mealId: string) => {
    if (window.confirm('Are you sure you want to delete this meal?')) {
      deleteMealFromPlan(plan.id, mealId);
    }
  };

  const handleToggleCompletion = (mealId: string, date: string) => {
    toggleMealCompletion(mealId, date);
  };

  // Calculate plan statistics
  const totalDays = plan.duration ? parseInt(plan.duration.replace(' days', '')) : 
                   (plan.preferences?.numberOfDays || 7);
  const peopleCount = plan.preferences?.numberOfPersons || 
                     plan.preferences?.people || 
                     (plan.preferences && typeof plan.preferences.people === 'number' ? plan.preferences.people : 1);
  const mealsPerDay = plan.preferences?.mealsPerDay || 
                     (plan.preferences && typeof plan.preferences.mealsPerDay === 'number' ? plan.preferences.mealsPerDay : 3);

  // Group meals by day - handle both direct meals array and meals within weeks
  const mealsByDay = (() => {
    const groupedMeals: any = {};
    
    // If meals are directly in the plan
    if (plan.meals && plan.meals.length > 0) {
      plan.meals.forEach((meal: any) => {
        const dayKey = meal.day || 'Day 1';
        if (!groupedMeals[dayKey]) {
          groupedMeals[dayKey] = [];
        }
        groupedMeals[dayKey].push(meal);
      });
    }
    
    // If meals are within weeks structure
    if (plan.weeks && plan.weeks.length > 0) {
      plan.weeks.forEach((week: any) => {
        if (week.days && week.days.length > 0) {
          week.days.forEach((day: any, dayIndex: number) => {
            const dayKey = `Day ${dayIndex + 1}`;
            if (day.meals && day.meals.length > 0) {
              if (!groupedMeals[dayKey]) {
                groupedMeals[dayKey] = [];
              }
              groupedMeals[dayKey].push(...day.meals);
            }
          });
        }
      });
    }
    
    return groupedMeals;
  })();

  // Generate days array based on plan duration
  const days = Array.from({ length: totalDays }, (_, index) => `Day ${index + 1}`);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} className="p-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{plan.name}</h1>
            <p className="text-gray-600 mt-1">
              {new Date(plan.startDate).toLocaleDateString()} - {new Date(plan.endDate).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={onEdit} variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Edit Plan
          </Button>
        </div>
      </div>

      {/* Plan Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <Calendar className="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <p className="text-2xl font-bold">{totalDays}</p>
              <p className="text-gray-600">Days</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <Users className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <p className="text-2xl font-bold">{peopleCount}</p>
              <p className="text-gray-600">Persons</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <ChefHat className="h-8 w-8 text-purple-500 mr-3" />
            <div>
              <p className="text-2xl font-bold">{mealsPerDay}</p>
              <p className="text-gray-600">Meals/Day</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Meal Schedule</TabsTrigger>
          <TabsTrigger value="shopping">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Shopping List ({plan.shoppingList?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Days View */}
          {days.map((day) => {
            const dayMeals = mealsByDay[day] || [];
            
            return (
              <Card key={day}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-500" />
                    {day}
                  </CardTitle>
                  <CardDescription>
                    {dayMeals.length} meal{dayMeals.length !== 1 ? 's' : ''} planned
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {dayMeals.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {dayMeals.map((meal: any, mealIndex: number) => {
                        const isCompleted = isMealCompleted(meal.id, day);
                        
                        return (
                          <Card 
                            key={`${meal.id}-${mealIndex}`} 
                            className={`relative hover:shadow-md transition-shadow ${
                              isCompleted ? 'bg-green-50 border-green-200' : ''
                            }`}
                          >
                            <CardHeader className="pb-3">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <CardTitle className="text-lg flex items-center gap-2">
                                    {meal.name}
                                    {isCompleted && <CheckCircle className="h-4 w-4 text-green-500" />}
                                  </CardTitle>
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    <Badge variant="secondary" className="text-xs">
                                      {meal.type || 'Meal'}
                                    </Badge>
                                    {meal.cuisine && (
                                      <Badge variant="outline" className="text-xs">
                                        {meal.cuisine}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteMeal(meal.id)}
                                  className="text-red-500 hover:text-red-700 p-1 h-auto"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                              <div className="space-y-2 text-sm text-gray-600">
                                {meal.cookingTime && (
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    <span>{meal.cookingTime} min</span>
                                  </div>
                                )}
                                {meal.difficulty && (
                                  <div className="flex items-center gap-2">
                                    <ChefHat className="h-4 w-4" />
                                    <span>{meal.difficulty}</span>
                                  </div>
                                )}
                                {meal.calories && (
                                  <div className="text-xs text-orange-600">
                                    {meal.calories} calories
                                  </div>
                                )}
                              </div>
                              
                              {meal.description && (
                                <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                                  {meal.description}
                                </p>
                              )}
                              
                              <div className="flex items-center justify-between mt-4">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleToggleCompletion(meal.id, day)}
                                  className={`text-xs ${
                                    isCompleted 
                                      ? 'text-green-600 hover:text-green-700' 
                                      : 'text-gray-500 hover:text-gray-700'
                                  }`}
                                >
                                  {isCompleted ? (
                                    <>
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      Completed
                                    </>
                                  ) : (
                                    <>
                                      <Circle className="h-3 w-3 mr-1" />
                                      Mark as Done
                                    </>
                                  )}
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <ChefHat className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No meals planned for this day</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="shopping" className="space-y-4">
          {plan.shoppingList && plan.shoppingList.length > 0 ? (
            <div className="grid gap-4">
              {/* Group shopping items by category */}
              {Object.entries(
                plan.shoppingList.reduce((acc: any, item: any) => {
                  const category = item.category || 'Other';
                  if (!acc[category]) acc[category] = [];
                  acc[category].push(item);
                  return acc;
                }, {})
              ).map(([category, items]: [string, any]) => (
                <Card key={category}>
                  <CardHeader>
                    <CardTitle className="text-lg capitalize">{category}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {items.map((item: any, index: number) => (
                        <div key={`${item.id}-${index}`} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-gray-600">
                                {item.quantity} {item.unit}
                              </p>
                            </div>
                          </div>
                          {item.estimatedPrice && (
                            <div className="text-sm text-green-600 font-medium">
                              ${item.estimatedPrice}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">No shopping list available for this meal plan</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MealPlanView;
