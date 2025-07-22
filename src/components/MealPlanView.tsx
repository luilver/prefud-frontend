
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Edit3, Calendar, Users, Clock, ChefHat, ShoppingCart, Trash2 } from "lucide-react";
import { useUser } from "@/contexts/UserContext";

interface MealPlanViewProps {
  plan: any;
  onBack: () => void;
  onEdit: () => void;
}

const MealPlanView = ({ plan, onBack, onEdit }: MealPlanViewProps) => {
  const { deleteMealFromPlan, deleteMealPlan, updateMealPlan, setActiveMealPlan } = useUser();
  const [currentPlan, setCurrentPlan] = useState(plan);

  useEffect(() => {
    setCurrentPlan(plan);
  }, [plan]);

  const handleDeleteMeal = (mealId: string) => {
    deleteMealFromPlan(currentPlan.id, mealId);
    const updatedMeals = currentPlan.meals.filter((meal: any) => meal.id !== mealId);
    setCurrentPlan({ ...currentPlan, meals: updatedMeals });
  };

  const handleDeletePlan = () => {
    if (confirm('Are you sure you want to delete this meal plan?')) {
      deleteMealPlan(currentPlan.id);
      onBack();
    }
  };

  const handleActivatePlan = () => {
    setActiveMealPlan(currentPlan);
    alert('Meal plan activated! Shopping list has been updated.');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDayOfWeek = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { weekday: 'long' });
  };

  // Group meals by day
  const groupMealsByDay = () => {
    const grouped: { [key: string]: any[] } = {};
    
    if (currentPlan.meals && currentPlan.meals.length > 0) {
      currentPlan.meals.forEach((meal: any) => {
        const date = meal.date || meal.scheduledDate;
        if (date) {
          if (!grouped[date]) {
            grouped[date] = [];
          }
          grouped[date].push(meal);
        }
      });
    }
    
    return grouped;
  };

  const mealsByDay = groupMealsByDay();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} className="p-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{currentPlan.name}</h1>
            <p className="text-gray-600 mt-1">
              {formatDate(currentPlan.startDate)} - {formatDate(currentPlan.endDate)}
            </p>
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button 
            onClick={handleActivatePlan}
            className="bg-green-500 hover:bg-green-600 text-white flex-1 sm:flex-none"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Activate Plan
          </Button>
          <Button onClick={onEdit} variant="outline" className="flex-1 sm:flex-none">
            <Edit3 className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button 
            onClick={handleDeletePlan} 
            variant="destructive" 
            className="flex-1 sm:flex-none"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Plan Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChefHat className="h-5 w-5 text-purple-500" />
            Plan Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm">
                <strong>Duration:</strong> {currentPlan.duration || `${currentPlan.preferences?.days || 'N/A'} days`}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-500" />
              <span className="text-sm">
                <strong>People:</strong> {currentPlan.preferences?.people || 'N/A'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm">
                <strong>Meals per day:</strong> {currentPlan.preferences?.mealsPerDay || 'N/A'}
              </span>
            </div>
          </div>
          
          {/* Display plan preferences */}
          {currentPlan.preferences && (
            <div className="mt-4 space-y-3">
              {currentPlan.preferences.dietaryRestrictions && currentPlan.preferences.dietaryRestrictions.length > 0 && (
                <div>
                  <span className="text-sm font-medium">Dietary Restrictions: </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {currentPlan.preferences.dietaryRestrictions.map((restriction: string) => (
                      <Badge key={restriction} variant="secondary" className="text-xs">
                        {restriction}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {currentPlan.preferences.allergies && currentPlan.preferences.allergies.length > 0 && (
                <div>
                  <span className="text-sm font-medium">Allergies: </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {currentPlan.preferences.allergies.map((allergy: string) => (
                      <Badge key={allergy} variant="destructive" className="text-xs">
                        {allergy}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {currentPlan.preferences.cuisinePreferences && currentPlan.preferences.cuisinePreferences.length > 0 && (
                <div>
                  <span className="text-sm font-medium">Cuisine Preferences: </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {currentPlan.preferences.cuisinePreferences.map((cuisine: string) => (
                      <Badge key={cuisine} variant="outline" className="text-xs">
                        {cuisine}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {currentPlan.preferences.cookingSkillLevel && (
                <div>
                  <span className="text-sm font-medium">Cooking Skill: </span>
                  <Badge variant="secondary" className="text-xs capitalize">
                    {currentPlan.preferences.cookingSkillLevel}
                  </Badge>
                </div>
              )}
              
              {currentPlan.preferences.mealPrepTime && (
                <div>
                  <span className="text-sm font-medium">Max Prep Time: </span>
                  <Badge variant="outline" className="text-xs">
                    {currentPlan.preferences.mealPrepTime} minutes
                  </Badge>
                </div>
              )}
              
              {currentPlan.preferences.budgetRange && (
                <div>
                  <span className="text-sm font-medium">Budget Range: </span>
                  <Badge variant="outline" className="text-xs capitalize">
                    {currentPlan.preferences.budgetRange}
                  </Badge>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Meals Content */}
      <Tabs defaultValue="schedule" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="schedule">Daily Schedule</TabsTrigger>
          <TabsTrigger value="shopping">Shopping List</TabsTrigger>
        </TabsList>
        
        <TabsContent value="schedule" className="space-y-4">
          {Object.keys(mealsByDay).length > 0 ? (
            Object.keys(mealsByDay).sort().map((date) => (
              <Card key={date}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {getDayOfWeek(date)} - {formatDate(date)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {mealsByDay[date].map((meal: any) => (
                      <div key={meal.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{meal.name}</h4>
                          <p className="text-sm text-gray-600">{meal.type}</p>
                          {meal.description && (
                            <p className="text-sm text-gray-500 mt-1">{meal.description}</p>
                          )}
                          <div className="flex flex-wrap gap-2 mt-2">
                            {meal.cookingTime && (
                              <Badge variant="outline" className="text-xs">
                                <Clock className="h-3 w-3 mr-1" />
                                {meal.cookingTime} min
                              </Badge>
                            )}
                            {meal.difficulty && (
                              <Badge variant="secondary" className="text-xs">
                                {meal.difficulty}
                              </Badge>
                            )}
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
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">No meals planned yet.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="shopping" className="space-y-4">
          {currentPlan.shoppingList && currentPlan.shoppingList.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Shopping List</CardTitle>
                <CardDescription>
                  {currentPlan.shoppingList.length} items needed for this meal plan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {currentPlan.shoppingList.map((item: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-3">
                        <span>{item.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {item.quantity} {item.unit}
                        </Badge>
                      </div>
                      {item.mealName && (
                        <span className="text-xs text-gray-500">
                          for {item.mealName}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">No shopping list generated yet.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MealPlanView;
