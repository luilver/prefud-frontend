import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Calendar,
  Users,
  ChefHat,
  Clock,
  Trash2,
  CheckCircle,
  Circle,
  Edit,
  ShoppingCart,
  Plus,
  ExternalLink,
  Package,
} from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { Checkbox } from "@/components/ui/checkbox";
import RecipeView from "./RecipeView";
import OrderOnlineModal from "./OrderOnlineModal";
import { useLanguage } from "@/contexts/LanguageContext"; // <-- Add this import
import {
  addIngredientsToPantry,
  updateMealConsumed,
  updatePantry,
} from "@/services/pantryService";

interface MealPlanViewProps {
  plan: any;
  onBack: () => void;
  onEdit: () => void;
}

const MealPlanView = ({ plan, onBack, onEdit }: MealPlanViewProps) => {
  console.log("this is the meal plan data:", plan);
  const {
    deleteMealFromPlan,
    toggleMealCompletion,
    isMealCompleted,
    addPantryItem,
  } = useUser();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedMeal, setSelectedMeal] = useState<any>(null);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const { t } = useLanguage(); // <-- Add this line
  const { pantryItems, user } = useUser();
  // Meal type order for sorting
  const mealTypeOrder = {
    breakfast: 1,
    lunch: 2,
    dinner: 3,
    snack: 4,
  };

  // Function to get day name and date

  // Function to get day name and date (UTC-safe)
  const getDayInfo = (dayIndex: number) => {
    console.log("this is the plan start date:", plan.startDate);

    // Parse the start date in UTC
    const startDate = new Date(plan.startDate);

    // Create a new date in UTC and add the dayIndex
    const currentDate = new Date(
      Date.UTC(
        startDate.getUTCFullYear(),
        startDate.getUTCMonth(),
        startDate.getUTCDate() + dayIndex
      )
    );

    const dayNames = [
      t("days.sunday") || "Sunday",
      t("days.monday") || "Monday",
      t("days.tuesday") || "Tuesday",
      t("days.wednesday") || "Wednesday",
      t("days.thursday") || "Thursday",
      t("days.friday") || "Friday",
      t("days.saturday") || "Saturday",
    ];

    const dayName = dayNames[currentDate.getUTCDay()]; // use UTC day
    const dateString = currentDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      timeZone: "UTC", // force UTC to avoid timezone shift
    });

    return {
      dayName,
      dateString,
      fullDate: currentDate,
    };
  };

  // Function to sort meals by type order
  const sortMealsByType = (meals: any[]) => {
    return meals.sort((a, b) => {
      const aOrder =
        mealTypeOrder[a.type?.toLowerCase() as keyof typeof mealTypeOrder] || 5;
      const bOrder =
        mealTypeOrder[b.type?.toLowerCase() as keyof typeof mealTypeOrder] || 5;
      return aOrder - bOrder;
    });
  };

  const handleDeleteMeal = (mealId: string) => {
    if (
      window.confirm(
        t("mealPlanView.confirmDelete") ||
          "Are you sure you want to delete this meal?"
      )
    ) {
      deleteMealFromPlan(plan.id, mealId);
    }
  };

  const handleToggleCompletion = (
    mealId: string,
    date: string,
    complete: boolean
  ) => {
    const dayParsed = date.replace("Day ", "");
    console.log(
      "meal completed and date to toggle:",
      mealId,
      dayParsed,
      complete
    );

    // change the completion status of the meal in the plan

    try {
      const responseUpdateMeal = updateMealConsumed(
        plan.id,
        mealId,
        complete,
        parseInt(dayParsed)
      );
      console.log("response from updating meal consumed:", responseUpdateMeal);
    } catch (error) {
      console.log("error updating meal consumed");
    }
    // implement the endpoin to update
    console.log("complete is true");
    toggleMealCompletion(mealId, date, complete);
    return;
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
    const totalItems = plan.shoppingList?.length || 0;
    setSelectAll(newCheckedItems.size === totalItems);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setCheckedItems(new Set());
      setSelectAll(false);
    } else {
      const allItemIds = new Set<string>(
        plan.shoppingList?.map((item: any) => item.id) || []
      );
      setCheckedItems(allItemIds);
      setSelectAll(true);
    }
  };

  const handleAddToPantry = async (items?: any[]) => {
    const itemsToAdd =
      items ||
      plan.shoppingList?.filter((item: any) => checkedItems.has(item.id)) ||
      [];

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
    console.log("items in the actual pantry:", pantryItems);
    console.log("new patry with added items:", [
      ...pantryItems,
      ...newPantryItems,
    ]);

    try {
      const responseUpdatePantry = await addIngredientsToPantry(user.id, [
        ...newPantryItems,
      ]);
      console.log("first response from update pantry:", responseUpdatePantry);
    } catch (error) {
      console.log("error updating pantry:", error);
    }

    // Clear checked items after adding
    setCheckedItems(new Set());
    setSelectAll(false);
  };

  const handleOrderOnline = (items?: any[]) => {
    const itemsToOrder =
      items ||
      plan.shoppingList?.filter((item: any) => checkedItems.has(item.id)) ||
      [];
    setOrderItems(itemsToOrder);
    setShowOrderModal(true);
  };

  // If a meal is selected, show the RecipeView
  if (selectedMeal) {
    return <RecipeView meal={selectedMeal} onBack={handleBackFromMeal} />;
  }

  // Calculate plan statistics with better fallbacks
  const totalDays =
    plan.preferences?.numberOfDays ||
    (plan.duration ? parseInt(plan.duration.replace(" days", "")) : 7);
  const peopleCount =
    plan.preferences?.numberOfPersons || plan.preferences?.people || 1;
  const mealsPerDay = plan.preferences?.mealsPerDay || 3;

  // Group meals by day - handle the actual data structure from your meal plan
  const mealsByDay = (() => {
    const groupedMeals: any = {};

    console.log("Plan structure:", plan);
    console.log("Plan meals:", plan.meals);

    // If meals are directly in the plan (your current structure)
    if (plan.meals && plan.meals.length > 0) {
      plan.meals.forEach((meal: any) => {
        // Map the meal day based on the date or day property
        let dayKey = "Day 1";

        if (meal.day) {
          dayKey = `Day ${meal.day}`;
        } else if (meal.date) {
          // Calculate day from date
          const startDate = plan.startDate;
          const mealDate = new Date(meal.date);
          const dayDiff =
            Math.floor(
              (mealDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
            ) + 1;
          dayKey = `Day ${dayDiff}`;
        } else if (meal.id && meal.id.includes("-")) {
          // Extract day from ID pattern like "1-0", "2-1", etc.
          const dayFromId = meal.id.split("-")[0];
          dayKey = `Day ${dayFromId}`;
        }

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

    // Sort meals within each day by meal type
    Object.keys(groupedMeals).forEach((dayKey) => {
      groupedMeals[dayKey] = sortMealsByType(groupedMeals[dayKey]);
    });

    console.log("Grouped meals by day:", groupedMeals);
    return groupedMeals;
  })();

  // Generate days array based on plan duration
  const days = Array.from(
    { length: totalDays },
    (_, index) => `Day ${index + 1}`
  );

  // Calculate shopping list stats
  const totalItems = plan.shoppingList?.length || 0;
  const checkedCount = checkedItems.size;
  const totalEstimatedCost =
    plan.shoppingList?.reduce(
      (total: number, item: any) => total + (item.estimatedPrice || 0),
      0
    ) || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} className="p-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">
              {plan.name}
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              {plan.startDate} - {new Date(plan.endDate).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={onEdit} variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            {t("mealPlanView.editPlan") || "Edit Plan"}
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
              <p className="text-xs sm:text-sm text-gray-600">
                {t("mealPlanView.days") || "Days"}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/70 backdrop-blur-sm">
          <CardContent className="flex flex-col sm:flex-row items-center justify-center sm:justify-start p-3 sm:p-6">
            <Users className="h-6 w-6 sm:h-8 sm:w-8 text-green-500 mb-2 sm:mb-0 sm:mr-3" />
            <div className="text-center sm:text-left">
              <p className="text-lg sm:text-2xl font-bold">{peopleCount}</p>
              <p className="text-xs sm:text-sm text-gray-600">
                {t("mealPlanView.persons") || "Persons"}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/70 backdrop-blur-sm">
          <CardContent className="flex flex-col sm:flex-row items-center justify-center sm:justify-start p-3 sm:p-6">
            <ChefHat className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500 mb-2 sm:mb-0 sm:mr-3" />
            <div className="text-center sm:text-left">
              <p className="text-lg sm:text-2xl font-bold">{mealsPerDay}</p>
              <p className="text-xs sm:text-sm text-gray-600">
                {t("mealPlanView.mealsPerDay") || "Meals/Day"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">
            {t("mealPlanView.mealSchedule") || "Meal Schedule"}
          </TabsTrigger>
          <TabsTrigger value="shopping">
            <ShoppingCart className="h-4 w-4 mr-2" />
            {t("mealPlanView.shoppingList") || "Shopping List"} ({totalItems})
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
                    {dayMeals.length} {t("mealPlanView.meal") || "meal"}
                    {dayMeals.length !== 1 ? "s" : ""}{" "}
                    {t("mealPlanView.planned") || "planned"}
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
                            className={`relative hover:shadow-md transition-all cursor-pointer ${
                              isCompleted
                                ? "bg-green-50 border-green-200"
                                : "hover:shadow-lg"
                            }`}
                            onClick={() => handleMealClick(meal)}
                          >
                            <CardHeader className="pb-3">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <CardTitle className="text-lg flex items-center gap-2">
                                    {meal.name}
                                    {isCompleted && (
                                      <CheckCircle className="h-4 w-4 text-green-500" />
                                    )}
                                  </CardTitle>
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    <Badge
                                      variant="secondary"
                                      className={`text-xs ${
                                        meal.type?.toLowerCase() === "breakfast"
                                          ? "bg-orange-100 text-orange-800"
                                          : meal.type?.toLowerCase() === "lunch"
                                          ? "bg-blue-100 text-blue-800"
                                          : meal.type?.toLowerCase() ===
                                            "dinner"
                                          ? "bg-purple-100 text-purple-800"
                                          : "bg-gray-100 text-gray-800"
                                      }`}
                                    >
                                      {meal.type || "Meal"}
                                    </Badge>
                                    {meal.cuisine && (
                                      <Badge
                                        variant="outline"
                                        className="text-xs"
                                      >
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
                                {meal.prepTime && (
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    <span>
                                      {meal.prepTime}{" "}
                                      {t("mealPlanView.min") || "min"}
                                    </span>
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
                                    {meal.calories}{" "}
                                    {t("mealPlanView.calories") || "calories"}
                                  </div>
                                )}
                              </div>

                              {meal.description && (
                                <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                                  {meal.description}
                                </p>
                              )}

                              <div className="flex items-center justify-between mt-4">
                                {meal.consumed ? (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleToggleCompletion(
                                          meal.id,
                                          day,
                                          false
                                        );
                                      }}
                                      className={`text-xs  "text-gray-500 hover:text-gray-700"
                                  `}
                                    >
                                      <>
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        {t("mealPlanView.completed") ||
                                          "Completed"}
                                      </>
                                    </Button>
                                  </>
                                ) : (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleToggleCompletion(
                                          meal.id,
                                          day,
                                          true
                                        );
                                      }}
                                      className={`text-xs ${"text-green-600 hover:text-green-700"}`}
                                    >
                                      <>
                                        <Circle className="h-3 w-3 mr-1" />
                                        {t("mealPlanView.markAsDone") ||
                                          "Mark as Done"}
                                      </>
                                    </Button>
                                  </>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <ChefHat className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>
                        {t("mealPlanView.noMealsPlanned") ||
                          "No meals planned for this day"}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="shopping" className="space-y-6">
          {plan.shoppingList && plan.shoppingList.length > 0 ? (
            <>
              {/* Shopping List Header with Summary */}
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5 text-blue-500" />
                        {t("mealPlanView.shoppingSummary") ||
                          "Shopping Summary"}
                      </CardTitle>
                      <CardDescription>
                        {totalItems} {t("mealPlanView.items") || "items"} •{" "}
                        {checkedCount}{" "}
                        {t("mealPlanView.selected") || "selected"}
                        {totalEstimatedCost > 0 &&
                          ` • $${totalEstimatedCost.toFixed(2)} ${
                            t("mealPlanView.estimated") || "estimated"
                          }`}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="select-all"
                        checked={selectAll}
                        onCheckedChange={handleSelectAll}
                      />
                      <label
                        htmlFor="select-all"
                        className="text-sm font-medium cursor-pointer"
                      >
                        {t("mealPlanView.selectAll") || "Select All"}
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
                        {t("mealPlanView.addToPantry") || "Add to Pantry"} (
                        {checkedCount})
                      </Button>
                      <Button
                        onClick={() => handleOrderOnline()}
                        className="flex items-center gap-2"
                      >
                        <ShoppingCart className="h-4 w-4" />
                        {t("mealPlanView.orderOnline") || "Order Online"} (
                        {checkedCount})
                      </Button>
                    </div>
                  </CardContent>
                )}
              </Card>

              {/* Shopping Items by Category */}
              {Object.entries(
                plan.shoppingList.reduce((acc: any, item: any) => {
                  const category = item.category || "Other";
                  if (!acc[category]) acc[category] = [];
                  acc[category].push(item);
                  return acc;
                }, {})
              ).map(([category, items]: [string, any]) => (
                <Card key={category}>
                  <CardHeader>
                    <CardTitle className="text-lg capitalize flex items-center justify-between">
                      <span>{category}</span>
                      <Badge variant="secondary">
                        {items.length} {t("mealPlanView.items") || "items"}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {items.map((item: any) => (
                        <div
                          key={item.id}
                          className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                            checkedItems.has(item.id)
                              ? "bg-blue-50 border-blue-200"
                              : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Checkbox
                              id={`item-${item.id}`}
                              checked={checkedItems.has(item.id)}
                              onCheckedChange={() => handleItemCheck(item.id)}
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
                                title={
                                  t("mealPlanView.addToPantryOne") ||
                                  "Add to Pantry"
                                }
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOrderOnline([item])}
                                className="h-8 w-8 p-0"
                                title={
                                  t("mealPlanView.orderOnlineOne") ||
                                  "Order Online"
                                }
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
                <p className="text-gray-600">
                  {t("mealPlanView.noShoppingList") ||
                    "No shopping list available for this meal plan"}
                </p>
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
