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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ArrowLeft,
  Calendar,
  CalendarDays,
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
  Baby,
  Smile,
  ChevronDown,
  Utensils,
  DollarSign,
  Globe,
  Target,
  AlertTriangle,
  ThumbsDown,
  Heart,
  Info,
} from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { Checkbox } from "@/components/ui/checkbox";
import RecipeView from "./RecipeView";
import MealPlanCalendarView from "./MealPlanCalendarView";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { useAddToCart } from "@/hooks/useAddToCart";
import {
  addIngredientsToPantry,
  updateMealConsumed,
  updatePantry,
} from "@/services/pantryService";
import { useToast } from "@/hooks/use-toast";

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
  const [showCalendarView, setShowCalendarView] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [mealCompletionStatus, setMealCompletionStatus] = useState<
    Record<string, boolean>
  >(() => {
    // Initialize with current consumed status from the plan
    const initialStatus: Record<string, boolean> = {};
    if (plan.plan?.plan?.mealPlan) {
      plan.plan.plan.mealPlan.forEach((dayPlan: any) => {
        dayPlan.meals?.forEach((meal: any) => {
          if (meal.id) {
            initialStatus[meal.id] = meal.consumed || false;
          }
        });
      });
    }
    return initialStatus;
  });
  const [detailsOpen, setDetailsOpen] = useState(false);
  const { t } = useLanguage();
  const { toast } = useToast();
  const { pantryItems, user } = useUser();
  const { addItem } = useCart();
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
        startDate.getUTCDate() + dayIndex,
      ),
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
          "Are you sure you want to delete this meal?",
      )
    ) {
      deleteMealFromPlan(plan.id, mealId);
    }
  };

  const handleToggleCompletion = async (
    mealId: string,
    date: string,
    complete: boolean,
  ) => {
    //update the status locally first
    plan.meals?.forEach((meal: any) => {
      if (meal.id === mealId) {
        meal.consumed = complete;
      }
    });

    const dayParsed = date.replace("Day ", "");
    console.log(
      "meal completed and date to toggle:",
      mealId,
      dayParsed,
      complete,
    );
    console.log("Current meal data before update:", plan.plan?.plan?.mealPlan);

    try {
      const responseUpdateMeal = await updateMealConsumed(
        plan.id,
        mealId,
        complete,
        parseInt(dayParsed),
      );
      console.log("response from updating meal consumed:", responseUpdateMeal);

      if (responseUpdateMeal?.success) {
        // Update local state to trigger re-render
        setMealCompletionStatus((prev) => ({
          ...prev,
          [mealId]: complete,
        }));

        // Show success toast
        toast({
          title: complete
            ? t("mealPlanView.mealCompleted") || "Meal completed!"
            : t("mealPlanView.mealUncompleted") || "Meal marked as not done",
          description: complete
            ? t("mealPlanView.mealCompletedDesc") ||
              "Great job on completing your meal!"
            : t("mealPlanView.mealUncompletedDesc") ||
              "Meal status updated successfully",
        });

        // Also call the existing toggle function for consistency
        toggleMealCompletion(mealId, date, complete);
      } else {
        throw new Error("Failed to update meal");
      }
    } catch (error) {
      console.log("error updating meal consumed:", error);

      // Show error toast
      toast({
        title: t("mealPlanView.updateError") || "Update failed",
        description:
          t("mealPlanView.updateErrorDesc") ||
          "Failed to update meal status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleMealClick = (meal: any) => {
    setSelectedMeal(meal);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
    const shoppingList =
      plan.plan?.plan?.ingredientsList || plan.shoppingList || [];
    const totalItems = shoppingList.length;
    setSelectAll(newCheckedItems.size === totalItems);
  };

  const handleSelectAll = () => {
    const shoppingList =
      plan.plan?.plan?.ingredientsList || plan.shoppingList || [];
    if (selectAll) {
      setCheckedItems(new Set());
      setSelectAll(false);
    } else {
      const allItemIds = new Set<string>(
        shoppingList.map(
          (item: any, index: number) =>
            item.id || item.name || index.toString(),
        ),
      );
      setCheckedItems(allItemIds);
      setSelectAll(true);
    }
  };

  const handleAddToPantry = async (items?: any[]) => {
    const shoppingList =
      plan.plan?.plan?.ingredientsList || plan.shoppingList || [];
    const itemsToAdd =
      items ||
      shoppingList.filter((item: any) =>
        checkedItems.has(item.id || item.name),
      ) ||
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
          Date.now() + ingredient.daysToExpire * 24 * 60 * 60 * 1000,
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

  const mealPlanIngredients =
    plan.plan?.plan?.ingredientsList || plan.shoppingList || [];

  // Convert checked item IDs to ingredient names for the hook
  const selectedIngredientNames = Array.from(checkedItems)
    .map((itemId) => {
      const item = mealPlanIngredients.find(
        (ingredient: any, index: number) =>
          (ingredient.id || ingredient.name || index.toString()) === itemId,
      );
      return item?.name;
    })
    .filter(Boolean);

  const { handleAddToCart: addToCartHook } = useAddToCart({
    ingredients: mealPlanIngredients.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      category: item.category || item.classification || "Other",
    })),
    selectedIngredients: selectedIngredientNames,
    onSuccess: () => {
      setCheckedItems(new Set());
      setSelectAll(false);
    },
  });

  const handleAddToCart = (items?: any[]) => {
    if (items) {
      // Handle single item addition
      items.forEach((ingredient) => {
        addItem({
          name: ingredient.name,
          quantity: ingredient.quantity,
          unit: ingredient.unit,
          category: ingredient.category || ingredient.classification || "Other",
        });
      });

      toast({
        title: t("mealPlanView.addedToCart") || "Added to Cart",
        description: `${items.length} ${t("mealPlanView.itemsAddedToCart") || "items added to your shopping cart"}.`,
        duration: 2000,
      });
    } else {
      // Use the hook for selected items
      addToCartHook();
    }
  };

  // Calculate plan statistics with better fallbacks
  const totalDays =
    plan.preferences?.numberOfDays ||
    (plan.duration ? parseInt(plan.duration.replace(" days", "")) : 7);
  const peopleCount =
    plan.preferences?.numberOfPersons || plan.preferences?.people || 1;
  const mealsPerDay = plan.preferences?.mealsPerDay || 3;
  const kidsBelow5 = plan.preferences?.kidsbelow5 || plan.plan?.numberKidsLessThan5 || 0;
  const kidsOver5 = plan.preferences?.kidsover5 || plan.plan?.numberKids5To12 || 0;
  const dietaryRestrictions = plan.plan?.dietaryRestrictions || plan.preferences?.dietaryRestrictions || [];
  const cuisinePreferences = plan.plan?.cuisinePreferences || plan.preferences?.cuisinePreferences || [];
  const allergies = plan.plan?.allergiesIntolerance || plan.preferences?.allergies || [];
  const dislikes = plan.plan?.dislikes || plan.preferences?.dislikes || "";
  const maxCookingTime = plan.plan?.maxCookingTime || plan.preferences?.maxCookingTime || 0;
  const cookingSkillLevel = plan.plan?.cookingSkillLevel || plan.preferences?.cookingSkillLevel || "";
  const budgetRange = plan.plan?.budgetRange || plan.preferences?.budgetRange || "";
  const planLanguage = plan.plan?.language || plan.preferences?.language || "";
  const healthGoals = plan.plan?.healthGoals || plan.preferences?.healthGoals || [];

  // Group meals by day - handle the actual data structure from your meal plan
  const mealsByDay = (() => {
    const groupedMeals: any = {};

    console.log("Plan structure:", plan);
    console.log("Plan meals:", plan.meals);

    // Handle the new API structure: plan.plan.plan.mealPlan
    if (plan.plan?.plan?.mealPlan && plan.plan.plan.mealPlan.length > 0) {
      plan.plan.plan.mealPlan.forEach((dayPlan: any) => {
        const dayKey = `Day ${dayPlan.day}`;
        if (!groupedMeals[dayKey]) {
          groupedMeals[dayKey] = [];
        }
        if (dayPlan.meals && dayPlan.meals.length > 0) {
          groupedMeals[dayKey].push(...dayPlan.meals);
        }
      });
    }
    // If meals are directly in the plan (your old structure)
    else if (plan.meals && plan.meals.length > 0) {
      plan.meals.forEach((meal: any) => {
        let dayKey = "Day 1";
        if (meal.day) {
          dayKey = `Day ${meal.day}`;
        } else if (meal.date) {
          const startDate = plan.startDate;
          const mealDate = new Date(meal.date);
          const dayDiff =
            Math.floor(
              (mealDate.getTime() - startDate.getTime()) /
                (1000 * 60 * 60 * 24),
            ) + 1;
          dayKey = `Day ${dayDiff}`;
        } else if (meal.id && meal.id.includes("-")) {
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
    else if (plan.weeks && plan.weeks.length > 0) {
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
    (_, index) => `Day ${index + 1}`,
  );

  // Calculate shopping list stats
  const shoppingList =
    plan.plan?.plan?.ingredientsList || plan.shoppingList || [];
  const totalItems = shoppingList.length;
  const checkedCount = checkedItems.size;
  const totalEstimatedCost =
    shoppingList.reduce(
      (total: number, item: any) => total + (item.estimatedPrice || 0),
      0,
    ) || 0;

  // If a meal is selected, show the RecipeView (takes priority over calendar)
  if (selectedMeal) {
    return (
      <RecipeView meal={selectedMeal} plan={plan} onBack={handleBackFromMeal} />
    );
  }

  // If calendar view is active, show the calendar
  if (showCalendarView) {
    return (
      <MealPlanCalendarView
        plan={plan}
        onBack={() => setShowCalendarView(false)}
        onMealClick={handleMealClick}
        mealsByDay={mealsByDay}
        mealCompletionStatus={mealCompletionStatus}
        onToggleCompletion={handleToggleCompletion}
        onDeleteMeal={handleDeleteMeal}
      />
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* Food-themed Background */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1606923829579-0cb981a83e2e?q=80&w=2070&auto=format&fit=crop')`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/80 via-emerald-800/70 to-teal-900/80" />
      </div>

      <div className="relative z-10 p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-emerald-900/60 backdrop-blur-sm rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={onBack}
              className="p-2 text-white hover:bg-white/20 border border-white/20"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white drop-shadow-lg">
                {plan.name}
              </h1>
              <p className="text-sm sm:text-base text-white/90 mt-1 font-medium drop-shadow">
                {plan.startDate} - {new Date(plan.endDate).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowCalendarView(true)}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white"
            >
              <CalendarDays className="h-4 w-4 mr-2" />
              {t("mealPlanView.calendarView") || "Calendar View"}
            </Button>
          </div>
        </div>

        {/* Plan Details - Collapsible */}
        <Collapsible open={detailsOpen} onOpenChange={setDetailsOpen}>
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
            <CollapsibleTrigger className="w-full">
              <CardContent className="flex items-center justify-between p-4 cursor-pointer hover:bg-black/5 transition-colors rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500">
                    <Info className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-800">{t("mealPlanView.planDetails") || "Plan Details"}</p>
                    <p className="text-xs text-gray-500">
                      {totalDays} {t("mealPlanView.days") || "days"} · {peopleCount} {t("mealPlanView.persons") || "persons"} · {mealsPerDay} {t("mealPlanView.mealsPerDay") || "meals/day"}
                    </p>
                  </div>
                </div>
                <ChevronDown className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${detailsOpen ? 'rotate-180' : ''}`} />
              </CardContent>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="px-4 pb-4 space-y-4">
                <div className="h-px bg-gray-200" />
                
                {/* Main Stats Row */}
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                  <div className="flex flex-col items-center gap-1 p-3 rounded-xl bg-blue-50">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <span className="text-lg font-bold text-gray-800">{totalDays}</span>
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider">{t("mealPlanView.days") || "Days"}</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 p-3 rounded-xl bg-emerald-50">
                    <Users className="h-5 w-5 text-emerald-600" />
                    <span className="text-lg font-bold text-gray-800">{peopleCount}</span>
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider">{t("mealPlanView.persons") || "People"}</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 p-3 rounded-xl bg-amber-50">
                    <Utensils className="h-5 w-5 text-amber-600" />
                    <span className="text-lg font-bold text-gray-800">{mealsPerDay}</span>
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider">{t("mealPlanView.mealsPerDay") || "Meals/Day"}</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 p-3 rounded-xl bg-pink-50">
                    <Baby className="h-5 w-5 text-pink-500" />
                    <span className="text-lg font-bold text-gray-800">{kidsBelow5}</span>
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider">{t("mealPlanView.kidsUnder5") || "Kids < 5"}</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 p-3 rounded-xl bg-violet-50">
                    <Smile className="h-5 w-5 text-violet-500" />
                    <span className="text-lg font-bold text-gray-800">{kidsOver5}</span>
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider">{t("mealPlanView.kids5to12") || "Kids 5-12"}</span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Cooking Time & Skill */}
                  {maxCookingTime > 0 && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-orange-50">
                      <Clock className="h-5 w-5 text-orange-500 shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500">{t("mealPlanView.maxCookingTime") || "Max Cooking Time"}</p>
                        <p className="font-semibold text-gray-800">{maxCookingTime} min</p>
                      </div>
                    </div>
                  )}
                  {cookingSkillLevel && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-indigo-50">
                      <ChefHat className="h-5 w-5 text-indigo-500 shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500">{t("mealPlanView.skillLevel") || "Skill Level"}</p>
                        <p className="font-semibold text-gray-800">{cookingSkillLevel}</p>
                      </div>
                    </div>
                  )}
                  {budgetRange && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-green-50">
                      <DollarSign className="h-5 w-5 text-green-500 shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500">{t("mealPlanView.budget") || "Budget"}</p>
                        <p className="font-semibold text-gray-800">{budgetRange}</p>
                      </div>
                    </div>
                  )}
                  {planLanguage && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-cyan-50">
                      <Globe className="h-5 w-5 text-cyan-500 shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500">{t("mealPlanView.language") || "Language"}</p>
                        <p className="font-semibold text-gray-800 capitalize">{planLanguage}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Tags Sections */}
                {cuisinePreferences.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Utensils className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-600">{t("mealPlanView.cuisines") || "Cuisines"}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {cuisinePreferences.map((c: string, i: number) => (
                        <Badge key={i} className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-0">{c}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {healthGoals.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-600">{t("mealPlanView.healthGoals") || "Health Goals"}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {healthGoals.map((g: string, i: number) => (
                        <Badge key={i} className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-0">{g}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {dietaryRestrictions.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-600">{t("mealPlanView.dietaryRestrictions") || "Dietary Restrictions"}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {dietaryRestrictions.map((d: string, i: number) => (
                        <Badge key={i} className="bg-red-100 text-red-700 hover:bg-red-200 border-0">{d}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {allergies.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-600">{t("mealPlanView.allergies") || "Allergies & Intolerances"}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {allergies.map((a: string, i: number) => (
                        <Badge key={i} className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-0">{a}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {dislikes && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <ThumbsDown className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-600">{t("mealPlanView.dislikes") || "Dislikes"}</span>
                    </div>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg italic">{dislikes}</p>
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </Card>
        </Collapsible>

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
            <Accordion
              type="multiple"
              defaultValue={days.length > 0 ? [days[0]] : []}
              className="space-y-4"
            >
              {days.map((day, dayIndex) => {
                const dayMeals = mealsByDay[day] || [];
                const { dayName, dateString } = getDayInfo(dayIndex);

                return (
                  <AccordionItem
                    key={day}
                    value={day}
                    className="border rounded-lg bg-card"
                  >
                    <AccordionTrigger className="px-6 py-4 hover:no-underline">
                      <div className="flex items-center gap-2 w-full">
                        <Calendar className="h-5 w-5 text-blue-500" />
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-3">
                            <span className="text-lg font-semibold">
                              {dayName}
                            </span>
                            <Badge variant="outline" className="text-sm">
                              {dateString}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground mr-4">
                            {dayMeals.length} {t("mealPlanView.meal") || "meal"}
                            {dayMeals.length !== 1 ? "s" : ""}{" "}
                            {t("mealPlanView.planned") || "planned"}
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6 pt-0">
                      {dayMeals.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {dayMeals.map((meal: any, mealIndex: number) => {
                            const isCompleted = isMealCompleted(meal.id, day);

                            return (
                              <Card
                                key={`${meal.id}-${mealIndex}`}
                                className={`relative hover:shadow-md transition-all cursor-pointer ${
                                  mealCompletionStatus[meal.id]
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
                                        {mealCompletionStatus[meal.id] && (
                                          <CheckCircle className="h-4 w-4 text-green-500" />
                                        )}
                                      </CardTitle>
                                      <div className="flex flex-wrap gap-1 mt-2">
                                        <Badge
                                          variant="secondary"
                                          className={`text-xs ${
                                            meal.type?.toLowerCase() ===
                                            "breakfast"
                                              ? "bg-orange-100 text-orange-800"
                                              : meal.type?.toLowerCase() ===
                                                  "lunch"
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
                                        {t("mealPlanView.calories") ||
                                          "calories"}
                                      </div>
                                    )}
                                  </div>

                                  {meal.description && (
                                    <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                                      {meal.description}
                                    </p>
                                  )}

                                  <div className="flex items-center justify-between mt-4">
                                    {mealCompletionStatus[meal.id] ||
                                    meal.consumed == true ? (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          console.log(
                                            "Clicking completed button for meal:",
                                            meal.id,
                                            "current consumed:",
                                            mealCompletionStatus[meal.id],
                                          );
                                          handleToggleCompletion(
                                            meal.id,
                                            day,
                                            false,
                                          );
                                        }}
                                        className="text-xs text-green-600 hover:text-green-700"
                                      >
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        {t("mealPlanView.completed") ||
                                          "Completed"}
                                      </Button>
                                    ) : (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          console.log(
                                            "Clicking mark as done button for meal:",
                                            meal.id,
                                            "current consumed:",
                                            mealCompletionStatus[meal.id],
                                          );
                                          handleToggleCompletion(
                                            meal.id,
                                            day,
                                            true,
                                          );
                                        }}
                                        className="text-xs text-gray-500 hover:text-gray-700"
                                      >
                                        <Circle className="h-3 w-3 mr-1" />
                                        {t("mealPlanView.markAsDone") ||
                                          "Mark as Done"}
                                      </Button>
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
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
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
                          onClick={() => handleAddToCart()}
                          className="flex items-center gap-2"
                        >
                          <ShoppingCart className="h-4 w-4" />
                          {t("mealPlanView.addToCart") || "Add to Cart"} (
                          {checkedCount})
                        </Button>
                      </div>
                    </CardContent>
                  )}
                </Card>

                {/* Shopping Items by Category with Accordions */}
                {(() => {
                  const categorizedItems = Object.entries(
                    shoppingList.reduce((acc: any, item: any) => {
                      const category =
                        item.classification || item.category || "Other";
                      if (!acc[category]) acc[category] = [];
                      acc[category].push(item);
                      return acc;
                    }, {}),
                  );
                  const firstCategory =
                    categorizedItems.length > 0 ? categorizedItems[0][0] : "";

                  return (
                    <Accordion
                      type="multiple"
                      defaultValue={[firstCategory]}
                      className="space-y-3"
                    >
                      {categorizedItems.map(
                        ([category, items]: [string, any]) => (
                          <AccordionItem
                            key={category}
                            value={category}
                            className="border border-emerald-200 rounded-xl overflow-hidden bg-white/95 backdrop-blur-sm shadow-sm"
                          >
                            <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-emerald-50/50 transition-colors">
                              <div className="flex items-center justify-between w-full pr-2">
                                <span className="text-lg font-semibold capitalize text-gray-800">
                                  {category}
                                </span>
                                <Badge
                                  variant="secondary"
                                  className="bg-emerald-100 text-emerald-800"
                                >
                                  {items.length}{" "}
                                  {t("mealPlanView.items") || "items"}
                                </Badge>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-4 pb-4">
                              <div className="space-y-3 pt-2">
                                {items.map((item: any, index: number) => {
                                  const itemId =
                                    item.id ||
                                    item.name ||
                                    `${category}-${index}`;
                                  return (
                                    <div
                                      key={itemId}
                                      className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                                        checkedItems.has(itemId)
                                          ? "bg-emerald-50 border-emerald-200"
                                          : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                                      }`}
                                    >
                                      <div className="flex items-center gap-3">
                                        <Checkbox
                                          id={`item-${itemId}`}
                                          checked={checkedItems.has(itemId)}
                                          onCheckedChange={() =>
                                            handleItemCheck(itemId)
                                          }
                                        />
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2">
                                            <p className="font-medium">
                                              {item.name}
                                            </p>
                                            {item.mealName && (
                                              <Badge
                                                variant="outline"
                                                className="text-xs"
                                              >
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
                                            onClick={() =>
                                              handleAddToPantry([item])
                                            }
                                            className="h-8 w-8 p-0"
                                            title={
                                              t(
                                                "mealPlanView.addToPantryOne",
                                              ) || "Add to Pantry"
                                            }
                                          >
                                            <Plus className="h-4 w-4" />
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                              handleAddToCart([item])
                                            }
                                            className="h-8 w-8 p-0"
                                            title={
                                              t("mealPlanView.addToCartOne") ||
                                              "Add to Cart"
                                            }
                                          >
                                            <ShoppingCart className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ),
                      )}
                    </Accordion>
                  );
                })()}
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
      </div>
    </div>
  );
};

export default MealPlanView;
