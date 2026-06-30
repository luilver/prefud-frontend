import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ArrowLeft,
  Calendar,
  ChefHat,
  Clock,
  CheckCircle,
  Circle,
  ShoppingCart,
  ShoppingBasket,
  Plus,
  Package,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUser } from "@/contexts/UserContext";
import { useCart } from "@/contexts/CartContext";
import { useAddToCart } from "@/hooks/useAddToCart";
import { useToast } from "@/hooks/use-toast";
import { addIngredientsToPantry, updateMealConsumed } from "@/services/pantryService";

interface MealPlanCalendarViewProps {
  plan: any;
  onBack: () => void;
  onMealClick: (meal: any) => void;
  mealsByDay: Record<string, any[]>;
  mealCompletionStatus: Record<string, boolean>;
  onToggleCompletion: (mealId: string, day: string, complete: boolean) => void;
  onDeleteMeal: (mealId: string) => void;
}

const MealPlanCalendarView = ({
  plan,
  onBack,
  onMealClick,
  mealsByDay,
  mealCompletionStatus,
  onToggleCompletion,
  onDeleteMeal,
}: MealPlanCalendarViewProps) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { pantryItems, user, isMealCompleted } = useUser();
  const { addItem } = useCart();
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [showShoppingList, setShowShoppingList] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  const totalDays =
    plan.preferences?.numberOfDays ||
    (plan.duration ? parseInt(plan.duration.replace(" days", "")) : 7);

  const startDate = new Date(plan.startDate);

  // Build calendar dates
  const calendarDates = Array.from({ length: totalDays }, (_, i) => {
    const date = new Date(
      Date.UTC(
        startDate.getUTCFullYear(),
        startDate.getUTCMonth(),
        startDate.getUTCDate() + i
      )
    );
    return {
      dayKey: `Day ${i + 1}`,
      date,
      dayNumber: i + 1,
      dayOfWeek: date.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" }),
      dateLabel: date.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" }),
      hasMeals: (mealsByDay[`Day ${i + 1}`] || []).length > 0,
      mealCount: (mealsByDay[`Day ${i + 1}`] || []).length,
    };
  });

  // Shopping list logic
  const shoppingList = plan.plan?.plan?.ingredientsList || plan.shoppingList || [];
  const totalItems = shoppingList.length;
  const checkedCount = checkedItems.size;

  const handleItemCheck = (itemId: string) => {
    const newCheckedItems = new Set(checkedItems);
    if (newCheckedItems.has(itemId)) {
      newCheckedItems.delete(itemId);
    } else {
      newCheckedItems.add(itemId);
    }
    setCheckedItems(newCheckedItems);
    setSelectAll(newCheckedItems.size === totalItems);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setCheckedItems(new Set());
      setSelectAll(false);
    } else {
      const allItemIds = new Set<string>(
        shoppingList.map((item: any, index: number) => item.id || item.name || index.toString())
      );
      setCheckedItems(allItemIds);
      setSelectAll(true);
    }
  };

  const handleAddToPantry = async (items?: any[]) => {
    const itemsToAdd = items || shoppingList.filter((item: any) => checkedItems.has(item.id || item.name)) || [];
    const newPantryItems = itemsToAdd.map((ingredient: any) => ({
      id: `pantry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: ingredient.name,
      quantity: ingredient.quantity,
      unit: ingredient.unit,
      category: ingredient.category || "ingredient",
      purchased: true,
      purchaseDate: new Date().toISOString(),
      carbonFootPrintToWaste: ingredient.carbonFootPrintToWaste || 0,
      daysToExpire: ingredient.daysToExpire || 7,
      expiryDate: new Date(Date.now() + (ingredient.daysToExpire || 7) * 24 * 60 * 60 * 1000).toISOString(),
      notes: `Carbon footprint:: ${ingredient.carbonFootPrintToWaste}`,
    }));

    try {
      await addIngredientsToPantry(user.id, newPantryItems);
      toast({ title: t("mealPlanView.addedToPantry") || "Added to Pantry", description: `${newPantryItems.length} items added.`, duration: 2000 });
    } catch (error) {
      toast({ title: "Error", description: "Failed to add items to pantry.", variant: "destructive" });
    }
    setCheckedItems(new Set());
    setSelectAll(false);
  };

  const handleAddToCart = (items?: any[]) => {
    const itemsToAdd = items || shoppingList.filter((item: any) => checkedItems.has(item.id || item.name)) || [];
    itemsToAdd.forEach((ingredient: any) => {
      addItem({
        name: ingredient.name,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
        category: ingredient.category || ingredient.classification || "Other",
      });
    });
    toast({ title: t("mealPlanView.addedToCart") || "Added to Cart", description: `${itemsToAdd.length} items added.`, duration: 2000 });
    setCheckedItems(new Set());
    setSelectAll(false);
  };

  // Meal type order
  const mealTypeOrder: Record<string, number> = { breakfast: 1, lunch: 2, dinner: 3, snack: 4 };

  // Shopping list view
  if (showShoppingList) {
    return (
      <div className="min-h-screen relative">
        <div className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1606923829579-0cb981a83e2e?q=80&w=2070&auto=format&fit=crop')` }}>
          <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-primary/70 to-accent/80" />
        </div>
        <div className="relative z-10 p-4 sm:p-6 lg:p-8 space-y-6">
          <div className="flex items-center gap-4 bg-primary/60 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <Button variant="ghost" onClick={() => setShowShoppingList(false)} className="p-2 text-white hover:bg-white/20 border border-white/20">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">{t("mealPlanView.shoppingList") || "Shopping List"}</h2>
              <p className="text-sm text-white/80">{plan.name}</p>
            </div>
          </div>

          {shoppingList.length > 0 ? (
            <>
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5 text-primary" />
                        {t("mealPlanView.shoppingSummary") || "Shopping Summary"}
                      </CardTitle>
                      <CardDescription>
                        {totalItems} {t("mealPlanView.items") || "items"} • {checkedCount} {t("mealPlanView.selected") || "selected"}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox id="cal-select-all" checked={selectAll} onCheckedChange={handleSelectAll} />
                      <label htmlFor="cal-select-all" className="text-sm font-medium cursor-pointer">
                        {t("mealPlanView.selectAll") || "Select All"}
                      </label>
                    </div>
                  </div>
                </CardHeader>
                {checkedCount > 0 && (
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-2">
                      <Button onClick={() => handleAddToPantry()} variant="outline" className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        {t("mealPlanView.addToPantry") || "Add to Pantry"} ({checkedCount})
                      </Button>
                      <Button onClick={() => handleAddToCart()} className="flex items-center gap-2">
                        <ShoppingCart className="h-4 w-4" />
                        {t("mealPlanView.addToCart") || "Add to Cart"} ({checkedCount})
                      </Button>
                    </div>
                  </CardContent>
                )}
              </Card>

              {(() => {
                const categorizedItems = Object.entries(
                  shoppingList.reduce((acc: any, item: any) => {
                    const category = item.classification || item.category || "Other";
                    if (!acc[category]) acc[category] = [];
                    acc[category].push(item);
                    return acc;
                  }, {})
                );
                const firstCategory = categorizedItems.length > 0 ? categorizedItems[0][0] : "";

                return (
                  <Accordion type="multiple" defaultValue={[firstCategory]} className="space-y-3">
                    {categorizedItems.map(([category, items]: [string, any]) => (
                      <AccordionItem key={category} value={category} className="border border-primary/20 rounded-xl overflow-hidden bg-white/95 backdrop-blur-sm shadow-sm">
                        <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-primary/5/50">
                          <div className="flex items-center justify-between w-full pr-2">
                            <span className="text-lg font-semibold capitalize text-gray-800">{category}</span>
                            <Badge variant="secondary" className="bg-primary/10 text-primary">
                              {items.length} {t("mealPlanView.items") || "items"}
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-4">
                          <div className="space-y-3 pt-2">
                            {items.map((item: any, index: number) => {
                              const itemId = item.id || item.name || `${category}-${index}`;
                              return (
                                <div key={itemId} className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${checkedItems.has(itemId) ? "bg-primary/5 border-primary/20" : "bg-gray-50 border-gray-200 hover:bg-gray-100"}`}>
                                  <div className="flex items-center gap-3">
                                    <Checkbox id={`cal-item-${itemId}`} checked={checkedItems.has(itemId)} onCheckedChange={() => handleItemCheck(itemId)} />
                                    <div className="flex-1">
                                      <p className="font-medium">{item.name}</p>
                                      <p className="text-sm text-gray-600">{item.quantity} {item.unit}</p>
                                    </div>
                                  </div>
                                  <div className="flex gap-1">
                                    <Button variant="ghost" size="sm" onClick={() => handleAddToPantry([item])} className="h-8 w-8 p-0" title={t("mealPlanView.addToPantryOne") || "Add to Pantry"}>
                                      <Plus className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => handleAddToCart([item])} className="h-8 w-8 p-0" title={t("mealPlanView.addToCartOne") || "Add to Cart"}>
                                      <ShoppingCart className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                );
              })()}
            </>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">{t("mealPlanView.noShoppingList") || "No shopping list available"}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  // Day detail view
  if (selectedDay) {
    const dayMeals = (mealsByDay[selectedDay] || []).sort((a: any, b: any) => {
      return (mealTypeOrder[a.type?.toLowerCase()] || 5) - (mealTypeOrder[b.type?.toLowerCase()] || 5);
    });
    const dayIndex = parseInt(selectedDay.replace("Day ", "")) - 1;
    const dayDate = calendarDates[dayIndex];

    return (
      <div className="min-h-screen relative">
        <div className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1606923829579-0cb981a83e2e?q=80&w=2070&auto=format&fit=crop')` }}>
          <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-primary/70 to-accent/80" />
        </div>
        <div className="relative z-10 p-4 sm:p-6 lg:p-8 space-y-6">
          <div className="flex items-center gap-4 bg-primary/60 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <Button variant="ghost" onClick={() => setSelectedDay(null)} className="p-2 text-white hover:bg-white/20 border border-white/20">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                {dayDate?.dayOfWeek}, {dayDate?.dateLabel}
              </h2>
              <p className="text-sm text-white/80">{dayMeals.length} {t("mealPlanView.meal") || "meal"}{dayMeals.length !== 1 ? "s" : ""}</p>
            </div>
          </div>

          {dayMeals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dayMeals.map((meal: any, mealIndex: number) => (
                <Card
                  key={`${meal.id}-${mealIndex}`}
                  className={`relative hover:shadow-md transition-all cursor-pointer ${mealCompletionStatus[meal.id] ? "bg-green-50 border-green-200" : "hover:shadow-lg"}`}
                  onClick={() => onMealClick(meal)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          {meal.name}
                          {mealCompletionStatus[meal.id] && <CheckCircle className="h-4 w-4 text-green-500" />}
                        </CardTitle>
                        <div className="flex flex-wrap gap-1 mt-2">
                          <Badge variant="secondary" className={`text-xs ${
                            meal.type?.toLowerCase() === "breakfast" ? "bg-orange-100 text-orange-800" :
                            meal.type?.toLowerCase() === "lunch" ? "bg-blue-100 text-blue-800" :
                            meal.type?.toLowerCase() === "dinner" ? "bg-purple-100 text-purple-800" : "bg-gray-100 text-gray-800"
                          }`}>
                            {meal.type || "Meal"}
                          </Badge>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onDeleteMeal(meal.id); }} className="text-red-500 hover:text-red-700 p-1 h-auto">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2 text-sm text-gray-600">
                      {meal.prepTime && (
                        <div className="flex items-center gap-2"><Clock className="h-4 w-4" /><span>{meal.prepTime} {t("mealPlanView.min") || "min"}</span></div>
                      )}
                      {meal.calories && (
                        <div className="text-xs text-orange-600">{meal.calories} {t("mealPlanView.calories") || "calories"}</div>
                      )}
                    </div>
                    {meal.description && <p className="text-sm text-gray-600 mt-3 line-clamp-2">{meal.description}</p>}
                    <div className="flex items-center justify-between mt-4">
                      {mealCompletionStatus[meal.id] || meal.consumed ? (
                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onToggleCompletion(meal.id, selectedDay, false); }} className="text-xs text-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />{t("mealPlanView.completed") || "Completed"}
                        </Button>
                      ) : (
                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onToggleCompletion(meal.id, selectedDay, true); }} className="text-xs text-gray-500">
                          <Circle className="h-3 w-3 mr-1" />{t("mealPlanView.markAsDone") || "Mark as Done"}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <ChefHat className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">{t("mealPlanView.noMealsPlanned") || "No meals planned for this day"}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  // Calendar grid view
  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1606923829579-0cb981a83e2e?q=80&w=2070&auto=format&fit=crop')` }}>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-primary/70 to-accent/80" />
      </div>
      <div className="relative z-10 p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-primary/60 backdrop-blur-sm rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onBack} className="p-2 text-white hover:bg-white/20 border border-white/20">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">{t("mealPlanView.calendarView") || "Calendar View"}</h1>
              <p className="text-sm text-white/80">{plan.name}</p>
            </div>
          </div>
          <Button
            onClick={() => setShowShoppingList(true)}
            className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm"
          >
            <ShoppingBasket className="h-4 w-4 mr-2" />
            {t("mealPlanView.shoppingList") || "Shopping List"} ({totalItems})
          </Button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {calendarDates.map((day) => {
            const dayMeals = mealsByDay[day.dayKey] || [];
            const completedMeals = dayMeals.filter((m: any) => mealCompletionStatus[m.id] || m.consumed).length;
            const allCompleted = dayMeals.length > 0 && completedMeals === dayMeals.length;

            return (
              <Card
                key={day.dayKey}
                className={`cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200 ${
                  allCompleted ? "bg-green-50 border-green-300" :
                  day.hasMeals ? "bg-white/95 border-primary/20" : "bg-white/70 border-gray-200"
                }`}
                onClick={() => setSelectedDay(day.dayKey)}
              >
                <CardContent className="p-3 text-center">
                  <p className="text-xs font-medium text-muted-foreground">{day.dayOfWeek}</p>
                  <p className="text-lg font-bold text-foreground mt-1">{day.date.getUTCDate()}</p>
                  <p className="text-xs text-muted-foreground">{day.date.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" })}</p>
                  {day.hasMeals ? (
                    <div className="mt-2">
                      <Badge variant="secondary" className={`text-xs ${allCompleted ? "bg-green-100 text-green-800" : "bg-primary/10 text-primary"}`}>
                        {allCompleted ? <CheckCircle className="h-3 w-3 mr-1" /> : null}
                        {day.mealCount} {t("mealPlanView.meal") || "meal"}{day.mealCount !== 1 ? "s" : ""}
                      </Badge>
                      {completedMeals > 0 && !allCompleted && (
                        <p className="text-xs text-green-600 mt-1">{completedMeals}/{dayMeals.length} ✓</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 mt-2">{t("mealPlanView.noMeals") || "No meals"}</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MealPlanCalendarView;
