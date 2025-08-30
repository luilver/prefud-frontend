import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Calendar, Users, ChefHat, Clock, Trash2, CheckCircle, Circle, Edit, ShoppingCart, Plus, ExternalLink, Package } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { Checkbox } from "@/components/ui/checkbox";
import RecipeView from "./RecipeView";
import OrderOnlineModal from "./OrderOnlineModal";
import { useLanguage } from "@/contexts/LanguageContext"; // <-- Add this import
import { addIngredientsToPantry, updatePantry } from "@/services/pantryService";

interface MealPlanViewProps {
  plan: any;
  onBack: () => void;
  onEdit: () => void;
}

const MealPlanView = ({ plan, onBack, onEdit }: MealPlanViewProps) => {
  const { deleteMealFromPlan, toggleMealCompletion, isMealCompleted, addPantryItem } = useUser();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedMeal, setSelectedMeal] = useState<any>(null);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const { t } = useLanguage(); // <-- Add this line
const { pantryItems, user } = useUser();
  const mealTypeOrder = {
    desayuno: 1,
    breakfast: 1,
    almuerzo: 2,
    lunch: 2,
    cena: 3,
    dinner: 3,
    snack: 4,
    postre: 5,
    dessert: 5
  };

  // Function to get day name and date
  
  // Function to get day name and date (UTC-safe)
const getDayInfo = (dayIndex: number) => {
  const planStartDate = plan.start_date || plan.startDate;
  console.log('this is the plan start date:', planStartDate);

  // Parse the start date in UTC
  const startDate = new Date(planStartDate);
  
  // Create a new date in UTC and add the dayIndex
  const currentDate = new Date(Date.UTC(
    startDate.getUTCFullYear(),
    startDate.getUTCMonth(),
    startDate.getUTCDate() + dayIndex
  ));

  const dayNames = [
    t('days.sunday') || 'Sunday',
    t('days.monday') || 'Monday',
    t('days.tuesday') || 'Tuesday',
    t('days.wednesday') || 'Wednesday',
    t('days.thursday') || 'Thursday',
    t('days.friday') || 'Friday',
    t('days.saturday') || 'Saturday'
  ];

  const dayName = dayNames[currentDate.getUTCDay()]; // use UTC day
  const dateString = currentDate.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    timeZone: 'UTC'  // force UTC to avoid timezone shift
  });

  return {
    dayName,
    dateString,
    fullDate: currentDate
  };
};


  // Function to sort meals by type order
  const sortMealsByType = (meals: any[]) => {
    return meals.sort((a, b) => {
      const aType = (a.mealType || a.type)?.toLowerCase();
      const bType = (b.mealType || b.type)?.toLowerCase();
      const aOrder = mealTypeOrder[aType as keyof typeof mealTypeOrder] || 5;
      const bOrder = mealTypeOrder[bType as keyof typeof mealTypeOrder] || 5;
      return aOrder - bOrder;
    });
  };

  const handleDeleteMeal = (mealId: string) => {
    if (window.confirm(t('mealPlanView.confirmDelete') || 'Are you sure you want to delete this meal?')) {
      deleteMealFromPlan(plan.id, mealId);
    }
  };

  const handleToggleCompletion = (mealId: string, date: string) => {
    toggleMealCompletion(mealId, date);
  };

  const handleMealClick = (meal: any) => {
    setSelectedMeal(meal);
  };

  const handleBackFromMeal = () => {
    setSelectedMeal(null);
  };

  const handleItemCheck = (itemId: string) => {
    const newCheckedItems = new Set(checkedItems);
    if (newCheckedItems.has(itemId)) {
      newCheckedItems.delete(itemId);
    } else {
      newCheckedItems.add(itemId);
    }
    setCheckedItems(newCheckedItems);
    
    // Update select all state
    const shoppingList = plan.plan?.ingredientsList || plan.shoppingList || [];
    const totalItems = shoppingList.length || 0;
    setSelectAll(newCheckedItems.size === totalItems);
  };

  const handleSelectAll = () => {
    const shoppingList = plan.plan?.ingredientsList || plan.shoppingList || [];
    if (selectAll) {
      setCheckedItems(new Set());
      setSelectAll(false);
    } else {
      const allItemIds = new Set<string>(shoppingList.map((item: any) => item.name || item.id) || []);
      setCheckedItems(allItemIds);
      setSelectAll(true);
    }
  };

  const handleAddToPantry = async (items?: any[]) => {
    const shoppingList = plan.plan?.ingredientsList || plan.shoppingList || [];
    const itemsToAdd = items || shoppingList.filter((item: any) => checkedItems.has(item.name || item.id)) || [];
    
    const newPantryItems = [];
    itemsToAdd.forEach((ingredient) => {
        const newPantryItem = {
          id: `pantry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: ingredient.name,
          quantity: ingredient.quantity,
          unit: ingredient.unit,
          category: ingredient.category || "ingredient aqui",
          purchased: true,
          purchaseDate: new Date().toISOString(),
          carbonFootPrintToWaste: ingredient.carbonFootPrintToWaste || 0,
          daysToExpire: ingredient.daysToExpire || 7,
          expiryDate: new Date(
            Date.now() + ingredient.daysToExpire * 24 * 60 * 60 * 1000
          ).toISOString(),
          notes: `Carbon footprint:: ${ingredient.carbonFootPrintToWaste}`,
        };
        newPantryItems.push(newPantryItem);
        // setPantryItems(prev => [...prev, newPantryItem]);
        // console.log('pantry items after adding', [...pantryItems, newPantryItem]);
      });

    //add to the pantry to persiste the information in the database
    console.log("Items added to pantry:", newPantryItems);
    console.log('items in the actual pantry:', pantryItems);
    console.log('new patry with added items:', [...pantryItems, ...newPantryItems]);

    try {
      
      const responseUpdatePantry = await addIngredientsToPantry(user.id, [
         ...newPantryItems
        ]);
      console.log('first response from update pantry:', responseUpdatePantry);  
    } catch (error) {
      console.log('error updating pantry:', error);
    }



    // Clear checked items after adding
    setCheckedItems(new Set());
    setSelectAll(false);
  };

  const handleOrderOnline = (items?: any[]) => {
    const shoppingList = plan.plan?.ingredientsList || plan.shoppingList || [];
    const itemsToOrder = items || shoppingList.filter((item: any) => checkedItems.has(item.name || item.id)) || [];
    setOrderItems(itemsToOrder);
    setShowOrderModal(true);
  };

  // If a meal is selected, show the RecipeView
  if (selectedMeal) {
    return (
      <RecipeView 
        meal={selectedMeal} 
        onBack={handleBackFromMeal}
      />
    );
  }

  // Calculate plan statistics with better fallbacks
  const totalDays = plan.duration || 
                   plan.preferences?.numberOfDays || 
                   (plan.duration ? parseInt(plan.duration.replace(' days', '')) : 7);
  const peopleCount = plan.numberPeople || 
                     plan.preferences?.numberOfPersons || 
                     plan.preferences?.people || 1;
  const mealsPerDay = plan.mealsPerDay || 
                     plan.preferences?.mealsPerDay || 3;

  // Group meals by day - handle the new API structure
  const mealsByDay = (() => {
    const groupedMeals: any = {};
    
    console.log('Plan structure:', plan);
    
    // Handle new API structure with plan.plan.mealPlan
    if (plan.plan && plan.plan.mealPlan && Array.isArray(plan.plan.mealPlan)) {
      plan.plan.mealPlan.forEach((dayData: any) => {
        const dayKey = `Day ${dayData.day}`;
        if (dayData.meals && Array.isArray(dayData.meals)) {
          if (!groupedMeals[dayKey]) {
            groupedMeals[dayKey] = [];
          }
          groupedMeals[dayKey] = dayData.meals;
        }
      });
    }
    // Fallback for old structure
    else if (plan.meals && plan.meals.length > 0) {
      plan.meals.forEach((meal: any) => {
        let dayKey = 'Day 1';
        
        if (meal.day) {
          dayKey = `Day ${meal.day}`;
        } else if (meal.date) {
          const startDate = new Date(plan.start_date || plan.startDate);
          const mealDate = new Date(meal.date);
          const dayDiff = Math.floor((mealDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
          dayKey = `Day ${dayDiff}`;
        } else if (meal.id && meal.id.includes('-')) {
          const dayFromId = meal.id.split('-')[0];
          dayKey = `Day ${dayFromId}`;
        }
        
        if (!groupedMeals[dayKey]) {
          groupedMeals[dayKey] = [];
        }
        groupedMeals[dayKey].push(meal);
      });
    }
    
    // Sort meals within each day by meal type
    Object.keys(groupedMeals).forEach(dayKey => {
      groupedMeals[dayKey] = sortMealsByType(groupedMeals[dayKey]);
    });
    
    console.log('Grouped meals by day:', groupedMeals);
    return groupedMeals;
  })();

  // Generate days array based on plan duration
  const days = Array.from({ length: totalDays }, (_, index) => `Day ${index + 1}`);

  // Calculate shopping list stats
  const shoppingList = plan.plan?.ingredientsList || plan.shoppingList || [];
  const totalItems = shoppingList.length || 0;
  const checkedCount = checkedItems.size;
  const totalEstimatedCost = shoppingList.reduce((total: number, item: any) => 
    total + (item.estimatedPrice || 0), 0) || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} className="p-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">{plan.plan_name || plan.name}</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              {plan.start_date || plan.startDate} - {new Date((plan.start_date || plan.startDate) || Date.now()).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={onEdit} variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            {t('mealPlanView.editPlan') || 'Edit Plan'}
          </Button>
        </div>
      </div>

      {/* Plan Stats - Made more compact for mobile */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <Card className="bg-white/70 backdrop-blur-sm">
          <CardContent className="flex flex-col sm:flex-row items-center justify-center sm:justify-start p-3 sm:p-6">
            <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500 mb-2 sm:mb-0 sm:mr-3" />
            <div className="text-center sm:text-left">
              <p className="text-lg sm:text-2xl font-bold">{totalDays}</p>
              <p className="text-xs sm:text-sm text-gray-600">{t('mealPlanView.days') || 'Days'}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/70 backdrop-blur-sm">
          <CardContent className="flex flex-col sm:flex-row items-center justify-center sm:justify-start p-3 sm:p-6">
            <Users className="h-6 w-6 sm:h-8 sm:w-8 text-green-500 mb-2 sm:mb-0 sm:mr-3" />
            <div className="text-center sm:text-left">
              <p className="text-lg sm:text-2xl font-bold">{peopleCount}</p>
              <p className="text-xs sm:text-sm text-gray-600">{t('mealPlanView.persons') || 'Persons'}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/70 backdrop-blur-sm">
          <CardContent className="flex flex-col sm:flex-row items-center justify-center sm:justify-start p-3 sm:p-6">
            <ChefHat className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500 mb-2 sm:mb-0 sm:mr-3" />
            <div className="text-center sm:text-left">
              <p className="text-lg sm:text-2xl font-bold">{mealsPerDay}</p>
              <p className="text-xs sm:text-sm text-gray-600">{t('mealPlanView.mealsPerDay') || 'Meals/Day'}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">{t('mealPlanView.mealSchedule') || 'Meal Schedule'}</TabsTrigger>
          <TabsTrigger value="shopping">
            <ShoppingCart className="h-4 w-4 mr-2" />
            {t('mealPlanView.shoppingList') || 'Shopping List'} ({totalItems})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {days.map((day, dayIndex) => {
            const dayMeals = mealsByDay[day] || [];
            const { dayName, dateString } = getDayInfo(dayIndex);
            
            return (
              <Card key={day}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-500" />
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-semibold">{dayName}</span>
                      <Badge variant="outline" className="text-sm">
                        {dateString}
                      </Badge>
                    </div>
                  </CardTitle>
                  <CardDescription>
                    {dayMeals.length} {t('mealPlanView.meal') || 'meal'}{dayMeals.length !== 1 ? 's' : ''} {t('mealPlanView.planned') || 'planned'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {dayMeals.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {dayMeals.map((meal: any, mealIndex: number) => {
                        // Use the consumed field from the API instead of local completion check
                        const isCompleted = meal.consumed || false;
                        const mealType = meal.mealType || meal.type;
                        
                        return (
                          <Card 
                            key={`${meal.id}-${mealIndex}`} 
                            className={`relative hover:shadow-md transition-all cursor-pointer ${
                              isCompleted ? 'bg-green-50 border-green-200' : 'hover:shadow-lg'
                            }`}
                            onClick={() => handleMealClick(meal)}
                          >
                            <CardHeader className="pb-3">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <CardTitle className="text-lg flex items-center gap-2">
                                    {meal.name}
                                    {isCompleted && <CheckCircle className="h-4 w-4 text-green-500" />}
                                  </CardTitle>
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    <Badge 
                                      variant="secondary" 
                                      className={`text-xs ${
                                        mealType?.toLowerCase() === 'desayuno' || mealType?.toLowerCase() === 'breakfast' ? 'bg-orange-100 text-orange-800' :
                                        mealType?.toLowerCase() === 'almuerzo' || mealType?.toLowerCase() === 'lunch' ? 'bg-blue-100 text-blue-800' :
                                        mealType?.toLowerCase() === 'cena' || mealType?.toLowerCase() === 'dinner' ? 'bg-purple-100 text-purple-800' :
                                        mealType?.toLowerCase() === 'postre' || mealType?.toLowerCase() === 'dessert' ? 'bg-pink-100 text-pink-800' :
                                        'bg-gray-100 text-gray-800'
                                      }`}
                                    >
                                      {mealType || 'Meal'}
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
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteMeal(meal.id);
                                  }}
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
                                    <span>{meal.cookingTime} {t('mealPlanView.min') || 'min'}</span>
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
                                    {meal.calories} {t('mealPlanView.calories') || 'calories'}
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
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleCompletion(meal.id, day);
                                  }}
                                  className={`text-xs ${
                                    isCompleted 
                                      ? 'text-green-600 hover:text-green-700' 
                                      : 'text-gray-500 hover:text-gray-700'
                                  }`}
                                >
                                  {isCompleted ? (
                                    <>
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      {t('mealPlanView.completed') || 'Completed'}
                                    </>
                                  ) : (
                                    <>
                                      <Circle className="h-3 w-3 mr-1" />
                                      {t('mealPlanView.markAsComplete') || 'Mark as Complete'}
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
                      <p>{t('mealPlanView.noMealsPlanned') || 'No meals planned for this day'}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="shopping" className="space-y-6">
          {shoppingList && shoppingList.length > 0 ? (
            <>
              {/* Shopping List Header with Summary */}
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5 text-blue-500" />
                        {t('mealPlanView.shoppingSummary') || 'Shopping Summary'}
                      </CardTitle>
                      <CardDescription>
                        {totalItems} {t('mealPlanView.items') || 'items'} • {checkedCount} {t('mealPlanView.selected') || 'selected'}
                        {totalEstimatedCost > 0 && ` • $${totalEstimatedCost.toFixed(2)} ${t('mealPlanView.estimated') || 'estimated'}`}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="select-all"
                        checked={selectAll}
                        onCheckedChange={handleSelectAll}
                      />
                      <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
                        {t('mealPlanView.selectAll') || 'Select All'}
                      </label>
                    </div>
                  </div>
                </CardHeader>
                {checkedCount > 0 && (
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        onClick={() => handleAddToPantry()}
                        className="flex items-center gap-2"
                        variant="outline"
                      >
                        <Package className="h-4 w-4" />
                        {t('mealPlanView.addToPantry')|| 'Add to Pantry'} ({checkedCount})
                      </Button>
                      <Button
                        onClick={() => handleOrderOnline()}
                        className="flex items-center gap-2"
                      >
                        <ShoppingCart className="h-4 w-4" />
                        {t('mealPlanView.orderOnline') || 'Order Online'} ({checkedCount})
                      </Button>
                    </div>
                  </CardContent>
                )}
              </Card>

              {/* Shopping Items by Category */}
              {Object.entries(
                shoppingList.reduce((acc: any, item: any) => {
                  const category = item.classification || item.category || 'Other';
                  if (!acc[category]) acc[category] = [];
                  acc[category].push({
                    ...item,
                    id: item.name || item.id // Use name as ID for new structure
                  });
                  return acc;
                }, {})
              ).map(([category, items]: [string, any]) => (
                <Card key={category}>
                  <CardHeader>
                    <CardTitle className="text-lg capitalize flex items-center justify-between">
                      <span>{category}</span>
                      <Badge variant="secondary">{items.length} {t('mealPlanView.items') || 'items'}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {items.map((item: any) => (
                         <div 
                           key={item.name || item.id} 
                           className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                             checkedItems.has(item.name || item.id) 
                               ? 'bg-blue-50 border-blue-200' 
                               : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                           }`}
                         >
                           <div className="flex items-center gap-3">
                             <Checkbox
                               id={`item-${item.name || item.id}`}
                               checked={checkedItems.has(item.name || item.id)}
                               onCheckedChange={() => handleItemCheck(item.name || item.id)}
                             />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{item.name}</p>
                                {item.mealName && (
                                  <Badge variant="outline" className="text-xs">
                                    {item.mealName}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">
                                {item.quantity} {item.unit}
                                {item.notes && ` • ${item.notes}`}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {item.estimatedPrice && (
                              <div className="text-sm font-medium text-green-600">
                                ${item.estimatedPrice}
                              </div>
                            )}
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleAddToPantry([item])}
                                className="h-8 w-8 p-0"
                                title={t('mealPlanView.addToPantryOne') || "Add to Pantry"}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOrderOnline([item])}
                                className="h-8 w-8 p-0"
                                title={t('mealPlanView.orderOnlineOne') || "Order Online"}
                              >
                                <ShoppingCart className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">{t('mealPlanView.noShoppingList') || 'No shopping list available for this meal plan'}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Order Online Modal */}
      <OrderOnlineModal
        isOpen={showOrderModal}
        onClose={() => setShowOrderModal(false)}
        items={orderItems}
        mealPlanName={plan.name}
      />
    </div>
  );
};

export default MealPlanView;
