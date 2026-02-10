import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  Bell,
  Package,
  Calendar,
  AlertTriangle,
  Plus,
  Search,
  Trash2,
  ChevronDown,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import AddIngredientForm from "./AddIngredientForm";
import AIMealSuggestions from "./AIMealSuggestions";
import { useUser } from "@/contexts/UserContext";
import { getPantry } from "@/services/pantryService";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

const IngredientTracker = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const { ingredients, deleteIngredient, addIngredient, user, setPantryItems } =
    useUser();
  const { toast } = useToast();
    const { t } = useLanguage();


  // Helper function to map API category to UI category
  const mapApiCategoryToUI = (category: string): string => {
    const categoryMap: Record<string, string> = {
      dairy: "Dairy",
      protein: "Meat",
      vegetable: "Vegetables",
      fruit: "Fruits",
      grain: "Grains",
      herb: "Pantry",
      other: "Pantry",
    };

    return categoryMap[category.toLowerCase()] || "Pantry";
  };

  // Function to fetch pantry items from API
  const fetchPantryItems = async () => {
    if (!user?.id) {
      console.log("No user ID available for fetching pantry");
      return;
    }

    try {
      console.log("Fetching pantry items for user:", user.id);
      const response = await getPantry(user.id);
      console.log("Pantry API response:", response);

      if (
        response &&
        response.ingredients &&
        Array.isArray(response.ingredients)
      ) {
        // Transform API response to internal format using the actual API structure
        const transformedPantryItems = response.ingredients.map(
          (ingredient: any) => {
            // Calculate expiry date from current date + daysToExpire
            const purchaseDate = new Date(); // Use current date as purchase date since API doesn't provide it
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + ingredient.daysToExpire);

            return {
              id: ingredient.id, // Use the ID from API
              name: ingredient.name,
              quantity: ingredient.quantity,
              unit: ingredient.unit,
              category: ingredient.category, // Map API category to UI category
              expiryDate: expiryDate,
              purchaseDate: purchaseDate,
              notes: `Carbon footprint: ${ingredient.carbonFootPrintToWaste}kg CO2`,
              // Preserve original API fields for updates
              carbonFootPrintToWaste: ingredient.carbonFootPrintToWaste,
              daysToExpire: ingredient.daysToExpire,
              purchased: ingredient.purchased,
            };
          }
        );

        console.log("Transformed pantry items:", transformedPantryItems);

        // Update pantry items in context with original response
        setPantryItems(transformedPantryItems, response);

        toast({
          title: "Pantry Updated",
          description: `Successfully loaded ${transformedPantryItems.length} items from your pantry.`,
        });
      } else {
        console.log(
          "No ingredients found in response or invalid response structure"
        );
        setPantryItems([]);
        toast({
          title: "No Items Found",
          description:
            "Your pantry appears to be empty or no data was returned.",
        });
      }
    } catch (error) {
      console.error("Error fetching pantry items:", error);
      toast({
        title: "Error",
        description: "Failed to fetch pantry items. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Fetch pantry items on component mount
  useEffect(() => {
    console.log("IngredientTracker mounted, fetching pantry items...");
    fetchPantryItems();
  }, [user?.id]);

  // Log ingredients changes for debugging
  useEffect(() => {
    console.log("Ingredients updated in IngredientTracker:", ingredients);
  }, [ingredients]);

  const handleAddIngredient = (newIngredient: any) => {
    addIngredient(newIngredient);
    setShowAddForm(false);
  };

  const handleDeleteIngredient = (id: string) => {
    deleteIngredient(id);
  };

  const handleAddMealFromAI = (meal: any) => {
    // When a meal is added from AI suggestions, update pantry
    if (meal.ingredients) {
      // This would typically happen when the meal is actually prepared
      console.log("Adding AI suggested meal to plan:", meal);
    }
  };

  const getDaysUntilExpiry = (expiryDate: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time for accurate day calculation
    expiryDate.setHours(0, 0, 0, 0);
    const diffTime = expiryDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getExpiryStatus = (expiryDate: Date) => {
    const days = getDaysUntilExpiry(expiryDate);
    if (days < 0)
      return {
        status: "expired",
        color: "text-red-600",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
      };
    if (days <= 2)
      return {
        status: "urgent",
        color: "text-orange-600",
        bgColor: "bg-orange-50",
        borderColor: "border-orange-200",
      };
    if (days <= 7)
      return {
        status: "soon",
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-200",
      };
    return {
      status: "fresh",
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    };
  };

  const formatExpiryDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year:
        date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
    });
  };

  const filteredIngredients = ingredients.filter(
    (ingredient) =>
      ingredient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ingredient.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const expiringIngredients = ingredients.filter(
    (ingredient) => getDaysUntilExpiry(ingredient.expiryDate) <= 7
  );

  const categorizedIngredients = filteredIngredients.reduce(
    (acc, ingredient) => {
      if (!acc[ingredient.category]) {
        acc[ingredient.category] = [];
      }
      acc[ingredient.category].push(ingredient);
      return acc;
    },
    {} as Record<string, any[]>
  );

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      Meat: "🥩",
      Dairy: "🥛",
      Fruits: "🍎",
      Vegetables: "🥕",
      Grains: "🌾",
      Pantry: "🥫",
    };
    return icons[category] || "📦";
  };

  return (
    <div className="min-h-screen relative">
      {/* Beautiful Pantry Background */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?q=80&w=2070&auto=format&fit=crop')`
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/85 via-emerald-800/75 to-teal-900/85" />
      </div>

      <div className="relative z-10 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between bg-black/30 backdrop-blur-sm rounded-xl p-4 sm:p-6">
          <div>
            <h2 className="text-2xl font-bold text-white drop-shadow-lg">{t('ingredientTracker.title') || 'Pantry Tracker'}</h2>
            <p className="text-emerald-100/90">
              {t('ingredientTracker.description') || 'Keep track of your ingredients and their expiration dates'}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg shadow-emerald-500/30">
                  <Plus className="h-4 w-4 mr-2" />
                  {t('ingredientTracker.addIngredient') || 'Add Ingredient'}              
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <AddIngredientForm
                  onClose={() => setShowAddForm(false)}
                  onAdd={handleAddIngredient}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* AI Suggestions */}
        <AIMealSuggestions
          ingredients={ingredients}
          onAddMeal={handleAddMealFromAI}
        />

        {/* Quick Stats */}
        <div className="flex md:grid md:grid-cols-4 gap-3 md:gap-6 overflow-x-auto pb-2 md:pb-0 snap-x snap-mandatory">
          {[
            { label: t('ingredientTracker.totalItems') || 'Total Items', value: ingredients.length, gradient: 'from-emerald-500 to-teal-500', textColor: 'text-emerald-700', icon: <Package className="h-5 w-5 md:h-6 md:w-6 text-white" /> },
            { label: t('ingredientTracker.expiringSoon') || 'Expiring Soon', value: expiringIngredients.length, gradient: 'from-orange-500 to-red-500', textColor: 'text-orange-700', icon: <AlertTriangle className="h-5 w-5 md:h-6 md:w-6 text-white" /> },
            { label: t('ingredientTracker.categories') || 'Categories', value: Object.keys(categorizedIngredients).length, gradient: 'from-teal-500 to-cyan-500', textColor: 'text-teal-700', icon: <Calendar className="h-5 w-5 md:h-6 md:w-6 text-white" /> },
            { label: t('ingredientTracker.lowStock') || 'Low Stock', value: ingredients.filter((i) => i.quantity <= 1).length, gradient: 'from-red-500 to-pink-500', textColor: 'text-red-700', icon: <Bell className="h-5 w-5 md:h-6 md:w-6 text-white" /> },
          ].map((stat, i) => (
            <Card key={i} className="bg-white/95 backdrop-blur-sm border-0 shadow-xl min-w-[120px] md:min-w-0 snap-start flex-shrink-0 overflow-hidden">
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient}`} />
              <CardContent className="p-3 md:p-6">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs md:text-sm text-gray-600 whitespace-nowrap">{stat.label}</p>
                    <p className={`text-xl md:text-2xl font-bold ${stat.textColor}`}>{stat.value}</p>
                  </div>
                  <div className={`p-2 md:p-3 rounded-lg bg-gradient-to-br ${stat.gradient}`}>
                    {stat.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Expiring Soon Alert - Accordion */}
          <Card className="bg-gradient-to-br from-orange-50/95 to-red-50/95 backdrop-blur-sm border-0 shadow-xl overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-red-500" />
            <Accordion type="single" collapsible>
              <AccordionItem value="expiring" className="border-0">
                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-orange-700" />
                    <span className="font-semibold text-orange-700">{t('ingredientTracker.expiringSoon') || 'Expiring Soon'}</span>
                    <span className="text-xs font-bold bg-orange-500 text-white rounded-full px-2 py-0.5 min-w-[22px]">
                      {expiringIngredients.length}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4">
                  <p className="text-sm text-orange-600 mb-3">
                    {t('ingredientTracker.useFirst') || 'Use these ingredients first to avoid waste'}
                  </p>
                  <div className="space-y-3">
                    {expiringIngredients.slice(0, 5).map((ingredient) => {
                      const expiryInfo = getExpiryStatus(ingredient.expiryDate);
                      const daysLeft = getDaysUntilExpiry(ingredient.expiryDate);

                      return (
                        <div
                          key={ingredient.id}
                          className={`p-3 rounded-lg border ${expiryInfo.bgColor} ${expiryInfo.borderColor}`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-gray-800">
                                {ingredient.name}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {ingredient.quantity} {ingredient.unit}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className={`text-sm font-medium ${expiryInfo.color}`}>
                                {daysLeft < 0
                                  ? "Expired"
                                  : daysLeft === 0
                                  ? "Today"
                                  : `${daysLeft} day${daysLeft > 1 ? "s" : ""}`}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatExpiryDate(ingredient.expiryDate)}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {expiringIngredients.length === 0 && (
                      <div className="text-center py-6 text-gray-500">
                        <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">{t('ingredientTracker.allFresh') || 'All ingredients are fresh!'}</p>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Card>

          {/* Ingredients by Category */}
          <Card className="lg:col-span-2 bg-white/95 backdrop-blur-sm border-0 shadow-xl overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500">
                  <Package className="h-5 w-5 text-white" />
                </div>
                <span className="text-gray-800">{t('ingredientTracker.yourPantry') || 'Your Pantry'}</span>
              </CardTitle>
              <CardDescription className="text-gray-600">
                {t('ingredientTracker.organizedByCategory') || 'All your ingredients organized by category'}            
              </CardDescription>
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder={t('ingredientTracker.searchPlaceholder') || 'Search ingredients...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-emerald-200 focus:border-emerald-400"
                />
              </div>
            </CardHeader>
            <CardContent>
              {Object.keys(categorizedIngredients).length > 0 ? (
                <Accordion type="multiple" defaultValue={Object.keys(categorizedIngredients)} className="space-y-3">
                  {Object.entries(categorizedIngredients).map(
                    ([category, categoryIngredients]) => (
                      <AccordionItem 
                        key={category} 
                        value={category}
                        className="border border-emerald-200 rounded-xl overflow-hidden bg-gradient-to-r from-emerald-50/50 to-teal-50/50"
                      >
                        <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-emerald-50/50 transition-colors">
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">
                              {getCategoryIcon(category)}
                            </span>
                            <span className="font-semibold text-gray-800">{category}</span>
                            <span className="text-sm text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full font-medium">
                              {categoryIngredients.length} {categoryIngredients.length === 1 ? 'item' : 'items'}
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-4">
                          <div className="grid md:grid-cols-2 gap-3 pt-2">
                            {categoryIngredients.map((ingredient) => {
                              const expiryInfo = getExpiryStatus(
                                ingredient.expiryDate
                              );
                              const daysLeft = getDaysUntilExpiry(
                                ingredient.expiryDate
                              );

                              return (
                                <div
                                  key={ingredient.id}
                                  className={`p-3 rounded-lg border ${expiryInfo.bgColor} ${expiryInfo.borderColor} group hover:shadow-md transition-all duration-200`}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                      <h4 className="font-medium text-gray-800">
                                        {ingredient.name}
                                      </h4>
                                      <p className="text-sm text-gray-600">
                                        {ingredient.quantity} {ingredient.unit}
                                      </p>
                                      {ingredient.location && (
                                        <p className="text-xs text-gray-500">
                                          {ingredient.location}
                                        </p>
                                      )}
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <div className="text-right">
                                        <p
                                          className={`text-sm font-medium ${expiryInfo.color}`}
                                        >
                                          {daysLeft < 0
                                            ? "Expired"
                                            : daysLeft === 0
                                            ? "Today"
                                            : `${daysLeft}d`}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                          {formatExpiryDate(ingredient.expiryDate)}
                                        </p>
                                      </div>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() =>
                                          handleDeleteIngredient(ingredient.id)
                                        }
                                        className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 hover:bg-red-50"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    )
                  )}
                </Accordion>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Package className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">{t('ingredientTracker.noIngredientsFound') || 'No ingredients found'}</p>
                  <p className="text-sm">
                    {searchTerm
                      ? t('ingredientTracker.tryDifferentSearch') || 'Try a different search term'
                      : ingredients.length === 0
                      ? t('ingredientTracker.pantryEmpty') || 'Your pantry is empty. Try refreshing or add some ingredients.'
                      : t('ingredientTracker.startAdding') || 'Start by adding some ingredients to your pantry'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default IngredientTracker;
