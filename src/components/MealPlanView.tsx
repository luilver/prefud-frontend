import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, Clock, Users, ChefHat, ArrowLeft, ShoppingCart, ChevronLeft, ChevronRight, Package, CheckCircle, Plus, Store } from "lucide-react";

interface MealPlanViewProps {
  plan: any;
  onBack: () => void;
  onSelectMeal: (meal: any) => void;
  onGenerateShoppingList: (meals: any[]) => void;
  onAddToPantry: (items: string[]) => void;
}

const MealPlanView = ({ plan, onBack, onSelectMeal, onGenerateShoppingList, onAddToPantry }: MealPlanViewProps) => {
  const [currentWeek, setCurrentWeek] = useState(1);
  const [showShoppingList, setShowShoppingList] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [showAddToPantryDialog, setShowAddToPantryDialog] = useState(false);

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
    console.log('Generating shopping list for plan:', plan.name);
    onGenerateShoppingList(meals);
    setShowShoppingList(true);
  };

  const handleItemCheck = (itemId: string, checked: boolean) => {
    setCheckedItems(prev => ({
      ...prev,
      [itemId]: checked
    }));
  };

  const handleBuyMyself = () => {
    const checkedItemNames = Object.entries(checkedItems)
      .filter(([_, isChecked]) => isChecked)
      .map(([itemId, _]) => {
        const item = plan.shoppingList?.find((item: any) => item.id === itemId);
        return item?.name;
      })
      .filter(Boolean);

    if (checkedItemNames.length > 0) {
      onAddToPantry(checkedItemNames);
      // Reset checkboxes after adding to pantry
      setCheckedItems({});
      alert(`${checkedItemNames.length} items added to your pantry!`);
    } else {
      alert('Please select items to add to your pantry.');
    }
  };

  const handleAddToPantry = () => {
    const checkedItemNames = Object.entries(checkedItems)
      .filter(([_, isChecked]) => isChecked)
      .map(([itemId, _]) => {
        const item = plan.shoppingList?.find((item: any) => item.id === itemId);
        return item?.name;
      })
      .filter(Boolean);

    if (checkedItemNames.length > 0) {
      onAddToPantry(checkedItemNames);
      // Reset checkboxes after adding to pantry
      setCheckedItems({});
      setShowAddToPantryDialog(false);
      alert(`${checkedItemNames.length} items added to your pantry!`);
    } else {
      alert('Please select items to add to your pantry.');
    }
  };

  const handleOrderOnline = () => {
    const checkedItemNames = Object.entries(checkedItems)
      .filter(([_, isChecked]) => isChecked)
      .map(([itemId, _]) => {
        const item = plan.shoppingList?.find((item: any) => item.id === itemId);
        return item?.name;
      })
      .filter(Boolean);

    if (checkedItemNames.length > 0) {
      alert(`Ordering ${checkedItemNames.length} items online...`);
      // Here you would integrate with delivery service
    } else {
      alert('Please select items to order online.');
    }
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
  const uncheckedItems = plan.shoppingList?.filter((item: any) => !checkedItems[item.id]) || [];

  if (showShoppingList && plan.shoppingList) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => setShowShoppingList(false)} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Meal Plan
          </Button>
          <h2 className="text-2xl font-bold text-gray-800">Shopping List - {plan.name}</h2>
          <div className="flex gap-2">
            <Dialog open={showAddToPantryDialog} onOpenChange={setShowAddToPantryDialog}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="border-green-300 text-green-700 hover:bg-green-50"
                >
                  <Store className="h-4 w-4 mr-2" />
                  Shop In-Store
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Items to Pantry</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-gray-600">
                    This will add all selected items from your shopping list to your pantry with default expiry dates.
                  </p>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm font-medium mb-2">Items to add: {uncheckedItems.length}</p>
                    <div className="text-sm text-gray-600">
                      {uncheckedItems.slice(0, 3).map((item: any) => item.name).join(', ')}
                      {uncheckedItems.length > 3 && ` +${uncheckedItems.length - 3} more`}
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <Button 
                      onClick={handleAddToPantry}
                      className="flex-1 bg-green-500 hover:bg-green-600"
                    >
                      Add to Pantry
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowAddToPantryDialog(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Button 
              variant="outline" 
              className="bg-blue-500 text-white hover:bg-blue-600"
              onClick={handleOrderOnline}
            >
              <Package className="h-4 w-4 mr-2" />
              Order Online
            </Button>
          </div>
        </div>

        <Card className="bg-white/70 backdrop-blur-sm border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-green-600" />
              Shopping List ({plan.shoppingList.length} items)
            </CardTitle>
            <CardDescription>
              Select ingredients to add to pantry or order online
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {plan.shoppingList.map((item: any) => (
                <div key={item.id} className="flex items-center space-x-3 p-4 bg-white/80 rounded-lg border border-green-100 hover:bg-white/90 transition-colors">
                  <Checkbox
                    id={item.id}
                    checked={checkedItems[item.id] || false}
                    onCheckedChange={(checked) => handleItemCheck(item.id, checked as boolean)}
                    className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-800">{item.name}</h4>
                        <p className="text-sm text-gray-600">
                          From: {item.mealName || 'Various meals'} • Qty: {item.quantity} {item.unit}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant={item.priority === 'high' ? 'destructive' : item.priority === 'medium' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {item.priority}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {item.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {plan.shoppingList.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No shopping list generated yet</p>
                <p className="text-sm">Go back and generate a shopping list from your meals</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

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

      {/* Enhanced Plan Overview Card */}
      <Card className="bg-gradient-to-br from-white/80 to-purple-50/80 backdrop-blur-sm border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-600" />
            Plan Overview
          </CardTitle>
          <CardDescription>
            {new Date(plan.startDate).toLocaleDateString()} - {new Date(plan.endDate).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-white/60 rounded-lg border border-purple-100">
              <div className="text-3xl font-bold text-purple-600 mb-1">{plan.numberOfWeeks}</div>
              <div className="text-sm text-gray-600 font-medium">Weeks</div>
            </div>
            <div className="text-center p-4 bg-white/60 rounded-lg border border-green-100">
              <div className="text-3xl font-bold text-green-600 mb-1">{plan.numberOfPersons}</div>
              <div className="text-sm text-gray-600 font-medium">Persons</div>
            </div>
            <div className="text-center p-4 bg-white/60 rounded-lg border border-blue-100">
              <div className="text-3xl font-bold text-blue-600 mb-1">{plan.mealsPerDay}</div>
              <div className="text-sm text-gray-600 font-medium">Meals/Day</div>
            </div>
            <div className="text-center p-4 bg-white/60 rounded-lg border border-orange-100">
              <div className="text-3xl font-bold text-orange-600 mb-1">{meals.length}</div>
              <div className="text-sm text-gray-600 font-medium">Total Meals</div>
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
