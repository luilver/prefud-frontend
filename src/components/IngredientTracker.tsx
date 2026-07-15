import { useState, useEffect, useMemo } from "react";
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
  Leaf,
  X,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import AddIngredientForm from "./AddIngredientForm";
import AIMealSuggestions from "./AIMealSuggestions";
import { useUser } from "@/contexts/UserContext";
import { getPantry } from "@/services/pantryService";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useIsMobile } from "@/hooks/use-mobile";

type ActiveFilter = 'all' | 'expiring' | 'lowStock' | 'categories';

const IngredientTracker = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>('all');
  const { ingredients, deleteIngredient, addIngredient, user, setPantryItems } =
    useUser();
  const { toast } = useToast();
  const { t } = useLanguage();
  const isMobile = useIsMobile();

  const mapApiCategoryToUI = (category?: string): string => {
    if (!category || !category.trim()) return "Pantry";
    const categoryMap: Record<string, string> = {
      // Dairy
      dairy: "Dairy",
      lacteo: "Dairy",
      "lácteo": "Dairy",
      lacteos: "Dairy",
      "lácteos": "Dairy",
      laticinio: "Dairy",
      "laticínio": "Dairy",
      // Meat / Protein / Fish
      protein: "Meat",
      meat: "Meat",
      carne: "Meat",
      proteina: "Meat",
      "proteína": "Meat",
      pescado: "Fish",
      fish: "Fish",
      seafood: "Fish",
      marisco: "Fish",
      peixe: "Fish",
      // Vegetables
      vegetable: "Vegetables",
      vegetables: "Vegetables",
      verdura: "Vegetables",
      verduras: "Vegetables",
      vegetal: "Vegetables",
      "hortaliça": "Vegetables",
      // Fruits
      fruit: "Fruits",
      fruits: "Fruits",
      fruta: "Fruits",
      frutas: "Fruits",
      // Grains
      grain: "Grains",
      grains: "Grains",
      grano: "Grains",
      granos: "Grains",
      cereal: "Grains",
      cereais: "Grains",
      "grão": "Grains",
      // Legumes
      legume: "Legumes",
      legumbre: "Legumes",
      legumbres: "Legumes",
      leguminosa: "Legumes",
      // Herbs & Spices
      herb: "Herbs & Spices",
      spice: "Herbs & Spices",
      hierba: "Herbs & Spices",
      especia: "Herbs & Spices",
      especias: "Herbs & Spices",
      erva: "Herbs & Spices",
      condimento: "Herbs & Spices",
      // Oils & Fats
      oil: "Oils & Fats",
      fat: "Oils & Fats",
      aceite: "Oils & Fats",
      grasa: "Oils & Fats",
      "óleo": "Oils & Fats",
      gordura: "Oils & Fats",
      // Bakery
      bakery: "Bakery",
      bread: "Bakery",
      pan: "Bakery",
      "pão": "Bakery",
      panaderia: "Bakery",
      "panadería": "Bakery",
      // Beverages
      beverage: "Beverages",
      drink: "Beverages",
      bebida: "Beverages",
      bebidas: "Beverages",
      // Condiments / Sauces
      sauce: "Condiments",
      condiment: "Condiments",
      salsa: "Condiments",
      molho: "Condiments",
      // Pantry / Other fallbacks
      pantry: "Pantry",
      other: "Pantry",
      ingredient: "Pantry",
      ingrediente: "Pantry",
      otros: "Pantry",
      outro: "Pantry",
      outros: "Pantry",
    };
    const key = category.toLowerCase().trim();
    if (categoryMap[key]) return categoryMap[key];
    // Preserve unknown classifications as their own group (title-cased)
    return key.charAt(0).toUpperCase() + key.slice(1);
  };

  const fetchPantryItems = async () => {
    if (!user?.id) {
      console.log("No user ID available for fetching pantry");
      return;
    }
    try {
      console.log("Fetching pantry items for user:", user.id);
      const response = await getPantry(user.id);
      console.log("Pantry API response:", response);
      if (response && response.ingredients && Array.isArray(response.ingredients)) {
        const transformedPantryItems = response.ingredients.map((ingredient: any) => {
          const purchaseDate = new Date();
          const expiryDate = new Date();
          expiryDate.setDate(expiryDate.getDate() + ingredient.daysToExpire);
          return {
            id: ingredient.id,
            name: ingredient.name,
            quantity: ingredient.quantity,
            unit: ingredient.unit,
            category: mapApiCategoryToUI(ingredient.classification || ingredient.category),
            expiryDate: expiryDate,
            purchaseDate: purchaseDate,
            notes: `Carbon footprint: ${ingredient.carbonFootPrintToWaste}kg CO2`,
            carbonFootPrintToWaste: ingredient.carbonFootPrintToWaste,
            daysToExpire: ingredient.daysToExpire,
            purchased: ingredient.purchased,
          };
        });
        console.log("Transformed pantry items:", transformedPantryItems);
        setPantryItems(transformedPantryItems);
        toast({
          title: "Pantry Updated",
          description: `Successfully loaded ${transformedPantryItems.length} items from your pantry.`,
        });
      } else {
        console.log("No ingredients found in response or invalid response structure");
        setPantryItems([]);
        toast({
          title: "No Items Found",
          description: "Your pantry appears to be empty or no data was returned.",
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

  useEffect(() => {
    console.log("IngredientTracker mounted, fetching pantry items...");
    fetchPantryItems();
  }, [user?.id]);

  useEffect(() => {
    const handler = () => {
      console.log("pantry:ingredients-added event received, refreshing pantry");
      fetchPantryItems();
    };
    window.addEventListener("pantry:ingredients-added", handler);
    return () => window.removeEventListener("pantry:ingredients-added", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

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
    if (meal.ingredients) {
      console.log("Adding AI suggested meal to plan:", meal);
    }
  };

  const getDaysUntilExpiry = (expiryDate: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0);
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getExpiryStatus = (expiryDate: Date) => {
    const days = getDaysUntilExpiry(expiryDate);
    if (days < 0)
      return { status: "expired", color: "text-red-600", bgColor: "bg-red-50", borderColor: "border-red-200" };
    if (days <= 2)
      return { status: "urgent", color: "text-orange-600", bgColor: "bg-orange-50", borderColor: "border-orange-200" };
    if (days <= 7)
      return { status: "soon", color: "text-yellow-600", bgColor: "bg-yellow-50", borderColor: "border-yellow-200" };
    return { status: "fresh", color: "text-green-600", bgColor: "bg-green-50", borderColor: "border-green-200" };
  };

  const getRelativeExpiryText = (expiryDate: Date) => {
    const days = getDaysUntilExpiry(expiryDate);
    if (days < -1) return `Expired ${Math.abs(days)} days ago`;
    if (days === -1) return "Expired yesterday";
    if (days === 0) return "Expires today";
    if (days === 1) return "Expires tomorrow";
    return `Expires in ${days} days`;
  };

  const getExpiryProgress = (ingredient: any) => {
    const daysLeft = getDaysUntilExpiry(ingredient.expiryDate);
    const totalDays = ingredient.daysToExpire || 14;
    const pct = Math.max(0, Math.min(100, (daysLeft / totalDays) * 100));
    let barColor = "bg-primary";
    if (daysLeft <= 3) barColor = "bg-red-500";
    else if (daysLeft <= 7) barColor = "bg-amber-400";
    return { pct, barColor };
  };

  const expiringIngredients = ingredients.filter(
    (ingredient) => getDaysUntilExpiry(ingredient.expiryDate) <= 7
  );

  const co2Savings = useMemo(() => {
    return expiringIngredients.reduce((sum, ing) => sum + (ing.carbonFootPrintToWaste || 0), 0);
  }, [expiringIngredients]);

  const filteredIngredients = useMemo(() => {
    let list = ingredients;
    if (activeFilter === 'expiring') {
      list = list.filter((i) => getDaysUntilExpiry(i.expiryDate) <= 7);
    } else if (activeFilter === 'lowStock') {
      list = list.filter((i) => i.quantity <= 1);
    }
    if (searchTerm) {
      list = list.filter(
        (i) =>
          i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          i.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return list;
  }, [ingredients, activeFilter, searchTerm]);

  const categorizedIngredients = filteredIngredients.reduce(
    (acc, ingredient) => {
      if (!acc[ingredient.category]) acc[ingredient.category] = [];
      acc[ingredient.category].push(ingredient);
      return acc;
    },
    {} as Record<string, any[]>
  );

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      Meat: "🥩", Dairy: "🥛", Fruits: "🍎", Vegetables: "🥕", Grains: "🌾", Pantry: "🥫",
    };
    return icons[category] || "📦";
  };

  const handleStatClick = (filter: ActiveFilter) => {
    setActiveFilter(prev => prev === filter ? 'all' : filter);
  };

  const gridCols = expiringIngredients.length === 0
    ? "lg:grid-cols-1"
    : expiringIngredients.length < 3
    ? "lg:grid-cols-4"
    : "lg:grid-cols-3";

  const pantryColSpan = expiringIngredients.length === 0
    ? ""
    : expiringIngredients.length < 3
    ? "lg:col-span-3"
    : "lg:col-span-2";

  const IngredientCard = ({ ingredient }: { ingredient: any }) => {
    const expiryInfo = getExpiryStatus(ingredient.expiryDate);
    const { pct, barColor } = getExpiryProgress(ingredient);

    return (
      <div
        className={`p-3 rounded-lg border ${expiryInfo.bgColor} ${expiryInfo.borderColor} group hover:shadow-md transition-all duration-200`}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h4 className="font-bold text-gray-900">
              {ingredient.name}
            </h4>
            <p className="text-xs text-gray-400">
              {ingredient.quantity} {ingredient.unit}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-right">
              <p className={`text-xs font-semibold ${expiryInfo.color}`}>
                {getRelativeExpiryText(ingredient.expiryDate)}
              </p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleDeleteIngredient(ingredient.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="mt-2 h-1.5 w-full rounded-full bg-gray-200 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${barColor}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen relative">
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?q=80&w=2070&auto=format&fit=crop')`
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/85 via-primary/75 to-accent/85" />
      </div>

      <div className="relative z-10 space-y-6">
        {/* Header - Add Ingredient button removed on mobile */}
        <div className="flex items-center justify-between bg-primary/40 backdrop-blur-sm rounded-xl p-3 sm:p-6 border border-primary/20">
          <div className="flex items-center gap-3">
            <div className="p-1.5 sm:p-2 bg-gradient-to-r from-primary to-accent rounded-lg">
              <Package className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl font-bold text-white">{t('ingredientTracker.title') || 'Pantry Tracker'}</h1>
              <p className="text-xs sm:text-sm text-primary-foreground/80 mt-0.5">
                {t('ingredientTracker.description') || 'Keep track of your ingredients and their expiration dates'}
              </p>
            </div>
          </div>
          {!isMobile && (
            <div className="flex items-center space-x-2">
              <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-primary to-accent hover:from-primary hover:to-accent shadow-lg shadow-primary/30">
                    <Plus className="h-4 w-4 mr-2" />
                    {t('ingredientTracker.addIngredient') || 'Add Ingredient'}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90dvh] overflow-y-auto">
                  <AddIngredientForm
                    onClose={() => setShowAddForm(false)}
                    onAdd={handleAddIngredient}
                  />
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>

        {isMobile ? (
          /* ===== MOBILE: Tab Navigation ===== */
          <Tabs defaultValue="pantry" className="w-full">
            <TabsList className="w-full bg-black/30 backdrop-blur-sm border-0 p-1 rounded-xl">
              <TabsTrigger
                value="pantry"
                className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-white data-[state=active]:shadow-lg text-white/70 rounded-lg py-2.5 gap-2"
              >
                <Package className="h-4 w-4" />
                {t('ingredientTracker.pantryTab') || 'Pantry'}
                <span className="text-xs font-bold bg-white/20 data-[state=active]:bg-white/30 rounded-full px-2 py-0.5 min-w-[22px]">
                  {ingredients.length}
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="expiring"
                className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white data-[state=active]:shadow-lg text-white/70 rounded-lg py-2.5 gap-2"
              >
                <AlertTriangle className="h-4 w-4" />
                {t('ingredientTracker.expiringTab') || 'Expiring Soon'}
                {expiringIngredients.length > 0 && (
                  <span className="text-xs font-bold bg-orange-500/30 data-[state=active]:bg-white/30 rounded-full px-2 py-0.5 min-w-[22px]">
                    {expiringIngredients.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Pantry Tab */}
            <TabsContent value="pantry" className="mt-4 space-y-4">
              {/* Add Ingredient Button */}
              <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
                <DialogTrigger asChild>
                  <Button className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary hover:to-accent shadow-lg shadow-primary/30 py-3">
                    <Plus className="h-4 w-4 mr-2" />
                    {t('ingredientTracker.addIngredient') || 'Add Ingredient'}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90dvh] overflow-y-auto">
                  <AddIngredientForm
                    onClose={() => setShowAddForm(false)}
                    onAdd={handleAddIngredient}
                  />
                </DialogContent>
              </Dialog>

              {/* Search */}
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder={t('ingredientTracker.searchPlaceholder') || 'Search ingredients...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-primary/20 focus:border-primary/40 bg-white/95"
                />
              </div>

              {/* Ingredient List */}
              <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent" />
                <CardContent className="p-4">
                  {Object.keys(categorizedIngredients).length > 0 ? (
                    <Accordion type="multiple" defaultValue={[]} className="space-y-3">
                      {Object.entries(categorizedIngredients).map(
                        ([category, categoryIngredients]) => (
                          <AccordionItem
                            key={category}
                            value={category}
                            className="border border-primary/20 rounded-xl overflow-hidden bg-gradient-to-r from-primary/10/50 to-accent/10/50"
                          >
                            <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-primary/5/50 transition-colors">
                              <div className="flex items-center space-x-3">
                                <span className="text-2xl">{getCategoryIcon(category)}</span>
                                <span className="font-semibold text-gray-800">{category}</span>
                                <span className="text-sm text-primary bg-primary/10 px-2.5 py-0.5 rounded-full font-medium">
                                  {categoryIngredients.length}
                                </span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-4 pb-4">
                              <div className="space-y-3 pt-2">
                                {categoryIngredients.map((ingredient: any) => (
                                  <IngredientCard key={ingredient.id} ingredient={ingredient} />
                                ))}
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
            </TabsContent>

            {/* Expiring Soon Tab */}
            <TabsContent value="expiring" className="mt-4 space-y-4">
              <AIMealSuggestions
                ingredients={ingredients}
                onAddMeal={handleAddMealFromAI}
              />

              {expiringIngredients.length > 0 ? (
                <Card className="bg-gradient-to-br from-orange-50/95 to-red-50/95 backdrop-blur-sm border-0 shadow-xl overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-red-500" />
                  <CardHeader className="pb-2">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <AlertTriangle className="h-5 w-5 text-orange-700" />
                      <span className="font-semibold text-orange-700">{t('ingredientTracker.expiringSoon') || 'Expiring Soon'}</span>
                      <span className="text-xs font-bold bg-orange-500 text-white rounded-full px-2 py-0.5 min-w-[22px]">
                        {expiringIngredients.length}
                      </span>
                      {co2Savings > 0 && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="inline-flex items-center gap-1 text-xs font-medium bg-primary/10 text-primary rounded-full px-2.5 py-0.5">
                                <Leaf className="h-3 w-3" />
                                Save {co2Savings.toFixed(1)} kg CO₂
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Consume these items to prevent this carbon waste</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-orange-600 mb-3">
                      {t('ingredientTracker.useFirst') || 'Use these ingredients first to avoid waste'}
                    </p>
                    <Accordion type="multiple" defaultValue={[]} className="space-y-3">
                      {Object.entries(
                        expiringIngredients.reduce((acc: Record<string, any[]>, ing) => {
                          const cat = ing.category || 'Other';
                          if (!acc[cat]) acc[cat] = [];
                          acc[cat].push(ing);
                          return acc;
                        }, {})
                      ).map(([category, categoryIngredients]) => (
                        <AccordionItem
                          key={category}
                          value={category}
                          className="border border-orange-200 rounded-xl overflow-hidden bg-gradient-to-r from-orange-50/50 to-red-50/50"
                        >
                          <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-orange-50/50 transition-colors">
                            <div className="flex items-center space-x-3">
                              <span className="text-2xl">{getCategoryIcon(category)}</span>
                              <span className="font-semibold text-orange-800">{category}</span>
                              <span className="text-sm text-orange-700 bg-orange-100 px-2.5 py-0.5 rounded-full font-medium">
                                {categoryIngredients.length}
                              </span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-4 pb-4">
                            <div className="space-y-3 pt-2">
                              {categoryIngredients.map((ingredient: any) => (
                                <IngredientCard key={ingredient.id} ingredient={ingredient} />
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
                  <CardContent className="text-center py-12 text-gray-500">
                    <Leaf className="h-16 w-16 mx-auto mb-4 text-primary-foreground/80 opacity-50" />
                    <p className="text-lg font-medium text-primary">All fresh!</p>
                    <p className="text-sm">No items expiring soon</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        ) : (
          /* ===== DESKTOP: Original Layout ===== */
          <>
            <AIMealSuggestions
              ingredients={ingredients}
              onAddMeal={handleAddMealFromAI}
            />

            <div className="flex md:grid md:grid-cols-4 gap-3 md:gap-6 overflow-x-auto pb-2 md:pb-0 snap-x snap-mandatory">
              {[
                { key: 'all' as ActiveFilter, label: t('ingredientTracker.totalItems') || 'Total Items', value: ingredients.length, gradient: 'from-primary to-accent', textColor: 'text-primary', icon: <Package className="h-5 w-5 md:h-6 md:w-6 text-white" /> },
                { key: 'expiring' as ActiveFilter, label: t('ingredientTracker.expiringSoon') || 'Expiring Soon', value: expiringIngredients.length, gradient: 'from-orange-500 to-red-500', textColor: 'text-orange-700', icon: <AlertTriangle className="h-5 w-5 md:h-6 md:w-6 text-white" /> },
                { key: 'categories' as ActiveFilter, label: t('ingredientTracker.categories') || 'Categories', value: Object.keys(categorizedIngredients).length, gradient: 'from-accent to-cyan-500', textColor: 'text-primary', icon: <Calendar className="h-5 w-5 md:h-6 md:w-6 text-white" /> },
                { key: 'lowStock' as ActiveFilter, label: t('ingredientTracker.lowStock') || 'Low Stock', value: ingredients.filter((i) => i.quantity <= 1).length, gradient: 'from-red-500 to-pink-500', textColor: 'text-red-700', icon: <Bell className="h-5 w-5 md:h-6 md:w-6 text-white" /> },
              ].map((stat) => (
                <Card
                  key={stat.key}
                  onClick={() => handleStatClick(stat.key)}
                  className={`bg-white/95 backdrop-blur-sm border-0 shadow-xl min-w-[120px] md:min-w-0 snap-start flex-shrink-0 overflow-hidden cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
                    activeFilter === stat.key && stat.key !== 'all' && stat.key !== 'categories'
                      ? 'ring-2 ring-primary shadow-primary/20'
                      : ''
                  }`}
                >
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

            {activeFilter !== 'all' && activeFilter !== 'categories' && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-white/80">
                  Filtering: <span className="font-semibold text-white">{activeFilter === 'expiring' ? 'Expiring Soon' : 'Low Stock'}</span>
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setActiveFilter('all')}
                  className="h-6 px-2 text-white/70 hover:text-white hover:bg-white/10"
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear
                </Button>
              </div>
            )}

            <div className={`grid ${gridCols} gap-6`}>
              {expiringIngredients.length > 0 && (
                <Card className="bg-gradient-to-br from-orange-50/95 to-red-50/95 backdrop-blur-sm border-0 shadow-xl overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-red-500" />
                  <Accordion type="single" collapsible>
                    <AccordionItem value="expiring" className="border-0">
                      <AccordionTrigger className="px-6 py-4 hover:no-underline">
                        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                          <AlertTriangle className="h-5 w-5 text-orange-700" />
                          <span className="font-semibold text-orange-700">{t('ingredientTracker.expiringSoon') || 'Expiring Soon'}</span>
                          <span className="text-xs font-bold bg-orange-500 text-white rounded-full px-2 py-0.5 min-w-[22px]">
                            {expiringIngredients.length}
                          </span>
                          {co2Savings > 0 && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="inline-flex items-center gap-1 text-xs font-medium bg-primary/10 text-primary rounded-full px-2.5 py-0.5">
                                    <Leaf className="h-3 w-3" />
                                    Save {co2Savings.toFixed(1)} kg CO₂
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Consume these items to prevent this carbon waste</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-4">
                        <p className="text-sm text-orange-600 mb-3">
                          {t('ingredientTracker.useFirst') || 'Use these ingredients first to avoid waste'}
                        </p>
                        <div className="space-y-3">
                          {expiringIngredients.slice(0, 5).map((ingredient) => (
                            <IngredientCard key={ingredient.id} ingredient={ingredient} />
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </Card>
              )}

              <Card className={`${pantryColSpan} bg-white/95 backdrop-blur-sm border-0 shadow-xl overflow-hidden`}>
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent" />
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-accent">
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
                      className="pl-10 border-primary/20 focus:border-primary/40"
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
                            className="border border-primary/20 rounded-xl overflow-hidden bg-gradient-to-r from-primary/10/50 to-accent/10/50"
                          >
                            <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-primary/5/50 transition-colors">
                              <div className="flex items-center space-x-3">
                                <span className="text-2xl">{getCategoryIcon(category)}</span>
                                <span className="font-semibold text-gray-800">{category}</span>
                                <span className="text-sm text-primary bg-primary/10 px-2.5 py-0.5 rounded-full font-medium">
                                  {categoryIngredients.length} {categoryIngredients.length === 1 ? 'item' : 'items'}
                                </span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-4 pb-4">
                              <div className="grid md:grid-cols-2 gap-3 pt-2">
                                {categoryIngredients.map((ingredient: any) => (
                                  <IngredientCard key={ingredient.id} ingredient={ingredient} />
                                ))}
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
          </>
        )}
      </div>
    </div>
  );
};

export default IngredientTracker;
